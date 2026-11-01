/**
 * Checks the answers to the SAT papers' maths questions (data/pyq/ka-<year>-sat.json, subject "maths").
 * Each question has its own rule here, worked out independently of the written solution: a value to
 * compute, a condition the right option must meet (an equation it solves, an identity it matches at
 * random values) or, for statements and pictures, whether each option is true. Exactly one option must
 * fit, and it must be the key. Every answered question needs `keyFrom` and a solution in English and
 * Kannada; a maths question with no answer must say why in its note.  Run from app/:  npx tsx ../tools/check_sat_maths.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SAT_PAPERS } from '../app/src/data/sat'

const KEYS = ['A', 'B', 'C', 'D'] as const
type Key = (typeof KEYS)[number]
/** Does this option fit? `v` is the option's text. */
type Rule = (v: string) => boolean

// ---- Reading maths written as printed: "−1/2", "2³ × 3", "√16", "₹1,150", "12.756 × 10⁶", "4a² − 7ab" ----

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+', '⁽': '(', '⁾': ')', ᵐ: 'm', ⁿ: 'n', ᵖ: 'p' }

/** Turns printed maths into a JavaScript expression of the letters in it; S and C are √ and ∛. */
function toJs(s: string): string {
  const t = s
    .replace(/[₹,]/g, '')
    .replace(/(cm²|m²|km²|cm|km|kg|m)$|°/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
    .replace(/√(\d+(?:\.\d+)?)/g, 'S($1)')
    .replace(/∛(-?\d+)/g, 'C($1)')
    .replace(/√\(/g, 'S(')
    // Implicit products: 2a, ab, a(…), )(, )a, 2(…).
    .replace(/([\da-z)])(?=[a-zSC(])/g, '$1*')
  // Powers: a superscript applies to the token before it (a number, a letter or a bracket).
  let out = ''
  for (let i = 0; i < t.length; i++) {
    if (!(t[i] in SUP)) {
      out += t[i]
      continue
    }
    let exp = ''
    while (i < t.length && t[i] in SUP) exp += SUP[t[i++]]
    i--
    let start = out.length - 1
    if (out[start] === ')') {
      for (let depth = 0; start >= 0; start--) {
        if (out[start] === ')') depth++
        else if (out[start] === '(') depth--
        if (depth === 0) break
      }
      if (/[SC]/.test(out[start - 1] ?? '')) start--
    } else if (/\d/.test(out[start])) while (start > 0 && /[\d.]/.test(out[start - 1])) start--
    out = `${out.slice(0, start)}Math.pow(${out.slice(start)},(${toJs(exp)}))`
  }
  return out
}

const VARS = ['a', 'b', 'c', 'm', 'n', 'p', 'q', 'x', 'y']
function evaluate(s: string, env: Record<string, number> = {}): number {
  return Function('S', 'C', ...VARS, `return (${toJs(s)})`)(Math.sqrt, Math.cbrt, ...VARS.map((v) => env[v] ?? NaN)) as number
}
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b))
/** The option's value: a number, a fraction or a sum; "a : b" is the ratio a/b. */
function value(v: string): number {
  const ratio = v.match(/^(.*?):(.*)$/)
  return ratio ? evaluate(ratio[1]) / evaluate(ratio[2]) : evaluate(v)
}

// ---- Rules ----

/** The option is this number. */
const num = (n: number): Rule => (v) => near(value(v), n)
/** The option's number makes this true (e.g. it solves the equation). */
const solves = (f: (x: number) => boolean): Rule => (v) => f(value(v))
/** The option is an expression in these letters equal to f at random values. */
const same = (f: (e: Record<string, number>) => number): Rule => (v) =>
  Array.from({ length: 5 }, () => Object.fromEntries(VARS.map((k) => [k, 1 + Math.round(Math.random() * 900) / 100]))).every((e) => near(evaluate(v, e), f(e)))
/** The option is a formula in n that gives f(n) for n = 1, 2, …, 6. */
const forN = (f: (n: number) => number): Rule => (v) => range(1, 6).every((n) => near(evaluate(v, { n }), f(n)))
/** The option names two factors, "(…), (…)", whose product is f. */
const factors = (f: (e: Record<string, number>) => number): Rule => (v) => same(f)(`(${v.replace(/\)\s*,\s*\(/, ')*(').replace(/^\(|\)$/g, '')})`)
/** For statements, definitions and pictures: whether each option is true, e.g. "FTFF", and why. */
const truth = (marks: string, _why: string): Rule => (v) => marks[KEYS.indexOf(v as Key)] === 'T'
/** Rules that read the option key rather than its text. */
const BY_KEY = new Set<Rule>()
const t = (marks: string, why: string) => {
  const r = truth(marks, why)
  BY_KEY.add(r)
  return r
}
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)
const isPrime = (n: number) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d)
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const lcm = (...xs: number[]) => xs.reduce((a, b) => (a * b) / gcd(a, b))
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
/** Alternating digit sum from the units digit (divisibility by 11). */
const alt = (n: string) => sum([...n].reverse().map((d, i) => (i % 2 ? -1 : 1) * Number(d)))
const digits = (n: string) => sum([...n].map(Number))
/** Ways to write n as a sum of two different positive cubes. */
const cubeWays = (n: number) => range(1, 30).filter((a) => range(a + 1, 30).some((b) => a ** 3 + b ** 3 === n)).length

const RULES: Record<string, Rule> = {
  // 2019-20
  'ka1920s-71': num(45 / 3),
  'ka1920s-72': solves((x) => 4 * x * x + 2 * x === 4 * x * x + 6),
  'ka1920s-73': num(180 - 109 + (180 - 115)),
  'ka1920s-74': num(median([40, 52, 34, 47, 31, 35, 48, 41, 44, 38])),
  'ka1920s-75': solves((x) => near(Math.sqrt(2 / 3), (3 / 2) ** (1 - 3 * x))),
  'ka1920s-76': num(((7 - 5) / 5) * 100),
  'ka1920s-77': t('FTFF', '120° + 60° = 180°, at two different points'),
  'ka1920s-78': num(sum(range(1, 9).map((k) => 2 * k)) / 3),
  'ka1920s-79': solves((total) => Number.isInteger(total / 12) && (total / 12) * 7 - (total / 12) * 5 === 8),
  'ka1920s-80': solves((a) => Number(`35${a}2479`) % 11 === 0),
  'ka1920s-81': solves((cp) => near(cp + cp / 9, 2250)),
  'ka1920s-82': solves((m) => near(Math.sqrt(1 + 27 / 169), 1 + m / 13)),
  'ka1920s-83': num((6.25 * 6.25 - 1.75 * 1.75) / 4.5),
  'ka1920s-84': solves((x) => near(x / 3 + 1, 5)),
  'ka1920s-85': num((2 + 1) / (1 + 3)),
  'ka1920s-86': num(60 + 20 + 40),
  'ka1920s-87': num(180 - (180 - 40 - 65)),
  'ka1920s-88': num(Math.sqrt(41 - Math.sqrt(21 + Math.sqrt(19 - Math.sqrt(9))))),
  'ka1920s-89': factors(({ a, b, c }) => a * a + b * b - c * c - 2 * a * b),
  'ka1920s-90': solves((d) => d > 0 && [d / 2 + Math.sqrt(d * d / 4 + 1)].every((x) => near(x * x + 1 / (x * x), 102))),
  // 2020-21
  'ka21s-71': same(({ n }) => n),
  'ka21s-72': same(({ a, m, n, p }) => (a ** p / a ** m) ** n * (a ** m / a ** n) ** p * (a ** n / a ** p) ** m),
  'ka21s-73': t('FTFF', 'dividing by 6/7 is multiplying by 7/6; C and D change the value'),
  'ka21s-74': same(({ a, b }) => 10 * a - 7 * a * b - 8 * b - 11 - (-a + 2 * a * b - 3 * b + 7)),
  'ka21s-75': num(((100 * 100 - 90 * 90) / 10) * 250),
  'ka21s-76': t('FFFT', 'exterior 360/8 = 45°, interior 135°, in that order'),
  'ka21s-77': num(range(2, 20).find((n) => !isPrime(n))! - range(2, 20).find(isPrime)!),
  'ka21s-78': t('FFTF', 'a rhombus has four equal sides by definition; the others fail for some shapes'),
  'ka21s-79': solves((d) => range(1, 9).every((a) => range(0, 9).every((b) => range(1, 9).every((c) => (100 * a + 10 * b + c - (100 * c + 10 * b + a)) % d === 0))) && d > 1),
  'ka21s-80': same(({ a, b, c }) => a * (b - c) + b * (c - a) + c * (a - b)),
  'ka21s-81': num(Math.sqrt(84 + Math.sqrt(248 + Math.sqrt(64)))),
  'ka21s-82': solves((x) => near((8 + 12 + 20 + x + 10) / 5, 13)),
  'ka21s-83': solves((len) => near(2 * (len + (len - 2)), 24)),
  'ka21s-84': solves((x) => near(x, (90 - x) / 2)),
  'ka21s-85': solves((n) => n - 2 === 18),
  'ka21s-86': solves((y) => Number(`3${y}1`) % 9 === 0),
  'ka21s-87': t('FFFT', 'rationals are closed under ×, so (i) is false; 1 ÷ 2 is not an integer, so (ii) is false'),
  'ka21s-88': t('FFFT', 'with c = f, d = a, e = b (vertically opposite) and c + d + e = 180°, all three hold'),
  'ka21s-89': solves((n) => n * n === 10201),
  'ka21s-90': solves((n) => n % 3 === 0 && n % 6 === 0 && n % 9 === 0),
  // 2022-23
  'ka2223s-71': (v) => near(value(v), 585 / 975) && gcd(evaluate(v.split('/')[0]), evaluate(v.split('/')[1])) === 1,
  'ka2223s-72': same(({ n }) => n),
  'ka2223s-73': (v) => {
    const [l, r] = v.replace(/x/g, '(2)').split('=')
    return near(evaluate(l), evaluate(r))
  },
  'ka2223s-74': num(Math.sqrt(4 + 8 + 16 + 8)),
  'ka2223s-75': (v) => value(v) === 0,
  'ka2223s-76': forN((n) => range(n ** 3 + 1, (n + 1) ** 3 - 1).length),
  'ka2223s-77': solves((k) => near((1 / -8) * k, 1 / 16)),
  'ka2223s-78': solves((m) => Number.isInteger(m) && Number(`8${m}92`) % 11 === 0 && Number(`${m}180`) % 11 === 0),
  'ka2223s-79': (v) => {
    const [lo, hi] = v.split(' and ').map(evaluate)
    return lo < 23 / 30 && 23 / 30 < hi
  },
  'ka2223s-80': num(692 / 40),
  'ka2223s-81': solves((x) => near(x * 1.5 + 1 / 3, 5 / 6)),
  'ka2223s-82': solves((twos) => near(twos * 2 + (twos / 6) * 5, 357)),
  'ka2223s-83': same(({ a, b, c }) => 7 * a * (5 * a + 3 * b - 2 * c) - 11 * a * (3 * a - 5 * b + 7 * c)),
  'ka2223s-84': t('TFFF', 'by eye: A (M shape) is the only concave polygon; B is convex, C and D have curves'),
  'ka2223s-85': num((((-3 / 4) ** 2) ** -2) ** 1),
  'ka2223s-86': num(200 / (600 + 200 + 300 + 300)),
  'ka2223s-87': t('FFTF', 'abc + bca + cab = 111(a + b + c), so the remainder is 0, i.e. abc − abc'),
  'ka2223s-88': same(({ p, q }) => (4 * p + 3 * q) ** 2 - (4 * p - 3 * q) ** 2),
  'ka2223s-89': t('FFFT', 'kite: the axis joining the unequal angles is the perpendicular bisector; it need not be the longer diagonal (C)'),
  'ka2223s-90': num(4 * Math.sqrt(1.002001)),
  // 2023-24
  'ka2324s-71': num(450 / (60 * 10)),
  'ka2324s-72': num(16 / (1 / 2)),
  'ka2324s-73': num((5 * 5 - 9) / (5 + 3)),
  // Figure n is n squares in a row: 4 sides for the first, 3 more for each square after it.
  'ka2324s-74': forN((n) => 4 + 3 * (n - 1)),
  'ka2324s-75': (v) => near(value(v), 12756000) && /^[1-9]\.\d+ ×/.test(v),
  'ka2324s-76': num((8 * 4.5) / 6),
  'ka2324s-77': solves((a) => range(0, 9).some((b) => range(1, 9).some((c) => new Set([a, b, c]).size === 3 && (10 * a + b) * 3 === 100 * c + 11 * b))),
  'ka2324s-78': solves((d) => range(1, 100).filter((n) => n % 5 === 4 && n % 2 === 1).every((n) => n % 10 === d)),
  'ka2324s-79': t('TFFF', 'a + b = b + a with a = 3/4 and b = (4/5 + 5/3)'),
  'ka2324s-80': solves((x) => x < -2),
  'ka2324s-81': solves((veena) => near((veena - 25) / (veena - 6 - 25), 7 / 5)),
  'ka2324s-82': solves((f) => near(0.15 * (4 * f - 3), 0.03 * (12 * f + 17))),
  'ka2324s-83': num(48 + 28 + 24),
  'ka2324s-84': num(360 / 3),
  'ka2324s-85': solves((s) => range(1, 50).some((n) => (n * (n + 1)) / 2 + ((n + 1) * (n + 2)) / 2 === 256 && 2 * n + 1 === s)),
  'ka2324s-87': num(range(1, 1000).map((n) => n * n).find((n) => n % 6 === 0 && n % 8 === 0 && n % 9 === 0)!),
  'ka2324s-88': t('FTFF', '5a × 3b × 2c = 30abc, one term'),
  'ka2324s-89': t('TFFF', 'four sides and an angle fix a quadrilateral; four sides, four angles and a side, or two sides and two diagonals do not'),
  'ka2324s-90': num((6 * (6 - 3)) / 2),
  // 2024-25
  'ka2425s-71': t('TFFF', 'by eye: only A (an L) is open and does not cross itself'),
  'ka2425s-72': t('FFTF', '0 is whole, not natural; −1 is an integer, not whole; n = n/1 is rational'),
  'ka2425s-73': num(180 - 360 / 8),
  'ka2425s-74': solves((n) => cubeWays(n) === 2),
  'ka2425s-75': num((4 ** 0 + 3 ** 1) / (-2) ** 3),
  'ka2425s-76': num(3 * 4 - -4 + (0 / 4) * -4),
  'ka2425s-77': t('FTFF', 'rhombus: equal sides, perpendicular bisecting diagonals and supplementary adjacent angles; angles not all equal'),
  'ka2425s-78': solves((m) => near((2 * m) / 5 - 1, (4 * m) / 15 + 3)),
  'ka2425s-79': num((2 / 5) * (-3 / 7) - 1 / 14 - (3 / 7) * (3 / 5)),
  'ka2425s-80': solves((x) => near(1.75 * (4 * x - 2), 1.5 * (3 * x - 6))),
  'ka2425s-81': num(12 * 10 - (5 * 6) / 2 - (7 * 10) / 2),
  'ka2425s-82': solves((s) => range(2, 100).some((x) => 3 * 60 * (2 * x - 3 + x + 5 + 3 * x + 8) === 9360 && Math.min(2 * x - 3, x + 5, 3 * x + 8) === s)),
  'ka2425s-83': solves((x) => near(x / 4 + x / 6, 15 / 4)),
  'ka2425s-84': solves((a) => near((a * 80 + ((a * 2) / 3) * 140) * 1.15, 1196)),
  'ka2425s-85': num(range(10, 20).filter(isPrime).length / 11),
  'ka2425s-86': num(((25 - 15) / 100) * 260),
  'ka2425s-87': num(775 - Math.floor(Math.sqrt(775)) ** 2),
  'ka2425s-88': solves((x) => near(Math.sqrt(x + Math.sqrt(13 - Math.sqrt(16))), 7)),
  'ka2425s-89': solves((k) => near((Math.cbrt(-216) + Math.cbrt(125) - Math.cbrt(-343)) ** 2, 3 * k)),
  'ka2425s-90': num((80 / (75 + 110 + 80 + 100 + 115)) * 360),
  // 2025-26
  'ka2526s-71': t('FFFT', 'a ÷ 0 is not defined; +, − and × always give a rational'),
  'ka2526s-72': t('FFFT', 'an equation always has = ; the other signs are optional'),
  'ka2526s-73': t('FFTF', 'a line of symmetry of a circle goes through the centre: a diameter'),
  'ka2526s-74': t('FFFT', 'D is the definition of a kite; A, B and C fail for some shapes'),
  'ka2526s-75': num(2 ** 3 - (-2) ** 3),
  'ka2526s-76': num(range(1, 6).filter((n) => !isSquare(n)).length / 6),
  'ka2526s-77': solves((m) => near(5 * m + 8 / 5, 3 * m - 2 / 5)),
  'ka2526s-78': num((45 / (30 + 45 + 25 + 20)) * 360),
  'ka2526s-79': (() => {
    // Rectangle B(0,0), C(2,0), D(2,2), A(0,2) (any size gives the same fraction): Q(1,0), R(2,1).
    const y = 0.5 // AC: y = 2 − x; QR: y = x − 1; they meet at x = 1.5, y = 0.5
    return num((0.5 * 1 * y) / 4)
  })(),
  'ka2526s-80': num(Math.cbrt(42875) - Math.cbrt(15625)),
  'ka2526s-81': num(180 - (180 - 108) - (180 - 117)),
  'ka2526s-82': num(range(30 ** 3 + 1, 31 ** 3 - 1).filter((n) => Math.round(Math.cbrt(n)) ** 3 !== n).length),
  'ka2526s-83': num((2 ** 8 + 2 ** 6 + 2 ** 4) / (2 ** 1 + 2 ** 3 + 2 ** 5)),
  'ka2526s-84': num(4 * Math.hypot(4, 3)),
  'ka2526s-85': num(sum(range(10, 99).filter((n) => n % 2))),
  'ka2526s-86': num(Math.sqrt((2 * 8.5) ** 2 - 8 ** 2)),
  'ka2526s-87': num((Math.sqrt(57.6) + Math.sqrt(32.4)) / (Math.sqrt(0.576) - Math.sqrt(0.324))),
  'ka2526s-88': num((7 / 3) * (1 / 15) + (2 / 35) * (-2 / 9)),
  'ka2526s-89': num((200 * (22 / 7) * 70) / 100),
  'ka2526s-90': num(1500 * 1.1 - 500 * 0.9),
}

/** Questions left without an answer on purpose (each says why in its note). */
const UNSOLVED = new Set(['ka2324s-86'])

const problems: string[] = []
const kn = (paper: string) => JSON.parse(readFileSync(join(import.meta.dirname, `../app/src/data/pyq/${paper}.kn.json`), 'utf8')).questions
let checked = 0
for (const p of SAT_PAPERS) {
  const knQ = kn(p.id)
  for (const q of p.questions.filter((x) => x.subject === 'maths')) {
    const at = `${p.id} Q${q.paperNo} (${q.id})`
    const solved = q as typeof q & { keyFrom?: string; solution?: { concept: string; steps: string[] } }
    if (UNSOLVED.has(q.id)) {
      if (q.answer) problems.push(`${at}: listed as unsolved but has an answer`)
      if (!q.note || !knQ[q.id]?.note) problems.push(`${at}: an unsolved question needs a note (English and Kannada) saying why`)
      continue
    }
    const rule = RULES[q.id]
    if (!rule) {
      problems.push(`${at}: no rule`)
      continue
    }
    if (!q.answer) problems.push(`${at}: no answer`)
    if (solved.keyFrom !== 'solved' && solved.keyFrom !== 'book') problems.push(`${at}: no keyFrom`)
    if (!solved.solution?.concept || !solved.solution.steps?.length) problems.push(`${at}: no solution`)
    const k = knQ[q.id]?.solution
    if (!k?.concept || k.steps?.length !== solved.solution?.steps.length) problems.push(`${at}: the Kannada solution is missing or has a different number of steps`)
    let fits: Key[]
    try {
      fits = KEYS.filter((key) => rule(BY_KEY.has(rule) ? key : q.options[key]))
    } catch (e) {
      problems.push(`${at}: rule failed: ${(e as Error).message}`)
      continue
    }
    if (fits.length !== 1) problems.push(`${at}: ${fits.length} options fit (${fits.join(', ') || 'none'})`)
    else if (fits[0] !== q.answer) problems.push(`${at}: key ${q.answer}, but the rule gives ${fits[0]}`)
    checked++
  }
}
for (const id of Object.keys(RULES)) if (!SAT_PAPERS.some((p) => p.questions.some((q) => q.id === id && q.subject === 'maths'))) problems.push(`${id}: rule for a question that isn't a maths question`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`SAT maths: ${checked} answers checked, ${UNSOLVED.size} left unsolved on purpose`)
