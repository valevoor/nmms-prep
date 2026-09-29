import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { signature } from './figures'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Chapter 7, Paper Fold and Punch: a square sheet is folded in half once or twice, holes are
// punched through every layer, and the sheet is opened out again. Each fold, undone, mirrors the
// holes in its fold line, so every fold doubles them.

type Seg = [number, number, number, number]
/** The part of the sheet still showing: x0..x1 across, y0..y1 down (the sheet is 8..92 both ways). */
interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}
type Dir = 'left' | 'right' | 'up' | 'down'
type Pt = [number, number]

const SHEET: Box = { x0: 8, x1: 92, y0: 8, y1: 92 }
const HOLE = 7
/** How far a hole's centre stays from the folds and the edges of the folded paper. */
const MARGIN = 6

/** Where the folded paper ends up: the half on the `dir` side stays, the other half folds onto it. */
function fold(b: Box, dir: Dir): { box: Box; line: 'x' | 'y'; at: number } {
  const mx = (b.x0 + b.x1) / 2, my = (b.y0 + b.y1) / 2
  if (dir === 'left') return { box: { ...b, x1: mx }, line: 'x', at: mx }
  if (dir === 'right') return { box: { ...b, x0: mx }, line: 'x', at: mx }
  if (dir === 'up') return { box: { ...b, y1: my }, line: 'y', at: my }
  return { box: { ...b, y0: my }, line: 'y', at: my }
}

const HOW: Record<Dir, Text> = {
  left: { en: 'fold the right half over onto the left', kn: 'ಬಲ ಅರ್ಧವನ್ನು ಎಡ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸಿ' },
  right: { en: 'fold the left half over onto the right', kn: 'ಎಡ ಅರ್ಧವನ್ನು ಬಲ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸಿ' },
  up: { en: 'fold the bottom half up', kn: 'ಕೆಳಗಿನ ಅರ್ಧವನ್ನು ಮೇಲಕ್ಕೆ ಮಡಿಸಿ' },
  down: { en: 'fold the top half down', kn: 'ಮೇಲಿನ ಅರ್ಧವನ್ನು ಕೆಳಕ್ಕೆ ಮಡಿಸಿ' },
}
/** The arrow's turn (it points up at 0°, clockwise) for each way of folding. */
const ARROW: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }

const outline = (b: Box): Seg[] => [
  [b.x0, b.y0, b.x1, b.y0],
  [b.x1, b.y0, b.x1, b.y1],
  [b.x1, b.y1, b.x0, b.y1],
  [b.x0, b.y1, b.x0, b.y0],
]

/** One step: the paper still showing drawn solid, the rest of the sheet dotted. */
function step(b: Box, items: FigItem[]): Drawing {
  return { lines: outline(b), dashed: outline(SHEET), items }
}

const round = (v: number) => Math.round(v * 10) / 10
const hole = ([x, y]: Pt): FigItem => ({ shape: 'circle', x: round(x), y: round(y), size: HOLE, fill: 'none' })
/** The opened-out sheet (holes that land on the same spot show as one). */
const sheet = (pts: Pt[]): Drawing => {
  const seen = new Map(pts.map((p) => [`${round(p[0])},${round(p[1])}`, p]))
  return { frame: 'square', items: [...seen.values()].map(hole) }
}

/** Undo the folds (last first): each mirrors every hole in its fold line. */
function unfold(pts: Pt[], folds: { line: 'x' | 'y'; at: number }[]): Pt[] {
  let out = pts
  for (const f of [...folds].reverse())
    out = out.flatMap(([x, y]) => [[x, y], f.line === 'x' ? [2 * f.at - x, y] : [x, 2 * f.at - y]] as Pt[])
  return out
}
/** The usual slip: the far half's holes slid across (not mirrored), keeping the same order. */
function slide(pts: Pt[], folds: { line: 'x' | 'y'; at: number }[], boxes: Box[]): Pt[] {
  let out = pts
  for (let i = folds.length - 1; i >= 0; i--) {
    const f = folds[i], b = boxes[i + 1]
    const w = f.line === 'x' ? b.x1 - b.x0 : b.y1 - b.y0
    const s = f.at === (f.line === 'x' ? b.x1 : b.y1) ? w : -w
    out = out.flatMap(([x, y]) => [[x, y], f.line === 'x' ? [x + s, y] : [x, y + s]] as Pt[])
  }
  return out
}

const far = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]) >= 12

let counter = 0

/** One question: the folds, the punched paper, and four opened-out sheets to choose from. */
export function generatePaperPunch(rng: Rng = Math.random): Question {
  for (;;) {
    const n = int(rng, 1, 2)
    const dirs: Dir[] = [pick(rng, ['left', 'right', 'up', 'down'] as const)]
    if (n === 2) dirs.push(pick(rng, ['left', 'right', 'up', 'down'] as const))
    const boxes: Box[] = [SHEET]
    const folds: { line: 'x' | 'y'; at: number }[] = []
    for (const d of dirs) {
      const f = fold(boxes[boxes.length - 1], d)
      boxes.push(f.box)
      folds.push({ line: f.line, at: f.at })
    }
    const last = boxes[boxes.length - 1]
    // Holes on a 3-unit grid, clear of every edge of the folded paper and of each other.
    const xs: number[] = [], ys: number[] = []
    for (let v = last.x0 + MARGIN; v <= last.x1 - MARGIN; v += 3) xs.push(v)
    for (let v = last.y0 + MARGIN; v <= last.y1 - MARGIN; v += 3) ys.push(v)
    const count = int(rng, 1, n === 1 ? 3 : 2)
    const punched: Pt[] = []
    for (let tries = 0; punched.length < count && tries < 30; tries++) {
      const p: Pt = [pick(rng, xs), pick(rng, ys)]
      if (punched.every((q) => far(p, q))) punched.push(p)
    }
    if (punched.length < count) continue
    const answerPts = unfold(punched, folds)
    // Opened out, the holes must still be clear of each other.
    if (!answerPts.every((p, i) => answerPts.every((q, j) => j <= i || far(p, q)))) continue
    const answer = sheet(answerPts)

    const wrongs: { d: Drawing; why: Text }[] = []
    const add = (pts: Pt[], why: Text) => {
      const d = sheet(pts)
      if (signature(d) !== signature(answer) && !wrongs.some((w) => signature(w.d) === signature(d))) wrongs.push({ d, why })
    }
    add(slide(punched, folds, boxes), {
      en: 'slides the holes across instead of mirroring them in the fold',
      kn: 'ರಂಧ್ರಗಳನ್ನು ಮಡಿಕೆಯಲ್ಲಿ ಕನ್ನಡಿ ಬಿಂಬವಾಗಿಸದೆ ಆಚೆಗೆ ಜಾರಿಸುತ್ತದೆ',
    })
    const others = shuffle(rng, [
      () =>
        n === 2 &&
        add(unfold(punched, folds.slice(1)), { en: 'undoes only the second fold', kn: 'ಎರಡನೇ ಮಡಿಕೆಯನ್ನು ಮಾತ್ರ ಬಿಡಿಸುತ್ತದೆ' }),
      () =>
        n === 2 &&
        add(unfold(punched, folds.slice(0, 1)), { en: 'undoes only the first fold', kn: 'ಮೊದಲ ಮಡಿಕೆಯನ್ನು ಮಾತ್ರ ಬಿಡಿಸುತ್ತದೆ' }),
      () =>
        // Mirrored in the wrong line: across instead of up and down, or the other way round.
        add(
          unfold(
            punched,
            folds.map((f) => ({ line: f.line === 'x' ? 'y' : 'x', at: 50 }) as const),
          ),
          { en: 'mirrors the holes in the wrong line', kn: 'ರಂಧ್ರಗಳನ್ನು ತಪ್ಪು ರೇಖೆಯಲ್ಲಿ ಕನ್ನಡಿ ಬಿಂಬವಾಗಿಸುತ್ತದೆ' },
        ),
      () => {
        // One hole in the wrong place: moved a step along the fold line.
        const k = int(rng, 0, answerPts.length - 1)
        const [x, y] = answerPts[k]
        const f = folds[folds.length - 1]
        const moved: Pt = f.line === 'x' ? [x, y + (y < 50 ? 14 : -14)] : [x + (x < 50 ? 14 : -14), y]
        const pts = answerPts.map((p, j) => (j === k ? moved : p))
        if (pts.every((p, i) => pts.every((q, j) => j <= i || far(p, q))))
          add(pts, { en: 'puts one hole in the wrong place', kn: 'ಒಂದು ರಂಧ್ರವನ್ನು ತಪ್ಪು ಜಾಗದಲ್ಲಿ ಇಡುತ್ತದೆ' })
      },
      () => {
        const k = int(rng, 0, answerPts.length - 1)
        add(answerPts.filter((_, j) => j !== k), { en: 'leaves out one hole', kn: 'ಒಂದು ರಂಧ್ರವನ್ನು ಬಿಟ್ಟುಬಿಡುತ್ತದೆ' })
      },
    ])
    for (const c of others) if (wrongs.length < 3) c()
    if (wrongs.length < 3) continue

    // The steps: each fold with its arrow, then the folded paper with the holes punched (black).
    const terms: Drawing[] = dirs.map((d, i) => {
      const b = boxes[i + 1], f = folds[i]
      const arrow: FigItem = {
        shape: 'arrow',
        x: f.line === 'x' ? f.at : (b.x0 + b.x1) / 2,
        y: f.line === 'y' ? f.at : (b.y0 + b.y1) / 2,
        size: 18,
        rot: ARROW[d],
      }
      return step(b, [arrow])
    })
    terms.push(step(last, punched.map(([x, y]) => ({ shape: 'dot', x, y, size: HOLE }))))

    const order = shuffle(rng, [answer, ...wrongs.map((w) => w.d)])
    const key = OPTION_KEYS[order.indexOf(answer)]
    const slipKey = OPTION_KEYS[order.indexOf(wrongs[0].d)]
    const total = answerPts.length
    const steps: Text = {
      en: dirs.map((d) => HOW[d].en).join(', then '),
      kn: dirs.map((d) => HOW[d].kn).join(', ನಂತರ '),
    }
    const rule: Text = {
      en: `Option ${key}: each fold, opened out, mirrors the holes in its fold line, so ${punched.length} ${punched.length === 1 ? 'hole makes' : 'holes make'} ${total}`,
      kn: `ಆಯ್ಕೆ ${key}: ಬಿಡಿಸಿದ ಪ್ರತಿ ಮಡಿಕೆ ರಂಧ್ರಗಳನ್ನು ತನ್ನ ರೇಖೆಯಲ್ಲಿ ಕನ್ನಡಿ ಬಿಂಬವಾಗಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ${punched.length} ರಂಧ್ರ(ಗಳು) ${total} ಆಗುತ್ತವೆ`,
    }
    const working: Text = {
      en: `The paper is folded: ${steps.en}. The ${punched.length === 1 ? 'hole goes' : 'holes go'} through every layer. Open the folds, last one first: each one mirrors every hole in its fold line, the same distance on the other side, so the holes double each time. That gives ${total} holes, as in option ${key}. Option ${slipKey} ${wrongs[0].why.en}.`,
      kn: `ಕಾಗದವನ್ನು ಹೀಗೆ ಮಡಿಸಲಾಗಿದೆ: ${steps.kn}. ರಂಧ್ರ(ಗಳು) ಎಲ್ಲ ಪದರಗಳ ಮೂಲಕ ಹೋಗುತ್ತವೆ. ಕೊನೆಯ ಮಡಿಕೆಯಿಂದ ಆರಂಭಿಸಿ ಬಿಡಿಸಿ: ಪ್ರತಿ ಮಡಿಕೆ ಪ್ರತಿ ರಂಧ್ರವನ್ನು ತನ್ನ ರೇಖೆಯ ಇನ್ನೊಂದು ಕಡೆ ಅಷ್ಟೇ ದೂರದಲ್ಲಿ ಕನ್ನಡಿ ಬಿಂಬವಾಗಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ಪ್ರತಿ ಬಾರಿ ರಂಧ್ರಗಳು ಎರಡರಷ್ಟಾಗುತ್ತವೆ. ಒಟ್ಟು ${total} ರಂಧ್ರಗಳು, ಆಯ್ಕೆ ${key} ಯಂತೆ. ಆಯ್ಕೆ ${slipKey} ${wrongs[0].why.kn}.`,
    }
    return {
      id: `gen-punch-${dirs.join('-')}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: terms.map((_, i) => String(i + 1)),
      figures: {
        terms,
        options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, Drawing>,
      },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer: key,
      rule: rule.en,
      working: working.en,
      pattern: 'paper-punch',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
