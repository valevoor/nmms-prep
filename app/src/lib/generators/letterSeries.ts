import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** A=1 … Z=26, wrapping round (27 is A again, 0 is Z). */
export const letter = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
export const place = (c: string) => c.charCodeAt(0) - 64
const sign = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
const spaced = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`)

/** "S (19) + 3 = V (22)", or with a wrap: "V (22) + 5 = 27 → A (1)". The same in every language. */
export function stepLine(from: string, d: number): string {
  const raw = place(from) + d
  const to = letter(raw)
  const lhs = `${from} (${place(from)}) ${spaced(d)}`
  return raw >= 1 && raw <= 26 ? `${lhs} = ${to} (${raw})` : `${lhs} = ${raw} → ${to} (${place(to)})`
}

export const LETTER_PATTERNS: PatternId[] = ['letter-step', 'letter-growing', 'letter-alternating', 'letter-groups', 'letter-block', 'letter-position']

interface LetterDraft {
  pattern: PatternId
  terms: string[]
  rule: Text
  ops?: string[]
  /** Indices that may be blanked out. */
  blanks: number[]
  /** Blank the last two terms together (answer "O, H"), as the book does for mixed series. */
  pairBlank?: boolean
  explain: (i: number) => Text
  /** Tempting wrong answers for blank index i. */
  traps: (i: number) => string[]
}

/** Walks from a start place by the given jumps. */
const walk = (start: number, steps: number[]) => steps.reduce((s, d) => [...s, s[s.length - 1] + d], [start])
const wraps = (places: number[]) => places.some((p) => p < 1 || p > 26)
const shiftAll = (s: string, d: number) => s.replace(/[A-Z]/g, (c) => letter(place(c) + d))

function step(rng: Rng): LetterDraft {
  const k = int(rng, 2, 6)
  const back = rng() < 0.25
  const d = back ? -k : k
  const places = walk(int(rng, 1, 26), Array(5).fill(d))
  const terms = places.map(letter)
  const wrapNote = wraps(places) ? (back ? 'wrapBack' : 'wrapForward') : undefined
  return {
    pattern: 'letter-step',
    terms,
    rule: both((m) => m.letterStep(k, back) + (wrapNote ? m[wrapNote] : '')),
    ops: terms.slice(1).map(() => sign(d)),
    blanks: [2, 3, 4, 5],
    explain: (i) => same(stepLine(terms[i - 1], d)),
    traps: (i) => [letter(place(terms[i]) + 1), letter(place(terms[i]) - 1), letter(place(terms[i - 1]) + d + (back ? 1 : -1) * 2)],
  }
}

function growing(rng: Rng): LetterDraft {
  const doubled = rng() < 0.35
  const s0 = int(rng, 1, 3)
  const steps = doubled ? [s0, s0, s0 + 1, s0 + 1, s0 + 2, s0 + 2] : [s0, s0 + 1, s0 + 2, s0 + 3, s0 + 4]
  const places = walk(int(rng, 1, 12), steps)
  const terms = places.map(letter)
  return {
    pattern: 'letter-growing',
    terms,
    rule: both((m) => m.letterJumps(steps.map(sign).join(', ')) + (wraps(places) ? m.wrapForward : '')),
    ops: steps.map(sign),
    blanks: terms.map((_, i) => i).filter((i) => i >= 3),
    explain: (i) => same(stepLine(terms[i - 1], steps[i - 1])),
    // The classic slip: repeating the previous jump instead of growing it.
    traps: (i) => [letter(place(terms[i - 1]) + steps[i - 2]), letter(place(terms[i]) + 1), letter(place(terms[i]) - 1)],
  }
}

function alternating(rng: Rng): LetterDraft {
  const a = pick(rng, [1, 2, 3])
  const b = pick(rng, [1, 2, 3, -1, -2])
  const len = pick(rng, [9, 10])
  const odd = walk(int(rng, 1, 8), Array(4).fill(a)).map(letter)
  const even = walk(b > 0 ? int(rng, 9, 14) : int(rng, 18, 26), Array(4).fill(b)).map(letter)
  const terms = Array.from({ length: len }, (_, i) => (i % 2 === 0 ? odd[i / 2] : even[(i - 1) / 2]))
  const shown = (s: string[], from: number) => s.filter((_, j) => 2 * j + from < len - 2).join(', ')
  return {
    pattern: 'letter-alternating',
    terms,
    rule: both((m) => m.letterMixed(`${shown(odd, 0)} (${sign(a)})`, `${shown(even, 1)} (${sign(b)})`)),
    blanks: [len - 2, len - 1],
    pairBlank: true,
    explain: (i) => {
      const inOdd = i % 2 === 0
      return both((m) => (inOdd ? m.inFirst(stepLine(terms[i - 2], a)) : m.inSecond(stepLine(terms[i - 2], b))))
    },
    traps: () => [],
  }
}

function groups(rng: Rng): LetterDraft {
  const size = pick(rng, [2, 2, 3])
  const cols = Array.from({ length: size }, () => {
    const d = pick(rng, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    const start = d > 0 ? int(rng, 1, 26 - 4 * d) : int(rng, 1 - 4 * d, 26)
    return { d, places: walk(start, Array(4).fill(d)) }
  })
  const terms = Array.from({ length: 5 }, (_, i) => cols.map((c) => letter(c.places[i])).join(''))
  const shown = (col: { places: number[] }) => col.places.slice(0, 4).map(letter).join(', ')
  return {
    pattern: 'letter-groups',
    terms,
    rule: both((m) => cols.map((c, n) => m.groupPart(n + 1, shown(c), sign(c.d))).join('. ') + '.'),
    blanks: [2, 3, 4],
    explain: (i) => both((m) => m.soAnswer(cols.map((c) => stepLine(letter(c.places[i - 1]), c.d)).join(', '), terms[i])),
    traps: (i) => {
      const t = terms[i]
      const nudged = cols.map((_, n) => t.slice(0, n) + letter(place(t[n]) + pick(rng, [1, -1])) + t.slice(n + 1))
      return [...nudged, t.split('').reverse().join('')]
    },
  }
}

const ORDERS: Record<number, number[][]> = {
  3: [
    [0, 2, 1],
    [1, 2, 0],
    [2, 0, 1],
    [1, 0, 2],
    [2, 1, 0],
  ],
  4: [
    [0, 2, 3, 1],
    [1, 0, 3, 2],
    [3, 2, 1, 0],
    [0, 3, 1, 2],
  ],
}

function block(rng: Rng): LetterDraft {
  const size = pick(rng, [3, 3, 4])
  const order = pick(rng, ORDERS[size])
  const count = 5
  const start = int(rng, 1, 27 - size * count)
  const rows = Array.from({ length: count }, (_, i) => Array.from({ length: size }, (_, k) => letter(start + size * i + k)))
  const terms = rows.map((r) => order.map((k) => r[k]).join(''))
  const orderText = order.map((k) => k + 1).join(', ')
  return {
    pattern: 'letter-block',
    terms,
    rule: both((m) => m.letterBlock(size, orderText, rows.slice(0, 3).map((r) => r[0]).join(', '))),
    blanks: [2, 3, 4],
    explain: (i) => both((m) => m.blockNext(rows[i].join(''), terms[i])),
    traps: (i) => {
      const others = ORDERS[size].filter((o) => o !== order).map((o) => o.map((k) => rows[i][k]).join(''))
      return [rows[i].join(''), ...shuffle(rng, others).slice(0, 2), shiftAll(terms[i], 1)]
    },
  }
}

function position(rng: Rng): LetterDraft {
  const k = int(rng, 2, 5)
  const places = walk(int(rng, 1, 26 - 4 * k), Array(4).fill(k))
  const terms = places.map((p) => `${letter(p)}-${p}`)
  return {
    pattern: 'letter-position',
    terms,
    rule: both((m) => m.letterPosition(k)),
    blanks: [2, 3, 4],
    explain: (i) => both((m) => m.soAnswer(stepLine(letter(places[i - 1]), k), terms[i])),
    traps: (i) => {
      const p = places[i]
      return [`${letter(p + 1)}-${p}`, `${letter(p)}-${p + 1}`, `${letter(p - 1)}-${p - 1}`, `${letter(p + 1)}-${p + 1}`]
    },
  }
}

const BUILDERS: Record<string, (rng: Rng) => LetterDraft> = {
  'letter-step': step,
  'letter-growing': growing,
  'letter-alternating': alternating,
  'letter-groups': groups,
  'letter-block': block,
  'letter-position': position,
}

/** Three different wrong answers: the traps first, then the answer shifted along the alphabet. */
function distractors(rng: Rng, answer: string, traps: string[]): string[] {
  const out: string[] = []
  const add = (x: string) => {
    if (x && x !== answer && !out.includes(x) && out.length < 3) out.push(x)
  }
  shuffle(rng, traps).forEach(add)
  shuffle(rng, [1, -1, 2, -2, 3]).forEach((d) => add(shiftAll(answer, d)))
  return out
}

let counter = 0

export function generateLetterSeries(rng: Rng = Math.random, pattern?: PatternId): Question {
  const d = BUILDERS[pattern ?? pick(rng, LETTER_PATTERNS)](rng)
  const blankIdx = d.pairBlank ? d.blanks : [pick(rng, d.blanks)]
  const answer = blankIdx.map((i) => d.terms[i]).join(', ')

  let wrong: string[]
  if (d.pairBlank) {
    // Two blanks: tempt with the pair swapped, or one letter off.
    const [x, y] = blankIdx.map((i) => d.terms[i])
    const near = (c: string, s: number) => letter(place(c) + s)
    wrong = distractors(rng, answer, [`${y}, ${x}`, `${near(x, 1)}, ${y}`, `${x}, ${near(y, 1)}`, `${near(x, -1)}, ${near(y, -1)}`])
  } else wrong = distractors(rng, answer, d.traps(blankIdx[0]))

  const order = shuffle(rng, [answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, string>
  const lines = blankIdx.map((i) => d.explain(i))
  const working = { en: lines.map((l) => l.en).join('. '), kn: lines.map((l) => l.kn).join('. ') }

  return {
    id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: d.terms.map((t, i) => (blankIdx.includes(i) ? '?' : t)),
    options,
    answer: OPTION_KEYS[order.indexOf(answer)],
    rule: d.rule.en,
    ops: d.ops,
    working: working.en,
    pattern: d.pattern,
    generated: true,
    kn: { rule: d.rule.kn, working: working.kn },
  }
}
