import type { VisualProps } from './index'

// Book Q1 on a time line: five years ago, now and 15 years from now. The taps name the present age
// x, write the other two ages from it, then solve x + 15 = 5(x − 5).
const MARKS: [number, string, string][] = [
  [60, '−5', 'x − 5'],
  [120, '0', 'x'],
  [270, '+15', 'x + 15'],
]
const SUMS = ['', '', 'x + 15 = 5(x − 5)', '4x = 40 → x = 10']

/** Chapter 37 tip: every age on the time line is written from the one unknown, x. */
export function AgeLine({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      <line x1={30} y1={90} x2={290} y2={90} className="tv-mid" />
      {MARKS.map(([x, year, age], i) => (
        <g key={i}>
          <circle cx={x} cy={90} r={7} className={i === 1 ? 'tv-cube-inside' : k >= 2 ? 'tv-cube-lit' : 'tv-cube'} />
          <text x={x} y={125} textAnchor="middle">
            {year}
          </text>
          {(i === 1 ? k >= 1 : k >= 2) && (
            <text x={x} y={68} textAnchor="middle" className="tv-label">
              {age}
            </text>
          )}
        </g>
      ))}
      <text x={150} y={170} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
