/**
 * Checks the past papers (data/pyq/*.json) as papers: every question numbered once from 1, ids unique,
 * each filed under a real chapter (or none, `topic: null`), and the answer one of the options. The
 * answers themselves are checked by each paper's own tools/check_pyq_<paper>.ts.
 * Run from app/:  npx tsx ../tools/check_pyq.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { PAPER_FILES } from '../app/src/data/papers'

const CHAPTERS = new Set(CHAPTER_FILES.map((c) => c.id))
const range = (a: number, n: number) => Array.from({ length: n }, (_, i) => a + i)
const problems: string[] = []
const ids = new Set<string>()

for (const p of PAPER_FILES) {
  const numbers = new Set<number>()
  for (const q of p.questions) {
    const at = `${p.id} Q${q.paperNo} (${q.id})`
    if (ids.has(q.id)) problems.push(`${at}: id used twice`)
    ids.add(q.id)
    if (!q.paperNo || numbers.has(q.paperNo)) problems.push(`${at}: missing or repeated question number`)
    numbers.add(q.paperNo ?? 0)
    if (q.topic !== null && !CHAPTERS.has(q.topic)) problems.push(`${at}: "${q.topic}" is not a chapter`)
    if (!(q.answer in q.options)) problems.push(`${at}: answer ${q.answer} is not an option`)
    if (q.keyFrom !== 'solved' && q.keyFrom !== 'book') problems.push(`${at}: keyFrom must be "solved" or "book" (the official key)`)
  }
  const missing = range(1, numbers.size).filter((n) => !numbers.has(n))
  if (missing.length) problems.push(`${p.id}: no question ${missing.join(', ')}`)
  const loose = p.questions.filter((q) => q.topic === null).map((q) => q.paperNo)
  console.log(`${p.id}: ${p.questions.length} questions${loose.length ? `; not in a chapter yet: Q${loose.join(', Q')}` : ''}`)
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((x) => console.log(`  ${x}`))
  process.exit(1)
}
console.log('✓ Past papers check out')
