/** The "Shapes and sizes" page (#/shapes): the four flat shapes, the solids they build, and their worked numbers. */

export const SHAPE_IDS = ['square', 'rect', 'tri', 'circle'] as const
export type ShapeId = (typeof SHAPE_IDS)[number]

export const SHAPE_STEPS = ['perimeter', 'area', 'volume', 'net'] as const
export type ShapeStep = (typeof SHAPE_STEPS)[number]

/** π as Class 8 textbooks use it, so a circle of radius 7 gives whole numbers. */
export const PI = 22 / 7

/** Sizes in units. The triangle has a right angle: base 4, height 3, slant side 5. */
export const SIZES = {
  square: { a: 4 },
  rect: { l: 5, b: 3 },
  tri: { b: 4, h: 3, c: 5 },
  circle: { r: 7 },
} as const

/** How tall each solid is: a cube, a cuboid, a triangular prism, a cylinder. */
export const SOLID_HEIGHT: Record<ShapeId, number> = { square: 4, rect: 4, tri: 4, circle: 10 }

/**
 * A formula, the same formula with the numbers in, and its value. `rule` and `work` are maths only
 * (no words), so they read the same in every language. shapes.test.ts works each one out.
 */
export interface Worked {
  rule: string
  work: string
  value: number
}

export const PERIMETER: Record<ShapeId, Worked> = {
  square: { rule: '4 × a', work: '4 × 4', value: 16 },
  rect: { rule: '2 × (l + b)', work: '2 × (5 + 3)', value: 16 },
  tri: { rule: 'a + b + c', work: '3 + 4 + 5', value: 12 },
  circle: { rule: '2 × π × r', work: '2 × 22/7 × 7', value: 44 },
}

export const AREA: Record<ShapeId, Worked> = {
  square: { rule: 'a × a', work: '4 × 4', value: 16 },
  rect: { rule: 'l × b', work: '5 × 3', value: 15 },
  tri: { rule: '½ × b × h', work: '½ × 4 × 3', value: 6 },
  circle: { rule: 'π × r × r', work: '22/7 × 7 × 7', value: 154 },
}

/** Volume at the full height in SOLID_HEIGHT. */
export const VOLUME: Record<ShapeId, Worked> = {
  square: { rule: 'a × a × a', work: '4 × 4 × 4', value: 64 },
  rect: { rule: 'l × b × h', work: '5 × 3 × 4', value: 60 },
  tri: { rule: '(½ × b × h) × H', work: '(½ × 4 × 3) × 4', value: 24 },
  circle: { rule: 'π × r × r × h', work: '22/7 × 7 × 7 × 10', value: 1540 },
}

export const SURFACE_AREA: Record<ShapeId, Worked> = {
  square: { rule: '6 × a × a', work: '6 × 4 × 4', value: 96 },
  rect: { rule: '2 × (lb + lh + bh)', work: '2 × (15 + 20 + 12)', value: 94 },
  tri: { rule: '2 × (½ × b × h) + (a + b + c) × H', work: '2 × 6 + (3 + 4 + 5) × 4', value: 60 },
  circle: { rule: '2 × π × r × r + 2 × π × r × h', work: '2 × 154 + 44 × 10', value: 748 },
}
