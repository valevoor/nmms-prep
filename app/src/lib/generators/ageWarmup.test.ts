import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { ageWarmupRound } from './ageWarmup'
import { mulberry32 } from './numberSeries'

// An independent reading (not using ageWarmup.ts): the English question (and its table) is parsed
// into what it asks, and each option is checked against that. Expressions and equations are
// compared as functions of x, not as text, so "x + 3 − 2" and "x + 1" would count as the same.
const N = Number
const WORDS: Record<string, number> = { twice: 2, 'three times': 3, 'four times': 4, 'five times': 5, 'six times': 6 }

/** "2(x − 3)" → a function of x. */
function fn(expr: string): (x: number) => number {
  const js = expr.replace(/−/g, '-').replace(/(\d)\(/g, '$1*(').replace(/(\d)x/g, '$1*x')
  if (!/^[\dx+\-*() ]+$/.test(js)) throw new Error(`not an expression: ${expr}`)
  return new Function('x', `return ${js}`) as (x: number) => number
}
const XS = [0, 1, 7, 13, 30]
const sameFn = (f: (x: number) => number, g: (x: number) => number) => XS.every((x) => f(x) === g(x))

/** An equation L = R as the line L − R = a·x + b. */
function lineOf(eq: string): [number, number] {
  const [l, r] = eq.split('=').map(fn)
  const d = (x: number) => l(x) - r(x)
  return [d(1) - d(0), d(0)]
}
/** Two equations are the same when one is a non-zero multiple of the other. */
const sameEq = ([a, b]: [number, number], [c, d]: [number, number]) => a * d === b * c && (a !== 0 || b !== 0) && (c !== 0 || d !== 0) && Math.sign(a || b) * Math.sign(c || d) !== 0

/** The options that fit the question. */
function fits(q: Question): string[] {
  const p = q.prompt!
  const val = (k: string) => q.options[k as 'A'].replace(' years', '')
  let m
  if ((m = p.match(/is (\d+) years old now\. How old (was|will) \w+ (?:be )?(?:in )?(\d+) years( ago)?/))) {
    const want = m[2] === 'was' ? N(m[1]) - N(m[3]) : N(m[1]) + N(m[3])
    return OPTION_KEYS.filter((k) => N(val(k)) === want)
  }
  if (q.table && (m = p.match(/in (\d+) years\?$/))) {
    const b = N(m[1])
    const [, now, , later] = q.table[0]
    expect([now, later]).toEqual(['Now', `In ${b} years`])
    const [f, s] = [N(q.table[1][1]), N(q.table[2][1])]
    const a = N(q.table[0][2].match(/\d+/)![0])
    expect([N(q.table[1][2]), N(q.table[2][2])]).toEqual([f + a, s + a])
    const want = /sum/.test(p) ? f + b + (s + b) : f + b - (s + b)
    return OPTION_KEYS.filter((k) => N(val(k)) === want)
  }
  if ((m = p.match(/Which one means “(?:(twice|three times|four times) )?(?:his|her) age (\d+) years (ago|from now)”/))) {
    const k = m[1] ? WORDS[m[1]] : 1
    const n = N(m[2]) * (m[3] === 'ago' ? -1 : 1)
    return OPTION_KEYS.filter((o) => sameFn(fn(val(o)), (x) => k * (x + n)))
  }
  if ((m = p.match(/elder brother is (\d+) years older\. Which one is the brother’s age (\d+) years ago/))) {
    const [d, n] = [N(m[1]), N(m[2])]
    return OPTION_KEYS.filter((o) => sameFn(fn(val(o)), (x) => x + d - n))
  }
  const ref = (f: (x: number) => number, g: (x: number) => number): [number, number] => {
    const d = (x: number) => f(x) - g(x)
    return [d(1) - d(0), d(0)]
  }
  if ((m = p.match(/A father is (twice|three times|four times|five times|six times) as old as his son\. (?:In (\d+) years, he will be|(\d+) years ago, he was) (twice|three times|four times|five times|six times) as old/))) {
    const [k1, k2] = [WORDS[m[1]], WORDS[m[4]]]
    const t = m[2] ? N(m[2]) : -N(m[3])
    const want = ref((x) => k1 * x + t, (x) => k2 * (x + t))
    return OPTION_KEYS.filter((o) => sameEq(lineOf(val(o)), want))
  }
  if ((m = p.match(/add up to (\d+) years\. In (\d+) years, the father will be (twice|three times|four times) as old/))) {
    const [S, t, k] = [N(m[1]), N(m[2]), WORDS[m[3]]]
    const want = ref((x) => S - x + t, (x) => k * (x + t))
    return OPTION_KEYS.filter((o) => sameEq(lineOf(val(o)), want))
  }
  throw new Error(`unknown question: ${p}`)
}

describe('ageWarmupRound', () => {
  const rng = mulberry32(2026)
  const rounds = Array.from({ length: 300 }, () => ageWarmupRound(rng))

  it('makes rounds of 10, easiest first', () => {
    const order = ['ag-wu-line', 'ag-wu-line', 'ag-wu-line', 'ag-wu-gap', 'ag-wu-gap', 'ag-wu-expr', 'ag-wu-expr', 'ag-wu-expr', 'ag-wu-eqn', 'ag-wu-eqn']
    for (const r of rounds) expect(r.map((q) => q.pattern)).toEqual(order)
  })

  it('every question has exactly one option that fits', () => {
    const kinds = new Set<string>()
    for (const q of rounds.flat()) {
      const ctx = JSON.stringify({ prompt: q.prompt, table: q.table, options: q.options, answer: q.answer })
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      expect(fits(q), ctx).toEqual([q.answer])
      kinds.add(q.prompt!.replace(/\d+|Ravi|Asha|Kiran|Meena|Suresh|Divya|Anil|Lakshmi/g, '#').slice(0, 40))
    }
    // Every kind turns up: 2 time lines, gap and sum, 4 expressions, 3 equations.
    expect(kinds.size).toBeGreaterThanOrEqual(11)
  })

  it('a wrong expression or equation is never the right one in disguise', () => {
    for (const q of rounds.flat().filter((q) => q.pattern === 'ag-wu-expr' || q.pattern === 'ag-wu-eqn')) {
      const keys = OPTION_KEYS.filter((k) => k !== q.answer)
      for (const k of keys)
        if (q.pattern === 'ag-wu-expr') expect(sameFn(fn(q.options[k]), fn(q.options[q.answer])), q.prompt).toBe(false)
        else expect(sameEq(lineOf(q.options[k]), lineOf(q.options[q.answer])), q.prompt).toBe(false)
    }
  })

  it('equations come from real ages: the right one has a whole-number answer above 2', () => {
    for (const q of rounds.flat().filter((q) => q.pattern === 'ag-wu-eqn')) {
      const [a, b] = lineOf(q.options[q.answer])
      const x = -b / a
      expect(Number.isInteger(x) && x > 2, q.prompt).toBe(true)
    }
  })

  it('ages are sensible: no option below 2 years', () => {
    for (const q of rounds.flat().filter((q) => q.pattern === 'ag-wu-line' || q.pattern === 'ag-wu-gap'))
      for (const v of Object.values(q.options)) expect(N(v.replace(' years', '')), q.prompt).toBeGreaterThanOrEqual(2)
  })

  it('has everything in Kannada, and two clues that never give the answer', () => {
    for (const q of rounds.flat()) {
      expect(q.kn?.prompt && q.kn.rule && q.kn.working, q.prompt).toBeTruthy()
      expect(q.kn!.prompt).not.toBe(q.prompt)
      expect(Object.values(q.kn!.options!).every((o) => o.length > 0)).toBe(true)
      expect(q.clues).toHaveLength(2)
      expect(q.kn!.clues).toHaveLength(2)
      if (q.table) expect(q.kn!.table![0][1]).toBe('ಈಗ')
      const ans = q.options[q.answer].replace(' years', '')
      // The last clue sets the step up but leaves the result to the student.
      for (const c of [...q.clues!, ...q.kn!.clues!]) expect(c.includes(`= ${ans}`) || c.endsWith(` ${ans}.`), c).toBe(false)
    }
  })

  it('draws a time line for the time-line questions only, with the asked age as ?', () => {
    for (const q of rounds.flat()) {
      if (q.pattern !== 'ag-wu-line') {
        expect(q.ageLine).toBeUndefined()
        continue
      }
      const marks = q.ageLine!
      expect(marks.map(([, a]) => a).sort()).toEqual([q.prompt!.match(/is (\d+) years old/)![1], '?'].sort())
      expect(marks.some(([y]) => y === 0)).toBe(true)
    }
  })
})
