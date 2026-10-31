/**
 * Checks every answer in the Karnataka MAT 2022-23 paper (data/pyq/ka-2022-23-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions were
 * solved by eye from the rendered pages; this checks the marked answer and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2022_23_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2022-23-mat.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { Seg } from '../app/src/lib/shapeCount'
import { analogy, DAYS, fill, holds, is, isPrime, matrix, odd, place, range, runPaper, series, shift, SIGN, weekday, wrong } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as (Q & { pyramid?: string[][] })[]

const nextPrime = (n: number) => range(n + 1, 100).find(isPrime)!
const digitSum = (n: number) => [...String(n)].reduce((s, d) => s + Number(d), 0)
const nums = (o: string) => o.match(/\d+/g)!.map(Number)
/** A cell of a mixed matrix: a number, or a letter's place in the alphabet. */
const cell = (c: string) => (Number.isNaN(Number(c)) ? place(c) : Number(c))
/** Fills a letter series' boxes with an option ("m, o, p, s") and reads it as one word. */
const boxes = (want: string): Fits => (q, v) => fill(q.terms, v).join('') === want

// Q21-22: each symbol's row and place in the pyramid (rows from the top).
const PYR = questions[20].pyramid!
const where = (s: string): [number, number] => {
  const r = PYR.findIndex((row) => row.includes(s))
  return [r, PYR[r].indexOf(s)]
}
/** The symbol the same distance from the middle on the other side of its row. */
const mirror = (s: string) => {
  const [r, i] = where(s)
  return PYR[r][PYR[r].length - 1 - i]
}
/** The middle symbol of a group: its place from the left becomes the place from the right in the row above. */
const up = (s: string) => {
  const [r, i] = where(s)
  return PYR[r - 1][PYR[r - 1].length - 1 - i]
}
const q21 = (g: string) => {
  const [a, b, c] = g.split(' ')
  return [mirror(a), up(b), mirror(c)].join(' ')
}
const q22 = (g: string) => g.split(' ').map(mirror).join(' ')

// Counting figures, typed in as straight lines (y down) from the rendered pages.
const X = [75, 185, 297, 518, 630]
const Y = [60, 182, 300, 420, 545]
const hl = (y: number, a: number, b: number): Seg => [X[a], Y[y], X[b], Y[y]]
const vl = (x: number, a: number, b: number): Seg => [X[x], Y[a], X[x], Y[b]]
const Q23: Seg[] = [hl(0, 0, 4), hl(4, 0, 4), vl(0, 0, 4), vl(4, 0, 4), vl(3, 0, 4), hl(1, 0, 3), vl(2, 1, 2), hl(2, 0, 4), vl(1, 2, 4), hl(3, 2, 3), vl(2, 3, 4)]
const Q24: Seg[] = [
  [-5, 0, 5, 0], [-5, 8, 5, 8], [-1, 0, -1, 8], [1, 0, 1, 8], [-3, 2, 3, 2], [-3, 6, 3, 6], [-3, 2, -3, 6], [3, 2, 3, 6],
  [-1, 4, 1, 4], [-5, 0, -1, 4], [-5, 8, -1, 4], [5, 0, 1, 4], [5, 8, 1, 4],
]
// Q25: a triangle with apex (0, 0), base (−1, 2)–(1, 2) and the median, plus each option's own lines.
const base: Seg[] = [[0, 0, -1, 2], [0, 0, 1, 2], [-1, 2, 1, 2], [0, 0, 0, 2]]
const across = (y: number, full = true): Seg => [-y / 2, y, full ? y / 2 : 0, y]
const tb = 2 / 1.425
const tc = 2 / 1.45
const Q25: Record<string, Seg[]> = {
  A: [...base, across(0.6), across(1.1), [-1, 2, 0, 1.1], [1, 2, 0, 1.1]],
  B: [...base, across(1.15), [-1, 2, tb - 1, 2 - 0.85 * tb], [1, 2, 0, 1.15]],
  C: [...base, across(1.1), [-1, 2, 0, 1.1], [1, 2, 1 - tc, 2 - 0.9 * tc], across(2 - 0.9 * tc, false)],
  D: [...base, across(0.65, false), across(1.1), [-1, 2, 0, 1.1]],
}

// Q34: the faces seen together in the three views, and each option net as its column and two side squares.
const VIEWS = ['bfd', 'bac', 'cef']
const together = (a: string, b: string) => VIEWS.some((v) => v.includes(a) && v.includes(b))
/** Every way to split the six faces into three opposite pairs, none of them seen together. */
const matchings = (xs: string[]): string[][] =>
  xs.length ? xs.slice(1).filter((y) => !together(xs[0], y)).flatMap((y) => matchings(xs.slice(1).filter((z) => z !== y)).map((m) => [xs[0] + y, ...m])) : [[]]
const OPPOSITE = matchings([...'abcdef'])
const NETS: Record<string, { col: string; sides: string }> = {
  A: { col: 'bdaf', sides: 'ce' },
  B: { col: 'efab', sides: 'cd' },
  C: { col: 'fdac', sides: 'be' },
  D: { col: 'acfe', sides: 'bd' },
}
/** Opposite pairs of a net: the 1st and 3rd and the 2nd and 4th of a column of four, and the two side squares. */
const netPairs = (n: { col: string; sides: string }) => [n.col[0] + n.col[2], n.col[1] + n.col[3], n.sides]

// Q50-52: every seating of A–E round the circle (clockwise) that fits the clues; facing the centre, right is anticlockwise.
const perms = (xs: string[]): string[][] => (xs.length ? xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])) : [[]])
const SEATINGS = perms([...'BCDE'])
  .map((p) => ['A', ...p])
  .filter((s) => {
    const at = (x: string) => s.indexOf(x)
    const right = (x: string, n: number) => s[(at(x) - n + 25) % 5]
    const between = (x: string, a: string, b: string) => [right(x, 1), right(x, -1)].sort().join() === [a, b].sort().join()
    return between('B', 'C', 'D') && right('A', 2) === 'D' && !between('E', 'A', 'C')
  })
const seat = SEATINGS[0]
const right = (x: string, n: number) => seat[(seat.indexOf(x) - n + 25) % 5]
const between = (x: string, a: string, b: string) => [right(x, 1), right(x, -1)].sort().join() === [a, b].sort().join()

// Q78-80: the numbers in each part of the picture and which shapes it is inside (C circle, R rectangle, T triangle).
const PARTS: [number, string][] = [[4, 'C'], [3, 'CR'], [2, 'CRT'], [8, 'R'], [4, 'RT'], [5, 'T']]
const sum = (keep: (s: string) => boolean) => PARTS.filter(([, s]) => keep(s)).reduce((t, [n]) => t + n, 0)

const seq = (q: Q) => q.terms.map(Number)
const isOdd = (n: number) => n % 2 === 1

const RULES: Record<number, Fits> = {
  1: series([26, 35, 60, 109, 190]),
  2: series([1, 4, 15, 64, 325]),
  3: series(range(2, 5).map((n) => n ** 3 + n)),
  4: wrong([61, 67, 71, 73, 79]),
  5: wrong([2, 1, 3, 2, 7, 10, 16, 37]),
  6: analogy((n) => nextPrime(nextPrime(n))),
  7: analogy((x) => x ** 3 / 3),
  8: analogy((n) => ((n + 1) * 3) / 2),
  9: odd((o) => nums(o)[0] === 6 * nums(o)[1] + 1),
  10: odd((o) => [5, 4, 3, 2].every((d, i) => shift(o[i], () => d) === o[i + 1])),
  11: (q, v) => {
    const signs = v.split(',').map((s) => s.trim())
    let k = 0
    return holds(q.terms[0].replace(/\*/g, () => SIGN(signs[k++])))
  },
  13: (q, v) => {
    const [a, b] = v.split(' & ')
    return holds(q.terms[0].split(' ').map((t) => (t === a ? b : t === b ? a : t)).join(' '))
  },
  15: matrix((m) => m.every(([a, b, c]) => digitSum(a) * digitSum(b) === c)),
  16: matrix((m) => m.every(([a, b, c]) => a ** 3 + c ** 2 === b)),
  17: matrix((m) => [0, 1, 2].every((c) => (m[0][c] * m[1][c] * m[2][c]) / 2 === m[3][c])),
  18: matrix((m) => m.every(([a, b, c]) => (a - b) ** 2 === c), cell),
  19: matrix((m) => m.every(([a, b, c], r) => (r === 1 ? a - 5 === b && b - 3 === c : a + 5 === b && b + 3 === c)), place),
  20: matrix((m) => m.every(([a, b, c]) => b === a + 2 && c === b + 2) && [0, 1, 2].every((c) => m[1][c] === m[0][c] + 6 && m[2][c] === m[1][c] + 6), place),
  21: (q, v) => q21(q.terms[0]) === q.terms[1] && q21(q.terms[2]) === v,
  22: (q, v) => q22(q.terms[0]) === q.terms[1] && q22(q.terms[2]) === v,
  23: (_, v) => Number(v) === countShapes(Q23, 'rectangle'),
  24: (_, v) => v === `${countShapes(Q24, 'triangle')} and ${countShapes(Q24, 'square')}`,
  25: (_, v) => countShapes(Q25[v], 'triangle') === 16,
  26: is('S is the father of P'), // P is Q's son, and Q is S's wife
  27: is('S is the daughter of B'), // S × B: S is B's son, so this one is wrong
  28: is('Grandfather'), // R is P's child, and Q is P's father
  29: (_, v) => {
    const steps = [2, 3, 4, -2, -3, -4]
    return shift('TEMPLE', (i) => steps[i]) === 'VHQNIA' && shift('CHURCH', (i) => steps[i]) === v
  },
  30: (_, v) => {
    const code = (w: string) => {
      const r = [...w].reverse().join('')
      return r[0] + shift(r.slice(1, -1), () => 1) + r.at(-1)
    }
    return code('COMPUTER') === 'RFUVQNPC' && code('STUDENTS') === v
  },
  31: (_, v) => [['DRIVER', 12], ['SMILE', 10], ['ACCIDENT', 16]].every(([w, n]) => 2 * String(w).length === n) && Number(v) === 2 * 'CAR'.length,
  32: is('5'), // the column 4, 3, 2, 1 pairs 4–2 and 3–1; the side squares 5 and 6 are opposite
  34: (_, v) => {
    const key = (ps: string[]) => ps.map((p) => [...p].sort().join('')).sort().join()
    return OPPOSITE.length === 1 && key(netPairs(NETS[v])) === key(OPPOSITE[0])
  },
  35: (_, v) => DAYS[(6 + 25) % 7] === v,
  36: (_, v) => DAYS[(5 + weekday(2025, 8, 15) - weekday(2021, 8, 15) + 7) % 7] === v,
  37: (_, v) => {
    const dirs = ['North', 'East', 'South', 'West']
    const end = [1, 1, -1].reduce((d, t) => (d + t + 4) % 4, 0)
    return dirs[end] === v
  },
  38: (_, v) => Number(nums(v)[0]) === Math.hypot(8, 11 - 5),
  43: (_, v) => [[72, 21, 3, 6, 20], [36, 40, 5, 4, 18], [48, 56, 7, 8, Number(v)]].every(([tl, tr, bl, br, m]) => tl / br + tr / bl + 1 === m),
  45: (_, v) => [[8, 12, 5, 7, 16], [3, 5, 3, 2, 81], [9, 7, 6, Number(v), 36]].every(([t, l, r, b, m]) => (l * r - t * b) ** 2 === m),
  46: (_, v) => [[2, 2, 3, 3, 1], [2, 8, 4, 64, 3], [6, 36, 7, 49, Number(v)]].every(([tl, tr, bl, br, m]) => tl ** m === tr && bl ** m === br),
  47: odd((o) => [...o.replace(/ /g, '')].reduce((s, c) => s + place(c), 0) === 34),
  48: odd((o) => {
    const [a, b, c] = o.split(' ')
    return shift(a, () => 4) === b && shift(b, () => -8) === c
  }),
  49: odd((o) => {
    const [a, b, c] = nums(o)
    return Math.sqrt(b) * a * a === c
  }),
  50: (q, v) => {
    // Your left is the clockwise way round, one place: right(x, -1).
    const truth: Record<Key, boolean> = { A: right('B', -1) === 'E', B: between('A', 'B', 'D'), C: right('E', -1) === 'D', D: between('C', 'A', 'B') }
    return truth[(Object.keys(q.options) as Key[]).find((k) => q.options[k] === v)!]
  },
  51: (_, v) => {
    const [n, dir, who] = [Number({ Second: 2, Fourth: 4, Third: 3, Immediately: 1 }[v.split(' ')[0]]), v.includes('left') ? -1 : 1, v.match(/'(\w)'/)![1]]
    return right(who, n * dir) === 'A'
  },
  52: (_, v) => {
    const [a, b] = v.split(' and ')
    return between('E', a, b)
  },
  53: (_, v) => Number(v) === 1 / (1 / 6 + 1 / 12),
  54: (_, v) => {
    const [w, a, b] = nums(v).concat([0, 1])
    return Math.abs(w + a / b - 100 / 12) < 1e-9
  },
  55: (q, v) => {
    const kmh = (o: string) => {
      const n = nums(o)[0]
      return o.includes('second') ? n * 3.6 : o.includes('minute') ? (n * 60) / 1000 : o.includes('km') ? n : n / 1000
    }
    return Object.values(q.options).every((o) => kmh(o) <= kmh(v))
  },
  59: (_, v) => Number(nums(v)[0]) === Math.abs(50 * 6 - (6 * 30 + 50 * 0.5)),
  60: (_, v) => Number(v.replace('°', '')) === 10 * 0.5,
  61: (_, v) => Number(v) === (24 * 11) / 12, // the hands meet 11 times every 12 hours
  62: (q, v) => {
    const s = seq(q)
    return Number(v) === range(1, s.length - 2).filter((i) => !isOdd(s[i]) && isOdd(s[i - 1]) && isOdd(s[i + 1])).length
  },
  63: (q, v) => {
    const s = seq(q)
    return Number(v) === range(1, s.length - 1).filter((i) => s[i] === 2 && isPrime(s[i - 1])).length
  },
  64: (q, v) => {
    const s = seq(q)
    return Number(v) === range(1, s.length - 1).filter((i) => Math.abs(s[i] - s[i - 1]) === 3).length
  },
  65: (q, v) => Number(v) === seq(q)[7 + 3],
  68: (_, v) => nums(v)[0] === (50 / 2 + 5) / 2 - 5,
  69: (_, v) => 2 * nums(v)[0] - 4 === 28,
  72: boxes('lmmnoopqqrss'),
  73: boxes('abbbbaacccca'),
  74: boxes('aaabacadae'),
  78: (_, v) => Number(v) === sum((s) => s === 'C'),
  79: (_, v) => Number(v) === sum((s) => s.includes('R') || s.includes('T')),
  80: (_, v) => Number(v) === sum((s) => !s.includes('T')),
  81: is('Only II is correct'),
  82: is('Both I and II are correct'),
}
RULES[12] = RULES[11]
RULES[14] = RULES[13]

/** Picture questions (and Q44, whose rule gives no option), solved by eye from the rendered pages. */
const BY_EYE: Record<number, Key> = {
  33: 'B', 39: 'B', 40: 'D', 41: 'A', 42: 'C', 44: 'C',
  56: 'B', 57: 'A', 58: 'C', 66: 'C', 67: 'B', 70: 'C', 71: 'D',
  75: 'B', 76: 'C', 77: 'B', 83: 'A', 84: 'D', 85: 'B', 86: 'C', 87: 'D', 88: 'B', 89: 'C', 90: 'A',
}
/** Questions hidden from students, and why their answer isn't certain (see each one's note). */
const UNSURE = new Set([42, 44, 75])

if (SEATINGS.length !== 1) console.log(`✗ Q50-52: ${SEATINGS.length} seatings fit the clues, not 1`), process.exit(1)
process.exit(runPaper('Karnataka MAT 2022-23', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
