import { describe, expect, it } from 'vitest'
import type { PatternId } from '../../types'
import { fillBlanks } from '../series'
import { generateLetterSeries, LETTER_PATTERNS } from './letterSeries'
import { mulberry32 } from './numberSeries'

// Independent checks: written from the pattern descriptions, not from the generator's code.
const P = (c: string) => c.charCodeAt(0) - 64
/** Forward distance from a to b round the alphabet (0–25). */
const gap = (a: string, b: string) => (((P(b) - P(a)) % 26) + 26) % 26
const gaps = (s: string[]) => s.slice(1).map((x, i) => gap(s[i], x))
const constant = (v: number[]) => v.every((x) => x === v[0])

function fits(p: PatternId, t: string[]): boolean {
  const single = t.every((x) => /^[A-Z]$/.test(x))
  switch (p) {
    case 'letter-step':
      return single && constant(gaps(t)) && gaps(t)[0] !== 0
    case 'letter-growing': {
      // Either each jump is one more than the last (+2, +3, +4…) or jumps come in pairs (+2, +2, +3, +3…).
      const g = gaps(t)
      const byOne = g.slice(1).every((x, i) => x === g[i] + 1)
      const pairs = g.every((x, i) => x === g[0] + Math.floor(i / 2))
      return single && (byOne || pairs)
    }
    case 'letter-alternating': {
      const odd = t.filter((_, i) => i % 2 === 0)
      const even = t.filter((_, i) => i % 2 === 1)
      return single && constant(gaps(odd)) && constant(gaps(even))
    }
    case 'letter-groups': {
      const n = t[0].length
      return t.every((x) => x.length === n && /^[A-Z]+$/.test(x)) && Array.from({ length: n }, (_, k) => constant(gaps(t.map((x) => x[k])))).every(Boolean)
    }
    case 'letter-block': {
      const n = t[0].length
      const rows = t.map((x) => [...x].sort())
      const contiguous = rows.every((r) => r.every((c, k) => k === 0 || P(c) === P(r[k - 1]) + 1))
      const next = rows.slice(1).every((r, i) => P(r[0]) === P(rows[i][0]) + n)
      const orderOf = (x: string, r: string[]) => [...x].map((c) => r.indexOf(c)).join()
      return contiguous && next && t.every((x, i) => orderOf(x, rows[i]) === orderOf(t[0], rows[0]))
    }
    case 'letter-position': {
      const parts = t.map((x) => x.match(/^([A-Z])-(\d+)$/))
      return parts.every((m) => m && P(m[1]) === Number(m[2])) && constant(gaps(parts.map((m) => m![1])))
    }
    default:
      return false
  }
}

describe('generateLetterSeries', () => {
  it.each(LETTER_PATTERNS)('%s: the answer fits and no other option does', (p) => {
    const rng = mulberry32(P(p[7]) * 97)
    for (let n = 0; n < 1000; n++) {
      const q = generateLetterSeries(rng, p)
      const ctx = JSON.stringify(q)
      const opts = Object.values(q.options)
      expect(new Set(opts).size, ctx).toBe(4)
      expect(fits(p, fillBlanks(q.terms, q.options[q.answer])), ctx).toBe(true)
      for (const [k, v] of Object.entries(q.options)) if (k !== q.answer) expect(fits(p, fillBlanks(q.terms, v)), `${k} ${ctx}`).toBe(false)
      // The working ends at the answer.
      for (const part of q.options[q.answer].split(', ')) expect(q.working, ctx).toContain(part)
    }
  })

  it('picks a pattern when none is given', () => {
    const rng = mulberry32(21)
    const seen = new Set(Array.from({ length: 300 }, () => generateLetterSeries(rng).pattern))
    expect(seen.size).toBe(LETTER_PATTERNS.length)
  })
})
