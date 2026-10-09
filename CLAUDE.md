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
- **Default AI access is via a server-side proxy, not a client-side key.**
  `useOwnKey` (a `localStorage`-backed toggle, UI: "School or
  organization? Provide your own API key instead") controls which path
  `callAPI()` takes:
  - `useOwnKey` false (default): `callGeminiViaProxy()` POSTs
    `{action:'generate', system, userContent}` to `LOG_ENDPOINT` (the
    same Apps Script used for logging). The script holds the real
    Gemini key as a script-level constant and calls Gemini itself,
    passing its response straight through unmodified — so
    `friendlyGeminiError()` and the `candidates[...]` parsing work
    unchanged whether the call went direct or via the proxy. The
    visitor's browser never sees this key. `handleGenerate_` retries on
    429/500/503 (main model twice, then `GEMINI_FALLBACK_MODEL` twice,
    with growing pauses) and stops starting new attempts after
    `MAX_RETRY_WINDOW_MS`; it must stay comfortably under the client's
    `API_TIMEOUT_MS` (45s). Its `maxOutputTokens` is deliberately high
    (4096) because Gemini's hidden thinking tokens count against that
    limit — a low value can truncate the JSON the app needs.
  - `useOwnKey` true: the original direct-call behavior — `callAnthropic()`
    or `callGemini()` based on `currentProvider`, using a key the
    visitor entered themselves, stored in `sessionStorage` per provider.
  This exists because a key baked directly into `index.html` would be
  visible to anyone via "View Source" — genuinely unrecoverable, unlike
  a key inside the Apps Script, which no client-side inspection can
  reach. Don't ever put a real secret directly in `index.html`.
- **Optional usage tracking + default AI, same endpoint.** `LOG_ENDPOINT`
  (empty by default) points to a Google Apps Script Web App a teacher
  deploys themselves (see `TEACHER_SETUP.md`, script at
  `google-apps-script/Code.gs`). Its `doPost` branches on `data.action`:
  `'generate'` proxies to Gemini using the script's own key,
  everything else (including the historical no-`action` shape) logs a
  usage row. If `LOG_ENDPOINT` is blank, both the default AI connection
  and tracking are inert — a visitor must then check "Provide your own
  API key" to use the app at all. Logging only fires *after* a
  successful analysis renders — a failed/errored attempt is never
  logged, by design.

## This deployment's live config

- GitHub Pages live URL: https://dastanramazan.github.io/STEM-Bridge-AI/
- `LOG_ENDPOINT` in `index.html` is connected to a real deployed Apps
  Script + Google Sheet ("STEM Bridge AI Usage Log", owned by
  dastanramazan@gmail.com). The Dashboard PIN and the Gemini API key
  used for the default proxy are both set inside that Apps Script
  only — neither is known to this session, and neither should ever be
  asked for or guessed; the script's constants can be edited, or the
  key rotated at aistudio.google.com, only by the repo owner.
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
    without a `:not([hidden])` guard. Hit this exact pattern two more
    times later (`#k1FallbackNote` reusing `.fl`, then `.setup-summary`
    itself) — the second time it was caught proactively by checking for
    it before testing, not by testing after the fact. When adding any
    new element toggled via `hidden` and given a `display`-setting
    class, check this pattern first.
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
- **Photo Check (third mode).** Photos are shrunk in the browser
  (canvas re-encode, max side 1400px, which also strips EXIF), held only
  in page memory, and sent as `images:[{mime,data}]` with the `generate`
  request; `Code.gs` validates (max 4, jpeg/png/webp, size cap) *before*
  reserving a daily-limit slot and forwards them as Gemini `inlineData`
  parts ahead of the text. Never persist, log, or put photos in
  `localStorage`/the Sheet. Photo mode supports the default proxy and an
  own *Gemini* key only (Anthropic own-key shows a clear message). The
  daily limit is keyed on the student whose work it is (`limitName`).
  Teacher role is a UI toggle, not authentication. Real handwriting
  accuracy can't be tested from this sandbox (no key, `script.google.com`
  blocked) — the user must test on the live site.
- **Teacher mode, answer keys, test grading.** Teacher role in Photo
  Check is gated by the Dashboard PIN: the page calls
  `LOG_ENDPOINT?action=check&pin=…` (GET) and stores
  `stemBridgeTeacherUnlocked` in `sessionStorage` on success. That flag
  is a screen in the page, not real security (anyone can set it in
  devtools). Real protection: answer keys only exist in the teacher's own
  `localStorage` (`stemBridgeAnswerKeys`), never in the Sheet or on a
  server. `Code.gs` `checkPin_` counts wrong guesses in `CacheService`
  (10 → locked 15 min for everyone, even the right PIN; accepted trade-off
  vs brute force). Test grading sends the key text wrapped as data
  (`<answer_key>`) plus the paper photos; the model returns per-question
  marks, validated/clamped client-side (`validateTestResponse`). Unknown
  `result` values fall back to `manual`. Log only `tool:'test'`,
  `detail:'<key name> – <earned>/<possible>'`, `scores:[percent]` — never
  per-question answers, and never mix points into the score columns (the
  Dashboard averages them). Photo requests allow 8192 output tokens.
- **Keep documentation claims verifiable.** README, research.md and
  similar public docs must not contain statistics without a citation the
  owner has supplied, and must not state any classroom-usage numbers,
  student counts, or learning outcomes unless the owner provides
  documentation. The project has not had a classroom pilot yet, and the
  docs say so. When the owner supplies a source for a number, add it
  with its citation. The "48 states" figure is worded as teacher
  shortages (the cited Dept. of Education Teacher Shortage Area
  designations); only say "CS teacher" if the owner confirms the source
  (Exhibit 9B) covers computer science specifically.
- **No student writing/code content is ever logged** — only names,
  timestamps, tool used, and scores. Keep it that way; don't add
  raw-submission logging without an explicit, separate ask.
