import { useCallback, useRef, useState } from 'react'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { SeriesView } from '../components/SeriesView'
import { TimerBadge } from '../components/Timer'
import { mmss, useCountdown } from '../lib/countdown'
import type { ReadyTopic } from '../data/topics'
import { recordAnswer, recordTest } from '../lib/progress'
import { href } from '../lib/router'
import { termsText } from '../lib/series'
import type { OptionKey, Question } from '../types'

const TOTAL = 15
const BOOK_SHARE = 10
const SECONDS = 15 * 60

function buildTest(topic: ReadyTopic): Question[] {
  const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x)
  const book = shuffle(topic.questions).slice(0, topic.generate ? BOOK_SHARE : TOTAL)
  const fresh = topic.generate ? Array.from({ length: TOTAL - book.length }, () => topic.generate!()) : []
  return shuffle([...book, ...fresh])
}

type Phase = 'intro' | 'running' | 'done'

export function QuickTest({ topic }: { topic: ReadyTopic }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [qs, setQs] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({})
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [open, setOpen] = useState<string | null>(null)
  const [usedSeconds, setUsedSeconds] = useState(0)
  const startedAt = useRef(0)
  // Guards against a double submit (button click racing the timer).
  const submitted = useRef(true)

  const submit = useCallback(() => {
    if (submitted.current) return
    submitted.current = true
    const used = Math.min(SECONDS, Math.round((Date.now() - startedAt.current) / 1000))
    setUsedSeconds(used)
    let score = 0
    for (const q of qs) {
      const a = answers[q.id]
      if (a === q.answer) score++
      if (a) recordAnswer(topic.id, q, a === q.answer)
    }
    recordTest(topic.id, { at: Date.now(), score, total: qs.length, seconds: used })
    setPhase('done')
    window.scrollTo(0, 0)
  }, [qs, answers, topic.id])

  const left = useCountdown(SECONDS, phase === 'running', attempt, submit)

  const start = () => {
    setQs(buildTest(topic))
    setAnswers({})
    setIndex(0)
    setOpen(null)
    setAttempt((a) => a + 1)
    startedAt.current = Date.now()
    submitted.current = false
    setPhase('running')
  }

  if (phase === 'intro')
    return (
      <Page title="Quick test" back="">
        <section className="card intro">
          <h2>{topic.name}: quick test</h2>
          <ul className="rules">
            <li>
              <strong>{TOTAL} questions</strong> in <strong>{SECONDS / 60} minutes</strong>. That's about 1 minute each, like the real exam.
            </li>
            <li>You can skip questions and come back to them.</li>
            <li>Answers and explanations are shown after you submit.</li>
            <li>The test submits itself when the time runs out.</li>
          </ul>
          <button className="btn btn-primary btn-lg" onClick={start}>
            Start test
          </button>
        </section>
      </Page>
    )

  if (phase === 'done') {
    const score = qs.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((100 * score) / qs.length)
    const skipped = qs.filter((q) => !answers[q.id]).length
    return (
      <Page title="Test results" back="">
        <section className="card result">
          <p className="big-score">
            {score}/{qs.length}
          </p>
          <p className="result-pct">{pct}%</p>
          <p className={pct >= 40 ? 'pass' : 'fail'}>
            {pct >= 75 ? 'Excellent work!' : pct >= 40 ? 'Above the 40% pass mark. Keep improving!' : 'Below the 40% pass mark. Review the explanations below and try again.'}
          </p>
          <p className="muted">
            Time used {mmss(usedSeconds)}
            {skipped > 0 && ` · ${skipped} skipped`}
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={start}>
              New test
            </button>
            <a className="btn" href={href(`t/${topic.id}/practice?mode=mistakes`)}>
              Retry mistakes
            </a>
          </div>
        </section>

        <h2 className="section-title">Review</h2>
        <ol className="review">
          {qs.map((q, i) => {
            const a = answers[q.id]
            const ok = a === q.answer
            return (
              <li key={q.id} className={`card review-item ${ok ? 'ok' : 'bad'}`}>
                <button className="review-head" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id}>
                  <span className="review-mark">{ok ? '✓' : a ? '✗' : '–'}</span>
                  <span className="review-q">
                    {i + 1}. {termsText(q.terms, q.layout)}
                  </span>
                  <span className="muted">{ok ? q.answer : `${a ?? 'skipped'} → ${q.answer}`}</span>
                </button>
                {open === q.id && (
                  <div className="review-body">
                    <Options q={q} chosen={a} reveal />
                    <Explanation q={q} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </Page>
    )
  }

  const q = qs[index]
  const answered = Object.keys(answers).length
  return (
    <Page title="Quick test" back="" right={<TimerBadge left={left} total={SECONDS} />}>
      <section className="card question">
        <div className="q-head">
          <span>
            Question {index + 1} of {qs.length}
          </span>
          <span className="muted">{answered} answered</span>
        </div>
        <SeriesView terms={q.terms} layout={q.layout} />
        <Options q={q} chosen={answers[q.id]} onPick={(k) => setAnswers((s) => ({ ...s, [q.id]: k }))} />
        <div className="nav-row">
          <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            ← Back
          </button>
          {index < qs.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => (answered < qs.length && !confirm(`${qs.length - answered} question(s) not answered. Submit anyway?`) ? null : submit())}>
              Submit
            </button>
          )}
        </div>
      </section>

      <nav className="palette" aria-label="Jump to question">
        {qs.map((x, i) => (
          <button key={x.id} className={`pal${answers[x.id] ? ' pal-done' : ''}${i === index ? ' pal-current' : ''}`} onClick={() => setIndex(i)} aria-label={`Question ${i + 1}${answers[x.id] ? ', answered' : ''}`}>
            {i + 1}
          </button>
        ))}
      </nav>
      <div className="submit-row">
        <button className="btn btn-ghost" onClick={() => confirm('Submit the test now?') && submit()}>
          Submit test
        </button>
      </div>
    </Page>
  )
}
