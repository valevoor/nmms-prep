/**
 * Checks every Number Matrix book question. Each option is written into the matrix (a "111, 8"
 * option fills the two blanks in order; letters become their places in the alphabet), then the
 * question's rule, typed in below from the book's solution, is tested in every row or column.
 * Exactly one option must make the rule hold everywhere, and it must be the marked one; hidden
 * questions must have more than one (or none).
 * Run from app/:  npx tsx ../tools/check_number_matrix.ts
 */
import data from '../app/src/data/mat/number-matrix.json' with { type: 'json' }

type M = number[][]
const cols = (m: M): M => m[0].map((_, j) => m.map((r) => r[j]))
const every = (lines: M, f: (l: number[]) => boolean) => lines.every(f)
const digits = (n: number) => String(n).split('').map(Number)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** The rule of each question, by book number: true when it holds in every row or column. */
const RULES: Record<number, (m: M) => boolean> = {
  1: (m) => every(m, ([a, b, c]) => (c - b) ** 3 === a),
  2: (m) => every(m, ([a, b, c]) => Math.sqrt(a) + Math.sqrt(c) === b),
  3: (m) => every(cols(m), ([a, b, c]) => 2 * a + b === c),
  4: (m) => every(m, ([a, b, c]) => sum([...digits(a), ...digits(b)]) ** 2 === c),
  5: (m) => every(cols(m), ([a, b, c]) => a ** 3 + b ** 2 === c),
  6: (m) => every(cols(m), ([a, b, c]) => a - b === c),
  7: (m) => every(cols(m), ([a, b, c, d]) => b + c - a === d),
  8: (m) => every(cols(m), ([a, b, c, d]) => a * b * c === d),
  9: (m) => every(m, ([a, b, c]) => (a + c) / 2 === b),
  10: (m) => every(m, ([a, b, c]) => a ** 3 + b ** 2 === c),
  11: (m) => every(m, ([a, b, c, d]) => b * 3 === c && a + 3 === d),
  12: (m) => every(cols(m), ([a, b, c, d]) => b * c - a * a === d),
  13: (m) => every(m, ([a, b, c]) => a / 2 + b * 2 === c),
  14: (m) => new Set(m.map((r) => r[0] * r[1] * r[2])).size === 1,
  15: (m) => every(cols(m), ([a, b, c]) => a * b - a === c),
}

const value = (s: string) => (/^[A-Z]$/.test(s) ? s.charCodeAt(0) - 64 : Number(s))

/** The matrix with the option written into its blanks, as numbers. */
function filled(table: string[][], opt: string): M {
  const vals = opt.split(', ')
  const blanks = table.flat().filter((c) => c === '?').length
  if (blanks !== vals.length) throw new Error(`${opt}: ${vals.length} values for ${blanks} blanks`)
  let k = 0
  return table.map((r) => r.map((c) => value(c === '?' ? vals[k++] : c)))
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
