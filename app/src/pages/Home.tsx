import { useState } from 'react'
import { ChapterArt } from '../components/ChapterArt'
import { LangSwitch } from '../components/LangSwitch'
import { Page } from '../components/Page'
import { Rich } from '../components/Rich'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { READY_TOPICS, UPCOMING_MAT, getTopic } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useLocale, useT } from '../lib/i18n'
import { getLastTopic } from '../lib/lastTopic'
import { mastery, satKey, satMastery, satMistakes, useProgress } from '../lib/progress'
import { href, useRoute } from '../lib/router'
import { pastStats } from '../data/papers'
import { SAT_SUBJECTS, SAT_TOPICS, satPastStats, satSolved, satTopicName } from '../data/sat'
import type { SatTopic } from '../data/sat'
import type { Dict } from '../lib/i18n'

/** Chapters in book order, not the order they were added. */
const BY_CHAPTER = [...READY_TOPICS].sort((a, b) => a.chapter - b.chapter)

const PAST = Object.fromEntries(READY_TOPICS.map((t) => [t.id, pastStats(t.id)]))

/** Most past-paper questions first; ties go to the chapter asked in more years, then book order. */
const BY_ASKED = [...BY_CHAPTER].sort(
  (a, b) => PAST[b.id].questions - PAST[a.id].questions || PAST[b.id].years - PAST[a.id].years || a.chapter - b.chapter,
)

type Sort = 'book' | 'asked'
const SORT_KEY = 'nmms-home-sort'

function getSort(): Sort {
  try {
    return localStorage.getItem(SORT_KEY) === 'asked' ? 'asked' : 'book'
  } catch {
    // Storage blocked (private mode): book order.
    return 'book'
  }
}

function saveSort(s: Sort) {
  try {
    localStorage.setItem(SORT_KEY, s)
  } catch {
    // Not saved; Home opens in book order next time.
  }
}

function ChapterRow({ t }: { t: ReadyTopic }) {
  const tr = useT()
  const p = useProgress(t.id)
  const m = mastery(p, t)
  const past = PAST[t.id]
  return (
    <li>
      <a className="chapter-row" href={href(`t/${t.id}`)}>
        <ChapterArt chapter={t.chapter} size={40} />
        <span className="chapter-row-main">
          <span className="chapter-row-name">
            <span className="muted">{tr.common.chapterShort(t.chapter)}</span> {tr.chapters[t.chapter] ?? t.name}
          </span>
          <span className="meter meter-thin" role="img" aria-label={m.exam ? tr.home.examCorrect(m.right, m.total) : tr.home.bookCorrect(m.right, m.total)}>
            <span className="meter-fill" style={{ width: `${m.total ? (100 * m.right) / m.total : 0}%` }} />
          </span>
          {past.questions > 0 && (
            <span className="muted past-line">
              <Rich parts={tr.home.pastLine(past.questions, past.years, past.papers)} />
            </span>
          )}
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

function SortSwitch({ sort, onChange }: { sort: Sort; onChange: (s: Sort) => void }) {
  const t = useT()
  const options: [Sort, string][] = [
    ['book', t.home.sortBook],
    ['asked', t.home.sortMost],
  ]
  return (
    <div className="seg sort-switch" role="group" aria-label={t.home.sortLabel}>
      {options.map(([id, label]) => (
        <button key={id} type="button" className={sort === id ? 'on' : undefined} aria-pressed={sort === id} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
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
  const past = SAT_PAST[topic.id]
  const solved = SAT_SOLVED[topic.id]
  const p = useProgress(satKey(topic.id))
  const m = satMastery(p, solved)
  const wrong = satMistakes(p, solved).length
  return (
    <li>
      <a className="chapter-row sat-row" href={href(`sat/${topic.id}`)}>
        <span className="chapter-row-main">
          <span className="chapter-row-name">{satTopicName(topic, lang)}</span>
          <span className="muted sat-row-refs">{chapterRefs(t, topic)}</span>
          {solved.length > 0 && (
            <span className="meter meter-thin" role="img" aria-label={t.home.examCorrect(m.right, m.total)}>
              <span className="meter-fill" style={{ width: `${(100 * m.right) / m.total}%` }} />
            </span>
          )}
          <span className="muted past-line">
            <Rich parts={t.home.pastLine(past.questions, past.years, past.papers)} />
          </span>
        </span>
        {wrong > 0 && (
          <span className="row-badge" aria-label={t.home.wrongCount(wrong)}>
            {wrong}
          </span>
        )}
        <span className="chapter-row-go" aria-hidden>
          →
        </span>
      </a>
    </li>
  )
}

const SAT_SOLVED = Object.fromEntries(SAT_TOPICS.map((x) => [x.id, satSolved(x)]))
const SAT_PAST = Object.fromEntries(SAT_TOPICS.map((x) => [x.id, satPastStats(x)]))

/**
 * A subject's topics in the chosen order. Most asked sorts the textbook topics by past-paper questions (ties: more
 * years, then textbook order); the old-syllabus and Uncategorized topics stay at the end, as they aren't in the textbooks.
 */
function subjectTopics(subject: string, sort: Sort): SatTopic[] {
  const list = SAT_TOPICS.filter((x) => x.subject === subject)
  if (sort === 'book') return list
  const textbook = list.filter((x) => x.chapters.length > 0)
  const asked = [...textbook].sort((a, b) => SAT_PAST[b.id].questions - SAT_PAST[a.id].questions || SAT_PAST[b.id].years - SAT_PAST[a.id].years)
  return [...asked, ...list.filter((x) => x.chapters.length === 0)]
}

/** Scrolls a subject's section to just below the sticky top bar (its height changes with the screen width). */
function scrollToSubject(subject: string) {
  const el = document.getElementById(`sat-${subject}`)
  if (!el) return
  const bar = document.querySelector<HTMLElement>('.topbar')?.offsetHeight ?? 0
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - bar - 8, behavior: 'smooth' })
}

/** Home's SAT tab: the topics (chapters, some combined) that past papers asked about, by subject. */
function SatHome({ sort, onSort }: { sort: Sort; onSort: (s: Sort) => void }) {
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
      <SortSwitch sort={sort} onChange={onSort} />
      {SAT_SUBJECTS.map((s) => {
        const list = subjectTopics(s, sort)
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
  const [sort, setSort] = useState(getSort)
  const changeSort = (s: Sort) => {
    setSort(s)
    saveSort(s)
  }
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
        <SatHome sort={sort} onSort={changeSort} />
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
          <SortSwitch sort={sort} onChange={changeSort} />
          <ul className="chapter-list">
            {(sort === 'asked' ? BY_ASKED : BY_CHAPTER).map((x) => (
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
