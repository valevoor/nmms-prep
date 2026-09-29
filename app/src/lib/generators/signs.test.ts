import { describe, expect, it } from 'vitest'
import type { Question } from '../../types'
import { mulberry32 } from './numberSeries'
import { generateSigns } from './signs'

// An independent reading (not using signs.ts or arithmetic.ts): the option is put into the
// statement and JavaScript works out and compares the two sides.
const RELATIONS = ['=', '<', '>']
const js = (s: string[]) => s.join(' ').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
function holds(t: string[]): boolean {
  const at = t.flatMap((x, i) => (RELATIONS.includes(x) ? [i] : []))
  if (at.length !== 1 || at[0] === 0 || at[0] === t.length - 1) return false
  const l = Number(new Function(`return ${js(t.slice(0, at[0]))}`)())
  const r = Number(new Function(`return ${js(t.slice(at[0] + 1))}`)())
  if (!Number.isFinite(l) || !Number.isFinite(r)) return false
  return { '=': Math.abs(l - r) < 1e-9, '<': l < r - 1e-9, '>': l > r + 1e-9 }[t[at[0]]]!
}

function readOption(q: Question, opt: string): string[] {
  const t = q.terms[0].split(' ')
  if (q.pattern === 'sign-fill') {
    const signs = opt.split(', ')
    expect(t.filter((x) => x === '*')).toHaveLength(signs.length)
    let k = 0
    return t.map((x) => (x === '*' ? signs[k++] : x))
  }
  const [a, b] = opt.split(' & ')
  // Each token appears once, so the swap is clear.
  expect(t.filter((x) => x === a)).toHaveLength(1)
  expect(t.filter((x) => x === b)).toHaveLength(1)
  return t.map((x) => (x === a ? b : x === b ? a : x))
}

describe('generateSigns', () => {
  it('exactly one option makes the statement true', () => {
    const rng = mulberry32(26)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateSigns(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const fits = Object.entries(q.options)
        .filter(([, v]) => holds(readOption(q, v)))
        .map(([k]) => k)
      expect(fits, ctx).toEqual([q.answer])
      if (q.pattern === 'sign-swap') expect(holds(q.terms[0].split(' ')), ctx).toBe(false)
      // Every number is small enough for mental work.
      for (const x of q.terms[0].split(' ')) if (/^\d+$/.test(x)) expect(Number(x), ctx).toBeLessThanOrEqual(200)
    }
    expect(kinds.size).toBe(2)
  })
})
