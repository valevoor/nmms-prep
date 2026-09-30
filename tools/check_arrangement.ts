/**
 * Checks every Arrangement Test book question. Each answer is worked out below by its own rule from
 * the numbers in the question (typed in here), and the seating questions by trying every possible
 * seating and keeping those that fit all the clues. An option fits when it agrees with the answer
 * in every seating that is left. Exactly one option must fit, and it must be the marked one; hidden
 * questions must have none or more than one.
 * Run from app/:  npx tsx ../tools/check_arrangement.ts
 */
import data from '../app/src/data/mat/arrangement.json' with { type: 'json' }

const perms = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))
const words = ['', 'One', 'Two', 'Three', 'Four']
/** How many places keep the same symbol when the string is sorted. */
const stay = (s: string) => [...s].filter((c, i) => [...s].sort()[i] === c).length
const isPrime = (n: number) => n > 1 && [...Array(n).keys()].slice(2).every((d) => n % d)

/** Circles: every seating (the first seat fixed), as the order going clockwise. */
function circles(names: string[]): string[][] {
  return perms(names.slice(1)).map((p) => [names[0], ...p])
}
const nextTo = (c: string[], a: string, b: string) => [1, c.length - 1].includes(Math.abs(c.indexOf(a) - c.indexOf(b)))
/** a and b sit between p and n: going round one way from p to n passes exactly a and b. */
function between(c: string[], p: string, n: string, a: string, b: string): boolean {
  const k = c.length
  for (const dir of [1, -1]) {
    const passed: string[] = []
    for (let i = (c.indexOf(p) + dir + k) % k; c[i] !== n; i = (i + dir + k) % k) passed.push(c[i])
    if (passed.length === 2 && passed.includes(a) && passed.includes(b)) return true
  }
  return false
}

/** The two rows of Q14–15, as page order left to right, that fit every clue. */
function rows(): [string[], string[]][] {
  const out: [string[], string[]][] = []
  for (const r1 of perms('ABCDEF'.split(''))) {
    const p = (c: string) => r1.indexOf(c) + 1
    // Row 1 faces south, so its "left" is further right on the page.
    if (Math.abs(p('E') - p('F')) !== 2 || !(p('C') > p('D') && p('C') < p('B'))) continue
    for (const r2 of perms('UVWXYZ'.split(''))) {
      const q = (c: string) => r2.indexOf(c) + 1
      if (q('X') - 3 !== p('E')) continue
      if (![p('E'), q('X')].some((x) => x === 1 || x === 6)) continue
      if (6 - p('F') !== 6 - q('Z') || Math.abs(q('Z') - p('A')) !== 3) continue
      if (Math.abs(p('A') - p('F')) !== Math.abs(q('Y') - q('U')) || Math.abs(q('Y') - q('Z')) === 1) continue
      if (q('W') <= q('V') || q('W') === p('A')) continue
      out.push([r1, r2])
    }
  }
  return out
}

/** Book number → every answer the question can have (one per seating, for the seating ones). */
const ANSWERS: Record<number, () => string[]> = {
  1: () => [String(50 - 20 + 1)],
  2: () => [String(10 + 25 - 1)],
  3: () => [String(7 + 7 - 1)],
  4: () => [String(18 - (10 - 5) + 1)],
  5: () => [String(stay('97424105869591845207'))],
  6: () => [String(stay('MATHEMATICS'))],
  // After the switch Trupti stands where Hema stood: 16th from the left, 10th from the right.
  7: () => [String(16 + 10 - 1)],
  8: () => [String(45 - (25 + 6) + 1)],
  // As printed: 24 students are in front of the 25th.
  9: () => [String(25 - 1)],
  10: () =>
    circles('MNOPQR'.split(''))
      .filter((c) => nextTo(c, 'M', 'P') && nextTo(c, 'R', 'O') && between(c, 'P', 'N', 'M', 'Q'))
      .map((c) => c[(c.indexOf('O') + 1) % 6]),
  11: () =>
    circles(['Vivo', 'Oppo', 'Nokia', 'Samsung', 'Redmi'])
      .filter((c) => between3(c, 'Vivo', 'Nokia', 'Samsung') && between3(c, 'Nokia', 'Redmi', 'Oppo'))
      .map((c) => c[(c.indexOf('Vivo') + 2) % 5]),
  12: () => {
    const seeds = [4 % 2 === 0 && 'Wheat', !isPrime(4) && 4 > 1 && 'Corn', isPrime(4) && 'Chickpeas'].filter(Boolean) as string[]
    return [seeds.sort().join()]
  },
  13: () => {
    // 10 digits d1..d10 from the clues: first composite 4 in place 4, first perfect number 6 in place 6.
    const d = Array(11).fill(-1)
    d[4] = 4
    d[6] = 6
    d[3] = d[5] = 4 / 2
    d[9] = d[10] = 6 / 2
    d[1] = d[2] = 3 * d[10]
    d[7] = d[5] + d[6]
    d[8] = d[6] - d[5]
    return [d.slice(1).join('')]
  },
  14: () => rows().map(([r1, r2]) => words[Math.abs(r2.indexOf('Y') - r1.indexOf('F')) - 1]),
  15: () =>
    rows().map(([r1, r2]) => {
      const gap = (s: string) => {
        const row = r1.includes(s[0]) ? r1 : r2
        return Math.abs(row.indexOf(s[0]) - row.indexOf(s[1])) - 1
      }
      const pairs = ['YW', 'AF', 'DE', 'CB']
      return pairs.find((x) => pairs.filter((y) => gap(y) === gap(x)).length === 1) ?? '?'
    }),
}
/** m sits between a and b round a circle (next to both). */
function between3(c: string[], a: string, b: string, m: string): boolean {
  const k = c.length
  const i = c.indexOf(m)
  const nb = [c[(i + 1) % k], c[(i - 1 + k) % k]]
  return nb.includes(a) && nb.includes(b)
}

/** An option's text as the checker's answer (Q12's seeds in any order). */
const norm = (n: number, v: string) => (n === 12 ? v.replace('Only ', '').split(', ').sort().join() : v)

let bad = 0
for (const q of data.questions) {
  const answers = [...new Set(ANSWERS[q.bookNo]())]
  const fits = Object.entries(q.options)
    .filter(([, v]) => answers.includes(norm(q.bookNo, v)))
    .map(([k]) => k)
  const why = `answer(s) ${answers.join(' / ')}`
  if ('status' in q) {
    if (fits.length !== 1) console.log(`✓ Q${q.bookNo}: hidden; ${why}; options that fit: ${fits.join(', ') || 'none'}`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but only option ${fits[0]} fits`))
  } else if (answers.length === 1 && fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${answers[0]}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: ${why}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
