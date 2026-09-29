/**
 * Checks the Intersecting Figures book questions (Chapter 5). Each diagram is typed in here as its
 * numbered parts and the shapes each part lies inside (read by eye from the rendered pages 22–24;
 * parts with no number hold 0 people). Each question is written as the groups a person must be in
 * and must not be in; the count is worked out from the parts, and exactly one option must match
 * it, the marked answer. Q3 asks what the number 9 stands for: each option is a description, and
 * only one may cover exactly the part holding 9. Also checks the book's key and the pictures.
 * Run from app/:  npx tsx ../tools/check_intersecting_figures.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/intersecting-figures.json' with { type: 'json' }

type Part = [number, string]
/** Parts as [number, shapes it is inside]; one letter per group. */
const DIAGRAMS: Record<number, { figure: string; parts: Part[] }> = {
  // V volleyball (circle), B badminton (rectangle), C cricket (triangle)
  1: { figure: 'set1', parts: [[9, 'V'], [6, 'VC'], [10, 'VBC'], [5, 'VB'], [7, 'B'], [8, 'B'], [12, 'BC'], [4, 'C']] },
  // K Kannada (circle), E English (rectangle), H Hindi (oval)
  2: { figure: 'set2', parts: [[10, 'K'], [9, 'KE'], [8, 'KEH'], [5, 'EH'], [7, 'E'], [4, 'H'], [6, 'H']] },
  // D dancers (circle), S swimmers (triangle), R doctors (rectangle)
  3: { figure: 'set3', parts: [[9, 'D'], [7, 'DS'], [8, 'DR'], [6, 'DSR'], [4, 'S'], [3, 'R']] },
  // T tea (triangle), C coffee (circle), M milk (rectangle)
  4: { figure: 'set4', parts: [[12, 'T'], [16, 'T'], [15, 'C'], [2, 'C'], [2, 'M'], [4, 'M'], [10, 'TM'], [5, 'TCM'], [3, 'CM'], [7, 'TC']] },
  // S Sunrisers (hexagon), R RCB (triangle), M MI (rectangle), C CSK (circle)
  5: { figure: 'set5', parts: [[32, 'C'], [44, 'CS'], [25, 'CSM'], [56, 'CM'], [20, 'S'], [31, 'SM'], [8, 'SMR'], [22, 'SR'], [26, 'R'], [36, 'M']] },
}

/** in: groups a person must be in; out: groups they must not be in. */
type Ask = { set: number; in: string; out: string }
const ASKS: Record<number, Ask> = {
  1: { set: 1, in: 'CB', out: '' },
  2: { set: 1, in: 'VBC', out: '' },
  4: { set: 2, in: 'E', out: '' },
  5: { set: 2, in: 'E', out: 'KH' },
  6: { set: 2, in: 'KEH', out: '' },
  7: { set: 3, in: 'R', out: '' },
  8: { set: 3, in: 'D', out: 'SR' },
  9: { set: 3, in: 'D', out: 'R' },
  10: { set: 4, in: 'TCM', out: '' },
  11: { set: 4, in: 'TC', out: '' },
  12: { set: 4, in: 'C', out: 'TM' },
  13: { set: 5, in: 'SCM', out: '' },
  14: { set: 5, in: 'C', out: 'SMR' },
  15: { set: 5, in: 'SM', out: '' },
}
/** Q3's options as asks on diagram 1. */
const Q3: Record<string, Ask> = {
  A: { set: 1, in: 'V', out: '' },
  B: { set: 1, in: 'V', out: 'BC' },
  C: { set: 1, in: 'V', out: 'C' },
  D: { set: 1, in: 'V', out: 'B' },
}

const covered = (a: Ask) => DIAGRAMS[a.set].parts.filter(([, s]) => [...a.in].every((g) => s.includes(g)) && ![...a.out].some((g) => s.includes(g)))
const count = (a: Ask) => covered(a).reduce((t, [n]) => t + n, 0)

// Key, PDF pages 115–117.
const KEY: Record<number, string> = { 1: 'A', 2: 'D', 3: 'B', 4: 'C', 5: 'B', 6: 'B', 7: 'C', 8: 'B', 9: 'C', 10: 'C', 11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'D' }

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  let fits: string[]
  let shown: string
  if (no === 3) {
    fits = Object.entries(Q3)
      .filter(([, a]) => {
        const c = covered(a)
        return c.length === 1 && c[0][0] === 9
      })
      .map(([k]) => k)
    shown = '9 alone'
  } else {
    const a = ASKS[no]
    const n = count(a)
    fits = Object.entries(q.options)
      .filter(([, v]) => Number(v) === n)
      .map(([k]) => k)
    shown = covered(a)
      .map(([x]) => x)
      .join(' + ') + ` = ${n}`
  }
  const set = no === 3 ? 1 : ASKS[no].set
  if (q.figures.terms[0] !== `figures/ch05/${DIAGRAMS[set].figure}.png`) fail(no, `wrong picture ${q.figures.terms[0]}`)
  for (const f of q.figures.terms) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${no}: ${shown}  →  ${q.answer}`)
  else fail(no, `options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll Intersecting Figures answers check out.')
