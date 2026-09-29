import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { generateLetterMatrix } from './letterMatrix'
import { mulberry32 } from './numberSeries'

// An independent reading (not using letterMatrix.ts): the table is read back with letters as their
// places (A = 1 … Z = 26), each option is put in the blank, and a brute force looks for any simple
// rule that makes one cell of every row, or of every column, from one or two others:
//   x + k round the alphabet (letters only), x + k, 27 − x + k, x × k, x ÷ k, or x op y + k.
// The rule must use the blank's place in the line. Exactly one option may allow one.
const num = (s: string) => (/^[A-Z]$/.test(s) ? s.charCodeAt(0) - 64 : Number(s))
const isLetter = (s: string) => /^[A-Z]$/.test(s)
const eq = (a: number, b: number) => Math.abs(a - b) < 1e-9

const ONE: ((x: number, k: number) => number)[] = [(x, k) => x + k, (x, k) => 27 - x + k, (x, k) => x * k, (x, k) => x / k]
const TWO: ((x: number, y: number) => number)[] = [(x, y) => x + y, (x, y) => x - y, (x, y) => x * y, (x, y) => x / y]

function someRule(cells: string[][], blank: number): boolean {
  const lines = cells.map((l) => l.map(num))
  const letters = cells.map((l) => l.map(isLetter))
  const all = (f: (l: number[], n: number) => boolean) => lines.every(f)
  for (let out = 0; out < 3; out++)
    for (let i = 0; i < 3; i++) {
      if (i === out) continue
      const uses = (j?: number) => blank === out || blank === i || blank === j
      if (uses() && letters.every((l) => l[out] && l[i]))
        for (let k = 0; k < 26; k++) if (all((l) => (l[i] + k - l[out]) % 26 === 0)) return true
      if (uses()) for (const f of ONE) for (let k = -30; k <= 30; k++) if (all((l) => eq(f(l[i], k), l[out]))) return true
      for (let j = 0; j < 3; j++) {
        if (j === out || j === i || !uses(j)) continue
        for (const op of TWO) for (let k = -30; k <= 30; k++) if (all((l) => eq(op(l[i], l[j]) + k, l[out]))) return true
      }
    }
  return false
}

function fitsWith(q: Question, v: string): boolean {
  const r = q.table!.findIndex((row) => row.includes('?'))
  const c = q.table![r].indexOf('?')
  const m = q.table!.map((row) => row.map((x) => (x === '?' ? v : x)))
  const cols = m[0].map((_, j) => m.map((row) => row[j]))
  return someRule(m, c) || someRule(cols, r)
}

describe('generateLetterMatrix', () => {
  it('exactly one option fits a rule across the rows or down the columns', () => {
    const rng = mulberry32(28)
    const kinds = new Set<string>()
    let numberBlank = 0
    for (let n = 0; n < 1200; n++) {
      const q = generateLetterMatrix(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      expect(q.table, ctx).toHaveLength(3)
      expect(q.table!.flat().filter((x) => x === '?'), ctx).toHaveLength(1)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const letterOpts = Object.values(q.options).filter(isLetter).length
      expect([0, 4], ctx).toContain(letterOpts)
      if (!letterOpts) numberBlank++
      for (const x of q.table!.flat()) if (x !== '?' && !isLetter(x)) expect(Number(x), ctx).toBeGreaterThan(0)
      const fits = OPTION_KEYS.filter((k) => fitsWith(q, q.options[k]))
      expect(fits, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['mx-lcalc', 'mx-lnum', 'mx-lstep'])
    // Some blanks are numbers (how many letters are skipped, or a place).
    expect(numberBlank).toBeGreaterThan(100)
  }, 60000)
})
