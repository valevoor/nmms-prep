/**
 * Checks every Letter–Number Analogy book question: each question's rule is written again here,
 * applied to the first pair (it must give B from A) and then to C. Exactly one option must match
 * the result, and it must be the marked one. Hidden questions must have no matching option.
 * Run from app/:  npx tsx ../tools/check_letter_number_analogy.ts
 */
import data from '../app/src/data/mat/letter-number-analogy.json' with { type: 'json' }

const P = (c: string) => c.charCodeAt(0) - 64
const L = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
const opp = (c: string) => L(27 - P(c))
const sum = (w: string) => Array.from(w).reduce((s, c) => s + P(c), 0)
const shift = (steps: number[]) => (w: string) => Array.from(w, (c, i) => L(P(c) + steps[i])).join('')
const frac = (f: (w: string) => string) => (x: string) => x.split('/').map(f).join('/')

/** For each question: a rule mapping the first term to the second (and C to the answer). */
const RULES: Record<string, (x: string) => string> = {
  'ln-b01': (w) => Array.from(w, (c) => L(P(c) - 1) + L(P(c) + 1)).join(''),
  'ln-b02': shift([2, -2, 3, -3, 4, -4]),
  'ln-b04': (w) => Array.from(w, (c) => String(P(c) ** 2)).join('/'),
  'ln-b05': (w) => {
    const a = Array.from(w)
    return a.filter((_, i) => i % 2 === 0).join('') + a.filter((_, i) => i % 2 === 1).reverse().join('')
  },
  'ln-b06': shift([5, -5, -5, 5]),
  'ln-b07': (w) => w.replace(/[A-Z]|\d+/g, (t) => (/\d/.test(t) ? L(Number(t)) : String(P(t)))),
  'ln-b08': frac((w) => String(Math.round(Math.cbrt(sum(w))))),
  'ln-b09': (x) => x.split('/').reverse().map((w) => Array.from(w, opp).join('')).join('/'),
  'ln-b10': (w) => String(Math.sqrt(sum(w.slice(1)))),
  'ln-b11': (x) => String(2 * sum(x.replace('/', ''))),
  'ln-b12': shift([2, 3, 4]),
  'ln-b13': (w) => Array.from(w).reverse().map((c, i) => (i % 2 === 0 ? String(P(c)) : opp(c))).join(''),
  'ln-b14': (w) => String(sum(w) / 2),
  'ln-b15': (w) => String(sum(w) ** 2),
}
/** Q3 hides the letter: M : 196 :: ? : 289, with (place + 1)². */
const LETTER_RULE = (c: string) => String((P(c) + 1) ** 2)

let bad = 0
for (const q of data.questions) {
  const [a, b, c, d] = q.terms
  const opts = Object.entries(q.options)
  let fits: string[]
  let want: string
  if (q.id === 'ln-b03') {
    if (LETTER_RULE(a) !== b) throw new Error(`Q${q.bookNo}: rule does not give ${b}`)
    want = `the letter that gives ${d}`
    fits = opts.filter(([, v]) => LETTER_RULE(v) === d).map(([k]) => k)
  } else {
    const rule = RULES[q.id]
    if (rule(a) !== b) {
      bad++
      console.log(`✗ Q${q.bookNo}: the rule gives ${rule(a)} from ${a}, not ${b}`)
      continue
    }
    want = rule(c)
    fits = opts.filter(([, v]) => v === want).map(([k]) => k)
  }
  if ('status' in q) {
    if (fits.length === 0) console.log(`✓ Q${q.bookNo}: hidden; the answer is ${want}, which the book does not print`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but option ${fits.join(', ')} fits`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${want}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: rule gives ${want}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
