import type { ReactNode } from 'react'

export type Tone = 'blank' | 'good' | 'bad' | 'primary' | 'accent'

/** A number in a rounded box, centred on (cx, cy). */
export function Box({ cx, cy, w = 40, h = 34, label, tone }: { cx: number; cy: number; w?: number; h?: number; label: ReactNode; tone?: Tone }) {
  return (
    <g className={`tv-box${tone ? ` tv-${tone}` : ''}`}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={8} />
      <text x={cx} y={cy} dominantBaseline="central" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

/** Wraps parts of a drawing that appear at a later step. */
export function Reveal({ on, children }: { on: boolean; children: ReactNode }) {
  return <g className={`tv-fade${on ? ' on' : ''}`}>{children}</g>
}

/** Small arrowhead at (x, y) pointing along (dx, dy). */
export function ArrowHead({ x, y, dx, dy, size = 7 }: { x: number; y: number; dx: number; dy: number; size?: number }) {
  const len = Math.hypot(dx, dy)
  const [ux, uy] = [dx / len, dy / len]
  const [bx, by] = [x - ux * size, y - uy * size]
  const [px, py] = [-uy * size * 0.6, ux * size * 0.6]
  return <path className="tv-arrowhead" d={`M${bx + px} ${by + py}L${x} ${y}L${bx - px} ${by - py}`} />
}

/** A short left-to-right arrow with a label above it, used under gaps. */
export function GapArrow({ x, y, label, tone }: { x: number; y: number; label: string; tone?: 'good' | 'bad' | 'accent' }) {
  return (
    <g className={`tv-gap${tone ? ` tv-gap-${tone}` : ''}`}>
      <text x={x} y={y} textAnchor="middle" className="tv-label">
        {label}
      </text>
      <path className="tv-line" d={`M${x - 12} ${y + 9}H${x + 12}`} />
      <ArrowHead x={x + 12} y={y + 9} dx={1} dy={0} size={5} />
    </g>
  )
}
