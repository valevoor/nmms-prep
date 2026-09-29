import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { signature } from './figures'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Chapter 6, Figure Fold Transparent Sheet: a sheet with small shapes on both sides of a dotted
// fold line. Folding it lays the far half over the near half, so every shape from the far half
// lands mirrored, the same distance from the fold. The options show the near half after folding.

type Seg = [number, number, number, number]

interface Fold {
  id: 'left' | 'right' | 'top' | 'bottom' | 'lowerLeft' | 'upperLeft'
  line: Seg
  /** Which side a point is on: < 0 is the half that stays (the near half). */
  side: (x: number, y: number) => number
  /** Where a point lands after folding. */
  at: (x: number, y: number) => [number, number]
  /** A shape's turn after folding (it is also flipped). */
  rot: (r: number) => number
  how: Text
}

const mod = (a: number, n: number) => ((a % n) + n) % n

export const FOLDS: Fold[] = [
  {
    id: 'left',
    line: [50, 8, 50, 92],
    side: (x) => x - 50,
    at: (x, y) => [100 - x, y],
    rot: (r) => mod(-r, 360),
    how: { en: 'the right half folds over onto the left half', kn: 'ಬಲ ಅರ್ಧ ಎಡ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
  {
    id: 'right',
    line: [50, 8, 50, 92],
    side: (x) => 50 - x,
    at: (x, y) => [100 - x, y],
    rot: (r) => mod(-r, 360),
    how: { en: 'the left half folds over onto the right half', kn: 'ಎಡ ಅರ್ಧ ಬಲ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
  {
    id: 'top',
    line: [8, 50, 92, 50],
    side: (_, y) => y - 50,
    at: (x, y) => [x, 100 - y],
    rot: (r) => mod(180 - r, 360),
    how: { en: 'the bottom half folds up onto the top half', kn: 'ಕೆಳಗಿನ ಅರ್ಧ ಮೇಲಿನ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
  {
    id: 'bottom',
    line: [8, 50, 92, 50],
    side: (_, y) => 50 - y,
    at: (x, y) => [x, 100 - y],
    rot: (r) => mod(180 - r, 360),
    how: { en: 'the top half folds down onto the bottom half', kn: 'ಮೇಲಿನ ಅರ್ಧ ಕೆಳಗಿನ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
  {
    id: 'lowerLeft',
    line: [8, 8, 92, 92],
    side: (x, y) => x - y,
    at: (x, y) => [y, x],
    rot: (r) => mod(-90 - r, 360),
    how: { en: 'the upper-right half folds over onto the lower-left half', kn: 'ಮೇಲಿನ ಬಲ ಅರ್ಧ ಕೆಳಗಿನ ಎಡ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
  {
    id: 'upperLeft',
    line: [92, 8, 8, 92],
    side: (x, y) => x + y - 100,
    at: (x, y) => [100 - y, 100 - x],
    rot: (r) => mod(90 - r, 360),
    how: { en: 'the lower-right half folds over onto the upper-left half', kn: 'ಕೆಳಗಿನ ಬಲ ಅರ್ಧ ಮೇಲಿನ ಎಡ ಅರ್ಧದ ಮೇಲೆ ಮಡಿಸುತ್ತದೆ' },
  },
]

const GRID = [20, 35, 50, 65, 80]
const SPOTS: [number, number][] = GRID.flatMap((x) => GRID.map((y) => [x, y] as [number, number]))
const SHAPES = ['flag', 'flag', 'ell', 'ell', 'arrow', 'poly', 'circle', 'dots'] as const
const SIZE = 16
const fillable = (it: FigItem) => it.shape === 'poly' || it.shape === 'circle' || it.shape === 'flag'

function item(rng: Rng, [x, y]: [number, number]): FigItem {
  const shape = pick(rng, SHAPES)
  const it: FigItem = { shape, x, y, size: shape === 'dots' ? 20 : SIZE, rot: 90 * int(rng, 0, 3) }
  if (shape === 'poly') it.n = 3
  if (shape === 'dots') it.n = 2
  if (fillable(it)) it.fill = pick(rng, ['none', 'solid'] as const)
  if (shape === 'flag' || shape === 'ell') it.flip = rng() < 0.5
  return it
}

/** The shape folded over: moved to where it lands and mirrored. */
export function folded(f: Fold, it: FigItem): FigItem {
  const [x, y] = f.at(it.x, it.y)
  return { ...it, x, y, rot: f.rot(it.rot ?? 0), flip: !it.flip }
}
/** The shape moved across the fold but not flipped over (the usual slip). */
const slid = (f: Fold, it: FigItem): FigItem => {
  const [x, y] = f.at(it.x, it.y)
  return { ...it, x, y }
}
/** Moved to the right place but mirrored the other way (turned half round from the right answer). */
const wrongWay = (f: Fold, it: FigItem): FigItem => {
  const g = folded(f, it)
  return { ...g, rot: mod((g.rot ?? 0) + 180, 360) }
}

const far = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]) >= 24

const sheet = (f: Fold, items: FigItem[]): Drawing => ({
  frame: 'square',
  dashed: [f.line],
  items: items.map((it) => Object.fromEntries(Object.entries(it).filter(([, v]) => v !== undefined && v !== false)) as unknown as FigItem),
})

let counter = 0

/** One question: a sheet with a dotted fold line, and four pictures of the near half after folding. */
export function generateFoldSheet(rng: Rng = Math.random): Question {
  for (;;) {
    const f = pick(rng, FOLDS)
    // Spots well clear of the fold on each side.
    const near = SPOTS.filter(([x, y]) => f.side(x, y) <= -15)
    const away = SPOTS.filter(([x, y]) => f.side(x, y) >= 15)
    const nNear = int(rng, 1, 2)
    const nFar = int(rng, 1, 2)
    const keep = shuffle(rng, near).slice(0, nNear).map((s) => item(rng, s))
    const move = shuffle(rng, away).slice(0, nFar).map((s) => item(rng, s))
    const answerItems = [...keep, ...move.map((it) => folded(f, it))]
    // Nothing may overlap, on the sheet or after folding.
    const pos = (its: FigItem[]) => its.map((it) => [it.x, it.y] as [number, number])
    const clear = (its: FigItem[]) => pos(its).every((p, i) => pos(its).every((q, j) => j <= i || far(p, q)))
    if (!clear([...keep, ...move]) || !clear(answerItems)) continue
    const answer = sheet(f, answerItems)

    const wrongs: { d: Drawing; why: Text }[] = []
    const add = (items: FigItem[], why: Text) => {
      const d = sheet(f, items)
      if (signature(d) !== signature(answer) && !wrongs.some((w) => signature(w.d) === signature(d))) wrongs.push({ d, why })
    }
    const i = int(rng, 0, move.length - 1)
    // The slip students make most often comes first, if it looks different.
    add([...keep, ...move.map((it) => slid(f, it))], {
      en: 'slides the shapes across without flipping them over',
      kn: 'ಆಕೃತಿಗಳನ್ನು ತಿರುಗಿಸದೆ ಆಚೆಗೆ ಜಾರಿಸುತ್ತದೆ',
    })
    const subtle = shuffle(rng, [
      () =>
        add([...keep, ...move.map((it, j) => (j === i ? wrongWay(f, it) : folded(f, it)))], {
          en: 'turns one folded shape the wrong way',
          kn: 'ಮಡಿಸಿದ ಒಂದು ಆಕೃತಿಯನ್ನು ತಪ್ಪು ಕಡೆಗೆ ತಿರುಗಿಸುತ್ತದೆ',
        }),
      () => {
        const k = answerItems.findIndex(fillable)
        if (k < 0) return
        const it = answerItems[k]
        add(
          answerItems.map((o, j) => (j === k ? { ...it, fill: it.fill === 'solid' ? 'none' : 'solid' } : o)),
          { en: 'changes the shading of one shape', kn: 'ಒಂದು ಆಕೃತಿಯ ಬಣ್ಣವನ್ನು ಬದಲಿಸುತ್ತದೆ' },
        )
      },
    ])
    // Leaving a whole half out is easy to spot: use it only when nothing else is left.
    const leaveOut = shuffle(rng, [
      () => add(keep, { en: 'leaves out the folded half', kn: 'ಮಡಿಸಿದ ಅರ್ಧವನ್ನು ಬಿಟ್ಟುಬಿಡುತ್ತದೆ' }),
      () => add(move.map((it) => folded(f, it)), { en: 'leaves out the shapes that were already there', kn: 'ಮೊದಲೇ ಇದ್ದ ಆಕೃತಿಗಳನ್ನು ಬಿಟ್ಟುಬಿಡುತ್ತದೆ' }),
    ])
    for (const c of [...subtle, ...leaveOut]) if (wrongs.length < 3) c()
    if (wrongs.length < 3) continue

    const order = shuffle(rng, [answer, ...wrongs.map((w) => w.d)])
    const key = OPTION_KEYS[order.indexOf(answer)]
    const slipKey = OPTION_KEYS[order.indexOf(wrongs[0].d)]
    const rule: Text = {
      en: `Option ${key}: ${f.how.en}, and each shape from it lands mirrored`,
      kn: `ಆಯ್ಕೆ ${key}: ${f.how.kn}, ಅದರ ಪ್ರತಿ ಆಕೃತಿಯೂ ಕನ್ನಡಿ ಬಿಂಬದಂತೆ ಬೀಳುತ್ತದೆ`,
    }
    const working: Text = {
      en: `Along the dotted line, ${f.how.en}. The shapes already on that half stay where they are. Each shape on the other half flips over and lands the same distance from the fold on this side, mirrored. That is option ${key}. Option ${slipKey} ${wrongs[0].why.en}.`,
      kn: `ಚುಕ್ಕೆ ರೇಖೆಯ ಉದ್ದಕ್ಕೂ ${f.how.kn}. ಆ ಅರ್ಧದಲ್ಲಿರುವ ಆಕೃತಿಗಳು ಅಲ್ಲೇ ಇರುತ್ತವೆ. ಇನ್ನೊಂದು ಅರ್ಧದ ಪ್ರತಿ ಆಕೃತಿಯೂ ಮಗುಚಿಕೊಂಡು, ಮಡಿಕೆಯಿಂದ ಅಷ್ಟೇ ದೂರದಲ್ಲಿ ಈ ಕಡೆ ಕನ್ನಡಿ ಬಿಂಬದಂತೆ ಬೀಳುತ್ತದೆ. ಅದು ಆಯ್ಕೆ ${key}. ಆಯ್ಕೆ ${slipKey} ${wrongs[0].why.kn}.`,
    }
    return {
      id: `gen-fold-${f.id}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: ['1'],
      figures: {
        terms: [sheet(f, [...keep, ...move])],
        options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, Drawing>,
      },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer: key,
      rule: rule.en,
      working: working.en,
      pattern: 'fold-sheet',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
