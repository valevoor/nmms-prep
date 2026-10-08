import { useSyncExternalStore } from 'react'

export type Locale = 'en' | 'kn'
export const LOCALES: Locale[] = ['en', 'kn']

const KEY = 'nmms-lang'
const listeners = new Set<() => void>()

function read(): Locale {
  try {
    if (localStorage.getItem(KEY) === 'kn') return 'kn'
  } catch {
    // Storage blocked (private mode): fall back to English.
  }
  return 'en'
}

let current = read()

function apply() {
  // No document in the unit tests, which import drawings that read the language.
  if (typeof document !== 'undefined') document.documentElement.lang = current
}
apply()

export function setLocale(next: Locale) {
  current = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Not saved, but still applied for this visit.
  }
  apply()
  listeners.forEach((l) => l())
}

export const getLocale = () => current

export function useLocale(): Locale {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
    // The tests render drawings to a string, which needs a server snapshot too.
    () => current,
  )
}
