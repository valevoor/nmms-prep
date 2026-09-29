/**
 * The Counting of Figures book figures (Chapter 12), typed in as straight lines [x1, y1, x2, y2]
 * (y down), read by eye from the rendered pages 47–49. The book prints several figures stretched
 * sideways (e.g. Q5 and Q6, whose squares come out wider than tall); they are typed in with the
 * stretch taken out, so a square is a square.
 */
import type { Seg } from '../app/src/lib/shapeCount'

const box = (x0: number, y0: number, x1: number, y1: number): Seg[] => [
  [x0, y0, x1, y0],
  [x1, y0, x1, y1],
  [x1, y1, x0, y1],
  [x0, y1, x0, y0],
]
const diagonals = (x0: number, y0: number, x1: number, y1: number): Seg[] => [
  [x0, y0, x1, y1],
  [x1, y0, x0, y1],
]
/** a × b boxes; `shear` moves each row that much to the right (parallelograms). */
const grid = (a: number, b: number, shear = 0): Seg[] => [
  ...Array.from({ length: b + 1 }, (_, j): Seg => [shear * j, j, a + shear * j, j]),
  ...Array.from({ length: a + 1 }, (_, i): Seg => [i, 0, i + shear * b, b]),
]
/** A triangle cut into small triangles, n along each side. */
const triGrid = (n: number): Seg[] => [
  ...Array.from({ length: n }, (_, k): Seg => [-(k + 1), k + 1, k + 1, k + 1]),
  ...Array.from({ length: n }, (_, j): Seg => [-j, j, n - 2 * j, n]),
  ...Array.from({ length: n }, (_, j): Seg => [j, j, 2 * j - n, n]),
]
/** A five-pointed star drawn with five straight lines. */
const star = (): Seg[] => {
  const p = Array.from({ length: 5 }, (_, k) => {
    const a = ((-90 + 72 * k) * Math.PI) / 180
    return [Math.cos(a), Math.sin(a)]
  })
  return p.map((a, k): Seg => [a[0], a[1], p[(k + 2) % 5][0], p[(k + 2) % 5][1]])
}

export const FIGURES: Record<number, Seg[]> = {
  // A triangle with three lines from the top to the base (the first upright), and a cross line
  // from the upright one to the right side.
  1: [
    [0, 0, -108, 210],
    [0, 0, 148, 210],
    [-108, 210, 148, 210],
    [0, 0, 0, 210],
    [0, 0, 52, 210],
    [0, 0, 106, 210],
    [0, 106, (148 * 106) / 210, 106],
  ],
  // A square with both diagonals and both middle lines.
  2: [...box(0, 0, 4, 4), ...diagonals(0, 0, 4, 4), [2, 0, 2, 4], [0, 2, 4, 2]],
  // A five-pointed star.
  3: star(),
  // A triangle cut into small triangles, 4 along each side.
  4: triGrid(4),
  // 4 × 4 boxes.
  5: grid(4, 4),
  // A big square with its middle lines, a small square with its middle lines in the centre, and a
  // square over each corner.
  6: [
    ...box(1, 1, 8, 8),
    [4.5, 1, 4.5, 8],
    [1, 4.5, 8, 4.5],
    ...box(3.5, 3.5, 5.5, 5.5),
    ...box(0, 0, 2, 2),
    ...box(7, 0, 9, 2),
    ...box(0, 7, 2, 9),
    ...box(7, 7, 9, 9),
  ],
  // A square with its middle lines, a tilted square joining the middles of its sides, and a tilted
  // square on each side of that one.
  7: [
    ...box(-2, -2, 2, 2),
    [0, -2, 0, 2],
    [-2, 0, 2, 0],
    [0, -2, 2, 0],
    [2, 0, 0, 2],
    [0, 2, -2, 0],
    [-2, 0, 0, -2],
    [0, -2, -2, -4],
    [-2, -4, -4, -2],
    [-4, -2, -2, 0],
    [0, -2, 2, -4],
    [2, -4, 4, -2],
    [4, -2, 2, 0],
    [-2, 0, -4, 2],
    [-4, 2, -2, 4],
    [-2, 4, 0, 2],
    [2, 0, 4, 2],
    [4, 2, 2, 4],
    [2, 4, 0, 2],
  ],
  // A long box: a strip down the right, a strip along the top of the rest, and a strip down the
  // left under that.
  8: [...box(0, 0, 10, 5), [8.5, 0, 8.5, 5], [0, 1, 8.5, 1], [1.7, 1, 1.7, 5]],
  // 4 × 4 boxes.
  9: grid(4, 4),
  // Five upright strips, some cut across, and a small box in the bottom right corner.
  10: [...box(0, 0, 5, 5), [1, 0, 1, 5], [2, 0, 2, 5], [3, 0, 3, 5], [0, 2, 1, 2], [2, 1, 5, 1], [3, 2, 5, 2], [4, 3, 5, 3], [4, 3, 4, 5]],
  // Parallelograms: 3 × 2 (leaning right going down), then 3 × 3 (leaning left).
  11: grid(3, 2, 0.45),
  12: grid(3, 3, -0.45),
  // A box with its middle lines and a tilted square joining the middles of its sides.
  13: [...box(0, 0, 4, 3), [2, 0, 2, 3], [0, 1.5, 4, 1.5], [2, 0, 4, 1.5], [4, 1.5, 2, 3], [2, 3, 0, 1.5], [0, 1.5, 2, 0]],
  // Three boxes in an L, each with both diagonals (the top box's and the right box's line up).
  14: [...box(0, 0, 4, 3), ...diagonals(0, 0, 4, 3), ...box(0, 3, 4, 6), ...diagonals(0, 3, 4, 6), ...box(4, 3, 8, 6), ...diagonals(4, 3, 8, 6)],
  // A box with both diagonals and a middle line that runs on to the point of a triangle on its right.
  15: [...box(0, 0, 4, 3), ...diagonals(0, 0, 4, 3), [0, 1.5, 7.5, 1.5], [4, 0, 7.5, 1.5], [4, 3, 7.5, 1.5]],
}
