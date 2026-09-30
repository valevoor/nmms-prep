import type { VisualProps } from './index'

// A row of 9 with one person 4th from the left and 6th from the right. The taps count from the left,
// then from the right (the person is counted both times), then add and take away 1.
const W = 30
const X0 = 15
const WHO = 3
const SUMS = ['', '1 2 3 4 →', '← 4 3 2 1  6 5 4 3 2 1', '4 + 6 − 1 = 9']

/** Chapter 36 tip: a person counted from both ends is counted twice. */
export function RowCount({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  const lit = (i: number) => (k === 1 && i <= WHO) || (k === 2 && i >= WHO) || k === 3
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={X0 + i * W} y={60} width={W - 4} height={W - 4} rx={4} className={i === WHO ? 'tv-cube-inside' : lit(i) ? 'tv-cube-lit' : 'tv-cube'} />
          {k === 1 && i <= WHO && (
            <text x={X0 + i * W + 13} y={50} textAnchor="middle" className="tv-label">
              {i + 1}
            </text>
          )}
          {k === 2 && i >= WHO && (
            <text x={X0 + i * W + 13} y={112} textAnchor="middle" className="tv-label">
              {9 - i}
            </text>
          )}
        </g>
      ))}
      <text x={150} y={170} textAnchor="middle" className="tv-label">
        {k === 3 ? SUMS[3] : ''}
      </text>
    </svg>
  )
}
