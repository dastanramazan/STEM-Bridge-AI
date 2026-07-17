# Changelog — STEM Bridge AI

All notable changes are documented here. This file serves as the official development history of the project.

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
