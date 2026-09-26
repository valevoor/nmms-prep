/**
 * Checks every Number Sequence book question by counting in the printed sequence directly.
 * Exactly one option must equal the count and be marked; hidden questions must have no right option.
 * Run from app/:  npx tsx ../tools/check_number_sequence.ts
 */
import data from '../app/src/data/mat/number-sequence.json' with { type: 'json' }

const prime = (n: number) => n > 1 && [...Array(n).keys()].slice(2).every((d) => n % d !== 0)
const square = (n: number) => n >= 0 && Number.isInteger(Math.sqrt(n))
const vowel = (c: string) => 'aeiou'.includes(c.toLowerCase())
const odd = (n: number) => Math.abs(n % 2) === 1
/** Counts windows of `k` neighbours that pass `f`. */
const count = <T,>(s: T[], k: number, f: (...w: T[]) => boolean) => s.slice(0, s.length - k + 1).filter((_, i) => f(...s.slice(i, i + k))).length

const RULES: Record<string, (s: string[]) => string> = {
  'ns2-b01': (s) => String(count(s.map(Number), 2, (a, b) => prime(a) && !odd(b))),
  'ns2-b02': (s) => String(count(s.map(Number), 3, (a, b, c) => !odd(a) && odd(b) && !odd(c))),
  'ns2-b03': (s) => String(count(s.map(Number), 3, (a, b, c) => prime(a) && !odd(b) && prime(c))),
  'ns2-b04': (s) => String(count(s.map(Number), 2, (a, b) => 4 % a === 0 && odd(b))),
  'ns2-b05': (s) => String(count(s.map(Number), 3, (a, b, c) => odd(a) && !odd(b) && b > 3 && odd(c))),
  'ns2-b06': (s) => String(count(s, 3, (a, b, c) => vowel(a) && !vowel(b) && vowel(c))),
  'ns2-b07': (s) => String(count(s.map(Number), 2, (a, b) => Math.abs(a - b) === 3)),
  'ns2-b08': (s) => s[8 - 1 - 6],
  'ns2-b09': (s) => String(count(s, 2, (a, b) => vowel(a) && b === 'K')),
  'ns2-b10': (s) => String(count(s.map(Number), 3, (a, b, c) => odd(a) && square(b) && odd(c))),
  'ns2-b11': (s) => String(count(s.map(Number), 2, (a, b) => square(a) && odd(b))),
  'ns2-b12': (s) => String(count(s, 3, (a, b, c) => b === 'p' && vowel(a) && vowel(c))),
  'ns2-b13': (s) => String(count(s.map(Number), 2, (a, b) => a + b !== 5)),
  'ns2-b14': (s) => s[(s.length - 1) / 2 - 3],
  'ns2-b15': (s) => String(count(s.map(Number), 2, (a, b) => prime(a) && prime(b))),
  'ns2-b16': (s) => String(count(s.map(Number), 3, (a, b, c) => b === 2 && square(a) && square(c))),
  'ns2-b17': (s) => String(count(s.map(Number), 3, (a, b, c) => a === 8 && b === 7 && c !== 3)),
  'ns2-b18': (s) => String(count(s.map(Number), 3, (a, b, c) => a !== 4 && b === 2 && c === 1)),
  'ns2-b19': (s) => String(s.filter((c, i) => prime(i + 1) && !vowel(c)).length),
  'ns2-b20': (s) => String(s.filter((c, i) => (i + 1) % 2 === 0 && vowel(c)).length),
}

let bad = 0
for (const q of data.questions) {
  const want = RULES[q.id](q.terms)
  const fits = Object.entries(q.options).filter(([, v]) => v === want).map(([k]) => k)
  if ('status' in q) {
    if (fits.length === 0) console.log(`✓ Q${q.bookNo}: hidden; the count is ${want}, and no option says it`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but option ${fits.join(', ')} says ${want}`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${want}  →  ${q.answer}${q.keyFrom === 'solved' ? ' (solved; book key differs)' : ''}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: count is ${want}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
