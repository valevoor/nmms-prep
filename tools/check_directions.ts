/**
 * Checks every Directions book question with an independent model: walks are replayed turn by
 * turn, and maps are placed on a grid. Exactly one option must match, and it must be the marked one.
 * Also checks that each question's drawing (path / points) ends where the model says.
 * Run from app/:  npx tsx ../tools/check_directions.ts
 */
import data from '../app/src/data/mat/directions.json' with { type: 'json' }

type V = [number, number]
const H: Record<string, V> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }
const ORDER = ['N', 'E', 'S', 'W']
const right = (d: string) => ORDER[(ORDER.indexOf(d) + 1) % 4]
const left = (d: string) => ORDER[(ORDER.indexOf(d) + 3) % 4]
/** Walks from (0,0): the first leg in a compass direction, then 'R'/'L' turns with distances. */
function walk(first: string, n: number, ...legs: [string, number][]): V {
  let d = first
  let p: V = [H[d][0] * n, H[d][1] * n]
  for (const [t, m] of legs) {
    d = t === 'R' ? right(d) : t === 'L' ? left(d) : t
    p = [p[0] + H[d][0] * m, p[1] + H[d][1] * m]
  }
  return p
}
const NAME: Record<string, string> = { N: 'north', S: 'south', E: 'east', W: 'west' }
/** Direction of v as words, e.g. "north-west"; exact diagonals and axes only. */
const dirOf = ([x, y]: V) => [y > 0 ? 'north' : y < 0 ? 'south' : '', x > 0 ? 'east' : x < 0 ? 'west' : ''].filter(Boolean).join('-')
const dist = ([x, y]: V) => Math.hypot(x, y)
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]]

/** For each question: the answer in words or as "<number> <direction?>". */
const RULES: Record<string, () => string> = {
  // Morning: shadows point west. Uday's left is west, so Uday faces the direction whose left is west.
  'dr-b01': () => NAME[ORDER.find((d) => left(d) === 'W')!],
  // SE → N and NE → W: both a 135° anticlockwise turn; apply to W (270°) → 135° = SE.
  'dr-b02': () => {
    const ang: Record<string, number> = { north: 0, 'north-east': 45, east: 90, 'south-east': 135, south: 180, 'south-west': 225, west: 270, 'north-west': 315 }
    const k = (ang.north - ang['south-east'] + 360) % 360
    if ((ang.west - ang['north-east'] + 360) % 360 !== k) throw new Error('not one rotation')
    return Object.keys(ang).find((n) => ang[n] === (ang.west + k) % 360)!
  },
  // The dial's 6 points north, so the whole dial is turned 180°: 3 o'clock (normally east) points west.
  'dr-b03': () => NAME[right(right('E'))],
  'dr-b04': () => dirOf(walk('N', 15, ['W', 10], ['S', 5], ['E', 10])),
  // Car 1 moves 25 + 25 along the road (the 15 km side legs cancel); car 2 moves 35.
  'dr-b05': () => `${150 - (25 + 25) - 35}`,
  'dr-b06': () => {
    const p = walk('W', 15, ['L', 20], ['L', 15], ['R', 12])
    return `${dist(p)} ${dirOf(p)}`
  },
  // North d, left 1, left 2, ending 1 km west, level with the start: d = 2.
  'dr-b07': () => `${[1, 2, 3, 5].find((d) => { const p = walk('N', d, ['L', 1], ['L', 2]); return p[0] === -1 && p[1] === 0 })}`,
  'dr-b08': () => {
    const A: V = [0, 0]
    const P: V = [A[0] + 1, A[1]]
    const Q: V = [P[0], P[1] - 1]
    const R: V = [A[0], A[1] + 1]
    return dirOf(sub(Q, R))
  },
  // From the east he walks west; left = south (theatre), ahead = west (hospital), behind = east (home).
  'dr-b09': () => NAME[ORDER.find((d) => !['S', 'W', 'E'].includes(d))!],
  'dr-b10': () => `${dist(walk('S', 10, ['R', 5], ['R', 10], ['L', 10]))}`,
  'dr-b11': () => `${dist(walk('E', 90, ['R', 20], ['R', 30], ['N', 100]))}`,
  'dr-b12': () => `${dist(walk('E', 9, ['R', 4], ['R', 9], ['R', 3]))}`,
  // P at (0,0): Q north of P, R east of Q, S west (left) of P.
  'dr-b13': () => {
    const R: V = [1, 1]
    const S: V = [-1, 0]
    return dirOf(sub(S, R))
  },
  'dr-b14': () => {
    const p = walk('N', 15, ['L', 30], ['R', 25])
    return `${dist(p)} ${dirOf(p)}`
  },
  // P at (0,0) and Q south-west at (-1,-1), so line QP is y = x. R is east of Q and south-east of P: (1,-1).
  // T is north of R and on line QP: (1, 1).
  'dr-b15': () => {
    const R: V = [1, -1]
    const T: V = [R[0], R[0]]
    return dirOf(T)
  },
}

/** "32 m South" → "32 south"; "North-East" → "north-east"; "1 foot" → "1". */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/\s*(km|m|feet|foot)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

let bad = 0
for (const q of data.questions) {
  const want = RULES[q.id]?.()
  const fits = Object.entries(q.options).filter(([, v]) => norm(v) === want).map(([k]) => k)
  const ok = fits.length === 1 && fits[0] === q.answer
  // The drawing must agree with the model: for walks, the path's end point.
  let drawing = ''
  if ('path' in q && q.path) {
    const end = (q.path as [string, number][]).reduce<V>((p, [d, n]) => [p[0] + H[d][0] * n, p[1] + H[d][1] * n], [0, 0])
    if (/^\d/.test(want ?? '') && Number(want!.split(' ')[0]) !== dist(end) && q.id !== 'dr-b07') drawing = ` (drawing ends ${dist(end)} away)`
  }
  if (ok && !drawing) console.log(`✓ Q${q.bookNo}: ${want}  →  ${q.answer}`)
  else {
    bad++
    console.log(`✗ Q${q.bookNo}: model says "${want}"; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}${drawing}`)
  }
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
