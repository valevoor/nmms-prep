/**
 * Checks the Venn Diagrams book questions (Chapter 33). The pictures can't be read by code, so how
 * the circles of every picture sit is typed in below, read by eye from the rendered pages 93–95:
 * for every pair of circles, one inside the other ("2<1"), overlapping ("1x2") or apart ("1|2").
 * How the groups in each question are really related is typed in the same way, from what the words
 * mean. A picture matches when the groups can be given to its circles so that every pair agrees.
 * Exactly one option must match, and it must be the marked one. The coffee-and-tea counts are worked
 * out from the numbers in the picture. Also checks the book's key and the cropped pictures.
 * Run from app/:  npx tsx ../tools/check_venn_diagrams.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/venn-diagrams.json' with { type: 'json' }
import { checkFigureChapter } from './figure_check.ts'

// Key, PDF page 169.
const KEY: Record<number, string> = { 1: 'C', 2: 'B', 3: 'C', 4: 'A', 5: 'A', 6: 'C', 7: 'D', 8: 'D', 9: 'B', 10: 'C', 11: 'C', 12: 'D', 13: 'B', 14: 'C', 15: 'C' }

/** A diagram or a set of groups: every pair as "a<b" (a inside b), "axb" (overlap) or "a|b" (apart). */
type Rel = string[]

/** The option pictures of questions 1–9, circles numbered 1, 2, 3 …, and the diagrams of 13–15. */
const PICTURES: Record<string, Rel> = {
  'q01-a': ['1x2', '3<2', '1|3'],
  'q01-b': ['1x2', '3<1', '2|3'],
  'q01-c': ['1x2', '3<1', '3<2'],
  'q01-d': ['2<1', '1|3', '2|3'],
  'q02-a': ['1x2', '3<2', '1|3'],
  'q02-b': ['2<1', '1|3', '2|3'],
  'q02-c': ['2<1', '3<1', '2|3'],
  'q02-d': ['1x2', '2x3', '1|3'],
  'q03-a': ['1x2', '3<1', '3<2'],
  'q03-b': ['1x2', '2x3', '1x3'],
  'q03-c': ['2<1', '1x3', '2x3'],
  'q03-d': ['2<1', '1|3', '2|3'],
  'q04-a': ['2<1', '3<2', '3<1'],
  'q04-b': ['2<1', '1|3', '2|3'],
  'q04-c': ['1x2', '3<2', '1|3'],
  'q04-d': ['1|2', '2|3', '1|3'],
  'q05-a': ['2<1', '3<2', '3<1', '4<1', '2|4', '3|4'],
  'q05-b': ['2<1', '3<2', '3<1', '1|4', '2|4', '3|4'],
  'q05-c': ['2<1', '3<2', '3<1', '1x4', '2x4', '3|4'],
  'q05-d': ['2<1', '3<2', '3<1', '4<2', '4<1', '3|4'],
  'q06-a': ['2<1', '3<1', '4<1', '3<2', '4<2', '4<3'],
  'q06-b': ['2<1', '4<3', '1|3', '1|4', '2|3', '2|4'],
  'q06-c': ['2<1', '3<1', '2|3', '1|4', '2|4', '3|4'],
  'q06-d': ['2<1', '3<1', '3<2', '1|4', '2|4', '3|4'],
  'q07-a': ['2<1', '3<1', '4<1', '3<2', '4<2', '3|4'],
  'q07-b': ['2<1', '3<1', '4<1', '3<2', '4<2', '4<3'],
  'q07-c': ['2<1', '3<1', '4<1', '2x3', '2|4', '3|4'],
  'q07-d': ['2<1', '3<1', '4<1', '2x3', '4<2', '4<3'],
  'q08-a': ['2<1', '3<1', '2|3'],
  'q08-b': ['1x2', '2x3', '1|3'],
  'q08-c': ['1x2', '3<1', '2|3'],
  'q08-d': ['1x2', '3<1', '3<2'],
  'q09-a': ['2<1', '3<1', '2|3'],
  'q09-b': ['2<1', '3<1', '2x3'],
  'q09-c': ['1x2', '3<1', '2|3'],
  'q09-d': ['2<1', '3<2', '3<1'],
  q13: ['1x2', '3<1', '3<2'],
  q14: ['2<1', '3<1', '2|3'],
  q15: ['1x2', '2x3', '1x3'],
}

/** How the groups of questions 1–9 are related (from what the words mean). */
const GROUPS: Record<number, Rel> = {
  // Herbivorous, Carnivorous, Dog (the book counts a dog as eating both)
  1: ['HxC', 'D<H', 'D<C'],
  // Oviparous animals, Bat, Lizard
  2: ['L<O', 'B|O', 'B|L'],
  // Graduate, Professor, Singer
  3: ['P<G', 'SxG', 'SxP'],
  // Solar system, Comet, Galaxy
  4: ['C<S', 'S<G', 'C<G'],
  // Living organisms, Mammals, Dog, Pigeon
  5: ['M<L', 'D<M', 'D<L', 'P<L', 'P|M', 'P|D'],
  // Zero, Integers, Natural numbers, Irrational numbers
  6: ['Z<I', 'N<I', 'Z|N', 'R|I', 'R|Z', 'R|N'],
  // Rhombus, Rectangle, Square, Parallelogram
  7: ['H<P', 'E<P', 'S<P', 'HxE', 'S<H', 'S<E'],
  // Nobel prize winners, Scientists, C.V. Raman
  8: ['NxS', 'R<N', 'R<S'],
  // Even, Prime, Natural numbers
  9: ['E<N', 'P<N', 'ExP'],
}

/** The word options of questions 13–15, as related groups. */
const NAMED: Record<number, Record<string, Rel>> = {
  // A tiger is a wild animal but not herbivorous; herbivores and carnivores have no animal in common.
  13: { A: ['WxH', 'T<W', 'T|H'], B: ['WxH', 'E<W', 'E<H'], C: ['E<H', 'H|C', 'E|C'], D: ['WxH', 'WxC', 'H|C'] },
  // Some people play both hockey and kabaddi; a stick and a ball are both part of hockey.
  14: { A: ['H<P', 'K<P', 'HxK'], B: ['H<P', 'SxP', 'SxH'], C: ['S<H', 'B<H', 'S|B'], D: ['SxP', 'DxP', 'SxD'] },
  // Teachers and farmers are human beings; a blackboard is not a person; humans are animals.
  15: { A: ['TxF', 'T<H', 'F<H'], B: ['T|B', 'TxA', 'A|B'], C: ['TxF', 'FxA', 'TxA'], D: ['F<H', 'H<A', 'F<A'] },
}

/** Parses "a<b" / "axb" / "a|b" into a lookup of the relation between any two names. */
function parse(rel: Rel): { names: string[]; of: (a: string, b: string) => string } {
  const map = new Map<string, string>()
  for (const r of rel) {
    const [a, op, b] = [r[0], r[1], r[2]]
    map.set(a + b, op)
    map.set(b + a, op === '<' ? '>' : op)
  }
  const names = [...new Set(rel.flatMap((r) => [r[0], r[2]]))]
  for (const a of names) for (const b of names) if (a !== b && !map.has(a + b)) throw new Error(`no relation for ${a} and ${b} in ${rel}`)
  return { names, of: (a, b) => map.get(a + b)! }
}

const perms = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))

/** True when the groups can be given to the picture's circles with every pair agreeing. */
function matches(groups: Rel, picture: Rel): boolean {
  const g = parse(groups)
  const p = parse(picture)
  if (g.names.length !== p.names.length) return false
  return perms(p.names).some((circle) => g.names.every((a, i) => g.names.every((b, j) => i === j || g.of(a, b) === p.of(circle[i], circle[j]))))
}

// The coffee (C) and tea (T) picture: the number in each part, by the circles it is inside.
const SURVEY: [number, string][] = [[30, 'C'], [20, 'CT'], [40, 'T']]
const COUNTS: Record<number, (inside: string) => boolean> = {
  10: (s) => s.includes('C'),
  11: (s) => s === 'T',
  12: (s) => s === 'CT',
}

let bad = 0
for (const q of data.questions) {
  const n = q.bookNo
  let fits: string[]
  if (GROUPS[n]) fits = Object.keys(q.options).filter((k) => matches(GROUPS[n], PICTURES[`q${String(n).padStart(2, '0')}-${k.toLowerCase()}`]))
  else if (NAMED[n]) fits = Object.keys(q.options).filter((k) => matches(NAMED[n][k], PICTURES[`q${n}`]))
  else {
    const count = SURVEY.filter(([, s]) => COUNTS[n](s)).reduce((t, [v]) => t + v, 0)
    fits = Object.entries(q.options).filter(([, v]) => Number(v) === count).map(([k]) => k)
  }
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${n}: ${q.answer}`)
  else (bad++, console.log(`✗ Q${n}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

// Questions 1–9 have picture options; the others ask about one picture, which must exist.
const picked = data.questions.filter((q) => 'options' in q.figures)
bad += checkFigureChapter('Venn Diagrams', picked, Object.fromEntries(picked.map((q) => [q.bookNo, KEY[q.bookNo]])))
for (const q of data.questions)
  for (const f of q.figures.terms) if (!existsSync(new URL(`../app/public/${f}`, import.meta.url))) (bad++, console.log(`✗ Q${q.bookNo}: missing picture ${f}`))
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n && q.answer === KEY[n])) (bad++, console.log(`✗ Q${n} does not match the key`))
if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
