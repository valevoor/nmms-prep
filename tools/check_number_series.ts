/**
 * Checks every Number Series book question against an independent rule.
 * Run from app/:  npx tsx ../tools/check_number_series.ts
 */
import data from '../app/src/data/mat/number-series.json' with { type: 'json' }
import { applyOp, fillBlanks } from '../app/src/lib/series.ts'

type Q = (typeof data.questions)[number] & { ops?: string[]; status?: string }

const range = (a: number, n: number) => Array.from({ length: n }, (_, i) => a + i)
const isPrime = (n: number) => n > 1 && range(2, Math.max(0, Math.floor(Math.sqrt(n)) - 1)).every((d) => n % d)

/** Full series for questions whose rule isn't a simple op chain. */
const RULES: Record<string, () => string[]> = {
  'ns-b01': () => [2, 3, 5, 7, 11, 13, 17].map(String),
  'ns-b03': () => ['6', '17', '10', '15', '16', '13', '24', '11', '34'],
  'ns-b04': () => [6, 5, 4, 3, 2].map((f) => `${f}${f * (f - 1)}${f - 1}`),
  'ns-b06': () => [2, 4, 6, 8, 10, 12].map((n) => String(n * n - 1)),
  'ns-b08': () => range(3, 5).map((n) => String(n ** 3 + 3)),
  'ns-b09': () => ['1/3', '4/5', '5/11', '6/19', '13/23'],
  'ns-b10': () => range(1, 4).flatMap((n) => [n * n, n ** 3]).map(String),
  'ns-b12': () => range(1, 6).map((n) => String(n ** 3 + n * n + n)),
  'ns-b18': () => range(1, 6).map((n) => String(n ** 3 - n * n)),
  'ns-b20': () => range(2, 6).reverse().map((n) => String(n ** 3 + n)),
  'ns-b23': () => range(1, 6).map((n) => String(n ** 3 + n * n)),
}

let failures = 0
const fail = (q: Q, msg: string) => {
  failures++
  console.log(`✗ Q${q.bookNo} (${q.id}): ${msg}`)
}

for (const q of data.questions as Q[]) {
  if (q.status === 'needs-review') {
    console.log(`… Q${q.bookNo} (${q.id}): needs review, hidden from students. ${q.note ?? ''}`)
    continue
  }
  const opts = Object.values(q.options)
  if (new Set(opts).size !== 4) fail(q, 'options are not 4 distinct values')

  const filled = fillBlanks(q.terms, q.options[q.answer as keyof typeof q.options])
  let expected: string[]
  if (RULES[q.id]) expected = RULES[q.id]()
  else if (q.ops) {
    if (q.ops.length !== q.terms.length - 1) fail(q, 'ops length mismatch')
    const first = Number(filled[0])
    expected = [String(first)]
    for (const op of q.ops) expected.push(String(applyOp(Number(expected[expected.length - 1]), op)))
  } else {
    fail(q, 'no rule to check against')
    continue
  }

  if (expected.join(',') !== filled.join(',')) fail(q, `rule gives ${expected.join(', ')} but answer gives ${filled.join(', ')}`)
  else if (q.id === 'ns-b01' && !filled.every((t) => isPrime(Number(t)))) fail(q, 'not all prime')
  else console.log(`✓ Q${q.bookNo}: ${filled.join(', ')}  →  ${q.answer} (${q.keyFrom === 'book' ? 'book key' : 'solved'})`)
}

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll book answers check out.')
process.exit(failures ? 1 : 0)
