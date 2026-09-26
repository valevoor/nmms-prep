import { useState } from 'react'
import { Page } from '../components/Page'
import { FamilyTreeView } from '../components/FamilyTreeView'
import { MapDiagram } from '../components/MapDiagram'
import { Options } from '../components/Options'
import { QuestionStem } from '../components/QuestionStem'
import { SeriesView } from '../components/SeriesView'
import { TipCard } from '../components/tips/TipCard'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { useQuestionText, useTopicMeta } from '../lib/i18n/content'
import { href } from '../lib/router'
import type { Question } from '../types'

function WorkedExample({ q, n }: { q: Question; n: number }) {
  const t = useT()
  const text = useQuestionText(q)
  // At least one step, so examples without ops (e.g. analogies) show the rule before the answer.
  const steps = Math.max(q.ops?.length ?? 0, 1)
  // 0 = question only, 1..steps = rule and ops shown, steps+1 = answer shown
  const [step, setStep] = useState(0)
  const done = step > steps
  return (
    <section className="card example">
      <h3>{t.learn.example(n)}</h3>
      {q.kind === 'wrong' ? (
        // "Find the wrong number": at the end, show the series repaired, with the right number in place.
        <SeriesView
          terms={done && q.fix ? q.terms.map((x, i) => (i === q.wrongIndex ? '?' : x)) : q.terms}
          ops={q.ops}
          opsShown={Math.min(step, steps)}
          reveal={done ? q.fix : undefined}
          layout={q.layout}
        />
      ) : (
        <SeriesView terms={q.terms} ops={q.ops} opsShown={Math.min(step, steps)} reveal={done ? q.options[q.answer] : undefined} layout={q.layout} />
      )}
      {q.layout === 'text' && <QuestionStem q={q} />}
      {(q.layout === 'odd' || q.layout === 'text') && <Options q={q} reveal={done} />}
      {step > 0 && <p className="rule">{text.rule}</p>}
      {done && <MapDiagram q={q} />}
      {done && <FamilyTreeView q={q} />}
      {done && <p className="working">{text.working}</p>}
      <div className="actions">
        {!done ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {step === 0 ? t.learn.showSteps : step < steps ? t.learn.nextStep : t.learn.showAnswer}
          </button>
        ) : (
          <button className="btn" onClick={() => setStep(0)}>
            {t.common.startAgain}
          </button>
        )}
      </div>
    </section>
  )
}

const SQUARES = Array.from({ length: 20 }, (_, i) => i + 1)
const CUBES = Array.from({ length: 10 }, (_, i) => i + 1)
const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

export function Learn({ topic }: { topic: ReadyTopic }) {
  const t = useT()
  const meta = useTopicMeta(topic.id, topic.meta)
  const examples = meta.workedExamples.map((id) => topic.questions.find((q) => q.id === id)).filter((q): q is Question => !!q)
  return (
    <Page title={t.learn.title(t.chapters[topic.chapter] ?? topic.name)} back="">
      <p className="lead">{meta.intro}</p>

      <h2 className="section-title">{t.learn.tips}</h2>
      <div className="tips">
        {meta.tips.map((tip, i) => (
          <TipCard key={i} tip={tip} n={i + 1} />
        ))}
      </div>

      <h2 className="section-title">{t.learn.worked}</h2>
      {examples.map((q, i) => (
        <WorkedExample key={q.id} q={q} n={i + 1} />
      ))}

      <h2 className="section-title">{t.learn.cheatSheet}</h2>
      {meta.cheatSheet === 'relations' ? (
        <section className="card cheats">
          <h3>{t.learn.relationsTitle}</h3>
          <table className="relations-table">
            <tbody>
              {t.learn.relations.map(([who, name]) => (
                <tr key={who}>
                  <td>{who}</td>
                  <td>{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : meta.cheatSheet === 'alphabet' ? (
        <section className="card cheats">
          <h3>{t.learn.alphabet}</h3>
          <div className="alphabet-grid">
            {LETTERS.map((c, i) => (
              <span key={c}>
                <b>{c}</b>
                <span>{i + 1}</span>
                <span className="muted" title={t.learn.backwards}>
                  {26 - i}
                </span>
              </span>
            ))}
          </div>
          <p className="muted">{t.learn.alphabetNote}</p>
        </section>
      ) : (
        <section className="card cheats">
          <h3>{t.learn.squares}</h3>
          <div className="cheat-grid">
            {SQUARES.map((n) => (
              <span key={n}>
                {n}² = <b>{n * n}</b>
              </span>
            ))}
          </div>
          <h3>{t.learn.cubes}</h3>
          <div className="cheat-grid">
            {CUBES.map((n) => (
              <span key={n}>
                {n}³ = <b>{n ** 3}</b>
              </span>
            ))}
          </div>
          <h3>{t.learn.primes}</h3>
          <p className="primes">{PRIMES.join(', ')}</p>
        </section>
      )}

      <div className="cta">
        <a className="btn btn-primary btn-lg" href={href(`t/${topic.id}/practice?mode=book`)}>
          {t.learn.startPractising}
        </a>
      </div>
    </Page>
  )
}
