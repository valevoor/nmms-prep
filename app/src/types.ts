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
  // Letter series (Chapter 21)
  | 'letter-step'
  | 'letter-growing'
  | 'letter-alternating'
  | 'letter-groups'
  | 'letter-block'
  | 'letter-position'
  // Book-only letter patterns (not generated)
  | 'letter-word'
  | 'letter-mixed'
  // Book-only (Chapter 19)
  | 'sum-previous'
  // Odd one out (Chapter 18)
  | 'odd-one'
  // Coding–decoding (Chapter 23)
  | 'code-shift'
  | 'code-steps'
  | 'code-reverse'
  | 'code-opposite'
  | 'code-swap'
  | 'code-shift-reverse'
  | 'code-number'
  // Book-only (not generated)
  | 'code-mixed'
  | 'code-table'

export interface Question {
  id: string
  /** '?' marks the blank(s). Fractions are written "a/b". */
  terms: string[]
  /** How terms are shown: "1, 4, 9, ?" (series, default) or "A : B :: C : D" (analogy, 4 terms). */
  layout?: 'series' | 'analogy' | 'odd' | 'text'
  /** 'text' layout: the question as a sentence (translated through `kn.prompt`). */
  prompt?: string
  /** 'text' layout: an optional table shown above the prompt, e.g. words and their codes. */
  table?: string[][]
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
  /** Kannada text, set by the generators. Book questions get theirs from data/mat/*.kn.json instead. */
  kn?: QuestionText
}

/** The translatable words of a question. */
export interface QuestionText {
  prompt?: string
  rule?: string
  working?: string
  note?: string
  /** Only for questions whose options are words (Guess the rule). */
  options?: Record<OptionKey, string>
}

export interface TopicMeta {
  topic: string
  intro: string
  /** `visual` names a picture in components/tips; `caption` is its one-line takeaway. */
  tips: { title: string; body: string; visual?: string; caption?: string }[]
  workedExamples: string[]
  /** What the Learn page's cheat sheet shows: squares, cubes and primes (default), or letter positions. */
  cheatSheet?: 'numbers' | 'alphabet'
}
