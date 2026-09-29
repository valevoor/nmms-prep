/**
 * Checks the Counting of Figures book questions (Chapter 12). Each figure is typed in as its straight
 * lines (tools/counting_figures_data.ts, read by eye from the rendered pages 47–49), and the shapes
 * are counted by brute force (app/src/lib/shapeCount.ts): every group of corners (line ends and
 * crossings) joined by drawn lines. Exactly one option must match the count, the marked answer.
 * Hidden questions must really be unsettled: no option (or two printed the same) fits the count.
 * Run from app/:  npx tsx ../tools/check_counting_figures.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/counting-figures.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { ShapeKind } from '../app/src/lib/shapeCount'
import { FIGURES } from './counting_figures_data'

const KIND: Record<string, ShapeKind> = {
  'count-triangles': 'triangle',
  'count-squares': 'square',
  'count-rectangles': 'rectangle',
  'count-parallelograms': 'parallelogram',
  'count-pentagons': 'pentagon',
}
/** Q10, Q14, Q15: no option is the count; Q13: A and C are printed the same. */
const HIDDEN = new Set([10, 13, 14, 15])

// Key, PDF pages 127–128 (Q3 and Q7 give only the count, 10; both are option D and C).
const KEY: Record<number, string> = { 1: 'C', 2: 'B', 3: 'D', 4: 'C', 5: 'D', 6: 'C', 7: 'C', 8: 'A', 9: 'C', 10: 'D', 11: 'B', 12: 'D', 13: 'A', 14: 'B', 15: 'B' }

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  const kind = KIND[q.pattern]
  const value = countShapes(FIGURES[no], kind)
  const fits = Object.entries(q.options)
    .filter(([, v]) => parseInt(v, 10) === value)
    .map(([k]) => k)
  const pics = q.figures.terms
  if (pics.length !== 1 || pics[0] !== `figures/ch12/q${String(no).padStart(2, '0')}.png`) fail(no, `wrong picture ${pics[0] ?? 'none'}`)
  for (const f of pics) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (!q.prompt.includes(`${kind}s`)) fail(no, `the question doesn't ask for ${kind}s`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if ('status' in q && !('note' in q)) fail(no, 'hidden without a note')
  const printedTwice = new Set(Object.values(q.options)).size < 4
  if (HIDDEN.has(no)) {
    if (!('status' in q)) fail(no, 'should be hidden')
    if (fits.length === 1 && !printedTwice) fail(no, `hidden, but ${value} ${kind}s fits only ${fits[0]}`)
    else console.log(`· Q${no}: ${value} ${kind}s; options that fit: ${fits.join(', ') || 'none'}${printedTwice ? '; two options printed the same' : ''} (hidden)`)
    continue
  }
  if ('status' in q) fail(no, 'hidden but checks out')
  if (printedTwice) fail(no, 'two options are printed the same')
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${no}: ${value} ${kind}s  →  ${q.answer}${q.keyFrom === 'solved' ? ` (key says ${KEY[no]})` : ''}`)
  else fail(no, `${value} ${kind}s; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll Counting of Figures answers check out.')
