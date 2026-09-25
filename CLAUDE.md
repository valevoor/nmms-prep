# NMMS Prep

An offline practice app (PWA) for the NMMS **Mental Ability Test**, for Class 8 students (on phones) and teachers (on a classroom projector). The content comes from `NMMS.pdf`, the Karnataka KSQAAC "Spardha Yashassu" 2022 study material. See [README.md](README.md) for what each screen does.

## Scope and product decisions

- **English only.** The PDF is bilingual, but the app uses only the English text.
- **MAT only, one chapter at a time.** Done so far: Ch 17 Number Series and Ch 14 Number Analogy. Don't start on SAT, a backend or logins without asking.
- **No story or narrative modes.** A detective-story mode was built and then removed because the user didn't like it. Short puzzle games like "Guess the rule" are what the user wants.
- **The theme starts on Light**, even on phones set to dark mode, and has a Light / Dark / Auto switch on Home. Classroom projectors need light.
- **Learn is the highlighted (blue) button** on each topic card.
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

## Layout

```
NMMS.pdf                        source material
tools/                          extract_pages.swift, render_pages.swift, check_<topic>.ts
app/src/
  data/topics.ts                READY_TOPICS (one entry per chapter) + UPCOMING_MAT ("coming soon")
  data/mat/<topic>.json         book questions;  <topic>.meta.json: intro, tips, worked examples
  lib/generators/               question generators + their tests (1,000+ questions each)
  lib/progress.ts               per-topic progress in IndexedDB (attempts, mistakes, tests, best scores)
  lib/theme.ts                  Light/Dark/Auto; also applied early by an inline script in index.html
  lib/router.ts                 hash routes: #/t/<topic>/{learn,practice,test,classroom,rule}
  components/SeriesView.tsx     shows terms as a series ("1, 4, ?") or analogy ("28 : 4 :: 504 : ?")
  components/tips/              illustrated Learn tips, keyed by `visual` in the meta JSON
  pages/                        Home, Learn, Practice, QuickTest, Classroom, GuessRule
```

## Adding a chapter

1. **Get the text:** `swift tools/extract_pages.swift > nmms.txt` (macOS; nothing to install). The Kannada comes out garbled because it uses a legacy Nudi font; ignore it.
2. **Render the pages and read them:** `swift tools/render_pages.swift <out-dir> <pages…>`. Text extraction loses superscripts (6² becomes "62"), fractions and figures, and it scrambles question numbering.
3. **Transcribe by hand** into `data/mat/<topic>.json`, following the format of the existing chapters. Set `layout` if the chapter isn't a plain series.
4. **Verify every answer.** Write `tools/check_<topic>.ts`, which applies an independent rule to each question and checks that the key's answer fits and no other option does. Add it to `check:content`.
5. **Add a generator** in `lib/generators/`. Practice's "More practice", 5 of the 15 Quick test questions and Classroom's "New questions" all depend on one. Test it to prove exactly one option is correct.
6. Add the chapter to `READY_TOPICS`, remove it from `UPCOMING_MAT`, and add a "Guess the rule" game if the chapter suits one.

## Content rules

- **The book's answer keys are incomplete and sometimes wrong** (numbering drifts, typos). Never trust a key without checking it.
- **`keyFrom`:** set `"book"` when the answer is from the book's key, and `"solved"` when we worked it out. The app shows which one to students.
- **Unclear questions:** if a question can't be resolved, set `"status": "needs-review"` with a `note`. It is hidden from students. Number Series Q22 is in this state, pending a check against the original paper. Don't guess a fix.
- **Duplicate questions** in the book are dropped.
- **Generators must never produce two correct options.** For "Guess the rule", every wrong option is checked against the series or pair (see `fitsPattern` and `fitsAnalogy`), and questions that two rules could explain are skipped.

## Code conventions

- **Question data:** keep content in JSON or TypeScript data files, not inside components. Questions of every kind share the `Question` type in `types.ts` (`kind`: missing / rule / wrong; `layout`: series / analogy).
- **Styles:** all colours are CSS variables in `index.css`. The dark theme is `:root[data-theme='dark']`, so new styles must use the variables and look right in both themes.
- **Phones first:** tap targets of at least 44–48px, text sized for Class 8 readers, and screen-reader labels on icon-only controls.
- **Offline:** everything must work offline after the first visit, so don't load anything from the network at runtime (no CDN fonts or remote APIs).
