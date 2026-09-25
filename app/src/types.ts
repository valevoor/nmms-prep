export type OptionKey = 'A' | 'B' | 'C' | 'D'
export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D']

export type PatternId =
  | 'arithmetic'
  | 'second-difference'
  | 'repeating-difference'
  | 'alternating'
  | 'multiply-divide'
  | 'mixed-operation'
  | 'power-plus'
  | 'power-pairs'
  | 'difference-powers'
  | 'prime'
  | 'digit-rule'
  | 'fraction'
  | 'analogy'

export interface Question {
  id: string
  /** '?' marks the blank(s). Fractions are written "a/b". */
  terms: string[]
  /** How terms are shown: "1, 4, 9, ?" (series, default) or "A : B :: C : D" (analogy, 4 terms). */
  layout?: 'series' | 'analogy'
  options: Record<OptionKey, string>
  answer: OptionKey
  /** One-line rule shown in the explanation. */
  rule: string
  /** Operation between each pair of neighbouring terms (length = terms.length - 1). */
  ops?: string[]
  /** The final calculation that gives the answer. */
  working: string
  pattern: PatternId
  note?: string
  /** Book questions only. */
  bookNo?: number
  sourcePage?: number
  keyFrom?: 'book' | 'solved'
  status?: 'needs-review'
  /** Set for questions made by a generator. */
  generated?: boolean
  /** What the student is asked: the missing number (default), the rule, or the wrong number. */
  kind?: 'missing' | 'rule' | 'wrong'
  /** 'wrong' questions: index of the changed term and the value it should have been. */
  wrongIndex?: number
  fix?: string
}

export interface TopicMeta {
  topic: string
  intro: string
  /** `visual` names a picture in components/tips; `caption` is its one-line takeaway. */
  tips: { title: string; body: string; visual?: string; caption?: string }[]
  workedExamples: string[]
}
