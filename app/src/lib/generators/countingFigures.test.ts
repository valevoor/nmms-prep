import { describe, expect, it } from 'vitest'
import type { Drawing } from '../../types'
import { countShapes } from '../shapeCount'
import type { ShapeKind } from '../shapeCount'
import { mulberry32 } from './numberSeries'
import { buildCountingFigures } from './countingFigures'

// Independent of countingFigures.ts's formulas: the shapes asked for (read from the question) are
// counted by brute force in the lines actually drawn, every group of joined corners tried.

const ASKED: [RegExp, ShapeKind][] = [
  [/triangles/, 'triangle'],
  [/squares/, 'square'],
  [/rectangles/, 'rectangle'],
  [/parallelograms/, 'parallelogram'],
]
const KANNADA = /[ಀ-೿]/

describe('generateCountingFigures', () => {
  it('exactly one option matches a brute-force count of the drawn figure', () => {
    const rng = mulberry32(12)
    const seen = new Set<string>()
    for (let i = 0; i < 1200; i++) {
      const q = buildCountingFigures(rng)
      const kinds = ASKED.filter(([re]) => re.test(q.prompt ?? '')).map(([, k]) => k)
      expect(kinds).toHaveLength(1)
      const d = q.figures?.terms[0] as Drawing
      expect(d.lines?.length).toBeGreaterThan(2)
      for (const [x1, y1, x2, y2] of d.lines ?? []) for (const [v, max] of [[x1, d.w ?? 100], [y1, 100], [x2, d.w ?? 100], [y2, 100]]) expect(v >= 0 && v <= max).toBe(true)
      const count = countShapes(d.lines ?? [], kinds[0])
      const fits = Object.entries(q.options).filter(([, v]) => Number(v) === count)
      expect(fits.map(([k]) => k), `${q.prompt} ${q.working}`).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size).toBe(4)
      expect(q.kn?.prompt).toMatch(KANNADA)
      expect(q.kn?.rule).toMatch(KANNADA)
      expect(q.kn?.working).toBeTruthy()
      seen.add(q.pattern)
    }
    expect(seen.size).toBe(4)
  })
})
