import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both, same } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Number Matrix (Chapter 27): a 3 × 3 table in which one number of every row (or every column) is
 * made from the other two by one rule, e.g. c = a × 2 + b or a = (c − b)³, as in the book. One cell
 * is blank: the number the rule makes, or one it starts from (then the rule is worked backwards).
 * A question is kept only when no wrong option fits any simple formula that fits the complete rows
 * or columns, read across or down (`fitter`).
 */

interface Rule {
  /** The formula in x and y (the two numbers the rule starts from, in line order). */
  formula: string
  f: (x: number, y: number) => number | null
  make: (rng: Rng) => [number, number]
}

const whole = (v: number) => (Number.isInteger(v) ? v : null)

const RULES: Rule[] = [
  { formula: 'x × 2 + y', f: (x, y) => x * 2 + y, make: (r) => [int(r, 2, 20), int(r, 2, 30)] },
  { formula: 'x × 3 + y', f: (x, y) => x * 3 + y, make: (r) => [int(r, 2, 15), int(r, 2, 30)] },
  { formula: '(x + y) × 2', f: (x, y) => (x + y) * 2, make: (r) => [int(r, 2, 30), int(r, 2, 30)] },
  { formula: '(x + y) × 3', f: (x, y) => (x + y) * 3, make: (r) => [int(r, 2, 25), int(r, 2, 25)] },
  {
    formula: '(x − y)²',
    f: (x, y) => (x > y ? (x - y) ** 2 : null),
    make: (r) => {
      const y = int(r, 2, 20)
      return [y + int(r, 2, 12), y]
    },
  },
  {
    formula: '(x − y)³',
    f: (x, y) => (x > y ? (x - y) ** 3 : null),
    make: (r) => {
      const y = int(r, 2, 20)
      return [y + int(r, 2, 6), y]
    },
  },
  { formula: 'x² + y²', f: (x, y) => x * x + y * y, make: (r) => [int(r, 2, 12), int(r, 2, 12)] },
  { formula: 'x³ + y²', f: (x, y) => x ** 3 + y * y, make: (r) => [int(r, 2, 6), int(r, 2, 12)] },
  { formula: 'x² − y', f: (x, y) => (x * x > y ? x * x - y : null), make: (r) => [int(r, 3, 12), int(r, 2, 20)] },
  { formula: 'x × y', f: (x, y) => x * y, make: (r) => [int(r, 3, 15), int(r, 3, 15)] },
  ...[1, 2, 3, 4, 5].flatMap((k): Rule[] => [
    { formula: `x × y + ${k}`, f: (x, y) => x * y + k, make: (r) => [int(r, 3, 12), int(r, 3, 12)] },
    { formula: `x × y − ${k}`, f: (x, y) => x * y - k, make: (r) => [int(r, 3, 12), int(r, 3, 12)] },
  ]),
  {
    formula: '√x + √y',
    f: (x, y) => whole(Math.sqrt(x) + Math.sqrt(y)),
    make: (r) => [int(r, 2, 12) ** 2, int(r, 2, 12) ** 2],
  },
  {
    formula: '(x + y) ÷ 2',
    f: (x, y) => whole((x + y) / 2),
    make: (r) => {
      const x = int(r, 5, 60)
      return [x, x + 2 * int(r, -20, 20)]
    },
  },
]

/** Writes the formula with the letters (or numbers) put in: "(9 − 6)³", "a × 2 + b". */
const fill = (formula: string, x: string, y: string) => formula.replace(/[xy]/g, (v) => (v === 'x' ? x : y))

const LETTERS = ['a', 'b', 'c']
const transpose = (m: number[][]) => m[0].map((_, j) => m.map((r) => r[j]))
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9

type Fn = (x: number) => number
const UNARY: Fn[] = [(x) => x, (x) => x * x, (x) => x ** 3, (x) => 2 * x, (x) => 3 * x, (x) => x / 2, Math.sqrt]
const BIN: ((x: number, y: number) => number)[] = [(x, y) => x + y, (x, y) => x - y, (x, y) => x * y, (x, y) => x / y]
const FINALS: Fn[] = [(x) => x, (x) => x * x, (x) => x ** 3]
for (let k = 1; k <= 10; k++) FINALS.push((x) => x + k, (x) => x - k, (x) => x * k, (x) => x / k)

/**
 * For a matrix with one blank at (r, c): a test of whether a value in the blank fits some simple
 * formula that already fits the two complete rows (or columns). In every row or every column one
 * number is made from the other two: each as it is, squared, cubed, doubled, tripled, halved or
 * square-rooted, joined by + − × ÷, then perhaps squared, cubed or changed by a number 1–10.
 */
export function fitter(m: number[][], r: number, c: number): (v: number) => boolean {
  const found: { line: number[]; pos: number; out: number; i: number; j: number; g: (x: number, y: number) => number }[] = []
  for (const [lines, qLine, qPos] of [
    [m, r, c],
    [transpose(m), c, r],
  ] as const)
    for (let out = 0; out < 3; out++)
      for (const [i, j] of [
        [0, 1],
        [1, 0],
        [0, 2],
        [2, 0],
        [1, 2],
        [2, 1],
      ]) {
        if (i === out || j === out) continue
        const [p, q] = lines.filter((_, k) => k !== qLine)
        for (const u1 of UNARY)
          for (const u2 of UNARY)
            for (const op of BIN) {
              const bp = op(u1(p[i]), u2(p[j]))
              const bq = op(u1(q[i]), u2(q[j]))
              for (const fin of FINALS)
                if (close(fin(bp), p[out]) && close(fin(bq), q[out]))
                  found.push({ line: lines[qLine], pos: qPos, out, i, j, g: (x, y) => fin(op(u1(x), u2(y))) })
            }
      }
  return (v) =>
    found.some(({ line, pos, out, i, j, g }) => {
      const l = line.map((x, k) => (k === pos ? v : x))
      return close(g(l[i], l[j]), l[out])
    })
}

let counter = 0

/** A generated question. */
export function buildNumberMatrix(rng: Rng): Question {
  for (;;) {
    const rule = pick(rng, RULES)
    const dir = pick(rng, ['row', 'col'] as const)
    // The number the rule makes: most often the last in the line, as in the book.
    const out = pick(rng, [2, 2, 2, 1, 0])
    const [ix, iy] = [0, 1, 2].filter((k) => k !== out)
    const lines: number[][] = []
    for (let n = 0; n < 3; n++) {
      const [x, y] = rule.make(rng)
      const o = rule.f(x, y)
      if (o === null || o < 1 || o > 999 || x < 1 || y < 1) break
      const l = [0, 0, 0]
      ;[l[ix], l[iy], l[out]] = [x, y, o]
      lines.push(l)
    }
    if (lines.length < 3) continue
    if (new Set(lines.map((l) => l.join())).size < 3 || lines.some((l) => new Set(l).size < 3)) continue
    if (new Set(lines.map((l) => l[out])).size < 3) continue

    // The blank: in any line, the made number or (less often) one the rule starts from.
    const line = int(rng, 0, 2)
    const pos = rng() < 0.6 ? out : pick(rng, [ix, iy])
    const answer = lines[line][pos]
    const at = (v: number) => lines[line].map((x, k) => (k === pos ? v : x))
    if (pos !== out) {
      // Worked backwards, the rule must give only this number.
      let ways = 0
      for (let v = 1; v <= 1500; v++) {
        const l = at(v)
        if (rule.f(l[ix], l[iy]) === l[out]) ways++
      }
      if (ways !== 1) continue
    }

    const m = dir === 'row' ? lines : transpose(lines)
    const [r, c] = dir === 'row' ? [line, pos] : [pos, line]
    const fits = fitter(m, r, c)
    if (!fits(answer)) continue
    const near = RULES.filter((x) => x !== rule).map((x) => {
      if (pos !== out) return null
      return x.f(lines[line][ix], lines[line][iy])
    })
    const wrong = new Set<number>()
    const pool = [...near.filter((v): v is number => v !== null && Math.abs(v - answer) <= Math.max(10, answer / 3)), answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10]
    for (const v of shuffle(rng, pool)) if (v > 0 && v !== answer && !wrong.has(v) && !fits(v) && wrong.size < 3) wrong.add(v)
    for (let d = 3; wrong.size < 3; d++) if (!fits(answer + d)) wrong.add(answer + d)
    const opts = shuffle(rng, [answer, ...wrong])
    const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>

    const table = m.map((row, i) => row.map((v, j) => (i === r && j === c ? '?' : String(v))))
    const eq = `${LETTERS[out]} = ${fill(rule.formula, LETTERS[ix], LETTERS[iy])}`
    const rl = both((g) => (dir === 'row' ? g.mxRow(eq) : g.mxCol(eq)))
    const steps = lines.map((l, n) => {
      if (n !== line) return `${fill(rule.formula, String(l[ix]), String(l[iy]))} = ${l[out]}`
      const s = (k: number) => (k === pos ? '?' : String(l[k]))
      const sum = `${fill(rule.formula, s(ix), s(iy))} = ${s(out)}`
      return pos === out ? `${fill(rule.formula, s(ix), s(iy))} = ${answer}` : `${sum} → ? = ${answer}`
    })
    const working = same(steps.join('; '))
    const prompt = both((g) => g.mxPrompt)
    return {
      id: `gen-mx-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      terms: [],
      layout: 'text',
      prompt: prompt.en,
      table,
      options,
      answer: OPTION_KEYS[opts.indexOf(answer)],
      rule: rl.en,
      working: working.en,
      pattern: dir === 'row' ? 'mx-row' : 'mx-col',
      generated: true,
      kn: { prompt: prompt.kn, rule: rl.kn, working: working.kn },
    }
  }
}

export function generateNumberMatrix(rng: Rng = Math.random): Question {
  return buildNumberMatrix(rng)
}
