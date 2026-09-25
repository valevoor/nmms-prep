import type { VisualProps } from './index'
import { DOUBLING, SQUARES } from './examples'
import { Reveal } from './shapes'

const X = (i: number) => 45 + i * 70
const DOT = 10

/** Tip 2: step 1 draws each square number as a square of dots; step 2 grows bars that double each time. */
export function GrowthShapes({ step, label }: VisualProps) {
  const max = Math.max(...DOUBLING.values)
  return (
    <svg className="tv" viewBox="0 0 300 250" role="img" aria-label={label}>
      {SQUARES.map((v, i) => {
        const n = i + 1
        const size = (n - 1) * DOT
        return (
          <g key={v}>
            <Reveal on={step >= 1}>
              {Array.from({ length: n * n }, (_, k) => (
                <circle key={k} className="tv-dot" cx={X(i) - size / 2 + (k % n) * DOT} cy={70 - size + Math.floor(k / n) * DOT} r={3.5} />
              ))}
            </Reveal>
            <text x={X(i)} y={98} textAnchor="middle">
              {v}
            </text>
            <Reveal on={step >= 1}>
              <text x={X(i)} y={116} textAnchor="middle" className="tv-label">
                {n}×{n}
              </text>
            </Reveal>
          </g>
        )
      })}

      <path className="tv-rule" d="M10 132H290" />

      {DOUBLING.values.map((v, i) => {
        const h = (70 * v) / max
        return (
          <g key={v}>
            <rect className={`tv-bar${step >= 2 ? ' on' : ''}`} x={X(i) - 16} y={222 - h} width={32} height={h} rx={4} />
            <text x={X(i)} y={240} textAnchor="middle">
              {v}
            </text>
          </g>
        )
      })}
      <Reveal on={step >= 2}>
        {DOUBLING.values.slice(1).map((_, i) => (
          <text key={i} x={(X(i) + X(i + 1)) / 2} y={200} textAnchor="middle" className="tv-label">
            {DOUBLING.op}
          </text>
        ))}
      </Reveal>
    </svg>
  )
}
