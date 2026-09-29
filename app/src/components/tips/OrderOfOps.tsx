import type { VisualProps } from './index'
import { BODMAS } from './examples'
import { Box, Reveal } from './shapes'

const X = (i: number) => 26 + i * 62
const ROW = [24, 76, 128]

/** A sign between two boxes. */
const Sign = ({ x, y, s }: { x: number; y: number; s: string }) => (
  <text x={x} y={y} dominantBaseline="central" textAnchor="middle" className="tv-label">
    {s}
  </text>
)

/**
 * Arithmetical Operations tip: step 1 marks the ÷ pair, step 2 works it out on a new line
 * (12 + 12 − 1 − 12), step 3 does the + and − to reach 11.
 */
export function OrderOfOps({ step, label }: VisualProps) {
  const { nums, ops, first, answer } = BODMAS
  const [a, b] = [nums[first], nums[first + 1]]
  const merged = (X(first) + X(first + 1)) / 2
  // The second line: the ÷ pair becomes one box in the middle of where it was.
  const row2 = [...nums.slice(0, first).map((n, i) => ({ x: X(i), n })), { x: merged, n: a / b }, ...nums.slice(first + 2).map((n, i) => ({ x: X(first + 2 + i), n }))]
  const ops2 = ops.filter((_, i) => i !== first)
  return (
    <svg className="tv" viewBox="0 0 300 152" role="img" aria-label={label}>
      {nums.map((n, i) => (
        <Box key={i} cx={X(i)} cy={ROW[0]} w={36} h={30} label={n} tone={step >= 1 && (i === first || i === first + 1) ? 'accent' : undefined} />
      ))}
      {ops.map((s, i) => (
        <Sign key={i} x={X(i) + 31} y={ROW[0]} s={s} />
      ))}
      <Reveal on={step >= 2}>
        {row2.map(({ x, n }, i) => (
          <Box key={i} cx={x} cy={ROW[1]} w={36} h={30} label={n} tone={x === merged ? 'accent' : undefined} />
        ))}
        {ops2.map((s, i) => (
          <Sign key={i} x={(row2[i].x + row2[i + 1].x) / 2} y={ROW[1]} s={s} />
        ))}
      </Reveal>
      <Reveal on={step >= 3}>
        <Sign x={122} y={ROW[2]} s="=" />
        <Box cx={150} cy={ROW[2]} w={40} h={30} label={answer} tone="good" />
      </Reveal>
    </svg>
  )
}
