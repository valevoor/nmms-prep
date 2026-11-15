import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Age Problems warm-up (Practice → Warm-up): the steps the book's questions are built from, one at a
 * time, before any are put together.
 *   1. ag-wu-line: move along the time line ("12 now, so 3 years ago?"), no algebra.
 *   2. ag-wu-gap:  a table of two ages; the gap between them never changes, and their sum grows by 2t.
 *   3. ag-wu-expr: words to an expression ("twice his age 3 years ago" is 2(x − 3), not 2x − 3).
 *   4. ag-wu-eqn:  a whole sentence to its equation, without solving it.
 * The wrong options are the slips students make. Every sentence is written in English and Kannada.
 */

/** A name in English and Kannada, and the English pronoun for it. */
const NAMES: [string, string, 'he' | 'she'][] = [
  ['Ravi', 'ರವಿ', 'he'], ['Asha', 'ಆಶಾ', 'she'], ['Kiran', 'ಕಿರಣ', 'he'], ['Meena', 'ಮೀನಾ', 'she'],
  ['Suresh', 'ಸುರೇಶ', 'he'], ['Divya', 'ದಿವ್ಯಾ', 'she'], ['Anil', 'ಅನಿಲ', 'he'], ['Lakshmi', 'ಲಕ್ಷ್ಮಿ', 'she'],
]
/** "k times as old" and "k times his age" in each language. */
const TIMES_EN = ['', '', 'twice', 'three times', 'four times', 'five times', 'six times']
const TIMES_KN = ['', '', 'ಎರಡರಷ್ಟು', 'ಮೂರರಷ್ಟು', 'ನಾಲ್ಕರಷ್ಟು', 'ಐದರಷ್ಟು', 'ಆರರಷ್ಟು']

interface Text {
  en: string
  kn: string
}
const t2 = (en: string, kn: string): Text => ({ en, kn })
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const same = (s: string): Text => ({ en: s, kn: s })

let counter = 0

interface Parts {
  pattern: PatternId
  prompt: Text
  answer: string
  wrong: string[]
  rule: Text
  working: Text
  clues: Text[]
  /** Options are ages ("9 years") rather than expressions. */
  years?: boolean
  table?: { en: string[][]; kn: string[][] }
  ageLine?: [number, string][]
}

function build(rng: Rng, p: Parts): Question {
  const opts = shuffle(rng, [p.answer, ...p.wrong.slice(0, 3)])
  const en = (v: string) => (p.years ? `${v} years` : v)
  const kn = (v: string) => (p.years ? `${v} ವರ್ಷ` : v)
  const options = (f: (v: string) => string) => Object.fromEntries(OPTION_KEYS.map((k, i) => [k, f(opts[i])])) as Record<OptionKey, string>
  return {
    id: `gen-wu-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: p.prompt.en,
    table: p.table?.en,
    ageLine: p.ageLine,
    options: options(en),
    answer: OPTION_KEYS[opts.indexOf(p.answer)],
    rule: p.rule.en,
    working: p.working.en,
    pattern: p.pattern,
    generated: true,
    clues: p.clues.map((c) => c.en),
    kn: { prompt: p.prompt.kn, table: p.table?.kn, rule: p.rule.kn, working: p.working.kn, clues: p.clues.map((c) => c.kn), options: options(kn) },
  }
}

/** Three different wrong whole numbers, at least 2, from the likely slips first. */
function near(rng: Rng, answer: number, likely: number[]): string[] {
  const out = new Set<number>()
  for (const x of shuffle(rng, likely)) if (Number.isInteger(x) && x !== answer && x >= 2 && out.size < 3) out.add(x)
  for (let d = 2; out.size < 3; d++) for (const x of [answer + d, answer - d]) if (x !== answer && x >= 2 && out.size < 3) out.add(x)
  return [...out].map(String)
}

/** Three of the wrong expressions, in a random order. */
const threeOf = (rng: Rng, wrong: string[]) => shuffle(rng, [...new Set(wrong)]).slice(0, 3)

// 1. The time line: an age some years ago or from now.
function line(rng: Rng, ago: boolean): Question {
  const [en, kn, he] = pick(rng, NAMES)
  const a = int(rng, 8, 40)
  const y = int(rng, 2, Math.min(9, a - 3))
  const ans = ago ? a - y : a + y
  const prompt = ago
    ? t2(`${en} is ${a} years old now. How old was ${he} ${y} years ago?`, `${kn} ಅವರಿಗೆ ಈಗ ${a} ವರ್ಷ. ${y} ವರ್ಷಗಳ ಹಿಂದೆ ಅವರ ವಯಸ್ಸು ಎಷ್ಟಾಗಿತ್ತು?`)
    : t2(`${en} is ${a} years old now. How old will ${he} be in ${y} years?`, `${kn} ಅವರಿಗೆ ಈಗ ${a} ವರ್ಷ. ${y} ವರ್ಷಗಳ ನಂತರ ಅವರ ವಯಸ್ಸು ಎಷ್ಟಾಗುತ್ತದೆ?`)
  return build(rng, {
    pattern: 'ag-wu-line',
    prompt,
    answer: String(ans),
    wrong: near(rng, ans, [ago ? a + y : a - y, y, a, ago ? a - 2 * y : a + 2 * y]),
    rule: ago ? t2('“Years ago” means take the years away.', '“ವರ್ಷಗಳ ಹಿಂದೆ” ಎಂದರೆ ಆ ವರ್ಷಗಳನ್ನು ಕಳೆಯಿರಿ.') : t2('“In … years” means add the years.', '“… ವರ್ಷಗಳ ನಂತರ” ಎಂದರೆ ಆ ವರ್ಷಗಳನ್ನು ಕೂಡಿಸಿ.'),
    working: same(ago ? `${a} − ${y} = ${ans}` : `${a} + ${y} = ${ans}`),
    clues: ago
      ? [
          t2(`“${y} years ago” is to the left of “now” on the time line: going back in time.`, `ಕಾಲರೇಖೆಯಲ್ಲಿ “${y} ವರ್ಷಗಳ ಹಿಂದೆ” “ಈಗ” ದ ಎಡಕ್ಕಿದೆ: ಹಿಂದಕ್ಕೆ ಹೋಗುತ್ತೇವೆ.`),
          t2(`Going back, an age gets smaller: take ${y} away from ${a}.`, `ಹಿಂದಕ್ಕೆ ಹೋದಂತೆ ವಯಸ್ಸು ಕಡಿಮೆಯಾಗುತ್ತದೆ: ${a} ರಿಂದ ${y} ಕಳೆಯಿರಿ.`),
        ]
      : [
          t2(`“In ${y} years” is to the right of “now” on the time line: going forward in time.`, `ಕಾಲರೇಖೆಯಲ್ಲಿ “${y} ವರ್ಷಗಳ ನಂತರ” “ಈಗ” ದ ಬಲಕ್ಕಿದೆ: ಮುಂದಕ್ಕೆ ಹೋಗುತ್ತೇವೆ.`),
          t2(`Going forward, an age gets bigger: add ${y} to ${a}.`, `ಮುಂದಕ್ಕೆ ಹೋದಂತೆ ವಯಸ್ಸು ಹೆಚ್ಚಾಗುತ್ತದೆ: ${a} ಕ್ಕೆ ${y} ಕೂಡಿಸಿ.`),
        ],
    years: true,
    ageLine: ago ? [[-y, '?'], [0, String(a)]] : [[0, String(a)], [y, '?']],
  })
}

// 2. Two ages in a table: the gap stays the same, the sum grows by 2t.
function gap(rng: Rng, askSum: boolean): Question {
  const s = int(rng, 4, 16)
  const f = s + int(rng, 20, 34)
  const a = int(rng, 2, 6)
  const b = a + int(rng, 3, 8)
  const g = f - s
  const table = {
    en: [['', 'Now', `In ${a} years`, `In ${b} years`], ['Father', String(f), String(f + a), '?'], ['Son', String(s), String(s + a), '?']],
    kn: [['', 'ಈಗ', `${a} ವರ್ಷಗಳ ನಂತರ`, `${b} ವರ್ಷಗಳ ನಂತರ`], ['ತಂದೆ', String(f), String(f + a), '?'], ['ಮಗ', String(s), String(s + a), '?']],
  }
  if (!askSum)
    return build(rng, {
      pattern: 'ag-wu-gap',
      prompt: t2(`How much older than the son will the father be in ${b} years?`, `${b} ವರ್ಷಗಳ ನಂತರ ತಂದೆ ಮಗನಿಗಿಂತ ಎಷ್ಟು ವರ್ಷ ದೊಡ್ಡವರಾಗಿರುತ್ತಾರೆ?`),
      answer: String(g),
      wrong: near(rng, g, [g + b, g - b, f + b, s + b, g + 2 * b]),
      rule: t2('Both get older by the same number of years, so the gap between their ages never changes.', 'ಇಬ್ಬರೂ ಒಂದೇ ಸಂಖ್ಯೆಯ ವರ್ಷಗಳಷ್ಟು ದೊಡ್ಡವರಾಗುತ್ತಾರೆ, ಆದ್ದರಿಂದ ಅವರ ವಯಸ್ಸಿನ ಅಂತರ ಬದಲಾಗುವುದಿಲ್ಲ.'),
      working: t2(`Now: ${f} − ${s} = ${g}. In ${b} years: ${f + b} − ${s + b} = ${g}.`, `ಈಗ: ${f} − ${s} = ${g}. ${b} ವರ್ಷಗಳ ನಂತರ: ${f + b} − ${s + b} = ${g}.`),
      clues: [
        t2(`Find the gap now: ${f} − ${s}.`, `ಈಗಿನ ಅಂತರ ಕಂಡುಹಿಡಿಯಿರಿ: ${f} − ${s}.`),
        t2(`Is the gap in ${a} years (${f + a} − ${s + a}) the same? Then what will it be in ${b} years?`, `${a} ವರ್ಷಗಳ ನಂತರದ ಅಂತರ (${f + a} − ${s + a}) ಅದೇ ಆಗಿದೆಯೇ? ಹಾಗಾದರೆ ${b} ವರ್ಷಗಳ ನಂತರ ಎಷ್ಟು?`),
      ],
      years: true,
      table,
    })
  const sum = f + s + 2 * b
  return build(rng, {
    pattern: 'ag-wu-gap',
    prompt: t2(`What will be the sum of their ages in ${b} years?`, `${b} ವರ್ಷಗಳ ನಂತರ ಅವರ ವಯಸ್ಸುಗಳ ಮೊತ್ತ ಎಷ್ಟು?`),
    answer: String(sum),
    wrong: near(rng, sum, [f + s + b, f + s, f + s + 4 * b, f + s + 2 * a]),
    rule: t2(`In ${b} years, each of them is ${b} years older, so the sum grows by 2 × ${b} = ${2 * b}.`, `${b} ವರ್ಷಗಳಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬರೂ ${b} ವರ್ಷ ದೊಡ್ಡವರಾಗುತ್ತಾರೆ, ಆದ್ದರಿಂದ ಮೊತ್ತ 2 × ${b} = ${2 * b} ಹೆಚ್ಚಾಗುತ್ತದೆ.`),
    working: same(`${f + b} + ${s + b} = ${sum}`),
    clues: [
      t2(`In ${b} years, each of them is ${b} years older.`, `${b} ವರ್ಷಗಳ ನಂತರ ಪ್ರತಿಯೊಬ್ಬರೂ ${b} ವರ್ಷ ದೊಡ್ಡವರಾಗಿರುತ್ತಾರೆ.`),
      t2(`Father: ${f} + ${b}. Son: ${s} + ${b}. Now add the two.`, `ತಂದೆ: ${f} + ${b}. ಮಗ: ${s} + ${b}. ಈಗ ಎರಡನ್ನೂ ಕೂಡಿಸಿ.`),
    ],
    years: true,
    table,
  })
}

type ExprKind = 'times-ago' | 'times-later' | 'ago' | 'brother'

// 3. Words to an expression in x.
function expr(rng: Rng, kind: ExprKind): Question {
  const [en, kn, he] = pick(rng, NAMES)
  const his = he === 'he' ? 'his' : 'her'
  const n = int(rng, 2, 9)
  const k = int(rng, 2, 4)
  const intro = t2(`${en} is x years old now.`, `${kn} ಅವರಿಗೆ ಈಗ x ವರ್ಷ.`)
  const ask = (phrase: Text) => t2(`${intro.en} Which one means “${phrase.en}”?`, `${intro.kn} “${phrase.kn}” ಎಂದರೆ ಯಾವುದು?`)
  if (kind === 'times-ago' || kind === 'times-later') {
    const ago = kind === 'times-ago'
    const s = ago ? '−' : '+'
    const o = ago ? '+' : '−'
    const answer = `${k}(x ${s} ${n})`
    return build(rng, {
      pattern: 'ag-wu-expr',
      prompt: ask(
        ago
          ? t2(`${TIMES_EN[k]} ${his} age ${n} years ago`, `${n} ವರ್ಷಗಳ ಹಿಂದಿನ ವಯಸ್ಸಿನ ${TIMES_KN[k]}`)
          : t2(`${TIMES_EN[k]} ${his} age ${n} years from now`, `${n} ವರ್ಷಗಳ ನಂತರದ ವಯಸ್ಸಿನ ${TIMES_KN[k]}`),
      ),
      answer,
      wrong: threeOf(rng, [`${k}x ${s} ${n}`, `${k}(x ${o} ${n})`, `x ${s} ${k * n}`, `${k}x ${o} ${n}`]),
      rule: ago
        ? t2(`First go back ${n} years: x − ${n}. Then multiply that whole age by ${k}, so it goes in brackets.`, `ಮೊದಲು ${n} ವರ್ಷ ಹಿಂದೆ ಹೋಗಿ: x − ${n}. ನಂತರ ಆ ಇಡೀ ವಯಸ್ಸನ್ನು ${k} ರಿಂದ ಗುಣಿಸಿ, ಆದ್ದರಿಂದ ಅದು ಆವರಣದೊಳಗೆ ಬರುತ್ತದೆ.`)
        : t2(`First go forward ${n} years: x + ${n}. Then multiply that whole age by ${k}, so it goes in brackets.`, `ಮೊದಲು ${n} ವರ್ಷ ಮುಂದೆ ಹೋಗಿ: x + ${n}. ನಂತರ ಆ ಇಡೀ ವಯಸ್ಸನ್ನು ${k} ರಿಂದ ಗುಣಿಸಿ, ಆದ್ದರಿಂದ ಅದು ಆವರಣದೊಳಗೆ ಬರುತ್ತದೆ.`),
      working: t2(`${k} × (x ${s} ${n}) = ${answer}. ${k}x ${s} ${n} would multiply today’s age instead.`, `${k} × (x ${s} ${n}) = ${answer}. ${k}x ${s} ${n} ಎಂದರೆ ಇಂದಿನ ವಯಸ್ಸನ್ನು ಗುಣಿಸಿದಂತಾಗುತ್ತದೆ.`),
      clues: [
        ago ? t2(`First write ${his} age ${n} years ago, using x.`, `ಮೊದಲು ${n} ವರ್ಷಗಳ ಹಿಂದಿನ ವಯಸ್ಸನ್ನು x ನಿಂದ ಬರೆಯಿರಿ.`) : t2(`First write ${his} age ${n} years from now, using x.`, `ಮೊದಲು ${n} ವರ್ಷಗಳ ನಂತರದ ವಯಸ್ಸನ್ನು x ನಿಂದ ಬರೆಯಿರಿ.`),
        t2(`Now multiply that whole age by ${k}: it goes in brackets.`, `ಈಗ ಆ ಇಡೀ ವಯಸ್ಸನ್ನು ${k} ರಿಂದ ಗುಣಿಸಿ: ಅದು ಆವರಣದೊಳಗೆ ಬರುತ್ತದೆ.`),
      ],
    })
  }
  if (kind === 'ago')
    return build(rng, {
      pattern: 'ag-wu-expr',
      prompt: ask(t2(`${his} age ${n} years ago`, `${n} ವರ್ಷಗಳ ಹಿಂದಿನ ವಯಸ್ಸು`)),
      answer: `x − ${n}`,
      wrong: threeOf(rng, [`x + ${n}`, `${n} − x`, `${n}x`]),
      rule: t2('“Years ago” means take the years away from today’s age, x.', '“ವರ್ಷಗಳ ಹಿಂದೆ” ಎಂದರೆ ಇಂದಿನ ವಯಸ್ಸು x ರಿಂದ ಆ ವರ್ಷಗಳನ್ನು ಕಳೆಯಿರಿ.'),
      working: t2(`x − ${n}. (${n} − x would be less than 0 for anyone older than ${n}.)`, `x − ${n}. (${n} ಕ್ಕಿಂತ ದೊಡ್ಡವರಿಗೆ ${n} − x ಸೊನ್ನೆಗಿಂತ ಕಡಿಮೆಯಾಗುತ್ತದೆ.)`),
      clues: [
        t2('Is the age bigger or smaller, going back in time?', 'ಹಿಂದಕ್ಕೆ ಹೋದಾಗ ವಯಸ್ಸು ಹೆಚ್ಚಾಗುತ್ತದೆಯೇ ಕಡಿಮೆಯಾಗುತ್ತದೆಯೇ?'),
        t2(`Smaller: start from x and take ${n} away.`, `ಕಡಿಮೆ: x ನಿಂದ ಆರಂಭಿಸಿ ${n} ಕಳೆಯಿರಿ.`),
      ],
    })
  // An elder brother d years older, n years ago.
  const d = pick(rng, [2, 3, 4, 5, 6, 7, 8].filter((v) => v !== n))
  return build(rng, {
    pattern: 'ag-wu-expr',
    prompt: t2(
      `${intro.en} ${he === 'he' ? 'His' : 'Her'} elder brother is ${d} years older. Which one is the brother’s age ${n} years ago?`,
      `${intro.kn} ಅವರ ಅಣ್ಣ ${d} ವರ್ಷ ದೊಡ್ಡವರು. ${n} ವರ್ಷಗಳ ಹಿಂದೆ ಅಣ್ಣನ ವಯಸ್ಸು ಯಾವುದು?`,
    ),
    answer: `x + ${d} − ${n}`,
    wrong: threeOf(rng, [`x − ${d} − ${n}`, `x + ${d} + ${n}`, `x − ${d} + ${n}`]),
    rule: t2(`The brother now: x + ${d}. Then go back ${n} years: take ${n} away.`, `ಈಗ ಅಣ್ಣ: x + ${d}. ನಂತರ ${n} ವರ್ಷ ಹಿಂದೆ ಹೋಗಿ: ${n} ಕಳೆಯಿರಿ.`),
    working: same(`(x + ${d}) − ${n} = x + ${d} − ${n}`),
    clues: [
      t2(`First write the brother’s age now, using x.`, `ಮೊದಲು ಅಣ್ಣನ ಈಗಿನ ವಯಸ್ಸನ್ನು x ನಿಂದ ಬರೆಯಿರಿ.`),
      t2(`He is older, so add ${d} to x. Then, for ${n} years ago, take ${n} away.`, `ಅವರು ದೊಡ್ಡವರು, ಆದ್ದರಿಂದ x ಗೆ ${d} ಕೂಡಿಸಿ. ನಂತರ ${n} ವರ್ಷಗಳ ಹಿಂದಿಗಾಗಿ ${n} ಕಳೆಯಿರಿ.`),
    ],
  })
}

type EqnKind = 'later' | 'ago' | 'sum'
const ASK_EQN = t2('If the son is x years old now, which equation fits?', 'ಮಗನಿಗೆ ಈಗ x ವರ್ಷವಾದರೆ, ಯಾವ ಸಮೀಕರಣ ಸರಿ?')

// 4. A whole sentence to its equation (built from real ages, so it has a whole-number answer).
function eqn(rng: Rng, kind: EqnKind): Question | null {
  if (kind === 'later' || kind === 'ago') {
    const later = kind === 'later'
    // Now the father is k1 times the son; t years later (or ago) he is k2 times.
    const k1 = later ? int(rng, 3, 6) : int(rng, 2, 4)
    const k2 = later ? int(rng, 2, k1 - 1) : int(rng, k1 + 1, 6)
    const t = int(rng, 2, 12)
    const s = later ? (t * (k2 - 1)) / (k1 - k2) : (t * (k2 - 1)) / (k2 - k1)
    if (!Number.isInteger(s) || s < 3 || k1 * s > 80 || (k1 - 1) * s < 18 || (!later && s <= t)) return null
    const sg = later ? '+' : '−'
    const answer = `${k1}x ${sg} ${t} = ${k2}(x ${sg} ${t})`
    const when = later ? t2(`In ${t} years`, `${t} ವರ್ಷಗಳ ನಂತರ`) : t2(`${t} years ago`, `${t} ವರ್ಷಗಳ ಹಿಂದೆ`)
    return build(rng, {
      pattern: 'ag-wu-eqn',
      prompt: t2(
        `A father is ${TIMES_EN[k1]} as old as his son. ${when.en}, he ${later ? 'will be' : 'was'} ${TIMES_EN[k2]} as old as his son. ${ASK_EQN.en}`,
        `ತಂದೆಯ ವಯಸ್ಸು ಮಗನ ವಯಸ್ಸಿನ ${TIMES_KN[k1]}. ${when.kn} ತಂದೆಯ ವಯಸ್ಸು ಮಗನ ವಯಸ್ಸಿನ ${TIMES_KN[k2]} ${later ? 'ಆಗುತ್ತದೆ' : 'ಆಗಿತ್ತು'}. ${ASK_EQN.kn}`,
      ),
      answer,
      wrong: threeOf(rng, [`${k1}x ${sg} ${t} = ${k2}x ${sg} ${t}`, `${k1}(x ${sg} ${t}) = ${k2}(x ${sg} ${t})`, `${k1}x = ${k2}(x ${sg} ${t})`]),
      rule: t2(`Write both ages ${later ? `${t} years from now` : `${t} years ago`}, then “${TIMES_EN[k2]} as old” links them.`, `ಇಬ್ಬರ ವಯಸ್ಸನ್ನೂ ${when.kn} ಇದ್ದಂತೆ ಬರೆಯಿರಿ; “${TIMES_KN[k2]}” ಅವುಗಳನ್ನು ಜೋಡಿಸುತ್ತದೆ.`),
      working: t2(
        `${when.en}: father ${k1}x ${sg} ${t}, son x ${sg} ${t}. So ${answer}. (It gives x = ${s}.)`,
        `${when.kn}: ತಂದೆ ${k1}x ${sg} ${t}, ಮಗ x ${sg} ${t}. ಆದ್ದರಿಂದ ${answer}. (ಇದರಿಂದ x = ${s}.)`,
      ),
      clues: [
        t2(`The father now is ${k1}x. Write both ages ${later ? `in ${t} years` : `${t} years ago`}.`, `ಈಗ ತಂದೆ ${k1}x. ${when.kn} ಇಬ್ಬರ ವಯಸ್ಸನ್ನೂ ಬರೆಯಿರಿ.`),
        t2(`“${cap(TIMES_EN[k2])} as old” means the father’s age = ${k2} × the son’s age, both ${later ? `in ${t} years` : `${t} years ago`}.`, `“${TIMES_KN[k2]}” ಎಂದರೆ ತಂದೆಯ ವಯಸ್ಸು = ${k2} × ಮಗನ ವಯಸ್ಸು, ಎರಡೂ ${when.kn}.`),
      ],
    })
  }
  // The ages add up to S; in t years the father is k times the son.
  const k = int(rng, 2, 4)
  const s = int(rng, 4, 20)
  const t = int(rng, 2, 10)
  const f = k * (s + t) - t
  if (f - s < 18 || f > 80) return null
  const S = f + s
  const answer = `${S} − x + ${t} = ${k}(x + ${t})`
  return build(rng, {
    pattern: 'ag-wu-eqn',
    prompt: t2(
      `The ages of a father and his son add up to ${S} years. In ${t} years, the father will be ${TIMES_EN[k]} as old as the son. ${ASK_EQN.en}`,
      `ತಂದೆ ಮತ್ತು ಮಗನ ವಯಸ್ಸುಗಳ ಮೊತ್ತ ${S} ವರ್ಷ. ${t} ವರ್ಷಗಳ ನಂತರ ತಂದೆಯ ವಯಸ್ಸು ಮಗನ ವಯಸ್ಸಿನ ${TIMES_KN[k]} ಆಗುತ್ತದೆ. ${ASK_EQN.kn}`,
    ),
    answer,
    wrong: threeOf(rng, [`${S} − x + ${t} = ${k}x + ${t}`, `${S} − x = ${k}(x + ${t})`, `${S} + x + ${t} = ${k}(x + ${t})`]),
    rule: t2(`The father now is ${S} − x. Write both ages ${t} years from now, then “${TIMES_EN[k]} as old” links them.`, `ಈಗ ತಂದೆ ${S} − x. ${t} ವರ್ಷಗಳ ನಂತರದ ಇಬ್ಬರ ವಯಸ್ಸನ್ನೂ ಬರೆಯಿರಿ; “${TIMES_KN[k]}” ಅವುಗಳನ್ನು ಜೋಡಿಸುತ್ತದೆ.`),
    working: t2(`In ${t} years: father ${S} − x + ${t}, son x + ${t}. So ${answer}. (It gives x = ${s}.)`, `${t} ವರ್ಷಗಳ ನಂತರ: ತಂದೆ ${S} − x + ${t}, ಮಗ x + ${t}. ಆದ್ದರಿಂದ ${answer}. (ಇದರಿಂದ x = ${s}.)`),
    clues: [
      t2(`The son is x and the ages add up to ${S}, so the father is ${S} − x.`, `ಮಗ x ಮತ್ತು ಮೊತ್ತ ${S}, ಆದ್ದರಿಂದ ತಂದೆ ${S} − x.`),
      t2(`Add ${t} to both ages. “${TIMES_EN[k]} as old” means father = ${k} × son, both in ${t} years.`, `ಎರಡೂ ವಯಸ್ಸುಗಳಿಗೆ ${t} ಕೂಡಿಸಿ. “${TIMES_KN[k]}” ಎಂದರೆ ತಂದೆ = ${k} × ಮಗ, ಎರಡೂ ${t} ವರ್ಷಗಳ ನಂತರ.`),
    ],
  })
}

function eqnRetry(rng: Rng, kind: EqnKind): Question {
  for (;;) {
    const q = eqn(rng, kind)
    if (q) return q
  }
}

/**
 * A warm-up round of 10, easiest first: 3 on the time line, 2 on the gap and sum, 3 words to an
 * expression, 2 sentences to an equation.
 */
export function ageWarmupRound(rng: Rng = Math.random): Question[] {
  const agos = shuffle(rng, [true, false, rng() < 0.5])
  const exprs = shuffle(rng, ['times-ago', 'times-later', 'ago', 'brother'] as ExprKind[]).slice(0, 3)
  const eqns = shuffle(rng, ['later', 'ago', 'sum'] as EqnKind[]).slice(0, 2)
  return [
    ...agos.map((ago) => line(rng, ago)),
    gap(rng, false),
    gap(rng, true),
    ...exprs.map((k) => expr(rng, k)),
    ...eqns.map((k) => eqnRetry(rng, k)),
  ]
}
