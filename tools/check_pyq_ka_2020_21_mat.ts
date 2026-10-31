/**
 * Checks every answer in the Karnataka MAT 2020-21 paper (data/pyq/ka-2020-21-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions can't
 * be solved by code: they were solved by eye from the rendered pages, and this checks the marked
 * answer, the cropped pictures and that the four option pictures differ.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2020_21_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2020-21-mat.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { Seg, ShapeKind } from '../app/src/lib/shapeCount'
import { analogy, codeOf, cube, fill, holds, is, isPrime, lines, matrix, odd, oppositeOf, place, range, runPaper, series, shift, SIGN, wrong, weekday, DAYS } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as Q[]

/** Q44-47: the numbers in each part of the picture and which shapes it is inside (C circle, R rectangle, T triangle). */
const PARTS: [number, string][] = [[7, 'C'], [4, 'CT'], [8, 'CRT'], [3, 'CR'], [5, 'R'], [10, 'RT'], [6, 'R'], [2, 'T']]
const sum = (keep: (s: string) => boolean) => PARTS.filter(([, s]) => keep(s)).reduce((t, [n]) => t + n, 0)


// Counting figures: the pictures typed in as straight lines (y down), read from the rendered page.
const quarterQ63: Seg[] = [
  [0, -4, 2, -4], // a to b on the edge
  [0, -2, 4, -2], // c, d, e
  [2, -4, 2, 0], // b, d, f
  [0, -4, 4, 0], // a, d, g
  [0, -2, 2, 0], // c to f
  [4, -2, 4, 0], // e to g
]
const Q63: Seg[] = [
  [0, -6, 6, 0], [6, 0, 0, 6], [0, 6, -6, 0], [-6, 0, 0, -6], // the square, on its corner
  [0, -6, 0, 6], [-6, 0, 6, 0], // its diagonals
  ...quarterQ63,
  ...quarterQ63.map(([a, b, c, d]): Seg => [-a, -b, -c, -d]), // the bottom left quarter, turned half round
]
const h = Math.sqrt(3) / 2
const Q64: Seg[] = [
  [1.5, 0, 2.5, 0], [1, h, 3, h], [0.5, 2 * h, 3.5, 2 * h],
  [1.5, 0, 0.5, 2 * h], [2.5, 0, 1.5, 2 * h], [3, h, 2.5, 2 * h],
  [1.5, 0, 2.5, 2 * h], [2.5, 0, 3.5, 2 * h], [1, h, 1.5, 2 * h],
]
const Q66: Seg[] = [...range(0, 4).map((j): Seg => [0, 4 * j, 28, 4 * j]), ...range(0, 5).map((i): Seg => [7 * i, 0, 7 * i, 12])]
const count = (segs: Seg[], kind: ShapeKind): Fits => (_, v) => Number(v) === countShapes(segs, kind)
/** Q65: semicircles are made only by lines right across a circle (diameters): 2 per diameter. */
const DIAMETERS = [1, 1, 1, 1, 2, 2] // big circle, three small ones, the two middle ones
const Q65 = DIAMETERS.reduce((t, n) => t + 2 * n, 0)

const RULES: Record<number, Fits> = {
  1: (q, v) => {
    const s = fill(q.terms, v).map(Number)
    // Consecutive primes: all prime, and no prime skipped between neighbours.
    return s.every(isPrime) && s.every((n, i) => i === 0 || range(s[i - 1] + 1, n - s[i - 1] - 1).every((m) => !isPrime(m)))
  },
  2: series(range(2, 5).map((n) => n ** 3 + n * n + n)),
  3: series([5, 4, 3, 2].flatMap((n) => [n * n, n ** 3])),
  4: series(range(1, 6).map((n) => n ** 3 - n)),
  5: series([2, 9, 16, 27, 38, 53, 68]),
  6: (q, v) => fill(q.terms, v).join('') === 'acbbca'.repeat(2),
  7: (q, v) => fill(q.terms, v).join('') === ['pqrs', 'qrsp', 'rspq'].join(''),
  8: (q, v) => fill(q.terms, v).join('') === 'yxxy'.repeat(3).slice(0, 10),
  9: analogy((n) => (n - 1) * n * (n + 1)),
  10: (q, v) => {
    const top = (m: string) => {
      const [, w, a, b] = m.match(/^(\d+) (\d+)\/(\d+)$/)!
      return `${Number(w) * Number(b) + Number(a)}${b}`
    }
    return top(q.terms[2]) === q.terms[3] && top(q.terms[0]) === v
  },
  11: analogy((x) => Math.sqrt(x) - 1),
  12: analogy((n) => n ** 3 + n * n + n),
  13: (q, v) => shift(q.terms[0], (i) => (i % 2 ? 1 : -1)) === q.terms[1] && shift(q.terms[2], (i) => (i % 2 ? 1 : -1)) === v,
  14: (q, v) => shift(q.terms[0], (i) => i + 1) === q.terms[1] && shift(q.terms[2], (i) => i + 1) === v,
  15: wrong(range(1, 5).map((n) => 2 * n * n)),
  16: wrong(range(1, 5).map((n) => n * (n + 1) ** 2)),
  17: wrong(range(0, 10).map((i) => (i % 2 === 0 ? ((i / 2) * (i / 2 + 1)) / 2 : i))),
  18: wrong(range(1, 5).map((n) => n ** 3 + 3)),
  19: wrong([240, 48, 12, 4, 2, 2]),
  20: odd((o) => {
    const [a, b] = o.split(',').map(Number)
    const pron = (n: number) => range(1, 20).find((k) => k * (k + 1) === n)
    return !!pron(a) && !!pron(b) && pron(a) === pron(b)! + 1
  }),
  21: odd((o) => Number(o[0]) + Number(o[1]) === 7),
  22: odd((o) => shift(o[0], () => 5) === o[1] && shift(o[1], () => -3) === o[2] && shift(o[2], () => 7) === o[3]),
  23: odd((o) => Number.isInteger(Math.sqrt([...o].reduce((s, c) => s + place(c), 0)))),
  24: odd((o) => [2, 3, 4].every((d, i) => shift(o[i], () => d) === o[i + 1])),
  29: matrix((m) => m.every(([a, b, c]) => b * c === 2 * a)),
  30: matrix((m) => [0, 1, 2].every((c) => m[0][c] + m[1][c] + m[2][c] === (c + 2) * m[0][c]), place),
  31: matrix((m) => [0, 1, 2].every((c) => m.every((row) => row[c] === c + 2)), lines),
  32: matrix((m) => m.every(([a, b, c]) => b === a * c + a + c)),
  33: matrix((m) => [0, 1, 2].every((c) => cube(m[0][c]) + m[1][c] ** 2 === m[2][c])),
  34: (q, v) => q.table!.every(([l, n, r]) => 2 * (place(l) + Number(n)) === Number(r === '?' ? v : r)),
  35: (q, v) => {
    const signs = v.split(',').map((s) => s.trim())
    let k = 0
    return holds(q.terms[0].replace(/\*/g, () => SIGN(signs[k++])))
  },
  37: (q, v) => {
    const [a, b] = v.split(' & ')
    const swapped = q.terms[0].split(' ').map((t) => (t === a ? b : t === b ? a : t)).join(' ')
    return holds(swapped)
  },
  39: (_, v) => [[6, 8, 10, 8], [12, 16, 17, 15], [18, 20, 25, Number(v)]].every(([a, b, c, m]) => (a + b + c) / 3 === m),
  40: (_, v) => [[5, 3, 7, 2, 29], [9, 3, 6, 4, 51], [6, 5, 4, 3, Number(v)]].every(([t, b, l, r, m]) => t * b + l * r === m),
  41: (_, v) => [[36, 35, 33, 38], [47, 46, 44, 49], [Number(v), 65, 56, 52]].every(([a, b, c, d]) => a + b === c + d),
  42: (_, v) => [[7, 22, 13, 14], [9, 18, 31, 32], [Number(v), 30, 45, 46]].every(([m, a, b, c]) => a + b + c === m * m),
  43: (_, v) => [[6, 25, 30], [7, 64, 56], [8, Number(v), 72]].every(([a, b, c]) => (c / a) ** 2 === b),
  44: (_, v) => Number(v) === sum((s) => s.includes('R') && !s.includes('C')),
  45: (_, v) => Number(v) === sum((s) => s.includes('R') && s.includes('T')),
  46: (_, v) => Number(v) === sum((s) => s === 'CRT'),
  47: is('Fishermen only'), // 7 is the only part in the circle alone
  48: (_, v) => {
    const youngest = (40 - 2 * (0 + 1 + 2 + 3 + 4)) / 5
    return v === `${youngest + 8} years`
  },
  49: is('Uncle'), // the man's brother is Harsha's father
  50: is('P'), // S is Q's child, and P is Q's father
  51: (_, v) => weekday(2000, 2, 6) === 0 && v === DAYS[weekday(2001, 3, 6)],
  52: (_, v) => {
    // Minute hand at 6 points south, so 12 is north and 9 is west. The hour hand at 10:30 is at 315°.
    const deg = ((10 + 30 / 60) * 30) % 360
    const dirs = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West']
    return dirs[Math.round(deg / 45) % 8] === v
  },
  53: codeOf('AIR'),
  54: codeOf('LIST'),
  55: codeOf('BOSE'),
  56: codeOf('BURN'),
  57: (_, v) => shift('MACHINE', (i) => (i % 2 ? 4 : 3)) === 'PEFLLRH' && shift('PICTURE', (i) => (i % 2 ? 4 : 3)) === v,
  58: (_, v) => {
    const steps = (i: number) => (i % 2 ? -1 : 1) * (Math.floor(i / 2) + 1)
    return shift('MASTER', steps) === 'NZURHO' && shift('PERSON', steps) === v
  },
  59: (_, v) => shift([...'TABLE'].reverse().join(''), () => -1) === 'DKAZS' && shift([...'CHAIR'].reverse().join(''), () => -1) === v,
  60: (_, v) => {
    const code = (w: string) => [...w].reverse().map(place).join('')
    return code('FRUITS') === '1920921186' && code('PIGEON') === v
  },
  61: (_, v) => {
    const code = (w: string) => 3 * [...w].reduce((s, c) => s + place(c), 0)
    return code('LION') === 150 && code('GOAT') === Number(v)
  },
  62: (_, v) => v === [...'THURSDAY'].map((c) => (place(c) % 2 ? c : c.toLowerCase())).join(''),
  63: count(Q63, 'triangle'),
  64: count(Q64, 'parallelogram'),
  65: (_, v) => Number(v) === Q65,
  66: count(Q66, 'rectangle'),
  75: (_, v) => {
    // Faces seen together are next to each other; the opposite of 4 is the one face never seen with it... worked from 5.
    const views = [[2, 3, 5], [4, 1, 6], [6, 1, 5]]
    return oppositeOf(views, 4) === Number(v)
  },
  76: (_, v) => oppositeOf([[5, 3, 6], [1, 4, 6], [1, 3, 2]], 3) === Number(v),
  77: (_, v) => {
    // A straight run of squares: 1st and 3rd are opposite. The column is 2, 6, 4, 5.
    const col = [2, 6, 4, 5]
    const i = col.indexOf(4)
    return col[i - 2] === Number(v) || col[i + 2] === Number(v)
  },
  78: is('● and ★'), // ends of the Z-shaped run ● △ ■ ★
  89: is('Some donkeys are horses'),
  90: is('Some members of that team are not good players.'),
}
RULES[36] = RULES[35]
RULES[38] = RULES[37]

/** Picture questions, solved by eye from the rendered pages (see each question's rule and working). */
const BY_EYE: Record<number, Key> = {
  25: 'C', 26: 'D', 27: 'B', 28: 'A',
  67: 'D', 68: 'B', 69: 'D', 70: 'D',
  71: 'B', 72: 'A', 73: 'D', 74: 'C',
  79: 'A', 80: 'B', 81: 'A', 82: 'C', 83: 'D', 84: 'B',
  85: 'D', 86: 'D', 87: 'B', 88: 'C',
}
/** Questions hidden from students, and why the answer above isn't certain. */
const UNSURE = new Set([11, 23, 67])


process.exit(runPaper('Karnataka MAT 2020-21', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
