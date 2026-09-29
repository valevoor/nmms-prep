import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing, FigItem } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateFoldSheet } from './foldSheet'
import { mulberry32 } from './numberSeries'

// Independent of foldSheet.ts: every shape is turned into the points where its ink goes, and the
// fold is done on those points, by reflecting them in the dotted line as drawn. The half that
// stays is read from the options (all their ink must be on one side of the line).
type Pt = [number, number]
function outline(it: FigItem): Pt[] {
  const r = it.size / 2
  switch (it.shape) {
    case 'poly':
      return Array.from({ length: it.n ?? 3 }, (_, i) => [r * Math.sin((2 * Math.PI * i) / (it.n ?? 3)), -r * Math.cos((2 * Math.PI * i) / (it.n ?? 3))] as Pt)
    case 'circle':
      return [[0, 0], [r, 0], [0, r], [-r, 0], [0, -r]]
    case 'dots':
      return Array.from({ length: it.n ?? 1 }, (_, i) => [(i - ((it.n ?? 1) - 1) / 2) * r * 0.9, 0] as Pt)
    case 'arrow':
      return [[0, r], [0, -r], [-r * 0.4, -r * 0.55], [r * 0.4, -r * 0.55]]
    case 'flag':
      return [[-r * 0.4, r], [-r * 0.4, -r], [r * 0.7, -r * 0.55], [-r * 0.4, -r * 0.1]]
    case 'ell':
      return [[-r * 0.5, -r], [-r * 0.5, r], [r * 0.6, r]]
    default:
      throw new Error(`unexpected shape ${it.shape}`)
  }
}
/** The ink points of one shape, placed on the sheet. */
function points(it: FigItem): Pt[] {
  const a = ((it.rot ?? 0) * Math.PI) / 180
  return outline(it).map(([x, y]) => {
    const fx = it.flip ? -x : x
    return [it.x + fx * Math.cos(a) - y * Math.sin(a), it.y + fx * Math.sin(a) + y * Math.cos(a)]
  })
}
const near = (v: number) => (Math.round(v * 10 + 1e-6) / 10 + 0).toFixed(1)
const kind = (it: FigItem) => `${it.shape}${it.shape === 'dots' || it.fill === 'solid' ? '#' : ''}`
const shapeInk = (k: string, pts: Pt[]) => `${k}[${pts.map(([x, y]) => `${near(x)},${near(y)}`).sort().join(' ')}]`

type Line = [number, number, number, number]
/** Which side of the line a point is on (sign of the cross product). */
const side = ([x1, y1, x2, y2]: Line, [x, y]: Pt) => (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
/** The point reflected in the line. */
function reflect([x1, y1, x2, y2]: Line, [x, y]: Pt): Pt {
  const dx = x2 - x1, dy = y2 - y1
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
  const fx = x1 + t * dx, fy = y1 + t * dy
  return [2 * fx - x, 2 * fy - y]
}

describe('generateFoldSheet', () => {
  it('exactly one option is the sheet folded along the dotted line', () => {
    const rng = mulberry32(6)
    const folds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateFoldSheet(rng)
      const [sheet] = q.figures!.terms as Drawing[]
      expect(q.figures!.terms).toHaveLength(1)
      expect(sheet.dashed).toHaveLength(1)
      const line = sheet.dashed![0]
      folds.add(q.id.split('-')[2])
      const opts = OPTION_KEYS.map((k) => q.figures!.options![k] as Drawing)
      for (const o of opts) expect(o.dashed).toEqual([line])

      // The half that stays: every option's ink is on it.
      const optPts = opts.flatMap((o) => o.items.flatMap(points))
      const s = Math.sign(side(line, optPts[0]))
      for (const p of optPts) expect(Math.sign(side(line, p)), 'options show one half only').toBe(s)

      // Each shape on the sheet is clear of the fold, and there is something on both halves.
      const halves = sheet.items.map((it) => {
        const signs = new Set(points(it).map((p) => Math.sign(side(line, p))))
        expect(signs.size, 'a shape crosses the fold').toBe(1)
        return [...signs][0]
      })
      expect(halves).toContain(s)
      expect(halves).toContain(-s)

      const folded = sheet.items
        .map((it, i) => shapeInk(kind(it), halves[i] === s ? points(it) : points(it).map((p) => reflect(line, p))))
        .sort()
        .join(' | ')
      const inks = opts.map((o) => o.items.map((it) => shapeInk(kind(it), points(it))).sort().join(' | '))
      expect(new Set(inks).size, 'four different-looking options').toBe(4)
      expect(OPTION_KEYS.filter((_, j) => inks[j] === folded)).toEqual([q.answer])
      expect(q.kn!.rule).toMatch(/[ಀ-೿]/)
      expect(q.kn!.working).toMatch(/[ಀ-೿]/)
      if (n % 50 === 0) expect(renderToStaticMarkup(createElement(DrawingView, { d: sheet, label: 'x' }))).toContain('stroke-dasharray')
    }
    expect([...folds].sort()).toEqual(['bottom', 'left', 'lowerLeft', 'right', 'top', 'upperLeft'])
  })
})
