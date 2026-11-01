import type { ReactNode } from 'react'
import { BiBlock, BiInline, BiTag } from './Bi'
import { MathText } from './MathText'
import type { SatPaper, SatQuestion, SatQuestionText } from '../data/sat'
import { satQuestionText } from '../data/sat'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'
import { OPTION_KEYS } from '../types'
import type { OptionKey } from '../types'

/**
 * A question's prompt, table, picture and options, in the current language (and the other one with "EN+ಕ").
 * A solved question gets the answer buttons; the others list their options as printed.
 */
export function SatQuestionBody({ paper, q, chosen, onPick }: { paper: SatPaper; q: SatQuestion; chosen?: OptionKey; onPick: (k: OptionKey) => void }) {
  const t = useT()
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const text = satQuestionText(paper, q, lang)
  const other = useShowBoth() ? satQuestionText(paper, q, otherLang) : undefined
  const render = mathRender(q)
  return (
    <>
      <BiBlock className="sat-prompt" text={text.prompt} other={other?.prompt} lang={lang} otherLang={otherLang} render={render} />
      {text.table && (
        <div className="sat-table-wrap">
          <table className="code-table sat-table">
            <tbody>
              {text.table.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) => {
                    const second = other?.table?.[r]?.[i]
                    return (
                      <td key={i}>
                        <BiInline first={render(cell)} other={second !== cell ? second : undefined} otherLang={otherLang} stacked render={render} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {q.figure && (
        <div className="sat-fig">
          <span className="fig-paper">
            <img className="fig-img" src={q.figure} alt={t.sat.picture(q.paperNo)} loading="lazy" decoding="async" />
          </span>
        </div>
      )}
      {q.answer ? (
        <AnswerOptions q={q} text={text} other={other} otherLang={otherLang} chosen={chosen} onPick={onPick} render={render} />
      ) : q.optionFigures ? (
        <ul className="sat-opts sat-opts-fig" aria-label={t.common.answerOptions}>
          {OPTION_KEYS.map((k) => (
            <li key={k}>
              <span className="sat-key">{k}</span>
              <span className="fig-paper">
                <img className="fig-img" src={q.optionFigures![k]} alt={t.sat.optionPicture(k)} loading="lazy" decoding="async" />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="sat-opts" aria-label={t.common.answerOptions}>
          {OPTION_KEYS.map((k) => {
            const second = other?.options[k]
            return (
              <li key={k}>
                <span className="sat-key">{k}</span>
                <span>
                  <BiInline first={render(text.options[k])} other={second !== text.options[k] ? second : undefined} otherLang={otherLang} stacked render={render} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {text.note && (
        <p className="muted sat-note">
          <strong>{t.sat.noteLabel}</strong> {text.note}
        </p>
      )}
    </>
  )
}

/** A solved question's worked solution and where its answer comes from, as MAT's Explanation shows them. */
export function SatExplanation({ paper, q }: { paper: SatPaper; q: SatQuestion }) {
  const t = useT()
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const text = satQuestionText(paper, q, lang)
  const other = useShowBoth() ? satQuestionText(paper, q, otherLang) : undefined
  if (!text.solution) return null
  const render = mathRender(q)
  return (
    <div className="explanation">
      {other?.solution ? (
        <div className="bi">
          <SolutionWords solution={text.solution} lang={lang} tagged render={render} />
          <SolutionWords solution={other.solution} lang={otherLang} tagged render={render} />
        </div>
      ) : (
        <SolutionWords solution={text.solution} lang={lang} render={render} />
      )}
      <p className="source">
        {t.common.paperQ(t.common.states[paper.state], paper.year, q.paperNo)} · {q.keyFrom === 'book' ? t.common.keyOfficial : t.common.keyWorkedOutPaper}
      </p>
    </div>
  )
}

/** A solved question's options as the MAT answer buttons: the first pick shows which one is right. */
function AnswerOptions({ q, text, other, otherLang, chosen, onPick, render }: { q: SatQuestion; text: SatQuestionText; other?: SatQuestionText; otherLang: Locale; chosen?: OptionKey; onPick: (k: OptionKey) => void; render: (s: string) => ReactNode }) {
  const t = useT()
  const figs = q.optionFigures
  // Sentences and long expressions get the full width, one option per row.
  const long = !figs && OPTION_KEYS.some((k) => text.options[k].length + (other?.options[k]?.length ?? 0) > 18)
  return (
    <div className={`options options-md${long ? ' options-text' : ''}${figs ? ' options-fig' : ''}`} role="radiogroup" aria-label={t.common.answerOptions}>
      {OPTION_KEYS.map((k) => {
        const state = chosen && k === q.answer ? 'correct' : chosen && k === chosen ? 'wrong' : ''
        const second = other?.options[k]
        return (
          <button key={k} type="button" role="radio" aria-checked={k === chosen} className={`option ${state}`} disabled={!!chosen} onClick={() => onPick(k)}>
            <span className="option-key">{k}</span>
            <span className="option-value">
              {figs ? (
                <span className="fig-paper">
                  <img className="fig-img" src={figs[k]} alt={t.sat.optionPicture(k)} loading="lazy" decoding="async" />
                </span>
              ) : (
                <BiInline first={render(text.options[k])} other={second !== text.options[k] ? second : undefined} otherLang={otherLang} stacked={long} render={render} />
              )}
            </span>
            {state === 'correct' && <span className="option-mark" aria-label={t.common.correctAnswer}>✓</span>}
            {state === 'wrong' && <span className="option-mark" aria-label={t.common.yourWrongAnswer}>✗</span>}
          </button>
        )
      })}
    </div>
  )
}

/** A solution in one language: the syllabus idea it uses, then the steps. The labels follow its language. */
function SolutionWords({ solution, lang, tagged, render }: { solution: NonNullable<SatQuestionText['solution']>; lang: Locale; tagged?: boolean; render: (s: string) => ReactNode }) {
  const t = DICTS[lang]
  return (
    <div className="expl-words" lang={tagged ? lang : undefined}>
      <p className="rule">
        {tagged && <BiTag lang={lang} />}
        <strong>{t.sat.concept}</strong> {render(solution.concept)}
      </p>
      {solution.steps.map((step, i) => (
        <p key={i} className="working">
          {render(step)}
        </p>
      ))}
    </div>
  )
}

/**
 * Maths questions draw their fractions and roots as printed (components/MathText.tsx). Other subjects stay
 * as text: their slashes are units ("km/h", "kJ/kg").
 */
function mathRender(q: SatQuestion): (s: string) => ReactNode {
  return q.subject === 'maths' ? (s) => <MathText text={s} /> : (s) => s
}
