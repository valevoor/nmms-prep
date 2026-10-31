/**
 * Checks the Kannada book-content overlays (data/mat/*.kn.json and the past papers' data/pyq/*.kn.json,
 * MAT and SAT):
 * - every book question has an entry, and there are no entries for questions that don't exist;
 * - every rule/working/note with English words has a Kannada version, written in Kannada script;
 * - every tip has a Kannada title, body and (if the English has one) caption.
 * The interface text needs no check here: TypeScript refuses to build if kn.ts misses a key.
 * Run from app/:  npx tsx ../tools/check_i18n.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { PAPER_FILES } from '../app/src/data/papers'
import { SAT_PAPERS } from '../app/src/data/sat'

const KANNADA = /[ಀ-೿]/
/**
 * English words, which always have lowercase letters. Not maths ("n² + n", "×2") and not puzzle
 * terms in capitals ("JPZ", "NMMN"), which stay as they are in every language.
 */
// Unit abbreviations (km, cm) and am/pm stay the same in Kannada, and so do the algebra terms
// ad, abc, abcd (Arithmetical Operations Q3).
const WORDS = /\b(?!(?:km|cm|am|pm|ad|abc|abcd)\b)[a-z]{2,}/

type Text = { prompt?: string; rule?: string; working?: string; note?: string }
type Meta = { intro: string; tips: { title: string; body: string; caption?: string }[]; videos?: { title: string }[] }

const problems: string[] = []

function checkQuestions(name: string, questions: (Text & { id: string })[], kn: Record<string, Text>) {
  const ids = new Set(questions.map((q) => q.id))
  for (const id of Object.keys(kn)) if (!ids.has(id)) problems.push(`${name}: ${id} is in the Kannada file but not in the book`)
  for (const q of questions) {
    const k = kn[q.id]
    if (!k) {
      problems.push(`${name}: ${q.id} has no Kannada entry`)
      continue
    }
    for (const f of ['prompt', 'rule', 'working', 'note'] as const) {
      const en = q[f]
      if (!en) continue
      if (WORDS.test(en) && !k[f]) problems.push(`${name}: ${q.id}.${f} needs Kannada: "${en}"`)
      if (k[f] && WORDS.test(k[f]!)) problems.push(`${name}: ${q.id}.${f} Kannada still has English words: "${k[f]}"`)
      if (k[f] && WORDS.test(en) && !KANNADA.test(k[f]!)) problems.push(`${name}: ${q.id}.${f} Kannada has no Kannada script`)
    }
  }
}

function checkChapter(name: string, questions: (Text & { id: string })[], kn: Record<string, Text>, meta: Meta, metaKn: Meta) {
  checkQuestions(name, questions, kn)
  if (!KANNADA.test(metaKn.intro)) problems.push(`${name}: intro is not in Kannada`)
  if (metaKn.tips.length !== meta.tips.length) problems.push(`${name}: ${meta.tips.length} tips in English but ${metaKn.tips.length} in Kannada`)
  meta.tips.forEach((t, i) => {
    const k = metaKn.tips[i]
    for (const f of ['title', 'body', 'caption'] as const) {
      if (t[f] && !(k?.[f] && KANNADA.test(k[f]!))) problems.push(`${name}: tip ${i + 1} ${f} needs Kannada`)
    }
  })
  meta.videos?.forEach((v, i) => {
    if (!KANNADA.test(metaKn.videos?.[i]?.title ?? '')) problems.push(`${name}: video ${i + 1} title needs Kannada`)
  })
  const done = Object.keys(kn).length
  console.log(`${name}: ${done}/${questions.length} questions, ${metaKn.tips.length}/${meta.tips.length} tips`)
}

for (const c of CHAPTER_FILES) checkChapter(c.name, c.questions, c.kn, c.meta, c.metaKn)
for (const p of PAPER_FILES) {
  checkQuestions(p.id, p.questions, p.kn)
  console.log(`${p.id}: ${Object.keys(p.kn).length}/${p.questions.length} questions`)
}

/** English words in a SAT option or table cell (not units like “km”, algebra like “at” or “abc”, or roman numerals). */
const SAT_WORDS = /\b(?!(?:ppm|abc|bca|cab|[ivx]+)\b)[a-z]{3,}/

// The SAT papers: every question has the paper's Kannada, and every option and table cell with English
// words in it has a Kannada version (tables keep their shape).
for (const p of SAT_PAPERS) {
  const name = `${p.id} (SAT)`
  const ids = new Set(p.questions.map((q) => q.id))
  for (const id of Object.keys(p.kn)) if (!ids.has(id)) problems.push(`${name}: ${id} is in the Kannada file but not in the paper`)
  for (const q of p.questions) {
    const k = p.kn[q.id]
    if (!k?.prompt || !KANNADA.test(k.prompt)) {
      problems.push(`${name}: ${q.id} needs a Kannada prompt`)
      continue
    }
    if (q.note && !(k.note && KANNADA.test(k.note))) problems.push(`${name}: ${q.id}.note needs Kannada`)
    for (const key of ['A', 'B', 'C', 'D'] as const) {
      const kn = k.options?.[key] ?? q.options[key]
      if (SAT_WORDS.test(q.options[key]) && !KANNADA.test(kn)) problems.push(`${name}: ${q.id} option ${key} needs Kannada: "${q.options[key]}"`)
    }
    if (q.table) {
      const shape = (t: string[][]) => t.map((r) => r.length).join()
      if (k.table && shape(k.table) !== shape(q.table)) problems.push(`${name}: ${q.id} Kannada table has a different shape`)
      if (!k.table && q.table.some((r) => r.some((c) => SAT_WORDS.test(c)))) problems.push(`${name}: ${q.id} table needs Kannada`)
    }
  }
  console.log(`${name}: ${Object.keys(p.kn).length}/${p.questions.length} questions`)
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((p) => console.log(`  ${p}`))
  process.exit(1)
}
console.log('✓ Kannada content complete')
