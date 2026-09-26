/**
 * Checks every Number Patterns book question on its table: each number is found in the grid, and
 * every move of the whole shape that turns the first group into the third, cell by cell and in order,
 * is applied to the second group. A plain shift comes first; a flip (left–right or top–bottom, then a
 * shift) counts only when no plain shift fits, as in the book: a straight line flipped is still a line.
 * All fitting moves must agree, exactly one option must match, and it must be the marked one.
 * Run from app/:  npx tsx ../tools/check_number_patterns.ts
 */
import data from '../app/src/data/mat/number-patterns.json' with { type: 'json' }

type Cell = [number, number]

function solve(grid: number[][], a: number[], b: number[], c: number[]): string[] {
  const at = new Map<number, Cell>()
  grid.forEach((row, r) => row.forEach((n, col) => at.set(n, [r, col])))
  const cellsOf = (g: number[]) => g.map((n) => at.get(n) ?? (() => { throw new Error(`${n} is not in the table`) })())
  const [A, B, C] = [cellsOf(a), cellsOf(b), cellsOf(c)]
  const H = grid.length
  const W = grid[0].length
  const results = new Set<string>()
  for (const [flipR, flipC] of [[false, false], [true, false], [false, true], [true, true]]) {
    if (results.size && (flipR || flipC)) break
    const orient = ([r, col]: Cell): Cell => [flipR ? H - 1 - r : r, flipC ? W - 1 - col : col]
    const o0 = orient(A[0])
    const [dr, dc] = [C[0][0] - o0[0], C[0][1] - o0[1]]
    const move = (p: Cell): Cell => {
      const o = orient(p)
      return [o[0] + dr, o[1] + dc]
    }
    if (!A.every((p, i) => move(p)[0] === C[i][0] && move(p)[1] === C[i][1])) continue
    const out = B.map(move)
    if (out.some(([r, col]) => r < 0 || r >= H || col < 0 || col >= W)) continue
    results.add(out.map(([r, col]) => grid[r][col]).join(' '))
  }
  return [...results]
}

const nums = (s: string) => s.split(' ').map(Number)
let bad = 0
for (const q of data.questions) {
  const [a, b, c] = q.terms
  // Q3 lists squares of table numbers.
  const squares = q.id === 'np-b03'
  const root = (s: string) => (squares ? nums(s).map(Math.sqrt) : nums(s))
  const outs = solve(q.grid, root(a), root(b), root(c)).map((s) => (squares ? nums(s).map((n) => n * n).join(' ') : s))
  if (outs.length !== 1) {
    bad++
    console.log(`✗ Q${q.bookNo}: ${outs.length === 0 ? 'no move of the shape fits' : `moves disagree: ${outs.join(' / ')}`}`)
    continue
  }
  const fits = Object.entries(q.options).filter(([, v]) => v === outs[0]).map(([k]) => k)
  if ('status' in q) {
    if (fits.length === 0) console.log(`✓ Q${q.bookNo}: hidden; the answer is ${outs[0]}, which is not an option`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but option ${fits.join(', ')} fits`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${outs[0]}  →  ${q.answer}${q.keyFrom === 'solved' ? ' (solved; book key differs)' : ''}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: pattern gives ${outs[0]}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
