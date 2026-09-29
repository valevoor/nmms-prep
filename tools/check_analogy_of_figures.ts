/**
 * Checks the Analogy of Figures book questions (Chapter 1). The pictures can't be solved by code, so
 * each was solved by eye from the rendered pages (see the notes in the data for the doubtful ones);
 * this checks the data against the book's key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_analogy_of_figures.ts
 */
import data from '../app/src/data/mat/analogy-of-figures.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 110.
const KEY: Record<number, string> = { 1: 'D', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'A', 11: 'B', 12: 'D', 13: 'C', 14: 'B', 15: 'D' }

if (checkFigureChapter('Analogy of Figures', data.questions, KEY)) process.exit(1)
