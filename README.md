# STEM Bridge AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Active-brightgreen)](https://dastanramazan.github.io/STEM-Bridge-AI/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.3.0-cyan)](CHANGELOG.md)
[![Open Source](https://img.shields.io/badge/Open%20Source-Free%20for%20Schools-orange)](LICENSE)

> **A unified, open-source AI platform delivering expert-level STEM writing feedback and coding tutoring to rural and underserved U.S. students — free, zero-dependency, and deployable in any school environment.**

---

## 🎯 The Problem

The United States faces two simultaneous, documented crises in STEM education:

1. **CS Teacher Shortage:** 48 states report critical shortages of qualified CS educators (U.S. Dept. of Education, 2023–2024). Over **667,000 new computing jobs** are projected by 2030 — the majority inaccessible to students without CS instruction.

2. **STEM Writing Gap:** Rural schools employ **43% fewer science specialists** per student than urban districts (NCES, 2022). Scientific writing — a foundational skill for STEM careers — goes untaught at scale in low-income communities.

**Both crises disproportionately affect the same students:** the 54M+ enrolled in rural and Title I schools, who are less likely to have access to specialized tutors, coding bootcamps, or AP CS courses.

STEM Bridge AI addresses both gaps in a single, free, open-source platform.

---

## 🚀 Live Demo

**[→ Try STEM Bridge AI](https://dastanramazan.github.io/STEM-Bridge-AI/)**

No signup. No cost. Works on any device with a browser.

---

## ✨ Platform Overview

STEM Bridge AI contains two integrated tools:

### 🔬 SciWrite AI — STEM Writing Feedback
Delivers instant, personalized feedback on student scientific writing calibrated to grade level and assignment type.

| Feature | Detail |
|---|---|
| **5-dimension scoring** | Scientific Accuracy, Evidence Use, Clarity, Structure, Reasoning |
| **Assignment types** | Lab Report, Research Essay, Hypothesis, Data Analysis, Scientific Explanation |
| **Grade levels** | K–2, 3–5, 6–8, 9–10, 11–12, Undergraduate |
| **Output** | Overall score, strengths, improvements, specific next steps |
| **Standards alignment** | Next Generation Science Standards (NGSS) |

### 💻 CodeBridge AI — CS Coding Tutor
Provides grade-calibrated coding assistance across the full K–12 spectrum with three interaction modes.

| Feature | Detail |
|---|---|
| **Feedback modes** | Code Feedback, Concept Q&A, Debug Help |
| **Languages** | Python, JavaScript, Java, Scratch, C++, SQL |
| **Grade calibration** | Strict language complexity matching (K-2 → Undergraduate) |
| **Output** | Quality metrics, explanation, corrected code, learning next steps |
| **Population focus** | Rural and low-income students without CS specialist access |

---

## 🏗️ Architecture

```
Student Input (Browser)
       │
       ├── Mode: SciWrite AI (Writing Track)
       │         Grade Level + Assignment Type
       │         → NGSS-aligned 5-dimension rubric prompt
       │
       └── Mode: CodeBridge AI (Coding Track)
                 Grade Level + Language + Feedback Mode
                 → Grade-calibrated tutoring prompt
                         │
                         ▼
             Claude API (claude-sonnet-4-20250514)
                         │
                         ▼
             Structured JSON Response
                         │
                         ▼
             Rendered Feedback UI (no framework required)
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

You will need an [Anthropic API key](https://console.anthropic.com) to power the AI responses.

### Option C: Deploy to GitHub Pages

```bash
# 1. Fork this repository
# 2. Settings → Pages → Deploy from branch: main → / (root)
# 3. Live at: https://your-username.github.io/stem-bridge-ai
```

**Why single-file / zero-dependency?** Rural and Title I schools frequently operate restricted IT environments where npm, build tools, or CDN access may be blocked. This application opens directly as an HTML file in any browser with no installation required.

---

## 🔬 Research Context & National Importance

This project is part of ongoing research into **AI-assisted STEM education equity** for underserved U.S. student populations.

### Federal Policy Alignment

| Policy / Program | How STEM Bridge AI Aligns |
|---|---|
| White House EO on AI (Oct. 2023) | "Supporting development of a diverse and skilled AI workforce" |
| U.S. Dept. of Education AI Report (2023) | "AI tools centered on equity and underserved communities" |
| NSF STEM Education Priority | Expands STEM access for underrepresented populations |
| Code.org Equity Initiative | Free CS instruction for students without specialist access |

### The Evidence Base for AI-Personalized Feedback

- Immediate, personalized feedback is among the highest-impact pedagogical interventions (Hattie & Timperley, 2007, effect size d=0.73)
- Rural districts have 43% fewer science specialists per student than urban districts (NCES, 2022)
- 48 states report CS teacher shortages for 3+ consecutive years (U.S. Dept. of Education, 2023)
- Hispanic students are 26% of K-12 enrollment but earn fewer than 8% of computing degrees (NSF, 2023)

### Planned Research Outputs

- [ ] Pre/post study: student writing improvement using SciWrite AI feedback vs. control
- [ ] Coding comprehension gains: CodeBridge AI vs. no-feedback condition
- [ ] Qualitative: teacher-reported integration experiences in Title I settings
- [ ] Target venue: ISTE, CSTA National Conference, or journal submission

---

## 📁 Project Structure

```
STEM-Bridge-AI/
├── index.html    # Unified application (single-file, zero-dependency)
├── README.md     # This file
├── LICENSE       # MIT License
├── CHANGELOG.md  # Version history and development milestones
└── research.md   # Research background, citations, national importance
```

---

## 🗺️ Roadmap

### v0.2 — Classroom Features (planned, 2026)
- Teacher dashboard: class-wide trend analysis
- Spanish-language interface for ESL student populations
- PDF export of feedback reports for student portfolios

### v0.3 — Adaptive Learning (planned, 2026)
- Progress tracking across multiple submissions
- Persistent knowledge gap identification
- Targeted reading resource recommendations

### v1.0 — District Deployment (planned, 2027)
- LMS integration: Google Classroom, Canvas
- Offline / low-bandwidth mode for rural schools
- Peer-reviewed research publication on learning outcomes
- Teacher professional development module

---

## 🤝 Contributing

Contributions are especially welcome from educators, CS teachers, and researchers.

```bash
git checkout -b feature/your-feature-name
git commit -m 'Add: description of change'
git push origin feature/your-feature-name
# Open a Pull Request
```

Priority areas: Spanish localization, teacher dashboard, offline mode, LMS integrations.

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
2. National Center for Education Statistics. (2022). *Characteristics of Rural Schools in the United States*. U.S. Dept. of Education.
3. U.S. Department of Education. (2023). *Artificial Intelligence and the Future of Teaching and Learning*.
4. NSF. (2023). *Women, Minorities, and Persons with Disabilities in Science and Engineering*.
5. Code.org. (2024). *State of Computer Science Education Annual Report*.
6. Executive Order on Safe, Secure, and Trustworthy AI. (Oct. 30, 2023). White House.
7. Next Generation Science Standards (NGSS). (2013). *Next Generation Science Standards: For States, By States*.
