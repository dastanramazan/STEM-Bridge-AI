# CLAUDE.md — Project Memory

Persistent context for Claude Code sessions working on STEM Bridge AI.
For the project's purpose and features, see `README.md`. For version
history, see `CHANGELOG.md`. This file is about *how to work on this
repo* — conventions, gotchas, and state that isn't obvious from the
code alone.

## Architecture

- **Single file, zero backend.** `index.html` is the entire application
  — HTML, CSS, and JS in one file, no build step, no npm, no framework.
  This is intentional (see README's "Why single-file?") — don't
  introduce a build step, bundler, or framework.
- **Two AI providers**: Anthropic (default) and Google Gemini (free
  tier, no credit card). `callAPI()` dispatches to `callAnthropic()` or
  `callGemini()` based on `currentProvider`, set via the provider pills
  in the API key bar. Each provider has its own request/response shape
  and its own friendly-error mapping — see `ANTHROPIC_FRIENDLY_ERRORS`
  / `GEMINI_FRIENDLY_ERRORS`.
- **No API key is stored anywhere except the browser's own
  `sessionStorage`**, per-provider. Never add a backend/proxy for this
  without discussing it — the whole point is zero server-side attack
  surface.
- **Optional usage tracking**: `LOG_ENDPOINT` (empty by default) points
  to a Google Apps Script Web App that a teacher deploys themselves
  (see `TEACHER_SETUP.md`, script at `google-apps-script/Code.gs`). If
  blank, tracking is fully inert. Logging only fires *after* a
  successful analysis renders — a failed/errored attempt is never
  logged, by design.

## This deployment's live config

- GitHub Pages live URL: https://dastanramazan.github.io/STEM-Bridge-AI/
- `LOG_ENDPOINT` in `index.html` is connected to a real deployed Apps
  Script + Google Sheet ("STEM Bridge AI Usage Log", owned by
  dastanramazan@gmail.com). The Dashboard PIN is known only to the
  repo owner — don't try to guess or reset it.
- Verifying the Sheet's contents doesn't require the PIN: it's
  readable directly via Google Drive tools (`read_file_content` with
  the sheet's file ID) if that connector is available in-session. The
  PIN only gates the app's own Dashboard fetch endpoint.

## Workflow conventions established in this repo

- **One feature = one branch = one PR**, named `claude/<short-topic>`,
  squash-merged into `main`.
- **Always branch from fresh `origin/main`**, never from another
  feature branch — even an unmerged one of your own. A real incident
  happened here: Gemini support was built and pushed but never
  merged; by the time it was needed, `main` had moved on (usage
  tracking, copy changes) and merging the stale branch would have
  conflicted. Fix was cherry-picking the commit onto a fresh branch
  off current `main`. Check `git log --oneline origin/main` before
  starting new work, and check for unmerged branches that might
  already contain related work.
- **Test in a real headless browser (Playwright) before committing,
  not just a syntax check.** Chromium is pre-installed; Playwright's
  npm package lives at `/opt/node22/lib/node_modules`, so run with
  `NODE_PATH=/opt/node22/lib/node_modules node script.js`. This caught
  two real bugs during development that a syntax check or code review
  alone would have missed:
  - `.dash-overlay` set `display:flex` unconditionally, which (as
    author CSS) overrode the browser's default `[hidden]{display:none}`
    at equal specificity — the modal rendered even while `hidden` was
    set. Fixed by scoping to `:not([hidden])`. General lesson: never
    set `display` in a class also toggled by the `hidden` attribute
    without a `:not([hidden])` guard.
  - Google Apps Script Web Apps reject a CORS preflight, so POSTs to
    `LOG_ENDPOINT` must use `Content-Type: text/plain;charset=utf-8`
    (a "simple request" that skips preflight), not
    `application/json`, even though the body is JSON text. `doPost`
    parses `e.postData.contents` as JSON regardless of the declared
    content type.
- **Verify third-party API contracts by testing against the real
  endpoint** (even with a fake key) rather than trusting memorized
  docs — model names and error shapes drift. Example: a real invalid
  Gemini key returns `status: "INVALID_ARGUMENT"` with the specific
  reason nested in `error.details[].reason === 'API_KEY_INVALID'`, not
  a top-level `UNAUTHENTICATED` status — the naive mapping would have
  shown a generic error instead of "your API key is invalid."
- **This sandbox's network is allowlisted**: `api.anthropic.com` and
  `generativelanguage.googleapis.com` are reachable directly (useful
  for testing real error responses with a fake key), but
  `*.github.io` and `script.google.com` are blocked. Live-site and
  live-Apps-Script verification has to be done by the user; Google
  Drive API access (when available) can independently verify Sheet
  contents without needing the live site at all.
- **No student writing/code content is ever logged** — only names,
  timestamps, tool used, and scores. Keep it that way; don't add
  raw-submission logging without an explicit, separate ask.
