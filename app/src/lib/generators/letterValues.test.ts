import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { generateLetterValues } from './letterValues'
import { mulberry32 } from './numberSeries'

// An independent reading (not using letterValues.ts): the rule and the question are read from the
// English sentence the student sees, each letter's value is worked out from the numbers heading its
// row and column, and every option is tried. Exactly one may fit.
const OPS: Record<string, (r: number, c: number) => number> = {
  '+': (r, c) => r + c,
  '−': (r, c) => r - c,
  '×': (r, c) => r * c,
  '÷': (r, c) => r / c,
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const product = (xs: number[]) => xs.reduce((a, b) => a * b, 1)

function fits(q: Question, opt: string): boolean {
  const p = q.prompt!
  const pairAsk = p.match(/number pairs stands for “([A-Z]+)”/)
  if (pairAsk) {
    const letterAt = (pair: string) => {
      for (const t of [q.table!, q.table2!]) {
        const i = t.findIndex((row, k) => k > 0 && row[0] === pair[0])
        const j = t[0].indexOf(pair[1], 1)
        if (i > 0 && j > 0) return t[i][j]
      }
      return '?'
    }
    return opt.split(', ').map(letterAt).join('') === pairAsk[1]
  }
  const op = OPS[p.match(/row number (.) its column number/)![1]]
  const t = q.table!
  const val = new Map<string, number>()
  t.slice(1).forEach((row) => row.slice(1).forEach((ch, j) => val.set(ch, op(Number(row[0]), Number(t[0][j + 1])))))
  const word = (w: string) => [...w].map((ch) => val.get(ch)!)
  let m
  if ((m = p.match(/code for the letters “([A-Z]+)”/))) return opt === word(m[1]).join(' ')
  if ((m = p.match(/square of the sum of the letters in “([A-Z]+)”/))) return Number(opt) === sum(word(m[1])) ** 2
  if ((m = p.match(/sum of the letters in “([A-Z]+)”/))) return Number(opt) === sum(word(m[1]))
  if ((m = p.match(/product of the letters in “([A-Z]+)”/))) return Number(opt) === product(word(m[1]))
  if ((m = p.match(/has a total of (\d+)/))) return sum(word(opt)) === Number(m[1])
  if ((m = p.match(/has the product (\d+)/))) return product(word(opt)) === Number(m[1])
  if ((m = p.match(/has the code “([\d ]+)”/))) return word(opt).join(' ') === m[1]
  if ((m = p.match(/has the (highest|lowest) (total|product)/))) {
    const score = (w: string) => (m![2] === 'total' ? sum(word(w)) : product(word(w)))
    const all = Object.values(q.options).map(score)
    return score(opt) === (m[1] === 'highest' ? Math.max(...all) : Math.min(...all))
  }
  throw new Error(`unknown question: ${p}`)
}

describe('generateLetterValues', () => {
  it('exactly one option fits', () => {
    const rng = mulberry32(29)
    const kinds = new Set<string>()
    for (let n = 0; n < 2000; n++) {
      const q = generateLetterValues(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      // Letters are all different in a table with a rule; in the two pair tables each is in every row.
      const cells = q.table!.slice(1).flatMap((r) => r.slice(1))
      if (q.pattern === 'lv-pair') expect(new Set(cells).size, ctx).toBe(5)
      else expect(new Set(cells).size, ctx).toBe(cells.length)
      for (const v of Object.values(q.options)) if (/^\d/.test(v)) for (const x of v.split(/[ ,]+/)) expect(Number(x), ctx).toBeGreaterThanOrEqual(0)
      const ok = OPTION_KEYS.filter((k) => fits(q, q.options[k]))
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['lv-diff', 'lv-pair', 'lv-prod', 'lv-quot', 'lv-sum'])
  })
})
