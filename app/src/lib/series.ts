/** Applies an op label such as "+5", "−2", "×2+1", "×2−0" or "÷4" to x. */
export function applyOp(x: number, op: string): number {
  const m = op.replace(/−/g, '-').match(/^(?:([×÷])(\d+))?([+-]\d+)?$/)
  if (!m || (!m[1] && !m[3])) throw new Error(`Unknown op "${op}"`)
  let v = x
  if (m[1] === '×') v *= Number(m[2])
  if (m[1] === '÷') v /= Number(m[2])
  if (m[3]) v += Number(m[3])
  return v
}

/** Fills the blanks ('?') in terms with the answer text ("11, 34" fills two blanks). */
export function fillBlanks(terms: string[], answer: string): string[] {
  const parts = answer.split(',').map((s) => s.trim())
  let k = 0
  return terms.map((t) => (t === '?' ? (parts[k++] ?? '?') : t))
}

/** Plain-text version of a question's terms, e.g. "1, 4, 9, ?" or "28 : 4 :: 504 : ?". */
export function termsText(terms: string[], layout?: 'series' | 'analogy'): string {
  if (layout !== 'analogy') return terms.join(', ')
  const [a, b, c, d] = terms
  return `${a} : ${b} :: ${c} : ${d}`
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}
