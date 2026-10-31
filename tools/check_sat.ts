/**
 * Checks the SAT past papers (data/pyq/*-sat.json) and the SAT chapter list (data/sat/chapters.json):
 * every paper has questions 1 to 90 once each with unique ids, four non-empty options and a known
 * section; each question is filed under a listed chapter or none (`topic: null`); every picture exists;
 * an answer, once added, is one of the options and says where it came from (`keyFrom`); every listed
 * chapter has at least one question and a Kannada name; and each group of combined chapters
 * (data/sat/groups.json) lists two or more listed chapters of its own subject, none of them in another
 * group. The questions aren't solved yet, so this checks the transcription's shape, not the answers. Run from app/:  npx tsx ../tools/check_sat.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SAT_CHAPTERS, SAT_PAPERS, SAT_TOPICS } from '../app/src/data/sat'

const PUBLIC = join(import.meta.dirname, '../app/public')
const SECTIONS = new Set(['physics', 'chemistry', 'biology', 'history', 'geography', 'social', 'maths'])
const KEYS = ['A', 'B', 'C', 'D'] as const
const chapters = new Set(SAT_CHAPTERS.map((c) => c.id))
const kn = JSON.parse(readFileSync(join(import.meta.dirname, '../app/src/data/sat/chapters.kn.json'), 'utf8'))
const problems: string[] = []
const ids = new Set<string>()
const used = new Map<string, number>()

for (const p of SAT_PAPERS) {
  const numbers = new Set<number>()
  for (const q of p.questions) {
    const at = `${p.id} Q${q.paperNo} (${q.id})`
    if (ids.has(q.id)) problems.push(`${at}: id used twice`)
    ids.add(q.id)
    if (numbers.has(q.paperNo)) problems.push(`${at}: question number used twice`)
    numbers.add(q.paperNo)
    if (!SECTIONS.has(q.subject)) problems.push(`${at}: unknown section "${q.subject}"`)
    if (!q.prompt.trim()) problems.push(`${at}: no question text`)
    if (!Number.isInteger(q.sourcePage)) problems.push(`${at}: no source page`)
    for (const k of KEYS) if (!q.options[k]?.trim()) problems.push(`${at}: option ${k} is empty`)
    if (Object.keys(q.options).length !== 4) problems.push(`${at}: needs exactly four options`)
    if (q.topic !== null) {
      if (!chapters.has(q.topic)) problems.push(`${at}: "${q.topic}" is not a listed SAT chapter (run tools/build_sat_chapters.ts)`)
      used.set(q.topic, (used.get(q.topic) ?? 0) + 1)
    }
    const pictures = [q.figure, ...Object.values(q.optionFigures ?? {})].filter(Boolean) as string[]
    for (const f of pictures) if (!existsSync(join(PUBLIC, f))) problems.push(`${at}: picture ${f} is missing`)
    const solved = q as typeof q & { keyFrom?: string }
    if (solved.answer !== undefined) {
      if (!KEYS.includes(solved.answer)) problems.push(`${at}: answer ${solved.answer} is not an option`)
      if (solved.keyFrom !== 'book' && solved.keyFrom !== 'solved') problems.push(`${at}: an answer needs keyFrom "book" (official key) or "solved"`)
    }
  }
  const missing = Array.from({ length: 90 }, (_, i) => i + 1).filter((n) => !numbers.has(n))
  if (missing.length) problems.push(`${p.id}: no question ${missing.join(', ')}`)
  if (numbers.size !== 90) problems.push(`${p.id}: ${numbers.size} questions, expected 90`)
  const loose = p.questions.filter((q) => q.topic === null).length
  console.log(`${p.id}: ${p.questions.length} questions, ${p.questions.length - loose} in a chapter, ${loose} outside the 2026-27 syllabus`)
}

for (const c of SAT_CHAPTERS) {
  if (!used.has(c.id)) problems.push(`${c.id}: no past-paper question is filed under this chapter (run tools/build_sat_chapters.ts)`)
  if (!kn[c.id]?.name) problems.push(`${c.id}: no Kannada name in data/sat/chapters.kn.json`)
}

const groups: { id: string; subject: string; kn: string; chapters: string[] }[] = JSON.parse(
  readFileSync(join(import.meta.dirname, '../app/src/data/sat/groups.json'), 'utf8'),
)
const inGroup = new Map<string, string>()
for (const g of groups) {
  if (chapters.has(g.id)) problems.push(`group ${g.id}: the id is also a chapter ID`)
  if (g.chapters.length < 2) problems.push(`group ${g.id}: a group needs two or more chapters`)
  if (!g.kn) problems.push(`group ${g.id}: no Kannada name`)
  for (const id of g.chapters) {
    const c = SAT_CHAPTERS.find((x) => x.id === id)
    if (!c) problems.push(`group ${g.id}: "${id}" is not a listed SAT chapter`)
    else if (c.subject !== g.subject) problems.push(`group ${g.id}: ${id} is ${c.subject}, not ${g.subject}`)
    if (inGroup.has(id)) problems.push(`group ${g.id}: ${id} is already in group ${inGroup.get(id)}`)
    inGroup.set(id, g.id)
  }
}
const covered = SAT_TOPICS.flatMap((t) => t.chapters.map((c) => c.id))
for (const c of SAT_CHAPTERS) if (covered.filter((id) => id === c.id).length !== 1) problems.push(`${c.id}: should be in exactly one topic`)
if (new Set(SAT_TOPICS.map((t) => t.id)).size !== SAT_TOPICS.length) problems.push('two topics share an id')

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((x) => console.log(`  ${x}`))
  process.exit(1)
}
console.log(
  `✓ SAT papers check out: ${SAT_CHAPTERS.length} chapters in ${SAT_TOPICS.length} topics, ${[...used.values()].reduce((a, b) => a + b, 0)} questions filed under them`,
)
