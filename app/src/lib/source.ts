import { getPaper } from '../data/papers'
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
