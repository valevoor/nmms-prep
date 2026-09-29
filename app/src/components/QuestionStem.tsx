import { useQuestionText } from '../lib/i18n/content'
import type { Question } from '../types'
import { FigureStem } from './FigureView'
import { NumberGrid } from './NumberGrid'
import { SeriesView } from './SeriesView'

interface Props {
  q: Question
  /** Answer text to write into the series' blank(s). */
  reveal?: string
  size?: 'md' | 'lg'
}

/** The question itself: a series or analogy, or (layout 'text') a sentence with an optional table and sequence. */
export function QuestionStem({ q, reveal, size = 'md' }: Props) {
  const { prompt } = useQuestionText(q)
  if (q.figures && q.layout !== 'text') return <FigureStem q={q} reveal={!!reveal} size={size} />
  if (q.layout !== 'text')
    return (
      <>
        <NumberGrid q={q} />
        <SeriesView terms={q.terms} reveal={reveal} size={size} layout={q.layout} />
      </>
    )
  // A number matrix is drawn as a boxed grid, and the answer is written into its blank(s).
  const matrix = q.pattern.startsWith('mx-')
  const fills = matrix && reveal ? reveal.split(', ') : []
  let blank = 0
  return (
    <div className={`stem stem-${size}`}>
      {q.figures && <FigureStem q={q} size={size} />}
      {q.table && (
        <table className={matrix ? 'matrix-table' : 'code-table'}>
          <tbody>
            {q.table.map((row, r) => (
              <tr key={r}>
                {row.map((cell, i) => {
                  const shown = cell === '?' && blank < fills.length ? fills[blank++] : undefined
                  return (
                    <td key={i} className={shown ? 'mx-revealed' : cell === '?' ? 'mx-blank' : undefined}>
                      {shown ?? cell}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="stem-prompt">{prompt}</p>
      {/* "= 11" stays on one line when an equation wraps. */}
      {q.terms.length > 0 && <p className="stem-seq">{q.terms.join('\u2002').replace(/ = /g, ' =\u00a0')}</p>}
    </div>
  )
}
