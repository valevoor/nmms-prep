import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateMissingPart } from './missingPart'
import { mulberry32 } from './numberSeries'

// Independent of missingPart.ts (no lattice): plain geometry on what is drawn. Each option is shrunk
// into the quarter marked '?', and the figure it makes is compared with itself turned or flipped about
// the middle. An option fits when the whole figure looks the same after a turn or flip that carries the
// gap onto another quarter; exactly the answer must fit.
type L = [number, number, number, number]
type Pt = [number, number]

const near = (l: L, px: number, py: number) => {
  const [x1, y1, x2, y2] = l
  const ex = x2 - x1, ey = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * ex + (py - y1) * ey) / (ex * ex + ey * ey)))
  return Math.hypot(x1 + t * ex - px, y1 + t * ey - py) < 0.5
}
const covered = (a: L[], b: L[]) =>
  a.every(([x1, y1, x2, y2]) => {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1))
    return Array.from({ length: steps + 1 }, (_, s) => s / steps).every((t) => b.some((l) => near(l, x1 + t * (x2 - x1), y1 + t * (y2 - y1))))
  })
const dotKey = (ps: Pt[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).sort().join('|')

interface Pic {
  lines: L[]
  dots: Pt[]
}
const same = (a: Pic, b: Pic) => covered(a.lines, b.lines) && covered(b.lines, a.lines) && dotKey(a.dots) === dotKey(b.dots)
const pic = (d: Drawing): Pic => ({ lines: d.lines ?? [], dots: d.items.filter((it) => it.shape === 'dot').map((it) => [it.x, it.y]) })

/** Turns and flips of the 100 × 100 box about its middle (y runs down). */
const MOVES: ((p: Pt) => Pt)[] = [
  ([x, y]) => [100 - y, x],
  ([x, y]) => [100 - x, 100 - y],
  ([x, y]) => [y, 100 - x],
  ([x, y]) => [100 - x, y],
  ([x, y]) => [x, 100 - y],
  ([x, y]) => [y, x],
  ([x, y]) => [100 - y, 100 - x],
]
const moved = (p: Pic, f: (p: Pt) => Pt): Pic => ({
  lines: p.lines.map(([x1, y1, x2, y2]) => [...f([x1, y1]), ...f([x2, y2])] as L),
  dots: p.dots.map(f),
})

describe('generateMissingPart', () => {
  it('only the answer completes a figure that repeats', () => {
    const rng = mulberry32(5)
    const rules = new Set<string>()
    for (let n = 0; n < 1500; n++) {
      const q = generateMissingPart(rng)
      const fig = q.figures!.terms[0] as Drawing
      const mark = fig.items.find((it) => it.shape === 'text' && it.label === '?')!
      // The gap is the quarter holding the '?'; an option's 8..92 box shrinks into it.
      const gx = mark.x < 50 ? 8 : 50, gy = mark.y < 50 ? 8 : 50
      const into = ([x, y]: Pt): Pt => [gx + (x - 8) / 2, gy + (y - 8) / 2]
      const shown = pic(fig)
      // Nothing is drawn inside the gap.
      for (const [x1, y1, x2, y2] of shown.lines) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        expect(mx > gx + 0.5 && mx < gx + 41.5 && my > gy + 0.5 && my < gy + 41.5).toBe(false)
      }
      const opts = OPTION_KEYS.map((k) => pic(q.figures!.options![k] as Drawing))
      const fits = OPTION_KEYS.filter((_, i) => {
        const put = moved(opts[i], into)
        const whole: Pic = { lines: [...shown.lines, ...put.lines], dots: [...shown.dots, ...put.dots] }
        return MOVES.some((f) => {
          const [cx, cy] = f([gx + 21, gy + 21])
          return (cx !== gx + 21 || cy !== gy + 21) && same(whole, moved(whole, f))
        })
      })
      expect(fits).toEqual([q.answer])
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(same(opts[i], opts[j]), 'four different options').toBe(false)
      rules.add(q.rule)
      expect(q.kn?.working).toMatch(/[ಀ-೿]/)
      expect(q.kn?.rule).toMatch(/[ಀ-೿]/)
      if (n % 100 === 0) for (const f of [fig, ...OPTION_KEYS.map((k) => q.figures!.options![k] as Drawing)]) expect(renderToStaticMarkup(createElement(DrawingView, { d: f, label: 'x' }))).toContain('<line')
    }
    expect(rules.size).toBe(2) // both kinds of figure come up
  })
})
