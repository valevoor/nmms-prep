import { Page } from '../components/Page'
import type { SatChapter, SatPaper, SatQuestion, SatTopic } from '../data/sat'
import { satQuestions, satTopicName } from '../data/sat'
import { useLocale, useT } from '../lib/i18n'
import { OPTION_KEYS } from '../types'

/** A SAT topic's past exam questions (#/sat/<id>/questions), as printed; they have no answers yet. */
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
  return (
    <article className="card sat-q">
      <p className="sat-q-src">
        {t.common.paperQ(t.common.states[paper.state], paper.year, q.paperNo)}
        {chapter && ` · ${t.sat.fromChapter(chapter.cls, t.sat.subjects[chapter.subject], chapter.no)}`}
      </p>
      <p className="sat-prompt">{q.prompt}</p>
      {q.table && (
        <div className="sat-table-wrap">
          <table className="code-table sat-table">
            <tbody>
              {q.table.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
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
          {OPTION_KEYS.map((k) => (
            <li key={k}>
              <span className="sat-key">{k}</span>
              <span>{q.options[k]}</span>
            </li>
          ))}
        </ul>
      )}
      {q.note && (
        <p className="muted sat-note">
          <strong>{t.sat.noteLabel}</strong> {q.note}
        </p>
      )}
    </article>
  )
}
