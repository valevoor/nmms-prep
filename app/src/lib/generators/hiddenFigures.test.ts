import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateHiddenFigure } from './hiddenFigures'
import { mulberry32 } from './numberSeries'

// Independent of hiddenFigures.ts (no lattice): plain geometry on the drawn lines. A copy of the
// figure, moved but not turned or resized, is in a picture when every point along each of its lines
// lies on a line of the picture running the same way. A copy's corner (where two of its lines meet
// at an angle) must sit where two of the picture's lines cross or meet, which gives the moves to try.
type L = [number, number, number, number]
const EPS = 1e-6

function crossing(a: L, b: L): [number, number] | undefined {
  const [x1, y1, x2, y2] = a, [x3, y3, x4, y4] = b
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3)
  if (Math.abs(d) < EPS) return undefined
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d
  if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return undefined
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
}

/** Is (px, py) on line l, and does l run the same way as the direction (dx, dy)? */
function onParallel(l: L, px: number, py: number, dx: number, dy: number) {
  const [x1, y1, x2, y2] = l
  const ex = x2 - x1, ey = y2 - y1
  if (Math.abs(ex * dy - ey * dx) > 1e-3 * Math.hypot(ex, ey) * Math.hypot(dx, dy)) return false
  if (Math.abs((px - x1) * ey - (py - y1) * ex) > 0.05 * Math.hypot(ex, ey)) return false
  const t = ((px - x1) * ex + (py - y1) * ey) / (ex * ex + ey * ey)
  return t > -1e-3 && t < 1 + 1e-3
}

function holds(fig: L[], pic: L[]): boolean {
  // A corner of the figure: an end shared by two lines that are not parallel.
  const ends = fig.flatMap(([x1, y1, x2, y2], i) => [[x1, y1, i], [x2, y2, i]] as const)
  const corner = ends.find(([x, y, i]) =>
    ends.some(([x2, y2, j]) => j !== i && Math.hypot(x - x2, y - y2) < EPS && crossing(fig[i], fig[j]) !== undefined),
  )
  expect(corner, 'the figure has a corner').toBeDefined()
  const spots: [number, number][] = []
  for (let i = 0; i < pic.length; i++) for (let j = i + 1; j < pic.length; j++) {
    const c = crossing(pic[i], pic[j])
    if (c) spots.push(c)
  }
  return spots.some(([sx, sy]) => {
    const mx = sx - corner![0], my = sy - corner![1]
    return fig.every(([x1, y1, x2, y2]) => {
      const len = Math.hypot(x2 - x1, y2 - y1)
      const steps = Math.ceil(len / 1.5)
      for (let s = 0; s <= steps; s++) {
        const px = x1 + ((x2 - x1) * s) / steps + mx, py = y1 + ((y2 - y1) * s) / steps + my
        if (!pic.some((l) => onParallel(l, px, py, x2 - x1, y2 - y1))) return false
      }
      return true
    })
  })
}

const linesOf = (d: Drawing) => d.lines as L[]
const look = (d: Drawing) =>
  linesOf(d)
    .map(([a, b, c, e]) => (a < c || (a === c && b < e) ? [a, b, c, e] : [c, e, a, b]).join(','))
    .sort()
    .join('|')

describe('generateHiddenFigure', () => {
  it('the figure is in the answer and in no other option', () => {
    const rng = mulberry32(3)
    let traps = 0
    for (let n = 0; n < 1500; n++) {
      const q = generateHiddenFigure(rng)
      const [fig] = q.figures!.terms as Drawing[]
      const opts = OPTION_KEYS.map((k) => q.figures!.options![k] as Drawing)
      expect(new Set(opts.map(look)).size, 'four different options').toBe(4)
      const holding = OPTION_KEYS.filter((_, i) => holds(linesOf(fig), linesOf(opts[i])))
      expect(holding).toEqual([q.answer])
      expect(q.kn?.working).toMatch(/[ಀ-೿]/)
      expect(q.kn?.rule).toMatch(/[ಀ-೿]/)
      if (q.working.includes('turned or flipped')) traps++
      if (n % 100 === 0) for (const f of [fig, ...opts]) expect(renderToStaticMarkup(createElement(DrawingView, { d: f, label: 'x' }))).toContain('<line')
    }
    expect(traps).toBeGreaterThan(100)
  })
})
