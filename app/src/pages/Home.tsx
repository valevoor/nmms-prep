import { ChapterArt } from '../components/ChapterArt'
import { LangSwitch } from '../components/LangSwitch'
import { Page } from '../components/Page'
import { Rich } from '../components/Rich'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { READY_TOPICS, UPCOMING_MAT, getTopic } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useLocale, useT } from '../lib/i18n'
import { getLastTopic } from '../lib/lastTopic'
import { summarize, useProgress } from '../lib/progress'
import { href, useRoute } from '../lib/router'
import { SAT_SUBJECTS, SAT_TOPICS, satQuestionCount, satTopicName } from '../data/sat'
import type { SatTopic } from '../data/sat'
import type { Dict } from '../lib/i18n'

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

/** "Class 7 · Ch 13, 14" or, across classes, "Class 7 · Ch 11 + Class 8 · Ch 10". */
function chapterRefs(t: Dict, topic: SatTopic): string {
  if (topic.chapters.length === 0) return t.sat.uncategorizedRefs
  const classes = [...new Set(topic.chapters.map((c) => c.cls))]
  return classes
    .map((cls) =>
      t.sat.classCh(
        cls,
        topic.chapters
          .filter((c) => c.cls === cls)
          .map((c) => c.no)
          .join(', '),
      ),
    )
    .join(' + ')
}

function SatRow({ topic }: { topic: SatTopic }) {
  const t = useT()
  const lang = useLocale()
  const n = satQuestionCount(topic)
  return (
    <li>
      <a className="chapter-row sat-row" href={href(`sat/${topic.id}`)}>
        <span className="chapter-row-main">
          <span className="chapter-row-name">{satTopicName(topic, lang)}</span>
          <span className="muted sat-row-refs">{chapterRefs(t, topic)}</span>
        </span>
        <span className="q-badge" aria-label={t.sat.qCountLabel(n)}>
          {t.sat.qCount(n)}
        </span>
        <span className="chapter-row-go" aria-hidden>
          →
        </span>
      </a>
    </li>
  )
}

/** Scrolls a subject's section to just below the sticky top bar (its height changes with the screen width). */
function scrollToSubject(subject: string) {
  const el = document.getElementById(`sat-${subject}`)
  if (!el) return
  const bar = document.querySelector<HTMLElement>('.topbar')?.offsetHeight ?? 0
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - bar - 8, behavior: 'smooth' })
}

/** Home's SAT tab: the topics (chapters, some combined) that past papers asked about, by subject. */
function SatHome() {
  const t = useT()
  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t.home.eyebrow}</p>
        <h2>{t.sat.heading}</h2>
        <ul className="facts">
          {t.sat.facts.map((f) => (
            <li key={f.join()}>
              <Rich parts={f} />
            </li>
          ))}
        </ul>
        <nav className="sat-jump" aria-label={t.sat.jumpLabel}>
          {SAT_SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => scrollToSubject(s)}
            >
              {t.sat.subjects[s]}
            </button>
          ))}
        </nav>
      </section>
      {SAT_SUBJECTS.map((s) => {
        const list = SAT_TOPICS.filter((x) => x.subject === s)
        return (
          <section key={s} id={`sat-${s}`}>
            <h2 className="section-title">
              {t.sat.subjects[s]} <span className="muted section-count">· {t.sat.topicCount(list.length)}</span>
            </h2>
            <ul className="chapter-list">
              {list.map((x) => (
                <SatRow key={x.id} topic={x} />
              ))}
            </ul>
          </section>
        )
      })}
      <p className="footnote muted">{t.sat.footnote}</p>
    </>
  )
}

function TestSwitch({ sat }: { sat: boolean }) {
  const t = useT()
  return (
    <nav className="seg test-switch" aria-label={t.sat.tabsLabel}>
      <a className={sat ? undefined : 'on'} href={href('')} aria-current={sat ? undefined : 'page'}>
        {t.sat.tabMat}
      </a>
      <a className={sat ? 'on' : undefined} href={href('?test=sat')} aria-current={sat ? 'page' : undefined}>
        {t.sat.tabSat}
      </a>
    </nav>
  )
}

export function Home() {
  const t = useT()
  const sat = useRoute().query.get('test') === 'sat'
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
      <TestSwitch sat={sat} />
      {sat ? (
        <SatHome />
      ) : (
        <>
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

          <a className="card facts-card" href={href('facts')}>
            <span className="facts-card-icon" aria-hidden>
              📘
            </span>
            <span className="continue-main">
              <span className="continue-name">{t.facts.title}</span>
              <span className="muted facts-card-sub">{t.facts.homeSub}</span>
            </span>
            <span aria-hidden>→</span>
          </a>

          <a className="card facts-card shapes-card" href={href('shapes')}>
            <span className="facts-card-icon" aria-hidden>
              <svg viewBox="0 0 40 40">
                <path
                  d="M8 14 L20 8 L32 14 L32 28 L20 34 L8 28 Z"
                  style={{ fill: 'var(--shape-blue)', fillOpacity: 0.2, stroke: 'var(--shape-blue-line)', strokeWidth: 2.2, strokeLinejoin: 'round' }}
                />
                <path
                  d="M8 14 L20 20 L32 14 M20 20 V34"
                  style={{ fill: 'none', stroke: 'var(--shape-blue-line)', strokeWidth: 2.2, strokeLinejoin: 'round' }}
                />
              </svg>
            </span>
            <span className="continue-main">
              <span className="continue-name">{t.shapes.title}</span>
              <span className="muted facts-card-sub">{t.shapes.homeSub}</span>
            </span>
            <span aria-hidden>→</span>
          </a>

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
        </>
      )}
    </Page>
  )
}
