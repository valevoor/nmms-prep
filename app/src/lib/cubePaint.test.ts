import { describe, expect, it } from 'vitest'
import { COLOUR_COUNTS, coloursOn, FACES, KINDS, kindCount, PAINTED_FACES, SCHEMES, SIZES, smallCubes } from './cubePaint'

describe('cube colouring explorer', () => {
  it('counts each kind of small cube the way the formulas say', () => {
    for (const n of SIZES) {
      const cubes = smallCubes(n)
      expect(cubes).toHaveLength(kindCount('all', n))
      for (const kind of KINDS) {
        const of = cubes.filter((c) => c.kind === kind)
        expect(of, `${kind}, n = ${n}`).toHaveLength(kindCount(kind, n))
        for (const c of of) expect(c.painted).toHaveLength(PAINTED_FACES[kind])
      }
      expect(KINDS.reduce((s, k) => s + kindCount(k, n), 0)).toBe(n ** 3)
    }
  })

  it('paints opposite faces alike with three colours and every face differently with six', () => {
    expect(new Set(Object.values(SCHEMES[6])).size).toBe(6)
    expect(new Set(Object.values(SCHEMES[3])).size).toBe(3)
    expect(new Set(Object.values(SCHEMES[1])).size).toBe(1)
    const s = SCHEMES[3]
    expect([s.top === s.bottom, s.front === s.back, s.left === s.right]).toEqual([true, true, true])
  })

  it('gives a corner cube three colours with six or three colours, and one with one colour', () => {
    const corner = smallCubes(3).find((c) => c.kind === 'corner')!
    expect(coloursOn(corner, 6)).toHaveLength(3)
    expect(coloursOn(corner, 3)).toHaveLength(3)
    expect(coloursOn(corner, 1)).toHaveLength(1)
  })

  it('never paints two opposite faces of one small cube (n ≥ 2)', () => {
    for (const n of SIZES)
      for (const c of smallCubes(n)) {
        const p = new Set(c.painted)
        expect(p.has('top') && p.has('bottom')).toBe(false)
        expect(p.has('left') && p.has('right')).toBe(false)
        expect(p.has('front') && p.has('back')).toBe(false)
      }
    expect(FACES).toHaveLength(6)
    expect(COLOUR_COUNTS).toEqual([1, 3, 6])
  })
})
