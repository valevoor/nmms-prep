import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { letter, place } from './letterSeries'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** Everyday words a Class 8 student knows. Even-length ones also work for the pair-swap code. */
export const WORDS = [
  'HOME', 'BOOK', 'TREE', 'FISH', 'BIRD', 'LION', 'GOAT', 'RAIN', 'STAR', 'MOON', 'KING', 'SHIP', 'DOOR', 'MILK', 'RICE', 'CAKE',
  'DESK', 'LAMP', 'ROAD', 'WIND', 'FARM', 'SEED', 'LEAF', 'ROSE', 'APPLE', 'MANGO', 'TIGER', 'HORSE', 'WATER', 'PLANT', 'RIVER',
  'CHAIR', 'TABLE', 'BREAD', 'TRAIN', 'CLOCK', 'SMILE', 'EARTH', 'LEMON', 'SHEEP', 'BRUSH', 'CHALK', 'PAPER', 'SCHOOL', 'FRIEND',
  'GARDEN', 'MOTHER', 'FATHER', 'SISTER', 'PENCIL', 'MARKET', 'FLOWER', 'WINDOW', 'BASKET', 'TEMPLE', 'CANDLE', 'ORANGE',
  'PLANET', 'SPIDER', 'RABBIT', 'TURTLE',
]

/** One code: how to write a word in code, and (for letter codes) how to read it back. */
export interface CodeRule {
  pattern: PatternId
  /** Distinguishes variants of the same pattern, e.g. the size of the shift. */
  key: string
  enc: (w: string) => string
  dec?: (c: string) => string
  rule: Text
  /** Working for encoding w (or, when decoding, for reading c back as w). */
  showEnc: (w: string) => Text
  showDec?: (c: string) => Text
}

const map = (w: string, f: (c: string, i: number) => string) => [...w].map(f).join('')
const rev = (w: string) => [...w].reverse().join('')
const shift = (w: string, k: number) => map(w, (c) => letter(place(c) + k))
const pairs = (from: string, to: string) => [...from].map((c, i) => `${c} → ${to[i]}`).join(', ')
const swap = (w: string) => w.replace(/(.)(.)/g, '$2$1')
const plusses = (n: number) => Array.from({ length: n }, (_, i) => `+${i + 1}`).join(', ')

export const CODE_RULES: CodeRule[] = [
  ...[-4, -3, -2, -1, 1, 2, 3, 4, 5].map(
    (k): CodeRule => ({
      pattern: 'code-shift',
      key: `shift${k}`,
      enc: (w) => shift(w, k),
      dec: (c) => shift(c, -k),
      rule: both((m) => m.codeShift(k)),
      showEnc: (w) => both((m) => m.soAnswer(pairs(w, shift(w, k)), shift(w, k))),
      showDec: (c) => both((m) => m.soAnswer(pairs(c, shift(c, -k)), shift(c, -k))),
    }),
  ),
  {
    pattern: 'code-steps',
    key: 'steps',
    enc: (w) => map(w, (c, i) => letter(place(c) + i + 1)),
    dec: (c) => map(c, (x, i) => letter(place(x) - i - 1)),
    rule: both((m) => m.codeSteps(plusses(4) + '…')),
    showEnc: (w) => {
      const code = map(w, (c, i) => letter(place(c) + i + 1))
      return both((m) => m.soAnswer([...w].map((c, i) => `${c} + ${i + 1} = ${code[i]}`).join(', '), code))
    },
    showDec: (c) => {
      const word = map(c, (x, i) => letter(place(x) - i - 1))
      return both((m) => m.soAnswer([...c].map((x, i) => `${x} − ${i + 1} = ${word[i]}`).join(', '), word))
    },
  },
  {
    pattern: 'code-reverse',
    key: 'reverse',
    enc: rev,
    dec: rev,
    rule: both((m) => m.codeReverse),
    showEnc: (w) => both((m) => m.backwardsIs(w, rev(w))),
    showDec: (c) => both((m) => m.backwardsIs(c, rev(c))),
  },
  {
    pattern: 'code-opposite',
    key: 'opposite',
    enc: (w) => map(w, (c) => letter(27 - place(c))),
    dec: (c) => map(c, (x) => letter(27 - place(x))),
    rule: both((m) => m.codeOpposite),
    showEnc: (w) => {
      const code = map(w, (c) => letter(27 - place(c)))
      return both((m) => m.soAnswer(pairs(w, code), code))
    },
    showDec: (c) => {
      const word = map(c, (x) => letter(27 - place(x)))
      return both((m) => m.soAnswer(pairs(c, word), word))
    },
  },
  {
    pattern: 'code-swap',
    key: 'swap',
    enc: swap,
    dec: swap,
    rule: both((m) => m.codeSwap),
    showEnc: (w) => both((m) => m.soAnswer((w.match(/../g) ?? []).map((p) => `${p} → ${swap(p)}`).join(', '), swap(w))),
    showDec: (c) => both((m) => m.soAnswer((c.match(/../g) ?? []).map((p) => `${p} → ${swap(p)}`).join(', '), swap(c))),
  },
  ...[-2, -1, 1, 2].map(
    (k): CodeRule => ({
      pattern: 'code-shift-reverse',
      key: `shiftrev${k}`,
      enc: (w) => rev(shift(w, k)),
      dec: (c) => shift(rev(c), -k),
      rule: both((m) => m.codeShiftReverse(k)),
      showEnc: (w) => both((m) => m.shiftedThenReversed(shift(w, k), rev(shift(w, k)))),
      showDec: (c) => both((m) => m.reversedThenShifted(c, rev(c), shift(rev(c), -k))),
    }),
  ),
  {
    pattern: 'code-number',
    key: 'number',
    enc: (w) => map(w, (c) => String(place(c))),
    rule: both((m) => m.codeNumber),
    showEnc: (w) => both((m) => m.soAnswer([...w].map((c) => `${c} = ${place(c)}`).join(', '), map(w, (c) => String(place(c))))),
  },
]

/** Rules that turn w into c (the ones a student could read from the example). */
const explaining = (w: string, c: string) => CODE_RULES.filter((r) => r.enc(w) === c && (r.key !== 'swap' || w.length % 2 === 0))

/** Small slips on a code: one letter nudged, or two neighbours swapped. */
function slips(rng: Rng, s: string): string[] {
  const i = int(rng, 0, s.length - 1)
  const out: string[] = []
  if (/[A-Z]/.test(s[i])) out.push(s.slice(0, i) + letter(place(s[i]) + pick(rng, [1, -1])) + s.slice(i + 1))
  const j = int(rng, 0, s.length - 2)
  out.push(s.slice(0, j) + s[j + 1] + s[j] + s.slice(j + 2))
  return out
}

/** Wrong number codes like the book's: one letter's number off by one, the letters out of order, a digit dropped. */
function numberSlips(rng: Rng, w: string): string[] {
  const nums = [...w].map((c) => place(c))
  const i = int(rng, 0, nums.length - 1)
  const off = nums.map((n, j) => (j === i ? n + pick(rng, [1, -1]) : n))
  const j = int(rng, 0, nums.length - 2)
  const swapped = nums.map((n, k) => (k === j ? nums[j + 1] : k === j + 1 ? nums[j] : n))
  const code = nums.join('')
  const drop = int(rng, 0, code.length - 1)
  return [off.join(''), swapped.join(''), code.slice(0, drop) + code.slice(drop + 1), [...nums].reverse().join('')]
}

let counter = 0

export function generateCoding(rng: Rng = Math.random): Question {
  for (;;) {
    const r = pick(rng, CODE_RULES)
    const decode = !!r.dec && rng() < 0.4
    const pool = r.key === 'swap' ? WORDS.filter((w) => w.length % 2 === 0) : WORDS
    const [w1, w2] = shuffle(rng, pool).slice(0, 2)
    const c1 = r.enc(w1)
    const c2 = r.enc(w2)
    if (c1 === w1 || c2 === w2) continue
    // Every rule that explains the example must give the same answer, or the question has two.
    const others = explaining(w1, c1)
    const answer = decode ? w2 : c2
    const answers = new Set(others.map((o) => (decode ? o.dec?.(c2) : o.enc(w2))))
    if (answers.size !== 1 || !answers.has(answer)) continue

    let wrong: string[]
    if (decode) {
      // Real words of the same length, so the answer can't be spotted just by being a word.
      wrong = shuffle(rng, WORDS.filter((w) => w.length === w2.length && w !== w2)).slice(0, 3)
    } else {
      const near = CODE_RULES.filter((o) => o.key !== r.key && (o.key !== 'swap' || w2.length % 2 === 0)).map((o) => o.enc(w2))
      const numeric = r.key === 'number' ? numberSlips(rng, w2) : []
      wrong = [...new Set([...shuffle(rng, near).slice(0, 4), ...slips(rng, c2), ...numeric])].filter((x) => x !== answer)
      // Keep the options the same kind as the answer: letters with letters, digits with digits.
      wrong = shuffle(rng, wrong.filter((x) => /^\d+$/.test(x) === /^\d+$/.test(answer))).slice(0, 3)
    }
    if (new Set(wrong).size < 3) continue

    const order = shuffle(rng, [answer, ...wrong])
    const prompt = both((m) => (decode ? m.decodeAsk(w1, c1, c2) : m.codeAsk(w1, c1, w2)))
    const working = decode ? r.showDec!(c2) : r.showEnc(w2)
    const rule = both((_, l) => `${r.rule[l]} (${w1} → ${c1})`)
    return {
      id: `gen-${r.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [],
      prompt: prompt.en,
      options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[order.indexOf(answer)],
      rule: rule.en,
      working: working.en,
      pattern: r.pattern,
      generated: true,
      kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn },
    }
  }
}

