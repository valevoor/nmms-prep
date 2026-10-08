import { PERIMETER, SIZES } from '../data/shapes'
import type { ShapeId } from '../data/shapes'
import type { Hue } from './solids'

/** The flat (2D) steps of the Shapes page: walking round the edge, and filling the inside. */

export const STAGE_W = 358
export const STAGE_H = 280

/** Colours by role; the page maps them to CSS variables so both themes work. */
export type Ink = Hue | 'grid' | 'ink' | 'muted' | 'dot'

export interface Mark {
  d: string
  fill?: Ink
  fillAlpha?: number
  stroke?: Ink
  sw?: number
  dash?: string
  offset?: number
  transform?: string
  opacity?: number
}

export interface Label {
  x: number
  y: number
  text: string
}

export interface Flat {
  marks: Mark[]
  labels: Label[]
}

const W = STAGE_W
const H = STAGE_H
const r1 = (x: number) => Math.round(x * 10) / 10
const P = (q: [number, number]) => `${r1(q[0])} ${r1(q[1])}`
const poly = (pts: [number, number][]) => `M${pts.map(P).join(' L')} Z`
export const circlePath = (cx: number, cy: number, r: number) =>
  `M${P([cx, cy - r])} A${r1(r)} ${r1(r)} 0 1 1 ${P([cx, cy + r])} A${r1(r)} ${r1(r)} 0 1 1 ${P([cx, cy - r])} Z`

/** Unit squares behind the shape, lined up with its corner. */
function grid(ox: number, oy: number, u: number): Mark {
  let d = ''
  for (let x = ox - Math.ceil(ox / u) * u; x <= W; x += u) d += `M${r1(x)} 0 V${H} `
  for (let y = oy - Math.ceil(oy / u) * u; y <= H; y += u) d += `M0 ${r1(y)} H${W} `
  return { d, stroke: 'grid', sw: 1 }
}

/** Polygon corners in units, measured from the top-left, y down. */
const POLYGONS: Record<Exclude<ShapeId, 'circle'>, { pts: [number, number][]; w: number; h: number }> = {
  square: { pts: [[0, 0], [4, 0], [4, 4], [0, 4]], w: 4, h: 4 },
  rect: { pts: [[0, 0], [5, 0], [5, 3], [0, 3]], w: 5, h: 3 },
  tri: { pts: [[0, 3], [4, 3], [0, 0]], w: 4, h: 3 },
}

/** A dot that walks `p` of the way round the edge, leaving a line behind it. */
export function perimeterDrawing(shape: ShapeId, p: number): Flat & { walked: number; total: number } {
  const total = PERIMETER[shape].value
  if (shape === 'circle') {
    const u = 16
    const R = SIZES.circle.r * u
    const [cx, cy] = [W / 2, H / 2]
    const len = 2 * Math.PI * R
    const t = p * 2 * Math.PI
    return {
      walked: r1(p * total),
      total,
      marks: [
        grid(cx, cy, u),
        { d: circlePath(cx, cy, R), fill: 'blue', fillAlpha: 0.2, stroke: 'blue', opacity: 0.35 },
        { d: circlePath(cx, cy, R), stroke: 'blue', sw: 5, dash: `${r1(len)} ${r1(len)}`, offset: r1(len * (1 - p)) },
        { d: `M${P([cx, cy])} L${P([cx + R, cy])}`, stroke: 'ink', sw: 1.5 },
        { d: circlePath(cx + R * Math.sin(t), cy - R * Math.cos(t), 7), fill: 'dot', fillAlpha: 1, stroke: 'dot' },
      ],
      labels: [{ x: cx + R / 2, y: cy - 12, text: `r = ${SIZES.circle.r}` }],
    }
  }
  const S = POLYGONS[shape]
  const u = { square: 40, rect: 44, tri: 48 }[shape]
  const [ox, oy] = [(W - S.w * u) / 2, (H - S.h * u) / 2]
  const px = S.pts.map(([x, y]): [number, number] => [ox + x * u, oy + y * u])
  const n = px.length
  const sides = S.pts.map(([x, y], i) => Math.hypot(S.pts[(i + 1) % n][0] - x, S.pts[(i + 1) % n][1] - y))
  const len = total * u
  const [mx, my] = [px.reduce((s, q) => s + q[0], 0) / n, px.reduce((s, q) => s + q[1], 0) / n]
  const labels = px.map((q, i) => {
    const r = px[(i + 1) % n]
    const [x, y] = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]
    const k = 16 / (Math.hypot(x - mx, y - my) || 1)
    return { x: r1(x + (x - mx) * k), y: r1(y + (y - my) * k), text: String(sides[i]) }
  })
  let rest = p * total
  let i = 0
  while (i < n - 1 && rest > sides[i]) rest -= sides[i++]
  const [a, b] = [px[i], px[(i + 1) % n]]
  const f = Math.min(1, rest / sides[i])
  return {
    walked: r1(p * total),
    total,
    marks: [
      grid(ox, oy, u),
      { d: poly(px), fill: 'blue', fillAlpha: 0.2, stroke: 'blue', opacity: 0.35 },
      { d: poly(px), stroke: 'blue', sw: 5, dash: `${r1(len)} ${r1(len)}`, offset: r1(len * (1 - p)) },
      { d: circlePath(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 7), fill: 'dot', fillAlpha: 1, stroke: 'dot' },
    ],
    labels,
  }
}

/** Rows of unit squares filling a square or rectangle from the bottom. */
export function rowsDrawing(shape: 'square' | 'rect', p: number): Flat & { rows: number; perRow: number } {
  const S = POLYGONS[shape]
  const u = shape === 'square' ? 40 : 44
  const [ox, oy] = [(W - S.w * u) / 2, (H - S.h * u) / 2]
  const rows = Math.round(p * S.h)
  const top = oy + (S.h - rows) * u
  return {
    rows,
    perRow: S.w,
    marks: [
      grid(ox, oy, u),
      { d: poly([[ox, top], [ox + S.w * u, top], [ox + S.w * u, oy + S.h * u], [ox, oy + S.h * u]]), fill: 'blue', fillAlpha: 0.35 },
      { d: poly(S.pts.map(([x, y]) => [ox + x * u, oy + y * u])), stroke: 'blue', sw: 3 },
    ],
    labels: [],
  }
}

/** A copy of the triangle slides in to finish a rectangle: the triangle is half of it. */
export function halfDrawing(p: number): Flat {
  const u = 48
  const { b, h } = SIZES.tri
  const [ox, oy] = [(W - b * u) / 2, (H - h * u) / 2]
  const at = ([x, y]: [number, number]): [number, number] => [ox + x * u, oy + y * u]
  return {
    marks: [
      grid(ox, oy, u),
      { d: poly(([[0, 0], [b, 0], [b, h], [0, h]] as [number, number][]).map(at)), stroke: 'muted', sw: 1.5, dash: '6 5' },
      { d: poly(POLYGONS.tri.pts.map(at)), fill: 'blue', fillAlpha: 0.22, stroke: 'blue' },
      {
        d: poly(([[b, h], [b, 0], [0, 0]] as [number, number][]).map(at)),
        fill: 'amber',
        fillAlpha: 0.3,
        stroke: 'amber',
        transform: `translate(${r1((1 - p) * 90)} 0)`,
        opacity: r1(0.4 + 0.6 * p),
      },
    ],
    labels: [
      { x: ox + (b / 2) * u, y: oy + h * u + 16, text: String(b) },
      { x: ox - 16, y: oy + (h / 2) * u, text: String(h) },
    ],
  }
}

/**
 * A circle cut into 16 slices that line up, top and bottom in turn, into a near-rectangle:
 * half the circumference long and one radius high.
 */
export function slicesDrawing(p: number): Flat {
  const n = 16
  const R = 84
  const half = Math.PI / n
  const c = 2 * R * Math.sin(half)
  const x0 = (W - (n / 2 + 0.5) * c) / 2 + c / 2
  const base = H / 2 + R / 2
  const [cx, cy] = [W / 2, H / 2]
  const slice = `M0 0 L${P([-R * Math.sin(half), -R * Math.cos(half)])} A${R} ${R} 0 0 1 ${P([R * Math.sin(half), -R * Math.cos(half)])} Z`
  // Slices pointing up (the top half) and down (the bottom half), from left to right.
  const ups = [12, 13, 14, 15, 0, 1, 2, 3]
  const downs = [11, 10, 9, 8, 7, 6, 5, 4]
  const lerp = (a: number, b: number) => a + (b - a) * p
  const marks: Mark[] = Array.from({ length: n }, (_, i) => {
    const turn0 = i * (360 / n) + 180 / n
    const up = ups.includes(i)
    const k = up ? ups.indexOf(i) : downs.indexOf(i)
    const [x, y] = up ? [x0 + k * c, base] : [x0 + k * c + c / 2, base - R]
    const turn1 = up ? (turn0 > 180 ? 360 : 0) : 180
    const hue: Hue = up ? 'blue' : 'amber'
    return {
      d: slice,
      fill: hue,
      fillAlpha: 0.28,
      stroke: hue,
      sw: 1.2,
      transform: `translate(${r1(lerp(cx, x))} ${r1(lerp(cy, y))}) rotate(${r1(lerp(turn0, turn1))})`,
    }
  })
  return { marks, labels: [] }
}
