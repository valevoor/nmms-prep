/**
 * Checks every answer in the Karnataka MAT 2023-24 paper (data/pyq/ka-2023-24-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions were
 * solved by eye from the rendered pages; this checks the marked answer and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2023_24_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2023-24-mat.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { Seg } from '../app/src/lib/shapeCount'
import { analogy, DAYS, holds, is, isPrime, matrix, odd, place, range, runPaper, series, shift, weekday, wrong } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as (Q & { pyramid?: string[][] })[]

const nums = (o: string) => o.match(/\d+/g)!.map(Number)
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)
const cell = (c: string) => (Number.isNaN(Number(c)) ? place(c) : Number(c))
const cube = (n: number) => Math.round(Math.cbrt(n)) ** 3 === n

/** Works out a statement with brackets, using the usual order of operations. */
const evalSide = (s: string) => Function(`return (${s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\[/g, '(').replace(/\]/g, ')')})`)() as number
/** Puts the option's signs in place of each * in turn; exactly one "=" must make both sides equal. */
const signs: Fits = (q, v) => {
  const s = v.split(',').map((x) => x.trim())
  let k = 0
  const stmt = q.terms[0].replace(/\*/g, () => ` ${s[k++]} `)
  const sides = stmt.split('=')
  return sides.length === 2 && Math.abs(evalSide(sides[0]) - evalSide(sides[1])) < 1e-9
}
/** Swaps the two numbers or signs in the option, then checks the statement. */
const swap: Fits = (q, v) => {
  const [a, b] = v.split(' & ')
  return holds(q.terms[0].split(' ').map((t) => (t === a ? b : t === b ? a : t)).join(' '))
}

// Q26-28: the symbol the same distance from the middle on the other side of its row.
const PYR = questions[25].pyramid!
const mirror = (s: string) => {
  const r = PYR.findIndex((row) => row.includes(s))
  const i = PYR[r].indexOf(s)
  return PYR[r][PYR[r].length - 1 - i]
}
const tokens = (s: string) => s.match(/[a-z]|\d+/g)!
const mirrored = (g: string) => tokens(g).map(mirror).join('')

// Q29: a diamond with three lines across it and two long diagonals (y down).
const Q29: Seg[] = [[0, 1, 10, 1], [0, 5, 10, 5], [0, 9, 10, 9], [0, 1, 10, 9], [10, 1, 0, 9], [5, 0, 0, 5], [5, 0, 10, 5], [0, 5, 5, 10], [10, 5, 5, 10]]
// Q31: the four option figures, typed in as straight lines.
const box = (x0: number, y0: number, x1: number, y1: number): Seg[] => [[x0, y0, x1, y0], [x0, y1, x1, y1], [x0, y0, x0, y1], [x1, y0, x1, y1]]
const Q31: Record<string, Seg[]> = {
  A: [...box(0, 0, 12, 3), [3, 0, 3, 1], [0, 1, 3, 1], [9, 0, 9, 1], [9, 1, 12, 1], [4, 1, 8, 1], [4, 1, 4, 2], [8, 1, 8, 2], [0, 2, 12, 2], [6, 2, 6, 3]],
  B: [...box(0, 0, 12, 4), [0, 2, 12, 2], [6, 0, 6, 4]],
  C: [...box(0, 0, 15, 4), [3, 0, 3, 1], [0, 1, 3, 1], [6, 0, 6, 1], [9, 0, 9, 1], [6, 1, 9, 1], [12, 0, 12, 1], [12, 1, 15, 1], [0, 2, 3, 2], [3, 2, 3, 4], [12, 2, 15, 2], [12, 2, 12, 4]],
  D: [...box(0, 0, 12, 4), [6, 0, 6, 1], [0, 1, 12, 1], [0, 2, 6, 2], [6, 2, 6, 4], [8, 2, 12, 2], [8, 2, 8, 4]],
}

// Q47: the symbols seen together in the three views, and each option's net. The nets are all the same
// staircase (rows of two, each one place left of the row above): a b / c d / e f, which folds into the
// opposite pairs a–f, b–c and d–e.
const VIEWS = [['*', '○', '●'], ['□', '●', '○'], ['+', '□', '−']]
const NETS: Record<string, string[]> = { A: [...'+−○●□*'], B: [...'+●○□−*'], C: [...'○*●−□+'], D: [...'□●−+○*'] }
const netFits = (n: string[]) => {
  const [a, b, c, d, e, f] = n
  return [[a, f], [b, c], [d, e]].every(([x, y]) => !VIEWS.some((v) => v.includes(x) && v.includes(y)))
}

// Q60-62: the regions of the figure, by which shapes hold them (B circle, K strip, O square, Y triangle).
const PARTS: [number, string][] = [[11, 'K'], [10, 'BK'], [16, 'B'], [1, 'BKY'], [2, 'BY'], [3, 'BKO'], [12, 'BO'], [4, 'KO'], [13, 'O'], [6, 'Y']]
const parts = (keep: (s: string) => boolean, f = (n: number) => n) => sum(PARTS.filter(([, s]) => keep(s)).map(([n]) => f(n)))

/** Q87-88: seats in order going to each person's right; E is 2 right of D, C 2 right of E, A not next to D. */
const SEATS = (() => {
  // D at 0, E at 2, C at 4; A and B take 1 and 3, and seats 1 and 4 are next to D
  const fits = [['D', 'A', 'E', 'B', 'C'], ['D', 'B', 'E', 'A', 'C']].filter((s) => ![1, 4].includes(s.indexOf('A')))
  return fits.length === 1 ? fits[0] : []
})()
const rightOf = (p: string) => SEATS[(SEATS.indexOf(p) + 1) % 5]

/** Counts the places in a digit series where the digit and its neighbours fit. */
const count = (q: Q, ok: (a: number, b: number, c: number) => boolean) => {
  const s = q.terms.map(Number)
  return range(1, s.length - 2).filter((i) => ok(s[i - 1], s[i], s[i + 1])).length
}

const RULES: Record<number, Fits> = {
  1: series([11, 30, 67, 128, 219]),
  2: series(range(1, 5).map((n) => n ** 4)),
  3: series([1, 2, 3, 4, 6, 8, 10, 16, 15, 32, 21]),
  4: wrong(range(1, 5).map((n) => n ** 3 - 1)),
  5: wrong([1, 3, 6, 11, 18, 29]),
  6: odd((o) => isPrime(Number(o))),
  7: odd((o) => {
    const [a, b] = nums(o)
    const n = Math.round(Math.sqrt(a))
    return n * (n + 1) === a && n * (n - 1) === b
  }),
  8: odd((o) => cube(sum([...o].map(place)))),
  9: odd((o) => [...o].slice(1).map((c, i) => place(c) - place(o[i])).join() === '5,4,-7'),
  10: odd((o) => place(o.at(-1)!) - place(o[0]) === 4 && nums(o)[0] === place(o[0]) + place(o.at(-1)!)),
  11: analogy((x) => sum(String(x).split('').map(Number)) ** 2),
  12: analogy((x) => 2 * x + 2),
  13: analogy((x) => x ** 3 / 2),
  14: (_, v) => {
    const steps = [3, -4, 5, -6]
    return shift('PINK', (i) => steps[i]) === 'SESE' && shift('BLUE', (i) => steps[i]) === v
  },
  15: (_, v) => (place('L') + 1) ** 2 === 169 && (place(v) + 1) ** 2 === 289,
  16: signs,
  17: signs,
  18: swap,
  19: swap,
  20: matrix((m) => m.every(([a, b, c]) => a * c + 5 === b)),
  21: matrix((m) => m.every(([a, b, c]) => (a - b) ** 3 === c)),
  22: matrix((m) => m.every(([a, b, c]) => b * b + a / 2 === c)),
  23: matrix((m) => m.every(([a, b, c]) => a * a + b === c), place),
  24: matrix((m) => [0, 1, 2].every((c) => m[0][c] === m[1][c] + m[2][c]), place),
  25: matrix((m) => m.every(([a, b, c]) => a * b === c), cell),
  26: (_, v) => mirrored('j23') === 'n35' && mirrored('k25e') === v,
  28: (_, v) => mirrored('37j27c') === '41n31g' && mirrored('j27c9') === v,
  29: (_, v) => Number(v) === countShapes(Q29, 'triangle'),
  31: (_, v) => countShapes(Q31[v], 'rectangle') === 7,
  39: is("'P' is the son of 'Q'"), // P is the brother of R, and R is the daughter of Q
  40: is("'X' is the sister of 'Y'"), // X is the father, so a man
  41: is('Uncle'), // A is the father of C and D, and B is A's brother
  42: (_, v) => 5 * sum([...'CLOCK'].map(place)) === 220 && Number(v) === 5 * sum([...'WATCH'].map(place)),
  43: (_, v) => {
    const steps = [2, -2, 3, -3, 4]
    return shift('LIGHT', (i) => steps[i]) === 'NGJEX' && shift('SOUND', (i) => steps[i]) === v
  },
  44: (_, v) => {
    const code: Record<string, string> = {}
    for (const [w, n] of [['EARTH', '12345'], ['SATURN', '624738']]) [...w].forEach((c, i) => (code[c] = n[i]))
    return [...'URANUS'].map((c) => code[c]).join('') === v
  },
  47: (_, v) => netFits(NETS[v]),
  49: (_, v) => DAYS[weekday(2021, 8, 15)] === 'Sunday' && DAYS[weekday(2025, 8, 15)] === v,
  50: (_, v) => Number(v) === [2023, 2024].map((y) => (weekday(y + 1, 1, 1) - weekday(y, 1, 1) + 7) % 7 === 2 ? 366 : 365).reduce((s, x) => s + x),
  51: (_, v) => nums(v)[0] === Math.hypot(4 + 10, 8 - 8), // north 8, east 4, south 8, east 10
  52: is('North'), // the morning shadow points west, on Raju's right, so Raju faces south
  53: (_, v) => ['North', 'East', 'South', 'West'][(((45 + 90 - 135) / 90) % 4 + 4) % 4] === v,
  56: is('Fossil fuels, Diesel, Coal'),
  57: (_, v) => [[7, 3, 2, 5, 5], [11, 4, 7, 8, 18], [9, 13, 6, 7, Number(v)]].every(([tl, tr, bl, br, m]) => (tl - br) ** 2 + (tr - bl) ** 2 === m),
  58: (_, v) => [[36, 16, 25, 9, 20], [100, 64, 81, 49, Number(v)], [196, 144, 169, 121, 52]].every((r) => sum(r.slice(0, 4).map(Math.sqrt)) + 2 === r[4]),
  59: (_, v) => [[1728, [4, 5, 3]], [2744, [5, 7, 2]], [4096, [6, Number(v), 1]]].every(([c, b]) => Math.cbrt(c as number) === sum(b as number[])),
  60: (_, v) => Number(v) === parts((s) => s === 'B'),
  61: is('Only Yakshagana, Bharathanatya and Kathak artists'), // 1 is inside the circle, the strip and the triangle
  62: (_, v) => Number(v) === parts((s) => s.includes('O'), (n) => (isPrime(n) ? 2 * n : n)),
  63: (_, v) => {
    // groups grow by one letter, skipping two letters between groups
    let at = place('D')
    const groups = range(1, 5).map((n) => {
      const g = range(at, n).map((p) => String.fromCharCode(64 + p)).join('')
      at += n + 2
      return g
    })
    return groups.slice(0, 4).join() === 'D,GH,KLM,PQRS' && groups[4] === v
  },
  64: (_, v) => {
    const first = (i: number) => 1 + [0, 3, 7, 12, 18][i]
    const last = (i: number) => 25 - [0, 4, 7, 9, 10][i]
    const t = (i: number) => `${String.fromCharCode(64 + first(i))} ${3 + 7 * i} ${String.fromCharCode(64 + last(i))}`
    return range(0, 4).map(t).join() === 'A 3 Y,D 10 U,H 17 R,M 24 P' && t(4) === v
  },
  65: (_, v) => {
    const a = [0, 2, 5, 9, 14]
    const c = [0, -4, -7, -9, -10]
    const t = (i: number) => [1 + a[i], 13 + 3 * i, 23 + c[i]].map((p) => String.fromCharCode(64 + p)).join('')
    return [0, 1, 3, 4].map(t).join() === 'AMW,CPS,JVN,OYM' && t(2) === v
  },
  72: (_, v) => nums(v)[0] === Math.abs(30 * 3 - 5.5 * 30),
  73: (_, v) => {
    const m = (23 * 60 + 40 + 4 * 60 + 30) % (24 * 60)
    const h = Math.floor(m / 60)
    return v === `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`
  },
  // the hands are opposite when 5.5 × (minutes after 12) is 180 more than a whole number of turns
  74: (_, v) => Number(v) === range(0, 20).map((k) => (180 + 360 * k) / 5.5).filter((t) => t >= 300 && t <= 420).length,
  75: (_, v) => range(1, 100).filter((x) => 3 * (x - 20) === x).join() === v,
  76: (_, v) => range(1, 20).filter((k) => 7 * k - (5 * k + 6) === 2).map((k) => 12 * k).join() === v,
  77: (_, v) => range(1, 60).filter((x) => x + 26 === 2 * (x + 2)).join() === v,
  84: is('Both I and II are wrong'), // all cars needn't be bikes, nor all bikes bicycles
  85: is('I is correct and II is wrong'), // the cuckoo-birds are peacocks; cuckoos needn't all be birds
  86: (_, v) => {
    // taller-than pairs; the middle of five has two above and two below
    const taller = [['Sneha', 'Prema'], ['Swetha', 'Sneha'], ['Prema', 'Tara'], ['Tara', 'Rekha']]
    const above = (p: string): string[] => taller.filter(([, b]) => b === p).flatMap(([a]) => [a, ...above(a)])
    return above(v).length === 2
  },
  87: (_, v) => rightOf('A') === v,
  88: (_, v) => rightOf('D') === v && rightOf(v) === 'E',
  89: (q, v) => Number(v) === count(q, (a, b, c) => a === 6 && b === 4 && c === 3),
  90: (q, v) => Number(v) === count(q, (a, b, c) => isPrime(a) && b % 2 === 0 && isPrime(c)),
}

/** Picture questions (and the doubtful Q27, Q48), solved by eye from the rendered pages. */
const BY_EYE: Record<number, Key> = {
  27: 'A', 30: 'C', 32: 'B', 33: 'D', 34: 'D', 35: 'A', 36: 'B', 37: 'C', 38: 'A', 45: 'D', 46: 'C', 48: 'B', 54: 'C', 55: 'D',
  66: 'B', 67: 'D', 68: 'B', 69: 'C', 70: 'B', 71: 'A', 78: 'B', 79: 'D', 80: 'C', 81: 'B', 82: 'C', 83: 'B',
}
/** Questions hidden from students, and why their answer isn't certain (see each one's note). */
const UNSURE = new Set([26, 27, 48, 70])

process.exit(runPaper('Karnataka MAT 2023-24', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
