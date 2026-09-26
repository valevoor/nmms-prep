import { useQuestionText } from '../lib/i18n/content'
import type { Question } from '../types'
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
  if (q.layout !== 'text') return <SeriesView terms={q.terms} reveal={reveal} size={size} layout={q.layout} />
  return (
    <div className={`stem stem-${size}`}>
      {q.table && (
        <table className="code-table">
          <tbody>
            {q.table.map((row) => (
              <tr key={row.join()}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="stem-prompt">{prompt}</p>
      {q.terms.length > 0 && <p className="stem-seq">{q.terms.join('\u2002')}</p>}
    </div>
  )
}
