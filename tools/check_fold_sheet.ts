/**
 * Checks the Figure Fold Transparent Sheet book questions (Chapter 6). The pictures can't be
 * solved by code, so each was solved by eye from the page rendered at 4–8× (see the notes in the
 * data: Q15 overrides the key; Q3, Q6, Q7, Q13 and Q14 are hidden); this checks the data against
 * the book's key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_fold_sheet.ts
 */
import data from '../app/src/data/mat/fold-sheet.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 117.
const KEY: Record<number, string> = {
  1: 'C', 2: 'B', 3: 'C', 4: 'D', 5: 'D', 6: 'A', 7: 'A', 8: 'A',
  9: 'D', 10: 'D', 11: 'C', 12: 'C', 13: 'A', 14: 'D', 15: 'D',
}

let bad = checkFigureChapter('Fold Sheet', data.questions, KEY)
for (const q of data.questions) {
  // Each question shows the sheet alone, with no blank.
  if (q.figures.terms.length !== 1 || q.figures.terms.includes('?')) console.log(`✗ Fold Sheet Q${q.bookNo}: needs exactly one given figure`), bad++
  // An override or a hidden question must say why.
  if ((q.keyFrom === 'solved' || 'status' in q) && !('note' in q)) console.log(`✗ Fold Sheet Q${q.bookNo}: needs a note`), bad++
}
if (bad) process.exit(1)
