---
name: textbook-extract
description: Get accurate content out of the large textbook PDFs in sat-syllabus/textbooks/ (many pages are scans with no usable text). Use whenever a task needs what a textbook actually says, such as writing or checking a SAT revision sheet, finding which book page covers something, confirming a formula or definition, or adding SAT science or social science revision. Use it even if the user just says "check the book" or "go through the textbook".
---

# Textbook extract

These PDFs are huge and many pages are images, so text tools alone mislead you. Survey the book, build searchable text, use it to find pages, then read the pages that matter as images. For this project's revision sheets, also read [references/revision-sheets.md](references/revision-sheets.md).

Works on macOS with nothing to install. Run everything from the project root. Build the tool once:

```bash
mkdir -p .textbook-cache && swiftc -O -o .textbook-cache/textbook .claude/skills/textbook-extract/scripts/textbook.swift
```

## Steps

**1. Survey the book.** One sample page proves little, because books are mixed: Class 8 Maths Part 1 has real text on only 131 of 200 pages.

```bash
.textbook-cache/textbook survey "sat-syllabus/textbooks/8th English Maths Part 1 2026-27.pdf"
```

Note the offset (book page = PDF page − offset). It differs between books, so don't reuse one. If few sampled pages agree, read one page by eye to confirm it.

**2. Run OCR in the background.** A whole book takes minutes, and it picks up where it stopped if re-run. Use `--from` and `--to` (PDF pages) if you need only one chapter.

```bash
.textbook-cache/textbook ocr "<pdf>"
```

**3. Find the pages.**

```bash
.textbook-cache/textbook find "<pdf>" "hypotenuse|right triangle" --offset 2 --from 33 --to 54
```

With `--offset`, `--from`, `--to` and the output are all book pages. The chapter's page range is in `sat-syllabus/*.md`.

**4. Read the pages that matter as images.** Start with the chapter's summary page, then the pages that state formulas, definitions or numbers.

```bash
.textbook-cache/textbook render "<pdf>" <scratch-dir> --offset 2 87 88
```

Then open each PNG with the Read tool. Images cost context, so choose pages using `find` rather than rendering a whole chapter.

**5. Say how each thing was checked.** Keep a note per chapter of which pages were read as images, and what came only from OCR or the syllabus notes. Report that plainly, because a reader can't tell the difference from the finished page.

## Rules, and why

- **Never take a formula or number from OCR without seeing the page.** OCR handles prose well but damages maths: on book p. 87 of Class 8 Part 2, d² = 24² + 32² came out as "242 + 322", and √1600 lost its root sign. Exponents and fractions vanish without any warning.
- **No search match doesn't mean the book lacks it.** OCR missed `abcabc` and `1001` on a page that covers them. Render the likely page before you drop something or call it missing.
- **The syllabus notes aren't the book.** `sat-syllabus/*.md` is a good index and shows what to look for, but one note described a topic that a search of that chapter couldn't find. Confirm against the page.
- **Only cite a page after finding the idea on it.** Guessed page numbers were often wrong by a page or more.
- **Keep extracted text out of git.** The books are marked "not to be republished" and the repo is public. `.textbook-cache/` is git-ignored, so leave extracted text there or in the scratchpad.
- **OCR here is English only.** It hasn't been tried on Kannada textbooks, so don't expect it to work on them. Read those pages as images.
