/**
 * Checks every Calendar book question against the real (JavaScript Date) calendar.
 * Exactly one option must be right, and it must be the marked one.
 * Run from app/:  npx tsx ../tools/check_calendar.ts
 */
import data from '../app/src/data/mat/calendar.json' with { type: 'json' }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const day = (y: number, m: number, d: number) => {
  const t = new Date(0)
  t.setUTCFullYear(y, m - 1, d)
  return t.getUTCDay()
}
const between = (a: [number, number, number], b: [number, number, number]) => {
  const t = (x: [number, number, number]) => {
    const d = new Date(0)
    d.setUTCFullYear(x[0], x[1] - 1, x[2])
    return d.getTime()
  }
  return (t(b) - t(a)) / 86400000
}
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const sameCalendar = (a: number, b: number) => day(a, 1, 1) === day(b, 1, 1) && isLeap(a) === isLeap(b)

const RULES: Record<string, () => string> = {
  'ca-b01': () => DAYS[day(2001, 6, 1)],
  'ca-b02': () => String(6 * 7 + 8),
  'ca-b03': () => String([1, 2, 3, 4, 5, 6, 7].find((d) => day(1601, 1, d) === 6)),
  'ca-b04': () => DAYS[(5 + 14 - 6) % 7],
  'ca-b05': () => DAYS[78 % 7],
  'ca-b06': () => (DAYS[day(2022, 3, 14)] === 'Monday' ? DAYS[day(2023, 3, 14)] : 'the book is wrong about 2022'),
  'ca-b07': () => {
    if (day(1991, 12, 1) !== 0) return '1.12.1991 was not a Sunday'
    const weds = Array.from({ length: 31 }, (_, i) => i + 1).filter((d) => day(1991, 12, d) === 3)
    return `${weds[3]}.12.1991`
  },
  'ca-b08': () => String(Array.from({ length: 30 }, (_, i) => 1992 + i).find((y) => sameCalendar(1991, y))),
  'ca-b09': () => DAYS[(6 + 2 + 2) % 7],
  'ca-b10': () => {
    // Day 1 is a Saturday (weekday 6).
    const wd = (d: number) => (6 + d - 1) % 7
    const sats = Array.from({ length: 30 }, (_, i) => i + 1).filter((d) => wd(d) === 6)
    const holidays = Array.from({ length: 30 }, (_, i) => i + 1).filter((d) => wd(d) === 0 || d === sats[1] || d === sats[3])
    return String(30 - holidays.length)
  },
  // The weekday of 31 December of years 100, 200, … 2000 (the proleptic Gregorian calendar).
  'ca-b11': () => [...new Set(Array.from({ length: 20 }, (_, i) => DAYS[day(100 * (i + 1), 12, 31)]))].sort().join('|'),
  'ca-b12': () => String(Array.from({ length: 100 }, (_, i) => 1801 + i).filter(isLeap).length),
  'ca-b13': () => String(between([1996, 1, 26], [1996, 5, 15]) + 1),
  'ca-b14': () => DAYS[(0 + 10) % 7],
  'ca-b15': () => (DAYS[day(2000, 1, 26)] === 'Wednesday' ? DAYS[day(2000, 3, 5)] : 'the book is wrong about 2000'),
}

let bad = 0
for (const q of data.questions) {
  const want = RULES[q.id]()
  const fits = Object.entries(q.options).filter(([, v]) => want.split('|').includes(v)).map(([k]) => k)
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${q.options[q.answer as keyof typeof q.options]}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: real calendar says "${want}"; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
