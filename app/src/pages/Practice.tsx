import { useMemo, useState } from 'react'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { SeriesView } from '../components/SeriesView'
import type { ReadyTopic } from '../data/topics'
import { recordAnswer, useProgress } from '../lib/progress'
import { href } from '../lib/router'
import type { OptionKey, Question } from '../types'

export type PracticeMode = 'book' | 'more' | 'mistakes'

const TITLES: Record<PracticeMode, string> = {
  book: 'Book',
  more: 'More practice',
  mistakes: 'Mistakes',
}

export function Practice({ topic, mode }: { topic: ReadyTopic; mode: PracticeMode }) {
  const progress = useProgress(topic.id)
  const [extra, setExtra] = useState<Question[]>(() => (mode === 'more' && topic.generate ? [topic.generate()] : []))
  // The mistakes list is frozen at the first answer, so it doesn't shrink under the student mid-session.
  const [frozen, setFrozen] = useState<Question[] | null>(null)
  const live = mode === 'book' ? topic.questions : mode === 'mistakes' ? progress.mistakes : extra
  const queue = mode === 'more' ? extra : (frozen ?? live)

  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<OptionKey | undefined>()
  const [score, setScore] = useState({ right: 0, done: 0 })

  const q = queue[index]
  const finished = mode !== 'more' && index >= queue.length
  const correct = chosen !== undefined && chosen === q?.answer

  const pick = (k: OptionKey) => {
    if (chosen || !q) return
    if (!frozen) setFrozen(queue)
    setChosen(k)
    const ok = k === q.answer
    recordAnswer(topic.id, q, ok)
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), done: s.done + 1 }))
  }

  const next = () => {
    if (mode === 'more' && topic.generate) setExtra((e) => [...e, topic.generate!()])
    setIndex((i) => i + 1)
    setChosen(undefined)
    window.scrollTo(0, 0)
  }

  const restart = () => {
    setFrozen(null)
    setIndex(0)
    setChosen(undefined)
    setScore({ right: 0, done: 0 })
  }

  const counter = mode === 'more' ? `${score.right}/${score.done} right` : `${Math.min(index + 1, queue.length)} / ${queue.length}`
  const tabs = useMemo(
    () =>
      (['book', 'more', 'mistakes'] as PracticeMode[]).map((m) => (
        <a key={m} className={`tab${m === mode ? ' tab-active' : ''}`} href={href(`t/${topic.id}/practice?mode=${m}`)} aria-current={m === mode ? 'page' : undefined}>
          {TITLES[m]}
        </a>
      )),
    [mode, topic.id],
  )

  return (
    <Page title={topic.name} back="" right={<span className="counter">{counter}</span>}>
      <nav className="tabs" aria-label="Practice mode">
        {tabs}
      </nav>

      {queue.length === 0 ? (
        <section className="card empty">
          <h3>No mistakes to retry 🎉</h3>
          <p className="muted">Questions you get wrong will show up here, so you can try them again.</p>
          <a className="btn btn-primary" href={href(`t/${topic.id}/practice?mode=book`)}>
            Practise book questions
          </a>
        </section>
      ) : finished ? (
        <section className="card done">
          <p className="big-score">
            {score.right}/{score.done}
          </p>
          <h3>{score.right === score.done ? 'Perfect! Every answer right.' : 'Well done. Keep going!'}</h3>
          <div className="actions">
            {progress.mistakes.length > 0 &&
              (mode === 'mistakes' ? (
                <button className="btn btn-primary" onClick={restart}>
                  Retry {progress.mistakes.length} mistake{progress.mistakes.length === 1 ? '' : 's'}
                </button>
              ) : (
                <a className="btn btn-primary" href={href(`t/${topic.id}/practice?mode=mistakes`)}>
                  Retry {progress.mistakes.length} mistake{progress.mistakes.length === 1 ? '' : 's'}
                </a>
              ))}
            {mode === 'book' && (
              <button className="btn" onClick={restart}>
                Do the book questions again
              </button>
            )}
            <a className="btn" href={href(`t/${topic.id}/practice?mode=more`)}>
              More practice questions
            </a>
            <a className="btn" href={href(`t/${topic.id}/test`)}>
              Take a quick test
            </a>
          </div>
        </section>
      ) : (
        <section className="card question" key={q.id}>
          <div className="q-head">
            <span className="muted">{q.generated ? 'Practice question' : `Book Q${q.bookNo}`}</span>
            <span className="muted">Find the missing number</span>
          </div>
          <SeriesView terms={q.terms} reveal={chosen ? q.options[q.answer] : undefined} layout={q.layout} />
          <Options q={q} chosen={chosen} reveal={!!chosen} onPick={pick} />

          {chosen && (
            <div className={`feedback ${correct ? 'feedback-good' : 'feedback-bad'}`} role="status">
              <p className="feedback-title">{correct ? '✓ Correct!' : `✗ Not quite. The answer is ${q.answer}.`}</p>
              <Explanation q={q} />
              <button className="btn btn-primary btn-lg" onClick={next} autoFocus>
                {mode !== 'more' && index === queue.length - 1 ? 'Finish' : 'Next question →'}
              </button>
            </div>
          )}
        </section>
      )}
    </Page>
  )
}
