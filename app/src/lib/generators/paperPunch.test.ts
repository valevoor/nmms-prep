import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generatePaperPunch } from './paperPunch'
import { mulberry32 } from './numberSeries'

// Independent of paperPunch.ts: the folds are read off the drawn steps (the solid outline is the
// paper still showing; the edge that moved is the fold line), the punched holes off the last step,
// and the sheet is opened out by reflecting every hole in each fold line, last fold first.
type Pt = [number, number]
type Box = [number, number, number, number]
function box(d: Drawing): Box {
  const xs = d.lines!.flatMap(([x1, , x2]) => [x1, x2])
  const ys = d.lines!.flatMap(([, y1, , y2]) => [y1, y2])
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
}
const key = ([x, y]: Pt) => `${(Math.round(x * 10) / 10).toFixed(1)},${(Math.round(y * 10) / 10).toFixed(1)}`
const set = (pts: Pt[]) => [...new Set(pts.map(key))].sort().join(' ')

describe('generatePaperPunch', () => {
  it('exactly one option is the sheet opened out', () => {
    const rng = mulberry32(7)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generatePaperPunch(rng)
      const terms = q.figures!.terms as Drawing[]
      expect(terms.length === 2 || terms.length === 3).toBe(true)

      // Each fold halves the paper: one edge moves to the middle of the part before.
      let prev: Box = [8, 92, 8, 92]
      const folds: ['x' | 'y', number][] = []
      for (const t of terms.slice(0, -1)) {
        const b = box(t)
        expect(t.items.filter((it) => it.shape === 'arrow'), 'each fold has an arrow').toHaveLength(1)
        const moved = [0, 1, 2, 3].filter((i) => b[i] !== prev[i])
        expect(moved, 'one edge moves').toHaveLength(1)
        const i = moved[0]
        const mid = i < 2 ? (prev[0] + prev[1]) / 2 : (prev[2] + prev[3]) / 2
        expect(b[i]).toBeCloseTo(mid)
        folds.push([i < 2 ? 'x' : 'y', b[i]])
        prev = b
      }
      const last = terms[terms.length - 1]
      expect(box(last)).toEqual(prev)
      const punched = last.items.filter((it) => it.shape === 'dot').map((it) => [it.x, it.y] as Pt)
      expect(punched.length).toBeGreaterThan(0)
      for (const [x, y] of punched) {
        expect(x > prev[0] && x < prev[1] && y > prev[2] && y < prev[3], 'holes are on the folded paper').toBe(true)
      }

      let open = punched
      for (const [line, at] of [...folds].reverse())
        open = open.flatMap(([x, y]) => [[x, y], line === 'x' ? [2 * at - x, y] : [x, 2 * at - y]] as Pt[])
      const want = set(open)
      expect(open.length, 'every fold doubles the holes').toBe(punched.length * 2 ** folds.length)

      const got = OPTION_KEYS.map((k) => set((q.figures!.options![k] as Drawing).items.map((it) => [it.x, it.y] as Pt)))
      expect(new Set(got).size, 'four different options').toBe(4)
      expect(OPTION_KEYS.filter((_, j) => got[j] === want)).toEqual([q.answer])
      expect(q.kn!.rule).toMatch(/[ಀ-೿]/)
      expect(q.kn!.working).toMatch(/[ಀ-೿]/)
      kinds.add(`${folds.length}${folds.map((f) => f[0]).join('')}`)
      if (n % 50 === 0) expect(renderToStaticMarkup(createElement(DrawingView, { d: terms[0], label: 'x' }))).toContain('stroke-dasharray')
    }
    expect([...kinds].sort()).toEqual(['1x', '1y', '2xx', '2xy', '2yx', '2yy'])
  })
})
