import { OPTION_KEYS } from '../../types'
import type { OptionKey, Question } from '../../types'
import { both } from '../i18n/gen'
import type { GenText, Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Statements and Decisions (Chapter 38): two or three statements about groups ("All pens are
 * books", "Some books are bags", "No bags are stones", "Some bags are not pens") and two or three
 * decisions. Which decisions follow? A decision follows when it is true in every way the groups can
 * overlap that keeps the statements true, with every group having at least one member (so "All pens
 * are books" gives "Some books are pens", as the book reads it).
 */

type Kind = 'A' | 'S' | 'N' | 'O'
/** A statement: kind, then the two groups by number. */
type Prop = [Kind, number, number]

const WORDS: [string, string][] = [
  ['pens', 'ಪೆನ್ನುಗಳು'], ['books', 'ಪುಸ್ತಕಗಳು'], ['bags', 'ಚೀಲಗಳು'], ['cats', 'ಬೆಕ್ಕುಗಳು'], ['dogs', 'ನಾಯಿಗಳು'], ['birds', 'ಪಕ್ಷಿಗಳು'],
  ['trees', 'ಮರಗಳು'], ['flowers', 'ಹೂವುಗಳು'], ['fruits', 'ಹಣ್ಣುಗಳು'], ['chairs', 'ಕುರ್ಚಿಗಳು'], ['tables', 'ಮೇಜುಗಳು'], ['stars', 'ನಕ್ಷತ್ರಗಳು'],
  ['rivers', 'ನದಿಗಳು'], ['teachers', 'ಶಿಕ್ಷಕರು'], ['singers', 'ಗಾಯಕರು'], ['doctors', 'ವೈದ್ಯರು'], ['players', 'ಆಟಗಾರರು'], ['cars', 'ಕಾರುಗಳು'],
  ['buses', 'ಬಸ್ಸುಗಳು'], ['stones', 'ಕಲ್ಲುಗಳು'], ['boxes', 'ಪೆಟ್ಟಿಗೆಗಳು'], ['leaves', 'ಎಲೆಗಳು'],
]
const ROMAN = ['I', 'II', 'III']

/** Every world for n groups: the non-empty parts of the Venn diagram, each a bitmask of groups. */
function worlds(n: number): number[][] {
  const parts = Array.from({ length: (1 << n) - 1 }, (_, i) => i + 1)
  const out: number[][] = []
  for (let w = 1; w < 2 ** parts.length; w++) {
    const filled = parts.filter((_, i) => Math.floor(w / 2 ** i) % 2)
    if (Array.from({ length: n }, (_, g) => filled.some((p) => p & (1 << g))).every(Boolean)) out.push(filled)
  }
  return out
}
const WORLDS = [3, 4].map(worlds)

function holds(w: number[], [k, x, y]: Prop): boolean {
  const xs = w.filter((p) => p & (1 << x))
  if (k === 'A') return xs.every((p) => p & (1 << y))
  if (k === 'S') return xs.some((p) => p & (1 << y))
  if (k === 'N') return !xs.some((p) => p & (1 << y))
  return xs.some((p) => !(p & (1 << y)))
}

const sentence = (g: GenText, [k, x, y]: Prop, names: string[]) =>
  (k === 'A' ? g.sdAll : k === 'S' ? g.sdSome : k === 'N' ? g.sdNo : g.sdSomeNot)(names[x], names[y])
const capital = (s: string) => s[0].toUpperCase() + s.slice(1)
const same = (a: Prop, b: Prop) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

let counter = 0

/** A generated question. */
export function generateStatements(rng: Rng = Math.random): Question {
  for (;;) {
    const n = rng() < 0.8 ? 3 : 4
    const words = shuffle(rng, WORDS).slice(0, n)
    // A chain of statements: group 0 with 1, 1 with 2 (and 2 with 3).
    const st: Prop[] = []
    for (let i = 0; i + 1 < n; i++) {
      const k = pick(rng, ['A', 'A', 'S', 'S', 'N', 'O'] as Kind[])
      st.push(rng() < 0.7 ? [k, i, i + 1] : [k, i + 1, i])
    }
    const ok = WORLDS[n - 3].filter((w) => st.every((s) => holds(w, s)))
    if (!ok.length) continue
    const candidates: Prop[] = []
    for (const k of ['A', 'S', 'N', 'O'] as Kind[]) for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) if (x !== y) candidates.push([k, x, y])
    const fresh = candidates.filter((c) => !st.some((s) => same(s, c)))
    const yes = shuffle(rng, fresh.filter((c) => ok.every((w) => holds(w, c))))
    const no = shuffle(rng, fresh.filter((c) => !ok.every((w) => holds(w, c))))
    const m = rng() < 0.7 ? 2 : 3
    const dec: Prop[] = []
    for (let i = 0; i < m; i++) {
      const from = rng() < 0.5 ? yes : no
      const c = from.pop() ?? (from === yes ? no : yes).pop()
      if (c) dec.push(c)
    }
    if (dec.length < m) continue
    const follows = dec.map((d, i) => (ok.every((w) => holds(w, d)) ? ROMAN[i] : '')).filter(Boolean)

    const subsets = Array.from({ length: 1 << m }, (_, s) => ROMAN.slice(0, m).filter((_, i) => s & (1 << i)))
    const others = shuffle(rng, subsets.filter((s) => s.join() !== follows.join())).slice(0, 3)
    const sets = shuffle(rng, [follows, ...others])
    const names = (l: 'en' | 'kn') => words.map((w) => (l === 'en' ? w[0] : w[1]))
    const lines = (l: 'en' | 'kn', g: GenText, ps: Prop[]) => ps.map((p) => (l === 'en' ? capital(sentence(g, p, names(l))) : sentence(g, p, names(l))))
    const prompt = both((g, l) => g.sdPrompt(lines(l, g, st), lines(l, g, dec)))
    const options = both((g) => JSON.stringify(sets.map((s) => g.sdOption(s, m))))
    const working: Text = both((g) => dec.map((_, i) => (follows.includes(ROMAN[i]) ? g.sdFollows(ROMAN[i]) : g.sdNot(ROMAN[i]))).join(' '))
    const rule = both((g) => g.sdRule)
    const en = JSON.parse(options.en) as string[]
    const kn = JSON.parse(options.kn) as string[]
    return {
      id: `gen-sd-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      terms: [],
      layout: 'text',
      prompt: prompt.en,
      options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, en[i]])) as Record<OptionKey, string>,
      answer: OPTION_KEYS[sets.indexOf(follows)],
      rule: rule.en,
      working: working.en,
      pattern: m === 2 ? 'sd-two' : 'sd-three',
      generated: true,
      kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn, options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, kn[i]])) as Record<OptionKey, string> },
    }
  }
}
