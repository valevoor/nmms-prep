import type { VisualProps } from './index'

// An open dice shaped like a cross: a column of four squares with one square on each side of the
// second. Each tap lights one pair of opposite faces: the 1st and 3rd of the column, then the 2nd
// and 4th, then the two side squares.
const S = 44
const X0 = 84
const Y0 = 8
/** [column, row, label, the step that lights it] */
const CELLS: [number, number, string, number][] = [
  [1, 0, '2', 1],
  [0, 1, '3', 3],
  [1, 1, '1', 2],
  [2, 1, '4', 3],
  [1, 2, '5', 1],
  [1, 3, '6', 2],
]
const PAIRS = ['', '2 ↔ 5', '1 ↔ 6', '3 ↔ 4']

/** Chapter 11 tip: the opposite faces of an open dice. */
export function DiceNet({ step, label }: VisualProps) {
  return (
    <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
      {CELLS.map(([c, r, l, s]) => (
        <g key={l}>
          <rect x={X0 + c * S} y={Y0 + r * S} width={S} height={S} className={s === step ? 'tv-cube-lit' : 'tv-cube'} />
          <text x={X0 + c * S + S / 2} y={Y0 + r * S + S / 2 + 6} textAnchor="middle">
            {l}
          </text>
        </g>
      ))}
      {step > 0 && (
        <text x={250} y={Y0 + 2 * S + 6} textAnchor="middle" className="tv-label">
          {PAIRS[step]}
        </text>
      )}
    </svg>
  )
}
