import type { ReactNode } from 'react'
import { DICTS, setBoth, useBothAvailable, useBothSetting, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict, Locale } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

/** Short language tags shown before each version when both are on. */
const TAGS: Record<Locale, string> = { en: 'EN', kn: 'ಕ' }

export function BiTag({ lang }: { lang: Locale }) {
  return (
    <span className="bi-tag" aria-hidden>
      {TAGS[lang]}
    </span>
  )
}

interface BlockProps {
  text: string
  /** The same text in the other language; shown underneath only when given and different. */
  other?: string
  lang: Locale
  otherLang: Locale
  className?: string
}

/** A paragraph in the chosen language, followed by the other language when both are shown. */
export function BiBlock({ text, other, lang, otherLang, className }: BlockProps) {
  if (!other || other === text)
    return (
      <p className={className}>{text}</p>
    )
  return (
    <div className="bi">
      <p className={className} lang={lang}>
        <BiTag lang={lang} />
        {text}
      </p>
      <p className={className} lang={otherLang}>
        <BiTag lang={otherLang} />
        {other}
      </p>
    </div>
  )
}

/**
 * An answer option's second language: after a dot on the same line for short options ("North · ಉತ್ತರ"),
 * or on its own line under long ones (`stacked`), so a sentence isn't broken in the middle.
 */
export function BiInline({ first, other, otherLang, stacked }: { first: ReactNode; other?: string; otherLang: Locale; stacked?: boolean }) {
  if (!other) return <>{first}</>
  if (stacked)
    return (
      <>
        {first}
        <span className="bi-inline bi-stacked" lang={otherLang}>
          {other}
        </span>
      </>
    )
  return (
    <>
      {first}
      {' · '}
      <span className="bi-inline" lang={otherLang}>
        {other}
      </span>
    </>
  )
}

/** A short interface label (e.g. "Find the missing number"), with the other language under it when both are shown. */
export function BiLabel({ get }: { get: (t: Dict) => string }) {
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const text = get(DICTS[lang])
  const other = useShowBoth() ? get(DICTS[otherLang]) : undefined
  return <BiInline first={text} other={other !== text ? other : undefined} otherLang={otherLang} stacked />
}

/** "EN+ಕ": show questions in both languages. Only on chapter pages (see TopicIdContext). */
export function BothToggle() {
  const t = useT()
  const available = useBothAvailable()
  const on = useBothSetting()
  if (!available) return null
  return (
    <button type="button" className={`both-toggle${on ? ' on' : ''}`} aria-pressed={on} aria-label={t.settings.both} title={t.settings.both} onClick={() => setBoth(!on)}>
      EN+<span lang="kn">ಕ</span>
    </button>
  )
}
