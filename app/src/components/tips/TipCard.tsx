import { useState } from 'react'
import type { TopicMeta } from '../../types'
import { TIP_VISUALS } from './index'

type Tip = TopicMeta['tips'][number]

/** A Learn page tip: a tap-through picture when the tip has a visual, plain text otherwise. */
export function TipCard({ tip, n }: { tip: Tip; n: number }) {
  const [step, setStep] = useState(0)
  const entry = tip.visual ? TIP_VISUALS[tip.visual] : undefined

  if (!entry)
    return (
      <section className="card tip">
        <span className="tip-num">{n}</span>
        <h3>{tip.title}</h3>
        <p>{tip.body}</p>
      </section>
    )

  const { Visual, buttons } = entry
  const done = step >= buttons.length
  return (
    <section className="card tip tip-visual">
      <header className="tip-head">
        <span className="tip-num">{n}</span>
        <h3>{tip.title}</h3>
      </header>
      <div className="tip-figure">
        <Visual step={step} />
      </div>
      {tip.caption && <p className="tip-caption">{tip.caption}</p>}
      {buttons.length > 0 && (
        <div className="actions">
          <button className={`btn${done ? '' : ' btn-primary'}`} onClick={() => setStep(done ? 0 : step + 1)}>
            {done ? 'Start again' : buttons[step]}
          </button>
        </div>
      )}
      <details className="tip-why">
        <summary>Why?</summary>
        <p>{tip.body}</p>
      </details>
    </section>
  )
}
