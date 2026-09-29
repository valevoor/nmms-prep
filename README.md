# NMMS Prep

An offline practice app for the NMMS **Mental Ability Test** (Class 8). The questions come from the KSQAAC "Spardha Yashassu" 2022 study material (`NMMS.pdf`).

**Covered so far:**
- MAT Chapter 17, *Number Series*: 24 checked book questions.
- MAT Chapter 14, *Number Analogy* ("28 : 4 :: 504 : ?"): all 15 book questions, every one confirmed by the book's key.
- MAT Chapter 21, *Letter Series* ("K, M, P, T, Y, ?"): all 21 book questions. The book's key is wrong on Q15, Q18 and Q20, so those answers are worked out by us and each has a note explaining why.
- MAT Chapter 19, *Find the Wrong Number* ("35, 39, 48, 64, 89, 115"): all 16 book questions, every one confirmed by the book's analysis. The explanation shows the series with the right number put back.
- MAT Chapter 18, *Odd One Out: Numbers* ("363, 462, 584, 792"): 23 of the 25 book questions. Q2 and Q22 are hidden (`needs-review`) because each has two defensible answers; the notes explain both. The generator rejects any set where a simple property (odd/even, prime, square, divisible by 3, 5 or 11…) would point to a different option.
- MAT Chapter 23, *Coding–Decoding* ("HOME is coded as IQPI. How is STEM coded?"): all 13 book questions, including the two code-table puzzles. Two book typos are corrected, each with a note (Q5's code YENKNOM, Q7's option "2O15…"). The generator covers the chapter's seven codes and rejects any example that two codes could explain.
- MAT Chapter 31, *Directions*: all 15 book questions, with the book's own Kannada wording for the questions and options. Explanations draw the walk or the map (`components/MapDiagram.tsx`). The generator makes walks, distances, turns, rotated compasses and town maps.
- MAT Chapter 32, *Blood Relations*: 13 of the 15 book questions. The key is wrong on Q1, Q4, Q5 and Q9 (each corrected with a note), and Q3 and Q11 are hidden because none of their options is right. Explanations draw a family tree (`components/FamilyTreeView.tsx`), and Learn has a table of relation names in both languages.
- MAT Chapter 34, *Calendar*: all 15 book questions, each checked against the real calendar (`tools/check_calendar.ts`). The generator covers days after N days, weekdays in a month or year, counting days between dates, and weeks to days.
- MAT Chapter 35, *Clock*: 9 of the 11 book questions, checked from the hand positions (`tools/check_clock.ts`). The key is wrong on Q2 (corrected); Q3 (water image) and Q4 (mirror image) are hidden because no option is right. Explanations draw the clock face (`components/ClockFace.tsx`).
- MAT Chapter 16, *Odd One Out: Letters*: 14 of the 15 book questions. Q4 is hidden because ABA (the only palindrome) is as good an answer as the key's ABD.
- MAT Chapter 20, *Number Sequence* (counting places that fit a rule): 19 of the 20 book questions, each recounted by `tools/check_number_sequence.ts`. The key misses a pair in Q15 (corrected); Q7 is hidden because the true count (9) is not an option.
- MAT Chapter 15, *Number Patterns* (shapes of numbers in a table, shifted or flipped): 14 of the 15 book questions, each re-solved on its table by `tools/check_number_patterns.ts` (a plain shift is preferred to a flip, as in the book). Several printed typos are corrected with a note; Q9's two keys (C and D) are both wrong, so the solved answer A is used; Q15 is hidden because the right answer is not an option.
- MAT Chapter 22, *Letter–Number Analogy* (letters turned into numbers or other letters by a rule): 14 of the 15 book questions, each rule re-applied by `tools/check_letter_number_analogy.ts`. Q5 is hidden: the book prints only options A and B, and the key's answer C (HLCPERTOIE) is missing.
- MAT Chapter 1, *Analogy of Figures*: all 15 book questions, shown as pictures cropped from the PDF (`tools/crop_figures.swift`, rects in `tools/figures/ch01.json`). Each was solved by eye and agrees with the key; `tools/check_analogy_of_figures.ts` checks the key, that every picture exists and that the four options differ. Notes explain Q7 (every option prints the oval filled), Q12 (D is the best option but not a perfect one) and Q15 (C and D differ only in a line's slant). The generator draws its own SVG puzzles (turns, mirror images, one more side, fill swaps, inside/outside swaps, one more dot).
- MAT Chapter 2, *Figure Series*: 13 of the 15 book questions, cropped the same way (`tools/figures/ch02.json`) and checked by `tools/check_figure_series.ts`. Q8 is hidden because options C and D are the same shape; Q11 is hidden because its circles (4, 3, 3) fit two options. Q4 carries a note: its answer rests on the book's explanation of the small circles. The generator draws series that turn, move shading or a mark round, add dots or sides, or turn and swap fill.
- MAT Chapter 25, *Arithmetical Operations* (fill in, decode or swap the signs of an equation): all 15 book questions, each option put into the equation and worked out by `tools/check_arithmetical_operations.ts` (random values for the letters in Q3 and Q9). The key is wrong on Q13 (corrected: swapping 9 and 11 gives −67, not −77); Q7's key prints no letter; Q12's equation is already true as printed, and a note says so. The generator makes all five kinds: fill in the signs, coded signs, changed meanings (with a trap option that is true when read normally), and swapping two signs or two numbers.
- MAT Chapter 26, *Signs and Symbols* (put +, −, ×, ÷ and =, < or > between numbers, or swap two signs or numbers): 14 of the 15 book questions, each checked by `tools/check_signs_symbols.ts`, which tries every reading of a swap. The key's numbering drifts (it has an extra entry for a question that isn't printed, so key 6 is Q5 … key 15 is Q14). Q13 is hidden because two swaps work (× and ÷, and 4 and 6); Q15 has no key and is worked out.
- MAT Chapter 3, *Hidden Figures* (which option hides the given figure): 13 of the 15 book questions, cropped with `tools/figures/ch03.json` and checked by `tools/check_hidden_figures.ts`; all 13 agree with the book's key. Q11 and Q13 are hidden because option B holds a near-copy of the figure and the scan is too rough to tell which option is exact. The generator hides a small figure of straight lines, the same size and way up, in exactly one of four tangles of lines on a grid, and its test searches every tangle for copies.
- MAT Chapter 4, *Similar Figures in Different Position* (which option is the given figure, only turned): 9 of the 11 book questions (the key lists 15 answers, but the chapter prints 11), cropped with `tools/figures/ch04.json` and checked by `tools/check_similar_figures.ts`. The key is wrong on Q4 (corrected to B: in C the two shaded gaps flank a black point, not a white one). Q5 is hidden because the scan's arrowheads are too blurred to tell B from D; Q7 is hidden because B and D are the same bat turned slightly differently. Q11's answer D is drawn unturned, and a note says so. The generator turns a figure of small shapes a quarter or half turn; the wrong options are its mirror image or have one part changed, and its test checks every turn of every option.
- MAT Chapter 5, *Intersecting Figures* (overlapping shapes stand for groups, with a number in each part): all 15 book questions on five diagrams, cropped with `tools/figures/ch05.json`. `tools/check_intersecting_figures.ts` types in each diagram's parts and the shapes each lies inside, works out every count and checks that exactly one option matches; all 15 agree with the book's key. The question is shown as the diagram with a sentence under it (`text` layout with `figures`). The generator draws a circle, a rectangle and a triangle overlapping in one of eight arrangements, with a different number in each of the 7 parts, and asks for a group's total, one group only, two groups, all three, one group but not another, or two but not the third; its test reads each number's position against the drawn outlines.

Each chapter also has a generator that makes unlimited new practice questions.

## What's in the app

| Screen | For | What it does |
|---|---|---|
| Learn | Students | Tip cards, step-by-step worked examples, and a cheat sheet of squares, cubes and primes |
| Practice | Students | Book questions, generated "More practice", and a "Mistakes" list to retry. Explanations appear right after each answer |
| Quick test | Students | 15 questions in 15 minutes, with a score, the 40% pass line and a review of every answer |
| Classroom | Teachers | Large type for a projector, a per-question timer, and Reveal/Explain buttons. Keyboard: Space, E, ←/→, T, F |

### Guess the rule

Both chapters have a "🔎 Guess the rule" link on their card. Each game is 10 puzzles, each followed by an explanation, and the app keeps a best score per chapter.

- **Number Series:** see a series and pick which rule it follows.
- **Number Analogy:** see a complete analogy (e.g. 25 : 100 :: 20 : 80) and pick the rule that links both pairs. One wrong option is usually a near miss, such as "Multiply by 5" when the answer is "Multiply by 4".

The questions are generated, and every option is checked so that exactly one rule fits.

**Language:** an EN / ಕನ್ನಡ switch at the top of the Home and Classroom screens changes the whole app, including questions, explanations, tips and the games. English is the default, and the choice is saved on the device. See [Kannada](#kannada) below.

**Theme:** a ☀️ / 🌙 / 🌓 (Light / Dark / Auto) switch at the top of the Home screen. It starts on Light, even on phones set to dark mode. Auto follows the phone's setting. The choice is saved on the device.

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

## Content notes

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

## Adding the next chapter

1. Run `swift tools/extract_pages.swift > nmms.txt` to get the text. Use `swift tools/render_pages.swift <dir> <pages…>` to see figures, fractions and superscripts, which don't survive text extraction.
2. Write `app/src/data/mat/<topic>.json` and `<topic>.meta.json` in the same format as `number-series`.
3. Add the topic to `READY_TOPICS` in `app/src/data/topics.ts`, and remove it from `UPCOMING_MAT`.
4. The pages are shared across topics. `SeriesView` handles number and letter series. Picture questions set `figures` (book crops under `app/public/figures/`, or generated drawings), shown by `components/FigureView.tsx`.
