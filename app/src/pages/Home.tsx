import { ChapterArt } from '../components/ChapterArt'
import { Page } from '../components/Page'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { READY_TOPICS, UPCOMING_MAT } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { summarize, useProgress } from '../lib/progress'
import { href } from '../lib/router'

function TopicCard({ t }: { t: ReadyTopic }) {
  const p = useProgress(t.id)
  const s = summarize(p, t.questions.length)
  const base = `t/${t.id}`
  return (
    <section className="card topic-card">
      <div className="topic-head">
        <ChapterArt chapter={t.chapter} size={72} />
        <div>
          <span className="chip">Chapter {t.chapter}</span>
          <h3>{t.name}</h3>
          <p className="muted">{t.meta.intro}</p>
        </div>
      </div>

      <div className="meter" aria-label={`${s.bookMastered} of ${s.bookTotal} book questions correct`}>
        <div className="meter-fill" style={{ width: `${(100 * s.bookMastered) / s.bookTotal}%` }} />
      </div>
      <dl className="stats">
        <div>
          <dt>Book questions</dt>
          <dd>
            {s.bookMastered}/{s.bookTotal}
          </dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{s.accuracy === null ? '–' : `${s.accuracy}%`}</dd>
        </div>
        <div>
          <dt>Best test</dt>
          <dd>{s.best ? `${s.best.score}/${s.best.total}` : '–'}</dd>
        </div>
      </dl>

      <div className="actions">
        <a className="btn btn-primary" href={href(`${base}/learn`)}>
          📖 Learn
        </a>
        <a className="btn" href={href(`${base}/practice?mode=book`)}>
          ✏️ Practice
        </a>
        <a className="btn" href={href(`${base}/test`)}>
          ⏱ Quick test
        </a>
        <a className="btn" href={href(`${base}/classroom`)}>
          🧑‍🏫 Classroom
        </a>
      </div>
      {t.guessRule && (
        <a className="game-link" href={href(`${base}/rule`)}>
          <span aria-hidden>🔎</span>
          <span>
            <strong>Guess the rule</strong>
            <span className="muted">{t.guessRule.blurb}</span>
          </span>
          <span aria-hidden>→</span>
        </a>
      )}
      {p.mistakes.length > 0 && (
        <a className="mistakes-link" href={href(`${base}/practice?mode=mistakes`)}>
          Retry {p.mistakes.length} question{p.mistakes.length === 1 ? '' : 's'} you got wrong →
        </a>
      )}
    </section>
  )
}

export function Home() {
  return (
    <Page title="NMMS Prep" right={<ThemeSwitch />}>
      <section className="hero">
        <p className="eyebrow">Class 8 · National Means-cum-Merit Scholarship</p>
        <h2>Mental Ability Test practice</h2>
        <ul className="facts">
          <li>
            <strong>90</strong> questions
          </li>
          <li>
            <strong>1</strong> mark each
          </li>
          <li>
            Pass mark <strong>40%</strong>
          </li>
        </ul>
      </section>

      <h2 className="section-title">Ready to practise</h2>
      {READY_TOPICS.map((t) => (
        <TopicCard key={t.id} t={t} />
      ))}

      <h2 className="section-title">Coming soon</h2>
      <ul className="soon">
        {UPCOMING_MAT.map((c) => (
          <li key={c.chapter}>
            <ChapterArt chapter={c.chapter} size={42} />
            <span>
              <span className="muted">Ch {c.chapter}</span> {c.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="footnote muted">Questions come from the KSQAAC "Spardha Yashassu" NMMS study material (2022). Works offline once it has loaded.</p>
    </Page>
  )
}
