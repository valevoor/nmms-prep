import { useSyncExternalStore } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'auto'

/** Same key as the inline script in index.html, which applies the theme before first paint. */
const KEY = 'nmms-theme'
export const THEME_ORDER: ThemeChoice[] = ['light', 'dark', 'auto']

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'dark' || v === 'auto') return v
  } catch {
    // Storage blocked (private mode): fall back to the default.
  }
  return 'light'
}

let choice = read()

function apply() {
  const dark = choice === 'dark' || (choice === 'auto' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

// In Auto, follow the phone when its setting changes.
systemDark.addEventListener('change', () => {
  if (choice === 'auto') apply()
})
apply()

export function setTheme(next: ThemeChoice) {
  choice = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Not saved, but still applied for this visit.
  }
  apply()
  listeners.forEach((l) => l())
}

export function useTheme(): ThemeChoice {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => choice,
  )
}
