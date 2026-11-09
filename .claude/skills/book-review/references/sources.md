# Source files

Each book or paper under review is a folder `sources/<id>/`. Name it like the project's paper IDs: `<publisher-or-state>-<year>[-<part>]`, e.g. `nmms-ksqaac-2022` (the study book), `ka-2023-24-mat` (a past paper). `sources/nmms-ksqaac-2022/` is the worked example.

## source.json

```json
{
 "title": "KSQAAC Spardha Yashassu NMMS Study Material 2022",
 "reportTitle": "Spardha Yashassu Answer Check",
 "heading": "Answer check of the NMMS study material",
 "audience": "the book's authors at KSQAAC",
 "pdf": "NMMS.pdf",
 "keyPdf": "pyq/ka-2023-24-mat-key.pdf",
 "pageOffset": 9,
 "pdfFile": "Spardha-Yashassu-Answer-Check.pdf",
 "intro": "We checked every answer in the book …",
 "method": [["SAT maths.", "Every question was worked out again from the printed page, including the figures."]],
 "footer": "Prepared by …",
 "sections": [ … ]
}
```

- `title` names the source in the report's eyebrow and footer; `reportTitle` is the page's tab and gallery name (two to four words); `heading` is the big heading.
- `audience` is who the report is written for. Write `intro`, `method` and `footer` for them.
- `pdf` is the source, relative to the project root. `keyPdf` is only for a key published as a separate file.
- `pageOffset` is printed page = PDF page − offset. Leave it out (0) when the PDF has no printed page numbers, as with most question papers; the report then shows the PDF page alone.
- `method` is one `[bold lead, sentence]` pair per section, saying how its answers were checked. The report adds the page-number line itself.

## sections

One entry per part of the report (a subject, a test, a paper):

```json
{"name": "SAT Maths",
 "files": ["app/src/data/sat/book.json"],
 "where": {"subject": ["maths"]},
 "number": "paperNo",
 "checked": 152,
 "chapter": {"field": "subject", "names": {"maths": "Maths"}},
 "key": {"from": "printed", "by": "subject"}}
```

- `files`: globs from the project root; `.kn.json` and `.meta.json` files are skipped.
- `where`: keep only questions whose field has one of these values.
- `number`: the field with the printed question number (`bookNo` in the book's MAT chapters, `paperNo` elsewhere).
- `checked`: how many questions the section has in the source, including any the app dropped (repeats). It is the report's "Questions checked".
- `chapter`: how findings are grouped. `{"field": "topic", "names": {…}}` reads a field (from the question, or else the file) and maps it to a display name; `{"fixed": "Paper 1"}` puts everything in one group. A name starting with a number ("Ch 17 · …", "4 · Quadrilaterals") sorts by that number; others keep the order they first appear in.
- `key`, where the printed key comes from:
  - `{"from": "printed", "by": "subject"}`: `keys.json`, picked by that field's value (leave `by` out to use the key named `all`).
  - `{"from": "note"}`: the question's note names the key it corrects ("The book's key says B …"). Use this when the key is scattered through solution pages.
  - `{"from": "none"}`: the source has no key, so worked answers are not findings. Only `needs-review` questions and notes are reported.

## keys.json

Written by `scripts/read_keys.py`: `{"<name>": {"pdfPage": "296", "keys": "DCBCD…"}}`, one letter per question from Q1. Check one or two answers against the page image after reading.

## findings.json

Findings the app data doesn't give, as `{"findings": [ … ]}`:

```json
{"section": "SAT Maths", "chapter": "4 · Quadrilaterals", "q": 69, "pdf": 280, "cat": "wrong",
 "book": "C", "correct": "D", "text": "Exterior : interior = 1 : 5 …, option D.", "pending": true}
```

- `cat`: `wrong`, `unclear` (no single answer, or can't be read), `missing` (no key), `debatable` (the key can be defended but another option fits better), `misprint` (the key stands).
- `book` and `correct`: option letters, `—` for none, or `"B or C"`. `q` can be a list such as `"104, 137"` for a repeated question. `pdf` is the PDF page; the printed page is worked out from `pageOffset`.
- With no flag, the entry is added as it is.
- `"pending": true` means the app data has no finding for that question yet (it isn't imported, or was imported without a note). The entry is used until the data has its own finding, and the collector then asks for it to be deleted.
- `"replace": true` swaps the finding the data gives for that section, chapter and question for this wording, for example when the app's note is written for students.
- `"skip": true` (with a `why`) drops the data's finding for that question: a note that only explains an answer and says nothing is wrong with the source.
