import { describe, expect, it } from 'vitest'
import { generateClock } from './clock'
import { mulberry32 } from './numberSeries'

// Independent solver: works from hand positions in degrees, and minute-by-minute search.
const fmtDeg = (x: number) => `${Math.floor(x)}${x % 1 ? '½' : ''}°`
const hands = (h: number, m: number) => [((h % 12) * 60 + m) * 0.5, (m * 6) % 360] as const
const toMin = (s: string) => {
  const [, h, m, ap] = s.match(/^(\d+):(\d+) (am|pm)$/)!
  return ((Number(h) % 12) + (ap === 'pm' ? 12 : 0)) * 60 + Number(m)
}

function solve(p: string): string {
  let m = p.match(/^What is the (reflex|smaller) angle.* at (\d+):(\d+)\?/)
  if (m) {
    const [a, b] = hands(Number(m[2]), Number(m[3]))
    const small = Math.min(Math.abs(a - b), 360 - Math.abs(a - b))
    return fmtDeg(m[1] === 'reflex' ? 360 - small : small)
  }
  m = p.match(/seems to show (\d+):(\d+)\. What is the real time/)
  if (m) {
    // The real time whose left–right mirror image is the shown time: search every minute of 12 hours.
    const [ih, im] = [Number(m[1]), Number(m[2])]
    const [ia, ib] = hands(ih, im)
    for (let t = 0; t < 720; t++) {
      const [a, b] = hands(Math.floor(t / 60), t % 60)
      if (Math.abs((360 - a) % 360 - ia) < 1e-9 && Math.abs((360 - b) % 360 - ib) < 1e-9) return `${Math.floor(t / 60) || 12}:${String(t % 60).padStart(2, '0')}`
    }
    throw new Error('no mirror time')
  }
  m = p.match(/between (\d+) and \d+ o'clock are the hands of a clock (in a straight line|together)/)
  if (m) {
    const h = Number(m[1])
    const target = m[2] === 'together' ? 0 : 180
    // In elevenths of a minute, find when the hands' separation is the target.
    for (let e = 0; e < 660; e++) {
      const [a, b] = hands(h, e / 11)
      if (Math.abs(((b - a + 360) % 360) - target) < 1e-9) {
        const whole = Math.floor(e / 11)
        return `${h}:${String(whole).padStart(2, '0')}${e % 11 ? ` ${e % 11}/11` : ''}`
      }
    }
    throw new Error('no time')
  }
  m = p.match(/does the hour hand turn from (.+) to (.+)\?/)
  if (m) return fmtDeg(((toMin(m[2]) - toMin(m[1]) + 1440) % 1440) * 0.5)
  m = p.match(/A clock (gains|loses) (\d+) minutes every 24 hours\. It is set right at (.+)\. What time does it show when the real time is (.+)\?/)
  if (m) {
    const passed = (toMin(m[4]) - toMin(m[3]) + 1440) % 1440
    const err = (Number(m[2]) * passed) / 1440
    const t = (toMin(m[4]) + (m[1] === 'gains' ? err : -err) + 1440) % 1440
    return `${Math.floor(t / 60) % 12 || 12}:${String(t % 60).padStart(2, '0')} ${t < 720 ? 'am' : 'pm'}`
  }
  throw new Error(`Unrecognised: ${p}`)
}

describe('generateClock', () => {
  it('exactly one option is right, worked out from the hands', () => {
    const rng = mulberry32(35)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateClock(rng)
      kinds.add(q.pattern)
      const want = solve(q.prompt!)
      const fits = Object.entries(q.options).filter(([, v]) => v === want)
      expect(fits.map(([k]) => k), JSON.stringify(q)).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, JSON.stringify(q)).toBe(4)
    }
    expect(kinds.size).toBe(5)
  })
})
