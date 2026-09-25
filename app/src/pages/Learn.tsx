import { useState } from 'react'
import { Page } from '../components/Page'
import { SeriesView } from '../components/SeriesView'
import { TipCard } from '../components/tips/TipCard'
import type { ReadyTopic } from '../data/topics'
import { href } from '../lib/router'
import type { Question } from '../types'

function WorkedExample({ q, n }: { q: Question; n: number }) {
  // At least one step, so examples without ops (e.g. analogies) show the rule before the answer.
  const steps = Math.max(q.ops?.length ?? 0, 1)
  // 0 = question only, 1..steps = rule and ops shown, steps+1 = answer shown
  const [step, setStep] = useState(0)
  const done = step > steps
  return (
    <section className="card example">
      <h3>Example {n}</h3>
      <SeriesView terms={q.terms} ops={q.ops} opsShown={Math.min(step, steps)} reveal={done ? q.options[q.answer] : undefined} layout={q.layout} />
      {step > 0 && <p className="rule">{q.rule}</p>}
      {done && <p className="working">{q.working}</p>}
      <div className="actions">
        {!done ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {step === 0 ? 'Show step by step' : step < steps ? 'Next step' : 'Show answer'}
          </button>
        ) : (
          <button className="btn" onClick={() => setStep(0)}>
            Start again
          </button>
        )}
      </div>
    </section>
  )
}

const SQUARES = Array.from({ length: 20 }, (_, i) => i + 1)
const CUBES = Array.from({ length: 10 }, (_, i) => i + 1)
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

export function Learn({ topic }: { topic: ReadyTopic }) {
  const examples = topic.meta.workedExamples.map((id) => topic.questions.find((q) => q.id === id)).filter((q): q is Question => !!q)
  return (
    <Page title={`Learn: ${topic.name}`} back="">
      <p className="lead">{topic.meta.intro}</p>

      <h2 className="section-title">Tips</h2>
      <div className="tips">
        {topic.meta.tips.map((t, i) => (
          <TipCard key={t.title} tip={t} n={i + 1} />
        ))}
      </div>

      <h2 className="section-title">Worked examples</h2>
      {examples.map((q, i) => (
        <WorkedExample key={q.id} q={q} n={i + 1} />
      ))}

      <h2 className="section-title">Cheat sheet</h2>
      <section className="card cheats">
        <h3>Squares</h3>
        <div className="cheat-grid">
          {SQUARES.map((n) => (
            <span key={n}>
              {n}² = <b>{n * n}</b>
            </span>
          ))}
        </div>
        <h3>Cubes</h3>
        <div className="cheat-grid">
          {CUBES.map((n) => (
            <span key={n}>
              {n}³ = <b>{n ** 3}</b>
            </span>
          ))}
        </div>
        <h3>Prime numbers under 100</h3>
        <p className="primes">{PRIMES.join(', ')}</p>
      </section>

      <div className="cta">
        <a className="btn btn-primary btn-lg" href={href(`t/${topic.id}/practice?mode=book`)}>
          Start practising →
        </a>
      </div>
    </Page>
  )
}
