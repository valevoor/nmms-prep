import { describe, expect, it } from 'vitest'
import { mulberry32 } from './numberSeries'
import { buildCubes } from './cubesCutting'
import type { CubeSpec } from './cubesCutting'

// An independent count (not using cubesCutting.ts's formulas): every small cube is visited, and its
// painted faces are the painted faces of the big solid it touches.
function brute(spec: CubeSpec): number {
  const [a, b, c] = spec.dims
  const on = (f: string) => spec.painted.includes(f as never)
  let hit = 0
  for (let x = 0; x < a; x++)
    for (let y = 0; y < b; y++)
      for (let z = 0; z < c; z++) {
        const paint = [x === 0 && on('left'), x === a - 1 && on('right'), y === 0 && on('front'), y === b - 1 && on('back'), z === 0 && on('bottom'), z === c - 1 && on('top')].filter(Boolean).length
        const outer = x === 0 || y === 0 || z === 0 || x === a - 1 || y === b - 1 || z === c - 1
        const ask = spec.ask
        if (ask.kind === 'cut') hit++
        else if (ask.kind === 'faces' && paint === ask.k) hit++
        else if (ask.kind === 'painted' && paint > 0) hit++
        else if (ask.kind === 'peel' && (ask.what === 'left' ? !outer : outer)) hit++
      }
  return hit
}

const KANNADA = /[ಀ-೿]/
/** English words (lowercase), apart from units. */
const WORDS = /\b(?!(?:cm)\b)[a-z]{2,}/

describe('generateCubesCutting', () => {
  it('exactly one option matches the count made cube by cube', () => {
    const rng = mulberry32(10)
    const seen = new Set<string>()
    for (let i = 0; i < 3000; i++) {
      const { q, spec } = buildCubes(rng)
      const [a, b, c] = spec.dims
      const ask = spec.ask
      // The question states the solid it is about.
      if (ask.kind === 'cut') {
        expect(q.prompt).toContain(`${ask.edge} cm`)
        expect(q.prompt).toContain(`${ask.small} cm`)
        expect(ask.edge / ask.small).toBe(a)
      } else if (ask.kind === 'peel') expect(q.prompt).toContain(`${a * b * c} cubic units`)
      else if (a === b && b === c) expect(q.prompt).toContain(`cube of edge ${a} cm`)
      else expect(q.prompt).toContain(`${a} cm × ${b} cm × ${c} cm`)
      if (ask.kind === 'faces' || ask.kind === 'painted') {
        if (spec.painted.length === 6) expect(q.prompt).toContain('all its faces')
        else {
          const which = /only on its (.*) faces/.exec(q.prompt!)![1]
          for (const f of ['top', 'bottom', 'front', 'back', 'left', 'right']) expect(which.includes(f), q.prompt).toBe(spec.painted.includes(f as never))
        }
      }
      const n = brute(spec)
      const values = Object.values(q.options)
      expect(new Set(values).size).toBe(4)
      values.forEach((v) => expect(Number(v)).toBeGreaterThan(0))
      const fits = Object.entries(q.options).filter(([, v]) => Number(v) === n)
      expect(fits.map(([k]) => k), q.prompt).toEqual([q.answer])
      expect(q.working.endsWith(`= ${n}`), q.working).toBe(true)
      for (const f of ['prompt', 'rule'] as const) {
        expect(q.kn![f]).toMatch(KANNADA)
        expect(q.kn![f]).not.toMatch(WORDS)
      }
      expect(q.kn!.working).toBe(q.working)
      seen.add(ask.kind === 'faces' ? `faces${ask.k}${spec.painted.length}` : `${ask.kind}${spec.painted.length}`)
    }
    // Every kind of question comes up: cut, peel, 0–3 faces on all-painted, and painted on some faces.
    for (const k of ['cut0', 'peel6', 'faces06', 'faces16', 'faces26', 'faces36', 'painted6', 'faces02', 'faces05', 'painted3']) expect(seen).toContain(k)
  })
})
