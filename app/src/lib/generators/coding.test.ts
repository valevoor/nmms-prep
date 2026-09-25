import { describe, expect, it } from 'vitest'
import { generateCoding } from './coding'
import { mulberry32 } from './numberSeries'

// An independent set of codes, written from the chapter's descriptions (not from coding.ts).
const P = (c: string) => c.charCodeAt(0) - 64
const L = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
const each = (w: string, f: (c: string, i: number) => string) => Array.from(w, f).join('')
const back = (w: string) => Array.from(w).reverse().join('')
const CODES: ((w: string) => string)[] = [
  ...[-4, -3, -2, -1, 1, 2, 3, 4, 5].map((k) => (w: string) => each(w, (c) => L(P(c) + k))),
  (w) => each(w, (c, i) => L(P(c) + i + 1)),
  back,
  (w) => each(w, (c) => L(27 - P(c))),
  (w) => (w.length % 2 === 0 ? w.replace(/(.)(.)/g, '$2$1') : '#'),
  ...[-2, -1, 1, 2].map((k) => (w: string) => back(each(w, (c) => L(P(c) + k)))),
  (w) => each(w, (c) => String(P(c))),
]

describe('generateCoding', () => {
  it('exactly one option follows the code shown in the example', () => {
    const rng = mulberry32(23)
    const kinds = new Set<string>()
    for (let n = 0; n < 2000; n++) {
      const q = generateCoding(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      const [, w1, c1, x] = q.prompt!.match(/^If ([A-Z]+) is coded as ([A-Z0-9]+), (?:how is ([A-Z]+) coded|which word is coded as ([A-Z0-9]+))\?$/)!
      const decode = q.prompt!.includes('which word')
      const target = decode ? q.prompt!.match(/coded as ([A-Z0-9]+)\?$/)![1] : x
      const codes = CODES.filter((f) => f(w1) === c1)
      expect(codes.length, ctx).toBeGreaterThan(0)
      const fits = Object.entries(q.options).filter(([, v]) => codes.some((f) => (decode ? f(v) === target : f(target) === v)))
      expect(fits.map(([k]) => k), ctx).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
    }
    expect(kinds.size).toBe(7)
  })
})
