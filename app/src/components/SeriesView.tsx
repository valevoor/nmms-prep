import type React from 'react'
import { useT } from '../lib/i18n'
import { fillBlanks } from '../lib/series'

/** Renders "a/b" as a stacked fraction, and "6:32 8/11" as 6:32 with a stacked 8/11; anything else as text. */
export function Term({ value }: { value: string }) {
  const t = useT()
  // Also letter "fractions" such as 17/GA (Chapter 18), and a whole part before the fraction (clock times).
  const frac = !value.includes(',') && value.match(/^(?:(\S+) )?([0-9A-Z]+)\/([0-9A-Z]+)$/)
  if (frac)
    return (
      <>
        {frac[1] && <>{frac[1]}&nbsp;</>}
        <span className="frac" aria-label={t.series.over(frac[2], frac[3])}>
          <span>{frac[2]}</span>
          <span>{frac[3]}</span>
        </span>
      </>
    )
  // A group of numbers from a table (Number Patterns): wider gaps so 1 11 15 21 reads as four numbers.
  return <>{/^\d+( \d+)+$/.test(value) ? value.replace(/ /g, '\u2002') : value}</>
}

const spaced = (op: string) => op.replace(/([+−×÷])/g, ' $1 ').replace(/\s+/g, ' ').trim()

interface Props {
  terms: string[]
  /** Operation labels under each gap, shown bracket-style like the book. */
  ops?: string[]
  /** How many ops to show (for step-by-step reveal). Defaults to all. */
  opsShown?: number
  /** Answer text to write into the blank(s). */
  reveal?: string
  size?: 'md' | 'lg'
  /** 'analogy' shows "A : B :: C : D" instead of commas. */
  /** 'odd' (odd one out) has no series to show: the question is just the options. */
  layout?: 'series' | 'analogy' | 'odd' | 'text'
}

/** What goes between neighbouring terms. */
const ANALOGY_SEPS = [':', '::', ':']

export function SeriesView({ terms, ops, opsShown, reveal, size = 'md', layout = 'series' }: Props) {
  const tr = useT()
  if (layout === 'odd' || layout === 'text') return null
  const analogy = layout === 'analogy'
  const filled = reveal ? fillBlanks(terms, reveal) : terms
  // Screen readers skip the ":" separators, so spell the analogy out.
  const said = filled.map((t) => (t === '?' ? tr.series.what : t))
  const label = analogy ? tr.series.isToAs(said[0], said[1], said[2], said[3]) : tr.series.numberSeries
  const shown = opsShown ?? ops?.length ?? 0
  const cell = (i: number) => {
    const blank = terms[i] === '?'
    return blank && !reveal ? <span aria-label={tr.series.missingNumber}>?</span> : <Term value={filled[i]} />
  }
  const cls = (i: number) => `term${terms[i] === '?' ? (reveal ? ' term-revealed' : ' term-blank') : ''}`
  // An analogy wraps after "::" when it doesn't fit one line (LIGHT : KMHJFHGISU :: SOUND : ? on a phone).
  if (analogy && !ops)
    return (
      <div className={`series-scroll series-${size} analogy-wrap`} style={{ '--n': Math.max(terms.length, Math.ceil(Math.max(filled[0].length + filled[1].length, filled[2].length + filled[3].length) / 3)) } as React.CSSProperties} role="group" aria-label={label}>
        {[0, 2].map((i) => (
          <span key={i} className="pair">
            <span className={cls(i)}>{cell(i)}</span>
            <span className="comma sep" aria-hidden>
              :
            </span>
            <span className={cls(i + 1)}>{cell(i + 1)}</span>
            {i === 0 && (
              <span className="comma sep" aria-hidden>
                ::
              </span>
            )}
          </span>
        ))}
      </div>
    )
  // Long labels (×2+11) don't fit under the gaps on a phone, so show them as a list of steps instead.
  const asList = !!ops?.some((op) => op.length > 3)
  return (
    <div className={`series-scroll series-${size}`} style={{ '--n': terms.length } as React.CSSProperties}>
      <div className="series" style={{ gridTemplateColumns: `repeat(${terms.length - 1}, auto auto) auto` }} role="group" aria-label={label}>
        {filled.map((_, i) => {
          return (
            <div key={i} className={cls(i)} style={{ gridColumn: 2 * i + 1, gridRow: 1 }}>
              {cell(i)}
            </div>
          )
        })}
        {terms.slice(1).map((_, i) => (
          <div key={`c${i}`} className={analogy ? 'comma sep' : 'comma'} style={{ gridColumn: 2 * i + 2, gridRow: 1 }} aria-hidden>
            {analogy ? ANALOGY_SEPS[i] : ','}
          </div>
        ))}
        {!asList &&
          ops?.slice(0, shown).map((op, i) => (
            <div key={i} className="op" style={{ gridColumn: 2 * i + 2, gridRow: 2 }}>
              <span>{op}</span>
            </div>
          ))}
      </div>
      {asList && shown > 0 && (
        <ol className="steps">
          {ops!.slice(0, shown).map((op, i) => {
            const hit = terms[i + 1] === '?'
            return (
              <li key={i} className={hit ? 'step-hit' : undefined}>
                {filled[i]} <span className="step-op">{spaced(op)}</span> = <b>{hit && !reveal ? '?' : filled[i + 1]}</b>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
