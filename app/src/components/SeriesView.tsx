import type React from 'react'
import { fillBlanks } from '../lib/series'

/** Renders "a/b" as a stacked fraction, anything else as text. */
export function Term({ value }: { value: string }) {
  const frac = !value.includes(',') && value.match(/^(\d+)\/(\d+)$/)
  if (frac)
    return (
      <span className="frac" aria-label={`${frac[1]} over ${frac[2]}`}>
        <span>{frac[1]}</span>
        <span>{frac[2]}</span>
      </span>
    )
  return <>{value}</>
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
  layout?: 'series' | 'analogy'
}

/** What goes between neighbouring terms. */
const ANALOGY_SEPS = [':', '::', ':']

export function SeriesView({ terms, ops, opsShown, reveal, size = 'md', layout = 'series' }: Props) {
  const analogy = layout === 'analogy'
  const filled = reveal ? fillBlanks(terms, reveal) : terms
  // Screen readers skip the ":" separators, so spell the analogy out.
  const said = filled.map((t) => (t === '?' ? 'what' : t))
  const label = analogy ? `${said[0]} is to ${said[1]} as ${said[2]} is to ${said[3]}` : 'Number series'
  const shown = opsShown ?? ops?.length ?? 0
  // Long labels (×2+11) don't fit under the gaps on a phone, so show them as a list of steps instead.
  const asList = !!ops?.some((op) => op.length > 3)
  return (
    <div className={`series-scroll series-${size}`} style={{ '--n': terms.length } as React.CSSProperties}>
      <div className="series" style={{ gridTemplateColumns: `repeat(${terms.length - 1}, auto auto) auto` }} role="group" aria-label={label}>
        {filled.map((t, i) => {
          const blank = terms[i] === '?'
          return (
            <div key={i} className={`term${blank ? (reveal ? ' term-revealed' : ' term-blank') : ''}`} style={{ gridColumn: 2 * i + 1, gridRow: 1 }}>
              {blank && !reveal ? <span aria-label="missing number">?</span> : <Term value={t} />}
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
