# Research Background — STEM Bridge AI

## Problem Statement

Many U.S. students have little access to computer science teaching or to individual feedback on their work.

### Access to computer science
- Only 60% of U.S. public high schools offered a foundational computer science course in 2024–25 (Code.org and CSforALL, *2025 State of AI + CS Education*)
- In the 42 states that report participation, 6.1% of high school students took a computer science course that year (same report)
- Rural and urban schools, small schools, and schools with a high percentage of students receiving free meals are less likely to offer it (same report)

### Feedback on science writing
- Writing a clear scientific explanation takes practice with feedback
- One teacher with many students cannot give every student detailed comments on every draft

## The Intervention

STEM Bridge AI uses a large language model (LLM) to give grade-calibrated:
1. **STEM writing feedback** across 5 dimensions (Science Writing)
2. **CS coding tutoring** across 6 languages and 3 interaction modes (Coding Helper)
3. **Handwritten work and paper tests** read from a phone photo, scored with the writing rubric or marked against a teacher's answer key, with the teacher reviewing the marks (Photo Check)

The software is free and runs in a web browser with nothing to install. AI usage runs on Google Gemini's free tier by default, which has daily limits and is sometimes busy.

**Status:** the platform is built and publicly deployed but has not yet had a classroom pilot, so this document describes the research basis and planned evaluation, not results.

## Evidence Base for AI-Personalized Feedback

| Study | Finding | Relevance |
|---|---|---|
| Hattie & Timperley (2007) | Feedback is among the most powerful influences on learning and achievement, but its effect can be positive or negative depending on how it is given | Motivates timely feedback and Coding Helper's hints-first design |
| Black & Wiliam (1998) | Formative feedback improves learning outcomes substantially | Supports real-time AI feedback approach |

## Tool-Specific Research Basis

### Science Writing — 5-Dimension Rubric
The five dimensions (Scientific Accuracy, Evidence Use, Clarity, Structure, Reasoning) are the author's own rubric. It is informed by the science and engineering practices of the Next Generation Science Standards (NGSS), such as constructing explanations and arguing from evidence. It has not been validated against teacher scoring; that is part of the planned evaluation.

### Coding Helper — Grade Calibration
Grade-level calibration is informed by the grade bands of the CSTA K-12 Computer Science Framework. It has not been validated.

## Planned Research Outputs (proposed; none started)

### Study 1: Science Writing Writing Improvement
- **Design:** Pre/post study comparing STEM writing scores before and after AI feedback
- **Population:** Title I middle school students in partner districts
- **Measures:** 5-dimension rubric scores, teacher holistic ratings
- **Target venue:** a peer-reviewed science-education or computing-education venue

### Study 2: Coding Helper Coding Comprehension
- **Design:** Randomized comparison: AI tutor feedback vs. no-feedback control
- **Population:** High school CS students without specialist access
- **Measures:** Code correctness, error resolution rate, self-efficacy survey
- **Target venue:** CSTA conference or a computing-education journal

### Study 3: Equity Impact Analysis
- **Design:** Cross-sectional comparison of learning gains by school income level
- **Hypothesis:** AI feedback closes the feedback gap between high- and low-resource schools
- **Target venue:** *Computers & Education* or *Educational Technology Research and Development*

## Related Federal Priorities

STEM Bridge AI relates to the following federal priorities:

- **Executive Order *Advancing Artificial Intelligence Education for American Youth* (Apr. 23, 2025):** sets a policy of "the appropriate integration of AI into education" and AI training for educators
- **NSF Dear Colleague Letter 25-036 (Aug. 25, 2025):** supports K-12 AI teams for the Presidential AI Challenge and asks funded teams to plan for engaging regions or localities particularly in need of AI education resources
- **U.S. Dept. of Education, *AI and the Future of Teaching and Learning* (2023):** emphasizes keeping teachers in the loop and attending to equity in educational AI
- **Rural and Title I schools:** a free tool built for restricted school IT environments (no installation, no accounts)

## References

1. Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1), 81–112.
2. Black, P., & Wiliam, D. (1998). Assessment and classroom learning. *Assessment in Education*, 5(1), 7–74.
3. Code.org and CSforALL. (2025). *2025 State of AI + CS Education*. advocacy.code.org/stateofcs
4. U.S. Dept. of Education. (2023). *Artificial Intelligence and the Future of Teaching and Learning*.
5. Executive Order, *Advancing Artificial Intelligence Education for American Youth*. (Apr. 23, 2025). The White House.
6. NSF Dear Colleague Letter 25-036. (Aug. 25, 2025).
7. NGSS Lead States. (2013). *Next Generation Science Standards: For States, By States*.
8. CSTA. (2017). *K-12 Computer Science Framework*.
