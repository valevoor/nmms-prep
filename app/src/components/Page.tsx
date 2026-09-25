import type { ReactNode } from 'react'
import { href } from '../lib/router'

interface Props {
  title: string
  back?: string
  right?: ReactNode
  wide?: boolean
  children: ReactNode
}

export function Page({ title, back, right, wide, children }: Props) {
  return (
    <div className={`page${wide ? ' page-wide' : ''}`}>
      <header className="topbar">
        {back !== undefined ? (
          <a className="back" href={href(back)} aria-label="Back">
            ←
          </a>
        ) : (
          <span className="logo" aria-hidden>
            N
          </span>
        )}
        <h1>{title}</h1>
        <div className="topbar-right">{right}</div>
      </header>
      <main>{children}</main>
    </div>
  )
}
