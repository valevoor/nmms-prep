---
name: book-review
description: Check the answers in a question source (a study book such as NMMS.pdf, or a past question paper in pyq/) and produce an errata report for its authors or publisher, as a web page and an A4 PDF. Use when the user asks to fact-check or verify a book or paper, find wrong answer keys, misprints or questions with no single answer, write up such findings for the people who made it, or refresh or re-send an earlier report.
---

# Book review

The report lists every place where a source's answer key is wrong, a question has no single right answer, the key gives no answer, or the text has a misprint. It is written for the people who made the source, so it reads as a report to them: no app internals ("hidden", "used here", file names), plain English, and their own page and question numbers.

Each source has a folder `sources/<id>/` with a `source.json` (what it is, who the report is for, where its questions and key are), an optional `keys.json` (the printed key) and an optional `findings.json` (findings the app data doesn't give). [references/sources.md](references/sources.md) describes the three files; `sources/nmms-ksqaac-2022/` is a complete example.

The app's checked data is the source of truth: a finding goes into the data, or into the source's `findings.json`, and the report is rebuilt from them. From the data, a question gives a finding when it has `keyFrom: "solved"` against a printed key (wrong key), `status: "needs-review"` or a note without an answer (no single answer), or a note alone (misprint).

Everything runs from the project root, on macOS with nothing to install (Chrome prints the PDF).

## Steps

**1. Set up the source.** Reuse `sources/<id>/` if it exists. Otherwise create `source.json` by following the reference, with one section per part of the report. If the source prints a key table, read it:

```bash
python3 .claude/skills/book-review/scripts/read_keys.py <id> maths=296 social=268      # name=PDF page(s)
```

Find the key pages with `swift .claude/skills/book-review/scripts/pdf_pages.swift text <pdf> | grep -n "KEY"`. Check one or two answers against the page image.

**2. Find what is still unchecked.** A question is checked once it is in the app data and its section's checker passes (`npm run check:content` runs them all). Compare the data with each section's `checked` count. A source with no app data at all is checked entirely by hand in step 3.

**3. Check each unchecked question against its rendered page,** never against extracted text alone: text extraction loses powers, fractions, roots and figures, and it scrambles question numbers.

```bash
swift .claude/skills/book-review/scripts/pdf_pages.swift png <pdf> <out-dir> 269-275
```

- **Work every answer out again, independently of the key.** A key is wrong only when the working shows it.
- **When the printed question can't give any option** (a lost index, a missing length, a figure that doesn't match its text), say what the printed text gives and what reading the key needs.
- **Facts:** check them against the syllabus or textbook the source is based on (`sat-syllabus/*.md`, and the `textbook-extract` skill for the textbook itself). If the key matches the textbook but the textbook is wrong, say both.
- **Two right options, or none,** means "no single answer". Name each option that fits, and why.
- **Assertion–reason:** a true R that doesn't explain A means "both true, not the explanation". Read each question's own option order, since sources differ.
- **Other language versions:** compare them wherever the English is odd. A key sometimes fits only the translation.
- **Repeats:** note any question printed twice, and any repeat whose keys disagree.

**4. Record each finding.** If the section is being imported into the app, put it in the data, where the section's checker must pass. Otherwise add it to `sources/<id>/findings.json`, with `"pending": true` if the finding may later be recorded in the app data. Write each `text` for the report's audience: what is wrong, then the working, in plain sentences, citing the source against itself where possible (its own working, diagram or another question's key).

**5. Build the report.**

```bash
python3 .claude/skills/book-review/scripts/collect.py <id>    # → .book-review/<id>/findings.json, counts, warnings
python3 .claude/skills/book-review/scripts/report.py <id>     # → answer-check.html and the PDF
```

Fix every warning first. "keyFrom book but … not the printed key" means the data mislabels an answer. "No book key" means a note doesn't name the key it corrects. "Pending entries … now have a finding in the app data" means you should delete those entries.

Read the findings once for wording meant for students or for the app (`clean()` in `collect.py` rewrites the common phrases; add a `replace` entry for the rest).

**6. Look at the PDF.** Render two or three pages with `pdf_pages.swift png` and read them: symbols and non-Latin scripts should print, and every page should have its footer.

**7. Publish.** Publish `.book-review/<id>/answer-check.html` with the Artifact tool. If this source already has a report, update that artifact (pass its `url`) so the shared link keeps working. Tell the user:
- a private artifact must be shared from its Share menu;
- where the PDF is, and to copy it out of `.book-review/` (git-ignored) before sending;
- which findings are judgement calls they should read first: the `debatable` ones and any checked only by eye.
