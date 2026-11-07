# Writing a SAT revision sheet

A sheet is a Revise page plus its flash cards, for one textbook chapter. See "SAT revision sheets" in `CLAUDE.md` for how they fit into the app.

## Files

- `app/src/data/sat/revise/<chapter>.json`: `terms`, `groups` of `items`, and `mistakes`. Copy the shape from an existing sheet.
- `<chapter>.kn.json`: the draft Kannada, keyed by id. A formula that is only maths can be left out, and falls back to English.
- List the chapter in `REVISIONS` in `app/src/data/satRevise.ts`.
- Add a rule for each item and mistake in `tools/check_sat_revise.ts`, keyed `<chapter>/<item id>` or `<chapter>/mistake:<id>`.

A chapter that isn't maths also needs to be listed: `tools/build_sat_chapters.ts` keeps only maths chapters and those with past-paper questions.

## Writing

- Cover every chapter at the same depth. Questions can come from any chapter, so past-paper counts don't decide what goes in.
- Write in your own words with your own examples. Don't copy paragraphs, exercises or figures from the book.
- Each item's `name` becomes a flash card's front, so it must make sense as a prompt and be unique among the chapter's terms and items, in both languages.
- Keep the same numbers in the Kannada as in the English. The checker compares them.

## Checking

- Prefer a rule that computes the claim, trying the law across many values and then the example on its own. `tools/check_sat_revise.ts` has helpers such as `grid`, `laws`, `hcf`, `mean` and `primeFactors`.
- Use `read('p. N')` only for what can't be computed, such as history or a definition. It proves nothing about the fact: it only records where the fact is, so give the real page.
- Run `npx tsx ../tools/check_sat_revise.ts` from `app/` after each sheet, then the full checks in `CLAUDE.md` before finishing.
