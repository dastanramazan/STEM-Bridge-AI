/**
 * STEM Bridge AI — Usage Logger & Gemini Proxy
 *
 * Two jobs:
 * 1. Receives a small usage record every time a student completes an
 *    analysis in STEM Bridge AI, and appends it as a row in this
 *    spreadsheet. Also serves a PIN-protected read endpoint that the
 *    app's "Teacher Dashboard" uses to show usage statistics.
 *    No student writing or code is ever sent here for logging — only
 *    a name, timestamp, which tool was used, and scores.
 * 2. Proxies "generate" requests to the Gemini API using the API key
 *    stored below, so the app can offer a working default experience
 *    without every visitor needing their own key. The key never
 *    leaves this script - the browser only ever talks to this Web
 *    App, never to Gemini directly, for the default (no-own-key) flow.
 *    A visitor who chooses "Advanced: Use Your Own API Key" in the app
 *    bypasses this proxy entirely and calls Gemini/Anthropic directly
 *    with their own key, same as before.
 *
 * EASY SETUP — see TEACHER_SETUP.md ("Quick start"):
 *   1. Make your own copy of the STEM Bridge AI template Sheet (this script is
 *      already inside it), or paste this whole file into Extensions > Apps Script
 *      of a new Sheet.
 *   2. Reload the Sheet and open the new menu "STEM Bridge AI > Set up / check my
 *      setup". Type a teacher PIN and paste your free Gemini key from
 *      aistudio.google.com/apikey. They are saved privately, not in this code.
 *   3. Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 *   4. Copy the Web app URL into the website: Settings > For teachers: set up my school.
 *
 * (Older setups that edit the PIN and GEMINI_API_KEY constants below keep working.
 * Values saved with the setup form take priority over the constants.)
 */

const PIN = 'change-me-1234'; // optional: prefer the Sheet menu STEM Bridge AI > Set up
const GEMINI_API_KEY = 'paste-your-gemini-api-key-here'; // optional: prefer the Sheet menu STEM Bridge AI > Set up
const GEMINI_MODEL = 'gemini-flash-latest';
// Used only if GEMINI_MODEL stays overloaded after a retry. A lighter model
// usually has spare capacity when the main one is busy.
const GEMINI_FALLBACK_MODEL = 'gemini-flash-lite-latest';
// Last resort, tried only after the two above stayed busy. A model name Google
// no longer serves is skipped (the next one is tried), so a stale name here
// can never break answers.
const GEMINI_THIRD_MODEL = 'gemini-2.5-flash';
const RETRYABLE_STATUS_CODES = [429, 500, 503]; // rate-limited, internal error, overloaded
const MAX_RETRY_WINDOW_MS = 30000; // don't START a new attempt after this; the page itself gives up at 75s
// Daily limits on the default (shared-key) connection, counted per calendar
// day in the script's time zone. Only analyses that actually succeed use up
// the allowance. Students who bring their own API key never touch this.
const DAILY_LIMIT_PER_STUDENT = 10;
const DAILY_LIMIT_TOTAL = 100;
// Photo Check: how many page photos one request may carry, and how big each
// (base64 text) may be. The app already shrinks photos well below this.
const MAX_IMAGES = 4;
const MAX_IMAGE_BASE64_CHARS = 2000000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Photo requests can return long answers (a transcription, or a mark for every
// question of a test), and Gemini's hidden thinking tokens count against this too.
const MAX_OUTPUT_TOKENS_WITH_PHOTOS = 8192;
// Wrong-PIN guard: after this many wrong guesses the PIN is refused for a while,
// even if the right one is typed, so it can't be brute-forced.
const MAX_PIN_FAILURES = 10;
const PIN_LOCK_SECONDS = 900;
const SHEET_NAME = 'Log';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'generate') {
    return handleGenerate_(data);
  }

  if (data.action === 'feedback') {
    return handleFeedback_(data);
  }

  // Teacher accounts: classes and assignments (every request is checked against a Google sign-in).
  if (typeof data.action === 'string' && data.action.indexOf('t_') === 0) {
    return handleTeacher_(data);
  }

  return handleLog_(data);
}

function handleGenerate_(data) {
  // Check the photos before counting this analysis, so a bad request never
  // uses up a student's daily allowance. Photos are only passed along to
  // Gemini - they are never stored or logged anywhere.
  const imageParts = buildImageParts_(data.images);
  if (typeof imageParts === 'string') {
    return jsonOutput_({ error: { code: 400, status: 'INVALID_ARGUMENT', message: imageParts } });
  }

  if (!getGeminiKey_()) {
    return jsonOutput_({ error: { code: 400, status: 'NOT_CONFIGURED', message: "This school's AI key isn't set up yet. Please ask your administrator to finish the setup (Google Sheet menu: STEM Bridge AI > Set up)." } });
  }

  const limitError = reserveAnalysis_(data.name);
  if (limitError) {
    return jsonOutput_({ error: { code: 429, status: 'DAILY_LIMIT', message: limitError } });
  }

  const body = JSON.stringify({
    // Photos go before the text, which is where Gemini expects them.
    contents: [{ role: 'user', parts: imageParts.concat([{ text: data.userContent || '' }]) }],
    systemInstruction: { parts: [{ text: data.system || '' }] },
    // Gemini's hidden "thinking" tokens count against this limit too, so it
    // has to leave room for them on top of the JSON the app asks for.
    generationConfig: { maxOutputTokens: imageParts.length ? MAX_OUTPUT_TOKENS_WITH_PHOTOS : 4096 }
  });

  // Brief overloads often clear within a second or two, so try the main
  // model twice before switching to the fallback model (also twice).
  const attempts = [GEMINI_MODEL, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_THIRD_MODEL, GEMINI_THIRD_MODEL];
  const startedAt = Date.now();
  let response = null;
  const trace = []; // timing only, for finding out why an answer was slow (no student content)

  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) {
      if (Date.now() - startedAt > MAX_RETRY_WINDOW_MS) break;
      Utilities.sleep(1000 * i);
    }
    const attemptStartedAt = Date.now();
    response = fetchGemini_(attempts[i], body);
    const status = response ? response.getResponseCode() : 503;
    trace.push({ model: attempts[i], status: status, ms: Date.now() - attemptStartedAt });
    if (status === 404) continue; // that model name is not served; try the next one
    if (!RETRYABLE_STATUS_CODES.includes(status)) break;
  }
  // Shown in the Apps Script "Executions" log. Only sizes and times, never what the student wrote.
  console.log(JSON.stringify({ generate: { totalMs: Date.now() - startedAt, attempts: trace,
    promptChars: String(data.userContent || '').length, systemChars: String(data.system || '').length, images: imageParts.length } }));

  // Pass Gemini's response straight through - same shape the client
  // already knows how to parse (candidates[...] on success, error{...}
  // on failure), so no client-side parsing changes needed. If we never got
  // any response at all (network-level failure), fake the same error shape
  // so the app shows its friendly "busy" message instead of a generic one.
  const text = response
    ? response.getContentText()
    : JSON.stringify({ error: { code: 503, status: 'UNAVAILABLE', message: 'Could not reach the AI service.' } });
  if (!response || response.getResponseCode() !== 200) {
    releaseAnalysis_(data.name); // a failed attempt shouldn't use up the student's allowance
  }
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns an array of Gemini image parts (empty when there are no photos),
// or a string describing what is wrong with them.
function buildImageParts_(images) {
  if (images === undefined || images === null) return [];
  if (!Array.isArray(images)) return 'The photos were not sent in the expected format.';
  if (images.length > MAX_IMAGES) return `Please send at most ${MAX_IMAGES} photos at a time.`;
  const parts = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img || typeof img.data !== 'string' || ALLOWED_IMAGE_TYPES.indexOf(img.mime) === -1) {
      return 'One of the photos was not a supported image (use JPEG, PNG or WebP).';
    }
    if (img.data.length > MAX_IMAGE_BASE64_CHARS) {
      return 'One of the photos is too large. Please retake it or use a smaller photo.';
    }
    parts.push({ inlineData: { mimeType: img.mime, data: img.data } });
  }
  return parts;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Checks the daily limits and, if there is room, counts this analysis
// straight away. Returns an error message when a limit is hit, else null.
function reserveAnalysis_(name) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const keys = limitKeys_(name);
    pruneOldCounters_(props, keys.day);
    const total = Number(props.getProperty(keys.total) || 0);
    const mine = Number(props.getProperty(keys.student) || 0);
    if (mine >= DAILY_LIMIT_PER_STUDENT) {
      return `You've used all ${DAILY_LIMIT_PER_STUDENT} analyses for today. Come back tomorrow!`;
    }
    if (total >= DAILY_LIMIT_TOTAL) {
      return 'The class has reached today\'s limit for the free AI connection. Please try again tomorrow.';
    }
    props.setProperty(keys.student, String(mine + 1));
    props.setProperty(keys.total, String(total + 1));
    return null;
  } finally {
    lock.releaseLock();
  }
}

function releaseAnalysis_(name) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const keys = limitKeys_(name);
    [keys.student, keys.total].forEach(k => {
      const n = Number(props.getProperty(k) || 0);
      if (n > 0) props.setProperty(k, String(n - 1));
    });
  } finally {
    lock.releaseLock();
  }
}

function limitKeys_(name) {
  const day = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const who = String(name || '(unknown)').trim().toLowerCase().slice(0, 60) || '(unknown)';
  return { day: day, total: `count|${day}|*total*`, student: `count|${day}|${who}` };
}

// Drops counters from earlier days so the script's property store stays small.
function pruneOldCounters_(props, today) {
  const all = props.getProperties();
  Object.keys(all).forEach(k => {
    if (k.indexOf('count|') === 0 && k.indexOf(`count|${today}|`) !== 0) props.deleteProperty(k);
  });
}

function fetchGemini_(model, body) {
  try {
    return UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': getGeminiKey_() },
      payload: body,
      muteHttpExceptions: true // return Gemini's real error body instead of throwing
    });
  } catch (err) {
    return null; // network-level failure; treated as retryable by the caller
  }
}

function handleLog_(data) {
  const sheet = getLogSheet_();
  const scores = Array.isArray(data.scores) ? data.scores : [];

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.tool || '',
    data.detail || '',
    data.grade || '',
    scores[0] ?? '',
    scores[1] ?? '',
    scores[2] ?? '',
    scores[3] ?? '',
    scores[4] ?? '',
    cleanDeviceCode_(data.device)
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// The short random code a browser makes for itself. Anything else is cut down to
// letters and digits so a made-up value can't put odd content into the Sheet.
function cleanDeviceCode_(value) {
  return String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
}

function doGet(e) {
  // Public "business card": lets the website confirm this is a STEM Bridge AI school
  // script and see its version. Contains no secrets and needs no PIN.
  if (e.parameter.action === 'info') {
    return jsonOutput_(schoolInfo_());
  }

  const pinResult = checkPin_(e.parameter.pin);
  if (pinResult === 'unset') {
    return jsonOutput_({ error: 'The teacher PIN has not been set up yet. In your Google Sheet, open the menu STEM Bridge AI > Set up.', code: 'not_set' });
  }
  if (pinResult === 'locked') {
    return jsonOutput_({ error: 'Too many wrong PIN attempts. Please wait 15 minutes and try again.', locked: true });
  }
  if (pinResult !== 'ok') {
    return jsonOutput_({ error: 'Invalid PIN' });
  }
  // The app's Teacher mode only needs to know the PIN is right.
  if (e.parameter.action === 'check') {
    return jsonOutput_({ ok: true });
  }

  const sheet = getLogSheet_();
  const rows = sheet.getDataRange().getValues();

  const entries = rows
    .filter(r => r[0] && r[0] !== 'Timestamp') // skip blank rows and the header row, wherever it is
    .map(r => ({
      timestamp: r[0],
      name: r[1],
      tool: r[2],
      detail: r[3],
      grade: r[4],
      scores: [r[5], r[6], r[7], r[8], r[9]].filter(v => v !== ''),
      device: String(r[10] || '')
    }));

  return ContentService.createTextOutput(JSON.stringify({ entries }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns 'ok', 'bad' or 'locked'. Failed guesses are counted for everyone
// together (a Web App can't see who is asking), so the right PIN is also
// refused while the lock is on.
function checkPin_(pin) {
  const cache = CacheService.getScriptCache();
  const failures = Number(cache.get('pin_failures') || 0);
  if (failures >= MAX_PIN_FAILURES) return 'locked';
  const expected = getPin_();
  if (!expected) return 'unset'; // never fall back to a public default PIN
  if (!pin) return 'bad'; // nothing was typed; don't count it as a guess
  if (pin === expected) {
    if (failures) cache.remove('pin_failures');
    return 'ok';
  }
  cache.put('pin_failures', String(failures + 1), PIN_LOCK_SECONDS);
  return 'bad';
}

function getLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // Re-add the header row if it's missing, e.g. after someone manually
  // clears rows in the sheet. doGet() identifies the header by its
  // literal "Timestamp" value rather than assuming it's always row 1,
  // so this only guards readability, not correctness.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Student', 'Tool', 'Detail', 'Grade', 'Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5', 'Device']);
  }
  // Force the text columns to plain text. Without this, Sheets' automatic
  // formatting silently reinterprets values like "6-8" or "9-10" as dates
  // (e.g. "September 10"), corrupting the grade level on every write.
  sheet.getRange('B:E').setNumberFormat('@');
  sheet.getRange('K:K').setNumberFormat('@'); // device codes like 2345 must stay text
  return sheet;
}

/* ═══════════════════════════════════════════════════════════════════
   TEACHER ACCOUNTS: classes and assignments
   Teachers sign in with Google in the app. The app sends Google's signed
   "ID token" with each request, and this script checks it with Google
   before doing anything. Classes and assignments are stored in tabs of
   THIS spreadsheet (the school's own), never anywhere else. Student work
   is not stored here, only the names, scores and tags the app logs.
   ═══════════════════════════════════════════════════════════════════ */

// The public "client ID" of the STEM Bridge AI project's Google sign-in. It is not a
// secret (it is also in the web page). Leave it empty to keep teacher sign-in switched off.
const GOOGLE_CLIENT_ID = '';
// Optional: let anyone with a verified Google account on these domains sign in as a teacher,
// for example ['myschool.org']. Leave it empty to allow only people you add by email.
const ALLOWED_TEACHER_DOMAINS = [];
const MAX_CLASSES_PER_TEACHER = 50;
const MAX_ASSIGNMENTS_PER_CLASS = 200;
const CLASS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const HELP_LEVELS = ['hints', 'hints_example', 'reveal_after_2'];
const ASSIGNMENT_TOOLS = ['writing', 'coding'];
const TEACHER_TABS = {
  Teachers: ['Email', 'Name', 'Role', 'Status', 'Added'],
  Classes: ['ClassId', 'Code', 'Name', 'Year', 'TeacherEmail', 'Created', 'Archived'],
  Assignments: ['AssignmentId', 'ClassId', 'Title', 'Instructions', 'RubricId', 'Tool', 'HelpLevel', 'Due', 'TeacherEmail', 'Created', 'Archived']
};

function teacherError_(code, message) {
  const err = new Error(message);
  err.teacherCode = code;
  return err;
}

function handleTeacher_(data) {
  try {
    if (!getClientId_()) throw teacherError_('not_configured', 'Teacher sign-in is not set up on this server yet.');
    const user = verifyGoogleToken_(data.idToken);
    const me = authorizeTeacher_(user);
    switch (data.action) {
      case 't_login':
        return jsonOutput_({ ok: true, me: me });
      case 't_overview':
        return jsonOutput_(Object.assign({ ok: true, me: me }, teacherOverview_(me)));
      case 't_class_create':
        return jsonOutput_({ ok: true, class: withScriptLock_(() => createClass_(me, data)) });
      case 't_class_archive':
        withScriptLock_(() => archiveClass_(me, data));
        return jsonOutput_({ ok: true });
      case 't_assignment_create':
        return jsonOutput_({ ok: true, assignment: withScriptLock_(() => createAssignment_(me, data)) });
      case 't_assignment_archive':
        withScriptLock_(() => archiveAssignment_(me, data));
        return jsonOutput_({ ok: true });
      case 't_teacher_add':
        return jsonOutput_({ ok: true, teacher: withScriptLock_(() => addTeacher_(me, data)) });
      case 't_teacher_remove':
        withScriptLock_(() => removeTeacher_(me, data));
        return jsonOutput_({ ok: true });
      default:
        throw teacherError_('bad_request', 'Unknown request.');
    }
  } catch (err) {
    if (err && err.teacherCode) return jsonOutput_({ error: err.message, code: err.teacherCode });
    return jsonOutput_({ error: 'Something went wrong on the server. Please try again.', code: 'server' });
  }
}

function withScriptLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ── checking Google's sign-in token ── */
function sha256Hex_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text)
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}

function verifyGoogleToken_(idToken) {
  const cache = CacheService.getScriptCache();
  const bad = Number(cache.get('tok_bad') || 0);
  if (typeof idToken !== 'string' || idToken.length < 20 || idToken.length > 4096 || idToken.split('.').length !== 3) {
    throw teacherError_('auth', 'Please sign in with Google again.');
  }
  const key = 'tok_' + sha256Hex_(idToken); // the token itself is never stored
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  if (bad >= 30) throw teacherError_('auth', 'Too many sign-in attempts. Please wait a few minutes and try again.');

  const fail = () => { cache.put('tok_bad', String(bad + 1), 600); return teacherError_('auth', 'Please sign in with Google again.'); };
  let info;
  try {
    const resp = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) throw fail();
    info = JSON.parse(resp.getContentText());
  } catch (e) {
    if (e && e.teacherCode) throw e;
    throw teacherError_('server', "Couldn't check your Google sign-in right now. Please try again.");
  }
  const now = Math.floor(Date.now() / 1000);
  const issuerOk = info.iss === 'accounts.google.com' || info.iss === 'https://accounts.google.com';
  if (info.aud !== getClientId_() || !issuerOk || String(info.email_verified) !== 'true' || !info.email || Number(info.exp) <= now + 30) {
    throw fail();
  }
  const user = { email: String(info.email).toLowerCase(), name: String(info.name || '').slice(0, 80), exp: Number(info.exp) };
  cache.put(key, JSON.stringify(user), Math.max(1, Math.min(600, user.exp - now)));
  return user;
}

/* ── tabs in the spreadsheet ── */
function getTab_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(TEACHER_TABS[name]);
    // Plain text everywhere, so nothing typed in can turn into a formula, a date or a number.
    sheet.getRange('A:Z').setNumberFormat('@');
  }
  return sheet;
}

function tabRows_(name) {
  const values = getTab_(name).getDataRange().getValues();
  const headers = values[0] || TEACHER_TABS[name];
  return values.slice(1).map((r, i) => {
    const o = { _row: i + 2 };
    headers.forEach((h, j) => { o[h] = String(r[j] === undefined || r[j] === null ? '' : r[j]); });
    return o;
  }).filter(o => o[headers[0]] !== '');
}

function appendRowObj_(name, obj) {
  getTab_(name).appendRow(TEACHER_TABS[name].map(h => obj[h] === undefined ? '' : String(obj[h])));
}

function setCell_(name, rowNumber, header, value) {
  getTab_(name).getRange(rowNumber, TEACHER_TABS[name].indexOf(header) + 1).setValue(String(value));
}

function cleanLine_(value, max) {
  return String(value === undefined || value === null ? '' : value).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanBlock_(value, max) {
  return String(value === undefined || value === null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

/* ── who may use the teacher area ── */
function authorizeTeacher_(user) {
  const owner = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  return withScriptLock_(() => {
    const row = tabRows_('Teachers').find(r => r.Email.toLowerCase() === user.email);
    const now = new Date().toISOString();
    if (user.email === owner) { // whoever deployed this script is always the administrator
      if (!row) appendRowObj_('Teachers', { Email: user.email, Name: user.name, Role: 'admin', Status: 'active', Added: now });
      else {
        if (row.Role !== 'admin') setCell_('Teachers', row._row, 'Role', 'admin');
        if (row.Status !== 'active') setCell_('Teachers', row._row, 'Status', 'active');
      }
      return { email: user.email, name: user.name, role: 'admin' };
    }
    if (row) {
      if (row.Status !== 'active') throw teacherError_('forbidden', "This Google account isn't allowed to use the teacher area. Ask your administrator.");
      if (user.name && user.name !== row.Name) setCell_('Teachers', row._row, 'Name', user.name);
      return { email: user.email, name: user.name || row.Name, role: row.Role === 'admin' ? 'admin' : 'teacher' };
    }
    const domain = user.email.split('@')[1] || '';
    if (getAllowedDomains_().indexOf(domain) !== -1) {
      appendRowObj_('Teachers', { Email: user.email, Name: user.name, Role: 'teacher', Status: 'active', Added: now });
      return { email: user.email, name: user.name, role: 'teacher' };
    }
    throw teacherError_('forbidden', "This Google account isn't on the school's teacher list. Ask your administrator to add it.");
  });
}

/* ── what a teacher sees ── */
function publicClass_(c) {
  return { id: c.ClassId, code: c.Code, name: c.Name, year: c.Year, created: c.Created };
}

function publicAssignment_(a) {
  return { id: a.AssignmentId, classId: a.ClassId, title: a.Title, instructions: a.Instructions, rubricId: a.RubricId,
    tool: a.Tool, helpLevel: a.HelpLevel, due: a.Due, created: a.Created };
}

function teacherOverview_(me) {
  const classes = tabRows_('Classes').filter(c => c.TeacherEmail.toLowerCase() === me.email && c.Archived !== 'yes');
  const ids = {};
  classes.forEach(c => { ids[c.ClassId] = true; });
  const out = {
    classes: classes.map(publicClass_),
    assignments: tabRows_('Assignments').filter(a => ids[a.ClassId] && a.Archived !== 'yes').map(publicAssignment_)
  };
  if (me.role === 'admin') {
    out.teachers = tabRows_('Teachers').map(t => ({ email: t.Email, name: t.Name, role: t.Role, status: t.Status }));
  }
  return out;
}

function ownedClass_(me, classId) {
  const c = tabRows_('Classes').find(r => r.ClassId === String(classId) && r.Archived !== 'yes');
  if (!c || c.TeacherEmail.toLowerCase() !== me.email) throw teacherError_('bad_request', "That class wasn't found.");
  return c;
}

function createClass_(me, data) {
  const name = cleanLine_(data.name, 80);
  if (!name) throw teacherError_('bad_request', 'Please give the class a name.');
  const all = tabRows_('Classes');
  if (all.filter(c => c.TeacherEmail.toLowerCase() === me.email && c.Archived !== 'yes').length >= MAX_CLASSES_PER_TEACHER) {
    throw teacherError_('bad_request', `You can have up to ${MAX_CLASSES_PER_TEACHER} classes. Archive one you no longer use.`);
  }
  const used = {};
  all.forEach(c => { used[c.Code] = true; });
  let code = '';
  for (let tries = 0; tries < 50 && (!code || used[code]); tries++) {
    code = '';
    for (let i = 0; i < 4; i++) code += CLASS_CODE_ALPHABET.charAt(Math.floor(Math.random() * CLASS_CODE_ALPHABET.length));
  }
  if (used[code]) throw teacherError_('server', "Couldn't make a class code. Please try again.");
  const row = { ClassId: Utilities.getUuid().slice(0, 8), Code: code, Name: name, Year: cleanLine_(data.year, 20),
    TeacherEmail: me.email, Created: new Date().toISOString(), Archived: '' };
  appendRowObj_('Classes', row);
  return publicClass_(row);
}

function archiveClass_(me, data) {
  const c = ownedClass_(me, data.classId);
  setCell_('Classes', c._row, 'Archived', 'yes');
}

function createAssignment_(me, data) {
  const cls = ownedClass_(me, data.classId);
  const title = cleanLine_(data.title, 100);
  if (!title) throw teacherError_('bad_request', 'Please give the assignment a title.');
  const tool = ASSIGNMENT_TOOLS.indexOf(data.tool) !== -1 ? data.tool : 'writing';
  const helpLevel = HELP_LEVELS.indexOf(data.helpLevel) !== -1 ? data.helpLevel : 'hints';
  const due = /^\d{4}-\d{2}-\d{2}$/.test(String(data.due || '')) ? String(data.due) : '';
  const rubricId = 'standard'; // the teacher's own rubrics arrive in a later step
  const count = tabRows_('Assignments').filter(a => a.ClassId === cls.ClassId && a.Archived !== 'yes').length;
  if (count >= MAX_ASSIGNMENTS_PER_CLASS) throw teacherError_('bad_request', `A class can have up to ${MAX_ASSIGNMENTS_PER_CLASS} assignments. Archive some old ones.`);
  const row = { AssignmentId: Utilities.getUuid().slice(0, 8), ClassId: cls.ClassId, Title: title,
    Instructions: cleanBlock_(data.instructions, 2000), RubricId: rubricId, Tool: tool, HelpLevel: helpLevel, Due: due,
    TeacherEmail: me.email, Created: new Date().toISOString(), Archived: '' };
  appendRowObj_('Assignments', row);
  return publicAssignment_(row);
}

function archiveAssignment_(me, data) {
  const a = tabRows_('Assignments').find(r => r.AssignmentId === String(data.assignmentId) && r.Archived !== 'yes');
  if (!a || a.TeacherEmail.toLowerCase() !== me.email) throw teacherError_('bad_request', "That assignment wasn't found.");
  setCell_('Assignments', a._row, 'Archived', 'yes');
}

function requireAdmin_(me) {
  if (me.role !== 'admin') throw teacherError_('forbidden', 'Only an administrator can do that.');
}

function addTeacher_(me, data) {
  requireAdmin_(me);
  const email = cleanLine_(data.email, 120).toLowerCase();
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) throw teacherError_('bad_request', 'Please enter a valid email address.');
  const name = cleanLine_(data.name, 80);
  const existing = tabRows_('Teachers').find(r => r.Email.toLowerCase() === email);
  if (existing) {
    if (existing.Status !== 'active') setCell_('Teachers', existing._row, 'Status', 'active');
    return { email: email, name: existing.Name, role: existing.Role, status: 'active' };
  }
  appendRowObj_('Teachers', { Email: email, Name: name, Role: 'teacher', Status: 'active', Added: new Date().toISOString() });
  return { email: email, name: name, role: 'teacher', status: 'active' };
}

function removeTeacher_(me, data) {
  requireAdmin_(me);
  const email = cleanLine_(data.email, 120).toLowerCase();
  if (email === me.email) throw teacherError_('bad_request', "You can't remove your own account.");
  const row = tabRows_('Teachers').find(r => r.Email.toLowerCase() === email);
  if (!row) throw teacherError_('bad_request', "That teacher wasn't found.");
  setCell_('Teachers', row._row, 'Status', 'removed');
}

/* ═══════════════════════════════════════════════════════════════════
   EASY SETUP: settings kept in the script's private storage
   Instead of editing code, an administrator opens the Google Sheet menu
   "STEM Bridge AI → Set up", types the PIN and pastes the AI key into a
   form, and they are saved in Script Properties. Values saved there win over
   the constants at the top of this file (which still work for older setups).
   Secrets are never sent back to the form or to the web page.
   ═══════════════════════════════════════════════════════════════════ */

// Shown to the web page so it can tell whether this script is up to date.
const SCRIPT_VERSION = '0.13.2';
const SETTINGS_PREFIX = 'setting_';
const PLACEHOLDER_PIN = 'change-me-1234';
const PLACEHOLDER_KEY = 'paste-your-gemini-api-key-here';

function getSetting_(name, fallback) {
  const value = PropertiesService.getScriptProperties().getProperty(SETTINGS_PREFIX + name);
  return value !== null && value !== undefined && value !== '' ? value : fallback;
}

// A PIN or key that is still the placeholder counts as "not set", so a forgotten
// setting can never leave a publicly known default PIN in charge.
function getPin_() {
  const pin = String(getSetting_('PIN', PIN) || '');
  return !pin || pin === PLACEHOLDER_PIN ? '' : pin;
}

function getGeminiKey_() {
  const key = String(getSetting_('GEMINI_API_KEY', GEMINI_API_KEY) || '');
  return !key || key === PLACEHOLDER_KEY ? '' : key;
}

function getClientId_() {
  return String(getSetting_('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID) || '');
}

function getAllowedDomains_() {
  const raw = getSetting_('ALLOWED_TEACHER_DOMAINS', '');
  const list = raw ? String(raw).split(/[\s,;]+/) : ALLOWED_TEACHER_DOMAINS;
  return list.map(d => String(d).trim().toLowerCase()).filter(Boolean);
}

function getSchoolName_() {
  return String(getSetting_('SCHOOL_NAME', '') || '').slice(0, 80);
}

function setSetting_(name, value) {
  PropertiesService.getScriptProperties().setProperty(SETTINGS_PREFIX + name, String(value));
}

// What the web page may learn without a PIN: that this is a STEM Bridge AI school
// script, which version, its public name, and which parts are set up. No secrets.
function schoolInfo_() {
  return {
    ok: true,
    app: 'stem-bridge-ai',
    version: SCRIPT_VERSION,
    school: getSchoolName_(),
    features: ['feedback'],
    setup: { pin: !!getPin_(), aiKey: !!getGeminiKey_(), teacherSignIn: !!getClientId_() }
  };
}

function webAppUrl_() {
  try {
    const url = ScriptApp.getService().getUrl() || '';
    return /\/exec$/.test(url) ? url : '';
  } catch (e) {
    return '';
  }
}

// A key that Google's AI service accepts returns its model list. Returns
// 'valid', 'invalid', or 'unknown' (couldn't reach Google).
function checkGeminiKey_(key) {
  try {
    const resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
      headers: { 'x-goog-api-key': key },
      muteHttpExceptions: true
    });
    const code = resp.getResponseCode();
    if (code === 200) return 'valid';
    if (code === 400 || code === 401 || code === 403) return 'invalid';
    return 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

// Called by the setup form in the Sheet (so these names must not end with "_").
function getSetupStatus() {
  return Object.assign(schoolInfo_(), {
    domains: getAllowedDomains_().join(', '),
    webAppUrl: webAppUrl_()
  });
}

function saveSetup(form) {
  form = form || {};
  const problems = [];
  const notes = [];

  const school = cleanLine_(form.school, 80);
  if (form.school !== undefined && form.school !== null && String(form.school).trim() !== '' ) setSetting_('SCHOOL_NAME', school);

  const pin = String(form.pin === undefined || form.pin === null ? '' : form.pin).trim();
  if (pin) {
    if (pin.length < 4 || pin.length > 40 || /\s/.test(pin) || pin === PLACEHOLDER_PIN) {
      problems.push('The PIN needs 4 to 40 characters with no spaces, and it can\'t be the example PIN.');
    } else {
      setSetting_('PIN', pin);
      notes.push('PIN saved.');
    }
  }

  const key = String(form.key === undefined || form.key === null ? '' : form.key).trim();
  if (key) {
    if (key.length < 20 || key.length > 200 || /\s/.test(key)) {
      problems.push("That doesn't look like an AI key. It is one long piece of text without spaces.");
    } else {
      const verdict = checkGeminiKey_(key);
      if (verdict === 'invalid') {
        problems.push('Google says this AI key is not valid. Please copy it again from aistudio.google.com/apikey.');
      } else {
        setSetting_('GEMINI_API_KEY', key);
        notes.push(verdict === 'valid' ? 'AI key saved and checked: it works.' : "AI key saved. (Couldn't check it with Google right now.)");
      }
    }
  }

  if (form.domains !== undefined && form.domains !== null) {
    const domains = String(form.domains).split(/[\s,;]+/).map(d => d.trim().toLowerCase()).filter(d => /^[a-z0-9.\-]+\.[a-z]{2,}$/.test(d));
    setSetting_('ALLOWED_TEACHER_DOMAINS', domains.join(','));
  }

  return Object.assign(getSetupStatus(), { problems: problems, notes: notes });
}

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('STEM Bridge AI')
      .addItem('Set up / check my setup', 'showSetupDialog')
      .addToUi();
  } catch (e) { /* not opened from a Sheet: no menu */ }
}

function showSetupDialog() {
  const html = HtmlService.createHtmlOutput(setupDialogHtml_()).setWidth(480).setHeight(680);
  SpreadsheetApp.getUi().showModalDialog(html, 'STEM Bridge AI: set up');
}

function setupDialogHtml_() {
  return '<!doctype html><html><head><base target="_top"><meta charset="utf-8"><style>'
    + 'body{font:14px/1.5 system-ui,Arial,sans-serif;margin:16px;color:#1b2540}h3{margin:16px 0 4px;font-size:15px}'
    + 'label{display:block;font-weight:700;margin:12px 0 3px}input{width:100%;box-sizing:border-box;padding:8px 10px;border:2px solid #c3d2ee;border-radius:8px;font:inherit}'
    + 'small{color:#46526e;display:block;margin-top:3px}button{margin-top:14px;padding:10px 18px;border:0;border-radius:10px;background:#0ea5e9;color:#fff;font:700 15px system-ui;cursor:pointer}'
    + '.ok{color:#15803d}.bad{color:#b91c1c}.box{background:#eef4ff;border-radius:10px;padding:10px 12px;margin:12px 0}ol{margin:6px 0 0 18px;padding:0}code{background:#fff;padding:1px 5px;border-radius:5px;word-break:break-all}'
    + '</style></head><body>'
    + '<div id="status" class="box">Checking…</div>'
    + '<label for="school">School name (shown to students when they connect)</label><input id="school" maxlength="80" placeholder="e.g. Harmony Science Academy">'
    + '<label for="pin">Teacher PIN</label><input id="pin" type="password" autocomplete="off" placeholder="Leave empty to keep the current PIN"><small>4 or more characters, no spaces. Only you should know it.</small>'
    + '<label for="key">AI key (Google Gemini)</label><input id="key" type="password" autocomplete="off" placeholder="Leave empty to keep the current key"><small>Free: get one at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a> (sign in, click Create API key).</small>'
    + '<label for="domains">School email domains (optional)</label><input id="domains" placeholder="myschool.org"><small>Anyone with a Google account on these domains may sign in as a teacher. Leave empty to add teachers one by one.</small>'
    + '<button id="save">Save</button><div id="result"></div>'
    + '<div id="next" class="box" style="display:none"><b>Last step: publish it</b><ol>'
    + '<li>Close this window. Click <b>Extensions → Apps Script</b>.</li>'
    + '<li>Click <b>Deploy → New deployment</b>, the gear icon, then <b>Web app</b>.</li>'
    + '<li>Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>, then <b>Deploy</b> and approve the permissions.</li>'
    + '<li>Copy the <b>Web app URL</b> and paste it on the STEM Bridge AI website: <b>Settings → For teachers: set up my school</b>.</li></ol></div>'
    + '<script>'
    + 'function line(ok,t){return "<div class=\\""+(ok?"ok":"bad")+"\\">"+(ok?"✓ ":"✗ ")+t+"</div>";}'
    + 'function esc(s){return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}'
    + 'function show(s){var h="<b>Your setup</b>"+line(s.setup.pin,s.setup.pin?"Teacher PIN is set":"Teacher PIN is not set yet")+line(s.setup.aiKey,s.setup.aiKey?"AI key is set":"AI key is not set yet")+line(s.setup.teacherSignIn,s.setup.teacherSignIn?"Teacher sign-in is available":"Teacher sign-in is off (optional)");'
    + 'h+=s.webAppUrl?"<div>Your school address:<br><code>"+esc(s.webAppUrl)+"</code></div>":"<div>Not published yet. See the last step below.</div>";document.getElementById("status").innerHTML=h;'
    + 'document.getElementById("school").placeholder=s.school||document.getElementById("school").placeholder;document.getElementById("domains").value=s.domains||"";'
    + 'if(s.setup.pin&&s.setup.aiKey)document.getElementById("next").style.display="block";}'
    + 'google.script.run.withSuccessHandler(show).getSetupStatus();'
    + 'document.getElementById("save").onclick=function(){var b=this;b.disabled=true;document.getElementById("result").innerHTML="Saving…";'
    + 'google.script.run.withSuccessHandler(function(s){b.disabled=false;var h="";(s.notes||[]).forEach(function(n){h+=line(true,esc(n));});(s.problems||[]).forEach(function(p){h+=line(false,esc(p));});document.getElementById("result").innerHTML=h;document.getElementById("pin").value="";document.getElementById("key").value="";show(s);})'
    + '.withFailureHandler(function(e){b.disabled=false;document.getElementById("result").innerHTML=line(false,esc(e.message||e));})'
    + '.saveSetup({school:document.getElementById("school").value,pin:document.getElementById("pin").value,key:document.getElementById("key").value,domains:document.getElementById("domains").value});};'
    + '</script></body></html>';
}

/* ═══════════════════════════════════════════════════════════════════
   FEEDBACK FORM: teachers and other adults rate the tool
   A short form on the web page (about five questions and an optional comment)
   sends its answers here. They go into the "Feedback" tab of this Sheet. No
   student names or student work are collected. Anonymous answers are allowed.
   ═══════════════════════════════════════════════════════════════════ */
const FEEDBACK_ROLES = ['teacher', 'leader', 'university', 'parent', 'other'];
const FEEDBACK_INTENT = ['yes', 'maybe', 'no'];
const FEEDBACK_HEADERS = ['Timestamp', 'Role', 'Useful', 'Easy', 'AIQuality', 'WouldUse', 'Comment', 'MayQuote', 'Contact', 'Device', 'PageVersion'];
const MAX_FEEDBACK_PER_DEVICE = 3;   // per 6 hours (the longest a script cache entry can last)
const MAX_FEEDBACK_PER_HOUR = 60;    // across everyone, so a flood can't fill the Sheet

function getFeedbackTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Feedback');
  if (!sheet) {
    sheet = ss.insertSheet('Feedback');
    sheet.appendRow(FEEDBACK_HEADERS);
    // Text columns stay plain text so nothing typed in can become a formula. The three rating
    // columns (C to E) stay numbers so the Sheet can average them.
    ['B:B', 'F:K'].forEach(range => sheet.getRange(range).setNumberFormat('@'));
  }
  return sheet;
}

function ratingValue_(v) {
  const n = parseInt(v, 10);
  return n >= 1 && n <= 5 ? n : '';
}

function handleFeedback_(data) {
  // A hidden "website" field that people never see: bots fill it in. Pretend it worked, store nothing.
  if (String(data.website === undefined || data.website === null ? '' : data.website).trim() !== '') {
    return jsonOutput_({ ok: true, feedback: true });
  }
  const entry = {
    role: FEEDBACK_ROLES.indexOf(data.role) !== -1 ? data.role : '',
    useful: ratingValue_(data.useful),
    easy: ratingValue_(data.easy),
    quality: ratingValue_(data.quality),
    wouldUse: FEEDBACK_INTENT.indexOf(data.wouldUse) !== -1 ? data.wouldUse : '',
    comment: cleanBlock_(data.comment, 1500),
    mayQuote: data.mayQuote === true || data.mayQuote === 'yes' ? 'yes' : 'no',
    contact: cleanLine_(data.contact, 120),
    device: cleanDeviceCode_(data.device),
    version: cleanLine_(data.page, 12)
  };
  if (!entry.role && entry.useful === '' && entry.easy === '' && entry.quality === '' && !entry.wouldUse && !entry.comment) {
    return jsonOutput_({ error: 'Please answer at least one question.', code: 'empty' });
  }

  const cache = CacheService.getScriptCache();
  const hourKey = 'fb_all_' + Math.floor(Date.now() / 3600000);
  const deviceKey = 'fb_dev_' + (entry.device || 'none');
  if (Number(cache.get(hourKey) || 0) >= MAX_FEEDBACK_PER_HOUR) {
    return jsonOutput_({ error: 'Lots of feedback is arriving right now. Please try again in a little while.', code: 'busy' });
  }
  if (Number(cache.get(deviceKey) || 0) >= MAX_FEEDBACK_PER_DEVICE) {
    return jsonOutput_({ error: 'You have already sent feedback a few times today. Thank you!', code: 'rate' });
  }

  withScriptLock_(() => {
    getFeedbackTab_().appendRow([new Date(), entry.role, entry.useful, entry.easy, entry.quality, entry.wouldUse,
      entry.comment, entry.mayQuote, entry.contact, entry.device, entry.version]);
  });
  cache.put(hourKey, String(Number(cache.get(hourKey) || 0) + 1), 3600);
  cache.put(deviceKey, String(Number(cache.get(deviceKey) || 0) + 1), 21600);
  return jsonOutput_({ ok: true, feedback: true });
}
