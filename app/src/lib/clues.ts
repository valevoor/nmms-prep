import aoClues from '../data/clues/arithmetical-operations.json'
import aoCluesKn from '../data/clues/arithmetical-operations.kn.json'
import ssClues from '../data/clues/signs-symbols.json'
import ssCluesKn from '../data/clues/signs-symbols.kn.json'
import lmClues from '../data/clues/letter-matrix.json'
import lmCluesKn from '../data/clues/letter-matrix.kn.json'
import lvClues from '../data/clues/letter-values.json'
import lvCluesKn from '../data/clues/letter-values.kn.json'
import pyClues from '../data/clues/pyramid.json'
import pyCluesKn from '../data/clues/pyramid.kn.json'
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
import numberSeriesClues from '../data/clues/number-series.json'
import numberSeriesCluesKn from '../data/clues/number-series.kn.json'
import numberAnalogyClues from '../data/clues/number-analogy.json'
import numberAnalogyCluesKn from '../data/clues/number-analogy.kn.json'
import numberSequenceClues from '../data/clues/number-sequence.json'
import numberSequenceCluesKn from '../data/clues/number-sequence.kn.json'
import wrongNumberClues from '../data/clues/wrong-number.json'
import wrongNumberCluesKn from '../data/clues/wrong-number.kn.json'
import oddOneNumbersClues from '../data/clues/odd-one-numbers.json'
import oddOneNumbersCluesKn from '../data/clues/odd-one-numbers.kn.json'
import letterSeriesClues from '../data/clues/letter-series.json'
import letterSeriesCluesKn from '../data/clues/letter-series.kn.json'
import oddOneLettersClues from '../data/clues/odd-one-letters.json'
import oddOneLettersCluesKn from '../data/clues/odd-one-letters.kn.json'
import letterNumberAnalogyClues from '../data/clues/letter-number-analogy.json'
import letterNumberAnalogyCluesKn from '../data/clues/letter-number-analogy.kn.json'
import numberPatternsClues from '../data/clues/number-patterns.json'
import numberPatternsCluesKn from '../data/clues/number-patterns.kn.json'
import codingDecodingClues from '../data/clues/coding-decoding.json'
import codingDecodingCluesKn from '../data/clues/coding-decoding.kn.json'
import directionsClues from '../data/clues/directions.json'
import directionsCluesKn from '../data/clues/directions.kn.json'
import bloodRelationsClues from '../data/clues/blood-relations.json'
import bloodRelationsCluesKn from '../data/clues/blood-relations.kn.json'
import calendarClues from '../data/clues/calendar.json'
import calendarCluesKn from '../data/clues/calendar.kn.json'
import clockClues from '../data/clues/clock.json'
import clockCluesKn from '../data/clues/clock.kn.json'
import vennDiagramsClues from '../data/clues/venn-diagrams.json'
import vennDiagramsCluesKn from '../data/clues/venn-diagrams.kn.json'
import arrangementClues from '../data/clues/arrangement.json'
import arrangementCluesKn from '../data/clues/arrangement.kn.json'
import statementsDecisionsClues from '../data/clues/statements-decisions.json'
import statementsDecisionsCluesKn from '../data/clues/statements-decisions.kn.json'
import cubesColouringClues from '../data/clues/cubes-colouring.json'
import cubesColouringCluesKn from '../data/clues/cubes-colouring.kn.json'
import cubesCuttingClues from '../data/clues/cubes-cutting.json'
import cubesCuttingCluesKn from '../data/clues/cubes-cutting.kn.json'
import diceClues from '../data/clues/dice.json'
import diceCluesKn from '../data/clues/dice.kn.json'
import countingFiguresClues from '../data/clues/counting-figures.json'
import countingFiguresCluesKn from '../data/clues/counting-figures.kn.json'
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
  { topic: aoClues.topic, en: aoClues.clues, kn: aoCluesKn.clues },
  { topic: ssClues.topic, en: ssClues.clues, kn: ssCluesKn.clues },
  { topic: lmClues.topic, en: lmClues.clues, kn: lmCluesKn.clues },
  { topic: lvClues.topic, en: lvClues.clues, kn: lvCluesKn.clues },
  { topic: pyClues.topic, en: pyClues.clues, kn: pyCluesKn.clues },
  { topic: numberSeriesClues.topic, en: numberSeriesClues.clues, kn: numberSeriesCluesKn.clues },
  { topic: numberAnalogyClues.topic, en: numberAnalogyClues.clues, kn: numberAnalogyCluesKn.clues },
  { topic: numberSequenceClues.topic, en: numberSequenceClues.clues, kn: numberSequenceCluesKn.clues },
  { topic: wrongNumberClues.topic, en: wrongNumberClues.clues, kn: wrongNumberCluesKn.clues },
  { topic: oddOneNumbersClues.topic, en: oddOneNumbersClues.clues, kn: oddOneNumbersCluesKn.clues },
  { topic: letterSeriesClues.topic, en: letterSeriesClues.clues, kn: letterSeriesCluesKn.clues },
  { topic: oddOneLettersClues.topic, en: oddOneLettersClues.clues, kn: oddOneLettersCluesKn.clues },
  { topic: letterNumberAnalogyClues.topic, en: letterNumberAnalogyClues.clues, kn: letterNumberAnalogyCluesKn.clues },
  { topic: numberPatternsClues.topic, en: numberPatternsClues.clues, kn: numberPatternsCluesKn.clues },
  { topic: codingDecodingClues.topic, en: codingDecodingClues.clues, kn: codingDecodingCluesKn.clues },
  { topic: directionsClues.topic, en: directionsClues.clues, kn: directionsCluesKn.clues },
  { topic: bloodRelationsClues.topic, en: bloodRelationsClues.clues, kn: bloodRelationsCluesKn.clues },
  { topic: calendarClues.topic, en: calendarClues.clues, kn: calendarCluesKn.clues },
  { topic: clockClues.topic, en: clockClues.clues, kn: clockCluesKn.clues },
  { topic: vennDiagramsClues.topic, en: vennDiagramsClues.clues, kn: vennDiagramsCluesKn.clues },
  { topic: arrangementClues.topic, en: arrangementClues.clues, kn: arrangementCluesKn.clues },
  { topic: statementsDecisionsClues.topic, en: statementsDecisionsClues.clues, kn: statementsDecisionsCluesKn.clues },
  { topic: cubesColouringClues.topic, en: cubesColouringClues.clues, kn: cubesColouringCluesKn.clues },
  { topic: cubesCuttingClues.topic, en: cubesCuttingClues.clues, kn: cubesCuttingCluesKn.clues },
  { topic: diceClues.topic, en: diceClues.clues, kn: diceCluesKn.clues },
  { topic: countingFiguresClues.topic, en: countingFiguresClues.clues, kn: countingFiguresCluesKn.clues },
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
