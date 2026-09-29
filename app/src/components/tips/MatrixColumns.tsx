import type { VisualProps } from './index'

// Book Q3: each column's top number × 2 + middle number = bottom number. Each tap takes the next
// column: the rule found in the first, checked in the second, then used for the ? in the third.
const COLS = [
  [5, 11, 21],
  [8, 17, 33],
  [7, 15, 29],
]
const SUMS = ['', '5 × 2 + 11 = 21', '8 × 2 + 17 = 33 ✓', '7 × 2 + 15 = 29']

/** Chapter 27 tip: find the rule in one complete column, check it in the next, then use it. */
export function MatrixColumns({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {COLS.map((col, c) => (
        <g key={c}>
          <rect x={63 + c * 60} y={8} width={54} height={138} rx={6} className={k === c + 1 ? 'tv-cube-lit' : 'tv-cube'} />
          {col.map((n, r) => (
            <text key={r} x={90 + c * 60} y={40 + r * 42} textAnchor="middle">
              {c === 2 && r === 2 && k < 3 ? '?' : n}
            </text>
          ))}
        </g>
      ))}
      <text x={150} y={180} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
