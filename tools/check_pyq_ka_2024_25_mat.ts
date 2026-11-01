/**
 * Checks every answer in the Karnataka MAT 2024-25 paper (data/pyq/ka-2024-25-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions were
 * solved by eye from the rendered pages; this checks the marked answer and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2024_25_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2024-25-mat.json' with { type: 'json' }
import { countShapes } from '../app/src/lib/shapeCount'
import type { Seg } from '../app/src/lib/shapeCount'
import { analogy, DAYS, holds, is, isPrime, letter, matrix, odd, place, range, runPaper, series, weekday, wrong } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as (Q & { pyramid?: string[][] })[]

const nums = (o: string) => o.match(/\d+/g)!.map(Number)
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)
const cell = (c: string) => (Number.isNaN(Number(c)) ? place(c) : Number(c))
const square = (n: number) => Math.round(Math.sqrt(n)) ** 2 === n
const rev = (n: number) => Number(String(n).split('').reverse().join(''))

/** Works out a statement with brackets and letters (a = 3, b = 5, c = 7, d = 11), using the usual order of operations. */
const evalSide = (s: string) =>
  Function(
    `const a = 3, b = 5, c = 7, d = 11; return (${s
      .replace(/[a-d]+/g, (t) => `(${t.split('').join('*')})`)
      .replace(/²/g, '**2')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')})`,
  )() as number
const balanced = (stmt: string) => {
  const sides = stmt.split('=')
  return sides.length === 2 && Math.abs(evalSide(sides[0]) - evalSide(sides[1])) < 1e-9
}
/** Puts the option's signs or numbers in place of each * in turn; the statement must hold. */
const fill: Fits = (q, v) => {
  const s = v.split(/,\s*|\s+/).filter(Boolean)
  let k = 0
  return balanced(q.terms[0].replace(/\*/g, () => ` ${s[k++]} `))
}
/** Swaps the two signs or numbers in the option (whole tokens), then checks the statement. */
const swap: Fits = (q, v) => {
  const [a, b] = v.split(', ')
  const toks = q.terms[0].match(/\d+\/\d+|\d+|[^\s\d]/g)!
  return balanced(toks.map((t) => (t === a ? b : t === b ? a : t)).join(' '))
}

// Q1: a parallelogram with both diagonals and a slanting line through the middle from top to bottom.
const Q1: Seg[] = [[1, 0, 9, 0], [9, 0, 8, 4], [8, 4, 0, 4], [0, 4, 1, 0], [1, 0, 8, 4], [9, 0, 0, 4], [5, 0, 4, 4]]

// Q7-9: each number and the shapes it is inside (W watermelon square, O orange triangle, A apple circle).
const PARTS: [number, string][] = [[5, 'A'], [6, 'AW'], [7, 'WO'], [8, 'W'], [9, 'AWO'], [4, 'AO'], [3, 'O']]

// Q38: the symbols seen together in the two views.
const VIEWS = [['+', '●', '⊗'], ['●', '*', '○']]
const SYMBOLS = ['*', '+', '⊗', '●', '□', '○']
const oppositeOf = (s: string) => {
  const seen = new Set(VIEWS.filter((v) => v.includes(s)).flat())
  const left = SYMBOLS.filter((x) => !seen.has(x))
  return left.length === 1 ? left[0] : undefined
}

// Q66-68: the pyramid; mirror() moves across the middle of the row, inward() one place towards it.
const PYR = questions[65].pyramid!
const where = (s: string) => {
  const r = PYR.findIndex((row) => row.includes(s))
  return [r, PYR[r].indexOf(s)]
}
const mirror = (s: string) => {
  const [r, i] = where(s)
  return PYR[r][PYR[r].length - 1 - i]
}
const inward = (s: string) => {
  const [r, i] = where(s)
  const mid = (PYR[r].length - 1) / 2
  return PYR[r][i < mid ? i + 1 : i > mid ? i - 1 : i]
}
/** The paper runs the numbers together ("13HK" is 1, 3, H, K), so each group is given split up. */
const mapped = (g: string, f: (s: string) => string) => g.split(' ').map(f).join('')

/** Q87-88: seats in order going to each person's right. */
const SEATS = (() => {
  // R at 0, T at 2, S at 4; P and Q take 1 and 3, and seat 3 is between T and S
  const fits = [['R', 'P', 'T', 'Q', 'S'], ['R', 'Q', 'T', 'P', 'S']].filter((s) => s.indexOf('Q') !== 3)
  return fits.length === 1 ? fits[0] : []
})()
const rightOf = (p: string) => SEATS[(SEATS.indexOf(p) + 1) % 5]

/** Counts the places in a series where the term and its neighbours fit. */
const count = (q: Q, ok: (a: number, b: number, c: number) => boolean) => {
  const s = q.terms.map(Number)
  return range(1, s.length - 2).filter((i) => ok(s[i - 1], s[i], s[i + 1])).length
}
const COMPASS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West']
const turn = (d: string, k: number) => COMPASS[(COMPASS.indexOf(d) + k + 8) % 8]

const RULES: Record<number, Fits> = {
  1: (_, v) => Number(v) === countShapes(Q1, 'triangle'),
  6: is('Parallelogram, Rectangle, Trapezium'), // rectangles are parallelograms; a trapezium is not one
  7: (_, v) => Number(v) === sum(PARTS.filter(([, s]) => s.includes('W')).map(([n]) => n)),
  8: (_, v) => PARTS.find(([n]) => n === 5)![1] === 'A' && v === 'People who like only apple',
  9: (_, v) => Number(v) === sum(PARTS.filter(([, s]) => s.includes('A') && !s.includes('W')).map(([n]) => n + 2)),
  10: fill,
  11: fill,
  12: (q, v) => {
    const [a, b] = v.split(', ')
    return holds(q.terms[0].split(' ').map((t) => (t === a ? b : t === b ? a : t)).join(' '))
  },
  13: swap,
  14: series(range(0, 5).map((i) => `${letter(2 + 3 * i)} ${16 - sum(range(0, i).map((k) => 5 - k))} ${letter(20 - 2 * i)}`)),
  15: series(range(0, 5).map((i) => letter(4 + 3 * i) + letter(22 - 2 * i) + letter(4 + sum(range(0, i).map((k) => 3 + k))))),
  16: series(
    (() => {
      let at = 25
      return range(1, 5).map((n) => {
        const g = range(0, n).map((k) => letter(at - k)).join('')
        at -= 2 * n - 1 // the group, then skip one letter fewer than it has
        return g
      })
    })(),
  ),
  17: (_, v) => [[3, 4, 2, 8, 2.5], [7, 5, 1, 3, Number(v)], [3, 7, 2, 2, 14.5]].every(([t, l, r, b, c]) => (t * t + l * l) / (r + b) === c),
  19: (_, v) => [[2, 6, 4], [6, 10, 20], [8, 12, Number(v)]].every(([a, c, x]) => (a * c) / 3 === x),
  20: (_, v) => {
    // each letter becomes the letters either side of it, before-after and after-before in turn
    const code = (w: string) => [...w].map((c, i) => (i % 2 ? letter(place(c) + 1) + letter(place(c) - 1) : letter(place(c) - 1) + letter(place(c) + 1))).join('')
    return code('HORSE') === 'GIPNQSTRDF' && code('TIGER') === v
  },
  21: (_, v) => {
    const code = (w: string) => [...w].map((c) => String(place(c)).split('').map(Number).reduce((s, x) => s + x)).map((n) => (n > 9 ? n - 9 : n)).join('')
    return code('MONK') === '4652' && code('RUST') === v
  },
  22: (_, v) => {
    const code: Record<string, string> = {}
    for (const [w, n] of [['BRAZIL', '654321'], ['CANADA', '748494']]) [...w].forEach((c, i) => (code[c] = n[i]))
    return [...'INDIA'].map((c) => code[c]).join('') === v
  },
  23: odd((o) => !square(Number(o))), // all are odd cubes; only 729 is also a square
  24: odd((o) => {
    const [a, b] = nums(o)
    return a * (a + 1) === b
  }),
  26: odd((o) => [...o].slice(1).map((c, i) => place(c) - place(o[i])).join() === '1,4,9'),
  27: odd((o) => rev(place(o[0]) * place(o.at(-1)!)) === nums(o)[0]),
  28: is("M is the daughter of R's sister"), // M is P's daughter and P is R's sister
  29: is('C'), // C has a son, so C is a man, and C and D are B's only children
  30: is("'P' and 'R' are couple"), // P is Q's father and Q is R's daughter
  31: (_, v) => range(1, 60).filter((s) => s + 30 + 3 === 3 * (s + 3)).map((s) => s + 30).join() === v,
  32: (_, v) => Number(v) === 2 * (10 - 3),
  33: (_, v) => range(1, 60).filter((c) => 3 * c + 6 === 2 * (c + 18)).map((c) => `${3 * c} years`).join() === v,
  34: (_, v) => DAYS[(((0 - 4 - 3) % 7) + 7) % 7] === v,
  35: (_, v) => DAYS[weekday(2024, 2, 29)] === 'Thursday' && DAYS[weekday(2028, 2, 29)] === v,
  36: (_, v) => {
    const day = (d: number) => (d - 1) % 7 // 0 = Sunday
    const sat = range(1, 31).filter((d) => day(d) === 6)
    return Number(v) === 31 - range(1, 31).filter((d) => day(d) === 0).length - [sat[1], sat[3]].length - 2
  },
  38: (_, v) => v === `●, ${oppositeOf('●')}`,
  43: (_, v) => nums(v)[0] === Math.abs(30 * 0 - 5.5 * 20),
  44: (_, v) => {
    const [h, m] = nums(v)
    return Math.abs(30 * h - 5.5 * m) === 75
  },
  45: (_, v) => {
    const shown = 10 * 60 + 30 // 7:00 a.m. to 5:30 p.m. on the clock
    const real = (shown * 60) / 63
    const t = 7 * 60 + real
    return v === `${Math.floor(t / 60) - 12}:${String(t % 60).padStart(2, '0')}`
  },
  46: series(range(0, 6).map((i) => (7 + 2 * i) * (8 + 2 * i))),
  47: series(range(0, 6).map((i) => 3 * (2 * i + 1) ** 2)),
  48: series(range(2, 6).map((n) => n ** 3 - (n - 1))),
  49: wrong(range(2, 6).map((n) => (n % 2 === 0 ? n * n + 2 : n ** 3 + 3))),
  50: wrong([31, 32, 36, 45, 61, 86]),
  51: analogy((x) => (x / 2) ** 3),
  52: analogy((x) => x ** 3 + x ** 2 + x),
  54: (_, v) => {
    const steps = [2, 3, 5]
    const code = (w: string) => [...w].map((c, i) => letter(place(c) + steps[i])).join('')
    return code('AND') === 'CQI' && code('HER') === v
  },
  55: (_, v) => [['PAPER', 224], ['COVER', Number(v)]].every(([w, n]) => 4 * sum([...(w as string)].map(place)) === n),
  66: (_, v) => mapped('1 3 H K', mirror) === '17JG' && mapped('3 9 S V', mirror) === v,
  67: (_, v) => mapped('3 F 11 S', inward) === 'DGNT' && mapped('7 L 15 Y', inward) === v,
  68: (_, v) => mapped('A N 15', mirror) === 'CO11' && mapped('3 T W', mirror) === v,
  75: matrix((m) => new Set(m.map(sum)).size === 1),
  76: matrix((m) => [0, 1].every((r) => m[r + 1][0] - m[r][0] === 3 && m[r + 1][1] - m[r][1] === 7 && m[r + 1][2] - m[r][2] === -3)),
  77: matrix((m) => m.every(([a, b, c]) => 3 * a + 2 * c === b)),
  78: matrix((m) => m.every(([a, b, c]) => a - b === c), place),
  79: matrix((m) => m.every((r) => [...r].sort((x, y) => x - y).every((x, i, s) => i === 0 || x === s[i - 1] + 1)), place),
  80: matrix((m) => m.every(([, b, c]) => b + 3 === c), cell),
  81: (q, v) => Number(v) === count(q, (a, b, c) => a % 2 === 1 && isPrime(b) && c % 2 === 1),
  82: (q, v) => Number(v) === q.terms.filter((c, i) => (i + 1) % 3 === 0 && 'AEIOU'.includes(c)).length,
  83: (_, v) => {
    const north = 12 - 16
    const east = 5 - 5
    return east === 0 && v === `${Math.abs(north)} km towards ${north < 0 ? 'South' : 'North'}`
  },
  84: (_, v) => {
    const k = (COMPASS.indexOf('North') - COMPASS.indexOf('South-West') + 8) % 8 // turns of 45°, clockwise
    const m = v.match(/^(.*) becomes (.*)$/)!
    return turn(m[1], k) !== m[2]
  },
  85: is('South'), // the evening shadow points east, on Mahesh's left
  86: (_, v) => {
    // E 1st, A 2nd, B three places to the right of A
    const row = ['E', 'A', '', '', '']
    row[1 + 3] = 'B'
    return row[0 + 4] === v
  },
  87: (_, v) => rightOf('R') === v,
  88: (_, v) => {
    // the short way round from R to P passes one person
    const i = SEATS.indexOf('R')
    const j = SEATS.indexOf('P')
    const between = (j - i + 5) % 5 === 3 ? SEATS[(i + 4) % 5] : ''
    return between === v
  },
  89: is('I is correct and II is wrong'), // the soldiers are brave; soldiers needn't all be ministers
  90: is('I is wrong and II is correct'), // no car can be a book; the cars are some of the computers
}

/** Picture questions (and the doubtful Q18, Q25, Q53), solved by eye from the rendered pages. */
const BY_EYE: Record<number, Key> = {
  2: 'B', 3: 'C', 4: 'B', 5: 'D', 18: 'A', 25: 'A', 37: 'D', 39: 'A', 40: 'A', 41: 'A', 42: 'A', 53: 'A', 56: 'C', 57: 'A', 58: 'C',
  59: 'C', 60: 'B', 61: 'C', 62: 'B', 63: 'D', 64: 'A', 65: 'B', 69: 'B', 70: 'A', 71: 'D', 72: 'C', 73: 'B', 74: 'D',
}
/** Questions hidden from students, and why their answer isn't certain (see each one's note). */
const UNSURE = new Set([2, 18, 25, 53, 61, 62])

process.exit(runPaper('Karnataka MAT 2024-25', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
