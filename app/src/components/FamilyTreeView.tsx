import type { Question } from '../types'

const COL = 62
const ROW = 70
const PAD = 26
const BOX_W = 34
const BOX_H = 26

/**
 * Draws a Blood Relations explanation: people in boxes (parents above children), lines for
 * parent → child, a double line for husband and wife, a bracket for brothers and sisters, and a
 * dashed line between the two people the question asks about (q.link).
 */
export function FamilyTreeView({ q }: { q: Question }) {
  if (!q.tree) return null
  const { people, lines } = q.tree
  const cols = people.map(([, c]) => c)
  const minCol = Math.min(...cols)
  const width = (Math.max(...cols) - minCol) * COL + 2 * PAD + BOX_W
  const height = Math.max(...people.map(([, , g]) => g)) * ROW + 2 * PAD + BOX_H
  const pos = new Map(people.map(([n, c, g]) => [n, [PAD + BOX_W / 2 + (c - minCol) * COL, PAD + BOX_H / 2 + g * ROW] as const]))
  const at = (n: string) => pos.get(n)!
  const link = q.link && pos.has(q.link[0]) && pos.has(q.link[1]) ? [at(q.link[0]), at(q.link[1])] : undefined

  return (
    <svg className="tree" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: `${Math.min(width * 1.4, 420)}px` }} role="img" aria-label={people.map(([n]) => n).join(', ')}>
      {lines.map(([a, b, kind]) => {
        const [[x1, y1], [x2, y2]] = [at(a), at(b)]
        if (kind === 'child') {
          const mid = (y1 + y2) / 2
          return <path key={a + b} className="tree-line" d={`M${x1} ${y1 + BOX_H / 2}V${mid}H${x2}V${y2 - BOX_H / 2}`} />
        }
        if (kind === 'married') {
          const [l, r] = x1 < x2 ? [x1, x2] : [x2, x1]
          return <path key={a + b} className="tree-line" d={`M${l + BOX_W / 2} ${y1 - 3}H${r - BOX_W / 2}M${l + BOX_W / 2} ${y1 + 3}H${r - BOX_W / 2}`} />
        }
        const top = Math.min(y1, y2) - BOX_H / 2 - 10
        return <path key={a + b} className="tree-line" d={`M${x1} ${y1 - BOX_H / 2}V${top}H${x2}V${y2 - BOX_H / 2}`} />
      })}
      {link && <path className="tree-link" d={`M${link[0][0]} ${link[0][1] + BOX_H / 2}Q${(link[0][0] + link[1][0]) / 2} ${Math.max(link[0][1], link[1][1]) + ROW * 0.55} ${link[1][0]} ${link[1][1] + BOX_H / 2}`} />}
      {people.map(([n]) => {
        const [x, y] = at(n)
        const asked = q.link?.includes(n)
        return (
          <g key={n} className={asked ? 'tree-person tree-asked' : 'tree-person'}>
            <rect x={x - BOX_W / 2} y={y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={7} />
            <text x={x} y={y} dominantBaseline="central" textAnchor="middle">
              {n}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
