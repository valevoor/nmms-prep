import { useT } from '../lib/i18n'

/**
 * Age Problems warm-up: a time line under the question, from left (earlier) to right (later), with
 * the age at each mark ('?' for the one asked) above it and when it is ("3 years ago", "now") below.
 * Drawn like the chapter's "Call the unknown age x" tip (components/tips/AgeLine.tsx).
 */
export function AgeTimeline({ marks }: { marks: [number, string][] }) {
  const t = useT()
  const sorted = [...marks].sort((a, b) => a[0] - b[0])
  const when = (y: number) => (y === 0 ? t.practice.timeNow : y < 0 ? t.practice.yearsAgo(-y) : t.practice.inYears(y))
  // Two marks sit at 90 and 210; more are spread evenly between 60 and 240.
  const x = (i: number) => (sorted.length === 2 ? 90 + 120 * i : 60 + (180 * i) / Math.max(1, sorted.length - 1))
  const label = t.practice.timeLine(sorted.map(([y, age]) => `${when(y)} ${age}`).join(', '))
  return (
    <svg className="tv" viewBox="0 0 300 110" role="img" aria-label={label}>
      <line x1={20} y1={55} x2={290} y2={55} className="tv-mid" />
      {sorted.map(([y, age], i) => (
        <g key={y}>
          <circle cx={x(i)} cy={55} r={7} className={y === 0 ? 'tv-cube-inside' : 'tv-cube-lit'} />
          <text x={x(i)} y={34} textAnchor="middle" className="tv-label">
            {age}
          </text>
          <text x={x(i)} y={88} textAnchor="middle">
            {when(y)}
          </text>
        </g>
      ))}
    </svg>
  )
}
