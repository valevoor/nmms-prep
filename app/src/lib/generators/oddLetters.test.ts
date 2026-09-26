import { describe, expect, it } from 'vitest'
import { mulberry32 } from './numberSeries'
import { generateOddLetters } from './oddLetters'

// Independent checks from the family descriptions.
const P = (c: string) => c.charCodeAt(0) - 64
const jumps = (g: string) => [...g].slice(1).map((c, i) => P(c) - P(g[i]))
const FITS: Record<string, (items: string[]) => ((g: string) => boolean)[]> = {
  step: () => [-4, -3, -2, -1, 1, 2, 3, 4].map((k) => (g: string) => jumps(g).every((j) => j === k)),
  growing: () => [(g) => jumps(g).join() === '1,2,3'],
  opposite: () => [(g) => P(g[1]) - P(g[0]) === 13 && P(g[3]) - P(g[2]) === 13],
  sum: () => [(g) => P(g[0]) + P(g[1]) === P(g[2])],
  even: () => [(g) => [...g].every((c) => P(c) % 2 === 0)],
}

describe('generateOddLetters', () => {
  it('exactly one option breaks the rule, and it is the answer', () => {
    const rng = mulberry32(16)
    const seen = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateOddLetters(rng)
      const family = q.id.split('-')[2]
      seen.add(family)
      const ctx = JSON.stringify(q)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const ok = FITS[family](Object.values(q.options)).some((fits) => {
        const breaking = Object.entries(q.options).filter(([, v]) => !fits(v)).map(([k]) => k)
        return breaking.length === 1 && breaking[0] === q.answer
      })
      expect(ok, ctx).toBe(true)
    }
    expect(seen.size).toBe(Object.keys(FITS).length)
  })
})
