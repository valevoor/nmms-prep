import { AREA, PERIMETER, SIZES, SOLID_HEIGHT } from '../data/shapes'
import type { ShapeId } from '../data/shapes'

/**
 * 3D solids for the Shapes page, drawn as plain SVG (no 3D library, so it works offline and stays small).
 * y is up and the solid stands on y = 0. A net opens by turning each face about the edge it shares
 * with the face before it: `open` 0 is the closed solid, 1 is the flat net.
 */

export type V3 = [number, number, number]
export type Hue = 'blue' | 'amber' | 'pink'

export interface Face {
  pts: V3[]
  hue: Hue
  /** Text drawn at `at`, such as "5×3". */
  label?: string
  at?: V3
  /** Unit grid lines on the face, so students can count squares. */
  grid?: [V3, V3][]
  /** A thin outline, for the many narrow strips of a cylinder. */
  thin?: boolean
  /** The top of a stack, drawn a little darker. */
  top?: boolean
}

const UP: V3 = [0, 1, 0]
const X: V3 = [1, 0, 0]
const Z: V3 = [0, 0, 1]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
const neg = (a: V3): V3 => mul(a, -1)
const RAD = Math.PI / 180
const upTo = (n: number) => Array.from({ length: Math.max(0, Math.ceil(n) - 1) }, (_, i) => i + 1)

/** Out along `o` on the ground, turned up by `deg`: 0° lies flat, 90° stands straight up. */
const dir = (o: V3, deg: number) => add(mul(o, Math.cos(deg * RAD)), mul(UP, Math.sin(deg * RAD)))

type At = (u: number, t: number) => V3

/** A face hinged on the ground edge from A along U: u runs along the hinge, t away from it. */
const hinged =
  (A: V3, U: V3, o: V3, deg: number): At =>
  (u, t) =>
    add(add(A, mul(U, u)), mul(dir(o, deg), t))

/** A face hinged on the far edge of a hinged face of height h, turned the same amount again (a cuboid's lid). */
const hingedTwice =
  (A: V3, U: V3, o: V3, deg: number, h: number): At =>
  (u, s) =>
    add(add(add(A, mul(U, u)), mul(dir(o, deg), h)), mul(dir(o, 2 * deg), s))

function rectFace(at: At, uw: number, th: number, hue: Hue, label: string): Face {
  return {
    pts: [at(0, 0), at(uw, 0), at(uw, th), at(0, th)],
    hue,
    label,
    at: at(uw / 2, th / 2),
    grid: [...upTo(uw).map((i): [V3, V3] => [at(i, 0), at(i, th)]), ...upTo(th).map((j): [V3, V3] => [at(0, j), at(uw, j)])],
  }
}

/** A cuboid of length l (x), breadth b (z) and height h, opened into a cross. */
export function cuboidNet(l: number, b: number, h: number, open: number): Face[] {
  const a = 90 * (1 - open)
  const back: V3 = [-l / 2, 0, -b / 2]
  return [
    rectFace((u, t) => [-l / 2 + u, 0, -b / 2 + t], l, b, 'blue', `${l}×${b}`),
    rectFace(hinged([-l / 2, 0, b / 2], X, Z, a), l, h, 'amber', `${l}×${h}`),
    rectFace(hinged(back, X, neg(Z), a), l, h, 'amber', `${l}×${h}`),
    rectFace(hinged(back, Z, neg(X), a), b, h, 'pink', `${b}×${h}`),
    rectFace(hinged([l / 2, 0, -b / 2], Z, X, a), b, h, 'pink', `${b}×${h}`),
    rectFace(hingedTwice(back, X, neg(Z), a, h), l, b, 'blue', `${l}×${b}`),
  ]
}

/**
 * A prism whose ends are right triangles (base b, height h), lying on its b × len face. The slant face
 * starts tipped over, so it folds through more than 90° to meet the top of the upright face.
 */
export function prismNet(b: number, h: number, len: number, open: number): Face[] {
  const a = 90 * (1 - open)
  const slant = (180 - Math.atan2(h, b) / RAD) * (1 - open)
  const c = Math.hypot(b, h)
  const left: V3 = [-b / 2, 0, -len / 2]
  const end = (at: At): Face => ({ pts: [at(0, 0), at(b, 0), at(0, h)], hue: 'blue', label: `${(b * h) / 2}`, at: at(b / 3, h / 3) })
  return [
    rectFace((u, t) => [-b / 2 + u, 0, -len / 2 + t], b, len, 'amber', `${b}×${len}`),
    rectFace(hinged(left, Z, neg(X), a), len, h, 'pink', `${h}×${len}`),
    rectFace(hinged([b / 2, 0, -len / 2], Z, X, slant), len, c, 'pink', `${c}×${len}`),
    end(hinged(left, X, neg(Z), a)),
    end(hinged([-b / 2, 0, len / 2], X, Z, a)),
  ]
}

/**
 * A cylinder of radius r and height h, as n narrow strips. The front strip stays put; the strips on
 * either side bend less and less until they lie in one flat rectangle, and the lids fold out above and below it.
 */
export function cylinderNet(r: number, h: number, open: number, n = 24): Face[] {
  const c = 2 * r * Math.sin(Math.PI / n)
  const front = r * Math.cos(Math.PI / n)
  // Corners along the bottom edge (x, z), walking right and left from the front strip.
  const walk = (bend: number) => {
    const right: [number, number][] = [[c / 2, front]]
    const left: [number, number][] = [[-c / 2, front]]
    for (let j = 1; j <= n / 2; j++) {
      const [x, z] = right[j - 1]
      right.push([x + c * Math.cos(j * bend), z - c * Math.sin(j * bend)])
    }
    for (let j = 1; j < n / 2; j++) {
      const [x, z] = left[j - 1]
      left.push([x - c * Math.cos(j * bend), z - c * Math.sin(j * bend)])
    }
    return { right, left }
  }
  const now = walk(((2 * Math.PI) / n) * (1 - open))
  const strip = ([x0, z0]: [number, number], [x1, z1]: [number, number]): Face => ({
    pts: [
      [x0, 0, z0],
      [x1, 0, z1],
      [x1, h, z1],
      [x0, h, z0],
    ],
    hue: 'amber',
    thin: true,
    grid: upTo(h).map((y): [V3, V3] => [
      [x0, y, z0],
      [x1, y, z1],
    ]),
  })
  const strips = [strip(now.left[0], now.right[0])]
  for (let j = 1; j < now.right.length; j++) strips.push(strip(now.right[j - 1], now.right[j]))
  for (let j = 1; j < now.left.length; j++) strips.push(strip(now.left[j], now.left[j - 1]))

  // The lids are the closed outline, hinged on the front strip's bottom and top edges.
  const shut = walk((2 * Math.PI) / n)
  const ring = [shut.left[0], ...shut.right, ...shut.left.slice(1, -1).reverse()]
  const a = 90 * (1 - open) * RAD
  const lid = (top: boolean): Face => {
    const at = ([x, z]: [number, number]): V3 => {
      const t = front - z
      return [x, top ? h + t * Math.cos(a) : -t * Math.cos(a), front - t * Math.sin(a)]
    }
    return { pts: ring.map(at), hue: 'blue', at: at([0, 0]) }
  }
  const middle = strips.reduce<V3>((s, f) => add(s, mul(add(f.pts[0], f.pts[2]), 0.5 / strips.length)), [0, 0, 0])
  strips[0] = { ...strips[0], at: middle }
  return [...strips, lid(false), lid(true)]
}

/** A flat shape (x, z corners) stacked `layers` units high. With no layers it is just the shape lying flat. */
export function extrude(base: [number, number][], layers: number, sideHue: (i: number) => Hue, topGrid: boolean): Face[] {
  const ring = (y: number) => base.map(([x, z]): V3 => [x, y, z])
  const faces: Face[] = [{ pts: ring(0), hue: 'blue' }]
  if (layers <= 0) return faces
  base.forEach(([x0, z0], i) => {
    const [x1, z1] = base[(i + 1) % base.length]
    faces.push({
      pts: [
        [x0, 0, z0],
        [x1, 0, z1],
        [x1, layers, z1],
        [x0, layers, z0],
      ],
      hue: sideHue(i),
      thin: base.length > 8,
      grid: upTo(layers).map((y): [V3, V3] => [
        [x0, y, z0],
        [x1, y, z1],
      ]),
    })
  })
  const grid: [V3, V3][] = []
  if (topGrid) {
    const xs = base.map((q) => q[0])
    const zs = base.map((q) => q[1])
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]
    for (let x = x0 + 1; x < x1; x++) grid.push([[x, layers, z0], [x, layers, z1]])
    for (let z = z0 + 1; z < z1; z++) grid.push([[x0, layers, z], [x1, layers, z]])
  }
  faces.push({ pts: ring(layers), hue: 'blue', grid, top: true })
  return faces
}

const CIRCLE_SIDES = 24

/** Each flat shape's outline (x, z), centred on the origin. */
function outline(shape: ShapeId): [number, number][] {
  switch (shape) {
    case 'square': {
      const s = SIZES.square.a / 2
      return [[-s, -s], [s, -s], [s, s], [-s, s]]
    }
    case 'rect': {
      const { l, b } = SIZES.rect
      return [[-l / 2, -b / 2], [l / 2, -b / 2], [l / 2, b / 2], [-l / 2, b / 2]]
    }
    case 'tri': {
      const { b, h } = SIZES.tri
      return [[-b / 2, h / 2], [b / 2, h / 2], [-b / 2, -h / 2]]
    }
    case 'circle': {
      const { r } = SIZES.circle
      return Array.from({ length: CIRCLE_SIDES }, (_, i): [number, number] => [r * Math.cos((i * 2 * Math.PI) / CIRCLE_SIDES), r * Math.sin((i * 2 * Math.PI) / CIRCLE_SIDES)])
    }
  }
}

/** The flat shape stacked into its solid, `layers` units high. */
export function stack(shape: ShapeId, layers: number): Face[] {
  const side = (i: number): Hue => (shape === 'circle' || i % 2 === 0 ? 'amber' : 'pink')
  return extrude(outline(shape), layers, side, shape === 'square' || shape === 'rect')
}

/** The solid built from each flat shape, `open` of the way to its net. */
export function solidNet(shape: ShapeId, open: number): Face[] {
  const H = SOLID_HEIGHT[shape]
  switch (shape) {
    case 'square':
      return cuboidNet(SIZES.square.a, SIZES.square.a, H, open)
    case 'rect':
      return cuboidNet(SIZES.rect.l, SIZES.rect.b, H, open)
    case 'tri':
      return prismNet(SIZES.tri.b, SIZES.tri.h, H, open)
    case 'circle': {
      // Label with the book's numbers (π = 22/7), not the 24-sided drawing's.
      const faces = cylinderNet(SIZES.circle.r, H, open, CIRCLE_SIDES)
      return faces.map((f, i) =>
        i === 0 ? { ...f, label: `${PERIMETER.circle.value}×${H}` } : f.hue === 'blue' ? { ...f, label: `${AREA.circle.value}` } : f,
      )
    }
  }
}

/** The area of a flat polygon in 3D (Newell's method). */
export function faceArea(pts: V3[]): number {
  let [nx, ny, nz] = [0, 0, 0]
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length]
    nx += (p[1] - q[1]) * (p[2] + q[2])
    ny += (p[2] - q[2]) * (p[0] + q[0])
    nz += (p[0] - q[0]) * (p[1] + q[1])
  })
  return Math.hypot(nx, ny, nz) / 2
}

/* ---------- drawing ---------- */

export interface View {
  /** Turn about the upright axis, in degrees. */
  yaw: number
  /** Tilt towards the viewer, in degrees: positive shows the top. */
  pitch: number
}

export interface DrawnFace {
  d: string
  hue: Hue
  /** How strongly to fill: faces turned to the viewer look brighter. */
  alpha: number
  thin: boolean
  grid: string
  label?: { x: number; y: number; text: string }
}

const r1 = (x: number) => Math.round(x * 10) / 10
const pt = (q: [number, number]) => `${r1(q[0])} ${r1(q[1])}`

/**
 * Turns the faces to `view` and fits them in a w × h box, back faces first so nearer ones paint over them.
 * The scale comes from `fit` (default: the faces), so a solid that grows can keep a steady size.
 */
export function project(faces: Face[], view: View, w: number, h: number, labels: boolean, fit: Face[] = faces): DrawnFace[] {
  const all = fit.flatMap((f) => f.pts)
  const mid = [0, 1, 2].map((i) => (Math.min(...all.map((v) => v[i])) + Math.max(...all.map((v) => v[i]))) / 2)
  const reach = Math.max(...all.map((v) => Math.hypot(v[0] - mid[0], v[1] - mid[1], v[2] - mid[2]))) || 1
  const scale = (Math.min(w, h) / 2 - 12) / reach
  const [cy, sy, cp, sp] = [Math.cos(view.yaw * RAD), Math.sin(view.yaw * RAD), Math.cos(view.pitch * RAD), Math.sin(view.pitch * RAD)]
  const turn = (v: V3): V3 => {
    const [x0, y0, z0] = [v[0] - mid[0], v[1] - mid[1], v[2] - mid[2]]
    const x = x0 * cy + z0 * sy
    const z = -x0 * sy + z0 * cy
    return [x, y0 * cp - z * sp, y0 * sp + z * cp]
  }
  const screen = (v: V3): [number, number] => [w / 2 + v[0] * scale, h / 2 - v[1] * scale]
  return faces
    .map((f) => {
      const tv = f.pts.map(turn)
      const depth = tv.reduce((s, v) => s + v[2], 0) / tv.length
      const e1 = [tv[1][0] - tv[0][0], tv[1][1] - tv[0][1], tv[1][2] - tv[0][2]]
      const e2 = [tv[2][0] - tv[0][0], tv[2][1] - tv[0][1], tv[2][2] - tv[0][2]]
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
      const facing = Math.abs(n[2]) / (Math.hypot(n[0], n[1], n[2]) || 1)
      const drawn: DrawnFace = {
        d: `M${tv.map((v) => pt(screen(v))).join(' L')} Z`,
        hue: f.hue,
        alpha: Math.round(((f.top ? 0.3 : 0.16) + 0.3 * facing) * 100) / 100,
        thin: !!f.thin,
        grid: (f.grid ?? []).map(([a, b]) => `M${pt(screen(turn(a)))} L${pt(screen(turn(b)))}`).join(' '),
      }
      if (labels && f.label && f.at) {
        const [x, y] = screen(turn(f.at))
        drawn.label = { x: r1(x), y: r1(y), text: f.label }
      }
      return { depth, drawn }
    })
    .sort((a, b) => a.depth - b.depth)
    .map((x) => x.drawn)
}
