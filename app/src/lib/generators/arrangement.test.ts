import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Question } from '../../types'
import { generateArrangement } from './arrangement'
import { mulberry32 } from './numberSeries'

// An independent reading (not using arrangement.ts): the English question is parsed, rank and place
// questions are solved by laying out the row or class as a list, sorting questions by sorting, and
// seating questions by reading every clue and trying all 120 seatings. Every answer the question
// can have is collected; exactly one option may be among them, and there must be only one answer.
const n = (s: string) => Number(s.replace(/(st|nd|rd|th)$/, ''))

/** Places counted from 1 in a line of `total`: from the other end. */
const flip = (total: number, place: number) => total - place + 1

const perms = (xs: string[]): string[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))

function seatingAnswers(p: string): string[] {
  const sentences = p.split(/(?<=[.?])\s+/).slice(1)
  const ask = sentences.pop()!
  const tests = sentences.map((s): ((r: string[]) => boolean) => {
    const i = (r: string[], x: string) => r.indexOf(x)
    let m
    if ((m = s.match(/^(\w) sits at the (left|right) end\.$/))) return (r) => i(r, m![1]) === (m![2] === 'left' ? 0 : 4)
    if ((m = s.match(/^(\w) sits at one end of the row\.$/))) return (r) => [0, 4].includes(i(r, m![1]))
    if ((m = s.match(/^(\w) sits in the middle\.$/))) return (r) => i(r, m![1]) === 2
    if ((m = s.match(/^(\w) sits immediately to the left of (\w)\.$/))) return (r) => i(r, m![2]) - i(r, m![1]) === 1
    if ((m = s.match(/^Exactly (\d) (?:person sits|people sit) between (\w) and (\w)\.$/))) return (r) => Math.abs(i(r, m![2]) - i(r, m![3])) - 1 === Number(m![1])
    if ((m = s.match(/^(\w) sits next to (\w)\.$/))) return (r) => Math.abs(i(r, m![1]) - i(r, m![2])) === 1
    if ((m = s.match(/^(\w) does not sit next to (\w)\.$/))) return (r) => Math.abs(i(r, m![1]) - i(r, m![2])) !== 1
    if ((m = s.match(/^(\w) sits somewhere to the right of (\w)\.$/))) return (r) => i(r, m![1]) > i(r, m![2])
    throw new Error(`clue not understood: ${s}`)
  })
  const rows = perms(['P', 'Q', 'R', 'S', 'T']).filter((r) => tests.every((t) => t(r)))
  let m
  return rows.map((r) => {
    if (ask === 'Who sits in the middle?') return r[2]
    if ((m = ask.match(/^Who sits at the (left|right) end\?$/))) return m[1] === 'left' ? r[0] : r[4]
    if ((m = ask.match(/^Who sits immediately to the right of (\w)\?$/))) return r[r.indexOf(m[1]) + 1] ?? 'nobody'
    if ((m = ask.match(/^How many people sit between (\w) and (\w)\?$/))) return String(Math.abs(r.indexOf(m[1]) - r.indexOf(m[2])) - 1)
    throw new Error(`question not understood: ${ask}`)
  })
}

function answers(q: Question): string[] {
  const p = q.prompt!
  let m
  if ((m = p.match(/is (\d+\w\w) from the top in a class of (\d+) students/))) return [String(flip(n(m[2]), n(m[1])))]
  if ((m = p.match(/is (\d+\w\w) from the top and (\d+\w\w) from the bottom/))) return [String(n(m[1]) + n(m[2]) - 1)]
  if ((m = p.match(/is (\d+\w\w) from both ends/))) return [String(2 * n(m[1]) - 1)]
  if ((m = p.match(/is (\d+\w\w) from the left and \w+ is (\d+\w\w) from the right\. If they switch places, \w+ will be (\d+\w\w) from the left/)))
    // After the switch the first person stands in the second one's place.
    return [String(n(m[3]) + n(m[2]) - 1)]
  if ((m = p.match(/is (\d+) ranks (below|above) \w+, and \w+ is (\d+\w\w) in a class of (\d+) students/))) {
    const rank = n(m[3]) + (m[2] === 'below' ? 1 : -1) * Number(m[1])
    return [String(flip(n(m[4]), rank))]
  }
  if ((m = p.match(/rack of (\d+) books, a maths book is moved (\d+) places to the right and becomes (\d+\w\w) from the left/)))
    return [String(flip(n(m[1]), n(m[3]) - Number(m[2])))]
  if ((m = p.match(/^(\w+): when/))) {
    const s = m[1]
    const sorted = [...s].sort()
    return [String([...s].filter((c, i) => sorted[i] === c).length)]
  }
  if (p.startsWith('P, Q, R, S and T sit in a row')) return seatingAnswers(p)
  throw new Error(`unknown question: ${p}`)
}

describe('generateArrangement', () => {
  it('exactly one option fits, and the question has one answer', () => {
    const rng = mulberry32(36)
    const kinds = new Set<string>()
    for (let k = 0; k < 1500; k++) {
      const q = generateArrangement(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify({ prompt: q.prompt, options: q.options, answer: q.answer })
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const all = new Set(answers(q))
      expect(all.size, ctx).toBe(1)
      const ok = OPTION_KEYS.filter((o) => all.has(q.options[o]))
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['ar-order', 'ar-rank', 'ar-seat'])
  })
})
