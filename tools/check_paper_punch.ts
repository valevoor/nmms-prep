/**
 * Checks the Paper Fold and Punch book questions (Chapter 7). The pictures can't be solved by code,
 * so each was solved by eye from the pages rendered at 5-10× (all 15 agree with the book's key);
 * this checks the data against the key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_paper_punch.ts
 */
import data from '../app/src/data/mat/paper-punch.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 118.
const KEY: Record<number, string> = {
  1: 'B', 2: 'C', 3: 'A', 4: 'C', 5: 'B', 6: 'B', 7: 'B', 8: 'C',
  9: 'D', 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'D', 15: 'A',
}

let bad = checkFigureChapter('Paper Punch', data.questions, KEY, true)
for (const q of data.questions) {
  // Each question shows the three steps (fold, fold, cut), with no blank.
  if (q.figures.terms.length !== 3 || q.figures.terms.includes('?')) console.log(`✗ Paper Punch Q${q.bookNo}: needs the three steps`), bad++
  // An override or a hidden question must say why.
  if ((q.keyFrom === 'solved' || 'status' in q) && !('note' in q)) console.log(`✗ Paper Punch Q${q.bookNo}: needs a note`), bad++
}
if (bad) process.exit(1)
