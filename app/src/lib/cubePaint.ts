/**
 * The painted cube behind the Cubes colouring 3D explorer (#/t/cubes-colouring/explore): a big cube with
 * painted faces, cut into n × n × n small cubes. Kept free of three.js so the counts can be tested.
 */

/** In three.js's box order, so a small cube's six materials can be listed straight from it. */
export const FACES = ['right', 'left', 'top', 'bottom', 'front', 'back'] as const
export type CubeFace = (typeof FACES)[number]

export const PAINTS = ['red', 'blue', 'yellow', 'green', 'purple', 'brown'] as const
export type Paint = (typeof PAINTS)[number]

export const COLOUR_COUNTS = [1, 3, 6] as const
export type ColourCount = (typeof COLOUR_COUNTS)[number]

export const SIZES = [2, 3, 4, 5, 6] as const

/**
 * Which colour goes on which face. Six colours follow the book's Q1 (red top, blue bottom, yellow front,
 * green right; the book doesn't say which of back and left is brown, so purple is the back).
 * Three colours paint opposite faces alike.
 */
export const SCHEMES: Record<ColourCount, Record<CubeFace, Paint>> = {
  1: { top: 'red', bottom: 'red', front: 'red', back: 'red', right: 'red', left: 'red' },
  3: { top: 'red', bottom: 'red', front: 'yellow', back: 'yellow', right: 'green', left: 'green' },
  6: { top: 'red', bottom: 'blue', front: 'yellow', back: 'purple', right: 'green', left: 'brown' },
}

/** The four kinds of small cube, by how many painted faces they have. */
export const KINDS = ['corner', 'edge', 'face', 'inside'] as const
export type Kind = (typeof KINDS)[number]
export const PAINTED_FACES: Record<Kind, number> = { corner: 3, edge: 2, face: 1, inside: 0 }

export interface SmallCube {
  /** Column from the left, layer from the bottom, row from the back: 0 … n − 1. */
  x: number
  y: number
  z: number
  painted: CubeFace[]
  kind: Kind
}

export function smallCubes(n: number): SmallCube[] {
  const out: SmallCube[] = []
  const e = n - 1
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const on: Record<CubeFace, boolean> = { right: x === e, left: x === 0, top: y === e, bottom: y === 0, front: z === e, back: z === 0 }
        const painted = FACES.filter((f) => on[f])
        out.push({ x, y, z, painted, kind: KINDS[3 - painted.length] })
      }
  return out
}

/** How many of each kind, by the formulas the chapter teaches. */
export function kindCount(kind: Kind | 'all', n: number): number {
  const m = n - 2
  return { all: n ** 3, corner: 8, edge: 12 * m, face: 6 * m * m, inside: m ** 3 }[kind]
}

/** The different colours on a small cube (with 1 or 3 colours, two faces can share one). */
export const coloursOn = (c: SmallCube, count: ColourCount): Paint[] => [...new Set(c.painted.map((f) => SCHEMES[count][f]))]
