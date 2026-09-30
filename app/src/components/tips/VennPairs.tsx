import type { VisualProps } from './index'

// Two circles can sit in three ways: one inside the other, overlapping, or apart. Each tap lights one.
const PAIRS: [number, number, number][][] = [
  [[50, 60, 70], [50, 60, 34]],
  [[132, 60, 56], [168, 60, 56]],
  [[222, 60, 40], [272, 60, 40]],
]
const MARK = ['', '⊂', '∩', '∅']

/** Chapter 33 tip: the three ways two groups can sit. */
export function VennPairs({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {PAIRS.map((pair, i) => (
        <g key={i}>
          {pair.map(([x, y, d], j) => (
            <circle key={j} cx={x} cy={y} r={d / 2} className={k === i + 1 ? 'tv-cube-lit' : 'tv-cube'} fillOpacity={k === i + 1 ? 0.6 : 0} />
          ))}
          <text x={[50, 150, 247][i]} y={130} textAnchor="middle" className={k === i + 1 ? 'tv-label' : undefined}>
            {MARK[i + 1]}
          </text>
        </g>
      ))}
    </svg>
  )
}
