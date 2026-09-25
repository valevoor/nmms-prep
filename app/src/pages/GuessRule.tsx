import { useState } from 'react'
import { Page } from '../components/Page'
import { RoundGame } from '../components/RoundGame'
import type { ReadyTopic } from '../data/topics'
import { recordBest, useProgress } from '../lib/progress'
import { href } from '../lib/router'

const ROUNDS = 10
const GAME = 'guess-rule'

/** Look at a series and pick the rule it follows. Keeps a best score per topic. */
export function GuessRule({ topic }: { topic: ReadyTopic }) {
  const best = useProgress(topic.id).best[GAME]
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [result, setResult] = useState({ score: 0, record: false })

  const finish = (score: number) => {
    setResult({ score, record: recordBest(topic.id, GAME, score) })
    setPhase('done')
    window.scrollTo(0, 0)
  }
  const play = () => {
    setRound((r) => r + 1)
    setPhase('playing')
  }

  return (
    <Page title="Guess the rule" back="">
      {phase === 'intro' && (
        <section className="card intro">
          <span className="game-icon" aria-hidden>
            🔎
          </span>
          <h2>Guess the rule</h2>
          <p className="muted">{topic.guessRule?.intro}</p>
          <p>{ROUNDS} puzzles. Read the explanation after each one.</p>
          {best !== undefined && (
            <p className="chip">
              Your best: {best}/{ROUNDS}
            </p>
          )}
          <div className="actions">
            <button className="btn btn-primary btn-lg" onClick={play}>
              Start
            </button>
          </div>
        </section>
      )}

      {phase === 'playing' && topic.guessRule && (
        <RoundGame key={round} make={topic.guessRule.make} rounds={ROUNDS} prompt={topic.guessRule.prompt} onFinish={finish} />
      )}

      {phase === 'done' && (
        <section className="card result">
          {result.record && <span className="stamp">New record!</span>}
          <p className="big-score">
            {result.score}/{ROUNDS}
          </p>
          <p className="result-pct">rules spotted</p>
          {!result.record && best !== undefined && (
            <p className="muted">
              Your best: {best}/{ROUNDS}
            </p>
          )}
          <div className="actions">
            <button className="btn btn-primary" onClick={play}>
              Play again
            </button>
            <a className="btn" href={href(`t/${topic.id}/learn`)}>
              Review the tips
            </a>
          </div>
        </section>
      )}
    </Page>
  )
}
