import { describe, expect, it } from 'vitest'
import { ANALOGY_RULES, fitsAnalogy, generateAnalogyRuleQuestion, generateNumberAnalogy } from './numberAnalogy'
import { mulberry32 } from './numberSeries'

describe('number analogy generator', () => {
  it('makes 2000 questions where exactly one option completes the analogy', () => {
    const rng = mulberry32(1414)
    for (let n = 0; n < 2000; n++) {
      const q = generateNumberAnalogy(rng)
      const ctx = JSON.stringify(q)
      expect(q.layout, ctx).toBe('analogy')
      expect(q.terms, ctx).toHaveLength(4)
      expect(q.terms.filter((t) => t === '?'), ctx).toHaveLength(1)
      const opts = Object.values(q.options)
      expect(new Set(opts).size, ctx).toBe(4)

      const [a, b, c, d] = q.terms
      const fits = (o: string) => (c === '?' ? fitsAnalogy(+a, +b, +o, +d) : fitsAnalogy(+a, +b, +c, +o))
      for (const [k, o] of Object.entries(q.options)) {
        expect(Number.isInteger(+o) && +o > 0, ctx).toBe(true)
        expect(fits(o), `${k}=${o} :: ${ctx}`).toBe(k === q.answer)
      }
      expect(q.working, ctx).toMatch(new RegExp(`(= |is )${q.options[q.answer]}$`))
    }
  })
})

describe('analogy Guess the rule', () => {
  it('has a unique name for every rule', () => {
    expect(new Set(ANALOGY_RULES.map((r) => r.name.en)).size).toBe(ANALOGY_RULES.length)
  })

  it('makes 2000 questions where exactly one named rule links both pairs', () => {
    const rng = mulberry32(2525)
    for (let n = 0; n < 2000; n++) {
      const q = generateAnalogyRuleQuestion(rng)
      const ctx = JSON.stringify(q)
      expect(q.kind, ctx).toBe('rule')
      expect(q.layout, ctx).toBe('analogy')
      expect(q.terms.includes('?'), ctx).toBe(false)
      const [a, b, c, d] = q.terms.map(Number)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      for (const [k, name] of Object.entries(q.options)) {
        const rule = ANALOGY_RULES.find((r) => r.name.en === name)!
        expect(rule, `${name} :: ${ctx}`).toBeDefined()
        expect(rule.f(a) === b && rule.f(c) === d, `${k}=${name} :: ${ctx}`).toBe(k === q.answer)
      }
    }
  })
})
