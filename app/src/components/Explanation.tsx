import type { Question } from '../types'
import { DICTS, useT } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { useQuestionTexts } from '../lib/i18n/content'
import type { ShownText } from '../lib/i18n/content'
import { BiTag } from './Bi'
import { ClockFace } from './ClockFace'
import { FamilyTreeView } from './FamilyTreeView'
import { FigureStem } from './FigureView'
import { MapDiagram } from './MapDiagram'
import { NumberGrid } from './NumberGrid'
import { SeriesView } from './SeriesView'

export function Explanation({ q, size = 'md' }: { q: Question; size?: 'md' | 'lg' }) {
  const t = useT()
  const { first: text, second, lang, otherLang } = useQuestionTexts(q)
  // With both languages on, the rule, working and note are grouped by language (English together,
  // then Kannada) above the diagram. Parts that read the same in both (e.g. "3 × 2 = 6") appear once.
  const other = second && {
    rule: second.rule !== text.rule ? second.rule : '',
    working: second.working !== text.working ? second.working : '',
    note: second.note !== text.note ? second.note : undefined,
  }
  const grouped = !!other && !!(other.rule || other.working || other.note)
  return (
    <div className="explanation">
      {grouped ? (
        <div className="bi">
          <Words text={text} lang={lang} />
          <Words text={other} lang={otherLang} />
        </div>
      ) : (
        <Words text={text} lang={lang} part="rule" untagged />
      )}
      {q.figures && q.layout !== 'text' ? (
        <FigureStem q={q} reveal={q.kind !== 'rule'} size={size === 'lg' ? 'md' : 'sm'} />
      ) : q.kind === 'wrong' ? (
        // Show the repaired series: the fake number replaced by the right one (when there is one right value).
        q.fix && <SeriesView terms={q.terms.map((t, i) => (i === q.wrongIndex ? '?' : t))} ops={q.ops} reveal={q.fix} size={size} layout={q.layout} />
      ) : (
        (q.ops || q.layout === 'analogy') && (
          <SeriesView terms={q.terms} ops={q.ops} reveal={q.kind === 'rule' ? undefined : q.options[q.answer]} size={size} layout={q.layout} />
        )
      )}
      <NumberGrid q={q} reveal />
      <MapDiagram q={q} />
      <FamilyTreeView q={q} />
      <ClockFace q={q} />
      {!grouped && <Words text={text} lang={lang} part="after" untagged />}
      <p className="source">
        {q.generated ? t.common.madeByApp : `${t.common.bookQ(q.bookNo)} · ${q.keyFrom === 'book' ? t.common.keyFromBook : t.common.keyWorkedOut}`}
      </p>
    </div>
  )
}

/**
 * An explanation's words in one language: all of them, or only the rule (shown above the diagram) or
 * only what comes after it. The "Rule:" label is in the same language as the words.
 */
function Words({ text, lang, part, untagged }: { text: Pick<ShownText, 'rule' | 'working' | 'note'>; lang: Locale; part?: 'rule' | 'after'; untagged?: boolean }) {
  const t = DICTS[lang]
  return (
    <div className="expl-words" lang={untagged ? undefined : lang}>
      {part !== 'after' && text.rule && (
        <p className="rule">
          {!untagged && <BiTag lang={lang} />}
          <strong>{t.common.rule}</strong> {text.rule}
        </p>
      )}
      {part !== 'rule' && text.working && <p className="working">{text.working}</p>}
      {part !== 'rule' && text.note && <p className="note">{text.note}</p>}
    </div>
  )
}
