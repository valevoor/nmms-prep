import { useEffect, useEffectEvent, useState } from 'react'

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

/** Counts down from `seconds` while `running`; calls onEnd once at zero. Reset by changing `resetKey`. */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds)
  const [lastReset, setLastReset] = useState(resetKey)
  const fireEnd = useEffectEvent(() => onEnd?.())

  // Reset during render (not in an effect) so a new run never sees the old run's 0.
  if (lastReset !== resetKey) {
    setLastReset(resetKey)
    setLeft(seconds)
  }

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(t)
  }, [running, resetKey])

  useEffect(() => {
    if (running && left === 0) fireEnd()
  }, [running, left])

  return left
}
