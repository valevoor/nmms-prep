import { useCallback, useEffect, useState } from 'react'
import { Explanation } from '../components/Explanation'
import { LangSwitch } from '../components/LangSwitch'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { QuestionStem } from '../components/QuestionStem'
import { TimerBadge } from '../components/Timer'
import { useCountdown } from '../lib/countdown'
import { askLabel } from '../data/topics'
import type { ReadyTopic } from '../data/topics'
import { useT } from '../lib/i18n'
import type { Question } from '../types'

type Source = 'book' | 'fresh'
const TIME_CHOICES = [30, 60, 90, 120]

export function Classroom({ topic }: { topic: ReadyTopic }) {
  const t = useT()
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
    <Page
      title={t.classroom.title(t.chapters[topic.chapter] ?? topic.name)}
      back=""
      wide
      right={
        <div className="topbar-switches">
          <LangSwitch />
          <TimerBadge left={left} total={seconds} />
        </div>
      }
    >
      <div className="class-controls">
        <div className="seg" role="group" aria-label={t.classroom.source}>
          <button className={source === 'book' ? 'on' : ''} onClick={() => switchSource('book')}>
            {t.classroom.book}
          </button>
          <button className={source === 'fresh' ? 'on' : ''} onClick={() => switchSource('fresh')} disabled={!topic.generate}>
            {t.classroom.fresh}
          </button>
        </div>
        <label className="time-pick">
          {t.classroom.timePer}
          <select value={seconds} onChange={(e) => (setSeconds(Number(e.target.value)), setTimerKey((k) => k + 1), setRunning(false))}>
            {TIME_CHOICES.map((s) => (
              <option key={s} value={s}>
                {t.classroom.seconds(s)}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={() => (left === 0 && setTimerKey((k) => k + 1), setRunning((r) => !r))}>
          {running ? t.classroom.pause : t.classroom.startTimer}
        </button>
      </div>

      <section className="card question class-card">
        <div className="q-head">
          <span>
            {source === 'book' ? t.common.bookQ(q.bookNo) : t.classroom.newQuestion} · {index + 1}
            {source === 'book' && t.classroom.of(list.length)}
          </span>
          <span className="muted">{askLabel(t, topic)}</span>
        </div>
        <QuestionStem q={q} size="lg" reveal={revealed ? q.options[q.answer] : undefined} />
        <Options q={q} size="lg" reveal={revealed} />
        {explained && <Explanation q={q} size="lg" />}
      </section>

      <div className="class-nav">
        <button className="btn btn-lg" onClick={() => go(-1)} disabled={index === 0}>
          {t.classroom.prev}
        </button>
        {!revealed ? (
          <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>
            {t.classroom.reveal}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => setExplained((x) => !x)}>
            {explained ? t.classroom.hideExplanation : t.classroom.showExplanation}
          </button>
        )}
        <button className="btn btn-lg" onClick={() => go(1)} disabled={source === 'book' && index === list.length - 1}>
          {t.common.next}
        </button>
      </div>
      <p className="kbd-help muted">
        {t.classroom.keys} <kbd>Space</kbd> {t.classroom.keyReveal} · <kbd>E</kbd> {t.classroom.keyExplain} · <kbd>←</kbd> <kbd>→</kbd> {t.classroom.keyMove} · <kbd>T</kbd>{' '}
        {t.classroom.keyTimer} · <kbd>F</kbd> {t.classroom.keyFull}
      </p>
    </Page>
  )
}
