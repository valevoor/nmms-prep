import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import { same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Figures and Number Relationship (Chapter 24): three figures of the same shape, each with a number
 * made from the others by one rule; the last figure's number is missing. The shapes are the
 * chapter's: two circles joined to one below (Q4), a row of boxes ending in a circle (Q9, Q13) and a
 * triangle with numbers at its corners and one in the middle (Q6). A question is kept only when no
 * other rule of the chapter's kinds fits the two complete figures and gives a different answer, and
 * no wrong option can be reached by any simple formula that fits them (`alternatives`).
 */

type Shape = 'vee' | 'boxes' | 'triangle'

interface Rule {
  /** The formula in a, b (and c), e.g. "(a + b) × 3". */
  formula: string
  n: 2 | 3
  f: (v: number[]) => number | null
  /** Numbers for one figure that suit the rule. */
  make: (rng: Rng) => number[]
}

const whole = (v: number) => (Number.isInteger(v) ? v : null)

/** Every rule of the chapter's kinds, with each constant it can take. */
function rules(): Rule[] {
  const out: Rule[] = []
  for (let k = 2; k <= 5; k++)
    out.push({ formula: `(a + b) × ${k}`, n: 2, f: ([a, b]) => (a + b) * k, make: (r) => [int(r, 3, 40), int(r, 3, 40)] })
  for (let k = 2; k <= 6; k++)
    out.push({
      formula: `(a − b) × ${k}`,
      n: 2,
      f: ([a, b]) => (a > b ? (a - b) * k : null),
      make: (r) => {
        const b = int(r, 2, 30)
        return [b + int(r, 2, 20), b]
      },
    })
  for (let k = 1; k <= 9; k++) {
    out.push({ formula: `a × b − ${k}`, n: 2, f: ([a, b]) => a * b - k, make: (r) => [int(r, 3, 15), int(r, 3, 15)] })
    out.push({ formula: `a × b + ${k}`, n: 2, f: ([a, b]) => a * b + k, make: (r) => [int(r, 3, 15), int(r, 3, 15)] })
  }
  out.push({ formula: 'a² + b', n: 2, f: ([a, b]) => a * a + b, make: (r) => [int(r, 3, 15), int(r, 2, 30)] })
  out.push({
    formula: 'a² − b²',
    n: 2,
    f: ([a, b]) => (a > b ? a * a - b * b : null),
    make: (r) => {
      const b = int(r, 2, 14)
      return [b + int(r, 1, 6), b]
    },
  })
  out.push({
    formula: '(a ÷ b)²',
    n: 2,
    f: ([a, b]) => {
      const q = whole(a / b)
      return q === null ? null : q * q
    },
    make: (r) => {
      const b = int(r, 2, 9)
      return [b * int(r, 2, 9), b]
    },
  })
  for (let k = 2; k <= 6; k++)
    out.push({
      formula: `(a + b) ÷ ${k}`,
      n: 2,
      f: ([a, b]) => whole((a + b) / k),
      make: (r) => {
        const a = int(r, 5, 60)
        return [a, ((k - (a % k)) % k) + k * int(r, 1, 12)]
      },
    })
  out.push({ formula: 'a × b − c', n: 3, f: ([a, b, c]) => a * b - c, make: (r) => [int(r, 3, 12), int(r, 3, 12), int(r, 2, 9)] })
  out.push({ formula: 'a × b + c', n: 3, f: ([a, b, c]) => a * b + c, make: (r) => [int(r, 3, 12), int(r, 3, 12), int(r, 2, 20)] })
  out.push({ formula: '(a + b) × c', n: 3, f: ([a, b, c]) => (a + b) * c, make: (r) => [int(r, 2, 15), int(r, 2, 15), int(r, 2, 6)] })
  out.push({ formula: 'a + b + c', n: 3, f: ([a, b, c]) => a + b + c, make: (r) => [int(r, 5, 60), int(r, 5, 60), int(r, 5, 60)] })
  out.push({
    formula: '(a + c) ÷ b',
    n: 3,
    f: ([a, b, c]) => whole((a + c) / b),
    make: (r) => {
      const b = int(r, 2, 9)
      return [b * int(r, 2, 12), b, b * int(r, 2, 12)]
    },
  })
  out.push({ formula: '2 × (a + b) − c', n: 3, f: ([a, b, c]) => 2 * (a + b) - c, make: (r) => [int(r, 3, 20), int(r, 3, 20), int(r, 2, 15)] })
  return out
}
const RULES = rules()

/** Writes the rule's formula with the numbers put in: "(13 + 15) × 3". */
const fill = (formula: string, v: number[]) => formula.replace(/[abc]/g, (x) => String(v['abc'.indexOf(x)]))

const NAMES: Record<Shape, { en: string; kn: string }> = {
  vee: {
    en: 'Call the top left number a and the top right number b. In every figure the number below is',
    kn: 'ಮೇಲಿನ ಎಡ ಸಂಖ್ಯೆಯನ್ನು a ಮತ್ತು ಮೇಲಿನ ಬಲ ಸಂಖ್ಯೆಯನ್ನು b ಎನ್ನಿ. ಪ್ರತಿ ಆಕೃತಿಯಲ್ಲಿ ಕೆಳಗಿನ ಸಂಖ್ಯೆ',
  },
  boxes: {
    en: 'Call the numbers in the boxes a, b and c, from the left. In every figure the number in the circle is',
    kn: 'ಎಡದಿಂದ ಚೌಕಗಳಲ್ಲಿರುವ ಸಂಖ್ಯೆಗಳನ್ನು a, b ಮತ್ತು c ಎನ್ನಿ. ಪ್ರತಿ ಆಕೃತಿಯಲ್ಲಿ ವೃತ್ತದಲ್ಲಿರುವ ಸಂಖ್ಯೆ',
  },
  triangle: {
    en: 'Call the corner numbers a (top), b (bottom left) and c (bottom right). In every figure the number in the middle is',
    kn: 'ಮೂಲೆಗಳ ಸಂಖ್ಯೆಗಳನ್ನು a (ಮೇಲೆ), b (ಕೆಳಗಿನ ಎಡ) ಮತ್ತು c (ಕೆಳಗಿನ ಬಲ) ಎನ್ನಿ. ಪ್ರತಿ ಆಕೃತಿಯಲ್ಲಿ ಮಧ್ಯದ ಸಂಖ್ಯೆ',
  },
}

const PROMPT: Text = {
  en: 'Find how the numbers in the figures are related, and find the missing number.',
  kn: 'ಆಕೃತಿಗಳಲ್ಲಿರುವ ಸಂಖ್ಯೆಗಳ ಸಂಬಂಧವನ್ನು ಗುರುತಿಸಿ, ಬಿಟ್ಟು ಹೋಗಿರುವ ಸಂಖ್ಯೆಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
}

const txt = (x: number, y: number, label: string, size = 11): FigItem => ({ shape: 'text', x, y, size, label })

/** One figure, drawn in the 100-wide slot starting at `ox`. */
function drawFigure(shape: Shape, ox: number, inputs: number[], out: string): { items: FigItem[]; lines: [number, number, number, number][] } {
  const s = (v: number) => String(v)
  if (shape === 'vee')
    return {
      items: [
        { shape: 'circle', x: ox + 22, y: 20, size: 30 },
        { shape: 'circle', x: ox + 78, y: 20, size: 30 },
        { shape: 'circle', x: ox + 50, y: 76, size: 34 },
        txt(ox + 22, 20, s(inputs[0])),
        txt(ox + 78, 20, s(inputs[1])),
        txt(ox + 50, 76, out, 12),
      ],
      lines: [
        [ox + 30, 33, ox + 42, 61],
        [ox + 70, 33, ox + 58, 61],
      ],
    }
  if (shape === 'boxes')
    return {
      items: [
        ...[0, 1, 2].map((i): FigItem => ({ shape: 'rect', x: ox + 16 + 21 * i, y: 50, size: 21, h: 21 })),
        { shape: 'circle', x: ox + 84, y: 50, size: 23 },
        ...[0, 1, 2].map((i) => txt(ox + 16 + 21 * i, 50, s(inputs[i]), 10)),
        txt(ox + 84, 50, out, 10),
      ],
      lines: [],
    }
  return {
    items: [
      { shape: 'poly', n: 3, x: ox + 50, y: 58, size: 76 },
      txt(ox + 50, 10, s(inputs[0])),
      txt(ox + 12, 90, s(inputs[1])),
      txt(ox + 88, 90, s(inputs[2])),
      txt(ox + 50, 61, out, 12),
    ],
    lines: [],
  }
}

type Vec = [number, number, number]
const UNARY: ((x: number) => number)[] = [(x) => x, (x) => x * x, (x) => 2 * x, (x) => 3 * x, (x) => x * x * x, Math.sqrt]
const BIN: ((x: number, y: number) => number)[] = [(x, y) => x + y, (x, y) => x - y, (x, y) => x * y, (x, y) => x / y]
const zip = (a: Vec, b: Vec, op: (x: number, y: number) => number): Vec => [op(a[0], b[0]), op(a[1], b[1]), op(a[2], b[2])]

/**
 * What the missing number could be under any simple formula that fits the two complete figures:
 * the inputs as they are, squared, doubled, tripled, cubed or square-rooted, joined by + − × ÷,
 * then perhaps squared (or, with two inputs, changed by a constant 1–10). No wrong option may be one
 * of these, so no other reading of the figures picks it.
 */
function alternatives(figs: number[][], outs: number[]): Set<number> {
  const n = figs[0].length
  const leaves = Array.from({ length: n }, (_, i) => UNARY.map((u) => figs.map((f) => u(f[i])) as Vec))
  const found = new Set<number>()
  const fits = (v: Vec) => Math.abs(v[0] - outs[0]) < 1e-9 && Math.abs(v[1] - outs[1]) < 1e-9
  const finals: ((x: number) => number)[] = [(x) => x, (x) => x * x]
  if (n === 2) for (let k = 1; k <= 10; k++) finals.push((x) => x + k, (x) => x - k, (x) => x * k, (x) => x / k)
  const tryAll = (v: Vec) => {
    for (const f of finals) {
      const w = v.map(f) as Vec
      if (fits(w) && Number.isFinite(w[2])) found.add(Math.round(w[2] * 1e6) / 1e6)
    }
  }
  const order = n === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  for (const [i, j, k] of order)
    for (const a of leaves[i])
      for (const b of leaves[j])
        for (const op of BIN) {
          const ab = zip(a, b, op)
          if (k === undefined) {
            tryAll(ab)
            continue
          }
          for (const c of leaves[k])
            for (const op2 of BIN) {
              tryAll(zip(ab, c, op2))
              tryAll(zip(a, zip(b, c, op2), op))
            }
        }
  return found
}

let counter = 0

/** A generated question. */
export function buildFigureNumbers(rng: Rng): Question {
  for (;;) {
    const shape: Shape = pick(rng, ['vee', 'vee', 'boxes', 'triangle'] as const)
    const n = shape === 'vee' ? 2 : 3
    const rule = pick(
      rng,
      RULES.filter((r) => r.n === n),
    )
    const figs = [rule.make(rng), rule.make(rng), rule.make(rng)]
    const outs = figs.map((v) => rule.f(v))
    if (outs.some((o) => o === null || o < 1 || o > 999)) continue
    if (new Set(figs.map((v) => v.join())).size < 3 || figs.some((v) => new Set(v).size < n)) continue
    if (outs[0] === outs[1]) continue
    const answer = outs[2]!
    // No other rule may fit the complete figures and give a different answer.
    const fitting = RULES.filter((r) => r.n === n && r.f(figs[0]) === outs[0] && r.f(figs[1]) === outs[1])
    if (fitting.some((r) => r.f(figs[2]) !== answer)) continue
    const alt = alternatives(figs, outs as number[])
    const wrong = new Set<number>()
    const near = RULES.filter((r) => r.n === n && !fitting.includes(r)).map((r) => r.f(figs[2]))
    for (const v of shuffle(rng, [...near.filter((v): v is number => v !== null && Math.abs(v - answer) <= Math.max(12, answer / 3)), answer + 1, answer - 1, answer + 2, answer + 10, answer - 2]))
      if (v > 0 && v !== answer && !alt.has(v) && wrong.size < 3) wrong.add(v)
    for (let d = 3; wrong.size < 3; d++) if (!alt.has(answer + d)) wrong.add(answer + d)
    const opts = shuffle(rng, [answer, ...wrong])
    const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>

    const parts = figs.map((v, i) => drawFigure(shape, 100 * i, v, i === 2 ? '?' : String(outs[i])))
    const figure: Drawing = { w: 300, items: parts.flatMap((p) => p.items), lines: parts.flatMap((p) => p.lines) }
    const names = NAMES[shape]
    const rl: Text = { en: `${names.en} ${rule.formula}.`, kn: `${names.kn} = ${rule.formula}.` }
    const working = same(figs.map((v, i) => `${fill(rule.formula, v)} = ${i === 2 ? answer : outs[i]}`).join('; '))
    return {
      id: `gen-fignum-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      terms: [],
      layout: 'text',
      prompt: PROMPT.en,
      figures: { terms: [figure] },
      options,
      answer: OPTION_KEYS[opts.indexOf(answer)],
      rule: rl.en,
      working: working.en,
      pattern: 'fignum-rule',
      generated: true,
      kn: { prompt: PROMPT.kn, rule: rl.kn, working: working.kn },
    }
  }
}

export function generateFigureNumbers(rng: Rng = Math.random): Question {
  return buildFigureNumbers(rng)
}
