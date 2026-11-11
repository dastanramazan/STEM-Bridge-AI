# CLAUDE.md

Working notes for AI coding sessions on STEM Bridge AI. For what the
project is, see `README.md`; for version history, `CHANGELOG.md`; for
how student data is handled, `PRIVACY.md`.

## Architecture

- **Single file, no backend build.** `index.html` is the whole app (HTML,
  CSS, JS). No build step, bundler, npm, or framework: keep it that way.
- **Default AI access goes through the teacher's own Apps Script proxy**
  (`LOG_ENDPOINT`, script at `google-apps-script/Code.gs`), which holds the
  Gemini key and calls Gemini itself, passing the response through
  unchanged. With "Use our own AI key" in Settings the browser calls
  Anthropic or Gemini directly with the visitor's own key, kept only in
  `sessionStorage`.
- **Never put a real secret in `index.html`** or any committed file. The
  Dashboard PIN and the Gemini key live only in the deployed script; never
  ask for or guess them.
- Apps Script rejects CORS preflights, so POSTs to `LOG_ENDPOINT` use
  `Content-Type: text/plain;charset=utf-8` (the body is still JSON).
- The proxy retries busy responses, enforces daily per-student and total
  limits, validates photo uploads before counting a request, and checks the
  Teacher PIN. Teacher mode in the page is a convenience screen, not strong
  security.

## Privacy rules

- Log only names, timestamps, tool, scores, and the random device code (a
  pseudonymous hint, never an IP address or device details). Never log student writing,
  code, test answers, or photos, and don't add raw-submission logging
  without an explicit, separate ask.
- Photos, live-camera frames, and answer keys stay in the browser (page memory / the teacher's
  `localStorage`); never persist photos or send keys to a server or Sheet.
- Test results log only a percent in the score column; points and the test
  name go in the text "Detail" column (the Dashboard averages score columns).

## School connection and setup

- A school's PIN, AI key, name, and allowed domains are saved with the Sheet
  menu form into Script Properties (`setting_*` keys, read via `getSetting_`),
  which win over the constants in `Code.gs`. Never echo secrets back to the form
  or the page. A placeholder or empty PIN/key counts as not set: never accept the
  public example PIN.
- `doGet?action=info` is the one public, secret-free reply (version, school name,
  what is set up). Keep it that way.
- The page's `LOG_ENDPOINT` is a `let`: the shared demo by default, or a school's
  Web app address saved in `localStorage` after the user pasted it or confirmed a
  `?s=` link. Only addresses matching `SCRIPT_URL_RE` (script.google.com Web app
  `/exec`) are accepted, and a `?s=` link must be confirmed by the user before
  anything is saved or sent. Bump `SCRIPT_VERSION` in `Code.gs` and
  `EXPECTED_SCRIPT_VERSION` in the page together when `Code.gs` changes.

## Teacher accounts

- Teacher sign-in is Google Identity Services: the page gets an ID token, sends it
  with each `t_*` request, and `Code.gs` verifies it with Google's `tokeninfo`
  (audience = `GOOGLE_CLIENT_ID`, verified email, not expired) before anything
  else. Never trust an email sent by the page. Whoever deployed the script
  (`Session.getEffectiveUser()`) is the administrator; others are added in the
  Teachers tab or by an optional `ALLOWED_TEACHER_DOMAINS` list.
- Each school runs its own script and Sheet ("school instance"); the project
  holds no shared database of children's data. Teachers, Classes and
  Assignments live in tabs of that Sheet, formatted as plain text. Every write
  checks ownership, sanitizes text, and respects the limits. Never store
  student work there.
- Google's sign-in script (`accounts.google.com/gsi/client`) loads only when a
  teacher opens the Teacher area. Students must never trigger it.
- `GOOGLE_CLIENT_ID` is public (not a secret) and empty by default, which keeps
  the feature off.

## Feedback contract

- The tool gives feedback, not solutions. Prompts for student-facing feedback
  (`FEEDBACK_CONTRACT`) tell the AI never to rewrite the student's work or
  supply a finished answer, and to return `checkYourself` (one or two things
  to verify in a textbook, notes, or with the teacher). Every student result
  shows the "Check this yourself" box and the "AI can make mistakes" note.
- The Word file is built in the browser and never sent anywhere. The coding
  tool's corrected code goes into it only after the student has revealed it.

## Documentation rules

- Public docs must not contain statistics without a citation the owner has
  supplied, and must not state classroom-usage numbers, student counts, or
  learning outcomes without documentation. The project has not had a
  classroom pilot yet, and the docs say so.
- Word the "48 states" figure as teacher shortages; only say "CS teacher"
  if the owner confirms the cited source covers computer science.

## Workflow

- One feature = one branch (`claude/<short-topic>`) = one PR, squash-merged.
  Always branch from fresh `origin/main`, never from another feature branch.
  Open or merge a PR only when asked.
- Test changes in a headless browser (Playwright is installed; run with
  `NODE_PATH=/opt/node22/lib/node_modules node script.js`), not just a
  syntax check. Keep test scripts outside the repo.
- Don't set `display` on a class that is also toggled with the `hidden`
  attribute without a `:not([hidden])` guard; author CSS overrides the
  browser's default `[hidden]` rule.
- Check third-party API behavior against the real endpoint (a fake key is
  enough for error shapes) rather than trusting memory.
- The sandbox network is allowlisted: the Anthropic and Gemini APIs are
  reachable, `*.github.io` and `script.google.com` are not, so live-site and
  live-script checks, and real handwriting accuracy, must be done by the owner.
