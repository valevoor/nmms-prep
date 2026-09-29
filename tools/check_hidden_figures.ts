/**
 * Checks the Hidden Figures book questions (Chapter 3). The pictures can't be solved by code, so
 * each was solved by eye from the rendered pages (the book's key pages also mark where each figure
 * hides); this checks the data against the book's key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_hidden_figures.ts
 */
import data from '../app/src/data/mat/hidden-figures.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF pages 113–114.
const KEY: Record<number, string> = { 1: 'B', 2: 'B', 3: 'D', 4: 'A', 5: 'C', 6: 'D', 7: 'B', 8: 'A', 9: 'C', 10: 'B', 11: 'C', 12: 'C', 13: 'C', 14: 'D', 15: 'A' }

let bad = checkFigureChapter('Hidden Figures', data.questions, KEY)
// A hidden figure question shows the problem figure alone, with no blank.
for (const q of data.questions) if (q.figures.terms.length !== 1 || q.figures.terms.includes('?')) console.log(`✗ Hidden Figures Q${q.bookNo}: needs exactly one problem figure`), bad++
if (bad) process.exit(1)
