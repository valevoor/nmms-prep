/**
 * The SAT (Scholastic Aptitude Test) side of the app: its chapters (data/sat/chapters.json, built from
 * sat-syllabus/ by tools/build_sat_chapters.ts), the Karnataka SAT past papers (data/pyq/*-sat.json) and the
 * study book's SAT questions (data/sat/book.json, from NMMS.pdf, with the book's key; shown in Practice's Book tab).
 * Each question is filed under the syllabus chapter it belongs to (`topic`), or under none (`null`) when
 * the 2026-27 textbooks no longer cover it. For revision, related chapters are combined into one topic
 * (data/sat/groups.json); every other chapter is a topic on its own. A question under no chapter
 * names the older syllabus's chapter it was asked from (`oldChapter`, data/sat/old-chapters.json); those
 * "Old syllabus" topics follow each subject's textbook topics, and a "Miscellaneous" topic holds any
 * question with neither (shown only if there is one). The maths and science questions are solved (checked by tools/check_sat_maths.ts and tools/check_sat_science.ts; the book's social science by tools/check_sat_social.ts); tools/check_sat.ts checks the papers, the book, the chapter list and the groups. The Kannada, as
 * printed, is in data/pyq/*-sat.kn.json and data/sat/book.kn.json (checked by tools/check_i18n.ts).
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
import bookJson from './sat/book.json'
import bookKn from './sat/book.kn.json'

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
  /** Where the answer comes from: the official key, or worked out by us (the papers have no key). */
  keyFrom?: 'book' | 'solved'
  /** How to get the answer: the syllabus idea it uses (with its section number), then the steps. */
  solution?: SatSolution
}

export interface SatSolution {
  concept: string
  steps: string[]
}

/** The words of a question in one language; maths, labels and picture options are the same in both. */
export type SatQuestionText = Pick<SatQuestion, 'prompt' | 'table' | 'note' | 'options' | 'solution'>

export interface SatPaper {
  id: string
  state: 'karnataka'
  year: string
  questions: SatQuestion[]
  /** The paper's printed Kannada, by question id (draft, not yet reviewed). Missing fields fall back to English. */
  kn: Record<string, Partial<SatQuestionText>>
  /** The study book (NMMS.pdf), not a past paper: its questions are numbered within each section. */
  book?: true
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

/** The study book's SAT questions (NMMS.pdf), with its answer key checked by us. */
export const SAT_BOOK: SatPaper = { ...paper(bookJson, bookKn), book: true }

/** Every source of SAT questions: the past papers, then the book. */
export const SAT_SOURCES: SatPaper[] = [...SAT_PAPERS, SAT_BOOK]

/** A question's words in the given language. */
export function satQuestionText(p: SatPaper, q: SatQuestion, lang: string): SatQuestionText {
  const kn = lang === 'kn' ? p.kn[q.id] : undefined
  return {
    prompt: kn?.prompt ?? q.prompt,
    table: kn?.table ?? q.table,
    note: kn?.note ?? q.note,
    options: kn?.options ?? q.options,
    solution: kn?.solution ?? q.solution,
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
  /** Miscellaneous: the subject's questions under no chapter, old or new; `chapters` is then empty. */
  misc?: true
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

/** A subject's topics after its textbook ones: its old-syllabus chapters, then Miscellaneous if anything is in it. */
function notInTextbooks(subject: SatSubject): SatTopic[] {
  const old = OLD_CHAPTERS.filter((c) => c.subject === subject).map((c): SatTopic => ({
    id: `old-${c.id}`,
    subject,
    name: `Old syllabus – ${c.name}`,
    kn: `ಹಳೆಯ ಪಠ್ಯಕ್ರಮ – ${c.kn}`,
    chapters: [],
    oldChapter: c.id,
  }))
  const rest: SatTopic = { id: `miscellaneous-${subject}`, subject, name: 'Miscellaneous', kn: 'ಇತರ ಪ್ರಶ್ನೆಗಳು', chapters: [], misc: true }
  return questionsIn(rest, SAT_SOURCES).length ? [...old, rest] : old
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

/** A topic's questions from these sources, in source order and then question order. */
function questionsIn(t: SatTopic, sources: SatPaper[]): PaperQuestionRef[] {
  if (t.oldChapter) return sources.flatMap((p) => p.questions.filter((q) => q.oldChapter === t.oldChapter).map((q) => ({ paper: p, q })))
  if (t.misc)
    return sources.flatMap((p) =>
      p.questions.filter((q) => q.topic === null && !q.oldChapter && SECTION_SUBJECT[q.subject] === t.subject).map((q) => ({ paper: p, q })),
    )
  const chapters = new Map(t.chapters.map((c) => [c.id, c]))
  return sources.flatMap((p) => p.questions.filter((q) => q.topic && chapters.has(q.topic)).map((q) => ({ paper: p, q, chapter: chapters.get(q.topic!)! })))
}

/** A topic's past-paper questions, oldest paper first and in paper order. */
export function satQuestions(t: SatTopic): PaperQuestionRef[] {
  return questionsIn(t, SAT_PAPERS)
}

/** A topic's questions from the study book, in book order. */
export function satBookQuestions(t: SatTopic): PaperQuestionRef[] {
  return questionsIn(t, [SAT_BOOK])
}

/** How many of a topic's questions came in past papers, and in how many of the papers. */
export function satPastStats(t: SatTopic): { questions: number; years: number; papers: number } {
  const qs = satQuestions(t)
  return { questions: qs.length, years: new Set(qs.map((r) => r.paper.id)).size, papers: SAT_PAPERS.length }
}

/** A topic's questions with an answer, book and past papers, which Practice asks one at a time. */
export function satSolved(t: SatTopic): PaperQuestionRef[] {
  return questionsIn(t, SAT_SOURCES).filter((x) => x.q.answer)
}
