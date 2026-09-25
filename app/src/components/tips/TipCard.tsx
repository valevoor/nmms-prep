import { useState } from 'react'
import { useT } from '../../lib/i18n'
import type { Dict } from '../../lib/i18n'
import type { TopicMeta } from '../../types'
import { TIP_VISUALS } from './index'

type Tip = TopicMeta['tips'][number]
type Stepped = Exclude<keyof Dict['tipVisuals'], 'grid'>

/** A Learn page tip: a tap-through picture when the tip has a visual, plain text otherwise. */
export function TipCard({ tip, n }: { tip: Tip; n: number }) {
  const t = useT()
  const [step, setStep] = useState(0)
  const Visual = tip.visual ? TIP_VISUALS[tip.visual] : undefined

  if (!Visual)
    return (
      <section className="card tip">
        <span className="tip-num">{n}</span>
        <h3>{tip.title}</h3>
        <p>{tip.body}</p>
      </section>
    )

  const words = tip.visual && tip.visual !== 'grid' ? t.tipVisuals[tip.visual as Stepped] : undefined
  const buttons = words?.buttons ?? []
  const done = step >= buttons.length
  return (
    <section className="card tip tip-visual">
      <header className="tip-head">
        <span className="tip-num">{n}</span>
        <h3>{tip.title}</h3>
      </header>
      <div className="tip-figure">
        <Visual step={step} label={words?.label ?? ''} />
      </div>
      {tip.caption && <p className="tip-caption">{tip.caption}</p>}
      {buttons.length > 0 && (
        <div className="actions">
          <button className={`btn${done ? '' : ' btn-primary'}`} onClick={() => setStep(done ? 0 : step + 1)}>
            {done ? t.common.startAgain : buttons[step]}
          </button>
        </div>
      )}
      <details className="tip-why">
        <summary>{t.learn.why}</summary>
        <p>{tip.body}</p>
      </details>
    </section>
  )
}
