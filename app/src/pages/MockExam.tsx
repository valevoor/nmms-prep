import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BiLabel } from '../components/Bi'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { QuestionStem } from '../components/QuestionStem'
import { Rich } from '../components/Rich'
import { SatExplanation, SatQuestionBody } from '../components/SatQuestion'
import { TimerBadge } from '../components/Timer'
import { PAPER_FILES } from '../data/papers'
import { SAT_SUBJECTS, SAT_TOPICS, getSatTopic, satQuestionText, satSolved, satTopicName } from '../data/sat'
import { READY_TOPICS, askLabel, getTopic } from '../data/topics'
import { mmss } from '../lib/countdown'
import { useLocale, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { questionText } from '../lib/i18n/content'
import {
  LENGTHS,
  MOCK_TESTS,
  PASS_PERCENT,
  answerOf,
  available,
  bestOnPaper,
  byChapter,
  bySubject,
  byTest,
  itemTest,
  newMock,
  pauseCurrent,
  satRef,
  satSubjectOf,
  saveCurrent,
  saveResult,
  scoreMock,
  slowestChapter,
  useMockStore,
} from '../lib/mock'
import type { MockConfig, MockExam as Mock, MockItem, MockLength, MockResult, MockTest } from '../lib/mock'
import { recordAnswer, recordSatAnswer } from '../lib/progress'
import { href, useRoute } from '../lib/router'
import { termsText } from '../lib/series'
import type { OptionKey } from '../types'

const MOCK_PATH = href('mock')

/** MAT past papers, newest first. */
const PAPERS = [...PAPER_FILES].reverse()

/** MAT chapters in book order. */
const MAT_CHAPTERS = [...READY_TOPICS].sort((a, b) => a.chapter - b.chapter)

/** SAT topics that have questions with an answer, by subject. */
const SAT_BY_SUBJECT = SAT_SUBJECTS.map((s) => ({ subject: s, topics: SAT_TOPICS.filter((x) => x.subject === s && satSolved(x).length > 0) }))
const SAT_PICKABLE = SAT_BY_SUBJECT.flatMap((g) => g.topics.map((x) => x.id))

/** How many questions each real MAT paper asks here (those under review are left out). */
const PAPER_SIZE = Object.fromEntries(PAPERS.map((p) => [p.id, p.questions.filter((q) => q.topic && q.status !== 'needs-review').length]))

/** "MAT + SAT · Full paper · 5 chapters", for the result and the list of past exams. */
function describe(t: Dict, c: MockConfig): string {
  const parts = [c.tests.map((x) => x.toUpperCase()).join(' + ')]
  const paper = c.paper && !c.mat ? PAPER_FILES.find((p) => p.id === c.paper) : undefined
  if (paper) parts.push(t.mock.paperName(paper.year))
  else parts.push(t.mock.lengthName(c.length))
  const chosen = (c.tests.includes('mat') ? (c.mat?.length ?? 0) : 0) + (c.tests.includes('sat') ? (c.sat?.length ?? 0) : 0)
  if (c.mat || c.sat) parts.push(t.mock.chaptersCount(chosen))
  return parts.join(' · ')
}

/** A MAT chapter's or SAT topic's name. */
function topicName(t: Dict, lang: string, test: MockTest, id: string): string {
  if (test === 'sat') {
    const s = getSatTopic(id)
    return s ? satTopicName(s, lang) : id
  }
  const topic = getTopic(id)
  return topic ? (t.chapters[topic.chapter] ?? topic.name) : id
}

/** /mock: the start page, the exam in progress or the result of the one just finished. */
export function MockExam() {
  const { current, history, loaded } = useMockStore()
  if (!loaded) return <MockPage />
  if (current?.finished) return <Result m={current} />
  if (current?.running) return <Running m={current} />
  return <Start current={current} history={history} />
}

function MockPage({ children, right }: { children?: ReactNode; right?: ReactNode }) {
  const t = useT()
  return (
    <Page title={t.mock.title} back="mat" right={right} hideMock>
      {children}
    </Page>
  )
}

// ---------- start ----------

/** A list of tick boxes with Select all / Clear. */
function Picker({ title, items, chosen, onChange }: { title: string; items: { id: string; name: string }[]; chosen: string[]; onChange: (ids: string[]) => void }) {
  const t = useT()
  const ids = items.map((x) => x.id)
  const count = ids.filter((id) => chosen.includes(id)).length
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id])
  return (
    <details className="mock-picker" open={count > 0 || undefined}>
      <summary>
        <span>{title}</span>
        <span className="muted">{t.mock.chosenCount(count, ids.length)}</span>
      </summary>
      <div className="mock-picker-tools">
        <button type="button" onClick={() => onChange([...new Set([...chosen, ...ids])])}>
          {t.mock.selectAll}
        </button>
        <button type="button" onClick={() => onChange(chosen.filter((x) => !ids.includes(x)))}>
          {t.mock.clear}
        </button>
      </div>
      <ul>
        {items.map((x) => (
          <li key={x.id}>
            <label>
              <input type="checkbox" checked={chosen.includes(x.id)} onChange={() => toggle(x.id)} />
              <span>{x.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  )
}

function Start({ current, history }: { current: Mock | null; history: MockResult[] }) {
  const t = useT()
  const lang = useLocale()
  // Opened from a SAT page, the SAT test is ticked; otherwise MAT.
  const from = useRoute().query.get('test')
  const [tests, setTests] = useState<MockTest[]>(from === 'sat' ? ['sat'] : ['mat'])
  const [some, setSome] = useState(false)
  const [mat, setMat] = useState<string[]>([])
  const [sat, setSat] = useState<string[]>([])
  const [paper, setPaper] = useState<'mixed' | string>('mixed')
  const [length, setLength] = useState<MockLength>(90)
  const [morePapers, setMorePapers] = useState(false)
  const [replace, setReplace] = useState(false)

  const hasMat = tests.includes('mat')
  const hasSat = tests.includes('sat')
  const papersOffered = hasMat && !hasSat && !some
  const realPaper = papersOffered && paper !== 'mixed'
  const config: MockConfig = {
    tests,
    length,
    ...(some && hasMat ? { mat } : {}),
    ...(some && hasSat ? { sat } : {}),
    ...(realPaper ? { paper } : {}),
  }
  const missing = some ? tests.filter((x) => (x === 'mat' ? mat : sat).length === 0) : []
  // Questions per test: the length, or fewer when the chosen chapters run out.
  const counts = tests.map((x) => (realPaper ? PAPER_SIZE[paper] : some ? Math.min(length, available(x, x === 'mat' ? mat : sat)) : length))
  const total = counts.reduce((s, n) => s + n, 0)
  const minutes = realPaper ? 90 : total
  const short = some && missing.length === 0 && counts.some((n) => n < length)

  const toggleTest = (x: MockTest) => {
    const next = tests.includes(x) ? tests.filter((y) => y !== x) : MOCK_TESTS.filter((y) => y === x || tests.includes(y))
    if (next.length) setTests(next)
  }
  const start = () => saveCurrent({ ...newMock(config), running: true })
  const resume = () => current && saveCurrent({ ...current, running: true })
  const mine = [...history].reverse().slice(0, 5)

  return (
    <MockPage>
      {current && (
        <section className="card mock-resume">
          <h2>{t.mock.resumeTitle}</h2>
          <p className="muted">
            {describe(t, current.config)} · {t.mock.resumeLine(current.answers.filter(Boolean).length, current.items.length, mmss(current.seconds - current.used))}
          </p>
          <div className="actions">
            <button className="btn btn-primary btn-lg" onClick={resume}>
              {t.mock.resume}
            </button>
          </div>
        </section>
      )}

      <section className="card intro">
        <h2>{t.mock.heading}</h2>
        <p className="muted">{t.mock.lead}</p>
        <ul className="facts">
          {t.mock.facts(PASS_PERCENT).map((f) => (
            <li key={f.join()}>
              <Rich parts={f} />
            </li>
          ))}
        </ul>
      </section>

      <fieldset className="card mock-choice">
        <legend className="section-title">{t.mock.whichTest}</legend>
        <div className="mock-length">
          {MOCK_TESTS.map((x) => (
            <label key={x} className={`mock-option${tests.includes(x) ? ' on' : ''}`}>
              <input type="checkbox" checked={tests.includes(x)} onChange={() => toggleTest(x)} />
              <span>
                <strong>{x.toUpperCase()}</strong>
                <span className="muted">{x === 'mat' ? t.mock.matSub : t.mock.satSub}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="card mock-choice">
        <legend className="section-title">{t.mock.whichChapters}</legend>
        {[false, true].map((s) => (
          <label key={String(s)} className={`mock-option${some === s ? ' on' : ''}`}>
            <input type="radio" name="mock-some" checked={some === s} onChange={() => setSome(s)} />
            <span>
              <strong>{s ? t.mock.chooseChapters : t.mock.allChapters}</strong>
              <span className="muted">{s ? t.mock.chooseSub : t.mock.allSub}</span>
            </span>
          </label>
        ))}
        {some && (
          <div className="mock-pickers">
            {hasMat && (
              <Picker
                title={t.mock.matChapters}
                items={MAT_CHAPTERS.map((c) => ({ id: c.id, name: `${t.common.chapterShort(c.chapter)} ${t.chapters[c.chapter] ?? c.name}` }))}
                chosen={mat}
                onChange={setMat}
              />
            )}
            {hasSat &&
              SAT_BY_SUBJECT.map((g) => (
                <Picker
                  key={g.subject}
                  title={`SAT · ${t.sat.subjects[g.subject]}`}
                  items={g.topics.map((x) => ({ id: x.id, name: satTopicName(x, lang) }))}
                  chosen={sat.filter((id) => SAT_PICKABLE.includes(id))}
                  onChange={(ids) => setSat([...sat.filter((id) => !g.topics.some((x) => x.id === id)), ...ids.filter((id) => g.topics.some((x) => x.id === id))])}
                />
              ))}
          </div>
        )}
      </fieldset>

      {papersOffered && (
        <fieldset className="card mock-choice">
          <legend className="section-title">{t.mock.whichPaper}</legend>
          <label className={`mock-option${paper === 'mixed' ? ' on' : ''}`}>
            <input type="radio" name="mock-paper" checked={paper === 'mixed'} onChange={() => setPaper('mixed')} />
            <span>
              <strong>{t.mock.mixed}</strong>
              <span className="muted">{t.mock.mixedSub}</span>
            </span>
          </label>
          {(morePapers ? PAPERS : PAPERS.slice(0, 2)).map((p) => {
            const best = bestOnPaper(history, p.id)
            return (
              <label key={p.id} className={`mock-option${paper === p.id ? ' on' : ''}`}>
                <input type="radio" name="mock-paper" checked={paper === p.id} onChange={() => setPaper(p.id)} />
                <span>
                  <strong>{t.mock.paperName(p.year)}</strong>
                  <span className={best ? 'mock-done' : 'muted'}>{best ? t.mock.paperDone(best.score, best.total) : t.mock.paperSub(PAPER_SIZE[p.id])}</span>
                </span>
              </label>
            )
          })}
          {!morePapers && PAPERS.length > 2 && (
            <button type="button" className="mock-more" onClick={() => setMorePapers(true)}>
              {t.mock.morePapers(PAPERS.length - 2, PAPERS[PAPERS.length - 1].year, PAPERS[2].year)}
            </button>
          )}
        </fieldset>
      )}

      {!realPaper && (
        <fieldset className="card mock-choice">
          <legend className="section-title">{t.mock.howLong}</legend>
          <div className="mock-lengths">
            {LENGTHS.map((n) => (
              <label key={n} className={`mock-option${length === n ? ' on' : ''}`}>
                <input type="radio" name="mock-length" checked={length === n} onChange={() => setLength(n)} />
                <span>
                  <strong>{t.mock.lengthName(n)}</strong>
                  <span className="muted">{t.mock.lengthSub(n, tests.length > 1)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {missing.length > 0 && <p className="mock-warn">{t.mock.noneChosen(missing.map((x) => x.toUpperCase()).join(', '))}</p>}
      {short && <p className="mock-warn">{t.mock.fewer(total)}</p>}

      {replace ? (
        <section className="card mock-confirm" role="alertdialog" aria-labelledby="mock-replace">
          <h3 id="mock-replace">{t.mock.replaceTitle}</h3>
          <p className="muted">{t.mock.replaceBody}</p>
          <div className="nav-row">
            <button className="btn" onClick={() => setReplace(false)}>
              {t.mock.cancel}
            </button>
            <button className="btn btn-primary" onClick={start}>
              {t.mock.startNew}
            </button>
          </div>
        </section>
      ) : (
        <button className="btn btn-primary btn-lg mock-start" disabled={missing.length > 0 || total === 0} onClick={() => (current ? setReplace(true) : start())}>
          {t.mock.start(total, minutes)}
        </button>
      )}
      <p className="muted mock-note">{t.mock.savedNote}</p>

      {mine.length > 0 && (
        <>
          <h2 className="section-title">{t.mock.past}</h2>
          <ul className="card mock-history">
            {mine.map((r) => (
              <li key={r.at}>
                <span>
                  {describe(t, r.config)}
                  <span className="muted"> · {new Date(r.at).toLocaleDateString()}</span>
                </span>
                <strong className={r.parts.every((p) => (100 * p.score) / p.total >= PASS_PERCENT) ? 'pass' : 'fail'}>
                  {r.score}/{r.total}
                </strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </MockPage>
  )
}

// ---------- running ----------

/** Records a finished exam's answers in each chapter's or topic's progress. */
function recordAll(m: Mock) {
  m.items.forEach((x, i) => {
    const a = m.answers[i]
    if (!a) return
    const ok = a === answerOf(x)
    if (x.q) recordAnswer(x.topic, x.q, ok)
    else if (x.sat) recordSatAnswer(x.topic, x.sat.id, ok)
  })
}

function Running({ m }: { m: Mock }) {
  const t = useT()
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const ref = useRef(m)
  useLayoutEffect(() => {
    ref.current = m
  })

  const submit = () => {
    const done = ref.current
    recordAll(done)
    saveResult({ config: done.config, at: Date.now(), score: scoreMock(done), total: done.items.length, seconds: done.used, parts: byTest(done) })
    saveCurrent({ ...done, running: false, finished: Date.now() })
    window.scrollTo(0, 0)
  }

  // The clock runs only while this page is open and on screen. Saved to storage every few seconds.
  useEffect(() => {
    let last = Date.now()
    let ticks = 0
    const tick = () => {
      const now = Date.now()
      const delta = document.hidden ? 0 : Math.min(2, Math.round((now - last) / 1000))
      last = now
      if (delta === 0) return
      const cur = ref.current
      const used = Math.min(cur.seconds, cur.used + delta)
      const spent = cur.spent.slice()
      spent[cur.index] += delta
      ticks++
      saveCurrent({ ...cur, used, spent }, ticks % 5 === 0)
      if (used >= cur.seconds) submit()
    }
    const timer = setInterval(tick, 1000)
    // Closing the tab or app keeps the latest seconds and answers.
    const hide = () => saveCurrent(ref.current)
    window.addEventListener('pagehide', hide)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', hide)
      // Pause only when the student has really left the page (StrictMode also runs this on mount).
      setTimeout(() => {
        if (window.location.pathname !== MOCK_PATH) pauseCurrent()
      })
    }
    // submit reads the latest exam through ref, so the clock is set up once.
  }, [])

  const item = m.items[m.index]
  const answered = m.answers.filter(Boolean).length
  const go = (index: number) => {
    saveCurrent({ ...m, index })
    window.scrollTo(0, 0)
  }
  const pick = (k: OptionKey) => {
    const answers = m.answers.slice()
    answers[m.index] = k
    saveCurrent({ ...m, answers })
  }
  const mark = () => {
    const marked = m.marked.slice()
    marked[m.index] = !marked[m.index]
    saveCurrent({ ...m, marked })
  }
  const both = m.config.tests.length > 1

  return (
    <MockPage right={<TimerBadge left={m.seconds - m.used} total={m.seconds} />}>
      <div className="meter mock-clock" role="img" aria-label={t.mock.timeUsed(mmss(m.used), mmss(m.seconds))}>
        <div className="meter-fill" style={{ width: `${(100 * m.used) / m.seconds}%` }} />
      </div>
      <section className="card question" key={m.index}>
        <div className="q-head">
          <span>{t.test.questionOf(m.index + 1, m.items.length)}</span>
          <span className="muted">{t.test.answered(answered)}</span>
        </div>
        <ItemQuestion item={item} chosen={m.answers[m.index] ?? undefined} onPick={pick} showTest={both} />
        <button type="button" className={`mock-mark${m.marked[m.index] ? ' on' : ''}`} aria-pressed={m.marked[m.index]} onClick={mark}>
          {m.marked[m.index] ? t.mock.marked : t.mock.mark}
        </button>
        <div className="nav-row">
          <button className="btn" disabled={m.index === 0} onClick={() => go(m.index - 1)}>
            {t.test.back}
          </button>
          {m.index < m.items.length - 1 ? (
            <button className="btn btn-primary" onClick={() => go(m.index + 1)}>
              {t.common.next}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setConfirmSubmit(true)}>
              {t.test.submit}
            </button>
          )}
        </div>
      </section>

      <section className="card mock-grid">
        <h2>{t.mock.goTo}</h2>
        <p className="mock-key muted">
          <span className="pal-done" /> {t.mock.keyAnswered} <span className="pal-marked" /> {t.mock.keyMarked}
        </p>
        <nav className="palette" aria-label={t.test.jump}>
          {m.items.map((x, i) => (
            <button
              key={i}
              className={`pal${m.answers[i] ? ' pal-done' : ''}${m.marked[i] ? ' pal-marked' : ''}${i === m.index ? ' pal-current' : ''}${both && i > 0 && itemTest(x) !== itemTest(m.items[i - 1]) ? ' pal-break' : ''}`}
              onClick={() => go(i)}
              aria-label={t.mock.palette(i + 1, !!m.answers[i], m.marked[i])}
              aria-current={i === m.index ? 'step' : undefined}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </section>

      {confirmSubmit ? (
        <section className="card mock-confirm" role="alertdialog" aria-labelledby="mock-submit">
          <h3 id="mock-submit">{t.mock.submitTitle}</h3>
          <p className="muted">
            {answered < m.items.length ? t.mock.submitUnanswered(m.items.length - answered) : t.mock.submitAll}
            {m.marked.some(Boolean) && ` ${t.mock.submitMarked(m.marked.filter(Boolean).length)}`}
          </p>
          <div className="nav-row">
            <button className="btn" onClick={() => setConfirmSubmit(false)}>
              {t.mock.keepGoing}
            </button>
            <button className="btn btn-primary" onClick={submit}>
              {t.test.submit}
            </button>
          </div>
        </section>
      ) : (
        <div className="submit-row">
          <button className="btn btn-ghost" onClick={() => setConfirmSubmit(true)}>
            {t.mock.submitExam}
          </button>
        </div>
      )}
      <p className="muted mock-note">{t.mock.leaveNote}</p>
    </MockPage>
  )
}

/** A question while it is being answered (`chosen` can change), or in the review (`review`: right answer shown). */
function ItemQuestion({ item, chosen, onPick, review, showTest }: { item: MockItem; chosen?: OptionKey; onPick?: (k: OptionKey) => void; review?: boolean; showTest?: boolean }) {
  const t = useT()
  const tag = showTest ? `${itemTest(item).toUpperCase()} · ` : ''
  if (item.q) {
    const topic = getTopic(item.topic)!
    return (
      <>
        {!review && (
          <p className="q-ask muted">
            {tag}
            <BiLabel get={(d) => askLabel(d, topic)} />
          </p>
        )}
        {(!review || item.q.figures) && <QuestionStem q={item.q} />}
        <Options q={item.q} chosen={chosen} onPick={onPick} reveal={review} />
        {review && <Explanation q={item.q} />}
      </>
    )
  }
  const r = satRef(item)!
  return (
    <>
      {!review && (
        <p className="q-ask muted">
          {tag}
          {t.sat.subjects[satSubjectOf(item)!]}
        </p>
      )}
      <SatQuestionBody paper={r.paper} q={r.q} chosen={chosen} onPick={onPick ?? (() => {})} mode={review ? 'review' : 'exam'} />
      {review && <SatExplanation paper={r.paper} q={r.q} />}
    </>
  )
}

// ---------- result ----------

/** One line naming a question in the review list. */
function itemLine(t: Dict, locale: 'en' | 'kn', item: MockItem): string {
  if (item.q) return item.q.figures ? t.common.pictureQuestion : item.q.layout === 'text' ? (questionText(item.q, locale).prompt ?? '') : termsText(item.q.terms, item.q.layout)
  const r = satRef(item)!
  return satQuestionText(r.paper, r.q, locale).prompt.split('\n')[0]
}

function Result({ m }: { m: Mock }) {
  const t = useT()
  const locale = useLocale()
  const [open, setOpen] = useState<number | null>(null)
  const [allRows, setAllRows] = useState(false)
  const score = scoreMock(m)
  const pct = Math.round((100 * score) / m.items.length)
  const skipped = m.answers.filter((a) => !a).length
  const tests = byTest(m)
  const subjects = bySubject(m)
  const rows = byChapter(m)
  const slow = slowestChapter(m)
  const shown = allRows ? rows : rows.slice(0, 6)
  const passed = tests.every((r) => (100 * r.score) / r.total >= PASS_PERCENT)

  return (
    <Page title={t.mock.resultTitle} back="mat" hideMock>
      <section className="card result">
        <p className="muted">{describe(t, m.config)}</p>
        <p className="big-score">
          {score}/{m.items.length}
        </p>
        <p className="result-pct">{pct}%</p>
        {tests.length > 1 ? (
          <dl className="stats mock-tests">
            {tests.map((r) => (
              <div key={r.test}>
                <dt>{r.test.toUpperCase()}</dt>
                <dd className={(100 * r.score) / r.total >= PASS_PERCENT ? 'mock-pass-ok' : 'mock-pass-no'}>
                  {r.score}/{r.total}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="meter mock-pass" role="img" aria-label={t.mock.passBar(pct, PASS_PERCENT)}>
            <div className="meter-fill" style={{ width: `${pct}%` }} />
            <span className="mock-pass-line" style={{ left: `${PASS_PERCENT}%` }} />
          </div>
        )}
        <p className={passed ? 'pass' : 'fail'}>{tests.length > 1 ? (passed ? t.mock.passedBoth : t.mock.failedBoth(PASS_PERCENT)) : pct >= 75 ? t.test.excellent : passed ? t.test.abovePass : t.test.belowPass}</p>
        <p className="muted">
          {t.mock.timeUsed(mmss(m.used), mmss(m.seconds))}
          {skipped > 0 && t.test.skippedCount(skipped)}
        </p>
      </section>

      {subjects.length > 1 && (
        <section className="card mock-subjects">
          <h2>{t.mock.bySubject}</h2>
          <dl className="stats">
            {subjects.map((r) => (
              <div key={r.subject}>
                <dt>{t.sat.subjects[r.subject]}</dt>
                <dd>
                  {r.right}/{r.total}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="card mock-chapters">
        <h2>{t.mock.byChapter}</h2>
        <p className="muted">{t.mock.byChapterSub}</p>
        <ul>
          {shown.map((r) => {
            const p = r.right / r.total
            return (
              <li key={`${r.test}/${r.topic}`}>
                <a href={href(`${r.test}/${r.topic}`)}>
                  <span className="mock-ch-name">
                    {tests.length > 1 && <span className="muted">{r.test.toUpperCase()} · </span>}
                    {topicName(t, locale, r.test, r.topic)}
                  </span>
                  <span className="mock-ch-score">
                    {r.right}/{r.total}
                  </span>
                  <span className="meter meter-thin">
                    <span className={`meter-fill${p < 0.4 ? ' mock-weak' : p < 0.7 ? ' mock-mid' : ''}`} style={{ width: `${100 * p}%` }} />
                  </span>
                  <span className="chapter-row-go" aria-hidden>
                    →
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
        {!allRows && rows.length > shown.length && (
          <button type="button" className="mock-more" onClick={() => setAllRows(true)}>
            {t.mock.allRows(rows.length)}
          </button>
        )}
      </section>

      {slow && (
        <section className="card trick-card warn">
          <h3>{t.mock.slowTitle}</h3>
          <p>{t.mock.slowBody(topicName(t, locale, slow.test, slow.topic), mmss(slow.perQuestion), mmss(Math.round(m.seconds / m.items.length)))}</p>
        </section>
      )}

      <div className="actions mock-actions">
        <button className="btn btn-primary" onClick={() => saveCurrent(null)}>
          {t.mock.newMock}
        </button>
      </div>

      <h2 className="section-title">{t.test.review}</h2>
      <ol className="review">
        {m.items.map((x, i) => {
          const a = m.answers[i]
          const right = answerOf(x)
          const ok = a === right
          return (
            <li key={i} className={`card review-item ${ok ? 'ok' : 'bad'}`}>
              <button className="review-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className="review-mark">{ok ? '✓' : a ? '✗' : '–'}</span>
                <span className="review-q">
                  {i + 1}. {itemLine(t, locale, x)}
                </span>
                <span className="muted">{ok ? right : `${a ?? t.test.skipped} → ${right}`}</span>
              </button>
              {open === i && (
                <div className="review-body">
                  <ItemQuestion item={x} chosen={a ?? undefined} review />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </Page>
  )
}
