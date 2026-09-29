import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { mirror, signature, turn } from './figures'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Chapter 4, Similar Figures in Different Position: one option is the given figure turned; the
// others are its mirror image or have one part changed, and none of them is any turn of it.

/** Places shapes can sit: corners, edges and centre (a quarter turn takes each to another). */
const SLOTS: [number, number][] = [
  [28, 28], [72, 28], [72, 72], [28, 72],
  [50, 24], [76, 50], [50, 76], [24, 50],
  [50, 50],
]
const SHAPES = ['arrow', 'arrow', 'flag', 'flag', 'ell', 'poly', 'circle', 'dots', 'plus'] as const
const fillable = (it: FigItem) => it.shape === 'poly' || it.shape === 'circle' || it.shape === 'flag'

function item(rng: Rng, [x, y]: [number, number]): FigItem {
  const shape = pick(rng, SHAPES)
  const it: FigItem = { shape, x, y, size: shape === 'dots' ? 24 : 20, rot: 90 * int(rng, 0, 3) }
  if (shape === 'poly') it.n = 3
  if (shape === 'dots') it.n = int(rng, 2, 3)
  if (fillable(it)) it.fill = pick(rng, ['none', 'solid'] as const)
  if (shape === 'flag' || shape === 'ell') it.flip = rng() < 0.5
  return it
}

const same = (a: Drawing, b: Drawing) => signature(a) === signature(b)
const TURNS = [0, 90, 180, 270]
/** Is `w` the drawing `d` turned by some multiple of a quarter turn (or not turned at all)? */
const isTurnOf = (w: Drawing, d: Drawing) => TURNS.some((k) => same(turn(d, k), w))

/** The drawing with one part changed: filled, turned, flipped, moved or given another side. */
function onePartChanged(rng: Rng, d: Drawing): Drawing | undefined {
  const i = int(rng, 0, d.items.length - 1)
  const it = d.items[i]
  const free = SLOTS.filter(([x, y]) => !d.items.some((o) => o.x === x && o.y === y))
  const changes: (() => FigItem | undefined)[] = [
    () => (fillable(it) ? { ...it, fill: it.fill === 'solid' ? 'none' : 'solid' } : undefined),
    () => ({ ...it, rot: ((it.rot ?? 0) + pick(rng, [90, 180, 270])) % 360 }),
    () => (it.shape === 'flag' || it.shape === 'ell' ? { ...it, flip: !it.flip } : undefined),
    () => {
      if (!free.length) return undefined
      const [x, y] = pick(rng, free)
      return { ...it, x, y }
    },
    () => (it.shape === 'poly' ? { ...it, n: (it.n ?? 3) + 1 } : it.shape === 'dots' ? { ...it, n: (it.n ?? 1) === 3 ? 2 : 3 } : undefined),
  ]
  const next = pick(rng, changes)()
  return next ? { ...d, items: d.items.map((o, j) => (j === i ? next : o)) } : undefined
}

const clean = (d: Drawing): Drawing => ({
  ...(d.frame ? { frame: d.frame } : {}),
  items: d.items.map((it) => Object.fromEntries(Object.entries(it).filter(([, v]) => v !== undefined && v !== false)) as unknown as FigItem),
})

/** How far the answer is turned, for the rule and working. */
export const SIMILAR_TURN: Record<number, Text> = {
  90: { en: 'a quarter turn clockwise', kn: 'ಗಡಿಯಾರದ ದಿಕ್ಕಿನಲ್ಲಿ ಕಾಲು ಸುತ್ತು' },
  180: { en: 'half a turn', kn: 'ಅರ್ಧ ಸುತ್ತು' },
  270: { en: 'a quarter turn anticlockwise', kn: 'ಗಡಿಯಾರದ ವಿರುದ್ಧ ದಿಕ್ಕಿನಲ್ಲಿ ಕಾಲು ಸುತ್ತು' },
}

let counter = 0

/** One question: a figure and four options, of which exactly one is the figure turned. */
export function generateSimilarFigure(rng: Rng = Math.random): Question {
  for (;;) {
    const slots = shuffle(rng, SLOTS).slice(0, int(rng, 3, 4))
    const d: Drawing = { frame: pick(rng, ['square', 'square', 'circle', undefined]), items: slots.map((s) => item(rng, s)) }
    const deg = pick(rng, [90, 180, 270])
    const answer = turn(d, deg)
    // The answer must look different from the figure, and the mirror image must not be a turn of it.
    if (same(answer, d) || isTurnOf(mirror(d), d)) continue
    const wrong: Drawing[] = []
    const add = (w?: Drawing) => {
      if (w && !isTurnOf(w, d) && !wrong.some((o) => same(o, w))) wrong.push(w)
    }
    add(turn(mirror(d), pick(rng, TURNS)))
    const mirrorAt = wrong.length ? 0 : -1
    for (let tries = 0; wrong.length < 3 && tries < 30; tries++) {
      const c = onePartChanged(rng, d)
      add(c && turn(c, pick(rng, TURNS)))
    }
    if (wrong.length < 3 || mirrorAt < 0) continue
    const order = shuffle(rng, [answer, ...wrong])
    const key = OPTION_KEYS[order.indexOf(answer)]
    const mirrorKey = OPTION_KEYS[order.indexOf(wrong[mirrorAt])]
    const how = SIMILAR_TURN[deg]
    const rule: Text = {
      en: `Option ${key} is the figure turned ${how.en}`,
      kn: `ಆಯ್ಕೆ ${key} ಯು ಚಿತ್ರವನ್ನು ${how.kn} ತಿರುಗಿಸಿದಂತಿದೆ`,
    }
    const working: Text = {
      en: `Turn the figure ${how.en}: every part lands where it is in option ${key}. Option ${mirrorKey} is a mirror image, and each other option has one part changed.`,
      kn: `ಚಿತ್ರವನ್ನು ${how.kn} ತಿರುಗಿಸಿ: ಪ್ರತಿ ಭಾಗವೂ ಆಯ್ಕೆ ${key} ಯಲ್ಲಿರುವ ಜಾಗಕ್ಕೆ ಬರುತ್ತದೆ. ಆಯ್ಕೆ ${mirrorKey} ಕನ್ನಡಿ ಬಿಂಬ, ಉಳಿದ ಪ್ರತಿ ಆಯ್ಕೆಯಲ್ಲೂ ಒಂದು ಭಾಗ ಬದಲಾಗಿದೆ.`,
    }
    return {
      id: `gen-sim-${deg}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: ['1'],
      figures: { terms: [clean(d)], options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, clean(order[j])])) as Record<OptionKey, Drawing> },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer: key,
      rule: rule.en,
      working: working.en,
      pattern: 'fig-rotate',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
