/**
 * Checks the difficulty levels (data/levels/<topic>.json, used by lib/levels.ts): every question the
 * chapter shows students (its book questions and the past-paper questions filed under it, except
 * needs-review ones) has a level from 1 to 4, and no other question has one.
 * Run from app/:  npx tsx ../tools/check_levels.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { PAPER_FILES } from '../app/src/data/papers'
import { LEVEL_FILES, MAX_LEVEL } from '../app/src/lib/levels'

const problems: string[] = []
type Q = { id: string; status?: string; topic?: string }

for (const f of LEVEL_FILES) {
  const book = (CHAPTER_FILES.find((c) => c.id === f.topic)?.questions ?? []) as Q[]
  if (!book.length) problems.push(`${f.topic}: no such chapter`)
  const all = [...book, ...PAPER_FILES.flatMap((p) => (p.questions as Q[]).filter((q) => q.topic === f.topic))]
  const byId = new Map(all.map((q) => [q.id, q]))
  for (const [id, level] of Object.entries(f.levels)) {
    const q = byId.get(id)
    if (!q) problems.push(`${f.topic}: ${id} has a level but is not one of the chapter's questions`)
    else if (q.status === 'needs-review') problems.push(`${f.topic}: ${id} is hidden (needs-review) but has a level`)
    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) problems.push(`${f.topic}: ${id} has level ${level} (1–${MAX_LEVEL} wanted)`)
  }
  const shown = all.filter((q) => q.status !== 'needs-review')
  for (const q of shown) if (!(q.id in f.levels)) problems.push(`${f.topic}: ${q.id} has no level`)
  const counts = [1, 2, 3, 4].map((l) => Object.values(f.levels).filter((x) => x === l).length)
  console.log(`${f.topic}: levels for ${Object.keys(f.levels).length} of ${shown.length} questions (${counts.map((n, i) => `level ${i + 1}: ${n}`).join(', ')})`)
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((p) => console.log(`  ${p}`))
  process.exit(1)
}
console.log('✓ Levels complete')
