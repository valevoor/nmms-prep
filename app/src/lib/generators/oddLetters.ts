import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { letter, place } from './letterSeries'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

interface OddDraft {
  family: string
  alike: string[]
  odd: string
  rule: Text
  working: Text
}

const sign = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)
/** A group of letters from a start place and a list of jumps (no wrapping round the alphabet). */
const build = (start: number, jumps: number[]) => {
  const ps = jumps.reduce((s, j) => [...s, s[s.length - 1] + j], [start])
  return ps.every((p) => p >= 1 && p <= 26) ? ps.map(letter).join('') : undefined
}
const jumpsOf = (g: string) => [...g].slice(1).map((c, i) => place(c) - place(g[i]))
/** Makes `n` different groups, or undefined if the builder keeps failing. */
function groups(n: number, make: () => string | undefined): string[] | undefined {
  const out = new Set<string>()
  for (let tries = 0; out.size < n && tries < 50; tries++) {
    const g = make()
    if (g) out.add(g)
  }
  return out.size === n ? [...out] : undefined
}

function step(rng: Rng): OddDraft | undefined {
  const k = int(rng, 1, 4)
  const back = rng() < 0.35
  const d = back ? -k : k
  const alike = groups(3, () => build(int(rng, 1, 26), [d, d, d]))
  const wrong = [d, d, d]
  wrong[int(rng, 0, 2)] += pick(rng, [1, -1]) * (back ? -1 : 1)
  if (wrong.includes(0)) return undefined
  const odd = build(int(rng, 1, 26), wrong)
  if (!alike || !odd) return undefined
  return {
    family: 'step',
    alike,
    odd,
    rule: both((m) => m.olStep(k, back, alike[0])),
    working: both((m) => m.olJumps(odd, jumpsOf(odd).map(sign).join(', '))),
  }
}

function growing(rng: Rng): OddDraft | undefined {
  const alike = groups(3, () => build(int(rng, 1, 20), [1, 2, 3]))
  const odd = build(int(rng, 1, 20), pick(rng, [[1, 2, 2], [2, 2, 3], [1, 3, 3], [1, 1, 3], [2, 3, 4]]))
  if (!alike || !odd) return undefined
  return {
    family: 'growing',
    alike,
    odd,
    rule: both((m) => m.olGrowing(alike[0])),
    working: both((m) => m.olJumps(odd, jumpsOf(odd).map(sign).join(', '))),
  }
}

function opposite(rng: Rng): OddDraft | undefined {
  const pair = () => {
    const a = int(rng, 1, 13)
    return letter(a) + letter(a + 13)
  }
  const alike = groups(3, () => pair() + pair())
  const [a, b] = [int(rng, 1, 13), int(rng, 1, 13)]
  const off = a + 13 + pick(rng, [1, -1, 2])
  const odd = letter(a) + letter(off) + letter(b) + letter(b + 13)
  if (!alike) return undefined
  return {
    family: 'opposite',
    alike,
    odd,
    rule: both((m) => m.olOpposite(alike[0])),
    working: both((m) => m.notThis(`${odd[0]} + 13 = ${letter(a + 13)}`, odd[1])),
  }
}

function sum(rng: Rng): OddDraft | undefined {
  const make = () => {
    const x = int(rng, 1, 12)
    const y = int(rng, 1, 13)
    return letter(x) + letter(y) + letter(x + y)
  }
  const alike = groups(3, make)
  const x = int(rng, 1, 12)
  const y = int(rng, 1, 12)
  const z = x + y + pick(rng, [1, -1, 2])
  const odd = letter(x) + letter(y) + letter(z)
  if (!alike || z < 1 || z > 26) return undefined
  return {
    family: 'sum',
    alike,
    odd,
    rule: both((m) => m.olSum(`${alike[0][0]} + ${alike[0][1]} = ${place(alike[0][0])} + ${place(alike[0][1])} = ${place(alike[0][2])} = ${alike[0][2]}`)),
    working: both((m) => m.notThis(`${x} + ${y} = ${x + y} = ${letter(x + y)}`, odd[2])),
  }
}

function even(rng: Rng): OddDraft | undefined {
  const evenLetter = () => letter(2 * int(rng, 1, 13))
  const alike = groups(3, () => [evenLetter(), evenLetter(), evenLetter(), evenLetter()].join(''))
  const i = int(rng, 0, 3)
  const oddPlace = 2 * int(rng, 1, 13) - 1
  const odd = [0, 1, 2, 3].map((j) => (j === i ? letter(oddPlace) : evenLetter())).join('')
  if (!alike) return undefined
  return {
    family: 'even',
    alike,
    odd,
    rule: both((m) => m.olEven(`${alike[0]} → ${[...alike[0]].map(place).join(', ')}`)),
    working: both((m) => m.olOddPlace(letter(oddPlace), oddPlace)),
  }
}

const BUILDERS = [step, step, growing, opposite, sum, even]

/** Simple things a student might notice first. None may single out an option other than the odd one. */
const PROPERTIES: ((g: string) => boolean | number)[] = [
  (g) => 'AEIOU'.includes(g[0]),
  (g) => [...g].some((c) => 'AEIOU'.includes(c)),
  (g) => new Set(g).size !== g.length,
  (g) => g === [...g].reverse().join(''),
  (g) => jumpsOf(g).every((j) => j > 0),
  (g) => jumpsOf(g).every((j) => j < 0),
  (g) => g.length,
]

function misleading(items: string[], oddIdx: number): boolean {
  for (const p of PROPERTIES) {
    const v = items.map(p)
    const lonely = v.flatMap((x, i) => (v.filter((y) => y === x).length === 1 ? [i] : []))
    if (lonely.length === 1 && lonely[0] !== oddIdx) return true
  }
  return new Set(items).size !== 4
}

let counter = 0

export function generateOddLetters(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    if (!d) continue
    const items = shuffle(rng, [d.odd, ...d.alike])
    const oddIdx = items.indexOf(d.odd)
    if (misleading(items, oddIdx)) continue
    return {
      id: `gen-oddl-${d.family}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'odd',
      terms: items,
      options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, items[j]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[oddIdx],
      rule: d.rule.en,
      working: d.working.en,
      pattern: 'odd-one',
      generated: true,
      kn: { rule: d.rule.kn, working: d.working.kn },
    }
  }
}
