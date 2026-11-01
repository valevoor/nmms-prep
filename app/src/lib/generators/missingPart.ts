import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Missing Figures (not in the book; past papers ask it): a square in four quarters that repeat, with
// one quarter left blank. Either each quarter is the one before it turned a quarter turn clockwise
// (going round), or the halves are mirror images left to right and top to bottom. Lines join points
// of a 9 × 9 lattice (5 × 5 in each quarter) and never run along a quarter's edge, and a quarter may
// have one dot. The wrong options are the right piece turned or flipped, or missing or adding a line;
// a question is skipped if a wrong option would also make a figure that repeats.

type P = [number, number]
/** A straight line between two lattice points, or a dot on one ([p, p]). */
type Part = [P, P]
type Kind = 'turn' | 'mirror'

const Q = 4 // lattice points 0..4 in a quarter, 0..8 in the whole square
const DIRS: P[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
const isDot = ([a, b]: Part) => a[0] === b[0] && a[1] === b[1]
const inQuarter = (p: P) => p[0] >= 0 && p[0] <= Q && p[1] >= 0 && p[1] <= Q
/** A line along a quarter's edge would be hidden by the frame or the middle lines. */
const onEdge = ([a, b]: Part) => (a[0] === b[0] && a[0] % Q === 0) || (a[1] === b[1] && a[1] % Q === 0)

/** The half-steps a line covers (keys on the doubled lattice), or the dot's own key. */
function cover(part: Part): string[] {
  const [a, b] = part
  if (isDot(part)) return [`d${a[0]},${a[1]}`]
  const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))
  const d: P = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
  const out: string[] = []
  for (let k = 0; k < 2 * len; k++) {
    const p: P = [2 * a[0] + k * d[0], 2 * a[1] + k * d[1]]
    const q: P = [p[0] + d[0], p[1] + d[1]]
    out.push(p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]) ? `${p}-${q}` : `${q}-${p}`)
  }
  return out
}
/** What a figure looks like: the set of everything it covers, as one string. */
const look = (parts: Part[]) => [...new Set(parts.flatMap(cover))].sort().join('|')
const clashes = (part: Part, parts: Part[]) => {
  const used = new Set(parts.flatMap(cover))
  return cover(part).some((k) => used.has(k))
}

function randomLine(rng: Rng): Part {
  for (;;) {
    const a: P = [int(rng, 0, Q), int(rng, 0, Q)]
    const d = pick(rng, DIRS)
    const len = int(rng, 1, Q)
    const b: P = [a[0] + d[0] * len, a[1] + d[1] * len]
    if (inQuarter(b) && !onEdge([a, b])) return [a, b]
  }
}
const randomDot = (rng: Rng): Part => {
  const p: P = [int(rng, 1, Q - 1), int(rng, 1, Q - 1)]
  return [p, p]
}

/** One quarter: 2 to 4 parts that run over nothing else, at least two of them lines (so one may go missing). */
function makePiece(rng: Rng): Part[] {
  const n = int(rng, 2, 4)
  const out: Part[] = []
  while (out.length < n) {
    const part = out.length === 0 && n > 2 && rng() < 0.4 ? randomDot(rng) : randomLine(rng)
    if (!clashes(part, out)) out.push(part)
  }
  return out
}

const mapPart = (f: (p: P) => P) => ([a, b]: Part): Part => [f(a), f(b)]
/** Moves within a quarter (about its middle, y running down). */
const local = {
  cw: mapPart(([x, y]) => [Q - y, x]),
  ccw: mapPart(([x, y]) => [y, Q - x]),
  half: mapPart(([x, y]) => [Q - x, Q - y]),
  lr: mapPart(([x, y]) => [Q - x, y]),
  ud: mapPart(([x, y]) => [x, Q - y]),
}
/** The whole square's eight symmetries, about its middle; `moves` says which ones carry a quarter elsewhere. */
const S = 2 * Q
const WHOLE: ((p: P) => P)[] = [
  ([x, y]) => [S - y, x],
  ([x, y]) => [S - x, S - y],
  ([x, y]) => [y, S - x],
  ([x, y]) => [S - x, y],
  ([x, y]) => [x, S - y],
  ([x, y]) => [y, x],
  ([x, y]) => [S - y, S - x],
]

/** Quarters clockwise from the top left, and where each one starts. */
const CORNER: P[] = [[0, 0], [Q, 0], [Q, Q], [0, Q]]
const place = (parts: Part[], i: number) => parts.map(mapPart(([x, y]) => [x + CORNER[i][0], y + CORNER[i][1]]))
const middle = (i: number): P => [CORNER[i][0] + Q / 2, CORNER[i][1] + Q / 2]

/** Does the whole figure look the same after a symmetry that moves the quarter `gap` somewhere else? */
function repeats(parts: Part[], gap: number): boolean {
  const own = look(parts)
  return WHOLE.some((f) => {
    const m = f(middle(gap))
    return (m[0] !== middle(gap)[0] || m[1] !== middle(gap)[1]) && look(parts.map(mapPart(f))) === own
  })
}

const QUARTER: Text[] = [
  { en: 'top left', kn: 'ಮೇಲಿನ ಎಡ' },
  { en: 'top right', kn: 'ಮೇಲಿನ ಬಲ' },
  { en: 'bottom right', kn: 'ಕೆಳಗಿನ ಬಲ' },
  { en: 'bottom left', kn: 'ಕೆಳಗಿನ ಎಡ' },
]

type Wrong = 'turned' | 'flipped' | 'missing' | 'extra'
const WRONG: Record<Wrong, Text> = {
  turned: { en: 'is turned the wrong way', kn: 'ಭಾಗವನ್ನು ತಪ್ಪಾಗಿ ತಿರುಗಿಸಲಾಗಿದೆ' },
  flipped: { en: 'is flipped the wrong way', kn: 'ಭಾಗ ತಪ್ಪಾಗಿ ತಿರುವುಮುರುವಾಗಿದೆ' },
  missing: { en: 'misses a line', kn: 'ಒಂದು ರೇಖೆ ಇಲ್ಲ' },
  extra: { en: 'has an extra line', kn: 'ಒಂದು ಹೆಚ್ಚುವರಿ ರೇಖೆ ಇದೆ' },
}
const MISSING_DOT: Text = { en: 'misses the dot', kn: 'ಚುಕ್ಕೆ ಇಲ್ಲ' }

export const MISSING_PART_RULE: Record<Kind, Text> = {
  turn: {
    en: 'Going round the figure clockwise, each part is the one before it turned a quarter turn clockwise',
    kn: 'ಚಿತ್ರದ ಸುತ್ತ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಹೋದಂತೆ, ಪ್ರತಿ ಭಾಗವೂ ಹಿಂದಿನ ಭಾಗವನ್ನು ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಕಾಲು ಸುತ್ತು ತಿರುಗಿಸಿದಂತೆ ಇದೆ',
  },
  mirror: {
    en: 'The left and right halves are mirror images, and so are the top and bottom halves',
    kn: 'ಎಡ ಮತ್ತು ಬಲ ಅರ್ಧಗಳು ದರ್ಪಣ ಪ್ರತಿಬಿಂಬಗಳು, ಮೇಲಿನ ಮತ್ತು ಕೆಳಗಿನ ಅರ್ಧಗಳೂ ಹಾಗೆಯೇ',
  },
}

const lines = (parts: Part[], at: (u: number) => number) =>
  parts.filter((p) => !isDot(p)).map(([a, b]) => [at(a[0]), at(a[1]), at(b[0]), at(b[1])] as [number, number, number, number])
const dots = (parts: Part[], at: (u: number) => number, size: number): FigItem[] =>
  parts.filter(isDot).map(([a]) => ({ shape: 'dot', x: at(a[0]), y: at(a[1]), size }))

/** The whole square (lattice 0..8 across the 8..92 frame), with the gap marked '?'. */
function drawFigure(parts: Part[], gap: number): Drawing {
  const at = (u: number) => 8 + 10.5 * u
  const [mx, my] = middle(gap)
  return {
    frame: 'square',
    items: [...dots(parts, at, 6), { shape: 'text', label: '?', x: at(mx), y: at(my), size: 26 }],
    lines: [[50, 8, 50, 92], [8, 50, 92, 50], ...lines(parts, at)],
  }
}
/** One quarter on its own, filling the box. */
const drawPiece = (parts: Part[]): Drawing => {
  const at = (u: number) => 8 + 21 * u
  return { frame: 'square', items: dots(parts, at, 9), lines: lines(parts, at) }
}

let counter = 0

/** A missing-part question: a figure of four quarters with one blank, and four pieces of which exactly one fits. */
export function generateMissingPart(rng: Rng = Math.random): Question {
  for (;;) {
    const kind: Kind = rng() < 0.55 ? 'turn' : 'mirror'
    const base = makePiece(rng)
    const quarters =
      kind === 'turn'
        ? [base, base.map(local.cw), base.map(local.half), base.map(local.ccw)]
        : [base, base.map(local.lr), base.map(local.half), base.map(local.ud)]
    const gap = int(rng, 0, 3)
    const piece = quarters[gap]
    const shown = quarters.flatMap((q, i) => (i === gap ? [] : place(q, i)))
    const seen = new Set([look(piece)])
    const wrong: { parts: Part[]; kind: Wrong; dot?: boolean }[] = []
    const add = (parts: Part[], k: Wrong, dot?: boolean) => {
      if (seen.has(look(parts)) || wrong.some((w) => w.kind === k)) return
      if (repeats([...shown, ...place(parts, gap)], gap)) return // it would fit too
      seen.add(look(parts))
      wrong.push({ parts, kind: k, dot })
    }
    const tries: (() => void)[] = [
      () => add(piece.map(pick(rng, [local.cw, local.ccw, local.half])), 'turned'),
      () => add(piece.map(pick(rng, [local.lr, local.ud])), 'flipped'),
      () => {
        const i = int(rng, 0, piece.length - 1)
        add(piece.filter((_, j) => j !== i), 'missing', isDot(piece[i]))
      },
      () => {
        const extra = randomLine(rng)
        if (!clashes(extra, piece)) add([...piece, extra], 'extra')
      },
    ]
    for (let n = 0; wrong.length < 3 && n < 40; n++) pick(rng, tries)()
    if (wrong.length < 3) continue
    const chosen = shuffle(rng, wrong).slice(0, 3)
    const all = shuffle(rng, [piece, ...chosen.map((w) => w.parts)])
    const answer = OPTION_KEYS[all.indexOf(piece)]
    // Where the missing part comes from: the quarter opposite turned half round, or the one beside it flipped.
    const from = kind === 'turn' ? (gap + 2) % 4 : [1, 0, 3, 2][gap]
    const why = (l: 'en' | 'kn') =>
      chosen
        .map((w) => ({ key: OPTION_KEYS[all.indexOf(w.parts)], text: (w.dot ? MISSING_DOT : WRONG[w.kind])[l] }))
        .sort((a, b) => a.key.localeCompare(b.key))
    const working: Text = {
      en:
        (kind === 'turn'
          ? `So the missing part is the ${QUARTER[from].en} part turned half round. `
          : `So the missing part is the ${QUARTER[from].en} part flipped left to right. `) +
        `Option ${answer} matches. ` +
        why('en').map((w) => `${w.key} ${w.text}`).join(', ') + '.',
      kn:
        (kind === 'turn'
          ? `ಆದ್ದರಿಂದ ಬಿಟ್ಟುಹೋದ ಭಾಗವು ${QUARTER[from].kn} ಭಾಗವನ್ನು ಅರ್ಧ ಸುತ್ತು ತಿರುಗಿಸಿದಂತೆ ಇದೆ. `
          : `ಆದ್ದರಿಂದ ಬಿಟ್ಟುಹೋದ ಭಾಗವು ${QUARTER[from].kn} ಭಾಗದ ಎಡ-ಬಲ ದರ್ಪಣ ಪ್ರತಿಬಿಂಬ. `) +
        `ಆಯ್ಕೆ ${answer} ಹೊಂದುತ್ತದೆ. ` +
        why('kn').map((w) => `${w.key} ಯಲ್ಲಿ ${w.text}`).join(', ') + '.',
    }
    return {
      id: `gen-mfp-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      // One figure with no sentence: shown large, like a diagram, so its small parts can be seen.
      layout: 'text',
      terms: [],
      figures: {
        terms: [drawFigure(shown, gap)],
        options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, drawPiece(all[j])])) as Record<OptionKey, Drawing>,
      },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer,
      rule: MISSING_PART_RULE[kind].en,
      working: working.en,
      pattern: 'fig-missing-part',
      generated: true,
      kn: { rule: MISSING_PART_RULE[kind].kn, working: working.kn },
    }
  }
}
