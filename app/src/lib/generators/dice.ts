import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, PatternId, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Numbers in opposite faces (Chapter 11). Either two or three drawings of the same dice are shown
 * and the question asks which face is opposite a given one, or an open dice (a cube net) is shown
 * and the same is asked of the folded cube. Only questions a Class 8 student can settle with the
 * chapter's rules are made: "faces seen together are never opposite", "turn about a face both views
 * share", and "in a straight line of squares, the 1st and 3rd are opposite".
 */

/** A dice in one position: the label on each side, as it sits. */
interface Pose {
  U: string
  D: string
  F: string
  B: string
  L: string
  R: string
}
/** A drawn dice shows its top, its front (drawn on the left) and its right. */
export type View = [top: string, left: string, right: string]

// Turning a dice a quarter turn: tipping it forward, or spinning it on the table.
const tip = (p: Pose): Pose => ({ U: p.B, F: p.U, D: p.F, B: p.D, L: p.L, R: p.R })
const spin = (p: Pose): Pose => ({ U: p.U, D: p.D, F: p.R, R: p.B, B: p.L, L: p.F })
const roll = (p: Pose): Pose => ({ U: p.L, R: p.U, D: p.R, L: p.D, F: p.F, B: p.B })

/** All 24 positions of a dice. */
function poses(p: Pose): Pose[] {
  const out: Pose[] = []
  // Bring each side to the top (4 by tipping, 2 by rolling), then spin 4 ways.
  const tops = [p, tip(p), tip(tip(p)), tip(tip(tip(p))), roll(p), roll(roll(roll(p)))]
  for (const t of tops) {
    let s = t
    for (let i = 0; i < 4; i++) {
      out.push(s)
      s = spin(s)
    }
  }
  return out
}
const viewOf = (p: Pose): View => [p.U, p.F, p.R]
const sameView = (a: View, b: View) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
const opposite = (p: Pose, x: string) => {
  const pairs: [keyof Pose, keyof Pose][] = [['U', 'D'], ['F', 'B'], ['L', 'R']]
  for (const [a, b] of pairs) {
    if (p[a] === x) return p[b]
    if (p[b] === x) return p[a]
  }
  throw new Error(`no face ${x}`)
}

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs]
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((q) => [x, ...q]))
}
/** Every dice carrying these six labels that can be turned to show each of the views. */
function diceShowing(labels: string[], views: View[]): Pose[] {
  const out: Pose[] = []
  for (const [U, D, F, B, L, R] of permutations(labels)) {
    const p = { U, D, F, B, L, R }
    const all = poses(p).map(viewOf)
    if (views.every((v) => all.some((w) => sameView(v, w)))) out.push(p)
  }
  return out
}

// --- Drawing ----------------------------------------------------------------------------------
/** One dice drawn in a 100-wide slot starting at x0: its outline, and the three labels. */
function drawDice(x0: number, [t, l, r]: View, size: number): { lines: [number, number, number, number][]; items: FigItem[] } {
  const c = x0 + 50
  const P = { top: [c, 12], ul: [c - 36, 31], ur: [c + 36, 31], mid: [c, 50], bl: [c - 36, 74], br: [c + 36, 74], bot: [c, 93] }
  const seg = (a: number[], b: number[]): [number, number, number, number] => [a[0], a[1], b[0], b[1]]
  const lines = [seg(P.top, P.ur), seg(P.ur, P.br), seg(P.br, P.bot), seg(P.bot, P.bl), seg(P.bl, P.ul), seg(P.ul, P.top), seg(P.ul, P.mid), seg(P.mid, P.ur), seg(P.mid, P.bot)]
  const text = (label: string, x: number, y: number): FigItem => ({ shape: 'text', x, y, size, label })
  return { lines, items: [text(t, c, 31), text(l, c - 18, 64), text(r, c + 18, 64)] }
}
export function drawViews(views: View[]): Drawing {
  const lines: [number, number, number, number][] = []
  const items: FigItem[] = []
  views.forEach((v, i) => {
    const d = drawDice(i * 100, v, 17)
    lines.push(...d.lines)
    items.push(...d.items)
  })
  return { w: views.length * 100, lines, items }
}

/** A net: [row, column] of each square, and the label on it. */
export type NetCell = [number, number, string]
const CELL = 24
export function drawNet(cells: NetCell[]): Drawing {
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  const x0 = 4
  const y0 = (100 - rows * CELL) / 2
  const lines: [number, number, number, number][] = []
  const items: FigItem[] = []
  for (const [r, c, label] of cells) {
    const x = x0 + c * CELL, y = y0 + r * CELL
    lines.push([x, y, x + CELL, y], [x + CELL, y, x + CELL, y + CELL], [x, y + CELL, x + CELL, y + CELL], [x, y, x, y + CELL])
    items.push({ shape: 'text', x: x + CELL / 2, y: y + CELL / 2, size: 14, label })
  }
  return { w: cols * CELL + 2 * x0, lines, items }
}

// --- Nets -------------------------------------------------------------------------------------
type Cell = [number, number]
const key = ([r, c]: Cell) => `${r},${c}`
/** Rolls a dice over the net, square by square; each square gets the side that lands on it. */
function rollOver(cells: Cell[]): Map<string, keyof Pose> | null {
  const at = new Set(cells.map(key))
  const start: Pose = { U: 'U', D: 'D', F: 'F', B: 'B', L: 'L', R: 'R' }
  const got = new Map<string, keyof Pose>([[key(cells[0]), 'D']])
  const queue: [Cell, Pose][] = [[cells[0], start]]
  // Rolling east puts the east side (R) down; west, L; south (down the page), F; north, B.
  const moves: [number, number, (p: Pose) => Pose][] = [
    [0, 1, (p) => ({ ...p, D: p.R, R: p.U, U: p.L, L: p.D })],
    [0, -1, (p) => ({ ...p, D: p.L, L: p.U, U: p.R, R: p.D })],
    [1, 0, (p) => ({ ...p, D: p.F, F: p.U, U: p.B, B: p.D })],
    [-1, 0, (p) => ({ ...p, D: p.B, B: p.U, U: p.F, F: p.D })],
  ]
  while (queue.length) {
    const [[r, c], p] = queue.shift()!
    for (const [dr, dc, f] of moves) {
      const n: Cell = [r + dr, c + dc]
      if (!at.has(key(n)) || got.has(key(n))) continue
      const q = f(p)
      got.set(key(n), q.D as keyof Pose)
      queue.push([n, q])
    }
  }
  return got.size === 6 && new Set(got.values()).size === 6 ? got : null
}

/** All cube nets (every turn and flip), found by growing 6-square shapes and rolling a dice over them. */
const NETS: Cell[][] = (() => {
  const norm = (cs: Cell[]): Cell[] => {
    const r0 = Math.min(...cs.map(([r]) => r)), c0 = Math.min(...cs.map(([, c]) => c))
    return cs.map(([r, c]): Cell => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  }
  let shapes = new Map<string, Cell[]>([['0,0', [[0, 0]]]])
  for (let n = 1; n < 6; n++) {
    const next = new Map<string, Cell[]>()
    for (const cs of shapes.values())
      for (const [r, c] of cs)
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const cell: Cell = [r + dr, c + dc]
          if (cs.some((x) => key(x) === key(cell))) continue
          const s = norm([...cs, cell])
          next.set(s.map(key).join(' '), s)
        }
    shapes = next
  }
  return [...shapes.values()].filter((cs) => rollOver(cs) !== null)
})()
export const NET_COUNT = NETS.length
/** Every net, each square labelled with the side of the dice that rolls onto it (U, D, F, B, L, R). */
export const SIDE_NETS: NetCell[][] = NETS.map((cells) => {
  const sides = rollOver(cells)!
  return cells.map(([r, c]): NetCell => [r, c, sides.get(key([r, c]))!])
})

// --- Questions --------------------------------------------------------------------------------
const LETTERS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'
function labelSet(rng: Rng): { labels: string[]; word: Text } {
  if (rng() < 0.5) return { labels: shuffle(rng, ['1', '2', '3', '4', '5', '6']), word: { en: 'number', kn: 'ಸಂಖ್ಯೆ' } }
  const s = int(rng, 0, LETTERS.length - 6)
  return { labels: shuffle(rng, LETTERS.slice(s, s + 6).split('')), word: { en: 'letter', kn: 'ಅಕ್ಷರ' } }
}

/** A random open dice with numbers or letters on it, for the dice fold page. */
export function randomNet(rng: Rng = Math.random): NetCell[] {
  const { labels } = labelSet(rng)
  return pick(rng, NETS).map(([r, c], i): NetCell => [r, c, labels[i]])
}

interface Made {
  figure: Drawing
  x: string
  answer: string
  labels: string[]
  prompt: Text
  rule: Text
  working: Text
  pattern: PatternId
}

/** The two faces after z, going clockwise round the corner the view shows (top → right → left). */
function after(v: View, z: string): [string, string] | null {
  const ring = [v[0], v[2], v[1]]
  const i = ring.indexOf(z)
  return i < 0 ? null : [ring[(i + 1) % 3], ring[(i + 2) % 3]]
}

function makeViews(rng: Rng): Made | null {
  const { labels, word } = labelSet(rng)
  const [U, D, F, B, L, R] = labels
  const dice: Pose = { U, D, F, B, L, R }
  const all = poses(dice)
  const n = rng() < 0.6 ? 2 : 3
  const views: View[] = []
  while (views.length < n) {
    const v = viewOf(pick(rng, all))
    if (!views.some((w) => sameView(w, v))) views.push(v)
  }
  const fits = diceShowing(labels, views)
  // Ways to read the answer, as the book teaches them.
  type Way = { x: string; y: string; rule: Text; working: Text }
  const ways: Way[] = []
  for (const x of labels) {
    // Seen next to four different faces: the one left over is opposite.
    const next = [...new Set(views.filter((v) => v.includes(x)).flat())].filter((s) => s !== x)
    if (next.length === 4) {
      const y = labels.find((s) => s !== x && !next.includes(s))!
      ways.push({
        x,
        y,
        rule: {
          en: `Faces seen together are never opposite. Find every face seen next to ${x}; the one never seen with it is opposite.`,
          kn: `ಒಟ್ಟಿಗೆ ಕಾಣುವ ಮುಖಗಳು ಎಂದಿಗೂ ಅಭಿಮುಖವಲ್ಲ. ${x} ಜೊತೆ ಕಾಣುವ ಎಲ್ಲಾ ಮುಖಗಳನ್ನು ಹುಡುಕಿ; ಅದರ ಜೊತೆ ಎಂದೂ ಕಾಣದ ಮುಖವೇ ಅಭಿಮುಖ.`,
        },
        working: { en: `Next to ${x}: ${next.join(', ')}. Left over: ${y}.`, kn: `${x} ಜೊತೆ: ${next.join(', ')}. ಉಳಿದದ್ದು: ${y}.` },
      })
    }
  }
  // A face z in two views, with four different faces round it: faces two apart round z are opposite.
  for (const z of labels)
    for (let i = 0; i < views.length; i++)
      for (let j = i + 1; j < views.length; j++) {
        const a = after(views[i], z), b = after(views[j], z)
        if (!a || !b || new Set([...a, ...b]).size !== 4) continue
        const ring = [a[0], a[1], b[0], b[1]]
        const pairs = `${ring[0]} ↔ ${ring[2]}, ${ring[1]} ↔ ${ring[3]}`
        for (let k = 0; k < 4; k++)
          ways.push({
            x: ring[k],
            y: ring[(k + 2) % 4],
            rule: {
              en: `${z} is in two of the views. Read each of them clockwise from ${z} (top → right → left): the four faces round ${z} come in order, and faces two apart are opposite.`,
              kn: `${z} ಎರಡು ಸ್ಥಿತಿಗಳಲ್ಲಿದೆ. ಪ್ರತಿಯೊಂದನ್ನೂ ${z} ನಿಂದ ಪ್ರದಕ್ಷಿಣೆಯಾಗಿ ಓದಿ (ಮೇಲೆ → ಬಲ → ಎಡ): ${z} ಸುತ್ತಲಿನ ನಾಲ್ಕು ಮುಖಗಳು ಕ್ರಮವಾಗಿ ಬರುತ್ತವೆ; ಒಂದನ್ನು ಬಿಟ್ಟು ಬರುವ ಮುಖಗಳು ಅಭಿಮುಖ.`,
            },
            working: { en: `Round ${z}: ${ring.join(' → ')}. So ${pairs}.`, kn: `${z} ಸುತ್ತ: ${ring.join(' → ')}. ಆದ್ದರಿಂದ ${pairs}.` },
          })
      }
  // Keep only faces every fitting dice agrees on (so there is exactly one answer).
  const sure = ways.filter((w) => fits.every((p) => opposite(p, w.x) === w.y) && views.some((v) => v.includes(w.x)))
  if (!sure.length) return null
  const w = pick(rng, sure)
  return {
    figure: drawViews(views),
    x: w.x,
    answer: w.y,
    labels,
    prompt: {
      en: `${n === 2 ? 'Two' : 'Three'} positions of the same dice are shown. Which ${word.en} is opposite to ${w.x}?`,
      kn: `ಒಂದೇ ದಾಳದ ${n} ವಿಭಿನ್ನ ಸ್ಥಿತಿಗಳನ್ನು ನೀಡಲಾಗಿದೆ. ${w.x} ಗೆ ಅಭಿಮುಖವಾಗಿರುವ ${word.kn} ಯಾವುದು?`,
    },
    rule: w.rule,
    working: w.working,
    pattern: 'dice-views',
  }
}

function makeNet(rng: Rng): Made | null {
  const { labels, word } = labelSet(rng)
  const cells = pick(rng, NETS)
  const sides = rollOver(cells)!
  const labelOf = new Map<keyof Pose, string>((['U', 'D', 'F', 'B', 'L', 'R'] as (keyof Pose)[]).map((s, i) => [s, labels[i]]))
  const net: NetCell[] = cells.map(([r, c]) => [r, c, labelOf.get(sides.get(key([r, c]))!)!])
  const where = new Map(net.map(([r, c, l]) => [l, [r, c] as Cell]))
  const has = (r: number, c: number) => net.some(([a, b]) => a === r && b === c)
  const oppSide: Record<keyof Pose, keyof Pose> = { U: 'D', D: 'U', F: 'B', B: 'F', L: 'R', R: 'L' }
  const oppOf = (l: string) => labelOf.get(oppSide[[...labelOf].find(([, v]) => v === l)![0]])!
  /** 1st and 3rd of a straight line of three squares. */
  const inLine = (a: string, b: string) => {
    const [r1, c1] = where.get(a)!, [r2, c2] = where.get(b)!
    return (r1 === r2 && Math.abs(c1 - c2) === 2 && has(r1, (c1 + c2) / 2)) || (c1 === c2 && Math.abs(r1 - r2) === 2 && has((r1 + r2) / 2, c1))
  }
  const pairs = [...new Set(labels.map((l) => [l, oppOf(l)].sort().join('|')))].map((s) => s.split('|') as [string, string])
  const lined = pairs.filter(([a, b]) => inLine(a, b))
  const x = pick(rng, labels)
  const y = oppOf(x)
  const pairText = pairs.map(([a, b]) => `${a} ↔ ${b}`).join(', ')
  let rule: Text
  if (inLine(x, y))
    rule = {
      en: `In a straight line of squares, the 1st and 3rd are opposite (one square between them). ${x} and ${y} are like that.`,
      kn: `ಒಂದೇ ಸಾಲಿನ ಚೌಕಗಳಲ್ಲಿ 1ನೇ ಮತ್ತು 3ನೇ ಚೌಕಗಳು ಅಭಿಮುಖ (ನಡುವೆ ಒಂದು ಚೌಕ). ${x} ಮತ್ತು ${y} ಹಾಗೆಯೇ ಇವೆ.`,
    }
  else if (lined.length === 2)
    rule = {
      en: `In a straight line of squares, the 1st and 3rd are opposite. That gives two pairs; ${x} and ${y} are the two squares left over, so they are opposite.`,
      kn: `ಒಂದೇ ಸಾಲಿನ ಚೌಕಗಳಲ್ಲಿ 1ನೇ ಮತ್ತು 3ನೇ ಚೌಕಗಳು ಅಭಿಮುಖ. ಹೀಗೆ ಎರಡು ಜೋಡಿಗಳು ಸಿಗುತ್ತವೆ; ಉಳಿದ ${x} ಮತ್ತು ${y} ಪರಸ್ಪರ ಅಭಿಮುಖ.`,
    }
  else return null
  return {
    figure: drawNet(net),
    x,
    answer: y,
    labels,
    prompt: {
      en: `This open dice is folded into a cube. Which ${word.en} is opposite to ${x}?`,
      kn: `ಈ ತೆರೆದ ದಾಳವನ್ನು ಮಡಿಸಿ ಘನ ಮಾಡಲಾಗಿದೆ. ${x} ಗೆ ಅಭಿಮುಖವಾಗಿರುವ ${word.kn} ಯಾವುದು?`,
    },
    rule,
    working: { en: `Opposite pairs: ${pairText}.`, kn: `ಅಭಿಮುಖ ಜೋಡಿಗಳು: ${pairText}.` },
    pattern: 'dice-net',
  }
}

let counter = 0

/** A generated question. */
export function buildDice(rng: Rng): Question {
  let m: Made | null = null
  while (!m) m = rng() < 0.55 ? makeViews(rng) : makeNet(rng)
  const made = m
  // Wrong options: three of the four other faces (never the face asked about).
  const wrong = shuffle(
    rng,
    made.labels.filter((l) => l !== made.x && l !== made.answer),
  ).slice(0, 3)
  const opts = shuffle(rng, [made.answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, opts[i]])) as Record<OptionKey, string>
  return {
    id: `gen-dice-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: made.prompt.en,
    figures: { terms: [made.figure] },
    options,
    answer: OPTION_KEYS[opts.indexOf(made.answer)],
    rule: made.rule.en,
    working: made.working.en,
    pattern: made.pattern,
    generated: true,
    kn: { prompt: made.prompt.kn, rule: made.rule.kn, working: made.working.kn },
  }
}

export function generateDice(rng: Rng = Math.random): Question {
  return buildDice(rng)
}
