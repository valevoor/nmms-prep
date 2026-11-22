---
name: add-mat-chapter
description: Steps for adding a MAT chapter from NMMS.pdf - extracting and rendering pages, transcribing questions, the answer checker, generator, levels, clues, Kannada and picture figures. Use when building or rebuilding a MAT chapter.
---

# Adding a MAT chapter

1. **Get the text:** `swift tools/extract_pages.swift > nmms.txt` (macOS; nothing to install). The Kannada comes out garbled because it uses a legacy Nudi font; ignore it.
2. **Render the pages and read them:** `swift tools/render_pages.swift <out-dir> <pages…>`. Text extraction loses superscripts (6² becomes "62"), fractions and figures, and it scrambles question numbering.
3. **Transcribe by hand** into `data/mat/<topic>.json`, following the format of the existing chapters. Set `layout` if the chapter isn't a plain series.
4. **Verify every answer.** Write `tools/check_<topic>.ts`, which applies an independent rule to each question and checks that the key's answer fits and no other option does. Add it to `check:content`.
5. **Add a generator** in `lib/generators/`. Practice's "More practice", 5 of the 15 Quick test questions and Classroom's "New questions" all depend on one. Test it to prove exactly one option is correct.
6. Add the chapter to `READY_TOPICS`, remove it from `UPCOMING_MAT`, and add a "Guess the rule" game if the chapter suits one. Give every question a level (`data/levels/<topic>.json`, in `LEVEL_FILES`) and, unless it is a picture chapter solved by eye, clues (`data/clues/<topic>.json` + `.kn.json`, in `CLUE_FILES`); `check:content` fails without the levels.
7. **Kannada:** write `<topic>.kn.json` and `<topic>.meta.kn.json`, and list the chapter in `data/chapters.ts`. The app's Kannada lookup, `tools/check_i18n.ts` and `tools/export_i18n.ts` all read that list.
8. **Book Kannada:** some chapters (e.g. Directions) print proper Kannada in the rendered pages. Use that wording for questions and options instead of drafting; only the text extraction is garbled.
9. **Question layouts:** `series` (default), `analogy`, `odd` (the four options are the question) and `text` (a `prompt` sentence plus an optional `table`, shown by `components/QuestionStem.tsx`). Each generator needs an independent test proving exactly one option is right.
10. **Picture chapters:** crop the figures with `swift tools/crop_figures.swift tools/figures/chNN.json <contact-sheet.png>` (bands or rects in PDF points; `boxed`, `labelsBelow` and `labelsLeft` trim the printed (A)–(D) labels; check the contact sheet by eye), then set `figures` on each question: `terms` (image paths, `'?'` for the blank) and `options`. Pictures can't be solved by code, so solve each by eye and let `tools/figure_check.ts` check the key and the files. Generators draw `Drawing` objects (`components/Drawing.tsx`); their tests compare where the ink goes, not the fields.
