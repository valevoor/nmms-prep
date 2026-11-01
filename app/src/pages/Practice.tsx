import { useMemo, useState } from 'react'
import { BiLabel } from '../components/Bi'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { QuestionStem } from '../components/QuestionStem'
import { paperQuestions } from '../data/papers'
import { askLabel, pastOnly } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { recordAnswer, useProgress } from '../lib/progress'
import { href } from '../lib/router'
import { questionLabel } from '../lib/source'
import type { OptionKey, Question } from '../types'

export type PracticeMode = 'book' | 'exam' | 'more' | 'mistakes'

export function Practice({ topic, mode: asked }: { topic: ReadyTopic; mode: PracticeMode }) {
  const t = useT()
  // A chapter without book questions opens on its past-exam questions.
  const mode: PracticeMode = asked === 'book' && pastOnly(topic) ? 'exam' : asked
  const start = pastOnly(topic) ? 'exam' : 'book'
  const progress = useProgress(topic.id)
  const [extra, setExtra] = useState<Question[]>(() => (mode === 'more' && topic.generate ? [topic.generate()] : []))
  // The mistakes list is frozen at the first answer, so it doesn't shrink under the student mid-session.
  const [frozen, setFrozen] = useState<Question[] | null>(null)
  // Past-paper questions filed under this chapter; the tab only shows when there are some.
  const exam = useMemo(() => paperQuestions(topic.id), [topic.id])
  const live = mode === 'book' ? topic.questions : mode === 'exam' ? exam : mode === 'mistakes' ? progress.mistakes : extra
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

  const counter = mode === 'more' ? t.practice.rightCount(score.right, score.done) : `${Math.min(index + 1, queue.length)} / ${queue.length}`
  const tabs = useMemo(
    () =>
      (['book', 'exam', 'more', 'mistakes'] as PracticeMode[])
        .filter((m) => (m === 'exam' ? exam.length > 0 : m === 'book' ? !pastOnly(topic) : m === 'more' ? !!topic.generate : true))
        .map((m) => (
        <a key={m} className={`tab${m === mode ? ' tab-active' : ''}`} href={href(`t/${topic.id}/practice?mode=${m}`)} aria-current={m === mode ? 'page' : undefined}>
          {t.practice[m]}
        </a>
      )),
    [mode, topic, t, exam.length],
  )

  return (
    <Page title={t.chapters[topic.chapter] ?? topic.name} back="" right={<span className="counter">{counter}</span>}>
      <nav className="tabs" aria-label={t.practice.mode}>
        {tabs}
      </nav>

      {queue.length === 0 ? (
        <section className="card empty">
          <h3>{t.practice.noMistakes}</h3>
          <p className="muted">{t.practice.noMistakesBody}</p>
          <a className="btn btn-primary" href={href(`t/${topic.id}/practice?mode=${start}`)}>
            {start === 'exam' ? t.practice.exam : t.practice.practiseBook}
          </a>
        </section>
      ) : finished ? (
        <section className="card done">
          <p className="big-score">
            {score.right}/{score.done}
          </p>
          <h3>{score.right === score.done ? t.practice.perfect : t.practice.wellDone}</h3>
          <div className="actions">
            {progress.mistakes.length > 0 &&
              (mode === 'mistakes' ? (
                <button className="btn btn-primary" onClick={restart}>
                  {t.practice.retryMistakes(progress.mistakes.length)}
                </button>
              ) : (
                <a className="btn btn-primary" href={href(`t/${topic.id}/practice?mode=mistakes`)}>
                  {t.practice.retryMistakes(progress.mistakes.length)}
                </a>
              ))}
            {(mode === 'book' || mode === 'exam') && (
              <button className="btn" onClick={restart}>
                {mode === 'exam' ? t.practice.examAgain : t.practice.bookAgain}
              </button>
            )}
            {topic.generate && (
              <a className="btn" href={href(`t/${topic.id}/practice?mode=more`)}>
                {t.practice.moreQuestions}
              </a>
            )}
            <a className="btn" href={href(`t/${topic.id}/test`)}>
              {t.practice.takeTest}
            </a>
          </div>
        </section>
      ) : (
        <section className="card question" key={q.id}>
          <div className="q-head">
            <span className="muted">
              {q.paper && <span className="chip chip-exam">{t.common.realExam}</span>} {questionLabel(q, t)}
            </span>
            <span className="muted">
              <BiLabel get={(d) => askLabel(d, topic)} />
            </span>
          </div>
          <QuestionStem q={q} reveal={chosen ? q.options[q.answer] : undefined} />
          <Options q={q} chosen={chosen} reveal={!!chosen} onPick={pick} />

          {chosen && (
            <div className={`feedback ${correct ? 'feedback-good' : 'feedback-bad'}`} role="status">
              <p className="feedback-title">{correct ? t.common.correct : t.common.notQuite(q.answer)}</p>
              <Explanation q={q} />
              <button className="btn btn-primary btn-lg" onClick={next} autoFocus>
                {mode !== 'more' && index === queue.length - 1 ? t.practice.finish : t.practice.nextQuestion}
              </button>
            </div>
          )}
        </section>
      )}
    </Page>
  )
}
