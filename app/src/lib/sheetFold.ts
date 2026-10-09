// Draw and fold (Ch 6, Figure Fold Transparent Sheet): the geometry behind pages/SheetFold.tsx.
// The sheet runs from 0 to 100 each way, y pointing down (as on screen), and every fold line goes
// through its middle, so one half turns about that line and lands on the other half, mirrored.

export type Pt = [number, number]
export type Tool = 'line' | 'triangle' | 'rect'
export type FoldLine = 'vertical' | 'horizontal' | 'diagonal' | 'antidiagonal'

/** One shape drawn on the sheet. A rectangle is kept as its four corners, so it folds like the others. */
export interface Mark {
  kind: Tool
  pts: Pt[]
  colour: number
  filled: boolean
}

/** Ink colours (CSS variables in index.css); the sheet is a paper object, so they stay the same in both themes. */
export const INKS = ['var(--ink-0)', 'var(--ink-1)', 'var(--ink-2)', 'var(--ink-3)']

export const FOLD_LINES: FoldLine[] = ['vertical', 'horizontal', 'diagonal', 'antidiagonal']

interface Line {
  /** The ends of the fold line on the sheet's edge. */
  ends: [Pt, Pt]
  /** Its direction (a unit vector), which is the axis the moving half turns about. */
  axis: Pt
  /** The two halves, as polygons; half 0 is the left, top or lower-left one. */
  halves: [Pt[], Pt[]]
}

const R = Math.SQRT1_2

export const LINES: Record<FoldLine, Line> = {
  vertical: {
    ends: [[50, 0], [50, 100]],
    axis: [0, 1],
    halves: [[[0, 0], [50, 0], [50, 100], [0, 100]], [[50, 0], [100, 0], [100, 100], [50, 100]]],
  },
  horizontal: {
    ends: [[0, 50], [100, 50]],
    axis: [1, 0],
    halves: [[[0, 0], [100, 0], [100, 50], [0, 50]], [[0, 50], [100, 50], [100, 100], [0, 100]]],
  },
  // ╲ from the top-left corner to the bottom-right one.
  diagonal: {
    ends: [[0, 0], [100, 100]],
    axis: [R, R],
    halves: [[[0, 0], [100, 100], [0, 100]], [[0, 0], [100, 0], [100, 100]]],
  },
  // ╱ from the bottom-left corner to the top-right one.
  antidiagonal: {
    ends: [[0, 100], [100, 0]],
    axis: [R, -R],
    halves: [[[0, 0], [100, 0], [0, 100]], [[100, 0], [100, 100], [0, 100]]],
  },
}

/** Which side of the fold line a point is on: below 0 on half 0, above 0 on half 1, 0 on the line. */
export function side(line: FoldLine, [x, y]: Pt): number {
  switch (line) {
    case 'vertical':
      return x - 50
    case 'horizontal':
      return y - 50
    case 'diagonal':
      return x - y
    case 'antidiagonal':
      return x + y - 100
  }
}

/** Where a point lands when its half is folded over: the same distance from the line, on the other side. */
export function reflect(line: FoldLine, [x, y]: Pt): Pt {
  const [ux, uy] = LINES[line].axis
  const px = x - 50
  const py = y - 50
  const along = px * ux + py * uy
  return [round(2 * along * ux - px + 50), round(2 * along * uy - py + 50)]
}

const round = (v: number) => Math.round(v * 1e6) / 1e6

export const centroid = (pts: Pt[]): Pt => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]

/**
 * The turn that folds `moving` over: degrees about the fold line's axis, with the sign chosen so the
 * half lifts towards the viewer (CSS's z points out of the screen) and comes down on top of the other.
 */
export function foldTurn(line: FoldLine, moving: 0 | 1, t: number): { axis: Pt; deg: number } {
  const { axis, halves } = LINES[line]
  const [cx, cy] = centroid(halves[moving])
  const lift = axis[0] * (cy - 50) - axis[1] * (cx - 50)
  return { axis, deg: Math.sign(lift) * 180 * t }
}

/** Turns a point (on the flat sheet) about the fold line, as CSS's rotate3d does. Used by the tests. */
export function turn(line: FoldLine, [x, y]: Pt, deg: number): [number, number, number] {
  const [ux, uy] = LINES[line].axis
  const a = (deg * Math.PI) / 180
  const px = x - 50
  const py = y - 50
  const along = px * ux + py * uy
  // Rodrigues' formula with the axis in the sheet (uz = 0) and the point on it (pz = 0).
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [px * c + ux * along * (1 - c) + 50, py * c + uy * along * (1 - c) + 50, (ux * py - uy * px) * s]
}

/** Rounds a point to the sheet's half-square grid and keeps it on the sheet. */
export const snap = ([x, y]: Pt, step = 5): Pt => [clamp(Math.round(x / step) * step), clamp(Math.round(y / step) * step)]
const clamp = (v: number) => Math.max(0, Math.min(100, v))

/** The shape a tool makes from the points picked, or null if it is too small to see. */
export function makeMark(kind: Tool, pts: Pt[], colour: number, filled: boolean): Mark | null {
  if (kind === 'rect') {
    const [[x1, y1], [x2, y2]] = pts
    if (x1 === x2 || y1 === y2) return null
    return { kind, pts: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], colour, filled }
  }
  if (kind === 'line') {
    const [a, b] = pts
    return a[0] === b[0] && a[1] === b[1] ? null : { kind, pts, colour, filled: false }
  }
  const [[ax, ay], [bx, by], [cx, cy]] = pts
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) === 0 ? null : { kind, pts, colour, filled }
}

/** How many points each tool needs. */
export const NEEDS: Record<Tool, number> = { line: 2, rect: 2, triangle: 3 }

/** The shape after folding, if it is on the moving half: each corner lands mirrored across the line. */
export const foldedMark = (line: FoldLine, m: Mark): Mark => ({ ...m, pts: m.pts.map((p) => reflect(line, p)) })

/** Which half a shape sits on: 0 or 1, or null if it crosses the fold line. */
export function halfOf(line: FoldLine, m: Mark): 0 | 1 | null {
  const s = m.pts.map((p) => side(line, p))
  if (s.every((v) => v <= 0)) return 0
  if (s.every((v) => v >= 0)) return 1
  return null
}

const box = (x1: number, y1: number, x2: number, y2: number): Pt[] => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]

/** Starting sheets for teachers: a flag-like triangle, a box and a line on half 1, and a block on half 0. */
const SAMPLE_VERTICAL: Mark[] = [
  { kind: 'triangle', pts: [[60, 15], [60, 40], [85, 15]], colour: 1, filled: true },
  { kind: 'rect', pts: box(70, 55, 90, 65), colour: 2, filled: false },
  { kind: 'line', pts: [[60, 75], [85, 90]], colour: 0, filled: false },
  { kind: 'rect', pts: box(15, 70, 30, 85), colour: 3, filled: true },
]
const SAMPLE_DIAGONAL: Mark[] = [
  { kind: 'triangle', pts: [[55, 10], [55, 35], [80, 10]], colour: 1, filled: true },
  { kind: 'rect', pts: box(70, 30, 90, 45), colour: 2, filled: false },
  { kind: 'line', pts: [[85, 55], [95, 80]], colour: 0, filled: false },
  { kind: 'rect', pts: box(10, 60, 25, 80), colour: 3, filled: true },
]
const mapMarks = (ms: Mark[], f: (p: Pt) => Pt): Mark[] => ms.map((m) => ({ ...m, pts: m.pts.map(f) }))
const SAMPLES: Record<FoldLine, Mark[]> = {
  vertical: SAMPLE_VERTICAL,
  // Swapping x and y takes the right half to the bottom half.
  horizontal: mapMarks(SAMPLE_VERTICAL, ([x, y]) => [y, x]),
  diagonal: SAMPLE_DIAGONAL,
  // Turning the sheet upside down takes the upper-right half to the lower-right one.
  antidiagonal: mapMarks(SAMPLE_DIAGONAL, ([x, y]) => [x, 100 - y]),
}

/** A sample sheet whose main shapes sit on the half that folds. */
export function sampleMarks(line: FoldLine, moving: 0 | 1): Mark[] {
  return moving === 1 ? SAMPLES[line] : SAMPLES[line].map((m) => foldedMark(line, m))
}
