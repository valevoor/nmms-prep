import type { NetCell } from './generators/dice'

/**
 * Folding an open dice (a cube net) in 3D, for the dice fold page (#/t/dice/fold). One square stays
 * put (the root) and every other square hinges on the edge it shares with its parent, so the dice
 * forms behind the root. Angles follow CSS: x right, y down, z towards the viewer, so the same numbers
 * drive components/DiceFold.tsx and the opposite pairs worked out here.
 */

export type Side = 'right' | 'left' | 'up' | 'down'
export type Vec = [number, number, number]

export interface FoldNode {
  cell: NetCell
  /** The edge of its parent it hangs from; null for the root. */
  side: Side | null
  children: FoldNode[]
}

const STEPS: [Side, number, number][] = [
  ['right', 0, 1],
  ['left', 0, -1],
  ['up', -1, 0],
  ['down', 1, 0],
]

/** The root is a square with the most neighbours, nearest the middle of the net, so the fold looks balanced. */
function pickRoot(net: NetCell[]): NetCell {
  const at = new Set(net.map(([r, c]) => `${r},${c}`))
  const degree = ([r, c]: NetCell) => STEPS.filter(([, dr, dc]) => at.has(`${r + dr},${c + dc}`)).length
  const [mr, mc] = middle(net)
  const dist = ([r, c]: NetCell) => Math.abs(r + 0.5 - mr) + Math.abs(c + 0.5 - mc)
  return [...net].sort((a, b) => degree(b) - degree(a) || dist(a) - dist(b))[0]
}

/** The middle of the net's bounding box, in squares. */
function middle(net: NetCell[]): [number, number] {
  const rs = net.map(([r]) => r), cs = net.map(([, c]) => c)
  return [(Math.min(...rs) + Math.max(...rs) + 1) / 2, (Math.min(...cs) + Math.max(...cs) + 1) / 2]
}

/** The net as a tree of hinges from the root (breadth first, so each square hangs from a near neighbour). */
export function foldTree(net: NetCell[]): FoldNode {
  const byPos = new Map(net.map((cell) => [`${cell[0]},${cell[1]}`, cell]))
  const root: FoldNode = { cell: pickRoot(net), side: null, children: [] }
  const seen = new Set([root.cell])
  const queue = [root]
  while (queue.length) {
    const n = queue.shift()!
    for (const [side, dr, dc] of STEPS) {
      const cell = byPos.get(`${n.cell[0] + dr},${n.cell[1] + dc}`)
      if (!cell || seen.has(cell)) continue
      seen.add(cell)
      const child: FoldNode = { cell, side, children: [] }
      n.children.push(child)
      queue.push(child)
    }
  }
  return root
}

/** How far the flat net must move (in squares) so its middle, not the root, sits at the centre. */
export function netOffset(net: NetCell[], root: NetCell): [number, number] {
  const [mr, mc] = middle(net)
  return [mc - (root[1] + 0.5), mr - (root[0] + 0.5)]
}

/** The CSS rotation (degrees about x, about y) that folds a square hanging from `side` by `deg`, away from the viewer. */
export function hinge(side: Side, deg: number): [number, number] {
  switch (side) {
    case 'right':
      return [0, deg]
    case 'left':
      return [0, -deg]
    case 'up':
      return [deg, 0]
    case 'down':
      return [-deg, 0]
  }
}

const rad = (d: number) => (d * Math.PI) / 180
/** CSS rotateX and rotateY applied to a vector. */
export const rotX = (d: number, [x, y, z]: Vec): Vec => [x, y * Math.cos(rad(d)) - z * Math.sin(rad(d)), y * Math.sin(rad(d)) + z * Math.cos(rad(d))]
export const rotY = (d: number, [x, y, z]: Vec): Vec => [x * Math.cos(rad(d)) + z * Math.sin(rad(d)), y, -x * Math.sin(rad(d)) + z * Math.cos(rad(d))]

/**
 * The way each square faces (its outward normal) when folded by t (0 flat, 1 a dice), with the whole
 * thing tilted (about x) after it is spun (about y), as the scene draws it.
 */
export function normals(tree: FoldNode, t: number, tilt = 0, spin = 0): Map<string, Vec> {
  const out = new Map<string, Vec>()
  const walk = (n: FoldNode, chain: Side[]) => {
    const sides = n.side ? [...chain, n.side] : chain
    let v: Vec = [0, 0, 1]
    for (let i = sides.length - 1; i >= 0; i--) {
      const [ax, ay] = hinge(sides[i], 90 * t)
      v = rotX(ax, rotY(ay, v))
    }
    out.set(n.cell[2], rotX(tilt, rotY(spin, v)))
    n.children.forEach((c) => walk(c, sides))
  }
  walk(tree, [])
  return out
}

/** The three pairs of opposite faces of the folded dice, in the order the net is read (row by row). */
export function oppositePairs(net: NetCell[]): [string, string][] {
  const ns = normals(foldTree(net), 1)
  const order = [...net].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, , l]) => l)
  const pairs: [string, string][] = []
  const used = new Set<string>()
  for (const a of order) {
    if (used.has(a)) continue
    const [x, y, z] = ns.get(a)!
    const b = order.find((o) => {
      const [p, q, r] = ns.get(o)!
      return o !== a && !used.has(o) && Math.abs(x + p) + Math.abs(y + q) + Math.abs(z + r) < 1e-6
    })
    if (!b) throw new Error(`no face opposite ${a}: not a cube net`)
    used.add(a).add(b)
    pairs.push([a, b])
  }
  return pairs
}
