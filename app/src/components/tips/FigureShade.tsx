import { DrawingBody } from '../Drawing'
import type { VisualProps } from './index'

/** Chapter 1 tip: two shaded parts of a circle cut into 8, moving 2 parts clockwise with each tap. */
export function FigureShade({ step, label }: VisualProps) {
  const shaded = [7, 2].map((i) => (i + 2 * step) % 8)
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <g transform="translate(100 10)">
        <DrawingBody d={{ frame: 'oct', shaded, items: [] }} />
      </g>
      <text className="tv-label" x={250} y={62} textAnchor="middle" dominantBaseline="central">
        +{2 * step}
      </text>
    </svg>
  )
}
