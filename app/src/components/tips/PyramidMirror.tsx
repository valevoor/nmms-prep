import type { VisualProps } from './index'

// The book's example: rkt : xov :: slu : ?. The taps light r k t, then its mirror image x o v, then
// s l u and its mirror image w n u.
const ROWS = ['a', 'bcd', 'efghi', 'jklmnop', 'qrstuvwxy']
const W = 30
const STEPS: [string, string][] = [
  ['', ''],
  ['rkt', ''],
  ['rkt', 'xov'],
  ['slu', 'wnu'],
]
const SUMS = ['', 'r k t', 'r k t ↔ x o v', 's l u ↔ w n u']

/** Chapter 30 tip: find the first group, see that the second is its mirror image, then do the same. */
export function PyramidMirror({ step, label }: VisualProps) {
  const [from, to] = STEPS[Math.min(step, 3)]
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {ROWS.map((row, r) =>
        row.split('').map((ch, i) => {
          const x = 150 + (i - (row.length - 1) / 2) * W - W / 2
          const cls = to.includes(ch) ? 'tv-cube-inside' : from.includes(ch) ? 'tv-cube-lit' : 'tv-cube'
          return (
            <g key={ch}>
              <rect x={x} y={6 + r * W} width={W} height={W} className={cls} />
              <text x={x + W / 2} y={6 + r * W + 20} textAnchor="middle">
                {ch}
              </text>
            </g>
          )
        }),
      )}
      <line x1={150} y1={2} x2={150} y2={160} className="tv-mid" />
      <text x={150} y={188} textAnchor="middle" className="tv-label">
        {SUMS[Math.min(step, 3)]}
      </text>
    </svg>
  )
}
