# STEM Bridge AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Active-brightgreen)](https://dastanramazan.github.io/STEM-Bridge-AI/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.8.0-cyan)](CHANGELOG.md)
[![Open Source](https://img.shields.io/badge/Open%20Source-Free%20for%20Schools-orange)](LICENSE)

> **A unified, open-source AI platform delivering expert-level STEM writing feedback and coding tutoring to rural and underserved U.S. students — free, zero-dependency, and deployable in any school environment.**

**Status (v0.8.0):** working and publicly deployed. It has been built and tested by its developer, but it has not yet had a classroom pilot, so there is no data yet on learning outcomes. See the [Roadmap](#️-roadmap) for what comes next and [PRIVACY.md](PRIVACY.md) for how student data is handled.

---

## 🎯 The Problem

The United States faces two simultaneous, documented crises in STEM education:

1. **Teacher Shortage:** 48 states reported critical shortages of qualified teachers in 2023–2024 (U.S. Dept. of Education Teacher Shortage Area designations). Over **667,000 new computing jobs** are projected by 2030 (BLS, 2023), and students without CS instruction are poorly positioned to compete for them.

2. **STEM Writing Gap:** Scientific writing is a foundational skill for STEM careers, and students in schools without science specialists have few chances to practice it and receive expert feedback.

**Both gaps fall hardest on the same students:** those in rural and Title I schools, who are less likely to have access to specialized tutors, coding bootcamps, or AP CS courses.

STEM Bridge AI addresses both gaps in a single, free, open-source platform.

---

## 🚀 Live Demo

**[→ Try STEM Bridge AI](https://dastanramazan.github.io/STEM-Bridge-AI/)**

No signup and no account. Free to use, on any device with a browser.

Good to know: the shared free AI connection has daily limits (10 analyses per student and 100 per class per day), and Google's free Gemini tier is sometimes busy, so a request can occasionally need a retry. Teachers who photograph student work should use a paid Gemini key — see [TEACHER_SETUP.md](TEACHER_SETUP.md) and [PRIVACY.md](PRIVACY.md).

---

## ✨ Platform Overview

STEM Bridge AI contains three integrated tools:

### 🔬 SciWrite AI — STEM Writing Feedback
Delivers instant, personalized feedback on student scientific writing calibrated to grade level and assignment type.

| Feature | Detail |
|---|---|
| **Scoring** | 5 dimensions (Scientific Accuracy, Evidence Use, Clarity, Structure, Reasoning) for grade 2 and up; a simplified 2-dimension rubric for Kindergarten–1st Grade dictated observations |
| **Assignment types** | Lab Report, Research Essay, Hypothesis, Data Analysis, Scientific Explanation |
| **Grade levels** | K–1, 2, 3–5, 6–8, 9–10, 11–12, Undergraduate |
| **Input options** | Type, or speak ("Speak Instead of Type") for Kindergarten–1st Grade |
| **Output** | Overall score, strengths, improvements, specific next steps — with Read Aloud and progress-since-last-attempt comparison |
| **Standards alignment** | Next Generation Science Standards (NGSS) |

### 💻 CodeBridge AI — CS Coding Tutor
Provides grade-calibrated coding assistance for text-based programming languages, with three interaction modes.

| Feature | Detail |
|---|---|
| **Feedback modes** | Code Feedback, Concept Q&A, Debug Help |
| **Languages** | Python, JavaScript, Java, Scratch, C++, SQL |
| **Grade calibration** | Strict language complexity matching (6-8 → Undergraduate) |
| **Teaching style** | Guidance-first — explanations lead with hints; the corrected code stays hidden behind a "try it yourself first" reveal |
| **Output** | Quality metrics, explanation, corrected code, learning next steps — with Read Aloud and progress-since-last-attempt comparison |
| **Population focus** | Rural and low-income students without CS specialist access |

K-5 students are better served by block-based tools (Scratch, CodeMonkey) and are directed to SciWrite AI instead, which covers the full K-12 range.

### 📷 Photo Check — Handwritten Work
Photograph a student's handwritten page on a phone and the AI reads it, shows what it read, and scores it with the SciWrite rubric.

| Feature | Detail |
|---|---|
| **Who uses it** | A teacher grading (AI draft scores they can adjust before saving), or a student checking their own work instead of typing it |
| **Input** | Phone camera or gallery, up to 4 pages per check |
| **Output** | Transcription of what the AI read, scores, strengths, improvements, suggestions |
| **Safeguards** | Warns when handwriting is too hard to read; photos are never stored or logged |

**Grade a paper test:** in Teacher mode (unlocked with your PIN), save an answer key — typed, or read from a photo — then photograph each student's paper. The AI marks every question against the key and shows what it read next to the correct answer, with editable points. Only the percent is logged.

Use a paid Gemini key before photographing real student work — see [TEACHER_SETUP.md](TEACHER_SETUP.md).

### 🔑 Works With No Setup, or Bring Your Own Key
By default the app runs on a free Google Gemini connection configured by whoever deploys it — students need no API key, no signup, nothing. A "Use our own AI key" option in Settings (⚙️) lets anyone switch to their own Anthropic (Claude) or Gemini key when they'd rather not use the shared default.

### 📊 Optional Usage Tracking & Teacher Dashboard
Students enter their name once per device; the app can log usage (name, timestamp, tool, scores — never the submitted writing or code) to a Google Sheet the teacher connects themselves, and unlock a PIN-protected in-app Dashboard. See [TEACHER_SETUP.md](TEACHER_SETUP.md).

---

## 🏗️ Architecture

```
Student Input (Browser) — typed, or spoken via browser speech recognition (K-1)
       │
       ├── Mode: SciWrite AI (Writing Track)
       │         Grade Level + Assignment Type
       │         → NGSS-aligned rubric prompt (5 dimensions, or 2 for K-1)
       │
       └── Mode: CodeBridge AI (Coding Track)
                 Grade Level + Language + Feedback Mode
                 → Grade-calibrated, guidance-first tutoring prompt
                         │
                         ▼
    Default Gemini connection (via a proxy that hides the key), or a
    visitor's own Anthropic/Gemini key
                         │
                         ▼
             Structured JSON Response
                         │
                         ▼
     Rendered Feedback UI (no framework required)
     — Read Aloud, progress-since-last-attempt, optional usage logging
```

---

## 🚀 Getting Started

### Option A: Use the Live Demo (Recommended)
Visit **[dastanramazan.github.io/STEM-Bridge-AI](https://dastanramazan.github.io/STEM-Bridge-AI/)** — no setup needed.

### Option B: Run Locally

```bash
git clone https://github.com/dastanramazan/STEM-Bridge-AI.git
cd STEM-Bridge-AI
open index.html   # or: python3 -m http.server 8080
```

If the deployer has set up a default AI connection (see [TEACHER_SETUP.md](TEACHER_SETUP.md)), the app works immediately with no key needed. Otherwise, open Settings (⚙️), turn on "Use our own AI key instead of the free shared one", and use either:
- **[Anthropic API key](https://console.anthropic.com)** (Claude), or
- **[Google AI Studio key](https://aistudio.google.com/apikey)** (Gemini) — free, no credit card required

### Option C: Deploy to GitHub Pages

```bash
# 1. Fork this repository
# 2. Settings → Pages → Deploy from branch: main → / (root)
# 3. Live at: https://dastanramazan.github.io/STEM-Bridge-AI
```

**Why single-file / zero-dependency?** Rural and Title I schools frequently operate restricted IT environments where npm, build tools, or CDN access may be blocked. This application opens directly as an HTML file in any browser with no installation required.

### Option D: Give Students a Default AI Connection & Track Usage (Optional)

Want students to use the app with zero setup — no API key, no signup — and
see who's using it and how they're doing? See [**TEACHER_SETUP.md**](TEACHER_SETUP.md)
for a 10-minute, no-coding setup that connects a private Google Sheet,
configures a default Gemini connection your Apps Script keeps hidden from
visitors, and unlocks a PIN-protected **📊 Teacher Dashboard** inside the
app — no student writing or code is ever logged, only names, timestamps,
and scores.

---

## 🔬 Research Context & National Importance

This project is part of ongoing research into **AI-assisted STEM education equity** for underserved U.S. student populations.

### Federal Policy Alignment

| Policy / Program | How STEM Bridge AI relates |
|---|---|
| Executive Order *Advancing Artificial Intelligence Education for American Youth* (Apr. 23, 2025) | Sets a federal policy of "the appropriate integration of AI into education" and AI training for educators; this project is a free AI tool for classrooms plus the educator training goal below |
| NSF Dear Colleague Letter 25-036 (Aug. 25, 2025) | Supports K-12 AI teams for the Presidential AI Challenge and asks funded teams to plan for engaging regions or localities particularly in need of AI education resources, the population this project targets |
| U.S. Dept. of Education, *Artificial Intelligence and the Future of Teaching and Learning* (2023) | Emphasizes keeping teachers in the loop and attending to equity in educational AI, which is why the Teacher Dashboard and teacher review of AI marks exist |
| Code.org, *State of Computer Science Education* (2024) | Documents that schools serving mostly low-income students are less likely to offer CS courses, the gap CodeBridge AI addresses |

### The Evidence Base

- Feedback is among the most powerful influences on learning and achievement, but its effect can be positive or negative depending on how it is given (Hattie & Timperley, 2007) — which is why CodeBridge AI leads with hints and questions rather than finished answers.
- 48 states reported critical teacher shortages in 2023–2024 (U.S. Dept. of Education Teacher Shortage Area designations).
- Hispanic students are 26% of K-12 enrollment but earn fewer than 8% of computing degrees (NSF, 2023).

### Planned Evaluation (not yet started)

No evaluation has been run yet. The plan is to work with a university computing-education researcher once classroom pilots exist.

- [ ] Pre/post study: student writing improvement using SciWrite AI feedback vs. control
- [ ] Coding comprehension gains: CodeBridge AI vs. no-feedback condition
- [ ] Qualitative: teacher-reported integration experiences in Title I settings
- [ ] Target venue: a peer-reviewed computing-education journal or conference such as CSTA

---

## 📁 Project Structure

```
STEM-Bridge-AI/
├── index.html              # Unified application (single-file, zero-dependency)
├── README.md               # This file
├── TEACHER_SETUP.md        # Optional: default AI connection + usage-tracking dashboard setup
├── PRIVACY.md              # What student data the app handles, where it goes, and what is never stored
├── google-apps-script/
│   └── Code.gs             # Gemini proxy (hides the default API key) + usage-tracking backend
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Version history and development milestones
└── research.md             # Research background, citations, national importance
```

---

## 🗺️ Roadmap

### ✅ Shipped (details in [CHANGELOG.md](CHANGELOG.md))
- **v0.4.0:** Teacher Dashboard, progress-since-last-attempt comparison, a free Google Gemini option, Read Aloud, and voice input for Kindergarten–1st Grade
- **v0.5.0:** a default AI connection that needs no API key from students (the teacher's own Apps Script holds the key privately), with automatic retry and a fallback model when Gemini is busy
- **v0.6.0:** Photo Check — photograph handwritten work to have it read and scored
- **v0.8.0:** a friendlier, student-first design: a light theme by default (dark optional), a simple greeting and three big tool cards, stars-and-words feedback with scores on request, system fonts only, and Settings and About windows
- **v0.7.0:** grading of paper tests against a teacher's answer key, PIN-protected Teacher mode, and daily usage limits

### 🎯 Goals (not yet achieved)
These are goals, not results.

- **2026–2027, field testing:** gather structured feedback from teachers outside the author's own campus, publish an educator quick-start guide, and release improvements driven by that feedback. Targets: at least 10 educators and at least 3 schools outside the author's campus.
- **2027–2028, district pilots:** pilot with at least two Title I districts, publish a teacher training module for CS teachers without engineering backgrounds, and publish district-facing privacy documentation before any pilot begins (a first version is [PRIVACY.md](PRIVACY.md)).
- **2028–2029, independent evaluation:** partner with a university researcher to evaluate learning outcomes, seek peer review, and apply for grant funding to sustain the platform.

### 💡 Ideas (unscheduled)
- Spanish-language interface for ESL student populations
- PDF export of feedback reports for student portfolios
- Offline / low-bandwidth mode and LMS integrations (Google Classroom, Canvas)

---

## 🤝 Contributing

Contributions are especially welcome from educators, CS teachers, and researchers.

```bash
git checkout -b feature/your-feature-name
git commit -m 'Add: description of change'
git push origin feature/your-feature-name
# Open a Pull Request
```

Priority areas: Spanish localization, offline mode, LMS integrations.

---

## 📜 License

**MIT License** — free for use by schools, nonprofits, researchers, and educators. See [LICENSE](LICENSE).

This is intentional: the national-scope mission requires that any school in the United States can deploy this tool at zero cost and with no licensing friction.

---

## 👤 Author & Research Contact

Developed as part of independent AI-in-education research focused on STEM equity for rural and underserved U.S. students.

**Research inquiries, collaboration, and educational deployment:** dastanramazan@gmail.com

---

## 📚 References

1. Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1), 81–112.
2. U.S. Department of Education. *Teacher Shortage Areas* (2023–2024 designations).
3. NSF. (2023). *Women, Minorities, and Persons with Disabilities in Science and Engineering*.
4. Code.org. (2024). *State of Computer Science Education Annual Report*.
5. U.S. Bureau of Labor Statistics. (2023). *Occupational Outlook Handbook: Computer and Information Technology Occupations*.
6. U.S. Department of Education. (2023). *Artificial Intelligence and the Future of Teaching and Learning*.
7. Executive Order, *Advancing Artificial Intelligence Education for American Youth*. (Apr. 23, 2025). The White House.
8. NSF Dear Colleague Letter 25-036, *Supplemental Funding Requests to Support K-12 AI Teams for the Presidential AI Challenge*. (Aug. 25, 2025).
9. Next Generation Science Standards (NGSS). (2013). *Next Generation Science Standards: For States, By States*.
