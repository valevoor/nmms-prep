/**
 * Brute-force shape counting for Counting of Figures (Chapter 12), from a figure's straight lines.
 * Used by tools/check_counting_figures.ts (the book figures, typed in as lines) and by the
 * generator's test (the lines it draws); the generator itself works its answers out by formula.
 *
 * Every corner that can be used is a line end or a crossing. Two corners are joined when one drawn
 * line (after joining up drawn pieces that lie on the same straight line) runs through both. Then:
 * a triangle is three joined corners not on one line; a quadrilateral is four corners joined in a
 * ring, making a convex shape with no three corners on one line (a parallelogram, a rectangle or a
 * square, by its sides and angles); a pentagon is five such corners.
 */
export type Seg = [number, number, number, number]
type Pt = [number, number]

export type ShapeKind = 'triangle' | 'square' | 'rectangle' | 'parallelogram' | 'pentagon'

interface Graph {
  pts: Pt[]
  joined: boolean[][]
  eps: number
}

const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

function build(segs: Seg[]): Graph {
  const xs = segs.flatMap((s) => [s[0], s[2]])
  const ys = segs.flatMap((s) => [s[1], s[3]])
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1)
  const eps = size * 1e-7
  const onLine = (s: Seg, p: Pt) => Math.abs(cross([s[0], s[1]], [s[2], s[3]], p)) <= eps * size * 4
  const within = (s: Seg, p: Pt) =>
    p[0] >= Math.min(s[0], s[2]) - eps && p[0] <= Math.max(s[0], s[2]) + eps && p[1] >= Math.min(s[1], s[3]) - eps && p[1] <= Math.max(s[1], s[3]) + eps
  const on = (s: Seg, p: Pt) => onLine(s, p) && within(s, p)

  // Join pieces on one straight line that touch or overlap, until none are left to join.
  let lines = segs.map((s) => [...s] as Seg)
  for (let changed = true; changed; ) {
    changed = false
    outer: for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++) {
        const a = lines[i], b = lines[j]
        const bEnds: Pt[] = [[b[0], b[1]], [b[2], b[3]]]
        const aEnds: Pt[] = [[a[0], a[1]], [a[2], a[3]]]
        if (!bEnds.every((p) => onLine(a, p))) continue
        if (!bEnds.some((p) => on(a, p)) && !aEnds.some((p) => on(b, p))) continue
        const all = [...aEnds, ...bEnds]
        const dir: Pt = Math.abs(a[2] - a[0]) >= Math.abs(a[3] - a[1]) ? [1, 0] : [0, 1]
        all.sort((p, q) => p[0] * dir[0] + p[1] * dir[1] - (q[0] * dir[0] + q[1] * dir[1]))
        lines[i] = [all[0][0], all[0][1], all[3][0], all[3][1]]
        lines = lines.filter((_, k) => k !== j)
        changed = true
        break outer
      }
  }

  const pts: Pt[] = []
  const add = (p: Pt) => {
    if (!pts.some((q) => Math.abs(q[0] - p[0]) <= eps * 10 && Math.abs(q[1] - p[1]) <= eps * 10)) pts.push(p)
  }
  for (const s of lines) {
    add([s[0], s[1]])
    add([s[2], s[3]])
  }
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length; j++) {
      const [x1, y1, x2, y2] = lines[i]
      const [x3, y3, x4, y4] = lines[j]
      const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
      if (Math.abs(d) < eps * size) continue
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
      const p: Pt = [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
      if (on(lines[i], p) && on(lines[j], p)) add(p)
    }
  const joined = pts.map((p) => pts.map((q) => p !== q && lines.some((s) => on(s, p) && on(s, q))))
  return { pts, joined, eps: eps * size * 4 }
}

/** True when the ring of corners makes a convex shape with no three corners on one line. */
function convex(g: Graph, ring: number[]): boolean {
  let sign = 0
  for (let i = 0; i < ring.length; i++) {
    const c = cross(g.pts[ring[i]], g.pts[ring[(i + 1) % ring.length]], g.pts[ring[(i + 2) % ring.length]])
    if (Math.abs(c) <= g.eps) return false
    if (sign && Math.sign(c) !== sign) return false
    sign = Math.sign(c)
  }
  return true
}

function quadKind(g: Graph, [a, b, c, d]: number[]): 'square' | 'rectangle' | 'parallelogram' | 'other' {
  const [A, B, C, D] = [a, b, c, d].map((i) => g.pts[i])
  const v = (p: Pt, q: Pt): Pt => [q[0] - p[0], q[1] - p[1]]
  const par = (u: Pt, w: Pt) => Math.abs(u[0] * w[1] - u[1] * w[0]) <= g.eps
  const ab = v(A, B), bc = v(B, C), dc = v(D, C), ad = v(A, D)
  if (!par(ab, dc) || !par(bc, ad)) return 'other'
  const tol = g.eps * 10
  if (Math.abs(ab[0] * bc[0] + ab[1] * bc[1]) > tol) return 'parallelogram'
  return Math.abs(ab[0] ** 2 + ab[1] ** 2 - (bc[0] ** 2 + bc[1] ** 2)) <= tol ? 'square' : 'rectangle'
}

/** Every shape of the kind in the figure, each as its list of corners [x, y]. */
export function findShapes(segs: Seg[], kind: ShapeKind): Pt[][] {
  const g = build(segs)
  const n = g.pts.length
  const J = g.joined
  const out: number[][] = []
  if (kind === 'triangle') {
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++)
        if (J[a][b])
          for (let c = b + 1; c < n; c++) if (J[a][c] && J[b][c] && Math.abs(cross(g.pts[a], g.pts[b], g.pts[c])) > g.eps) out.push([a, b, c])
  } else {
    const k = kind === 'pentagon' ? 5 : 4
    const seen = new Set<string>()
    // Rings that start at their lowest-numbered corner; each ring is found in both directions.
    const walk = (ring: number[]) => {
      const last = ring[ring.length - 1]
      if (ring.length === k) {
        if (!J[last][ring[0]] || ring[1] > last || !convex(g, ring)) return
        if (k === 4) {
          const q = quadKind(g, ring)
          const ok = kind === 'parallelogram' ? q !== 'other' : kind === 'rectangle' ? q === 'rectangle' || q === 'square' : q === 'square'
          if (!ok) return
        }
        const key = [...ring].sort((x, y) => x - y).join(',')
        if (!seen.has(key)) {
          seen.add(key)
          out.push(ring)
        }
        return
      }
      for (let nx = ring[0] + 1; nx < n; nx++) if (J[last][nx] && !ring.includes(nx)) walk([...ring, nx])
    }
    for (let a = 0; a < n; a++) walk([a])
  }
  return out.map((r) => r.map((i) => g.pts[i]))
}

export const countShapes = (segs: Seg[], kind: ShapeKind) => findShapes(segs, kind).length
