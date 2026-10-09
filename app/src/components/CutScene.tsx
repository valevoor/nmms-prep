import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, Ref } from 'react'
import { cutScene, fitScale, START_VIEW } from '../lib/cubeCut'
import type { CutDir, V2, View } from '../lib/cubeCut'

/**
 * A cube of small cubes with one cut, drawn as plain SVG from lib/cubeCut.ts. The cut and the gap come
 * from the page; turning the cube (drag, the arrow keys, or the page's turn buttons) is kept here.
 */

export interface CutHandle {
  reset(): void
  turn(deg: number): void
}

interface Props {
  n: number
  dir: CutDir
  k: number
  cut: boolean
  gap: number
  painted: boolean
  label: string
  ref?: Ref<CutHandle>
}

const clamp = (x: number) => Math.max(-80, Math.min(80, x))

export function CutScene({ n, dir, k, cut, gap, painted, label, ref }: Props) {
  const [view, setView] = useState<View>(START_VIEW)
  const drag = useRef<{ x: number; y: number } & View | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      reset: () => setView(START_VIEW),
      turn: (deg) => setView((v) => ({ ...v, yaw: v.yaw + deg })),
    }),
    [],
  )

  const scene = useMemo(() => cutScene(n, dir, k, cut, gap, view), [n, dir, k, cut, gap, view])
  const s = fitScale(n)
  const pts = (ps: V2[]) => ps.map(([x, y]) => `${(x * s).toFixed(1)},${(y * s).toFixed(1)}`).join(' ')

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, ...view }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setView({ yaw: d.yaw + (e.clientX - d.x) * 0.6, pitch: clamp(d.pitch + (e.clientY - d.y) * 0.45) })
  }
  const onUp = () => (drag.current = null)
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [15, 0], ArrowRight: [-15, 0], ArrowUp: [0, -15], ArrowDown: [0, 15] }
    const st = step[e.key]
    if (!st) return
    e.preventDefault()
    setView((v) => ({ yaw: v.yaw + st[0], pitch: clamp(v.pitch + st[1]) }))
  }

  return (
    <div
      className="cut-stage"
      role="img"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <svg viewBox="-180 -180 360 360" aria-hidden>
        {scene.squares.map((q, i) => (
          <polygon key={i} points={pts(q.pts)} className={`cut-sq ${q.kind === 'cut' ? 'new' : painted ? 'paint' : 'plain'} ${q.light}`} />
        ))}
        {scene.knife && <polygon points={pts(scene.knife)} className="cut-knife" />}
        {scene.labels &&
          gap > 0.3 &&
          (['a', 'b'] as const).map((p) => {
            const [x, y] = scene.labels![p]
            return (
              <g key={p} className="cut-label" transform={`translate(${(x * s).toFixed(1)} ${(y * s).toFixed(1)})`}>
                <circle r={14} />
                <text y={5} textAnchor="middle">
                  {p.toUpperCase()}
                </text>
              </g>
            )
          })}
      </svg>
    </div>
  )
}
