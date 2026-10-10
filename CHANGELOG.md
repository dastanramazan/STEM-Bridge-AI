# Changelog — STEM Bridge AI

All notable changes are documented here. This file serves as the official development history of the project.

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

---

## [0.2.0] — 2026-06 — UI Refresh

### Changed
- Redesigned tool cards with updated imagery and clearer naming
- General repository cleanup

---

## [0.1.0] — 2025-04-03 — Unified Platform Release

### Added
- **Unified STEM Bridge AI interface** combining SciWrite AI and CodeBridge AI into a single platform
- Mode selector: seamless switching between Writing Feedback and Coding Tutor
- Shared Claude API layer with mode-specific system prompts
- Consistent grade-level calibration across both tools (K-2 through Undergraduate)
- Cohesive design system with writing track (cyan) and coding track (violet) visual identities
- Mission statement and national importance framing in UI footer

### Changed
- Merged two separate single-purpose tools into one unified application
- Standardized JSON response schema across both AI modes for consistent rendering
- Shared error handling and loading states

---

## [0.0.5] — 2025-03-20 — CodeBridge AI: Debug Mode

### Added (CodeBridge)
- **Debug Help mode**: AI identifies runtime and logical errors with grade-appropriate explanations
- `correctedCode` field in JSON response: renders side-by-side with student's original
- HTML escaping for code blocks to prevent XSS and display issues
- Scratch language option added for K-5 students

### Research Note
Added debug mode after classroom observation at Harmony Public Schools (Spring, TX):
the most common student request was "why doesn't my code work?" rather than "teach me a concept."
Debug Help directly addresses that documented student need.

---

## [0.0.4] — 2025-03-10 — CodeBridge AI: Grade Calibration

### Added (CodeBridge)
- **Grade-level language calibration** across 6 tiers: K-2, 3-5, 6-8, 9-10, 11-12, Undergraduate
- System prompt enforces vocabulary complexity per grade: everyday analogies (K-2) → full technical terminology (Undergrad)
- `gradeReadiness` score added to coding feedback (0–100)
- Language selector: Python, JavaScript, Java, C++, SQL, Scratch
- Three feedback modes: Code Feedback, Concept Q&A, Debug Help

### Research Basis
Grade calibration derived from CSTA K-12 CS Framework learning progression standards.

---

## [0.0.3] — 2025-02-25 — SciWrite AI: Rubric Refinement

### Added (SciWrite)
- Expanded from 3 dimensions → 5 NGSS-aligned dimensions:
  Scientific Accuracy, Evidence Use, Clarity, Structure, Reasoning
- Grade-level selector: K-2, 3-5, 6-8, 9-10, 11-12, Undergraduate
- Assignment type selector: Lab Report, Research Essay, Hypothesis, Data Analysis, Scientific Explanation
- JSON now includes `strengths`, `improvements`, `suggestions` arrays (not just overall score)
- Color-coded score cards with dimension-level progress bars

### Fixed
- JSON parsing now strips markdown code fences before `JSON.parse()` — handles model response variance
- Character counter now updates on paste events, not only keypress

---

## [0.0.2] — 2025-02-15 — SciWrite AI: Structured Feedback

### Added (SciWrite)
- Structured JSON response replaces raw text output
- 3-dimension scoring proof-of-concept (Accuracy, Clarity, Evidence)
- Grade parameter passed to API — validates that model adjusts language complexity
- Basic UI with score display

### Changed
- System prompt redesigned to enforce JSON-only output (no preamble or markdown)
- Added "encouraging but honest" tone instruction based on educational psychology literature

---

## [0.0.1] — 2025-02-20 — Proof of Concept

### Added
- Initial proof-of-concept: single textarea → Claude API → raw text feedback
- Core architecture established: client-side fetch to Anthropic API (zero build step)
- Validated core hypothesis: LLM produces specific, actionable STEM writing feedback
- Zero-dependency HTML approach chosen for rural school IT compatibility

### Research Questions Established
1. Can LLM feedback be reliably structured for pedagogical use?
2. Can grade-level calibration produce developmentally appropriate responses?
3. What dimensions matter most for STEM writing and CS skill assessment?
4. Can a single platform address both writing and coding feedback needs?
