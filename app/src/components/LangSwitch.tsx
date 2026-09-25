import { LOCALES, setLocale, useLocale, useT } from '../lib/i18n'
import type { Locale } from '../lib/i18n'

/** Each language is named in its own script, so it is findable whichever one is showing. */
const NAMES: Record<Locale, { short: string; lang: string }> = {
  en: { short: 'EN', lang: 'en' },
  kn: { short: 'ಕನ್ನಡ', lang: 'kn' },
}

/** English / Kannada. Saved on the device; English is the default. */
export function LangSwitch() {
  const current = useLocale()
  const t = useT()
  return (
    <div className="theme-switch lang-switch" role="radiogroup" aria-label={t.settings.language}>
      {LOCALES.map((l) => (
        <button key={l} type="button" role="radio" aria-checked={l === current} className={l === current ? 'on' : undefined} onClick={() => setLocale(l)} lang={NAMES[l].lang}>
          {NAMES[l].short}
        </button>
      ))}
    </div>
  )
}
