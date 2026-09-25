/**
 * Checks the Kannada book-content overlays (data/mat/*.kn.json):
 * - every book question has an entry, and there are no entries for questions that don't exist;
 * - every rule/working/note with English words has a Kannada version, written in Kannada script;
 * - every tip has a Kannada title, body and (if the English has one) caption.
 * The interface text needs no check here: TypeScript refuses to build if kn.ts misses a key.
 * Run from app/:  npx tsx ../tools/check_i18n.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'

const KANNADA = /[ಀ-೿]/
/**
 * English words, which always have lowercase letters. Not maths ("n² + n", "×2") and not puzzle
 * terms in capitals ("JPZ", "NMMN"), which stay as they are in every language.
 */
// Unit abbreviations (km, cm) stay the same in Kannada.
const WORDS = /\b(?!(?:km|cm)\b)[a-z]{2,}/

type Text = { prompt?: string; rule?: string; working?: string; note?: string }
type Meta = { intro: string; tips: { title: string; body: string; caption?: string }[] }

const problems: string[] = []

function checkChapter(name: string, questions: (Text & { id: string })[], kn: Record<string, Text>, meta: Meta, metaKn: Meta) {
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
  if (!KANNADA.test(metaKn.intro)) problems.push(`${name}: intro is not in Kannada`)
  if (metaKn.tips.length !== meta.tips.length) problems.push(`${name}: ${meta.tips.length} tips in English but ${metaKn.tips.length} in Kannada`)
  meta.tips.forEach((t, i) => {
    const k = metaKn.tips[i]
    for (const f of ['title', 'body', 'caption'] as const) {
      if (t[f] && !(k?.[f] && KANNADA.test(k[f]!))) problems.push(`${name}: tip ${i + 1} ${f} needs Kannada`)
    }
  })
  const done = Object.keys(kn).length
  console.log(`${name}: ${done}/${questions.length} questions, ${metaKn.tips.length}/${meta.tips.length} tips`)
}

for (const c of CHAPTER_FILES) checkChapter(c.name, c.questions, c.kn, c.meta, c.metaKn)

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((p) => console.log(`  ${p}`))
  process.exit(1)
}
console.log('✓ Kannada content complete')
