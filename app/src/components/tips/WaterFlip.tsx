import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

// A figure standing on water; the tap shows its water image below the water line: top and bottom
// swap, and every part is turned upside down, while left and right stay.
const FIGURE: Drawing = {
  frame: 'square',
  items: [
    { shape: 'flag', x: 32, y: 32, size: 30, fill: 'solid' },
    { shape: 'arrow', x: 68, y: 66, size: 22 },
  ],
}
const IMAGE: Drawing = {
  frame: 'square',
  items: [
    { shape: 'flag', x: 32, y: 68, size: 30, fill: 'solid', rot: 180, flip: true },
    { shape: 'arrow', x: 68, y: 34, size: 22, rot: 180 },
  ],
}

/** Chapter 9 tip: a figure above water, then (on tap) its water image below the line. */
export function WaterFlip({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 206" role="img" aria-label={label}>
      <g transform="translate(106 2) scale(0.88)">
        <DrawingBody d={FIGURE} />
      </g>
      <g stroke="currentColor" strokeWidth={2.4} strokeLinecap="butt">
        <line x1={80} y1={103} x2={220} y2={103} />
        {[86, 100, 114, 128, 142, 156, 170, 184, 198, 212].map((x) => (
          <line key={x} x1={x} y1={103} x2={x - 6} y2={110} strokeWidth={1.6} />
        ))}
      </g>
      {step > 0 && (
        <g transform="translate(106 116) scale(0.88)" style={{ color: 'var(--good)' }}>
          <DrawingBody d={IMAGE} />
        </g>
      )}
    </svg>
  )
}
