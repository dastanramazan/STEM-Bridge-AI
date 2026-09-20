/**
 * STEM Bridge AI — Usage Logger
 *
 * Receives a small usage record every time a student completes an
 * analysis in STEM Bridge AI, and appends it as a row in this
 * spreadsheet. Also serves a PIN-protected read endpoint that the
 * app's "Teacher Dashboard" uses to show usage statistics.
 *
 * No student writing or code is ever sent here — only a name,
 * timestamp, which tool was used, and scores.
 *
 * SETUP — see TEACHER_SETUP.md in the project for the full walkthrough.
 * Quick version:
 *   1. Create a new Google Sheet.
 *   2. Extensions > Apps Script.
 *   3. Delete the starter code and paste this whole file in.
 *   4. Change PIN below to something only you know.
 *   5. Deploy > New deployment > type: Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   6. Click Deploy, then authorize the permissions it asks for.
 *   7. Copy the "Web app URL" and paste it into LOG_ENDPOINT in index.html.
 */

const PIN = 'change-me-1234'; // <-- set your own PIN before deploying
const SHEET_NAME = 'Log';

function doPost(e) {
  const sheet = getLogSheet_();
  const data = JSON.parse(e.postData.contents);
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
