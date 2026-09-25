import { useState } from 'react'
import { Explanation } from './Explanation'
import { Options } from './Options'
import { QuestionStem } from './QuestionStem'
import { useT } from '../lib/i18n'
import type { OptionKey, Question } from '../types'

interface Props {
  make: () => Question
  rounds: number
  /** Question shown above the series. */
  prompt: string
  onFinish: (score: number) => void
}

const sameSeries = (a?: Question, b?: Question) => !!a && !!b && a.terms.join() === b.terms.join()

/** A fixed number of generated questions with feedback after each (used by "Guess the rule"). */
export function RoundGame({ make, rounds, prompt, onFinish }: Props) {
  const t = useT()
  const [qs, setQs] = useState<Question[]>(() => [make()])
  const [results, setResults] = useState<boolean[]>([])
  const [chosen, setChosen] = useState<OptionKey | undefined>()

  const q = qs[qs.length - 1]
  const correct = chosen === q.answer

  const pick = (k: OptionKey) => {
    if (chosen) return
    setChosen(k)
    setResults((r) => [...r, k === q.answer])
  }

  const next = () => {
    if (results.length >= rounds) {
      onFinish(results.filter(Boolean).length)
      return
    }
    let n = make()
    while (sameSeries(n, q)) n = make()
    setQs((list) => [...list, n])
    setChosen(undefined)
    window.scrollTo(0, 0)
  }

  return (
    <section className="card question game-card" key={q.id}>
      <div className="round-dots" aria-label={t.game.questionOf(qs.length, rounds)}>
        {Array.from({ length: rounds }, (_, i) => (
          <span key={i} className={`dot${i < results.length ? (results[i] ? ' dot-good' : ' dot-bad') : i === results.length ? ' dot-now' : ''}`} />
        ))}
      </div>
      <p className="game-prompt">{prompt}</p>
      <QuestionStem q={q} />
      <Options q={q} chosen={chosen} reveal={!!chosen} onPick={pick} />
      {chosen && (
        <div className={`feedback ${correct ? 'feedback-good' : 'feedback-bad'}`} role="status">
          <p className="feedback-title">{correct ? t.common.correct : t.common.notQuite(q.answer)}</p>
          <Explanation q={q} />
          <button className="btn btn-primary btn-lg" onClick={next} autoFocus>
            {results.length >= rounds ? t.game.seeHow : t.common.next}
          </button>
        </div>
      )}
    </section>
  )
}
