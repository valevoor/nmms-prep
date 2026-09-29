import type { VisualProps } from './index'

// A triangle cut into 4 thin parts by lines from its top. Each tap shows, as small copies, every
// triangle made of 1, then 2, then 3, then all 4 parts next to each other: 4 + 3 + 2 + 1 = 10.
const PARTS = 4
const SUMS = ['', '4', '4 + 3', '4 + 3 + 2', '4 + 3 + 2 + 1 = 10']

/** One fan: its parts, with parts i to j − 1 lit. */
function Fan({ x, y, w, h, lit }: { x: number; y: number; w: number; h: number; lit?: [number, number] }) {
  const top = `${x + w / 2},${y}`
  const at = (m: number) => `${x + (w * m) / PARTS},${y + h}`
  return (
    <g strokeLinejoin="round">
      {Array.from({ length: PARTS }, (_, m) => (
        <polygon key={m} points={`${top} ${at(m)} ${at(m + 1)}`} className="tv-cube" />
      ))}
      {lit && <polygon points={`${top} ${at(lit[0])} ${at(lit[1])}`} className="tv-cube-lit" />}
    </g>
  )
}

/** Chapter 12 tip: counting the triangles in a triangle cut by lines from its top. */
export function CountFan({ step, label }: VisualProps) {
  if (step === 0)
    return (
      <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
        <Fan x={60} y={14} w={180} h={150} />
        {Array.from({ length: PARTS }, (_, m) => (
          <text key={m} x={150 + (60 + 45 * m + 22.5 - 150) * 0.85} y={152} textAnchor="middle">
            {m + 1}
          </text>
        ))}
      </svg>
    )
  const k = Math.min(step, PARTS)
  const n = PARTS - k + 1
  const w = 60
  const gap = 12
  const x0 = (300 - (n * w + (n - 1) * gap)) / 2
  return (
    <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
      {Array.from({ length: n }, (_, i) => (
        <Fan key={i} x={x0 + i * (w + gap)} y={40} w={w} h={90} lit={[i, i + k]} />
      ))}
      <text x={150} y={175} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
