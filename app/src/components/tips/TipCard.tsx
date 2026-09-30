import { useState } from 'react'
import { useLocale, useT } from '../../lib/i18n'
import { otherLocale } from '../../lib/i18n/content'
import { BiBlock } from '../Bi'
import type { Dict } from '../../lib/i18n'
import type { TopicMeta } from '../../types'
import { TIP_VISUALS } from './index'

type Tip = TopicMeta['tips'][number]
type Stepped = Exclude<keyof Dict['tipVisuals'], 'grid'>

/**
 * A Learn page tip: a tap-through picture when the tip has a visual, plain text otherwise.
 * `other` is the tip in the second language, when both are shown.
 */
export function TipCard({ tip, other, n }: { tip: Tip; other?: Tip; n: number }) {
  const t = useT()
  const lang = useLocale()
  const bi = { lang, otherLang: otherLocale(lang) }
  const title = <Title text={tip.title} other={other?.title} />
  const [step, setStep] = useState(0)
  const Visual = tip.visual ? TIP_VISUALS[tip.visual] : undefined

  if (!Visual)
    return (
      <section className="card tip">
        <span className="tip-num">{n}</span>
        {title}
        <BiBlock text={tip.body} other={other?.body} {...bi} />
      </section>
    )

  const words = tip.visual && tip.visual !== 'grid' ? t.tipVisuals[tip.visual as Stepped] : undefined
  const buttons = words?.buttons ?? []
  const done = step >= buttons.length
  return (
    <section className="card tip tip-visual">
      <header className="tip-head">
        <span className="tip-num">{n}</span>
        {title}
      </header>
      <div className="tip-figure">
        <Visual step={step} label={words?.label ?? ''} />
      </div>
      {tip.caption && <BiBlock className="tip-caption" text={tip.caption} other={other?.caption} {...bi} />}
      {buttons.length > 0 && (
        <div className="actions">
          <button className={`btn${done ? '' : ' btn-primary'}`} onClick={() => setStep(done ? 0 : step + 1)}>
            {done ? t.common.startAgain : buttons[step]}
          </button>
        </div>
      )}
      <details className="tip-why">
        <summary>{t.learn.why}</summary>
        <BiBlock text={tip.body} other={other?.body} {...bi} />
      </details>
    </section>
  )
}

/** A tip's heading, with the other language's heading under it in lighter type. */
function Title({ text, other }: { text: string; other?: string }) {
  const lang = useLocale()
  return (
    <h3>
      {text}
      {other && other !== text && (
        <span className="bi-sub" lang={otherLocale(lang)}>
          {other}
        </span>
      )}
    </h3>
  )
}
