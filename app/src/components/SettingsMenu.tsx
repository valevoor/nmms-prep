import { useEffect, useId, useRef, useState } from 'react'
import { useBothAvailable, useT } from '../lib/i18n'
import { BothToggle } from './Bi'
import { LangSwitch } from './LangSwitch'
import { ThemeSwitch } from './ThemeSwitch'

/**
 * The "Aa" button in the top bar of every page but Home, which opens the language and theme
 * switches (and EN+ಕ where a chapter offers it). Home shows the switches themselves.
 */
export function SettingsMenu() {
  const t = useT()
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
    window.addEventListener('hashchange', close)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', close)
    }
  }, [open])

  return (
    <div className="settings" ref={box}>
      <button
        ref={button}
        type="button"
        className={`settings-btn${open ? ' on' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        aria-label={t.settings.title}
        title={t.settings.title}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden>Aa</span>
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
