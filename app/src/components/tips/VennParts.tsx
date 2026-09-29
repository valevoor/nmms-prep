import { BOX_W, LAYOUTS, partCentres } from '../../lib/generators/venn'
import { DrawingBody } from '../Drawing'
import type { VisualProps } from './index'

/** The number in each part (bitmask: circle 1, rectangle 2, triangle 4). */
const NUM: Record<number, number> = { 1: 9, 2: 7, 3: 5, 4: 4, 5: 6, 6: 12, 7: 10 }
const SHAPES = LAYOUTS[0]
const AT = partCentres(SHAPES).at
/** Parts counted at each step: none, then "in both ○ and □", then "in ○ only". */
const LIT: number[][] = [[], [3, 7], [1]]

/** Chapter 5 tip: which parts of overlapping shapes to count. */
export function VennParts({ step, label }: VisualProps) {
  const lit = LIT[Math.min(step, LIT.length - 1)]
  return (
    <svg className="tv" viewBox={`0 0 ${BOX_W} 100`} role="img" aria-label={label}>
      <DrawingBody d={{ items: SHAPES }} />
      {[1, 2, 3, 4, 5, 6, 7].map((m) => (
        <g key={m}>
          {lit.includes(m) && <circle cx={AT[m][0]} cy={AT[m][1]} r={8} className="tv-venn-lit" />}
          <text x={AT[m][0]} y={AT[m][1]} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 10 }} className={lit.includes(m) ? 'tv-label' : undefined}>
            {NUM[m]}
          </text>
        </g>
      ))}
    </svg>
  )
}
