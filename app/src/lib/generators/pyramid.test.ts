import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { mulberry32 } from './numberSeries'
import { generatePyramid } from './pyramid'

// An independent reading (not using pyramid.ts): every box gets an x across the whole picture, in
// half boxes from the middle line (a row of 5 has x = −4, −2, 0, 2, 4), so the mirror image is
// x → −x and a shift adds the same amount to every box. Each group's text is split into boxes in
// every possible way, and an option fits when one move takes the 1st group to the 2nd and the 3rd to
// the 4th (or the 1st to the 3rd and the 2nd to the 4th). Exactly one option may fit.
type Box = { row: number; x: number }

function boxes(p: string[][]): Map<string, Box[]> {
  const out = new Map<string, Box[]>()
  p.forEach((row, r) => row.forEach((t, i) => out.set(t, [...(out.get(t) ?? []), { row: r, x: 2 * i - (row.length - 1) }])))
  return out
}

function splits(s: string, known: Map<string, Box[]>): Box[][] {
  if (!s) return [[]]
  const out: Box[][] = []
  for (const n of [1, 2]) {
    const t = s.slice(0, n)
    if (t.length === n) for (const b of known.get(t) ?? []) for (const rest of splits(s.slice(n), known)) out.push([b, ...rest])
  }
  return out
}

function fits(q: Question, opt: string): boolean {
  const p = q.pyramid!
  const known = boxes(p)
  const [a, b, c, d] = q.terms.map((t) => (t === '?' ? opt : t))
  const moves = (from: string, to: string) => {
    const found = new Set<string>()
    for (const f of splits(from, known))
      for (const flip of [1, -1]) {
        // The move is fixed by the first box; check that it takes every box to the right place.
        for (const target of splits(to, known)) {
          if (target.length !== f.length) continue
          const dr = target[0].row - f[0].row
          const dx = target[0].x - flip * f[0].x
          if (f.every((box, i) => target[i].row === box.row + dr && target[i].x === flip * box.x + dx))
            found.add(`${flip},${dr},${dx}`)
        }
      }
    return found
  }
  const both = (x: Set<string>, y: Set<string>) => [...x].some((m) => y.has(m))
  return both(moves(a, b), moves(c, d)) || both(moves(a, c), moves(b, d))
}

describe('generatePyramid', () => {
  it('exactly one option fits one move of the whole group', () => {
    const rng = mulberry32(30)
    const kinds = new Set<string>()
    for (let n = 0; n < 1200; n++) {
      const q = generatePyramid(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify({ ...q, pyramid: undefined })
      expect(q.terms.filter((t) => t === '?'), ctx).toHaveLength(1)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      for (const v of Object.values(q.options)) expect(q.terms, ctx).not.toContain(v)
      const ok = OPTION_KEYS.filter((k) => fits(q, q.options[k]))
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['py-mirror', 'py-shift'])
  }, 60000)
})
