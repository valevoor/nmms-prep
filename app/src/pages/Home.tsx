import { ChapterArt } from '../components/ChapterArt'
import { LangSwitch } from '../components/LangSwitch'
import { Page } from '../components/Page'
import { Rich } from '../components/Rich'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { READY_TOPICS, UPCOMING_MAT, getTopic } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { getLastTopic } from '../lib/lastTopic'
import { summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

/** Chapters in book order, not the order they were added. */
const BY_CHAPTER = [...READY_TOPICS].sort((a, b) => a.chapter - b.chapter)

function ChapterRow({ t }: { t: ReadyTopic }) {
  const tr = useT()
  const p = useProgress(t.id)
  const s = summarize(p, t.questions.length)
  return (
    <li>
      <a className="chapter-row" href={href(`t/${t.id}`)}>
        <ChapterArt chapter={t.chapter} size={40} />
        <span className="chapter-row-main">
          <span className="chapter-row-name">
            <span className="muted">{tr.common.chapterShort(t.chapter)}</span> {tr.chapters[t.chapter] ?? t.name}
          </span>
          <span className="meter meter-thin" role="img" aria-label={tr.home.bookCorrect(s.bookMastered, s.bookTotal)}>
            <span className="meter-fill" style={{ width: `${(100 * s.bookMastered) / s.bookTotal}%` }} />
          </span>
        </span>
        {p.mistakes.length > 0 && (
          <span className="row-badge" aria-label={tr.home.wrongCount(p.mistakes.length)}>
            {p.mistakes.length}
          </span>
        )}
        <span className="chapter-row-go" aria-hidden>
          →
        </span>
      </a>
    </li>
  )
}

function ContinueCard() {
  const tr = useT()
  const id = getLastTopic()
  const t = id ? getTopic(id) : undefined
  if (!t) return null
  return (
    <a className="card continue-card" href={href(`t/${t.id}`)}>
      <ChapterArt chapter={t.chapter} size={48} />
      <span className="continue-main">
        <span className="continue-label">{tr.home.continue}</span>
        <span className="continue-name">
          <span className="muted">{tr.common.chapterShort(t.chapter)}</span> {tr.chapters[t.chapter] ?? t.name}
        </span>
      </span>
      <span aria-hidden>→</span>
    </a>
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

      <ContinueCard />

      <h2 className="section-title">{t.home.ready}</h2>
      <ul className="chapter-list">
        {BY_CHAPTER.map((x) => (
          <ChapterRow key={x.id} t={x} />
        ))}
      </ul>

      {UPCOMING_MAT.length > 0 && (
        <>
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
        </>
      )}
      <p className="footnote muted">{t.home.footnote}</p>
    </Page>
  )
}
