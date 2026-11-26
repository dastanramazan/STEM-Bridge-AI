# Privacy: How STEM Bridge AI Handles Student Data

This page explains what the app does with student information, in plain
language, so teachers and schools can decide whether it fits their
situation. It describes how the software is built; it is **not** legal
advice and **not** a compliance certification (FERPA, COPPA, or any
state student-privacy law). Schools remain responsible for their own
review and for any parental consent they require.

The app has no accounts and no passwords. It collects as little as it can.

## At a glance

*The same summary is shown on the site under **Privacy** in the footer, where it can be printed.*

**For teachers and school administrators.** This is not legal advice and not a FERPA or COPPA certification. Each school decides whether this tool fits its rules.

- **What students enter.** A first name (saved only in their own browser) and their writing, code, or a photo of paper work.
- **Where it goes.** Through your school's own Google Apps Script to Google's Gemini AI, which writes the feedback. This app does not save it. If someone chooses "Use our own AI key", their browser sends it straight to Anthropic or Google.
- **What your school's Google Sheet records.** Name, date and time, tool, grade band, scores, the class code and assignment (if the student joined a class), a random device code, and the name of the AI model. Never the writing, code, photos, or answer keys.
- **What stays on the device.** The name, last scores, a number-only fingerprint used for the progress panel, and a teacher's answer keys and class list. Photos exist only in memory while in use.
- **Accounts.** None for students. Teachers may sign in with Google; their email, name, classes, and assignments are kept in your school's Sheet.
- **The AI provider matters most.** As far as we know, Google's free Gemini tier may use submitted content to improve its products, while paid tiers do not. Check Google's current terms. For real student work, especially photos, use a paid or district-approved key.
- **No ads, analytics, or trackers.** GitHub, which hosts the page, sees ordinary visit logs such as IP addresses.
- **Before using it with students.** Use a paid or district-approved AI key. Get any consent your school requires, especially for students under 13. Photograph only the page: no faces, and cover names. Delete Sheet rows when you no longer need them.
- **Deleting data.** Delete the rows in your Sheet. Clear the browser's site data. For anything an AI provider received, follow that provider's deletion process.

The details follow.


## What is collected and where it goes

| What | Where it goes | Kept? |
|---|---|---|
| **Student name** (typed once on the device) | Saved in that browser (`localStorage`) so it doesn't have to be retyped | Until the browser data is cleared, or someone presses "Not you? Click here" |
| **Usage record** after each completed analysis: date and time, name, tool, short detail (assignment type or language, or a test's name and points), grade band, scores, and, if the student joined a class, the class code and the id of the assignment they started, and the name of the AI model that answered (not personal information) | The teacher's own Google Sheet, through the teacher's own Google Apps Script | Until the teacher deletes the rows. **Never** the writing, code, answers, or photos |
| **Typed writing or code** | Sent to an AI service to be analyzed (see "AI services" below) | Not stored by this app or logged in the Sheet |
| **Live camera view** | Shown on the screen only. The video is not recorded or sent anywhere; only the single frame captured when the student presses Capture is kept, and it is treated as a photo (next row). The camera is switched off when the student is done | Never stored |
| **Photos of paper work or answer keys** | Shrunk and re-encoded in the browser (which also removes location and other metadata), then sent to the AI service to be read | Held in the page's memory only while in use, discarded when cleared, saved, or the page is closed. Never stored by this app or logged |
| **A Word file of the student's feedback** (when the student presses "Save as Word") | Built in the browser and saved to the student's own device. It is never sent anywhere. It contains the feedback, the student's name, and, if the student leaves the box ticked, their own writing or code (or, for a photo, the text the AI read from it). The student chooses where it goes next | Wherever the student saves it |
| **Saved answer keys** (Teacher mode) | Saved only in the teacher's own browser (`localStorage`); never in the Sheet or on any server | Until the teacher deletes them or clears the browser |
| **Scores from the last attempt** (to show progress) a numeric **fingerprint** of the last text (hash numbers of three-word groups, from which the text cannot be read back; used only to tell a revision from a different piece of work), and, for an assignment set to "show the fix after 2 tries", **how many times the student has checked their code** | The same browser (`localStorage`), numbers only; never sent anywhere | Until the browser data is cleared |
| **Feedback form** (optional, for adults) | Answers to five quick questions, an optional comment, and, in the fuller form, the person's name, role, school or organization, state, email (all required, so feedback can be checked; the email is never shown publicly) and what they tried; two tick boxes for quoting the comment without a name and with a name and organization; an optional permission to email them about a short letter; the random device code (to limit repeats), and the app version. It is sent to the STEM Bridge AI project team's own Google Sheet, not to a school's script. The form asks people not to write student names or student work, and students are asked to leave it to their teacher | In the project team's Sheet until they delete it; a note in the browser remembers that feedback was sent today |
| **School connection** | The website remembers a school's Web app address in the browser so it can send a student's name, scores, and requests to that school's own script. Before a student connects through a link, the page asks the school's script who it is (a public reply with the school's name and version) and asks the student to confirm; nothing else is sent before that | In the browser until the user disconnects or clears site data |
| **Teacher accounts** (optional) | A teacher signs in with Google. The school's Apps Script checks Google's sign-in token and stores, in the school's own Google Sheet, the teacher's email and name, the classes and assignments they create (names, instructions, due dates, help level), and class codes. A signed-in teacher can see the usage records of their own classes grouped by assignment (names, tries and scores; never the work itself). Google's sign-in script is loaded only when a teacher opens the Teacher area, so Google sees that visit; students never load it. The sign-in token is held in the page's memory only and is never stored | In the school's Sheet until the school deletes it; the token ends when the page closes |
| **Class membership** (optional) | A student who types a class code or opens a class link is shown the class name and asked to confirm. The school's script answers with the class name and its open assignments (titles, instructions, due dates); it never sends a teacher's email or name or anything about other students. The class code and name are then remembered in that browser | In the browser until the student presses "Leave class", the teacher closes the class, or the browser data is cleared |
| **Device code** | A short random code (like `K7M2`) that each browser makes for itself the first time it logs a result. It is saved in that browser, sent with the usage record, and shown to the teacher next to the name, so a teacher can tell devices apart when anyone can type any name. It is shown to the student in Settings. It is not derived from the person, the IP address, or the device's model or location, and it is a hint rather than proof (a shared computer has one code for everyone, and clearing the browser makes a new one) | In the teacher's Sheet with the usage record; in the student's browser until its data is cleared |
| **Class list** (optional, in the Teacher Dashboard) | The teacher types or pastes student names so the dashboard can flag names that are not on the list | Only in the teacher's own browser; never sent anywhere |
| **Daily-limit counters** | The teacher's Apps Script keeps a count per day for each lowercase name together with the random device code, for each device code, for each class code (only real classes), and for the school | Only in the school's script; old days are deleted automatically |
| **The visitor's own API key**, if they choose to use one | The browser's `sessionStorage`, for that tab only; sent only to that key's AI provider | Gone when the tab closes |

Small settings (like whether the intro banner was seen) are also saved in
the browser. They contain no student information.

## AI services

- **Default connection.** The browser sends the request to the teacher's own
  Google Apps Script, which forwards it to Google's Gemini API using a key
  that only the teacher's script holds. The script does not save what it
  forwards.
- **"Use our own AI key" (Settings).** The browser sends the request directly to
  Anthropic (Claude) or Google (Gemini) with the key the visitor entered.
- Whatever is sent is then governed by that provider's terms. As far as we
  know, Google's **free** Gemini tier may use submitted content to improve its
  products, while paid tiers do not; **check Google's current terms yourself.**
  For real student work, especially photos, use a paid Gemini key or an AI
  provider your school has approved.

## Other services the page contacts

- **GitHub Pages** hosts the page, so GitHub sees ordinary visit logs (such as IP addresses). The page uses only your device's own fonts, so no fonts are downloaded from anywhere else.
- There are no analytics, advertising, or tracking scripts.

## Who can see the usage Sheet

Only whoever the teacher shares it with. The in-app **Teacher Dashboard**
and **Teacher mode** are protected by a PIN that is checked inside the
teacher's script, and repeated wrong guesses lock the PIN for 15 minutes.
Teacher mode is a screen in the page, not strong security: don't leave a
device with saved answer keys unlocked.

## Recommendations for schools

- Get any consent your school or district requires before students use the tool, especially for students under 13.
- Ask students to photograph only the page: no faces, and cover the student's name if possible.
- Use a paid or district-approved AI provider for real student work.
- Delete usage rows from the Sheet when they are no longer needed.

## Deleting data

- **Usage records:** delete the rows in the teacher's Google Sheet.
- **A device's saved name, keys, and last scores:** clear the browser's site data for the app.
- **Anything an AI provider received:** follow that provider's own data-deletion process.

Questions: dastanramazan@gmail.com
