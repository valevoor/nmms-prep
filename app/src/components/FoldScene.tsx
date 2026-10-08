import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode, Ref } from 'react'
import { foldTree, hinge, netOffset, normals } from '../lib/diceFold'
import type { FoldNode, Side, Vec } from '../lib/diceFold'
import type { NetCell } from '../lib/generators/dice'

/**
 * An open dice folding into a cube, drawn with CSS 3D transforms on plain squares (no 3D library, so
 * the labels stay sharp and it costs a few kilobytes). The fold amount comes from the page; turning
 * the dice (drag, or the arrow keys) is kept here.
 */

export interface FoldHandle {
  reset(): void
}

interface Props {
  net: NetCell[]
  /** 0 flat, 1 folded into a dice. */
  t: number
  /** Opposite pairs to colour, or null for plain faces. */
  pairs: [string, string][] | null
  label: string
  ref?: Ref<FoldHandle>
}

/** Where a square sits next to the one it hangs from, and the edge it turns on. */
const PLACE: Record<Side, { dx: number; dy: number; origin: string }> = {
  right: { dx: 1, dy: 0, origin: '0 50%' },
  left: { dx: -1, dy: 0, origin: '100% 50%' },
  up: { dx: 0, dy: -1, origin: '50% 100%' },
  down: { dx: 0, dy: 1, origin: '50% 0' },
}
/** Light from the upper left, a little in front. */
const LIGHT: Vec = (() => {
  const v: Vec = [-0.35, -0.6, 0.72]
  const n = Math.hypot(...v)
  return v.map((x) => x / n) as Vec
})()
/** The starting view: nearly face-on while flat, turned to show three faces once folded. */
const pose = (t: number) => ({ tilt: -14 - 14 * t, spin: 10 + 26 * t })
const clamp = (x: number) => Math.max(-80, Math.min(80, x))

export function FoldScene({ net, t, pairs, label, ref }: Props) {
  const tree = useMemo(() => foldTree(net), [net])
  const [turn, setTurn] = useState({ tilt: 0, spin: 0 })
  const [side, setSide] = useState(300)
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; tilt: number; spin: number } | null>(null)

  useImperativeHandle(ref, () => ({ reset: () => setTurn({ tilt: 0, spin: 0 }) }), [])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSide(Math.min(e.contentRect.width, e.contentRect.height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Flat, the squares are sized so the net fits (up to 5 long); they grow as it folds, so the dice fills the stage.
  const span = Math.max(...net.map(([r]) => r)) - Math.min(...net.map(([r]) => r)) + 1
  const width = Math.max(...net.map(([, c]) => c)) - Math.min(...net.map(([, c]) => c)) + 1
  const flat = side / (Math.max(span, width) + 1.4)
  const S = Math.round(flat + (side / 3 - flat) * t)
  const base = pose(t)
  const tilt = clamp(base.tilt + turn.tilt)
  const spin = base.spin + turn.spin
  const ns = normals(tree, t, tilt, spin)
  const [ox, oy] = netOffset(net, tree.cell)
  const pairOf = new Map<string, number>()
  pairs?.forEach((p, i) => p.forEach((l) => pairOf.set(l, i)))

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, ...turn }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setTurn({ spin: d.spin + (e.clientX - d.x) * 0.6, tilt: clamp(d.tilt - (e.clientY - d.y) * 0.6) })
  }
  const onUp = () => (drag.current = null)
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [15, 0], ArrowDown: [-15, 0] }
    const s = step[e.key]
    if (!s) return
    e.preventDefault()
    setTurn((v) => ({ tilt: clamp(v.tilt + s[0]), spin: v.spin + s[1] }))
  }

  const face = (n: FoldNode): ReactNode => {
    const l = n.cell[2]
    const [x, y, z] = ns.get(l)!
    const inside = z < -0.02
    const light = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2])
    const pair = pairOf.get(l)
    const style: CSSProperties = { width: S, height: S }
    if (n.side) {
      const [ax, ay] = hinge(n.side, 90 * t)
      const p = PLACE[n.side]
      Object.assign(style, { left: p.dx * S, top: p.dy * S, transformOrigin: p.origin, transform: `rotateX(${ax}deg) rotateY(${ay}deg)` })
    } else Object.assign(style, { left: -S / 2, top: -S / 2 })
    return (
      <div key={l} className="fold-node" style={style}>
        <div
          className={`fold-skin${inside ? ' inside' : ''}`}
          style={{
            fontSize: Math.round(S * 0.42),
            background: inside ? undefined : pair === undefined ? undefined : `var(--fold-pair-${pair})`,
            filter: inside ? undefined : `brightness(${(0.72 + 0.28 * light).toFixed(3)})`,
          }}
        >
          <span>{l}</span>
        </div>
        {n.children.map(face)}
      </div>
    )
  }

  return (
    <div
      ref={box}
      className="fold-stage"
      style={{ perspective: S * 14 }}
      role="img"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <div
        className="fold-pivot"
        style={{ transform: `rotateX(${tilt}deg) rotateY(${spin}deg) translate3d(${-ox * S * (1 - t)}px, ${-oy * S * (1 - t)}px, ${(S / 2) * t}px)` }}
      >
        {face(tree)}
      </div>
    </div>
  )
}
