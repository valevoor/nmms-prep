/**
 * Checks every "Odd one out: letters" book question: an independent rule must hold for exactly
 * three options, and the one it fails must be the marked answer.
 * Run from app/:  npx tsx ../tools/check_odd_letters.ts
 */
import data from '../app/src/data/mat/odd-one-letters.json' with { type: 'json' }

const P = (c: string) => c.charCodeAt(0) - 64
/** Forward distance from a to b round the alphabet (1–26). */
const fwd = (a: string, b: string) => ((P(b) - P(a) + 26) % 26) || 26
const letters = (s: string) => [...s.replace(/[^A-Z]/g, '')]
const gaps = (s: string) => letters(s).slice(1).map((c, i) => fwd(letters(s)[i], c))
const isCube = (n: number) => Math.round(Math.cbrt(n)) ** 3 === n
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))
const STRAIGHT = new Set('AEFHIKLMNTVWXYZ')

const RULES: Record<string, (o: string) => boolean> = {
  'ol-b01': (o) => gaps(o).every((g) => g === 25),
  'ol-b02': (o) => 'AEIOU'.includes(o[0]) && gaps(o.slice(1)).every((g) => g === 1),
  'ol-b03': (o) => gaps(o)[0] === 24,
  'ol-b04': (o) => isSquare(Number(letters(o).map(P).join(''))),
  // Skip 2, then 1, then 0 letters going backwards: back 3, 2, 1.
  'ol-b05': (o) => gaps(o).join() === '23,24,25',
  'ol-b06': (o) => fwd(o[0], o[1]) === 13 && fwd(o[2], o[3]) === 13,
  'ol-b07': (o) => letters(o).every((c) => P(c) % 2 === 0),
  'ol-b08': (o) => P(o[0]) + P(o[1]) === P(o[2]),
  'ol-b09': (o) => letters(o).every((c) => STRAIGHT.has(c)),
  'ol-b10': (o) => gaps(o).join() === '25,24,23',
  'ol-b11': (o) => isCube(P(o[0]) * P(o[1])),
  'ol-b12': (o) => P(o[0]) + P(o[1]) === Number(o.split(' ')[1]),
  'ol-b13': (o) => new Set(o).size === o.length,
  'ol-b14': (o) => gaps(o).join() === '2,3,4',
  'ol-b15': (o) => isCube(letters(o).reduce((s, c) => s + P(c), 0)),
}

let bad = 0
for (const q of data.questions) {
  const odd = Object.entries(q.options).filter(([, v]) => !RULES[q.id](v)).map(([k]) => k)
  const review = 'status' in q ? ' (needs review, hidden)' : ''
  if (odd.length === 1 && odd[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as keyof typeof q.options]} is the odd one  →  ${q.answer}${review}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: options that break the rule: ${odd.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
