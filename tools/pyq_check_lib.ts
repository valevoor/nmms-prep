/**
 * Shared helpers for the past-paper checkers (tools/check_pyq_<paper>.ts): rules that test one option
 * of a question, and runPaper(), which applies them to every question of a paper.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Key = 'A' | 'B' | 'C' | 'D'
export type Q = {
  id: string
  paperNo: number
  topic: string | null
  answer: string
  options: Record<string, string>
  terms: string[]
  table?: string[][]
  status?: string
  note?: string
  figures?: { terms: string[]; options?: Record<string, string> }
}
export const range = (a: number, n: number) => Array.from({ length: n }, (_, i) => a + i)
export const isPrime = (n: number) => n > 1 && range(2, Math.max(0, Math.floor(Math.sqrt(n)) - 1)).every((d) => n % d)
export const place = (c: string) => c.toUpperCase().charCodeAt(0) - 64
export const letter = (n: number) => String.fromCharCode(65 + ((((n - 1) % 26) + 26) % 26))
export const shift = (w: string, steps: (i: number) => number) => [...w].map((c, i) => letter(place(c) + steps(i))).join('')
/** Fills the '?' terms with an option ("4, 8" fills two). */
export const fill = (terms: string[], v: string) => {
  const parts = v.split(',').map((s) => s.trim())
  let k = 0
  return terms.map((t) => (t === '?' ? (parts[k++] ?? '?') : t))
}
/** Works out a sum with × ÷ before + −, from left to right. */
export function calc(expr: string): number {
  const toks = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').match(/\d+(?:\.\d+)?|[-+*/]/g)!
  const terms: number[] = []
  const signs: string[] = []
  let cur = Number(toks[0])
  for (let i = 1; i < toks.length; i += 2) {
    const op = toks[i]
    const n = Number(toks[i + 1])
    if (op === '*') cur *= n
    else if (op === '/') cur /= n
    else terms.push(cur), signs.push(op), (cur = n)
  }
  terms.push(cur)
  return terms.reduce((s, t, i) => (i === 0 ? t : signs[i - 1] === '+' ? s + t : s - t))
}
/** True when "a = b" (or < >) holds. */
export function holds(stmt: string): boolean {
  const m = stmt.match(/^(.*?)([=<>])(.*)$/)
  if (!m || /[=<>]/.test(m[3])) return false
  const [l, r] = [calc(m[1]), calc(m[3])]
  return m[2] === '=' ? Math.abs(l - r) < 1e-9 : m[2] === '<' ? l < r : l > r
}
export const SIGN = (s: string) => s.replace(/-/g, '−')

/** A rule for a word or number question: does this option fit? Exactly one option must. */
export type Fits = (q: Q, option: string) => boolean
export const series = (full: (string | number)[]): Fits => (q, v) => fill(q.terms, v).join(',') === full.map(String).join(',')
export const analogy = (f: (x: number) => number): Fits => (q, v) => {
  const t = q.terms.map((x) => (x === '?' ? v : x)).map(Number)
  return Math.abs(f(t[0]) - t[1]) < 1e-9 && Math.abs(f(t[2]) - t[3]) < 1e-9
}
/** Wrong number: the option is exactly the term(s) of the series that differ from the rule's. */
export const wrong = (right: number[]): Fits => (q, v) => {
  const bad = q.terms.map((t, i) => (Number(t) === right[i] ? null : t)).filter((t) => t !== null)
  return bad.join(', ') === v
}
export const odd = (alike: (o: string) => boolean): Fits => (q, v) => !alike(v) && Object.values(q.options).filter((o) => o !== v).every(alike)
export const matrix = (ok: (m: number[][]) => boolean, num: (c: string) => number = Number): Fits => (q, v) =>
  ok(q.table!.map((row) => row.map((c) => num(c === '?' ? v : c))))
export const is = (want: string): Fits => (_, v) => v === want

export const lines = (c: string) => ({ L: 2, T: 2, X: 2, Z: 3, H: 3, K: 3, A: 3, N: 3, I: 3, E: 4, M: 4, W: 4 })[c] ?? -1
export const cube = (n: number) => n ** 3

/** Code table (Q53-56): every letter-to-code-letter matching that fits all the words. */
export function solveTable(table: string[][]): Record<string, string>[] {
  const letters = [...new Set(table.flatMap(([w]) => [...w]))]
  const out: Record<string, string>[] = []
  const fits = (a: Record<string, string>) =>
    table.every(([w, c]) => {
      const known = [...w].filter((x) => a[x])
      const pool = [...c]
      for (const x of known) {
        const i = pool.indexOf(a[x])
        if (i < 0) return false
        pool.splice(i, 1)
      }
      return true
    })
  const go = (i: number, a: Record<string, string>) => {
    if (i === letters.length) return void out.push({ ...a })
    const x = letters[i]
    const codes = new Set(table.filter(([w]) => w.includes(x)).flatMap(([, c]) => [...c]))
    for (const c of codes) {
      if (Object.values(a).includes(c)) continue
      a[x] = c
      if (fits(a)) go(i + 1, a)
      delete a[x]
    }
  }
  go(0, {})
  return out
}
export const codeOf = (word: string): Fits => (q, v) => solveTable(q.table!).some((a) => [...word].map((c) => a[c]).join('') === v)

/** Day of the week (0 = Sunday) by counting days, without Date's own calendar: days since 1 Jan 2000 (a Saturday). */
export function weekday(y: number, m: number, d: number): number {
  const leap = (yr: number) => (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0
  const MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let days = 0
  for (let yr = 2000; yr < y; yr++) days += leap(yr) ? 366 : 365
  for (let mm = 1; mm < m; mm++) days += MONTHS[mm - 1] + (mm === 2 && leap(y) ? 1 : 0)
  days += d - 1
  return (6 + days) % 7
}
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
/** The number opposite `n`, from views of three faces at a corner: the only number never seen with it, if there is one. */
export function oppositeOf(views: number[][], n: number): number | undefined {
  const nextTo = (a: number) => new Set(views.filter((v) => v.includes(a)).flat())
  const left = range(1, 6).filter((m) => m !== n && !nextTo(n).has(m))
  if (left.length === 1) return left[0]
  // Otherwise find the face whose own neighbours rule out everything but n.
  const sure = range(1, 6).filter((m) => m !== n && range(1, 6).filter((k) => k !== m && !nextTo(m).has(k)).join() === String(n))
  return sure.length === 1 ? sure[0] : undefined
}


const PUBLIC = new URL('../app/public/', import.meta.url).pathname
const hash = (f: string) => createHash('sha1').update(readFileSync(join(PUBLIC, f))).digest('hex')

/**
 * Checks every question of a paper. A question with a rule must have exactly one option that fits it,
 * and that option marked; a picture question solved by eye must be marked as listed in `byEye`.
 * `unsure` lists the questions that must be hidden (needs-review, with a note). Returns the problem count.
 */
export function runPaper(name: string, questions: Q[], rules: Record<number, Fits>, byEye: Record<number, Key>, unsure: Set<number>): number {
  let bad = 0
  const fail = (q: Q, msg: string) => (bad++, console.log(`✗ Q${q.paperNo} (${q.id}): ${msg}`))
  for (const q of questions) {
    if (new Set(Object.values(q.options)).size !== 4 && !q.figures?.options) fail(q, 'options are not 4 different values')
    if (unsure.has(q.paperNo) !== (q.status === 'needs-review')) fail(q, unsure.has(q.paperNo) ? 'should be hidden (needs-review)' : 'hidden, but its answer is sure')
    if (q.status === 'needs-review' && !q.note) fail(q, 'hidden without a note')
    if (q.figures) {
      const files = [...q.figures.terms.filter((f) => f !== '?'), ...Object.values(q.figures.options ?? {})]
      for (const f of files) if (!existsSync(join(PUBLIC, f))) fail(q, `missing picture ${f}`)
      const opts = Object.values(q.figures.options ?? {})
      if (opts.length && new Set(opts.map((f) => (existsSync(join(PUBLIC, f)) ? hash(f) : f))).size !== 4) fail(q, 'two option pictures are the same')
    }
    const rule = rules[q.paperNo]
    if (rule) {
      const fits = (Object.keys(q.options) as Key[]).filter((k) => rule(q, q.options[k]))
      if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.paperNo}: ${q.answer} (${q.options[q.answer]})${q.status ? ' (hidden)' : ''}`)
      else fail(q, `options that fit the rule: ${fits.join(', ') || 'none'}; marked ${q.answer}`)
    } else if (byEye[q.paperNo]) {
      if (byEye[q.paperNo] !== q.answer) fail(q, `marked ${q.answer}, solved by eye as ${byEye[q.paperNo]}`)
      else console.log(`✓ Q${q.paperNo}: ${q.answer} (picture, solved by eye)${q.status ? ' (hidden)' : ''}`)
    } else fail(q, 'no rule to check it against')
  }
  console.log(bad ? `\n${bad} problem(s) found.` : `\nAll ${questions.length} answers in the ${name} paper check out.`)
  return bad
}
