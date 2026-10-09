import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, Ref } from 'react'
import { apply, AXIS, centre, creases, foldDeg, halfOf, mirror, pieceM4, region, side, snap, stack } from '../lib/punchFold'
import type { Cut, Fold, FoldLine, Pt } from '../lib/punchFold'

/**
 * A sheet of paper folding in 3D, with holes cut through it. Each piece of the sheet (one per layer)
 * is its own flat SVG of the whole sheet, clipped to that piece and placed with a CSS matrix3d; the
 * pieces the last fold moves turn about its line. The holes are a mask, so they are see-through.
 * While the paper is at rest and face-on, taps and drags cut shapes; otherwise they turn the view.
 */

export interface PunchHandle {
  reset(): void
}

interface Props {
  folds: Fold[]
  /** How far the last fold has gone over: 0 flat, 1 done. */
  t: number
  cuts: Cut[]
  /** The fold to make next, shown on the paper: the line and the half that turns over. */
  plan: { line: FoldLine; at: Pt; moving: 0 | 1 } | null
  /** The shape being cut, shown faintly, and the corners picked so far. */
  preview: Pt[] | null
  picked: Pt[]
  /** Taps cut; otherwise drags turn the view. */
  cutting: boolean
  label: string
  onDown(p: Pt): void
  onMove(p: Pt): void
  onUp(p: Pt): void
  ref?: Ref<PunchHandle>
}

const pts = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ')
/** The view tips back while a fold is turning, so it can be seen rising, and is face-on at both ends. */
const pose = (t: number) => ({ tilt: -26 * Math.sin(Math.PI * t), spin: 22 * Math.sin(Math.PI * t) })
const clamp = (x: number) => Math.max(-85, Math.min(85, x))
const GRID = [10, 20, 30, 40, 50, 60, 70, 80, 90]
/** How far apart the layers sit, in pixels, so they never flicker into each other. */
const GAP = 0.9

/** Which way a piece faces once the view is turned: its normal's z after rotateX(tilt) rotateY(spin). */
function facesFront([nx, ny, nz]: number[], tilt: number, spin: number): boolean {
  const a = (tilt * Math.PI) / 180, b = (spin * Math.PI) / 180
  return Math.sin(a) * ny + Math.cos(a) * (-Math.sin(b) * nx + Math.cos(b) * nz) >= 0
}

export function PunchScene({ folds, t, cuts, plan, preview, picked, cutting, label, onDown, onMove, onUp, ref }: Props) {
  const id = useId()
  const [turnBy, setTurnBy] = useState({ tilt: 0, spin: 0 })
  const [size, setSize] = useState(300)
  const box = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; tilt: number; spin: number } | null>(null)

  useImperativeHandle(ref, () => ({ reset: () => setTurnBy({ tilt: 0, spin: 0 }) }), [])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize(Math.min(e.contentRect.width, e.contentRect.height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pieces = useMemo(() => stack(folds), [folds])
  const lines = useMemo(() => creases(folds), [folds])
  const holes = useMemo(() => cuts.flatMap((c) => c.holes), [cuts])
  const S = Math.round(size * 0.82)
  const s = S / 100
  const last = folds[folds.length - 1]
  const moving = folds.length > 0 && t < 1
  const base = pose(moving ? t : 0)
  const tilt = clamp(base.tilt + (cutting ? 0 : turnBy.tilt))
  const spin = base.spin + (cutting ? 0 : turnBy.spin)
  const deg = foldDeg(folds, t)

  /** Where a pointer is on the flat sheet, in sheet units (0–100), on the grid. */
  const at = (e: PointerEvent<HTMLDivElement>): Pt => {
    const r = sheet.current!.getBoundingClientRect()
    return snap([((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100])
  }

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    if (cutting) return onDown(at(e))
    drag.current = { x: e.clientX, y: e.clientY, ...turnBy }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (cutting) return onMove(at(e))
    const d = drag.current
    if (d) setTurnBy({ spin: d.spin + (e.clientX - d.x) * 0.6, tilt: clamp(d.tilt - (e.clientY - d.y) * 0.6) })
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (cutting) return onUp(at(e))
    drag.current = null
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (cutting) return
    const step: Record<string, [number, number]> = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [15, 0], ArrowDown: [-15, 0] }
    const d = step[e.key]
    if (!d) return
    e.preventDefault()
    setTurnBy((v) => ({ tilt: clamp(v.tilt + d[0]), spin: v.spin + d[1] }))
  }

  // The half that folds next, and an arrow from it to where it lands.
  const plotted = (() => {
    if (!plan || !cutting) return null
    const half = halfOf(region(folds), plan, plan.moving)
    const from = centre(half)
    const [ux, uy] = AXIS[plan.line]
    const end = apply(mirror(plan.line, plan.at), from)
    const mid: Pt = [(from[0] + end[0]) / 2, (from[1] + end[1]) / 2]
    // Bow the arrow along the fold line, so it reads as turning over rather than sliding.
    const bow: Pt = [mid[0] - ux * 12, mid[1] - uy * 12]
    // The fold line across the paper: the half's corners that lie on it, furthest apart along it.
    const on = half.filter((q) => Math.abs(side(plan.line, plan.at, q)) < 1e-4).sort((a, b) => a[0] * ux + a[1] * uy - (b[0] * ux + b[1] * uy))
    const ends = [on[0], on[on.length - 1]]
    return { half, from, end, bow, ends }
  })()

  return (
    <div
      ref={box}
      className={`sheet-stage punch-stage${cutting ? ' drawing' : ''}`}
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
        style={{ width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2, transform: tilt || spin ? `rotateX(${tilt}deg) rotateY(${spin}deg)` : undefined }}
      >
        {pieces.map((p, i) => {
          const M = pieceM4(p, last, deg)
          const z = (moving && p.moves ? p.layer + (p.endLayer - p.layer) * t : moving ? p.layer : p.endLayer) * GAP
          const css = M.map((v, k) => (k === 12 || k === 13 || k === 14 ? v * s : v))
          css[14] += z
          const front = facesFront([M[8], M[9], M[10]], tilt, spin)
          const clip = `${id}-c${i}`
          const mask = `${id}-m${i}`
          return (
            <div key={i} className="punch-piece" style={{ width: S, height: S, transform: `matrix3d(${css.map((v) => +v.toFixed(5)).join(',')})` }}>
              <svg viewBox="0 0 100 100" className="sheet-svg" aria-hidden>
                <defs>
                  <clipPath id={clip}>
                    <polygon points={pts(p.poly)} />
                  </clipPath>
                  <mask id={mask} maskUnits="userSpaceOnUse" x={-10} y={-10} width={120} height={120}>
                    <rect x={-10} y={-10} width={120} height={120} fill="#fff" />
                    {holes.map((h, j) => (
                      <polygon key={j} points={pts(h)} fill="#000" />
                    ))}
                  </mask>
                </defs>
                <g clipPath={`url(#${clip})`}>
                  <g mask={`url(#${mask})`}>
                    <polygon className={front ? 'punch-front' : 'punch-back'} points={pts(p.poly)} />
                    {GRID.map((g) => (
                      <g key={g} className="punch-grid">
                        <line x1={g} y1={0} x2={g} y2={100} />
                        <line x1={0} y1={g} x2={100} y2={g} />
                      </g>
                    ))}
                    {lines.map(([a, b], j) => (
                      <line key={j} className="punch-crease" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
                    ))}
                  </g>
                  {holes.map((h, j) => (
                    <polygon key={j} className="punch-cut" points={pts(h)} />
                  ))}
                </g>
                <polygon className="punch-edge" points={pts(p.poly)} />
              </svg>
            </div>
          )
        })}
      </div>
      {cutting && (
        <svg
          viewBox="0 0 100 100"
          className="punch-overlay"
          style={{ width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2 }}
          aria-hidden
        >
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="punch-arrow-head" />
            </marker>
          </defs>
          {plotted && (
            <g>
              <polygon className="punch-plan-half" points={pts(plotted.half)} />
              <line className="punch-plan-line" x1={plotted.ends[0][0]} y1={plotted.ends[0][1]} x2={plotted.ends[1][0]} y2={plotted.ends[1][1]} />
              <path
                className="punch-plan-arrow"
                d={`M${plotted.from.join(',')} Q${plotted.bow.join(',')} ${plotted.end.join(',')}`}
                markerEnd={`url(#${id}-arrow)`}
              />
            </g>
          )}
          {preview && <polygon className="punch-preview" points={pts(preview)} />}
          {picked.map(([x, y], i) => (
            <circle key={i} className="sheet-pick" cx={x} cy={y} r={1.8} />
          ))}
        </svg>
      )}
    </div>
  )
}

/** The sheet opened out flat, with every hole and crease: the answer to "what does it look like opened?". */
export function OpenedSheet({ folds, cuts, label }: { folds: Fold[]; cuts: Cut[]; label: string }) {
  const id = useId()
  const lines = useMemo(() => creases(folds), [folds])
  const holes = cuts.flatMap((c) => c.holes)
  return (
    <svg viewBox="-3 -3 106 106" className="punch-opened" role="img" aria-label={label}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-10} y={-10} width={120} height={120}>
          <rect x={-10} y={-10} width={120} height={120} fill="#fff" />
          {holes.map((h, j) => (
            <polygon key={j} points={pts(h)} fill="#000" />
          ))}
        </mask>
      </defs>
      <rect x={-3} y={-3} width={106} height={106} className="punch-desk" />
      <g mask={`url(#${id})`}>
        <rect width={100} height={100} className="punch-front" />
        {lines.map(([a, b], j) => (
          <line key={j} className="punch-crease" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      {holes.map((h, j) => (
        <polygon key={j} className="punch-cut" points={pts(h)} />
      ))}
      <rect width={100} height={100} className="punch-edge" />
    </svg>
  )
}
