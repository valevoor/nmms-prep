import { useMemo, useState } from 'react'
import { Page } from '../components/Page'
import type { PaperQuestionRef, SatTopic } from '../data/sat'
import { satQuestions, satSolved, satTopicName } from '../data/sat'
import { useLocale, useT } from '../lib/i18n'
import { recordSatAnswer, satKey, satMistakes, useProgress } from '../lib/progress'
import { href } from '../lib/router'
import type { OptionKey } from '../types'
import { SatExplanation, SatQuestionBody } from '../components/SatQuestion'

export type SatPracticeMode = 'exam' | 'mistakes'

/**
 * A SAT topic's past exam questions one at a time (#/sat/<id>/practice), like MAT's Practice: pick an answer to
 * a solved question (maths and science so far), see if it's right and how to solve it, then go on. A question without an
 * answer yet is shown as printed, to read and discuss. The Mistakes tab asks again the ones last answered wrong.
 */
export function SatPractice({ topic, mode }: { topic: SatTopic; mode: SatPracticeMode }) {
  const t = useT()
  const lang = useLocale()
  const progress = useProgress(satKey(topic.id))
  const all = useMemo(() => satQuestions(topic), [topic])
  const solved = useMemo(() => satSolved(topic), [topic])
  const mistakes = satMistakes(progress, solved)
  // The mistakes list is frozen at the first answer, so it doesn't shrink under the student mid-session.
  const [frozen, setFrozen] = useState<PaperQuestionRef[] | null>(null)
  const queue = frozen ?? (mode === 'exam' ? all : mistakes)
  const many = topic.chapters.length > 1

  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<OptionKey | undefined>()
  const [score, setScore] = useState({ right: 0, done: 0 })

  const item = queue[index]
  const finished = index >= queue.length
  const correct = chosen !== undefined && chosen === item?.q.answer

  const pick = (k: OptionKey) => {
    if (chosen || !item) return
    if (!frozen) setFrozen(queue)
    setChosen(k)
    const ok = k === item.q.answer
    recordSatAnswer(topic.id, item.q.id, ok)
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), done: s.done + 1 }))
  }

  const next = () => {
    if (!frozen) setFrozen(queue)
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

  const base = `sat/${topic.id}`
  return (
    <Page title={satTopicName(topic, lang)} back={base} right={<span className="counter">{`${Math.min(index + 1, queue.length)} / ${queue.length}`}</span>}>
      <nav className="tabs" aria-label={t.practice.mode}>
        {(['exam', 'mistakes'] as SatPracticeMode[]).map((m) => (
          <a key={m} className={`tab${m === mode ? ' tab-active' : ''}`} href={href(`${base}/practice?mode=${m}`)} aria-current={m === mode ? 'page' : undefined}>
            {t.practice[m]}
          </a>
        ))}
      </nav>

      {queue.length === 0 ? (
        <section className="card empty">
          <h3>{t.practice.noMistakes}</h3>
          <p className="muted">{t.practice.noMistakesBody}</p>
          <a className="btn btn-primary" href={href(`${base}/practice?mode=exam`)}>
            {t.practice.exam}
          </a>
        </section>
      ) : finished ? (
        <section className="card done">
          {score.done > 0 && (
            <p className="big-score">
              {score.right}/{score.done}
            </p>
          )}
          <h3>{score.done > 0 && score.right === score.done ? t.practice.perfect : t.practice.wellDone}</h3>
          <div className="actions">
            {mistakes.length > 0 &&
              (mode === 'mistakes' ? (
                <button className="btn btn-primary" onClick={restart}>
                  {t.practice.retryMistakes(mistakes.length)}
                </button>
              ) : (
                <a className="btn btn-primary" href={href(`${base}/practice?mode=mistakes`)}>
                  {t.practice.retryMistakes(mistakes.length)}
                </a>
              ))}
            {mode === 'exam' && (
              <button className="btn" onClick={restart}>
                {t.practice.examAgain}
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="card question sat-q" key={item.q.id}>
          <div className="q-head">
            <span className="muted">
              <span className="chip chip-exam">{t.common.realExam}</span> {t.common.paperQ(t.common.states[item.paper.state], item.paper.year, item.q.paperNo)}
            </span>
            {many && item.chapter && <span className="muted">{t.sat.fromChapter(item.chapter.cls, t.sat.subjects[item.chapter.subject], item.chapter.no)}</span>}
          </div>
          <SatQuestionBody paper={item.paper} q={item.q} chosen={chosen} onPick={pick} />

          {!item.q.answer && (
            <div className="actions">
              <p className="muted">{t.sat.noAnswerYet}</p>
              <button className="btn btn-primary btn-lg" onClick={next}>
                {index === queue.length - 1 ? t.practice.finish : t.practice.nextQuestion}
              </button>
            </div>
          )}
          {chosen && (
            <div className={`feedback ${correct ? 'feedback-good' : 'feedback-bad'}`} role="status">
              <p className="feedback-title">{correct ? t.common.correct : t.common.notQuite(item.q.answer!)}</p>
              <SatExplanation paper={item.paper} q={item.q} />
              <button className="btn btn-primary btn-lg" onClick={next} autoFocus>
                {index === queue.length - 1 ? t.practice.finish : t.practice.nextQuestion}
              </button>
            </div>
          )}
        </section>
      )}
    </Page>
  )
}
