import { useState } from 'react'
import { useT } from '../../lib/i18n'
import { isPrime } from '../../lib/series'

const NUMBERS = Array.from({ length: 50 }, (_, i) => i + 1)

const KINDS = [
  { id: 'even', test: (n: number) => n % 2 === 0 },
  { id: 'odd', test: (n: number) => n % 2 === 1 },
  { id: 'prime', test: isPrime },
  { id: 'square', test: (n: number) => Number.isInteger(Math.sqrt(n)) },
  { id: 'cube', test: (n: number) => Math.round(Math.cbrt(n)) ** 3 === n },
] as const

/** Tip 5: a 1–50 grid; each chip lights up one family of special numbers. */
export function NumberGrid() {
  const g = useT().tipVisuals.grid
  const [kind, setKind] = useState<string>('prime')
  const k = KINDS.find((x) => x.id === kind)
  const hits = k ? NUMBERS.filter(k.test) : []
  return (
    <div className="ngrid-wrap">
      <div className="ngrid-chips" role="group" aria-label={g.lightUp}>
        {KINDS.map((x) => (
          <button key={x.id} className={`ngrid-chip${x.id === kind ? ' on' : ''}`} aria-pressed={x.id === kind} onClick={() => setKind(x.id === kind ? '' : x.id)}>
            {g[x.id]}
          </button>
        ))}
      </div>
      <div className="ngrid" aria-hidden>
        {NUMBERS.map((n) => (
          <span key={n} className={k?.test(n) ? 'on' : undefined}>
            {n}
          </span>
        ))}
      </div>
      <p className="ngrid-note muted" aria-live="polite">
        {k ? g.count(hits.length, g[k.id], hits.join(', ')) : g.hint}
      </p>
    </div>
  )
}
