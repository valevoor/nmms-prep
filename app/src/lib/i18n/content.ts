import { CHAPTER_FILES } from '../../data/chapters'
import type { OptionKey, Question, QuestionText, TopicMeta } from '../../types'
import { useShowBoth } from './both'
import { useLocale } from './locale'
import type { Locale } from './locale'

/** Kannada text for book questions, by question id. */
const BOOK_KN: Record<string, QuestionText> = Object.assign({}, ...CHAPTER_FILES.map((c) => c.kn))

/** Kannada intro, tips and video titles, by topic id. */
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

/** A topic's intro and tips in one language. Tip `visual`s always come from the English meta. */
export function topicMeta(topicId: string, meta: TopicMeta, locale: Locale): TopicMeta {
  const kn = locale === 'kn' ? META_KN[topicId] : undefined
  if (!kn) return meta
  return {
    ...meta,
    intro: kn.intro,
    tips: meta.tips.map((t, i) => ({ ...t, ...kn.tips[i] })),
    videos: meta.videos?.map((v, i) => ({ ...v, ...kn.videos?.[i] })),
  }
}


/** The other language: the one shown second when both are on. */
export const otherLocale = (l: Locale): Locale => (l === 'en' ? 'kn' : 'en')

/**
 * A question's words in the chosen language (`first`) and, when both languages are on for this chapter,
 * in the other one (`second`). A field with no translation comes out the same in both; callers show it once.
 */
export function useQuestionTexts(q: Question): { first: ShownText; second?: ShownText; lang: Locale; otherLang: Locale } {
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  return { first: questionText(q, lang), second: both ? questionText(q, otherLang) : undefined, lang, otherLang }
}

/** A topic's intro and tips in the chosen language and, when both are on, in the other one. */
export function useTopicMetas(topicId: string, meta: TopicMeta): { first: TopicMeta; second?: TopicMeta; otherLang: Locale } {
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  return { first: topicMeta(topicId, meta, lang), second: both ? topicMeta(topicId, meta, otherLang) : undefined, otherLang }
}
