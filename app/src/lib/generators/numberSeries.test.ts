import { describe, expect, it } from 'vitest'
import { GENERATOR_PATTERNS, generateNumberSeries, mulberry32 } from './numberSeries'
import { applyOp, fillBlanks } from '../series'

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97])
const nextPrime = (p: number) => {
  let x = p + 1
  while (!PRIMES.has(x)) x++
  return x
}

describe.each(GENERATOR_PATTERNS)('generator: %s', (pattern) => {
  it('makes 1000 valid questions with exactly one correct option', () => {
    const rng = mulberry32(pattern.length * 7919)
    for (let n = 0; n < 1000; n++) {
      const q = generateNumberSeries(rng, pattern)
      const ctx = JSON.stringify(q)

      // four distinct options, one of which is the answer
      const opts = Object.values(q.options)
      expect(opts, ctx).toHaveLength(4)
      expect(new Set(opts).size, ctx).toBe(4)
      expect(q.terms.filter((t) => t === '?'), ctx).toHaveLength(1)

      const full = fillBlanks(q.terms, q.options[q.answer]).map(Number)
      full.forEach((v) => expect(Number.isInteger(v) && v >= 0, ctx).toBe(true))

      // the filled-in series really follows the rule
      if (q.ops) {
        expect(q.ops, ctx).toHaveLength(full.length - 1)
        q.ops.forEach((op, i) => expect(applyOp(full[i], op), ctx).toBe(full[i + 1]))
      } else if (pattern === 'prime') {
        full.slice(1).forEach((v, i) => expect(v, ctx).toBe(nextPrime(full[i])))
      } else if (pattern === 'power-pairs') {
        for (let i = 0; i < full.length; i += 2) expect(full[i + 1], ctx).toBe(Math.round(Math.sqrt(full[i])) ** 3)
      } else if (pattern === 'alternating') {
        const odd = full.filter((_, i) => i % 2 === 1)
        const oddDiffs = odd.slice(1).map((v, i) => v - odd[i])
        expect(new Set(oddDiffs).size, ctx).toBe(1)
        const even = full.filter((_, i) => i % 2 === 0)
        const d = even.slice(1).map((v, i) => v - even[i])
        const d2 = d.slice(1).map((v, i) => v - d[i])
        expect(new Set(d2).size, ctx).toBe(1)
      }

      // the explanation arrives at the answer
      expect(q.working, ctx).toMatch(new RegExp(`(=|is) ${q.options[q.answer]}\\b`))
    }
  })
})
