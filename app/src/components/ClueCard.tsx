import { useState } from 'react'
import { useClueTexts } from '../lib/clues'
import { useT } from '../lib/i18n'
import type { Question } from '../types'
import { BiBlock } from './Bi'

interface Props {
  q: Question
  /** How many clues have been revealed (0: only the "Need a clue?" button shows). The page keeps it, to count them. */
  shown: number
  onShow: (n: number) => void
  /** After answering: earlier clues can still be read, but no new ones revealed. */
  locked?: boolean
  size?: 'md' | 'lg'
}

/**
 * Step-by-step clues, one at a time in a card under the question's figure. Back and Next move between
 * the clues already revealed; Next on the last one reveals the next clue. Renders nothing for a
 * question without clues.
 */
export function ClueCard({ q, shown, onShow, locked, size = 'md' }: Props) {
  const t = useT()
  const { first, second, lang, otherLang } = useClueTexts(q)
  const [at, setAt] = useState(Math.max(0, shown - 1))
  // A newly revealed clue (here or by the Classroom's C key) is the one shown.
  const [seen, setSeen] = useState(shown)
  if (seen !== shown) {
    setSeen(shown)
    setAt(Math.max(0, shown - 1))
  }
  if (first.length === 0) return null
  if (shown === 0)
    return locked ? null : (
      <button type="button" className={`btn clue-open clue-${size}`} onClick={() => onShow(1)}>
        {t.clues.need}
      </button>
    )
  const last = at === shown - 1
  const canNext = !last || (shown < first.length && !locked)
  return (
    <div className={`clue-card clue-${size}`} role="group" aria-label={t.clues.title(at + 1, first.length)}>
      <div className="clue-head">
        <span>{t.clues.title(at + 1, first.length)}</span>
        <span className="clue-dots" aria-hidden>
          {first.map((_, i) => (
            <i key={i} className={`${i < shown ? 'on' : ''}${i === at ? ' at' : ''}`} />
          ))}
        </span>
      </div>
      <div aria-live="polite">
        <BiBlock className="clue-text" text={first[at]} other={second?.[at]} lang={lang} otherLang={otherLang} />
      </div>
      {/* After answering with one clue there is nowhere to go, so no greyed-out buttons. */}
      {(at > 0 || canNext) && (
        <div className="clue-nav">
          <button type="button" className="btn" disabled={at === 0} onClick={() => setAt(at - 1)}>
            {t.clues.back}
          </button>
          <button type="button" className="btn" disabled={!canNext} onClick={() => (last ? onShow(shown + 1) : setAt(at + 1))}>
            {t.clues.next}
          </button>
        </div>
      )}
    </div>
  )
}
