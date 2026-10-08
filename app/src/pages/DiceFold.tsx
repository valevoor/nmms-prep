import { useEffect, useMemo, useRef, useState } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { FoldScene } from '../components/FoldScene'
import type { FoldHandle } from '../components/FoldScene'
import { Page } from '../components/Page'
import { BOOK_NETS } from '../data/diceNets'
import { oppositePairs } from '../lib/diceFold'
import { randomNet } from '../lib/generators/dice'
import type { NetCell } from '../lib/generators/dice'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

type Pick = number | 'new'
const FOLD_MS = 1100
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)

/** Numbers in opposite faces (Ch 11): fold an open dice into a cube, turn it, and see which faces are opposite. */
export function DiceFold() {
  const tr = useT()
  const t = tr.fold
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const scene = useRef<FoldHandle>(null)
  const [pick, setPick] = useState<Pick>(10)
  const [fresh, setFresh] = useState<NetCell[]>(() => randomNet())
  const [k, setK] = useState(0)
  const [goal, setGoal] = useState(0)
  const [showPairs, setShowPairs] = useState(true)
  const anim = useRef(0)
  const kNow = useRef(0)
  const setFold = (v: number) => {
    kNow.current = v
    setK(v)
  }

  const net = pick === 'new' ? fresh : BOOK_NETS.find((b) => b.q === pick)!.net
  const pairs = useMemo(() => oppositePairs(net), [net])

  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  const foldTo = (target: number) => {
    cancelAnimationFrame(anim.current)
    setGoal(target)
    const from = kNow.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setFold(target)
    const ms = FOLD_MS * Math.max(0.3, Math.abs(target - from))
    let t0 = -1
    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const p = Math.min(1, (now - t0) / ms)
      setFold(from + (target - from) * ease(p))
      if (p < 1) anim.current = requestAnimationFrame(tick)
    }
    anim.current = requestAnimationFrame(tick)
  }

  const choose = (p: Pick) => {
    if (p === 'new') setFresh(randomNet())
    setPick(p)
    cancelAnimationFrame(anim.current)
    setFold(0)
    setGoal(0)
    scene.current?.reset()
  }

  const info = showPairs ? t.seen : t.guess
  const info2 = both ? (showPairs ? DICTS[otherLang].fold.seen : DICTS[otherLang].fold.guess) : undefined

  return (
    <Page title={t.title} back="">
      <section className="card explore-card">
        <div className="explore-seg fold-nets" role="group" aria-label={t.nets}>
          {BOOK_NETS.map(({ q }) => (
            <button key={q} type="button" aria-pressed={pick === q} onClick={() => choose(q)}>
              {t.q(q)}
            </button>
          ))}
          <button type="button" aria-pressed={pick === 'new'} onClick={() => choose('new')} aria-label={t.newNetLabel}>
            🎲 <BiLabel get={(d) => d.fold.newNet} />
          </button>
        </div>
        <div className="fold-wrap">
          <FoldScene ref={scene} net={net} t={k} pairs={showPairs ? pairs : null} label={t.scene} />
          <div className="explore-zoom">
            <button type="button" className="btn icon" onClick={() => scene.current?.reset()} aria-label={t.reset} title={t.reset}>
              ⟲
            </button>
          </div>
        </div>
        <p className="explore-hint muted">{t.hint}</p>
        <div className="fold-controls">
          <label className="fold-slider">
            <span>
              <BiLabel get={(d) => d.fold.flat} />
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(k * 100)}
              aria-label={t.slider}
              onChange={(e) => {
                cancelAnimationFrame(anim.current)
                const v = Number(e.target.value) / 100
                setFold(v)
                setGoal(v > 0.5 ? 1 : 0)
              }}
            />
            <span>
              <BiLabel get={(d) => d.fold.dice} />
            </span>
          </label>
          <button type="button" className="btn btn-primary" onClick={() => foldTo(goal === 1 ? 0 : 1)}>
            {goal === 1 ? <BiLabel get={(d) => d.fold.unfold} /> : <BiLabel get={(d) => d.fold.fold} />}
          </button>
        </div>
        <label className="explore-switch">
          <input type="checkbox" checked={showPairs} onChange={(e) => setShowPairs(e.target.checked)} />
          <span>
            <BiLabel get={(d) => d.fold.pairsSwitch} />
          </span>
        </label>
        {showPairs && (
          <ul className="fold-pairs" aria-label={t.pairsLabel}>
            {pairs.map(([a, b], i) => (
              <li key={a + b}>
                <i style={{ background: `var(--fold-pair-${i})` }} />
                {a} ↔ {b}
              </li>
            ))}
          </ul>
        )}
        <div className="explore-info" aria-live="polite">
          <BiBlock text={info} other={info2} lang={lang} otherLang={otherLang} />
        </div>
      </section>

      <section className="card trick-card">
        <BiBlock text={t.rule} other={both ? DICTS[otherLang].fold.rule : undefined} lang={lang} otherLang={otherLang} />
      </section>
    </Page>
  )
}
