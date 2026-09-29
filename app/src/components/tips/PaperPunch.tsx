import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

// A sheet folded right onto left with one hole punched; opened out, the hole shows on both halves.
const FOLDED: Drawing = {
  lines: [
    [8, 8, 50, 8],
    [50, 8, 50, 92],
    [50, 92, 8, 92],
    [8, 92, 8, 8],
  ],
  dashed: [
    [50, 8, 92, 8],
    [92, 8, 92, 92],
    [92, 92, 50, 92],
  ],
  items: [
    { shape: 'dot', x: 34, y: 36, size: 9 },
    { shape: 'arrow', x: 71, y: 66, size: 18, rot: 270 },
  ],
}
const OPEN: Drawing = { frame: 'square', dashed: [[50, 8, 50, 92]], items: [{ shape: 'circle', x: 34, y: 36, size: 9 }] }
const COPY: Drawing = { items: [{ shape: 'circle', x: 66, y: 36, size: 9 }] }

/** Chapter 7 tip: the folded sheet with a hole, then (on tap) the sheet opened out with two. */
export function PaperPunch({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <g transform="translate(20 10)">
        <DrawingBody d={FOLDED} />
      </g>
      <text className="tv-label" x={150} y={62} textAnchor="middle" dominantBaseline="central">
        →
      </text>
      {step > 0 && (
        <g transform="translate(180 10)">
          <DrawingBody d={OPEN} />
          <g style={{ color: 'var(--good)' }}>
            <DrawingBody d={COPY} />
          </g>
        </g>
      )}
    </svg>
  )
}
