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

- Log only names, timestamps, tool, and scores. Never log student writing,
  code, test answers, or photos, and don't add raw-submission logging
  without an explicit, separate ask.
- Photos and answer keys stay in the browser (page memory / the teacher's
  `localStorage`); never persist photos or send keys to a server or Sheet.
- Test results log only a percent in the score column; points and the test
  name go in the text "Detail" column (the Dashboard averages score columns).

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
