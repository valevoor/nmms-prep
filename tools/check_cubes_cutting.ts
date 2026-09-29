/**
 * Checks the Cubes Cutting book questions (Chapter 10). Each figure is typed in here as the set of
 * small cubes it holds (read by eye from the rendered pages 35–38), and every count is worked out
 * cube by cube: how many are left, how many were taken away (the full n × n × n cube minus what is
 * left), and the area of the uncovered faces. Q13–15 have no figure; their big cube is built from
 * the numbers in the question. Exactly one option must match the count, the marked answer. Q10 and
 * Q11 are hidden (the figure can't be read clearly), so only the book's own reading is checked.
 * Run from app/:  npx tsx ../tools/check_cubes_cutting.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/cubes-cutting.json' with { type: 'json' }

/** A small cube at column x (left to right), row y (front to back), layer z (bottom up). */
type Solid = { n: number; has: (x: number, y: number, z: number) => boolean }
const cells = (s: Solid) => {
  const out: [number, number, number][] = []
  for (let x = 0; x < s.n; x++) for (let y = 0; y < s.n; y++) for (let z = 0; z < s.n; z++) if (s.has(x, y, z)) out.push([x, y, z])
  return out
}
const inside = (s: Solid, x: number, y: number, z: number) => x >= 0 && y >= 0 && z >= 0 && x < s.n && y < s.n && z < s.n && s.has(x, y, z)
const count = (s: Solid) => cells(s).length
const removed = (s: Solid) => s.n ** 3 - count(s)
/** Faces of small cubes with no cube against them: the area a sheet must cover (1 per face). */
const area = (s: Solid) =>
  cells(s).reduce(
    (t, [x, y, z]) =>
      t + [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].filter(([a, b, c]) => !inside(s, x + a, y + b, z + c)).length,
    0,
  )

const full = (n: number): Solid => ({ n, has: () => true })
/** Steps: each layer up loses one more front row. */
const steps = (n: number): Solid => ({ n, has: (_x, y, z) => y >= z })
/** Q2: the front row is cut away above the bottom layer. */
const q2: Solid = { n: 3, has: (_x, y, z) => z === 0 || y >= 1 }
/** Q10 as the book's key reads it: top layer keeps only the two outer columns; the layer below loses its middle column. */
const q10Book: Solid = { n: 5, has: (x, _y, z) => (z === 4 ? x === 0 || x === 4 : z === 3 ? x !== 2 : true) }
/** Q12: a pile in a corner, 1 + 3 + 6 + 10 cubes, each resting on the ones below and behind it. */
const pile: Solid = { n: 4, has: (x, y, z) => x + y + z <= 3 }
/** Q15: a 4 × 4 × 4 cube with one layer taken off every face. */
const peeled = (n: number): Solid => ({ n, has: (x, y, z) => [x, y, z].every((c) => c > 0 && c < n - 1) })

const COUNT: Record<number, { figure?: string; value: number; shown: string }> = {
  1: { figure: 'q01', value: count(full(3)), shown: '3 × 3 × 3' },
  2: { figure: 'q02', value: count(q2), shown: 'layers 6 + 6 + 9' },
  3: { figure: 'q03', value: count(steps(3)), shown: 'steps of 3' },
  4: { figure: 'q03', value: removed(steps(3)), shown: '27 − left' },
  5: { figure: 'q03', value: removed(steps(3)), shown: '27 − left' },
  6: { figure: 'q03', value: area(steps(3)), shown: 'uncovered faces' },
  7: { figure: 'q07', value: count(steps(4)), shown: 'steps of 4' },
  8: { figure: 'q07', value: removed(steps(4)), shown: '64 − left' },
  9: { figure: 'q07', value: removed(steps(4)), shown: '64 − left' },
  10: { figure: 'q10', value: count(q10Book), shown: "the key's reading" },
  11: { figure: 'q10', value: removed(q10Book), shown: "the key's reading" },
  12: { figure: 'q12', value: count(pile), shown: '1 + 3 + 6 + 10' },
  13: { value: count(full(8 / 2)), shown: '(8 ÷ 2)³' },
  14: { value: count(full(15 / 3)), shown: '(15 ÷ 3)³' },
  15: { value: count(peeled(Math.round(Math.cbrt(64)))), shown: '64 = 4³, peeled' },
}
const HIDDEN = new Set([10, 11])

// Key, PDF pages 120–125.
const KEY: Record<number, string> = { 1: 'C', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'D', 7: 'B', 8: 'C', 9: 'D', 10: 'B', 11: 'D', 12: 'C', 13: 'D', 14: 'D', 15: 'B' }

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  const c = COUNT[no]
  const fits = Object.entries(q.options)
    .filter(([, v]) => parseInt(v, 10) === c.value)
    .map(([k]) => k)
  const pics = 'figures' in q ? (q.figures as { terms: string[] }).terms : []
  if (c.figure ? pics[0] !== `figures/ch10/${c.figure}.png` : pics.length) fail(no, `wrong picture ${pics[0] ?? 'none'}`)
  for (const f of pics) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if (HIDDEN.has(no) !== ('status' in q)) fail(no, HIDDEN.has(no) ? "the figure can't be read; hide it" : 'hidden but checks out')
  if ('status' in q && !('note' in q)) fail(no, 'hidden without a note')
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${no}: ${c.shown} = ${c.value}  →  ${q.answer}${HIDDEN.has(no) ? ' (hidden)' : ''}`)
  else fail(no, `${c.shown} = ${c.value}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll Cubes Cutting answers check out.')
