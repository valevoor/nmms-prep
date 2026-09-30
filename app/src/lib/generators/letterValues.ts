import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Numbers with Letters by a Rule (Chapter 29), as in the book. A table of letters has numbers along
 * its top and its left side; each letter is worth its row number + − × or ÷ its column number. The
 * questions ask for a group of letters' code, total or product, which group has the highest or
 * lowest total or product, or which group has a given code, total or product. The last kind uses
 * two 5 × 5 tables where every letter appears five times and is named by its row and column
 * numbers (S = 02, 13, …): which set of pairs spells a word?
 */

type Op = { sym: string; id: PatternId; f: (r: number, c: number) => number; headers: (rng: Rng) => [number[], number[]] }

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b)
const distinct = (rng: Rng, n: number, lo: number, hi: number) => sorted(shuffle(rng, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n))

/** Column numbers for ÷, and the number every row number is a multiple of. */
const DIVISORS: [number[], number][] = [
  [[2, 4, 8], 8],
  [[2, 3, 6], 6],
  [[1, 2, 4], 4],
  [[2, 5, 10], 10],
  [[3, 6, 12], 12],
  [[1, 3, 9], 9],
  [[2, 3, 4, 6], 12],
  [[1, 2, 3, 6], 6],
]

const OPS: Op[] = [
  { sym: '+', id: 'lv-sum', f: (r, c) => r + c, headers: (rng) => { const n = int(rng, 3, 4); return [distinct(rng, n, 1, 12), distinct(rng, n, 1, 12)] } },
  { sym: '×', id: 'lv-prod', f: (r, c) => r * c, headers: (rng) => { const n = int(rng, 3, 4); return [distinct(rng, n, 1, 7), distinct(rng, n, 1, 7)] } },
  // Every row number is bigger than every column number, so no value is below zero.
  { sym: '−', id: 'lv-diff', f: (r, c) => r - c, headers: (rng) => { const n = int(rng, 3, 4); return [distinct(rng, n, 7, 14), distinct(rng, n, 1, 6)] } },
  {
    sym: '÷',
    id: 'lv-quot',
    f: (r, c) => r / c,
    headers: (rng) => {
      const [cols, lcm] = pick(rng, DIVISORS)
      return [distinct(rng, cols.length, 1, 5).map((k) => k * lcm), cols]
    },
  },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const product = (xs: number[]) => xs.reduce((a, b) => a * b, 1)
const plus = (xs: number[]) => xs.join(' + ')
const times = (xs: number[]) => xs.join(' × ')

let counter = 0
const nextId = (rng: Rng) => `gen-lv-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`

function build(rng: Rng, prompt: Text, table: string[][], opts: string[], answer: string, rule: Text, working: Text, pattern: PatternId, table2?: string[][]): Question {
  const order = shuffle(rng, opts)
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, order[i]])) as Record<OptionKey, string>
  return {
    id: nextId(rng),
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    table,
    ...(table2 ? { table2 } : {}),
    options,
    answer: OPTION_KEYS[order.indexOf(answer)],
    rule: rule.en,
    working: working.en,
    pattern,
    generated: true,
    kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn },
  }
}

/** A table with a rule: letters, their values and how each value is made. */
function valueQuestion(rng: Rng): Question | null {
  const op = pick(rng, OPS)
  const [rows, cols] = op.headers(rng)
  const letters = shuffle(rng, ALPHABET).slice(0, rows.length * cols.length)
  const cell = new Map<string, [number, number]>()
  const table = [[op.sym, ...cols.map(String)], ...rows.map((r, i) => [String(r), ...cols.map((c, j) => {
    const ch = letters[i * cols.length + j]
    cell.set(ch, [r, c])
    return ch
  })])]
  const val = (ch: string) => op.f(...cell.get(ch)!)
  const vals = (w: string) => [...w].map(val)
  const how = (ch: string) => `${ch} = ${cell.get(ch)![0]} ${op.sym} ${cell.get(ch)![1]} = ${val(ch)}`
  const hows = (w: string) => [...w].map(how).join(', ')
  /** A group of n different letters from the table. */
  const group = (n: number) => shuffle(rng, letters).slice(0, n).join('')
  /** The group with one letter changed to another letter from the table. */
  const change = (w: string) => {
    const i = int(rng, 0, w.length - 1)
    const other = pick(rng, letters.filter((ch) => !w.includes(ch)))
    return w.slice(0, i) + other + w.slice(i + 1)
  }
  const eg = pick(rng, letters)
  const dir = both((g) => g.lvDir(op.sym, how(eg)))
  const rule = both((g) => g.lvRule(op.sym))
  const withDir = (ask: Text): Text => ({ en: `${dir.en} ${ask.en}`, kn: `${dir.kn} ${ask.kn}` })

  const kind = pick(rng, ['code', 'code', 'total', 'best', 'best', 'has', 'has'] as const)
  if (kind === 'code') {
    const w = group(int(rng, 3, 4))
    const code = vals(w).join(' ')
    const wrong = new Set<string>()
    for (let tries = 0; wrong.size < 3 && tries < 60; tries++) {
      const v = vals(w)
      const i = int(rng, 0, v.length - 1)
      const r = rng()
      if (r < 0.35) {
        // Two neighbouring values swapped.
        const j = (i + 1) % v.length
        ;[v[i], v[j]] = [v[j], v[i]]
      } else if (r < 0.7) {
        // One letter given another letter's value.
        v[i] = val(pick(rng, letters.filter((ch) => ch !== w[i])))
      } else v[i] += pick(rng, [-2, -1, 1, 2])
      const s = v.join(' ')
      if (s !== code && v.every((x) => x >= 0)) wrong.add(s)
    }
    if (wrong.size < 3) return null
    return build(rng, withDir(both((g) => g.lvCode(w))), table, [code, ...wrong], code, rule, same(hows(w)), op.id)
  }
  if (kind === 'total') {
    const how3 = pick(rng, ['sum', 'sum', 'product', 'square'] as const)
    const w = group(how3 === 'product' ? 3 : int(rng, 3, 4))
    const v = vals(w)
    const s = sum(v)
    const answer = how3 === 'sum' ? s : how3 === 'product' ? product(v) : s * s
    const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10]
    const swapOne = vals(change(w))
    const alt = how3 === 'sum' ? [sum(swapOne), product(v)] : how3 === 'product' ? [product(swapOne), s] : [(s + 1) ** 2, (s - 1) ** 2, s * 2, sum(swapOne) ** 2]
    const wrong = [...new Set(shuffle(rng, [...alt, ...near]))].filter((x) => x !== answer && x > 0).slice(0, 3)
    if (wrong.length < 3) return null
    const ask = both((g) => (how3 === 'sum' ? g.lvSum(w) : how3 === 'product' ? g.lvProduct(w) : g.lvSquare(w)))
    const calc = how3 === 'sum' ? `${plus(v)} = ${s}` : how3 === 'product' ? `${times(v)} = ${answer}` : `(${plus(v)})² = ${s}² = ${answer}`
    return build(rng, withDir(ask), table, [answer, ...wrong].map(String), String(answer), rule, same(`${hows(w)}; ${calc}`), op.id)
  }
  const isSum = op.sym === '÷' || op.sym === '+' || rng() < 0.6
  const len = isSum ? 4 : 3
  const score = (w: string) => (isSum ? sum(vals(w)) : product(vals(w)))
  const show = (w: string) => `${w} = ${isSum ? plus(vals(w)) : times(vals(w))} = ${score(w)}`
  if (kind === 'best') {
    const max = rng() < 0.6
    const groups = [...new Set(Array.from({ length: 4 }, () => group(len)))]
    if (groups.length < 4) return null
    const scores = groups.map(score)
    const best = max ? Math.max(...scores) : Math.min(...scores)
    if (scores.filter((x) => x === best).length !== 1) return null
    const answer = groups[scores.indexOf(best)]
    return build(rng, withDir(both((g) => g.lvBest(max, isSum))), table, groups, answer, rule, same(groups.map(show).join('; ')), op.id)
  }
  // Which group has this code, total or product: the wrong groups are the answer with one letter changed.
  const byCode = rng() < 0.35
  const w = group(len)
  const key = (x: string) => (byCode ? vals(x).join(' ') : String(score(x)))
  const wrong = new Set<string>()
  for (let tries = 0; wrong.size < 3 && tries < 40; tries++) {
    const x = rng() < 0.7 ? change(w) : group(len)
    if (x !== w && key(x) !== key(w)) wrong.add(x)
  }
  if (wrong.size < 3) return null
  const ask = both((g) => (byCode ? g.lvHasCode(key(w)) : isSum ? g.lvHasSum(score(w)) : g.lvHasProduct(score(w))))
  const groups = [w, ...wrong]
  const working = byCode ? hows(w) : groups.map(show).join('; ')
  return build(rng, withDir(ask), table, groups, w, rule, same(working), op.id)
}

/** Two 5 × 5 tables (rows and columns 0–4, then 5–9) where each row is the row above moved along. */
function pairQuestion(rng: Rng): Question | null {
  const letters = shuffle(rng, ALPHABET).slice(0, 10)
  const make = (base: string[], from: number) => {
    const shift = int(rng, 1, 4)
    const nums = [0, 1, 2, 3, 4].map((k) => String(from + k))
    return [['', ...nums], ...nums.map((r, i) => [r, ...base.map((_, j) => base[(((j - i * shift) % 5) + 5) % 5])])]
  }
  const m1 = make(letters.slice(0, 5), 0)
  const m2 = make(letters.slice(5), 5)
  const spots = (t: string[][], ch: string) =>
    t.slice(1).flatMap((row) => row.slice(1).flatMap((x, j) => (x === ch ? [row[0] + t[0][j + 1]] : [])))
  const where = (ch: string) => spots(m1, ch).concat(spots(m2, ch))
  const n1 = int(rng, 2, 3)
  const word = shuffle(rng, [...shuffle(rng, letters.slice(0, 5)).slice(0, n1), ...shuffle(rng, letters.slice(5)).slice(0, 4 - n1)])
  const spell = () => word.map((ch) => pick(rng, where(ch)))
  const answer = spell().join(', ')
  const wrong = new Set<string>()
  for (let tries = 0; wrong.size < 3 && tries < 40; tries++) {
    const p = spell()
    // One or two pairs point at a different letter of the same table.
    for (const i of shuffle(rng, [0, 1, 2, 3]).slice(0, rng() < 0.7 ? 1 : 2)) {
      const table = Number(p[i][0]) < 5 ? m1 : m2
      const others = table.slice(1).flatMap((row) => row.slice(1).flatMap((x, j) => (x !== word[i] ? [row[0] + table[0][j + 1]] : [])))
      p[i] = pick(rng, others)
    }
    const s = p.join(', ')
    if (s !== answer) wrong.add(s)
  }
  if (wrong.size < 3) return null
  const a = pick(rng, letters.slice(0, 5).filter((ch) => !word.includes(ch)))
  const b = pick(rng, letters.slice(5).filter((ch) => !word.includes(ch)))
  const w = word.join('')
  const prompt = both((g) => `${g.lvPairDir(a, where(a).join(', ').replace(/, (?=[^,]*$)/, g.lvOr), b, where(b).join(', ').replace(/, (?=[^,]*$)/, g.lvOr))} ${g.lvPairAsk(w)}`)
  const pairs = answer.split(', ')
  const working = same(pairs.map((p, i) => `${p} = ${word[i]}`).join(', '))
  return build(rng, prompt, m1, [answer, ...wrong], answer, both((g) => g.lvPairRule), working, 'lv-pair', m2)
}

/** A generated question. */
export function generateLetterValues(rng: Rng = Math.random): Question {
  for (;;) {
    const q = rng() < 0.2 ? pairQuestion(rng) : valueQuestion(rng)
    if (q) return q
  }
}
