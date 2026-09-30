import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both, same } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Number / Letter Pyramid (Chapter 30), on the book's three pyramids: letters a–y, numbers and
 * letters in turn, and the diamond. Two pairs of groups, "abcd : cfgh :: glmn : ?", where each group
 * is a short walk of boxes and the 2nd (and 4th) group is the 1st (and 3rd) moved by the same step,
 * or its mirror image across the middle line. A question is kept only when exactly one option is
 * explained by some move (`fitting`).
 */

export const PYRAMIDS: string[][][] = [
  ['a', 'bcd', 'efghi', 'jklmnop', 'qrstuvwxy'].map((r) => r.split('')),
  [['A'], ['1', '2', '3'], 'BCDEF'.split(''), ['4', '5', '6', '7', '8', '9', '10'], 'GHIJKLMNO'.split(''), Array.from({ length: 11 }, (_, i) => String(11 + i)), 'PQRSTUVWXYZAB'.split('')],
  [['A'], 'BCD'.split(''), 'EFGHI'.split(''), 'JKLMNOP'.split(''), 'QRSTUVWXY'.split(''), Array.from({ length: 7 }, (_, i) => String(10 + i)), ['5', '6', '7', '8', '9'], ['2', '3', '4'], ['1']],
]

/** A box: its row, and its place from the middle of that row (the box straight below has the same). */
type Cell = [number, number]
type Move = { mirror: boolean; dr: number; dc: number }

const half = (p: string[][], r: number) => ((p[r]?.length ?? 0) - 1) / 2
const at = (p: string[][], [r, c]: Cell): string | undefined => p[r]?.[c + half(p, r)]
const apply = ({ mirror, dr, dc }: Move, [r, c]: Cell): Cell => [r + dr, (mirror ? -c : c) + dc]
const cellsOf = (p: string[][], t: string): Cell[] => p.flatMap((row, r) => row.flatMap((x, i) => (x === t ? [[r, i - half(p, r)] as Cell] : [])))

/** Every way to split a group's text into boxes of the pyramid. */
function readings(p: string[][], s: string): Cell[][] {
  if (!s) return [[]]
  const out: Cell[][] = []
  for (let n = 1; n <= Math.min(2, s.length); n++)
    for (const cell of cellsOf(p, s.slice(0, n))) for (const rest of readings(p, s.slice(n))) out.push([cell, ...rest])
  return out
}

const MOVES: Move[] = []
for (const mirror of [false, true]) for (let dr = -8; dr <= 8; dr++) for (let dc = -8; dc <= 8; dc++) MOVES.push({ mirror, dr, dc })

const becomes = (p: string[][], m: Move, from: string, to: string) => readings(p, from).some((cs) => cs.map((c) => at(p, apply(m, c)) ?? '#').join('') === to)

/** The options that some move explains: 1st → 2nd and 3rd → 4th, or 1st → 3rd and 2nd → 4th. */
export function fitting(p: string[][], terms: string[], options: string[]): string[] {
  return options.filter((v) => {
    const [a, b, c, d] = terms.map((t) => (t === '?' ? v : t))
    return MOVES.some((m) => (becomes(p, m, a, b) && becomes(p, m, c, d)) || (becomes(p, m, a, c) && becomes(p, m, b, d)))
  })
}

/** Neighbouring boxes: beside it in its row, or in the rows above and below. */
const NEAR: Cell[] = [[0, -1], [0, 1], [1, -1], [1, 0], [1, 1], [-1, -1], [-1, 0], [-1, 1]]

/** A walk of n different boxes, each next to the one before, all holding tokens found only once. */
function walk(rng: Rng, p: string[][], n: number, once: (t: string) => boolean): Cell[] | null {
  const r0 = int(rng, 0, p.length - 1)
  const out: Cell[] = [[r0, int(rng, 0, p[r0].length - 1) - half(p, r0)]]
  while (out.length < n) {
    const [r, c] = out[out.length - 1]
    const next = shuffle(rng, NEAR)
      .map(([a, b]) => [r + a, c + b] as Cell)
      .find((x) => at(p, x) !== undefined && once(at(p, x)!) && !out.some((y) => y[0] === x[0] && y[1] === x[1]))
    if (!next) return null
    out.push(next)
  }
  return out
}

let counter = 0

/** A generated question. */
export function generatePyramid(rng: Rng = Math.random): Question {
  for (;;) {
    const kind = int(rng, 0, 2)
    const p = PYRAMIDS[kind]
    const counts = new Map<string, number>()
    for (const t of p.flat()) counts.set(t, (counts.get(t) ?? 0) + 1)
    const once = (t: string) => counts.get(t) === 1
    const mirror = rng() < 0.35
    const move: Move = mirror ? { mirror, dr: 0, dc: 0 } : { mirror, dr: pick(rng, [-2, -1, 0, 1, 1, 2]), dc: pick(rng, [-1, 0, 0, 1]) }
    if (!move.mirror && !move.dr && !move.dc) continue
    const n = int(rng, 3, 4)
    const text = (cs: Cell[]) => cs.map((c) => at(p, c)).join('')
    const moved = (cs: Cell[]) => cs.map((c) => apply(move, c))
    const valid = (cs: Cell[]) => cs.every((c) => at(p, c) !== undefined && once(at(p, c)!))
    const a = walk(rng, p, n, once)
    const c = walk(rng, p, n, once)
    if (!a || !c || !valid(moved(a)) || !valid(moved(c))) continue
    const groups = [a, moved(a), c, moved(c)].map(text)
    if (new Set(groups).size < 4) continue
    // Each group must read only one way (e.g. "115" could be 1, 15 or 11, 5).
    if (groups.some((g) => readings(p, g).length !== 1)) continue

    const blank = rng() < 0.8 ? 3 : 1
    const answer = groups[blank]
    const source = blank === 3 ? c : a
    const cands = new Set<string>()
    const other = (m: Move) => {
      const cs = source.map((x) => apply(m, x))
      if (valid(cs)) cands.add(text(cs))
    }
    for (const d of [-1, 1]) {
      other({ ...move, dr: move.dr + d })
      other({ ...move, dc: move.dc + d })
    }
    other({ mirror: !move.mirror, dr: move.dr, dc: move.dc })
    const tokens = moved(source).map((x) => at(p, x)!)
    for (let i = 0; i + 1 < tokens.length; i++) {
      const t = [...tokens]
      ;[t[i], t[i + 1]] = [t[i + 1], t[i]]
      cands.add(t.join(''))
    }
    cands.add([...tokens].reverse().join(''))
    // No option may repeat a group already in the question.
    for (const g of groups) cands.delete(g)
    const wrong = shuffle(rng, [...cands]).slice(0, 3)
    if (wrong.length < 3) continue
    const opts = shuffle(rng, [answer, ...wrong])
    const terms = groups.map((g, i) => (i === blank ? '?' : g))
    const fit = fitting(p, terms, opts)
    if (fit.length !== 1 || fit[0] !== answer) continue

    const pairs = (from: Cell[]) => from.map((x) => `${at(p, x)} ${move.mirror ? '↔' : '→'} ${at(p, apply(move, x))}`).join(', ')
    const working = same(blank === 3 ? `${pairs(a)}; so ${pairs(c)}` : `${pairs(c)}; so ${pairs(a)}`)
    // "so" is the only word in the working: give it in Kannada too.
    const workingKn = working.kn.replace('; so ', '; ಆದ್ದರಿಂದ ')
    const rule = both((g) => (move.mirror ? g.pyMirror : g.pyShift(move.dr, move.dc, kind === 0)))
    return {
      id: `gen-py-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      terms,
      layout: 'analogy',
      pyramid: p,
      options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, opts[i]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[opts.indexOf(answer)],
      rule: rule.en,
      working: working.en,
      pattern: move.mirror ? 'py-mirror' : 'py-shift',
      generated: true,
      kn: { rule: rule.kn, working: workingKn },
    }
  }
}
