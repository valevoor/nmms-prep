// Fold and punch (Ch 7, Paper Fold and Punch): the geometry behind pages/PunchFold.tsx.
// The sheet runs from 0 to 100 each way, y pointing down (as on screen). It is folded in half up to
// three times, each time along a line of symmetry of the paper still showing, and the half that
// stays never moves, so the folded paper is always a part of the flat sheet, in place. The sheet is
// kept as pieces: each is a part of the flat sheet with the turn-over that takes it to where it lies
// now. A cut goes through every piece under it, and so opens out mirrored in every fold.

import { FOLD_LINES } from './sheetFold'
import type { FoldLine } from './sheetFold'

export type Pt = [number, number]
export type Tool = 'circle' | 'triangle' | 'rect' | 'line'
export type { FoldLine }
export { FOLD_LINES }

/** One fold: the line (through `at`) and the half that turns over onto the other. */
export interface Fold {
  line: FoldLine
  at: Pt
  moving: 0 | 1
}

/** A flat move: x' = a x + c y + e, y' = b x + d y + f. Only ever a run of mirrorings. */
export type Iso = [number, number, number, number, number, number]

export interface Piece {
  /** The part of the flat sheet, in sheet units. */
  poly: Pt[]
  /** Where it lies before the last fold, and after it. */
  iso: Iso
  end: Iso
  /** Its place in the pile (higher is nearer the viewer), before the last fold and after it. */
  layer: number
  endLayer: number
  /** Turned over by the last fold. */
  moves: boolean
}

/** One cut: the holes it made, on the flat sheet (one per layer it went through). */
export interface Cut {
  kind: Tool
  holes: Pt[][]
}

export const MAX_FOLDS = 3
export const SHEET: Pt[] = [[0, 0], [100, 0], [100, 100], [0, 100]]
const EPS = 1e-6
const R = Math.SQRT1_2

/** Each fold line's direction (a unit vector), the axis the moving half turns about. */
export const AXIS: Record<FoldLine, Pt> = { vertical: [0, 1], horizontal: [1, 0], diagonal: [R, R], antidiagonal: [R, -R] }

/** Which side of the line a point is on: below 0 on half 0 (left, top, lower-left or upper-left), above 0 on half 1. */
export function side(line: FoldLine, [ax, ay]: Pt, [x, y]: Pt): number {
  switch (line) {
    case 'vertical':
      return x - ax
    case 'horizontal':
      return y - ay
    case 'diagonal':
      return x - ax - (y - ay)
    case 'antidiagonal':
      return x - ax + (y - ay)
  }
}

const round = (v: number) => Math.round(v * 1e6) / 1e6

/** The mirroring in a fold line, as a flat move. */
export function mirror(line: FoldLine, [ax, ay]: Pt): Iso {
  const [ux, uy] = AXIS[line]
  const a = 2 * ux * ux - 1, b = 2 * ux * uy, d = 2 * uy * uy - 1
  return [a, b, b, d, ax - (a * ax + b * ay), ay - (b * ax + d * ay)]
}

export const ID: Iso = [1, 0, 0, 1, 0, 0]
export const apply = ([a, b, c, d, e, f]: Iso, [x, y]: Pt): Pt => [round(a * x + c * y + e), round(b * x + d * y + f)]
/** p ↦ A(B(p)). */
export const compose = (A: Iso, B: Iso): Iso => [
  A[0] * B[0] + A[2] * B[1],
  A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3],
  A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4],
  A[1] * B[4] + A[3] * B[5] + A[5],
]
export function invert([a, b, c, d, e, f]: Iso): Iso {
  const det = a * d - b * c
  const [ia, ib, ic, id] = [d / det, -b / det, -c / det, a / det]
  return [ia, ib, ic, id, -(ia * e + ic * f), -(ib * e + id * f)]
}

export const area = (p: Pt[]) => p.reduce((s, [x, y], i) => s + x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y, 0) / 2
export const centre = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length]

/** Drops repeated corners and corners on a straight edge; an empty list if nothing is left. */
function tidy(poly: Pt[]): Pt[] {
  let p = poly.filter((q, i) => Math.hypot(q[0] - poly[(i + 1) % poly.length][0], q[1] - poly[(i + 1) % poly.length][1]) > EPS)
  p = p.filter((q, i) => {
    const a = p[(i + p.length - 1) % p.length], b = p[(i + 1) % p.length]
    return Math.abs((q[0] - a[0]) * (b[1] - a[1]) - (q[1] - a[1]) * (b[0] - a[0])) > EPS
  })
  return p.length >= 3 && Math.abs(area(p)) > EPS ? p : []
}

/** The part of a polygon where keep(p) ≥ 0 (keep is linear, so the edges cross it once). */
function clipBy(poly: Pt[], keep: (p: Pt) => number): Pt[] {
  const out: Pt[] = []
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]
    const sp = keep(p), sq = keep(q)
    if (sp >= -EPS) out.push(p)
    if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) {
      const k = sp / (sp - sq)
      out.push([round(p[0] + (q[0] - p[0]) * k), round(p[1] + (q[1] - p[1]) * k)])
    }
  })
  return tidy(out)
}

/** One half of a polygon cut by a fold line. */
export const halfOf = (poly: Pt[], f: { line: FoldLine; at: Pt }, h: 0 | 1) => clipBy(poly, (p) => (h === 1 ? 1 : -1) * side(f.line, f.at, p))

/** A convex polygon cut down to the part inside another convex polygon. */
export function clipTo(poly: Pt[], frame: Pt[]): Pt[] {
  const o = Math.sign(area(frame))
  let out = poly
  for (let i = 0; i < frame.length && out.length; i++) {
    const a = frame[i], b = frame[(i + 1) % frame.length]
    out = clipBy(out, (p) => o * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])))
  }
  return out
}

/** The paper still showing after some folds: the halves that stayed. */
export const region = (folds: Fold[]) => folds.reduce((r, f) => halfOf(r, f, f.moving === 1 ? 0 : 1), SHEET)

const sameSet = (a: Pt[], b: Pt[]) => a.length === b.length && a.every((p) => b.some((q) => Math.abs(p[0] - q[0]) < 1e-4 && Math.abs(p[1] - q[1]) < 1e-4))

/** The lines the paper can be folded in half along: the ones it is symmetric about. */
export function foldLines(r: Pt[]): { line: FoldLine; at: Pt }[] {
  const at = centre(r).map(round) as Pt
  return FOLD_LINES.filter((line) => sameSet(r.map((p) => apply(mirror(line, at), p)), r)).map((line) => ({ line, at }))
}

/** The pieces of the sheet, with the last fold done (or not: each piece knows where it was before it). */
export function stack(folds: Fold[]): Piece[] {
  let pieces: Piece[] = [{ poly: SHEET, iso: ID, end: ID, layer: 0, endLayer: 0, moves: false }]
  for (const f of folds) {
    const m = mirror(f.line, f.at)
    const top = Math.max(...pieces.map((p) => p.endLayer))
    const next: Piece[] = []
    for (const p of pieces) {
      // Cut the piece where it lies now, then take each part back to the flat sheet.
      const back = invert(p.end)
      const world = p.poly.map((q) => apply(p.end, q))
      for (const h of [0, 1] as const) {
        const part = halfOf(world, f, h)
        if (!part.length) continue
        const moves = h === f.moving
        next.push({
          poly: part.map((q) => apply(back, q)),
          iso: p.end,
          end: moves ? compose(m, p.end) : p.end,
          layer: p.endLayer,
          // The moving pile turns over onto the top of the other, so its order flips.
          endLayer: moves ? 2 * top + 1 - p.endLayer : p.endLayer,
          moves,
        })
      }
    }
    pieces = next
  }
  return pieces
}

/** The creases each fold leaves on the flat sheet. */
export function creases(folds: Fold[]): [Pt, Pt][] {
  const out: [Pt, Pt][] = []
  folds.forEach((f, i) => {
    for (const p of stack(folds.slice(0, i + 1))) {
      if (p.moves) continue
      const on = p.poly.filter((q) => Math.abs(side(f.line, f.at, apply(p.iso, q))) < 1e-4)
      let best: [Pt, Pt] | null = null, len = EPS
      for (const a of on) for (const b of on) if (Math.hypot(a[0] - b[0], a[1] - b[1]) > len) [best, len] = [[a, b], Math.hypot(a[0] - b[0], a[1] - b[1])]
      if (best) out.push(best)
    }
  })
  return out
}

/** How many points each tool needs. */
export const NEEDS: Record<Tool, number> = { circle: 2, rect: 2, line: 2, triangle: 3 }
const SLIT = 0.8

/** The shape a tool cuts from the points picked (on the paper as it lies now), or null if too small to see. */
export function cutShape(kind: Tool, pts: Pt[]): Pt[] | null {
  if (kind === 'circle') {
    const [[cx, cy], [x, y]] = pts
    const r = Math.hypot(x - cx, y - cy)
    if (r < 1) return null
    return Array.from({ length: 40 }, (_, i) => [round(cx + r * Math.cos((i * Math.PI) / 20)), round(cy + r * Math.sin((i * Math.PI) / 20))] as Pt)
  }
  if (kind === 'rect') {
    const [[x1, y1], [x2, y2]] = pts
    if (x1 === x2 || y1 === y2) return null
    return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
  }
  if (kind === 'line') {
    const [[x1, y1], [x2, y2]] = pts
    const len = Math.hypot(x2 - x1, y2 - y1)
    if (len < 1) return null
    // A slit: a thin strip along the line.
    const nx = (-(y2 - y1) / len) * SLIT, ny = ((x2 - x1) / len) * SLIT
    return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]].map(([x, y]) => [round(x), round(y)] as Pt)
  }
  const [[ax, ay], [bx, by], [cx, cy]] = pts
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) === 0 ? null : pts
}

/** Cuts a shape through every layer of the folded paper: the holes it leaves, on the flat sheet. */
export function punch(folds: Fold[], kind: Tool, shape: Pt[]): Cut {
  const holes: Pt[][] = []
  for (const p of stack(folds)) {
    const back = invert(p.end)
    const hole = clipTo(shape.map((q) => apply(back, q)), p.poly)
    if (hole.length) holes.push(hole)
  }
  return { kind, holes }
}

/** Rounds a point to the paper's grid and keeps it on the desk. */
export const snap = ([x, y]: Pt, step = 2.5): Pt => [clamp(Math.round(x / step) * step), clamp(Math.round(y / step) * step)]
const clamp = (v: number) => Math.max(-5, Math.min(105, v))

// 3D: matrices are 4×4 in CSS's matrix3d order (column by column), in sheet units, with z towards the viewer.
export type M4 = number[]

/** A flat move as a 3D turn: a mirroring is a half turn about its line, so it also turns the paper over. */
export function isoM4([a, b, c, d, e, f]: Iso): M4 {
  return [a, b, 0, 0, c, d, 0, 0, 0, 0, a * d - b * c, 0, e, f, 0, 1]
}

/** A turn of `deg` degrees about a fold line (as CSS's rotate3d turns). */
export function turnM4(line: FoldLine, [ax, ay]: Pt, deg: number): M4 {
  const [ux, uy] = AXIS[line]
  const t = (deg * Math.PI) / 180
  const c = Math.cos(t), s = Math.sin(t), k = 1 - c
  // Rodrigues' formula with the axis in the sheet (uz = 0); rows of the 3×3 part:
  const m = [
    [c + ux * ux * k, ux * uy * k, uy * s],
    [ux * uy * k, c + uy * uy * k, -ux * s],
    [-uy * s, ux * s, c],
  ]
  const tx = ax - (m[0][0] * ax + m[0][1] * ay), ty = ay - (m[1][0] * ax + m[1][1] * ay), tz = -(m[2][0] * ax + m[2][1] * ay)
  return [m[0][0], m[1][0], m[2][0], 0, m[0][1], m[1][1], m[2][1], 0, m[0][2], m[1][2], m[2][2], 0, tx, ty, tz, 1]
}

/** A ∘ B. */
export function mul(A: M4, B: M4): M4 {
  const out = new Array(16).fill(0)
  for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) out[col * 4 + row] += A[k * 4 + row] * B[col * 4 + k]
  return out
}

export const onM4 = (M: M4, [x, y]: Pt): [number, number, number] => [M[0] * x + M[4] * y + M[12], M[1] * x + M[5] * y + M[13], M[2] * x + M[6] * y + M[14]]

/** How far the last fold has turned (t from 0 to 1), signed so the half lifts towards the viewer. */
export function foldDeg(folds: Fold[], t: number): number {
  if (!folds.length) return 0
  const f = folds[folds.length - 1]
  const [cx, cy] = centre(halfOf(region(folds.slice(0, -1)), f, f.moving))
  const [ux, uy] = AXIS[f.line]
  return Math.sign(ux * (cy - f.at[1]) - uy * (cx - f.at[0])) * 180 * t
}

/** Where a piece is drawn while the last fold is `deg` of the way over. */
export function pieceM4(p: Piece, last: Fold | undefined, deg: number): M4 {
  const M = isoM4(p.iso)
  return p.moves && last ? mul(turnM4(last.line, last.at, deg), M) : M
}

/** A starting sheet for teachers, folded twice, with a hole, a cut on a fold and a cut at the corner where the folds meet. */
export function sample(): { folds: Fold[]; cuts: Cut[] } {
  const folds: Fold[] = [
    { line: 'vertical', at: [50, 50], moving: 1 },
    { line: 'horizontal', at: [25, 50], moving: 1 },
  ]
  const cuts = [
    punch(folds, 'circle', cutShape('circle', [[20, 20], [26, 20]])!),
    punch(folds, 'triangle', [[50, 17.5], [40, 25], [50, 32.5]]),
    punch(folds, 'rect', cutShape('rect', [[42.5, 42.5], [50, 50]])!),
  ]
  return { folds, cuts }
}
