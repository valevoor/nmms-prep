import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { isPrime } from '../series'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** Three items that share a rule, one that breaks it, and the words that explain it. */
interface OddDraft {
  family: string
  alike: string[]
  odd: string
  rule: Text
  working: Text
}

const digits = (x: number) => String(x).split('').map(Number)
const distinct = (n: number, make: () => number) => {
  const out = new Set<number>()
  while (out.size < n) out.add(make())
  return [...out]
}
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))
const isCube = (n: number) => Math.round(Math.cbrt(n)) ** 3 === n

function primes(rng: Rng): OddDraft {
  const pool = Array.from({ length: 87 }, (_, i) => i + 11).filter(isPrime)
  const alike = shuffle(rng, pool).slice(0, 3)
  // An odd number that isn't prime, so it can't be spotted just by being even or ending in 5.
  const odd = pick(rng, [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93])
  const f = [3, 7, 11, 13].find((d) => odd % d === 0)!
  return {
    family: 'prime',
    alike: alike.map(String),
    odd: String(odd),
    rule: both((m) => m.oddPrimes(alike.join(', '))),
    working: both((m) => m.notPrimeBecause(odd, f, odd / f)),
  }
}

function powers(rng: Rng, p: 2 | 3): OddDraft {
  const [lo, hi] = p === 2 ? [4, 25] : [2, 10]
  const roots = distinct(4, () => int(rng, lo, hi))
  const alike = roots.slice(0, 3).map((n) => n ** p)
  const n = roots[3]
  const odd = n ** p + pick(rng, p === 2 ? [1, -1, 2, -2] : [1, -1, 2, -2, 3])
  const sup = p === 2 ? '²' : '³'
  const list = roots.slice(0, 3).map((r) => `${r ** p} = ${r}${sup}`).join(', ')
  const below = odd > n ** p ? n : n - 1
  return {
    family: p === 2 ? 'square' : 'cube',
    alike: alike.map(String),
    odd: String(odd),
    rule: both((m) => (p === 2 ? m.oddSquares(list) : m.oddCubes(list))),
    working: both((m) => m.between(odd, `${below}${sup} = ${below ** p}`, `${below + 1}${sup} = ${(below + 1) ** p}`)),
  }
}

function divisible(rng: Rng): OddDraft {
  const k = pick(rng, [7, 11, 13])
  const alike = distinct(3, () => k * int(rng, 3, 70))
  const q = int(rng, 3, 70)
  const r = int(rng, 1, k - 1)
  const odd = k * q + r
  return {
    family: 'divisible',
    alike: alike.map(String),
    odd: String(odd),
    rule: both((m) => m.oddDivisible(alike.join(', '), k)),
    working: both((m) => m.remainder(odd, k, q, r)),
  }
}

/** 3-digit numbers whose middle digit is the sum (or product) of the outer two. */
function middle(rng: Rng, op: 'sum' | 'product'): OddDraft {
  const f = (a: number, c: number) => (op === 'sum' ? a + c : a * c)
  const make = () => {
    for (;;) {
      const a = int(rng, 1, 9)
      const c = int(rng, op === 'sum' ? 0 : 1, 9)
      if (f(a, c) <= 9) return [a, f(a, c), c]
    }
  }
  const alike = distinct(3, () => Number(make().join('')))
  let odd: number
  for (;;) {
    const [a, b, c] = make()
    const nb = b + pick(rng, [1, -1])
    if (nb >= 0 && nb <= 9) {
      odd = Number(`${a}${nb}${c}`)
      break
    }
  }
  const sign = op === 'sum' ? '+' : '×'
  const [a, , c] = digits(alike[0])
  const [oa, ob, oc] = digits(odd)
  return {
    family: op === 'sum' ? 'middle-sum' : 'middle-product',
    alike: alike.map(String),
    odd: String(odd),
    rule: both((m) => (op === 'sum' ? m.middleSum : m.middleProduct)(`${alike[0]} → ${a} ${sign} ${c} = ${f(a, c)}`)),
    working: both((m) => m.notThis(`${odd}: ${oa} ${sign} ${oc} = ${f(oa, oc)}`, ob)),
  }
}

/** 4-digit numbers whose digits add up to the same total. */
function digitTotal(rng: Rng): OddDraft {
  const total = int(rng, 12, 24)
  const make = (t: number) => {
    for (;;) {
      const d = [int(rng, 1, 9), int(rng, 0, 9), int(rng, 0, 9)]
      const last = t - d[0] - d[1] - d[2]
      if (last >= 0 && last <= 9) return Number([...d, last].join(''))
    }
  }
  const alike = distinct(3, () => make(total))
  const oddTotal = total + pick(rng, [1, -1])
  const odd = make(oddTotal)
  const show = (x: number) => `${digits(x).join(' + ')} = ${digits(x).reduce((s, y) => s + y, 0)}`
  return {
    family: 'digit-total',
    alike: alike.map(String),
    odd: String(odd),
    rule: both((m) => m.digitTotal(total, `${alike[0]} → ${show(alike[0])}`)),
    working: both((m) => m.notThis(`${odd} → ${show(odd)}`, total)),
  }
}

/** Pairs (n, f(n)); the formula is written the same way in every language. */
const PAIR_RULES: { formula: string; f: (n: number) => number; show: (n: number) => string }[] = [
  { formula: 'n²', f: (n) => n * n, show: (n) => `${n}² = ${n * n}` },
  { formula: 'n² + 1', f: (n) => n * n + 1, show: (n) => `${n}² + 1 = ${n * n + 1}` },
  { formula: 'n² − 1', f: (n) => n * n - 1, show: (n) => `${n}² − 1 = ${n * n - 1}` },
  { formula: '2 × n²', f: (n) => 2 * n * n, show: (n) => `2 × ${n}² = ${2 * n * n}` },
  { formula: 'n² + n', f: (n) => n * n + n, show: (n) => `${n}² + ${n} = ${n * n + n}` },
  { formula: 'n² − n', f: (n) => n * n - n, show: (n) => `${n}² − ${n} = ${n * n - n}` },
  { formula: 'n³', f: (n) => n ** 3, show: (n) => `${n}³ = ${n ** 3}` },
  { formula: '3 × n + 1', f: (n) => 3 * n + 1, show: (n) => `3 × ${n} + 1 = ${3 * n + 1}` },
  { formula: '2 × n + 3', f: (n) => 2 * n + 3, show: (n) => `2 × ${n} + 3 = ${2 * n + 3}` },
  { formula: '7 × n', f: (n) => 7 * n, show: (n) => `7 × ${n} = ${7 * n}` },
]

function pairs(rng: Rng): OddDraft {
  const r = pick(rng, PAIR_RULES)
  const ns = distinct(4, () => int(rng, 2, r.formula === 'n³' ? 9 : 15))
  const alike = ns.slice(0, 3).map((n) => `${n}, ${r.f(n)}`)
  const n = ns[3]
  const wrong = r.f(n) + pick(rng, [1, -1, 2, -2])
  return {
    family: 'pair',
    alike,
    odd: `${n}, ${wrong}`,
    rule: both((m) => m.pairRule(r.formula, `${ns[0]} → ${r.show(ns[0])}`)),
    working: both((m) => m.notThis(`${n} → ${r.show(n)}`, wrong)),
  }
}

const BUILDERS: ((rng: Rng) => OddDraft)[] = [
  primes,
  (rng) => powers(rng, 2),
  (rng) => powers(rng, 3),
  divisible,
  (rng) => middle(rng, 'sum'),
  (rng) => middle(rng, 'product'),
  digitTotal,
  pairs,
]

/** Simple things a student might notice. None of them may single out an option other than the odd one. */
const PROPERTIES: ((x: number) => boolean | number)[] = [
  (x) => x % 2 === 0,
  isPrime,
  isSquare,
  isCube,
  (x) => x % 3 === 0,
  (x) => x % 5 === 0,
  (x) => x % 11 === 0,
  (x) => String(x) === [...String(x)].reverse().join(''),
  (x) => String(x).length,
]

/** Index of the option a property singles out (the only one different from the other three), if any. */
export function singledOut(values: (boolean | number)[]): number | undefined {
  const idx = values.flatMap((v, i) => (values.filter((w) => w === v).length === 1 ? [i] : []))
  return idx.length === 1 && values.length === 4 ? idx[0] : undefined
}

/** True if some simple property points to a different option than the intended odd one. */
function misleading(items: string[], oddIdx: number): boolean {
  const cols = items[0].split(', ').length
  for (let c = 0; c < cols; c++) {
    const v = items.map((s) => Number(s.split(', ')[c]))
    for (const p of PROPERTIES) {
      const out = singledOut(v.map(p))
      if (out !== undefined && out !== oddIdx) return true
    }
  }
  return new Set(items).size !== 4
}

let counter = 0

export function generateOddOne(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    const items = shuffle(rng, [d.odd, ...d.alike])
    const oddIdx = items.indexOf(d.odd)
    if (misleading(items, oddIdx)) continue
    const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, items[j]])) as Record<OptionKey, string>
    return {
      id: `gen-odd-${d.family}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'odd',
      terms: items,
      options,
      answer: OPTION_KEYS[oddIdx],
      rule: d.rule.en,
      working: d.working.en,
      pattern: 'odd-one',
      generated: true,
      kn: { rule: d.rule.kn, working: d.working.kn },
    }
  }
}
