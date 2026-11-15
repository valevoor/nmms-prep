import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Age Problems (Chapter 37), the book's kinds: an age some years from now is k times the age some
 * years ago; a father and son whose ages add up to a total, or whose ratio changes; two ages and
 * the years ago their ratio was m : n; a ratio now and a ratio later; a ratio some years ago and
 * another some years later. Each is built from real ages, so the answer is a whole number.
 */

const NAMES: [string, string][] = [
  ['Ravi', 'ರವಿ'], ['Asha', 'ಆಶಾ'], ['Kiran', 'ಕಿರಣ'], ['Meena', 'ಮೀನಾ'], ['Suresh', 'ಸುರೇಶ'], ['Divya', 'ದಿವ್ಯಾ'], ['Anil', 'ಅನಿಲ'], ['Lakshmi', 'ಲಕ್ಷ್ಮಿ'],
]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const reduce = (a: number, b: number): [number, number] => [a / gcd(a, b), b / gcd(a, b)]

let counter = 0

/** "3x = 9 → x = 3", or just "x = 3" when there is one x; and "k" rather than "1k". */
const solve = (c: number, rhs: number, v = 'x') => (c === 1 ? `${v} = ${rhs}` : `${c}${v} = ${rhs} → ${v} = ${rhs / c}`)
const coef = (c: number, v = 'k') => (c === 1 ? v : `${c}${v}`)

/** A clue in both languages. */
const t2 = (en: string, kn: string): Text => ({ en, kn })

function build(rng: Rng, pattern: PatternId, prompt: Text, answer: string, wrong: string[], rule: Text, working: Text, years: boolean, clues: Text[]): Question {
  const opts = shuffle(rng, [answer, ...wrong])
  const en = (v: string) => (years ? `${v} years` : v)
  const kn = (v: string) => (years ? `${v} ವರ್ಷ` : v)
  return {
    id: `gen-ag-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, en(opts[i])])) as Record<OptionKey, string>,
    answer: OPTION_KEYS[opts.indexOf(answer)],
    rule: rule.en,
    working: working.en,
    pattern,
    generated: true,
    clues: clues.map((c) => c.en),
    kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn, clues: clues.map((c) => c.kn), options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, kn(opts[i])])) as Record<OptionKey, string> },
  }
}

/** Three different wrong whole numbers, at least 2 ("1 years" reads badly), from the likely slips first. */
function near(rng: Rng, answer: number, likely: number[]): string[] {
  const out = new Set<number>()
  for (const x of shuffle(rng, likely)) if (Number.isInteger(x) && x !== answer && x >= 2 && out.size < 3) out.add(x)
  for (let d = 2; out.size < 3; d++) for (const x of [answer + d, answer - d]) if (x !== answer && x >= 2 && out.size < 3) out.add(x)
  return [...out].map(String)
}

function times(rng: Rng): Question | null {
  // x + a = k(x − b)
  const k = int(rng, 2, 5)
  const b = int(rng, 2, 10)
  const x = int(rng, b + 3, 40)
  const a = k * (x - b) - x
  if (a < 2 || a > 30) return null
  const [en, knName] = pick(rng, NAMES)
  const prompt = both((g, l) => g.agTimes(l === 'en' ? en : knName, a, k, b))
  const working = same(`x + ${a} = ${k}(x − ${b}) → x + ${a} = ${k}x − ${k * b} → ${solve(k - 1, a + k * b)}`)
  const clues = [
    t2(`Call ${en}’s age now x. Write the age ${a} years from now and ${b} years ago, using x.`, `${knName} ಅವರ ಈಗಿನ ವಯಸ್ಸನ್ನು x ಎನ್ನಿ. ${a} ವರ್ಷಗಳ ನಂತರದ ಮತ್ತು ${b} ವರ್ಷಗಳ ಹಿಂದಿನ ವಯಸ್ಸನ್ನು x ನಿಂದ ಬರೆಯಿರಿ.`),
    t2(`In ${a} years: x + ${a}. ${b} years ago: x − ${b}.`, `${a} ವರ್ಷಗಳ ನಂತರ: x + ${a}. ${b} ವರ್ಷಗಳ ಹಿಂದೆ: x − ${b}.`),
    t2(`“${k} times” gives the equation: x + ${a} = ${k} × (x − ${b}) = ${k}x − ${k * b}.`, `“${k} ರಷ್ಟು” ಎಂಬುದರಿಂದ ಸಮೀಕರಣ: x + ${a} = ${k} × (x − ${b}) = ${k}x − ${k * b}.`),
    t2(`So ${coef(k - 1, 'x')} = ${a} + ${k * b}. What is x?`, `ಆದ್ದರಿಂದ ${coef(k - 1, 'x')} = ${a} + ${k * b}. x ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-times', prompt, String(x), near(rng, x, [x + b, x - b, x + a, a, x + 5]), both((g) => g.agXRule), working, true, clues)
}

function fatherSum(rng: Rng): Question | null {
  // f + s = S; f + t = k(s + t)
  const k = int(rng, 2, 4)
  const s = int(rng, 4, 20)
  const t = int(rng, 2, 10)
  const f = k * (s + t) - t
  if (f - s < 18 || f > 80) return null
  const askFather = rng() < 0.6
  const ans = askFather ? f : s
  const prompt = both((g) => g.agFatherSum(f + s, t, k, askFather))
  const working = same(`x + ${t} = ${k}(${f + s} − x + ${t}) → x + ${t} = ${k * (f + s + t)} − ${k}x → ${solve(k + 1, k * (f + s + t) - t)}${askFather ? '' : `; ${f + s} − ${f} = ${s}`}`)
  const S = f + s
  const clues = [
    t2(`Call the father’s age now x. The two ages add up to ${S}, so the son is ${S} − x.`, `ತಂದೆಯ ಈಗಿನ ವಯಸ್ಸನ್ನು x ಎನ್ನಿ. ಎರಡು ವಯಸ್ಸುಗಳ ಮೊತ್ತ ${S}, ಆದ್ದರಿಂದ ಮಗ ${S} − x.`),
    t2(`After ${t} years, the father is x + ${t} and the son is ${S} − x + ${t} = ${S + t} − x.`, `${t} ವರ್ಷಗಳ ನಂತರ ತಂದೆ x + ${t} ಮತ್ತು ಮಗ ${S} − x + ${t} = ${S + t} − x.`),
    t2(`The father is then ${k} times the son: x + ${t} = ${k} × (${S + t} − x) = ${k * (S + t)} − ${k}x.`, `ಆಗ ತಂದೆ ಮಗನ ${k} ರಷ್ಟು: x + ${t} = ${k} × (${S + t} − x) = ${k * (S + t)} − ${k}x.`),
    askFather
      ? t2(`So ${k + 1}x = ${k * (S + t)} − ${t}. What is x?`, `ಆದ್ದರಿಂದ ${k + 1}x = ${k * (S + t)} − ${t}. x ಎಷ್ಟು?`)
      : t2(`So ${k + 1}x = ${k * (S + t)} − ${t}: that gives the father’s age x. The son is ${S} − x. What is the son’s age?`, `ಆದ್ದರಿಂದ ${k + 1}x = ${k * (S + t)} − ${t}: ಇದರಿಂದ ತಂದೆಯ ವಯಸ್ಸು x ಸಿಗುತ್ತದೆ. ಮಗ ${S} − x. ಮಗನ ವಯಸ್ಸು ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-sum', prompt, String(ans), near(rng, ans, [askFather ? s : f, ans + t, ans - t, f + s - ans + 1]), both((g) => g.agFatherSumRule), working, true, clues)
}

function ratioAgo(rng: Rng): Question | null {
  const n = int(rng, 2, 7)
  const m = int(rng, 1, n - 1)
  if (gcd(m, n) !== 1) return null
  const c = int(rng, 2, 6)
  const y = int(rng, 2, 12)
  const [p, q] = [m * c + y, n * c + y]
  const [a, b] = shuffle(rng, NAMES).slice(0, 2)
  const prompt = both((g, l) => g.agRatioAgo(l === 'en' ? a[0] : a[1], p, l === 'en' ? b[0] : b[1], q, m, n))
  const working = same(`(${p} − x) : (${q} − x) = ${m} : ${n} → ${n * p} − ${coef(n, 'x')} = ${m * q} − ${coef(m, 'x')} → ${solve(n - m, n * p - m * q)}`)
  const clues = [
    t2('Some years ago, both were younger by the same number of years. Call that number x.', 'ಕೆಲವು ವರ್ಷಗಳ ಹಿಂದೆ ಇಬ್ಬರೂ ಅಷ್ಟೇ ವರ್ಷ ಚಿಕ್ಕವರಾಗಿದ್ದರು. ಆ ಸಂಖ್ಯೆಯನ್ನು x ಎನ್ನಿ.'),
    t2(`x years ago, ${a[0]} was ${p} − x and ${b[0]} was ${q} − x.`, `x ವರ್ಷಗಳ ಹಿಂದೆ ${a[1]} ${p} − x ಮತ್ತು ${b[1]} ${q} − x.`),
    t2(
      `Their ratio was ${m} : ${n}, so ${n} × (${p} − x) = ${m} × (${q} − x). That is ${n * p} − ${coef(n, 'x')} = ${m * q} − ${coef(m, 'x')}.`,
      `ಅವರ ಅನುಪಾತ ${m} : ${n} ಆಗಿತ್ತು, ಆದ್ದರಿಂದ ${n} × (${p} − x) = ${m} × (${q} − x). ಅಂದರೆ ${n * p} − ${coef(n, 'x')} = ${m * q} − ${coef(m, 'x')}.`,
    ),
    t2(`So ${coef(n - m, 'x')} = ${n * p} − ${m * q}. What is x?`, `ಆದ್ದರಿಂದ ${coef(n - m, 'x')} = ${n * p} − ${m * q}. x ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-ratio', prompt, String(y), near(rng, y, [y + 1, y - 1, y + 2, c]), both((g) => g.agRatioAgoRule), working, true, clues)
}

function twoTimes(rng: Rng): Question | null {
  // f = k1·s now; f + t = k2(s + t)
  const k2 = int(rng, 2, 4)
  const k1 = int(rng, k2 + 1, 6)
  const t = int(rng, 2, 12)
  const s = (t * (k2 - 1)) / (k1 - k2)
  if (!Number.isInteger(s) || s < 3 || k1 * s > 80 || (k1 - 1) * s < 18) return null
  const f = k1 * s
  const ask = pick(rng, ['sum', 'father', 'son'] as const)
  const ans = ask === 'sum' ? f + s : ask === 'father' ? f : s
  const prompt = both((g) => g.agTwoTimes(k1, t, k2, ask))
  const working = same(`${k1}x + ${t} = ${k2}(x + ${t}) → ${solve(k1 - k2, t * (k2 - 1))}${ask === 'son' ? '' : ask === 'father' ? `; ${k1} × ${s} = ${f}` : `; ${s} + ${f} = ${f + s}`}`)
  const last = `${coef(k1 - k2, 'x')} = ${k2 * t} − ${t}`
  const clues = [
    t2(`Call the son’s age now x. The father is ${k1} times as old: ${k1}x.`, `ಮಗನ ಈಗಿನ ವಯಸ್ಸನ್ನು x ಎನ್ನಿ. ತಂದೆ ಅವನ ${k1} ರಷ್ಟು: ${k1}x.`),
    t2(`In ${t} years, the son is x + ${t} and the father ${k1}x + ${t}.`, `${t} ವರ್ಷಗಳ ನಂತರ ಮಗ x + ${t} ಮತ್ತು ತಂದೆ ${k1}x + ${t}.`),
    t2(`Then the father is ${k2} times the son: ${k1}x + ${t} = ${k2} × (x + ${t}) = ${k2}x + ${k2 * t}.`, `ಆಗ ತಂದೆ ಮಗನ ${k2} ರಷ್ಟು: ${k1}x + ${t} = ${k2} × (x + ${t}) = ${k2}x + ${k2 * t}.`),
    ask === 'son'
      ? t2(`So ${last}. What is x?`, `ಆದ್ದರಿಂದ ${last}. x ಎಷ್ಟು?`)
      : ask === 'father'
        ? t2(`So ${last}: that gives the son’s age x. The father is ${k1}x. What is his age?`, `ಆದ್ದರಿಂದ ${last}: ಇದರಿಂದ ಮಗನ ವಯಸ್ಸು x ಸಿಗುತ್ತದೆ. ತಂದೆ ${k1}x. ಅವರ ವಯಸ್ಸು ಎಷ್ಟು?`)
        : t2(`So ${last}: that gives the son’s age x. The sum of the ages is x + ${k1}x. What is it?`, `ಆದ್ದರಿಂದ ${last}: ಇದರಿಂದ ಮಗನ ವಯಸ್ಸು x ಸಿಗುತ್ತದೆ. ವಯಸ್ಸುಗಳ ಮೊತ್ತ x + ${k1}x. ಅದು ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-sum', prompt, String(ans), near(rng, ans, [f, s, f + s, ans + t, ans + 5]), both((g) => g.agTwoTimesRule), working, true, clues)
}

function ratioLater(rng: Rng): Question | null {
  const b = int(rng, 2, 9)
  const a = int(rng, 1, b - 1)
  if (gcd(a, b) !== 1) return null
  const k = int(rng, 2, 8)
  const t = int(rng, 2, 12)
  const [c, d] = reduce(a * k + t, b * k + t)
  if (c === a || d > 30) return null
  const askDiff = rng() < 0.5
  const ans = askDiff ? (b - a) * k : b * k
  const [p, q] = shuffle(rng, NAMES).slice(0, 2)
  const prompt = both((g, l) => g.agRatioLater(l === 'en' ? p[0] : p[1], l === 'en' ? q[0] : q[1], a, b, t, c, d, askDiff))
  const working = same(`(${coef(a)} + ${t}) : (${coef(b)} + ${t}) = ${c} : ${d} → ${coef(d * a)} + ${d * t} = ${coef(c * b)} + ${c * t} → k = ${k}; ${a * k}, ${b * k}${askDiff ? `; ${b * k} − ${a * k} = ${ans}` : ''}`)
  // d(ak + t) = c(bk + t), so (cb − da)k = dt − ct, written as a sum still to do.
  const solveK = `${coef(c * b - d * a)} = ${d * t} − ${c * t}`
  const clues = [
    t2(`A ratio of ${a} : ${b} means ${p[0]} is ${coef(a)} and ${q[0]} is ${coef(b)}, for some number k.`, `${a} : ${b} ಅನುಪಾತ ಎಂದರೆ ${p[1]} ${coef(a)} ಮತ್ತು ${q[1]} ${coef(b)}, k ಯಾವುದೋ ಒಂದು ಸಂಖ್ಯೆ.`),
    t2(`In ${t} years they are ${coef(a)} + ${t} and ${coef(b)} + ${t}, in the ratio ${c} : ${d}.`, `${t} ವರ್ಷಗಳ ನಂತರ ಅವರು ${coef(a)} + ${t} ಮತ್ತು ${coef(b)} + ${t}, ಅನುಪಾತ ${c} : ${d}.`),
    t2(
      `So ${d} × (${coef(a)} + ${t}) = ${c} × (${coef(b)} + ${t}): ${coef(d * a)} + ${d * t} = ${coef(c * b)} + ${c * t}.`,
      `ಆದ್ದರಿಂದ ${d} × (${coef(a)} + ${t}) = ${c} × (${coef(b)} + ${t}): ${coef(d * a)} + ${d * t} = ${coef(c * b)} + ${c * t}.`,
    ),
    askDiff
      ? t2(`So ${solveK} gives k. The difference of the ages is ${coef(b)} − ${coef(a)} = ${coef(b - a)}. What is it?`, `ಆದ್ದರಿಂದ ${solveK} ಯಿಂದ k ಸಿಗುತ್ತದೆ. ವಯಸ್ಸುಗಳ ವ್ಯತ್ಯಾಸ ${coef(b)} − ${coef(a)} = ${coef(b - a)}. ಅದು ಎಷ್ಟು?`)
      : t2(`So ${solveK} gives k. ${q[0]}’s age is ${coef(b)}. What is it?`, `ಆದ್ದರಿಂದ ${solveK} ಯಿಂದ k ಸಿಗುತ್ತದೆ. ${q[1]} ಅವರ ವಯಸ್ಸು ${coef(b)}. ಅದು ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-ratio', prompt, String(ans), near(rng, ans, [askDiff ? b * k : (b - a) * k, a * k, b - a, ans + t, k]), both((g) => g.agRatioLaterRule), working, true, clues)
}

function twoRatios(rng: Rng): Question | null {
  // t years ago m : n, t years later p : q.
  const n = int(rng, 2, 7)
  const m = int(rng, 1, n - 1)
  if (gcd(m, n) !== 1) return null
  const c = int(rng, 2, 12)
  const t = int(rng, 2, 8)
  const [pa, pb] = [m * c + t, n * c + t]
  const [p, q] = reduce(pa + t, pb + t)
  if (p === m || q > 40) return null
  const ans = `${pa}, ${pb}`
  const wrong = [`${pb}, ${pa}`, `${pa + t}, ${pb + t}`, `${m * c}, ${n * c}`, `${pa - 2}, ${pb + 2}`].filter((x) => x !== ans)
  const prompt = both((g) => g.agTwoRatios(t, m, n, p, q))
  const working = same(`(${coef(m)} + ${2 * t}) : (${coef(n)} + ${2 * t}) = ${p} : ${q} → k = ${c}; ${m * c} + ${t} = ${pa}, ${n * c} + ${t} = ${pb}`)
  const clues = [
    t2(`${t} years ago the ratio was ${m} : ${n}, so call their ages then ${coef(m)} and ${coef(n)}.`, `${t} ವರ್ಷಗಳ ಹಿಂದೆ ಅನುಪಾತ ${m} : ${n}, ಆದ್ದರಿಂದ ಆಗಿನ ಅವರ ವಯಸ್ಸುಗಳನ್ನು ${coef(m)} ಮತ್ತು ${coef(n)} ಎನ್ನಿ.`),
    t2(
      `From ${t} years ago to ${t} years from now is ${2 * t} years. Then they are ${coef(m)} + ${2 * t} and ${coef(n)} + ${2 * t}, in the ratio ${p} : ${q}.`,
      `${t} ವರ್ಷಗಳ ಹಿಂದಿನಿಂದ ${t} ವರ್ಷಗಳ ನಂತರಕ್ಕೆ ${2 * t} ವರ್ಷಗಳು. ಆಗ ಅವರು ${coef(m)} + ${2 * t} ಮತ್ತು ${coef(n)} + ${2 * t}, ಅನುಪಾತ ${p} : ${q}.`,
    ),
    // q(mk + 2t) = p(nk + 2t), so (pn − qm)k = 2t(q − p).
    t2(
      `So ${q} × (${coef(m)} + ${2 * t}) = ${p} × (${coef(n)} + ${2 * t}), which gives ${coef(p * n - q * m)} = ${2 * t * q} − ${2 * t * p}. Find k.`,
      `ಆದ್ದರಿಂದ ${q} × (${coef(m)} + ${2 * t}) = ${p} × (${coef(n)} + ${2 * t}), ಇದರಿಂದ ${coef(p * n - q * m)} = ${2 * t * q} − ${2 * t * p}. k ಕಂಡುಹಿಡಿಯಿರಿ.`,
    ),
    t2(`${t} years ago they were ${coef(m)} and ${coef(n)}. Add ${t} to each for their ages now. What are they?`, `${t} ವರ್ಷಗಳ ಹಿಂದೆ ಅವರು ${coef(m)} ಮತ್ತು ${coef(n)}. ಈಗಿನ ವಯಸ್ಸಿಗೆ ಪ್ರತಿಯೊಂದಕ್ಕೂ ${t} ಕೂಡಿಸಿ. ಅವು ಎಷ್ಟು?`),
  ]
  return build(rng, 'ag-ratio', prompt, ans, shuffle(rng, wrong).slice(0, 3), both((g) => g.agTwoRatiosRule(m, n)), working, false, clues)
}

const MAKERS = [times, fatherSum, ratioAgo, twoTimes, ratioLater, twoRatios]

/** A generated question. */
export function generateAgeProblem(rng: Rng = Math.random): Question {
  for (;;) {
    const q = pick(rng, MAKERS)(rng)
    if (q) return q
  }
}
