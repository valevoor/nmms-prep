import { useT } from '../lib/i18n'
import type { Compass4, Question } from '../types'

const STEP: Record<Compass4, [number, number]> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }

/** Where a walk goes: the corners of the path, starting at (0, 0). */
function walkPoints(path: [Compass4, number][]): [number, number][] {
  const pts: [number, number][] = [[0, 0]]
  for (const [d, n] of path) {
    const [x, y] = pts[pts.length - 1]
    pts.push([x + STEP[d][0] * n, y + STEP[d][1] * n])
  }
  return pts
}

const OPPOSITE: Record<Compass4, Compass4> = { N: 'S', S: 'N', E: 'W', W: 'E' }

/** A Start/End label, placed on the side away from the path (`away` is the direction the path leaves in). */
function Label({ at: [x, y], away, text }: { at: [number, number]; away: Compass4; text: string }) {
  const [dx, dy, anchor] = { N: [0, 18, 'middle'], S: [0, -10, 'middle'], E: [-9, 4, 'end'], W: [9, 4, 'start'] }[away] as [number, number, 'start' | 'middle' | 'end']
  return (
    <text className="map-label" x={x + dx} y={y + dy} textAnchor={anchor}>
      {text}
    </text>
  )
}

const W = 260
const H = 190
const PAD = 30

/**
 * Draws a Directions explanation: the walk (q.path) with its start and end, or the places (q.points),
 * plus an optional dashed line (q.link) and a compass. North is up.
 */
export function MapDiagram({ q }: { q: Question }) {
  const t = useT()
  if (!q.path && !q.points) return null
  const walk = q.path ? walkPoints(q.path) : []
  const named: [string, number, number][] = q.points ?? []
  const all = [...walk, ...named.map(([, x, y]) => [x, y] as [number, number])]
  const xs = all.map(([x]) => x)
  const ys = all.map(([, y]) => y)
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const s = Math.min((W - 2 * PAD - 30) / (maxX - minX || 1), (H - 2 * PAD) / (maxY - minY || 1))
  const X = (x: number) => PAD + (x - minX) * s + (W - 30 - 2 * PAD - (maxX - minX) * s) / 2
  const Y = (y: number) => H - PAD - (y - minY) * s - (H - 2 * PAD - (maxY - minY) * s) / 2
  const at = (name: string): [number, number] | undefined => {
    if (name === 'start') return walk[0]
    if (name === 'end') return walk[walk.length - 1]
    const p = named.find(([l]) => l === name)
    return p && [p[1], p[2]]
  }
  const link = q.link && [at(q.link[0]), at(q.link[1])]

  return (
    <svg className="map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={q.path ? q.path.map(([d, n]) => `${d} ${n}`).join(', ') : named.map(([l]) => l).join(', ')}>
      {link?.[0] && link[1] && <path className="map-link" d={`M${X(link[0][0])} ${Y(link[0][1])}L${X(link[1][0])} ${Y(link[1][1])}`} />}
      {walk.length > 1 && (
        <>
          <path className="map-walk" d={walk.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x)} ${Y(y)}`).join('')} />
          {q.path!.map(([, n], i) => {
            const [a, b] = [walk[i], walk[i + 1]]
            const [mx, my] = [(X(a[0]) + X(b[0])) / 2, (Y(a[1]) + Y(b[1])) / 2]
            const horizontal = a[1] === b[1]
            return (
              <text key={i} className="map-len" x={mx + (horizontal ? 0 : 6)} y={my + (horizontal ? -6 : 4)} textAnchor={horizontal ? 'middle' : 'start'}>
                {n}
              </text>
            )
          })}
          <circle className="map-start" cx={X(0)} cy={Y(0)} r={5} />
          <Label at={[X(0), Y(0)]} away={q.path![0][0]} text={t.common.start} />
          <circle className="map-end" cx={X(walk[walk.length - 1][0])} cy={Y(walk[walk.length - 1][1])} r={5} />
          <Label at={[X(walk[walk.length - 1][0]), Y(walk[walk.length - 1][1])]} away={OPPOSITE[q.path![q.path!.length - 1][0]]} text={t.common.end} />
        </>
      )}
      {named.map(([l, x, y]) => (
        <g key={l}>
          <circle className="map-point" cx={X(x)} cy={Y(y)} r={5} />
          <text className="map-label" x={X(x) + 9} y={Y(y) - 7}>
            {l}
          </text>
        </g>
      ))}
      <g className="map-compass" transform={`translate(${W - 18} 26)`}>
        <path d="M0 14V-12M-5 -6L0 -12L5 -6" />
        <text y={-16} textAnchor="middle">
          N
        </text>
      </g>
    </svg>
  )
}
