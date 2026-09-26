/**
 * Every built chapter's content files, in one place: the app's Kannada lookup (lib/i18n/content.ts),
 * the Kannada coverage check (tools/check_i18n.ts) and the review export (tools/export_i18n.ts) all
 * read this list. A new chapter is added here once.
 */
import bloodKn from './mat/blood-relations.kn.json'
import blood from './mat/blood-relations.json'
import bloodMetaKn from './mat/blood-relations.meta.kn.json'
import bloodMeta from './mat/blood-relations.meta.json'
import calendarKn from './mat/calendar.kn.json'
import calendar from './mat/calendar.json'
import calendarMetaKn from './mat/calendar.meta.kn.json'
import calendarMeta from './mat/calendar.meta.json'
import clockKn from './mat/clock.kn.json'
import clock from './mat/clock.json'
import clockMetaKn from './mat/clock.meta.kn.json'
import clockMeta from './mat/clock.meta.json'
import codingKn from './mat/coding-decoding.kn.json'
import coding from './mat/coding-decoding.json'
import codingMetaKn from './mat/coding-decoding.meta.kn.json'
import codingMeta from './mat/coding-decoding.meta.json'
import directionsKn from './mat/directions.kn.json'
import directions from './mat/directions.json'
import directionsMetaKn from './mat/directions.meta.kn.json'
import directionsMeta from './mat/directions.meta.json'
import letterSeriesKn from './mat/letter-series.kn.json'
import letterSeries from './mat/letter-series.json'
import letterSeriesMetaKn from './mat/letter-series.meta.kn.json'
import letterSeriesMeta from './mat/letter-series.meta.json'
import numberAnalogyKn from './mat/number-analogy.kn.json'
import numberAnalogy from './mat/number-analogy.json'
import numberAnalogyMetaKn from './mat/number-analogy.meta.kn.json'
import numberAnalogyMeta from './mat/number-analogy.meta.json'
import numberSeriesKn from './mat/number-series.kn.json'
import numberSeries from './mat/number-series.json'
import numberSeriesMetaKn from './mat/number-series.meta.kn.json'
import numberSeriesMeta from './mat/number-series.meta.json'
import oddOneKn from './mat/odd-one-numbers.kn.json'
import oddOne from './mat/odd-one-numbers.json'
import oddOneMetaKn from './mat/odd-one-numbers.meta.kn.json'
import oddOneMeta from './mat/odd-one-numbers.meta.json'
import oddLettersKn from './mat/odd-one-letters.kn.json'
import oddLetters from './mat/odd-one-letters.json'
import oddLettersMetaKn from './mat/odd-one-letters.meta.kn.json'
import oddLettersMeta from './mat/odd-one-letters.meta.json'
import wrongNumberKn from './mat/wrong-number.kn.json'
import wrongNumber from './mat/wrong-number.json'
import wrongNumberMetaKn from './mat/wrong-number.meta.kn.json'
import wrongNumberMeta from './mat/wrong-number.meta.json'
import type { Question, QuestionText, TopicMeta } from '../types'

type MetaText = { intro: string; tips: { title: string; body: string; caption?: string }[] }

export interface ChapterFiles {
  id: string
  name: string
  questions: Question[]
  meta: TopicMeta
  /** Kannada for each book question, by id. */
  kn: Record<string, QuestionText>
  /** Kannada intro and tips, in the same order as the English tips. */
  metaKn: MetaText
}

const c = (id: string, name: string, q: { questions: unknown[] }, meta: unknown, kn: { questions: unknown }, metaKn: unknown): ChapterFiles => ({
  id,
  name,
  questions: q.questions as Question[],
  meta: meta as TopicMeta,
  kn: kn.questions as Record<string, QuestionText>,
  metaKn: metaKn as MetaText,
})

export const CHAPTER_FILES: ChapterFiles[] = [
  c('number-analogy', 'Number Analogy', numberAnalogy, numberAnalogyMeta, numberAnalogyKn, numberAnalogyMetaKn),
  c('number-series', 'Number Series', numberSeries, numberSeriesMeta, numberSeriesKn, numberSeriesMetaKn),
  c('odd-one-numbers', 'Odd One Out: Numbers', oddOne, oddOneMeta, oddOneKn, oddOneMetaKn),
  c('wrong-number', 'Find the Wrong Number', wrongNumber, wrongNumberMeta, wrongNumberKn, wrongNumberMetaKn),
  c('letter-series', 'Letter Series', letterSeries, letterSeriesMeta, letterSeriesKn, letterSeriesMetaKn),
  c('coding-decoding', 'Coding–Decoding', coding, codingMeta, codingKn, codingMetaKn),
  c('directions', 'Directions', directions, directionsMeta, directionsKn, directionsMetaKn),
  c('blood-relations', 'Blood Relations', blood, bloodMeta, bloodKn, bloodMetaKn),
  c('calendar', 'Calendar', calendar, calendarMeta, calendarKn, calendarMetaKn),
  c('clock', 'Clock', clock, clockMeta, clockKn, clockMetaKn),
  c('odd-one-letters', 'Odd One Out: Letters', oddLetters, oddLettersMeta, oddLettersKn, oddLettersMetaKn),
]
