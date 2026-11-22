/**
 * Checks the model papers (data/model/<paper>.json, listed in MODEL_FILES in data/papers.ts).
 *
 * As papers: ids unique (also against the book and past papers), every question in a real section and
 * filed under a real chapter, each printed section numbered from Q1 with every number either kept or
 * listed in `dropped`, and the answer one of the options.
 *
 * Repeats: a question that is already in the book or a past paper is left out of the model paper
 * (`dropped`, naming the question it repeats). This fails if a kept question has the same terms, table
 * and options as a book, past-paper or other model question, or if a dropped one names a question from
 * a chapter the section doesn't feed.
 *
 * Answers: the paper's key is checked, not trusted. Each question students see has an independent rule;
 * exactly one option must fit it, and it must be the marked one. Hidden questions (needs-review) are
 * listed in UNSURE with the reason in their note. For "odd one out" questions on single numbers, an
 * option that is the only prime, square or cube (or the only one that isn't) must be the answer, or the
 * question has two answers (CLAUDE.md, "Odd one out").
 * Run from app/:  npx tsx ../tools/check_model.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { MODEL_FILES, PAPER_FILES } from '../app/src/data/papers'
import { isPrime, letter, place, range, series } from './pyq_check_lib.ts'
import type { Fits, Key, Q } from './pyq_check_lib.ts'

type Any = { id: string; terms: string[]; options: Record<string, string>; topic?: string | null; table?: string[][]; prompt?: string }

const problems: string[] = []
const CHAPTERS = new Set(CHAPTER_FILES.map((c) => c.id))
const known: Any[] = [...CHAPTER_FILES.flatMap((c) => (c.questions as Any[]).map((q) => ({ ...q, topic: c.id }))), ...PAPER_FILES.flatMap((p) => p.questions as Any[])]
const KNOWN_BY_ID = new Map(known.map((q) => [q.id, q]))

/** Same question: the same terms, table and prompt, and the same four options (in any order). */
const key = (q: Any) => `${q.terms.join('|')} :: ${JSON.stringify(q.table ?? null)} :: ${q.prompt ?? ''} :: ${Object.values(q.options).sort().join('|')}`

// ---- Helpers

/** a, then each next term made from the one before by step(term, i) (i from 0). */
const run = (a: number, n: number, step: (x: number, i: number) => number) => range(0, n - 1).reduce((s, i) => [...s, step(s[s.length - 1], i)], [a])
/** Two series taking turns: odd-place terms from `a`, even-place terms from `b`. */
const turns = (a: number[], b: number[]) => a.flatMap((x, i) => (i < b.length ? [x, b[i]] : [x]))
/** A block of letters repeated to length n. */
const rep = (unit: string, n: number) => [...range(0, n)].map((i) => unit[i % unit.length]).join('')
const letters = (s: string) => [...s.replace(/[^A-Za-z]/g, '')]
const nums = (s: string) => s.split(/[,\-]/).map((x) => Number(x.trim()))
const digits = (x: number | string) => String(x).split('').map(Number)
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
const isSquare = (n: number) => n >= 0 && Number.isInteger(Math.sqrt(n))
const isCube = (n: number) => Math.round(Math.cbrt(n)) ** 3 === n
const nextPrime = (n: number) => range(n + 1, 100).find(isPrime)!
const VOWELS = new Set([...'AEIOU'])
/** Steps between letters, wrapping after Z (B → A is +25). */
const steps = (s: string) => letters(s.toUpperCase()).slice(1).map((c, i) => (((place(c) - place(letters(s.toUpperCase())[i])) % 26) + 26) % 26)
const stepsAre = (want: number[]) => (o: string) => steps(o).join(',') === want.map((x) => ((x % 26) + 26) % 26).join(',')
const opposite = (a: string, b: string) => place(a) + place(b) === 27
/** Each letter moved on by shift(i) (wrapping), digits kept. */
const moved = (w: string, shift: (i: number) => number) => [...w.replace(/ /g, '')].map((c, i) => (/[A-Z]/i.test(c) ? letter(place(c) + shift(i)) : c)).join('')

/** Odd one out: the option is the only one the rule fails. */
const odd = (alike: (o: string) => boolean): Fits => (q, v) => !alike(v) && Object.values(q.options).filter((o) => o !== v).every(alike)
/** Wrong number: the option is the term that differs from the right series. */
const RIGHT: Record<string, (number | string)[]> = {}
const wrongOf = (id: string, right: (number | string)[]): Fits => ((RIGHT[id] = right), (q, v) => q.terms.filter((t, i) => String(right[i]) !== t).join(', ') === v)
/** Analogy a : b :: c : d, with the blank filled by the option. */
const rel = (r: (a: string, b: string) => boolean): Fits => (q, v) => {
  const t = q.terms.map((x) => (x === '?' ? v : x))
  return r(t[0], t[1]) && r(t[2], t[3])
}
const relN = (r: (a: number, b: number) => boolean) => rel((a, b) => r(Number(a), Number(b)))
/** Matrix rule on the table with the blank filled by the option; letters count as their place (A = 1). */
const cell = (c: string) => (/^\d+$/.test(c) ? Number(c) : place(c))
const grid = (ok: (m: number[][]) => boolean): Fits => (q, v) => ok(q.table!.map((row) => row.map((c) => cell(c === '?' ? v : c))))
const rows = (ok: (r: number[]) => boolean) => grid((m) => m.every(ok))
const cols = (ok: (c: number[]) => boolean) => grid((m) => m[0].map((_, j) => m.map((r) => r[j])).every(ok))

/** Works out an expression with brackets, × ÷ before + −. Returns NaN for anything it can't read. */
function evaluate(expr: string): number {
  const toks = expr.replace(/[[{]/g, '(').replace(/[\]}]/g, ')').match(/\d+(?:\.\d+)?|[-+−×÷*/()]|\S/g) ?? []
  let i = 0
  const atom = (): number => {
    const t = toks[i++]
    if (t === '(') {
      const v = add()
      return toks[i++] === ')' ? v : NaN
    }
    if (t === '−' || t === '-') return -atom()
    return /^\d/.test(t ?? '') ? Number(t) : NaN
  }
  const mul = (): number => {
    let v = atom()
    while (toks[i] === '×' || toks[i] === '÷' || toks[i] === '*' || toks[i] === '/') v = toks[i++] === '×' || toks[i - 1] === '*' ? v * atom() : v / atom()
    return v
  }
  const add = (): number => {
    let v = mul()
    while (toks[i] === '+' || toks[i] === '−' || toks[i] === '-') v = toks[i++] === '+' ? v + mul() : v - mul()
    return v
  }
  const v = add()
  return i === toks.length ? v : NaN
}
/** True when the statement has exactly one = (or > <) and it holds. */
function statement(s: string): boolean {
  const parts = s.split(/([=<>])/)
  if (parts.length !== 3) return false
  const [l, r] = [evaluate(parts[0]), evaluate(parts[2])]
  return parts[1] === '=' ? Math.abs(l - r) < 1e-9 : parts[1] === '<' ? l < r : l > r
}
/** Each symbol replaced by what it means, all at once (so swaps work). */
const remap = (s: string, map: Record<string, string>) => s.replace(/\d+|[^\s\d]/g, (t) => map[t] ?? t)
/** "a & b": swap the two everywhere in the statement. */
const swapPair = (s: string, pair: string) => {
  const [a, b] = pair.split(' & ')
  return remap(s, { [a]: b, [b]: a })
}

/** The letter-sum grid (section 9, Q7-8): fill each blank from a row or column total with only one blank left. */
function solveSums(table: string[][]): number[][] {
  const n = table.length - 1
  const m = table.slice(0, n).map((r) => r.slice(0, n).map((c) => (c === '?' ? NaN : place(c))))
  const rowT = table.slice(0, n).map((r) => Number(r[n]))
  const colT = table[n].slice(0, n).map(Number)
  for (let pass = 0; pass < 10; pass++)
    for (let k = 0; k < n; k++) {
      const r = m[k]
      if (r.filter(Number.isNaN).length === 1) r[r.findIndex(Number.isNaN)] = rowT[k] - sum(r.filter((x) => !Number.isNaN(x)))
      const c = m.map((row) => row[k])
      if (c.filter(Number.isNaN).length === 1) m[c.findIndex(Number.isNaN)][k] = colT[k] - sum(c.filter((x) => !Number.isNaN(x)))
    }
  return m
}

const M1 = 'UVCE CEUV VUEC ECVU'.split(' ')
const M2 = 'LANI ILAN ANIL NILA'.split(' ')
/** Section 9, Q5-6: a number pair is row, column; Matrix 1 rows/columns 1-4, Matrix 2 rows/columns 5-8. */
const pairLetter = (p: string) => {
  const [r, c] = digits(p)
  return r <= 4 ? M1[r - 1]?.[c - 1] : M2[r - 5]?.[c - 5]
}
const spells = (word: string): Fits => (_, v) => v.split(',').map((p) => pairLetter(p.trim())).join('') === word

const RULES: Record<string, Fits> = {
  // 1. Number Series
  'kbn-ns-01': series(range(1, 5).map((n) => n * n + 1)),
  'kbn-ns-02': series(run(4, 5, (x) => x + 4)),
  'kbn-ns-03': series(run(1, 7, (x, i) => x + i + 1)),
  'kbn-ns-05': series(run(9, 6, (x) => x + 7)),
  'kbn-ns-06': series(run(3, 6, (x, i) => x * 2 + i + 2)),
  'kbn-ns-08': series(run(8, 6, (x, i) => x + (i + 1) ** 2)),
  'kbn-ns-09': series(run(63, 6, (x, i) => x - (6 - i))),
  'kbn-ns-10': series(run(322, 6, (x) => x / 2 + 1)),
  'kbn-ns-11': series(run(240, 6, (x, i) => x / (5 - i))),
  'kbn-ns-12': series(turns(run(2, 5, (x, i) => x + 2 * (i + 1)), run(3, 4, (x, i) => x + 2 * i + 1))),
  'kbn-ns-13': series(range(1, 6).reverse().map((n) => n ** 3 - 1)),
  'kbn-ns-14': series([1, 3, 5, 7, 9, 11].map((n) => `${n * n + 1}/${2 * n * n + 1}`)),
  'kbn-ns-15': series(turns(run(1, 4, (x) => x * 3 + 1), run(1, 4, (x) => x * 4 + 1))),
  'kbn-ns-16': series(run(1, 6, (x, i) => x * (5 - i) + (5 - i))),
  'kbn-ns-17': series(range(0, 6).map((i) => `${6 + 7 * i}/${7 * (i + 1) ** 2}`)),
  'kbn-ns-18': series(turns(run(2, 4, (x) => x * 2 + 1), run(2, 4, (x) => x * 3 + 1))),
  'kbn-ns-19': series(run(1260, 7, (x, i) => x / 2 + 10 * (i + 1))),

  // 2. Letter Series: the full series as letters
  'kbn-ls-01': series([...rep('abbd', 10)]),
  'kbn-ls-02': series([...rep('rspu', 11)]),
  'kbn-ls-03': series([...'bcdcdedefefg']),
  'kbn-ls-04': series([...rep('lmnop', 13)]),
  'kbn-ls-05': series([...rep('pqq', 11)]),
  'kbn-ls-06': series([...rep('XXYYYYXX', 20)]),
  'kbn-ls-07': series([...rep('ab', 12)]),
  'kbn-ls-09': series([...rep('aabbcc', 18)]),
  'kbn-ls-10': series([...rep('man', 15)]),
  'kbn-ls-11': series([...rep('abadna', 20)]),
  'kbn-ls-12': series([...rep('babc', 12)]),
  'kbn-ls-13': series([...rep('lmnnml', 12)]),
  'kbn-ls-14': series([...rep('mopn', 16)]),

  // 3. Wrong number
  'kbn-wn-01': wrongOf('kbn-wn-01', run(4, 6, (x, i) => x + 9 + 2 * i)),
  'kbn-wn-02': wrongOf('kbn-wn-02', run(20, 6, (x, i) => x + (i + 1) ** 2)),
  'kbn-wn-03': wrongOf('kbn-wn-03', run(7, 6, (x, i) => x * (i + 1))),
  'kbn-wn-04': wrongOf('kbn-wn-04', run(10, 5, (x) => x * 2 - 2)),
  'kbn-wn-05': wrongOf('kbn-wn-05', run(192, 5, (x, i) => x / (4 - i))),
  'kbn-wn-06': wrongOf('kbn-wn-06', [81, 121, 169, 256].flatMap((x) => [x, Math.sqrt(x)])),
  'kbn-wn-07': wrongOf('kbn-wn-07', [2, 4, 6, 8, 10, 12].map((n) => 2 * n * n + 1)),
  'kbn-wn-08': wrongOf('kbn-wn-08', [1, 3, 5, 7, 9, 11].map((n) => 2 * n * n + 3)),
  'kbn-wn-09': wrongOf('kbn-wn-09', range(1, 6).map((n) => n ** 3 + 8)),
  'kbn-wn-10': wrongOf('kbn-wn-10', run(3, 6, (x, i) => x + 3 + i)),
  'kbn-wn-11': wrongOf('kbn-wn-11', [1, 3, 5, 7, 9].map((n) => n * n)),
  'kbn-wn-12': wrongOf('kbn-wn-12', run(126, 5, (x) => x - 28)),
  'kbn-wn-13': wrongOf('kbn-wn-13', run(5, 6, (x, i) => x + 7 + 2 * i)),
  'kbn-wn-15': wrongOf('kbn-wn-15', range(10, 6).reverse().map((n) => n * n)),
  'kbn-wn-16': odd((o) => o.split('×').map(Number).reduce((p, x) => p * x, 1) === 24),
  'kbn-wn-17': wrongOf('kbn-wn-17', run(0, 6, (x, i) => x + 3 + 2 * i)),
  'kbn-wn-18': wrongOf('kbn-wn-18', run(1, 6, (x, i) => x + 1 + 2 * i)),
  'kbn-wn-19': wrongOf('kbn-wn-19', run(5, 7, (x, i) => x * (i % 2 ? 4 : 2))),
  'kbn-wn-20': wrongOf('kbn-wn-20', run(89, 7, (x, i) => x + [-11, 9, -7, 5, -3, 1][i])),

  // 4. Odd one: numbers
  'kbn-on-01': odd((o) => isPrime(Number(o))),
  'kbn-on-02': odd((o) => isCube(Number(o))),
  'kbn-on-03': odd((o) => { const [a, b] = nums(o); return Math.sqrt(sum(digits(a))) === b }),
  'kbn-on-04': odd((o) => { const [a, b] = nums(o); return a * a - 1 === b }),
  // Hidden (two answers), but this is the paper's rule: the middle digit is the product of the outer two.
  'kbn-on-05': odd((o) => { const d = digits(o); return d[0] * d[2] === d[1] }),
  'kbn-on-06': odd((o) => isSquare(Number(o) / 3)),
  'kbn-on-07': odd((o) => isCube(Number(o) / 2)),
  'kbn-on-08': odd((o) => { const d = digits(o); return d[0] * d[2] * d[4] === d[1] * d[3] }),
  'kbn-on-09': odd((o) => { const [a, b] = nums(o); return range(1, 12).some((n) => n ** 3 - 5 === a && n * n + 5 === b) }),
  'kbn-on-10': odd((o) => { const [a, b] = nums(o); return range(1, 12).some((n) => n * n - 5 === a && n ** 3 + 5 === b) }),
  'kbn-on-11': odd((o) => { const [a, b] = nums(o); return 2 * Math.sqrt(a / 3) === b }),
  'kbn-on-12': odd((o) => isPrime(Number(o))),
  'kbn-on-13': odd((o) => { const [a, b] = nums(o); return isSquare(a) && isSquare(b) && Math.sqrt(b) === Math.sqrt(a) + 1 }),
  'kbn-on-14': odd((o) => { const [a, b] = nums(o); return a * (a - 1) === b }),
  'kbn-on-15': odd((o) => Number(o) % 19 === 0),
  'kbn-on-16': odd((o) => nums(o).every((x) => x % 19 === 0)),
  'kbn-on-17': odd((o) => isCube(Number(o)) && Math.round(Math.cbrt(Number(o))) % 2 === 1),
  'kbn-on-18': odd((o) => Number(o) % 3 === 0),
  'kbn-on-19': odd((o) => Number(o) % 2 === 1),
  'kbn-on-20': odd((o) => isSquare(Number(o)) && isCube(Number(o))),

  // 5. Odd one: letters
  'kbn-ol-01': odd(stepsAre([2, 2, 2])),
  'kbn-ol-02': odd(stepsAre([2, -1, 2])),
  'kbn-ol-03': odd(stepsAre([2, 3, 4])),
  'kbn-ol-04': odd((o) => stepsAre([1, 12, 1])(o)),
  'kbn-ol-05': odd((o) => { const l = letters(o); return opposite(l[0], l[1]) && opposite(l[2], l[3]) }),
  'kbn-ol-06': odd((o) => { const l = letters(o); return opposite(l[0], l[1]) && opposite(l[2], l[3]) }),
  'kbn-ol-07': odd((o) => { const v = letters(o).filter((c) => VOWELS.has(c)); return v.length === 4 && new Set(v).size === 4 }),
  'kbn-ol-08': odd(stepsAre([2])),
  'kbn-ol-09': odd(stepsAre([1, 1])),
  'kbn-ol-10': odd((o) => letters(o).some((c) => VOWELS.has(c))),
  'kbn-ol-11': odd((o) => !letters(o).some((c) => VOWELS.has(c))),
  'kbn-ol-12': odd((o) => { const l = letters(o); return opposite(l[0], l[3]) && place(l[2]) === place(l[1]) + 1 }),
  'kbn-ol-13': odd((o) => letters(o).some((c, _, all) => all.filter((x) => x === c).length === 3)),
  'kbn-ol-14': odd(stepsAre([1, 1])),
  'kbn-ol-15': odd((o) => o[1] === 'A'),
  'kbn-ol-16': odd((o) => { const l = letters(o); return !VOWELS.has(l[0]) && VOWELS.has(l[1]) && !VOWELS.has(l[2]) }),
  'kbn-ol-17': odd(stepsAre([3, 5, 7])),
  'kbn-ol-18': odd(stepsAre([2, 2])),
  'kbn-ol-20': odd((o) => !letters(o).some((c) => VOWELS.has(c))),

  // 6. Number analogy
  'kbn-na-01': relN((a, b) => a * a - 1 === b),
  'kbn-na-02': relN((a, b) => (a * a) / 2 === b),
  'kbn-na-03': relN((a, b) => a === (b - 1) ** 3),
  'kbn-na-04': relN((a, b) => a / 4 === b),
  'kbn-na-05': relN((a, b) => range(1, 12).some((n) => a === n ** 3 && b === (n + 1) ** 2)),
  'kbn-na-06': relN((a, b) => range(1, 20).some((n) => a === 2 * n + 1 && b === n * (n + 1))),
  'kbn-na-07': relN((a, b) => b === nextPrime(a)),
  'kbn-na-08': relN((a, b) => range(1, 12).some((n) => a === n * n - 1 && b === n ** 3 + 1)),
  'kbn-na-09': rel((a, b) => { const [p, q] = a.split('/').map(Number); return b === `${p ** 3 + p}/${q ** 3 + q}` }),
  'kbn-na-10': rel((a, b) => [...a].reverse().join('') === b),
  'kbn-na-11': relN((a, b) => b === nextPrime(a)),
  'kbn-na-12': relN((a, b) => a * a === b),
  'kbn-na-13': rel((a, b) => { const [p, q] = a.split('/').map(Number); return b === `${5 * p}/${10 * q}` }),
  'kbn-na-14': relN((a, b) => range(1, 12).some((n) => a === n ** 3 && b === (n + 1) ** 2)),
  'kbn-na-15': relN((a, b) => (a / 2) ** 2 === b),
  'kbn-na-16': relN((a, b) => a ** 3 === b),
  'kbn-na-18': relN((a, b) => a ** 3 === b),
  'kbn-na-19': relN((a, b) => a * 13 === b),

  // 7. Letter tables
  'kbn-lt-01': rel((a, b) => moved(a, () => -1) === b),
  'kbn-lt-02': rel((a, b) => moved(a, () => 4) === b),
  'kbn-lt-03': rel((a, b) => moved(a, () => 4) === b),
  'kbn-lt-04': rel((a, b) => moved(a.replace(/\d+/, ''), () => 3) + (Number(a.match(/\d+/)![0]) + 3) === b),
  'kbn-lt-06': rel((a, b) => a.split(' ').map((c) => (c === '/' ? c : String(27 - place(c)))).join(' ') === b),
  'kbn-lt-07': rel((a, b) => a.split(' ').map((c) => (c === '/' ? c : String(27 - place(c)))).join(' ') === b),
  'kbn-lt-08': rel((a, b) => moved(a, (i) => i + 1) === b),
  'kbn-lt-09': rel((a, b) => {
    const pa = [...a.matchAll(/([A-Z])(\d+)/g)]
    const pb = [...b.matchAll(/([A-Z])(\d+)/g)]
    return pa.length === 2 && pb.length === 2 && [...pa, ...pb].every((m) => place(m[1]) === Number(m[2])) && pa.every((m, i) => place(pb[i][1]) === place(m[1]) + 6)
  }),
  'kbn-lt-10': rel((a, b) => moved(a, () => 7) === b),
  'kbn-lt-11': (q, v) => { const [c, d] = v.split(' : '); return moved(q.terms[0], () => 14) === q.terms[1] && moved(c, () => 14) === d },

  // 8. Number matrices
  'kbn-nm-01': rows((r) => sum(r) === 19),
  'kbn-nm-02': rows(([a, b, c]) => b === a * a + c * c),
  'kbn-nm-03': rows(([a, b, c]) => b === a * a - c),
  'kbn-nm-04': cols(([a, b, c, d]) => a * (b + c) === d),
  'kbn-nm-05': cols(([a, b, c]) => (a * b) / 2 === c),
  'kbn-nm-06': cols(([a, b, c, d]) => a * b * c === d),
  'kbn-nm-07': rows(([a, b, c]) => (a - c) / 3 === b),
  'kbn-nm-08': cols(([a, b, c, d]) => (a + b) / d === c),
  'kbn-nm-09': rows(([a, b, c]) => b * 3 + c === a),
  'kbn-nm-10': cols(([a, b, c, d]) => d - (a * a + b * b) === c * c),
  'kbn-nm-11': cols((c) => sum(c) === 200),
  'kbn-nm-12': cols(([a, b, c, d]) => a + b + c === d),
  'kbn-nm-13': cols(([a, b, c, d]) => a * b * c === d),
  'kbn-nm-14': cols(([a, b, c, d]) => a - (b + c) === d),
  'kbn-nm-15': cols(([a, b, c, d]) => b + c + d === a),
  'kbn-nm-16': cols(([a, b, c]) => a === b * c),
  'kbn-nm-17': grid((m) => m.flat().every((x) => sum(digits(x)) === 8)),
  'kbn-nm-18': rows(([a, b, c]) => b === a * a && c === a ** 3),
  'kbn-nm-20': rows(([a, b, c]) => b === 2 * a && c === 2 * b - 1),

  // 9. Letter matrices
  'kbn-lm-01': rows(([a, b, c]) => a + b === c),
  'kbn-lm-02': rows(([a, b, c]) => a - b === c),
  'kbn-lm-03': rows(([a, b, c]) => a - b === c),
  'kbn-lm-04': rows(([a, b, c]) => b - a === c),
  'kbn-lm-05': spells('UNCLE'),
  'kbn-lm-06': spells('NAIVE'),
  'kbn-lm-07': (q, v) => letter(solveSums(q.table!)[0][1]) === v,
  'kbn-lm-08': (q, v) => { const m = solveSums(q.table!); return [m[1][0], m[2][0]].map(letter).join(', ') === v },
  'kbn-lm-09': (q, v) => {
    const cellNum = (c: string) => Number(c.slice(0, -1))
    const t = q.table!.map((r) => r.map((c) => (c === '?' ? v : c)))
    const numbersOk = range(0, 3).every((j) => cellNum(t[1][j]) === cellNum(t[0][j]) * cellNum(t[2][j]))
    const lettersOk = t.every((r) => r.map((c) => c.slice(-1)).sort().join('') === 'ABC')
    return numbersOk && lettersOk
  },
  'kbn-lm-10': grid((m) => m.every((r, i) => r[1] - r[0] === 5 + i && r[2] - r[1] === 7 + i)),
  'kbn-lm-11': rows(([a, b, c]) => b - a === 3 && c - b === 4),

  // 10. Substitution of signs
  ...Object.fromEntries(range(1, 10).map((n) => [`kbn-sg-${String(n).padStart(2, '0')}`, ((q: Q, v: string) => {
    const signs = v.split(',').map((s) => s.trim())
    let k = 0
    const s = q.terms[0].replace(/\*/g, () => signs[k++] ?? '*')
    return k === signs.length && !s.includes('*') && statement(s)
  }) as Fits])),
  'kbn-sg-11': (_, v) => statement(remap(v, { '÷': '−', '−': '÷', '4': '2', '2': '4' })),
  'kbn-sg-12': (_, v) => statement(remap(v, { '+': '×', '×': '+', '5': '3', '3': '5' })),
  'kbn-sg-13': (_, v) => statement(remap(v, { '>': '+', '<': '−', '∨': '×', '∧': '÷', '≯': '=' })),
  'kbn-sg-14': (_, v) => evaluate(remap('175 − 25 ÷ 5 + 20 × 3 + 10', { '+': '×', '×': '−', '÷': '+', '−': '÷' })) === Number(v),
  'kbn-sg-15': (_, v) => evaluate(remap('[{(17 × 12) − (4/2)} + (23 − 6)] / 0', { '+': '÷', '−': '+', '×': '−', '/': '×' })) === Number(v),
  'kbn-sg-16': (_, v) => evaluate(remap('(3 − 15 ÷ 19) × 8 + 6', { '×': '÷', '−': '×', '÷': '+', '+': '−' })) === Number(v.replace('−', '-')),
  'kbn-sg-18': (q, v) => statement(swapPair(q.terms[0], v)),
  'kbn-sg-19': (q, v) => statement(swapPair(q.terms[0], v)),
  'kbn-sg-20': (q, v) => statement(swapPair(q.terms[0], v)),
}

/** Hidden questions (needs-review), and why: each has the reason in its note. */
const UNSURE = new Set([
  'kbn-ls-08', // 6 blanks, but the right fill (adbbad) is not an option
  'kbn-ls-15', // no repeating pattern
  'kbn-on-05', // 100 is the only square, 331 the only prime
  'kbn-ol-19', // all four are opposite-letter pairs
  'kbn-na-17', // × 10 gives 110, n(n + 1) gives 132
  'kbn-na-20', // × 5 gives 30, n(n + 2) gives 48
  'kbn-lt-05', // HOUSE → QCCUL follows no rule
  'kbn-nm-19', // no rule fits the last column
  'kbn-sg-17', // the printed instruction doesn't match the options
])

const seen = new Map(known.map((q) => [key(q), q.id]))
const ids = new Set(known.map((q) => q.id))

for (const p of MODEL_FILES) {
  let ok = 0
  for (const s of p.sections) {
    const qs = p.questions.filter((q) => q.section === s.no)
    const numbers = new Map<number, string>()
    for (const q of qs) {
      if (numbers.has(q.paperNo!)) problems.push(`${p.id} section ${s.no}: Q${q.paperNo} used twice`)
      numbers.set(q.paperNo!, q.id)
    }
    const fed = new Set(qs.map((q) => q.topic))
    for (const d of s.dropped) {
      if (numbers.has(d.paperNo)) problems.push(`${p.id} section ${s.no}: Q${d.paperNo} is both kept and dropped`)
      numbers.set(d.paperNo, 'dropped')
      const twin = KNOWN_BY_ID.get(d.same)
      if (!twin) problems.push(`${p.id} section ${s.no}: dropped Q${d.paperNo} names ${d.same}, which is not a book or past-paper question`)
      else if (!fed.has(twin.topic!)) problems.push(`${p.id} section ${s.no}: dropped Q${d.paperNo} names ${d.same} (${twin.topic}), a chapter this section doesn't feed`)
    }
    const missing = range(1, Math.max(0, ...numbers.keys())).filter((n) => !numbers.has(n))
    if (missing.length) problems.push(`${p.id} section ${s.no}: no Q${missing.join(', Q')} (neither kept nor dropped)`)
    const hidden = qs.filter((q) => q.status === 'needs-review').map((q) => `Q${q.paperNo}`)
    console.log(`${p.id} section ${s.no} (${s.title} → ${[...fed].join(', ')}): ${qs.length} kept${hidden.length ? ` (${hidden.join(', ')} hidden)` : ''}, ${s.dropped.length} dropped as repeats${s.dropped.length ? ` (${s.dropped.map((d) => `Q${d.paperNo} = ${d.same}`).join(', ')})` : ''}`)
  }
  for (const q of p.questions) {
    const at = `${p.id} ${q.id}`
    if (ids.has(q.id)) problems.push(`${at}: id used twice`)
    ids.add(q.id)
    if (!p.sections.some((x) => x.no === q.section)) problems.push(`${at}: no section ${q.section}`)
    if (!CHAPTERS.has(q.topic)) problems.push(`${at}: "${q.topic}" is not a chapter`)
    if (!(q.answer in q.options)) problems.push(`${at}: answer ${q.answer} is not an option`)
    if (q.keyFrom !== 'book' && q.keyFrom !== 'solved') problems.push(`${at}: keyFrom must be "book" (the paper's key) or "solved"`)
    if (new Set(Object.values(q.options)).size !== 4) problems.push(`${at}: options are not 4 different values`)
    const twin = seen.get(key(q))
    if (twin) problems.push(`${at}: repeats ${twin}; drop it (list it in its section's "dropped")`)
    seen.set(key(q), q.id)
    const hidden = q.status === 'needs-review'
    if (UNSURE.has(q.id) !== hidden) problems.push(`${at}: ${hidden ? 'hidden, but not listed in UNSURE' : 'listed in UNSURE but not hidden'}`)
    if (hidden) {
      if (!q.note) problems.push(`${at}: hidden without a note`)
      continue
    }
    const rule = RULES[q.id]
    if (!rule) {
      problems.push(`${at}: no rule to check it against`)
      continue
    }
    const fits = (Object.keys(q.options) as Key[]).filter((k) => rule(q as unknown as Q, q.options[k]))
    if (fits.length === 1 && fits[0] === q.answer) ok++
    else problems.push(`${at}: options that fit the rule: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
    // Wrong number: the marked term is at wrongIndex, and fix is what the rule puts there.
    if (q.kind === 'wrong' && RIGHT[q.id]) {
      if (q.terms[q.wrongIndex!] !== q.options[q.answer]) problems.push(`${at}: wrongIndex ${q.wrongIndex} is not the marked term`)
      if (q.fix !== String(RIGHT[q.id][q.wrongIndex!])) problems.push(`${at}: fix ${q.fix}, but the rule gives ${RIGHT[q.id][q.wrongIndex!]}`)
    }
    // Odd one out on single numbers: no other option may stand out as the only prime, square or cube.
    if (q.layout === 'odd' && Object.values(q.options).every((o) => /^\d+$/.test(o))) {
      const props: [string, (n: number) => boolean][] = [['prime', (n) => n < 1000 && isPrime(n)], ['square', isSquare], ['cube', isCube]]
      for (const [name, has] of props) {
        const yes = (Object.keys(q.options) as Key[]).filter((k) => has(Number(q.options[k])))
        const lone = yes.length === 1 ? yes[0] : yes.length === 3 ? (Object.keys(q.options) as Key[]).find((k) => !yes.includes(k)) : undefined
        if (lone && lone !== q.answer) problems.push(`${at}: ${q.options[lone]} is the only ${yes.length === 1 ? '' : 'non-'}${name}, so it is odd too (two answers)`)
      }
    }
  }
  const shown = p.questions.filter((q) => q.status !== 'needs-review').length
  console.log(`${p.id}: ${ok} of ${shown} answers students see check out (${p.questions.length - shown} hidden)`)
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((x) => console.log(`  ${x}`))
  process.exit(1)
}
console.log('✓ Model papers check out')
