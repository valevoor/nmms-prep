/**
 * Checks the Mirror Image book questions (Chapter 8). The pictures can't be solved by code, so each
 * was solved by eye from the pages rendered at 4-16× (the word and number questions also by laying
 * the flipped given crop over each option); this checks the data against the book's key and the
 * cropped pictures. Q1, Q2 and Q10 are hidden because no option is the mirror image; Q3, Q4 and
 * Q13 because two options are printed the same and both are right.
 * Run from app/:  npx tsx ../tools/check_mirror_image.ts
 */
import data from '../app/src/data/mat/mirror-image.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 118.
const KEY: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'A', 4: 'C', 5: 'B', 6: 'A', 7: 'A', 8: 'B',
  9: 'D', 10: 'C', 11: 'A', 12: 'B', 13: 'C', 14: 'B', 15: 'D',
}
// Option pairs printed the same (their crops differ only in a few edge pixels), so both are right.
const TWINS: Record<number, string> = { 3: 'AC', 4: 'AC', 13: 'AC' }

let bad = checkFigureChapter('Mirror Image', data.questions, KEY)
for (const q of data.questions) {
  // Each question shows the given figure alone, with no blank.
  if (q.figures.terms.length !== 1 || q.figures.terms.includes('?')) console.log(`✗ Mirror Image Q${q.bookNo}: needs exactly one given figure`), bad++
  // An override or a hidden question must say why.
  if ((q.keyFrom === 'solved' || 'status' in q) && !('note' in q)) console.log(`✗ Mirror Image Q${q.bookNo}: needs a note`), bad++
  // Questions with two identical right options must stay hidden.
  if (TWINS[q.bookNo] && !('status' in q)) console.log(`✗ Mirror Image Q${q.bookNo}: options ${TWINS[q.bookNo]} are the same; hide it`), bad++
}
if (bad) process.exit(1)
