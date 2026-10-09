import { describe, expect, it } from 'vitest'
import { apply, area, centre, creases, cutShape, foldDeg, foldLines, isoM4, MAX_FOLDS, mirror, onM4, pieceM4, punch, region, sample, side, stack } from './punchFold'
import type { Fold, FoldLine, Pt } from './punchFold'

const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6))
const sorted = (ps: Pt[]) => ps.map(([x, y]) => `${Math.round(x * 1000) / 1000},${Math.round(y * 1000) / 1000}`).sort()
const linesOf = (folds: Fold[]) => foldLines(region(folds)).map((l) => l.line)

/** Every way to fold the sheet in half up to three times. */
function allFolds(): Fold[][] {
  const out: Fold[][] = []
  const grow = (folds: Fold[]) => {
    out.push(folds)
    if (folds.length === MAX_FOLDS) return
    for (const { line, at } of foldLines(region(folds))) for (const moving of [0, 1] as const) grow([...folds, { line, at, moving }])
  }
  grow([])
  return out
}

describe('fold and punch', () => {
  it('only folds the paper in half along a line it is symmetric about', () => {
    expect(linesOf([])).toEqual(['vertical', 'horizontal', 'diagonal', 'antidiagonal'])
    // Folded up and down, it is a tall strip: up and down or across again, but not slantwise.
    expect(linesOf([{ line: 'vertical', at: [50, 50], moving: 1 }])).toEqual(['vertical', 'horizontal'])
    // Folded slantwise, it is a triangle: only the other slant halves it.
    expect(linesOf([{ line: 'diagonal', at: [50, 50], moving: 1 }])).toEqual(['antidiagonal'])
    // Folded twice into a quarter square, all four lines work again.
    expect(linesOf([{ line: 'vertical', at: [50, 50], moving: 1 }, { line: 'horizontal', at: [25, 50], moving: 0 }])).toHaveLength(4)
  })

  it('doubles the layers with every fold, each one covering the folded paper exactly', () => {
    for (const folds of allFolds()) {
      const pieces = stack(folds)
      const r = region(folds)
      expect(pieces).toHaveLength(2 ** folds.length)
      expect(Math.abs(area(r))).toBeCloseTo(10000 / 2 ** folds.length, 6)
      for (const p of pieces) expect(sorted(p.poly.map((q) => apply(p.end, q)))).toEqual(sorted(r))
      // The layers are in a strict order, with no two at the same height.
      expect(new Set(pieces.map((p) => p.endLayer)).size).toBe(pieces.length)
    }
  })

  it('turns the moving half up towards the viewer and lands it where the mirroring puts it', () => {
    for (const folds of allFolds().filter((f) => f.length)) {
      const last = folds[folds.length - 1]
      for (const p of stack(folds).filter((q) => q.moves)) {
        const c = centre(p.poly)
        const startZ = onM4(pieceM4(p, last, foldDeg(folds, 0)), c)[2]
        expect(startZ).toBeCloseTo(0, 6)
        expect(onM4(pieceM4(p, last, foldDeg(folds, 0.5)), c)[2]).toBeGreaterThan(0)
        const done = pieceM4(p, last, foldDeg(folds, 1))
        const flat = isoM4(p.end)
        for (const q of p.poly) close(onM4(done, q), onM4(flat, q))
        // Turned over: the piece now shows its other side.
        expect(done[10]).toBeCloseTo(flat[10], 6)
        expect(flat[10]).toBeCloseTo(-isoM4(p.iso)[10], 6)
      }
    }
  })

  it('opens a cut out mirrored in every fold, last fold first', () => {
    const P: Pt = [10, 15]
    for (const folds of allFolds()) {
      const r = region(folds)
      // A small square well inside the folded paper.
      const [cx, cy] = centre(r)
      const inside: Pt = [cx + (P[0] - 50) * 0.02, cy + (P[1] - 50) * 0.02]
      if (folds.some((f) => Math.abs(side(f.line, f.at, inside)) < 1)) continue
      const shape = cutShape('rect', [[inside[0] - 0.4, inside[1] - 0.4], [inside[0] + 0.4, inside[1] + 0.4]])!
      const cut = punch(folds, 'rect', shape)
      // Independent rule: undo the folds from the last, each mirroring every hole so far.
      let expected: Pt[] = [inside]
      for (const f of [...folds].reverse()) expected = expected.flatMap((q) => [q, apply(mirror(f.line, f.at), q)])
      expect(sorted(cut.holes.map(centre))).toEqual(sorted(expected))
    }
  })

  it('opens a cut on a fold into one shape across the fold', () => {
    const folds: Fold[] = [{ line: 'vertical', at: [50, 50], moving: 1 }]
    // Half a diamond against the fold at x = 50, sticking out past it over the desk.
    const cut = punch(folds, 'triangle', [[60, 40], [40, 50], [60, 60]])
    expect(cut.holes).toHaveLength(2)
    // Each layer only gets the part over the paper: x up to 50 on the left half, mirrored on the right.
    const xs = cut.holes.flat().map((p) => p[0])
    expect(Math.min(...xs)).toBeCloseTo(40, 6)
    expect(Math.max(...xs)).toBeCloseTo(60, 6)
    cut.holes.forEach((h) => expect(Math.abs(area(h))).toBeCloseTo(50, 6))
  })

  it('cuts nothing off the desk, and only a notch at the edge of the sheet', () => {
    expect(punch([], 'rect', cutShape('rect', [[101, 10], [104, 20]])!).holes).toHaveLength(0)
    const notch = punch([], 'rect', cutShape('rect', [[95, 10], [104, 20]])!)
    expect(Math.abs(area(notch.holes[0]))).toBeCloseTo(50, 6)
  })

  it('leaves one crease per layer the fold went through', () => {
    const lines: Record<FoldLine, Fold> = {
      vertical: { line: 'vertical', at: [50, 50], moving: 0 },
      horizontal: { line: 'horizontal', at: [50, 50], moving: 1 },
      diagonal: { line: 'diagonal', at: [50, 50], moving: 1 },
      antidiagonal: { line: 'antidiagonal', at: [50, 50], moving: 0 },
    }
    for (const f of Object.values(lines)) expect(creases([f])).toHaveLength(1)
    const twice = creases([lines.vertical, { line: 'horizontal', at: [75, 50], moving: 0 }])
    // The second fold went through two layers, so it creases both halves of the sheet: one line across.
    expect(twice).toHaveLength(3)
    expect(twice.slice(1).every(([a, b]) => a[1] === 50 && b[1] === 50)).toBe(true)
  })

  it('makes shapes from the points picked and skips ones too small to see', () => {
    expect(cutShape('circle', [[20, 20], [20, 20]])).toBeNull()
    expect(cutShape('line', [[10, 10], [10, 10]])).toBeNull()
    expect(cutShape('rect', [[10, 10], [10, 40]])).toBeNull()
    expect(cutShape('triangle', [[0, 0], [10, 10], [20, 20]])).toBeNull()
    expect(Math.abs(area(cutShape('circle', [[50, 50], [60, 50]])!))).toBeCloseTo(Math.PI * 100, -1)
  })

  it('has a sample folded twice with a hole, a cut on a fold and a cut where the folds meet', () => {
    const { folds, cuts } = sample()
    expect(folds.map((f) => f.line)).toEqual(['vertical', 'horizontal'])
    expect(linesOf([])).toContain(folds[0].line)
    expect(linesOf(folds.slice(0, 1))).toContain(folds[1].line)
    expect(cuts.map((c) => c.holes.length)).toEqual([4, 4, 4])
    // The corner cut opens into a square in the middle of the sheet.
    const xs = cuts[2].holes.flat().map((p) => p[0])
    expect([Math.min(...xs), Math.max(...xs)]).toEqual([42.5, 57.5])
  })
})
