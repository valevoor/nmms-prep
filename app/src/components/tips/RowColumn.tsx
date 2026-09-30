import type { VisualProps } from './index'

// The book's × table: each letter is its row number × its column number. The taps light E's row,
// then its column, then work out E where they cross.
const COLS = ['1', '2', '3']
const ROWS: [string, string[]][] = [
  ['1', ['G', 'U', 'B']],
  ['2', ['H', 'L', 'E']],
  ['3', ['O', 'R', 'P']],
]
const SUMS = ['', 'E → 2', 'E → 2, 3', 'E = 2 × 3 = 6']
const S = 38
const X0 = 74
const Y0 = 6

/** Chapter 29 tip: find a letter's row number, then its column number, then use the rule. */
export function RowColumn({ step, label }: VisualProps) {
  const k = Math.min(step, 3)
  const lit = (r: number, c: number) => (k >= 1 && r === 2) || (k >= 2 && c === 3)
  const box = (r: number, c: number, text: string, head: boolean) => (
    <g key={`${r}-${c}`}>
      <rect
        x={X0 + c * S}
        y={Y0 + r * S}
        width={S}
        height={S}
        className={k === 3 && r === 2 && c === 3 ? 'tv-cube-inside' : lit(r, c) ? 'tv-cube-lit' : 'tv-cube'}
      />
      <text x={X0 + c * S + S / 2} y={Y0 + r * S + 25} textAnchor="middle" className={head ? 'tv-label' : undefined}>
        {text}
      </text>
    </g>
  )
  return (
    <svg className="tv" viewBox="0 0 300 200" role="img" aria-label={label}>
      {box(0, 0, '×', true)}
      {COLS.map((c, j) => box(0, j + 1, c, true))}
      {ROWS.map(([r, letters], i) => [box(i + 1, 0, r, true), ...letters.map((ch, j) => box(i + 1, j + 1, ch, false))])}
      <text x={150} y={188} textAnchor="middle" className="tv-label">
        {SUMS[k]}
      </text>
    </svg>
  )
}
