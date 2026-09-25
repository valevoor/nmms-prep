/**
 * Checks every Letter Series book question: an independent rule rebuilds the whole series,
 * which must match every printed term, be completed by the marked answer, and by no other option.
 * Run from app/:  npx tsx ../tools/check_letter_series.ts
 */
import data from '../app/src/data/mat/letter-series.json' with { type: 'json' }

/** A=1 … Z=26, wrapping round (27 is A again). */
const L = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
const P = (c: string) => c.charCodeAt(0) - 64
/** Walks from a letter by the given jumps. */
const walk = (start: string, steps: number[]) => steps.reduce((s, d) => [...s, L(P(s[s.length - 1]) + d)], [start])
const range = (n: number) => Array.from({ length: n }, (_, i) => i)
/** Terms built position by position: each position is its own letter series. */
const zip = (...cols: string[][]) => cols[0].map((_, i) => cols.map((c) => c[i]).join(''))
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
const VOWELS = ['A', 'E', 'I', 'O', 'U']

const RULES: Record<string, () => string[]> = {
  'ls-b01': () => walk('K', [2, 3, 4, 5, 6]),
  'ls-b02': () => zip(walk('B', [5, 5, 5, 5]), walk('Y', [-5, -5, -5, -5])),
  'ls-b03': () => zip(walk('C', [1, 1, 1, 1]), VOWELS, walk('X', [-1, -1, -1, -1])),
  'ls-b04': () => {
    const odd = walk('C', [1, 1, 1, 1, 1])
    const even = walk('K', [1, 1, 1, 1, 1])
    return range(11).map((i) => (i % 2 === 0 ? odd[i / 2] : even[(i - 1) / 2]))
  },
  'ls-b05': () => range(5).map((i) => [0, 2, 1].map((k) => L(5 + 3 * i + k)).join('')),
  'ls-b06': () => range(4).map((i) => 'ENVIRONMENT'.slice(i, 11 - i)),
  'ls-b07': () => walk('G', [3, 3, 3, 3, 3, 3]),
  'ls-b08': () => zip(walk('Z', [-2, -2, -2, -2]), ['2', '4', '6', '8', '10'], walk('A', [3, 3, 3, 3])),
  'ls-b09': () => range(4).map((i) => [0, 2, 3, 1].map((k) => L(1 + 4 * i + k)).join('')),
  'ls-b10': () => zip(walk('X', [-2, -2, -2, -2]), walk('C', [2, 2, 2, 2])),
  'ls-b11': () => walk('B', [5, 5, 5, 5, 5]),
  'ls-b12': () => zip(walk('K', [1, 1, 1, 1]), walk('F', [-1, -1, -1, -1]), walk('U', [1, 1, 1, 1])),
  'ls-b13': () => walk('B', [2, 2, 3, 3, 4, 4]),
  'ls-b14': () => zip(walk('B', [2, 2, 2, 2]), walk('C', [3, 3, 3, 3])),
  'ls-b15': () => zip(walk('B', [2, 2, 2, 2]), walk('D', [3, 3, 3, 3]), walk('F', [5, 5, 5, 5])),
  'ls-b16': () => zip(['2', '4', '8', '16', '32'], walk('A', [1, 2, 3, 4]), ['10', '12', '15', '19', '24']),
  'ls-b17': () => range(5).map((i) => L(22 - 2 * i) + L(21 - 2 * i) + L(5 + 2 * i) + L(6 + 2 * i)),
  'ls-b18': () => range(4).map((i) => `X${PRIMES[3 * i]}Y${PRIMES[3 * i + 1]}Z${PRIMES[3 * i + 2]}`),
  'ls-b19': () => range(4).map((i) => [1, 2, 0].map((k) => L(4 + 3 * i + k)).join('')),
  'ls-b20': () => range(5).map((i) => {
    const a = L(11 + 2 * Math.floor(i / 2))
    const b = L(12 + 2 * Math.floor(i / 2))
    return i % 2 === 0 ? `${a}B${b}` : `${b}B${a}`
  }),
  'ls-b21': () => walk('D', [4, 4, 4, 4]).map((c) => `${c}-${P(c)}`),
}

/** Puts an option's value(s) into the blank(s): "O, H" fills two blanks. */
const fill = (terms: string[], value: string) => {
  const parts = value.split(',').map((s) => s.trim())
  let k = 0
  return terms.map((t) => (t === '?' ? (parts[k++] ?? '?') : t))
}

let bad = 0
for (const q of data.questions) {
  const rule = RULES[q.id]
  if (!rule) {
    console.log(`✗ ${q.id}: no rule`)
    bad++
    continue
  }
  const expected = rule().join(' ')
  const fits = Object.entries(q.options).filter(([, v]) => fill(q.terms, v).join(' ') === expected).map(([k]) => k)
  const ok = fits.length === 1 && fits[0] === q.answer
  if (!ok) {
    bad++
    console.log(`✗ Q${q.bookNo}: expected ${expected}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
  } else console.log(`✓ Q${q.bookNo}: ${expected}  →  ${q.answer}${q.keyFrom === 'solved' ? ' (solved; book key differs)' : ''}`)
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
