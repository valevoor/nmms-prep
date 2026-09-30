import { OPTION_KEYS } from '../types'
import type { OptionKey, Question } from '../types'
import { useT } from '../lib/i18n'
import { useQuestionTexts } from '../lib/i18n/content'
import { BiInline } from './Bi'
import { FigureView } from './FigureView'
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
  const { first, second, otherLang } = useQuestionTexts(q)
  const options = first.options
  const others = OPTION_KEYS.map((k) => (second && second.options[k] !== options[k] ? second.options[k] : undefined))
  // Long options (e.g. "Only decision I follows") put the second language on its own line, all four alike.
  const stacked = others.some((o, i) => o && options[OPTION_KEYS[i]].length + o.length > 24)
  const figs = q.figures?.options
  // Options that are whole equations (Arithmetical Operations) need the full width.
  const wide = !figs && Object.values(options).some((v) => v.includes('='))
  return (
    <div className={`options options-${size}${q.kind === 'rule' ? ' options-text' : ''}${figs ? ' options-fig' : ''}${wide ? ' options-wide' : ''}`} role="radiogroup" aria-label={t.common.answerOptions}>
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
              {figs ? <FigureView f={figs[k]} label={t.common.figureOption(k)} /> : <BiInline first={<Term value={options[k]} />} other={others[OPTION_KEYS.indexOf(k)]} otherLang={otherLang} stacked={stacked} />}
            </span>
            {state === 'correct' && <span className="option-mark" aria-label={t.common.correctAnswer}>✓</span>}
            {state === 'wrong' && <span className="option-mark" aria-label={t.common.yourWrongAnswer}>✗</span>}
          </button>
        )
      })}
    </div>
  )
}
