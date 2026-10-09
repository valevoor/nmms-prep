/**
 * Cubes cutting (Ch 10) in 3D: an n × n × n cube cut once along its grid lines into two pieces that slide
 * apart. Drawn as plain SVG (no 3D library): every small square on the outside of each piece is turned to
 * the view, the ones facing away are dropped, and the far piece is drawn first.
 *
 * World axes: x to the right, y up, z towards the viewer. Cells run 0..n on each axis, centred on the origin.
 */

export type V3 = [number, number, number]
export type V2 = [number, number]
/** x: a cut from top to bottom (left | right); y: a flat cut (top / bottom); z: front · back. */
export type CutDir = 'x' | 'y' | 'z'
export const CUT_DIRS: CutDir[] = ['x', 'y', 'z']
export const CUT_SIZES = [2, 3, 4, 5]

/** The axis the knife crosses, and whether piece A (the one counted) is at the high end: top, or front. */
const DIR: Record<CutDir, { axis: number; high: boolean }> = {
  x: { axis: 0, high: false },
  y: { axis: 1, high: true },
  z: { axis: 2, high: true },
}

/** A box of whole cells: lo..hi on each axis. */
export interface Box {
  lo: V3
  hi: V3
}

export interface Cut {
  axis: number
  /** Where the knife crosses, in cells from the low end of the axis. */
  at: number
  /** A is k cells thick, counted from the left, the top or the front. */
  a: Box
  b: Box
  /** Which end of the axis A is on: −1 low, +1 high. */
  aSide: -1 | 1
}

export function cutPieces(n: number, dir: CutDir, k: number): Cut {
  const { axis, high } = DIR[dir]
  const at = high ? n - k : k
  const low: Box = { lo: [0, 0, 0], hi: [n, n, n] }
  const top: Box = { lo: [0, 0, 0], hi: [n, n, n] }
  low.hi[axis] = at
  top.lo[axis] = at
  return high ? { axis, at, a: top, b: low, aSide: 1 } : { axis, at, a: low, b: top, aSide: -1 }
}

export const cellCount = ({ lo, hi }: Box) => (hi[0] - lo[0]) * (hi[1] - lo[1]) * (hi[2] - lo[2])

/** How the cube is turned, in degrees: yaw about the up axis, then pitch (positive looks down on the top). */
export interface View {
  yaw: number
  pitch: number
}
export const START_VIEW: View = { yaw: -32, pitch: 24 }

const RAD = Math.PI / 180

/** A world point turned to the view: screen x right, screen y down, and depth (bigger is nearer). */
export function project(P: V3, { yaw, pitch }: View): V3 {
  const cy = Math.cos(yaw * RAD), sy = Math.sin(yaw * RAD)
  const cp = Math.cos(pitch * RAD), sp = Math.sin(pitch * RAD)
  const x1 = P[0] * cy + P[2] * sy
  const z1 = -P[0] * sy + P[2] * cy
  return [x1, -(P[1] * cp - z1 * sp), P[1] * sp + z1 * cp]
}

/** Which way a square faces, for its shade: light comes from above. */
export type Light = 'top' | 'front' | 'side' | 'bottom'
/** outer: part of the big cube's outside; cut: a new face made by the knife. */
export type FaceKind = 'outer' | 'cut'

export interface Square {
  pts: V2[]
  kind: FaceKind
  light: Light
}

const lightOf = (axis: number, sign: number): Light => (axis === 1 ? (sign > 0 ? 'top' : 'bottom') : axis === 2 ? 'front' : 'side')

/**
 * The unit squares on the outside of a box, moved by `shift` and projected. Squares on the knife's plane are
 * `cut` faces. With a view, squares facing away are dropped; with null, every square is kept.
 */
export function boxSquares(box: Box, n: number, shift: V3, knife: { axis: number; at: number } | null, view: View | null): Square[] {
  const h = n / 2
  const out: Square[] = []
  for (let d = 0; d < 3; d++) {
    for (const sign of [-1, 1]) {
      const normal: V3 = [0, 0, 0]
      normal[d] = sign
      if (view && project(normal, view)[2] <= 0.01) continue
      const at = sign > 0 ? box.hi[d] : box.lo[d]
      const kind: FaceKind = knife && d === knife.axis && at === knife.at ? 'cut' : 'outer'
      const light = lightOf(d, sign)
      const u = (d + 1) % 3
      const v = (d + 2) % 3
      for (let i = box.lo[u]; i < box.hi[u]; i++)
        for (let j = box.lo[v]; j < box.hi[v]; j++) {
          const pts = ([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as V2[]).map(([a, b]): V2 => {
            const P: V3 = [0, 0, 0]
            P[d] = at - h + shift[d]
            P[u] = a - h + shift[u]
            P[v] = b - h + shift[v]
            const q = view ? project(P, view) : P
            return [q[0], q[1]]
          })
          out.push({ pts, kind, light })
        }
    }
  }
  return out
}

/** The pieces' gap when fully pulled apart, in cells. */
export const GAP_MAX = 1.6

export interface Scene {
  /** Back to front, so later squares cover earlier ones. */
  squares: Square[]
  /** The knife's sheet, a little bigger than the cube; only before the cut. */
  knife: V2[] | null
  /** Where the A and B labels go, just outside each piece; only after the cut. */
  labels: { a: V2; b: V2 } | null
}

export function cutScene(n: number, dir: CutDir, k: number, cut: boolean, gap: number, view: View): Scene {
  const c = cutPieces(n, dir, k)
  const h = n / 2
  const whole: Box = { lo: [0, 0, 0], hi: [n, n, n] }
  if (!cut) {
    const u = (c.axis + 1) % 3
    const v = (c.axis + 2) % 3
    const m = 0.35
    const knife = ([[-m, -m], [n + m, -m], [n + m, n + m], [-m, n + m]] as V2[]).map(([a, b]): V2 => {
      const P: V3 = [0, 0, 0]
      P[c.axis] = c.at - h
      P[u] = a - h
      P[v] = b - h
      const q = project(P, view)
      return [q[0], q[1]]
    })
    return { squares: boxSquares(whole, n, [0, 0, 0], null, view), knife, labels: null }
  }
  const shiftA: V3 = [0, 0, 0]
  const shiftB: V3 = [0, 0, 0]
  shiftA[c.axis] = (c.aSide * gap) / 2
  shiftB[c.axis] = (-c.aSide * gap) / 2
  const knife = { axis: c.axis, at: c.at }
  const a = boxSquares(c.a, n, shiftA, knife, view)
  const b = boxSquares(c.b, n, shiftB, knife, view)
  // The pieces sit either side of the knife's plane: the one on the viewer's side is drawn last.
  const axisDir: V3 = [0, 0, 0]
  axisDir[c.axis] = c.aSide
  const aNearer = project(axisDir, view)[2] > 0
  const label = (box: Box, shift: V3, side: number): V2 => {
    const P = [0, 1, 2].map((i) => (box.lo[i] + box.hi[i]) / 2 - h + shift[i]) as V3
    P[c.axis] = (side > 0 ? box.hi[c.axis] : box.lo[c.axis]) - h + shift[c.axis] + side * 0.7
    const q = project(P, view)
    return [q[0], q[1]]
  }
  return {
    squares: aNearer ? [...b, ...a] : [...a, ...b],
    knife: null,
    labels: { a: label(c.a, shiftA, c.aSide), b: label(c.b, shiftB, -c.aSide) },
  }
}

/** Screen units per cell, so the cube, its pieces pulled apart and their labels fit a 360-wide square. */
export const fitScale = (n: number) => 160 / (0.87 * n + 1.5)
