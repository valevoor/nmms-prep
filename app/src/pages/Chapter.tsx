import { ChapterArt } from '../components/ChapterArt'
import { Page } from '../components/Page'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { useTopicMeta } from '../lib/i18n/content'
import { summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

/** One chapter's progress and the ways into it (Learn, Practice, Quick test, Classroom, game). */
export function Chapter({ topic: t }: { topic: ReadyTopic }) {
  const tr = useT()
  const meta = useTopicMeta(t.id, t.meta)
  const p = useProgress(t.id)
  const s = summarize(p, t.questions.length)
  const base = `t/${t.id}`
  return (
    <Page title={tr.chapters[t.chapter] ?? t.name} back="">
      <section className="card topic-card">
        <div className="topic-head">
          <ChapterArt chapter={t.chapter} size={72} />
          <div>
            <span className="chip">{tr.common.chapter(t.chapter)}</span>
            <p className="muted topic-intro">{meta.intro}</p>
          </div>
        </div>

        <div className="meter" aria-label={tr.home.bookCorrect(s.bookMastered, s.bookTotal)}>
          <div className="meter-fill" style={{ width: `${(100 * s.bookMastered) / s.bookTotal}%` }} />
        </div>
        <dl className="stats">
          <div>
            <dt>{tr.home.bookQuestions}</dt>
            <dd>
              {s.bookMastered}/{s.bookTotal}
            </dd>
          </div>
          <div>
            <dt>{tr.home.accuracy}</dt>
            <dd>{s.accuracy === null ? '–' : `${s.accuracy}%`}</dd>
          </div>
          <div>
            <dt>{tr.home.bestTest}</dt>
            <dd>{s.best ? `${s.best.score}/${s.best.total}` : '–'}</dd>
          </div>
        </dl>

        <div className="actions">
          <a className="btn btn-primary" href={href(`${base}/learn`)}>
            {tr.home.learn}
          </a>
          <a className="btn" href={href(`${base}/practice?mode=book`)}>
            {tr.home.practice}
          </a>
          <a className="btn" href={href(`${base}/test`)}>
            {tr.home.quickTest}
          </a>
          <a className="btn" href={href(`${base}/classroom`)}>
            {tr.home.classroom}
          </a>
        </div>
        {t.guessRule && (
          <a className="game-link" href={href(`${base}/rule`)}>
            <span aria-hidden>🔎</span>
            <span>
              <strong>{tr.game.title}</strong>
              <span className="muted">{tr.game.topics[t.id]?.blurb}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
        )}
        {p.mistakes.length > 0 && (
          <a className="mistakes-link" href={href(`${base}/practice?mode=mistakes`)}>
            {tr.home.retryWrong(p.mistakes.length)}
          </a>
        )}
      </section>
    </Page>
  )
}
