import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Arrangement Test (Chapter 36), as in the book:
 * - ranks and places: from the other end, the total from both ends, the same place from both ends,
 *   two people who switch places, a rank some places below or above another, a book that is moved;
 * - a word or a string of digits sorted: how many stay in their place;
 * - five people in a row facing north, with clues: who sits where, or how many sit between two.
 * A seating question is kept only when every seating that fits the clues gives the same answer.
 */

let counter = 0

function build(rng: Rng, pattern: PatternId, prompt: Text, answer: string, wrong: string[], rule: Text, working: Text): Question {
  const opts = shuffle(rng, [answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, opts[i]])) as Record<OptionKey, string>
  return {
    id: `gen-ar-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    options,
    answer: OPTION_KEYS[opts.indexOf(answer)],
    rule: rule.en,
    working: working.en,
    pattern,
    generated: true,
    kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn },
  }
}

/** Three different wrong numbers near the answer, all at least 1. */
function near(rng: Rng, answer: number, likely: number[]): string[] {
  const out = new Set<number>()
  for (const x of shuffle(rng, likely)) if (x !== answer && x >= 1 && out.size < 3) out.add(x)
  for (let d = 1; out.size < 3; d++) for (const x of [answer + d, answer - d]) if (x !== answer && x >= 1 && out.size < 3) out.add(x)
  return [...out].map(String)
}

const NAMES: [string, string][] = [
  ['Ravi', 'ರವಿ'], ['Asha', 'ಆಶಾ'], ['Kiran', 'ಕಿರಣ'], ['Meena', 'ಮೀನಾ'], ['Suresh', 'ಸುರೇಶ'], ['Divya', 'ದಿವ್ಯಾ'], ['Anil', 'ಅನಿಲ'], ['Lakshmi', 'ಲಕ್ಷ್ಮಿ'],
]
/** A name in both languages. */
const person = (rng: Rng): Text => {
  const [en, kn] = pick(rng, NAMES)
  return { en, kn }
}
const two = (rng: Rng): [Text, Text] => {
  const [a, b] = shuffle(rng, NAMES).slice(0, 2)
  return [{ en: a[0], kn: a[1] }, { en: b[0], kn: b[1] }]
}

function rankQuestion(rng: Rng): Question {
  const kind = int(rng, 0, 5)
  if (kind === 0) {
    const n = int(rng, 20, 60)
    const r = int(rng, 2, n - 1)
    const p = person(rng)
    const ans = n - r + 1
    return build(rng, 'ar-rank', both((g, l) => g.arOtherEnd(p[l], r, n)), String(ans), near(rng, ans, [n - r, n - r + 2, r, n - r - 1]), both((g) => g.arOtherEndRule), same(`${n} − ${r} + 1 = ${ans}`))
  }
  if (kind === 1) {
    const a = int(rng, 3, 30)
    const b = int(rng, 3, 30)
    const p = person(rng)
    const ans = a + b - 1
    return build(rng, 'ar-rank', both((g, l) => g.arBothEnds(p[l], a, b)), String(ans), near(rng, ans, [a + b, a + b + 1, a + b - 2]), both((g) => g.arBothEndsRule), same(`${a} + ${b} − 1 = ${ans}`))
  }
  if (kind === 2) {
    const k = int(rng, 3, 20)
    const p = person(rng)
    const ans = 2 * k - 1
    return build(rng, 'ar-rank', both((g, l) => g.arSameBoth(p[l], k)), String(ans), near(rng, ans, [2 * k, 2 * k + 1, 2 * k - 2]), both((g) => g.arBothEndsRule), same(`${k} + ${k} − 1 = ${ans}`))
  }
  if (kind === 3) {
    // P is a-th from the left, Q b-th from the right; after switching, P is c-th from the left.
    const [p, q] = two(rng)
    const b = int(rng, 3, 15)
    const c = int(rng, 5, 25)
    const total = c + b - 1
    const a = int(rng, 2, total - 1)
    if (a === c) return rankQuestion(rng)
    return build(rng, 'ar-rank', both((g, l) => g.arSwitch(p[l], a, q[l], b, c)), String(total), near(rng, total, [c + b, a + b - 1, c + b - 2, a + b]), both((g, l) => g.arSwitchRule(p[l], q[l])), same(`${c} + ${b} − 1 = ${total}`))
  }
  if (kind === 4) {
    // P is k ranks below (or above) Q, who is r-th in a class of n: P's rank from the last.
    const [p, q] = two(rng)
    const n = int(rng, 30, 60)
    const r = int(rng, 8, n - 10)
    const k = int(rng, 2, 7)
    const below = rng() < 0.6
    const rank = below ? r + k : r - k
    const ans = n - rank + 1
    const other = n - (below ? r - k : r + k) + 1
    return build(rng, 'ar-rank', both((g, l) => g.arBelow(p[l], k, below, q[l], r, n)), String(ans), near(rng, ans, [other, n - rank, rank, n - r + 1]), both((g) => g.arBelowRule), same(`${r} ${below ? '+' : '−'} ${k} = ${rank}; ${n} − ${rank} + 1 = ${ans}`))
  }
  // A book moved k places to the right becomes m-th from the left: its first place from the right.
  const n = int(rng, 12, 30)
  const k = int(rng, 2, 6)
  const m = int(rng, k + 2, n - 1)
  const start = m - k
  const ans = n - start + 1
  return build(rng, 'ar-rank', both((g) => g.arMoved(n, k, m)), String(ans), near(rng, ans, [n - m + 1, n - start, n - (m + k) + 1, ans + 1]), both((g) => g.arMovedRule), same(`${m} − ${k} = ${start}; ${n} − ${start} + 1 = ${ans}`))
}

const WORDS = ['MATHEMATICS', 'SCHOLARSHIP', 'KARNATAKA', 'EDUCATION', 'STUDENT', 'TEACHER', 'NATIONAL', 'EXAMINATION', 'SCIENCE', 'LIBRARY', 'COMPUTER', 'PENCIL']

function orderQuestion(rng: Rng): Question {
  const digits = rng() < 0.5
  const s = digits ? Array.from({ length: int(rng, 8, 14) }, () => int(rng, 0, 9)).join('') : pick(rng, WORDS)
  const sorted = [...s].sort().join('')
  const places = [...s].map((c, i) => (sorted[i] === c ? i + 1 : 0)).filter(Boolean)
  const ans = places.length
  const wrong = new Set<number>()
  for (const x of shuffle(rng, [ans + 1, ans + 2, ans - 1, ans + 3, ans - 2])) if (x >= 0 && x !== ans && wrong.size < 3) wrong.add(x)
  const prompt = both((g) => g.arSorted(s, digits))
  const working = both((g) => g.arSortedWork(s, sorted, places))
  return build(rng, 'ar-order', prompt, String(ans), [...wrong].map(String), both((g) => g.arSortedRule), working)
}

/** A clue about a row, true of the seating it was made from. */
type Clue = { text: Text; holds: (row: string[]) => boolean; tag: string }
const perms = (xs: string[]): string[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))
const ALL_ROWS = perms(['P', 'Q', 'R', 'S', 'T'])

function clues(row: string[], rng: Rng): Clue[] {
  const at = (r: string[], x: string) => r.indexOf(x)
  const out: Clue[] = []
  const [x, y] = shuffle(rng, row).slice(0, 2)
  const d = at(row, x) - at(row, y)
  if (at(row, x) === 0 || at(row, x) === 4) {
    const left = at(row, x) === 0
    out.push({ text: both((g) => g.arEnd(x, left)), holds: (r) => at(r, x) === (left ? 0 : 4), tag: left ? 'left' : 'right' })
    out.push({ text: both((g) => g.arAnEnd(x)), holds: (r) => at(r, x) === 0 || at(r, x) === 4, tag: 'end' })
  }
  if (at(row, x) === 2) out.push({ text: both((g) => g.arMiddle(x)), holds: (r) => at(r, x) === 2, tag: 'middle' })
  if (d === -1) out.push({ text: both((g) => g.arJustLeft(x, y)), holds: (r) => at(r, x) - at(r, y) === -1, tag: `just ${x}` })
  if (Math.abs(d) >= 2) out.push({ text: both((g) => g.arBetween(x, y, Math.abs(d) - 1)), holds: (r) => Math.abs(at(r, x) - at(r, y)) === Math.abs(d), tag: `gap ${[x, y].sort().join('')}` })
  if (Math.abs(d) === 1) out.push({ text: both((g) => g.arNext(x, y)), holds: (r) => Math.abs(at(r, x) - at(r, y)) === 1, tag: `gap ${[x, y].sort().join('')}` })
  if (Math.abs(d) >= 2) out.push({ text: both((g) => g.arNotNext(x, y)), holds: (r) => Math.abs(at(r, x) - at(r, y)) !== 1, tag: 'not next' })
  if (d > 0) out.push({ text: both((g) => g.arRightOf(x, y)), holds: (r) => at(r, x) > at(r, y), tag: 'right of' })
  return out
}

function seatQuestion(rng: Rng): Question {
  for (;;) {
    const row = shuffle(rng, ['P', 'Q', 'R', 'S', 'T'])
    const [a, b] = shuffle(rng, row).slice(0, 2)
    // `gives`: the clue that would state the answer outright, which the question must not use.
    const asks: { text: Text; answer: (r: string[]) => string; wrongs: string[]; gives: string }[] = [
      { text: both((g) => g.arWhoMiddle), answer: (r) => r[2], wrongs: row, gives: 'middle' },
      { text: both((g) => g.arWhoEnd(true)), answer: (r) => r[0], wrongs: row, gives: 'left' },
      { text: both((g) => g.arWhoEnd(false)), answer: (r) => r[4], wrongs: row, gives: 'right' },
      { text: both((g) => g.arWhoRightOf(a)), answer: (r) => r[r.indexOf(a) + 1] ?? '−', wrongs: row.filter((x) => x !== a), gives: `just ${a}` },
      { text: both((g) => g.arHowMany(a, b)), answer: (r) => String(Math.abs(r.indexOf(a) - r.indexOf(b)) - 1), wrongs: ['0', '1', '2', '3'], gives: `gap ${[a, b].sort().join('')}` },
    ]
    const ask = pick(rng, asks)
    const answer = ask.answer(row)
    if (answer === '−') continue
    const chosen: Clue[] = []
    let fits = ALL_ROWS
    for (let n = 0; n < 40 && (chosen.length < 3 || new Set(fits.map(ask.answer)).size > 1); n++) {
      const c = pick(rng, clues(row, rng))
      if (c.tag === ask.gives || chosen.some((x) => x.text.en === c.text.en)) continue
      const next = fits.filter(c.holds)
      if (next.length === fits.length && chosen.length >= 2) continue
      chosen.push(c)
      fits = next
    }
    if (new Set(fits.map(ask.answer)).size !== 1 || chosen.length > 6) continue
    const wrong = shuffle(rng, ask.wrongs.filter((x) => x !== answer)).slice(0, 3)
    if (wrong.length < 3) continue
    const clueText: Text = { en: chosen.map((c) => c.text.en).join(' '), kn: chosen.map((c) => c.text.kn).join(' ') }
    const prompt = both((g, l) => `${g.arRowIntro} ${clueText[l]} ${ask.text[l]}`)
    const working = same(`${row.join(' ')}`)
    return build(rng, 'ar-seat', prompt, answer, wrong, both((g) => g.arSeatRule), both((g) => g.arSeatWork(working.en)))
  }
}

/** A generated question. */
export function generateArrangement(rng: Rng = Math.random): Question {
  const r = rng()
  return r < 0.5 ? rankQuestion(rng) : r < 0.7 ? orderQuestion(rng) : seatQuestion(rng)
}
