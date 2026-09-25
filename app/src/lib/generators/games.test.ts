import { describe, expect, it } from 'vitest'
import type { PatternId } from '../../types'
import { applyOp } from '../series'
import { fitsPattern, generateRuleQuestion, generateWrongNumber, PATTERN_LABELS } from './games'
import { buildSeries, GENERATOR_PATTERNS, mulberry32 } from './numberSeries'

const labelToPattern = Object.fromEntries(Object.entries(PATTERN_LABELS).map(([p, l]) => [l, p as PatternId]))

describe('fitsPattern', () => {
  it.each(GENERATOR_PATTERNS)('recognises every generated %s series', (p) => {
    const rng = mulberry32(p.length * 31)
    for (let n = 0; n < 1000; n++) {
      const d = buildSeries(rng, p)
      expect(fitsPattern(p, d.values), JSON.stringify(d.values)).toBe(true)
    }
  })

  it('matches hand-checked book series', () => {
    expect(fitsPattern('second-difference', [1, 6, 15, 28, 45, 66, 91])).toBe(true)
    expect(fitsPattern('difference-powers', [7, 8, 16, 43, 107, 232])).toBe(true)
    expect(fitsPattern('multiply-divide', [360, 72, 18, 6, 3, 3])).toBe(true)
    expect(fitsPattern('mixed-operation', [4, 8, 15, 28, 53, 102])).toBe(true)
    expect(fitsPattern('mixed-operation', [2, 5, 9, 19, 37, 75])).toBe(true)
    expect(fitsPattern('power-plus', [30, 67, 128, 219, 346])).toBe(true)
    expect(fitsPattern('prime', [2, 3, 5, 7, 11, 13, 17])).toBe(true)
    expect(fitsPattern('power-pairs', [1, 1, 4, 8, 9, 27, 16, 64])).toBe(true)
    expect(fitsPattern('arithmetic', [134, 245, 356, 467, 578])).toBe(true)
    expect(fitsPattern('repeating-difference', [2, 26, 74, 98, 146, 170])).toBe(true)
    // n² + 1 also has gaps growing by 2: both rules fit, so they must never appear together.
    expect(fitsPattern('power-plus', [5, 10, 17, 26, 37])).toBe(true)
    expect(fitsPattern('second-difference', [5, 10, 17, 26, 37])).toBe(true)
    // negatives
    expect(fitsPattern('prime', [2, 3, 5, 9, 11])).toBe(false)
    expect(fitsPattern('arithmetic', [1, 6, 15, 28])).toBe(false)
  })
})

describe('Guess the rule', () => {
  it('makes 1000 questions with exactly one rule that fits', () => {
    const rng = mulberry32(2024)
    for (let n = 0; n < 1000; n++) {
      const q = generateRuleQuestion(rng)
      const ctx = JSON.stringify(q)
      const values = q.terms.map(Number)
      const labels = Object.values(q.options)
      expect(new Set(labels).size, ctx).toBe(4)
      expect(q.options[q.answer], ctx).toBe(PATTERN_LABELS[q.pattern])
      for (const l of labels) {
        const fits = fitsPattern(labelToPattern[l], values)
        expect(fits, `${l} :: ${ctx}`).toBe(l === q.options[q.answer])
      }
    }
  })
})

describe('Fix the broken series', () => {
  it('makes 1000 questions where only the wrong term can be repaired', () => {
    const rng = mulberry32(99)
    for (let n = 0; n < 1000; n++) {
      const q = generateWrongNumber(rng)
      const ctx = JSON.stringify(q)
      const v = q.terms.map(Number)
      const opts = Object.values(q.options)
      expect(new Set(opts).size, ctx).toBe(4)
      expect(q.options[q.answer], ctx).toBe(q.terms[q.wrongIndex!])
      // every option names exactly one term of the series
      opts.forEach((o) => expect(q.terms.filter((t) => t === o), ctx).toHaveLength(1))

      const repaired = v.map((x, i) => (i === q.wrongIndex ? Number(q.fix) : x))
      expect(fitsPattern(q.pattern, repaired), ctx).toBe(true)
      expect(fitsPattern(q.pattern, v), ctx).toBe(false)

      if (q.ops) {
        // Repairing any other offered term (from its left neighbour) must not fix the chain.
        const chainOk = (s: number[]) => q.ops!.every((op, i) => applyOp(s[i], op) === s[i + 1])
        for (const o of opts) {
          const i = q.terms.indexOf(o)
          if (i === 0) {
            // The first term has no left neighbour; the changed term is always an inside one.
            expect(q.wrongIndex, ctx).not.toBe(0)
            continue
          }
          const s = [...v]
          s[i] = applyOp(s[i - 1], q.ops[i - 1])
          expect(chainOk(s), `${o} :: ${ctx}`).toBe(i === q.wrongIndex)
        }
      }
    }
  })
})
