import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { generateNumberMatrix } from './numberMatrix'
import { mulberry32 } from './numberSeries'

// An independent reading (not using numberMatrix.ts): the table is read back, each option is put
// in the blank, and a brute force looks for any simple formula that makes one number of every row,
// or of every column, from the other two. Exactly one option may allow one.
const ONE: ((x: number) => number)[] = [(x) => x, (x) => x ** 2, (x) => x ** 3, (x) => x * 2, (x) => x * 3, (x) => x / 2, (x) => Math.sqrt(x)]
const TWO: ((x: number, y: number) => number)[] = [(x, y) => x + y, (x, y) => x - y, (x, y) => x * y, (x, y) => x / y]
const LAST: ((x: number) => number)[] = [(x) => x, (x) => x ** 2, (x) => x ** 3]
for (let k = 1; k <= 10; k++) LAST.push((x) => x + k, (x) => x - k, (x) => x * k, (x) => x / k)

function someFormula(lines: number[][]): boolean {
  for (let out = 0; out < 3; out++) {
    const ins = [0, 1, 2].filter((k) => k !== out)
    for (const [i, j] of [ins, [...ins].reverse()])
      for (const f of ONE)
        for (const g of ONE)
          for (const op of TWO) {
            const [b0, b1, b2] = lines.map((l) => op(f(l[i]), g(l[j])))
            for (const h of LAST)
              if (Math.abs(h(b0) - lines[0][out]) < 1e-9 && Math.abs(h(b1) - lines[1][out]) < 1e-9 && Math.abs(h(b2) - lines[2][out]) < 1e-9) return true
          }
  }
  return false
}

function fitsWith(q: Question, v: string): boolean {
  const m = q.table!.map((row) => row.map((x) => Number(x === '?' ? v : x)))
  const cols = m[0].map((_, j) => m.map((r) => r[j]))
  return someFormula(m) || someFormula(cols)
}

describe('generateNumberMatrix', () => {
  it('exactly one option fits a rule across the rows or down the columns', () => {
    const rng = mulberry32(27)
    const kinds = new Set<string>()
    let inputBlank = 0
    for (let n = 0; n < 1200; n++) {
      const q = generateNumberMatrix(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      expect(q.table, ctx).toHaveLength(3)
      expect(q.table!.flat().filter((x) => x === '?'), ctx).toHaveLength(1)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      for (const v of Object.values(q.options)) expect(Number(v), ctx).toBeGreaterThan(0)
      const fits = OPTION_KEYS.filter((k) => fitsWith(q, q.options[k]))
      expect(fits, ctx).toEqual([q.answer])
      // Every number fits in a small table cell.
      for (const x of q.table!.flat()) if (x !== '?') expect(Number(x), ctx).toBeLessThanOrEqual(999)
      if (q.working.includes('→ ?')) inputBlank++
    }
    expect([...kinds].sort()).toEqual(['mx-col', 'mx-row'])
    // Some blanks are numbers the rule starts from, so the rule is worked backwards.
    expect(inputBlank).toBeGreaterThan(100)
  }, 60000)
})
