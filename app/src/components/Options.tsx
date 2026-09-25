import { OPTION_KEYS } from '../types'
import type { OptionKey, Question } from '../types'
import { useT } from '../lib/i18n'
import { useQuestionText } from '../lib/i18n/content'
import { Term } from './SeriesView'

interface Props {
  q: Question
  chosen?: OptionKey
  /** Show right/wrong colouring. */
  reveal?: boolean
  onPick?: (k: OptionKey) => void
  size?: 'md' | 'lg'
}

export function Options({ q, chosen, reveal, onPick, size = 'md' }: Props) {
  const t = useT()
  const { options } = useQuestionText(q)
  return (
    <div className={`options options-${size}${q.kind === 'rule' ? ' options-text' : ''}`} role="radiogroup" aria-label={t.common.answerOptions}>
      {OPTION_KEYS.map((k) => {
        let state = ''
        if (reveal && k === q.answer) state = 'correct'
        else if (reveal && k === chosen) state = 'wrong'
        else if (k === chosen) state = 'selected'
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={k === chosen}
            className={`option ${state}`}
            disabled={reveal || !onPick}
            onClick={() => onPick?.(k)}
          >
            <span className="option-key">{k}</span>
            <span className="option-value">
              <Term value={options[k]} />
            </span>
            {state === 'correct' && <span className="option-mark" aria-label={t.common.correctAnswer}>✓</span>}
            {state === 'wrong' && <span className="option-mark" aria-label={t.common.yourWrongAnswer}>✗</span>}
          </button>
        )
      })}
    </div>
  )
}
