import { describe, expect, it } from 'vitest'
import { OPTION_KEYS } from '../../types'
import type { Drawing, Question } from '../../types'
import { mulberry32 } from './numberSeries'
import { GROUP_SETS, LAYOUTS, generateVennDiagram } from './vennDiagrams'

// An independent reading (not using the layouts' names): how every pair of circles in a drawing sits
// is worked out from their centres and sizes, the groups named in the question (or an option) are
// looked up in the bank of related groups, and a drawing matches when the groups can be given to its
// circles with every pair agreeing. For the counting questions, each number's part is found from
// the circles its position is inside, and the asked parts are added up.
type Circle = { x: number; y: number; r: number }
const circles = (d: Drawing): Circle[] => d.items.filter((i) => i.shape === 'circle').map((i) => ({ x: i.x, y: i.y, r: i.size / 2 }))

function relation(a: Circle, b: Circle): string {
  const d = Math.hypot(a.x - b.x, a.y - b.y)
  if (d + a.r <= b.r) return '<'
  if (d + b.r <= a.r) return '>'
  return d >= a.r + b.r ? '|' : 'x'
}

const perms = (xs: number[]): number[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])))

/** The drawing shows the group set: some way of giving groups a, b, c to its circles makes every pair agree. */
function shows(d: Drawing, rel: string[]): boolean {
  const cs = circles(d)
  if (cs.length !== 3) return false
  return perms([0, 1, 2]).some((p) =>
    rel.every((r) => {
      const [a, op, b] = [cs[p[r.charCodeAt(0) - 97]], r[1], cs[p[r.charCodeAt(2) - 97]]]
      return relation(a, b) === op
    }),
  )
}

const setNamed = (names: string) => {
  const found = GROUP_SETS.filter((s) => [...s.en].sort().join(', ') === names.split(', ').sort().join(', '))
  expect(found).toHaveLength(1)
  return found[0]
}

function countFits(q: Question, opt: string): boolean {
  const d = q.figures!.terms[0] as Drawing
  const [a, b] = circles(d).sort((p, s) => p.x - s.x)
  const inside = (c: Circle, x: number, y: number) => Math.hypot(x - c.x, y - c.y) < c.r
  const parts = { onlyA: 0, both: 0, onlyB: 0, neither: 0 }
  for (const t of d.items.filter((i) => i.shape === 'text' && /^\d+$/.test(i.label ?? ''))) {
    const n = Number(t.label)
    const [inA, inB] = [inside(a, t.x, t.y), inside(b, t.x, t.y)]
    parts[inA && inB ? 'both' : inA ? 'onlyA' : inB ? 'onlyB' : 'neither'] += n
  }
  const p = q.prompt!
  const want = p.includes('circle A altogether')
    ? parts.onlyA + parts.both
    : p.includes('circle B altogether')
      ? parts.onlyB + parts.both
      : p.includes('only in circle A')
        ? parts.onlyA
        : p.includes('only in circle B')
          ? parts.onlyB
          : p.includes('in both circles')
            ? parts.both
            : p.includes('at least one circle')
              ? parts.onlyA + parts.both + parts.onlyB
              : p.includes('exactly one circle')
                ? parts.onlyA + parts.onlyB
                : p.includes('neither circle')
                  ? parts.neither
                  : NaN
  expect(want, p).not.toBeNaN()
  return Number(opt) === want
}

describe('generateVennDiagram', () => {
  it('no two layouts show the same arrangement', () => {
    const drawings = LAYOUTS.map((l) => ({ items: l.circles.map(([x, y, d]) => ({ shape: 'circle' as const, x, y, size: d })) }))
    const rels = drawings.map((d) => {
      const cs = circles(d)
      const name = 'abc'
      return [0, 1, 2].flatMap((i) => [0, 1, 2].filter((j) => j > i).map((j) => {
        const op = relation(cs[i], cs[j])
        return op === '>' ? `${name[j]}<${name[i]}` : `${name[i]}${op}${name[j]}`
      }))
    })
    drawings.forEach((d, i) => rels.forEach((r, j) => expect(shows(d, r), `${LAYOUTS[i].id} / ${LAYOUTS[j].id}`).toBe(i === j)))
  })

  it('every group set is shown by its own layout', () => {
    for (const set of GROUP_SETS) {
      const l = LAYOUTS.find((x) => x.id === set.layout)!
      const d = { items: l.circles.map(([x, y, size]) => ({ shape: 'circle' as const, x, y, size })) }
      expect(shows(d, set.rel), set.en.join(', ')).toBe(true)
    }
  })

  it('exactly one option fits', () => {
    const rng = mulberry32(33)
    const kinds = new Set<string>()
    for (let n = 0; n < 1500; n++) {
      const q = generateVennDiagram(rng)
      kinds.add(q.pattern)
      const ctx = JSON.stringify({ prompt: q.prompt, options: q.options, answer: q.answer })
      let ok: string[]
      if (q.pattern === 'vd-pick') {
        const names = q.prompt!.match(/between: (.*)\?$/)![1]
        const s = setNamed(names)
        ok = OPTION_KEYS.filter((k) => shows(q.figures!.options![k] as Drawing, s.rel))
      } else if (q.pattern === 'vd-name') {
        ok = OPTION_KEYS.filter((k) => shows(q.figures!.terms[0] as Drawing, setNamed(q.options[k]).rel))
      } else {
        expect(new Set(Object.values(q.options)).size, ctx).toBe(4)
        ok = OPTION_KEYS.filter((k) => countFits(q, q.options[k]))
      }
      expect(ok, ctx).toEqual([q.answer])
    }
    expect([...kinds].sort()).toEqual(['vd-count', 'vd-name', 'vd-pick'])
  })
})
