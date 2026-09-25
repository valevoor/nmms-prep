# NMMS Prep

An offline practice app for the NMMS **Mental Ability Test** (Class 8). The questions come from the KSQAAC "Spardha Yashassu" 2022 study material (`NMMS.pdf`).

**Covered so far:**
- MAT Chapter 17, *Number Series*: 24 checked book questions.
- MAT Chapter 14, *Number Analogy* ("28 : 4 :: 504 : ?"): all 15 book questions, every one confirmed by the book's key.

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

**Theme:** a ☀️ / 🌙 / 🌓 (Light / Dark / Auto) switch at the top of the Home screen. It starts on Light, even on phones set to dark mode. Auto follows the phone's setting. The choice is saved on the device.

Progress is saved on the device (IndexedDB). After the first visit the app works fully offline, and it can be installed with "Add to Home Screen".

## Run it

```bash
cd app
npm install
npm run dev              # development server
npm test                 # generator tests (1,000 questions per pattern and game)
npm run check:content    # checks every book answer (both chapters) against its rule
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

## Adding the next chapter

1. Run `swift tools/extract_pages.swift > nmms.txt` to get the text. Use `swift tools/render_pages.swift <dir> <pages…>` to see figures, fractions and superscripts, which don't survive text extraction.
2. Write `app/src/data/mat/<topic>.json` and `<topic>.meta.json` in the same format as `number-series`.
3. Add the topic to `READY_TOPICS` in `app/src/data/topics.ts`, and remove it from `UPCOMING_MAT`.
4. The pages are shared across topics. `SeriesView` handles number and letter series. Picture-based chapters will need an image field on questions.
