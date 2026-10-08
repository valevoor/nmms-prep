import { describe, expect, it } from 'vitest'
import { mulberry32 } from './numberSeries'
import { buildColouring, PAINT } from './cubesColouring'
import type { ColourSpec } from './cubesColouring'
import type { Drawing } from '../../types'

// An independent count (no formulas): every small cube is visited and given the colours of the big
// cube's faces it touches; then the cubes that fit the question are counted.
function brute(spec: ColourSpec): number {
  const { n, colours: c, ask } = spec
  const wanted = ask.kind === 'only' || ask.kind === 'all' ? ask.faces.map((f) => c[f]) : []
  let hit = 0
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const has: string[] = []
        if (x === 0) has.push(c.left)
        if (x === n - 1) has.push(c.right)
        if (y === 0) has.push(c.front)
        if (y === n - 1) has.push(c.back)
        if (z === 0) has.push(c.bottom)
        if (z === n - 1) has.push(c.top)
        if (ask.kind === 'total') hit++
        else if (ask.kind === 'faces' && has.length === ask.k) hit++
        else if (ask.kind === 'only' && has.length === wanted.length && wanted.every((w) => has.includes(w))) hit++
        else if (ask.kind === 'all' && wanted.every((w) => has.includes(w))) hit++
      }
  return hit
}

const KANNADA = /[ಀ-೿]/
const WORDS = /\b[a-z]{2,}/

describe('generateCubesColouring', () => {
  it('exactly one option matches the count made cube by cube', () => {
    const rng = mulberry32(13)
    const seen = new Set<string>()
    for (let i = 0; i < 3000; i++) {
      const { q, spec } = buildColouring(rng)
      const { n, colours, ask } = spec
      // The question states the cube's size and every face's colour.
      expect(q.prompt).toContain(`divided into ${n} equal parts`)
      const place = { top: 'on the top', bottom: 'on the bottom', front: 'in front', back: 'at the back', left: 'on the left', right: 'on the right' }
      for (const [f, where] of Object.entries(place)) expect(q.prompt).toContain(`${colours[f as keyof typeof place]} ${where}`)
      expect(new Set(Object.values(colours)).size).toBe(6)
      if (ask.kind === 'only' || ask.kind === 'all') for (const f of ask.faces) expect(q.prompt!.split('. ').pop()).toContain(colours[f])
      const count = brute(spec)
      const values = Object.values(q.options)
      expect(new Set(values).size).toBe(4)
      values.forEach((v) => expect(Number(v)).toBeGreaterThanOrEqual(0))
      const fits = Object.entries(q.options).filter(([, v]) => Number(v) === count)
      expect(fits.map(([k]) => k), q.prompt).toEqual([q.answer])
      expect(q.working.endsWith(`= ${count}`), q.working).toBe(true)
      expect(q.kn!.working!.endsWith(`= ${count}`), q.kn!.working).toBe(true)
      for (const f of ['prompt', 'rule', 'working'] as const) expect(q.kn![f]).not.toMatch(WORDS)
      for (const f of ['prompt', 'rule'] as const) expect(q.kn![f]).toMatch(KANNADA)
      seen.add(ask.kind === 'faces' ? `faces${ask.k}` : ask.kind === 'total' ? 'total' : `${ask.kind}${ask.faces.length}-${count}`)
    }
    // Every kind of question comes up, including colours on opposite faces (0) and at a corner (1).
    for (const k of ['faces0', 'faces1', 'faces2', 'faces3', 'total', 'all2-0', 'all3-0', 'all3-1', 'only1-1', 'only2-1']) expect(seen).toContain(k)
  })
})

describe('the cube picture', () => {
  it('paints each face its colour, cut n × n, and names the colour beside it', () => {
    const rng = mulberry32(31)
    for (let i = 0; i < 300; i++) {
      const { q, spec } = buildColouring(rng)
      const d = q.figures!.terms[0] as Drawing
      // Front-top view (front, top, right), then back-bottom view (back, bottom, left).
      const order = ['front', 'top', 'right', 'back', 'bottom', 'left'] as const
      expect(d.faces).toHaveLength(6)
      d.faces!.forEach((f, j) => {
        const colour = spec.colours[order[j]]
        expect(f.fill).toBe(PAINT[colour].fill)
        // n − 1 lines each way cut the face into n × n squares.
        expect(f.grid).toHaveLength(2 * (spec.n - 1))
        // Its label is the nearest one to the face's centre, and stays inside the picture.
        const cx = (f.pts[0] + f.pts[2] + f.pts[4] + f.pts[6]) / 4
        const cy = (f.pts[1] + f.pts[3] + f.pts[5] + f.pts[7]) / 4
        const near = [...d.items].sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0]
        expect(near.label).toBe(colour)
        expect(near.labelKn).toMatch(KANNADA)
      })
      // The two views don't overlap: the first lies left of the divider, the second right of it.
      const mid = d.dashed![0][0]
      d.faces!.forEach((f, j) => f.pts.filter((_, k) => k % 2 === 0).forEach((x) => expect(j < 3 ? x < mid : x > mid).toBe(true)))
    }
  })
})
