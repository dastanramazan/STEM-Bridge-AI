# Teacher Setup: Free Default AI Access, Usage Tracking & Dashboard

The same one script does two jobs, both optional but recommended for a
class trial:

1. **Lets the app work with no setup for students** — a default AI
   connection (Google Gemini's free tier) so nobody needs their own API
   key. Your key is only ever stored inside this script, never sent to
   student browsers.
2. **Usage tracking** — keeps track of which students are using the app
   and how they're doing, without ever storing their actual writing or code.

Both are off until you complete this setup. It takes about 10 minutes,
one time, and needs no coding.

## What this does

- Students see the app work immediately — no API key required, no signup.
  A small "School or organization? Provide your own API key instead"
  checkbox lets anyone who prefers to use their own key do so.
- Each student types their name once (remembered on their device after that).
- Every time a student completes an analysis, the app records: their name,
  the date/time, which tool they used, and their scores — nothing else.
  The actual writing or code is never sent here.
- You get a private Google Sheet with every entry as a row.
- A **📊 Teacher Dashboard** button appears in the app, protected by a PIN
  you choose, showing total usage, unique students, and per-student stats.

## Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it anything you like (e.g. "STEM Bridge AI Usage").

## Step 2: Add the script

1. In your new Sheet, click **Extensions → Apps Script**.
2. Delete any starter code you see in the editor.
3. Open [`google-apps-script/Code.gs`](google-apps-script/Code.gs) from this
   project, copy its entire contents, and paste it into the Apps Script editor.
4. Near the top of the script, find this line:
   ```
   const PIN = 'change-me-1234';
   ```
   Change `'change-me-1234'` to a PIN only you know. This is the PIN you'll
   type into the Teacher Dashboard later — pick something students won't guess.
5. Just below it, find this line:
   ```
   const GEMINI_API_KEY = 'paste-your-gemini-api-key-here';
   ```
   Get a free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   (no credit card needed — sign in with any Google account, click
   "Create API Key") and paste it in between the quotes. This key stays
   inside the script — it's never sent to student browsers, and students
   never need one of their own to use the app.
6. Click the **Save** icon (or press Ctrl+S / Cmd+S).

## Step 3: Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. The first time, Google will ask you to authorize the script — click
   through the permission prompts (you may see an "unverified app"
   warning since this is your own personal script; click **Advanced →
   Go to (your project name)** to proceed).
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

## Step 4: Connect it to STEM Bridge AI

1. Open `index.html` in this project (on GitHub, click the file, then the
   pencil ✏️ "Edit" icon — no need to install anything).
2. Find this line (use Ctrl+F / Cmd+F to search for `LOG_ENDPOINT`):
   ```js
   const LOG_ENDPOINT = ''; // paste your Google Apps Script Web App URL here to enable tracking
   ```
3. Paste your Web App URL between the quotes:
   ```js
   const LOG_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
   ```
4. Save/commit the change. If you're using GitHub Pages, the live site
   updates automatically within a minute or two.

## Step 5: Try it out

1. Open the live app, enter a name, and run one analysis (writing or coding)
   — no API key needed, since it now uses your default Gemini connection.
2. Check your Google Sheet — a new row should appear in a tab called "Log".
3. In the app, click **📊 Teacher Dashboard**, enter the PIN you set in
   Step 2, and confirm you see your test entry.

## Good to know

- **No submitted writing or code is ever sent or stored** — only names,
  timestamps, tool used, and scores.
- **Your Gemini key never reaches a student's browser.** It lives only
  inside the Apps Script; the app talks to your script, and your script
  talks to Gemini. This is meaningfully safer than putting a key directly
  in the app's code, where anyone could view the page source and copy it.
- The Web App URL itself is still not secret (like a Google Form link —
  anyone with it could technically submit requests through it, using your
  free Gemini quota), but they can't extract your actual key from it to
  use anywhere else, and you can always add stricter checks in the script
  or just regenerate your key if you ever see unexpected usage. The
  **Dashboard's PIN check happens inside the script itself**, not in the
  page's visible code, so a student can't bypass it by viewing the page
  source.
- **Busy signals are handled for you.** Google's free Gemini tier is
  sometimes overloaded. When that happens, your script quietly retries,
  then switches to a lighter backup model, before ever showing a student
  an error. During a busy spell a response can take a few seconds longer.
  If the backup model is busy too, the student sees a plain "AI service
  is busy, try again" message.
- **Photo Check and student privacy.** Photo Check sends a photo of a
  student's page to Google's Gemini to be read. The app never stores or
  logs the photo (only the name and scores go to your Sheet), but the
  photo does pass through Google. As far as we know, Google's free Gemini
  tier may use submitted content to improve its products and the paid tier
  does not — check Google's current Gemini API terms yourself. **Before
  photographing real student work, switch your Gemini key to a paid
  billing plan** (aistudio.google.com/apikey → set up billing) and set a
  budget alert. Ask people to photograph only the page, with no faces, and
  to cover the student's name when possible, and check your school's
  student-privacy policy first.
- **Photo Check needs the updated script.** After updating the app, paste
  the latest `Code.gs` into Apps Script (keeping your PIN and key) and
  deploy a **New version**, otherwise photos are ignored by the old script.
- **Daily limits protect your free quota.** By default each student can
  run 10 analyses per day and the whole class 100 per day on the default
  connection (change `DAILY_LIMIT_PER_STUDENT` and `DAILY_LIMIT_TOTAL` at
  the top of the script). Only successful analyses count, and counters
  reset every midnight in the script's time zone. Students are identified
  by the name they typed, so the class-wide limit is the hard backstop.
  Anyone using their own API key is not limited.
- If `LOG_ENDPOINT` is left blank, both the default AI connection and
  usage tracking are disabled — students would need to provide their own
  API key via "Use Your Own API Key" to use the app at all.
- Unchecking "School or organization? Provide your own API key instead"
  (or never checking it) always uses your default Gemini connection —
  checking it switches to whatever provider/key the visitor enters.
- You can reset a student's remembered name from their device using the
  "Not you? Click here." link next to the name field (useful for shared
  devices).
