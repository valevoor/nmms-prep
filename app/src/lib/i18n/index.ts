import { en } from './en'
import type { Dict } from './en'
import { kn } from './kn'
import { useLocale } from './locale'
import type { Locale } from './locale'

export { getLocale, LOCALES, setLocale, useLocale } from './locale'
export type { Locale } from './locale'
export type { Dict, Rich } from './en'

export const DICTS: Record<Locale, Dict> = { en, kn }

/** The interface text for the current language; re-renders when the language changes. */
export function useT(): Dict {
  return DICTS[useLocale()]
}
