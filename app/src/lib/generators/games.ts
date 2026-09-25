import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { buildSeries, GENERATOR_PATTERNS, int, pick, shuffle, spaced } from './numberSeries'
import type { Rng } from './numberSeries'
import { isPrime } from '../series'

/** Plain rule names for "Guess the rule". */
export const PATTERN_LABELS: Record<PatternId, string> = {
  arithmetic: 'Add or subtract the same number each time',
  'second-difference': 'The gap grows by the same amount each time',
  'repeating-difference': 'Two gaps take turns: +a, +b, +a, +b…',
  alternating: 'Two different series are mixed together',
  'multiply-divide': 'Multiply or divide at every step',
  'mixed-operation': 'Multiply, then add or subtract a number',
  'power-plus': 'Squares or cubes, with something added or taken away',
  'difference-powers': 'The gaps are squares or cubes',
  prime: 'Prime numbers in order',
  'power-pairs': 'A square, then a cube, in pairs',
  // Book-only patterns (not generated), listed for completeness.
  'digit-rule': 'A rule about the digits',
  fraction: 'A rule about numerator and denominator',
  analogy: 'The same rule links both pairs',
}

// ---------- does a series fit a rule? ----------

const diffs = (v: number[]) => v.slice(1).map((x, i) => x - v[i])
const allSame = (v: number[]) => v.length > 0 && v.every((x) => x === v[0])
const nextPrime = (p: number) => {
  let x = p + 1
  while (!isPrime(x)) x++
  return x
}
const isArith = (v: number[]) => allSame(diffs(v))
const odds = (v: number[]) => v.filter((_, i) => i % 2 === 1)
const evens = (v: number[]) => v.filter((_, i) => i % 2 === 0)

/** Ratio steps as numbers (e.g. 2 for ×2, 0.25 for ÷4), or null if a step isn't a whole × or ÷. */
function ratios(v: number[]): number[] | null {
  const r: number[] = []
  for (let i = 1; i < v.length; i++) {
    const [a, b] = [v[i - 1], v[i]]
    if (a === 0 || b === 0) return null
    if (b % a === 0) r.push(b / a)
    else if (a % b === 0) r.push(1 / (a / b))
    else return null
  }
  return r
}

/** True if the series can be described by the given pattern. Used to keep "Guess the rule" unambiguous. */
export function fitsPattern(p: PatternId, v: number[]): boolean {
  const d = diffs(v)
  switch (p) {
    case 'arithmetic':
      return isArith(v)
    case 'second-difference':
      return !isArith(v) && isArith(d)
    case 'repeating-difference':
      return d.length >= 3 && d[0] !== d[1] && d.every((x, i) => x === d[i % 2])
    case 'alternating':
      return v.length >= 6 && isArith(odds(v)) && isArith(diffs(evens(v))) && !isArith(v)
    case 'multiply-divide': {
      const r = ratios(v)
      if (!r || r.every((x) => x === 1)) return false
      const divides = r.some((x) => x < 1)
      if (divides && r.some((x) => x > 1)) return false
      // A step of 1 reads as ×1 or ÷1, whichever way the series goes.
      const steps = r.map((x) => (divides ? 1 / x : x))
      const sd = diffs(steps)
      return allSame(steps) || (allSame(sd) && Math.abs(sd[0]) === 1)
    }
    case 'mixed-operation':
      return [2, 3].some((m) => {
        const adds = v.slice(1).map((x, i) => x - m * v[i])
        if (adds.every((a) => a === 0)) return false
        const alt = adds.every((a, i) => a === (i % 2 === 0 ? adds[0] : -adds[0]))
        return allSame(adds) || isArith(adds) || alt
      })
    case 'power-plus':
      return [2, 3].some((pw) =>
        Array.from({ length: 12 }, (_, s) => s).some((s) => {
          const rest = v.map((x, i) => x - (s + i) ** pw)
          const ns = v.map((_, i) => s + i)
          return allSame(rest) || rest.every((r, i) => r === ns[i]) || rest.every((r, i) => r === -ns[i])
        }),
      )
    case 'difference-powers':
      return [2, 3].some((pw) => Array.from({ length: 8 }, (_, s) => s + 1).some((s) => d.every((x, i) => x === (s + i) ** pw)))
    case 'prime':
      return v.every(isPrime) && v.slice(1).every((x, i) => x === nextPrime(v[i]))
    case 'power-pairs':
      return v.length % 2 === 0 && evens(v).every((x, i) => {
        const n = Math.round(Math.sqrt(x))
        return n * n === x && odds(v)[i] === n ** 3 && (i === 0 || n === Math.round(Math.sqrt(evens(v)[i - 1])) + 1)
      })
    default:
      return false
  }
}

let counter = 0
const newId = (kind: string, rng: Rng) => `${kind}-${(counter++).toString(36)}-${Math.floor(rng() * 1e9).toString(36)}`

// ---------- Guess the rule ----------

export function generateRuleQuestion(rng: Rng = Math.random): Question {
  for (;;) {
    const pattern = pick(rng, GENERATOR_PATTERNS)
    const d = buildSeries(rng, pattern)
    if (!fitsPattern(pattern, d.values)) continue
    // Only offer wrong rules that really don't fit, so exactly one option is right.
    const others = shuffle(
      rng,
      GENERATOR_PATTERNS.filter((p) => p !== pattern && !fitsPattern(p, d.values)),
    ).slice(0, 3)
    if (others.length < 3) continue
    const order = shuffle(rng, [pattern, ...others])
    const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, PATTERN_LABELS[order[j]]])) as Record<OptionKey, string>
    return {
      id: newId('rule', rng),
      kind: 'rule',
      terms: d.values.map(String),
      options,
      answer: OPTION_KEYS[order.indexOf(pattern)],
      rule: d.rule,
      ops: d.ops,
      working: `So the rule is: ${PATTERN_LABELS[pattern]}.`,
      pattern,
      generated: true,
    }
  }
}

// ---------- Fix the broken series ----------
// Not used by a screen yet: kept for MAT Chapter 19, "Finding the wrong number".

const WRONG_PATTERNS: PatternId[] = [
  'arithmetic',
  'second-difference',
  'repeating-difference',
  'multiply-divide',
  'mixed-operation',
  'difference-powers',
  'prime',
]

export function generateWrongNumber(rng: Rng = Math.random): Question {
  for (;;) {
    const pattern = pick(rng, WRONG_PATTERNS)
    const d = buildSeries(rng, pattern)
    const v = d.values
    if (v.length < 5) continue
    // Change an inside term, so the break shows on both sides of it.
    const j = int(rng, 1, v.length - 2)
    const correct = v[j]
    const delta = pattern === 'prime' ? pick(rng, [1, -1]) : pick(rng, [1, 2, 3, -1, -2, -3, 10, -10])
    const wrongValue = correct + delta
    if (wrongValue < 0 || v.includes(wrongValue)) continue
    if (pattern === 'prime' && isPrime(wrongValue)) continue

    const shown = v.map((x, i) => (i === j ? wrongValue : x))
    const count = (x: number) => shown.filter((y) => y === x).length
    // Options must be 4 different values, each appearing once in the series.
    const candidates = shown.map((_, i) => i).filter((i) => i !== j && count(shown[i]) === 1)
    if (candidates.length < 3) continue
    const picked = shuffle(rng, [j, ...shuffle(rng, candidates).slice(0, 3)])
    const options = Object.fromEntries(OPTION_KEYS.map((k, n) => [k, String(shown[picked[n]])])) as Record<OptionKey, string>

    let working: string
    if (d.ops) working = `${wrongValue} is wrong. It should be ${v[j - 1]} ${spaced(d.ops[j - 1])} = ${correct}.`
    else working = `${wrongValue} is not a prime number. The prime after ${v[j - 1]} is ${correct}.`

    return {
      id: newId('wrong', rng),
      kind: 'wrong',
      terms: shown.map(String),
      options,
      answer: OPTION_KEYS[picked.indexOf(j)],
      rule: d.rule,
      ops: d.ops,
      working,
      pattern,
      generated: true,
      wrongIndex: j,
      fix: String(correct),
    }
  }
}
