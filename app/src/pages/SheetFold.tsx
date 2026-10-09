import { useEffect, useRef, useState } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { Page } from '../components/Page'
import { SheetScene } from '../components/SheetScene'
import type { SheetHandle } from '../components/SheetScene'
import { FOLD_LINES, INKS, makeMark, NEEDS, sampleMarks } from '../lib/sheetFold'
import type { FoldLine, Mark, Pt, Tool } from '../lib/sheetFold'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

const FOLD_MS = 1300
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)
const TOOLS: { tool: Tool; icon: string }[] = [
  { tool: 'line', icon: '╱' },
  { tool: 'triangle', icon: '◺' },
  { tool: 'rect', icon: '▭' },
]
const LINE_ICON: Record<FoldLine, string> = { vertical: '┆', horizontal: '┄', diagonal: '╲', antidiagonal: '╱' }
const same = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1]

/** Figure fold transparent sheet (Ch 6): draw shapes on a see-through sheet and fold it in 3D. */
export function SheetFold() {
  const tr = useT()
  const t = tr.sheet
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const scene = useRef<SheetHandle>(null)

  const [history, setHistory] = useState<Mark[][]>([[]])
  const marks = history[history.length - 1]
  const [tool, setTool] = useState<Tool>('triangle')
  const [colour, setColour] = useState(1)
  const [filled, setFilled] = useState(true)
  const [picked, setPicked] = useState<Pt[]>([])
  const [cursor, setCursor] = useState<Pt | null>(null)
  const pressed = useRef<{ p: Pt; first: boolean } | null>(null)

  const [line, setLine] = useState<FoldLine>('vertical')
  const [moving, setMoving] = useState<0 | 1>(1)
  const [ghosts, setGhosts] = useState(false)
  const [k, setK] = useState(0)
  const [goal, setGoal] = useState(0)
  const anim = useRef(0)
  const kNow = useRef(0)
  const setFold = (v: number) => {
    kNow.current = v
    setK(v)
  }

  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  const push = (next: Mark[]) => setHistory((h) => [...h, next])
  const forget = () => {
    setPicked([])
    pressed.current = null
  }

  // Drawing: a drag from the first point gives the second; otherwise each tap adds a corner.
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
    const m = makeMark(tool, next, colour, filled)
    if (m) push([...marks, m])
    setPicked([])
  }

  const preview = (() => {
    if (!picked.length || !cursor) return null
    const ps = [...picked, cursor]
    if (tool === 'triangle' && ps.length === 2) return makeMark('line', ps, colour, false)
    return makeMark(tool, ps.slice(0, NEEDS[tool]), colour, filled)
  })()

  const foldTo = (target: number) => {
    cancelAnimationFrame(anim.current)
    forget()
    setGoal(target)
    if (target === 0) scene.current?.reset()
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

  /** A new fold line or half starts flat again. */
  const flatten = () => {
    cancelAnimationFrame(anim.current)
    setFold(0)
    setGoal(0)
    forget()
    scene.current?.reset()
  }

  const howOf = (d: Dict) => d.sheet.how(d.sheet.halves[line][moving], d.sheet.halves[line][1 - moving])
  const hintOf = (d: Dict) => {
    if (k > 0) return d.sheet.hintFolded
    return tool === 'line' ? d.sheet.hintLine : tool === 'rect' ? d.sheet.hintRect : d.sheet.hintTriangle
  }
  const infoOf = (d: Dict) => `${howOf(d)} ${k === 1 ? d.sheet.done : marks.length ? d.sheet.guess : d.sheet.empty}`
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
                forget()
              }}
            >
              <span className="sheet-icon" aria-hidden>
                {icon}
              </span>
              <BiLabel get={(d) => d.sheet[tl]} />
            </button>
          ))}
        </div>
        <div className="sheet-pen">
          <div className="sheet-inks" role="group" aria-label={t.colours}>
            {INKS.map((ink, i) => (
              <button
                key={i}
                type="button"
                className="sheet-ink"
                aria-pressed={colour === i}
                aria-label={t.inks[i]}
                title={t.inks[i]}
                style={{ background: ink }}
                onClick={() => setColour(i)}
              />
            ))}
          </div>
          <label className="explore-switch sheet-fill">
            <input type="checkbox" checked={filled} disabled={tool === 'line'} onChange={(e) => setFilled(e.target.checked)} />
            <span>
              <BiLabel get={(d) => d.sheet.filled} />
            </span>
          </label>
        </div>

        <div className="fold-wrap">
          <SheetScene
            ref={scene}
            marks={marks}
            preview={preview}
            picked={picked}
            line={line}
            moving={moving}
            t={k}
            ghosts={ghosts}
            label={t.scene}
            onDown={onDown}
            onMove={onMove}
            onUp={onUp}
          />
          {k > 0 && (
            <div className="explore-zoom">
              <button type="button" className="btn icon" onClick={() => scene.current?.reset()} aria-label={t.reset} title={t.reset}>
                ⟲
              </button>
            </div>
          )}
        </div>
        <p className="explore-hint muted">
          {hintOf(tr)}
          {other && <span lang={otherLang}> · {hintOf(other)}</span>}
        </p>
        <div className="sheet-edit">
          <button
            type="button"
            className="btn sheet-btn"
            disabled={history.length < 2 && !picked.length}
            onClick={() => (picked.length ? forget() : setHistory((h) => h.slice(0, -1)))}
          >
            <BiLabel get={(d) => d.sheet.undo} />
          </button>
          <button type="button" className="btn sheet-btn" disabled={!marks.length} onClick={() => (forget(), push([]))}>
            <BiLabel get={(d) => d.sheet.clear} />
          </button>
          <button
            type="button"
            className="btn sheet-btn"
            aria-label={t.sampleLabel}
            onClick={() => {
              flatten()
              push(sampleMarks(line, moving))
            }}
          >
            <BiLabel get={(d) => d.sheet.sample} />
          </button>
        </div>
      </section>

      <section className="card explore-card">
        <div className="explore-seg sheet-lines" role="group" aria-label={t.foldLine}>
          {FOLD_LINES.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={line === l}
              onClick={() => {
                setLine(l)
                flatten()
              }}
            >
              <span className="sheet-icon" aria-hidden>
                {LINE_ICON[l]}
              </span>
              <BiLabel get={(d) => d.sheet.lines[l]} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn sheet-btn"
          onClick={() => {
            setMoving(moving === 1 ? 0 : 1)
            flatten()
          }}
        >
          ⇄ <BiLabel get={(d) => d.sheet.swap} />
        </button>
        <div className="fold-controls">
          <label className="fold-slider">
            <span>
              <BiLabel get={(d) => d.sheet.flat} />
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(k * 100)}
              aria-label={t.slider}
              onChange={(e) => {
                cancelAnimationFrame(anim.current)
                forget()
                const v = Number(e.target.value) / 100
                if (v === 0) scene.current?.reset()
                setFold(v)
                setGoal(v > 0.5 ? 1 : 0)
              }}
            />
            <span>
              <BiLabel get={(d) => d.sheet.folded} />
            </span>
          </label>
          <button type="button" className="btn btn-primary" onClick={() => foldTo(goal === 1 ? 0 : 1)}>
            {goal === 1 ? <BiLabel get={(d) => d.sheet.unfold} /> : <BiLabel get={(d) => d.sheet.fold} />}
          </button>
        </div>
        <label className="explore-switch">
          <input type="checkbox" checked={ghosts} onChange={(e) => setGhosts(e.target.checked)} />
          <span>
            <BiLabel get={(d) => d.sheet.ghosts} />
          </span>
        </label>
        <div className="explore-info" aria-live="polite">
          <BiBlock text={infoOf(tr)} other={other && infoOf(other)} lang={lang} otherLang={otherLang} />
        </div>
      </section>

      <section className="card trick-card">
        <BiBlock text={t.rule} other={other?.sheet.rule} lang={lang} otherLang={otherLang} />
      </section>
    </Page>
  )
}
