import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, PatternId, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Locale } from '../i18n/locale'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// ---------- looking at drawings ----------

/** How many turns in a full circle leave a shape looking the same (0 = any turn). */
const TURNS: Record<FigItem['shape'], (it: FigItem) => number> = {
  poly: (it) => it.n ?? 3,
  circle: () => 0,
  dot: () => 0,
  dots: (it) => ((it.n ?? 1) === 1 ? 0 : 2),
  plus: () => 4,
  arrow: () => 1,
  flag: () => 1,
  ell: () => 1,
}
/** Shapes that look different when mirrored (the rest are symmetric about their own upright axis). */
const CHIRAL = new Set<FigItem['shape']>(['flag', 'ell'])

const mod = (a: number, m: number) => ((a % m) + m) % m

/** A string that is the same for two drawings exactly when they look the same. */
export function signature(d: Drawing): string {
  const items = d.items.map((it) => {
    const k = TURNS[it.shape](it)
    const rot = k === 0 ? 0 : Math.round(mod(it.rot ?? 0, 360 / k))
    const flip = CHIRAL.has(it.shape) && !!it.flip
    const fill = it.shape === 'dot' || it.shape === 'dots' ? '' : (it.fill ?? 'none')
    return [it.shape, it.n ?? '', Math.round(it.x), Math.round(it.y), Math.round(it.size), rot, flip ? 'f' : '', fill].join(':')
  })
  return [d.frame ?? '', [...(d.shaded ?? [])].sort((a, b) => a - b).join('.'), ...items.sort()].join('|')
}

const same = (a: Drawing, b: Drawing) => signature(a) === signature(b)

// ---------- changing drawings ----------

const parts = (d: Drawing) => (d.frame === 'quad' ? 4 : d.frame === 'oct' ? 8 : 0)

/** The whole drawing turned clockwise by `deg` (a multiple of 90) about its centre. */
export function turn(d: Drawing, deg: number): Drawing {
  const a = (deg * Math.PI) / 180
  const p = parts(d)
  return {
    ...d,
    shaded: d.shaded?.map((i) => mod(i + (p * deg) / 360, p)),
    items: d.items.map((it) => ({
      ...it,
      x: +(50 + (it.x - 50) * Math.cos(a) - (it.y - 50) * Math.sin(a)).toFixed(3),
      y: +(50 + (it.x - 50) * Math.sin(a) + (it.y - 50) * Math.cos(a)).toFixed(3),
      rot: mod((it.rot ?? 0) + deg, 360),
    })),
  }
}

/** The drawing flipped left to right. */
export function mirror(d: Drawing): Drawing {
  const p = parts(d)
  return {
    ...d,
    shaded: d.shaded?.map((i) => p - 1 - i),
    items: d.items.map((it) => ({ ...it, x: 100 - it.x, rot: mod(-(it.rot ?? 0), 360), flip: !it.flip })),
  }
}

const fillable = (it: FigItem) => it.shape === 'poly' || it.shape === 'circle' || it.shape === 'flag'
const map = (d: Drawing, f: (it: FigItem, i: number) => FigItem | undefined): Drawing | undefined => {
  const items = d.items.map(f)
  return items.every(Boolean) ? { ...d, items: items as FigItem[] } : undefined
}

// ---------- Chapter 1: analogy rules ----------

export type FigRuleId = 'rot90' | 'rotm90' | 'rot180' | 'mirror' | 'sides' | 'fill' | 'swap' | 'count'

interface FigRule {
  id: FigRuleId
  pattern: PatternId
  /** undefined when the rule can't be used on this drawing, or makes no visible change. */
  apply: (d: Drawing) => Drawing | undefined
}

const changed = (f: (d: Drawing) => Drawing | undefined) => (d: Drawing) => {
  const out = f(d)
  return out && !same(out, d) ? out : undefined
}

export const FIG_RULES: FigRule[] = [
  { id: 'rot90', pattern: 'fig-rotate', apply: changed((d) => turn(d, 90)) },
  { id: 'rotm90', pattern: 'fig-rotate', apply: changed((d) => turn(d, 270)) },
  { id: 'rot180', pattern: 'fig-rotate', apply: changed((d) => turn(d, 180)) },
  { id: 'mirror', pattern: 'fig-mirror', apply: changed(mirror) },
  {
    id: 'sides',
    pattern: 'fig-sides',
    apply: changed((d) => (d.items.some((it) => it.shape === 'poly') ? map(d, (it) => (it.shape !== 'poly' ? it : (it.n ?? 3) >= 6 ? undefined : { ...it, n: (it.n ?? 3) + 1 })) : undefined)),
  },
  {
    id: 'fill',
    pattern: 'fig-fill',
    apply: changed((d) => (d.items.some(fillable) ? map(d, (it) => (fillable(it) ? { ...it, fill: it.fill === 'solid' ? 'none' : 'solid' } : it)) : undefined)),
  },
  {
    id: 'swap',
    pattern: 'fig-swap',
    apply: changed((d) => {
      // Two shapes, one inside the other: they swap outlines, keeping their sizes.
      const [o, i, ...rest] = d.items
      if (!o || !i || o.x !== i.x || o.y !== i.y || o.size <= i.size || rest.length) return undefined
      return { ...d, items: [{ ...o, shape: i.shape, n: i.n, rot: i.rot }, { ...i, shape: o.shape, n: o.n, rot: o.rot }] }
    }),
  },
  {
    id: 'count',
    pattern: 'fig-count',
    apply: changed((d) => (d.items.some((it) => it.shape === 'dots') ? map(d, (it) => (it.shape !== 'dots' ? it : (it.n ?? 1) >= 5 ? undefined : { ...it, n: (it.n ?? 1) + 1 })) : undefined)),
  },
]

const rule = (id: FigRuleId) => FIG_RULES.find((r) => r.id === id)!

/** "Nearly right" answers for a rule: what a student gets by slipping. */
function nearMisses(id: FigRuleId, c: Drawing, d: Drawing): (Drawing | undefined)[] {
  switch (id) {
    case 'rot90':
    case 'rotm90':
    case 'rot180':
      return [turn(c, 90), turn(c, 180), turn(c, 270), mirror(c), mirror(d)]
    case 'mirror':
      return [turn(mirror(c), 180), turn(c, 180), c]
    case 'sides':
      return [rule('sides').apply(d), map(c, (it, i) => (i === 0 && it.shape === 'poly' ? { ...it, n: (it.n ?? 3) + 1 } : it)), map(c, (it) => (it.shape === 'poly' && (it.n ?? 3) > 3 ? { ...it, n: (it.n ?? 3) - 1 } : it)), c]
    case 'fill':
      return [...c.items.map((_, j) => map(c, (it, i) => (i === j && fillable(it) ? { ...it, fill: it.fill === 'solid' ? 'none' : 'solid' } : it))), c]
    case 'swap':
      return [map(c, (it, i) => (i === 1 ? { ...it, shape: c.items[0].shape, n: c.items[0].n } : it)), map(c, (it, i) => (i === 0 ? { ...it, shape: c.items[1].shape, n: c.items[1].n } : it)), c]
    case 'count':
      return [rule('count').apply(d), map(c, (it) => (it.shape === 'dots' && (it.n ?? 1) > 1 ? { ...it, n: (it.n ?? 1) - 1 } : it)), c]
  }
}

// ---------- making drawings ----------

/** Places shapes can sit: the centre, the four corners and the four edges (each lands on another under a quarter turn or mirror). */
const SLOTS: [number, number][] = [
  [30, 30], [70, 30], [70, 70], [30, 70],
  [50, 25], [75, 50], [50, 75], [25, 50],
]

function smallItem(rng: Rng, [x, y]: [number, number], want?: FigItem['shape']): FigItem {
  const shape = want ?? pick(rng, ['poly', 'poly', 'circle', 'arrow', 'arrow', 'flag', 'ell', 'plus', 'dots'] as const)
  const it: FigItem = { shape, x, y, size: shape === 'dots' ? 26 : 22, rot: 90 * int(rng, 0, 3) }
  if (shape === 'poly') it.n = int(rng, 3, 5)
  if (shape === 'dots') it.n = int(rng, 1, 3)
  if (fillable(it)) it.fill = pick(rng, ['none', 'solid'] as const)
  if (CHIRAL.has(shape)) it.flip = rng() < 0.5
  return it
}

/** Shapes in a box or circle, or one shape inside another. */
function makeDrawing(rng: Rng, id: FigRuleId): Drawing {
  if (id === 'swap' || (id === 'sides' && rng() < 0.5)) {
    const outer = pick(rng, ['poly', 'circle'] as const)
    const inner = pick(rng, ['poly', 'circle', 'poly'] as const)
    return {
      items: [
        { shape: outer, n: outer === 'poly' ? int(rng, 3, 5) : undefined, x: 50, y: 50, size: 80, rot: pick(rng, [0, 180]), fill: 'none' },
        { shape: inner, n: inner === 'poly' ? int(rng, 3, 5) : undefined, x: 50, y: 50, size: 32, rot: pick(rng, [0, 180]), fill: pick(rng, ['none', 'solid'] as const) },
      ],
    }
  }
  const slots = shuffle(rng, SLOTS).slice(0, int(rng, 2, 3))
  const items = slots.map((s) => smallItem(rng, s))
  if (id === 'count' && !items.some((it) => it.shape === 'dots')) items[0] = smallItem(rng, slots[0], 'dots')
  if (id === 'sides' && !items.some((it) => it.shape === 'poly')) items[0] = smallItem(rng, slots[0], 'poly')
  if (id === 'fill' && !items.some(fillable)) items[0] = smallItem(rng, slots[0], 'poly')
  return { frame: pick(rng, ['square', 'square', 'circle', undefined]), items }
}

const clean = (d: Drawing): Drawing => ({
  ...(d.frame ? { frame: d.frame } : {}),
  ...(d.shaded ? { shaded: d.shaded } : {}),
  items: d.items.map((it) => Object.fromEntries(Object.entries(it).filter(([, v]) => v !== undefined && v !== false)) as unknown as FigItem),
})

let counter = 0
const ruleText = (id: FigRuleId) => both((m) => m.figRule(id))

/** One analogy "A : B :: C : ?" where one rule turns A into B; the options are drawings. */
export function generateFigureAnalogy(rng: Rng = Math.random): Question {
  for (;;) {
    const r = pick(rng, FIG_RULES)
    const a = makeDrawing(rng, r.id)
    const c = makeDrawing(rng, r.id)
    const b = r.apply(a)
    const d = r.apply(c)
    if (!b || !d || same(a, c)) continue
    // Every rule that turns A into B must give the same answer for C.
    const fits = FIG_RULES.filter((x) => {
      const y = x.apply(a)
      return y && same(y, b)
    })
    if (fits.some((x) => !x.apply(c) || !same(x.apply(c)!, d))) continue
    const wrong: Drawing[] = []
    const add = (w?: Drawing) => {
      if (w && !same(w, d) && !wrong.some((o) => same(o, w))) wrong.push(w)
    }
    shuffle(rng, nearMisses(r.id, c, d)).forEach((w) => wrong.length < 2 && add(w))
    shuffle(rng, FIG_RULES.map((x) => x.apply(c))).forEach((w) => add(w))
    if (wrong.length < 3) continue
    const order = shuffle(rng, [d, ...wrong.slice(0, 3)]).map(clean)
    const answer = OPTION_KEYS[order.findIndex((o) => same(o, d))]
    const text = ruleText(r.id)
    const working = both((m, l) => m.figWork(text[l]))
    return {
      id: `gen-fig-${r.id}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'analogy',
      terms: ['1', '2', '3', '?'],
      figures: { terms: [clean(a), clean(b), clean(c), '?'], options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, Drawing> },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer,
      rule: text.en,
      working: working.en,
      pattern: r.pattern,
      generated: true,
      kn: { rule: text.kn, working: working.kn },
    }
  }
}

/** Guess the rule: a pair "A : B" and four rule names; exactly one rule turns A into B. */
export function generateFigureRuleQuestion(rng: Rng = Math.random): Question {
  for (;;) {
    const r = pick(rng, FIG_RULES)
    const a = makeDrawing(rng, r.id)
    const b = r.apply(a)
    if (!b) continue
    const fits = (x: FigRule) => {
      const y = x.apply(a)
      return !!y && same(y, b)
    }
    if (FIG_RULES.filter(fits).length !== 1) continue
    // One tempting option from the same kind of change (another turn), the rest from other kinds.
    const others = shuffle(rng, FIG_RULES.filter((x) => x !== r))
    const wrong = [...others.filter((x) => x.pattern === r.pattern).slice(0, 1)]
    for (const x of others) if (wrong.length < 3 && !wrong.includes(x) && x.pattern !== r.pattern) wrong.push(x)
    const order = shuffle(rng, [r, ...wrong])
    const names = (l: Locale) => Object.fromEntries(OPTION_KEYS.map((k, j) => [k, ruleText(order[j].id)[l]])) as Record<OptionKey, string>
    const text = both((m, l) => m.figSpot(ruleText(r.id)[l]))
    const working = both((m, l) => m.soTheRuleIs(ruleText(r.id)[l]))
    return {
      id: `gen-fig-rule-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      kind: 'rule',
      layout: 'analogy',
      terms: ['1', '2'],
      figures: { terms: [clean(a), clean(b)] },
      options: names('en'),
      answer: OPTION_KEYS[order.indexOf(r)],
      rule: text.en,
      working: working.en,
      pattern: r.pattern,
      generated: true,
      kn: { rule: text.kn, working: working.kn, options: names('kn') },
    }
  }
}
