import type { Question } from '../types'
import { useT } from '../lib/i18n'
import { useQuestionText } from '../lib/i18n/content'
import { SeriesView } from './SeriesView'

export function Explanation({ q, size = 'md' }: { q: Question; size?: 'md' | 'lg' }) {
  const t = useT()
  const text = useQuestionText(q)
  return (
    <div className="explanation">
      <p className="rule">
        <strong>{t.common.rule}</strong> {text.rule}
      </p>
      {q.kind === 'wrong' ? (
        // Show the repaired series: the fake number replaced by the right one (when there is one right value).
        q.fix && <SeriesView terms={q.terms.map((t, i) => (i === q.wrongIndex ? '?' : t))} ops={q.ops} reveal={q.fix} size={size} layout={q.layout} />
      ) : (
        (q.ops || q.layout === 'analogy') && (
          <SeriesView terms={q.terms} ops={q.ops} reveal={q.kind === 'rule' ? undefined : q.options[q.answer]} size={size} layout={q.layout} />
        )
      )}
      <p className="working">{text.working}</p>
      {text.note && <p className="note">{text.note}</p>}
      <p className="source">
        {q.generated ? t.common.madeByApp : `${t.common.bookQ(q.bookNo)} · ${q.keyFrom === 'book' ? t.common.keyFromBook : t.common.keyWorkedOut}`}
      </p>
    </div>
  )
}
