/**
 * Checks every answer in the Karnataka MAT 2019-20 paper (data/pyq/ka-2019-20-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions were
 * solved by eye from the rendered pages; this checks the marked answer and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2019_20_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2019-20-mat.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { Seg } from '../app/src/lib/shapeCount'
import { analogy, DAYS, fill, holds, is, isPrime, matrix, odd, oppositeOf, place, range, runPaper, series, shift, SIGN, weekday, wrong } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as Q[]

const nums = (o: string) => o.match(/\d+/g)!.map(Number)
const isOdd = (n: number) => n % 2 === 1
const seq = (q: Q) => q.terms.map(Number)
/** A cell of a mixed matrix: a number, or a letter's place in the alphabet. */
const cell = (c: string) => (Number.isNaN(Number(c)) ? place(c) : Number(c))
/** A letter's place counted from Z (Z = 1, Y = 2, …). */
const fromZ = (c: string) => 27 - place(c)
/** Steps from one letter to the next, going past Z back to A. */
const step = (a: string, b: string) => (place(b) - place(a) + 26) % 26
/** Fills a letter series' boxes with an option ("c, a, b, c") and reads it as one word. */
const boxes = (want: string): Fits => (q, v) => fill(q.terms, v).join('') === want
const rowsEqual = (m: number[][]) => m.every((r) => r.reduce((s, x) => s + x, 0) === m[0].reduce((s, x) => s + x, 0))
const choose2 = (n: number) => (n * (n - 1)) / 2

// Q48-50: the regions of the figure, by which shapes hold them (T triangle = kabaddi, R rectangle = cricket, C circle = volleyball).
const PARTS: [number, string][] = [[4, 'T'], [3, 'R'], [9, 'RT'], [8, 'RTC'], [7, 'RC'], [2, 'TC'], [5, 'C']]
const sum = (keep: (s: string) => boolean) => PARTS.filter(([, s]) => keep(s)).reduce((t, [n]) => t + n, 0)

// Counting figures, typed in as straight lines (y down).
const Q51: Seg[] = range(0, 5).flatMap((i) => [[0, i, 4, i], [i, 0, i, 4]] as Seg[])
// Q53: five lines from the apex to the base, and a line across meeting the middle three.
const Q53: Seg[] = [[-4, 10, 4, 10], ...[-4, -2, 0, 2, 4].map((x): Seg => [0, 0, x, 10]), [-1.4, 7, 1.4, 7]]
// Q54: two crossing triangles (a six-pointed star) with two diagonals of the middle hexagon, stretched sideways (which keeps parallel lines parallel).
const Q54: Seg[] = [[0, -2, -3, 1], [0, -2, 3, 1], [-3, 1, 3, 1], [-3, -1, 3, -1], [-3, -1, 0, 2], [3, -1, 0, 2], [-1, -1, 1, 1], [1, -1, -1, 1]]

// Q83 opposite pairs come from the net; Q84 from the four views.
const Q84_VIEWS = [[6, 4, 5], [3, 5, 6], [4, 2, 1], [5, 1, 4]]

const RULES: Record<number, Fits> = {
  1: series([2, 4, 7, 12, 21, 38]), // differences 2, 3, 5, 9, 17: each is double the last, minus 1
  3: series(range(1, 6).map((n) => n ** 3 + 3)),
  4: series([6, 5, 10, 6, 14, 7, 18]),
  5: series(range(1, 5).map((n) => `${n}${n + 1}${n * (n + 1)}`)),
  6: boxes('acdbacdbac'),
  7: boxes('llmmmnnnn'),
  8: boxes('pqrrqrpprpqq'),
  9: (q, v) => {
    const s = seq(q)
    return Number(v) === range(1, s.length - 2).filter((i) => isPrime(s[i]) && isOdd(s[i - 1]) && isOdd(s[i + 1])).length
  },
  10: (q, v) => {
    const s = seq(q)
    return Number(v) === range(1, s.length - 1).filter((i) => s[i] === 3 && isOdd(s[i - 1])).length
  },
  11: wrong([2, 3, 5, 7, 8].map((n) => 13 * n)),
  12: (q, v) => q.terms.filter((t) => !isPrime(Number(t))).join() === v,
  13: wrong(range(4, 5).map((n) => n * (n + 1))),
  14: wrong([4, 5, 12, 39, 160]), // × 1 + 1, × 2 + 2, × 3 + 3, × 4 + 4
  15: wrong([5, 11, 19, 29, 41]),
  17: odd((o) => step(o[1], o[0]) === 3 && step(o[2], o[1]) === 5),
  18: odd((o) => {
    const [a, b, c] = nums(o).sort((x, y) => x - y)
    return a * a + b * b === c * c
  }),
  19: odd((o) => ['BUS', 'CAR', 'VAN', 'TRUCK', 'JEEP'].includes(o)), // vehicles that go on roads
  20: odd((o) => step(o[0], o[1]) === 5 && step(o[1], o[2]) === 6),
  26: analogy((x) => (Math.sqrt(x + 1) + 1) ** 2 + 1), // n² − 1 → (n + 1)² + 1
  27: analogy((x) => x ** 3 / 2),
  28: (_, v) => {
    const steps = [2, 5, 17]
    return shift('CEH', (i) => steps[i]) === 'EJY' && shift('AGD', (i) => steps[i]) === v.replace(/ /g, '')
  },
  29: (_, v) => {
    const code = (w: string) => [fromZ(w[0]), fromZ(w[1]), place(w[2]), place(w[3])].join('')
    return code('TPDG') === '71147' && code('VKNT') === v
  },
  30: (_, v) => {
    const steps = [3, -4, 5]
    return shift('PQR', (i) => steps[i]) === 'SMW' && shift('EFG', (i) => steps[i]) === v.replace(/ /g, '')
  },
  31: (_, v) => [[16, 13, 15, 14, 29], [12, 9, 11, 10, 21], [8, 5, 7, 6, Number(v)]].every(([a, b, c, d, m]) => (a + b + c + d) / 2 === m),
  32: (_, v) => [[1, 5, 2, 3, 343], [2, 6, 3, 5, 512], [2, 7, 2, 4, Number(v)]].every(([t, l, r, b, m]) => (l * r - t * b) ** 3 === m),
  34: (_, v) => [[3, 6, 10, 169], [Number(v), 7, 11, 196], [8, 10, 13, 225]].every(([t, l, r, m]) => (l + r - t) ** 2 === m),
  35: matrix((m) => m.every(([a, b, c]) => b - a === c - b)),
  36: matrix(rowsEqual),
  37: matrix((m) => m.every(([a, b, c]) => a ** 3 + b ** 2 === c)),
  38: matrix((m) => m.every(([a, b, c]) => a / b === c), fromZ),
  39: matrix((m) => m.every((r) => r.reduce((s, x) => s + x, 0) === 26), place),
  40: matrix((m) => [...m, ...[0, 1, 2].map((c) => m.map((r) => r[c]))].every((r) => r.reduce((s, x) => s + x, 0) === 15), cell),
  41: (q, v) => {
    const signs = v.split(',').map((s) => s.trim())
    let k = 0
    return holds(q.terms[0].replace(/\*/g, () => SIGN(signs[k++])))
  },
  44: (q, v) => {
    const [a, b] = v.split(' & ')
    return holds(q.terms[0].split(' ').map((t) => (t === a ? b : t === b ? a : t)).join(' '))
  },
  46: is('Niece'), // Reeta is the daughter of Raju's sister
  47: is('Brother'), // the daughter of her grandfather is her mother (or aunt); her mother's son is her brother
  48: (_, v) => Number(v) === sum((s) => s.includes('R') && s.includes('T')),
  49: (_, v) => Number(v) === sum((s) => s === 'C'),
  50: (_, v) => Number(v) === sum((s) => s.includes('T')),
  51: (_, v) => Number(v) === countShapes(Q51, 'square'),
  52: (_, v) => Number(v) === 3 * 4 + 6 * 2, // three circles cut by both lines, six small ones by one line
  53: (_, v) => Number(v) === countShapes(Q53, 'triangle') && countShapes(Q53, 'triangle') === choose2(5) + choose2(3),
  54: (_, v) => Number(v) === countShapes(Q54, 'parallelogram'),
  55: (_, v) => nums(v)[0] === ((26 - 6) / 4) * 3,
  56: (_, v) => {
    const fits = range(1, 20).flatMap((a) => range(a + 1, 20).flatMap((b) => range(b + 1, 20).filter((c) => a + b + c === a * b * c)))
    return fits.length === 1 && Number(v) === fits[0]
  },
  57: (_, v) => nums(v)[0] === Math.hypot(5 - 9, -6 + 3), // south 6, east 5, north 3, west 9
  58: (_, v) => DAYS[weekday(2019, 9, 5)] === 'Thursday' && DAYS[weekday(2020, 9, 5)] === v,
  59: (_, v) => DAYS[weekday(2019, 8, 15)] === 'Thursday' && DAYS[weekday(2020, 1, 26)] === v,
  60: (_, v) => shift('PALM', (i) => 5 - i) === 'UEOO' && shift('YEAR', (i) => 5 - i) === v,
  61: (_, v) => {
    const code: Record<string, string> = {}
    for (const [w, n] of [['EARTH', '41590'], ['PACE', '2134']]) [...w].forEach((c, i) => (code[c] = n[i]))
    return [...'PEACH'].map((c) => code[c]).join('') === v
  },
  62: (_, v) => {
    const steps = (i: number) => (i % 2 ? 1 : -2)
    return shift('FORGIVE', steps) === 'DPPHGWC' && shift('REQUEST', steps) === v
  },
  63: (_, v) => shift('KODAGU', () => 3) === 'NRGDJX' && shift('TIPTUR', () => 3) === v,
  64: (_, v) => {
    const code = (w: string) => 4 * [...w].reduce((s, c) => s + place(c), 0)
    return code('TAG') === 112 && Number(v) === code('PEN')
  },
  84: (_, v) => Number(v) === oppositeOf(Q84_VIEWS, 2),
}
RULES[42] = RULES[41]
RULES[43] = RULES[41]
RULES[45] = RULES[44]

/** Picture questions (and the doubtful Q2, Q16, Q25, Q33), solved by eye from the rendered pages. */
const BY_EYE: Record<number, Key> = {
  2: 'C', 16: 'D', 21: 'C', 22: 'A', 23: 'B', 24: 'A', 25: 'B', 33: 'A',
  65: 'B', 66: 'C', 67: 'A', 68: 'B', 69: 'D', 70: 'D', 71: 'B', 72: 'C', 73: 'B', 74: 'C', 75: 'B',
  76: 'D', 77: 'A', 78: 'C', 79: 'A', 80: 'C', 81: 'B', 82: 'D', 83: 'A', 85: 'C', 86: 'D', 87: 'C', 88: 'C', 89: 'C', 90: 'B',
}
/** Questions hidden from students, and why their answer isn't certain (see each one's note). */
const UNSURE = new Set([2, 16, 21, 24, 25, 33, 45])

process.exit(runPaper('Karnataka MAT 2019-20', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
