# Changelog — STEM Bridge AI

All notable changes are documented here. This file serves as the official development history of the project.

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
