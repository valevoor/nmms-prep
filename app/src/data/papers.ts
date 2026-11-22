/**
 * Past NMMS question papers (data/pyq/<paper>.json). Each question is filed under the chapter it
 * belongs to (`topic`) and shows up in that chapter's Practice, in the "Past exams" tab; a question
 * that fits no book chapter goes under "miscellaneous" (`topic: null` is kept but not shown). The app's Kannada
 * lookup (lib/i18n/content.ts), tools/check_i18n.ts and tools/check_pyq.ts read this list, and each
 * paper's answers are checked by its own tools/check_pyq_<paper>.ts.
 */
import type { Question, QuestionText } from '../types'
import ka1920Mat from './pyq/ka-2019-20-mat.json'
import ka1920MatKn from './pyq/ka-2019-20-mat.kn.json'
import ka2021Mat from './pyq/ka-2020-21-mat.json'
import ka2021MatKn from './pyq/ka-2020-21-mat.kn.json'
import ka2223Mat from './pyq/ka-2022-23-mat.json'
import ka2223MatKn from './pyq/ka-2022-23-mat.kn.json'
import ka2324Mat from './pyq/ka-2023-24-mat.json'
import ka2324MatKn from './pyq/ka-2023-24-mat.kn.json'
import ka2425Mat from './pyq/ka-2024-25-mat.json'
import ka2425MatKn from './pyq/ka-2024-25-mat.kn.json'
import ka2526Mat from './pyq/ka-2025-26-mat.json'
import ka2526MatKn from './pyq/ka-2025-26-mat.kn.json'
import bnDaily from './model/ka-bengaluru-north-daily-mat.json'
import bnDailyKn from './model/ka-bengaluru-north-daily-mat.kn.json'

export type PaperQuestion = Question & { topic: string | null }

export interface PaperFiles {
  id: string
  state: 'karnataka'
  year: string
  test: 'MAT'
  questions: PaperQuestion[]
  kn: Record<string, QuestionText>
}

interface PaperJson {
  paper: string
  state: string
  year: string
  test: string
  questions: unknown[]
}

const p = (data: PaperJson, kn: { questions: Record<string, QuestionText> }): PaperFiles => ({
  id: data.paper,
  state: data.state as PaperFiles['state'],
  year: data.year,
  test: data.test as PaperFiles['test'],
  questions: (data.questions as PaperQuestion[]).map((q) => ({ ...q, paper: data.paper })),
  kn: kn.questions,
})

export const PAPER_FILES: PaperFiles[] = [p(ka1920Mat, ka1920MatKn), p(ka2021Mat, ka2021MatKn), p(ka2223Mat, ka2223MatKn), p(ka2324Mat, ka2324MatKn), p(ka2425Mat, ka2425MatKn), p(ka2526Mat, ka2526MatKn)]

const BY_ID = Object.fromEntries(PAPER_FILES.map((f) => [f.id, f]))

export const getPaper = (id: string): PaperFiles | undefined => BY_ID[id]

/** A chapter's past-paper questions, oldest paper first, in paper order. Questions under review are hidden. */
export function paperQuestions(topic: string): PaperQuestion[] {
  return PAPER_FILES.flatMap((f) => f.questions.filter((q) => q.topic === topic && q.status !== 'needs-review'))
}

/**
 * Model papers (data/model/<paper>.json): practice papers made by an education office, not real exams,
 * so they are kept apart from PAPER_FILES: they have their own Practice tab, "Model papers", and their own
 * list in Classroom, and the Mock exam mixes them in with the book and past-paper questions. Each printed
 * section is numbered from Q1 (`paperNo`) and can feed more than one chapter, so each question names its
 * own (`topic`). Questions that repeat a book or past-paper question are left out (each section's
 * `dropped` list). The paper's key is checked by tools/check_model.ts.
 */
export interface ModelSection {
  no: number
  /** The section's printed English title, e.g. "Letter tables". */
  title: string
  pages: [number, number]
  directions: string
  dropped: { paperNo: number; same: string }[]
}

export type ModelQuestion = Question & { topic: string; section: number }

export interface ModelFiles {
  id: string
  state: 'karnataka'
  /** Who made it, e.g. "bengaluru-north" (the district office; its name is t.common.issuers[issuer]). */
  issuer: string
  sections: ModelSection[]
  questions: ModelQuestion[]
  kn: Record<string, QuestionText>
}

const m = (data: typeof bnDaily, kn: { questions: Record<string, QuestionText> }): ModelFiles => ({
  id: data.paper,
  state: data.state as ModelFiles['state'],
  issuer: data.issuer,
  sections: data.sections as ModelSection[],
  questions: (data.questions as ModelQuestion[]).map((q) => ({ ...q, model: data.paper })),
  kn: kn.questions,
})

export const MODEL_FILES: ModelFiles[] = [m(bnDaily, bnDailyKn)]

const MODEL_BY_ID = Object.fromEntries(MODEL_FILES.map((f) => [f.id, f]))

export const getModel = (id: string): ModelFiles | undefined => MODEL_BY_ID[id]

/** A chapter's model-paper questions, in paper order. Questions under review are hidden. */
export function modelQuestions(topic: string): ModelQuestion[] {
  return MODEL_FILES.flatMap((f) => f.questions.filter((q) => q.topic === topic && q.status !== 'needs-review'))
}

/** How many of a chapter's questions came in past papers, and in how many of the papers (as `paperQuestions` counts them). */
export function pastStats(topic: string): { questions: number; years: number; papers: number } {
  const qs = paperQuestions(topic)
  return { questions: qs.length, years: new Set(qs.map((q) => q.paper)).size, papers: PAPER_FILES.length }
}
