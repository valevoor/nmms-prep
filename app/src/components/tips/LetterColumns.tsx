import type { VisualProps } from './index'

// Book Q4: in each column, top letter + middle letter = bottom letter, using the letters' places.
// Each tap takes one column: the rule found in the first, checked in the third, then used for the ?.
const COLS = [
  ['F', 'E', 'K'],
  ['I', 'H', 'Q'],
  ['N', 'D', 'R'],
]
const LIT = [-1, 0, 2, 1]
const SUMS = ['', 'F + E = 6 + 5 = 11 = K', 'N + D = 14 + 4 = 18 = R ✓', 'I + ? = Q → 9 + ? = 17 → ? = 8 = H']
const place = (c: string) => c.charCodeAt(0) - 64

/** Chapter 28 tip: turn letters into places, find the rule in one column, check it, then use it. */
export function LetterColumns({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {COLS.map((col, c) => (
        <g key={c}>
          <rect x={63 + c * 60} y={8} width={54} height={138} rx={6} className={LIT[k] === c ? 'tv-cube-lit' : 'tv-cube'} />
          {col.map((ch, r) => {
            const hidden = c === 1 && r === 1 && k < 3
            return (
              <g key={r}>
                <text x={90 + c * 60} y={36 + r * 42} textAnchor="middle">
                  {hidden ? '?' : ch}
                </text>
                {k > 0 && !hidden && (
                  <text x={90 + c * 60} y={52 + r * 42} textAnchor="middle" className="tv-label">
                    {place(ch)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      ))}
      <text x={150} y={180} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
