// "Try a mirror" (Ch 8) and "Try water" (Ch 9): the rules for flipping typed characters and the shapes
// placed on a 4x4 grid. Everything the page draws comes from here.

export type Kind = 'mirror' | 'water'
/** n: as it is; x: mirror on the right (left and right swap); y: water below (top and bottom swap). */
export type Flip = 'n' | 'x' | 'y'

/** The flip each chapter is about. */
export const FLIP: Record<Kind, Flip> = { mirror: 'x', water: 'y' }

// ---------- characters ----------

/** Keyboard characters (printable ASCII) that look the same after each flip, in the app's sans-serif font. */
const SAME: Record<Exclude<Flip, 'n'>, string> = {
  x: 'AHIMOTUVWXYilovwx08!"\'*+-.:=^_|#',
  y: 'BCDEHIKOXclox038-+=*:|<>()[]{}#',
}
/** Pairs of characters that turn into each other. */
const PAIRS: Record<Exclude<Flip, 'n'>, string[]> = {
  x: ['()', '[]', '{}', '<>', '/\\', 'bd', 'pq'],
  y: ['bp', 'dq', 'MW', 'nu', '/\\'],
}

/** Keeps only what can be typed on an English keyboard (printable ASCII). */
export const keyboardOnly = (s: string) => s.replace(/[^\x20-\x7e]/g, '')

export function partner(f: Flip, ch: string): string | null {
  if (f === 'n') return null
  for (const p of PAIRS[f]) {
    if (p[0] === ch) return p[1]
    if (p[1] === ch) return p[0]
  }
  return null
}

export const looksSame = (f: Flip, ch: string) => f === 'n' || ch === ' ' || SAME[f].includes(ch)

export interface Glyph {
  ch: string
  flip: Flip
}
export interface TextView {
  glyphs: Glyph[]
}

/** The characters in order (reversed if `reverse`), each drawn with the flip. */
export function textView(text: string, reverse: boolean, f: Flip): TextView {
  const chars = Array.from(text)
  if (reverse) chars.reverse()
  return { glyphs: chars.map((ch) => ({ ch, flip: f })) }
}

// ---------- shapes on a grid ----------

export type ShapeKind = 'tri' | 'sq' | 'rect' | 'flag'
export const SHAPE_KINDS: ShapeKind[] = ['tri', 'sq', 'rect', 'flag']
export interface Cell {
  k: ShapeKind
  /** Quarter turns clockwise: 0, 90, 180 or 270. */
  rot: number
  filled: boolean
}
export type Board = (Cell | null)[]
export const SIZE = 4

/** Each shape's corners in a 40x40 square. The flag is a pole with a pennant; its path isn't closed. */
const PTS: Record<ShapeKind, [number, number][]> = {
  tri: [[8, 32], [8, 8], [32, 32]],
  sq: [[8, 8], [32, 8], [32, 32], [8, 32]],
  rect: [[4, 12], [36, 12], [36, 28], [4, 28]],
  flag: [[10, 34], [10, 6], [32, 13], [10, 20]],
}
const OPEN: Record<ShapeKind, boolean> = { tri: false, sq: false, rect: false, flag: true }

/** A point of a cell's shape: turned by `rot` (clockwise on screen), then flipped. */
export function placePoint([x, y]: [number, number], rot: number, f: Flip): [number, number] {
  for (let i = 0; i < ((rot / 90) % 4 + 4) % 4; i++) [x, y] = [40 - y, x]
  if (f === 'x') x = 40 - x
  if (f === 'y') y = 40 - y
  return [x, y]
}

/** The SVG path of a shape (in a 40x40 square) turned and flipped. */
export function shapePath(k: ShapeKind, rot = 0, f: Flip = 'n'): string {
  const pts = PTS[k].map((p) => placePoint(p, rot, f))
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + (OPEN[k] ? '' : 'Z')
}

/** Where cell (r, c) of the image comes from. */
const SOURCE: Record<Flip, (r: number, c: number) => number> = {
  n: (r, c) => r * SIZE + c,
  x: (r, c) => r * SIZE + (SIZE - 1 - c),
  y: (r, c) => (SIZE - 1 - r) * SIZE + c,
}

export interface DrawnCell {
  /** SVG path in a 40x40 square, or '' for an empty cell. */
  d: string
  filled: boolean
}
export interface BoardView {
  cells: DrawnCell[]
}

/** The board with its cells moved as `move` would move them, and each shape drawn flipped by `flip`. */
export function boardView(b: Board, move: Flip, flip: Flip): BoardView {
  const cells: DrawnCell[] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const cell = b[SOURCE[move](r, c)]
      cells.push(cell ? { d: shapePath(cell.k, cell.rot, flip), filled: cell.filled } : { d: '', filled: false })
    }
  return { cells }
}

export const emptyBoard = (): Board => Array<Cell | null>(SIZE * SIZE).fill(null)

/** The board a student first sees: a few shapes, each of which looks different in a mirror and in water. */
export function startBoard(): Board {
  const b = emptyBoard()
  b[0] = { k: 'flag', rot: 0, filled: true }
  b[6] = { k: 'rect', rot: 0, filled: false }
  b[9] = { k: 'tri', rot: 90, filled: false }
  b[15] = { k: 'tri', rot: 0, filled: true }
  return b
}

/** Tapping a cell: Erase empties it; the same shape turns a quarter; anything else puts the shape there. */
export function tapCell(b: Board, i: number, tool: ShapeKind | 'erase', filled: boolean): Board {
  const next = b.slice()
  const cur = next[i]
  if (tool === 'erase') next[i] = null
  else if (cur && cur.k === tool) next[i] = { ...cur, rot: (cur.rot + 90) % 360 }
  else next[i] = { k: tool, rot: 0, filled }
  return next
}
