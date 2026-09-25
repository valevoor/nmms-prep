import { describe, expect, it } from 'vitest'
import { generateDirections } from './directions'
import { mulberry32 } from './numberSeries'

// Independent solver: reads the English question and works it out from scratch.
const ANGLE: Record<string, number> = { north: 0, 'north-east': 45, east: 90, 'south-east': 135, south: 180, 'south-west': 225, west: 270, 'north-west': 315 }
const NAME = Object.fromEntries(Object.entries(ANGLE).map(([k, v]) => [v, k]))
const unit = (deg: number): [number, number] => [Math.round(Math.sin((deg * Math.PI) / 180)), Math.round(Math.cos((deg * Math.PI) / 180))]
const directionOf = (dx: number, dy: number) => {
  const deg = ((Math.round((Math.atan2(dx, dy) * 180) / Math.PI) % 360) + 360) % 360
  return deg % 45 === 0 ? NAME[deg] : undefined
}

function solve(prompt: string): string {
  let m = prompt.match(/^\w+ walks (\d+) m (\w+)((?:, then turns (?:left|right) and walks \d+ m)*)\. (In which direction|How far)/)
  if (m) {
    let heading = ANGLE[m[2]]
    let [x, y] = unit(heading).map((v) => v * Number(m![1]))
    for (const [, lr, n] of m[3].matchAll(/turns (left|right) and walks (\d+) m/g)) {
      heading = (heading + (lr === 'right' ? 90 : 270)) % 360
      const [ux, uy] = unit(heading)
      x += ux * Number(n)
      y += uy * Number(n)
    }
    return m[4] === 'How far' ? `${Math.hypot(x, y)} m` : directionOf(x, y)!
  }
  m = prompt.match(/is facing (\w+), then (.+)\. Which direction/)
  if (m) {
    let h = ANGLE[m[1]]
    for (const t of m[2].split(', then ')) h = (h + (t === 'turns right' ? 90 : t === 'turns left' ? 270 : 180)) % 360
    return NAME[h]
  }
  m = prompt.match(/^If ([\w-]+) becomes ([\w-]+), ([\w-]+) becomes ([\w-]+), and so on, what does ([\w-]+) become\?/)
  if (m) {
    const a = (s: string) => ANGLE[s.toLowerCase()]
    const k = (a(m[2]) - a(m[1]) + 360) % 360
    expect((a(m[4]) - a(m[3]) + 360) % 360).toBe(k)
    return NAME[(a(m[5]) + k) % 360]
  }
  m = prompt.match(/^Town (\w) is (\d+) km (\w+) of town (\w)\. Town (\w) is (\d+) km (\w+) of town (\w)\. In which direction is town (\w) from town (\w)\?/)
  if (m) {
    const pos: Record<string, [number, number]> = { [m[4]]: [0, 0] }
    const place = (who: string, n: string, dir: string, of: string) => {
      const [ux, uy] = unit(ANGLE[dir])
      pos[who] = [pos[of][0] + ux * Number(n), pos[of][1] + uy * Number(n)]
    }
    place(m[1], m[2], m[3], m[4])
    place(m[5], m[6], m[7], m[8])
    return directionOf(pos[m[9]][0] - pos[m[10]][0], pos[m[9]][1] - pos[m[10]][1])!
  }
  throw new Error(`Unrecognised question: ${prompt}`)
}

describe('generateDirections', () => {
  it('exactly one option is right, worked out independently', () => {
    const rng = mulberry32(31)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateDirections(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify(q)
      const want = solve(q.prompt!)
      const fits = Object.entries(q.options).filter(([, v]) => v.toLowerCase() === want)
      expect(fits.map(([k]) => k), ctx).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      expect(Object.values(q.kn!.options!).every((o) => /[ಀ-೿]|^\d+ m$/.test(o)), ctx).toBe(true)
    }
    expect(kinds.size).toBe(5)
  })
})
