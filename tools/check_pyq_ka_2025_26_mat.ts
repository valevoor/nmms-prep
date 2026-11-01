/**
 * Checks every answer in the Karnataka MAT 2025-26 paper (data/pyq/ka-2025-26-mat.json) against an
 * independent rule. The paper has no answer key, so each rule here was worked out by us; for word and
 * number questions it is applied to all four options and exactly one must fit. Picture questions were
 * solved by eye from the rendered pages; this checks the marked answer and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_pyq_ka_2025_26_mat.ts
 */
import paper from '../app/src/data/pyq/ka-2025-26-mat.json' with { type: 'json' }
import { analogy, codeOf, DAYS, is, isPrime, letter, matrix, odd, place, range, runPaper, series, weekday } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

const questions = paper.questions as (Q & { pyramid?: string[][] })[]

const nums = (o: string) => o.match(/\d+/g)!.map(Number)
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)
const square = (n: number) => Math.round(Math.sqrt(n)) ** 2 === n
const cbrt = (n: number) => Math.round(Math.cbrt(n))

/** Works out a statement with powers (10³) and brackets, using the usual order of operations. */
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3' }
const evalSide = (s: string) =>
  Function(`return (${s.replace(/([⁰¹²³])/g, (c) => `**${SUP[c]}`).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')})`)() as number
const balanced = (stmt: string) => {
  const [l, r] = stmt.split('=')
  return Math.abs(evalSide(l) - evalSide(r)) < 1e-9
}
/** Puts the option's signs or numbers in place of each * in turn; the statement must hold. */
const fill: Fits = (q, v) => {
  const s = v.split(',').map((x) => x.trim())
  let k = 0
  return balanced(q.terms[0].replace(/\*/g, () => ` ${s[k++]} `))
}

// Q4-5: the relations, read sign by sign. Each person's sex and parent, from a chain like "K ÷ L × M".
type Fam = { male: Set<string>; female: Set<string>; parent: Record<string, string>; sib: [string, string][] }
const readChain = (chain: string): Fam => {
  const t = chain.split(' ')
  const f: Fam = { male: new Set(), female: new Set(), parent: {}, sib: [] }
  for (let i = 1; i < t.length; i += 2) {
    const [a, op, b] = [t[i - 1], t[i], t[i + 1]]
    if (op === '×') f.male.add(a), f.sib.push([a, b])
    if (op === '=') f.female.add(a), f.sib.push([a, b])
    if (op === '÷') f.male.add(a), (f.parent[b] = a)
  }
  // brothers and sisters share a parent
  for (let k = 0; k < 3; k++) for (const [a, b] of f.sib) f.parent[a] ??= f.parent[b], (f.parent[b] ??= f.parent[a])
  return f
}
/** K is an uncle of N: K is a man and a brother or sister of one of N's parents. */
const uncle = (chain: string, k: string, n: string) => {
  const f = readChain(chain)
  const p = f.parent[n]
  // brothers and sisters of brothers and sisters are brothers and sisters too
  const sibs = new Set([k])
  for (let i = 0; i < 3; i++) for (const [a, b] of f.sib) if (sibs.has(a) || sibs.has(b)) sibs.add(a), sibs.add(b)
  return f.male.has(k) && !!p && p !== k && sibs.has(p)
}

// Q28-30: each number and the shapes it is inside (V volleyball circle, C cricket rectangle, H hockey triangle).
const PARTS: [number, string][] = [[5, 'C'], [7, 'VC'], [9, 'CH'], [6, 'VCH'], [4, 'V'], [3, 'VH'], [8, 'H']]

// Q64-65: the pyramid; the column of a place counts from the middle of its row.
const PYR = questions[63].pyramid!
const where = (s: string) => {
  const r = PYR.findIndex((row) => row.includes(s))
  return [r, PYR[r].indexOf(s) - (PYR[r].length - 1) / 2]
}
const at = (r: number, c: number) => PYR[r]?.[c + (PYR[r].length - 1) / 2]
const mirror = (s: string) => {
  const [r, c] = where(s)
  return at(r, -c)
}
const downRight = (s: string) => {
  const [r, c] = where(s)
  return at(r + 1, c + 1)
}
const mapped = (g: string, f: (s: string) => string | undefined) => g.split(' ').map(f).join('')

/** Q67-69: seats going to the left round the circle. */
const SEATS = (() => {
  const people = ['Rahim', 'Shankar', 'Mahima', 'Nelvin']
  const fits: string[][] = []
  const perms = (xs: string[]): string[][] => (xs.length ? xs.flatMap((x) => perms(xs.filter((y) => y !== x)).map((p) => [x, ...p])) : [[]])
  for (const p of perms(people)) {
    const s = ['Parnika', 'Anamika', ...p] // Anamika on Parnika's left
    const next = (a: string, b: string) => Math.abs(s.indexOf(a) - s.indexOf(b)) % 4 === 1 || Math.abs(s.indexOf(a) - s.indexOf(b)) === 5
    const between = (m: string, a: string, b: string) => next(m, a) && next(m, b)
    if (between('Mahima', 'Anamika', 'Nelvin') && between('Rahim', 'Parnika', 'Shankar')) fits.push(s)
  }
  return fits.length === 1 ? fits[0] : []
})()
const leftOf = (p: string) => SEATS[(SEATS.indexOf(p) + 1) % 6]
const opposite = (p: string) => SEATS[(SEATS.indexOf(p) + 3) % 6]

/** Counts the places in a series where the term and its neighbours fit. */
const count = (q: Q, ok: (a: number, b: number, c: number) => boolean) => {
  const s = q.terms.map(Number)
  return range(1, s.length - 2).filter((i) => ok(s[i - 1], s[i], s[i + 1])).length
}

/** Q89: folds the net (cells as [x, y], y down) and returns each face's opposite. */
const NET: [number, number, string][] = [[0, 0, 'a'], [1, 0, 'b'], [1, 1, 'c'], [2, 1, 'd'], [2, 2, 'e'], [3, 2, 'f']]
const OPP = (() => {
  type O = Record<'D' | 'U' | 'N' | 'S' | 'E' | 'W', string>
  const roll = (o: O, d: string): O =>
    d === 'E' ? { ...o, D: o.E, U: o.W, E: o.U, W: o.D } : d === 'W' ? { ...o, D: o.W, U: o.E, W: o.U, E: o.D } : d === 'S' ? { ...o, D: o.S, U: o.N, S: o.U, N: o.D } : { ...o, D: o.N, U: o.S, N: o.U, S: o.D }
  const start: O = { D: 'D', U: 'U', N: 'N', S: 'S', E: 'E', W: 'W' }
  const label: Record<string, string> = {}
  const seen = new Map<string, O>([['0,0', start]])
  const todo: [number, number][] = [[0, 0]]
  while (todo.length) {
    const [x, y] = todo.pop()!
    const o = seen.get(`${x},${y}`)!
    label[o.D] = NET.find(([a, b]) => a === x && b === y)![2]
    for (const [d, dx, dy] of [['E', 1, 0], ['W', -1, 0], ['S', 0, 1], ['N', 0, -1]] as const) {
      const k = `${x + dx},${y + dy}`
      if (NET.some(([a, b]) => `${a},${b}` === k) && !seen.has(k)) seen.set(k, roll(o, d)), todo.push([x + dx, y + dy])
    }
  }
  const pairs = [['D', 'U'], ['N', 'S'], ['E', 'W']].map(([a, b]) => [label[a], label[b]])
  return (f: string) => pairs.flatMap(([a, b]) => (a === f ? [b] : b === f ? [a] : []))[0]
})()
/** The faces shown on each answer cube (top, front, right). */
const CUBES: Record<string, string[]> = { A: ['b', 'a', 'd'], B: ['e', 'b', 'f'], C: ['d', 'e', 'f'], D: ['f', 'c', 'a'] }

/** Q88, Q90: the face never seen next to `f` in the views. */
const notSeenWith = (views: string[][], all: string[], f: string) => {
  const seen = new Set(views.filter((v) => v.includes(f)).flat())
  const left = all.filter((x) => !seen.has(x))
  return left.length === 1 ? left[0] : undefined
}

const RULES: Record<number, Fits> = {
  4: (_, v) => {
    const f = readChain('K ÷ L × M')
    const m = v.match(/^(\w) is (\w+) of (\w)$/)!
    const [, a, rel, b] = m
    const holds = rel === 'father' ? f.male.has(a) && f.parent[b] === a : rel === 'mother' ? f.female.has(a) && f.parent[b] === a : f.male.has(a) && f.sib.some(([x, y]) => x === a && y === b)
    return !holds
  },
  6: is('Wife'), // R is the father of S, so of P and Q too, and T is their mother
  7: series([3, 9, 19, 33, 51]),
  8: series([5, 8, 21, 80, 395]),
  9: series(range(0, 10).map((i) => (i % 2 ? 26 - 2 * (i - 1) : 5 + i))),
  13: is('I is correct and II is wrong'), // pigeons are inside hens; pigeons needn't all be crows
  14: is('Both I and II are wrong'), // rich men needn't be farmers, nor men all rich
  15: is('Both I and II are wrong'), // only some poems are stories; novels needn't be stories
  16: matrix((m) => m.every(([a, b, c]) => a / b === c), (c) => 27 - place(c)),
  17: matrix((m) => m.every(([a, b, c]) => b - a === 3 && c - b === 2), place),
  18: odd((o) => [...o.replace(/[ /]/g, '')].slice(1).map((c, i, s) => place(c) - place(i ? s[i - 1] : o[0])).join() === '3,2,3'),
  23: odd((o) => {
    const [n, x] = nums(o)
    return n ** 3 + n ** 2 === x
  }),
  24: odd((o) => /[AEIOU]/.test(o)),
  25: (_, v) => range(1, 60).filter((d) => d + 40 === 3 * (d + 10)).map((d) => d + 30).join() === v,
  26: (_, v) => v === `${(57 / 3) * 2}, ${57 / 3}`,
  27: (_, v) => range(1, 20).filter((y) => 5 * y + 30 === 50).map((y) => 2 * y + 12).join() === v,
  28: (_, v) => Number(v) === sum(PARTS.filter(([, s]) => s === 'CH').map(([n]) => n)),
  29: (_, v) => Number(v) === sum(PARTS.filter(([, s]) => s.length >= 2).map(([n]) => n)),
  30: (_, v) => Number(v) === sum(PARTS.filter(([, s]) => s.includes('V') && !s.includes('H')).map(([n]) => n + 1)),
  31: (q, v) => Number(v) === count(q, (a, b, c) => b === 7 && square(a) && square(c)),
  32: (q, v) => Number(v) === count(q, (a, b, c) => b > 2 && square(b) && isPrime(a) && isPrime(c)),
  33: (q, v) => q.terms[q.terms.length - 8 + 4] === v,
  34: fill,
  35: fill,
  36: (_, v) => {
    const [a, b] = nums(v)
    const sw = (n: number) => (n === a ? b : n === b ? a : n)
    // [2³ + ((9 − 1) × 5/4)] − 7 = 20% of 60, with each number swapped if it is one of the pair
    return sw(2) ** sw(3) + (sw(9) - sw(1)) * (sw(5) / sw(4)) - sw(7) === (20 * 60) / 100
  },
  39: (_, v) => Number(v) === 7 - 5, // ABCD, ABFE, EFCD, AGJI, HBLK, and EMND, MFCN with MN
  42: is('Doctors, Politicians, Engineers'),
  43: (_, v) => ['North', 'East', 'South', 'West'][(3 + 2 + 1) % 4] === v, // West, a half turn, then a quarter turn clockwise
  44: (_, v) => nums(v)[0] === Math.hypot(6 - 6, 5 + 7),
  45: (_, v) => {
    const giri = [-20 + 20, 30]
    const suri = [40 - 40, 60]
    const north = suri[1] - giri[1]
    return suri[0] === giri[0] && v === `${Math.abs(north)} m towards ${north > 0 ? 'North' : 'South'}`
  },
  47: (_, v) => {
    const code = (w: string) => [...w].filter((_, i) => i % 2).join('') + [...w].filter((_, i) => i % 2 === 0).reverse().join('')
    return code('BENGALURU') === 'EGLRUUANB' && code('DAVANGERE') === v
  },
  49: (_, v) => {
    const code = (w: string) => [...w].reverse().map((c, i) => (i % 2 ? letter(27 - place(c)) : String(place(c)))).join('')
    return code('PRESIDENT') === '20M5W9H5I16' && code('MINISTERS') === v
  },
  50: (_, v) => [['CARBON', 212], ['OXYGEN', Number(v)]].every(([w, n]) => 4 * sum([...(w as string)].map(place)) === n),
  51: (_, v) => {
    const steps = [-2, -3, -4, 2, 3, 4]
    const code = (w: string) => [...w].map((c, i) => letter(place(c) + steps[i])).join('')
    return code('FRUITS') === 'DOQKWW' && code('GRAPES') === v
  },
  55: matrix((m) => m.every(([a, b, c]) => 4 * a + 3 * c === b)),
  56: matrix((m) => m.every(([a, b, c]) => (a + cbrt(c)) / 2 === b && cbrt(c) ** 3 === c)),
  61: (_, v) => Number(v) === 2 * range(0, 30).filter((k) => (180 + 360 * k) / 5.5 < 720).length,
  62: (_, v) => {
    const m = 12 * 60 - (3 * 60 + 25)
    return v === `${Math.floor(m / 60)}.${m % 60}`
  },
  63: (_, v) => {
    const m = (180 + 90) / 5.5 // 5.5m − 30 × 3 = 180
    const [, whole, n, d] = nums(v)
    return whole + n / d === m && Math.abs(m - Math.floor(m) - n / d) < 1e-9
  },
  64: (_, v) => mapped('8 N 21', mirror) === '14R23' && mapped('J 13 Q', mirror) === v,
  65: (_, v) => mapped('3 G F 4', downRight) === 'G1211H' && mapped('E 10 9 F', downRight) === v,
  66: (_, v) => {
    const step = [4, 4, 4, 8]
    const move = (parts: string[]) => parts.map((p, i) => (Number.isNaN(Number(p)) ? letter(place(p) + step[i]) : String(Number(p) + step[i]))).join('')
    return move(['E', 'N', '20', '18']) === 'IR2426' && move(['2', '9', 'N', 'L']) === v
  },
  67: (_, v) => leftOf('Nelvin') === v,
  68: (_, v) => {
    const i = SEATS.indexOf('Parnika')
    const sides = [SEATS[(i + 5) % 6], SEATS[(i + 1) % 6]]
    return v === `Between '${sides[0]}' and '${sides[1]}'`
  },
  69: (_, v) => opposite('Mahima') === v,
  73: codeOf('BAT'),
  74: codeOf('NEAT'),
  75: codeOf('PAINT'),
  76: series(range(0, 5).map((i) => letter(2 + 2 * i) + letter(3 + 2 * i) + letter(5 + 4 * i))),
  77: series(range(0, 5).map((i) => letter(1 + 3 * i) + letter(15 + 3 * i) + letter(3 + 3 * i))),
  78: series([2, 5, 11, 17, 23].map(letter)),
  83: (_, v) => DAYS[weekday(2012, 1, 26)] === 'Thursday' && DAYS[(0 + (weekday(2012, 3, 10) - weekday(2012, 1, 26)) + 14) % 7] === v,
  84: (_, v) => DAYS[408 % 7] === v,
  85: (_, v) => [[12, 18, 6, 4], [14, 49, 7, 2], [18, 6, 5, Number(v)]].every(([a, b, c, d]) => (a * c) / b === d),
  86: (_, v) => [[100, 121, 64, 30], [121, 256, 196, 22], [81, 144, 100, Number(v)]].every(([t, l, r, m]) => Math.sqrt(t) * (Math.sqrt(l) - Math.sqrt(r)) === m),
  87: (_, v) => [[12, 8, 7, 6, 4], [9, 10, 2, 5, 5], [13, 8, 2, 5, Number(v)]].every(([t, l, r, b, c]) => t * b - l * r === c * c),
  88: (_, v) => v.startsWith(`(A, ${notSeenWith([['A', 'C', 'D'], ['E', 'A', 'F']], [...'ABCDEF'], 'A')})`) && v.includes('(D, E)') && v.includes('(C, F)'),
  89: (_, v) => CUBES[v].every((x) => CUBES[v].every((y) => OPP(x) !== y)),
}

/** Picture questions (and the doubtful ones), solved by eye from the rendered pages. */
const BY_EYE: Record<number, Key> = {
  1: 'D', 2: 'A', 3: 'B', 5: 'A', 10: 'B', 11: 'B', 12: 'C', 19: 'B', 20: 'B', 21: 'D', 22: 'D', 37: 'C', 38: 'A', 40: 'B', 41: 'D',
  46: 'A', 48: 'B', 52: 'B', 53: 'D', 54: 'A', 57: 'A', 58: 'C', 59: 'D', 60: 'A', 70: 'B', 71: 'A', 72: 'C', 79: 'B', 80: 'C', 81: 'D',
  82: 'D', 90: 'C',
}
/** Questions hidden from students, and why their answer isn't certain (see each one's note). */
const UNSURE = new Set([5, 22, 37, 38, 46, 48, 57, 65, 71, 82])

// Q5 and Q46 have two answers: check that both really fit, so they stay hidden for a reason.
const both = (ok: boolean, what: string) => ok || (console.log(`✗ ${what}`), process.exit(1))
both(uncle('K × L ÷ M = N', 'K', 'N') && uncle('K × L = M ÷ N', 'K', 'N'), 'Q5 should have two answers (A and C)')
both(analogy((x) => x ** 3 - x ** 2)({ terms: ['5', '?', '7', '294'] } as Q, '100') && 6 * 7 ** 2 === 294, 'Q46 should have two answers')
both(notSeenWith([['2', '5', '1'], ['1', '3', '6'], ['3', '4', '2']], [...'123456'], '2') === '6', 'Q90: 6 should be opposite 2')

process.exit(runPaper('Karnataka MAT 2025-26', questions, RULES, BY_EYE, UNSURE) ? 1 : 0)
