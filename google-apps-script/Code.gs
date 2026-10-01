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
 * SETUP — see TEACHER_SETUP.md in the project for the full walkthrough.
 * Quick version:
 *   1. Create a new Google Sheet.
 *   2. Extensions > Apps Script.
 *   3. Delete the starter code and paste this whole file in.
 *   4. Change PIN below to something only you know.
 *   5. Change GEMINI_API_KEY below to your own free key from
 *      aistudio.google.com/apikey, so the app works by default without
 *      visitors needing their own key.
 *   6. Deploy > New deployment > type: Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   7. Click Deploy, then authorize the permissions it asks for.
 *   8. Copy the "Web app URL" and paste it into LOG_ENDPOINT in index.html.
 */

const PIN = 'change-me-1234'; // <-- set your own PIN before deploying
const GEMINI_API_KEY = 'paste-your-gemini-api-key-here'; // <-- from aistudio.google.com/apikey
const GEMINI_MODEL = 'gemini-flash-latest';
// Used only if GEMINI_MODEL stays overloaded after a retry. A lighter model
// usually has spare capacity when the main one is busy.
const GEMINI_FALLBACK_MODEL = 'gemini-flash-lite-latest';
const RETRYABLE_STATUS_CODES = [429, 500, 503]; // rate-limited, internal error, overloaded
const MAX_RETRY_WINDOW_MS = 20000; // don't START a new attempt after this; the app itself gives up at 45s
const SHEET_NAME = 'Log';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'generate') {
    return handleGenerate_(data);
  }

  return handleLog_(data);
}

function handleGenerate_(data) {
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: data.userContent || '' }] }],
    systemInstruction: { parts: [{ text: data.system || '' }] },
    // Gemini's hidden "thinking" tokens count against this limit too, so it
    // has to leave room for them on top of the JSON the app asks for.
    generationConfig: { maxOutputTokens: 4096 }
  });

  // Brief overloads often clear within a second or two, so try the main
  // model twice before switching to the fallback model (also twice).
  const attempts = [GEMINI_MODEL, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_FALLBACK_MODEL];
  const startedAt = Date.now();
  let response = null;

  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) {
      if (Date.now() - startedAt > MAX_RETRY_WINDOW_MS) break;
      Utilities.sleep(1000 * i);
    }
    response = fetchGemini_(attempts[i], body);
    const status = response ? response.getResponseCode() : 503;
    if (!RETRYABLE_STATUS_CODES.includes(status)) break;
  }

  // Pass Gemini's response straight through - same shape the client
  // already knows how to parse (candidates[...] on success, error{...}
  // on failure), so no client-side parsing changes needed. If we never got
  // any response at all (network-level failure), fake the same error shape
  // so the app shows its friendly "busy" message instead of a generic one.
  const text = response
    ? response.getContentText()
    : JSON.stringify({ error: { code: 503, status: 'UNAVAILABLE', message: 'Could not reach the AI service.' } });
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchGemini_(model, body) {
  try {
    return UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': GEMINI_API_KEY },
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
    scores[4] ?? ''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const pin = e.parameter.pin;
  if (!pin || pin !== PIN) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid PIN' }))
      .setMimeType(ContentService.MimeType.JSON);
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
      scores: [r[5], r[6], r[7], r[8], r[9]].filter(v => v !== '')
    }));

  return ContentService.createTextOutput(JSON.stringify({ entries }))
    .setMimeType(ContentService.MimeType.JSON);
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
    sheet.appendRow(['Timestamp', 'Student', 'Tool', 'Detail', 'Grade', 'Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5']);
  }
  // Force the text columns to plain text. Without this, Sheets' automatic
  // formatting silently reinterprets values like "6-8" or "9-10" as dates
  // (e.g. "September 10"), corrupting the grade level on every write.
  sheet.getRange('B:E').setNumberFormat('@');
  return sheet;
}
