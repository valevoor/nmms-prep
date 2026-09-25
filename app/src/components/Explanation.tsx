import type { Question } from '../types'
import { SeriesView } from './SeriesView'

export function Explanation({ q, size = 'md' }: { q: Question; size?: 'md' | 'lg' }) {
  return (
    <div className="explanation">
      <p className="rule">
        <strong>Rule:</strong> {q.rule}
      </p>
      {q.kind === 'wrong' ? (
        // Show the repaired series: the fake number replaced by the right one.
        <SeriesView terms={q.terms.map((t, i) => (i === q.wrongIndex ? '?' : t))} ops={q.ops} reveal={q.fix} size={size} layout={q.layout} />
      ) : (
        (q.ops || q.layout === 'analogy') && (
          <SeriesView terms={q.terms} ops={q.ops} reveal={q.kind === 'rule' ? undefined : q.options[q.answer]} size={size} layout={q.layout} />
        )
      )}
      <p className="working">{q.working}</p>
      {q.note && <p className="note">{q.note}</p>}
      <p className="source">
        {q.generated
          ? 'Practice question made by the app'
          : `Book Q${q.bookNo} · ${q.keyFrom === 'book' ? 'answer from the book key' : 'answer worked out by us (not in the book key)'}`}
      </p>
    </div>
  )
}
