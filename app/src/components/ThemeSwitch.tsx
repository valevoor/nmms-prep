import { setTheme, THEME_ORDER, useTheme } from '../lib/theme'
import type { ThemeChoice } from '../lib/theme'

const LABELS: Record<ThemeChoice, { icon: string; name: string }> = {
  light: { icon: '☀️', name: 'Light' },
  dark: { icon: '🌙', name: 'Dark' },
  auto: { icon: '🌓', name: 'Auto' },
}

/** Light / Dark / Auto. Starts on Light; "Auto" follows the phone's setting. */
export function ThemeSwitch() {
  const current = useTheme()
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Colour theme">
      {THEME_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={t === current}
          className={t === current ? 'on' : undefined}
          onClick={() => setTheme(t)}
          title={LABELS[t].name}
          aria-label={LABELS[t].name}
        >
          <span aria-hidden>{LABELS[t].icon}</span>
          <span className="theme-name">{LABELS[t].name}</span>
        </button>
      ))}
    </div>
  )
}
