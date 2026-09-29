import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import { GEN } from '../i18n/gen'
import type { Drawing, FigItem } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateFigureAnalogy, generateFigureRuleQuestion, generateFigureSeries } from './figures'
import { mulberry32 } from './numberSeries'

// Independent of figures.ts: a drawing is compared by where its ink actually goes (the corner
// points of every shape after it is flipped, turned and moved), not by its fields.
type Pt = [number, number]
function outline(it: FigItem): Pt[] {
  const r = it.size / 2
  switch (it.shape) {
    case 'poly':
      return Array.from({ length: it.n ?? 3 }, (_, i) => [r * Math.sin((2 * Math.PI * i) / (it.n ?? 3)), -r * Math.cos((2 * Math.PI * i) / (it.n ?? 3))] as Pt)
    case 'circle':
    case 'dot':
      return [[0, 0], [r, 0], [0, r], [-r, 0], [0, -r]]
    case 'dots':
      return Array.from({ length: it.n ?? 1 }, (_, i) => [(i - ((it.n ?? 1) - 1) / 2) * r * 0.9, 0] as Pt)
    case 'arrow':
      return [[0, r], [0, -r], [-r * 0.4, -r * 0.55], [r * 0.4, -r * 0.55]]
    case 'flag':
      return [[-r * 0.4, r], [-r * 0.4, -r], [r * 0.7, -r * 0.55], [-r * 0.4, -r * 0.1]]
    case 'ell':
      return [[-r * 0.5, -r], [-r * 0.5, r], [r * 0.6, r]]
    case 'plus':
      return [[-r, 0], [r, 0], [0, -r], [0, r]]
  }
}
// Rounded to 0.1, nudged so that 22.25 computed two ways can't round differently.
const near = (v: number) => (Math.round(v * 10 + 1e-6) / 10 + 0).toFixed(1)
function ink(d: Drawing): string {
  const items = d.items.map((it) => {
    const a = ((it.rot ?? 0) * Math.PI) / 180
    const pts = outline(it).map(([x, y]) => {
      const fx = it.flip ? -x : x
      return `${near(it.x + fx * Math.cos(a) - y * Math.sin(a))},${near(it.y + fx * Math.sin(a) + y * Math.cos(a))}`
    })
    const filled = it.shape === 'dot' || it.shape === 'dots' || it.fill === 'solid'
    return `${it.shape === 'dot' ? 'circle' : it.shape}${filled ? '#' : ''}[${pts.sort().join(' ')}]`
  })
  return [d.frame ?? '-', [...(d.shaded ?? [])].sort().join('.'), ...items.sort()].join(' | ')
}

// The rules, written again from the chapter: turns and mirror act on the points themselves.
const turnPts = (d: Drawing, deg: number): Drawing => ({ ...d, items: d.items.map((it) => ({ ...it, rot: (it.rot ?? 0) + deg, x: 50 + (it.x - 50) * Math.cos((deg * Math.PI) / 180) - (it.y - 50) * Math.sin((deg * Math.PI) / 180), y: 50 + (it.x - 50) * Math.sin((deg * Math.PI) / 180) + (it.y - 50) * Math.cos((deg * Math.PI) / 180) })) })
const RULES: Record<string, (d: Drawing) => Drawing | undefined> = {
  rot90: (d) => turnPts(d, 90),
  rotm90: (d) => turnPts(d, -90),
  rot180: (d) => turnPts(d, 180),
  mirror: (d) => ({ ...d, items: d.items.map((it) => ({ ...it, x: 100 - it.x, rot: -(it.rot ?? 0), flip: !it.flip })) }),
  sides: (d) => (d.items.some((it) => it.shape === 'poly') ? { ...d, items: d.items.map((it) => (it.shape === 'poly' ? { ...it, n: (it.n ?? 3) + 1 } : it)) } : undefined),
  fill: (d) => ({ ...d, items: d.items.map((it) => (['poly', 'circle', 'flag'].includes(it.shape) ? { ...it, fill: it.fill === 'solid' ? 'none' : 'solid' } : it)) }),
  // The inside and outside shapes (same centre) swap outlines.
  swap: (d) => (d.items.length === 2 && d.items[0].x === d.items[1].x && d.items[0].y === d.items[1].y ? { ...d, items: [{ ...d.items[0], shape: d.items[1].shape, n: d.items[1].n, rot: d.items[1].rot }, { ...d.items[1], shape: d.items[0].shape, n: d.items[0].n, rot: d.items[0].rot }] } : undefined),
  count: (d) => (d.items.some((it) => it.shape === 'dots') ? { ...d, items: d.items.map((it) => (it.shape === 'dots' ? { ...it, n: (it.n ?? 1) + 1 } : it)) } : undefined),
}
const give = (id: string, d: Drawing) => {
  const out = RULES[id](d)
  return out ? ink(out) : ''
}

describe('generateFigureAnalogy', () => {
  it('the stated rule turns A into B and C into the answer, and only the answer', () => {
    const rng = mulberry32(1)
    const seen = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateFigureAnalogy(rng)
      const id = q.id.split('-')[2]
      seen.add(id)
      const [a, b, c, blank] = q.figures!.terms as [Drawing, Drawing, Drawing, string]
      const opts = OPTION_KEYS.map((k) => ink(q.figures!.options![k] as Drawing))
      expect(blank).toBe('?')
      expect(new Set(opts).size, 'four different-looking options').toBe(4)
      expect(ink(b)).not.toBe(ink(a))
      expect(give(id, a)).toBe(ink(b))
      expect(give(id, c)).toBe(opts[OPTION_KEYS.indexOf(q.answer)])
      // Any rule that also explains A → B must point at the same option.
      for (const other of Object.keys(RULES)) if (give(other, a) === ink(b)) expect(give(other, c)).toBe(opts[OPTION_KEYS.indexOf(q.answer)])
      expect(q.rule).toBe(GEN.en.figRule(id))
      if (n % 50 === 0) for (const f of [a, b, c]) expect(renderToStaticMarkup(createElement(DrawingView, { d: f, label: 'x' }))).toContain('<svg')
    }
    expect([...seen].sort()).toEqual(Object.keys(RULES).sort())
  })
})

describe('generateFigureRuleQuestion', () => {
  it('exactly one of the four rules turns the first figure into the second', () => {
    const rng = mulberry32(2)
    for (let n = 0; n < 3000; n++) {
      const q = generateFigureRuleQuestion(rng)
      const [a, b] = q.figures!.terms as Drawing[]
      const names = Object.fromEntries(Object.keys(RULES).map((id) => [GEN.en.figRule(id), id]))
      const fitting = OPTION_KEYS.filter((k) => give(names[q.options[k]], a) === ink(b))
      expect(fitting).toEqual([q.answer])
      expect(new Set(Object.values(q.kn!.options!)).size).toBe(4)
    }
  })
})

// Series steps, written again: turns act on the points (and the shaded parts), the rest on counts.
const partsOf = (d: Drawing) => ({ quad: 4, oct: 8 })[d.frame as 'quad' | 'oct'] ?? 0
const turnAll = (d: Drawing, q: number): Drawing => ({ ...turnPts(d, 90 * q), shaded: d.shaded?.map((i) => (i + (q * partsOf(d)) / 4 + partsOf(d)) % partsOf(d)) })
const STEPS: Record<string, (d: Drawing) => Drawing | undefined> = {
  turn90: (d) => turnAll(d, 1),
  turnm90: (d) => turnAll(d, -1),
  shade: (d) => (d.shaded?.length ? { ...d, shaded: d.shaded.map((i) => (i + 1) % partsOf(d)) } : undefined),
  dots: RULES.count,
  sides: RULES.sides,
  corner: (d) => (d.items.length ? { ...d, items: [{ ...d.items[0], x: 100 - d.items[0].y, y: d.items[0].x }, ...d.items.slice(1)] } : undefined),
  turnfill: (d) => RULES.fill(turnAll(d, 1)),
}
const next = (id: string, d: Drawing) => {
  const out = STEPS[id](d)
  return out ? ink(out) : ''
}

describe('generateFigureSeries', () => {
  it('each figure follows from the one before by the stated rule, and only the answer comes next', () => {
    const rng = mulberry32(3)
    const seen = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateFigureSeries(rng)
      const id = q.id.split('-')[2]
      seen.add(id)
      const figs = q.figures!.terms.slice(0, -1) as Drawing[]
      expect(q.figures!.terms.at(-1)).toBe('?')
      const opts = OPTION_KEYS.map((k) => ink(q.figures!.options![k] as Drawing))
      expect(new Set(opts).size, 'four different-looking options').toBe(4)
      const answer = opts[OPTION_KEYS.indexOf(q.answer)]
      for (let i = 1; i < figs.length; i++) expect(next(id, figs[i - 1])).toBe(ink(figs[i]))
      expect(next(id, figs.at(-1)!)).toBe(answer)
      // Any other rule that makes the same figures must also point at the answer.
      for (const other of Object.keys(STEPS)) {
        const fits = figs.slice(1).every((f, i) => next(other, figs[i]) === ink(f))
        if (fits) expect(next(other, figs.at(-1)!)).toBe(answer)
      }
      if (n % 50 === 0) for (const f of figs) expect(renderToStaticMarkup(createElement(DrawingView, { d: f, label: 'x' }))).toContain('<svg')
    }
    expect([...seen].sort()).toEqual(Object.keys(STEPS).sort())
  })
})
