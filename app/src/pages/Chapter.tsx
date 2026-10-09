import { ChapterArt } from '../components/ChapterArt'
import { Page } from '../components/Page'
import type { ReadyTopic } from '../data/topics'
import { useLocale, useT } from '../lib/i18n'
import { useTopicMetas } from '../lib/i18n/content'
import { BiBlock } from '../components/Bi'
import { FACT_CHAPTERS, FACT_TABS } from '../data/facts'
import { summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

/** One chapter's progress and the ways into it (Learn, Practice, Quick test, Classroom, game). */
export function Chapter({ topic: t }: { topic: ReadyTopic }) {
  const tr = useT()
  const lang = useLocale()
  const { first: meta, second, otherLang } = useTopicMetas(t.id, t.meta)
  const p = useProgress(t.id)
  const s = summarize(p, t.questions.length)
  const base = `t/${t.id}`
  const factTab = FACT_CHAPTERS[t.id]
  return (
    <Page title={tr.chapters[t.chapter] ?? t.name} back="">
      <section className="card topic-card">
        <div className="topic-head">
          <ChapterArt chapter={t.chapter} size={72} />
          <div>
            <span className="chip">{tr.common.chapter(t.chapter)}</span>
            <BiBlock className="muted topic-intro" text={meta.intro} other={second?.intro} lang={lang} otherLang={otherLang} />
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
        {t.explore && (
          <a className="game-link" href={href(`${base}/explore`)}>
            <span aria-hidden>🧊</span>
            <span>
              <strong>{tr.explore.link}</strong>
              <span className="muted">{tr.explore.linkSub}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
        )}
        {t.fold && (
          <a className="game-link" href={href(`${base}/fold`)}>
            <span aria-hidden>🎲</span>
            <span>
              <strong>{tr.fold.link}</strong>
              <span className="muted">{tr.fold.linkSub}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
        )}
        {t.draw && (
          <a className="game-link" href={href(`${base}/draw`)}>
            <span aria-hidden>✏️</span>
            <span>
              <strong>{tr.sheet.link}</strong>
              <span className="muted">{tr.sheet.linkSub}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
        )}
        {t.punch && (
          <a className="game-link" href={href(`${base}/punch`)}>
            <span aria-hidden>✂️</span>
            <span>
              <strong>{tr.punch.link}</strong>
              <span className="muted">{tr.punch.linkSub}</span>
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

      {factTab && (
        <section className="card trick-card warn facts-shortcut">
          <h3>{tr.facts.chapterTitle}</h3>
          <p>{tr.facts.chapterBody}</p>
          <div className="facts-chips">
            {/* The chapter's main table first, then the other two. */}
            {[factTab, ...FACT_TABS.filter((k) => k !== factTab)].map((k) => (
              <a key={k} href={href(`facts/${k}`)}>
                {tr.facts.tabs[k]} →
              </a>
            ))}
          </div>
        </section>
      )}
    </Page>
  )
}
