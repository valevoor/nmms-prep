import { useState } from 'react'
import { isPrime } from '../../lib/series'

const NUMBERS = Array.from({ length: 50 }, (_, i) => i + 1)

const KINDS = [
  { id: 'even', label: 'Even', test: (n: number) => n % 2 === 0 },
  { id: 'odd', label: 'Odd', test: (n: number) => n % 2 === 1 },
  { id: 'prime', label: 'Prime', test: isPrime },
  { id: 'square', label: 'Square', test: (n: number) => Number.isInteger(Math.sqrt(n)) },
  { id: 'cube', label: 'Cube', test: (n: number) => Math.round(Math.cbrt(n)) ** 3 === n },
]

/** Tip 5: a 1–50 grid; each chip lights up one family of special numbers. */
export function NumberGrid() {
  const [kind, setKind] = useState('prime')
  const k = KINDS.find((x) => x.id === kind)
  const count = k ? NUMBERS.filter(k.test).length : 0
  return (
    <div className="ngrid-wrap">
      <div className="ngrid-chips" role="group" aria-label="Light up">
        {KINDS.map((x) => (
          <button key={x.id} className={`ngrid-chip${x.id === kind ? ' on' : ''}`} aria-pressed={x.id === kind} onClick={() => setKind(x.id === kind ? '' : x.id)}>
            {x.label}
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
        {k ? `${count} ${k.label.toLowerCase()} numbers from 1 to 50: ${NUMBERS.filter(k.test).join(', ')}` : 'Tap a button to light up those numbers.'}
      </p>
    </div>
  )
}
