import { Page } from '../components/Page'
import type { SatTopic as Topic } from '../data/sat'
import { satBookQuestions, satChapterName, satQuestions, satSolved, satTopicName } from '../data/sat'
import { topicRevisions } from '../data/satRevise'
import { useLocale, useT } from '../lib/i18n'
import { satKey, satMastery, satMistakes, summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

/**
 * One SAT topic (#/sat/<id>): a textbook chapter, or a few related ones combined for revision. It shows
 * where to study each chapter in the textbook, what it covers, and Practice, which asks its study-book and past exam questions; a topic with
 * solved questions also shows its progress, as a MAT chapter does.
 * An "Old syllabus" or Miscellaneous topic has no textbook chapter, so it says why instead.
 */
export function SatTopic({ topic: t }: { topic: Topic }) {
  const tr = useT()
  const lang = useLocale()
  const items = satQuestions(t)
  const book = satBookQuestions(t)
  const any = items.length + book.length > 0
  const papers = new Set(items.map((x) => x.paper.id)).size
  const solved = satSolved(t)
  const p = useProgress(satKey(t.id))
  const m = satMastery(p, solved)
  const s = summarize(p, 0)
  const mistakes = satMistakes(p, solved)
  const base = `sat/${t.id}`
  const subject = tr.sat.subjects[t.subject]
  const only = t.chapters.length === 1 ? t.chapters[0] : undefined
  const canRevise = topicRevisions(t).length > 0
  return (
    <Page title={satTopicName(t, lang)} back="?test=sat">
      <section className="card topic-card">
        <div>
          <span className="chip">
            {t.chapters.length === 0
              ? tr.sat.miscChip(subject)
              : only
                ? tr.sat.chip(only.cls, subject, only.no)
                : tr.sat.groupChip(subject, t.chapters.length)}
          </span>
        </div>
        {solved.length > 0 && (
          <div className="meter" aria-label={tr.home.examCorrect(m.right, m.total)}>
            <div className="meter-fill" style={{ width: `${(100 * m.right) / m.total}%` }} />
          </div>
        )}
        <dl className="stats">
          {book.length > 0 && (
            <div>
              <dt>{tr.sat.bookQuestionsStat}</dt>
              <dd>{book.length}</dd>
            </div>
          )}
          <div>
            <dt>{tr.sat.pastQuestionsStat}</dt>
            <dd>{items.length}</dd>
          </div>
          {book.length === 0 && (
            <div>
              <dt>{tr.sat.papersStat}</dt>
              <dd>{papers}</dd>
            </div>
          )}
          {solved.length > 0 && (
            <div>
              <dt>{tr.home.accuracy}</dt>
              <dd>{s.accuracy === null ? '–' : `${s.accuracy}%`}</dd>
            </div>
          )}
        </dl>
        {canRevise ? (
          <div className="actions">
            <a className="btn btn-primary" href={href(`${base}/revise`)}>
              {tr.sat.revise}
            </a>
            <a className="btn" href={href(`${base}/flashcards`)}>
              {tr.sat.flashcards}
            </a>
            {any && (
              <a className="btn flash-wide" href={href(`${base}/practice`)}>
                {tr.home.practice}
              </a>
            )}
          </div>
        ) : (
          <div className="actions sat-actions">
            <a className="btn btn-primary" href={href(`${base}/practice`)}>
              {tr.home.practice}
            </a>
          </div>
        )}
        {mistakes.length > 0 && (
          <a className="mistakes-link" href={href(`${base}/practice?mode=mistakes`)}>
            {tr.home.retryWrong(mistakes.length)}
          </a>
        )}
        <p className="muted sat-note">{items.length > 0 ? (solved.length > 0 ? tr.sat.answersReady : tr.sat.noAnswers) : book.length > 0 ? tr.sat.bookOnly : tr.sat.noPastQuestions}</p>
      </section>

      {t.chapters.length === 0 && (
        <section className="card sat-study">
          <h2>{t.oldChapter ? tr.sat.oldTitle : tr.sat.miscTitle}</h2>
          <p>{t.oldChapter ? tr.sat.oldNote : tr.sat.miscNote}</p>
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
