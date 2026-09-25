/**
 * Writes kannada-review.csv (English next to Kannada) for a native speaker to review:
 * the interface text, the book content and tips, and a sample of generated explanations.
 * Run from app/:  npm run i18n:export
 */
import { writeFileSync } from 'node:fs'
import { CHAPTER_FILES } from '../app/src/data/chapters'
import { en } from '../app/src/lib/i18n/en'
import { kn } from '../app/src/lib/i18n/kn'
import { generateCoding } from '../app/src/lib/generators/coding'
import { generateRuleQuestion, generateWrongNumber } from '../app/src/lib/generators/games'
import { generateLetterSeries, LETTER_PATTERNS } from '../app/src/lib/generators/letterSeries'
import { generateOddOne } from '../app/src/lib/generators/oddOne'
import { generateAnalogyRuleQuestion, generateNumberAnalogy } from '../app/src/lib/generators/numberAnalogy'
import { GENERATOR_PATTERNS, generateNumberSeries, mulberry32 } from '../app/src/lib/generators/numberSeries'
import type { Question } from '../app/src/types'

const rows: string[][] = [['section', 'key', 'english', 'kannada', 'reviewer comment']]
const add = (section: string, key: string, e: string | undefined, k: string | undefined) => {
  if (e || k) rows.push([section, key, e ?? '', k ?? '(same as English)', ''])
}

/** Dictionary functions are shown with numbered placeholders, e.g. "Retry {1} mistakes". */
function show(v: unknown): string {
  if (typeof v === 'function') {
    const args = Array.from({ length: v.length }, (_, i) => `{${i + 1}}`)
    const out = v(...args)
    return Array.isArray(out) ? out.map((r) => (Array.isArray(r) ? r.join('') : r)).join(' | ') : String(out)
  }
  if (Array.isArray(v)) return v.map((x) => (Array.isArray(x) ? x.join('') : x)).join(' | ')
  return String(v)
}

function walk(e: Record<string, unknown>, k: Record<string, unknown>, path: string) {
  for (const key of Object.keys(e)) {
    const [ev, kv] = [e[key], k[key]]
    const p = path ? `${path}.${key}` : key
    if (ev && typeof ev === 'object' && !Array.isArray(ev)) walk(ev as Record<string, unknown>, kv as Record<string, unknown>, p)
    else add('interface', p, show(ev), show(kv))
  }
}
walk(en, kn, '')

for (const c of CHAPTER_FILES) {
  for (const q of c.questions) for (const f of ['prompt', 'rule', 'working', 'note'] as const) add(`book: ${c.name}`, `${q.id}.${f}`, q[f], c.kn[q.id]?.[f])
  add(`tips: ${c.name}`, 'intro', c.meta.intro, c.metaKn.intro)
  c.meta.tips.forEach((t, i) => {
    add(`tips: ${c.name}`, `tip${i + 1}.title`, t.title, c.metaKn.tips[i]?.title)
    add(`tips: ${c.name}`, `tip${i + 1}.body`, t.body, c.metaKn.tips[i]?.body)
    add(`tips: ${c.name}`, `tip${i + 1}.caption`, t.caption, c.metaKn.tips[i]?.caption)
  })
}

const sample = (section: string, q: Question) => {
  add(section, `${q.pattern} question`, q.prompt, q.kn?.prompt)
  add(section, `${q.pattern} rule`, q.rule, q.kn?.rule)
  add(section, `${q.pattern} working`, q.working, q.kn?.working)
}
const rng = mulberry32(2026)
for (const p of GENERATOR_PATTERNS) for (let i = 0; i < 3; i++) sample('generated: series', generateNumberSeries(rng, p))
for (let i = 0; i < 10; i++) sample('generated: analogy', generateNumberAnalogy(rng))
for (const p of LETTER_PATTERNS) for (let i = 0; i < 2; i++) sample('generated: letter series', generateLetterSeries(rng, p))
for (let i = 0; i < 10; i++) sample('generated: wrong number', generateWrongNumber(rng))
for (let i = 0; i < 12; i++) sample('generated: odd one out', generateOddOne(rng))
for (let i = 0; i < 14; i++) sample('generated: coding', generateCoding(rng))
for (let i = 0; i < 5; i++) {
  for (const q of [generateRuleQuestion(rng), generateAnalogyRuleQuestion(rng)]) {
    sample('generated: guess the rule', q)
    for (const o of ['A', 'B', 'C', 'D'] as const) add('generated: guess the rule', `option ${o}`, q.options[o], q.kn?.options?.[o])
  }
}

const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
// A byte-order mark so Excel opens the Kannada as UTF-8.
writeFileSync('../kannada-review.csv', '﻿' + csv + '\n')
console.log(`Wrote ../kannada-review.csv (${rows.length - 1} rows)`)
