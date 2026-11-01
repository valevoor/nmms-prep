# NMMS Prep

An offline practice app (PWA) for the NMMS **Mental Ability Test**, for Class 8 students (on phones) and teachers (on a classroom projector). The content comes from `NMMS.pdf`, the Karnataka KSQAAC "Spardha Yashassu" 2022 study material. See [README.md](README.md) for what each screen does.

## Scope and product decisions

- **English and Kannada.** An EN / ಕನ್ನಡ switch covers the whole app, and **EN+ಕ** on chapter screens and the Shapes page shows questions, explanations and tips in both at once (`components/Bi.tsx`, `lib/i18n/both.ts`). All the Kannada is an unreviewed draft (see README, "Kannada"). Every new chapter needs `<topic>.kn.json` and `<topic>.meta.kn.json`, and generators build every sentence in both languages (`both()` in `lib/i18n/gen.ts`).
- **MAT is complete:** all 38 chapters are built, each in full (book questions, checker, generator, tips, Kannada) and in its own commit. Don't start on a backend or logins without asking.
- **Superimpose Figures** (chapter 39, `superimpose-figures`) is not in the book either, but past papers ask it: two or three figures put one on top of the other (sometimes one turned first). Like Miscellaneous it has no book questions, so it uses its past-paper questions (`pastOnly`), but it has a generator (`lib/generators/superimpose.ts`).
- **Missing Figures** (chapter 40, `missing-figures`) is the same kind of chapter: a figure with one part blank, to be completed from the options (`pattern: "fig-missing-part"`). Past-paper questions only, plus a generator (`lib/generators/missingPart.ts`).
- **Miscellaneous** (chapter 41, `miscellaneous`) is not in the book: past-paper MAT questions that fit no book chapter go there. It has no book questions and no generator, so Practice, Quick test, Classroom and Learn's worked examples use its past-paper questions instead (`pastOnly` in `data/topics.ts`). A question that fits a book chapter belongs in that chapter, not here.
- **SAT** (`#/sat/<topic-id>`, Home's SAT tab at `#/?test=sat`): the 2026-27 Class 7–8 textbook chapters from `sat-syllabus/*.md` that past papers asked about (81 of 111). For revision, related chapters are combined into topics (`data/sat/groups.json`, 59 topics); each topic page keeps the textbook reference (class, chapter, part, pages) for every chapter in it. All six Karnataka SAT papers (2019-20 to 2025-26) are transcribed in `data/pyq/ka-<year>-sat.json`, each question filed under a syllabus chapter ID (`topic`, or `null` if the new textbooks dropped it; those name an older-syllabus chapter instead, `oldChapter` from `data/sat/old-chapters.json`, shown as "Old syllabus – …" topics). Their Kannada, as printed in each paper, is in `ka-<year>-sat.kn.json` (the 2019-20 and 2020-21 PDFs store it as Nudi text: `tools/extract_nudi.swift` + `tools/nudi.ts`; the scanned papers were typed from the page images). **Only the maths is solved** (119 of 120; 2023-24 Q86 waits for an official key, see its note): each answer has `keyFrom: "solved"` and a `solution` (the syllabus concept, cited by its section in `sat-syllabus/*.md`, then the steps; Kannada in the `.kn.json`), and `tools/check_sat_maths.ts` re-works every answer independently. SAT Practice asks every past question one at a time (MAT has no separate list of past questions either): picking an option on a solved one marks it and shows the solution, and the others are shown as printed. Don't solve the other subjects unless asked. Re-run `tools/build_sat_chapters.ts` after changing papers or topics; `tools/check_sat.ts` is part of `check:content`. Don't read the textbook PDFs in `sat-syllabus/textbooks/` (they are huge); use the syllabus markdown.
- **Shapes and sizes** (`#/shapes/<shape>/<step>`) is a maths visual beside the MAT chapters, not a chapter: perimeter, area, volume and nets of a square, rectangle, triangle and circle, with the solids drawn in 3D as plain SVG (`lib/solids.ts`, no 3D library). Its formulas and numbers live in `data/shapes.ts`, and `lib/solids.test.ts` checks them and each net's area.
- **The theme starts on Light**, even on phones set to dark mode, and has a Light / Dark / Auto switch on Home. Every other page has an **Aa** settings button (`components/SettingsMenu.tsx`) with the language and theme switches. Classroom projectors need light.
- **Home is a compact list** (one row per chapter); each row opens the chapter page, where **Learn is the highlighted (blue) button**. The ← back arrow on Learn/Practice/Test/Classroom/Rule goes to Home.
- **The pass mark is shown simply as 40%**.

## Commands (run in `app/`)

```bash
npm run dev             # dev server
npm test                # vitest: generator and tip-example tests
npm run check:content   # checks every book answer against an independent rule
npm run lint            # oxlint
npm run build           # tsc -b + vite build -> app/dist (includes the service worker)
npm run preview         # serve the build (needed to test offline mode)
```

Before finishing a change, run `npm test`, `npm run check:content`, `npm run lint` and `npm run build`. For UI changes, also check the page in a browser at 360px width in light and dark. There must be no sideways page scroll and no console errors.

## Deployment

- **Live at https://valevoor.github.io/nmms-prep/** (public repo `valevoor/nmms-prep`).
- **Pushing to `main` deploys.** `.github/workflows/deploy.yml` runs lint, tests, `check:content` and build, then publishes `app/dist` to GitHub Pages.
- **Talk slides:** `slides/nmms-exam-overview.md` is a Marp deck. The workflow renders it to `dist/slides/` (live at `/nmms-prep/slides/`), and `navigateFallbackDenylist` in `vite.config.ts` keeps the app's service worker away from it.
- **Before you push:** a push goes live for students within minutes, so run the checks locally first. Only commit or push when the user asks.
- **Asset paths:** `vite.config.ts` uses `base: './'` so the app works under the `/nmms-prep/` path. Keep all asset paths relative.

## Layout

```
NMMS.pdf                        source material
slides/                         talk deck (Marp) + its images, published at /slides/
tools/                          extract_pages.swift, render_pages.swift, check_<topic>.ts
app/src/
  data/topics.ts                READY_TOPICS (one entry per chapter) + UPCOMING_MAT ("coming soon")
  data/facts.ts                 numbers for the Facts page (primes, squares, cubes) + FACT_CHAPTERS (chapters that link to it)
  data/shapes.ts                Shapes page: sizes and worked formulas (perimeter, area, volume, surface area)
  data/sat.ts                   SAT chapters (data/sat/chapters.json, built from sat-syllabus/), topics (data/sat/groups.json) and past papers (data/pyq/*-sat.json)
  data/mat/<topic>.json         book questions;  <topic>.meta.json: intro, tips, worked examples
  data/pyq/<paper>.json         past NMMS papers (+ <paper>.kn.json); listed in data/papers.ts, shown in each chapter's Practice → "Past exams" tab
  lib/generators/               question generators + their tests (1,000+ questions each)
  lib/solids.ts                 3D solids and nets for the Shapes page, turned and drawn as SVG; lib/flatShapes.ts draws its 2D steps
  lib/progress.ts               per-topic progress in IndexedDB (attempts, mistakes, tests, best scores)
  lib/theme.ts                  Light/Dark/Auto; also applied early by an inline script in index.html
  lib/router.ts                 hash routes: #/t/<topic> (chapter page), #/t/<topic>/{learn,practice,test,classroom,rule}, #/facts/{primes,squares,cubes}, #/shapes/<shape>/<step>, #/sat/<id>[/practice]
  components/SeriesView.tsx     shows terms as a series ("1, 4, ?") or analogy ("28 : 4 :: 504 : ?")
  components/tips/              illustrated Learn tips, keyed by `visual` in the meta JSON
  pages/                        Home (MAT / SAT switch, compact chapter lists), Facts, Shapes, Chapter, Learn, Practice, QuickTest, Classroom, GuessRule, SatTopic, SatPractice (its question card is components/SatQuestion.tsx)
```

## Adding a chapter

1. **Get the text:** `swift tools/extract_pages.swift > nmms.txt` (macOS; nothing to install). The Kannada comes out garbled because it uses a legacy Nudi font; ignore it.
2. **Render the pages and read them:** `swift tools/render_pages.swift <out-dir> <pages…>`. Text extraction loses superscripts (6² becomes "62"), fractions and figures, and it scrambles question numbering.
3. **Transcribe by hand** into `data/mat/<topic>.json`, following the format of the existing chapters. Set `layout` if the chapter isn't a plain series.
4. **Verify every answer.** Write `tools/check_<topic>.ts`, which applies an independent rule to each question and checks that the key's answer fits and no other option does. Add it to `check:content`.
5. **Add a generator** in `lib/generators/`. Practice's "More practice", 5 of the 15 Quick test questions and Classroom's "New questions" all depend on one. Test it to prove exactly one option is correct.
6. Add the chapter to `READY_TOPICS`, remove it from `UPCOMING_MAT`, and add a "Guess the rule" game if the chapter suits one.
7. **Kannada:** write `<topic>.kn.json` and `<topic>.meta.kn.json`, and list the chapter in `data/chapters.ts`. The app's Kannada lookup, `tools/check_i18n.ts` and `tools/export_i18n.ts` all read that list.
8. **Book Kannada:** some chapters (e.g. Directions) print proper Kannada in the rendered pages. Use that wording for questions and options instead of drafting; only the text extraction is garbled.
9. **Question layouts:** `series` (default), `analogy`, `odd` (the four options are the question) and `text` (a `prompt` sentence plus an optional `table`, shown by `components/QuestionStem.tsx`). Each generator needs an independent test proving exactly one option is right.
10. **Picture chapters:** crop the figures with `swift tools/crop_figures.swift tools/figures/chNN.json <contact-sheet.png>` (bands or rects in PDF points; `boxed`, `labelsBelow` and `labelsLeft` trim the printed (A)–(D) labels; check the contact sheet by eye), then set `figures` on each question: `terms` (image paths, `'?'` for the blank) and `options`. Pictures can't be solved by code, so solve each by eye and let `tools/figure_check.ts` check the key and the files. Generators draw `Drawing` objects (`components/Drawing.tsx`); their tests compare where the ink goes, not the fields.

## Adding a past paper

The source papers are in `pyq/` (git-ignored), named `<state>-<session>-<part>[-en][-set-x].pdf` like the paper IDs: state `ka`, `rj`, `tn`, `ap`…; session the academic year (`2023-24`), or the printed year when the exam month isn't known (`rj-2018`); part `mat`, `sat` or `mat-sat` for a combined booklet (e.g. `pyq/ka-2023-24-mat.pdf`, `pyq/ap-2019-20-mat-sat-en-set-a.pdf`). Karnataka MAT 2020-21 (`data/pyq/ka-2020-21-mat.json`) is the worked example.

1. **One file per paper**, every question in it, numbered as printed (`paperNo`), each in its chapter's own format with `topic` set to that chapter's id (`"miscellaneous"` if no book chapter fits). Copy the paper's `sections` (directions) too.
2. **Read the rendered pages, not the text:** `swift tools/render_pages.swift` reads only `NMMS.pdf`, so render the paper the same way with its path. Crop figures with a `tools/figures/pyq-<paper>.json` config that sets `"pdf"`, into `app/public/figures/pyq/<paper>/`. Papers are less regular than the book, so give each figure a rect with `"trim": true` (the rect only has to hold the figure; it is trimmed to the ink) and `"erase"` any QR code printed against a figure.
3. **Answers:** the papers have no key, so every answer is `keyFrom: "solved"` until an official key is found. Write `tools/check_pyq_<paper>.ts` (helpers in `tools/pyq_check_lib.ts`) with an independent rule for every question (exactly one option must fit; pictures solved by eye are listed there), and add it to `check:content`. `tools/check_pyq.ts` checks the papers' numbering and chapters.
4. **Kannada:** `<paper>.kn.json`, using the paper's printed Kannada for questions and options; list the paper in `data/papers.ts`.
5. Doubtful questions get `"status": "needs-review"` with a `note`, as for the book.

## Content rules

- **The book's answer keys are incomplete and sometimes wrong** (numbering drifts, typos). Never trust a key without checking it.
- **`keyFrom`:** set `"book"` when the answer is from the book's key, and `"solved"` when we worked it out. The app shows which one to students.
- **Odd one out:** if another obvious property (prime, square…) makes a *different* option the odd one, the question has two answers. Mark it `needs-review` with a note, as for Ch 18 Q2 and Q22. A difference that is only odd/even doesn't count.
- **Unclear questions:** if a question can't be resolved, set `"status": "needs-review"` with a `note`. It is hidden from students. Number Series Q22 is in this state, pending a check against the original paper. Don't guess a fix.
- **Duplicate questions** in the book are dropped.
- **Generators must never produce two correct options.** For "Guess the rule", every wrong option is checked against the series or pair (see `fitsPattern` and `fitsAnalogy`), and questions that two rules could explain are skipped.

## Code conventions

- **Question data:** keep content in JSON or TypeScript data files, not inside components. Questions of every kind share the `Question` type in `types.ts` (`kind`: missing / rule / wrong; `layout`: series / analogy).
- **Styles:** all colours are CSS variables in `index.css`. The dark theme is `:root[data-theme='dark']`, so new styles must use the variables and look right in both themes.
- **MAT and SAT screens match:** each SAT screen has a MAT counterpart (Home's two tabs: `ChapterRow` ↔ `SatRow`; `Chapter` ↔ `SatTopic`; `Practice` + `QuestionStem` + `Options` ↔ `SatPractice` + `SatQuestion`). Make a UI change on both sides, reusing the MAT classes and components rather than adding `sat-*` copies. `app/src/parity.test.tsx` renders both sides and fails on any class used on only one side unless it is listed there with a reason; a reason starting "Drift:" is a known difference to remove. A Claude Code hook (`.claude/settings.json` → `tools/ui_pair_hint.mjs`) names the counterpart after each edit to a paired file. A new SAT screen gets a pair in the test.
- **Phones first:** tap targets of at least 44–48px, text sized for Class 8 readers, and screen-reader labels on icon-only controls.
- **Offline:** everything must work offline after the first visit, so don't load anything from the network at runtime (no CDN fonts or remote APIs).
- **Visit counts:** the one exception is `lib/analytics.ts`, a fire-and-forget GoatCounter ping per page (no cookies, no personal data, live site only). Nothing may wait on it, and it must fail silently offline. Don't add other trackers.
