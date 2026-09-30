import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import { both, same } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Venn Diagrams (Chapter 33). Three kinds, as in the book:
 * - three groups in words: which diagram of circles shows how they are related?
 * - a diagram: which three groups does it show?
 * - two overlapping circles with a number in each part: how many are in some of the parts?
 * The groups come from a bank whose relations are typed in (`GROUP_SETS`); the diagrams are fixed
 * arrangements of circles, each showing a different way three groups can sit (`LAYOUTS`).
 */

/** Circles as [x, y, diameter] in a box `w` wide and 100 high; the order is the groups' order. */
type Layout = { id: string; w: number; circles: [number, number, number][] }

/** No two layouts may show the same arrangement with the circles renamed (the tests check this). */
export const LAYOUTS: Layout[] = [
  { id: 'nest', w: 100, circles: [[50, 50, 84], [50, 50, 56], [50, 50, 28]] },
  { id: 'two-in-apart', w: 100, circles: [[50, 50, 86], [32, 50, 30], [68, 50, 30]] },
  { id: 'two-in-overlap', w: 100, circles: [[50, 50, 88], [38, 50, 44], [62, 50, 44]] },
  { id: 'apart', w: 140, circles: [[25, 50, 40], [70, 50, 40], [115, 50, 40]] },
  { id: 'chain', w: 150, circles: [[35, 50, 50], [75, 50, 50], [115, 50, 50]] },
  { id: 'three', w: 100, circles: [[38, 38, 48], [62, 38, 48], [50, 60, 48]] },
  { id: 'in-apart', w: 140, circles: [[45, 50, 70], [45, 50, 36], [112, 50, 30]] },
  { id: 'overlap-both', w: 130, circles: [[45, 50, 60], [85, 50, 60], [65, 50, 14]] },
  { id: 'overlap-one', w: 130, circles: [[45, 50, 60], [85, 50, 60], [33, 50, 16]] },
  { id: 'in-overlap', w: 130, circles: [[50, 50, 70], [50, 50, 34], [88, 50, 50]] },
  { id: 'overlap-apart', w: 150, circles: [[35, 50, 50], [70, 50, 50], [125, 50, 30]] },
]

/**
 * Three groups and how they are related, every pair as "a<b" (a inside b), "axb" (overlap) or
 * "a|b" (apart), with a, b, c the groups in order; `layout` is the diagram that shows it.
 */
export type GroupSet = { en: [string, string, string]; kn: [string, string, string]; rel: string[]; layout: string }

export const GROUP_SETS: GroupSet[] = [
  { en: ['India', 'Karnataka', 'Bengaluru'], kn: ['ಭಾರತ', 'ಕರ್ನಾಟಕ', 'ಬೆಂಗಳೂರು'], rel: ['b<a', 'c<b', 'c<a'], layout: 'nest' },
  { en: ['Animals', 'Mammals', 'Dogs'], kn: ['ಪ್ರಾಣಿಗಳು', 'ಸಸ್ತನಿಗಳು', 'ನಾಯಿಗಳು'], rel: ['b<a', 'c<b', 'c<a'], layout: 'nest' },
  { en: ['Numbers', 'Integers', 'Natural numbers'], kn: ['ಸಂಖ್ಯೆಗಳು', 'ಪೂರ್ಣಾಂಕಗಳು', 'ಸ್ವಾಭಾವಿಕ ಸಂಖ್ಯೆಗಳು'], rel: ['b<a', 'c<b', 'c<a'], layout: 'nest' },
  { en: ['Birds', 'Crows', 'Parrots'], kn: ['ಪಕ್ಷಿಗಳು', 'ಕಾಗೆಗಳು', 'ಗಿಳಿಗಳು'], rel: ['b<a', 'c<a', 'b|c'], layout: 'two-in-apart' },
  { en: ['Fruits', 'Mangoes', 'Bananas'], kn: ['ಹಣ್ಣುಗಳು', 'ಮಾವಿನಹಣ್ಣುಗಳು', 'ಬಾಳೆಹಣ್ಣುಗಳು'], rel: ['b<a', 'c<a', 'b|c'], layout: 'two-in-apart' },
  { en: ['Planets', 'Earth', 'Mars'], kn: ['ಗ್ರಹಗಳು', 'ಭೂಮಿ', 'ಮಂಗಳ'], rel: ['b<a', 'c<a', 'b|c'], layout: 'two-in-apart' },
  { en: ['Natural numbers', 'Even numbers', 'Multiples of 3'], kn: ['ಸ್ವಾಭಾವಿಕ ಸಂಖ್ಯೆಗಳು', 'ಸಮಸಂಖ್ಯೆಗಳು', '3 ರ ಅಪವರ್ತ್ಯಗಳು'], rel: ['b<a', 'c<a', 'bxc'], layout: 'two-in-overlap' },
  { en: ['Quadrilaterals', 'Rectangles', 'Rhombuses'], kn: ['ಚತುರ್ಭುಜಗಳು', 'ಆಯತಗಳು', 'ವಜ್ರಾಕೃತಿಗಳು'], rel: ['b<a', 'c<a', 'bxc'], layout: 'two-in-overlap' },
  { en: ['Pens', 'Chairs', 'Trees'], kn: ['ಪೆನ್ನುಗಳು', 'ಕುರ್ಚಿಗಳು', 'ಮರಗಳು'], rel: ['a|b', 'b|c', 'a|c'], layout: 'apart' },
  { en: ['Cows', 'Fish', 'Cars'], kn: ['ಹಸುಗಳು', 'ಮೀನುಗಳು', 'ಕಾರುಗಳು'], rel: ['a|b', 'b|c', 'a|c'], layout: 'apart' },
  { en: ['Boys', 'Students', 'Girls'], kn: ['ಹುಡುಗರು', 'ವಿದ್ಯಾರ್ಥಿಗಳು', 'ಹುಡುಗಿಯರು'], rel: ['axb', 'bxc', 'a|c'], layout: 'chain' },
  { en: ['Men', 'Doctors', 'Women'], kn: ['ಪುರುಷರು', 'ವೈದ್ಯರು', 'ಮಹಿಳೆಯರು'], rel: ['axb', 'bxc', 'a|c'], layout: 'chain' },
  { en: ['Teachers', 'Singers', 'Mothers'], kn: ['ಶಿಕ್ಷಕರು', 'ಗಾಯಕರು', 'ತಾಯಂದಿರು'], rel: ['axb', 'bxc', 'axc'], layout: 'three' },
  { en: ['Doctors', 'Players', 'Parents'], kn: ['ವೈದ್ಯರು', 'ಆಟಗಾರರು', 'ಪೋಷಕರು'], rel: ['axb', 'bxc', 'axc'], layout: 'three' },
  { en: ['Metals', 'Iron', 'Wood'], kn: ['ಲೋಹಗಳು', 'ಕಬ್ಬಿಣ', 'ಮರದ ದಿಮ್ಮಿ'], rel: ['b<a', 'a|c', 'b|c'], layout: 'in-apart' },
  { en: ['Birds', 'Parrots', 'Fish'], kn: ['ಪಕ್ಷಿಗಳು', 'ಗಿಳಿಗಳು', 'ಮೀನುಗಳು'], rel: ['b<a', 'a|c', 'b|c'], layout: 'in-apart' },
  { en: ['Wild animals', 'Herbivores', 'Deer'], kn: ['ಕಾಡು ಪ್ರಾಣಿಗಳು', 'ಸಸ್ಯಾಹಾರಿಗಳು', 'ಜಿಂಕೆ'], rel: ['axb', 'c<a', 'c<b'], layout: 'overlap-both' },
  { en: ['Indians', 'Cricket players', 'Sachin Tendulkar'], kn: ['ಭಾರತೀಯರು', 'ಕ್ರಿಕೆಟ್ ಆಟಗಾರರು', 'ಸಚಿನ್ ತೆಂಡೂಲ್ಕರ್'], rel: ['axb', 'c<a', 'c<b'], layout: 'overlap-both' },
  { en: ['Wild animals', 'Herbivores', 'Tiger'], kn: ['ಕಾಡು ಪ್ರಾಣಿಗಳು', 'ಸಸ್ಯಾಹಾರಿಗಳು', 'ಹುಲಿ'], rel: ['axb', 'c<a', 'c|b'], layout: 'overlap-one' },
  { en: ['Even numbers', 'Prime numbers', 'Multiples of 4'], kn: ['ಸಮಸಂಖ್ಯೆಗಳು', 'ಅವಿಭಾಜ್ಯ ಸಂಖ್ಯೆಗಳು', '4 ರ ಅಪವರ್ತ್ಯಗಳು'], rel: ['axb', 'c<a', 'c|b'], layout: 'overlap-one' },
  { en: ['Players', 'Cricketers', 'Doctors'], kn: ['ಆಟಗಾರರು', 'ಕ್ರಿಕೆಟಿಗರು', 'ವೈದ್ಯರು'], rel: ['b<a', 'axc', 'bxc'], layout: 'in-overlap' },
  { en: ['Graduates', 'Engineers', 'Singers'], kn: ['ಪದವೀಧರರು', 'ಎಂಜಿನಿಯರ್‌ಗಳು', 'ಗಾಯಕರು'], rel: ['b<a', 'axc', 'bxc'], layout: 'in-overlap' },
  { en: ['Mammals', 'Dogs', 'Animals that live in water'], kn: ['ಸಸ್ತನಿಗಳು', 'ನಾಯಿಗಳು', 'ನೀರಿನಲ್ಲಿ ವಾಸಿಸುವ ಪ್ರಾಣಿಗಳು'], rel: ['b<a', 'axc', 'b|c'], layout: 'overlap-one' },
  { en: ['Doctors', 'Women', 'Tables'], kn: ['ವೈದ್ಯರು', 'ಮಹಿಳೆಯರು', 'ಮೇಜುಗಳು'], rel: ['axb', 'a|c', 'b|c'], layout: 'overlap-apart' },
  { en: ['Singers', 'Dancers', 'Rivers'], kn: ['ಗಾಯಕರು', 'ನೃತ್ಯಗಾರರು', 'ನದಿಗಳು'], rel: ['axb', 'a|c', 'b|c'], layout: 'overlap-apart' },
]

const layout = (id: string) => LAYOUTS.find((l) => l.id === id)!

/** The layout's circles, mirrored left to right when asked, as a drawing. */
function draw(l: Layout, mirror: boolean, extra: FigItem[] = []): Drawing {
  const items: FigItem[] = l.circles.map(([x, y, d]) => ({ shape: 'circle', x: mirror ? l.w - x : x, y, size: d }))
  return { w: l.w, items: [...items, ...extra] }
}

const list = (xs: string[]) => xs.join(', ')
let counter = 0
const nextId = (rng: Rng) => `gen-vd-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`

/** How the three groups are related, in words, for the explanation. */
function describe(s: GroupSet): Text {
  const name = (r: string, k: number, l: string) => (l === 'en' ? s.en : s.kn)[r.charCodeAt(k) - 97]
  const parts = s.rel.map((r) =>
    both((g, l) => (r[1] === '<' ? g.vdInside : r[1] === 'x' ? g.vdOverlap : g.vdApart)(name(r, 0, l), name(r, 2, l))),
  )
  return { en: parts.map((p) => p.en).join(' '), kn: parts.map((p) => p.kn).join(' ') }
}

function pickQuestion(rng: Rng): Question {
  const s = pick(rng, GROUP_SETS)
  const order = shuffle(rng, [0, 1, 2])
  const others = shuffle(rng, LAYOUTS.filter((l) => l.id !== s.layout)).slice(0, 3)
  const opts = shuffle(rng, [layout(s.layout), ...others])
  const figs = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, draw(opts[i], rng() < 0.5)])) as Record<OptionKey, Drawing>
  const answer = OPTION_KEYS[opts.findIndex((l) => l.id === s.layout)]
  const prompt = both((g, l) => g.vdPick(list(order.map((i) => (l === 'en' ? s.en[i] : s.kn[i])))))
  const rule = describe(s)
  return {
    id: nextId(rng),
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    figures: { terms: [], options: figs },
    options: { A: 'A', B: 'B', C: 'C', D: 'D' },
    answer,
    rule: rule.en,
    working: both((g) => g.vdPickWork(answer)).en,
    pattern: 'vd-pick',
    generated: true,
    kn: { prompt: prompt.kn, rule: rule.kn, working: both((g) => g.vdPickWork(answer)).kn },
  }
}

function nameQuestion(rng: Rng): Question {
  const s = pick(rng, GROUP_SETS)
  const byLayout = new Map<string, GroupSet[]>()
  for (const g of GROUP_SETS) if (g.layout !== s.layout) byLayout.set(g.layout, [...(byLayout.get(g.layout) ?? []), g])
  const others = shuffle(rng, [...byLayout.values()]).slice(0, 3).map((gs) => pick(rng, gs))
  const sets = shuffle(rng, [s, ...others])
  const orders = sets.map(() => shuffle(rng, [0, 1, 2]))
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, list(orders[i].map((j) => sets[i].en[j]))])) as Record<OptionKey, string>
  const optionsKn = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, list(orders[i].map((j) => sets[i].kn[j]))])) as Record<OptionKey, string>
  const prompt = both((g) => g.vdName)
  const rule = describe(s)
  const working = both((g) => g.vdNameWork)
  return {
    id: nextId(rng),
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    figures: { terms: [draw(layout(s.layout), rng() < 0.5)] },
    options,
    answer: OPTION_KEYS[sets.indexOf(s)],
    rule: rule.en,
    working: working.en,
    pattern: 'vd-name',
    generated: true,
    kn: { prompt: prompt.kn, rule: rule.kn, working: working.kn, options: optionsKn },
  }
}

/** Pairs of activities for the counting questions (circle A, circle B). */
const ACTIVITIES: [Text, Text][] = [
  [{ en: 'play cricket', kn: 'ಕ್ರಿಕೆಟ್ ಆಡುವ' }, { en: 'play football', kn: 'ಫುಟ್‌ಬಾಲ್ ಆಡುವ' }],
  [{ en: 'drink coffee', kn: 'ಕಾಫಿ ಕುಡಿಯುವ' }, { en: 'drink tea', kn: 'ಟೀ ಕುಡಿಯುವ' }],
  [{ en: 'speak Kannada', kn: 'ಕನ್ನಡ ಮಾತನಾಡುವ' }, { en: 'speak Hindi', kn: 'ಹಿಂದಿ ಮಾತನಾಡುವ' }],
  [{ en: 'like drawing', kn: 'ಚಿತ್ರಕಲೆ ಇಷ್ಟಪಡುವ' }, { en: 'like music', kn: 'ಸಂಗೀತ ಇಷ್ಟಪಡುವ' }],
]

/** Parts of two circles and a box: only A, both, only B, neither. */
type Ask = 'a' | 'b' | 'onlyA' | 'onlyB' | 'both' | 'either' | 'one' | 'neither'
const PARTS: Record<Ask, (0 | 1 | 2 | 3)[]> = {
  a: [0, 1], b: [1, 2], onlyA: [0], onlyB: [2], both: [1], either: [0, 1, 2], one: [0, 2], neither: [3],
}

function countQuestion(rng: Rng): Question {
  const [actA, actB] = pick(rng, ACTIVITIES)
  const withBox = rng() < 0.4
  const ask = pick(rng, (withBox ? ['neither', 'either', 'a', 'onlyB', 'one'] : ['a', 'b', 'onlyA', 'onlyB', 'both', 'either', 'one']) as Ask[])
  const v = [int(rng, 4, 40), int(rng, 2, 25), int(rng, 4, 40), withBox ? int(rng, 3, 30) : 0]
  if (new Set(v.slice(0, withBox ? 4 : 3)).size < (withBox ? 4 : 3)) return countQuestion(rng)
  const total = v[0] + v[1] + v[2] + v[3]
  const count = (a: Ask) => PARTS[a].reduce((t: number, i) => t + v[i], 0)
  const answer = count(ask)
  const wrong = new Set<number>()
  for (const a of shuffle(rng, Object.keys(PARTS) as Ask[])) if ((withBox || a !== 'neither') && count(a) !== answer) wrong.add(count(a))
  for (const x of [answer + 10, answer - 5, total]) if (x > 0 && x !== answer) wrong.add(x)
  const opts = shuffle(rng, [answer, ...[...wrong].slice(0, 3)])
  // Two circles (A left, B right) in a box when the students in neither are counted.
  const l: Layout = { id: 'two', w: 140, circles: [[52, 54, 64], [88, 54, 64]] }
  const nums: FigItem[] = [
    { shape: 'text', x: 36, y: 55, size: 13, label: String(v[0]) },
    { shape: 'text', x: 70, y: 55, size: 13, label: String(v[1]) },
    { shape: 'text', x: 104, y: 55, size: 13, label: String(v[2]) },
    { shape: 'text', x: 44, y: 14, size: 12, label: 'A' },
    { shape: 'text', x: 96, y: 14, size: 12, label: 'B' },
  ]
  if (withBox) nums.push({ shape: 'text', x: 128, y: 92, size: 11, label: String(v[3]) })
  const d = draw(l, false, nums)
  if (withBox) d.items.push({ shape: 'rect', x: 70, y: 52, size: 136, h: 92 })
  const intro = both((g, lc) => g.vdSurvey(withBox ? total : 0, lc === 'en' ? actA.en : actA.kn, lc === 'en' ? actB.en : actB.kn))
  const q = both((g) => g.vdAsk(ask))
  const sumText = PARTS[ask].map((i) => v[i]).join(' + ')
  const working = same(PARTS[ask].length > 1 ? `${sumText} = ${answer}` : String(answer))
  const rule = both((g) => g.vdCountRule(ask))
  return {
    id: nextId(rng),
    terms: [],
    layout: 'text',
    prompt: `${intro.en} ${q.en}`,
    figures: { terms: [d] },
    options: Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>,
    answer: OPTION_KEYS[opts.indexOf(answer)],
    rule: rule.en,
    working: working.en,
    pattern: 'vd-count',
    generated: true,
    kn: { prompt: `${intro.kn} ${q.kn}`, rule: rule.kn, working: working.kn },
  }
}

/** A generated question. */
export function generateVennDiagram(rng: Rng = Math.random): Question {
  const r = rng()
  return r < 0.45 ? pickQuestion(rng) : r < 0.75 ? nameQuestion(rng) : countQuestion(rng)
}
