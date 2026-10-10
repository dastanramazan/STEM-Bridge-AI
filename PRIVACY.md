# Privacy: How STEM Bridge AI Handles Student Data

This page explains what the app does with student information, in plain
language, so teachers and schools can decide whether it fits their
situation. It describes how the software is built; it is **not** legal
advice and **not** a compliance certification (FERPA, COPPA, or any
state student-privacy law). Schools remain responsible for their own
review and for any parental consent they require.

The app has no accounts and no passwords. It collects as little as it can.

## What is collected and where it goes

| What | Where it goes | Kept? |
|---|---|---|
| **Student name** (typed once on the device) | Saved in that browser (`localStorage`) so it doesn't have to be retyped | Until the browser data is cleared, or someone presses "Not you? Click here" |
| **Usage record** after each completed analysis: date and time, name, tool, short detail (assignment type or language, or a test's name and points), grade band, and scores | The teacher's own Google Sheet, through the teacher's own Google Apps Script | Until the teacher deletes the rows. **Never** the writing, code, answers, or photos |
| **Typed writing or code** | Sent to an AI service to be analyzed (see "AI services" below) | Not stored by this app or logged in the Sheet |
| **Photos of paper work or answer keys** | Shrunk and re-encoded in the browser (which also removes location and other metadata), then sent to the AI service to be read | Held in the page's memory only while in use, discarded when cleared, saved, or the page is closed. Never stored by this app or logged |
| **Saved answer keys** (Teacher mode) | Saved only in the teacher's own browser (`localStorage`); never in the Sheet or on any server | Until the teacher deletes them or clears the browser |
| **Scores from the last attempt** (to show progress) | The same browser (`localStorage`), scores only | Until the browser data is cleared |
| **Daily-limit counters** | The teacher's Apps Script keeps a count per lowercase name per day | Old days are deleted automatically |
| **The visitor's own API key**, if they choose to use one | The browser's `sessionStorage`, for that tab only; sent only to that key's AI provider | Gone when the tab closes |

Small settings (like whether the intro banner was seen) are also saved in
the browser. They contain no student information.

## AI services

- **Default connection.** The browser sends the request to the teacher's own
  Google Apps Script, which forwards it to Google's Gemini API using a key
  that only the teacher's script holds. The script does not save what it
  forwards.
- **"Use our own AI key" (Settings).** The browser sends the request directly to
  Anthropic (Claude) or Google (Gemini) with the key the visitor entered.
- Whatever is sent is then governed by that provider's terms. As far as we
  know, Google's **free** Gemini tier may use submitted content to improve its
  products, while paid tiers do not; **check Google's current terms yourself.**
  For real student work, especially photos, use a paid Gemini key or an AI
  provider your school has approved.

## Other services the page contacts

- **GitHub Pages** hosts the page, so GitHub sees ordinary visit logs (such as IP addresses). The page uses only your device's own fonts, so no fonts are downloaded from anywhere else.
- There are no analytics, advertising, or tracking scripts.

## Who can see the usage Sheet

Only whoever the teacher shares it with. The in-app **Teacher Dashboard**
and **Teacher mode** are protected by a PIN that is checked inside the
teacher's script, and repeated wrong guesses lock the PIN for 15 minutes.
Teacher mode is a screen in the page, not strong security: don't leave a
device with saved answer keys unlocked.

## Recommendations for schools

- Get any consent your school or district requires before students use the tool, especially for students under 13.
- Ask students to photograph only the page: no faces, and cover the student's name if possible.
- Use a paid or district-approved AI provider for real student work.
- Delete usage rows from the Sheet when they are no longer needed.

## Deleting data

- **Usage records:** delete the rows in the teacher's Google Sheet.
- **A device's saved name, keys, and last scores:** clear the browser's site data for the app.
- **Anything an AI provider received:** follow that provider's own data-deletion process.

Questions: dastanramazan@gmail.com
