import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { WORDS } from './coding'
import { letter, place } from './letterSeries'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** A way to turn A into B. Every rule that fits the example must give the same answer, or the question is dropped. */
interface Rule {
  pattern: PatternId
  apply: (x: string) => string | undefined
  rule: Text
  show: (x: string) => string
}

const sumOf = (w: string) => [...w].reduce((s, c) => s + place(c), 0)
const places = (w: string) => [...w].map(place).join(' + ')

const SUM_RULES: Rule[] = [
  { kind: 'sum', f: (s: number) => s, show: (s: number) => `${s}` },
  { kind: 'double', f: (s: number) => 2 * s, show: (s: number) => `${s} → ${s} × 2 = ${2 * s}` },
  { kind: 'half', f: (s: number) => (s % 2 ? NaN : s / 2), show: (s: number) => `${s} → ${s} ÷ 2 = ${s / 2}` },
  { kind: 'square', f: (s: number) => s * s, show: (s: number) => `${s} → ${s}² = ${s * s}` },
  { kind: 'root', f: (s: number) => (Number.isInteger(Math.sqrt(s)) ? Math.sqrt(s) : NaN), show: (s: number) => `${s} → √${s} = ${Math.sqrt(s)}` },
].map(({ kind, f, show }) => ({
  pattern: 'ln-sum' as PatternId,
  apply: (w: string) => (/^[A-Z]{3,}$/.test(w) && !Number.isNaN(f(sumOf(w))) ? String(f(sumOf(w))) : undefined),
  rule: both((m) => m.lnSum(kind)),
  show: (w: string) => `${w}: ${places(w)} = ${show(sumOf(w))}`,
}))

const LETTER_RULES: Rule[] = [
  { kind: 'sq', f: (n: number) => n * n, show: (n: number) => `${n}² = ${n * n}` },
  { kind: 'sq1', f: (n: number) => (n + 1) ** 2, show: (n: number) => `${n + 1}² = ${(n + 1) ** 2}` },
  { kind: 'dbl', f: (n: number) => 2 * n, show: (n: number) => `${n} × 2 = ${2 * n}` },
  { kind: 'tri', f: (n: number) => 3 * n, show: (n: number) => `${n} × 3 = ${3 * n}` },
].map(({ kind, f, show }) => ({
  pattern: 'ln-letter' as PatternId,
  apply: (c: string) => (/^[A-Z]$/.test(c) ? String(f(place(c))) : undefined),
  rule: both((m) => m.lnLetter(kind)),
  show: (c: string) => `${c} = ${place(c)} → ${show(place(c))}`,
}))

const SHIFTS = [
  [2, 3, 4],
  [1, 2, 3],
  [1, -1, 1],
  [2, -2, 2],
  [3, 3, 3],
  [-1, -2, -3],
]
const sign = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
const SHIFT_RULES: Rule[] = SHIFTS.map((s) => ({
  pattern: 'ln-shift' as PatternId,
  apply: (w: string) => (/^[A-Z]{3}$/.test(w) ? [...w].map((c, i) => letter(place(c) + s[i])).join('') : undefined),
  rule: both((m) => m.lnShift(s.map(sign).join(', '))),
  show: (w: string) => [...w].map((c, i) => `${c} ${sign(s[i])} → ${letter(place(c) + s[i])}`).join(', '),
}))

let counter = 0

/** The answer every fitting rule gives, or undefined if the fitting rules disagree. */
function agreed(rules: Rule[], a: string, b: string, c: string): string | undefined {
  const outs = new Set(rules.filter((r) => r.apply(a) === b).map((r) => r.apply(c)))
  return outs.size === 1 ? [...outs][0] : undefined
}

export function generateLetterNumber(rng: Rng = Math.random): Question {
  for (;;) {
    const family = pick(rng, ['sum', 'sum', 'letter', 'shift'] as const)
    let a: string
    let c: string
    let rule: Rule
    let pool: Rule[]
    if (family === 'letter') {
      pool = LETTER_RULES
      rule = pick(rng, pool)
      ;[a, c] = shuffle(rng, [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']).slice(0, 2)
    } else if (family === 'sum') {
      pool = SUM_RULES
      rule = pick(rng, pool)
      ;[a, c] = shuffle(rng, WORDS.filter((w) => w.length <= 5)).slice(0, 2)
    } else {
      pool = SHIFT_RULES
      rule = pick(rng, pool)
      ;[a, c] = shuffle(rng, WORDS.filter((w) => w.length === 3).concat(['BAT', 'CUP', 'PEN', 'SUN', 'MAT', 'DOG', 'CAT', 'BOX', 'HEN', 'JAM'])).slice(0, 2)
    }
    const b = rule.apply(a)
    const d = rule.apply(c)
    if (!b || !d || a === c || agreed(pool, a, b, c) !== d) continue
    // For a letter rule, sometimes hide the letter instead of the number (M : 196 :: ? : 289).
    const hideLetter = family === 'letter' && rng() < 0.4
    const answer = hideLetter ? c : d
    let wrong: string[]
    if (hideLetter) wrong = [letter(place(c) + 1), letter(place(c) - 1), letter(place(c) + 2)]
    else if (family === 'shift') wrong = [...new Set(SHIFT_RULES.map((r) => r.apply(c)!).filter((x) => x !== d))].slice(0, 5)
    else wrong = [...new Set(pool.map((r) => r.apply(c)).filter((x): x is string => !!x && x !== d)), String(Number(d) + 1), String(Number(d) - 1), String(Number(d) + 2)]
    wrong = shuffle(rng, [...new Set(wrong)].filter((x) => x !== answer && !x.startsWith('-') && x !== 'NaN')).slice(0, 3)
    if (wrong.length < 3) continue
    const order = shuffle(rng, [answer, ...wrong])
    const working = same(`${rule.show(a)}; ${rule.show(c)}`)
    return {
      id: `gen-${rule.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'analogy',
      terms: hideLetter ? [a, b, '?', d] : [a, b, c, '?'],
      options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[order.indexOf(answer)],
      rule: rule.rule.en,
      working: working.en,
      pattern: rule.pattern,
      generated: true,
      kn: { rule: rule.rule.kn, working: working.kn },
    }
  }
}
