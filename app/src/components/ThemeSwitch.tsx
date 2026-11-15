import { useT } from '../lib/i18n'
import { setTheme, THEME_ICONS, THEME_ORDER, useTheme } from '../lib/theme'

/** Light / Dark / Auto. Starts on Light; "Auto" follows the phone's setting. */
export function ThemeSwitch() {
  const current = useTheme()
  const tr = useT()
  return (
    <div className="theme-switch" role="radiogroup" aria-label={tr.settings.theme}>
      {THEME_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={t === current}
          className={t === current ? 'on' : undefined}
          onClick={() => setTheme(t)}
          title={tr.settings[t]}
          aria-label={tr.settings[t]}
        >
          <span aria-hidden>{THEME_ICONS[t]}</span>
          <span className="theme-name">{tr.settings[t]}</span>
        </button>
      ))}
    </div>
  )
}
