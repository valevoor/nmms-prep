import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { evaluate, niceValue, SIGNS, steps } from './arithmetic'
import type { Frac, Sign } from './arithmetic'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

type Relation = '=' | '<' | '>'
const RELATIONS: Relation[] = ['=', '<', '>']

/** One side of a statement: numbers with signs between them. */
interface Side {
  nums: number[]
  ops: Sign[]
}

/** A statement as tokens: "6", "×", "8", "<", "9", "×", "7". */
type Tokens = string[]

const tokens = (l: Side, rel: string, r: Side): Tokens => [...sideTokens(l), rel, ...sideTokens(r)]
const sideTokens = (s: Side): Tokens => s.nums.flatMap((n, i) => (i ? [s.ops[i - 1], String(n)] : [String(n)]))

/** Splits tokens at their one relation sign; undefined if there isn't exactly one, or a side is empty. */
function split(t: Tokens): { l: Side; rel: Relation; r: Side } | undefined {
  const at = t.flatMap((x, i) => (RELATIONS.includes(x as Relation) ? [i] : []))
  if (at.length !== 1) return undefined
  const side = (part: Tokens): Side | undefined => {
    if (part.length % 2 === 0) return undefined
    const nums = part.filter((_, i) => i % 2 === 0).map(Number)
    const ops = part.filter((_, i) => i % 2 === 1) as Sign[]
    return nums.every(Number.isFinite) && ops.every((o) => SIGNS.includes(o)) ? { nums, ops } : undefined
  }
  const l = side(t.slice(0, at[0]))
  const r = side(t.slice(at[0] + 1))
  return l && r ? { l, rel: t[at[0]] as Relation, r } : undefined
}

const cmp = ([a, b]: Frac, [c, d]: Frac) => Math.sign(a * d - c * b)

/** Is the statement true? False for anything that isn't a statement (no relation, ÷ 0, …). */
export function holds(t: Tokens): boolean {
  const s = split(t)
  const lv = s && evaluate(s.l.nums, s.l.ops)
  const rv = s && evaluate(s.r.nums, s.r.ops)
  if (!s || !lv || !rv) return false
  return cmp(lv, rv) === { '=': 0, '<': -1, '>': 1 }[s.rel]
}

/**
 * "6 × 8 < 9 × 7 → 6 × 8 = 48; 9 × 7 = 63 → 48 < 63": the statement, each side worked out, then
 * the two compared. The statement is not repeated when the working already starts with it.
 */
function work(t: Tokens): string {
  const w = sides(t)
  return w.startsWith(t.join(' ')) ? w : `${t.join(' ')} → ${w}`
}

function sides(t: Tokens): string {
  const { l, rel, r } = split(t)!
  const parts = [l, r].filter((s) => s.ops.length).map((s) => steps(s.nums, s.ops))
  const value = (s: Side) => {
    const [n, d] = evaluate(s.nums, s.ops)!
    return d === 1 ? `${n}` : `${n}/${d}`
  }
  const compare = parts.length === 2 || rel !== '=' ? ` → ${value(l)} ${rel} ${value(r)}` : ''
  return parts.join('; ') + compare
}

const POOL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 28, 30, 33, 35, 36, 40, 42, 45, 48, 54]

/** A side whose value is easy to work out by hand, with `count` numbers. */
function niceSide(rng: Rng, count: number, distinctSigns = false): { side: Side; value: number } {
  for (;;) {
    const nums = shuffle(rng, [...POOL]).slice(0, count)
    const ops = distinctSigns ? shuffle(rng, [...SIGNS]).slice(0, count - 1) : Array.from({ length: count - 1 }, () => pick(rng, SIGNS))
    const value = niceValue(nums, ops)
    if (value !== undefined && value > 0 && value < 200) return { side: { nums, ops }, value }
  }
}

/** Two numbers and a sign that make `value`, e.g. 34 → 40 − 6; undefined if none is easy. */
function sideMaking(rng: Rng, value: number, avoid: Sign[] = []): Side | undefined {
  const ways: Side[] = []
  for (const b of shuffle(rng, [...POOL]).slice(0, 12)) {
    if (value - b > 1) ways.push({ nums: [value - b, b], ops: ['+'] })
    if (value + b <= 120) ways.push({ nums: [value + b, b], ops: ['−'] })
    if (value % b === 0 && value / b > 1) ways.push({ nums: [value / b, b], ops: ['×'] })
    if (value * b <= 120) ways.push({ nums: [value * b, b], ops: ['÷'] })
  }
  const ok = ways.filter((w) => !avoid.includes(w.ops[0]))
  return ok.length ? pick(rng, ok) : undefined
}

interface Draft {
  pattern: PatternId
  prompt: Text
  rule: Text
  working: Text
  shown: string
  answer: string
  wrong: string[]
}

/** A true statement with 3 to 5 numbers: the relation may sit anywhere, as in the book. */
function trueStatement(rng: Rng, distinctSigns: boolean): Tokens | undefined {
  const leftCount = int(rng, 2, 3)
  const { side: l, value } = niceSide(rng, leftCount, distinctSigns)
  const rel: Relation = distinctSigns || rng() < 0.6 ? '=' : pick(rng, ['<', '>'] as Relation[])
  let r: Side | undefined
  if (rel === '=') r = rng() < 0.3 && !distinctSigns ? { nums: [value], ops: [] } : sideMaking(rng, value, distinctSigns ? l.ops : [])
  else {
    const other = niceSide(rng, int(rng, 1, 2))
    if ((rel === '<') !== other.value > value) return undefined
    r = other.side
  }
  if (!r) return undefined
  // Sometimes the short side comes first: "23 > 8 × 4 − 21 + 7".
  const t = rng() < 0.3 ? tokens(r, rel === '<' ? '>' : rel === '>' ? '<' : '=', l) : tokens(l, rel, r)
  return holds(t) ? t : undefined
}

const ALL_SIGNS = [...SIGNS, ...RELATIONS]

function fillSigns(rng: Rng): Draft | undefined {
  const t = trueStatement(rng, false)
  if (!t) return undefined
  const signs = t.filter((_, i) => i % 2 === 1)
  const numbers = t.filter((_, i) => i % 2 === 0)
  const put = (s: string[]) => numbers.flatMap((n, i) => (i ? [s[i - 1], n] : [n]))
  // Wrong options: the same signs in another order (tempting), then any set with one relation sign.
  const tries = [...Array.from({ length: 6 }, () => shuffle(rng, [...signs])), ...Array.from({ length: 60 }, () => signs.map(() => pick(rng, ALL_SIGNS)))]
  const seen = new Set([signs.join()])
  const wrong: string[][] = []
  for (const s of tries) {
    if (wrong.length === 3) break
    if (seen.has(s.join()) || s.filter((x) => RELATIONS.includes(x as Relation)).length !== 1 || holds(put(s))) continue
    seen.add(s.join())
    wrong.push(s)
  }
  if (wrong.length < 3) return undefined
  return {
    pattern: 'sign-fill',
    prompt: both((m) => m.ssFillAsk),
    rule: both((m) => m.ssRuleFill),
    working: same(work(t)),
    shown: numbers.join(' * '),
    answer: signs.join(', '),
    wrong: wrong.map((s) => s.join(', ')),
  }
}

/** Swaps the tokens at i and j. */
const swapAt = (t: Tokens, i: number, j: number) => t.map((x, k) => (k === i ? t[j] : k === j ? t[i] : x))

function swapTwo(rng: Rng): Draft | undefined {
  // Every number and every sign appears once, so "swap 9 and 27" names one change.
  const truth = trueStatement(rng, true)
  if (!truth || new Set(truth).size !== truth.length) return undefined
  const pairs = truth.flatMap((_, i) => truth.slice(i + 1).map((__, k) => [i, i + 1 + k] as [number, number]))
  // Only like with like: two numbers, or two signs (one of them may be the = sign).
  const alike = pairs.filter(([i, j]) => i % 2 === j % 2)
  const [i, j] = pick(rng, alike)
  const shown = swapAt(truth, i, j)
  if (holds(shown)) return undefined
  const label = ([x, y]: [number, number]) => `${shown[x]} & ${shown[y]}`
  const others = shuffle(
    rng,
    alike.filter(([x, y]) => !(x === i && y === j) && !holds(swapAt(shown, x, y))),
  )
  // Mix sign swaps and number swaps among the wrong options, as the book does.
  const signPairs = others.filter(([x]) => x % 2 === 1)
  const numberPairs = others.filter(([x]) => x % 2 === 0)
  const wrong = shuffle(rng, [...signPairs.slice(0, 2), ...numberPairs.slice(0, 2)]).slice(0, 3)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'sign-swap',
    prompt: both((m) => m.ssSwapAsk),
    rule: both((m) => m.ssRuleSwap),
    working: same(`${shown[i]} ↔ ${shown[j]}: ${work(truth)}`),
    shown: shown.join(' '),
    answer: label([i, j]),
    wrong: wrong.map(label),
  }
}

const BUILDERS = [fillSigns, fillSigns, swapTwo]

let counter = 0

export function generateSigns(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    if (!d || new Set([d.answer, ...d.wrong]).size !== 4) continue
    const order = shuffle(rng, [d.answer, ...d.wrong])
    return {
      id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [d.shown],
      prompt: d.prompt.en,
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
