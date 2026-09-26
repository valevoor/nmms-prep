import { describe, expect, it } from 'vitest'
import { generateCalendar } from './calendar'
import { mulberry32 } from './numberSeries'

// Independent solver: uses the JavaScript Date calendar, not the generator's arithmetic.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const parse = (s: string) => {
  const [d, mon, y] = s.split(' ')
  return Date.UTC(Number(y), MONTHS.indexOf(mon), Number(d))
}
const DAY_MS = 86400000

function solve(p: string): string {
  let m = p.match(/^Today is (\w+)\. What day of the week will it be (\d+) days from today\?/)
  if (m) return DAYS[(DAYS.indexOf(m[1]) + Number(m[2])) % 7]
  m = p.match(/^Today is (\w+)\. What day of the week was it (\d+) days ago\?/)
  if (m) return DAYS[(((DAYS.indexOf(m[1]) - Number(m[2])) % 7) + 7) % 7]
  m = p.match(/^If day (\d+) of a month is a (\w+), what day of the week is day (\d+)/)
  if (m) return DAYS[(DAYS.indexOf(m[2]) + Number(m[3]) - Number(m[1])) % 7]
  m = p.match(/^(\d+ \w+ \d+) was a (\w+)\. What day of the week was (\d+ \w+ \d+)\?/)
  if (m) {
    // The stated weekday must be the real one, and the answer comes from the real calendar.
    expect(DAYS[new Date(parse(m[1])).getUTCDay()]).toBe(m[2])
    return DAYS[new Date(parse(m[3])).getUTCDay()]
  }
  m = p.match(/^How many days are there from (\d+ \w+ \d+) to (\d+ \w+ \d+), counting both days\?/)
  if (m) return String((parse(m[2]) - parse(m[1])) / DAY_MS + 1)
  m = p.match(/^How many days are there in (\d+) weeks and (\d+) days\?/)
  if (m) return String(7 * Number(m[1]) + Number(m[2]))
  throw new Error(`Unrecognised: ${p}`)
}

describe('generateCalendar', () => {
  it('exactly one option is right, checked against the real calendar', () => {
    const rng = mulberry32(34)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateCalendar(rng)
      kinds.add(q.pattern)
      const want = solve(q.prompt!)
      const fits = Object.entries(q.options).filter(([, v]) => v === want)
      expect(fits.map(([k]) => k), JSON.stringify(q)).toEqual([q.answer])
    }
    expect(kinds.size).toBe(5)
  })
})
