import type { VisualProps } from './index'

// Book Q4: three figures, two numbers joined to one below. Each tap takes the next figure: the rule
// found in the first, checked in the second, then used for the missing number in the third.
const FIGS = [
  [13, 15, 84],
  [36, 54, 270],
  [45, 63, 324],
]
const SUMS = ['', '(13 + 15) × 3 = 84', '(36 + 54) × 3 = 270 ✓', '(45 + 63) × 3 = 324']

function Vee({ x, nums, lit, show }: { x: number; nums: number[]; lit: boolean; show: boolean }) {
  const cls = lit ? 'tv-cube-lit' : 'tv-cube'
  return (
    <g>
      <line x1={x + 27} y1={57} x2={x + 43} y2={93} className="tv-cube" />
      <line x1={x + 73} y1={57} x2={x + 57} y2={93} className="tv-cube" />
      <circle cx={x + 20} cy={42} r={17} className={cls} />
      <circle cx={x + 80} cy={42} r={17} className={cls} />
      <circle cx={x + 50} cy={112} r={21} className={cls} />
      <text x={x + 20} y={48} textAnchor="middle">
        {nums[0]}
      </text>
      <text x={x + 80} y={48} textAnchor="middle">
        {nums[1]}
      </text>
      <text x={x + 50} y={118} textAnchor="middle">
        {show ? nums[2] : '?'}
      </text>
    </g>
  )
}

/** Chapter 24 tip: find the rule in a complete figure, check it in the next, then use it. */
export function FigNumbers({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  return (
    <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
      {FIGS.map((f, i) => (
        <Vee key={i} x={i * 100} nums={f} lit={k === i + 1} show={i < 2 || k === 3} />
      ))}
      <text x={150} y={180} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
