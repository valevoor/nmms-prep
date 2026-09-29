import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, PatternId, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Intersecting figures (Chapter 5): a circle, a rectangle and a triangle overlap, each standing for
 * a group of people, and a number in each part says how many people are in just that part. The
 * question asks how many are in some combination of groups.
 */

/** The drawing's box is BOX_W × 100. */
export const BOX_W = 160

/**
 * The three shapes, in the order circle, rectangle, triangle. Each arrangement (found by a search
 * that keeps every part roomy) makes all 7 parts; each is also used mirrored left to right.
 */
const BASE_LAYOUTS: FigItem[][] = [
  [
    { shape: 'circle', x: 86, y: 38, size: 67 },
    { shape: 'rect', x: 84, y: 33, size: 106, h: 28 },
    { shape: 'poly', n: 3, x: 120, y: 44, size: 82 },
  ],
  [
    { shape: 'circle', x: 91, y: 63, size: 65 },
    { shape: 'rect', x: 68, y: 70, size: 109, h: 33 },
    { shape: 'poly', n: 3, x: 69, y: 51, size: 87 },
  ],
  [
    { shape: 'circle', x: 115, y: 35, size: 58 },
    { shape: 'rect', x: 89, y: 59, size: 97, h: 40 },
    { shape: 'poly', n: 3, x: 85, y: 46, size: 100, rot: 180 },
  ],
  [
    { shape: 'circle', x: 50, y: 44, size: 73 },
    { shape: 'rect', x: 75, y: 60, size: 116, h: 45 },
    { shape: 'poly', n: 3, x: 86, y: 40, size: 106, rot: 180 },
  ],
]
export const LAYOUTS: FigItem[][] = [...BASE_LAYOUTS, ...BASE_LAYOUTS.map((l) => l.map((it) => ({ ...it, x: BOX_W - it.x })))]

type Pt = [number, number]

function triangle(it: FigItem): Pt[] {
  const r = it.size / 2
  const rot = ((it.rot ?? 0) * Math.PI) / 180
  return [0, 1, 2].map((i) => {
    const a = (2 * Math.PI * i) / 3 - Math.PI / 2 + rot
    return [it.x + r * Math.cos(a), it.y + r * Math.sin(a)]
  })
}

function segDist([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt): number {
  const dx = bx - ax, dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

/** Is the point inside the shape, and how far is it from the shape's outline? */
function where(it: FigItem, p: Pt): { inside: boolean; edge: number } {
  const [x, y] = p
  if (it.shape === 'circle') {
    const d = Math.hypot(x - it.x, y - it.y)
    return { inside: d < it.size / 2, edge: Math.abs(d - it.size / 2) }
  }
  if (it.shape === 'rect') {
    const hw = it.size / 2, hh = (it.h ?? it.size) / 2
    const c: Pt[] = [
      [it.x - hw, it.y - hh],
      [it.x + hw, it.y - hh],
      [it.x + hw, it.y + hh],
      [it.x - hw, it.y + hh],
    ]
    const inside = Math.abs(x - it.x) < hw && Math.abs(y - it.y) < hh
    return { inside, edge: Math.min(...c.map((a, i) => segDist(p, a, c[(i + 1) % 4]))) }
  }
  const t = triangle(it)
  const side = (a: Pt, b: Pt) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
  const s = [side(t[0], t[1]), side(t[1], t[2]), side(t[2], t[0])]
  const inside = s.every((v) => v > 0) || s.every((v) => v < 0)
  return { inside, edge: Math.min(...t.map((a, i) => segDist(p, a, t[(i + 1) % 3]))) }
}

/** Which shapes a point is inside, as a bitmask (circle 1, rectangle 2, triangle 4). */
const maskAt = (shapes: FigItem[], p: Pt) => shapes.reduce((m, it, i) => (where(it, p).inside ? m | (1 << i) : m), 0)

/** For each of the 7 parts, the point farthest from every outline (where its number is written). */
export function partCentres(shapes: FigItem[]): { at: Pt[]; room: number[] } {
  const at: Pt[] = [], room: number[] = []
  for (let y = 4; y <= 96; y += 1)
    for (let x = 4; x <= BOX_W - 4; x += 1) {
      const m = maskAt(shapes, [x, y])
      if (!m) continue
      const d = Math.min(...shapes.map((it) => where(it, [x, y]).edge))
      if (!(d <= (room[m] ?? -1))) [at[m], room[m]] = [[x, y], d]
    }
  return { at, room }
}

const CENTRES = LAYOUTS.map(partCentres)

interface Group {
  en: string
  kn: string
}
const THEMES: Group[][] = [
  [
    { en: 'cricket players', kn: 'ಕ್ರಿಕೆಟ್ ಆಟಗಾರರು' },
    { en: 'volleyball players', kn: 'ವಾಲಿಬಾಲ್ ಆಟಗಾರರು' },
    { en: 'badminton players', kn: 'ಬ್ಯಾಡ್ಮಿಂಟನ್ ಆಟಗಾರರು' },
    { en: 'kabaddi players', kn: 'ಕಬಡ್ಡಿ ಆಟಗಾರರು' },
  ],
  [
    { en: 'dancers', kn: 'ನೃತ್ಯಗಾರರು' },
    { en: 'swimmers', kn: 'ಈಜುಗಾರರು' },
    { en: 'singers', kn: 'ಹಾಡುಗಾರರು' },
    { en: 'doctors', kn: 'ವೈದ್ಯರು' },
    { en: 'teachers', kn: 'ಶಿಕ್ಷಕರು' },
  ],
  [
    { en: 'tea drinkers', kn: 'ಚಹಾ ಕುಡಿಯುವವರು' },
    { en: 'coffee drinkers', kn: 'ಕಾಫಿ ಕುಡಿಯುವವರು' },
    { en: 'milk drinkers', kn: 'ಹಾಲು ಕುಡಿಯುವವರು' },
  ],
  [
    { en: 'Kannada students', kn: 'ಕನ್ನಡ ಅಭ್ಯಸಿಸುವ ವಿದ್ಯಾರ್ಥಿಗಳು' },
    { en: 'English students', kn: 'ಇಂಗ್ಲಿಷ್ ಅಭ್ಯಸಿಸುವ ವಿದ್ಯಾರ್ಥಿಗಳು' },
    { en: 'Hindi students', kn: 'ಹಿಂದಿ ಅಭ್ಯಸಿಸುವ ವಿದ್ಯಾರ್ಥಿಗಳು' },
  ],
]

/** "ನೃತ್ಯಗಾರರು" → "ನೃತ್ಯಗಾರರ" (of the dancers). */
const knOf = (g: Group) => g.kn.replace(/ು$/, '')

const SYMBOL = ['○', '□', '△']

/** What is asked: the people inside every shape in `inside` and outside every shape in `outside`. */
export interface Ask {
  kind: 'total' | 'only' | 'both' | 'all' | 'not' | 'two-only'
  inside: number[]
  outside: number[]
}

function makeAsk(rng: Rng): Ask {
  const [a, b, c] = shuffle(rng, [0, 1, 2])
  const kind = pick(rng, ['total', 'only', 'both', 'all', 'not', 'two-only'] as const)
  switch (kind) {
    case 'total':
      return { kind, inside: [a], outside: [] }
    case 'only':
      return { kind, inside: [a], outside: [b, c].sort() }
    case 'both':
      return { kind, inside: [a, b], outside: [] }
    case 'all':
      return { kind, inside: [0, 1, 2], outside: [] }
    case 'not':
      return { kind, inside: [a], outside: [b] }
    case 'two-only':
      return { kind, inside: [a, b], outside: [c] }
  }
}

/** The parts (bitmasks 1–7) an ask covers. */
export const partsOf = (ask: Ask) =>
  [1, 2, 3, 4, 5, 6, 7].filter((m) => ask.inside.every((i) => m & (1 << i)) && ask.outside.every((i) => !(m & (1 << i))))

function words(ask: Ask, g: Group[]): { prompt: Text; rule: Text } {
  const [a, b] = ask.inside
  const o = ask.outside[0]
  const s = (i: number) => SYMBOL[i]
  switch (ask.kind) {
    case 'total':
      return {
        prompt: { en: `How many ${g[a].en} are there in all?`, kn: `${knOf(g[a])} ಗುಂಪಿನಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಜನರಿದ್ದಾರೆ?` },
        rule: {
          en: `Add every number inside the ${s(a)}, including the parts it shares with the other shapes.`,
          kn: `${s(a)} ಒಳಗಿನ ಎಲ್ಲಾ ಸಂಖ್ಯೆಗಳನ್ನು ಕೂಡಿಸಿ, ಇತರ ಆಕೃತಿಗಳ ಜೊತೆ ಹಂಚಿಕೊಂಡ ಭಾಗಗಳನ್ನೂ ಸೇರಿಸಿ.`,
        },
      }
    case 'only':
      return {
        prompt: { en: `How many are ${g[a].en} only?`, kn: `${knOf(g[a])} ಗುಂಪಿನಲ್ಲಿ ಮಾತ್ರ ಇರುವವರು ಎಷ್ಟು ಜನ?` },
        rule: {
          en: `Take the part of the ${s(a)} that is outside both other shapes.`,
          kn: `${s(a)} ನ ಯಾವ ಭಾಗ ಉಳಿದ ಎರಡೂ ಆಕೃತಿಗಳ ಹೊರಗಿದೆಯೋ ಆ ಭಾಗದ ಸಂಖ್ಯೆ.`,
        },
      }
    case 'both':
      return {
        prompt: {
          en: `How many are both ${g[a].en} and ${g[b].en}?`,
          kn: `${knOf(g[a])} ಮತ್ತು ${knOf(g[b])} ಎರಡೂ ಗುಂಪುಗಳಲ್ಲಿ ಇರುವವರು ಎಷ್ಟು ಜನ?`,
        },
        rule: {
          en: `Add the numbers inside both the ${s(a)} and the ${s(b)}, including the middle part where all three meet.`,
          kn: `${s(a)} ಮತ್ತು ${s(b)} ಎರಡರ ಒಳಗಿರುವ ಸಂಖ್ಯೆಗಳನ್ನು ಕೂಡಿಸಿ, ಮೂರೂ ಸೇರುವ ಮಧ್ಯದ ಭಾಗವನ್ನೂ ಸೇರಿಸಿ.`,
        },
      }
    case 'all':
      return {
        prompt: { en: 'How many are in all three groups?', kn: 'ಮೂರೂ ಗುಂಪುಗಳಲ್ಲಿ ಇರುವವರು ಎಷ್ಟು ಜನ?' },
        rule: { en: 'Take the middle part, inside all three shapes.', kn: 'ಮೂರೂ ಆಕೃತಿಗಳ ಒಳಗಿರುವ ಮಧ್ಯದ ಭಾಗದ ಸಂಖ್ಯೆ.' },
      }
    case 'not':
      return {
        prompt: {
          en: `How many ${g[a].en} are not ${g[o].en}?`,
          kn: `${knOf(g[a])} ಗುಂಪಿನಲ್ಲಿ ಇದ್ದು ${knOf(g[o])} ಗುಂಪಿನಲ್ಲಿ ಇಲ್ಲದವರು ಎಷ್ಟು ಜನ?`,
        },
        rule: {
          en: `Add the numbers inside the ${s(a)} but outside the ${s(o)}.`,
          kn: `${s(a)} ಒಳಗೆ ಆದರೆ ${s(o)} ಹೊರಗೆ ಇರುವ ಸಂಖ್ಯೆಗಳನ್ನು ಕೂಡಿಸಿ.`,
        },
      }
    case 'two-only':
      return {
        prompt: {
          en: `How many are ${g[a].en} and ${g[b].en}, but not ${g[o].en}?`,
          kn: `${knOf(g[a])} ಮತ್ತು ${knOf(g[b])} ಗುಂಪುಗಳಲ್ಲಿ ಇದ್ದು ${knOf(g[o])} ಗುಂಪಿನಲ್ಲಿ ಇಲ್ಲದವರು ಎಷ್ಟು ಜನ?`,
        },
        rule: {
          en: `Take the part inside the ${s(a)} and the ${s(b)} but outside the ${s(o)}.`,
          kn: `${s(a)} ಮತ್ತು ${s(b)} ಒಳಗೆ ಆದರೆ ${s(o)} ಹೊರಗೆ ಇರುವ ಭಾಗದ ಸಂಖ್ಯೆ.`,
        },
      }
  }
}

const PATTERN: Record<Ask['kind'], PatternId> = {
  total: 'venn-count',
  both: 'venn-count',
  not: 'venn-count',
  only: 'venn-part',
  all: 'venn-part',
  'two-only': 'venn-part',
}

let counter = 0

/** A generated question, with what it asks (for the tests). */
export function buildIntersecting(rng: Rng): { q: Question; ask: Ask } {
  const li = int(rng, 0, LAYOUTS.length - 1)
  const shapes = LAYOUTS[li]
  const { at } = CENTRES[li]
  // A different number (2–30) in each part.
  const values = shuffle(
    rng,
    Array.from({ length: 29 }, (_, i) => i + 2),
  ).slice(0, 7)
  const value = (m: number) => values[m - 1]
  const ask = makeAsk(rng)
  const parts = partsOf(ask)
  const answer = parts.reduce((s, m) => s + value(m), 0)

  // Wrong options: what other readings of the picture give (another combination of parts).
  const others = new Set<number>()
  for (let m = 1; m < 128; m++) {
    const v = [1, 2, 3, 4, 5, 6, 7].filter((p) => m & (1 << (p - 1))).reduce((s, p) => s + value(p), 0)
    // Only near misses: combinations that differ from the right parts by one part.
    const diff = [1, 2, 3, 4, 5, 6, 7].filter((p) => !!(m & (1 << (p - 1))) !== parts.includes(p)).length
    if (diff === 1 && v !== answer) others.add(v)
  }
  for (let d = 1; others.size < 3; d++) [answer + d, answer - d].forEach((v) => v > 0 && others.add(v))
  const wrong = shuffle(rng, [...others]).slice(0, 3)
  const opts = shuffle(rng, [answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>
  const key = OPTION_KEYS[opts.indexOf(answer)]

  const g = shuffle(rng, [...pick(rng, THEMES)]).slice(0, 3)
  const legend: Text = {
    en: `${SYMBOL.map((s, i) => `${s} ${g[i].en}`).join(', ')}.`,
    kn: `${SYMBOL.map((s, i) => `${s} ${g[i].kn}`).join(', ')}.`,
  }
  const w = words(ask, g)
  const nums = parts.map((m) => value(m))
  const working = nums.length > 1 ? `${nums.join(' + ')} = ${answer}` : String(answer)

  const drawing: Drawing = {
    w: BOX_W,
    items: [
      ...shapes,
      ...[1, 2, 3, 4, 5, 6, 7].map((m): FigItem => ({ shape: 'text', x: at[m][0], y: at[m][1], size: 10, label: String(value(m)) })),
    ],
  }
  const q: Question = {
    id: `gen-venn-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: `${legend.en} ${w.prompt.en}`,
    figures: { terms: [drawing] },
    options,
    answer: key,
    rule: w.rule.en,
    working,
    pattern: PATTERN[ask.kind],
    generated: true,
    kn: { prompt: `${legend.kn} ${w.prompt.kn}`, rule: w.rule.kn, working },
  }
  return { q, ask }
}

export function generateIntersecting(rng: Rng = Math.random): Question {
  return buildIntersecting(rng).q
}
