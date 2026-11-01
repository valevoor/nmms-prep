import type { ReactNode } from 'react'
import { hasMath, parse } from '../lib/mathText'
import type { MathNode } from '../lib/mathText'

function draw(nodes: MathNode[]): ReactNode[] {
  return nodes.map((n, i) => {
    if (typeof n === 'string') return n
    if ('frac' in n)
      return (
        <span key={i} className="math-frac">
          <span className="math-num">{draw(n.frac[0])}</span>
          <span className="math-den">{draw(n.frac[1])}</span>
        </span>
      )
    if ('root' in n)
      return (
        <span key={i} className="math-root">
          <svg className="math-root-sign" viewBox="0 0 10 20" preserveAspectRatio="none" aria-hidden>
            <path d="M0.5 12.5 L2.6 11 L5.2 19.4 L9.6 0.6 L10 0.6" />
          </svg>
          <span className="math-radicand">{draw(n.root)}</span>
        </span>
      )
    return <sup key={i}>{n.sup}</sup>
  })
}

/**
 * A line of maths drawn as the paper prints it: "27/169" as a stacked fraction, "√(…)" with a bar over what
 * it covers (lib/mathText.ts reads the text). Screen readers get the text as written.
 */
export function MathText({ text }: { text: string }) {
  const nodes = parse(text)
  if (!hasMath(nodes)) return <>{text}</>
  return (
    <>
      <span className="math" aria-hidden>
        {draw(nodes)}
      </span>
      <span className="math-sr">{text}</span>
    </>
  )
}
