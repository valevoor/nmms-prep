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
4. The pages are shared across topics. `SeriesView` handles number and letter series. Picture-based chapters will need an image field on questions.
