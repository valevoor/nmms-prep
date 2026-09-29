/**
 * Checks every Letter Matrix book question. Each option is written into the matrix, every letter
 * becomes its place in the alphabet (A = 1 … Z = 26), and the question's rule, typed in below from
 * the book's solution, is tested in every row or column. Exactly one option must make the rule
 * hold everywhere, and it must be the marked one; hidden questions must have more than one (or none).
 * Run from app/:  npx tsx ../tools/check_letter_matrix.ts
 */
import data from '../app/src/data/mat/letter-matrix.json' with { type: 'json' }

type M = number[][]
const cols = (m: M): M => m[0].map((_, j) => m.map((r) => r[j]))
const every = (lines: M, f: (l: number[]) => boolean) => lines.every(f)
/** Steps forward round the alphabet: Y + 5 is D. */
const fwd = (from: number, to: number) => (((to - from) % 26) + 26) % 26
const steps = (p: number, q: number) => (m: M) => every(m, ([a, b, c]) => fwd(a, b) === p && fwd(b, c) === q)
const opposite = (m: M) => every(m, ([a, n, c]) => n === a && a + c === 27)
const between = (m: M) => every(m, ([a, n, c]) => c === a + 2 && n === 27 - (a + 1))

/** The rule of each question, by book number: true when it holds in every row or column. */
const RULES: Record<number, (m: M) => boolean> = {
  1: steps(2, 3),
  2: steps(2, 3),
  3: (m) => every(cols(m), ([a, b, c]) => a - b === c),
  4: (m) => every(cols(m), ([a, b, c]) => a + b === c),
  5: (m) => every(cols(m), ([a, b, c]) => a - b === c),
  6: opposite,
  7: opposite,
  8: (m) => every(m, ([a, n, c]) => c - a - 1 === n),
  9: between,
  10: between,
  11: (m) => every(m, ([a, b, n]) => b * n === a),
  12: (m) => every(m, ([a, b, n]) => n * b === a),
  13: steps(5, 3),
  14: (m) => every(cols(m), ([a, b, c]) => a * c === b),
  15: (m) => every(cols(m), ([a, b, c]) => a * c === b),
}

const value = (s: string) => (/^[A-Z]$/.test(s) ? s.charCodeAt(0) - 64 : Number(s))

/** The matrix with the option written into its blank, as numbers. */
function filled(table: string[][], opt: string): M {
  if (table.flat().filter((c) => c === '?').length !== 1) throw new Error('expected one blank')
  return table.map((r) => r.map((c) => value(c === '?' ? opt : c)))
}

let bad = 0
for (const q of data.questions) {
  const rule = RULES[q.bookNo]
  if (!rule) throw new Error(`Q${q.bookNo} has no rule in the checker`)
  const fits = Object.entries(q.options)
    .filter(([, v]) => rule(filled(q.table, v)))
    .map(([k]) => k)
  if ('status' in q) {
    if (fits.length !== 1) console.log(`✓ Q${q.bookNo}: hidden; options that fit: ${fits.join(', ') || 'none'}`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but only option ${fits[0]} fits`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as 'A']}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
