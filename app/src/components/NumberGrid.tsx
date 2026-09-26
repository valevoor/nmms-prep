import { useT } from '../lib/i18n'
import type { Question } from '../types'

/** The group's numbers as table values (Q3 lists squares of table numbers: 16 → 4). */
function cells(group: string, inGrid: Set<number>): number[] {
  return group
    .split(' ')
    .map(Number)
    .map((n) => (inGrid.has(n) ? n : Math.sqrt(n)))
}

/** The number table of a Number Patterns question. With `reveal`, the two pairs' cells are coloured. */
export function NumberGrid({ q, reveal }: { q: Question; reveal?: boolean }) {
  const t = useT()
  if (!q.grid) return null
  const all = new Set(q.grid.flat())
  const first = new Set(reveal ? cells(`${q.terms[0]} ${q.terms[1]}`, all) : [])
  const second = new Set(reveal && q.terms[3] === '?' ? cells(`${q.terms[2]} ${q.options[q.answer]}`, all) : [])
  return (
    <figure className="number-grid">
      <table aria-label={t.common.numberTable}>
        <tbody>
          {q.grid.map((row, r) => (
            <tr key={r}>
              {row.map((n) => (
                <td key={n} className={second.has(n) ? 'ng-second' : first.has(n) ? 'ng-first' : undefined}>
                  {n}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {reveal && (
        <figcaption>
          <span className="ng-key ng-first" /> {t.common.gridFirst} <span className="ng-key ng-second" /> {t.common.gridSecond}
        </figcaption>
      )}
    </figure>
  )
}
