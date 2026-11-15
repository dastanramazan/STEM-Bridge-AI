# Changelog — STEM Bridge AI

All notable changes are documented here. This file serves as the official development history of the project.

---

## [Unreleased]

- **Documentation corrected for accuracy.** Removed change-log entries for versions before the first public release (see the note under 0.3.0). README and research.md: removed three statistics that had no verified source, replaced them with figures from the Code.org and CSforALL *2025 State of AI + CS Education* report, dropped claims of ongoing research and of an "expert-level" tool, renamed the tools to the names the site uses (Science Writing, Coding Helper), and described the writing rubric as informed by NGSS practices and not yet validated.

- **Removed the "48 states" teacher-shortage statistic** from README.md and research.md (the problem statement now rests on the computing-jobs, Code.org, and NSF figures, each cited) and dropped its reference.

## [0.13.2] — 2026-11 — Sturdier When Google's AI Is Busy

- **Three models, longer retries.** When Gemini is overloaded, the school script now tries the main model, then the lighter fallback, then a third model (two attempts each), and keeps retrying for up to 30 seconds instead of 20. A model name Google no longer serves is skipped instead of ending the request.
- **Clearer errors with a "Try again" button.** Busy, timed-out and unreadable replies now say so in plain words (not Google's wording) and show a button that re-runs the request with the text still on the screen. "Could not reach the AI service" now also mentions that a school or work network or VPN can block `script.google.com`.
- Update the school script (new `Code.gs`, then Deploy → New version) to get the extra models; the page changes work with any script.

## [0.13.1] — 2026-11 — Wording Fixes and Slow-Answer Handling

### Changed
- **Claims trimmed after review.** The About window no longer shows the "48 states" statistic or says "Kindergarten through college", and its "Why we built it" text is now phrased as what the tool is *designed to* do. The grade menus no longer offer "Undergraduate" (writing, coding, and photo), and the coding tutor's instructions no longer mention undergraduates. The README tagline now says "designed for" instead of "delivering expert-level", and its grade list matches the menus (K–12).
- **Slow coding answers.** The page now waits up to 75 seconds (was 45) for the AI, because the 45-second wait could end before the school's server did when the AI thought for a long time or had to retry. After 20 seconds the spinner says "Still working. The AI is taking longer than usual." The timeout message now says the AI is slow and suggests a shorter piece of code or text.
- The school's script now records, in the Apps Script "Executions" log, how long each AI call took, which model answered with what status, and the sizes of the request (never the text itself), so the cause of a slow or failed answer can be read off directly.

---

## [0.13.0] — 2026-11 — Feedback Form for Teachers

### Added
- **"Rate this tool"** (footer, About, the Teacher area and the Teacher Dashboard): a short form for teachers and other adults with five quick questions (role; how useful for students; how easy to use; how good the AI feedback was; would you use it with your students), an optional comment, a tick box "You may quote my comment (without my name)", and an optional email for a reply. It takes about a minute and works with the keyboard and on phones.
- Answers go to a new **Feedback** tab in the project team's own Google Sheet (never to a school's script) and contain no student information. The form refuses to appear unless the server says it can take feedback, and only shows "Thank you" when the server confirms it stored the answer, so nothing is silently lost.
- Protection against spam: a hidden bot-trap field, a limit per device (3 per 6 hours) and a limit for everyone (60 per hour), length limits, control characters removed, and text columns kept as plain text so nothing can become a formula.

### Notes
- The project team's script must be updated with the new `Code.gs` before the form switches on. Until then visitors see "The feedback form isn't switched on yet."
- A school's own script does not need updating: feedback always goes to the project's script.

---

## [0.12.1] — 2026-11 — "Use free access instead" button

### Fixed
- If "use our own AI key" was switched on (it is remembered in the browser) and no usable key was set, students saw only "Add your Anthropic API key in Settings…" with no easy way out. The message now also offers a **"Use free access instead"** button that turns the option off and tries the same request again through the free shared connection. It works for writing, coding help, and photo checks (including the "Anthropic can't read photos" case). Other errors, such as the daily limit, are unchanged.

---

## [0.12.0] — 2026-11 — Easy Setup for a School

### Added
- **No more editing code.** A new **STEM Bridge AI** menu in the school's Google Sheet opens a setup form for the teacher PIN, the free Gemini AI key, the school's name, and (optionally) allowed school email domains. The PIN and key are saved in the script's private storage, not in its code. The form checks the AI key with Google and never shows secrets back. Older setups that keep the PIN and key in the code still work, and values saved in the form take priority.
- **No more editing the website on GitHub.** In **⚙️ Settings → 🏫 For teachers: set up my school** a teacher pastes the Web app address once. The page checks that it really is a STEM Bridge AI school script (a public "business card" reply with its version, school name, and what is set up), remembers it on that device, and shows a **link for students**.
- **Student links** like `…/?s=<school>` ask before connecting: "This link connects STEM Bridge AI to *School*'s own server… Only continue if your teacher gave you this link." Nothing is saved or sent until the student says yes. Malformed or hostile values are ignored, and a link to something that isn't a STEM Bridge AI school offers no way to connect. Class links from the Teacher area include the school automatically.
- **Update and setup hints:** if the school's script is older than the page expects, or the PIN or AI key is still missing, Settings explains the exact steps.
- A **template Sheet** approach (make a copy of a Sheet that already contains the script) and a rewritten Quick start in TEACHER_SETUP.md; instructions for building the template once.

### Changed
- **Safer defaults:** a script whose PIN was never set no longer accepts the public example PIN. It says to open the setup form instead. A school whose AI key isn't set gets a clear message instead of an error.
- The website's built-in connection is now the shared demo; a school's own address replaces it per device.

---

## [0.11.0] — 2026-11 — Teacher Accounts, Step 1: Sign-in, Classes, Assignments

### Added
- **Teacher area (optional).** In 📊 Teacher, a new "Teacher area" opens a window where a teacher signs in with Google, creates **classes** (each gets a short class code and a link to give students) and **assignments** (title, instructions, tool, due date, and how much help the AI may give: hints only, hints and an example, or show the fix after 2 tries). Classes and assignments can be archived. A "Teachers" tab lets the administrator add or remove teachers by email.
- **Where it lives:** in new tabs (Teachers, Classes, Assignments) of the school's own Google Sheet, written by the school's own Apps Script. The project holds no shared database. Student work is not stored there.
- **How it is protected:** every request carries Google's signed sign-in token, which the script checks with Google (right app, verified email, not expired) before doing anything. Only the script's owner (administrator) and the people they add, or optionally anyone on an allowed school domain, may sign in. A teacher can only see and change their own classes and assignments. The new tabs are plain text, so nothing typed in can become a formula. There are limits on the number of classes and assignments, and bad sign-in attempts are throttled.
- Google's sign-in script is loaded only when a teacher opens the Teacher area, never for students.
- The feature stays off until the public Google client ID is set in both `index.html` and the school's script (see TEACHER_SETUP.md).

### Not yet
- Students can't join a class by its code or link yet, teachers can't write their own rubrics yet (the standard five criteria are used), and there are no per-class results yet. These are the next steps.

---

## [0.10.1] — 2026-11 — Telling People Apart

### Added
- **Device code.** Because anyone can type any name, every logged result now also carries a short random code that the browser makes for itself (for example `K7M2`). The Sheet has a new **Device** column and the Teacher Dashboard shows the code next to each name. Students can see their own code in Settings. No IP address or device details are collected.
- **Dashboard flags:** a name used from several devices, a device used with several names, and "Not on class list" when the teacher has pasted a class list (saved only in the teacher's browser).
- **Dashboard layout:** a "Latest activity" list (newest first), first-seen and last-seen times per student, dates with times in the viewer's time zone, and names that differ only by capital letters or spaces are counted as one student.

### Changed
- The Apps Script cleans the device value down to letters and digits before writing it, and keeps the Device column as text. Older rows without a code show a dash. Paste the new `Code.gs` and deploy a New version.

---

## [0.10.0] — 2026-10 — Save as Word, and Using AI Responsibly

### Added
- **Save as Word.** A "Save as Word" button under every student's feedback (writing, coding help, and a student's own photographed work) downloads a .docx the student can bring to a tutorial or email to a teacher. It holds the headline, the next step, stars-and-words for each skill, what's working, what to try, a "Check this yourself" list with tick boxes, blank lines for "Where I got stuck", "My question for my teacher" and "What I checked myself", and a reminder that AI can be wrong. A tick box lets the student include or leave out their own writing or code. The file is built entirely in the browser and never sent anywhere.
- **"Check this yourself" on every result.** The AI now names one or two facts or steps to verify in a textbook, in notes, or with the teacher (a general reminder appears if it doesn't).
- A note under every result: "AI can make mistakes. Check the facts with your textbook or your teacher."
- A short **"AI is a helper, not a crutch"** card on a student's first visit (try it yourself first, check the AI, make it yours), also in About under "Using AI well".

### Changed
- **Feedback, not solutions.** The AI is told explicitly never to rewrite the student's work or give a finished answer, only to point out where and why and suggest one thing to try.
- The coding tool's corrected code only goes into the Word file if the student chose to reveal it.
- Word file names are plain ASCII (accents dropped, Cyrillic spelled out), e.g. `STEM-Bridge-feedback_Aygerim_2026-10-30.docx`.

---

## [0.9.0] — 2026-10 — Live Camera for Paper Work

### Added
- **Live camera in Photo Check.** A "Live camera" button opens a live view from a USB document camera, a webcam, or a phone camera. A student can work a problem on paper, press **Capture** (or the space bar), and add the page to the check, up to 4 pages, without taking and choosing photos. If several cameras are connected, there is a menu to pick one, and the choice is remembered on that device.
- **"Make the writing clearer"** (on by default): captured pages get an automatic contrast boost so paper looks white and pencil or pen looks dark, which helps the AI read handwriting. It leaves a flat or blank view untouched.
- Clear, friendly messages when the camera is blocked, missing, busy, or unsupported (school computers sometimes block cameras).

### Privacy
- The live video is only shown on screen: nothing is recorded or sent. Only the one frame captured is kept, in memory, as a photo. The camera is switched off when the student presses "Check the Work", closes the camera, switches tools, or leaves the tab or page.

---

## [0.8.0] — 2026-10 — A Friendlier, Student-First Design

### Changed
- **New look:** bright and friendly, with a light theme by default and an optional dark theme (Settings). Body text is larger and clearer, buttons are bigger, and nothing visible is smaller than about 14px.
- **System fonts only.** The page no longer downloads fonts from Google, so it loads faster, works on locked-down school networks, and makes one fewer outside request.
- **Student-first home screen:** the long introduction is gone. Students say their name, see a greeting, pick one of three big tool cards (Science Writing, Coding Helper, Photo Check) and start. The introduction and statistics moved to an **About** window for visitors and teachers.
- **Settings window** holds the light/dark choice and the "use our own AI key" option, which no longer clutters the top of the page.
- **Friendly feedback:** a cheerful headline, one clear "next step", and stars with words (Awesome, Strong, Growing, Getting started, Keep going) for each skill. The exact scores are one click away ("Show scores"). The same style is used for typed writing, coding help, and a student's own photographed work. Teachers still get numeric, editable scores and the full test marking view.
- On phones and tablets the page scrolls to the feedback by itself.
- New logo: a hexagon with an arch bridge, water, and a spark. It is also the browser-tab icon.
- Friendlier wording throughout (for example "Check my writing", "Help me with my code", "Things to look at").
- Windows (Settings, About, Dashboard) close with the Escape key or by clicking outside them.

---

## [Unreleased] — Documentation

### Changed
- README and research notes now state the project's status plainly (built and deployed, no classroom pilot or outcome data yet), and the roadmap is rewritten as clearly labeled goals.
- Removed two statistics that had no citation on file (a "43% fewer science specialists" figure and "54M+" students, including the "54M+" box in the page header, now "3 tools in one platform"), and removed a specific effect size that could not be matched to its source.
- Federal-policy references now cite the April 2025 executive order on AI education and NSF Dear Colleague Letter 25-036 instead of the 2023 executive order.

### Added
- `PRIVACY.md`: what data the app handles, where it goes, and what is never stored.

---

## [0.7.0] — 2026-10 — Test Grading with Answer Keys

### Added
- **Grade paper tests against an answer key.** In Photo Check's Teacher mode, choose "Test with answer key", pick a saved key, photograph a student's paper (up to 4 pages), and the AI marks each question against the key. It works for tests written on the printed paper and for separate answer sheets.
- **Answer keys** can be typed, or read from a photo (the AI turns it into text that the teacher checks and edits before saving). Keys support points per question, sample answers with what to look for, and "(check myself)" for questions the teacher marks personally. They are saved only in the browser on the teacher's own device.
- **Question-by-question results.** Each question shows what the student wrote, the key's answer, a mark and editable points; the total and percent update as the teacher changes points. Questions the AI wasn't sure about (handwriting, crossed-out answers) or that were left for the teacher are highlighted until the teacher reviews them.
- Saving a test logs only the percent score, with the test name and points in the Detail column. The Dashboard counts Test uses separately.
- **Teacher mode is now locked behind the PIN** (the same PIN as the Teacher Dashboard), so students on a shared device can't open saved answer keys. It re-locks when the browser tab closes, or with "Lock teacher mode".

### Security
- Too many wrong PIN guesses (10) now locks the PIN for 15 minutes for everyone, including the Dashboard, so it can't be brute-forced. The Dashboard says so when this happens.

### Changed
- Photo requests may return up to 8192 tokens, to fit a mark for every question of a long test.

---

## [0.6.0] — 2026-10 — Photo Check

### Added
- **Photo Check**, a third tool for handwritten work. Take a photo of a page (or choose one from the gallery), up to 4 pages per check, and the AI first writes out what it read, then scores it with the same STEM writing rubric as SciWrite AI. The "What the AI read" transcription is shown so a teacher can compare it with the paper.
- **Two ways to use it.** *Teacher grading*: enter the student's name, get an AI draft, adjust any score, then press Save to log it. *My own work*: a student photographs their own page instead of typing it, and the scores are logged automatically, like typed work.
- When the handwriting can't be read reliably, the app says so and asks for a clearer photo; unreliable scores are not logged automatically.
- Quick-pick buttons for recently graded students' names (names only, kept on that device).
- The Teacher Dashboard counts Photo uses separately.
- Photo requests carry the work's student name, so the daily limits (10 per student, 100 per class) apply to the student whose work it is.

### Privacy
- Photos are shrunk on the device (which also removes metadata such as location), sent to the AI to read, and then forgotten. They are never stored, logged, or written to the Sheet. Only names and scores are logged, as before.

### Changed
- The Apps Script proxy accepts up to 4 photos per request and checks them before counting an analysis.

---

## [0.5.0] — 2026-09 — Zero-Setup Default AI Access

### Added
- **Default AI connection with no API key needed.** Students just enter their name; requests go to the teacher's own Google Apps Script, which holds a Gemini key privately and calls Gemini on their behalf. The key never reaches a visitor's browser, unlike a key placed directly in the page's code, which anyone could copy via View Source.
- **"School or organization? Provide your own API key instead"** option for anyone who prefers their own Anthropic (Claude) or Gemini key. That path calls the provider directly with the visitor's own key, exactly as in 0.4.0.
- **Automatic retry and fallback for the default connection.** If Gemini reports it is overloaded or rate-limited, the script retries the main model, then switches to a lighter fallback model, instead of immediately showing the student an error.

### Changed
- Daily limits on the default connection: 10 analyses per student and 100 for the whole class per day (editable in the Apps Script). Failed attempts don't count.
- Setup bars collapse into a one-line summary once the student's name is saved (and a key, if they chose their own), with an "Edit" button to reopen them.
- The full marketing hero appears only on a browser's first visit; later visits show a condensed header with an "About this tool" button.
- The Teacher Dashboard button moved from the footer to the header so teachers can find it.
- The kindergarten–1st grade text box now shows age-appropriate placeholder text instead of the generic lab-report example.
- The request timeout for the app was raised from 30 to 45 seconds to leave room for retries.
- The default connection's response limit was raised so Gemini's hidden reasoning tokens can't crowd out the actual answer.
- Helper text, labels and input placeholders are now near-white and slightly larger so they stay readable on the dark background.

### Fixed
- The version badge, README and CHANGELOG were not updated after 0.4.0's later changes; they now match what is deployed.

---

## [0.4.0] — 2026-09 — Multi-Provider AI, Teacher Dashboard, and Accessibility

### Added
- **Choice of AI provider**: Anthropic (Claude) or Google Gemini, selectable via pills next to the API key field. Gemini's free tier requires no credit card, lowering the cost barrier to actually using the platform.
- **API key input**: the app previously had no way to authenticate with the AI API at all. Keys are entered by the user and stored only in the browser's own session storage, per provider — never sent anywhere but the AI provider itself.
- **Optional student usage tracking**: students enter their name once per device; every completed analysis is logged (name, timestamp, tool, assignment/language, grade, scores — never the submitted writing or code) to a Google Sheet the teacher connects themselves (see `TEACHER_SETUP.md` and `google-apps-script/Code.gs`).
- **Teacher Dashboard**: a PIN-protected in-app view showing total usage, unique students, a writing/coding breakdown, per-student summaries, and every individual submission's own scores.
- **Revision comparison**: after a student resubmits the same assignment (writing) or language/mode (coding), a "Progress Since Last Attempt" panel shows the score change for each dimension, plus an encouraging summary.
- **Read Feedback Aloud**: text-to-speech for both SciWrite AI and CodeBridge AI output, with a slower speaking rate for the youngest grades.
- **Voice input for Kindergarten–1st Grade**: a "Speak Instead of Type" button using the browser's built-in speech recognition, since this age group typically dictates rather than types or reads.
- **Guidance-first CodeBridge AI**: corrected code is now hidden behind a "try it yourself first" reveal button, and the AI is prompted to lead with hints and questions rather than handing over the fix immediately.
- `CLAUDE.md` — persistent project context for future Claude Code sessions working on this repo.
- `TEACHER_SETUP.md` — a non-technical walkthrough for connecting the optional usage-tracking Google Sheet.

### Changed
- **CodeBridge AI's grade range now starts at 6-8** (previously included K-2 and 3-5) — block-based tools like Scratch better serve younger coders, and the app now says so and points them to SciWrite AI instead. SciWrite AI continues to cover the full K-12 range.
- **SciWrite AI's "K-2" grade band split into "Kindergarten–1st Grade" and "2nd Grade"**, since a non-writing kindergartner and a 2nd grader writing full sentences need very different tools. Kindergarten–1st Grade now uses a simplified 2-dimension rubric instead of the standard 5, reflecting that this age typically dictates a short spoken observation rather than writing an essay.

### Fixed
- **The app had no authentication on its API calls at all and did not function for anyone.** Added the API key mechanism described above.
- AI-generated text was rendered into the page without escaping in most places, a real XSS risk. All AI-derived text is now escaped before display.
- Malformed or incomplete AI responses crashed the renderer with an opaque error. Responses are now validated against the expected shape before rendering, with specific, readable error messages on failure.
- API calls had no timeout and could hang indefinitely on a stalled connection. Added a 30-second timeout.
- Student-submitted text went directly into the AI prompt with no separation from instructions, a prompt-injection risk. Student input is now wrapped in tagged blocks with explicit instructions to treat it as data, not commands.
- Raw API error JSON was shown directly to students on failure. Errors are now mapped to plain-language messages for both providers.
- Google Sheets silently reinterpreted grade values like "6-8" and "9-10" as dates, corrupting the logged grade level. The logging script now forces those columns to plain text.
- The usage-tracking script assumed the header row was always row 1; if a teacher manually deleted it, the script would discard real data thinking it was the header. It now identifies the header by content, not position, and self-heals if the header is missing.
- Removed dead code (`scoreCls`, `scoreTextCls` — defined but never called).

---

## [0.3.0] — 2026-07 — Public Deployment & Repository Cleanup

### Added
- Live demo deployed via GitHub Pages: https://dastanramazan.github.io/STEM-Bridge-AI/

### Changed
- README corrections: fixed demo links, project structure, and roadmap dates

### Removed
- Development scaffolding script (`setup_git_history.sh`) removed from repository

### Note on earlier history
Version 0.3.0 (July 2026) is the first public release. The idea for the project dates to early 2025, but there were no earlier released versions. This file previously listed versions 0.0.1 to 0.2.0 with dates from February 2025 to June 2026; those entries did not correspond to released software and were removed in November 2026.

---
