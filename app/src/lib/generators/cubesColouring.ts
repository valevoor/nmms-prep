import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, PaintedFace, PatternId, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'
import type { Face } from './cubesCutting'

/**
 * Cubes colouring (Chapter 13): a cube with a different colour on each face is cut into n × n × n
 * small cubes. Questions ask how many small cubes have 3, 2, 1 or no painted faces, only one colour,
 * only two colours, both of two colours (next to each other or opposite), all three of three colours,
 * any of one colour, or how many small cubes there are.
 */

export type ColourAsk =
  | { kind: 'faces'; k: 0 | 1 | 2 | 3 }
  | { kind: 'only'; faces: Face[] }
  | { kind: 'all'; faces: Face[] }
  | { kind: 'total' }

/** What a question is about: the cube's size, the colour (English name) on each face, and the ask. */
export interface ColourSpec {
  n: number
  colours: Record<Face, string>
  ask: ColourAsk
}

const COLOURS: Text[] = [
  { en: 'red', kn: 'ಕೆಂಪು' },
  { en: 'blue', kn: 'ನೀಲಿ' },
  { en: 'green', kn: 'ಹಸಿರು' },
  { en: 'yellow', kn: 'ಹಳದಿ' },
  { en: 'black', kn: 'ಕಪ್ಪು' },
  { en: 'white', kn: 'ಬಿಳಿ' },
  { en: 'pink', kn: 'ಗುಲಾಬಿ' },
  { en: 'orange', kn: 'ಕಿತ್ತಳೆ' },
  { en: 'brown', kn: 'ಕಂದು' },
  { en: 'purple', kn: 'ನೇರಳೆ' },
]
/** The paint for each colour in the picture, and grid lines that show up on it. */
export const PAINT: Record<string, { fill: string; ink?: string }> = {
  red: { fill: '#e8524a' },
  blue: { fill: '#4a8fe0' },
  green: { fill: '#4fb860' },
  yellow: { fill: '#f6d743' },
  black: { fill: '#2b2b2b', ink: '#d0d0d0' },
  white: { fill: '#ffffff' },
  pink: { fill: '#f5a7c9' },
  orange: { fill: '#f59a3c' },
  brown: { fill: '#9a6236', ink: '#f0e0d0' },
  purple: { fill: '#9d63c4' },
}

/** Faces in the order the question lists them, with how each is named. */
const ORDER: Face[] = ['top', 'bottom', 'front', 'back', 'left', 'right']
const ON_FACE: Record<Face, Text> = {
  top: { en: 'on the top', kn: 'ಮೇಲಿನ ಮುಖಕ್ಕೆ' },
  bottom: { en: 'on the bottom', kn: 'ಕೆಳಗಿನ ಮುಖಕ್ಕೆ' },
  front: { en: 'in front', kn: 'ಮುಂದಿನ ಮುಖಕ್ಕೆ' },
  back: { en: 'at the back', kn: 'ಹಿಂದಿನ ಮುಖಕ್ಕೆ' },
  left: { en: 'on the left', kn: 'ಎಡ ಮುಖಕ್ಕೆ' },
  right: { en: 'on the right', kn: 'ಬಲ ಮುಖಕ್ಕೆ' },
}
const OPPOSITE: Record<Face, Face> = { top: 'bottom', bottom: 'top', front: 'back', back: 'front', left: 'right', right: 'left' }

const ASK_FACES: Record<0 | 1 | 2 | 3, Text> = {
  3: { en: 'How many small cubes have exactly three faces painted?', kn: 'ನಿಖರವಾಗಿ ಮೂರು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  2: { en: 'How many small cubes have exactly two faces painted?', kn: 'ನಿಖರವಾಗಿ ಎರಡು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  1: { en: 'How many small cubes have only one face painted?', kn: 'ಒಂದೇ ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  0: { en: 'How many small cubes have no face painted?', kn: 'ಯಾವ ಮುಖಕ್ಕೂ ಬಣ್ಣವಿಲ್ಲದ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
}

interface Made {
  ask: ColourAsk
  answer: number
  question: Text
  rule: Text
  working: Text
  pattern: PatternId
}

function make(rng: Rng, n: number, col: Record<Face, Text>): Made {
  const m = n - 2
  const r = rng()
  const c = (f: Face) => col[f]
  if (r < 0.2) {
    const k = pick(rng, [0, 1, 2, 3] as const)
    const answer = [m ** 3, 6 * m * m, 12 * m, 8][k]
    const rule: Text = [
      { en: `No painted face: the cubes hidden inside, which make a cube of edge ${n} − 2 = ${m}.`, kn: `ಯಾವ ಮುಖಕ್ಕೂ ಬಣ್ಣವಿಲ್ಲ: ಒಳಗೆ ಅಡಗಿರುವ ಘನಗಳು; ಅವು ${n} − 2 = ${m} ಅಂಚಿನ ಘನವಾಗುತ್ತವೆ.` },
      { en: `One painted face: the middle cubes of each of the 6 faces, leaving out the edges ((${n} − 2)² = ${m * m} on each face).`, kn: `ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣ: 6 ಮುಖಗಳ ಮಧ್ಯದ ಘನಗಳು, ಅಂಚುಗಳನ್ನು ಬಿಟ್ಟು (ಪ್ರತಿ ಮುಖದಲ್ಲಿ (${n} − 2)² = ${m * m}).` },
      { en: `Two painted faces: the cubes along the 12 edges, leaving out the corners (${n} − 2 = ${m} on each edge).`, kn: `ಎರಡು ಮುಖಗಳಿಗೆ ಬಣ್ಣ: 12 ಅಂಚುಗಳ ಮೇಲಿನ ಘನಗಳು, ಮೂಲೆಗಳನ್ನು ಬಿಟ್ಟು (ಪ್ರತಿ ಅಂಚಿನಲ್ಲಿ ${n} − 2 = ${m}).` },
      { en: 'Only the 8 corner cubes have three painted faces.', kn: 'ಮೂಲೆಯ 8 ಘನಗಳಿಗೆ ಮಾತ್ರ ಮೂರು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುತ್ತದೆ.' },
    ][k]
    const w = [`(${n} − 2)³ = ${m}³ = ${answer}`, `6 × (${n} − 2)² = 6 × ${m * m} = ${answer}`, `12 × (${n} − 2) = 12 × ${m} = ${answer}`]
    const working: Text = k === 3 ? { en: '8 corners = 8', kn: '8 ಮೂಲೆಗಳು = 8' } : { en: w[k], kn: w[k] }
    return { ask: { kind: 'faces', k }, answer, question: ASK_FACES[k], rule, working, pattern: 'colour-faces' }
  }
  if (r < 0.4) {
    const f = pick(rng, ORDER)
    const x = c(f)
    const answer = m * m
    const w = `(${n} − 2)² = ${m}² = ${answer}`
    return {
      ask: { kind: 'only', faces: [f] },
      answer,
      question: { en: `How many small cubes have ${x.en} paint and no other colour?`, kn: `${x.kn} ಬಣ್ಣ ಮಾತ್ರ ಇರುವ (ಬೇರೆ ಯಾವ ಬಣ್ಣವೂ ಇಲ್ಲದ) ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?` },
      rule: {
        en: `On the ${x.en} face, leave out the outer ring of cubes: they touch another face too. The middle ${m} × ${m} cubes have only ${x.en}.`,
        kn: `${x.kn} ಮುಖದಲ್ಲಿ ಹೊರಸುತ್ತಿನ ಘನಗಳನ್ನು ಬಿಡಿ: ಅವು ಇನ್ನೊಂದು ಮುಖವನ್ನೂ ಮುಟ್ಟುತ್ತವೆ. ಮಧ್ಯದ ${m} × ${m} ಘನಗಳಿಗೆ ${x.kn} ಬಣ್ಣ ಮಾತ್ರ.`,
      },
      working: { en: w, kn: w },
      pattern: 'colour-only',
    }
  }
  if (r < 0.55) {
    // Only two colours: two faces next to each other.
    const f = pick(rng, ORDER)
    const g = pick(
      rng,
      ORDER.filter((h) => h !== f && h !== OPPOSITE[f]),
    )
    const [x, y] = [c(f), c(g)]
    const answer = m
    const w = `${n} − 2 = ${answer}`
    return {
      ask: { kind: 'only', faces: [f, g] },
      answer,
      question: {
        en: `How many small cubes have only ${x.en} and ${y.en} paint, and no other colour?`,
        kn: `${x.kn} ಮತ್ತು ${y.kn} ಬಣ್ಣಗಳು ಮಾತ್ರ ಇರುವ (ಬೇರೆ ಯಾವ ಬಣ್ಣವೂ ಇಲ್ಲದ) ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?`,
      },
      rule: {
        en: `The ${x.en} and ${y.en} faces meet along one edge of ${n} cubes. The 2 cubes at its ends are corners with a third colour, so leave them out.`,
        kn: `${x.kn} ಮತ್ತು ${y.kn} ಮುಖಗಳು ${n} ಘನಗಳ ಒಂದು ಅಂಚಿನಲ್ಲಿ ಸಂಧಿಸುತ್ತವೆ. ತುದಿಯ 2 ಘನಗಳು ಮೂಲೆಗಳು, ಅವಕ್ಕೆ ಮೂರನೇ ಬಣ್ಣವೂ ಇದೆ; ಅವನ್ನು ಬಿಡಿ.`,
      },
      working: { en: w, kn: w },
      pattern: 'colour-only',
    }
  }
  if (r < 0.75) {
    // Both of two colours (other colours allowed): next to each other, or opposite.
    const f = pick(rng, ORDER)
    const opposite = rng() < 0.4
    const g = opposite ? OPPOSITE[f] : pick(rng, ORDER.filter((h) => h !== f && h !== OPPOSITE[f]))
    const [x, y] = [c(f), c(g)]
    const answer = opposite ? 0 : n
    return {
      ask: { kind: 'all', faces: [f, g] },
      answer,
      question: {
        en: `How many small cubes have both ${x.en} and ${y.en} paint on them (they may have another colour too)?`,
        kn: `${x.kn} ಮತ್ತು ${y.kn} ಎರಡೂ ಬಣ್ಣಗಳಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು (ಬೇರೆ ಬಣ್ಣವೂ ಇರಬಹುದು)?`,
      },
      rule: opposite
        ? {
            en: `${x.en[0].toUpperCase() + x.en.slice(1)} and ${y.en} are on opposite faces of the big cube. They never meet, so no small cube has both.`,
            kn: `${x.kn} ಮತ್ತು ${y.kn} ದೊಡ್ಡ ಘನದ ವಿರುದ್ಧ ಮುಖಗಳಲ್ಲಿವೆ. ಅವು ಸಂಧಿಸುವುದಿಲ್ಲ; ಆದ್ದರಿಂದ ಯಾವ ಚಿಕ್ಕ ಘನಕ್ಕೂ ಎರಡೂ ಬಣ್ಣಗಳಿಲ್ಲ.`,
          }
        : {
            en: `The ${x.en} and ${y.en} faces are next to each other and meet along one edge. Every cube on that edge has both colours, the 2 corners too.`,
            kn: `${x.kn} ಮತ್ತು ${y.kn} ಮುಖಗಳು ಪಕ್ಕಪಕ್ಕದಲ್ಲಿದ್ದು ಒಂದು ಅಂಚಿನಲ್ಲಿ ಸಂಧಿಸುತ್ತವೆ. ಆ ಅಂಚಿನ ಪ್ರತಿಯೊಂದು ಘನಕ್ಕೂ ಎರಡೂ ಬಣ್ಣಗಳಿವೆ, 2 ಮೂಲೆಗಳಿಗೂ ಸಹ.`,
          },
      working: opposite ? { en: 'opposite faces = 0', kn: 'ವಿರುದ್ಧ ಮುಖಗಳು = 0' } : { en: `1 edge = ${n}`, kn: `1 ಅಂಚು = ${n}` },
      pattern: 'colour-common',
    }
  }
  if (r < 0.87) {
    // All three of three colours: a corner, unless two of them are opposite.
    const faces = shuffle(rng, ORDER).slice(0, 3)
    const corner = !faces.some((f) => faces.includes(OPPOSITE[f]))
    const [x, y, z] = faces.map(c)
    const answer = corner ? 1 : 0
    return {
      ask: { kind: 'all', faces },
      answer,
      question: {
        en: `How many small cubes have all three colours ${x.en}, ${y.en} and ${z.en}?`,
        kn: `${x.kn}, ${y.kn} ಮತ್ತು ${z.kn} ಈ ಮೂರೂ ಬಣ್ಣಗಳಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?`,
      },
      rule: corner
        ? {
            en: 'These three faces are all next to each other, so they meet at one corner. Only the small cube at that corner has all three colours.',
            kn: 'ಈ ಮೂರು ಮುಖಗಳು ಒಂದಕ್ಕೊಂದು ಪಕ್ಕದಲ್ಲಿವೆ; ಅವು ಒಂದು ಮೂಲೆಯಲ್ಲಿ ಸಂಧಿಸುತ್ತವೆ. ಆ ಮೂಲೆಯ ಚಿಕ್ಕ ಘನಕ್ಕೆ ಮಾತ್ರ ಮೂರೂ ಬಣ್ಣಗಳು.',
          }
        : {
            en: 'Two of these faces are opposite each other, so the three never meet at one corner. No small cube has all three colours.',
            kn: 'ಇವುಗಳಲ್ಲಿ ಎರಡು ಮುಖಗಳು ಒಂದಕ್ಕೊಂದು ವಿರುದ್ಧವಾಗಿವೆ; ಮೂರೂ ಒಂದು ಮೂಲೆಯಲ್ಲಿ ಸಂಧಿಸುವುದಿಲ್ಲ. ಯಾವ ಚಿಕ್ಕ ಘನಕ್ಕೂ ಮೂರೂ ಬಣ್ಣಗಳಿಲ್ಲ.',
          },
      working: corner ? { en: '1 corner = 1', kn: '1 ಮೂಲೆ = 1' } : { en: 'opposite faces = 0', kn: 'ವಿರುದ್ಧ ಮುಖಗಳು = 0' },
      pattern: 'colour-common',
    }
  }
  if (r < 0.95) {
    const f = pick(rng, ORDER)
    const x = c(f)
    const answer = n * n
    const w = `${n} × ${n} = ${answer}`
    return {
      ask: { kind: 'all', faces: [f] },
      answer,
      question: { en: `How many small cubes have some ${x.en} paint on them?`, kn: `${x.kn} ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?` },
      rule: {
        en: `Every small cube on the ${x.en} face has ${x.en} paint, the edges and corners too: the whole face, ${n} × ${n}.`,
        kn: `${x.kn} ಮುಖದ ಪ್ರತಿಯೊಂದು ಚಿಕ್ಕ ಘನಕ್ಕೂ ${x.kn} ಬಣ್ಣವಿದೆ, ಅಂಚು ಮತ್ತು ಮೂಲೆಗಳಿಗೂ ಸಹ: ಇಡೀ ಮುಖ, ${n} × ${n}.`,
      },
      working: { en: w, kn: w },
      pattern: 'colour-common',
    }
  }
  const answer = n ** 3
  const w = `${n}³ = ${n} × ${n} × ${n} = ${answer}`
  return {
    ask: { kind: 'total' },
    answer,
    question: { en: 'How many small cubes are there in all?', kn: 'ಒಟ್ಟು ಎಷ್ಟು ಚಿಕ್ಕ ಘನಗಳಿವೆ?' },
    rule: { en: `Each edge is divided into ${n} equal parts, so there are ${n} × ${n} × ${n} small cubes.`, kn: `ಪ್ರತಿಯೊಂದು ಅಂಚನ್ನು ${n} ಸಮಭಾಗ ಮಾಡಲಾಗಿದೆ; ಆದ್ದರಿಂದ ${n} × ${n} × ${n} ಚಿಕ್ಕ ಘನಗಳು.` },
    working: { en: w, kn: w },
    pattern: 'cube-cut',
  }
}

type Pt = [number, number]

/** A parallelogram face from corner p along edges u and v, cut into n × n squares. */
function face(p: Pt, u: Pt, v: Pt, n: number, colour: Text): PaintedFace {
  const at = (a: number, b: number): Pt => [+(p[0] + a * u[0] + b * v[0]).toFixed(2), +(p[1] + a * u[1] + b * v[1]).toFixed(2)]
  const grid: [number, number, number, number][] = []
  for (let i = 1; i < n; i++) grid.push([...at(i / n, 0), ...at(i / n, 1)], [...at(0, i / n), ...at(1, i / n)])
  return { pts: [...at(0, 0), ...at(1, 0), ...at(1, 1), ...at(0, 1)], ...PAINT[colour.en], grid }
}

const label = (x: number, y: number, c: Text): FigItem => ({ shape: 'text', x, y, size: 10, label: c.en, labelKn: c.kn })

/**
 * The cube as the book draws it: a front-top view (front, top and right faces) and, beside it, a
 * back-bottom view (back, bottom and left faces), each face in its colour and named beside it.
 */
export function colourCubeDrawing(n: number, col: Record<Face, Text>): Drawing {
  const s = 40
  const o = 125 // where the second view starts
  return {
    w: 226,
    faces: [
      face([10, 40], [s, 0], [0, s], n, col.front),
      face([10, 40], [s, 0], [18, -13], n, col.top),
      face([10 + s, 40], [18, -13], [0, s], n, col.right),
      face([o, 22], [s, 0], [0, s], n, col.back),
      face([o, 22 + s], [s, 0], [18, 13], n, col.bottom),
      face([o + s, 22], [18, 13], [0, s], n, col.left),
    ],
    dashed: [[111, 6, 111, 94]],
    items: [
      label(39, 18, col.top),
      label(30, 91, col.front),
      label(91, 54, col.right),
      label(o + 20, 13, col.back),
      label(o + 29, 86, col.bottom),
      label(o + 79, 48, col.left),
    ],
  }
}

let counter = 0

/** A generated question, with what it is about (for the tests). */
export function buildColouring(rng: Rng): { q: Question; spec: ColourSpec } {
  const n = int(rng, 3, 6)
  const picked = shuffle(rng, COLOURS).slice(0, 6)
  const col = Object.fromEntries(ORDER.map((f, i) => [f, picked[i]])) as Record<Face, Text>
  const m = make(rng, n, col)
  const k = n - 2
  const near = [n, k, k * k, n * n, 1, 0, 8, 12 * k, 6 * k * k, k ** 3, n ** 3, 4 * k, 2, 3, n - 1, (n - 1) ** 2, 2 * n, 6 * n]
  const wrong = new Set<number>()
  for (const v of shuffle(rng, near)) if (v >= 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  for (let d = 1; wrong.size < 3; d++) for (const v of [m.answer + d * 2, m.answer - d]) if (v >= 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  const opts = shuffle(rng, [m.answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((key, i) => [key, String(opts[i])])) as Record<OptionKey, string>
  const place = (l: 'en' | 'kn') =>
    l === 'en'
      ? ORDER.map((f, i) => `${i === ORDER.length - 1 ? 'and ' : ''}${col[f].en} ${ON_FACE[f].en}`).join(', ')
      : ORDER.map((f) => `${ON_FACE[f].kn} ${col[f].kn}`).join(', ')
  const prompt: Text = {
    en: `A cube is painted a different colour on each face: ${place('en')}. Each edge is divided into ${n} equal parts, and the cube is cut into ${n} × ${n} × ${n} small cubes. ${m.question.en}`,
    kn: `ಒಂದು ಘನದ ಪ್ರತಿಯೊಂದು ಮುಖಕ್ಕೂ ಪ್ರತ್ಯೇಕ ಬಣ್ಣವನ್ನು ಲೇಪಿಸಲಾಗಿದೆ: ${place('kn')}. ಪ್ರತಿಯೊಂದು ಅಂಚನ್ನು ${n} ಸಮಭಾಗ ಮಾಡಿ, ಘನವನ್ನು ${n} × ${n} × ${n} ಚಿಕ್ಕ ಘನಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ${m.question.kn}`,
  }
  const q: Question = {
    id: `gen-col-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    figures: { terms: [colourCubeDrawing(n, col)] },
    options,
    answer: OPTION_KEYS[opts.indexOf(m.answer)],
    rule: m.rule.en,
    working: m.working.en,
    pattern: m.pattern,
    generated: true,
    kn: { prompt: prompt.kn, rule: m.rule.kn, working: m.working.kn },
  }
  const colours = Object.fromEntries(ORDER.map((f) => [f, col[f].en])) as Record<Face, string>
  return { q, spec: { n, colours, ask: m.ask } }
}

export function generateCubesColouring(rng: Rng = Math.random): Question {
  return buildColouring(rng).q
}
