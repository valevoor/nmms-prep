import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, Ref } from 'react'
import { foldTurn, INKS, LINES, reflect, snap } from '../lib/sheetFold'
import type { FoldLine, Mark, Pt } from '../lib/sheetFold'

/**
 * A transparent sheet with shapes drawn on it, folding along a line in 3D. Each half is its own flat
 * SVG; the moving one turns about the fold line with a CSS rotate3d, so its back (a mirror image)
 * comes down on top of the other half. While flat, the page gets the taps and drags for drawing;
 * once folding starts, dragging (or the arrow keys) turns the view instead.
 */

export interface SheetHandle {
  reset(): void
}

interface Props {
  marks: Mark[]
  /** The shape being drawn, shown faintly, and the corners picked so far. */
  preview: Mark | null
  picked: Pt[]
  line: FoldLine
  moving: 0 | 1
  /** 0 flat, 1 folded. */
  t: number
  /** Show, dashed, where the shapes will land. */
  ghosts: boolean
  label: string
  onDown(p: Pt): void
  onMove(p: Pt): void
  onUp(p: Pt): void
  ref?: Ref<SheetHandle>
}

const pts = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ')
/** The view tips back while the sheet is folding, so the half can be seen rising, and is face-on at both ends. */
const pose = (t: number) => ({ tilt: -26 * Math.sin(Math.PI * t), spin: 22 * Math.sin(Math.PI * t) })
const clamp = (x: number) => Math.max(-80, Math.min(80, x))
const GRID = [10, 20, 30, 40, 50, 60, 70, 80, 90]

function Shape({ m, ghost, faint }: { m: Mark; ghost?: boolean; faint?: boolean }) {
  const ink = INKS[m.colour]
  const common = { stroke: ink, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, opacity: faint ? 0.55 : 1 }
  const dash = ghost ? '2.5 2' : undefined
  if (m.kind === 'line') {
    const [[x1, y1], [x2, y2]] = m.pts
    return <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} strokeDasharray={dash} />
  }
  return <polygon points={pts(m.pts)} {...common} fill={m.filled && !ghost ? ink : 'none'} strokeDasharray={dash} />
}

export function SheetScene({ marks, preview, picked, line, moving, t, ghosts, label, onDown, onMove, onUp, ref }: Props) {
  const id = useId()
  const [turnBy, setTurnBy] = useState({ tilt: 0, spin: 0 })
  const [side, setSide] = useState(300)
  const box = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; tilt: number; spin: number } | null>(null)
  const drawing = t === 0

  useImperativeHandle(ref, () => ({ reset: () => setTurnBy({ tilt: 0, spin: 0 }) }), [])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSide(Math.min(e.contentRect.width, e.contentRect.height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const S = Math.round(side * 0.82)
  const base = pose(t)
  const tilt = clamp(base.tilt + (drawing ? 0 : turnBy.tilt))
  const spin = base.spin + (drawing ? 0 : turnBy.spin)
  const { axis, deg } = foldTurn(line, moving, t)
  const { ends, halves } = LINES[line]

  /** Where a pointer is on the flat sheet, in sheet units (0–100), on the grid. */
  const at = (e: PointerEvent<HTMLDivElement>): Pt => {
    const r = sheet.current!.getBoundingClientRect()
    return snap([((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100])
  }

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    if (drawing) return onDown(at(e))
    drag.current = { x: e.clientX, y: e.clientY, ...turnBy }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (drawing) return onMove(at(e))
    const d = drag.current
    if (d) setTurnBy({ spin: d.spin + (e.clientX - d.x) * 0.6, tilt: clamp(d.tilt - (e.clientY - d.y) * 0.6) })
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (drawing) return onUp(at(e))
    drag.current = null
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (drawing) return
    const step: Record<string, [number, number]> = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [15, 0], ArrowDown: [-15, 0] }
    const s = step[e.key]
    if (!s) return
    e.preventDefault()
    setTurnBy((v) => ({ tilt: clamp(v.tilt + s[0]), spin: v.spin + s[1] }))
  }

  const half = (h: 0 | 1) => {
    const clip = `${id}-half-${h}`
    const stays = h !== moving
    return (
      <svg viewBox="0 0 100 100" className="sheet-svg" aria-hidden>
        <defs>
          <clipPath id={clip}>
            <polygon points={pts(halves[h])} />
          </clipPath>
        </defs>
        <polygon className="sheet-paper" points={pts(halves[h])} />
        <g clipPath={`url(#${clip})`}>
          {GRID.map((g) => (
            <g key={g} className="sheet-grid">
              <line x1={g} y1={0} x2={g} y2={100} />
              <line x1={0} y1={g} x2={100} y2={g} />
            </g>
          ))}
          {ghosts && stays && marks.map((m, i) => <Shape key={`g${i}`} m={{ ...m, pts: m.pts.map((p) => reflect(line, p)) }} ghost />)}
          {marks.map((m, i) => (
            <Shape key={i} m={m} />
          ))}
          {preview && <Shape m={preview} faint />}
        </g>
        <polygon className="sheet-edge" points={pts(halves[h])} />
        <line className="sheet-fold" x1={ends[0][0]} y1={ends[0][1]} x2={ends[1][0]} y2={ends[1][1]} />
        {picked.map(([x, y], i) => (
          <circle key={i} className="sheet-pick" cx={x} cy={y} r={2.2} />
        ))}
      </svg>
    )
  }

  return (
    <div
      ref={box}
      className={`sheet-stage${drawing ? ' drawing' : ''}`}
      style={{ perspective: S * 3.2 }}
      role="img"
      aria-label={label}
      tabIndex={0}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={key}
    >
      <div
        ref={sheet}
        className="sheet-pivot"
        style={{ width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2, transform: drawing ? undefined : `rotateX(${tilt}deg) rotateY(${spin}deg)` }}
      >
        <div className="sheet-half">{half(moving === 1 ? 0 : 1)}</div>
        <div className="sheet-half" style={{ transform: t > 0 ? `translateZ(1px) rotate3d(${axis[0]}, ${axis[1]}, 0, ${deg}deg)` : undefined }}>
          {half(moving)}
        </div>
      </div>
    </div>
  )
}
