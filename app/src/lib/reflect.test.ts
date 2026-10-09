import { describe, expect, it } from 'vitest'
import { boardView, emptyBoard, keyboardOnly, looksSame, partner, placePoint, SHAPE_KINDS, shapePath, SIZE, startBoard, tapCell, textView } from './reflect'
import type { Board, BoardView, Kind } from './reflect'

const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('')

function rng(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31
    return seed / 2 ** 31
  }
}

function randomBoard(r: () => number): Board {
  const b = emptyBoard()
  const n = 1 + Math.floor(r() * 5)
  for (let i = 0; i < n; i++)
    b[Math.floor(r() * b.length)] = { k: SHAPE_KINDS[Math.floor(r() * 4)], rot: 90 * Math.floor(r() * 4), filled: r() < 0.5 }
  return b
}

/** Every shape as its corners on the whole 160x160 board, in path order. */
const W = SIZE * 40
function globalShapes(v: BoardView): string[] {
  return v.cells
    .map((c, i) => {
      if (!c.d) return ''
      const [ox, oy] = [(i % SIZE) * 40, Math.floor(i / SIZE) * 40]
      const pts = [...c.d.matchAll(/[ML](\d+) (\d+)/g)].map((m) => `${+m[1] + ox},${+m[2] + oy}`)
      // A closed shape looks the same whichever corner its path starts at; the flag's pole foot is fixed.
      return (c.filled ? 'F ' : 'O ') + (c.d.endsWith('Z') ? pts.sort() : pts).join(' ')
    })
    .filter(Boolean)
    .sort()
}

/** The image worked out independently: the whole board's coordinates flipped across its middle line. */
function expectedImage(b: Board, kind: Kind): string[] {
  return b
    .map((cell, i) => {
      if (!cell) return ''
      const [ox, oy] = [(i % SIZE) * 40, Math.floor(i / SIZE) * 40]
      const pts = [...shapePath(cell.k, cell.rot).matchAll(/[ML](\d+) (\d+)/g)].map((m) => {
        const [x, y] = [+m[1] + ox, +m[2] + oy]
        return kind === 'mirror' ? `${W - x},${y}` : `${x},${W - y}`
      })
      return (cell.filled ? 'F ' : 'O ') + (cell.k === 'flag' ? pts : pts.sort()).join(' ')
    })
    .filter(Boolean)
    .sort()
}

describe('flips', () => {
  it('turns a point clockwise, then flips it', () => {
    expect(placePoint([10, 6], 90, 'n')).toEqual([34, 10])
    expect(placePoint([10, 6], 0, 'x')).toEqual([30, 6])
    expect(placePoint([10, 6], 0, 'y')).toEqual([10, 34])
  })

  it("a flag's pennant points the other way in a mirror, and hangs from the bottom in water", () => {
    const tip = (d: string) => [...d.matchAll(/[ML](\d+) (\d+)/g)].map((m) => [+m[1], +m[2]])
    const [foot, top, point] = tip(shapePath('flag', 0, 'x'))
    expect(point[0]).toBeLessThan(top[0])
    expect(foot[1]).toBeGreaterThan(top[1])
    const [wFoot, wTop, wPoint] = tip(shapePath('flag', 0, 'y'))
    expect(wPoint[0]).toBeGreaterThan(wTop[0])
    expect(wFoot[1]).toBeLessThan(wTop[1])
  })
})

describe('characters', () => {
  it('keeps only keyboard characters', () => {
    expect(keyboardOnly('Ab+ಕ>é 7')).toBe('Ab+> 7')
  })

  it('pairs work both ways', () => {
    for (const f of ['x', 'y'] as const)
      for (const ch of ASCII) {
        const p = partner(f, ch)
        if (p) expect(partner(f, p)).toBe(ch)
      }
  })

  it("knows the book's letters and the bracket pairs", () => {
    expect(partner('x', 'b')).toBe('d')
    expect(partner('x', '(')).toBe(')')
    expect(partner('x', '>')).toBe('<')
    expect(partner('y', 'M')).toBe('W')
    expect(looksSame('x', 'A')).toBe(true)
    expect(looksSame('y', 'B')).toBe(true)
    expect(looksSame('x', 'N')).toBe(false)
  })

  it('no character both looks the same and turns into another one', () => {
    for (const f of ['x', 'y'] as const) for (const ch of ASCII) if (partner(f, ch)) expect(looksSame(f, ch)).toBe(false)
  })

  it('the mirror image reverses the order and turns every character; water keeps the order', () => {
    const m = textView('Nb>7', true, 'x')
    expect(m.glyphs.map((g) => g.ch).join('')).toBe('7>bN')
    expect(m.glyphs.every((g) => g.flip === 'x')).toBe(true)
    const w = textView('Nb>7', false, 'y')
    expect(w.glyphs.map((g) => g.ch).join('')).toBe('Nb>7')
    expect(w.glyphs.every((g) => g.flip === 'y')).toBe(true)
  })
})

describe('shapes', () => {
  it('draws the image the way the whole board flips', () => {
    const r = rng(11)
    for (let i = 0; i < 2000; i++) {
      const b = randomBoard(r)
      expect(globalShapes(boardView(b, 'x', 'x'))).toEqual(expectedImage(b, 'mirror'))
      expect(globalShapes(boardView(b, 'y', 'y'))).toEqual(expectedImage(b, 'water'))
    }
  })

  it('the starting board looks different flipped than only moved, in a mirror and in water', () => {
    const b = startBoard()
    const shapes = (v: BoardView) => globalShapes(v).join('|')
    expect(shapes(boardView(b, 'x', 'x'))).not.toBe(shapes(boardView(b, 'x', 'n')))
    expect(shapes(boardView(b, 'y', 'y'))).not.toBe(shapes(boardView(b, 'y', 'n')))
  })

  it('a tap places a shape, turns it, or erases it', () => {
    let b = tapCell(emptyBoard(), 5, 'flag', true)
    expect(b[5]).toEqual({ k: 'flag', rot: 0, filled: true })
    b = tapCell(b, 5, 'flag', false)
    expect(b[5]).toEqual({ k: 'flag', rot: 90, filled: true })
    b = tapCell(b, 5, 'sq', false)
    expect(b[5]).toEqual({ k: 'sq', rot: 0, filled: false })
    expect(tapCell(b, 5, 'erase', false)[5]).toBeNull()
  })
})
