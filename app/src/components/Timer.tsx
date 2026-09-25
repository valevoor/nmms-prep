import { mmss } from '../lib/countdown'

export function TimerBadge({ left, total }: { left: number; total: number }) {
  const low = left <= Math.min(60, total * 0.2)
  return (
    <span className={`timer${low ? ' timer-low' : ''}`} role="timer" aria-live="off">
      ⏱ {mmss(left)}
    </span>
  )
}
