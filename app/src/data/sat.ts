/**
 * The SAT (Scholastic Aptitude Test) side of the app: its chapters (data/sat/chapters.json, built from
 * sat-syllabus/ by tools/build_sat_chapters.ts) and the Karnataka SAT past papers (data/pyq/*-sat.json).
 * Each question is filed under the syllabus chapter it belongs to (`topic`), or under none (`null`) when
 * the 2026-27 textbooks no longer cover it. For revision, related chapters are combined into one topic
 * (data/sat/groups.json); every other chapter is a topic on its own. The questions don't have answers
 * yet; tools/check_sat.ts checks the papers, the chapter list and the groups.
 */
import type { OptionKey } from '../types'
import chaptersJson from './sat/chapters.json'
import chaptersKn from './sat/chapters.kn.json'
import groupsJson from './sat/groups.json'
import ka1920 from './pyq/ka-2019-20-sat.json'
import ka2021 from './pyq/ka-2020-21-sat.json'
import ka2223 from './pyq/ka-2022-23-sat.json'
import ka2324 from './pyq/ka-2023-24-sat.json'
import ka2425 from './pyq/ka-2024-25-sat.json'
import ka2526 from './pyq/ka-2025-26-sat.json'

export type SatSubject = 'maths' | 'science' | 'social'
export const SAT_SUBJECTS: SatSubject[] = ['maths', 'science', 'social']

/** The section of the paper a question is printed in. */
export type SatSection = 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'social' | 'maths'

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

export interface SatPaper {
  id: string
  state: 'karnataka'
  year: string
  questions: SatQuestion[]
}

interface PaperJson {
  paper: string
  year: string
  questions: unknown[]
}

const paper = (data: PaperJson): SatPaper => ({
  id: data.paper,
  state: 'karnataka',
  year: data.year,
  questions: data.questions as SatQuestion[],
})

/** Oldest first. */
export const SAT_PAPERS: SatPaper[] = [ka1920, ka2021, ka2223, ka2324, ka2425, ka2526].map(paper)

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
}

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

/** Every topic, by subject and then in textbook order of its first chapter. */
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
].sort((a, b) => SAT_SUBJECTS.indexOf(a.subject) - SAT_SUBJECTS.indexOf(b.subject) || byBook(a.chapters[0], b.chapters[0]))

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
  chapter: SatChapter
}

/** A topic's past-paper questions, oldest paper first and in paper order. */
export function satQuestions(t: SatTopic): PaperQuestionRef[] {
  const chapters = new Map(t.chapters.map((c) => [c.id, c]))
  return SAT_PAPERS.flatMap((p) => p.questions.filter((q) => q.topic && chapters.has(q.topic)).map((q) => ({ paper: p, q, chapter: chapters.get(q.topic!)! })))
}

const COUNTS = new Map<string, number>()
for (const p of SAT_PAPERS) for (const q of p.questions) if (q.topic) COUNTS.set(q.topic, (COUNTS.get(q.topic) ?? 0) + 1)

export const satQuestionCount = (t: SatTopic) => t.chapters.reduce((n, c) => n + (COUNTS.get(c.id) ?? 0), 0)
