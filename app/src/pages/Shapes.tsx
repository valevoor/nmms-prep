import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Page } from '../components/Page'
import { AREA, PERIMETER, SHAPE_IDS, SHAPE_STEPS, SOLID_HEIGHT, SURFACE_AREA, VOLUME } from '../data/shapes'
import type { ShapeId, ShapeStep } from '../data/shapes'
import { halfDrawing, perimeterDrawing, rowsDrawing, slicesDrawing, STAGE_H, STAGE_W } from '../lib/flatShapes'
import type { Flat, Ink, Mark } from '../lib/flatShapes'
import { BiBlock, BiInline, BiLabel } from '../components/Bi'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'
import { href } from '../lib/router'
import { project, solidNet, stack } from '../lib/solids'
import type { DrawnFace, View } from '../lib/solids'

/** How far along each step's slider starts, in %. */
const START: Record<ShapeStep, number> = { perimeter: 60, area: 60, volume: 100, net: 40 }
const START_VIEW: View = { yaw: -30, pitch: 25 }
const clampPitch = (p: number) => Math.max(-85, Math.min(85, p))

const colour = (ink: Ink, line: boolean) => {
  switch (ink) {
    case 'grid':
      return 'var(--shape-grid)'
    case 'ink':
      return 'var(--text)'
    case 'muted':
      return 'var(--muted)'
    case 'dot':
      return line ? 'var(--accent-ink)' : 'var(--accent)'
    default:
      return line ? `var(--shape-${ink}-line)` : `var(--shape-${ink})`
  }
}

function MarkPath({ m }: { m: Mark }) {
  return (
    <path
      d={m.d}
      transform={m.transform}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{
        fill: m.fill ? colour(m.fill, false) : 'none',
        fillOpacity: m.fillAlpha,
        stroke: m.stroke ? colour(m.stroke, true) : 'none',
        strokeWidth: m.sw ?? 2,
        strokeDasharray: m.dash,
        strokeDashoffset: m.offset,
        opacity: m.opacity,
      }}
    />
  )
}

function FacePath({ f }: { f: DrawnFace }) {
  return (
    <>
      <path
        d={f.d}
        strokeLinejoin="round"
        style={{ fill: colour(f.hue, false), fillOpacity: f.alpha, stroke: colour(f.hue, true), strokeWidth: f.thin ? 0.6 : 2 }}
      />
      {f.grid && <path d={f.grid} style={{ fill: 'none', stroke: 'var(--text)', strokeOpacity: 0.22, strokeWidth: 1 }} />}
    </>
  )
}

type ShapesDict = Dict['shapes']

/** What the drawing shows right now: how far the dot has walked, how many rows or layers are filled. */
interface Counts {
  walked: number
  total: number
  rows: number
  perRow: number
  layers: number
}

/** The page's sentences in one language, so EN+ಕ can show them in both. */
function words(t: ShapesDict, shape: ShapeId, step: ShapeStep, p: number, c: Counts) {
  switch (step) {
    case 'perimeter':
      return {
        slider: t.slider.perimeter,
        say: t.walked(c.walked, c.total),
        formula: `${shape === 'circle' ? t.circumference : t.perimeter} = ${PERIMETER[shape].rule} = ${PERIMETER[shape].work} = ${PERIMETER[shape].value} ${t.units}`,
        rule: '',
      }
    case 'area': {
      const formula = `${t.area} = ${AREA[shape].rule} = ${AREA[shape].work} = ${AREA[shape].value} ${t.sqUnits}`
      if (shape === 'square' || shape === 'rect') return { slider: t.slider.rows, say: t.rows(c.rows, c.perRow), formula, rule: '' }
      if (shape === 'tri') return { slider: t.slider.half, say: p > 0.98 ? t.halfDone : t.halfTodo, formula, rule: '' }
      return { slider: t.slider.slices, say: p > 0.98 ? t.slicesDone : t.slicesTodo, formula, rule: '' }
    }
    case 'volume':
      return {
        slider: t.slider.volume,
        say: `${t.stack[shape]} ${t.heightNow(c.layers)}`,
        formula: `${t.volume} = ${t.baseTimesHeight} = ${AREA[shape].value} × ${c.layers} = ${AREA[shape].value * c.layers} ${t.cubicUnits}`,
        rule: `${t.solids[shape]}: ${VOLUME[shape].rule} = ${VOLUME[shape].work} = ${VOLUME[shape].value}`,
      }
    case 'net':
      return {
        slider: t.slider.net,
        say: t.net[shape],
        formula: `${t.surfaceArea} = ${SURFACE_AREA[shape].work} = ${SURFACE_AREA[shape].value} ${t.sqUnits}`,
        rule: `${t.solids[shape]}: ${SURFACE_AREA[shape].rule}`,
      }
  }
}

/** Walk the edge, fill the inside, stack it into a solid, open the solid flat. The solids turn in 3D. */
export function Shapes({ shape, step }: { shape: ShapeId; step: ShapeStep }) {
  const t = useT().shapes
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const [pctBy, setPctBy] = useState<Record<string, number>>({})
  const pct = pctBy[`${shape}/${step}`] ?? START[step]
  const p = pct / 100
  const [view, setView] = useState<View>(START_VIEW)
  const [spin, setSpin] = useState(false)
  const drag = useRef<{ x: number; y: number; from: View } | null>(null)
  const solid = step === 'volume' || step === 'net'

  useEffect(() => {
    if (!spin || !solid) return
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const dt = now - last
      last = now
      setView((v) => ({ ...v, yaw: v.yaw + dt * 0.04 }))
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [spin, solid])

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, from: view }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    setView({ yaw: d.from.yaw + (e.clientX - d.x) * 0.6, pitch: clampPitch(d.from.pitch + (e.clientY - d.y) * 0.5) })
  }
  const onUp = () => {
    drag.current = null
  }

  let flat: Flat | undefined
  let faces: DrawnFace[] = []
  const counts: Counts = { walked: 0, total: 0, rows: 0, perRow: 0, layers: 0 }
  switch (step) {
    case 'perimeter': {
      const d = perimeterDrawing(shape, p)
      flat = d
      counts.walked = d.walked
      counts.total = d.total
      break
    }
    case 'area':
      if (shape === 'square' || shape === 'rect') {
        const d = rowsDrawing(shape, p)
        flat = d
        counts.rows = d.rows
        counts.perRow = d.perRow
      } else flat = shape === 'tri' ? halfDrawing(p) : slicesDrawing(p)
      break
    case 'volume': {
      const H = SOLID_HEIGHT[shape]
      counts.layers = Math.round(p * H)
      faces = project(stack(shape, counts.layers), view, STAGE_W, STAGE_H, false, stack(shape, H))
      break
    }
    case 'net':
      faces = project(solidNet(shape, p), view, STAGE_W, STAGE_H, p > 0.6)
      break
  }
  const w = words(t, shape, step, p, counts)
  const w2 = both ? words(DICTS[otherLang].shapes, shape, step, p, counts) : undefined

  const turn = (dy: number, dp: number) => () => setView((v) => ({ yaw: v.yaw + dy, pitch: clampPitch(v.pitch + dp) }))

  return (
    <Page title={t.title} back="">
      <nav className="shape-chips" aria-label={t.shapeLabel}>
        {SHAPE_IDS.map((s) => (
          <a key={s} href={href(`shapes/${s}/${step}`)} aria-current={s === shape ? 'page' : undefined}>
            <BiLabel get={(d) => d.shapes.names[s]} />
          </a>
        ))}
      </nav>
      <nav className="facts-tabs shape-steps" aria-label={t.stepLabel}>
        {SHAPE_STEPS.map((s) => (
          <a key={s} href={href(`shapes/${shape}/${s}`)} aria-current={s === step ? 'page' : undefined}>
            <BiLabel get={(d) => d.shapes.steps[s]} />
          </a>
        ))}
      </nav>

      <section className="card shape-card">
        <div className={`shape-stage${solid ? ' shape-stage-3d' : ''}`}>
          <svg
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            role="img"
            aria-label={t.drawing(step === 'volume' || step === 'net' ? t.solids[shape] : t.names[shape], t.steps[step])}
            onPointerDown={solid ? onDown : undefined}
            onPointerMove={solid ? onMove : undefined}
            onPointerUp={solid ? onUp : undefined}
            onPointerCancel={solid ? onUp : undefined}
          >
            {flat?.marks.map((m, i) => <MarkPath key={i} m={m} />)}
            {flat?.labels.map((l, i) => (
              <text key={`l${i}`} className="shape-label" x={l.x} y={l.y}>
                {l.text}
              </text>
            ))}
            {faces.map((f, i) => (
              <FacePath key={i} f={f} />
            ))}
            {faces.map(
              (f, i) =>
                f.label && (
                  <text key={`f${i}`} className="shape-label" x={f.label.x} y={f.label.y}>
                    {f.label.text}
                  </text>
                ),
            )}
          </svg>
          {solid && <p className="shape-hint muted">{t.drag}</p>}
        </div>

        {solid && (
          <div className="shape-turn" role="group" aria-label={t.turnGroup}>
            <button type="button" className="btn icon" onClick={turn(-20, 0)} aria-label={t.turnLeft}>
              ↺
            </button>
            <button type="button" className="btn icon" onClick={turn(20, 0)} aria-label={t.turnRight}>
              ↻
            </button>
            <button type="button" className="btn icon" onClick={turn(0, 15)} aria-label={t.tiltUp}>
              ↑
            </button>
            <button type="button" className="btn icon" onClick={turn(0, -15)} aria-label={t.tiltDown}>
              ↓
            </button>
            <button type="button" className="btn wide" aria-pressed={spin} onClick={() => setSpin((s) => !s)}>
              {spin ? t.stop : t.spin}
            </button>
            <button
              type="button"
              className="btn wide"
              onClick={() => {
                setSpin(false)
                setView(START_VIEW)
              }}
            >
              {t.reset}
            </button>
          </div>
        )}

        <label className="shape-slider">
          <span>
            <BiInline first={w.slider} other={w2?.slider} otherLang={otherLang} stacked />
          </span>
          <input type="range" min={0} max={100} value={pct} onChange={(e) => setPctBy((m) => ({ ...m, [`${shape}/${step}`]: Number(e.target.value) }))} />
        </label>
      </section>

      <section className="card shape-text">
        <BiBlock text={w.say} other={w2?.say} lang={lang} otherLang={otherLang} />
        <div className="shape-formula">
          <BiBlock text={w.formula} other={w2?.formula} lang={lang} otherLang={otherLang} />
        </div>
        {w.rule && <BiBlock className="shape-rule muted" text={w.rule} other={w2?.rule} lang={lang} otherLang={otherLang} />}
      </section>
    </Page>
  )
}
