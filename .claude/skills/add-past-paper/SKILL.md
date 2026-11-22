---
name: add-past-paper
description: Steps for transcribing a past NMMS question paper into data/pyq - file naming, rendering and cropping figures, solving and checking every answer, and its Kannada. Use when adding or fixing a past paper.
---

# Adding a past paper

The source papers are in `question-papers/pyq/` (committed, next to the model papers in `question-papers/model-question-papers/`), named `<state>-<session>-<part>[-en][-set-x].pdf` like the paper IDs: state `ka`, `rj`, `tn`, `ap`…; session the academic year (`2023-24`), or the printed year when the exam month isn't known (`rj-2018`); part `mat`, `sat` or `mat-sat` for a combined booklet (e.g. `question-papers/pyq/ka-2023-24-mat.pdf`, `question-papers/pyq/ap-2019-20-mat-sat-en-set-a.pdf`). Karnataka MAT 2020-21 (`data/pyq/ka-2020-21-mat.json`) is the worked example.

1. **One file per paper**, every question in it, numbered as printed (`paperNo`), each in its chapter's own format with `topic` set to that chapter's id (`"miscellaneous"` if no book chapter fits). Copy the paper's `sections` (directions) too.
2. **Read the rendered pages, not the text:** `swift tools/render_pages.swift` reads only `NMMS.pdf`, so render the paper the same way with its path. Crop figures with a `tools/figures/pyq-<paper>.json` config that sets `"pdf"`, into `app/public/figures/pyq/<paper>/`. Papers are less regular than the book, so give each figure a rect with `"trim": true` (the rect only has to hold the figure; it is trimmed to the ink) and `"erase"` any QR code printed against a figure.
3. **Answers:** the papers have no key, so every answer is `keyFrom: "solved"` until an official key is found. Write `tools/check_pyq_<paper>.ts` (helpers in `tools/pyq_check_lib.ts`) with an independent rule for every question (exactly one option must fit; pictures solved by eye are listed there), and add it to `check:content`. `tools/check_pyq.ts` checks the papers' numbering and chapters.
4. **Kannada:** `<paper>.kn.json`, using the paper's printed Kannada for questions and options; list the paper in `data/papers.ts`.
5. Doubtful questions get `"status": "needs-review"` with a `note`, as for the book.
