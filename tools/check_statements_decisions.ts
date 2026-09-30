/**
 * Checks every Statement and Decision book question with set logic. The statements and decisions
 * are typed in below from the book (A: all x are y, S: some x are y, N: no x is y, O: some x are not
 * y). Every way the groups can overlap is tried: each possible part of the Venn diagram is either
 * empty or not, and each group must have at least one member. A decision follows when it is true in
 * every such world where all the statements are true. The option whose decisions are exactly those
 * that follow must be the marked one, and no other option may say the same.
 * Run from app/:  npx tsx ../tools/check_statements_decisions.ts
 */
import data from '../app/src/data/mat/statements-decisions.json' with { type: 'json' }

/** [kind, x, y] with one letter per group. */
type Prop = [string, string, string]
const P = (s: string): Prop => s.split(' ') as Prop

const BOOK: Record<number, { st: string[]; dec: string[] }> = {
  // P pencils, E pens, B books
  1: { st: ['A P E', 'A E B'], dec: ['S P B', 'S B E'] },
  // D donkeys, H horses, E elephants (the book's Kannada)
  2: { st: ['A D H', 'S H E'], dec: ['S H D', 'S E D'] },
  // S saints, B bachelors, G God
  3: { st: ['A S B', 'N B G'], dec: ['A B S', 'N S G'] },
  // S stones, D diamonds, M marbles
  4: { st: ['A S D', 'S D M'], dec: ['S S M', 'S M D'] },
  // B boys, P players, H healthy
  5: { st: ['S B P', 'S P H'], dec: ['S B H', 'S H P'] },
  // M mangoes, G grapes, O oranges (the book's Kannada)
  6: { st: ['S M G', 'A G O'], dec: ['S O M', 'A G M', 'S O G'] },
  // C cars, J jeeps, B buses (the book's Kannada)
  7: { st: ['S C J', 'A J B'], dec: ['S J C', 'A C B'] },
  // S students, T talented, L leaders, P patriots
  8: { st: ['S S T', 'O T L', 'S L P'], dec: ['A L T', 'S P S', 'A T P'] },
  // G girls, B brave, T teachers
  9: { st: ['A G B', 'N T B'], dec: ['A T G', 'N G T'] },
  // P poets, W writers, D directors, R producers
  10: { st: ['S P W', 'S W D', 'A D R'], dec: ['S D P', 'A R W', 'S R D'] },
  // T triangles, Q quadrilaterals, C circles
  11: { st: ['S T Q', 'S Q C'], dec: ['A T C', 'S C Q'] },
  // F flowers, S seeds, R fruits
  12: { st: ['A F S', 'S S R'], dec: ['A F R', 'A S F'] },
  // C crows, K cuckoos, P peacocks
  13: { st: ['S C K', 'A K P'], dec: ['S P C', 'A P K'] },
  // C cheetahs, T tigers, L lions
  14: { st: ['A C T', 'S T L'], dec: ['S L T', 'A T C'] },
  // F freedom fighters, P patriots, L politicians
  15: { st: ['A F P', 'N L P'], dec: ['S P F', 'S L F'] },
}

/** A world: the set of non-empty parts, each part the set of groups it is inside. */
function worlds(groups: string[]): string[][][] {
  const parts: string[][] = []
  for (let m = 1; m < 1 << groups.length; m++) parts.push(groups.filter((_, i) => m & (1 << i)))
  const out: string[][][] = []
  for (let w = 1; w < 2 ** parts.length; w++) {
    const filled = parts.filter((_, i) => Math.floor(w / 2 ** i) % 2)
    if (groups.every((g) => filled.some((p) => p.includes(g)))) out.push(filled)
  }
  return out
}

function holds(w: string[][], [k, x, y]: Prop): boolean {
  const xs = w.filter((p) => p.includes(x))
  if (k === 'A') return xs.every((p) => p.includes(y))
  if (k === 'S') return xs.some((p) => p.includes(y))
  if (k === 'N') return !xs.some((p) => p.includes(y))
  if (k === 'O') return xs.some((p) => !p.includes(y))
  throw new Error(`unknown statement ${k}`)
}

/** The decisions an option says follow, read from its English words. */
function says(option: string): string[] {
  if (/^(Neither|None)/.test(option)) return []
  const head = option.split('(')[0]
  return head.match(/\b(III|II|I)\b/g) ?? []
}

let bad = 0
const ROMAN = ['I', 'II', 'III']
for (const q of data.questions) {
  const b = BOOK[q.bookNo]
  const st = b.st.map(P)
  const dec = b.dec.map(P)
  const groups = [...new Set([...st, ...dec].flatMap(([, x, y]) => [x, y]))]
  const ok = worlds(groups).filter((w) => st.every((s) => holds(w, s)))
  if (!ok.length) throw new Error(`Q${q.bookNo}: the statements can't all be true`)
  const follows = dec.map((d, i) => (ok.every((w) => holds(w, d)) ? ROMAN[i] : '')).filter(Boolean)
  const fits = Object.entries(q.options)
    .filter(([, v]) => says(v).join() === follows.join())
    .map(([k]) => k)
  const shown = follows.join(' and ') || 'none'
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${shown} follow  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: ${shown} follow; options that say so: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
