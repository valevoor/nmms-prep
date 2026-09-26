import { describe, expect, it } from 'vitest'
import { mulberry32 } from './numberSeries'
import { generateSequence } from './sequence'

// Independent counter: reads the English question and counts in the sequence itself.
const prime = (n: number) => [2, 3, 5, 7].includes(n)
const square = (n: number) => [1, 4, 9].includes(n)
const vowel = (c: string) => 'AEIOU'.includes(c)
function count(p: string, t: string[]): number {
  const n = t.map(Number)
  let c = 0
  for (let i = 0; i < t.length; i++) {
    const [a, b, d] = [n[i - 1], n[i], n[i + 1]]
    if (p.includes('even number come immediately after a prime') && i > 0 && prime(a) && b % 2 === 0) c++
    if (p.includes('odd number come between two even') && i > 0 && i < t.length - 1 && a % 2 === 0 && b % 2 === 1 && d % 2 === 0) c++
    if (p.includes('even number come between two prime') && i > 0 && i < t.length - 1 && prime(a) && b % 2 === 0 && prime(d)) c++
    if (p.includes('odd number come immediately after a square') && i > 0 && square(a) && b % 2 === 1) c++
    let m = p.match(/differ by (\d+)/)
    if (m && i > 0 && Math.abs(a - b) === Number(m[1])) c++
    m = p.match(/add up to (\d+)/)
    if (m && i > 0 && a + b === Number(m[1])) c++
    m = p.match(/how many (\d)s come immediately after (\d) but are not immediately followed by (\d)/)
    if (m && b === Number(m[1]) && a === Number(m[2]) && d !== Number(m[3])) c++
    if (p.includes('consonant come between two vowels') && i > 0 && i < t.length - 1 && vowel(t[i - 1]) && !vowel(t[i]) && vowel(t[i + 1])) c++
    m = p.match(/the letter (\w) come immediately after a vowel/)
    if (m && i > 0 && t[i] === m[1] && vowel(t[i - 1])) c++
  }
  return c
}

describe('generateSequence', () => {
  it('the marked count is the real count, and only one option says it', () => {
    const rng = mulberry32(20)
    for (let n = 0; n < 3000; n++) {
      const q = generateSequence(rng)
      const want = String(count(q.prompt!, q.terms))
      const fits = Object.entries(q.options).filter(([, v]) => v === want)
      expect(fits.map(([k]) => k), JSON.stringify(q)).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size).toBe(4)
    }
  })
})
