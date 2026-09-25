import { useState } from 'react'
import { Page } from '../components/Page'
import { RoundGame } from '../components/RoundGame'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import { recordBest, useProgress } from '../lib/progress'
import { href } from '../lib/router'

const ROUNDS = 10
const GAME = 'guess-rule'

/** Look at a series and pick the rule it follows. Keeps a best score per topic. */
export function GuessRule({ topic }: { topic: ReadyTopic }) {
  const t = useT()
  const text = t.game.topics[topic.id]
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
    <Page title={t.game.title} back="">
      {phase === 'intro' && (
        <section className="card intro">
          <span className="game-icon" aria-hidden>
            🔎
          </span>
          <h2>{t.game.title}</h2>
          <p className="muted">{text?.intro}</p>
          <p>{t.game.puzzles(ROUNDS)}</p>
          {best !== undefined && (
            <p className="chip">{t.game.best(best, ROUNDS)}</p>
          )}
          <div className="actions">
            <button className="btn btn-primary btn-lg" onClick={play}>
              {t.game.start}
            </button>
          </div>
        </section>
      )}

      {phase === 'playing' && topic.guessRule && (
        <RoundGame key={round} make={topic.guessRule.make} rounds={ROUNDS} prompt={text?.prompt ?? ''} onFinish={finish} />
      )}

      {phase === 'done' && (
        <section className="card result">
          {result.record && <span className="stamp">{t.game.record}</span>}
          <p className="big-score">
            {result.score}/{ROUNDS}
          </p>
          <p className="result-pct">{t.game.spotted}</p>
          {!result.record && best !== undefined && (
            <p className="muted">{t.game.best(best, ROUNDS)}</p>
          )}
          <div className="actions">
            <button className="btn btn-primary" onClick={play}>
              {t.game.playAgain}
            </button>
            <a className="btn" href={href(`t/${topic.id}/learn`)}>
              {t.game.reviewTips}
            </a>
          </div>
        </section>
      )}
    </Page>
  )
}
