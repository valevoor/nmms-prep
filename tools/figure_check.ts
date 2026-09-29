/**
 * Shared checks for the picture chapters: the marked answers against the book's key (typed in
 * separately), every picture file present, and four different pictures in each question's options.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type FigQ = {
  id: string
  bookNo: number
  answer: string
  keyFrom: string
  status?: string
  figures: { terms: string[]; options?: Record<string, string> }
}

const PUBLIC = new URL('../app/public/', import.meta.url).pathname
const hash = (f: string) => createHash('sha1').update(readFileSync(join(PUBLIC, f))).digest('hex')

/**
 * Returns the number of problems found (and prints them). `steps`: the given figures are steps to
 * follow (Paper Fold and Punch), so there is no blank among them.
 */
export function checkFigureChapter(name: string, questions: FigQ[], key: Record<number, string>, steps = false): number {
  let bad = 0
  const fail = (q: FigQ, msg: string) => {
    bad++
    console.log(`✗ ${name} Q${q.bookNo}: ${msg}`)
  }
  for (const q of questions) {
    if (q.keyFrom === 'book' && key[q.bookNo] !== q.answer) fail(q, `marked ${q.answer}, the book's key says ${key[q.bookNo]}`)
    if (q.keyFrom === 'solved' && key[q.bookNo] === q.answer) fail(q, 'marked "solved" but agrees with the key')
    const files = [...q.figures.terms.filter((f) => f !== '?'), ...Object.values(q.figures.options ?? {})]
    for (const f of files) if (!existsSync(join(PUBLIC, f))) fail(q, `missing picture ${f}`)
    if (!steps && !q.figures.terms.includes('?') && q.figures.terms.length !== 1) fail(q, 'no blank in the question')
    const opts = Object.values(q.figures.options ?? {})
    if (opts.length !== 4) fail(q, 'needs 4 option pictures')
    else if (opts.every((f) => existsSync(join(PUBLIC, f))) && new Set(opts.map(hash)).size !== 4) fail(q, 'two option pictures are the same')
  }
  const nos = questions.map((q) => q.bookNo)
  for (const n of Object.keys(key).map(Number)) if (!nos.includes(n)) console.log(`✗ ${name} Q${n} is missing`), bad++
  console.log(bad ? `${name}: ${bad} problem(s)` : `✓ ${name}: ${questions.length} questions match the key, all pictures present`)
  return bad
}
