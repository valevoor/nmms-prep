import { useEffect, useId, useRef, useState } from 'react'
import { useBothAvailable, useLocale, useT } from '../lib/i18n'
import { onRouteChange } from '../lib/router'
import { THEME_ICONS, useTheme } from '../lib/theme'
import { BothToggle } from './Bi'
import { LangSwitch } from './LangSwitch'
import { ThemeSwitch } from './ThemeSwitch'

/**
 * The "Aa" button in the top bar of every page but Home, which opens the language and theme
 * switches (and EN+ಕ where a chapter offers it). On Home (`chip`) the button shows the current
 * language and theme instead ("EN | ☀️ ▾"), so a first-time visitor can see where to change them.
 */
export function SettingsMenu({ chip = false }: { chip?: boolean }) {
  const t = useT()
  const locale = useLocale()
  const theme = useTheme()
  const both = useBothAvailable()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    const stopRoute = onRouteChange(close)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      stopRoute()
    }
  }, [open])

  return (
    <div className="settings" ref={box}>
      <button
        ref={button}
        type="button"
        className={`settings-btn${chip ? ' settings-chip' : ''}${open ? ' on' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        aria-label={chip ? `${t.settings.title}: ${locale === 'en' ? 'English' : 'ಕನ್ನಡ'}, ${t.settings[theme]}` : t.settings.title}
        title={t.settings.title}
        onClick={() => setOpen((o) => !o)}
      >
        {chip ? (
          <>
            <span aria-hidden lang={locale}>
              {locale === 'en' ? 'EN' : 'ಕ'}
            </span>
            <span className="settings-chip-sep" aria-hidden />
            <span aria-hidden>{THEME_ICONS[theme]}</span>
            <span className="settings-chip-caret" aria-hidden>
              ▾
            </span>
          </>
        ) : (
          <span aria-hidden>Aa</span>
        )}
      </button>
      {open && (
        <div className="settings-panel" id={id} role="group" aria-label={t.settings.title}>
          <div className="settings-row">
            <span>{t.settings.language}</span>
            <LangSwitch />
          </div>
          <div className="settings-row">
            <span>{t.settings.theme}</span>
            <ThemeSwitch />
          </div>
          {both && (
            <div className="settings-row">
              <span>{t.settings.both}</span>
              <BothToggle />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
