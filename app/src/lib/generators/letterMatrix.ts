import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { letter, place, stepLine } from './letterSeries'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Letter Matrix (Chapter 28): a 3 × 3 table of letters (sometimes with a number in each row), as in
 * the book. Three kinds:
 * - steps: every row (or column) goes forward by the same two gaps, B → D → G;
 * - places: one letter's place is made from the other two, F + E = K, C × E = O, G × 2 = N;
 * - a letter, a number and a letter in each row: the number is the first letter's place and the
 *   last letter its opposite, or the number counts the letters skipped, or it is the place (counted
 *   back from Z) of the letter between the two.
 * A question is kept only when every simple relation that holds in both complete rows (or columns)
 * and involves the blank gives the same answer (`predictions`).
 */

const LETTERS = ['a', 'b', 'c']
const transpose = <T,>(m: T[][]) => m[0].map((_, j) => m.map((r) => r[j]))
const isLetter = (s: string) => /^[A-Z]$/.test(s)
const val = (s: string) => (isLetter(s) ? place(s) : Number(s))
const mod26 = (n: number) => ((n % 26) + 26) % 26

type Sig = (v: number[]) => number | null

/**
 * The relations tried in each line of three: for positions (out, i, j), a fixed difference (round
 * the alphabet when both are letters), sum or ratio of two cells, a fixed gap between one cell and
 * the other two joined by + − × ÷, or a fixed total of all three. Each is a "signature" that must be
 * the same in every line.
 */
function signatures(kinds: boolean[]): { uses: number[]; sig: Sig }[] {
  const out: { uses: number[]; sig: Sig }[] = []
  for (let o = 0; o < 3; o++)
    for (let i = 0; i < 3; i++) {
      if (i === o) continue
      if (kinds[o] && kinds[i]) out.push({ uses: [o, i], sig: (v) => mod26(v[o] - v[i]) })
      out.push({ uses: [o, i], sig: (v) => v[o] - v[i] })
      if (i > o) out.push({ uses: [o, i], sig: (v) => v[o] + v[i] })
      out.push({ uses: [o, i], sig: (v) => v[o] / v[i] })
      for (let j = i + 1; j < 3; j++) {
        if (j === o) continue
        out.push({ uses: [o, i, j], sig: (v) => v[o] - (v[i] + v[j]) })
        out.push({ uses: [o, i, j], sig: (v) => v[o] - (v[i] - v[j]) })
        out.push({ uses: [o, i, j], sig: (v) => v[o] - (v[j] - v[i]) })
        out.push({ uses: [o, i, j], sig: (v) => v[o] - v[i] * v[j] })
        out.push({ uses: [o, i, j], sig: (v) => v[o] - v[i] / v[j] })
        out.push({ uses: [o, i, j], sig: (v) => v[o] - v[j] / v[i] })
      }
    }
  out.push({ uses: [0, 1, 2], sig: (v) => v[0] + v[1] + v[2] })
  return out
}

const same9 = (a: number | null, b: number | null) => a !== null && b !== null && Math.abs(a - b) < 1e-9

/**
 * Every value the blank at (r, c) could take under some relation that holds in both complete rows
 * (or both complete columns). Letters are tried as places 1–26, numbers as 1–200.
 */
export function predictions(table: string[][], r: number, c: number, blankIsLetter: boolean): Set<number> {
  const found = new Set<number>()
  const domain = blankIsLetter ? 26 : 200
  for (const [lines, qLine, qPos] of [
    [table, r, c],
    [transpose(table), c, r],
  ] as const) {
    const done = lines.filter((_, k) => k !== qLine)
    // Going round the alphabet only makes sense for places that hold letters in every line.
    const kinds = [0, 1, 2].map((k) => (k === qPos ? blankIsLetter : isLetter(lines[qLine][k])) && done.every((l) => isLetter(l[k])))
    const [p, q] = done.map((l) => l.map(val))
    for (const { uses, sig } of signatures(kinds)) {
      if (!uses.includes(qPos)) continue
      const s = sig(p)
      if (!same9(s, sig(q))) continue
      for (let v = 1; v <= domain; v++) {
        const l = lines[qLine].map((x, k) => (k === qPos ? v : val(x)))
        if (same9(sig(l), s)) found.add(v)
      }
    }
  }
  return found
}

interface Draft {
  pattern: PatternId
  /** The three lines, as read across (the table is these rows, or turned so they are columns). */
  lines: string[][]
  /** May the lines be turned into columns? */
  turn: boolean
  rule: (col: boolean) => Text
  /** The working for one line; `blank` is the position of the ? in it, if any. */
  work: (line: string[], blank?: number) => string
  /** Positions that may be blank. */
  blanks: number[]
  /** Tempting wrong answers (as values) for a blank at this position of this line. */
  traps: (line: string[], pos: number) => number[]
}

const named = (n: number) => `${n} = ${letter(n)}`

function steps(rng: Rng): Draft | null {
  const p = int(rng, 1, 6)
  const q = int(rng, 1, 6)
  const starts = shuffle(rng, Array.from({ length: 26 }, (_, k) => k + 1)).slice(0, 3)
  const lines = starts.map((s) => [s, s + p, s + p + q].map(letter))
  return {
    pattern: 'mx-lstep',
    lines,
    turn: true,
    rule: (col) => both((g) => g.lmStep(col, p, q) + (starts.some((s) => s + p + q > 26) ? g.wrapForward : '')),
    work: ([a, b, c], blank) => {
      if (blank === undefined) return `${a} → ${b} (+${p}) → ${c} (+${q})`
      if (blank === 0) return stepLine(b, -p)
      if (blank === 1) return stepLine(a, p)
      return stepLine(b, q)
    },
    blanks: [0, 1, 2],
    traps: (line, pos) => {
      const v = val(line[pos])
      const prev = pos === 0 ? v : val(line[pos - 1])
      return [v + 1, v - 1, v + 2, v - 2, prev + (pos === 2 ? p : q), 27 - v].map((x) => mod26(x - 1) + 1)
    },
  }
}

type Op = '+' | '−' | '×'
function places(rng: Rng): Draft | null {
  const mixed = rng() < 0.3
  const op: Op = mixed ? '×' : pick(rng, ['+', '+', '−', '−', '×'] as const)
  // Each line is [x, y, z] with z = x op y; then the cells are put in some order.
  const make = (): number[] | null => {
    if (mixed) {
      const k = int(rng, 2, 9)
      const y = int(rng, 1, Math.floor(26 / k))
      return [y, k, y * k]
    }
    if (op === '+') {
      const x = int(rng, 1, 24)
      const y = int(rng, 1, 25 - x)
      return [x, y, x + y]
    }
    if (op === '−') {
      const x = int(rng, 3, 26)
      const y = int(rng, 1, x - 1)
      return [x, y, x - y]
    }
    const x = int(rng, 2, 8)
    const y = int(rng, 2, Math.floor(26 / x))
    return x * y <= 26 ? [x, y, x * y] : null
  }
  const raw = [make(), make(), make()]
  if (raw.some((l) => !l)) return null
  const order = pick(rng, [
    [0, 1, 2],
    [0, 1, 2],
    [2, 0, 1],
    [0, 2, 1],
    [1, 2, 0],
  ])
  // Cell k of a line holds raw[order[k]]; in a mixed line raw[1] is the number.
  const cellIsLetter = (k: number) => !(mixed && order[k] === 1)
  const lines = (raw as number[][]).map((l) => order.map((o, k) => (cellIsLetter(k) ? letter(l[o]) : String(l[o]))))
  const at = (o: number) => order.indexOf(o)
  const [ix, iy, iz] = [at(0), at(1), at(2)]
  const eq = `${LETTERS[iz]} = ${LETTERS[ix]} ${op} ${LETTERS[iy]}`
  const f = (x: number, y: number) => (op === '+' ? x + y : op === '−' ? x - y : x * y)
  const num = (s: string) => String(val(s))
  return {
    pattern: 'mx-lcalc',
    lines,
    turn: true,
    rule: (col) => both((g) => g.lmPlaces + (col ? g.mxCol(eq) : g.mxRow(eq))),
    work: (line, blank) => {
      const [x, y, z] = [line[ix], line[iy], line[iz]]
      if (blank === undefined || blank === iz) {
        const v = f(val(x), val(y))
        return `${x} ${op} ${y} = ${num(x)} ${op} ${num(y)} = ${named(v)}`
      }
      const answer = val(line[blank])
      const sx = blank === ix ? '?' : num(x)
      const sy = blank === iy ? '?' : num(y)
      const lx = blank === ix ? '?' : x
      const ly = blank === iy ? '?' : y
      return `${lx} ${op} ${ly} = ${z} → ${sx} ${op} ${sy} = ${num(z)} → ? = ${cellIsLetter(blank) ? named(answer) : answer}`
    },
    blanks: [0, 1, 2],
    traps: (line, pos) => {
      const v = val(line[pos])
      const [x, y, z] = [val(line[ix]), val(line[iy]), val(line[iz])]
      const alt = pos === iz ? [x + y, x - y, y - x, x * y] : pos === ix ? [z + y, z - y, z * y] : [z + x, z - x, x - z]
      return [...alt, v + 1, v - 1, v + 2, v - 2, 27 - v]
    },
  }
}

function withNumber(rng: Rng): Draft | null {
  const kind = pick(rng, ['opp', 'skip', 'between'] as const)
  const lines: string[][] = []
  for (let n = 0; n < 3; n++) {
    if (kind === 'opp') {
      const a = int(rng, 1, 26)
      if (a === 27 - a) return null
      lines.push([letter(a), String(a), letter(27 - a)])
    } else if (kind === 'skip') {
      const a = int(rng, 1, 24)
      const k = int(rng, 1, Math.min(12, 25 - a))
      lines.push([letter(a), String(k), letter(a + k + 1)])
    } else {
      const a = int(rng, 1, 24)
      lines.push([letter(a), String(27 - (a + 1)), letter(a + 2)])
    }
  }
  const rule = both((g) => (kind === 'opp' ? g.lmOpp : kind === 'skip' ? g.lmSkip : g.lmBetween))
  return {
    pattern: 'mx-lnum',
    lines,
    turn: false,
    rule: () => rule,
    work: ([a, n, c], blank) => {
      const A = blank === 0 ? '?' : `${a} (${place(a)})`
      const C = blank === 2 ? '?' : `${c} (${place(c)})`
      if (kind === 'opp') {
        if (blank === 0) return `? = ${named(Number(n))}; 27 − ${n} = ${named(27 - Number(n))}`
        if (blank === 1) return `${a} = ${place(a)} → ? = ${place(a)}`
        if (blank === 2) return `${a} = ${place(a)}, 27 − ${place(a)} = ${named(27 - place(a))}`
        return `${a} = ${n}, 27 − ${n} = ${named(27 - Number(n))}`
      }
      if (kind === 'skip') {
        if (blank === 0) return `${C} − ${n} − 1 = ${named(place(c) - Number(n) - 1)}`
        if (blank === 2) return `${A} + ${n} + 1 = ${named(place(a) + Number(n) + 1)}`
        const d = place(c) - place(a) - 1
        return `${A} → ${C}: ${place(c)} − ${place(a)} − 1 = ${d}`
      }
      const mid = blank === 0 ? place(c) - 1 : place(a) + 1
      if (blank === 1) return `${a}, ${letter(mid)}, ${c}: ${letter(mid)} = ${mid}, 27 − ${mid} = ${27 - mid}`
      if (blank === 0) return `27 − ${n} = ${named(27 - Number(n))}, ${letter(27 - Number(n))} − 1 = ${named(26 - Number(n))}`
      if (blank === 2) return `27 − ${n} = ${named(27 - Number(n))}, ${letter(27 - Number(n))} + 1 = ${named(28 - Number(n))}`
      return `${a}, ${letter(mid)}, ${c}: ${letter(mid)} = ${mid}, 27 − ${mid} = ${n}`
    },
    blanks: [0, 1, 2, 1],
    traps: (line, pos) => {
      const v = val(line[pos])
      const [a, n, c] = line.map(val)
      if (pos === 1) return [v + 1, v - 1, v + 2, 27 - v, c - a, 27 - a, a, c, 27 - c]
      return [v + 1, v - 1, v + 2, v - 2, 27 - v, n, 27 - n]
    },
  }
}

const MAKERS = [steps, steps, places, places, places, withNumber, withNumber]
let counter = 0

/** A generated question. */
export function generateLetterMatrix(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, MAKERS)(rng)
    if (!d) continue
    const { lines } = d
    if (new Set(lines.map((l) => l.join())).size < 3) continue
    if (lines.some((l) => l.filter(isLetter).length !== new Set(l.filter(isLetter)).size)) continue
    const col = d.turn && rng() < 0.4
    const line = int(rng, 0, 2)
    const pos = pick(rng, d.blanks)
    const answerStr = lines[line][pos]
    const letterBlank = isLetter(answerStr)
    const answer = val(answerStr)
    const table = col ? transpose(lines) : lines.map((l) => [...l])
    const [r, c] = col ? [pos, line] : [line, pos]
    table[r][c] = '?'
    const pred = predictions(table, r, c, letterBlank)
    if (pred.size !== 1 || !pred.has(answer)) continue

    const ok = (v: number) => v !== answer && (letterBlank ? v >= 1 && v <= 26 : v >= 1 && v <= 99)
    const wrong = new Set<number>()
    for (const v of shuffle(rng, d.traps(lines[line], pos))) if (ok(v) && wrong.size < 3) wrong.add(v)
    for (let k = 3; wrong.size < 3; k++) for (const v of [answer + k, answer - k]) if (ok(v) && wrong.size < 3) wrong.add(v)
    const show = (v: number) => (letterBlank ? letter(v) : String(v))
    const opts = shuffle(rng, [answer, ...wrong])
    const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, show(opts[i])])) as Record<OptionKey, string>

    const working = same(lines.map((l, n) => d.work(l, n === line ? pos : undefined)).join('; '))
    const rule = d.rule(col)
    const prompt = both((g) => (letterBlank ? g.lmPrompt : g.mxPrompt))
    return {
      id: `gen-lm-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      terms: [],
      layout: 'text',
      prompt: prompt.en,
      table,
      options,
      answer: OPTION_KEYS[opts.indexOf(answer)],
      rule: rule.en,
      working: working.en,
      pattern: d.pattern,
      generated: true,
      kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn },
    }
  }
}
