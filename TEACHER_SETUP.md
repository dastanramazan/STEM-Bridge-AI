# Teacher Setup: Usage Tracking & Dashboard

STEM Bridge AI can optionally keep track of which students are using it and
how they're doing — without ever storing their actual writing or code.
This is off by default. Turning it on takes about 10 minutes, one time,
and needs no coding.

## What this does

- Each student types their name once (remembered on their device after that).
- Every time a student completes an analysis, the app records: their name,
  the date/time, which tool they used, and their scores — nothing else.
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
5. Click the **Save** icon (or press Ctrl+S / Cmd+S).

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

1. Open the live app, enter a name, and run one analysis (writing or coding).
2. Check your Google Sheet — a new row should appear in a tab called "Log".
3. In the app, click **📊 Teacher Dashboard**, enter the PIN you set in
   Step 2, and confirm you see your test entry.

## Good to know

- **No submitted writing or code is ever sent or stored** — only names,
  timestamps, tool used, and scores.
- The Web App URL itself is not secret (like a Google Form link — anyone
  with it could technically submit a log entry), but the **Dashboard's PIN
  check happens inside the script itself**, not in the page's visible code,
  so a student can't bypass it by viewing the page source.
- If `LOG_ENDPOINT` is left blank, tracking is fully disabled and the
  Dashboard just tells you it isn't set up yet — the rest of the app works
  exactly as before.
- You can reset a student's remembered name from their device using the
  "Not you? Click here." link next to the name field (useful for shared
  devices).
