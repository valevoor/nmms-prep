import type { Question, TopicMeta } from '../types'
import numberSeries from './mat/number-series.json'
import numberSeriesMeta from './mat/number-series.meta.json'
import numberAnalogy from './mat/number-analogy.json'
import numberAnalogyMeta from './mat/number-analogy.meta.json'
import { generateAnalogyRuleQuestion, generateNumberAnalogy } from '../lib/generators/numberAnalogy'
import { generateNumberSeries } from '../lib/generators/numberSeries'
import { generateRuleQuestion } from '../lib/generators/games'

export interface ReadyTopic {
  id: string
  chapter: number
  name: string
  questions: Question[]
  meta: TopicMeta
  /** Makes a fresh practice question; optional per topic. */
  generate?: (rng?: () => number) => Question
  /** "Guess the rule" game; shown only for topics that have one. */
  guessRule?: {
    make: () => Question
    /** Question shown above each puzzle. */
    prompt: string
    /** One line under the link on Home. */
    blurb: string
    /** Explanation on the game's start screen. */
    intro: string
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
      prompt: 'Which rule does this series follow?',
      blurb: 'Spot the secret pattern in each series',
      intro: 'Every series follows a secret rule. Look at the numbers and pick the rule. No calculating the answer, just spot the pattern!',
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
      prompt: 'Which rule links both pairs?',
      blurb: 'Spot the rule that links each pair',
      intro: 'Each puzzle shows a complete analogy, like 6 : 42 :: 9 : 63. Find the one rule that turns the first number of each pair into the second. No blanks to fill, just spot the rule!',
    },
  },
]

/** MAT chapters from the study material that are not built yet (shown as "coming soon"). */
export const UPCOMING_MAT: { chapter: number; name: string }[] = [
  { chapter: 21, name: 'Letter Series' },
  { chapter: 23, name: 'Coding–Decoding' },
  { chapter: 31, name: 'Directions' },
  { chapter: 32, name: 'Blood Relations' },
  { chapter: 34, name: 'Calendar' },
  { chapter: 35, name: 'Clock' },
  { chapter: 8, name: 'Mirror Image' },
]

export function getTopic(id: string): ReadyTopic | undefined {
  return READY_TOPICS.find((t) => t.id === id)
}
