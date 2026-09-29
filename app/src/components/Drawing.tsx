import { useId } from 'react'
import type { Drawing, FigItem } from '../types'

/** The outline of one shape, drawn around (0, 0) pointing up, before it is moved and turned. */
function Shape({ it, fill }: { it: FigItem; fill: string }) {
  const r = it.size / 2
  switch (it.shape) {
    case 'poly': {
      const n = it.n ?? 3
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2
        return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
      })
      return <polygon points={pts.join(' ')} fill={fill} />
    }
    case 'circle':
      return <circle r={r} fill={fill} />
    case 'dot':
      return <circle r={r} fill="currentColor" />
    case 'dots': {
      const n = it.n ?? 1
      const gap = r * 0.9
      return (
        <>
          {Array.from({ length: n }, (_, i) => (
            <circle key={i} cx={(i - (n - 1) / 2) * gap} r={r * 0.3} fill="currentColor" />
          ))}
        </>
      )
    }
    case 'arrow':
      return <path d={`M0 ${r} V${-r} M${-r * 0.4} ${-r * 0.55} L0 ${-r} L${r * 0.4} ${-r * 0.55}`} fill="none" />
    case 'flag':
      return (
        <>
          <path d={`M${-r * 0.4} ${r} V${-r}`} fill="none" />
          <polygon points={`${-r * 0.4},${-r} ${r * 0.7},${-r * 0.55} ${-r * 0.4},${-r * 0.1}`} fill={fill} />
        </>
      )
    case 'ell':
      return <path d={`M${-r * 0.5} ${-r} V${r} H${r * 0.6}`} fill="none" />
    case 'plus':
      return <path d={`M${-r} 0 H${r} M0 ${-r} V${r}`} fill="none" />
  }
}

/** Where the parts of a 'quad' or 'oct' frame are: part i runs clockwise from the top. */
function sector(i: number, parts: number) {
  const a0 = (2 * Math.PI * i) / parts - Math.PI / 2
  const a1 = (2 * Math.PI * (i + 1)) / parts - Math.PI / 2
  const p = (a: number) => `${(50 + 42 * Math.cos(a)).toFixed(2)} ${(50 + 42 * Math.sin(a)).toFixed(2)}`
  return `M50 50 L${p(a0)} A42 42 0 0 1 ${p(a1)} Z`
}

/** The shapes of a drawing in its 100 × 100 box, for use inside another picture (the Learn tips). */
export function DrawingBody({ d }: { d: Drawing }) {
  const hatch = useId()
  const parts = d.frame === 'quad' ? 4 : d.frame === 'oct' ? 8 : 0
  return (
    <g stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" strokeWidth={1.4} />
        </pattern>
      </defs>
      {d.frame === 'square' && <rect x="8" y="8" width="84" height="84" fill="none" />}
      {parts > 0 && (
        <>
          {d.shaded?.map((i) => <path key={i} d={sector(i, parts)} fill="currentColor" stroke="none" />)}
          <circle cx="50" cy="50" r="42" fill="none" />
          {Array.from({ length: parts / 2 }, (_, i) => {
            const a = (Math.PI * i) / (parts / 2) - Math.PI / 2
            const dx = 42 * Math.cos(a), dy = 42 * Math.sin(a)
            return <line key={i} x1={50 - dx} y1={50 - dy} x2={50 + dx} y2={50 + dy} />
          })}
        </>
      )}
      {d.frame === 'circle' && <circle cx="50" cy="50" r="42" fill="none" />}
      {d.lines?.map(([x1, y1, x2, y2], i) => <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />)}
      {d.items.map((it, i) => (
        <g key={i} transform={`translate(${it.x} ${it.y}) rotate(${it.rot ?? 0})${it.flip ? ' scale(-1 1)' : ''}`}>
          <Shape it={it} fill={it.fill === 'solid' ? 'currentColor' : it.fill === 'hatch' ? `url(#${hatch})` : 'none'} />
        </g>
      ))}
    </g>
  )
}

/** A figure made by the generators, drawn in the text colour so it works in light and dark. */
export function DrawingView({ d, label }: { d: Drawing; label: string }) {
  return (
    <svg className="fig-svg" viewBox="0 0 100 100" role="img" aria-label={label}>
      <DrawingBody d={d} />
    </svg>
  )
}
