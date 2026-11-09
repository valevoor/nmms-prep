/**
 * Checks the answers to the study book's SAT social science questions (data/sat/book.json, subject "social").
 * The book has an answer key, and each answer here was checked against the syllabus notes (sat-syllabus/*.md):
 * every question has a rule saying which options are true, with a short reason, and exactly one option must be true
 * and match the answer. A key that is wrong is corrected (keyFrom "solved", with a note saying so); a question with
 * no single right answer has no answer and a note (English and Kannada) saying why. These answers have no worked
 * solution. The past papers' social science questions are not solved yet.  Run from app/:  npx tsx ../tools/check_sat_social.ts
 */
import { SAT_BOOK } from '../app/src/data/sat'

const KEYS = ['A', 'B', 'C', 'D'] as const
/** Which options are true, e.g. "FTFF", and why (a fact from the syllabus or the book). */
type Rule = { marks: string; why: string }
const t = (marks: string, why: string): Rule => ({ marks, why })

const RULES: Record<string, Rule> = {
  // ---- Book: NMMS.pdf (data/sat/book.json) ----
  // ---- end of book ----
}

/** Questions left without an answer on purpose (each says why in its note). */
const UNSOLVED = new Set([
  // ---- Book unsolved ----
  // ---- end of book unsolved ----
])

const problems: string[] = []
let checked = 0
for (const q of SAT_BOOK.questions.filter((x) => x.subject === 'social')) {
  const at = `book social Q${q.paperNo} (${q.id})`
  if (UNSOLVED.has(q.id)) {
    if (q.answer) problems.push(`${at}: listed as unsolved but has an answer`)
    if (!q.note || !SAT_BOOK.kn[q.id]?.note) problems.push(`${at}: an unsolved question needs a note (English and Kannada) saying why`)
    continue
  }
  const rule = RULES[q.id]
  if (!rule) {
    problems.push(`${at}: no rule`)
    continue
  }
  if (!/^[TF]{4}$/.test(rule.marks) || !rule.why) problems.push(`${at}: a rule needs four T/F marks and a reason`)
  if (!q.answer) problems.push(`${at}: no answer`)
  if (q.keyFrom !== 'book' && q.keyFrom !== 'solved') problems.push(`${at}: no keyFrom`)
  if (q.keyFrom === 'solved' && (!q.note || !SAT_BOOK.kn[q.id]?.note)) problems.push(`${at}: a corrected key needs a note (English and Kannada) saying so`)
  const fits = KEYS.filter((_, i) => rule.marks[i] === 'T')
  if (fits.length !== 1) problems.push(`${at}: ${fits.length} options are true (${fits.join(', ') || 'none'})`)
  else if (fits[0] !== q.answer) problems.push(`${at}: answer ${q.answer}, but the rule gives ${fits[0]}`)
  checked++
}
for (const id of [...Object.keys(RULES), ...UNSOLVED])
  if (!SAT_BOOK.questions.some((q) => q.id === id && q.subject === 'social')) problems.push(`${id}: listed here but isn't a book social science question`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`SAT social science (book): ${checked} answers checked, ${UNSOLVED.size} left unsolved on purpose`)
