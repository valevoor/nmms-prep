import { describe, expect, it } from 'vitest'
import { boxSquares, cellCount, CUT_DIRS, CUT_SIZES, cutPieces, cutScene, project, START_VIEW } from './cubeCut'
import type { V3 } from './cubeCut'

const cuts = CUT_SIZES.flatMap((n) => CUT_DIRS.flatMap((dir) => Array.from({ length: n - 1 }, (_, i) => ({ n, dir, k: i + 1 }))))

describe('cutting a cube', () => {
  it('splits n³ small cubes into k × n × n and (n − k) × n × n', () => {
    for (const { n, dir, k } of cuts) {
      const c = cutPieces(n, dir, k)
      expect(cellCount(c.a)).toBe(k * n * n)
      expect(cellCount(c.b)).toBe((n - k) * n * n)
    }
  })

  it('counts piece A from the left, the top or the front', () => {
    const n = 4
    expect(cutPieces(n, 'x', 1).a).toEqual({ lo: [0, 0, 0], hi: [1, n, n] })
    expect(cutPieces(n, 'y', 1).a).toEqual({ lo: [0, n - 1, 0], hi: [n, n, n] })
    expect(cutPieces(n, 'z', 1).a).toEqual({ lo: [0, 0, n - 1], hi: [n, n, n] })
  })

  it('makes 2 new n × n faces: the pieces have 6n² + 2n² squares on their outsides', () => {
    for (const { n, dir, k } of cuts) {
      const c = cutPieces(n, dir, k)
      const knife = { axis: c.axis, at: c.at }
      const all = [...boxSquares(c.a, n, [0, 0, 0], knife, null), ...boxSquares(c.b, n, [0, 0, 0], knife, null)]
      expect(all.length).toBe(8 * n * n)
      expect(all.filter((s) => s.kind === 'cut').length).toBe(2 * n * n)
    }
  })
})

describe('the starting view', () => {
  it('looks at the top, the front and the right side', () => {
    const facing = (v: V3) => project(v, START_VIEW)[2] > 0
    expect(facing([0, 1, 0])).toBe(true)
    expect(facing([0, 0, 1])).toBe(true)
    expect(facing([1, 0, 0])).toBe(true)
    expect(project([0, 1, 0], START_VIEW)[1]).toBeLessThan(project([0, -1, 0], START_VIEW)[1])
  })

  it('shows 3 faces of the whole cube, and the knife before the cut', () => {
    for (const n of CUT_SIZES) {
      const s = cutScene(n, 'x', 1, false, 0, START_VIEW)
      expect(s.squares.length).toBe(3 * n * n)
      expect(s.squares.every((q) => q.kind === 'outer')).toBe(true)
      expect(s.knife).toHaveLength(4)
      expect(s.labels).toBeNull()
    }
  })

  it('after a left | right cut, shows one cut face and draws the left piece first', () => {
    const n = 3
    const s = cutScene(n, 'x', 1, true, 1, START_VIEW)
    const cutSquares = s.squares.filter((q) => q.kind === 'cut')
    expect(cutSquares.length).toBe(n * n)
    // The left piece (A, 1 × 3 × 3) has 3 + 3 + 9 squares showing; the right piece's start after them.
    const aShown = 3 + 3 + 9
    expect(s.squares.slice(0, aShown).filter((q) => q.kind === 'cut').length).toBe(n * n)
    expect(s.labels!.a[0]).toBeLessThan(s.labels!.b[0])
  })

  it('pulls the pieces apart along the cut', () => {
    const shut = cutScene(3, 'y', 1, true, 0, START_VIEW).labels!
    const open = cutScene(3, 'y', 1, true, 1.6, START_VIEW).labels!
    expect(open.a[1]).toBeLessThan(shut.a[1])
    expect(open.b[1]).toBeGreaterThan(shut.b[1])
  })
})
