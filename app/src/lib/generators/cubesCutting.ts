import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Cubes cutting (Chapter 10): a big cube (or cuboid) is cut into small cubes of 1 cm. Questions ask
 * how many small cubes there are, how many are left when a layer is taken off every face, and, when
 * the big cube was painted first (on all or some faces), how many small cubes have 3, 2, 1 or no
 * faces painted.
 */

export type Face = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right'
export const FACES: Face[] = ['left', 'right', 'front', 'back', 'bottom', 'top']

export type CubeAsk =
  | { kind: 'cut'; edge: number; small: number }
  | { kind: 'faces'; k: 0 | 1 | 2 | 3 }
  | { kind: 'painted' }
  | { kind: 'peel'; what: 'left' | 'removed' }

/** What a question is about: the big solid in small cubes (length × breadth × height), its painted faces, and the ask. */
export interface CubeSpec {
  dims: [number, number, number]
  painted: Face[]
  ask: CubeAsk
}

/**
 * How many small cubes have 0, 1, 2 or 3 painted faces, worked out axis by axis: along each edge
 * direction a cube is at a painted end (1 face) or not (0), and the three directions multiply out.
 */
export function paintCounts(dims: [number, number, number], painted: Face[]): number[] {
  const ends: [Face, Face][] = [
    ['left', 'right'],
    ['front', 'back'],
    ['bottom', 'top'],
  ]
  let poly = [1]
  dims.forEach((len, i) => {
    const p = ends[i].filter((f) => painted.includes(f)).length
    const axis = [len - p, p]
    const next = Array(poly.length + 1).fill(0)
    poly.forEach((a, j) => axis.forEach((b, k) => (next[j + k] += a * b)))
    poly = next
  })
  return [0, 1, 2, 3].map((k) => poly[k] ?? 0)
}

const COLOURS: Text[] = [
  { en: 'red', kn: 'ಕೆಂಪು' },
  { en: 'blue', kn: 'ನೀಲಿ' },
  { en: 'green', kn: 'ಹಸಿರು' },
  { en: 'yellow', kn: 'ಹಳದಿ' },
]
const FACE_WORD: Record<Face, Text> = {
  top: { en: 'top', kn: 'ಮೇಲಿನ' },
  bottom: { en: 'bottom', kn: 'ಕೆಳಗಿನ' },
  front: { en: 'front', kn: 'ಮುಂದಿನ' },
  back: { en: 'back', kn: 'ಹಿಂದಿನ' },
  left: { en: 'left', kn: 'ಎಡ' },
  right: { en: 'right', kn: 'ಬಲ' },
}
/** Painted on some faces only. */
const SOME: Face[][] = [
  ['top', 'bottom'],
  ['left', 'right'],
  ['top', 'front'],
  ['top', 'front', 'right'],
  ['front', 'back', 'left', 'right'],
  ['top', 'front', 'back', 'left', 'right'],
]

const listEn = (ws: string[]) => (ws.length === 1 ? ws[0] : `${ws.slice(0, -1).join(', ')} and ${ws[ws.length - 1]}`)
const listKn = (ws: string[]) => (ws.length === 1 ? ws[0] : `${ws.slice(0, -1).join(', ')} ಮತ್ತು ${ws[ws.length - 1]}`)

const ASK_FACES: Record<0 | 1 | 2 | 3, Text> = {
  3: { en: 'How many small cubes have exactly three faces painted?', kn: 'ನಿಖರವಾಗಿ ಮೂರು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  2: { en: 'How many small cubes have exactly two faces painted?', kn: 'ನಿಖರವಾಗಿ ಎರಡು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  1: { en: 'How many small cubes have only one face painted?', kn: 'ಒಂದೇ ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
  0: { en: 'How many small cubes have no face painted?', kn: 'ಯಾವ ಮುಖಕ್ಕೂ ಬಣ್ಣವಿಲ್ಲದ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' },
}
const ASK_PAINTED: Text = { en: 'How many small cubes have at least one face painted?', kn: 'ಕನಿಷ್ಠ ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣವಿರುವ ಚಿಕ್ಕ ಘನಗಳು ಎಷ್ಟು?' }

interface Made {
  spec: CubeSpec
  answer: number
  /** Likely slips, used as wrong options. */
  near: number[]
  prompt: Text
  rule: Text
  working: string
  pattern: PatternId
}

function makeCut(rng: Rng): Made {
  const small = int(rng, 2, 5)
  const k = int(rng, 2, 6)
  const edge = small * k
  const answer = k ** 3
  return {
    spec: { dims: [k, k, k], painted: [], ask: { kind: 'cut', edge, small } },
    answer,
    near: [k * k, 6 * k * k, 3 * k, (k + 1) ** 3, (k - 1) ** 3, edge * k, edge * edge],
    prompt: {
      en: `Find the number of small cubes having edge length of ${small} cm made by cutting a solid cube of edge length ${edge} cm.`,
      kn: `${edge} ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಅಳತೆಯುಳ್ಳ ಒಂದು ಪೂರ್ಣ ಘನವನ್ನು ${small} ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಅಳತೆಯುಳ್ಳ ಚಿಕ್ಕ ಘನಗಳಾಗಿ ಕತ್ತರಿಸಿದಾಗ, ಉಂಟಾಗುವ ಚಿಕ್ಕ ಘನಗಳೆಷ್ಟು?`,
    },
    rule: {
      en: `Each edge of ${edge} cm gives ${edge} ÷ ${small} = ${k} small cubes, so there are ${k} × ${k} × ${k}.`,
      kn: `${edge} ಸೆಂ.ಮೀ. ಅಂಚಿನಲ್ಲಿ ${edge} ÷ ${small} = ${k} ಚಿಕ್ಕ ಘನಗಳು ಬರುತ್ತವೆ; ಆದ್ದರಿಂದ ${k} × ${k} × ${k}.`,
    },
    working: `(${edge} ÷ ${small})³ = ${k}³ = ${answer}`,
    pattern: 'cube-cut',
  }
}

function makePeel(rng: Rng): Made {
  const n = int(rng, 3, 8)
  const what = pick(rng, ['left', 'removed'] as const)
  const inner = (n - 2) ** 3
  const answer = what === 'left' ? inner : n ** 3 - inner
  const ask: Text =
    what === 'left'
      ? { en: 'Find the number of small cubes remaining after the removal.', kn: 'ಬೇರ್ಪಡಿಸುವಿಕೆಯ ನಂತರ ಉಳಿಯುವ ಚಿಕ್ಕಘನಗಳ ಸಂಖ್ಯೆ ಎಷ್ಟು?' }
      : { en: 'How many small cubes were removed?', kn: 'ಬೇರ್ಪಡಿಸಿದ ಚಿಕ್ಕಘನಗಳ ಸಂಖ್ಯೆ ಎಷ್ಟು?' }
  return {
    spec: { dims: [n, n, n], painted: [...FACES], ask: { kind: 'peel', what } },
    answer,
    near: [inner, n ** 3 - inner, (n - 1) ** 3, n ** 3 - (n - 1) ** 3, 6 * n * n, 6 * (n - 2) ** 2, n ** 3 - 6 * n * n].filter((v) => v > 0),
    prompt: {
      en: `A big cube of ${n ** 3} cubic units volume is cut into small cubes of 1 cubic unit each. Now a layer of small cubes is removed from each face of the big cube. ${ask.en}`,
      kn: `${n ** 3} ಘನಮಾನ ಗಾತ್ರವುಳ್ಳ ಒಂದು ದೊಡ್ಡ ಘನವನ್ನು 1 ಘನಮಾನ ಗಾತ್ರದ ಚಿಕ್ಕಘನಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ದೊಡ್ಡಘನದ ಪ್ರತಿಯೊಂದು ಮುಖದಿಂದ ಚಿಕ್ಕಘನಗಳ ಒಂದು ಪದರವನ್ನು ಬೇರ್ಪಡಿಸಲಾಗಿದೆ. ${ask.kn}`,
    },
    rule:
      what === 'left'
        ? {
            en: `${n ** 3} = ${n}³, so each edge is ${n} cubes long. Taking a layer off both ends of each edge leaves ${n} − 2 = ${n - 2}.`,
            kn: `${n ** 3} = ${n}³, ಆದ್ದರಿಂದ ಪ್ರತಿ ಅಂಚಿನಲ್ಲಿ ${n} ಘನಗಳು. ಪ್ರತಿ ಅಂಚಿನ ಎರಡೂ ತುದಿಗಳಿಂದ ಒಂದು ಪದರ ತೆಗೆದರೆ ${n} − 2 = ${n - 2} ಉಳಿಯುತ್ತದೆ.`,
          }
        : {
            en: `${n ** 3} = ${n}³. What is left is a cube of edge ${n} − 2 = ${n - 2}; everything else was removed.`,
            kn: `${n ** 3} = ${n}³. ಉಳಿಯುವುದು ${n} − 2 = ${n - 2} ಅಂಚಿನ ಘನ; ಉಳಿದೆಲ್ಲವನ್ನೂ ತೆಗೆಯಲಾಗಿದೆ.`,
          },
    working: what === 'left' ? `(${n} − 2)³ = ${n - 2}³ = ${answer}` : `${n}³ − (${n} − 2)³ = ${n ** 3} − ${inner} = ${answer}`,
    pattern: 'cube-cut',
  }
}

/** A cube or cuboid painted on every face. */
function makeAllPainted(rng: Rng): Made {
  const cube = rng() < 0.6
  let dims: [number, number, number]
  if (cube) {
    const n = int(rng, 3, 8)
    dims = [n, n, n]
  } else {
    do dims = [int(rng, 3, 7), int(rng, 3, 7), int(rng, 3, 6)]
    while (dims[0] === dims[1] && dims[1] === dims[2])
  }
  const [a, b, c] = dims
  const [ma, mb, mc] = dims.map((d) => d - 2)
  const counts = paintCounts(dims, FACES)
  const total = a * b * c
  const askPainted = rng() < 0.15
  const k = pick(rng, [0, 1, 2, 3] as const)
  const answer = askPainted ? total - counts[0] : counts[k]
  const colour = pick(rng, COLOURS)
  const n = a
  const shape: Text = cube
    ? { en: `A cube of edge ${n} cm`, kn: `${n} ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಒಂದು ಘನದ` }
    : { en: `A cuboid of ${a} cm × ${b} cm × ${c} cm`, kn: `${a} ಸೆಂ.ಮೀ. × ${b} ಸೆಂ.ಮೀ. × ${c} ಸೆಂ.ಮೀ. ಅಳತೆಯ ಒಂದು ಆಯತ ಘನದ` }
  const ask = askPainted ? ASK_PAINTED : ASK_FACES[k]
  const prompt: Text = {
    en: `${shape.en} is painted ${colour.en} on all its faces and then cut into small cubes of edge 1 cm. ${ask.en}`,
    kn: `${shape.kn} ಎಲ್ಲಾ ಮುಖಗಳಿಗೂ ${colour.kn} ಬಣ್ಣ ಬಳಿದು, ನಂತರ ಅದನ್ನು 1 ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಚಿಕ್ಕ ಘನಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ${ask.kn}`,
  }
  let rule: Text
  let working: string
  const inner = cube ? `(${n} − 2)³ = ${ma}³ = ${counts[0]}` : `${ma} × ${mb} × ${mc} = ${counts[0]}`
  if (askPainted) {
    rule = {
      en: 'Every cube has some paint except the ones hidden inside. Take the unpainted inside cubes away from all the cubes.',
      kn: 'ಒಳಗೆ ಅಡಗಿರುವ ಘನಗಳನ್ನು ಬಿಟ್ಟು ಉಳಿದೆಲ್ಲಕ್ಕೂ ಬಣ್ಣವಿದೆ. ಒಟ್ಟು ಘನಗಳಿಂದ ಒಳಗಿನ ಬಣ್ಣವಿಲ್ಲದ ಘನಗಳನ್ನು ಕಳೆಯಿರಿ.',
    }
    working = cube
      ? `${n}³ − (${n} − 2)³ = ${total} − ${counts[0]} = ${answer}`
      : `${a} × ${b} × ${c} − ${ma} × ${mb} × ${mc} = ${total} − ${counts[0]} = ${answer}`
  } else if (k === 3) {
    rule = { en: 'Only the 8 corner cubes have three painted faces.', kn: 'ಮೂಲೆಯ 8 ಘನಗಳಿಗೆ ಮಾತ್ರ ಮೂರು ಮುಖಗಳಿಗೆ ಬಣ್ಣವಿರುತ್ತದೆ.' }
    working = '8 corners = 8'
  } else if (k === 2) {
    rule = cube
      ? {
          en: `Two painted faces: the cubes along the 12 edges, leaving out the corners (${n} − 2 = ${ma} on each edge).`,
          kn: `ಎರಡು ಮುಖಗಳಿಗೆ ಬಣ್ಣ: 12 ಅಂಚುಗಳ ಮೇಲಿನ ಘನಗಳು, ಮೂಲೆಗಳನ್ನು ಬಿಟ್ಟು (ಪ್ರತಿ ಅಂಚಿನಲ್ಲಿ ${n} − 2 = ${ma}).`,
        }
      : {
          en: 'Two painted faces: the cubes along the 12 edges, leaving out the corners. There are 4 edges of each length, and each edge loses its 2 corner cubes.',
          kn: 'ಎರಡು ಮುಖಗಳಿಗೆ ಬಣ್ಣ: 12 ಅಂಚುಗಳ ಮೇಲಿನ ಘನಗಳು, ಮೂಲೆಗಳನ್ನು ಬಿಟ್ಟು. ಪ್ರತಿ ಉದ್ದದ 4 ಅಂಚುಗಳಿವೆ, ಮತ್ತು ಪ್ರತಿ ಅಂಚು ತನ್ನ 2 ಮೂಲೆಯ ಘನಗಳನ್ನು ಬಿಡುತ್ತದೆ.',
        }
    working = cube ? `12 × (${n} − 2) = 12 × ${ma} = ${answer}` : `4 × (${ma} + ${mb} + ${mc}) = 4 × ${ma + mb + mc} = ${answer}`
  } else if (k === 1) {
    rule = cube
      ? {
          en: `One painted face: the middle cubes of each of the 6 faces, leaving out the edges ((${n} − 2)² = ${ma * ma} on each face).`,
          kn: `ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣ: 6 ಮುಖಗಳ ಮಧ್ಯದ ಘನಗಳು, ಅಂಚುಗಳನ್ನು ಬಿಟ್ಟು (ಪ್ರತಿ ಮುಖದಲ್ಲಿ (${n} − 2)² = ${ma * ma}).`,
        }
      : {
          en: 'One painted face: the middle cubes of each of the 6 faces, leaving out the border. Opposite faces are the same size, so count 3 faces and double.',
          kn: 'ಒಂದು ಮುಖಕ್ಕೆ ಬಣ್ಣ: 6 ಮುಖಗಳ ಮಧ್ಯದ ಘನಗಳು, ಅಂಚಿನ ಸಾಲನ್ನು ಬಿಟ್ಟು. ಎದುರು ಮುಖಗಳು ಒಂದೇ ಅಳತೆಯವು; 3 ಮುಖಗಳನ್ನು ಎಣಿಸಿ ಎರಡರಿಂದ ಗುಣಿಸಿ.',
        }
    working = cube ? `6 × (${n} − 2)² = 6 × ${ma * ma} = ${answer}` : `2 × (${ma} × ${mb} + ${mb} × ${mc} + ${ma} × ${mc}) = 2 × ${ma * mb + mb * mc + ma * mc} = ${answer}`
  } else {
    rule = cube
      ? {
          en: `No painted face: the cubes hidden inside, which make a cube of edge ${n} − 2 = ${ma}.`,
          kn: `ಯಾವ ಮುಖಕ್ಕೂ ಬಣ್ಣವಿಲ್ಲ: ಒಳಗೆ ಅಡಗಿರುವ ಘನಗಳು; ಅವು ${n} − 2 = ${ma} ಅಂಚಿನ ಘನವಾಗುತ್ತವೆ.`,
        }
      : {
          en: 'No painted face: the cubes hidden inside. Take one layer off every face, so each length loses 2.',
          kn: 'ಯಾವ ಮುಖಕ್ಕೂ ಬಣ್ಣವಿಲ್ಲ: ಒಳಗೆ ಅಡಗಿರುವ ಘನಗಳು. ಪ್ರತಿ ಮುಖದಿಂದ ಒಂದು ಪದರ ತೆಗೆಯಿರಿ; ಪ್ರತಿ ಅಳತೆಯಲ್ಲಿ 2 ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
        }
    working = inner
  }
  const near = [...counts, total, total - counts[0], 12 * ma, 6 * ma * ma, (n - 1) ** 3, 12 * (n - 1), 6 * (n - 1) ** 2, 6, 12, 4 * (ma + mb + mc) + 8]
  return { spec: { dims, painted: [...FACES], ask: askPainted ? { kind: 'painted' } : { kind: 'faces', k } }, answer, near, prompt, rule, working, pattern: 'cube-paint' }
}

/** A cube painted on some faces only; asks for the unpainted cubes, or those with some paint. */
function makeSomePainted(rng: Rng): Made {
  const n = int(rng, 3, 7)
  const painted = pick(rng, SOME)
  const counts = paintCounts([n, n, n], painted)
  const total = n ** 3
  const askPainted = rng() < 0.35
  const answer = askPainted ? total - counts[0] : counts[0]
  const colour = pick(rng, COLOURS)
  const wordsEn = listEn(painted.map((f) => FACE_WORD[f].en))
  const wordsKn = listKn(painted.map((f) => FACE_WORD[f].kn))
  const ask = askPainted ? ASK_PAINTED : ASK_FACES[0]
  const prompt: Text = {
    en: `A cube of edge ${n} cm is painted ${colour.en} only on its ${wordsEn} faces, and then cut into small cubes of edge 1 cm. ${ask.en}`,
    kn: `${n} ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಒಂದು ಘನದ ${wordsKn} ಮುಖಗಳಿಗೆ ಮಾತ್ರ ${colour.kn} ಬಣ್ಣ ಬಳಿದು, ನಂತರ ಅದನ್ನು 1 ಸೆಂ.ಮೀ. ಬಾಹುವಿನ ಚಿಕ್ಕ ಘನಗಳಾಗಿ ಕತ್ತರಿಸಲಾಗಿದೆ. ${ask.kn}`,
  }
  // Unpainted: one layer off each painted face, so each length loses one per painted end.
  const ends: [Face, Face][] = [
    ['left', 'right'],
    ['front', 'back'],
    ['bottom', 'top'],
  ]
  const lens = ends.map((e) => {
    const p = e.filter((f) => painted.includes(f)).length
    return p ? `(${n} − ${p})` : String(n)
  })
  const product = `${lens.join(' × ')} = ${counts[0]}`
  const rule: Text = askPainted
    ? {
        en: 'Take one layer off each painted face; the cubes left have no paint. All the other cubes have some paint.',
        kn: 'ಬಣ್ಣ ಬಳಿದ ಪ್ರತಿ ಮುಖದಿಂದ ಒಂದು ಪದರ ತೆಗೆಯಿರಿ; ಉಳಿದ ಘನಗಳಿಗೆ ಬಣ್ಣವಿಲ್ಲ. ಬೇರೆಲ್ಲಾ ಘನಗಳಿಗೆ ಬಣ್ಣವಿದೆ.',
      }
    : {
        en: 'Take one layer off each painted face; the cubes left have no paint. An unpainted face takes nothing away.',
        kn: 'ಬಣ್ಣ ಬಳಿದ ಪ್ರತಿ ಮುಖದಿಂದ ಒಂದು ಪದರ ತೆಗೆಯಿರಿ; ಉಳಿದ ಘನಗಳಿಗೆ ಬಣ್ಣವಿಲ್ಲ. ಬಣ್ಣವಿಲ್ಲದ ಮುಖದಿಂದ ಏನನ್ನೂ ತೆಗೆಯಬೇಡಿ.',
      }
  const working = askPainted ? `${n}³ − ${lens.join(' × ')} = ${total} − ${counts[0]} = ${answer}` : product
  const all = paintCounts([n, n, n], FACES)
  const near = [counts[0], total - counts[0], all[0], total - all[0], (n - 1) ** 3, n * n * (n - 1), n * n * painted.length, counts[1], counts[2]]
  return { spec: { dims: [n, n, n], painted, ask: askPainted ? { kind: 'painted' } : { kind: 'faces', k: 0 } }, answer, near, prompt, rule, working, pattern: 'cube-paint' }
}

let counter = 0

/** A generated question, with what it is about (for the tests). */
export function buildCubes(rng: Rng): { q: Question; spec: CubeSpec } {
  const r = rng()
  const m = r < 0.2 ? makeCut(rng) : r < 0.35 ? makePeel(rng) : r < 0.8 ? makeAllPainted(rng) : makeSomePainted(rng)
  const wrong = new Set<number>()
  for (const v of shuffle(rng, m.near)) if (v > 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  for (let d = 1; wrong.size < 3; d++) for (const v of [m.answer + d * 2, m.answer - d]) if (v > 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  const opts = shuffle(rng, [m.answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>
  const q: Question = {
    id: `gen-cube-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: m.prompt.en,
    options,
    answer: OPTION_KEYS[opts.indexOf(m.answer)],
    rule: m.rule.en,
    working: m.working,
    pattern: m.pattern,
    generated: true,
    kn: { prompt: m.prompt.kn, rule: m.rule.kn, working: m.working },
  }
  return { q, spec: m.spec }
}

export function generateCubesCutting(rng: Rng = Math.random): Question {
  return buildCubes(rng).q
}
