/**
 * Checks the Figures and Number Relationship book questions (Chapter 24). Every figure's numbers are
 * typed in below, read by eye from the rendered pages 72–74, with the blank as null. Each question's
 * rule is written as a test on one figure (or one part of it); it must hold for every complete
 * figure, and trying each option in the blank, exactly one option (the marked answer) must make it
 * hold there too. The answers are also compared with the book's key (pages 155–157).
 * Run from app/:  npx tsx ../tools/check_figure_numbers.ts
 */
import { existsSync } from 'node:fs'
import data from '../app/src/data/mat/figure-numbers.json' with { type: 'json' }

type N = number | null
const sq = (v: number) => v * v
const cube = (v: number) => v * v * v

interface Check {
  /** The groups of numbers the rule works on (each figure, row, side…), the blank as null. */
  groups: N[][]
  /** Whether the rule holds for one group (with every number filled in). */
  holds: (g: number[]) => boolean
}

// Key, PDF pages 155–157.
const KEY: Record<number, string> = { 1: 'D', 2: 'C', 3: 'A', 4: 'D', 5: 'C', 6: 'C', 7: 'C', 8: 'B', 9: 'B', 10: 'B', 11: 'C', 12: 'A', 13: 'B', 14: 'C', 15: 'B' }

const CHECKS: Record<number, Check> = {
  // 3 × 3 circles: 85 110 90 / 115 80 120 / ? 125 75, read as a snake from 90 (top right).
  1: {
    groups: [[90, 110, 85, 115, 80, 120, 75, 125, null]],
    holds: (g) => g.slice(1).every((v, i) => v - g[i] === (i % 2 === 0 ? 1 : -1) * (20 + 5 * i)),
  },
  // Boxes a b c d: 2a + 2b − c³ = d.
  2: {
    groups: [[8, 6, 2, null], [4, 6, 1, 19], [9, 7, 3, 5]],
    holds: ([a, b, c, d]) => 2 * a + 2 * b - cube(c) === d,
  },
  // Each side of the box, its two numbers clockwise (a, b) and the inner triangle t: (2a + b²) / 2 = t.
  3: {
    groups: [[3, 4, 11], [8, 4, 16], [13, 4, 21], [8, 6, null]],
    holds: ([a, b, t]) => 2 * a + sq(b) === 2 * t,
  },
  // Top pair and bottom: (a + b) × 3 = c.
  4: {
    groups: [[13, 15, 84], [36, 54, 270], [45, 63, null]],
    holds: ([a, b, c]) => (a + b) * 3 === c,
  },
  // L of three cells: top, bottom left, corner: top + bottom left = 5 × corner.
  5: {
    groups: [[27, 68, 19], [43, 62, null], [51, 84, 27]],
    holds: ([t, l, c]) => t + l === 5 * c,
  },
  // Triangles: outer corners, inner corners (same order), middle.
  6: {
    groups: [[12, 13, 14, 16, 17, 18, 12], [18, 19, 20, 23, 24, 25, null]],
    holds: ([o1, o2, o3, i1, i2, i3, m]) => i1 - o1 + (i2 - o2) + (i3 - o3) === m,
  },
  // Rows a b c: (c + b) / b = a.
  7: {
    groups: [[8, 3, 21], [6, 5, 25], [12, 2, null]],
    holds: ([a, b, c]) => c + b === a * b,
  },
  // Ovals: top, left, right, bottom, inside: right / left = inside.
  8: {
    groups: [[4, 2, 8, 5, 4], [6, 1, 9, 3, 9], [7, 3, 6, 4, null]],
    holds: ([, l, r, , m]) => r === l * m,
  },
  // Three boxes and the arrow: ab + bc + ca = arrow.
  9: {
    groups: [[10, 5, 3, 95], [3, 4, 5, 47], [4, 8, null, 68]],
    holds: ([a, b, c, d]) => a * b + b * c + c * a === d,
  },
  // L of three cells: top, bottom left, corner: (bottom left / top)² = corner.
  10: {
    groups: [[6, 30, 25], [3, null, 36], [7, 56, 64]],
    holds: ([t, l, c]) => l % t === 0 && sq(l / t) === c,
  },
  // Opposite triangles through the centre: small number n, opposite o: n³ − 3 = o.
  11: {
    groups: [[1, -2], [2, 5], [3, 24], [4, null]],
    holds: ([n, o]) => cube(n) - 3 === o,
  },
  // Circle, anticlockwise from the blank: ? 20 36 68 132 260; each is double the one before, minus 4.
  12: {
    groups: [[null, 20, 36, 68, 132, 260]],
    holds: (g) => g.slice(1).every((v, i) => v === 2 * g[i] - 4),
  },
  // Three boxes and the triangle: a / b + c / b = t.
  13: {
    groups: [[20, 4, 32, 13], [42, 6, 54, 16], [15, 3, 51, null]],
    holds: ([a, b, c, t]) => a % b === 0 && c % b === 0 && a / b + c / b === t,
  },
  // Star, middle 81; opposite points: small s and big: √81 + s² = big.
  14: {
    groups: [[81, 4, 25], [81, 6, 45], [81, 8, null]],
    holds: ([m, s, big]) => sq(Math.round(Math.sqrt(m))) === m && Math.sqrt(m) + sq(s) === big,
  },
  // Quarters: two small numbers and the big one: (a + b)² + (a − b)² = big.
  15: {
    groups: [[3, 7, null], [4, 9, 194], [8, 6, 200], [8, 11, 370]],
    holds: ([a, b, big]) => sq(a + b) + sq(a - b) === big,
  },
}

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
let bad = 0
const fail = (no: number, msg: string) => (bad++, console.log(`✗ Q${no}: ${msg}`))
for (const q of data.questions) {
  const no = q.bookNo
  const c = CHECKS[no]
  const pics = q.figures.terms
  if (pics.length !== 1 || pics[0] !== `figures/ch24/q${String(no).padStart(2, '0')}.png`) fail(no, `wrong picture ${pics[0] ?? 'none'}`)
  for (const f of pics) if (!existsSync(PUBLIC + f)) fail(no, `missing picture ${f}`)
  if (q.keyFrom === 'book' && KEY[no] !== q.answer) fail(no, `marked ${q.answer}, the book's key says ${KEY[no]}`)
  if (q.keyFrom === 'solved' && KEY[no] === q.answer) fail(no, 'marked "solved" but agrees with the key')
  if ('status' in q) fail(no, 'hidden, but every question here checks out')
  if (new Set(Object.values(q.options)).size < 4) fail(no, 'two options are printed the same')
  const blanks = c.groups.flat().filter((v) => v === null).length
  if (blanks !== 1) fail(no, `${blanks} blanks typed in`)
  const full = c.groups.filter((g) => !g.includes(null)) as number[][]
  for (const g of full) if (!c.holds(g)) fail(no, `the rule doesn't hold for ${g.join(', ')}`)
  const blank = c.groups.find((g) => g.includes(null))!
  const fits = Object.entries(q.options)
    .filter(([, v]) => c.holds(blank.map((n) => (n === null ? Number(v) : n))))
    .map(([k]) => k)
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${no}: ${q.options[q.answer as 'A']}  →  ${q.answer}`)
  else fail(no, `options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
}
for (const n of Object.keys(KEY).map(Number)) if (!data.questions.some((q) => q.bookNo === n)) fail(n, 'missing')

if (bad) {
  console.log(`\n${bad} problem(s).`)
  process.exit(1)
}
console.log('\nAll Figures and Number Relationship answers check out.')
