/**
 * Checks every "Find the wrong number" book question: an independent rule says which terms fit.
 * Exactly one term may break the rule. It must be the marked answer, at `wrongIndex`, and `fix`
 * must be the value the rule expects there. Every other option must be a term that fits.
 * Run from app/:  npx tsx ../tools/check_wrong_number.ts
 */
import data from '../app/src/data/mat/wrong-number.json' with { type: 'json' }

/** The correct series, term by term; or, for rules about a single number, a test per term. */
type Rule = { series: number[] } | { fits: (x: number) => boolean }
const n = (len: number, f: (i: number) => number, from = 1) => Array.from({ length: len }, (_, i) => f(i + from))
/** Starts at a and applies each step in turn. */
const steps = (a: number, fs: ((x: number) => number)[]) => fs.reduce((s, f) => [...s, f(s[s.length - 1])], [a])
/** Interleaves two series: a in the 1st, 3rd… places, b in the 2nd, 4th… */
const mix = (a: number[], b: number[]) => Array.from({ length: a.length + b.length }, (_, i) => (i % 2 === 0 ? a[i / 2] : b[(i - 1) / 2]))

const RULES: Record<string, Rule> = {
  'wn-b01': { series: steps(35, [2, 3, 4, 5, 6].map((k) => (x: number) => x + k * k)) },
  'wn-b02': { series: n(5, (k) => k ** 3 - 3, 2) },
  'wn-b03': { series: mix([7, 10, 13, 16, 19], [6, 11, 16, 21]) },
  'wn-b04': { series: n(5, (k) => k ** 3 * 10, 3) },
  'wn-b05': { series: [3, 4, 7, 11, 18, 29, 47] },
  'wn-b06': { fits: (x) => { const [a, b, c] = String(x).split('').map(Number); return (a + c) / 2 === b } },
  'wn-b07': { series: steps(2, n(6, (i) => (x: number) => 2 * x + (i % 2 === 1 ? 1 : -1))) },
  'wn-b08': { series: n(5, (k) => k ** 3 + k) },
  'wn-b09': { series: n(5, (k) => k ** 3 + k ** 2, 2) },
  'wn-b10': { series: n(5, (k) => k ** 3 + k ** 2 + k) },
  'wn-b11': { series: mix([15, 29, 57], [18, 36, 72]) },
  'wn-b12': { series: n(5, (k) => k ** 3 + k) },
  'wn-b13': { series: mix([81, 27, 9, 3, 1], [64, 16, 4, 1]) },
  'wn-b14': { series: steps(2, [1, 2, 3, 4].map((c) => (x: number) => 3 * x + c)) },
  'wn-b15': { series: steps(2, [1, 4, 9, 16, 25].map((d) => (x: number) => x + d)) },
  'wn-b16': { series: [11, 9, 7, 5, 3, 1].map((k, i) => k * k + (i % 2 === 0 ? 1 : -1)) },
}

let bad = 0
const fail = (q: (typeof data.questions)[number], why: string) => {
  bad++
  console.log(`✗ Q${q.bookNo}: ${why}`)
}

for (const q of data.questions) {
  const rule = RULES[q.id]
  if (!rule) {
    fail(q, 'no rule')
    continue
  }
  const terms = q.terms.map(Number)
  if ('series' in rule && rule.series.length !== terms.length) {
    fail(q, `rule has ${rule.series.length} terms, book has ${terms.length}`)
    continue
  }
  const ok = terms.map((x, i) => ('series' in rule ? rule.series[i] === x : rule.fits(x)))
  const broken = ok.flatMap((f, i) => (f ? [] : [i]))
  if (broken.length !== 1) {
    fail(q, `${broken.length} terms break the rule (${broken.map((i) => terms[i]).join(', ')})`)
    continue
  }
  const i = broken[0]
  const answerValue = Number(q.options[q.answer as keyof typeof q.options])
  if (i !== q.wrongIndex || terms[i] !== answerValue) fail(q, `the wrong term is ${terms[i]} (index ${i}), but the answer is ${answerValue} at index ${q.wrongIndex}`)
  else if ('series' in rule && 'fix' in q && Number(q.fix) !== rule.series[i]) fail(q, `fix is ${q.fix}, rule expects ${rule.series[i]}`)
  else {
    // Every other option is a term that fits (or, like Q16's 30, not in the series at all).
    const others = Object.entries(q.options).filter(([k]) => k !== q.answer).map(([, v]) => Number(v))
    const alsoWrong = others.filter((v) => terms.includes(v) && !ok[terms.indexOf(v)])
    if (alsoWrong.length) fail(q, `other options also break the rule: ${alsoWrong.join(', ')}`)
    else console.log(`✓ Q${q.bookNo}: ${terms[i]} is wrong${'series' in rule ? `, should be ${rule.series[i]}` : ''}  →  ${q.answer}`)
  }
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
