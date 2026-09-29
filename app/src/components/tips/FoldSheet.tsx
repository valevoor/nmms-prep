import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

// A sheet folded along its middle: the flag on the right half lands on the left half, mirrored.
const SHEET: Drawing = {
  frame: 'square',
  dashed: [[50, 8, 50, 92]],
  items: [
    { shape: 'poly', n: 3, x: 26, y: 30, size: 16, fill: 'solid' },
    { shape: 'flag', x: 72, y: 62, size: 24 },
  ],
}
const LEFT: Drawing = { frame: 'square', dashed: [[50, 8, 50, 92]], items: [SHEET.items[0]] }
const LANDED: Drawing = { items: [{ shape: 'flag', x: 28, y: 62, size: 24, flip: true }] }

/** Chapter 6 tip: the sheet, then (on tap) its left half after the right half is folded over. */
export function FoldSheet({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <g transform="translate(20 10)">
        <DrawingBody d={SHEET} />
      </g>
      <text className="tv-label" x={150} y={62} textAnchor="middle" dominantBaseline="central">
        →
      </text>
      {step > 0 && (
        <g transform="translate(180 10)">
          <DrawingBody d={LEFT} />
          <g style={{ color: 'var(--good)' }}>
            <DrawingBody d={LANDED} />
          </g>
        </g>
      )}
    </svg>
  )
}
