import { describe, expect, it } from 'vitest'
import { folded, FOLDS } from './generators/foldSheet'
import { centroid, FOLD_LINES, foldTurn, halfOf, LINES, makeMark, reflect, sampleMarks, side, snap, turn } from './sheetFold'
import type { FoldLine, Pt } from './sheetFold'

const GRID: Pt[] = []
for (let x = 0; x <= 100; x += 5) for (let y = 0; y <= 100; y += 5) GRID.push([x, y])
const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6))

describe('draw and fold', () => {
  it('splits the sheet into two halves on either side of each fold line', () => {
    for (const line of FOLD_LINES) {
      const { ends, halves } = LINES[line]
      for (const e of ends) expect(side(line, e)).toBe(0)
      halves.forEach((h, i) => expect(Math.sign(side(line, centroid(h)))).toBe(i === 0 ? -1 : 1))
    }
  })

  it('lands each point the same distance from the fold, on the other side', () => {
    for (const line of FOLD_LINES)
      for (const p of GRID) {
        const q = reflect(line, p)
        expect(side(line, q)).toBeCloseTo(-side(line, p), 6)
        close(reflect(line, q), p)
        // Points on the fold line stay put.
        if (side(line, p) === 0) close(q, p)
      }
  })

  it('folds both ways so the moving half lifts towards the viewer and lands exactly on its mirror image', () => {
    for (const line of FOLD_LINES)
      for (const moving of [0, 1] as const) {
        const half = LINES[line].halves[moving]
        const c = centroid(half)
        // Halfway, the half stands up out of the screen (CSS z points at the viewer)…
        expect(turn(line, c, foldTurn(line, moving, 0.5).deg)[2]).toBeGreaterThan(0)
        // …and fully folded, every point of it is where reflect() puts it, flat on the sheet.
        for (const p of GRID) {
          const [x, y, z] = turn(line, p, foldTurn(line, moving, 1).deg)
          close([x, y, z], [...reflect(line, p), 0])
        }
      }
  })

  it("agrees with the chapter generator's fold rules", () => {
    const same: Record<string, FoldLine> = { left: 'vertical', right: 'vertical', top: 'horizontal', bottom: 'horizontal', lowerLeft: 'diagonal', upperLeft: 'antidiagonal' }
    for (const f of FOLDS)
      for (const [x, y] of GRID) {
        const g = folded(f, { shape: 'circle', x, y, size: 10 })
        close(reflect(same[f.id], [x, y]), [g.x, g.y])
      }
  })

  it('snaps to the grid and keeps points on the sheet', () => {
    expect(snap([12.4, 97.6])).toEqual([10, 100])
    expect(snap([-8, 104])).toEqual([0, 100])
  })

  it('makes shapes from the points picked and skips ones too thin to see', () => {
    expect(makeMark('rect', [[10, 10], [30, 20]], 0, true)?.pts).toEqual([[10, 10], [30, 10], [30, 20], [10, 20]])
    expect(makeMark('rect', [[10, 10], [10, 40]], 0, true)).toBeNull()
    expect(makeMark('line', [[10, 10], [10, 10]], 0, false)).toBeNull()
    expect(makeMark('triangle', [[0, 0], [10, 10], [20, 20]], 0, true)).toBeNull()
    expect(makeMark('triangle', [[0, 0], [10, 10], [20, 0]], 0, true)?.pts).toHaveLength(3)
  })

  it('puts the sample shapes on the half that folds, with one shape left on the other half', () => {
    for (const line of FOLD_LINES)
      for (const moving of [0, 1] as const) {
        const halves = sampleMarks(line, moving).map((m) => halfOf(line, m))
        expect(halves.filter((h) => h === moving)).toHaveLength(3)
        expect(halves.filter((h) => h === 1 - moving)).toHaveLength(1)
      }
  })
})
