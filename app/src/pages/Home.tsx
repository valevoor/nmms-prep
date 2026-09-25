import { ChapterArt } from '../components/ChapterArt'
import { LangSwitch } from '../components/LangSwitch'
import { Page } from '../components/Page'
import { Rich } from '../components/Rich'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { READY_TOPICS, UPCOMING_MAT } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { useTopicMeta } from '../lib/i18n/content'
import { summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

/** Chapters in book order, not the order they were added. */
const BY_CHAPTER = [...READY_TOPICS].sort((a, b) => a.chapter - b.chapter)

function TopicCard({ t }: { t: ReadyTopic }) {
  const tr = useT()
  const meta = useTopicMeta(t.id, t.meta)
  const p = useProgress(t.id)
  const s = summarize(p, t.questions.length)
  const base = `t/${t.id}`
  return (
    <section className="card topic-card">
      <div className="topic-head">
        <ChapterArt chapter={t.chapter} size={72} />
        <div>
          <span className="chip">{tr.common.chapter(t.chapter)}</span>
          <h3>{tr.chapters[t.chapter] ?? t.name}</h3>
          <p className="muted">{meta.intro}</p>
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
  )
}

export function Home() {
  const t = useT()
  return (
    <Page
      title={t.home.title}
      right={
        <div className="topbar-switches">
          <LangSwitch />
          <ThemeSwitch />
        </div>
      }
    >
      <section className="hero">
        <p className="eyebrow">{t.home.eyebrow}</p>
        <h2>{t.home.heading}</h2>
        <ul className="facts">
          {t.home.facts.map((f) => (
            <li key={f.join()}>
              <Rich parts={f} />
            </li>
          ))}
        </ul>
      </section>

      <h2 className="section-title">{t.home.ready}</h2>
      {BY_CHAPTER.map((x) => (
        <TopicCard key={x.id} t={x} />
      ))}

      <h2 className="section-title">{t.home.soon}</h2>
      <ul className="soon">
        {UPCOMING_MAT.map((c) => (
          <li key={c.chapter}>
            <ChapterArt chapter={c.chapter} size={42} />
            <span>
              <span className="muted">{t.common.chapterShort(c.chapter)}</span> {t.chapters[c.chapter] ?? c.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="footnote muted">{t.home.footnote}</p>
    </Page>
  )
}
