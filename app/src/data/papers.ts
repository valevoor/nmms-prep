/**
 * Past NMMS question papers (data/pyq/<paper>.json). Each question is filed under the chapter it
 * belongs to (`topic`) and shows up in that chapter's Practice, in the "Past exams" tab; a question
 * that fits no chapter (`topic: null`) is kept with its paper but not shown yet. The app's Kannada
 * lookup (lib/i18n/content.ts), tools/check_i18n.ts and tools/check_pyq.ts read this list, and each
 * paper's answers are checked by its own tools/check_pyq_<paper>.ts.
 */
import type { Question, QuestionText } from '../types'
import ka2021Mat from './pyq/ka-2020-21-mat.json'
import ka2021MatKn from './pyq/ka-2020-21-mat.kn.json'
import ka2223Mat from './pyq/ka-2022-23-mat.json'
import ka2223MatKn from './pyq/ka-2022-23-mat.kn.json'

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

export const PAPER_FILES: PaperFiles[] = [p(ka2021Mat, ka2021MatKn), p(ka2223Mat, ka2223MatKn)]

const BY_ID = Object.fromEntries(PAPER_FILES.map((f) => [f.id, f]))

export const getPaper = (id: string): PaperFiles | undefined => BY_ID[id]

/** A chapter's past-paper questions, oldest paper first, in paper order. Questions under review are hidden. */
export function paperQuestions(topic: string): PaperQuestion[] {
  return PAPER_FILES.flatMap((f) => f.questions.filter((q) => q.topic === topic && q.status !== 'needs-review'))
}
