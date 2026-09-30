import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import { generateAgeProblem } from './ageProblems'
import { mulberry32 } from './numberSeries'

// An independent reading (not using ageProblems.ts): the English question is parsed and every
// whole-number age (or pair of ages) from 1 to 120 is tried against it, collecting the asked value
// of every one that fits. There must be exactly one value, and exactly one option may give it.
const AGES = Array.from({ length: 120 }, (_, i) => i + 1)
const PAIRS = AGES.flatMap((a) => AGES.map((b) => [a, b] as const))
const ratio = (a: number, b: number, m: number, n: number) => a * n === b * m
const N = (s: string) => Number(s)

function values(p: string): string[] {
  let m
  if ((m = p.match(/age after (\d+) years will be (\d+) times \w+’s age (\d+) years ago/))) {
    const [a, k, b] = [N(m[1]), N(m[2]), N(m[3])]
    return AGES.filter((x) => x > b && x + a === k * (x - b)).map(String)
  }
  if ((m = p.match(/father and his son is (\d+) years\. After (\d+) years, the father’s age will be (\d+) times the son’s\. What is the (father|son)’s/))) {
    const [sum, t, k] = [N(m[1]), N(m[2]), N(m[3])]
    return PAIRS.filter(([f, s]) => f + s === sum && f + t === k * (s + t)).map(([f, s]) => String(m![4] === 'father' ? f : s))
  }
  if ((m = p.match(/is (\d+) years old and \w+ is (\d+) years old\. How many years ago was the ratio of their ages (\d+) : (\d+)/))) {
    const [a, b, r, s] = [N(m[1]), N(m[2]), N(m[3]), N(m[4])]
    return AGES.filter((y) => y < a && y < b && ratio(a - y, b - y, r, s)).map(String)
  }
  if ((m = p.match(/father is (\d+) times as old as his son\. After (\d+) years, he will be (\d+) times as old as his son\. What is the (sum|father|son)/))) {
    const [k1, t, k2] = [N(m[1]), N(m[2]), N(m[3])]
    return PAIRS.filter(([f, s]) => f === k1 * s && f + t === k2 * (s + t)).map(([f, s]) => String(m![4] === 'sum' ? f + s : m![4] === 'father' ? f : s))
  }
  if ((m = p.match(/present ages of \w+ and (\w+) is (\d+) : (\d+)\. After (\d+) years, the ratio will be (\d+) : (\d+)\. What is (the difference|\w+’s present age)/))) {
    const [a, b, t, c, d] = [N(m[2]), N(m[3]), N(m[4]), N(m[5]), N(m[6])]
    return PAIRS.filter(([x, y]) => ratio(x, y, a, b) && ratio(x + t, y + t, c, d)).map(([x, y]) => String(m![7] === 'the difference' ? Math.abs(y - x) : y))
  }
  if ((m = p.match(/^(\d+) years ago, the ratio of the ages of A and B was (\d+) : (\d+), and \d+ years from now it will be (\d+) : (\d+)/))) {
    const [t, a, b, c, d] = [N(m[1]), N(m[2]), N(m[3]), N(m[4]), N(m[5])]
    return PAIRS.filter(([x, y]) => x > t && y > t && ratio(x - t, y - t, a, b) && ratio(x + t, y + t, c, d)).map(([x, y]) => `${x}, ${y}`)
  }
  throw new Error(`unknown question: ${p}`)
}

describe('generateAgeProblem', () => {
  it('the question has one answer, and exactly one option gives it', () => {
    const rng = mulberry32(37)
    const kinds = new Set<string>()
    for (let n = 0; n < 1000; n++) {
      const q = generateAgeProblem(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify({ prompt: q.prompt, options: q.options, answer: q.answer })
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const found = new Set(values(q.prompt!))
      expect(found.size, ctx).toBe(1)
      const ok = OPTION_KEYS.filter((k) => found.has(q.options[k].replace(' years', '')))
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['ag-ratio', 'ag-sum', 'ag-times'])
  }, 60000)
})
