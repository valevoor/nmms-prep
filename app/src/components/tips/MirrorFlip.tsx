import { DrawingBody } from '../Drawing'
import type { Drawing } from '../../types'
import type { VisualProps } from './index'

// A figure with a mirror on its right; the tap shows its mirror image: left and right swap, and
// every part faces the other way, while top and bottom stay.
const FIGURE: Drawing = {
  frame: 'square',
  items: [
    { shape: 'flag', x: 30, y: 58, size: 30, fill: 'solid' },
    { shape: 'arrow', x: 62, y: 26, size: 20, rot: 90 },
  ],
}
const IMAGE: Drawing = {
  frame: 'square',
  items: [
    { shape: 'flag', x: 70, y: 58, size: 30, fill: 'solid', flip: true },
    { shape: 'arrow', x: 38, y: 26, size: 20, rot: 270 },
  ],
}

/** Chapter 8 tip: a figure beside a mirror, then (on tap) its mirror image. */
export function MirrorFlip({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 120" role="img" aria-label={label}>
      <g transform="translate(20 10)">
        <DrawingBody d={FIGURE} />
      </g>
      <g stroke="currentColor" strokeWidth={2.4} strokeLinecap="butt">
        <line x1={150} y1={18} x2={150} y2={102} />
        {[26, 38, 50, 62, 74, 86, 98].map((y) => (
          <line key={y} x1={150} y1={y} x2={157} y2={y - 7} strokeWidth={1.6} />
        ))}
      </g>
      {step > 0 && (
        <g transform="translate(180 10)" style={{ color: 'var(--good)' }}>
          <DrawingBody d={IMAGE} />
        </g>
      )}
    </svg>
  )
}
