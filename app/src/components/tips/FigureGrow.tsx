import { DrawingBody } from '../Drawing'
import type { VisualProps } from './index'

/** Chapter 2 tip: triangle, square, pentagon and a blank; the tap fills the blank with a hexagon. */
export function FigureGrow({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 90" role="img" aria-label={label}>
      {[3, 4, 5, 6].map((n, i) => (
        <g key={n} transform={`translate(${8 + i * 73} 12) scale(0.66)`}>
          {i < 3 || step > 0 ? (
            <g className={i === 3 ? 'tv-good-mark' : undefined}>
              <DrawingBody d={{ items: [{ shape: 'poly', n, x: 50, y: 54, size: 84, rot: n === 4 ? 45 : 0 }] }} />
            </g>
          ) : (
            <text x={50} y={60} textAnchor="middle" dominantBaseline="central" className="tv-label" style={{ fontSize: 40 }}>
              ?
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
