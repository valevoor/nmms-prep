/**
 * Reads the plain-text maths in the SAT papers ("√(1 + 27/169) = 1 + m/13") into parts that can be drawn
 * as printed: stacked fractions, square roots with a bar over what they cover, and raised exponents.
 *
 * Only what the papers use is recognised:
 * - `a/b` where each side is a number ("27", "6.25"), up to three letters with an optional number in front
 *   ("x", "4m", "ab", "CP"), with any superscripts or subscripts ("x²", "d₁"), a root ("√a") or a bracket
 *   ("(x − 19)", "n(n − 3)"). Spaces around the slash are allowed ("(…) / 4.5"). A bracket on its own above
 *   or below the line loses its brackets, as the paper prints it. Longer words ("rate/100") stay as text.
 * - `√(…)` and `√` before a number or letters.
 * - `^(…)`, an exponent too long for superscript characters ("(b/a)^(1 − 3x)").
 * Everything else is left as text.
 */

export type MathNode = string | { frac: [MathNode[], MathNode[]] } | { root: MathNode[] } | { sup: string }

/** Superscript and subscript characters that stay attached to the number or bracket before them. */
const MARKS = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ₀₁₂₃₄₅₆₇₈₉'
const ATOM = new RegExp(`^(?:\\d+(?:\\.\\d+)?[A-Za-z]{0,3}|[A-Za-z]{1,3})(?![A-Za-z0-9])[${MARKS}]*`)
const WORD_CHAR = /[A-Za-z0-9.]/

/** One piece of the line being read; `operand` pieces can go above or below a fraction line. */
interface Piece {
  nodes: MathNode[]
  end: number
  operand: boolean
  /** A single bracket, whose brackets are dropped when it becomes a numerator or denominator. */
  inner?: MathNode[]
}

/** Index of the bracket closing the one at `open`, or -1. */
function closing(s: string, open: number): number {
  let depth = 0
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')' && --depth === 0) return i
  }
  return -1
}

function marksAt(s: string, i: number): string {
  let j = i
  while (j < s.length && MARKS.includes(s[j])) j++
  return s.slice(i, j)
}

/** A number, short letters, root or bracket starting at `i`, if there is one. */
function operandAt(s: string, i: number): Piece | undefined {
  if (s[i] === '√') {
    if (s[i + 1] === '(') {
      const j = closing(s, i + 1)
      if (j < 0) return undefined
      const marks = marksAt(s, j + 1)
      return { nodes: [{ root: parse(s.slice(i + 2, j)) }, ...(marks ? [marks] : [])], end: j + 1 + marks.length, operand: true }
    }
    const m = ATOM.exec(s.slice(i + 1))
    return m ? { nodes: [{ root: [m[0]] }], end: i + 1 + m[0].length, operand: true } : undefined
  }
  if (s[i] === '(') {
    const j = closing(s, i)
    if (j < 0) return undefined
    const inner = parse(s.slice(i + 1, j))
    const marks = marksAt(s, j + 1)
    return { nodes: ['(', ...inner, ')', ...(marks ? [marks] : [])], end: j + 1 + marks.length, operand: true, inner: marks ? undefined : inner }
  }
  if (i > 0 && WORD_CHAR.test(s[i - 1])) return undefined
  const m = ATOM.exec(s.slice(i))
  return m ? { nodes: [m[0]], end: i + m[0].length, operand: true } : undefined
}

/** Reads a line of text into text and maths parts. */
export function parse(s: string): MathNode[] {
  const out: Piece[] = []
  let i = 0
  while (i < s.length) {
    // An exponent: ^(…)
    if (s[i] === '^' && s[i + 1] === '(') {
      const j = closing(s, i + 1)
      if (j > 0) {
        out.push({ nodes: [{ sup: s.slice(i + 2, j) }], end: j + 1, operand: false })
        i = j + 1
        continue
      }
    }
    // A fraction line, with the operand just before it.
    const slash = /^ ?\/ ?/.exec(s.slice(i))
    if (slash && (slash[0].length === 1 || slash[0].length === 3)) {
      const left = out[out.length - 1]
      const right = operandAt(s, i + slash[0].length)
      if (left?.operand && left.end === i && right) {
        out.pop()
        const num = left.inner ?? left.nodes
        const den = right.inner ?? right.nodes
        out.push({ nodes: [{ frac: [num, den] }], end: right.end, operand: false })
        i = right.end
        continue
      }
    }
    const piece = operandAt(s, i)
    if (piece) {
      // A number or letters straight before a bracket go above the line with it: n(n − 3)/2, (a + b)(a − b)/…
      const prev = out[out.length - 1]
      if (prev?.operand && prev.end === i && s[i] === '(') {
        out[out.length - 1] = { nodes: [...prev.nodes, ...piece.nodes], end: piece.end, operand: true }
      } else out.push(piece)
      i = piece.end
      continue
    }
    out.push({ nodes: [s[i]], end: i + 1, operand: false })
    i++
  }
  return merge(out.flatMap((p) => p.nodes))
}

/** Joins neighbouring text parts. */
function merge(nodes: MathNode[]): MathNode[] {
  const out: MathNode[] = []
  for (const n of nodes) {
    if (typeof n === 'string' && typeof out[out.length - 1] === 'string') out[out.length - 1] += n
    else out.push(n)
  }
  return out
}

/** Whether the line has anything to draw beyond plain text. */
export function hasMath(nodes: MathNode[]): boolean {
  return nodes.some((n) => typeof n !== 'string')
}
