# NMMS Prep

An offline practice app for the NMMS **Mental Ability Test** (Class 8). The questions come from the KSQAAC "Spardha Yashassu" 2022 study material (`NMMS.pdf`).

**All 38 MAT chapters are covered** (537 book questions). 🖼 marks picture chapters, whose figures are cropped from the PDF.

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

- **Every book answer is checked** by an independent rule in `tools/check_<topic>.ts` (`npm run check:content`). The book's keys are incomplete and sometimes wrong. Answers we worked out or corrected are labelled "worked out by us" in the app, with a note saying why.
- **Hidden** questions (`"status": "needs-review"`) have no right option, or more than one, as printed; each has a note. How each chapter was checked, and what was corrected, is in the `source` field of its `app/src/data/mat/<topic>.json` and in its commit message.
- **Every chapter has a generator** that makes unlimited new practice questions. Its test checks, by its own independent method, that exactly one option is right, over 1,000+ questions.

## What's in the app

| Screen | For | What it does |
|---|---|---|
| Home | Everyone | A short list of all 38 chapters, one row each, with a progress bar and a red badge for questions to retry. A "Continue" card at the top opens the last chapter used on this device, and a "Facts to remember" card below it opens the Facts page; a "Shapes and sizes" card opens the Shapes page |
| Chapter | Everyone | Opened from a Home row: the chapter's intro, progress (book questions, accuracy, best test) and its buttons. Learn is highlighted; Practice, Quick test, Classroom and, where there is one, the game follow |
| Facts to remember | Students | Things to learn by heart, in three tabs: the primes up to 100 (a 1–100 grid, the look-alikes 51, 57, 87, 91, and the primes in each ten), squares 1–30 and cubes 1–20, each with tricks. The number chapters' pages and their Learn cheat sheets link to it |
| Shapes and sizes | Students and teachers | Opened from a card on Home. Pick a square, rectangle, triangle or circle, then step through Perimeter (a dot walks round the edge), Area (rows fill up, two triangles make a rectangle, a circle's slices line up into a near-rectangle), Volume (layers stack into a cube, cuboid, triangular prism or cylinder) and Open flat (the solid unfolds into its net). The solids turn in 3D: drag them, use the turn buttons or Spin. Each step shows the formula with the numbers worked in (π = 22/7) |
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

To share the app, send the link, or print a QR code of it for the classroom. Students open it once and tap "Add to Home Screen"; after that it works offline, and updates arrive the next time they open it.

## Content notes (Number Series)


- **Answers the book doesn't give:** the book's answer key covers only Q1–13, Q25 and Q30. The other answers were worked out by hand and checked by `tools/check_number_series.ts`. The app labels each answer "from the book key" or "worked out by us".
- **Repeated questions:** Q15, 16, 17, 19 and 21 repeat earlier questions, so they were dropped.
- **Q22 is hidden** (`status: "needs-review"`). No rule fits the series as printed (4, 4, 9, 29, 111, ?). If 111 is a typo for 119, the answer is C (599). Check it against the original paper, then remove the status.
- **Q29:** the book prints "17, 15, 1.\`2, 8". This is taken to be 12.

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

Every MAT chapter is built. For new material (e.g. SAT), follow the full checklist in `CLAUDE.md` ("Adding a chapter"): book questions, an independent checker, a generator with a test, tips and Kannada. In short:

1. Run `swift tools/extract_pages.swift > nmms.txt` to get the text. Use `swift tools/render_pages.swift <dir> <pages…>` to see figures, fractions and superscripts, which don't survive text extraction.
2. Write `app/src/data/mat/<topic>.json` and `<topic>.meta.json` in the same format as `number-series`.
3. Add the topic to `READY_TOPICS` in `app/src/data/topics.ts` (`UPCOMING_MAT` lists chapters shown as "coming soon"; it is empty now).
4. The pages are shared across topics. `SeriesView` handles number and letter series. Picture questions set `figures` (book crops under `app/public/figures/`, or generated drawings), shown by `components/FigureView.tsx`.
