/**
 * Checks every Number / Letter Pyramid book question. Each group (e.g. "B1C2") is read off the
 * question's pyramid in every way it can be split into letters and numbers, and every move of a
 * whole group is tried: a shift by some rows and boxes, or the mirror image across the middle line
 * followed by a shift. An option fits when one move turns the 1st group into the 2nd and the 3rd into
 * the 4th, or the 1st into the 3rd and the 2nd into the 4th. Exactly one option must fit, and it must
 * be the marked one; hidden questions must have none or more than one.
 * Run from app/:  npx tsx ../tools/check_pyramid.ts
 */
import data from '../app/src/data/mat/pyramid.json' with { type: 'json' }

type Cell = [number, number] // row, and boxes from the middle of that row (a box straight below has the same number)
type Pyramid = string[][]

const where = (p: Pyramid, t: string): Cell[] =>
  p.flatMap((row, r) => row.flatMap((x, i) => (x === t ? [[r, i - (row.length - 1) / 2] as Cell] : [])))
const at = (p: Pyramid, [r, c]: Cell) => p[r]?.[c + ((p[r]?.length ?? 0) - 1) / 2]

/** Every way to split a group into tokens of the pyramid, as lists of cells. */
function readings(p: Pyramid, s: string): Cell[][] {
  if (!s) return [[]]
  const out: Cell[][] = []
  for (let n = 1; n <= Math.min(2, s.length); n++)
    for (const cell of where(p, s.slice(0, n))) for (const rest of readings(p, s.slice(n))) out.push([cell, ...rest])
  return out
}

type Move = (c: Cell) => Cell
const MOVES: Move[] = []
for (const mirror of [false, true])
  for (let dr = -4; dr <= 4; dr++) for (let dc = -4; dc <= 4; dc++) MOVES.push(([r, c]) => [r + dr, (mirror ? -c : c) + dc])

/** The group `from` becomes the group `to` under the move. */
const becomes = (p: Pyramid, m: Move, from: string, to: string) =>
  readings(p, from).some((cells) => cells.map((c) => at(p, m(c)) ?? '#').join('') === to)

let bad = 0
for (const q of data.questions) {
  const p = q.pyramid
  const fits = Object.entries(q.options)
    .filter(([, v]) => {
      const [a, b, c, d] = q.terms.map((t) => (t === '?' ? v : t))
      return MOVES.some((m) => (becomes(p, m, a, b) && becomes(p, m, c, d)) || (becomes(p, m, a, c) && becomes(p, m, b, d)))
    })
    .map(([k]) => k)
  const shown = `${q.terms.join(' : ')}`
  if ('status' in q) {
    if (fits.length !== 1) console.log(`✓ Q${q.bookNo}: hidden; options that fit: ${fits.join(', ') || 'none'}`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but only option ${fits[0]} fits`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${shown}  →  ${q.options[q.answer as 'A']} (${q.answer})`)
  else (bad++, console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
