import { useT } from '../lib/i18n'

const W = 24
const H = 24

/**
 * A pyramid (or diamond) of letters and numbers, each row centred under the one above so that a box
 * sits straight below the box with the same place from the middle (Chapter 30). Drawn as an SVG so
 * that the widest row, 13 boxes, still fits a phone.
 */
export function PyramidView({ rows }: { rows: string[][] }) {
  const t = useT()
  const widest = Math.max(...rows.map((r) => r.length))
  const width = widest * W + 2
  return (
    <svg className="pyramid" viewBox={`-1 -1 ${width} ${rows.length * H + 2}`} role="img" aria-label={`${t.common.pyramid}: ${rows.map((r) => r.join(' ')).join(', ')}`}>
      {rows.map((row, r) =>
        row.map((cell, i) => {
          const x = ((widest - row.length) / 2 + i) * W
          return (
            <g key={`${r}-${i}`}>
              <rect x={x} y={r * H} width={W} height={H} />
              <text x={x + W / 2} y={r * H + H / 2 + 5} textAnchor="middle" className={cell.length > 1 ? 'pyramid-small' : undefined}>
                {cell}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
