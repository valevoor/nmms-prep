/**
 * Checks every Number Analogy book question: the rule must turn A into B and C into D,
 * and must give the marked answer and none of the other options.
 * Run from app/:  npx tsx ../tools/check_number_analogy.ts
 */
import data from '../app/src/data/mat/number-analogy.json' with { type: 'json' }

type Q = (typeof data.questions)[number]
const digits = (n: number) => String(n).split('').map(Number)
const digitSum = (n: number) => digits(n).reduce((a, b) => a + b, 0)

/** The rule for each question, as "does x map to y?". */
const RULES: Record<string, (x: number, y: number) => boolean> = {
  'na-b01': (x, y) => x / 7 === y,
  'na-b02': (x, y) => digitSum(x) ** 2 === y,
  'na-b03': (x, y) => y ** 5 === x,
  'na-b04': (x, y) => x * 2 + digitSum(x) === y,
  'na-b05': (x, y) => x * x + x === y,
  'na-b06': (x, y) => x ** 3 / 2 === y,
  'na-b07': (x, y) => x ** 3 + x ** 2 === y,
  'na-b08': (x, y) => digitSum(x) === 2 * digitSum(y),
  'na-b09': (x, y) => Number.isInteger(Math.sqrt(x)) && digitSum(Math.sqrt(x)) === y,
  // 18, 50, 98, ? are 2×3², 2×5², 2×7², 2×9²: each pair is consecutive "2 × odd²".
  'na-b10': (x, y) => {
    const n = Math.sqrt(x / 2)
    return Number.isInteger(n) && 2 * (n + 2) ** 2 === y
  },
  'na-b11': (x, y) => (digits(x)[0] - digits(x)[1]) ** 2 === y,
  'na-b12': (x, y) => Number.isInteger(Math.sqrt(x)) && Math.sqrt(x) * 3 === y,
  'na-b13': (x, y) => {
    const n = Math.cbrt(x / 2)
    return Math.abs(n - Math.round(n)) < 1e-9 && Math.round(n) * 2 === y
  },
  'na-b14': (x, y) => x ** 3 - 2 * x === y,
  'na-b15': (x, y) => x / 2 + 1 === y,
}

let failures = 0
const fail = (q: Q, msg: string) => {
  failures++
  console.log(`✗ Q${q.bookNo} (${q.id}): ${msg}`)
}

for (const q of data.questions) {
  const rule = RULES[q.id]
  if (!rule) {
    fail(q, 'no rule to check against')
    continue
  }
  const [a, b, c, d] = q.terms
  if (!rule(Number(a), Number(b))) fail(q, `rule does not map ${a} → ${b}`)
  const opts = Object.entries(q.options)
  if (new Set(opts.map(([, v]) => v)).size !== 4) fail(q, 'options are not 4 distinct values')
  // Which options make the second pair fit the rule?
  const fits = opts.filter(([, v]) => (c === '?' ? rule(Number(v), Number(d)) : rule(Number(c), Number(v)))).map(([k]) => k)
  if (fits.length !== 1 || fits[0] !== q.answer) fail(q, `options that fit: ${fits.join(', ') || 'none'}; key says ${q.answer}`)
  else console.log(`✓ Q${q.bookNo}: ${q.terms.join(' ').replace('?', q.options[q.answer as keyof typeof q.options])}  →  ${q.answer}`)
}

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll book answers check out.')
process.exit(failures ? 1 : 0)
