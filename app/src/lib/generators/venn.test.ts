import { describe, expect, it } from 'vitest'
import type { Drawing, FigItem } from '../../types'
import { mulberry32 } from './numberSeries'
import { buildIntersecting } from './venn'

// An independent reading of the picture (not using venn.ts's geometry): each number's position is
// tested against the drawn outlines, and the question is answered from where the numbers are.
type P = [number, number]

function corners(it: FigItem): P[] {
  if (it.shape === 'rect') {
    const w = it.size / 2, h = (it.h ?? it.size) / 2
    return [
      [it.x - w, it.y - h],
      [it.x + w, it.y - h],
      [it.x + w, it.y + h],
      [it.x - w, it.y + h],
    ]
  }
  // A regular n-gon as Drawing.tsx draws it: first corner straight up, then turned by `rot`.
  const n = it.n ?? 3, r = it.size / 2, t = ((it.rot ?? 0) * Math.PI) / 180
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    const x = r * Math.cos(a), y = r * Math.sin(a)
    return [it.x + x * Math.cos(t) - y * Math.sin(t), it.y + x * Math.sin(t) + y * Math.cos(t)]
  })
}

/** Ray casting for polygons; distance for circles. */
function inside(it: FigItem, [x, y]: P): boolean {
  if (it.shape === 'circle') return (x - it.x) ** 2 + (y - it.y) ** 2 < (it.size / 2) ** 2
  const c = corners(it)
  let odd = false
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const [xi, yi] = c[i], [xj, yj] = c[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) odd = !odd
  }
  return odd
}

/** Distance from a point to the outline (sampled). */
function gap(it: FigItem, [x, y]: P): number {
  if (it.shape === 'circle') return Math.abs(Math.hypot(x - it.x, y - it.y) - it.size / 2)
  const c = corners(it)
  let best = Infinity
  c.forEach((a, i) => {
    const b = c[(i + 1) % c.length]
    for (let k = 0; k <= 200; k++) best = Math.min(best, Math.hypot(a[0] + ((b[0] - a[0]) * k) / 200 - x, a[1] + ((b[1] - a[1]) * k) / 200 - y))
  })
  return best
}

const KANNADA = /[ಀ-೿]/
const WORDS = /\b[a-z]{2,}/

describe('generateIntersecting', () => {
  it('exactly one option matches the count read from the picture', () => {
    const rng = mulberry32(5)
    const kinds = new Set<string>()
    for (let n = 0; n < 2000; n++) {
      const { q, ask } = buildIntersecting(rng)
      kinds.add(ask.kind)
      const ctx = JSON.stringify({ prompt: q.prompt, options: q.options, ask })
      const d = q.figures!.terms[0] as Drawing
      const shapes = d.items.filter((it) => it.shape !== 'text')
      const labels = d.items.filter((it) => it.shape === 'text')
      expect(shapes.map((s) => s.shape), ctx).toEqual(['circle', 'rect', 'poly'])
      // Seven numbers, one in each part, all different and well clear of every outline.
      expect(labels, ctx).toHaveLength(7)
      expect(new Set(labels.map((l) => l.label)).size, ctx).toBe(7)
      const where = labels.map((l) => shapes.map((s) => inside(s, [l.x, l.y])))
      expect(new Set(where.map((w) => w.join())).size, ctx).toBe(7)
      for (const w of where) expect(w.some(Boolean), ctx).toBe(true)
      for (const l of labels) for (const s of shapes) expect(gap(s, [l.x, l.y]), ctx).toBeGreaterThan(7)
      // Every drawn thing stays inside the box.
      for (const s of shapes)
        for (const [x, y] of s.shape === 'circle' ? [[s.x - s.size / 2, s.y - s.size / 2], [s.x + s.size / 2, s.y + s.size / 2]] : corners(s)) {
          expect(x, ctx).toBeGreaterThanOrEqual(0)
          expect(x, ctx).toBeLessThanOrEqual(d.w ?? 100)
          expect(y, ctx).toBeGreaterThanOrEqual(0)
          expect(y, ctx).toBeLessThanOrEqual(100)
        }
      // The legend names the shapes in order ○ □ △.
      expect(q.prompt!.indexOf('○'), ctx).toBeLessThan(q.prompt!.indexOf('□'))
      expect(q.prompt!.indexOf('□'), ctx).toBeLessThan(q.prompt!.indexOf('△'))
      const count = labels
        .filter((_, i) => ask.inside.every((s) => where[i][s]) && ask.outside.every((s) => !where[i][s]))
        .reduce((t, l) => t + Number(l.label), 0)
      const fits = Object.entries(q.options)
        .filter(([, v]) => Number(v) === count)
        .map(([k]) => k)
      expect(fits, ctx).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      for (const v of Object.values(q.options)) expect(Number(v), ctx).toBeGreaterThan(0)
      expect(q.working.endsWith(String(count)), ctx).toBe(true)
      // Kannada for every sentence, with no English words left in it.
      for (const f of ['prompt', 'rule'] as const) {
        expect(q.kn?.[f], ctx).toMatch(KANNADA)
        expect(q.kn?.[f], ctx).not.toMatch(WORDS)
      }
    }
    expect([...kinds].sort()).toEqual(['all', 'both', 'not', 'only', 'total', 'two-only'])
  })
})
