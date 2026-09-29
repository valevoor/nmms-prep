import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

const FIGURE: Drawing = {
  frame: 'square',
  items: [
    { shape: 'arrow', x: 50, y: 32, size: 26, rot: 0 },
    { shape: 'dot', x: 28, y: 28, size: 10 },
    { shape: 'poly', n: 3, x: 66, y: 70, size: 20, rot: 0 },
  ],
}

/** Chapter 1 tip: each tap turns the figure a quarter turn clockwise; the black dot shows where the top-left corner went. */
export function FigureTurn({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <text className="tv-label" x={60} y={62} textAnchor="middle" dominantBaseline="central">
        {step * 90}°
      </text>
      <g className="tv-move" style={{ transform: `rotate(${step * 90}deg)`, transformOrigin: '150px 60px' }}>
        <g transform="translate(100 10)">
          <DrawingBody d={FIGURE} />
        </g>
      </g>
      <path className="tv-hop" d="M222 30 A42 42 0 0 1 238 78" fill="none" />
      <path className="tv-arrowhead" d="M232 74 L238 80 L243 72" fill="none" />
    </svg>
  )
}
