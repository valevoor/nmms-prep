import { CHAPTER_FILES } from '../../data/chapters'
import type { OptionKey, Question, QuestionText, TopicMeta } from '../../types'
import { useLocale } from './locale'
import type { Locale } from './locale'

/** Kannada text for book questions, by question id. */
const BOOK_KN: Record<string, QuestionText> = Object.assign({}, ...CHAPTER_FILES.map((c) => c.kn))

/** Kannada intro and tips, by topic id. */
const META_KN = Object.fromEntries(CHAPTER_FILES.map((c) => [c.id, c.metaKn]))

export interface ShownText {
  prompt?: string
  rule: string
  working: string
  note?: string
  options: Record<OptionKey, string>
}

/**
 * The words of a question in one language. Generated questions carry their Kannada in `q.kn`; book
 * questions (including ones saved in the mistakes list) are looked up by id. Anything missing falls
 * back to English.
 */
export function questionText(q: Question, locale: Locale): ShownText {
  const kn = locale === 'kn' ? (q.kn ?? BOOK_KN[q.id]) : undefined
  return {
    prompt: kn?.prompt ?? q.prompt,
    rule: kn?.rule ?? q.rule,
    working: kn?.working ?? q.working,
    note: kn?.note ?? q.note,
    options: kn?.options ?? q.options,
  }
}

export function useQuestionText(q: Question): ShownText {
  return questionText(q, useLocale())
}

/** A topic's intro and tips in one language. Tip `visual`s always come from the English meta. */
export function topicMeta(topicId: string, meta: TopicMeta, locale: Locale): TopicMeta {
  const kn = locale === 'kn' ? META_KN[topicId] : undefined
  if (!kn) return meta
  return {
    ...meta,
    intro: kn.intro,
    tips: meta.tips.map((t, i) => ({ ...t, ...kn.tips[i] })),
  }
}

export function useTopicMeta(topicId: string, meta: TopicMeta): TopicMeta {
  return topicMeta(topicId, meta, useLocale())
}

