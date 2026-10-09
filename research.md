# Research Background — STEM Bridge AI

## Problem Statement

The United States faces two simultaneous, federally documented crises in STEM education:

### Crisis 1: CS Teacher Shortage
- 48 states reported critical teacher shortages in 2023–2024 (U.S. Dept. of Education Teacher Shortage Area designations)
- Over 667,000 new computing jobs are projected by 2030 (BLS, 2023)
- Hispanic students are 26% of K-12 enrollment but earn fewer than 8% of computing degrees (NSF, 2023)
- Schools serving 75%+ low-income students are 3× less likely to offer CS courses (Code.org, 2024)

### Crisis 2: STEM Writing Gap
- Scientific writing is a documented gateway skill for STEM college readiness (ACT, 2023)
- Low-income students lack access to private writing tutors or specialized STEM writing instruction

## The Intervention

STEM Bridge AI applies large language model (LLM) technology to deliver expert-level, grade-calibrated:
1. **STEM writing feedback** across 5 dimensions (SciWrite AI)
2. **CS coding tutoring** across 6 languages and 3 interaction modes (CodeBridge AI)
3. **Handwritten work and paper tests** read from a phone photo, scored with the writing rubric or marked against a teacher's answer key, with the teacher reviewing the marks (Photo Check)

The software is free, zero-dependency, and deployable in any school environment. AI usage runs on Google Gemini's free tier by default, which has daily limits and is sometimes busy.

**Status:** the platform is built and publicly deployed but has not yet had a classroom pilot, so this document describes the research basis and planned evaluation, not results.

## Evidence Base for AI-Personalized Feedback

| Study | Finding | Relevance |
|---|---|---|
| Hattie & Timperley (2007) | Feedback is among the most powerful influences on learning and achievement, but its effect can be positive or negative depending on how it is given | Motivates timely feedback and CodeBridge AI's hints-first design |
| Black & Wiliam (1998) | Formative feedback improves learning outcomes substantially | Supports real-time AI feedback approach |
| NSF STEM Workforce Report (2023) | Underrepresentation persists at every pipeline stage | Confirms national importance of early intervention |

## Tool-Specific Research Basis

### SciWrite AI — 5-Dimension Rubric
Dimensions derived from:
- **Next Generation Science Standards (NGSS)** — science and engineering practices
- **NAEP Science Writing Framework** — grade-level expectations
- **College Board AP Science Scoring Guidelines** — analytical reasoning standards

| Dimension | Standard Basis |
|---|---|
| Scientific Accuracy | NGSS Science and Engineering Practices (SEP-1, SEP-6) |
| Evidence Use | NGSS Crosscutting Concepts (CCC-7) |
| Clarity | Common Core ELA Science/Technical Subjects |
| Structure | AP Science Lab Report Conventions |
| Reasoning | NGSS SEP-6: Constructing Explanations |

### CodeBridge AI — Grade Calibration
Grade-level calibration derived from:
- **CSTA K-12 CS Framework** — learning progressions by grade band
- **College Board AP CS A / AP CS Principles** — HS-level expectations
- **Scratch curriculum** (MIT Media Lab) — K-5 computational thinking

## Planned Research Outputs (proposed; none started)

### Study 1: SciWrite AI Writing Improvement
- **Design:** Pre/post study comparing STEM writing scores before and after AI feedback
- **Population:** Title I middle school students in partner districts
- **Measures:** 5-dimension rubric scores, teacher holistic ratings
- **Target venue:** a peer-reviewed science-education or computing-education venue

### Study 2: CodeBridge AI Coding Comprehension
- **Design:** Randomized comparison: AI tutor feedback vs. no-feedback control
- **Population:** High school CS students without specialist access
- **Measures:** Code correctness, error resolution rate, self-efficacy survey
- **Target venue:** CSTA conference or a computing-education journal

### Study 3: Equity Impact Analysis
- **Design:** Cross-sectional comparison of learning gains by school income level
- **Hypothesis:** AI feedback closes the feedback gap between high- and low-resource schools
- **Target venue:** *Computers & Education* or *Educational Technology Research and Development*

## National Importance Summary

STEM Bridge AI relates to the following federal priorities:

- **Executive Order *Advancing Artificial Intelligence Education for American Youth* (Apr. 23, 2025):** sets a policy of "the appropriate integration of AI into education" and AI training for educators
- **NSF Dear Colleague Letter 25-036 (Aug. 25, 2025):** supports K-12 AI teams for the Presidential AI Challenge and asks funded teams to plan for engaging regions or localities particularly in need of AI education resources
- **U.S. Dept. of Education, *AI and the Future of Teaching and Learning* (2023):** emphasizes keeping teachers in the loop and attending to equity in educational AI
- **Rural and Title I schools:** a free tool built for restricted school IT environments (no installation, no accounts)

## References

1. Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1), 81–112.
2. Black, P., & Wiliam, D. (1998). Assessment and classroom learning. *Assessment in Education*, 5(1), 7–74.
3. U.S. Department of Education. *Teacher Shortage Areas* (2023–2024 designations).
4. NSF. (2023). *Women, Minorities, and Persons with Disabilities in Science and Engineering*.
5. Code.org. (2024). *State of Computer Science Education Annual Report*.
6. BLS. (2023). *Occupational Outlook Handbook: Computer and Information Technology*.
7. U.S. Dept. of Education. (2023). *Artificial Intelligence and the Future of Teaching and Learning*.
8. Executive Order, *Advancing Artificial Intelligence Education for American Youth*. (Apr. 23, 2025). The White House.
9. NSF Dear Colleague Letter 25-036. (Aug. 25, 2025).
10. NGSS Lead States. (2013). *Next Generation Science Standards: For States, By States*.
11. CSTA. (2017). *K-12 Computer Science Framework*.
