import type { VisualProps } from './index'
import { CHECK } from './examples'
import { Box, GapArrow } from './shapes'

const X = (i: number) => 28 + i * 48.8
const BOX_Y = 30

/** Tip 6: step 1 tries the wrong answer (the next gap breaks the rule); step 2 tries the right one. */
export function AnswerCheck({ step, label }: VisualProps) {
  const v = CHECK.values
  const tryWrong = step === 1
  const tryRight = step >= 2
  const shown = v.map((x, i) => (i !== CHECK.blank ? x : tryWrong ? CHECK.wrong : tryRight ? x : '?'))
  const blankTone = tryWrong ? 'bad' : tryRight ? 'good' : 'blank'
  // Wrong answer: the first gaps fit +1, +2, +3, then the gap to the next number would need +4 but is not.
  const wrongGaps = [...CHECK.wrongOps, `+${v[CHECK.blank + 1] - CHECK.wrong}`]
  return (
    <svg className="tv" viewBox="0 0 300 100" role="img" aria-label={label}>
      {shown.map((x, i) => (
        <Box key={i} cx={X(i)} cy={BOX_Y} w={38} label={x} tone={i === CHECK.blank ? blankTone : undefined} />
      ))}
      {tryWrong &&
        wrongGaps.map((op, i) => {
          const bad = i === wrongGaps.length - 1
          const x = (X(i) + X(i + 1)) / 2
          return (
            <g key={i}>
              <GapArrow x={x} y={66} label={op} tone={bad ? 'bad' : 'good'} />
              <text x={x} y={94} textAnchor="middle" className={bad ? 'tv-bad-mark' : 'tv-good-mark'}>
                {bad ? '✗' : '✓'}
              </text>
            </g>
          )
        })}
      {tryRight &&
        v.slice(1).map((_, i) => {
          const x = (X(i) + X(i + 1)) / 2
          return (
            <g key={i}>
              <GapArrow x={x} y={66} label={CHECK.op} tone="good" />
              <text x={x} y={94} textAnchor="middle" className="tv-good-mark">
                ✓
              </text>
            </g>
          )
        })}
    </svg>
  )
}
