import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both } from '../i18n/gen'
import type { GenText } from '../i18n/gen'
import { isPrime } from '../series'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

const VOWELS = 'AEIOU'
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))
const even = (n: number) => n % 2 === 0

/** One counting question: the sequence it uses, what counts, and how to show a match. */
interface Condition {
  prompt: (m: GenText) => string
  /** Makes a sequence to count in. */
  make: (rng: Rng) => (number | string)[]
  /** Indices where a match is centred, and the neighbours shown for it. */
  matches: (s: (number | string)[]) => (number | string)[][]
}

const digits = (rng: Rng, len: number, pool = [1, 2, 3, 4, 5, 6, 7, 8, 9]) => Array.from({ length: len }, () => pick(rng, pool))
const letters = (rng: Rng, len: number) =>
  Array.from({ length: len }, () => (rng() < 0.4 ? pick(rng, [...VOWELS]) : pick(rng, [...'BCDFGHKLMNPRSTXYZ'])))
/** Every run of `n` neighbours that passes `test`. */
const runs = <T,>(s: T[], n: number, test: (w: T[]) => boolean) =>
  Array.from({ length: s.length - n + 1 }, (_, i) => s.slice(i, i + n)).filter(test)

const CONDITIONS: ((rng: Rng) => Condition)[] = [
  () => ({
    prompt: (m) => m.seqEvenAfterPrime,
    make: (rng) => digits(rng, int(rng, 16, 20)),
    matches: (s) => runs(s as number[], 2, ([a, b]) => isPrime(a) && even(b)),
  }),
  () => ({
    prompt: (m) => m.seqOddBetweenEven,
    make: (rng) => digits(rng, int(rng, 16, 20)),
    matches: (s) => runs(s as number[], 3, ([a, b, c]) => even(a) && !even(b) && even(c)),
  }),
  () => ({
    prompt: (m) => m.seqEvenBetweenPrimes,
    make: (rng) => digits(rng, int(rng, 16, 20), [2, 3, 4, 5, 6, 7, 8, 2, 3, 5, 7]),
    matches: (s) => runs(s as number[], 3, ([a, b, c]) => isPrime(a) && even(b) && isPrime(c)),
  }),
  () => ({
    prompt: (m) => m.seqOddAfterSquare,
    make: (rng) => digits(rng, int(rng, 16, 20)),
    matches: (s) => runs(s as number[], 2, ([a, b]) => isSquare(a) && !even(b)),
  }),
  (rng) => {
    const k = pick(rng, [2, 3, 4])
    return {
      prompt: (m) => m.seqDiff(k),
      make: (rng) => digits(rng, int(rng, 16, 20)),
      matches: (s) => runs(s as number[], 2, ([a, b]) => Math.abs(a - b) === k),
    }
  },
  (rng) => {
    const k = pick(rng, [7, 9, 10])
    return {
      prompt: (m) => m.seqSum(k),
      make: (rng) => digits(rng, int(rng, 16, 20)),
      matches: (s) => runs(s as number[], 2, ([a, b]) => a + b === k),
    }
  },
  (rng) => {
    const [x, y, z] = shuffle(rng, [2, 3, 5, 7, 8]).slice(0, 3)
    return {
      prompt: (m) => m.seqAfterNot(x, y, z),
      make: (rng) => digits(rng, int(rng, 20, 26), [x, x, y, y, z, 1, 4]),
      matches: (s) => {
        const n = s as number[]
        return n.flatMap((v, i) => (v === x && n[i - 1] === y && n[i + 1] !== z ? [n.slice(i - 1, i + 2)] : []))
      },
    }
  },
  () => ({
    prompt: (m) => m.seqConsBetweenVowels,
    make: (rng) => letters(rng, int(rng, 18, 24)),
    matches: (s) => runs(s as string[], 3, ([a, b, c]) => VOWELS.includes(a) && !VOWELS.includes(b) && VOWELS.includes(c)),
  }),
  (rng) => {
    const c = pick(rng, ['K', 'M', 'T'])
    return {
      prompt: (m) => m.seqLetterAfterVowel(c),
      make: (rng) => letters(rng, int(rng, 18, 22)).map((x) => (rng() < 0.25 ? c : x)),
      matches: (s) => runs(s as string[], 2, ([a, b]) => VOWELS.includes(a) && b === c),
    }
  },
]

let counter = 0

export function generateSequence(rng: Rng = Math.random): Question {
  for (;;) {
    const cond = pick(rng, CONDITIONS)(rng)
    const seq = cond.make(rng)
    const found = cond.matches(seq)
    const n = found.length
    if (n < 2 || n > 8) continue
    const wrong = shuffle(rng, [n - 1, n + 1, n - 2, n + 2, n + 3]).filter((x) => x >= 0)
    const order = shuffle(rng, [n, ...wrong.slice(0, 3)])
    const list = found.map((w) => w.join(' ')).join(', ')
    const prompt = both((m) => cond.prompt(m))
    const working = both((m) => m.seqFound(list, n))
    const rule = both((m) => m.seqRule)
    return {
      id: `gen-seq-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: seq.map(String),
      prompt: prompt.en,
      options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, String(order[j])])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[order.indexOf(n)],
      rule: rule.en,
      working: working.en,
      pattern: 'seq-count',
      generated: true,
      kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn },
    }
  }
}
