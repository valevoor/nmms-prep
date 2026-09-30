/**
 * Checks every "Relation Between Numbers with Letters" book question. Each letter's value is worked
 * out from the number heading its row and the number heading its column, by the rule typed in below
 * from the book's directions, and each option is tested against what the question asks (also typed
 * in). Exactly one option must fit, and it must be the marked one.
 * Run from app/:  npx tsx ../tools/check_letter_values.ts
 */
import data from '../app/src/data/mat/letter-values.json' with { type: 'json' }

type Op = (row: number, col: number) => number
const div: Op = (r, c) => r / c
const mul: Op = (r, c) => r * c
const add: Op = (r, c) => r + c
const sub: Op = (r, c) => r - c

type Ask =
  | { kind: 'max' | 'min'; of: 'sum' | 'product' }
  | { kind: 'code'; word: string }
  | { kind: 'sum' | 'product' | 'squareOfSum'; word: string }
  | { kind: 'hasSum' | 'hasProduct'; n: number }
  | { kind: 'hasCode'; code: number[] }
  | { kind: 'pairs'; word: string }

/** Book number → the rule for a letter's value and what is asked. */
const BOOK: Record<number, [Op | null, Ask]> = {
  1: [div, { kind: 'max', of: 'sum' }],
  2: [div, { kind: 'code', word: 'GIRL' }],
  3: [mul, { kind: 'sum', word: 'BLUE' }],
  4: [mul, { kind: 'max', of: 'sum' }],
  5: [mul, { kind: 'hasProduct', n: 72 }],
  6: [add, { kind: 'code', word: 'HOST' }],
  7: [add, { kind: 'product', word: 'TOP' }],
  8: [sub, { kind: 'hasSum', n: 0 }],
  9: [sub, { kind: 'hasCode', code: [6, 2, 0, 2] }],
  10: [sub, { kind: 'hasProduct', n: 96 }],
  11: [add, { kind: 'max', of: 'sum' }],
  12: [add, { kind: 'min', of: 'product' }],
  13: [add, { kind: 'squareOfSum', word: 'URL' }],
  14: [null, { kind: 'pairs', word: 'SETO' }],
  15: [null, { kind: 'pairs', word: 'HEPR' }],
}

/** Letter → value, from a table whose first row and first column hold the numbers. */
function values(table: string[][], op: Op): Map<string, number> {
  const out = new Map<string, number>()
  table.slice(1).forEach((row) =>
    row.slice(1).forEach((ch, j) => {
      if (out.has(ch)) throw new Error(`${ch} is in the table twice`)
      out.set(ch, op(Number(row[0]), Number(table[0][j + 1])))
    }),
  )
  return out
}

/** The letter at "row number, column number" in whichever table has those numbers. */
function at(tables: string[][][], pair: string): string | undefined {
  const [r, c] = pair
  for (const t of tables) {
    const i = t.findIndex((row, k) => k > 0 && row[0] === r)
    const j = t[0].indexOf(c, 1)
    if (i > 0 && j > 0) return t[i][j]
  }
  return undefined
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const product = (xs: number[]) => xs.reduce((a, b) => a * b, 1)
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i])

let bad = 0
for (const q of data.questions) {
  const [op, ask] = BOOK[q.bookNo]
  const opts = Object.entries(q.options) as [string, string][]
  let fits: string[]
  if (ask.kind === 'pairs') {
    const tables = [q.table, ...('table2' in q ? [q.table2 as string[][]] : [])]
    fits = opts.filter(([, v]) => v.split(', ').map((p) => at(tables, p)).join('') === ask.word).map(([k]) => k)
  } else {
    const val = values(q.table, op!)
    const word = (w: string) => [...w].map((ch) => {
      const v = val.get(ch)
      if (v === undefined) throw new Error(`Q${q.bookNo}: ${ch} is not in the table`)
      return v
    })
    const score = (w: string) => (ask.kind === 'max' || ask.kind === 'min' ? (ask.of === 'sum' ? sum(word(w)) : product(word(w))) : 0)
    switch (ask.kind) {
      case 'max':
      case 'min': {
        const scores = opts.map(([, v]) => score(v))
        const best = ask.kind === 'max' ? Math.max(...scores) : Math.min(...scores)
        fits = opts.filter((_, i) => scores[i] === best).map(([k]) => k)
        break
      }
      case 'code':
        fits = opts.filter(([, v]) => same(v.split(' ').map(Number), word(ask.word))).map(([k]) => k)
        break
      case 'sum':
        fits = opts.filter(([, v]) => Number(v) === sum(word(ask.word))).map(([k]) => k)
        break
      case 'product':
        fits = opts.filter(([, v]) => Number(v) === product(word(ask.word))).map(([k]) => k)
        break
      case 'squareOfSum':
        fits = opts.filter(([, v]) => Number(v) === sum(word(ask.word)) ** 2).map(([k]) => k)
        break
      case 'hasSum':
        fits = opts.filter(([, v]) => sum(word(v)) === ask.n).map(([k]) => k)
        break
      case 'hasProduct':
        fits = opts.filter(([, v]) => product(word(v)) === ask.n).map(([k]) => k)
        break
      case 'hasCode':
        fits = opts.filter(([, v]) => same(word(v), ask.code)).map(([k]) => k)
        break
    }
  }
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as 'A']}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
