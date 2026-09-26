import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both, same } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

type Cell = [number, number]
const W = 6

/** Tables filled the ways the book fills them. */
const TABLES: ((h: number) => number[][])[] = [
  // Row by row.
  (h) => Array.from({ length: h }, (_, r) => Array.from({ length: W }, (_, c) => r * W + c + 1)),
  // Snaking: every other row runs backwards.
  (h) => Array.from({ length: h }, (_, r) => Array.from({ length: W }, (_, c) => r * W + (r % 2 ? W - c : c + 1))),
  // Rows filled from the top and bottom in turn; the bottom rows run backwards.
  (h) => {
    const g: number[][] = Array.from({ length: h }, () => [])
    let n = 1
    for (let i = 0; i < h; i++) {
      const r = i % 2 ? h - 1 - (i >> 1) : i >> 1
      const row = Array.from({ length: W }, () => n++)
      g[r] = i % 2 ? row.reverse() : row
    }
    return g
  },
  // Columns filled from the left and right in turn.
  (h) => {
    const g: number[][] = Array.from({ length: h }, () => Array<number>(W))
    let n = 1
    for (let i = 0; i < W; i++) {
      const c = i % 2 ? W - 1 - (i >> 1) : i >> 1
      for (let r = 0; r < h; r++) g[r][c] = n++
    }
    return g
  },
]

const STEPS: Cell[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [-1, -1],
]

/** A path of k cells, mostly straight with the odd turn (lines, corners, V shapes, zigzags). */
function shape(rng: Rng, h: number, k: number): Cell[] | undefined {
  const cells: Cell[] = [[int(rng, 0, h - 1), int(rng, 0, W - 1)]]
  let step = pick(rng, STEPS)
  const zigzag = rng() < 0.25
  while (cells.length < k) {
    if (zigzag) step = [-step[0] || 1, 1]
    else if (cells.length > 1 && rng() < 0.3) step = pick(rng, STEPS)
    const [r, c] = cells[cells.length - 1]
    const next: Cell = [r + step[0], c + step[1]]
    if (next[0] < 0 || next[0] >= h || next[1] < 0 || next[1] >= W || cells.some(([a, b]) => a === next[0] && b === next[1])) return undefined
    cells.push(next)
  }
  return cells
}

const inside = (h: number) => (cells: Cell[]) => cells.every(([r, c]) => r >= 0 && r < h && c >= 0 && c < W)
const shift = (cells: Cell[], dr: number, dc: number): Cell[] => cells.map(([r, c]) => [r + dr, c + dc])
const flip = (h: number, lr: boolean) => (cells: Cell[]): Cell[] => cells.map(([r, c]) => (lr ? [r, W - 1 - c] : [h - 1 - r, c]))
const same2 = (a: Cell[], b: Cell[]) => a.every(([r, c], i) => r === b[i][0] && c === b[i][1])

/** Every move of the whole shape turning `from` into `to` in order, as functions; plain shifts first (the book's reading). */
function movesBetween(h: number, from: Cell[], to: Cell[]): ((cells: Cell[]) => Cell[])[] {
  const found: ((cells: Cell[]) => Cell[])[] = []
  for (const orient of [(x: Cell[]) => x, flip(h, true), flip(h, false), (x: Cell[]) => flip(h, true)(flip(h, false)(x))]) {
    if (found.length) break
    const o = orient(from)
    const [dr, dc] = [to[0][0] - o[0][0], to[0][1] - o[0][1]]
    if (same2(shift(o, dr, dc), to)) found.push((cells) => shift(orient(cells), dr, dc))
  }
  return found
}

let counter = 0

export function generateNumberPatterns(rng: Rng = Math.random): Question {
  for (;;) {
    const h = pick(rng, [6, 7])
    const grid = pick(rng, TABLES)(h)
    const k = int(rng, 3, 5)
    const a = shape(rng, h, k)
    if (!a) continue
    // B: the first shape shifted, or its mirror image.
    const b0 = rng() < 0.7 ? a : flip(h, rng() < 0.5)(a)
    const b = shift(b0, int(rng, -4, 4), int(rng, -4, 4))
    if (!inside(h)(b) || same2(a, b)) continue
    // C: the first shape shifted (grid-shift) or flipped like a mirror (grid-flip).
    const flipped = rng() < 0.4
    const lr = rng() < 0.5
    const [dr, dc] = flipped ? [0, 0] : [int(rng, -4, 4), int(rng, -4, 4)]
    if (!flipped && !dr && !dc) continue
    const move = flipped ? flip(h, lr) : (x: Cell[]) => shift(x, dr, dc)
    const c = move(a)
    const d = move(b)
    if (!inside(h)(c) || !inside(h)(d) || same2(a, c)) continue
    // No other reading: every move from A to C gives D, and every move from A to B, used on C, does too.
    const ac = movesBetween(h, a, c)
    if (!ac.length || !ac.every((m) => same2(m(b), d))) continue
    if (movesBetween(h, a, b).some((m) => inside(h)(m(c)) && !same2(m(c), d))) continue
    // A flip question must not also be a plain shift (a straight line flipped is still a line).
    if (flipped && same2(shift(a, c[0][0] - a[0][0], c[0][1] - a[0][1]), c)) continue
    const read = (cells: Cell[]) => cells.map(([r, col]) => grid[r][col]).join(' ')
    const answer = read(d)
    const wrong = new Set<string>()
    wrong.add(read([...d].reverse()))
    for (const [r, col] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as Cell[]) {
      const near = shift(d, r, col)
      if (inside(h)(near)) wrong.add(read(near))
    }
    for (const lr2 of [true, false]) {
      const other = flip(h, lr2)(d)
      if (inside(h)(other)) wrong.add(read(other))
    }
    wrong.add(read(b))
    wrong.delete(answer)
    const three = shuffle(rng, [...wrong]).slice(0, 3)
    if (three.length < 3) continue
    const order = shuffle(rng, [answer, ...three])
    const rule = flipped ? both((m) => m.gridFlip(lr)) : both((m) => m.gridShift(m.gridMove(dr, dc)))
    const working = same(
      read(b)
        .split(' ')
        .map((n, i) => `${n} → ${answer.split(' ')[i]}`)
        .join(', '),
    )
    return {
      id: `gen-grid-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'analogy',
      terms: [read(a), read(b), read(c), '?'],
      grid,
      options: Object.fromEntries(OPTION_KEYS.map((key, j) => [key, order[j]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[order.indexOf(answer)],
      rule: rule.en,
      working: working.en,
      pattern: flipped ? 'grid-flip' : 'grid-shift',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
