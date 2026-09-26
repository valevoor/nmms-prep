import { OPTION_KEYS } from '../../types'
import type { FamilyTree, OptionKey, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import type { Locale } from '../i18n/locale'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** One step of a chain, read as "person i is the <step> of person i+1". */
export type Step = 'parent' | 'child' | 'sibling' | 'spouse'
type Sex = 'm' | 'f'

/** Chains the generator uses, and what they make person 0 to the last person. */
const CHAINS: { steps: Step[]; term: (x: Sex, parentSex: Sex) => string }[] = [
  { steps: ['sibling', 'parent'], term: (x, p) => `${x === 'm' ? 'uncle' : 'aunt'}-${p}` },
  { steps: ['parent', 'parent'], term: (x) => (x === 'm' ? 'grandfather' : 'grandmother') },
  { steps: ['child', 'child'], term: (x) => (x === 'm' ? 'grandson' : 'granddaughter') },
  { steps: ['parent', 'spouse'], term: (x) => (x === 'm' ? 'father-in-law' : 'mother-in-law') },
  { steps: ['spouse', 'child'], term: (x) => (x === 'm' ? 'son-in-law' : 'daughter-in-law') },
  { steps: ['child', 'sibling', 'parent'], term: () => 'cousin' },
  { steps: ['parent', 'sibling'], term: (x) => (x === 'm' ? 'father' : 'mother') },
  { steps: ['sibling', 'sibling'], term: (x) => (x === 'm' ? 'brother' : 'sister') },
  { steps: ['child', 'spouse'], term: (x) => (x === 'm' ? 'son' : 'daughter') },
  { steps: ['spouse', 'parent'], term: (x) => (x === 'm' ? 'father' : 'mother') },
]

/** The word for "person is the <step> of the next person", by the person's sex. */
const WORD: Record<Step, Record<Sex, string>> = {
  parent: { m: 'father', f: 'mother' },
  child: { m: 'son', f: 'daughter' },
  sibling: { m: 'brother', f: 'sister' },
  spouse: { m: 'husband', f: 'wife' },
}

const MALE_TERMS = ['father', 'son', 'brother', 'husband', 'grandfather', 'grandson', 'uncle-f', 'father-in-law', 'son-in-law', 'cousin']
const FEMALE_TERMS = ['mother', 'daughter', 'sister', 'wife', 'grandmother', 'granddaughter', 'aunt-f', 'mother-in-law', 'daughter-in-law', 'cousin']

let counter = 0

export function generateBloodRelation(rng: Rng = Math.random): Question {
  for (;;) {
    const chain = pick(rng, CHAINS)
    const n = chain.steps.length + 1
    const names = shuffle(rng, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).slice(0, n)
    const sex: Sex[] = names.map(() => pick(rng, ['m', 'f'] as Sex[]))
    // A husband and wife are a man and a woman.
    chain.steps.forEach((s, i) => {
      if (s === 'spouse' && sex[i] === sex[i + 1]) sex[i + 1] = sex[i] === 'm' ? 'f' : 'm'
    })
    const parentSex = sex[chain.steps.lastIndexOf('parent')] ?? 'm'
    const term = chain.term(sex[0], parentSex)
    const [X, Y] = [names[0], names[n - 1]]
    const word = (i: number) => WORD[chain.steps[i]][sex[i]]

    const pool = (sex[0] === 'm' ? MALE_TERMS : FEMALE_TERMS).filter((t) => both((m) => m.rel[t]).en !== both((m) => m.rel[term]).en)
    const wrong: string[] = []
    for (const t of shuffle(rng, pool)) {
      const seen = [term, ...wrong].map((w) => both((m) => m.rel[w]))
      const txt = both((m) => m.rel[t])
      if (seen.some((s) => s.en === txt.en || s.kn === txt.kn)) continue
      wrong.push(t)
      if (wrong.length === 3) break
    }
    if (wrong.length < 3) continue

    const facts = shuffle(rng, chain.steps.map((_, i) => i))
    const prompt: Text = both((m) => facts.map((i) => m.relFact(names[i], m.rel[word(i)], names[i + 1])).join(' ') + ' ' + m.relAsk(X, Y))
    const working: Text = both((m) => m.relSo(chain.steps.map((_, i) => m.relStep(names[i], m.rel[word(i)], names[i + 1])).join(', '), X, Y, m.rel[term]))
    const order = shuffle(rng, [term, ...wrong])
    const opts = (l: Locale) => Object.fromEntries(OPTION_KEYS.map((k, j) => [k, cap(both((m) => m.rel[order[j]])[l])])) as Record<OptionKey, string>

    return {
      id: `gen-rel-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [],
      prompt: prompt.en,
      options: opts('en'),
      answer: OPTION_KEYS[order.indexOf(term)],
      rule: both((m) => m.relRule).en,
      working: working.en,
      pattern: 'rel-chain',
      generated: true,
      tree: treeOf(names, chain.steps),
      link: [X, Y],
      kn: { prompt: prompt.kn, rule: both((m) => m.relRule).kn, working: working.kn, options: opts('kn') },
    }
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Lays the chain out as a family tree: one column per person, one row per generation. */
function treeOf(names: string[], steps: Step[]): FamilyTree {
  const gen = [0]
  steps.forEach((s, i) => gen.push(gen[i] + (s === 'parent' ? 1 : s === 'child' ? -1 : 0)))
  const top = Math.min(...gen)
  return {
    people: names.map((p, i) => [p, i, gen[i] - top]),
    lines: steps.map((s, i): FamilyTree['lines'][number] =>
      s === 'parent' ? [names[i], names[i + 1], 'child'] : s === 'child' ? [names[i + 1], names[i], 'child'] : [names[i], names[i + 1], s === 'spouse' ? 'married' : 'sibling'],
    ),
  }
}
