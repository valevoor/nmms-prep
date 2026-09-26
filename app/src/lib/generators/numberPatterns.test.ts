import { describe, expect, it } from 'vitest'
import { generateNumberPatterns } from './numberPatterns'
import { mulberry32 } from './numberSeries'

// Independent solver, the same reading as tools/check_number_patterns.ts: find the moves of the whole
// shape (a plain shift first; flips only when no shift fits) that turn group 1 into group 3 in order.
type Cell = [number, number]
function solve(grid: number[][], g1: string, g2: string, g3: string): string[] {
  const at = new Map<number, Cell>()
  grid.forEach((row, r) => row.forEach((n, c) => at.set(n, [r, c])))
  const cells = (s: string) => s.split(' ').map((n) => at.get(Number(n))!)
  const [A, B, C] = [cells(g1), cells(g2), cells(g3)]
  const [H, W] = [grid.length, grid[0].length]
  const out = new Set<string>()
  for (const [fr, fc] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    if (out.size && (fr || fc)) break
    const o = ([r, c]: Cell): Cell => [fr ? H - 1 - r : r, fc ? W - 1 - c : c]
    const dr = C[0][0] - o(A[0])[0]
    const dc = C[0][1] - o(A[0])[1]
    const mv = (p: Cell): Cell => [o(p)[0] + dr, o(p)[1] + dc]
    if (!A.every((p, i) => mv(p)[0] === C[i][0] && mv(p)[1] === C[i][1])) continue
    const D = B.map(mv)
    if (D.every(([r, c]) => r >= 0 && r < H && c >= 0 && c < W)) out.add(D.map(([r, c]) => grid[r][c]).join(' '))
  }
  return [...out]
}

describe('generateNumberPatterns', () => {
  it('exactly one option follows the pattern in the table', () => {
    const rng = mulberry32(15)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateNumberPatterns(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      const grid = q.grid!
      // A proper table: every number 1…n once.
      expect(grid.flat().sort((x, y) => x - y), ctx).toEqual(Array.from({ length: grid.flat().length }, (_, i) => i + 1))
      const want = solve(grid, q.terms[0], q.terms[1], q.terms[2])
      expect(want.length, ctx).toBe(1)
      // Read the other way round (group 1 → group 2, used on group 3), where that fits, gives the same.
      const other = solve(grid, q.terms[0], q.terms[2], q.terms[1])
      expect(other.every((s) => s === want[0]), ctx).toBe(true)
      const fits = Object.entries(q.options).filter(([, v]) => v === want[0])
      expect(fits.map(([k]) => k), ctx).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
    }
    expect(kinds.size).toBe(2)
  })
})
