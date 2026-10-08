import type { Figure, Question } from '../types'
import { useT } from '../lib/i18n'
import { DrawingView } from './Drawing'

/** A book picture (a cropped PNG on a paper-white tile) or a drawing. */
export function FigureView({ f, label }: { f: Figure; label: string }) {
  if (typeof f === 'string')
    return (
      <span className="fig-paper">
        <img className="fig-img" src={f} alt={label} decoding="async" />
      </span>
    )
  if (f.faces)
    return (
      <span className="fig-paper fig-painted">
        <DrawingView d={f} label={label} />
      </span>
    )
  return <DrawingView d={f} label={label} />
}

interface StemProps {
  q: Question
  /** Show the answer in the blank. */
  reveal?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/** The pictures of a question, "A : B :: C : ?" (analogy) or in a row (series); the blank shows the answer when revealed. */
export function FigureStem({ q, reveal, size = 'md' }: StemProps) {
  const t = useT()
  const figs = q.figures!.terms
  const answer = q.figures!.options?.[q.answer]
  const cell = (f: Figure, i: number) => {
    if (f !== '?') return <FigureView f={f} label={t.common.figure(i + 1)} />
    if (reveal && answer) return <FigureView f={answer} label={t.common.figureOption(q.answer)} />
    return <span aria-label={t.series.what}>?</span>
  }
  // A diagram the question is about (Intersecting Figures): shown large, with the prompt below it.
  if (q.layout === 'text')
    return (
      <div className={`fig-diagram fig-${size}`} role="group" aria-label={t.common.pictureQuestion}>
        {figs.map((f, i) => (
          <FigureView key={i} f={f} label={t.common.figure(i + 1)} />
        ))}
      </div>
    )
  const cls = (f: Figure) => `fig-term${f === '?' ? (reveal && answer ? ' term-revealed' : ' term-blank') : ''}`
  if (q.layout === 'analogy') {
    const pairs = [figs.slice(0, 2), figs.slice(2, 4)].filter((p) => p.length > 0)
    return (
      <div className={`fig-stem fig-${size}`} role="group" aria-label={t.common.pictureQuestion}>
        {pairs.map((p, j) => (
          <span key={j} className="fig-pair">
            <span className={cls(p[0])}>{cell(p[0], 2 * j)}</span>
            {p.length > 1 && (
              <>
                <span className="fig-sep" aria-hidden>
                  :
                </span>
                <span className={cls(p[1])}>{cell(p[1], 2 * j + 1)}</span>
              </>
            )}
            {j === 0 && pairs.length > 1 && (
              <span className="fig-sep" aria-hidden>
                ::
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className={`fig-stem fig-${size}`} role="group" aria-label={t.common.pictureQuestion}>
      {figs.map((f, i) => (
        <span key={i} className={cls(f)}>
          {cell(f, i)}
        </span>
      ))}
    </div>
  )
}
