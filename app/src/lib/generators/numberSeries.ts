import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'

export type Rng = () => number

/** Small seedable RNG so tests (and classroom sessions) can be reproduced. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))
export const pick = <T,>(rng: Rng, arr: readonly T[]): T => arr[int(rng, 0, arr.length - 1)]
export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(rng, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const sign = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
/** "×2+1" → "× 2 + 1" for the working line. */
export const spaced = (op: string) => op.replace(/([+−×÷])/g, ' $1 ').replace(/\s+/g, ' ').trim()
const sup = (p: 2 | 3) => (p === 2 ? '²' : '³')

export interface Draft {
  pattern: PatternId
  values: number[]
  rule: Text
  ops?: string[]
  /** Indices that may be blanked out. Defaults to 2..end. */
  blanks?: number[]
  /** Custom working line; defaults to applying ops[i-1] to the previous term. */
  explain?: (i: number) => Text
  /** Tempting wrong answers (common mistakes) for blank index i. */
  traps: (i: number) => number[]
}

// ---------- pattern builders ----------

function arithmetic(rng: Rng): Draft {
  const down = rng() < 0.3
  const d = int(rng, 3, 25)
  const a = down ? int(rng, 6 * d, 6 * d + 60) : int(rng, 1, 60)
  const step = down ? -d : d
  const values = Array.from({ length: 6 }, (_, i) => a + i * step)
  return {
    pattern: 'arithmetic',
    values,
    rule: both((m) => (down ? m.subtractEach(d) : m.addEach(d))),
    ops: values.slice(1).map(() => sign(step)),
    traps: (i) => [values[i] + step, values[i] - 1, values[i] + 1],
  }
}

function secondDifference(rng: Rng): Draft {
  const a = int(rng, 1, 20)
  const d0 = int(rng, 1, 8)
  const k = int(rng, 1, 4)
  const len = int(rng, 6, 7)
  const diffs = Array.from({ length: len - 1 }, (_, i) => d0 + i * k)
  const values = [a]
  for (const d of diffs) values.push(values[values.length - 1] + d)
  return {
    pattern: 'second-difference',
    values,
    rule: both((m) => m.diffGrows(k)),
    ops: diffs.map(sign),
    traps: (i) => [values[i] - k, values[i] + k, values[i] + 1],
  }
}

function repeatingDifference(rng: Rng): Draft {
  const d1 = int(rng, 2, 20)
  let d2 = int(rng, 2, 30)
  if (d2 === d1) d2 += int(rng, 1, 5)
  const a = int(rng, 1, 30)
  const diffs = Array.from({ length: 5 }, (_, i) => (i % 2 === 0 ? d1 : d2))
  const values = [a]
  for (const d of diffs) values.push(values[values.length - 1] + d)
  return {
    pattern: 'repeating-difference',
    values,
    rule: both((m) => m.diffsRepeat(d1, d2)),
    ops: diffs.map(sign),
    traps: (i) => {
      const other = diffs[i - 1] === d1 ? d2 : d1
      return [values[i - 1] + other, values[i] + 1, values[i] - 1]
    },
  }
}

function alternating(rng: Rng): Draft {
  const a = int(rng, 1, 15)
  const p0 = int(rng, 2, 5)
  const growing = rng() < 0.5
  const b = int(rng, 20, 60)
  const q = int(rng, 1, 6)
  const downB = rng() < 0.6
  const A: number[] = [a]
  const B: number[] = [b]
  for (let i = 1; i < 4; i++) {
    A.push(A[i - 1] + (growing ? p0 + 2 * (i - 1) : p0))
    B.push(B[i - 1] + (downB ? -q : q))
  }
  const values = A.flatMap((x, i) => [x, B[i]])
  const aSteps = A.slice(1).map((x, i) => x - A[i])
  const bStep = downB ? `−${q}` : `+${q}`
  return {
    pattern: 'alternating',
    values,
    blanks: [6, 7],
    rule: both((m) => m.mixed(A.join(', '), growing ? aSteps.map(sign).join(', ') : m.eachTime(sign(p0)), B.join(', '), m.eachTime(bStep))),
    explain: (i) =>
      both((m) => (i % 2 === 0 ? m.inFirst(`${A[2]} ${spaced(sign(aSteps[2]))} = ${A[3]}`) : m.inSecond(`${B[2]} ${spaced(bStep)} = ${B[3]}`))),
    traps: (i) => (i % 2 === 0 ? [B[3], A[3] + 1, A[2] + aSteps[1]] : [A[3], B[3] + (downB ? q : -q) * 2, B[3] + 1]),
  }
}

function multiplyDivide(rng: Rng): Draft {
  const kind = pick(rng, ['const', 'increasing', 'decreasing'] as const)
  if (kind === 'const') {
    const m = int(rng, 2, 3)
    const a = int(rng, 1, m === 2 ? 9 : 5)
    const values = Array.from({ length: 5 }, (_, i) => a * m ** i)
    return {
      pattern: 'multiply-divide',
      values,
      rule: both((t) => t.multiplyEach(m)),
      ops: values.slice(1).map(() => `×${m}`),
      traps: (i) => [values[i - 1] + values[i - 1], values[i] + m, values[i] - 1],
    }
  }
  const a = int(rng, 1, 4)
  const up = [a]
  for (let m = 1; m <= 5; m++) up.push(up[up.length - 1] * m)
  if (kind === 'increasing') {
    return {
      pattern: 'multiply-divide',
      values: up,
      rule: both((m) => m.multiplyInTurn),
      ops: [1, 2, 3, 4, 5].map((m) => `×${m}`),
      traps: (i) => [up[i - 1] * (i + 1), up[i] + i, up[i] - 1],
    }
  }
  const values = [...up].reverse()
  return {
    pattern: 'multiply-divide',
    values,
    blanks: [1, 2, 3, 4],
    rule: both((m) => m.divideInTurn),
    ops: [5, 4, 3, 2, 1].map((m) => `÷${m}`),
    traps: (i) => [Math.round(values[i - 1] / (6 - i + 1)), values[i] + 1, values[i] * 2],
  }
}

function mixedOperation(rng: Rng): Draft {
  const m = pick(rng, [2, 2, 2, 3])
  const kind = pick(rng, ['const', 'increasing', 'alternate'] as const)
  const c = pick(rng, [-3, -2, -1, 1, 2, 3, 4])
  const a = int(rng, c < 0 ? 4 : 2, 9)
  const len = m === 2 ? 6 : 5
  const adds: number[] = []
  const c0 = int(rng, 0, 2)
  const step = pick(rng, [1, 2])
  for (let i = 0; i < len - 1; i++) {
    if (kind === 'const') adds.push(c)
    else if (kind === 'increasing') adds.push(c0 + i * step)
    else adds.push(i % 2 === 0 ? 1 : -1)
  }
  const values = [a]
  for (const add of adds) values.push(values[values.length - 1] * m + add)
  const opStr = (add: number) => `×${m}${add === 0 ? '−0' : sign(add)}`
  const rule = both((t) =>
    kind === 'const' ? t.multiplyThen(m, c) : kind === 'increasing' ? t.multiplyThenAddList(m, adds.join(', ')) : t.multiplyThenAlternate(m),
  )
  return {
    pattern: 'mixed-operation',
    values,
    rule,
    ops: adds.map(opStr),
    traps: (i) => [values[i - 1] * m, values[i] + 1, values[i] - 2],
  }
}

function powerPlus(rng: Rng): Draft {
  const p = pick(rng, [2, 2, 3] as const)
  const kind = pick(rng, ['c', 'c', 'n'] as const)
  const c = pick(rng, [-2, -1, 1, 2, 3, 5])
  const start = p === 2 ? int(rng, 2, 8) : int(rng, 2, 4)
  const s = pick(rng, [1, -1] as const)
  const f = (n: number) => (kind === 'c' ? n ** p + c : n ** p + s * n)
  const ns = Array.from({ length: 6 }, (_, i) => start + i)
  const values = ns.map(f)
  const extra = kind === 'c' ? ` ${c > 0 ? '+' : '−'} ${Math.abs(c)}` : ` ${s > 0 ? '+' : '−'} n`
  const shown = ns
    .slice(0, 3)
    .map((n) => `${n}${sup(p)}${kind === 'c' ? sign(c) : s > 0 ? `+${n}` : `−${n}`}`)
    .join(', ')
  return {
    pattern: 'power-plus',
    values,
    rule: same(`n${sup(p)}${extra}: ${shown}, …`),
    explain: (i) => {
      const n = ns[i]
      const add = kind === 'c' ? c : s * n
      return same(`${n}${sup(p)} ${add < 0 ? '−' : '+'} ${Math.abs(add)} = ${n ** p} ${add < 0 ? '−' : '+'} ${Math.abs(add)} = ${values[i]}`)
    },
    traps: (i) => [ns[i] ** p, values[i] + 1, values[i] - 1, values[i] + 2 * ns[i]],
  }
}

function differencePowers(rng: Rng): Draft {
  const p = pick(rng, [2, 2, 3] as const)
  const s = int(rng, 1, p === 2 ? 4 : 2)
  const a = int(rng, 1, 20)
  const diffs = Array.from({ length: 5 }, (_, i) => (s + i) ** p)
  const values = [a]
  for (const d of diffs) values.push(values[values.length - 1] + d)
  return {
    pattern: 'difference-powers',
    values,
    rule: both((m) => m.diffsArePowers(p, diffs.map((_, i) => `${s + i}${sup(p)}`).join(', '))),
    ops: diffs.map(sign),
    traps: (i) => [values[i - 1] + (s + i) ** p, values[i] + 1, values[i] - 1],
  }
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

function prime(rng: Rng): Draft {
  const len = int(rng, 6, 7)
  const s = int(rng, 0, PRIMES.length - len)
  const values = PRIMES.slice(s, s + len)
  return {
    pattern: 'prime',
    values,
    rule: both((m) => m.primesInOrder),
    explain: (i) => both((m) => m.primeAfter(values[i - 1], values[i])),
    traps: (i) => [values[i] + 1, values[i] - 1, values[i] + 2].filter((x) => !PRIMES.includes(x)),
  }
}

function powerPairs(rng: Rng): Draft {
  const s = int(rng, 1, 3)
  const values: number[] = []
  for (let n = s; n < s + 4; n++) values.push(n * n, n ** 3)
  const label = (i: number) => `${s + Math.floor(i / 2)}${i % 2 === 0 ? '²' : '³'}`
  return {
    pattern: 'power-pairs',
    values,
    blanks: [5, 6, 7],
    rule: both((m) => m.squareCubePairs(values.map((_, i) => label(i)).join(', '))),
    explain: (i) => same(`${label(i)} = ${values[i]}`),
    traps: (i) => {
      const n = s + Math.floor(i / 2)
      return i % 2 === 0 ? [n ** 3, (n - 1) ** 3 + 1, n * 2] : [n ** 4, n * n * 2, n ** 3 + n]
    },
  }
}

const BUILDERS: Record<string, (rng: Rng) => Draft> = {
  arithmetic,
  'second-difference': secondDifference,
  'repeating-difference': repeatingDifference,
  alternating,
  'multiply-divide': multiplyDivide,
  'mixed-operation': mixedOperation,
  'power-plus': powerPlus,
  'difference-powers': differencePowers,
  prime,
  'power-pairs': powerPairs,
}
export const GENERATOR_PATTERNS = Object.keys(BUILDERS) as PatternId[]

/** A full series (no blank) from one pattern; the mini-games build their questions on this. */
export function buildSeries(rng: Rng, pattern?: PatternId): Draft {
  return BUILDERS[pattern ?? pick(rng, GENERATOR_PATTERNS)](rng)
}

// ---------- assemble a question ----------

function distractors(rng: Rng, answer: number, traps: number[]): number[] {
  const ok = (x: number) => Number.isInteger(x) && x !== answer && (answer < 0 || x >= 0)
  const chosen: number[] = []
  const add = (x: number) => {
    if (ok(x) && !chosen.includes(x) && chosen.length < 3) chosen.push(x)
  }
  shuffle(rng, traps).slice(0, 2).forEach(add)
  const mag = Math.max(2, Math.round(Math.abs(answer) / 10))
  const generic = shuffle(rng, [answer + 1, answer - 1, answer + 2, answer - 2, answer + mag, answer - mag, answer + 10, answer - 10])
  generic.forEach(add)
  return chosen
}

export function generateNumberSeries(rng: Rng = Math.random, pattern?: PatternId): Question {
  const d = buildSeries(rng, pattern)
  const blanks = d.blanks ?? d.values.map((_, i) => i).filter((i) => i >= 2)
  const i = pick(rng, blanks)
  const answer = d.values[i]
  const wrong = distractors(rng, answer, d.traps(i))
  const order = shuffle(rng, [answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, String(order[j])])) as Record<OptionKey, string>
  const answerKey = OPTION_KEYS[order.indexOf(answer)]

  let working: Text
  if (d.explain) working = d.explain(i)
  else {
    const ops = d.ops!
    const sum = `${d.values[i - 1]} ${spaced(ops[i - 1])} = ${answer}`
    const check = i + 1 < d.values.length ? `${answer} ${spaced(ops[i])} = ${d.values[i + 1]}` : undefined
    working = both((m) => sum + (check ? m.check(check) : ''))
  }

  return {
    id: `gen-${d.pattern}-${Math.floor(rng() * 1e9).toString(36)}`,
    terms: d.values.map((v, j) => (j === i ? '?' : String(v))),
    options,
    answer: answerKey,
    rule: d.rule.en,
    ops: d.ops,
    working: working.en,
    pattern: d.pattern,
    generated: true,
    kn: { rule: d.rule.kn, working: working.kn },
  }
}
