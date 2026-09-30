/**
 * Checks every Age Problems book question by brute force: every whole-number age (or pair of ages)
 * from 1 to 120 is tried against the question's conditions, typed in below from the book, and the
 * asked value of each age that fits is collected. There must be exactly one such value, exactly one
 * option must give it, and it must be the marked one.
 * Run from app/:  npx tsx ../tools/check_age_problems.ts
 */
import data from '../app/src/data/mat/age-problems.json' with { type: 'json' }

const AGES = Array.from({ length: 120 }, (_, i) => i + 1)
const pairs = AGES.flatMap((a) => AGES.map((b) => [a, b] as const))
/** a : b = m : n */
const ratio = (a: number, b: number, m: number, n: number) => a * n === b * m

/** Book number → the asked value for every age (or pair) that fits the conditions. */
const SOLVE: Record<number, () => string[]> = {
  1: () => AGES.filter((x) => x + 15 === 5 * (x - 5)).map(String),
  2: () => pairs.filter(([f, s]) => f + s === 90 && f + 5 === 3 * (s + 5)).map(([f]) => String(f)),
  // Years ago: the younger ages must stay above 0.
  3: () => AGES.filter((y) => y < 20 && ratio(20 - y, 30 - y, 3, 5)).map(String),
  4: () => AGES.filter((x) => x + 15 === 3 * (x - 5)).map(String),
  5: () => pairs.filter(([me, son]) => me === 4 * son && me + 5 === 3 * (son + 5)).map(([me, son]) => String(me + son)),
  6: () => pairs.filter(([r, h]) => ratio(r, h, 5, 6) && ratio(r + 6, h + 6, 7, 8)).map(([r, h]) => String(Math.abs(r - h))),
  7: () => pairs.filter(([a, b]) => a > 4 && b > 4 && ratio(a - 4, b - 4, 2, 3) && ratio(a + 4, b + 4, 5, 7)).map(([a, b]) => `${a}, ${b}`),
  8: () => pairs.filter(([a, b]) => a > b && a + b === 11 * (a - b) && a + b + 10 === 13 * (a - b)).map(([a]) => String(a)),
}

let bad = 0
for (const q of data.questions) {
  const found = [...new Set(SOLVE[q.bookNo]())]
  const fits = Object.entries(q.options).filter(([, v]) => found.includes(v.replace(' years', ''))).map(([k]) => k)
  if (found.length === 1 && fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${found[0]}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: values ${found.join(' / ') || 'none'}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
