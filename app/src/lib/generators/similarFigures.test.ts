import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing, FigItem } from '../../types'
import { OPTION_KEYS } from '../../types'
import { mulberry32 } from './numberSeries'
import { generateSimilarFigure } from './similarFigures'

// Independent of similarFigures.ts and figures.ts: a drawing is compared by where its ink goes
// (the corner points of every shape after it is flipped, turned and moved), and a turn acts on
// those points directly.
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
    case 'rect': {
      const h = (it.h ?? it.size) / 2
      return [[-r, -h], [r, -h], [r, h], [-r, h]]
    }
    case 'text':
      return [[0, 0]]
  }
}
const near = (v: number) => (Math.round(v * 10 + 1e-6) / 10 + 0).toFixed(1)
/** Every inked point of the drawing, turned `deg` clockwise about the centre of the box. */
function ink(d: Drawing, deg = 0): string {
  const t = (deg * Math.PI) / 180
  const items = d.items.map((it) => {
    const a = ((it.rot ?? 0) * Math.PI) / 180
    const pts = outline(it).map(([x, y]) => {
      const fx = it.flip ? -x : x
      const px = it.x + fx * Math.cos(a) - y * Math.sin(a) - 50
      const py = it.y + fx * Math.sin(a) + y * Math.cos(a) - 50
      return `${near(50 + px * Math.cos(t) - py * Math.sin(t))},${near(50 + px * Math.sin(t) + py * Math.cos(t))}`
    })
    const filled = it.shape === 'dot' || it.shape === 'dots' || it.fill === 'solid'
    return `${it.shape === 'dot' ? 'circle' : it.shape}${filled ? '#' : ''}[${pts.sort().join(' ')}]`
  })
  return [d.frame ?? '-', ...items.sort()].join(' | ')
}

describe('generateSimilarFigure', () => {
  it('exactly one option is the figure turned, and it is not the figure itself', () => {
    const rng = mulberry32(4)
    const seen = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateSimilarFigure(rng)
      const deg = Number(q.id.split('-')[2])
      seen.add(String(deg))
      const [fig] = q.figures!.terms as Drawing[]
      expect(q.figures!.terms).toHaveLength(1)
      const opts = OPTION_KEYS.map((k) => ink(q.figures!.options![k] as Drawing))
      expect(new Set(opts).size, 'four different-looking options').toBe(4)
      const turns = [0, 90, 180, 270].map((k) => ink(fig, k))
      const fitting = OPTION_KEYS.filter((_, j) => turns.includes(opts[j]))
      expect(fitting).toEqual([q.answer])
      const ans = opts[OPTION_KEYS.indexOf(q.answer)]
      expect(ans).not.toBe(turns[0])
      expect(ans).toBe(ink(fig, deg))
      expect(q.kn!.rule).toMatch(/[ಀ-೿]/)
      expect(q.kn!.working).toMatch(/[ಀ-೿]/)
      if (n % 50 === 0) expect(renderToStaticMarkup(createElement(DrawingView, { d: fig, label: 'x' }))).toContain('<svg')
    }
    expect([...seen].sort()).toEqual(['180', '270', '90'])
  })
})
