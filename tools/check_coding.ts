/**
 * Checks every Coding–Decoding book question with an independent rule: the rule must reproduce
 * the example in the question, and exactly one option must match what the rule gives.
 * Table questions (Q9–13) are solved by trying every letter → digit assignment that fits the table.
 * Run from app/:  npx tsx ../tools/check_coding.ts
 */
import data from '../app/src/data/mat/coding-decoding.json' with { type: 'json' }

const L = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
const P = (c: string) => c.charCodeAt(0) - 64
const map = (w: string, f: (c: string, i: number) => string) => [...w].map(f).join('')
const rev = (w: string) => [...w].reverse().join('')

/** For each question: the example the rule must reproduce, and the answer it gives. */
const RULES: Record<string, { example: [string, string]; answer: string }> = {
  'cd-b01': { example: ['IQPI', map('HOME', (c, i) => L(P(c) + i + 1))], answer: map('STEM', (c, i) => L(P(c) + i + 1)) },
  'cd-b02': { example: ['PHOBN', rev(map('MANGO', (c) => L(P(c) + 1)))], answer: map(rev('NFFO'), (c) => L(P(c) - 1)) },
  'cd-b03': { example: ['YVMTZOFIF', map('BENGALURU', (c) => L(27 - P(c)))], answer: map('SHIMOGA', (c) => L(27 - P(c))) },
  'cd-b04': { example: ['WTNEYT', 'TWENTY'.replace(/(.)(.)/g, '$2$1')], answer: 'THIRTY'.replace(/(.)(.)/g, '$2$1') },
  'cd-b05': { example: ['YEKNOM', rev('MONKEY')], answer: rev('REGIT') },
  'cd-b06': { example: ['20920114', map('TITAN', (c) => String(P(c)))], answer: map('WORD', (c) => String(P(c))) },
  'cd-b07': {
    example: ['1615TA2015', map('POTATO', (c, i) => (i === 2 || i === 3 ? c : String(P(c))))],
    answer: map('TOMATO', (c, i) => (i === 2 || i === 3 ? c : String(P(c)))),
  },
  'cd-b08': { example: ['EXQGOH', map('BUNDLE', (c) => L(P(c) + 3))], answer: map('MOTHER', (c) => L(P(c) + 3)) },
}

/** Every letter → digit assignment where each word's code is some ordering of its letters' digits. */
function solveTable(table: string[][]): Record<string, string>[] {
  const letters = [...new Set(table.flatMap(([w]) => [...w]))]
  const out: Record<string, string>[] = []
  const tryAssign = (i: number, a: Record<string, string>) => {
    if (i === letters.length) {
      const fits = table.every(([w, code]) => [...w].map((c) => a[c]).sort().join('') === [...code].sort().join(''))
      if (fits) out.push({ ...a })
      return
    }
    for (const d of '0123456789') {
      if (Object.values(a).includes(d)) continue
      a[letters[i]] = d
      tryAssign(i + 1, a)
      delete a[letters[i]]
    }
  }
  tryAssign(0, {})
  return out
}

let bad = 0
for (const q of data.questions) {
  const options = Object.entries(q.options)
  let fits: string[]
  if ('table' in q && q.table) {
    const word = q.prompt.match(/code for ([A-Z]+)\?/)![1]
    // A letter missing from the table (R in BEATER) may be any digit not already used.
    const codes = solveTable(q.table).map((a) => [...word].map((c) => a[c] ?? '.').join(''))
    fits = options.filter(([, v]) => codes.some((c) => new RegExp(`^${c}$`).test(v))).map(([k]) => k)
  } else {
    const rule = RULES[q.id]
    const example = q.prompt.match(/[A-Z0-9]{3,}/g)!
    if (!rule || !example.includes(rule.example[0]) || rule.example[0] !== rule.example[1]) {
      console.log(`✗ Q${q.bookNo}: the rule does not reproduce the example (${rule?.example.join(' vs ')})`)
      bad++
      continue
    }
    fits = options.filter(([, v]) => v === rule.answer).map(([k]) => k)
  }
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as keyof typeof q.options]}  →  ${q.answer}`)
  else {
    bad++
    console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
  }
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
