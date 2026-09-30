import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import { mulberry32 } from './numberSeries'
import { generateStatements } from './statements'

// An independent reading (not using statements.ts): the English statements and decisions are
// parsed, and every "world" is tried: each kind of member (a set of the groups it belongs to) is
// either present or not, and every group has a member. A decision follows when it is true in every
// world where all the statements are true. The decisions each option says follow are read from its
// words; exactly one option may name exactly the decisions that follow.
type Prop = { kind: 'all' | 'some' | 'no' | 'someNot'; x: string; y: string }

function parse(line: string): Prop {
  let m
  if ((m = line.match(/^All (.+) are (.+)\.$/))) return { kind: 'all', x: m[1].toLowerCase(), y: m[2] }
  if ((m = line.match(/^No (.+) are (.+)\.$/))) return { kind: 'no', x: m[1].toLowerCase(), y: m[2] }
  if ((m = line.match(/^Some (.+) are not (.+)\.$/))) return { kind: 'someNot', x: m[1].toLowerCase(), y: m[2] }
  if ((m = line.match(/^Some (.+) are (.+)\.$/))) return { kind: 'some', x: m[1].toLowerCase(), y: m[2] }
  throw new Error(`not understood: ${line}`)
}

function follow(statements: Prop[], decisions: Prop[]): boolean[] {
  const groups = [...new Set([...statements, ...decisions].flatMap((p) => [p.x, p.y]))]
  // A kind of member: the groups it is in (a non-empty subset).
  const kinds: Set<string>[] = []
  for (let m = 1; m < 1 << groups.length; m++) kinds.push(new Set(groups.filter((_, i) => m & (1 << i))))
  const truth = (world: Set<string>[], p: Prop) => {
    const inX = world.filter((k) => k.has(p.x))
    if (p.kind === 'all') return inX.every((k) => k.has(p.y))
    if (p.kind === 'no') return inX.every((k) => !k.has(p.y))
    if (p.kind === 'some') return inX.some((k) => k.has(p.y))
    return inX.some((k) => !k.has(p.y))
  }
  const good: Set<string>[][] = []
  for (let w = 1; w < 2 ** kinds.length; w++) {
    const world = kinds.filter((_, i) => Math.floor(w / 2 ** i) % 2)
    if (groups.every((g) => world.some((k) => k.has(g))) && statements.every((s) => truth(world, s))) good.push(world)
  }
  expect(good.length).toBeGreaterThan(0)
  return decisions.map((d) => good.every((w) => truth(w, d)))
}

/** Which decisions an option says follow. */
function named(option: string): string {
  if (/^(Neither|None)/.test(option)) return ''
  return (option.split('(')[0].match(/\b(III|II|I)\b/g) ?? []).join()
}

describe('generateStatements', () => {
  it('exactly one option names the decisions that follow', () => {
    const rng = mulberry32(38)
    const kinds = new Set<string>()
    for (let n = 0; n < 1000; n++) {
      const q = generateStatements(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify({ prompt: q.prompt, options: q.options, answer: q.answer })
      const lines = q.prompt!.split('\n')
      const st = lines.slice(1, lines.indexOf('Decisions:')).map((l) => parse(l.replace(/^\(\d\) /, '')))
      const dec = lines.slice(lines.indexOf('Decisions:') + 1, -1).map((l) => parse(l.replace(/^\([IV]+\) /, '')))
      const f = follow(st, dec)
      const want = ['I', 'II', 'III'].filter((_, i) => f[i]).join()
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      const ok = OPTION_KEYS.filter((k) => named(q.options[k]) === want)
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['sd-three', 'sd-two'])
  }, 60000)
})
