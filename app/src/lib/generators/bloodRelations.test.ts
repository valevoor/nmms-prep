import { describe, expect, it } from 'vitest'
import { generateBloodRelation } from './bloodRelations'
import { mulberry32 } from './numberSeries'

// Independent solver: builds the family from the English facts and names X's relation to Y.
type Person = { sex?: 'm' | 'f'; parents: Set<string>; children: Set<string>; siblings: Set<string>; spouse?: string }

function solve(prompt: string): string {
  const people = new Map<string, Person>()
  const get = (n: string) => people.get(n) ?? (people.set(n, { parents: new Set(), children: new Set(), siblings: new Set() }), people.get(n)!)
  const facts = [...prompt.matchAll(/(\w) is the (\w+) of (\w)\./g)]
  for (const [, a, w, b] of facts) {
    const [pa, pb] = [get(a), get(b)]
    pa.sex = ['father', 'son', 'brother', 'husband'].includes(w) ? 'm' : 'f'
    if (w === 'father' || w === 'mother') {
      pa.children.add(b)
      pb.parents.add(a)
    } else if (w === 'son' || w === 'daughter') {
      pa.parents.add(b)
      pb.children.add(a)
    } else if (w === 'brother' || w === 'sister') {
      pa.siblings.add(b)
      pb.siblings.add(a)
    } else {
      pa.spouse = b
      pb.spouse = a
    }
  }
  const [, x, y] = prompt.match(/How is (\w) related to (\w)\?/)!
  const X = get(x)
  const m = X.sex === 'm'
  // Siblings share parents; a parent's spouse is also a parent.
  const parentsOf = (n: string) => {
    const p = get(n)
    const out = new Set(p.parents)
    for (const s of p.siblings) get(s).parents.forEach((q) => out.add(q))
    for (const q of [...out]) if (get(q).spouse) out.add(get(q).spouse!)
    return out
  }
  // Brothers and sisters of brothers and sisters are siblings too; so are children of the same parents.
  const siblingsOf = (n: string) => {
    const out = new Set<string>([...[...parentsOf(n)].flatMap((p) => [...get(p).children])])
    const todo = [n]
    while (todo.length) {
      for (const s of get(todo.pop()!).siblings) {
        if (out.has(s)) continue
        out.add(s)
        todo.push(s)
      }
    }
    out.delete(n)
    return out
  }
  if (parentsOf(y).has(x)) return m ? 'father' : 'mother'
  if (parentsOf(x).has(y) || [...parentsOf(x)].some((p) => get(y).spouse === p)) return m ? 'son' : 'daughter'
  if (siblingsOf(y).has(x)) return m ? 'brother' : 'sister'
  if ([...parentsOf(y)].some((p) => parentsOf(p).has(x))) return m ? 'grandfather' : 'grandmother'
  if ([...parentsOf(x)].some((p) => parentsOf(p).has(y))) return m ? 'grandson' : 'granddaughter'
  if ([...parentsOf(y)].some((p) => siblingsOf(p).has(x))) return m ? 'uncle' : 'aunt'
  if (get(y).spouse && parentsOf(get(y).spouse!).has(x)) return m ? 'father-in-law' : 'mother-in-law'
  if (X.spouse && parentsOf(X.spouse).has(y)) return m ? 'son-in-law' : 'daughter-in-law'
  if ([...parentsOf(x)].some((p) => [...parentsOf(y)].some((q) => siblingsOf(p).has(q)))) return 'cousin'
  throw new Error(`No relation found: ${prompt}`)
}

describe('generateBloodRelation', () => {
  it('exactly one option names the relation', () => {
    const rng = mulberry32(32)
    for (let n = 0; n < 3000; n++) {
      const q = generateBloodRelation(rng)
      const ctx = JSON.stringify(q)
      const want = solve(q.prompt!)
      const fits = Object.entries(q.options).filter(([, v]) => v.toLowerCase() === want)
      expect(fits.map(([k]) => k), ctx).toEqual([q.answer])
      expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
      expect(new Set(Object.values(q.kn!.options!)).size, ctx).toBe(4)
    }
  })
})
