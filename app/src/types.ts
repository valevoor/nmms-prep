/** People placed by column and generation (0 = oldest), and the lines between them. */
export interface FamilyTree {
  people: [string, number, number][]
  lines: [string, string, 'child' | 'married' | 'sibling'][]
}

/** One shape in a generated figure. Coordinates are in a 100 × 100 box, y down; angles in degrees, clockwise. */
export interface FigItem {
  shape: 'poly' | 'circle' | 'dot' | 'arrow' | 'flag' | 'ell' | 'plus' | 'dots' | 'rect' | 'text'
  x: number
  y: number
  size: number
  /** Number of sides ('poly') or of dots in the row ('dots'). */
  n?: number
  rot?: number
  /** Mirrored left–right before turning (only changes the look of 'flag' and 'ell'). */
  flip?: boolean
  fill?: 'none' | 'solid' | 'hatch'
  /** 'rect': its height (`size` is its width). */
  h?: number
  /** 'text': what is written (`size` is the font size). */
  label?: string
}

/** A figure drawn by the app: an optional frame (a box, or a circle cut into 4 or 8 parts) and shapes. */
export interface Drawing {
  /** Width of the box (default 100; the height is always 100). */
  w?: number
  frame?: 'square' | 'circle' | 'quad' | 'oct'
  /** Filled parts of a 'quad' or 'oct' frame, numbered clockwise from the top. */
  shaded?: number[]
  items: FigItem[]
  /** Straight lines [x1, y1, x2, y2] in the 100 × 100 box (Hidden Figures). */
  lines?: [number, number, number, number][]
  /** Dotted lines [x1, y1, x2, y2], e.g. the fold line (Figure Fold Transparent Sheet). */
  dashed?: [number, number, number, number][]
}

/** A picture: a PNG cropped from the book (path under public/), '?' for the blank, or a drawing. */
export type Figure = string | Drawing

export type Compass4 = 'N' | 'E' | 'S' | 'W'
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
  // Directions (Chapter 31)
  | 'dir-walk'
  | 'dir-distance'
  | 'dir-turns'
  | 'dir-rotate'
  | 'dir-places'
  | 'dir-other'
  // Blood relations (Chapter 32)
  | 'rel-chain'
  | 'rel-other'
  // Calendar (Chapter 34)
  | 'cal-after'
  | 'cal-same-month'
  | 'cal-date'
  | 'cal-count'
  | 'cal-weeks'
  | 'cal-other'
  // Clock (Chapter 35)
  | 'clock-angle'
  | 'clock-mirror'
  | 'clock-together'
  | 'clock-turn'
  | 'clock-gain'
  | 'clock-other'
  // Number sequence counting (Chapter 20)
  | 'seq-count'
  | 'seq-position'
  // Letter–number analogy (Chapter 22)
  | 'ln-sum'
  | 'ln-letter'
  | 'ln-shift'
  | 'ln-other'
  // Arithmetical operations (Chapter 25)
  | 'ops-fill'
  | 'ops-code'
  | 'ops-swap'
  | 'ops-swap-num'
  | 'ops-meaning'
  // Signs and symbols (Chapter 26)
  | 'sign-fill'
  | 'sign-swap'
  // Number patterns (Chapter 15)
  | 'grid-shift'
  // Analogy of figures (Chapter 1)
  | 'fig-rotate'
  | 'fig-mirror'
  | 'fig-sides'
  | 'fig-fill'
  | 'fig-swap'
  | 'fig-count'
  | 'fig-move'
  | 'fig-other'
  | 'grid-flip'
  // Hidden figures (Chapter 3)
  | 'fig-hidden'
  // Intersecting figures (Chapter 5)
  | 'venn-count'
  | 'venn-part'
  // Figure fold transparent sheet (Chapter 6)
  | 'fold-sheet'
  // Paper fold and punch (Chapter 7)
  | 'paper-punch'
  // Mirror image (Chapter 8)
  | 'mirror-image'
  // Water image (Chapter 9)
  | 'water-image'
  // Cubes cutting (Chapter 10)
  | 'cube-count'
  | 'cube-area'
  | 'cube-cut'
  | 'cube-paint'
  // Numbers in opposite faces: dice (Chapter 11)
  | 'dice-views'
  | 'dice-net'
  | 'dice-standard'

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
  /** A walk to draw in the explanation: moves of [N/E/S/W, distance], from the start. */
  path?: [Compass4, number][]
  /** Places to draw in the explanation: [label, x (east), y (north)]. */
  points?: [string, number, number][]
  /** A dashed line to draw between two points (or 'start' and 'end' of the path). */
  link?: [string, string]
  /** A family tree to draw in the explanation (Blood Relations). */
  tree?: FamilyTree
  /** A clock face to draw in the explanation: [hours, minutes]. */
  clock?: [number, number]
  /** A number table the question's groups are taken from (Number Patterns); rows of numbers. */
  grid?: number[][]
  /** Picture questions: the pictures in the question ('?' marks the blank) and, unless the options are words, in the options. */
  figures?: { terms: Figure[]; options?: Record<OptionKey, Figure> }
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
  cheatSheet?: 'numbers' | 'alphabet' | 'relations' | 'none'
}
