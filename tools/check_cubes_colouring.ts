/**
 * Checks the Cubes Colouring book questions (Chapter 13). Each of the book's three painted cubes is
 * typed in as its size and the colour on each face (read from the pictures on PDF pages 50, 52 and
 * 53), and every count is made cube by cube: each small cube gets the colours of the big cube's faces
 * it touches. In the first cube the book shows brown and purple only as "the other two faces", so it
 * is checked both ways round. Faces the book doesn't show get colours of their own. Exactly one option
 * must match the count, the marked answer.
 * Run from app/:  npx tsx ../tools/check_cubes_colouring.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/cubes-colouring.json' with { type: 'json' }

type Faces = { top: string; bottom: string; front: string; back: string; left: string; right: string }
type Cube = { n: number; faces: Faces[] }
type Ask = { faces: number } | { total: true } | { only: string[] } | { all: string[] }

/** The colours on each small cube of an n × n × n cube. */
function smallCubes(n: number, f: Faces): string[][] {
  const out: string[][] = []
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const c: string[] = []
        if (x === 0) c.push(f.left)
        if (x === n - 1) c.push(f.right)
        if (y === 0) c.push(f.front)
        if (y === n - 1) c.push(f.back)
        if (z === 0) c.push(f.bottom)
        if (z === n - 1) c.push(f.top)
        out.push(c)
      }
  return out
}

function count(n: number, f: Faces, ask: Ask): number {
  return smallCubes(n, f).filter((c) => {
    if ('total' in ask) return true
    if ('faces' in ask) return c.length === ask.faces
    if ('only' in ask) return c.length === ask.only.length && ask.only.every((k) => c.includes(k))
    return ask.all.every((k) => c.includes(k))
  }).length
}

const CUBE1: Cube = {
  n: 3,
  faces: [
    { top: 'red', bottom: 'blue', front: 'yellow', right: 'green', back: 'purple', left: 'brown' },
    { top: 'red', bottom: 'blue', front: 'yellow', right: 'green', back: 'brown', left: 'purple' },
  ],
}
const CUBE2: Cube = { n: 4, faces: [{ top: 'blue', front: 'brown', right: 'yellow', bottom: 'x1', back: 'x2', left: 'x3' }] }
const CUBE3: Cube = { n: 5, faces: [{ top: 'purple', front: 'saffron', right: 'grey', bottom: 'x1', back: 'x2', left: 'x3' }] }

const ASKS: Record<number, [Cube, Ask, string]> = {
  1: [CUBE1, { faces: 3 }, '3 painted faces'],
  2: [CUBE1, { faces: 2 }, '2 painted faces'],
  3: [CUBE1, { faces: 1 }, '1 painted face'],
  4: [CUBE1, { faces: 0 }, 'no painted face'],
  5: [CUBE1, { only: ['green', 'yellow'] }, 'only green and yellow'],
  6: [CUBE1, { all: ['red', 'blue'] }, 'red and blue'],
  7: [CUBE1, { all: ['purple', 'brown', 'blue'] }, 'purple, brown and blue'],
  8: [CUBE2, { total: true }, 'all small cubes'],
  9: [CUBE2, { faces: 2 }, '2 painted faces'],
  10: [CUBE2, { faces: 0 }, 'no painted face'],
  11: [CUBE2, { only: ['brown'] }, 'only brown'],
  12: [CUBE2, { all: ['brown', 'blue', 'yellow'] }, 'brown, blue and yellow'],
  13: [CUBE3, { faces: 2 }, '2 painted faces'],
  14: [CUBE3, { only: ['purple'] }, 'only purple'],
  15: [CUBE3, { only: ['purple', 'grey'] }, 'only purple and grey'],
}
const FIGS: Record<number, string[]> = {
  3: ['figures/ch13/q01a.png', 'figures/ch13/q01b.png'],
  4: ['figures/ch13/q08.png'],
  5: ['figures/ch13/q13.png'],
}
const HIDDEN = new Set<number>()

// Key, PDF pages 129–130. Q8's key prints C (256) although its working gives 4³ = 64.
const KEY: Record<number, string> = { 1: 'D', 2: 'D', 3: 'D', 4: 'A', 5: 'B', 6: 'B', 7: 'D', 8: 'C', 9: 'D', 10: 'C', 11: 'B', 12: 'B', 13: 'C', 14: 'B', 15: 'C' }

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  const [cube, ask, shown] = ASKS[no]
  const values = cube.faces.map((f) => count(cube.n, f, ask))
  if (new Set(values).size > 1) fail(no, `depends on which face is brown: ${values.join(' or ')}`)
  const value = values[0]
  const fits = Object.entries(q.options)
    .filter(([, v]) => Number(v) === value)
    .map(([k]) => k)
  const pics = q.figures.terms
  if (pics.join() !== FIGS[cube.n].join()) fail(no, `wrong pictures ${pics.join()}`)
  for (const f of pics) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (!q.prompt.includes(`into ${cube.n === 3 ? 'three' : cube.n} equal parts`)) fail(no, `the prompt doesn't give the cube's size (${cube.n})`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if (q.keyFrom === 'solved' && !('note' in q)) fail(no, 'differs from the key without a note')
  if (HIDDEN.has(no) !== ('status' in q)) fail(no, HIDDEN.has(no) ? 'should be hidden' : 'hidden but checks out')
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${no}: ${shown} = ${value}  →  ${q.answer}${q.keyFrom === 'solved' ? ` (key ${KEY[no]})` : ''}`)
  else fail(no, `${shown} = ${value}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll Cubes Colouring answers check out.')
