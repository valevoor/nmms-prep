import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** One rule linking a pair: x → f(x). f returns NaN where the rule doesn't apply (e.g. ÷7 on 30). */
export interface AnalogyRule {
  /** Rules are picked family first, so families with many variants don't crowd out the rest. */
  family: string
  name: string
  f: (x: number) => number
  /** Worked line for one input, e.g. "6 × 7 = 42". */
  show: (x: number) => string
  /** Inputs that give friendly numbers for this rule. */
  inputs: number[]
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const sign = (c: number) => (c < 0 ? `− ${-c}` : `+ ${c}`)

/** Every rule the generator may use. Also used to reject questions where a second rule would fit. */
export const ANALOGY_RULES: AnalogyRule[] = [
  ...range(2, 12).map((k) => ({
    family: 'multiply',
    name: `Multiply by ${k}`,
    f: (x: number) => x * k,
    show: (x: number) => `${x} × ${k} = ${x * k}`,
    inputs: range(2, 25),
  })),
  ...range(2, 12).map((k) => ({
    family: 'divide',
    name: `Divide by ${k}`,
    f: (x: number) => (x % k === 0 ? x / k : NaN),
    show: (x: number) => `${x} ÷ ${k} = ${x / k}`,
    inputs: range(2, 20).map((m) => m * k),
  })),
  { family: 'power', name: 'Square the number', f: (x) => x * x, show: (x) => `${x}² = ${x * x}`, inputs: range(2, 25) },
  { family: 'power', name: 'Cube the number', f: (x) => x ** 3, show: (x) => `${x}³ = ${x ** 3}`, inputs: range(2, 12) },
  { family: 'power-n', name: 'Square it, then add the number (n² + n)', f: (x) => x * x + x, show: (x) => `${x}² + ${x} = ${x * x} + ${x} = ${x * x + x}`, inputs: range(2, 20) },
  { family: 'power-n', name: 'Square it, then subtract the number (n² − n)', f: (x) => x * x - x, show: (x) => `${x}² − ${x} = ${x * x} − ${x} = ${x * x - x}`, inputs: range(2, 20) },
  { family: 'power-n', name: 'Cube it, then add the number (n³ + n)', f: (x) => x ** 3 + x, show: (x) => `${x}³ + ${x} = ${x ** 3} + ${x} = ${x ** 3 + x}`, inputs: range(2, 10) },
  { family: 'power-n', name: 'Cube it, then subtract the number (n³ − n)', f: (x) => x ** 3 - x, show: (x) => `${x}³ − ${x} = ${x ** 3} − ${x} = ${x ** 3 - x}`, inputs: range(2, 10) },
  { family: 'power-n', name: 'Cube plus square (n³ + n²)', f: (x) => x ** 3 + x * x, show: (x) => `${x}³ + ${x}² = ${x ** 3} + ${x * x} = ${x ** 3 + x * x}`, inputs: range(2, 10) },
  ...[-5, -3, -2, -1, 1, 2, 3, 5].map((c) => ({
    family: 'square-plus',
    name: `Square the number, then ${c > 0 ? `add ${c}` : `subtract ${-c}`}`,
    f: (x: number) => x * x + c,
    show: (x: number) => `${x}² ${sign(c)} = ${x * x} ${sign(c)} = ${x * x + c}`,
    inputs: range(3, 20),
  })),
  ...[1, 2, 3].map((k) => ({
    family: 'add-square',
    name: `Add ${k}, then square`,
    f: (x: number) => (x + k) ** 2,
    show: (x: number) => `(${x} + ${k})² = ${x + k}² = ${(x + k) ** 2}`,
    inputs: range(2, 20),
  })),
  ...[2, 3, 4, 5].flatMap((k) =>
    [-3, -2, -1, 1, 2, 3, 4, 5].map((c) => ({
      family: 'multiply-add',
      name: `Multiply by ${k}, then ${c > 0 ? `add ${c}` : `subtract ${-c}`}`,
      f: (x: number) => x * k + c,
      show: (x: number) => `${x} × ${k} ${sign(c)} = ${x * k} ${sign(c)} = ${x * k + c}`,
      inputs: range(3, 30),
    })),
  ),
]

const FAMILIES = [...new Set(ANALOGY_RULES.map((r) => r.family))]

/** True if some rule in ANALOGY_RULES maps a → b and c → d. */
export function fitsAnalogy(a: number, b: number, c: number, d: number): boolean {
  return ANALOGY_RULES.some((r) => r.f(a) === b && r.f(c) === d)
}

let counter = 0

/** A : B :: C : ? (or A : B :: ? : D) with exactly one option that fits. */
export function generateNumberAnalogy(rng: Rng = Math.random): Question {
  for (;;) {
    const family = pick(rng, FAMILIES)
    const rule = pick(rng, ANALOGY_RULES.filter((r) => r.family === family))
    const a = pick(rng, rule.inputs)
    const c = pick(rng, rule.inputs)
    const b = rule.f(a)
    const d = rule.f(c)
    if (a === c || b > 3000 || d > 3000 || b <= 0 || d <= 0) continue

    const blankC = rng() < 0.3
    const answer = blankC ? c : d
    const fitsWith = (o: number) => (blankC ? fitsAnalogy(a, b, o, d) : fitsAnalogy(a, b, c, o))

    // Near misses: off by a little, or the rule applied to a neighbouring number.
    const near = blankC
      ? [c + 1, c - 1, c + 2, c - 2, c * 2, c + 10]
      : [d + 1, d - 1, d + 2, d - 2, rule.f(c + 1), rule.f(c - 1), d + c, d - c]
    const wrong: number[] = []
    for (const o of shuffle(rng, near)) {
      if (wrong.length === 3) break
      if (!Number.isInteger(o) || o <= 0 || o === answer || wrong.includes(o) || fitsWith(o)) continue
      wrong.push(o)
    }
    if (wrong.length < 3) continue

    const order = shuffle(rng, [answer, ...wrong])
    const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, String(order[j])])) as Record<OptionKey, string>
    const terms = [a, b, c, d].map(String)
    terms[blankC ? 2 : 3] = '?'

    return {
      id: `gen-analogy-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'analogy',
      terms,
      options,
      answer: OPTION_KEYS[order.indexOf(answer)],
      rule: `${rule.name}: ${rule.show(a)}.`,
      working: blankC ? `${rule.show(c)}, so the missing number is ${c}` : rule.show(c),
      pattern: 'analogy',
      generated: true,
    }
  }
}

/** Guess the rule: a complete analogy, and four rule names of which exactly one links both pairs. */
export function generateAnalogyRuleQuestion(rng: Rng = Math.random): Question {
  for (;;) {
    const family = pick(rng, FAMILIES)
    const rule = pick(rng, ANALOGY_RULES.filter((r) => r.family === family))
    const a = pick(rng, rule.inputs)
    const c = pick(rng, rule.inputs)
    const b = rule.f(a)
    const d = rule.f(c)
    if (a === c || b > 3000 || d > 3000 || b <= 0 || d <= 0) continue
    const fits = (r: AnalogyRule) => r.f(a) === b && r.f(c) === d
    // Skip pairs two rules can explain (e.g. 10 : 100 is both ×10 and squaring).
    if (ANALOGY_RULES.filter(fits).length !== 1) continue

    // One tempting option from the same family (e.g. "Multiply by 6" for ×7), the rest from other families.
    const same = ANALOGY_RULES.filter((r) => r.family === family && r !== rule)
    const others = ANALOGY_RULES.filter((r) => r.family !== family)
    const wrong = [...shuffle(rng, same).slice(0, 1)]
    for (const r of shuffle(rng, others)) {
      if (wrong.length === 3) break
      if (!wrong.some((w) => w.family === r.family)) wrong.push(r)
    }
    if (wrong.length < 3) continue

    const order = shuffle(rng, [rule, ...wrong])
    const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j].name])) as Record<OptionKey, string>
    return {
      id: `gen-analogy-rule-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      kind: 'rule',
      layout: 'analogy',
      terms: [a, b, c, d].map(String),
      options,
      answer: OPTION_KEYS[order.indexOf(rule)],
      rule: `${rule.show(a)}, and ${rule.show(c)}.`,
      working: `So the rule is: ${rule.name}.`,
      pattern: 'analogy',
      generated: true,
    }
  }
}
