import { getPaper } from '../data/papers'
import type { SatPaper, SatQuestion } from '../data/sat'
import type { Question } from '../types'
import type { Dict } from './i18n'

/** Where a question comes from: "Book Q5", "Practice question" or a past paper ("Karnataka 2020-21 · Q2"). */
export function questionLabel(q: Question, t: Dict): string {
  if (q.generated) return t.common.practiceQuestion
  const paper = q.paper ? getPaper(q.paper) : undefined
  if (paper) return t.common.paperQ(t.common.states[paper.state], paper.year, q.paperNo)
  return t.common.bookQ(q.bookNo)
}

/** The line under an explanation: the question's source and where its answer comes from. */
export function sourceLine(q: Question, t: Dict): string {
  if (q.generated) return t.common.madeByApp
  const key = q.paper ? (q.keyFrom === 'book' ? t.common.keyOfficial : t.common.keyWorkedOutPaper) : q.keyFrom === 'book' ? t.common.keyFromBook : t.common.keyWorkedOut
  return `${questionLabel(q, t)} · ${key}`
}

/** Where a SAT question comes from: "Karnataka 2024-25 · Q4", or "Book · Physics Q14" for the study book. */
export function satSource(t: Dict, paper: SatPaper, q: SatQuestion): string {
  return paper.book ? t.sat.bookQ(t.sat.sections[q.subject], q.paperNo) : t.common.paperQ(t.common.states[paper.state], paper.year, q.paperNo)
}
