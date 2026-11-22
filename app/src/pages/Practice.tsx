import { useMemo, useState } from 'react'
import { BiLabel } from '../components/Bi'
import { ClueCard } from '../components/ClueCard'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { QuestionStem } from '../components/QuestionStem'
import { modelQuestions, paperQuestions } from '../data/papers'
import { askLabel, pastOnly } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { cluesFor } from '../lib/clues'
import { useT } from '../lib/i18n'
import { byLevel, levelOf } from '../lib/levels'
import { recordAnswer, useProgress } from '../lib/progress'
import { href } from '../lib/router'
import { questionLabel } from '../lib/source'
import type { OptionKey, Question } from '../types'

export type PracticeMode = 'warmup' | 'book' | 'exam' | 'model' | 'more' | 'mistakes'

export function Practice({ topic, mode: asked }: { topic: ReadyTopic; mode: PracticeMode }) {
  const t = useT()
  // A chapter without book questions opens on its past-exam questions.
  const mode: PracticeMode = asked === 'book' && pastOnly(topic) ? 'exam' : asked
  const start = pastOnly(topic) ? 'exam' : 'book'
  const progress = useProgress(topic.id)
  const [extra, setExtra] = useState<Question[]>(() => (mode === 'more' && topic.generate ? [topic.generate()] : []))
  // A warm-up round is made once, then fixed until "A new warm-up".
  const [round, setRound] = useState<Question[]>(() => (mode === 'warmup' && topic.warmup ? topic.warmup() : []))
  // The mistakes list is frozen at the first answer, so it doesn't shrink under the student mid-session.
  const [frozen, setFrozen] = useState<Question[] | null>(null)
  // Past-paper questions filed under this chapter; the tab only shows when there are some.
  const exam = useMemo(() => byLevel(paperQuestions(topic.id)), [topic.id])
  // Model-paper questions (practice papers, not real exams), in their own tab; it only shows when there are some.
  const model = useMemo(() => byLevel(modelQuestions(topic.id)), [topic.id])
  // Easiest first, where the chapter has levels.
  const book = useMemo(() => byLevel(topic.questions), [topic.questions])
  const live = mode === 'warmup' ? round : mode === 'book' ? book : mode === 'exam' ? exam : mode === 'model' ? model : mode === 'mistakes' ? progress.mistakes : extra
  const queue = mode === 'more' ? extra : (frozen ?? live)

  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<OptionKey | undefined>()
  const [score, setScore] = useState({ right: 0, done: 0 })
  // Clues: how many are revealed; `held` is a first wrong answer made without clues, whose answer is
  // kept back while a clue is offered; `retried` once the student has taken that offer (or turned it down).
  const [clues, setClues] = useState(0)
  const [held, setHeld] = useState(false)
  const [retried, setRetried] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const q = queue[index]
  const finished = mode !== 'more' && index >= queue.length
  const answered = chosen !== undefined && !held
  const correct = answered && chosen === q?.answer
  const clueCount = q ? cluesFor(q, 'en').length : 0

  const pick = (k: OptionKey) => {
    if (answered || held || !q) return
    if (!frozen) setFrozen(queue)
    setChosen(k)
    const ok = k === q.answer
    // Only the first answer counts, so a second try after a clue doesn't change the score or progress.
    if (!attempted) {
      setAttempted(true)
      recordAnswer(topic.id, q, ok)
      setScore((s) => ({ right: s.right + (ok ? 1 : 0), done: s.done + 1 }))
    }
    if (!ok && clues === 0 && clueCount > 0 && !retried) setHeld(true)
  }

  const tryWithClue = () => {
    setHeld(false)
    setRetried(true)
    setChosen(undefined)
    setClues(1)
  }

  const showAnswer = () => {
    setHeld(false)
    setRetried(true)
  }

  const resetQuestion = () => {
    setChosen(undefined)
    setClues(0)
    setHeld(false)
    setRetried(false)
    setAttempted(false)
  }

  const next = () => {
    if (mode === 'more' && topic.generate) setExtra((e) => [...e, topic.generate!()])
    setIndex((i) => i + 1)
    resetQuestion()
    window.scrollTo(0, 0)
  }

  const restart = () => {
    if (mode === 'warmup' && topic.warmup) setRound(topic.warmup())
    setFrozen(null)
    setIndex(0)
    resetQuestion()
    setScore({ right: 0, done: 0 })
  }

  const counter = mode === 'more' ? t.practice.rightCount(score.right, score.done) : `${Math.min(index + 1, queue.length)} / ${queue.length}`
  const tabs = useMemo(
    () =>
      (['warmup', 'book', 'exam', 'model', 'more', 'mistakes'] as PracticeMode[])
        .filter((m) => (m === 'warmup' ? !!topic.warmup : m === 'exam' ? exam.length > 0 : m === 'model' ? model.length > 0 : m === 'book' ? !pastOnly(topic) : m === 'more' ? !!topic.generate : true))
        .map((m) => (
        <a key={m} className={`tab${m === mode ? ' tab-active' : ''}`} href={href(`mat/${topic.id}/practice/${m}`)} aria-current={m === mode ? 'page' : undefined}>
          {t.practice[m]}
        </a>
      )),
    [mode, topic, t, exam.length, model.length],
  )

  return (
    <Page title={t.chapters[topic.chapter] ?? topic.name} back="mat" right={<span className="counter">{counter}</span>}>
      <nav className="tabs" aria-label={t.practice.mode}>
        {tabs}
      </nav>

      {queue.length === 0 ? (
        <section className="card empty">
          <h3>{t.practice.noMistakes}</h3>
          <p className="muted">{t.practice.noMistakesBody}</p>
          <a className="btn btn-primary" href={href(`mat/${topic.id}/practice/${start}`)}>
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
                <a className="btn btn-primary" href={href(`mat/${topic.id}/practice/mistakes`)}>
                  {t.practice.retryMistakes(progress.mistakes.length)}
                </a>
              ))}
            {mode === 'warmup' && (
              <>
                {!pastOnly(topic) && (
                  <a className={`btn${progress.mistakes.length > 0 ? '' : ' btn-primary'}`} href={href(`mat/${topic.id}/practice/book`)}>
                    {t.practice.practiseBook}
                  </a>
                )}
                <button className="btn" onClick={restart}>
                  {t.practice.warmupAgain}
                </button>
              </>
            )}
            {(mode === 'book' || mode === 'exam' || mode === 'model') && (
              <button className="btn" onClick={restart}>
                {mode === 'exam' ? t.practice.examAgain : mode === 'model' ? t.practice.modelAgain : t.practice.bookAgain}
              </button>
            )}
            {topic.generate && (
              <a className="btn" href={href(`mat/${topic.id}/practice/more`)}>
                {t.practice.moreQuestions}
              </a>
            )}
            <a className="btn" href={href(`mat/${topic.id}/test`)}>
              {t.practice.takeTest}
            </a>
          </div>
        </section>
      ) : (
        <section className="card question" key={q.id}>
          <div className="q-head">
            <span className="muted">
              {q.paper && <span className="chip chip-exam">{t.common.realExam}</span>}{levelOf(q) && <span className="chip chip-level" title={t.common.levelOf(levelOf(q)!)} aria-label={t.common.levelOf(levelOf(q)!)}>{t.common.level(levelOf(q)!)}</span>} {questionLabel(q, t)}
            </span>
            <span className="muted">
              <BiLabel get={(d) => askLabel(d, topic)} />
            </span>
          </div>
          <QuestionStem
            q={q}
            reveal={answered ? q.options[q.answer] : undefined}
            extra={<ClueCard key={q.id} q={q} shown={clues} onShow={setClues} locked={answered || held} />}
          />
          <Options q={q} chosen={held ? undefined : chosen} wrong={held ? chosen : undefined} reveal={answered} onPick={held ? undefined : pick} />

          {held && (
            <div className="feedback feedback-bad" role="status">
              <p className="feedback-title">{t.clues.wrongFirst}</p>
              <div className="clue-offer">
                <button className="btn clue-open" onClick={tryWithClue} autoFocus>
                  {t.clues.tryWithClue}
                </button>
                <button className="btn" onClick={showAnswer}>
                  {t.clues.showAnswer}
                </button>
              </div>
            </div>
          )}
          {answered && (
            <div className={`feedback ${correct ? 'feedback-good' : 'feedback-bad'}`} role="status">
              <p className="feedback-title">{correct ? t.common.correct : t.common.notQuite(q.answer)}</p>
              {clues > 0 && <p className="clue-used">{t.clues.used(clues, clueCount)}</p>}
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
