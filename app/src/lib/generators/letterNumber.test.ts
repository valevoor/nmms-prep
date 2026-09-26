import { describe, expect, it } from 'vitest'
import { generateLetterNumber } from './letterNumber'
import { mulberry32 } from './numberSeries'

// Independent rules, written from the chapter (not from letterNumber.ts). Each question's example
// pair must fit at least one of them, and every rule that fits must pick out the same single option.
const P = (c: string) => c.charCodeAt(0) - 64
const L = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
const sum = (w: string) => Array.from(w).reduce((s, c) => s + P(c), 0)
const whole = (n: number) => (Number.isInteger(n) ? String(n) : '')
const RULES: ((x: string) => string)[] = [
  (w) => (w.length > 2 ? String(sum(w)) : ''),
  (w) => (w.length > 2 ? String(2 * sum(w)) : ''),
  (w) => (w.length > 2 ? whole(sum(w) / 2) : ''),
  (w) => (w.length > 2 ? String(sum(w) ** 2) : ''),
  (w) => (w.length > 2 ? whole(Math.sqrt(sum(w))) : ''),
  (c) => (c.length === 1 ? String(P(c) ** 2) : ''),
  (c) => (c.length === 1 ? String((P(c) + 1) ** 2) : ''),
  (c) => (c.length === 1 ? String(2 * P(c)) : ''),
  (c) => (c.length === 1 ? String(3 * P(c)) : ''),
  // Letter shifts: any steps that turn the example into its pair, used again on the new word.
]
const steps = (a: string, b: string) => Array.from(a, (c, i) => (P(b[i]) - P(c) + 26) % 26)
const applySteps = (s: number[], w: string) => Array.from(w, (c, i) => L(P(c) + s[i])).join('')

describe('generateLetterNumber', () => {
  it('exactly one option follows the rule shown in the example', () => {
    const rng = mulberry32(22)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateLetterNumber(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      const [a, b, c, d] = q.terms
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      let fits: string[]
      if (/^[A-Z]+$/.test(b)) {
        // Letters to letters: the steps are fixed by the example.
        const s = steps(a, b)
        fits = Object.entries(q.options).filter(([, v]) => v === applySteps(s, c)).map(([k]) => k)
      } else if (c === '?') {
        // The letter is hidden: which option letter gives d under a rule that fits a → b?
        const rules = RULES.filter((f) => f(a) === b)
        expect(rules.length, ctx).toBeGreaterThan(0)
        fits = Object.entries(q.options).filter(([, v]) => rules.some((f) => f(v) === d)).map(([k]) => k)
      } else {
        const rules = RULES.filter((f) => f(a) === b)
        expect(rules.length, ctx).toBeGreaterThan(0)
        fits = Object.entries(q.options).filter(([, v]) => rules.some((f) => f(c) === v)).map(([k]) => k)
      }
      expect(fits, ctx).toEqual([q.answer])
    }
    expect(kinds.size).toBe(3)
  })
})
