import type { ReactNode } from 'react'
import { useT } from '../lib/i18n'
import { href } from '../lib/router'
import { BothToggle } from './Bi'
import { MockLink } from './MockLink'
import { SettingsMenu } from './SettingsMenu'

interface Props {
  title: string
  back?: string
  right?: ReactNode
  /** Leaves out the Mock exam button: on the mock exam itself and while a timed test runs, so it can't interrupt one. */
  hideMock?: boolean
  wide?: boolean
  children: ReactNode
}

export function Page({ title, back, right, hideMock, wide, children }: Props) {
  const t = useT()
  return (
    <div className={`page${wide ? ' page-wide' : ''}`}>
      <header className="topbar">
        {back !== undefined ? (
          <a className="back" href={href(back)} aria-label={t.common.back}>
            ←
          </a>
        ) : (
          <span className="logo" aria-hidden>
            N
          </span>
        )}
        <h1>{title}</h1>
        {!hideMock && <MockLink />}
        <BothToggle />
        <div className="topbar-right">{right}</div>
        {back !== undefined && <SettingsMenu />}
      </header>
      <main>{children}</main>
    </div>
  )
}
