import type { VisualProps } from './index'

// Book Q1: all pencils are pens, all pens are books. The taps draw pencils inside pens, then pens
// inside books, then mark the two decisions that follow.
const SUMS = ['', '1 ⊂ 2', '1 ⊂ 2 ⊂ 3', 'I ✓  II ✓']

/** Chapter 38 tip: draw "all" as one circle inside another, then read the decisions off the drawing. */
export function Syllogism({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {k >= 2 && <circle cx={150} cy={85} r={75} className={k === 2 ? 'tv-cube-lit' : 'tv-cube'} fillOpacity={0.5} />}
      {k >= 1 && <circle cx={150} cy={95} r={50} className={k === 1 ? 'tv-cube-lit' : 'tv-cube'} fillOpacity={0.5} />}
      <circle cx={150} cy={105} r={24} className="tv-cube-inside" />
      <text x={150} y={110} textAnchor="middle">
        1
      </text>
      {k >= 1 && (
        <text x={150} y={62} textAnchor="middle">
          2
        </text>
      )}
      {k >= 2 && (
        <text x={150} y={28} textAnchor="middle">
          3
        </text>
      )}
      <text x={150} y={188} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
