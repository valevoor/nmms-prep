/**
 * Checks the Water Image book questions (Chapter 9). The pictures can't be solved by code, so each
 * was solved by eye from the pages rendered at 4-25× (and by laying the flipped given crop over the
 * options); this checks the data against the book's key and the cropped pictures. Q4 and Q7 are
 * hidden because two options are printed the same and both are right; Q12 because no option is the
 * water image.
 * Run from app/:  npx tsx ../tools/check_water_image.ts
 */
import data from '../app/src/data/mat/water-image.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 119.
const KEY: Record<number, string> = {
  1: 'C', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'A', 7: 'C', 8: 'C',
  9: 'B', 10: 'D', 11: 'A', 12: 'C', 13: 'D', 14: 'C', 15: 'D',
}
// Option pairs printed the same (their crops differ only in spacing or a few edge pixels), so both are right.
const TWINS: Record<number, string> = { 4: 'CD', 7: 'CD' }
// No option is the water image.
const NONE_RIGHT = new Set([12])

let bad = checkFigureChapter('Water Image', data.questions, KEY)
for (const q of data.questions) {
  // Each question shows the given figure alone, with no blank.
  if (q.figures.terms.length !== 1 || q.figures.terms.includes('?')) console.log(`✗ Water Image Q${q.bookNo}: needs exactly one given figure`), bad++
  // An override or a hidden question must say why.
  if ((q.keyFrom === 'solved' || 'status' in q) && !('note' in q)) console.log(`✗ Water Image Q${q.bookNo}: needs a note`), bad++
  // Questions with two identical right options, or none right, must stay hidden.
  if ((TWINS[q.bookNo] || NONE_RIGHT.has(q.bookNo)) && !('status' in q)) console.log(`✗ Water Image Q${q.bookNo}: can't be shown; hide it`), bad++
}
if (bad) process.exit(1)
