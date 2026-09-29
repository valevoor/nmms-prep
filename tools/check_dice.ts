/**
 * Checks the Numbers in Opposite Faces (dice) book questions (Chapter 11). Every picture is typed in
 * here as face data, read by eye from the rendered pages 39–43: each drawn die as [top, left, right],
 * and each open net as rows of cells ('' for no square). Nothing is taken from the rules the book
 * quotes: the views are tried on every possible die (all ways of putting the six labels on a cube),
 * corner by corner, and the nets are folded in 3D. Exactly one option must fit, the marked answer.
 * Q8 is hidden (its net is two strips touching only at a corner, and A and D are both 5) and Q12 is
 * hidden (no drawn die fits; the key's C is drawn as a mirror image), so for them only the book's
 * own reading is checked.
 * Run from app/:  npx tsx ../tools/check_dice.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/dice.json' with { type: 'json' }

type V3 = [number, number, number]
type View = [string, string, string] // [top, left, right] as drawn
/** Face i of the cube has outward normal NORMALS[i]; faces 2k and 2k + 1 are opposite. */
const NORMALS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const faceOf = (n: V3) => NORMALS.findIndex((m) => m[0] === n[0] && m[1] === n[1] && m[2] === n[2])
const scale = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

/**
 * The three faces around each corner, clockwise as seen from outside that corner. A drawn die shows
 * one corner: going clockwise on the page, top → right → left. (At the corner (1, 1, 1), with +z on
 * top, +y is on the right and +x on the left, so clockwise is z, y, x.)
 */
const CORNERS: number[][] = []
for (const sx of [1, -1])
  for (const sy of [1, -1])
    for (const sz of [1, -1]) {
      const x = faceOf([sx, 0, 0]), y = faceOf([0, sy, 0]), z = faceOf([0, 0, sz])
      CORNERS.push(sx * sy * sz > 0 ? [z, y, x] : [z, x, y])
    }
const turns = (c: number[]) => [c, [c[1], c[2], c[0]], [c[2], c[0], c[1]]]

/** labels[i] is on face i. A view fits if some corner reads top, right, left clockwise. */
const fits = (labels: string[], [t, l, r]: View) =>
  CORNERS.some((c) => turns(c).some(([a, b, d]) => labels[a] === t && labels[b] === r && labels[d] === l))

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs]
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]))
}
/** Every labelling of the cube that shows all the views. An unseen sixth label is '?'. */
function diceFor(views: View[], labels: string[] = []): string[][] {
  const seen = [...new Set([...views.flat(), ...labels])]
  while (seen.length < 6) seen.push(`?${seen.length}`)
  if (seen.length > 6) throw new Error('more than 6 labels')
  return permutations(seen).filter((d) => views.every((v) => fits(d, v)))
}
const oppositeIn = (d: string[], x: string) => d[d.indexOf(x) ^ 1]

type Frame = { n: V3; right: V3; down: V3 }
/** Folds a net in 3D: each square's outward normal, and where the net's "right" and "down" end up. */
function foldFrames(rows: string[][]): Map<string, Frame> {
  const cells = new Map<string, string>()
  rows.forEach((row, r) => row.forEach((v, c) => v && cells.set(`${r},${c}`, v)))
  const start = [...cells.keys()][0]
  const placed = new Map<string, Frame>([[start, { n: [0, 0, 1], right: [1, 0, 0], down: [0, -1, 0] }]])
  const queue = [start]
  while (queue.length) {
    const key = queue.shift()!
    const [r, c] = key.split(',').map(Number)
    const f = placed.get(key)!
    const steps: [number, number, V3][] = [[0, 1, f.right], [0, -1, scale(f.right, -1)], [1, 0, f.down], [-1, 0, scale(f.down, -1)]]
    for (const [dr, dc, d] of steps) {
      const k2 = `${r + dr},${c + dc}`
      if (!cells.has(k2) || placed.has(k2)) continue
      // Folding down over the shared edge turns the normal n into d, and d into −n.
      const w = cross(f.n, d)
      const rot = (v: V3): V3 => [0, 1, 2].map((i) => dot(v, f.n) * d[i] - dot(v, d) * f.n[i] + dot(v, w) * w[i]) as V3
      placed.set(k2, { n: rot(f.n), right: rot(f.right), down: rot(f.down) })
      queue.push(k2)
    }
  }
  const out = new Map<string, Frame>()
  for (const [k, f] of placed) out.set(cells.get(k)!, f)
  return out
}
/** The net folded into a die (labels by face), or null if it isn't a cube net. */
function fold(rows: string[][]): string[] | null {
  const frames = foldFrames(rows)
  if (rows.flat().filter(Boolean).length !== 6 || frames.size !== 6) return null
  const d: string[] = []
  for (const [l, f] of frames) d[faceOf(f.n)] = l
  return d.filter(Boolean).length === 6 ? d : null
}

// --- The pictures, typed in -------------------------------------------------------------------
/**
 * `only`: the views the answer is read from, when all the views together fit no die at all (checked
 * below). In Q4 and Q5 the last view is drawn the wrong way round for the first two (as a mirror
 * image would be), but the first two alone already settle the answer.
 */
const VIEWS: Record<number, { views: View[]; of: string; only?: number[] }> = {
  1: { views: [['3', '1', '6'], ['3', '2', '5']], of: '6' },
  2: { views: [['3', '5', '6'], ['5', '2', '4'], ['1', '2', '3']], of: '5' },
  3: { views: [['B', 'F', 'C'], ['A', 'E', 'C']], of: 'B' },
  4: { views: [['Black', 'Yellow', 'Pink'], ['Black', 'Orange', 'Blue'], ['Yellow', 'Pink', 'Green']], of: 'Black', only: [0, 1] },
  // Dots, counted.
  5: { views: [['2', '4', '5'], ['5', '3', '1'], ['4', '1', '6']], of: '6', only: [0, 1] },
  6: { views: [['II', 'III', 'I'], ['V', 'I', 'III'], ['III', 'IV', 'V'], ['IV', 'III', 'II']], of: 'V' },
}
const NETS: Record<number, { net: string[][]; of: string }> = {
  7: { net: [['', '3', '5'], ['', '6', ''], ['', '2', ''], ['1', '4', '']], of: '6' },
  9: { net: [['', 'Q', ''], ['O', 'M', 'N'], ['', 'R', ''], ['', 'P', '']], of: 'M' },
  10: { net: [['', '+', ''], ['*', '×', ''], ['', '-', '='], ['', '÷', '']], of: '*' },
}
/** Q8 as printed: 4 1 3 on top and 2 5 6 below, the two strips touching only at a corner. */
const Q8: string[][] = [['4', '1', '3', '', '', ''], ['', '', '', '2', '5', '6']]
/** Q11: five squares in a cross, with a triangle on the outer edge of 40, 50, 30 and 20. */
const Q11 = {
  net: [['', '40', ''], ['50', '10', '30'], ['', '20', '']],
  flaps: { '+': ['40', -1, 0], '×': ['50', 0, -1], '÷': ['30', 0, 1], '-': ['20', 1, 0] } as Record<string, [string, number, number]>,
}
const Q12 = {
  net: [['M', 'N', 'O'], ['', 'P', ''], ['', 'Q', ''], ['', 'R', '']],
  options: { A: ['M', 'O', 'R'], B: ['N', 'Q', 'R'], C: ['N', 'R', 'O'], D: ['O', 'P', 'R'] } as Record<string, View>,
}
const Q13: Record<string, number[]> = { A: [2, 3, 6], B: [1, 2, 3], C: [1, 5, 6], D: [4, 5, 1] }
/** Q14: tri = Δ, rt = right triangle, par = parallelogram, hex = hexagon, circ = O, dia = diamond. */
const Q14 = {
  net: [['', 'tri', ''], ['rt', 'par', 'hex'], ['', 'circ', ''], ['', 'dia', '']],
  options: { A: ['tri', 'circ'], B: ['rt', 'hex'], C: ['par', 'dia'], D: ['circ', 'par'] } as Record<string, [string, string]>,
}
const Q15 = {
  views: [['1', '4', '6'], ['3', '6', '2']] as View[],
  options: {
    A: [['4', '3'], ['1', '2'], ['6', '5']],
    B: [['1', '3'], ['4', '6'], ['2', '6']],
    C: [['1', '3'], ['4', '6'], ['2', '5']],
    D: [['4', '3'], ['1', '6'], ['2', '5']],
  } as Record<string, [string, string][]>,
}

const HIDDEN = new Set([8, 12])
// Key, PDF page 126.
const KEY: Record<number, string> = { 1: 'C', 2: 'A', 3: 'D', 4: 'D', 5: 'D', 6: 'A', 7: 'A', 8: 'B', 9: 'D', 10: 'C', 11: 'D', 12: 'C', 13: 'C', 14: 'D', 15: 'A' }

/** Which options are right, and a line saying why. */
function solve(no: number, options: Record<string, string>): [string[], string] {
  const matching = (v: string) => Object.keys(options).filter((k) => options[k] === v)
  if (VIEWS[no]) {
    const { views, of, only } = VIEWS[no]
    if (only && diceFor(views).length) return [[], 'all the views fit one die after all: drop `only` and the note']
    const used = only ? only.map((i) => views[i]) : views
    // The unseen faces still carry the labels of the other views.
    const dice = diceFor(used, views.flat())
    if (!dice.length) return [[], 'no die shows all the views']
    const opp = new Set(dice.map((d) => oppositeIn(d, of)))
    if (opp.size !== 1) return [[], `the views leave it open: ${[...opp].join(' or ')}`]
    const [o] = opp
    return [matching(o), `${dice.length} labelling(s) fit ${only ? `views ${only.map((i) => i + 1).join(' and ')} (all ${views.length} together fit none)` : 'the views'}; opposite ${of} is ${o}`]
  }
  if (NETS[no]) {
    const d = fold(NETS[no].net)
    if (!d) return [[], 'the net does not fold']
    const o = oppositeIn(d, NETS[no].of)
    return [matching(o), `folded, opposite ${NETS[no].of} is ${o}`]
  }
  if (no === 8) {
    if (fold(Q8)) return [[], 'Q8 folds after all: unhide it']
    // The book reads the top strip alone: in a row of three, the first and third are opposite.
    return [matching(Q8[0][2]), `not a net (corner join); the book's row 4 1 3 puts ${Q8[0][2]} opposite 4`]
  }
  if (no === 11) {
    // Five squares: add the missing sixth above 40 and fold; it must come out opposite 10.
    const withLid = [['', 'lid', ''], ...Q11.net]
    const d = fold(withLid)
    if (!d || oppositeIn(d, '10') !== 'lid') return [[], 'the open side is not opposite 10']
    // A flap on a square's outer edge folds over onto the side that edge ends up bordering.
    const frames = foldFrames(withLid)
    const onLid = Object.keys(Q11.flaps).filter((s) => {
      const [sq, dr, dc] = Q11.flaps[s]
      const f = frames.get(sq)!
      return d[faceOf(dr ? scale(f.down, dr) : scale(f.right, dc))] === 'lid'
    })
    const want = onLid.sort().join(',')
    const ok = Object.keys(options).filter((k) => options[k].split(',').map((s) => s.trim().replace('−', '-')).sort().join(',') === want)
    return [ok, `the open side opposite 10 is closed by the flaps ${want}`]
  }
  if (no === 12) {
    // No drawn die fits exactly: C, the key, is the only one with no opposite pair, but it is drawn
    // as the mirror image (the folded net has O on the left and R on the right). Check both facts.
    const d = fold(Q12.net)!
    const exact = Object.keys(Q12.options).filter((k) => fits(d, Q12.options[k]))
    if (exact.length) return [[], `option ${exact.join(', ')} fits exactly: unhide`]
    const noPair = Object.keys(Q12.options).filter((k) => Q12.options[k].every((a) => !Q12.options[k].includes(oppositeIn(d, a))))
    const mirrored = noPair.filter((k) => fits(d, [Q12.options[k][0], Q12.options[k][2], Q12.options[k][1]]))
    return [mirrored, 'no drawn die fits; the only one without an opposite pair is the mirror image of a right one']
  }
  if (no === 13) {
    // A standard die has 1–6, 2–5 and 3–4 opposite; the book calls a die with two touching faces adding to 7 a "general" die.
    const adds7 = (k: string) => Q13[k].some((a, i) => Q13[k].some((b, j) => i < j && a + b === 7))
    return [Object.keys(Q13).filter(adds7), 'the only view with two touching faces adding to 7']
  }
  if (no === 14) {
    const d = fold(Q14.net)!
    return [Object.keys(Q14.options).filter((k) => oppositeIn(d, Q14.options[k][0]) !== Q14.options[k][1]), 'folded; the one pair that is not opposite']
  }
  if (no === 15) {
    const dice = diceFor(Q15.views, ['1', '2', '3', '4', '5', '6'])
    const ok = Object.keys(Q15.options).filter((k) => dice.some((d) => Q15.options[k].every(([a, b]) => oppositeIn(d, a) === b)))
    return [ok, `${dice.length} labelling(s) fit the views; each option's pairs tried on them`]
  }
  return [[], 'not typed in']
}

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  const [ok, why] = solve(no, q.options as Record<string, string>)
  const figs = q.figures as { terms: string[]; options?: Record<string, string> }
  for (const f of [...figs.terms, ...Object.values(figs.options ?? {})]) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if (HIDDEN.has(no) !== ('status' in q)) fail(no, HIDDEN.has(no) ? 'should be hidden' : 'hidden but checks out')
  if ('status' in q && !('note' in q)) fail(no, 'hidden without a note')
  if (ok.length === 1 && ok[0] === q.answer) console.log(`✓ Q${no}: ${why}  →  ${q.answer}${HIDDEN.has(no) ? ' (hidden)' : ''}`)
  else fail(no, `${why}; options that fit: ${ok.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll dice answers check out.')
