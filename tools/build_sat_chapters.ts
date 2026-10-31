/**
 * Builds app/src/data/sat/chapters.json, the SAT chapters the app shows, from the syllabus files in
 * sat-syllabus/ (chapter ID, number, part, title, pages, sub-discipline and topic aliases). Only chapters
 * that past-paper questions are filed under (data/pyq/*-sat.json, `topic`) are kept; the rest are left out.
 * Run from app/ after adding a SAT paper or changing a question's chapter:  npx tsx ../tools/build_sat_chapters.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const SYLLABUS = join(ROOT, 'sat-syllabus')
const PYQ = join(ROOT, 'app/src/data/pyq')
const OUT = join(ROOT, 'app/src/data/sat/chapters.json')

type Subject = 'maths' | 'science' | 'social'
const SUBJECTS: Record<string, Subject> = { maths: 'maths', science: 'science', 'social-science': 'social' }

/** Turns the syllabus's bits of LaTeX into plain text, e.g. "$3 \times 3$" → "3 × 3". */
function plain(s: string): string {
  return s
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\to/g, '→')
    .replace(/\^\\circ|\\circ/g, '°')
    .replace(/\\dots/g, '…')
    .replace(/\\pm/g, '±')
    .replace(/\\overline\{([^}]*)\}/g, '$1')
    .replace(/[$*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Splits an alias line at commas that are not inside brackets. */
function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const c of s) {
    if (c === '(') depth++
    if (c === ')') depth--
    if (c === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  return [...out, cur].map((x) => x.trim()).filter(Boolean)
}

interface Chapter {
  id: string
  subject: Subject
  cls: number
  no: number
  name: string
  part: number
  pages: [number, number]
  area: string
  topics: string[]
}

const chapters: Chapter[] = []
for (const file of readdirSync(SYLLABUS)
  .filter((f) => f.endsWith('.md'))
  .sort()) {
  const m = file.match(/^sat-syllabus-(\d)th-(.+)\.md$/)
  if (!m) continue
  const cls = Number(m[1])
  const subject = SUBJECTS[m[2]]
  const text = readFileSync(join(SYLLABUS, file), 'utf8')
  for (const row of text.matchAll(/^\| `([a-z0-9-]+)` \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| (\d+)–(\d+) \|/gm)) {
    const id = row[1]
    // The chapter's own section: from its heading to the next chapter's.
    const start = text.search(new RegExp(`^#{2,3} .*\`${id}\``, 'm'))
    const rest = text.slice(text.indexOf('\n', start) + 1)
    const end = rest.search(/^#{2,3} .*`[a-z]+-\d-\d\d-/m)
    const section = end < 0 ? rest : rest.slice(0, end)
    let topics: string[]
    const line = section.match(/Canonical Topic Aliases:\*\*\s*(.*)/)
    if (line) topics = splitTop(line[1])
    else {
      const block = section.split('### Canonical Topic Aliases')[1]?.split('###')[0] ?? ''
      topics = [...block.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((b) => b[1])
    }
    chapters.push({
      id,
      subject,
      cls,
      no: parseInt(row[2]),
      name: plain(row[4]),
      part: parseInt(row[3].replace(/\D/g, '')),
      pages: [Number(row[6]), Number(row[7])],
      area: plain(row[5]),
      topics: topics.map(plain).filter((t) => t && !t.includes('\\')),
    })
  }
}

const used = new Map<string, number>()
for (const file of readdirSync(PYQ).filter((f) => f.endsWith('-sat.json'))) {
  for (const q of JSON.parse(readFileSync(join(PYQ, file), 'utf8')).questions) {
    if (q.topic) used.set(q.topic, (used.get(q.topic) ?? 0) + 1)
  }
}
const known = new Set(chapters.map((c) => c.id))
const unknown = [...used.keys()].filter((id) => !known.has(id))
if (unknown.length) {
  console.log(`✗ Questions are filed under chapters the syllabus doesn't have: ${unknown.join(', ')}`)
  process.exit(1)
}

const order: Subject[] = ['maths', 'science', 'social']
const kept = chapters.filter((c) => used.has(c.id)).sort((a, b) => order.indexOf(a.subject) - order.indexOf(b.subject) || a.cls - b.cls || a.no - b.no)
writeFileSync(OUT, `${JSON.stringify(kept, null, 1)}\n`)
console.log(`${kept.length} of ${chapters.length} chapters have past-paper questions → ${OUT}`)
