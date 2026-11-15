import ageClues from '../data/clues/age-problems.json'
import ageCluesKn from '../data/clues/age-problems.kn.json'
import figNumClues from '../data/clues/figure-numbers.json'
import figNumCluesKn from '../data/clues/figure-numbers.kn.json'
import matrixClues from '../data/clues/number-matrix.json'
import matrixCluesKn from '../data/clues/number-matrix.kn.json'
import type { Question } from '../types'
import { useShowBoth } from './i18n/both'
import { otherLocale } from './i18n/content'
import { useLocale } from './i18n/locale'
import type { Locale } from './i18n/locale'

/**
 * Step-by-step clues, shown one at a time in Practice and Classroom (components/ClueCard.tsx). Each
 * chapter that has them keeps them in data/clues/<topic>.json (+ .kn.json), by question id, for its
 * book questions and the past-paper questions filed under it; generated questions carry their own.
 */
export const CLUE_FILES: { topic: string; en: Record<string, string[]>; kn: Record<string, string[]> }[] = [
  { topic: figNumClues.topic, en: figNumClues.clues, kn: figNumCluesKn.clues },
  { topic: matrixClues.topic, en: matrixClues.clues, kn: matrixCluesKn.clues },
  { topic: ageClues.topic, en: ageClues.clues, kn: ageCluesKn.clues },
]

const CLUES: Record<Locale, Record<string, string[]>> = {
  en: Object.assign({}, ...CLUE_FILES.map((f) => f.en)),
  kn: Object.assign({}, ...CLUE_FILES.map((f) => f.kn)),
}

/** A question's clues in one language (English where a Kannada clue is missing); empty if it has none. */
export function cluesFor(q: Question, locale: Locale): string[] {
  const en = q.clues ?? CLUES.en[q.id] ?? []
  if (locale === 'en') return en
  const kn = q.clues ? q.kn?.clues : CLUES.kn[q.id]
  return en.map((c, i) => kn?.[i] ?? c)
}

/** The clues in the chosen language and, when both languages are on, in the other one. */
export function useClueTexts(q: Question): { first: string[]; second?: string[]; lang: Locale; otherLang: Locale } {
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  return { first: cluesFor(q, lang), second: both ? cluesFor(q, otherLang) : undefined, lang, otherLang }
}
