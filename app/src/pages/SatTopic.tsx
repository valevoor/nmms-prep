import { Page } from '../components/Page'
import type { SatTopic as Topic } from '../data/sat'
import { satChapterName, satQuestions, satTopicName } from '../data/sat'
import { useLocale, useT } from '../lib/i18n'
import { href } from '../lib/router'

/**
 * One SAT topic (#/sat/<id>): a textbook chapter, or a few related ones combined for revision. It shows
 * where to study each chapter in the textbook, what it covers, and the way to the past exam questions.
 * An "Old syllabus" or Uncategorized topic has no textbook chapter, so it says why instead.
 */
export function SatTopic({ topic: t }: { topic: Topic }) {
  const tr = useT()
  const lang = useLocale()
  const items = satQuestions(t)
  const papers = new Set(items.map((x) => x.paper.id)).size
  const subject = tr.sat.subjects[t.subject]
  const only = t.chapters.length === 1 ? t.chapters[0] : undefined
  return (
    <Page title={satTopicName(t, lang)} back="?test=sat">
      <section className="card topic-card">
        <div>
          <span className="chip">
            {t.chapters.length === 0
              ? tr.sat.uncategorizedChip(subject)
              : only
                ? tr.sat.chip(only.cls, subject, only.no)
                : tr.sat.groupChip(subject, t.chapters.length)}
          </span>
        </div>
        <dl className="stats">
          <div>
            <dt>{tr.sat.pastQuestionsStat}</dt>
            <dd>{items.length}</dd>
          </div>
          <div>
            <dt>{tr.sat.papersStat}</dt>
            <dd>{papers}</dd>
          </div>
        </dl>
        <div className="actions sat-actions">
          <a className="btn btn-primary" href={href(`sat/${t.id}/questions`)}>
            {tr.sat.pastQuestions}
          </a>
        </div>
        <p className="muted sat-note">{tr.sat.noAnswers}</p>
      </section>

      {t.chapters.length === 0 && (
        <section className="card sat-study">
          <h2>{t.oldChapter ? tr.sat.oldTitle : tr.sat.uncategorizedTitle}</h2>
          <p>{t.oldChapter ? tr.sat.oldNote : tr.sat.uncategorizedNote}</p>
        </section>
      )}
      {t.chapters.length > 0 && (
        <section className="card sat-study">
          <h2>{tr.sat.textbook}</h2>
          {t.chapters.map((c) => (
            <div key={c.id} className="sat-book">
              <p className="sat-book-ch">
                <span className="muted">{tr.sat.chapterTitle(c.cls, c.no)}</span> {satChapterName(c, lang)}
              </p>
              <p className="muted sat-book-ref">{tr.sat.book(c.cls, subject, c.part, c.pages[0], c.pages[1])}</p>
              {c.topics.length > 0 && (
                <ul>
                  {c.topics.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </Page>
  )
}
