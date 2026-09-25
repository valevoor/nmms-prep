/**
 * Checks every "Odd one out: numbers" book question: an independent rule must hold for exactly
 * three options, and the one it fails must be the marked answer.
 * Questions marked needs-review are checked against the book's rule and listed separately.
 * Run from app/:  npx tsx ../tools/check_odd_one.ts
 */
import data from '../app/src/data/mat/odd-one-numbers.json' with { type: 'json' }

const nums = (s: string) => s.split(/[,/]/).map((x) => Number(x.trim()))
const digits = (x: number | string) => String(x).split('').map(Number)
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
const isPrime = (n: number) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d !== 0)
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))
const isCube = (n: number) => Math.round(Math.cbrt(n)) ** 3 === n
const place = (c: string) => c.charCodeAt(0) - 64

/** Does this option follow the rule the other three share? */
const RULES: Record<string, (option: string) => boolean> = {
  'oo-b01': (o) => { const [a, b, c] = digits(o); return a + c === b },
  'oo-b02': (o) => [3, 4, 5, 6].some((n) => n * n - n + 1 === Number(o)),
  'oo-b03': (o) => sum(digits(o)) === 20,
  'oo-b04': (o) => { const [n, m] = nums(o); return n * n + n + 1 === m },
  'oo-b05': (o) => o === [...o].reverse().join(''),
  'oo-b06': (o) => { const [a, b, c] = nums(o); return a ** 3 + b ** 2 === c },
  'oo-b07': (o) => { const [d, l] = o.split('/'); return [...d].reverse().join('') === [...l].map(place).join('') },
  'oo-b08': (o) => { const [a, b] = nums(o); return sum(digits(a)) === sum(digits(b)) },
  'oo-b09': (o) => { const [a, b] = nums(o); return digits(a).reduce((p, x) => p * x, 1) === b },
  'oo-b10': (o) => { const [a, b, c] = digits(o); return a - b === c },
  'oo-b11': (o) => isCube(Number(o) + 1),
  'oo-b12': (o) => { const [a, b] = nums(o); return isSquare(a + b) },
  'oo-b13': (o) => { const [a, b, c] = digits(o); return a * c === b },
  'oo-b14': (o) => isPrime(Number(o)),
  'oo-b15': (o) => Number(o[0] + o[2]) === place(o[1]),
  'oo-b16': (o) => [1, 2, 3, 4, 5, 6].some((n) => n ** 3 + n === Number(o)),
  'oo-b17': (o) => { const [a, b] = nums(o); return a === 7 * b },
  'oo-b18': (o) => { const [a, b] = nums(o); return 3 * a + 1 === b },
  'oo-b19': (o) => { const [a, b] = nums(o); return 2 * a * a === b },
  'oo-b20': (o) => [2, 3, 5, 7, 11].some((n) => 3 * n * n + 1 === Number(o)),
  'oo-b21': (o) => Number(o) % 11 === 0,
  'oo-b22': (o) => isCube(Number(o)) && Math.round(Math.cbrt(Number(o))) % 2 === 1,
  'oo-b23': (o) => { const d = digits(o); return d[0] + d[1] + d[2] === d[3] },
  'oo-b24': (o) => { const [n, m] = nums(o); return n * n - n === m },
  'oo-b25': (o) => { const [a, b] = nums(o); return sum(digits(a)) / 2 === b },
}

let bad = 0
for (const q of data.questions) {
  const rule = RULES[q.id]
  if (!rule) {
    console.log(`✗ Q${q.bookNo}: no rule`)
    bad++
    continue
  }
  const odd = Object.entries(q.options).filter(([, v]) => !rule(v)).map(([k]) => k)
  const review = 'status' in q ? ' (needs review, hidden)' : ''
  if (odd.length === 1 && odd[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as keyof typeof q.options]} is the odd one  →  ${q.answer}${review}`)
  else {
    bad++
    console.log(`✗ Q${q.bookNo}: options that break the rule: ${odd.join(', ') || 'none'}; marked ${q.answer}`)
  }
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
