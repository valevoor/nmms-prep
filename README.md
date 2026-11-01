# NMMS Prep

An offline practice app for the NMMS **Mental Ability Test** (Class 8). The questions come from the KSQAAC "Spardha Yashassu" 2022 study material (`NMMS.pdf`).

**All 38 MAT chapters are covered** (537 book questions). 🖼 marks picture chapters, whose figures are cropped from the PDF. Three chapters are not in the book. Chapter 39, **Superimpose Figures**, holds the past-paper questions that put figures one on top of the other, plus a generator for new ones. Chapter 40, **Missing Figures**, holds the past-paper questions with a part of a figure missing, plus a generator. Chapter 41, **Miscellaneous**, holds the past-paper questions that fit no chapter (work / interest / speed sums, odd word out), so it has no book questions and no generator.

| Ch | Topic | Book questions shown | Answer not from the key | Hidden |
|---|---|---|---|---|
| 1 | Analogy of Figures 🖼 | 15 of 15 | – | – |
| 2 | Figure Series 🖼 | 13 of 15 | – | 2 |
| 3 | Hidden Figures 🖼 | 13 of 15 | – | 2 |
| 4 | Similar Figures in Different Position 🖼 | 9 of 11 | 1 | 2 |
| 5 | Intersecting Figures 🖼 | 15 of 15 | – | – |
| 6 | Figure Fold Transparent Sheet 🖼 | 10 of 15 | 1 | 5 |
| 7 | Paper Fold and Punch 🖼 | 14 of 15 | – | 1 |
| 8 | Mirror Image 🖼 | 9 of 15 | – | 6 |
| 9 | Water Image 🖼 | 12 of 15 | – | 3 |
| 10 | Cubes Cutting 🖼 | 13 of 15 | – | 2 |
| 11 | Numbers in Opposite Faces 🖼 | 13 of 15 | – | 2 |
| 12 | Counting of Figures 🖼 | 11 of 15 | 1 | 4 |
| 13 | Cubes Colouring 🖼 | 15 of 15 | 1 | – |
| 14 | Number Analogy | 15 of 15 | – | – |
| 15 | Number Patterns | 14 of 15 | 1 | 1 |
| 16 | Odd One Out: Letters | 14 of 15 | – | 1 |
| 17 | Number Series | 24 of 25 | 9 | 1 |
| 18 | Odd One Out: Numbers | 23 of 25 | – | 2 |
| 19 | Find the Wrong Number | 16 of 16 | – | – |
| 20 | Number Sequence | 19 of 20 | 1 | 1 |
| 21 | Letter Series | 21 of 21 | 3 | – |
| 22 | Letter–Number Analogy | 14 of 15 | – | 1 |
| 23 | Coding–Decoding | 13 of 13 | – | – |
| 24 | Figures and Number Relationship 🖼 | 15 of 15 | – | – |
| 25 | Arithmetical Operations | 15 of 15 | 1 | – |
| 26 | Signs and Symbols | 14 of 15 | 1 | 1 |
| 27 | Number Matrix | 15 of 15 | – | – |
| 28 | Letter Matrix | 15 of 15 | – | – |
| 29 | Numbers and Letters by a Rule | 15 of 15 | – | – |
| 30 | Number and Letter Pyramid | 11 of 15 | 1 | 4 |
| 31 | Directions | 15 of 15 | – | – |
| 32 | Blood Relations | 13 of 15 | 4 | 2 |
| 33 | Venn Diagrams 🖼 | 15 of 15 | – | – |
| 34 | Calendar | 15 of 15 | – | – |
| 35 | Clock | 9 of 11 | 1 | 2 |
| 36 | Arrangement | 12 of 15 | – | 3 |
| 37 | Age Problems | 8 of 8 | – | – |
| 38 | Statements and Decisions | 15 of 15 | 2 | – |
| 39 | Superimpose Figures 🖼 (not in the book) | – (8 past exam questions) | – | – |
| 40 | Missing Figures 🖼 (not in the book) | – (15 past exam questions) | – | 1 |
| 41 | Miscellaneous (not in the book) | – (5 past exam questions) | – | – |

- **Every book answer is checked** by an independent rule in `tools/check_<topic>.ts` (`npm run check:content`). The book's keys are incomplete and sometimes wrong. Answers we worked out or corrected are labelled "worked out by us" in the app, with a note saying why.
- **Hidden** questions (`"status": "needs-review"`) have no right option, or more than one, as printed; each has a note. How each chapter was checked, and what was corrected, is in the `source` field of its `app/src/data/mat/<topic>.json` and in its commit message.
- **Every book chapter has a generator** that makes unlimited new practice questions. Its test checks, by its own independent method, that exactly one option is right, over 1,000+ questions.

## What's in the app

| Screen | For | What it does |
|---|---|---|
| Home | Everyone | A MAT / SAT switch at the top (`#/` and `#/?test=sat`). MAT: a short list of all 38 chapters, Superimpose Figures, Missing Figures and Miscellaneous, one row each, with a progress bar and a red badge for questions to retry. A "Continue" card at the top opens the last chapter used on this device, and a "Facts to remember" card below it opens the Facts page; a "Shapes and sizes" card opens the Shapes page. SAT: the SAT topics by subject (Maths, Science, Social Science), each row showing its textbook chapters ("Class 7 · Ch 11 + Class 8 · Ch 10") and how many past exam questions it has |
| SAT topic | Everyone | `#/sat/<topic-id>`: how many past questions and papers the topic has, a button to its past exam questions (`#/sat/<topic-id>/questions`, shown as printed with their pictures and, in a combined topic, the chapter each comes from), and "Study from the textbook": each chapter's class, number, textbook part and pages, and what it covers. The questions have no answers yet, so SAT chapters have no Practice, Quick test or Classroom yet |
| Chapter | Everyone | Opened from a Home row: the chapter's intro, progress (book questions, accuracy, best test) and its buttons. Learn is highlighted; Practice, Quick test, Classroom and, where there is one, the game follow |
| Facts to remember | Students | Things to learn by heart, in three tabs: the primes up to 100 (a 1–100 grid, the look-alikes 51, 57, 87, 91, and the primes in each ten), squares 1–30 and cubes 1–20, each with tricks. The number chapters' pages and their Learn cheat sheets link to it |
| Shapes and sizes | Students and teachers | Opened from a card on Home. Pick a square, rectangle, triangle or circle, then step through Perimeter (a dot walks round the edge), Area (rows fill up, two triangles make a rectangle, a circle's slices line up into a near-rectangle), Volume (layers stack into a cube, cuboid, triangular prism or cylinder) and Open flat (the solid unfolds into its net). The solids turn in 3D: drag them, use the turn buttons or Spin. Each step shows the formula with the numbers worked in (π = 22/7) |
| Cut the cube | Students and teachers | Opened from the Cubes Cutting chapter page. Pick a 2×2×2 to 5×5×5 cube, a way to cut (left \| right, top / bottom, front · back) and where, then Cut: the two pieces slide apart in 3D with their counts (k × n × n and (n − k) × n × n) and the 2 new faces the knife made, which have no paint. Drag or use the turn buttons to turn it. Drawn as plain SVG (no library); `lib/cubeCut.test.ts` checks the counts, the new faces and the drawing order |
| Fold the dice | Students and teachers | Opened from the Numbers in Opposite Faces chapter page. The book's open dice (Q7, Q9, Q10) or a new one fold into a cube in 3D: slide or tap Fold, drag to turn it, and colour the three opposite pairs. Drawn with CSS 3D (no library); `lib/diceFold.test.ts` checks the folded pairs against the generator's dice-rolling and the book answers |
| Draw and fold | Students and teachers | Opened from the Figure Fold Transparent Sheet chapter page. Draw lines, triangles and rectangles (in four colours, filled or outlined) on a see-through sheet with a grid, pick a fold line (up and down, across, or either slant) and which half folds, then slide or tap Fold to watch that half turn over in 3D and land mirrored. Drag to turn the view while it folds; "Show where the shapes will land" draws the answer dashed first. Drawn with CSS 3D (no library); `lib/sheetFold.test.ts` checks that the 3D turn lands every point on its mirror image and agrees with the chapter generator |
| Fold and punch | Students and teachers | Opened from the Paper Fold and Punch chapter page. Fold a square sheet in half up to three times (up and down, across, or either slant, whichever halves the paper still showing; pick which half turns over) and watch each fold in 3D. Cut circles, triangles, rectangles and line slits at any stage: each cut goes through every layer, and a cut on a fold or an edge is clipped to the paper. Unfold one fold at a time or Open out to see the holes mirrored in each crease, or tick "Show it opened out" to check a guess first. "Turn the paper" lets students drag it round to see the layers; Example loads a twice-folded sheet with a hole, a cut on a fold and a cut at the corner. Drawn with CSS 3D (no library); `lib/punchFold.test.ts` checks the layers, the 3D turn, and that every cut opens out mirrored in every fold, last fold first |
| Try a mirror / Try water | Students and teachers | Opened from the Mirror Image and Water Image chapter pages. **Letters and signs:** type up to 10 keyboard characters (letters, digits, `+ - > ( [ /` …) and see them beside a mirror or above water, with a tile per character saying whether it stays the same, looks like another one (`b` → `d`, `(` → `)`, `M` → `W` in water) or turns round. **Shapes:** place triangles, squares, rectangles and flags (filled or outlined) on a 4×4 grid; tap one again to turn it. `lib/reflect.test.ts` checks the image against the whole board flipped |
| Learn | Students | Tip cards (many with a tap-through picture), step-by-step worked examples, and a cheat sheet where it helps: squares, cubes and primes for the number chapters, the alphabet with each letter's place for the letter chapters, and a relations table for Blood Relations |
| Practice | Students | Book questions, generated "More practice", and a "Mistakes" list to retry. Explanations appear right after each answer |
| Quick test | Students | 15 questions in 15 minutes, with a score, the 40% pass line and a review of every answer |
| Classroom | Teachers | Large type for a projector, a per-question timer, and Reveal/Explain buttons. Keyboard: Space, E, ←/→, T, F |

### Guess the rule

Three chapters have a "🔎 Guess the rule" link on their chapter page. Each game is 10 puzzles, each followed by an explanation, and the app keeps a best score per chapter.

- **Number Series:** see a series and pick which rule it follows.
- **Number Analogy:** see a complete analogy (e.g. 25 : 100 :: 20 : 80) and pick the rule that links both pairs. One wrong option is usually a near miss, such as "Multiply by 5" when the answer is "Multiply by 4".
- **Analogy of Figures:** see a figure and what it turns into, and pick the one change that was made: a turn, a mirror image, one more side, a dot added …

The questions are generated, and every option is checked so that exactly one rule fits.

**Settings on every screen:** Home shows the language and theme switches at the top. Every other screen has an **Aa** button at the top right that opens them, together with EN+ಕ on chapter screens.

**Language:** an EN / ಕನ್ನಡ switch (on Home, in the Aa menu, and at the top of Classroom) changes the whole app, including questions, explanations, tips and the games. English is the default, and the choice is saved on the device. See [Kannada](#kannada) below.

**Both languages at once:** for classes with English-medium and Kannada-medium students together, an **EN+ಕ** button at the top of every chapter screen shows the question, the options, the explanation and the Learn tips in English and Kannada together. The language picked on the EN / ಕನ್ನಡ switch comes first and is used for the buttons. Short options share a line ("North · ಉತ್ತರ"); long ones put the second language underneath. On a wide screen, Classroom shows the two languages as side-by-side columns. Text with no translation, and working that reads the same in both ("3 × 2 = 6"), is shown once. The "Guess the rule" game doesn't use it. The choice is saved on the device.

**Theme:** a ☀️ / 🌙 / 🌓 (Light / Dark / Auto) switch on Home and in the Aa menu. It starts on Light, even on phones set to dark mode. Auto follows the phone's setting. The choice is saved on the device.

Progress is saved on the device (IndexedDB). After the first visit the app works fully offline, and it can be installed with "Add to Home Screen".

## Run it

```bash
cd app
npm install
npm run dev              # development server
npm test                 # generator tests (1,000 questions per pattern and game)
npm run check:content    # checks every book answer against its rule, and that all book content has Kannada
npm run i18n:export      # writes kannada-review.csv (English next to Kannada) for a reviewer
npm run build            # production build in app/dist
npm run preview          # serve the build (to test offline mode)
```

## Live site

**https://valevoor.github.io/nmms-prep/**

Every push to `main` publishes automatically via GitHub Actions (`.github/workflows/deploy.yml`). The workflow runs lint, the tests and the answer checks, then builds and deploys. If any check fails, nothing is published and the live site stays as it was. Progress is shown under the repository's **Actions** tab.

**Visit counts.** The live site counts visits anonymously with [GoatCounter](https://www.goatcounter.com) and [Umami](https://umami.is): no cookies, nothing stored on the phone, no names or logins. Visits made offline aren't counted. GoatCounter is configured in `app/src/lib/analytics.ts`, and Umami via the cloud tracker script in `app/index.html`.

To share the app, send the link, or print a QR code of it for the classroom. Students open it once and tap "Add to Home Screen"; after that it works offline, and updates arrive the next time they open it.

## Content notes (Number Series)


- **Answers the book doesn't give:** the book's answer key covers only Q1–13, Q25 and Q30. The other answers were worked out by hand and checked by `tools/check_number_series.ts`. The app labels each answer "from the book key" or "worked out by us".
- **Repeated questions:** Q15, 16, 17, 19 and 21 repeat earlier questions, so they were dropped.
- **Q22 is hidden** (`status: "needs-review"`). No rule fits the series as printed (4, 4, 9, 29, 111, ?). If 111 is a typo for 119, the answer is C (599). Check it against the original paper, then remove the status.
- **Q29:** the book prints "17, 15, 1.\`2, 8". This is taken to be 12.

## SAT (Scholastic Aptitude Test)

SAT chapters are the 2026-27 Karnataka Class 7 and 8 textbook chapters (Maths, Science, Social Science), as listed in `sat-syllabus/*.md`. A chapter is in the app only if a past SAT paper asked about it: 81 of the 111 chapters.

- **Topics:** the app is mostly for revision and practice, so related chapters are combined into one topic in `app/src/data/sat/groups.json` (for example Light = Class 7 Science Ch 11 + Class 8 Science Ch 10). Every other chapter is a topic on its own, for 59 topics in all. Each subject's list ends with its "Old syllabus" chapters (below). Questions stay filed under their own textbook chapter, so regrouping only means editing that list. A topic page lists each of its chapters with the textbook part and pages, and a chapter ID in the URL opens the topic it belongs to.

- **Questions:** all 540 questions of the six Karnataka SAT papers from 2019-20 to 2025-26 are in `app/src/data/pyq/ka-<year>-sat.json`, transcribed in English from `pyq/`. The 2019-20, 2020-21 and 2022-23 papers have a text layer; the 2023-24 to 2025-26 papers are scans and were read from the page images. Their pictures are cropped into `app/public/figures/pyq/ka-<year>-sat/` with `tools/crop_figures.swift tools/figures/pyq-ka-<year>-sat.json`.
- **Chapters:** each question's `topic` is the syllabus chapter ID it belongs to, using the "map here" rules in the syllabus files. 112 questions are on topics the new textbooks dropped (sound, synthetic fibres, coal and petroleum, crop production, Public Administration, polygons and others). They have `topic: null` and an `oldChapter` from `app/src/data/sat/old-chapters.json` (24 chapters, named after the older syllabus), shown on Home as "Old syllabus – <chapter>" after each subject's textbook topics. A question was moved to a 2026-27 chapter only when that chapter's syllabus clearly teaches what it asks. A question with neither would appear under an "Uncategorized" topic for its subject, which is hidden while empty.
- **Not solved yet:** the papers have no answer key, and no answers have been worked out. Questions have no `answer`, so SAT chapters only show the questions for now. When a question is solved, add `answer` and `keyFrom` (`"book"` for an official key, `"solved"` otherwise). `tools/check_sat.ts` already requires both together.
- **Chapter list:** `app/src/data/sat/chapters.json` is built by `npx tsx ../tools/build_sat_chapters.ts` (run in `app/`) from the syllabus files and the papers. Re-run it after adding a paper or changing a question's chapter. `npm run check:content` runs `tools/check_sat.ts`, which checks the numbering, options, pictures, chapter IDs, groups and Kannada names.
- **Kannada:** chapter names are drafted in `app/src/data/sat/chapters.kn.json` and group names in `groups.json` (`kn`), and the interface text is in `kn.ts`. The questions are English only for now. The Karnataka papers print every question in Kannada too, so use that wording rather than a draft when adding it (the 2019-20 to 2022-23 text layers use the legacy Nudi font, so read the rendered pages).

## Kannada

> **The Kannada text is a first draft and has not been reviewed.** Have a Kannada-speaking teacher check it before students rely on it.

**Where the text lives:**

| Text | File |
|---|---|
| Buttons, headings, labels | `app/src/lib/i18n/en.ts` (source) and `kn.ts`, which has a glossary of fixed terms at the top |
| Book questions (rule, working, note) | `app/src/data/mat/<topic>.kn.json`, keyed by question id. Lines that are pure maths can be left out; they fall back to English |
| Intro and tips | `app/src/data/mat/<topic>.meta.kn.json`, in the same order as the English tips |
| Generated explanations and Guess-the-rule options | `app/src/lib/i18n/gen.ts` |

Numbers stay in Western digits, as in the NMMS papers.

**Checks:**
- The build fails if `kn.ts` is missing any key from `en.ts`.
- `npm run check:content` fails if a book question or tip has no Kannada.
- `npm test` checks that 1,000 generated questions of every kind carry Kannada with no English words left.

**Review workflow:** run `npm run i18n:export`, and send `kannada-review.csv` to the reviewer. It opens in Excel or Google Sheets, and the reviewer writes corrections in the "reviewer comment" column. Copy the corrections into the files above, then remove the draft notes (the `_note` field in the JSON files and the comment at the top of `kn.ts` and `gen.ts`).

**Adding a chapter** also means adding its `.kn.json` and `.meta.kn.json` files and listing the chapter in `app/src/data/chapters.ts`. The app, the coverage check and the export all read that list.

## Adding a chapter

Every MAT chapter is built. For SAT, see "SAT (Scholastic Aptitude Test)" above. For new MAT-style material, follow the full checklist in `CLAUDE.md` ("Adding a chapter"): book questions, an independent checker, a generator with a test, tips and Kannada. In short:

1. Run `swift tools/extract_pages.swift > nmms.txt` to get the text. Use `swift tools/render_pages.swift <dir> <pages…>` to see figures, fractions and superscripts, which don't survive text extraction.
2. Write `app/src/data/mat/<topic>.json` and `<topic>.meta.json` in the same format as `number-series`.
3. Add the topic to `READY_TOPICS` in `app/src/data/topics.ts` (`UPCOMING_MAT` lists chapters shown as "coming soon"; it is empty now).
4. The pages are shared across topics. `SeriesView` handles number and letter series. Picture questions set `figures` (book crops under `app/public/figures/`, or generated drawings), shown by `components/FigureView.tsx`.
