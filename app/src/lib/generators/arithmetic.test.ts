import { describe, expect, it } from 'vitest'
import type { Question } from '../../types'
import { generateArithmetic } from './arithmetic'
import { mulberry32 } from './numberSeries'

// An independent reading of each question (not using arithmetic.ts): the option is put into the
// equation the way a student would, and JavaScript works out both sides.
const js = (s: string) => s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
function holds(eq: string): boolean {
  const sides = eq.split('=')
  if (sides.length !== 2) return false
  const [l, r] = sides.map((x) => Number(new Function(`return ${js(x)}`)()))
  return Number.isFinite(l) && Math.abs(l - r) < 1e-9
}
const fill = (eq: string, signs: string[]) => {
  const [left, right] = eq.split('=')
  const gaps = left.split('*')
  expect(gaps.length - 1).toBe(signs.length)
  return gaps.map((g, i) => (i ? `${signs[i - 1]}${g}` : g)).join('') + '=' + right
}
const swapTokens = (s: string, a: string, b: string) =>
  s
    .split(' ')
    .map((t) => (t === a ? b : t === b ? a : t))
    .join(' ')

/** The equation an option makes, in real signs. */
function readOption(q: Question, opt: string): string {
  const eq = q.terms[0]
  const [a, , b] = opt.split(' ')
  switch (q.pattern) {
    case 'ops-fill':
      return fill(eq, opt.split(' '))
    case 'ops-code': {
      const [symbols, signs] = q.table!
      return fill(eq, opt.split(' ').map((s) => signs[symbols.indexOf(s)]))
    }
    case 'ops-swap':
      return swapTokens(eq, a, b)
    case 'ops-swap-num': {
      const [left, right] = eq.split(' = ')
      // Each number appears once on the left, so the swap is clear.
      expect(left.split(' ').filter((t) => t === a || t === b)).toHaveLength(2)
      return `${swapTokens(left, a, b)} = ${right}`
    }
    case 'ops-meaning': {
      // "Here + means ÷, × means +, …": read the meanings from the question itself.
      const means = Object.fromEntries([...q.prompt!.matchAll(/(\S) means (\S)/g)].map((m) => [m[1], m[2]]))
      expect(Object.keys(means)).toHaveLength(4)
      return [...opt].map((c) => means[c] ?? c).join('')
    }
  }
  throw new Error(`unexpected pattern ${q.pattern}`)
}

describe('generateArithmetic', () => {
  it('exactly one option makes the equation true', () => {
    const rng = mulberry32(25)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateArithmetic(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const fits = Object.entries(q.options)
        .filter(([, v]) => holds(readOption(q, v)))
        .map(([k]) => k)
      expect(fits, ctx).toEqual([q.answer])
      // The equation as shown is not already true (otherwise there would be nothing to swap).
      if (q.pattern === 'ops-swap' || q.pattern === 'ops-swap-num') expect(holds(q.terms[0]), ctx).toBe(false)
      // The working ends with the equation's answer.
      const right = q.pattern === 'ops-meaning' ? q.options[q.answer].split(' = ')[1] : q.terms[0].split(' = ')[1]
      expect(q.working.endsWith(`= ${right}`), ctx).toBe(true)
    }
    expect(kinds.size).toBe(5)
  })
})
