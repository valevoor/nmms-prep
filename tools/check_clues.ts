/**
 * Checks the step-by-step clues (data/clues/<topic>.json + .kn.json, shown by components/ClueCard.tsx):
 * - every question the chapter shows students (its book questions and the past-paper questions filed
 *   under it, except needs-review ones) has 3–6 clues, and no other question has any;
 * - the Kannada has the same number of clues for the same questions, in Kannada script;
 * - no clue gives the answer away: the last one sets up the missing number ("= ?" or a question), and
 *   none says "? = <answer>" or ends the last sum with the answer.
 * The arithmetic in the clues is the same as in each question's `working`, which the chapter's own
 * check_<topic>.ts and check_pyq_<paper>.ts already verify.
 * Run from app/:  npx tsx ../tools/check_clues.ts
 */
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { PAPER_FILES } from '../app/src/data/papers'
import { CLUE_FILES } from '../app/src/lib/clues'

const KANNADA = /[ಀ-೿]/
// English words: lowercase letters, but not units or the algebra terms ad, abc, abcd (Arithmetical Operations Q3).
const WORDS = /\b(?!(?:km|cm|ad|abc|abcd)\b)[a-z]{2,}/
const problems: string[] = []

type Q = { id: string; status?: string; answer: string; options: Record<string, string>; terms?: string[]; pyramid?: string[][] }

for (const f of CLUE_FILES) {
  const book = (CHAPTER_FILES.find((c) => c.id === f.topic)?.questions ?? []) as Q[]
  const papers = PAPER_FILES.flatMap((p) => (p.questions as (Q & { topic?: string })[]).filter((q) => q.topic === f.topic))
  const all = [...book, ...papers]
  const byId = new Map(all.map((q) => [q.id, q]))
  // Past-paper-only chapters (Superimpose, Missing Figures, Miscellaneous) have no book questions.
  if (!CHAPTER_FILES.some((c) => c.id === f.topic)) problems.push(`${f.topic}: no such chapter`)

  for (const id of Object.keys(f.en)) {
    const q = byId.get(id)
    if (!q) problems.push(`${f.topic}: ${id} has clues but is not one of the chapter's questions`)
    else if (q.status === 'needs-review') problems.push(`${f.topic}: ${id} is hidden (needs-review) but has clues`)
  }
  for (const id of Object.keys(f.kn)) if (!f.en[id]) problems.push(`${f.topic}: ${id} has Kannada clues but no English ones`)

  for (const q of all) {
    if (q.status === 'needs-review') continue
    const en = f.en[q.id]
    const kn = f.kn[q.id]
    if (!en) {
      problems.push(`${f.topic}: ${q.id} has no clues`)
      continue
    }
    if (en.length < 3 || en.length > 6) problems.push(`${f.topic}: ${q.id} has ${en.length} clues (3–6 wanted)`)
    if (!kn || kn.length !== en.length) problems.push(`${f.topic}: ${q.id} has ${en.length} clues in English but ${kn?.length ?? 0} in Kannada`)
    // Lowercase letter groups taken from the question itself ("glmn" in a pyramid) are not English words.
    const own = new Set(JSON.stringify([q.terms, q.options, q.pyramid]).match(/[a-z]+/g) ?? [])
    kn?.forEach((c, i) => {
      // A clue that is only a sum ("(5 + 2) × 15 = 105.") reads the same in both languages.
      if (!KANNADA.test(c) && c !== en[i]) problems.push(`${f.topic}: ${q.id} Kannada clue ${i + 1} has no Kannada script`)
      if (WORDS.test(c.replace(/[a-z]+/g, (w) => (own.has(w) ? '' : w)))) problems.push(`${f.topic}: ${q.id} Kannada clue ${i + 1} still has English words: "${c}"`)
    })
    // "10 years" is looked for as 10.
    const answer = q.options[q.answer].replace(/\s+[^\d,\s].*$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // The answer on its own after "=", not the start of a longer sum ("2x = 15 + 15").
    const after = '(?![0-9]|\\.[0-9]|\\s*[+−×÷])'
    const gives = new RegExp(`\\?\\s*=\\s*${answer}${after}`)
    const ends = new RegExp(`=\\s*${answer}${after}`)
    for (const [lang, list] of [['en', en], ['kn', kn ?? []]] as const) {
      list.forEach((c, i) => {
        if (gives.test(c)) problems.push(`${f.topic}: ${q.id} ${lang} clue ${i + 1} gives the answer: "${c}"`)
      })
      const last = list.at(-1)
      if (!last) continue
      if (!last.includes('?')) problems.push(`${f.topic}: ${q.id} ${lang} last clue doesn't leave the missing number to find: "${last}"`)
      if (ends.test(last)) problems.push(`${f.topic}: ${q.id} ${lang} last clue works out the answer: "${last}"`)
    }
  }
  console.log(`${f.topic}: clues for ${Object.keys(f.en).length} of ${all.filter((q) => q.status !== 'needs-review').length} questions`)
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s):`)
  problems.forEach((p) => console.log(`  ${p}`))
  process.exit(1)
}
console.log('✓ Clues complete')
