import { describe, expect, it } from 'vitest'
import { AREA, PERIMETER, PI, SHAPE_IDS, SIZES, SOLID_HEIGHT, SURFACE_AREA, VOLUME } from '../data/shapes'
import type { ShapeId, Worked } from '../data/shapes'
import { faceArea, project, solidNet, stack } from './solids'
import type { Face, V3 } from './solids'

/** Works out "2 × (5 + 3)", "½ × 4 × 3" or "22/7 × 7 × 7". Only ever given our own constants. */
const calc = (s: string): number => Function(`return ${s.replace(/×/g, '*').replace(/½/g, '0.5')}`)() as number

/** The circle is drawn with 24 sides, which comes out a little under the book's π = 22/7 figures. */
const near = (shape: ShapeId) => (shape === 'circle' ? 0.02 : 1e-9)
const close = (got: number, want: number, rel: number) => expect(Math.abs(got - want)).toBeLessThanOrEqual(want * rel)

describe('worked formulas', () => {
  const tables: [string, Record<ShapeId, Worked>][] = [
    ['perimeter', PERIMETER],
    ['area', AREA],
    ['volume', VOLUME],
    ['surface area', SURFACE_AREA],
  ]
  for (const [name, table] of tables)
    for (const shape of SHAPE_IDS)
      it(`${name} of ${shape}: the working gives the value`, () => {
        expect(calc(table[shape].work)).toBeCloseTo(table[shape].value, 9)
      })

  it('values follow from the sizes', () => {
    const { a } = SIZES.square
    const { l, b } = SIZES.rect
    const t = SIZES.tri
    const { r } = SIZES.circle
    const H = SOLID_HEIGHT
    expect(t.c).toBe(Math.hypot(t.b, t.h))
    expect([PERIMETER.square.value, PERIMETER.rect.value, PERIMETER.tri.value]).toEqual([4 * a, 2 * (l + b), t.b + t.h + t.c])
    expect(PERIMETER.circle.value).toBeCloseTo(2 * PI * r, 9)
    expect([AREA.square.value, AREA.rect.value, AREA.tri.value]).toEqual([a * a, l * b, (t.b * t.h) / 2])
    expect(AREA.circle.value).toBeCloseTo(PI * r * r, 9)
    for (const s of SHAPE_IDS) expect(VOLUME[s].value).toBeCloseTo(AREA[s].value * H[s], 9)
    expect(SURFACE_AREA.square.value).toBe(6 * a * a)
    expect(SURFACE_AREA.rect.value).toBe(2 * (l * b + l * H.rect + b * H.rect))
    expect(SURFACE_AREA.tri.value).toBe(2 * AREA.tri.value + PERIMETER.tri.value * H.tri)
    expect(SURFACE_AREA.circle.value).toBeCloseTo(2 * AREA.circle.value + PERIMETER.circle.value * H.circle, 9)
  })
})

const total = (faces: Face[]) => faces.reduce((s, f) => s + faceArea(f.pts), 0)
const key = (v: V3) => v.map((x) => (Math.abs(x) < 5e-5 ? 0 : x).toFixed(4)).join(',')

describe('nets', () => {
  for (const shape of SHAPE_IDS) {
    it(`${shape}: the faces add up to the surface area, however far it is open`, () => {
      for (const open of [0, 0.3, 0.7, 1]) close(total(solidNet(shape, open)), SURFACE_AREA[shape].value, near(shape))
    })

    it(`${shape}: fully open, every face lies in one plane`, () => {
      const faces = solidNet(shape, 1)
      const [p0, p1, p2] = faces[0].pts
      const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]
      const e2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]]
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
      const off = (v: V3) => (n[0] * (v[0] - p0[0]) + n[1] * (v[1] - p0[1]) + n[2] * (v[2] - p0[2])) / Math.hypot(n[0], n[1], n[2])
      for (const f of faces) for (const v of f.pts) expect(Math.abs(off(v))).toBeLessThan(1e-9)
    })

    it(`${shape}: closed, it has no gaps (every edge is shared by two faces)`, () => {
      const edges = new Map<string, number>()
      for (const f of solidNet(shape, 0))
        f.pts.forEach((v, i) => {
          const e = [key(v), key(f.pts[(i + 1) % f.pts.length])].sort().join('|')
          edges.set(e, (edges.get(e) ?? 0) + 1)
        })
      for (const [e, n] of edges) expect(n, e).toBe(2)
    })
  }
})

describe('stacks', () => {
  for (const shape of SHAPE_IDS)
    it(`${shape}: base area × height is the volume`, () => {
      const faces = stack(shape, SOLID_HEIGHT[shape])
      close(faceArea(faces[0].pts) * SOLID_HEIGHT[shape], VOLUME[shape].value, near(shape))
      expect(stack(shape, 0)).toHaveLength(1)
    })
})

describe('project', () => {
  it('draws every face, far ones first, with no broken numbers', () => {
    for (const shape of SHAPE_IDS)
      for (const yaw of [-30, 90, 200])
        for (const pitch of [-60, 25, 85]) {
          const faces = solidNet(shape, 0.5)
          const drawn = project(faces, { yaw, pitch }, 358, 280, true)
          expect(drawn).toHaveLength(faces.length)
          for (const f of drawn) expect(f.d + f.grid + JSON.stringify(f.label ?? '')).not.toMatch(/NaN|Infinity/)
        }
  })
})
