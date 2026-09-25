import { useCallback, useEffect, useState } from 'react'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { SeriesView } from '../components/SeriesView'
import { TimerBadge } from '../components/Timer'
import { useCountdown } from '../lib/countdown'
import type { ReadyTopic } from '../data/topics'
import type { Question } from '../types'

type Source = 'book' | 'fresh'
const TIME_CHOICES = [30, 60, 90, 120]

export function Classroom({ topic }: { topic: ReadyTopic }) {
  const [source, setSource] = useState<Source>('book')
  const [fresh, setFresh] = useState<Question[]>(() => (topic.generate ? [topic.generate()] : []))
  const list = source === 'book' ? topic.questions : fresh
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [explained, setExplained] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const [running, setRunning] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const left = useCountdown(seconds, running, timerKey, () => setRunning(false))

  const q = list[index]

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (next < 0) return
      if (source === 'fresh' && next >= fresh.length && topic.generate) setFresh((f) => [...f, topic.generate!()])
      else if (next >= list.length) return
      setIndex(next)
      setRevealed(false)
      setExplained(false)
      setRunning(false)
      setTimerKey((k) => k + 1)
    },
    [index, source, fresh.length, list.length, topic],
  )

  const switchSource = (s: Source) => {
    setSource(s)
    setIndex(0)
    setRevealed(false)
    setExplained(false)
    setRunning(false)
    setTimerKey((k) => k + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('select')) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setRevealed(true)
      } else if (e.key === 'e' || e.key === 'E') {
        setRevealed(true)
        setExplained((x) => !x)
      } else if (e.key === 't' || e.key === 'T') setRunning((r) => !r)
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else void document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <Page title={`Classroom: ${topic.name}`} back="" wide right={<TimerBadge left={left} total={seconds} />}>
      <div className="class-controls">
        <div className="seg" role="group" aria-label="Question source">
          <button className={source === 'book' ? 'on' : ''} onClick={() => switchSource('book')}>
            Book questions
          </button>
          <button className={source === 'fresh' ? 'on' : ''} onClick={() => switchSource('fresh')} disabled={!topic.generate}>
            New questions
          </button>
        </div>
        <label className="time-pick">
          Time per question
          <select value={seconds} onChange={(e) => (setSeconds(Number(e.target.value)), setTimerKey((k) => k + 1), setRunning(false))}>
            {TIME_CHOICES.map((s) => (
              <option key={s} value={s}>
                {s}s
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={() => (left === 0 && setTimerKey((k) => k + 1), setRunning((r) => !r))}>
          {running ? '⏸ Pause' : '▶ Start timer'}
        </button>
      </div>

      <section className="card question class-card">
        <div className="q-head">
          <span>
            {source === 'book' ? `Book Q${q.bookNo}` : 'New question'} · {index + 1}
            {source === 'book' && ` of ${list.length}`}
          </span>
          <span className="muted">Find the missing number</span>
        </div>
        <SeriesView terms={q.terms} size="lg" reveal={revealed ? q.options[q.answer] : undefined} layout={q.layout} />
        <Options q={q} size="lg" reveal={revealed} />
        {explained && <Explanation q={q} size="lg" />}
      </section>

      <div className="class-nav">
        <button className="btn btn-lg" onClick={() => go(-1)} disabled={index === 0}>
          ← Prev
        </button>
        {!revealed ? (
          <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>
            Reveal answer
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => setExplained((x) => !x)}>
            {explained ? 'Hide explanation' : 'Show explanation'}
          </button>
        )}
        <button className="btn btn-lg" onClick={() => go(1)} disabled={source === 'book' && index === list.length - 1}>
          Next →
        </button>
      </div>
      <p className="kbd-help muted">
        Keys: <kbd>Space</kbd> reveal · <kbd>E</kbd> explain · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>T</kbd> timer · <kbd>F</kbd> full screen
      </p>
    </Page>
  )
}
