import { mmss } from '../lib/countdown'
import { useT } from '../lib/i18n'
import { useMockStore } from '../lib/mock'
import { href, useRoute } from '../lib/router'

/**
 * The Mock exam button in every page's top bar (/mock). Opened from a SAT page, the mock page starts with
 * SAT ticked. A dot shows while an exam waits to be resumed.
 */
export function MockLink() {
  const t = useT()
  const sat = useRoute().parts[0] === 'sat'
  const { current } = useMockStore()
  const open = current && !current.finished ? current : undefined
  const label = open ? t.mock.buttonResume(open.answers.filter(Boolean).length, open.items.length, mmss(open.seconds - open.used)) : t.mock.buttonSub
  return (
    <a className={`mock-link${open ? ' mock-link-open' : ''}`} href={href(sat ? 'mock?test=sat' : 'mock')} aria-label={`${t.mock.button}: ${label}`} title={label}>
      <span aria-hidden>📝</span>
      <span className="mock-link-text">{t.mock.button}</span>
    </a>
  )
}
