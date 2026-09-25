import type { VisualProps } from './index'
import { ZIGZAG } from './examples'
import { Box, GapArrow, Reveal } from './shapes'

const X = (i: number) => 30 + i * 48
const Y = (v: number) => 108 - v * 2.8

/**
 * Tip 4: a zig-zag line chart. Step 1 colours odd and even places; step 2 joins each colour with
 * its own straight line and writes the two series out underneath.
 */
export function ZigZagSplit({ step, label }: VisualProps) {
  const v = ZIGZAG.values
  const pts = v.map((x, i) => [X(i), Y(x)] as const)
  const line = (sel: number) =>
    pts
      .filter((_, i) => i % 2 === sel)
      .map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y}`)
      .join('')
  const odd = v.filter((_, i) => i % 2 === 0)
  const even = v.filter((_, i) => i % 2 === 1)
  const tone = (i: number) => (step < 1 ? '' : i % 2 === 0 ? ' tv-pt-primary' : ' tv-pt-accent')
  return (
    <svg className="tv" viewBox="0 0 300 206" role="img" aria-label={label}>
      <path className="tv-zig" d={pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')} />
      <Reveal on={step >= 2}>
        <path className="tv-join tv-join-primary" d={line(0)} />
        <path className="tv-join tv-join-accent" d={line(1)} />
      </Reveal>
      {pts.map(([x, y], i) => (
        <g key={i} className={`tv-pt${tone(i)}`}>
          <circle cx={x} cy={y} r={6} />
          <text x={x} y={y - 13} textAnchor="middle">
            {v[i]}
          </text>
        </g>
      ))}

      <Reveal on={step >= 2}>
        {[
          { vals: odd, op: ZIGZAG.oddOp, tone: 'primary' as const, y: 140 },
          { vals: even, op: ZIGZAG.evenOp, tone: 'accent' as const, y: 184 },
        ].map((row) => (
          <g key={row.tone}>
            {row.vals.map((x, k) => (
              <Box key={x} cx={60 + k * 90} cy={row.y} label={x} tone={row.tone} />
            ))}
            {row.vals.slice(1).map((_, k) => (
              <GapArrow key={k} x={105 + k * 90} y={row.y - 6} label={row.op} />
            ))}
          </g>
        ))}
      </Reveal>
    </svg>
  )
}
