/**
 * Checks the Similar Figures in Different Position book questions (Chapter 4). The pictures can't
 * be solved by code, so each was solved by eye from the page rendered at 12× (see the notes in the
 * data: Q4 overrides the key; Q5 and Q7 are hidden); this checks the data against the book's key
 * and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_similar_figures.ts
 */
import data from '../app/src/data/mat/similar-figures.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 115. It lists 15 answers, but the chapter prints only 11 questions.
const KEY: Record<number, string> = { 1: 'D', 2: 'C', 3: 'C', 4: 'C', 5: 'D', 6: 'A', 7: 'D', 8: 'A', 9: 'B', 10: 'A', 11: 'D' }

let bad = checkFigureChapter('Similar Figures', data.questions, KEY)
// Each question shows the given figure alone, with no blank.
for (const q of data.questions) if (q.figures.terms.length !== 1 || q.figures.terms.includes('?')) console.log(`✗ Similar Figures Q${q.bookNo}: needs exactly one given figure`), bad++
if (bad) process.exit(1)
