import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

export type Sign = '+' | '−' | '×' | '÷'
export const SIGNS: Sign[] = ['+', '−', '×', '÷']

/** An exact fraction [numerator, denominator], denominator > 0. */
type Frac = [number, number]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const frac = (n: number, d: number): Frac => {
  const g = gcd(n, d) || 1
  return d < 0 ? [-n / g, -d / g] : [n / g, d / g]
}
const apply = ([a, b]: Frac, s: Sign, [c, d]: Frac): Frac | undefined => {
  if (s === '+') return frac(a * d + c * b, b * d)
  if (s === '−') return frac(a * d - c * b, b * d)
  if (s === '×') return frac(a * c, b * d)
  return c === 0 ? undefined : frac(a * d, b * c)
}

/** × and ÷ chains worked out first, left to right: the numbers and signs that are left. */
function collapse(nums: number[], ops: Sign[]): { nums: Frac[]; ops: Sign[] } | undefined {
  const out: Frac[] = [[nums[0], 1]]
  const rest: Sign[] = []
  for (let i = 0; i < ops.length; i++) {
    const n: Frac = [nums[i + 1], 1]
    if (ops[i] === '×' || ops[i] === '÷') {
      const v = apply(out[out.length - 1], ops[i], n)
      if (!v) return undefined
      out[out.length - 1] = v
    } else {
      out.push(n)
      rest.push(ops[i])
    }
  }
  return { nums: out, ops: rest }
}

/** The exact value of "n0 s0 n1 s1 …", × and ÷ before + and −; undefined for ÷ 0. */
export function evaluate(nums: number[], ops: Sign[]): Frac | undefined {
  const c = collapse(nums, ops)
  if (!c) return undefined
  return c.ops.reduce<Frac | undefined>((acc, s, i) => acc && apply(acc, s, c.nums[i + 1]), c.nums[0])
}

/**
 * The value when it is easy to work out by hand: every × and ÷ step gives a whole number, and so
 * does the answer, which is not negative. Otherwise undefined.
 */
function niceValue(nums: number[], ops: Sign[]): number | undefined {
  let cur = nums[0]
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '÷' && cur % nums[i + 1] !== 0) return undefined
    if (ops[i] === '÷') cur /= nums[i + 1]
    else if (ops[i] === '×') cur *= nums[i + 1]
    else cur = nums[i + 1]
  }
  const v = evaluate(nums, ops)
  return v && v[1] === 1 && v[0] >= 0 && v[0] <= 999 ? v[0] : undefined
}

const equals = (a: Frac | undefined, b: number) => !!a && a[1] === 1 && a[0] === b
const expr = (nums: (number | string)[], ops: string[]) => nums.map((n, i) => (i ? `${ops[i - 1]} ${n}` : `${n}`)).join(' ')
const showFrac = ([n, d]: Frac) => (d === 1 ? `${n}` : `${n}/${d}`)

/** "12 + 12 − 12 ÷ 12 − 12 = 12 + 12 − 1 − 12 = 11": the working, one step per line of the rule. */
export function steps(nums: number[], ops: Sign[]): string {
  const c = collapse(nums, ops)!
  const v = evaluate(nums, ops)!
  const parts = [expr(nums, ops)]
  if (c.ops.length > 0 && c.ops.length < ops.length) parts.push(expr(c.nums.map(showFrac), c.ops))
  parts.push(showFrac(v))
  return parts.join(' = ')
}

const numberPool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 24, 25, 30, 36, 40, 45, 48, 50, 60]

/** A true equation to build on: numbers and signs whose value is nice. */
function trueEquation(rng: Rng, count: number, signs: () => Sign[], distinct = false): { nums: number[]; ops: Sign[]; value: number } {
  for (;;) {
    const nums = distinct ? shuffle(rng, [...numberPool]).slice(0, count) : Array.from({ length: count }, () => pick(rng, numberPool))
    const ops = signs()
    const value = niceValue(nums, ops)
    // An answer of 0 is too easy to reach by accident (x − x), so it is skipped.
    if (value !== undefined && value > 0) return { nums, ops, value }
  }
}

const randomSigns = (rng: Rng, n: number) => () => Array.from({ length: n }, () => pick(rng, SIGNS))

/** Up to `n` other sign lists that make the equation false. */
function wrongSigns(rng: Rng, nums: number[], ops: Sign[], value: number, n: number): Sign[][] {
  const seen = new Set([ops.join('')])
  const out: Sign[][] = []
  // Reordered right signs first: they are the tempting wrong answers.
  const tries = [...Array.from({ length: 6 }, () => shuffle(rng, [...ops])), ...Array.from({ length: 40 }, randomSigns(rng, ops.length))]
  for (const t of tries) {
    if (out.length === n) break
    if (seen.has(t.join('')) || equals(evaluate(nums, t), value)) continue
    seen.add(t.join(''))
    out.push(t)
  }
  return out
}

interface Draft {
  pattern: PatternId
  prompt: Text
  rule: Text
  working: Text
  terms: string[]
  table?: string[][]
  answer: string
  wrong: string[]
}

const STAR = (nums: number[], value: number) => `${expr(nums, nums.slice(1).map(() => '*'))} = ${value}`

function fillSigns(rng: Rng): Draft | undefined {
  const count = int(rng, 4, 5)
  const { nums, ops, value } = trueEquation(rng, count, randomSigns(rng, count - 1))
  const wrong = wrongSigns(rng, nums, ops, value, 3)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'ops-fill',
    prompt: both((m) => m.aoFillAsk),
    rule: both((m) => m.aoRuleFill),
    working: same(steps(nums, ops)),
    terms: [STAR(nums, value)],
    answer: ops.join(' '),
    wrong: wrong.map((w) => w.join(' ')),
  }
}

const CODE_SETS = [
  ['K', 'L', 'N', 'M'],
  ['P', 'Q', 'R', 'S'],
  ['W', 'X', 'Y', 'Z'],
  ['□', '△', '◇', '○'],
]

function codedSigns(rng: Rng): Draft | undefined {
  const symbols = pick(rng, CODE_SETS)
  const meaning = shuffle(rng, [...SIGNS])
  const code = (s: Sign) => symbols[meaning.indexOf(s)]
  const count = int(rng, 4, 5)
  const { nums, ops, value } = trueEquation(rng, count, randomSigns(rng, count - 1))
  const wrong = wrongSigns(rng, nums, ops, value, 3)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'ops-code',
    prompt: both((m) => m.aoCodeAsk),
    rule: both((m) => m.aoRuleCode),
    working: same(`${expr(nums, ops.map(code))} → ${steps(nums, ops)}`),
    terms: [STAR(nums, value)],
    table: [symbols, symbols.map((s) => meaning[symbols.indexOf(s)])],
    answer: ops.map(code).join(' '),
    wrong: wrong.map((w) => w.map(code).join(' ')),
  }
}

const swapSign = (ops: Sign[], a: Sign, b: Sign) => ops.map((s) => (s === a ? b : s === b ? a : s))
const PAIRS = SIGNS.flatMap((a, i) => SIGNS.slice(i + 1).map((b) => [a, b] as [Sign, Sign]))

function swapSigns(rng: Rng): Draft | undefined {
  // Each sign once, so "swap × and +" means one clear change.
  const { nums, ops, value } = trueEquation(rng, 5, () => shuffle(rng, [...SIGNS]))
  const [a, b] = pick(rng, PAIRS)
  const shown = swapSign(ops, a, b)
  if (equals(evaluate(nums, shown), value)) return undefined
  const byPlace = (p: [Sign, Sign]) => [...p].sort((x, y) => shown.indexOf(x) - shown.indexOf(y)).join(' & ')
  const wrong = shuffle(rng, PAIRS.filter(([x, y]) => !(x === a && y === b) && !equals(evaluate(nums, swapSign(shown, x, y)), value))).slice(0, 3)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'ops-swap',
    prompt: both((m) => m.aoSwapSignsAsk),
    rule: both((m) => m.aoRuleSwapSigns),
    working: same(`${byPlace([a, b]).replace(' & ', ' ↔ ')}: ${steps(nums, ops)}`),
    terms: [`${expr(nums, shown)} = ${value}`],
    answer: byPlace([a, b]),
    wrong: wrong.map(byPlace),
  }
}

const swapAt = (nums: number[], i: number, j: number) => nums.map((n, k) => (k === i ? nums[j] : k === j ? nums[i] : n))

function swapNumbers(rng: Rng): Draft | undefined {
  // Different numbers, and none equal to the answer, so "swap 9 and 10" names one change.
  const { nums, ops, value } = trueEquation(rng, 5, randomSigns(rng, 4), true)
  if (nums.includes(value)) return undefined
  const pairs = nums.flatMap((_, i) => nums.slice(i + 1).map((__, k) => [i, i + 1 + k] as [number, number]))
  const [i, j] = pick(rng, pairs)
  const shown = swapAt(nums, i, j)
  if (equals(evaluate(shown, ops), value)) return undefined
  const label = ([x, y]: [number, number]) => `${shown[x]} & ${shown[y]}`
  const wrong = shuffle(rng, pairs.filter(([x, y]) => !(x === i && y === j) && !equals(evaluate(swapAt(shown, x, y), ops), value))).slice(0, 3)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'ops-swap-num',
    prompt: both((m) => m.aoSwapNumsAsk),
    rule: both((m) => m.aoRuleSwapNums),
    working: same(`${shown[i]} ↔ ${shown[j]}: ${steps(nums, ops)}`),
    terms: [`${expr(shown, ops)} = ${value}`],
    answer: label([i, j]),
    wrong: wrong.map(label),
  }
}

/** Every order of the four signs in which no sign keeps its own meaning. */
const DERANGEMENTS: Sign[][] = (() => {
  const out: Sign[][] = []
  const go = (left: Sign[], acc: Sign[]) => {
    if (!left.length) return void (acc.every((s, i) => s !== SIGNS[i]) && out.push(acc))
    left.forEach((s, i) => go([...left.slice(0, i), ...left.slice(i + 1)], [...acc, s]))
  }
  go(SIGNS, [])
  return out
})()

function changedMeanings(rng: Rng): Draft | undefined {
  // The sign written SIGNS[i] means means[i].
  const means = pick(rng, DERANGEMENTS)
  const written = (s: Sign) => SIGNS[means.indexOf(s)]
  const { nums, ops, value } = trueEquation(rng, 4, randomSigns(rng, 3))
  const all = SIGNS.flatMap((x) => SIGNS.flatMap((y) => SIGNS.map((z) => [x, y, z] as Sign[])))
  const falseOnes = shuffle(rng, all.filter((o) => !equals(evaluate(nums, o), value)))
  // A tempting wrong option: true if the signs are read normally, but false with the new meanings.
  const trap = falseOnes.find((o) => equals(evaluate(nums, o.map(written)), value))
  const wrong = [...(trap ? [trap] : []), ...falseOnes.filter((o) => o !== trap)].slice(0, 3)
  const show = (o: Sign[]) => `${expr(nums, o.map(written))} = ${value}`
  return {
    pattern: 'ops-meaning',
    prompt: both((m) => m.aoMeaningAsk(SIGNS.map((s, i) => [s, means[i]]))),
    rule: both((m) => m.aoRuleMeaning),
    working: same(`${expr(nums, ops.map(written))} → ${steps(nums, ops)}`),
    terms: [],
    answer: show(ops),
    wrong: wrong.map(show),
  }
}

const BUILDERS = [fillSigns, codedSigns, swapSigns, swapNumbers, changedMeanings]

let counter = 0

export function generateArithmetic(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    if (!d || new Set([d.answer, ...d.wrong]).size !== 4) continue
    const order = shuffle(rng, [d.answer, ...d.wrong])
    return {
      id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: d.terms,
      prompt: d.prompt.en,
      ...(d.table && { table: d.table }),
      options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[order.indexOf(d.answer)],
      rule: d.rule.en,
      working: d.working.en,
      pattern: d.pattern,
      generated: true,
      kn: { prompt: d.prompt.kn, rule: d.rule.kn, working: d.working.kn },
    }
  }
}
