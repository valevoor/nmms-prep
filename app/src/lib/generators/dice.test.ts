import { describe, expect, it } from 'vitest'
import type { Drawing } from '../../types'
import { mulberry32 } from './numberSeries'
import { buildDice, NET_COUNT } from './dice'

// Independent of dice.ts: the faces are read back from where the labels are drawn, the drawn dice are
// tried on every labelling of a cube corner by corner, and nets are folded in 3D.

type V3 = [number, number, number]
const NORMALS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const faceOf = (n: V3) => NORMALS.findIndex((m) => m.every((v, i) => v === n[i]))
/** Clockwise from outside each corner (at (1, 1, 1) with +z on top: z, then y on the right, then x on the left). */
const CORNERS: number[][] = []
for (const sx of [1, -1])
  for (const sy of [1, -1])
    for (const sz of [1, -1]) {
      const x = faceOf([sx, 0, 0]), y = faceOf([0, sy, 0]), z = faceOf([0, 0, sz])
      CORNERS.push(sx * sy * sz > 0 ? [z, y, x] : [z, x, y])
    }
const shows = (d: string[], [t, l, r]: string[]) =>
  CORNERS.some((c) => [c, [c[1], c[2], c[0]], [c[2], c[0], c[1]]].some(([a, b, e]) => d[a] === t && d[b] === r && d[e] === l))
function perms<T>(xs: T[]): T[][] {
  return xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]))
}

/** The drawn dice, as [top, left, right]: each dice is a 100-wide slot; the top label sits highest. */
function readViews(d: Drawing): string[][] {
  const views: string[][] = []
  for (const it of d.items) {
    const slot = Math.floor(it.x / 100)
    const v = (views[slot] ??= ['', '', ''])
    const where = it.y < 45 ? 0 : it.x % 100 < 50 ? 1 : 2
    expect(v[where]).toBe('')
    v[where] = it.label!
  }
  // Each dice is drawn as a hexagon with three inner edges.
  expect(d.lines!.length).toBe(9 * views.length)
  return views
}

/** The net's squares by row and column, read from where the labels are, each one outlined. */
function readNet(d: Drawing): string[][] {
  const xs = d.items.map((i) => i.x), ys = d.items.map((i) => i.y)
  const x0 = Math.min(...xs), y0 = Math.min(...ys)
  const rows: string[][] = []
  for (const it of d.items) {
    const c = (it.x - x0) / 24, r = (it.y - y0) / 24
    expect(Number.isInteger(c) && Number.isInteger(r)).toBe(true)
    ;(rows[r] ??= [])[c] = it.label!
    // All four sides of its square are drawn.
    const has = (a: number, b: number, e: number, f: number) => d.lines!.some((l) => l[0] === a && l[1] === b && l[2] === e && l[3] === f)
    const [L, T, R, B] = [it.x - 12, it.y - 12, it.x + 12, it.y + 12]
    expect(has(L, T, R, T) && has(R, T, R, B) && has(L, B, R, B) && has(L, T, L, B)).toBe(true)
  }
  return rows.map((r) => Array.from(r, (v) => v ?? ''))
}

function fold(rows: string[][]): string[] | null {
  const cells = new Map<string, string>()
  rows.forEach((row, r) => row.forEach((v, c) => v && cells.set(`${r},${c}`, v)))
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  type F = { n: V3; right: V3; down: V3 }
  const start = [...cells.keys()][0]
  const placed = new Map<string, F>([[start, { n: [0, 0, 1], right: [1, 0, 0], down: [0, -1, 0] }]])
  const queue = [start]
  while (queue.length) {
    const k = queue.shift()!
    const [r, c] = k.split(',').map(Number)
    const f = placed.get(k)!
    const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]]
    for (const [dr, dc, d] of [[0, 1, f.right], [0, -1, neg(f.right)], [1, 0, f.down], [-1, 0, neg(f.down)]] as [number, number, V3][]) {
      const k2 = `${r + dr},${c + dc}`
      if (!cells.has(k2) || placed.has(k2)) continue
      const w = cross(f.n, d)
      const rot = (v: V3): V3 => [0, 1, 2].map((i) => dot(v, f.n) * d[i] - dot(v, d) * f.n[i] + dot(v, w) * w[i]) as V3
      placed.set(k2, { n: rot(f.n), right: rot(f.right), down: rot(f.down) })
      queue.push(k2)
    }
  }
  const die: string[] = []
  for (const [k, f] of placed) die[faceOf(f.n)] = cells.get(k)!
  return cells.size === 6 && placed.size === 6 && die.filter(Boolean).length === 6 ? die : null
}
const opp = (d: string[], x: string) => d[d.indexOf(x) ^ 1]

const KANNADA = /[ಀ-೿]/
/** English words of two or more letters. */
const WORDS = /\b[a-z]{2,}/

describe('generateDice', () => {
  it('finds all 11 nets in every turn and flip', () => expect(NET_COUNT).toBeGreaterThanOrEqual(11 * 4))

  it('exactly one option is opposite the face asked about', () => {
    const rng = mulberry32(11)
    const seen = new Set<string>()
    for (let i = 0; i < 1500; i++) {
      const q = buildDice(rng)
      const x = /opposite to (\S+)\?$/.exec(q.prompt!)![1]
      const d = q.figures!.terms[0] as Drawing
      let answers: Set<string>
      if (q.pattern === 'dice-views') {
        const views = readViews(d)
        expect(views.length).toBe(q.prompt!.startsWith('Two') ? 2 : 3)
        expect(views.flat()).toContain(x)
        const labels = [...new Set([...views.flat(), ...Object.values(q.options)])]
        while (labels.length < 6) labels.push(`?${labels.length}`)
        expect(labels.length).toBe(6)
        const dice = perms(labels).filter((p) => views.every((v) => shows(p, v)))
        expect(dice.length).toBeGreaterThan(0)
        answers = new Set(dice.map((p) => opp(p, x)))
      } else {
        const die = fold(readNet(d))
        expect(die).not.toBeNull()
        answers = new Set([opp(die!, x)])
      }
      expect(answers.size, q.prompt).toBe(1)
      const [y] = answers
      const values = Object.values(q.options)
      expect(new Set(values).size).toBe(4)
      expect(values).not.toContain(x)
      expect(Object.keys(q.options).filter((k) => q.options[k as 'A'] === y)).toEqual([q.answer])
      for (const f of ['prompt', 'rule', 'working'] as const) {
        expect(q.kn![f]).toMatch(KANNADA)
        expect(q.kn![f]).not.toMatch(WORDS)
      }
      const way = q.rule.includes('one square between') ? 'line' : q.rule.includes('left over') ? 'left' : q.rule.includes('seen together') ? 'next' : q.rule.includes('in two of the views') ? 'round' : '?'
      seen.add(`${q.pattern} ${way}`)
    }
    // Every way of solving comes up.
    expect([...seen].sort()).toEqual(['dice-net left', 'dice-net line', 'dice-views next', 'dice-views round'])
  })
})
