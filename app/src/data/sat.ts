/**
 * The SAT (Scholastic Aptitude Test) side of the app: its chapters (data/sat/chapters.json, built from
 * sat-syllabus/ by tools/build_sat_chapters.ts) and the Karnataka SAT past papers (data/pyq/*-sat.json).
 * Each question is filed under the syllabus chapter it belongs to (`topic`), or under none (`null`) when
 * the 2026-27 textbooks no longer cover it. For revision, related chapters are combined into one topic
 * (data/sat/groups.json); every other chapter is a topic on its own. A question under no chapter
 * names the older syllabus's chapter it was asked from (`oldChapter`, data/sat/old-chapters.json); those
 * "Old syllabus" topics follow each subject's textbook topics, and an "Uncategorized" topic holds any
 * question with neither (shown only if there is one). The questions don't have answers yet; tools/check_sat.ts checks the papers, the chapter list and the groups. Each paper's Kannada, as
 * printed in it, is in data/pyq/*-sat.kn.json (checked by tools/check_i18n.ts).
 */
import type { OptionKey } from '../types'
import chaptersJson from './sat/chapters.json'
import chaptersKn from './sat/chapters.kn.json'
import groupsJson from './sat/groups.json'
import oldChaptersJson from './sat/old-chapters.json'
import ka1920 from './pyq/ka-2019-20-sat.json'
import ka1920Kn from './pyq/ka-2019-20-sat.kn.json'
import ka2021 from './pyq/ka-2020-21-sat.json'
import ka2021Kn from './pyq/ka-2020-21-sat.kn.json'
import ka2223 from './pyq/ka-2022-23-sat.json'
import ka2223Kn from './pyq/ka-2022-23-sat.kn.json'
import ka2324 from './pyq/ka-2023-24-sat.json'
import ka2324Kn from './pyq/ka-2023-24-sat.kn.json'
import ka2425 from './pyq/ka-2024-25-sat.json'
import ka2425Kn from './pyq/ka-2024-25-sat.kn.json'
import ka2526 from './pyq/ka-2025-26-sat.json'
import ka2526Kn from './pyq/ka-2025-26-sat.kn.json'

export type SatSubject = 'maths' | 'science' | 'social'
export const SAT_SUBJECTS: SatSubject[] = ['maths', 'science', 'social']

/** The section of the paper a question is printed in. */
export type SatSection = 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'social' | 'maths'

/** The subject each section of the paper belongs to. */
export const SECTION_SUBJECT: Record<SatSection, SatSubject> = {
  physics: 'science',
  chemistry: 'science',
  biology: 'science',
  history: 'social',
  geography: 'social',
  social: 'social',
  maths: 'maths',
}

export interface SatChapter {
  /** The syllabus chapter ID, e.g. 'sci-8-02-invisible-living-world'. */
  id: string
  subject: SatSubject
  cls: number
  /** Chapter number in the textbook. */
  no: number
  name: string
  /** Textbook part and book pages. */
  part: number
  pages: number[]
  /** Sub-discipline, e.g. 'Biology' or 'Political Science'. */
  area: string
  /** What the chapter covers, from the syllabus's topic aliases. */
  topics: string[]
}

export interface SatQuestion {
  id: string
  paperNo: number
  subject: SatSection
  topic: string | null
  /** For a question under no 2026-27 chapter: the older syllabus's chapter (data/sat/old-chapters.json). */
  oldChapter?: string
  sourcePage: number
  /** The question; lines are separated by "\n". */
  prompt: string
  /** A table printed with the question; match-the-following lists are tables too. */
  table?: string[][]
  /** A picture printed with the question (path under public/). */
  figure?: string
  options: Record<OptionKey, string>
  /** Picture options (the option text is then just its letter). */
  optionFigures?: Record<OptionKey, string>
  note?: string
  /** Set once the question is solved. */
  answer?: OptionKey
}

/** The words of a question in one language; maths, labels and picture options are the same in both. */
export type SatQuestionText = Pick<SatQuestion, 'prompt' | 'table' | 'note' | 'options'>

export interface SatPaper {
  id: string
  state: 'karnataka'
  year: string
  questions: SatQuestion[]
  /** The paper's printed Kannada, by question id (draft, not yet reviewed). Missing fields fall back to English. */
  kn: Record<string, Partial<SatQuestionText>>
}

interface PaperJson {
  paper: string
  year: string
  questions: unknown[]
}

const paper = (data: PaperJson, kn: { questions: Record<string, unknown> }): SatPaper => ({
  id: data.paper,
  state: 'karnataka',
  year: data.year,
  questions: data.questions as SatQuestion[],
  kn: kn.questions as SatPaper['kn'],
})

/** Oldest first. */
export const SAT_PAPERS: SatPaper[] = [
  paper(ka1920, ka1920Kn),
  paper(ka2021, ka2021Kn),
  paper(ka2223, ka2223Kn),
  paper(ka2324, ka2324Kn),
  paper(ka2425, ka2425Kn),
  paper(ka2526, ka2526Kn),
]

/** A question's words in the given language. */
export function satQuestionText(p: SatPaper, q: SatQuestion, lang: string): SatQuestionText {
  const kn = lang === 'kn' ? p.kn[q.id] : undefined
  return {
    prompt: kn?.prompt ?? q.prompt,
    table: kn?.table ?? q.table,
    note: kn?.note ?? q.note,
    options: kn?.options ?? q.options,
  }
}

export const SAT_CHAPTERS = chaptersJson as SatChapter[]

const KN = chaptersKn as unknown as Record<string, { name?: string }>

export function getSatChapter(id: string | undefined): SatChapter | undefined {
  return SAT_CHAPTERS.find((c) => c.id === id)
}

/** The chapter's name in the current language (the Kannada is an unreviewed draft). */
export function satChapterName(c: SatChapter, lang: string): string {
  return (lang === 'kn' && KN[c.id]?.name) || c.name
}

/** What students revise: one textbook chapter, or a few related ones combined (data/sat/groups.json). */
export interface SatTopic {
  /** The group's id, or the chapter's ID for a chapter on its own. */
  id: string
  subject: SatSubject
  name: string
  /** Kannada name (draft). */
  kn?: string
  /** In textbook order: Class 7 first, then by chapter number. */
  chapters: SatChapter[]
  /** An "Old syllabus" topic: its id in data/sat/old-chapters.json; `chapters` is then empty. */
  oldChapter?: string
  /** The subject's questions under no chapter, old or new; `chapters` is then empty. */
  uncategorized?: true
}

/** A chapter of the older syllabus that the 2026-27 textbooks dropped. */
export interface OldChapter {
  id: string
  subject: SatSubject
  name: string
  kn: string
}

export const OLD_CHAPTERS = oldChaptersJson as OldChapter[]

interface GroupJson {
  id: string
  subject: SatSubject
  name: string
  kn: string
  chapters: string[]
}

const byBook = (a: SatChapter, b: SatChapter) => a.cls - b.cls || a.no - b.no
const GROUPS = groupsJson as GroupJson[]
const grouped = new Map(GROUPS.flatMap((g) => g.chapters.map((id) => [id, g] as const)))

/** A subject's topics after its textbook ones: its old-syllabus chapters, then Uncategorized if anything is. */
function notInTextbooks(subject: SatSubject): SatTopic[] {
  const old = OLD_CHAPTERS.filter((c) => c.subject === subject).map((c): SatTopic => ({
    id: `old-${c.id}`,
    subject,
    name: `Old syllabus – ${c.name}`,
    kn: `ಹಳೆಯ ಪಠ್ಯಕ್ರಮ – ${c.kn}`,
    chapters: [],
    oldChapter: c.id,
  }))
  const rest: SatTopic = { id: `uncategorized-${subject}`, subject, name: 'Uncategorized', kn: 'ವರ್ಗೀಕರಿಸದ ಪ್ರಶ್ನೆಗಳು', chapters: [], uncategorized: true }
  return satQuestions(rest).length ? [...old, rest] : old
}

/** Every topic, by subject: textbook topics in the textbook order of their first chapter, then the rest. */
export const SAT_TOPICS: SatTopic[] = [
  ...GROUPS.map((g) => ({
    id: g.id,
    subject: g.subject,
    name: g.name,
    kn: g.kn,
    chapters: g.chapters
      .map((id) => getSatChapter(id))
      .filter((c): c is SatChapter => !!c)
      .sort(byBook),
  })),
  ...SAT_CHAPTERS.filter((c) => !grouped.has(c.id)).map((c) => ({ id: c.id, subject: c.subject, name: c.name, kn: KN[c.id]?.name, chapters: [c] })),
]
  .sort((a, b) => SAT_SUBJECTS.indexOf(a.subject) - SAT_SUBJECTS.indexOf(b.subject) || byBook(a.chapters[0], b.chapters[0]))
  .flatMap((t, i, all) => (all[i + 1]?.subject === t.subject ? [t] : [t, ...notInTextbooks(t.subject)]))

/** A topic by its id; a chapter ID finds the topic the chapter is combined into. */
export function getSatTopic(id: string | undefined): SatTopic | undefined {
  return SAT_TOPICS.find((t) => t.id === id) ?? SAT_TOPICS.find((t) => t.chapters.some((c) => c.id === id))
}

/** The topic's name in the current language (the Kannada is an unreviewed draft). */
export function satTopicName(t: SatTopic, lang: string): string {
  return (lang === 'kn' && t.kn) || t.name
}

export interface PaperQuestionRef {
  paper: SatPaper
  q: SatQuestion
  /** Missing for a question under no 2026-27 chapter. */
  chapter?: SatChapter
}

/** A topic's past-paper questions, oldest paper first and in paper order. */
export function satQuestions(t: SatTopic): PaperQuestionRef[] {
  if (t.oldChapter) return SAT_PAPERS.flatMap((p) => p.questions.filter((q) => q.oldChapter === t.oldChapter).map((q) => ({ paper: p, q })))
  if (t.uncategorized)
    return SAT_PAPERS.flatMap((p) =>
      p.questions.filter((q) => q.topic === null && !q.oldChapter && SECTION_SUBJECT[q.subject] === t.subject).map((q) => ({ paper: p, q })),
    )
  const chapters = new Map(t.chapters.map((c) => [c.id, c]))
  return SAT_PAPERS.flatMap((p) => p.questions.filter((q) => q.topic && chapters.has(q.topic)).map((q) => ({ paper: p, q, chapter: chapters.get(q.topic!)! })))
}

const COUNTS = new Map<string, number>()
for (const p of SAT_PAPERS) for (const q of p.questions) if (q.topic) COUNTS.set(q.topic, (COUNTS.get(q.topic) ?? 0) + 1)

export const satQuestionCount = (t: SatTopic) =>
  t.chapters.length === 0 ? satQuestions(t).length : t.chapters.reduce((n, c) => n + (COUNTS.get(c.id) ?? 0), 0)
