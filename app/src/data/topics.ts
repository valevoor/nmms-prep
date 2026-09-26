import type { Dict } from '../lib/i18n'
import type { Question, TopicMeta } from '../types'
import numberSeries from './mat/number-series.json'
import numberSeriesMeta from './mat/number-series.meta.json'
import numberAnalogy from './mat/number-analogy.json'
import numberAnalogyMeta from './mat/number-analogy.meta.json'
import letterSeries from './mat/letter-series.json'
import letterSeriesMeta from './mat/letter-series.meta.json'
import blood from './mat/blood-relations.json'
import bloodMeta from './mat/blood-relations.meta.json'
import calendar from './mat/calendar.json'
import calendarMeta from './mat/calendar.meta.json'
import clock from './mat/clock.json'
import clockMeta from './mat/clock.meta.json'
import coding from './mat/coding-decoding.json'
import directions from './mat/directions.json'
import directionsMeta from './mat/directions.meta.json'
import codingMeta from './mat/coding-decoding.meta.json'
import oddLetters from './mat/odd-one-letters.json'
import oddLettersMeta from './mat/odd-one-letters.meta.json'
import oddOne from './mat/odd-one-numbers.json'
import oddOneMeta from './mat/odd-one-numbers.meta.json'
import wrongNumber from './mat/wrong-number.json'
import wrongNumberMeta from './mat/wrong-number.meta.json'
import { generateBloodRelation } from '../lib/generators/bloodRelations'
import { generateCalendar } from '../lib/generators/calendar'
import { generateClock } from '../lib/generators/clock'
import { generateCoding } from '../lib/generators/coding'
import { generateDirections } from '../lib/generators/directions'
import { generateLetterSeries } from '../lib/generators/letterSeries'
import { generateOddLetters } from '../lib/generators/oddLetters'
import { generateOddOne } from '../lib/generators/oddOne'
import { generateAnalogyRuleQuestion, generateNumberAnalogy } from '../lib/generators/numberAnalogy'
import { generateNumberSeries } from '../lib/generators/numberSeries'
import { generateRuleQuestion, generateWrongNumber } from '../lib/generators/games'

export interface ReadyTopic {
  id: string
  chapter: number
  name: string
  questions: Question[]
  meta: TopicMeta
  /** What the student looks for in each question; changes the "Find the missing …" prompt. */
  missing?: 'number' | 'letters' | 'wrong' | 'odd' | 'code' | 'direction' | 'relation' | 'answer'
  /** Makes a fresh practice question; optional per topic. */
  generate?: (rng?: () => number) => Question
  /** "Guess the rule" game; shown only for topics that have one. Its text is in lib/i18n (game.topics). */
  guessRule?: {
    make: () => Question
  }
}

const visible = (qs: Question[]) => qs.filter((q) => q.status !== 'needs-review')

export const READY_TOPICS: ReadyTopic[] = [
  {
    id: 'number-series',
    chapter: 17,
    name: 'Number Series',
    questions: visible(numberSeries.questions as Question[]),
    meta: numberSeriesMeta,
    generate: generateNumberSeries,
    guessRule: {
      make: () => generateRuleQuestion(),
    },
  },
  {
    id: 'number-analogy',
    chapter: 14,
    name: 'Number Analogy',
    questions: visible(numberAnalogy.questions as Question[]),
    meta: numberAnalogyMeta,
    generate: generateNumberAnalogy,
    guessRule: {
      make: () => generateAnalogyRuleQuestion(),
    },
  },
  {
    id: 'letter-series',
    chapter: 21,
    name: 'Letter Series',
    questions: visible(letterSeries.questions as Question[]),
    meta: letterSeriesMeta as TopicMeta,
    missing: 'letters',
    generate: generateLetterSeries,
  },
  {
    id: 'wrong-number',
    chapter: 19,
    name: 'Find the Wrong Number',
    questions: visible(wrongNumber.questions as Question[]),
    meta: wrongNumberMeta,
    missing: 'wrong',
    generate: generateWrongNumber,
  },
  {
    id: 'odd-one-numbers',
    chapter: 18,
    name: 'Odd One Out: Numbers',
    questions: visible(oddOne.questions as Question[]),
    meta: oddOneMeta,
    missing: 'odd',
    generate: generateOddOne,
  },
  {
    id: 'coding-decoding',
    chapter: 23,
    name: 'Coding–Decoding',
    questions: visible(coding.questions as Question[]),
    meta: codingMeta as TopicMeta,
    missing: 'code',
    generate: generateCoding,
  },
  {
    id: 'directions',
    chapter: 31,
    name: 'Directions',
    questions: visible(directions.questions as Question[]),
    meta: directionsMeta,
    missing: 'direction',
    generate: generateDirections,
  },
  {
    id: 'blood-relations',
    chapter: 32,
    name: 'Blood Relations',
    questions: visible(blood.questions as Question[]),
    meta: bloodMeta as TopicMeta,
    missing: 'relation',
    generate: generateBloodRelation,
  },
  {
    id: 'calendar',
    chapter: 34,
    name: 'Calendar',
    questions: visible(calendar.questions as Question[]),
    meta: calendarMeta,
    missing: 'answer',
    generate: generateCalendar,
  },
  {
    id: 'clock',
    chapter: 35,
    name: 'Clock',
    questions: visible(clock.questions as Question[]),
    meta: clockMeta,
    missing: 'answer',
    generate: generateClock,
  },
  {
    id: 'odd-one-letters',
    chapter: 16,
    name: 'Odd One Out: Letters',
    questions: visible(oddLetters.questions as Question[]),
    meta: oddLettersMeta as TopicMeta,
    missing: 'odd',
    generate: generateOddLetters,
  },
]

/** MAT chapters from the study material that are not built yet (shown as "coming soon"). */
export const UPCOMING_MAT: { chapter: number; name: string }[] = [
  { chapter: 8, name: 'Mirror Image' },
]

/** The short instruction above each question, e.g. "Find the missing number". */
export function askLabel(t: Dict, topic: ReadyTopic): string {
  const labels: Record<NonNullable<ReadyTopic['missing']>, string> = {
    number: t.common.findMissing,
    letters: t.common.findMissingLetters,
    wrong: t.common.findWrong,
    odd: t.common.findOdd,
    code: t.common.findCode,
    direction: t.common.findDirection,
    relation: t.common.findRelation,
    answer: t.common.findAnswer,
  }
  return labels[topic.missing ?? 'number']
}

export function getTopic(id: string): ReadyTopic | undefined {
  return READY_TOPICS.find((t) => t.id === id)
}
