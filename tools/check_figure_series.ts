/**
 * Checks the Figure Series book questions (Chapter 2). The pictures can't be solved by code, so
 * each was solved by eye from the rendered pages (see the notes in the data for the doubtful ones);
 * this checks the data against the book's key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_figure_series.ts
 */
import data from '../app/src/data/mat/figure-series.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 112.
const KEY: Record<number, string> = { 1: 'A', 2: 'D', 3: 'C', 4: 'C', 5: 'D', 6: 'D', 7: 'C', 8: 'D', 9: 'C', 10: 'D', 11: 'A', 12: 'B', 13: 'B', 14: 'D', 15: 'B' }

if (checkFigureChapter('Figure Series', data.questions, KEY)) process.exit(1)
