/**
 * Checks the SAT past papers (data/pyq/*-sat.json) and the SAT chapter list (data/sat/chapters.json):
 * every paper has questions 1 to 90 once each with unique ids, four non-empty options and a known
 * section; each question is filed under a listed chapter or none (`topic: null`); every picture exists;
 * an answer, once added, is one of the options and says where it came from (`keyFrom`); every listed
 * chapter has at least one question and a Kannada name; and each group of combined chapters
 * (data/sat/groups.json) lists two or more listed chapters of its own subject, none of them in another
 * group; a question under no chapter names a listed old-syllabus chapter of its own subject
 * (`oldChapter`, data/sat/old-chapters.json), each of which has questions; and every question is in exactly one topic. This checks the transcription's shape; tools/check_sat_maths.ts checks the maths answers. Run from app/:  npx tsx ../tools/check_sat.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OLD_CHAPTERS, SAT_CHAPTERS, SAT_PAPERS, SAT_TOPICS, SECTION_SUBJECT, satQuestions } from '../app/src/data/sat'

const PUBLIC = join(import.meta.dirname, '../app/public')
const SECTIONS = new Set(['physics', 'chemistry', 'biology', 'history', 'geography', 'social', 'maths'])
const KEYS = ['A', 'B', 'C', 'D'] as const
const chapters = new Set(SAT_CHAPTERS.map((c) => c.id))
const kn = JSON.parse(readFileSync(join(import.meta.dirname, '../app/src/data/sat/chapters.kn.json'), 'utf8'))
const problems: string[] = []
const ids = new Set<string>()
const used = new Map<string, number>()
const oldChapters = new Map(OLD_CHAPTERS.map((c) => [c.id, c]))
const oldUsed = new Set<string>()

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
      if (q.oldChapter) problems.push(`${at}: has a chapter, so it can't have an old-syllabus chapter too`)
    }
    if (q.oldChapter) {
      const old = oldChapters.get(q.oldChapter)
      if (!old) problems.push(`${at}: "${q.oldChapter}" is not in data/sat/old-chapters.json`)
      else if (old.subject !== SECTION_SUBJECT[q.subject]) problems.push(`${at}: old-syllabus chapter ${old.id} is ${old.subject}, not ${SECTION_SUBJECT[q.subject]}`)
      oldUsed.add(q.oldChapter)
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
  const none = p.questions.filter((q) => q.topic === null && !q.oldChapter).length
  console.log(`${p.id}: ${p.questions.length} questions, ${p.questions.length - loose} in a chapter, ${loose - none} in an old-syllabus chapter, ${none} uncategorized`)
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
for (const c of OLD_CHAPTERS) {
  if (!oldUsed.has(c.id)) problems.push(`old-syllabus chapter ${c.id}: no question is filed under it`)
  if (!c.kn) problems.push(`old-syllabus chapter ${c.id}: no Kannada name`)
}
if (oldChapters.size !== OLD_CHAPTERS.length) problems.push('two old-syllabus chapters share an id')
const all = SAT_PAPERS.flatMap((p) => p.questions.map((q) => q.id))
const shown = SAT_TOPICS.flatMap((t) => satQuestions(t).map((x) => x.q.id))
if (shown.length !== all.length || new Set(shown).size !== all.length) problems.push(`topics show ${shown.length} questions (${new Set(shown).size} different); the papers have ${all.length}`)

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((x) => console.log(`  ${x}`))
  process.exit(1)
}
console.log(
  `✓ SAT papers check out: ${SAT_CHAPTERS.length} chapters in ${SAT_TOPICS.length - OLD_CHAPTERS.length} topics, ${[...used.values()].reduce((a, b) => a + b, 0)} questions filed under them; ${OLD_CHAPTERS.length} old-syllabus chapters`,
)
