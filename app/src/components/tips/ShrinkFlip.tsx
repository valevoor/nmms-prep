import { SHRINK } from './examples'
import { GapArrow, Reveal } from './shapes'

const X = (i: number) => 40 + i * 73.3
const BASE = 66
/** Bigger numbers get bigger boxes, so the series visibly shrinks. */
const SIZES = [
  [62, 46],
  [52, 40],
  [44, 34],
  [38, 30],
]

/** Tip 3: step 1 labels the ÷ gaps; step 2 slides the boxes into reverse order and shows × instead. */
export function ShrinkFlip({ step }: { step: number }) {
  const flipped = step >= 2
  const n = SHRINK.values.length
  return (
    <svg className="tv" viewBox="0 0 300 116" role="img" aria-label="120, 24, 6, 2 divides by 5, 4, 3. Read backwards: 2, 6, 24, 120 multiplies by 3, 4, 5.">
      {SHRINK.values.map((v, i) => {
        const [w, h] = SIZES[i]
        const dx = flipped ? X(n - 1 - i) - X(i) : 0
        return (
          <g key={v} className="tv-move" style={{ transform: `translateX(${dx}px)` }}>
            <g className="tv-box">
              <rect x={X(i) - w / 2} y={BASE - h} width={w} height={h} rx={8} />
              <text x={X(i)} y={BASE - h / 2} dominantBaseline="central" textAnchor="middle">
                {v}
              </text>
            </g>
          </g>
        )
      })}
      <Reveal on={step === 1}>
        {SHRINK.ops.map((op, i) => (
          <GapArrow key={op} x={(X(i) + X(i + 1)) / 2} y={92} label={op} />
        ))}
      </Reveal>
      <Reveal on={flipped}>
        {SHRINK.flippedOps.map((op, i) => (
          <GapArrow key={op} x={(X(i) + X(i + 1)) / 2} y={92} label={op} tone="good" />
        ))}
      </Reveal>
    </svg>
  )
}
