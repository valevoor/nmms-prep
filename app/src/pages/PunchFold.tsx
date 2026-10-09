import { useEffect, useRef, useState } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { Page } from '../components/Page'
import { OpenedSheet, PunchScene } from '../components/PunchScene'
import type { PunchHandle } from '../components/PunchScene'
import { cutShape, FOLD_LINES, foldLines, MAX_FOLDS, NEEDS, punch, region, sample } from '../lib/punchFold'
import type { Cut, Fold, FoldLine, Pt, Tool } from '../lib/punchFold'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

const FOLD_MS = 1100
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)
const TOOLS: { tool: Tool; icon: string }[] = [
  { tool: 'circle', icon: '○' },
  { tool: 'triangle', icon: '△' },
  { tool: 'rect', icon: '▭' },
  { tool: 'line', icon: '╱' },
]
const LINE_ICON: Record<FoldLine, string> = { vertical: '┆', horizontal: '┄', diagonal: '╲', antidiagonal: '╱' }
const same = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1]

/** Paper fold and punch (Ch 7): fold a sheet in 3D, cut shapes through all its layers, and open it out. */
export function PunchFold() {
  const tr = useT()
  const t = tr.punch
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const scene = useRef<PunchHandle>(null)

  const [history, setHistory] = useState<Cut[][]>([[]])
  const cuts = history[history.length - 1]
  const [tool, setTool] = useState<Tool>('circle')
  const [picked, setPicked] = useState<Pt[]>([])
  const [cursor, setCursor] = useState<Pt | null>(null)
  const pressed = useRef<{ p: Pt; first: boolean } | null>(null)

  const [folds, setFoldsState] = useState<Fold[]>([])
  const foldsNow = useRef<Fold[]>([])
  const setFolds = (f: Fold[]) => {
    foldsNow.current = f
    setFoldsState(f)
  }
  /** How far the last fold has gone over (1 when the paper is at rest). */
  const [k, setK] = useState(1)
  const [busy, setBusy] = useState(false)
  const anim = useRef(0)
  const [line, setLine] = useState<FoldLine>('vertical')
  const [moving, setMoving] = useState<0 | 1>(1)
  const [turning, setTurning] = useState(false)
  const [showOpen, setShowOpen] = useState(false)

  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  const choices = foldLines(region(folds))
  const chosen = choices.find((c) => c.line === line) ?? choices[0]
  const maxed = folds.length >= MAX_FOLDS
  const plan = !busy && !maxed && chosen ? { ...chosen, moving } : null
  const cutting = !busy && !turning

  const forget = () => {
    setPicked([])
    pressed.current = null
  }

  /** Runs the last fold from one point to another, then calls done. */
  const animate = (from: number, to: number, done: () => void) => {
    cancelAnimationFrame(anim.current)
    setBusy(true)
    const finish = () => {
      setK(to)
      done()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()
    let t0 = -1
    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const p = Math.min(1, (now - t0) / FOLD_MS)
      setK(from + (to - from) * ease(p))
      if (p < 1) anim.current = requestAnimationFrame(tick)
      else finish()
    }
    anim.current = requestAnimationFrame(tick)
  }

  const fold = () => {
    if (!plan) return
    forget()
    setFolds([...foldsNow.current, plan])
    setK(0)
    animate(0, 1, () => setBusy(false))
  }
  /** Undoes the last fold, then carries on with `then` (or stops). */
  const unfold = (then?: () => void) => {
    if (!foldsNow.current.length) return setBusy(false)
    forget()
    animate(1, 0, () => {
      setFolds(foldsNow.current.slice(0, -1))
      setK(1)
      if (then) then()
      else setBusy(false)
    })
  }
  const openAll = () => {
    const step = () => (foldsNow.current.length ? unfold(step) : setBusy(false))
    step()
  }

  // Cutting: a drag from the first point gives the second; otherwise each tap adds a corner.
  const onDown = (p: Pt) => {
    const first = picked.length === 0
    if (first) setPicked([p])
    pressed.current = { p, first }
    setCursor(p)
  }
  const onMove = (p: Pt) => setCursor(p)
  const onUp = (p: Pt) => {
    const press = pressed.current
    pressed.current = null
    if (!press) return
    const sofar = press.first ? [press.p] : picked
    const next = press.first && same(p, press.p) ? sofar : [...sofar, p]
    if (next.length < NEEDS[tool]) return setPicked(next)
    const shape = cutShape(tool, next)
    const cut = shape && punch(folds, tool, shape)
    if (cut && cut.holes.length) setHistory((h) => [...h, [...cuts, cut]])
    setPicked([])
  }

  const preview = (() => {
    if (!picked.length || !cursor || !cutting) return null
    const ps = [...picked, cursor]
    if (tool === 'triangle' && ps.length === 2) return cutShape('line', ps)
    return cutShape(tool, ps.slice(0, NEEDS[tool]))
  })()

  const loadSample = () => {
    cancelAnimationFrame(anim.current)
    setBusy(false)
    forget()
    scene.current?.reset()
    const s = sample()
    setFolds(s.folds)
    setK(1)
    setHistory((h) => [...h, s.cuts])
  }

  const hintOf = (d: Dict) => {
    if (turning) return d.punch.hintTurn
    return { circle: d.punch.hintCircle, line: d.punch.hintLine, rect: d.punch.hintRect, triangle: d.punch.hintTriangle }[tool]
  }
  const howOf = (d: Dict) => {
    if (maxed) return d.punch.maxed
    if (!chosen) return ''
    return d.sheet.how(d.sheet.halves[chosen.line][moving], d.sheet.halves[chosen.line][1 - moving])
  }
  const infoOf = (d: Dict) => {
    const n = folds.length
    if (!n) return cuts.length ? d.punch.opened : d.punch.empty
    return `${d.punch.layers(n)} ${cuts.length ? d.punch.guess : d.punch.cutNow}`
  }
  const other = both ? DICTS[otherLang] : undefined

  return (
    <Page title={t.title} back="">
      <section className="card explore-card">
        <div className="explore-seg sheet-tools" role="group" aria-label={t.tools}>
          {TOOLS.map(({ tool: tl, icon }) => (
            <button
              key={tl}
              type="button"
              aria-pressed={tool === tl}
              onClick={() => {
                setTool(tl)
                setTurning(false)
                forget()
              }}
            >
              <span className="sheet-icon" aria-hidden>
                {icon}
              </span>
              <BiLabel get={(d) => d.punch[tl]} />
            </button>
          ))}
        </div>

        <div className="fold-wrap">
          <PunchScene
            ref={scene}
            folds={folds}
            t={k}
            cuts={cuts}
            plan={plan}
            preview={preview}
            picked={cutting ? picked : []}
            cutting={cutting}
            label={t.scene}
            onDown={onDown}
            onMove={onMove}
            onUp={onUp}
          />
          {turning && (
            <div className="explore-zoom">
              <button type="button" className="btn icon" onClick={() => scene.current?.reset()} aria-label={tr.sheet.reset} title={tr.sheet.reset}>
                ⟲
              </button>
            </div>
          )}
        </div>
        <p className="explore-hint muted">
          {hintOf(tr)}
          {other && <span lang={otherLang}> · {hintOf(other)}</span>}
        </p>
        <label className="explore-switch">
          <input
            type="checkbox"
            checked={turning}
            onChange={(e) => {
              setTurning(e.target.checked)
              forget()
              if (!e.target.checked) scene.current?.reset()
            }}
          />
          <span>
            <BiLabel get={(d) => d.punch.turn} />
          </span>
        </label>
        <div className="sheet-edit">
          <button
            type="button"
            className="btn sheet-btn"
            disabled={history.length < 2 && !picked.length}
            onClick={() => (picked.length ? forget() : setHistory((h) => h.slice(0, -1)))}
          >
            <BiLabel get={(d) => d.sheet.undo} />
          </button>
          <button type="button" className="btn sheet-btn" disabled={!cuts.length} onClick={() => (forget(), setHistory((h) => [...h, []]))}>
            <BiLabel get={(d) => d.sheet.clear} />
          </button>
          <button type="button" className="btn sheet-btn" aria-label={t.sampleLabel} onClick={loadSample}>
            <BiLabel get={(d) => d.punch.sample} />
          </button>
        </div>
      </section>

      <section className="card explore-card">
        <div className="explore-seg sheet-lines" role="group" aria-label={tr.sheet.foldLine}>
          {FOLD_LINES.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={chosen?.line === l && !maxed}
              disabled={busy || maxed || !choices.some((c) => c.line === l)}
              onClick={() => setLine(l)}
            >
              <span className="sheet-icon" aria-hidden>
                {LINE_ICON[l]}
              </span>
              <BiLabel get={(d) => d.sheet.lines[l]} />
            </button>
          ))}
        </div>
        <button type="button" className="btn sheet-btn" disabled={!plan} onClick={() => setMoving(moving === 1 ? 0 : 1)}>
          ⇄ <BiLabel get={(d) => d.sheet.swap} />
        </button>
        <div className="punch-how">
          <BiBlock text={howOf(tr)} other={other && howOf(other)} lang={lang} otherLang={otherLang} />
        </div>
        <div className="punch-actions">
          <button type="button" className="btn sheet-btn" disabled={busy || !folds.length} onClick={() => unfold()}>
            <BiLabel get={(d) => d.punch.unfold} />
          </button>
          <button type="button" className="btn sheet-btn" disabled={busy || !folds.length} onClick={openAll}>
            <BiLabel get={(d) => d.punch.openAll} />
          </button>
          <button type="button" className="btn btn-primary sheet-btn" disabled={!plan} onClick={fold}>
            <BiLabel get={(d) => d.punch.fold} />
          </button>
        </div>
        <div className="explore-info" aria-live="polite">
          <BiBlock text={infoOf(tr)} other={other && infoOf(other)} lang={lang} otherLang={otherLang} />
        </div>
        {folds.length > 0 && (
          <label className="explore-switch">
            <input type="checkbox" checked={showOpen} onChange={(e) => setShowOpen(e.target.checked)} />
            <span>
              <BiLabel get={(d) => d.punch.showOpen} />
            </span>
          </label>
        )}
        {folds.length > 0 && showOpen && <OpenedSheet folds={folds} cuts={cuts} label={t.openedTitle} />}
      </section>

      <section className="card trick-card">
        <BiBlock text={t.rule} other={other?.punch.rule} lang={lang} otherLang={otherLang} />
      </section>
    </Page>
  )
}
