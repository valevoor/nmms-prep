import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

type Seg = [number, number, number, number]
// The bent line to find, and a tangle that holds it (the same size and way up) at the top right.
const FIGURE: Seg[] = [[32, 32, 68, 32], [68, 32, 50, 50], [50, 50, 68, 68]]
const HIDDEN: Seg[] = [[50, 14, 86, 14], [86, 14, 68, 32], [68, 32, 86, 50]]
const TANGLE: Drawing = {
  items: [],
  lines: [[14, 14, 86, 14], [86, 14, 14, 86], [14, 14, 14, 86], [14, 86, 86, 86], [50, 14, 50, 86], [68, 32, 86, 50], [86, 50, 86, 86], [14, 50, 50, 50], [32, 68, 68, 68]],
}

/** Chapter 3 tip: a bent line, and a tangle of lines; the tap draws the bent line thick where it hides. */
export function FigureHidden({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <g transform="translate(20 10)">
        <DrawingBody d={{ items: [], lines: FIGURE }} />
      </g>
      <text className="tv-label" x={150} y={62} textAnchor="middle" dominantBaseline="central">
        →
      </text>
      <g transform="translate(180 10)">
        <DrawingBody d={TANGLE} />
        {step > 0 && (
          <g style={{ stroke: 'var(--good)' }} strokeWidth={6} strokeLinecap="round">
            {HIDDEN.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        )}
      </g>
    </svg>
  )
}
