import { OPTION_KEYS } from '../../types'
import type { Drawing, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Hidden Figures (Chapter 3): a small figure of straight lines is hidden, the same size and the same
// way up, in exactly one of four tangles of lines. Lines join points of a 5 × 5 lattice, in any of 8
// directions, so the figure is made of lattice steps; whether a tangle holds it is checked on a
// half-step lattice, which also catches copies that start where two slanting lines cross.

type P = [number, number]
/** A straight line from one lattice point to another, in lattice units. */
type Stroke = [P, P]

const N = 4 // lattice points 0..4 in each direction
const DIRS: P[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
const at = (u: number) => 14 + 18 * u

/** The half-steps a set of strokes covers, as keys on the doubled lattice. */
function halfSteps(strokes: Stroke[]): Set<string> {
  const out = new Set<string>()
  for (const [a, b] of strokes) {
    const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))
    const d: P = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    for (let k = 0; k < 2 * len; k++) out.add(key([2 * a[0] + k * d[0], 2 * a[1] + k * d[1]], [2 * a[0] + (k + 1) * d[0], 2 * a[1] + (k + 1) * d[1]]))
  }
  return out
}
function key(p: P, q: P) {
  return p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]) ? `${p[0]},${p[1]}-${q[0]},${q[1]}` : `${q[0]},${q[1]}-${p[0]},${p[1]}`
}
const parse = (k: string) => k.split('-').map((p) => p.split(',').map(Number) as P) as [P, P]

/** Where (in half-steps) a copy of `fig` sits in `set`, or undefined. */
function find(fig: Set<string>, set: Set<string>): P | undefined {
  const edges = [...fig].map(parse)
  for (let dx = -2 * N; dx <= 2 * N; dx++)
    for (let dy = -2 * N; dy <= 2 * N; dy++)
      if (edges.every(([p, q]) => set.has(key([p[0] + dx, p[1] + dy], [q[0] + dx, q[1] + dy])))) return [dx, dy]
  return undefined
}

const bounds = (strokes: Stroke[]) => {
  const xs = strokes.flatMap(([a, b]) => [a[0], b[0]]), ys = strokes.flatMap(([a, b]) => [a[1], b[1]])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
const move = (strokes: Stroke[], dx: number, dy: number): Stroke[] => strokes.map(([a, b]) => [[a[0] + dx, a[1] + dy], [b[0] + dx, b[1] + dy]])
const inside = (p: P) => p[0] >= 0 && p[0] <= N && p[1] >= 0 && p[1] <= N

/** The small figure: 2 to 4 joined strokes that bend at every joint, at most 3 × 3 steps. */
function makeFigure(rng: Rng): Stroke[] | undefined {
  const n = pick(rng, [2, 3, 3, 3, 4])
  let p: P = [0, 0]
  let last = -1
  const out: Stroke[] = []
  for (let i = 0; i < n; i++) {
    const turns = [1, 2, 3, 5, 6, 7] // not straight on, not back
    const di = last < 0 ? int(rng, 0, 7) : (last + pick(rng, turns)) % 8
    const len = n === 2 ? 2 : pick(rng, [1, 1, 2])
    const q: P = [p[0] + DIRS[di][0] * len, p[1] + DIRS[di][1] * len]
    out.push([p, q])
    p = q
    last = di
  }
  const b = bounds(out)
  if (b.x1 - b.x0 > 3 || b.y1 - b.y0 > 3 || b.x1 - b.x0 + b.y1 - b.y0 < 2) return undefined
  // The strokes must not run over each other (it would hide how many lines there are).
  const cover = halfSteps(out)
  const total = out.reduce((s, [a, c]) => s + 2 * Math.max(Math.abs(c[0] - a[0]), Math.abs(c[1] - a[1])), 0)
  if (cover.size !== total) return undefined
  return move(out, -b.x0, -b.y0)
}

/** A random straight line of 1 to 4 steps inside the lattice. */
function randomStroke(rng: Rng): Stroke {
  for (;;) {
    const a: P = [int(rng, 0, N), int(rng, 0, N)]
    const d = pick(rng, DIRS)
    const len = int(rng, 1, 4)
    const b: P = [a[0] + d[0] * len, a[1] + d[1] * len]
    if (inside(b)) return [a, b]
  }
}

/** Outlines that make a tangle look like the book's: a big square, a diamond or a triangle (all lattice lines). */
const OUTLINES: Stroke[][] = [
  [[[0, 0], [4, 0]], [[4, 0], [4, 4]], [[4, 4], [0, 4]], [[0, 4], [0, 0]]],
  [[[2, 0], [4, 2]], [[4, 2], [2, 4]], [[2, 4], [0, 2]], [[0, 2], [2, 0]]],
  [[[0, 0], [4, 4]], [[4, 4], [0, 4]], [[0, 4], [0, 0]]],
]

/** The figure turned a quarter turn or flipped: looks like it, but is not the same way up. */
function lookalike(fig: Stroke[], rng: Rng): Stroke[] {
  const f = pick(rng, [(p: P): P => [-p[1], p[0]], (p: P): P => [-p[0], p[1]], (p: P): P => [p[0], -p[1]], (p: P): P => [-p[0], -p[1]]])
  const out = fig.map(([a, b]) => [f(a), f(b)] as Stroke)
  const b = bounds(out)
  return move(out, -b.x0, -b.y0)
}

/** A tangle of lines, with `put` (if given) placed at a random spot in it. */
function tangle(rng: Rng, put?: Stroke[]): { strokes: Stroke[]; where?: P } {
  const strokes: Stroke[] = []
  let where: P | undefined
  if (put) {
    const b = bounds(put)
    where = [int(rng, 0, N - b.x1), int(rng, 0, N - b.y1)]
    strokes.push(...move(put, where[0], where[1]))
  }
  if (rng() < 0.5) strokes.push(...pick(rng, OUTLINES))
  const extra = int(rng, 6, 9)
  for (let i = 0; i < extra; i++) strokes.push(randomStroke(rng))
  return { strokes: shuffle(rng, strokes), where }
}

const draw = (strokes: Stroke[], dx = 0, dy = 0): Drawing => ({
  items: [],
  lines: strokes.map(([a, b]) => [at(a[0]) + dx, at(a[1]) + dy, at(b[0]) + dx, at(b[1]) + dy]),
})

const PLACE: Record<'en' | 'kn', string[][]> = {
  en: [
    ['top-left', 'top', 'top-right'],
    ['left', 'middle', 'right'],
    ['bottom-left', 'bottom', 'bottom-right'],
  ],
  kn: [
    ['ಮೇಲಿನ ಎಡ', 'ಮೇಲಿನ', 'ಮೇಲಿನ ಬಲ'],
    ['ಎಡ', 'ಮಧ್ಯದ', 'ಬಲ'],
    ['ಕೆಳಗಿನ ಎಡ', 'ಕೆಳಗಿನ', 'ಕೆಳಗಿನ ಬಲ'],
  ],
}
const third = (c: number) => (c < 1.5 ? 0 : c <= 2.5 ? 1 : 2)

export const HIDDEN_RULE: Text = {
  en: 'The figure is hidden in one option, the same size and the same way up',
  kn: 'ಚಿತ್ರವು ಒಂದು ಆಯ್ಕೆಯಲ್ಲಿ ಅದೇ ಗಾತ್ರ ಮತ್ತು ಅದೇ ದಿಕ್ಕಿನಲ್ಲಿ ಅಡಗಿದೆ',
}

let counter = 0

/** A hidden-figure question: the figure, and four tangles of which exactly one holds it. */
export function generateHiddenFigure(rng: Rng = Math.random): Question {
  for (;;) {
    const fig = makeFigure(rng)
    if (!fig) continue
    const figSet = halfSteps(fig)
    const right = tangle(rng, fig)
    if (!find(figSet, halfSteps(right.strokes))) continue
    const wrong: Stroke[][] = []
    let decoy: number | undefined
    for (let tries = 0; wrong.length < 3 && tries < 40; tries++) {
      // One wrong option may hold the figure turned or flipped: a common trap.
      const trap = decoy === undefined && rng() < 0.5 ? lookalike(fig, rng) : undefined
      const t = tangle(rng, trap).strokes
      if (find(figSet, halfSteps(t))) continue
      if (trap) decoy = wrong.length
      wrong.push(t)
    }
    if (wrong.length < 3) continue
    const all = shuffle(rng, [right.strokes, ...wrong])
    const answer = OPTION_KEYS[all.indexOf(right.strokes)]
    const b = bounds(fig)
    const cx = right.where![0] + (b.x1 + b.x0) / 2, cy = right.where![1] + (b.y1 + b.y0) / 2
    const trapKey = decoy === undefined ? undefined : OPTION_KEYS[all.indexOf(wrong[decoy])]
    const place = (l: 'en' | 'kn') => PLACE[l][third(cy)][third(cx)]
    const working: Text = {
      en:
        `Find the corners of the figure first. In option ${answer} it is in the ${place('en')} part: every line is there, the same length and the same way up.` +
        (trapKey ? ` Option ${trapKey} has it turned or flipped, which does not count.` : ' Each other option is missing at least one of its lines.'),
      kn:
        `ಮೊದಲು ಚಿತ್ರದ ಮೂಲೆಗಳನ್ನು ಹುಡುಕಿ. ಆಯ್ಕೆ ${answer} ರ ${place('kn')} ಭಾಗದಲ್ಲಿ ಇದೆ: ಎಲ್ಲಾ ರೇಖೆಗಳೂ ಅದೇ ಉದ್ದ ಮತ್ತು ಅದೇ ದಿಕ್ಕಿನಲ್ಲಿವೆ.` +
        (trapKey ? ` ಆಯ್ಕೆ ${trapKey} ರಲ್ಲಿ ಅದು ತಿರುಗಿದೆ ಅಥವಾ ತಲೆಕೆಳಗಾಗಿದೆ, ಅದು ಲೆಕ್ಕಕ್ಕೆ ಬರುವುದಿಲ್ಲ.` : ' ಉಳಿದ ಪ್ರತಿ ಆಯ್ಕೆಯಲ್ಲೂ ಕನಿಷ್ಠ ಒಂದು ರೇಖೆ ಇಲ್ಲ.'),
    }
    // The figure alone, centred in its box, at the same size as in the options.
    const shift = (w: number) => 50 - (at(0) + at(w)) / 2
    return {
      id: `gen-hid-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: ['1'],
      figures: {
        terms: [draw(fig, shift(b.x1), shift(b.y1))],
        options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, draw(all[j])])) as Record<OptionKey, Drawing>,
      },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer,
      rule: HIDDEN_RULE.en,
      working: working.en,
      pattern: 'fig-hidden',
      generated: true,
      kn: { rule: HIDDEN_RULE.kn, working: working.kn },
    }
  }
}
