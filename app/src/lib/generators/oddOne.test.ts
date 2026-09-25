import { describe, expect, it } from 'vitest'
import { mulberry32 } from './numberSeries'
import { generateOddOne } from './oddOne'

// Independent checks, written from the family descriptions rather than the generator's code.
const digits = (x: number) => String(x).split('').map(Number)
const prime = (n: number) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0)
const nth = (s: string, i: number) => Number(s.split(', ')[i])
const FORMULAS = [
  (n: number) => n * n,
  (n: number) => n * n + 1,
  (n: number) => n * n - 1,
  (n: number) => 2 * n * n,
  (n: number) => n * n + n,
  (n: number) => n * n - n,
  (n: number) => n ** 3,
  (n: number) => 3 * n + 1,
  (n: number) => 2 * n + 3,
  (n: number) => 7 * n,
]

/** For each family: does an item fit the rule the other three share? Some families try each variant. */
const FITS: Record<string, (items: string[]) => ((s: string) => boolean)[]> = {
  prime: () => [(s) => prime(Number(s))],
  square: () => [(s) => Number.isInteger(Math.sqrt(Number(s)))],
  cube: () => [(s) => Math.round(Math.cbrt(Number(s))) ** 3 === Number(s)],
  divisible: () => [7, 11, 13].map((k) => (s: string) => Number(s) % k === 0),
  'middle-sum': () => [(s) => { const [a, b, c] = digits(Number(s)); return a + c === b }],
  'middle-product': () => [(s) => { const [a, b, c] = digits(Number(s)); return a * c === b }],
  'digit-total': (items) => items.map((it) => { const t = digits(Number(it)).reduce((x, y) => x + y, 0); return (s: string) => digits(Number(s)).reduce((x, y) => x + y, 0) === t }),
  pair: () => FORMULAS.map((f) => (s: string) => f(nth(s, 0)) === nth(s, 1)),
}

describe('generateOddOne', () => {
  it('exactly one option breaks the rule, and it is the answer', () => {
    const rng = mulberry32(18)
    const seen = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateOddOne(rng)
      const family = q.id.split('-').slice(2, -2).join('-')
      seen.add(family)
      const items = Object.values(q.options)
      const ctx = JSON.stringify(q)
      expect(new Set(items).size, ctx).toBe(4)
      // Some variant of the family's rule must fit exactly the three non-answer options.
      const ok = FITS[family](items).some((fits) => {
        const breaking = Object.entries(q.options).filter(([, v]) => !fits(v)).map(([k]) => k)
        return breaking.length === 1 && breaking[0] === q.answer
      })
      expect(ok, ctx).toBe(true)
    }
    expect(seen.size).toBe(Object.keys(FITS).length)
  })

  it('no simple property points to a different option', () => {
    const rng = mulberry32(81)
    const props = [
      (x: number) => x % 2,
      (x: number) => prime(x),
      (x: number) => Number.isInteger(Math.sqrt(x)),
      (x: number) => x % 3 === 0,
      (x: number) => x % 5 === 0,
      (x: number) => String(x).length,
    ]
    for (let n = 0; n < 3000; n++) {
      const q = generateOddOne(rng)
      const items = Object.values(q.options)
      const answerIdx = Object.keys(q.options).indexOf(q.answer)
      for (let c = 0; c < items[0].split(', ').length; c++) {
        for (const p of props) {
          const v = items.map((s) => p(nth(s, c)))
          const lonely = v.flatMap((x, i) => (v.filter((y) => y === x).length === 1 ? [i] : []))
          if (lonely.length === 1) expect(lonely[0], JSON.stringify(q)).toBe(answerIdx)
        }
      }
    }
  })
})
