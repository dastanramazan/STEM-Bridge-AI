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
  Under ⚙️ Settings, "Use our own AI key instead of the free shared one"
  lets anyone who prefers to use their own key do so.
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

## Optional: teacher sign-in (classes and assignments)

This lets teachers sign in with Google, create classes and assignments, and
(in later steps) use their own rubrics. Everything is stored in your own
Google Sheet. It stays switched off until you do the two parts below.

**Part A: once for the whole project (done by the project owner).** Create
the project's public Google sign-in "client ID". Google's menus change names
from time to time, so look for the closest match.
1. Go to [console.cloud.google.com](https://console.cloud.google.com), sign in,
   and create a project (for example "STEM Bridge AI").
2. Open **APIs & Services → OAuth consent screen** (it may be called "Google
   Auth Platform"). Choose **External**, give the app a name and your support
   email, keep the basic scopes (email, profile, openid), and **publish** the
   app so any Google account can sign in.
3. Open **Credentials → Create credentials → OAuth client ID**. Choose
   **Web application**. Under **Authorized JavaScript origins** add the
   address of the web page, for example `https://dastanramazan.github.io`
   (only the address, no path). Leave redirect addresses empty. Create it
   and copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
4. Put the Client ID in `index.html` (the `GOOGLE_CLIENT_ID` line) and
   publish. The Client ID is not a secret; it is also visible in the page.

**Part B: for each school or teacher's own script.**
1. In your Apps Script, set `GOOGLE_CLIENT_ID` (near the top of the teacher
   section) to the same Client ID.
2. Optional: to let everyone with a school Google account sign in as a
   teacher, set `ALLOWED_TEACHER_DOMAINS` to your school's domain, for
   example `['myschool.org']`. Otherwise only people you add by email can sign in.
3. Save, then **Deploy → Manage deployments → ✏️ → New version → Deploy**.
   Google may ask you to approve one more permission (to see your email
   address). That is expected.
4. Open the app, click **📊 Teacher → Open the teacher area**, and sign in
   with the Google account that owns the script. You become the
   **administrator**. Use the **Teachers** tab to add colleagues by email.
5. Create a class. You get a class code and a link to share with students.

A Google account that is not on your list is refused. Teachers see only
their own classes and assignments. The Sheet gains three tabs (Teachers,
Classes, Assignments); never put student work in them.

## Good to know

- **No submitted writing or code is ever stored** — only names,
  timestamps, tool used, and scores are logged. (Details of what goes
  where are in [PRIVACY.md](PRIVACY.md).)
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
- **Teacher mode and answer keys.** Photo Check's Teacher mode asks for
  the same PIN as your Dashboard. Answer keys you save are stored only in
  that browser on your device, never in the Sheet or on a server. The PIN
  screen keeps students from wandering into Teacher mode on a shared
  device; it isn't strong security, so don't leave a device with saved
  keys logged in. After 10 wrong PIN guesses the PIN stops working for 15
  minutes (for you too) to prevent guessing. Only a test's percent score
  is logged, with its name and points in the Detail column — never the
  answers.
- **Live camera and document cameras.** Photo Check's "Live camera"
  button shows a live view from any camera the computer can see. A USB
  document camera (the kind on a flexible arm that looks down at the desk)
  shows up as an ordinary webcam, so just plug it in, open Live camera, and
  allow the camera when the browser asks. If several cameras are connected
  there is a menu to pick one. The student presses **Capture** (or the
  space bar) for each page; the camera switches off when they press
  "Check the Work", leave the tool, or switch tabs. On school-managed
  Chromebooks an administrator can block cameras; if the browser says the
  camera is blocked, ask your tech helper to allow it for this site.
- **Telling people apart (device codes).** Anyone can type any name, so
  each logged result also carries a **device code**: a short random code
  (like `K7M2`) made by that browser. It appears in the Sheet's **Device**
  column (column K; type `Device` in K1 if you want a heading) and in the
  Teacher Dashboard next to each name. The dashboard flags a name used from
  several devices, a device used with several names, and, if you paste your
  class list under "Class list" in the dashboard, names that are not on it.
  It is a hint, not proof: a shared school computer has one code for all
  its users, and clearing the browser's data makes a new code. Students can
  see their own code in ⚙️ Settings. The class list is saved only in your
  browser. This needs the latest `Code.gs` (paste it in and deploy a New
  version); older rows simply show a dash.
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
  API key in ⚙️ Settings to use the app at all.
- Leaving "Use our own AI key instead of the free shared one" (in ⚙️ Settings)
  unchecked always uses your default Gemini connection —
  checking it switches to whatever provider/key the visitor enters.
- You can reset a student's remembered name from their device using the
  "Not you? Click here." link next to the name field (useful for shared
  devices).
