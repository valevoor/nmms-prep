import type { VisualProps } from './index'
import { HOP } from './examples'
import { ArrowHead, Box } from './shapes'

const X = (i: number) => 30 + i * 60
const BOX_Y = 80

/** Tip 1: a curved "+4" hop appears over each gap, one per step; the last hop fills the blank. */
export function HopArrows({ step, label }: VisualProps) {
  const terms = [...HOP.terms, HOP.answer]
  const last = terms.length - 1
  return (
    <svg className="tv" viewBox="0 0 300 104" role="img" aria-label={label}>
      {terms.slice(1).map((_, i) => {
        const [x1, x2] = [X(i) + 6, X(i + 1) - 6]
        const mid = (x1 + x2) / 2
        const on = i < step
        return (
          <g key={i} className={`tv-fade${on ? ' on' : ''}`}>
            <path className={`tv-hop tv-draw${on ? ' on' : ''}`} pathLength={1} d={`M${x1} 60Q${mid} 16 ${x2} 60`} />
            <ArrowHead x={x2} y={60} dx={x2 - mid} dy={44} />
            <text x={mid} y={30} textAnchor="middle" className="tv-label">
              {HOP.op}
            </text>
          </g>
        )
      })}
      {terms.map((t, i) =>
        i === last ? (
          <Box key={i} cx={X(i)} cy={BOX_Y} label={step >= last ? t : '?'} tone={step >= last ? 'good' : 'blank'} />
        ) : (
          <Box key={i} cx={X(i)} cy={BOX_Y} label={t} />
        ),
      )}
    </svg>
  )
}
