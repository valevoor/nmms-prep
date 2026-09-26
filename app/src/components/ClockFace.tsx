import type { Question } from '../types'

const R = 56
const C = 70

/** Point at `deg` degrees clockwise from 12 o'clock, `r` from the centre. */
const at = (deg: number, r: number) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)] as const

/** Draws the clock in a Clock explanation (q.clock = [hours, minutes]), with the smaller angle between the hands shaded. */
export function ClockFace({ q }: { q: Question }) {
  if (!q.clock) return null
  const [h, m] = q.clock
  const hourDeg = ((h % 12) * 30 + m / 2) % 360
  const minDeg = (m * 6) % 360
  // Shade the smaller angle, going clockwise from whichever hand is behind.
  const [from, to] = (((minDeg - hourDeg + 360) % 360) <= 180 ? [hourDeg, minDeg] : [minDeg, hourDeg]) as [number, number]
  const sweep = (to - from + 360) % 360
  const [ax, ay] = at(from, 24)
  const [bx, by] = at(to, 24)
  const [hx, hy] = at(hourDeg, R * 0.5)
  const [mx, my] = at(minDeg, R * 0.82)
  const mm = String(Math.floor(m)).padStart(2, '0')
  return (
    <svg className="clockface" viewBox={`0 0 ${2 * C} ${2 * C}`} role="img" aria-label={`${h}:${mm}`}>
      <circle className="clock-rim" cx={C} cy={C} r={R + 6} />
      {sweep > 0 && sweep < 360 && <path className="clock-angle" d={`M${C} ${C}L${ax} ${ay}A24 24 0 0 1 ${bx} ${by}Z`} />}
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = at(i * 30, R)
        const [x2, y2] = at(i * 30, R - (i % 3 === 0 ? 8 : 4))
        return <path key={i} className="clock-tick" d={`M${x1} ${y1}L${x2} ${y2}`} />
      })}
      {[12, 3, 6, 9].map((n) => {
        const [x, y] = at(n * 30, R - 17)
        return (
          <text key={n} className="clock-num" x={x} y={y} textAnchor="middle" dominantBaseline="central">
            {n}
          </text>
        )
      })}
      <path className="clock-hour" d={`M${C} ${C}L${hx} ${hy}`} />
      <path className="clock-minute" d={`M${C} ${C}L${mx} ${my}`} />
      <circle className="clock-pin" cx={C} cy={C} r={3.5} />
    </svg>
  )
}
