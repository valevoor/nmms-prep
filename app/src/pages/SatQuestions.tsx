import { BiBlock, BiInline } from '../components/Bi'
import { Page } from '../components/Page'
import type { SatChapter, SatPaper, SatQuestion, SatTopic } from '../data/sat'
import { satQuestions, satQuestionText, satTopicName } from '../data/sat'
import { useLocale, useShowBoth, useT } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'
import { OPTION_KEYS } from '../types'

/**
 * A SAT topic's past exam questions (#/sat/<id>/questions), as printed in English and Kannada; they have
 * no answers yet. With "EN+ಕ" on, each question shows both languages.
 */
export function SatQuestions({ topic }: { topic: SatTopic }) {
  const t = useT()
  const lang = useLocale()
  const items = satQuestions(topic)
  const many = topic.chapters.length > 1
  const papers = new Set(items.map((x) => x.paper.id)).size
  return (
    <Page title={satTopicName(topic, lang)} back={`sat/${topic.id}`}>
      <p className="muted sat-summary">{t.sat.pastSummary(items.length, papers)}</p>
      <ol className="sat-qs">
        {items.map(({ paper, q, chapter }) => (
          <li key={q.id}>
            <QuestionCard paper={paper} q={q} chapter={many ? chapter : undefined} />
          </li>
        ))}
      </ol>
    </Page>
  )
}

/** One question as printed; `chapter` is named when the topic combines several chapters. */
function QuestionCard({ paper, q, chapter }: { paper: SatPaper; q: SatQuestion; chapter?: SatChapter }) {
  const t = useT()
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const text = satQuestionText(paper, q, lang)
  const other = useShowBoth() ? satQuestionText(paper, q, otherLang) : undefined
  return (
    <article className="card sat-q">
      <p className="sat-q-src">
        {t.common.paperQ(t.common.states[paper.state], paper.year, q.paperNo)}
        {chapter && ` · ${t.sat.fromChapter(chapter.cls, t.sat.subjects[chapter.subject], chapter.no)}`}
      </p>
      <BiBlock className="sat-prompt" text={text.prompt} other={other?.prompt} lang={lang} otherLang={otherLang} />
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
                        <BiInline first={cell} other={second !== cell ? second : undefined} otherLang={otherLang} stacked />
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
      {q.optionFigures ? (
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
                  <BiInline first={text.options[k]} other={second !== text.options[k] ? second : undefined} otherLang={otherLang} stacked />
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
    </article>
  )
}
