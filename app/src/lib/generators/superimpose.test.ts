import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing } from '../../types'
import { OPTION_KEYS } from '../../types'
import { mulberry32 } from './numberSeries'
import { generateSuperimpose } from './superimpose'

// Independent of superimpose.ts (no lattice): plain geometry on what is drawn. Two pictures look the
// same when every point along each line of one lies on a line of the other, and both have the same
// circles. The answer must look like the two figures drawn together (the second turned a quarter turn
// clockwise first when the question says so), and no other option may.
type L = [number, number, number, number]

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
const circles = (d: Drawing) =>
  d.items
    .map((it) => `${it.shape}@${it.x},${it.y}/${it.size}`)
    .sort()
    .join('|')
const same = (a: Drawing, b: Drawing) => covered(a.lines!, b.lines!) && covered(b.lines!, a.lines!) && circles(a) === circles(b)

/** The drawing turned a quarter turn clockwise about the middle of its 100 × 100 box (y runs down). */
const turned = (d: Drawing): Drawing => ({
  ...d,
  items: d.items.map((it) => ({ ...it, x: 100 - it.y, y: it.x })),
  lines: d.lines!.map(([x1, y1, x2, y2]) => [100 - y1, x1, 100 - y2, x2]),
})
const together = (a: Drawing, b: Drawing): Drawing => ({ ...a, items: [...a.items, ...b.items], lines: [...a.lines!, ...b.lines!] })

describe('generateSuperimpose', () => {
  it('only the answer holds both figures and nothing else', () => {
    const rng = mulberry32(11)
    let turns = 0
    let traps = 0
    for (let n = 0; n < 1500; n++) {
      const q = generateSuperimpose(rng)
      const [first, second] = q.figures!.terms as Drawing[]
      const turn = !!q.prompt
      const target = together(first, turn ? turned(second) : second)
      const opts = OPTION_KEYS.map((k) => q.figures!.options![k] as Drawing)
      expect(OPTION_KEYS.filter((_, i) => same(target, opts[i]))).toEqual([q.answer])
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(same(opts[i], opts[j]), 'four different options').toBe(false)
      if (turn) {
        turns++
        expect(q.kn?.prompt).toMatch(/[ಀ-೿]/)
        // Turning must change the second figure, or the instruction would not matter.
        expect(same(second, turned(second))).toBe(false)
        if (opts.some((o) => same(o, together(first, second)))) traps++
      }
      expect(q.kn?.working).toMatch(/[ಀ-೿]/)
      expect(q.kn?.rule).toMatch(/[ಀ-೿]/)
      if (n % 100 === 0) for (const f of [first, second, ...opts]) expect(renderToStaticMarkup(createElement(DrawingView, { d: f, label: 'x' }))).toContain('<line')
    }
    expect(turns).toBeGreaterThan(300)
    expect(traps).toBeGreaterThan(200)
  })
})
