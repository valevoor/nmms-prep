import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { mirror, signature, turn } from './figures'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Chapter 9, Water Image: a figure, a word or a number stands above water; one option is its water
// image (top and bottom swap, every part is turned upside down, left and right stay). The wrong
// options are traps: the mirror image (left and right swapped instead), the figure turned half a
// turn, the figure unchanged, or the water image with one part left as it was; for words, one
// character left upright or turned half a turn in place.

/** The drawing turned upside down, as seen in water below it: a mirror image turned half a turn. */
export const waterImage = (d: Drawing): Drawing => turn(mirror(d), 180)

// ---------- figures of small shapes ----------

const SLOTS: [number, number][] = [
  [28, 28], [72, 28], [72, 72], [28, 72],
  [50, 24], [76, 50], [50, 76], [24, 50],
  [50, 50],
]
const SHAPES = ['arrow', 'arrow', 'flag', 'flag', 'ell', 'ell', 'poly', 'poly', 'circle', 'dots', 'plus'] as const
const fillable = (it: FigItem) => it.shape === 'poly' || it.shape === 'circle' || it.shape === 'flag'

function item(rng: Rng, [x, y]: [number, number]): FigItem {
  const shape = pick(rng, SHAPES)
  const it: FigItem = { shape, x, y, size: shape === 'dots' ? 24 : 20, rot: 90 * int(rng, 0, 3) }
  if (shape === 'arrow') it.rot = 45 * int(rng, 0, 7)
  if (shape === 'poly') it.n = 3
  if (shape === 'dots') it.n = int(rng, 2, 3)
  if (fillable(it)) it.fill = pick(rng, ['none', 'solid'] as const)
  if (shape === 'flag' || shape === 'ell') it.flip = rng() < 0.5
  return it
}

// ---------- words and numbers ----------

// A character's look is one of four states: as written, flipped left–right, turned half a turn, or
// upside down (flipped and turned). As bits: 2 = flipped, 1 = turned; combining two is XOR.
const FLIP = 2
const TURN = 1
/** Capitals and digits that look the same upside down (the book's list, plus 0 and 8). */
const SAME_UPSIDE_DOWN = new Set('BCDEHIKOX038')
/** Capitals and digits that look the same left–right flipped. */
const SAME_BACKWARDS = new Set('AHIMOTUVWXY08')
/** Characters used: none that look the same only when turned half a turn (N, S, Z), and no 1. */
const POOL_LETTERS = 'ABCDEFGJKLMPQRTUVWY'
const POOL_DIGITS = '2345679'

/** The state of a text item: bit 2 if drawn flipped, bit 1 if turned half a turn. */
const state = (it: FigItem) => (it.flip ? FLIP : 0) | (Math.round((((it.rot ?? 0) % 360) + 360) % 360) === 180 ? TURN : 0)
/** The smallest state that looks the same as `s` for this character. */
function canon(label: string, s: number): number {
  const same = [0]
  if (SAME_BACKWARDS.has(label)) same.push(FLIP)
  if (SAME_UPSIDE_DOWN.has(label)) same.push(FLIP | TURN)
  if (same.length === 3) same.push(TURN)
  return Math.min(...same.map((g) => s ^ g))
}
const withState = (it: FigItem, s: number): FigItem => ({ ...it, flip: (s & FLIP) !== 0, rot: s & TURN ? 180 : 0 })

// ---------- comparing ----------

/** A string that is the same for two drawings exactly when they look the same (letters included). */
function look(d: Drawing): string {
  const shapes = signature({ ...d, items: d.items.filter((it) => it.shape !== 'text') })
  const text = d.items
    .filter((it) => it.shape === 'text')
    .map((it) => `${it.label}@${Math.round(it.x)},${Math.round(it.y)}:${canon(it.label ?? '', state(it))}`)
    .sort()
  return [shapes, ...text].join('|')
}
const sameLook = (a: Drawing, b: Drawing) => look(a) === look(b)

const clean = (d: Drawing): Drawing => ({
  ...(d.frame ? { frame: d.frame } : {}),
  items: d.items.map((it) => {
    const out = Object.fromEntries(Object.entries(it).filter(([, v]) => v !== undefined && v !== false)) as unknown as FigItem
    if (out.rot === 0) delete out.rot
    return out
  }),
})

type Trap = 'same' | 'mirror' | 'half' | 'part' | 'upright' | 'turned'
const TRAP: Record<Trap, Text> = {
  same: { en: 'is the figure unchanged', kn: 'ಬದಲಾಗದ ಅದೇ ಚಿತ್ರ' },
  mirror: { en: 'is the mirror image (left and right swapped instead)', kn: 'ಕನ್ನಡಿ ಪ್ರತಿಬಿಂಬ (ಬದಲಿಗೆ ಎಡ ಬಲ ಅದಲು ಬದಲಾಗಿದೆ)' },
  half: { en: 'is turned half a turn, so left and right swap too', kn: 'ಅರ್ಧ ಸುತ್ತು ತಿರುಗಿದೆ, ಆದ್ದರಿಂದ ಎಡ ಬಲವೂ ಅದಲು ಬದಲಾಗಿದೆ' },
  part: { en: 'has one part not turned upside down', kn: 'ಒಂದು ಭಾಗ ತಲೆಕೆಳಗಾಗಿಲ್ಲ' },
  upright: { en: 'has one character left upright', kn: 'ಒಂದು ಅಕ್ಷರ ನೇರವಾಗಿಯೇ ಇದೆ' },
  turned: { en: 'has one character turned half a turn instead of upside down', kn: 'ಒಂದು ಅಕ್ಷರ ತಲೆಕೆಳಗಾಗುವ ಬದಲು ಅರ್ಧ ಸುತ್ತು ತಿರುಗಿದೆ' },
}

/** Picks up to three wrong options that look different from the answer and from each other. */
function pickWrong(rng: Rng, answer: Drawing, cands: [Trap, Drawing | undefined][]): [Trap, Drawing][] {
  const out: [Trap, Drawing][] = []
  for (const [t, w] of shuffle(rng, cands)) {
    if (out.length === 3) break
    if (w && !sameLook(w, answer) && !out.some(([, o]) => sameLook(o, w))) out.push([t, w])
  }
  return out
}

type Made = { d: Drawing; answer: Drawing; wrong: [Trap, Drawing][] }

function figureQuestion(rng: Rng): Made | undefined {
  const slots = shuffle(rng, SLOTS).slice(0, int(rng, 3, 4))
  const d: Drawing = { frame: pick(rng, ['square', 'square', undefined]), items: slots.map((s) => item(rng, s)) }
  const answer = waterImage(d)
  if (sameLook(answer, d)) return undefined
  const w = answer.items
  // The water image with one part given back its old look (at its new place), or left where it was.
  const onePart = (): Drawing | undefined => {
    const i = int(rng, 0, w.length - 1)
    const kept = rng() < 0.5 ? { ...d.items[i], y: w[i].y } : { ...w[i], y: d.items[i].y }
    return { ...answer, items: w.map((it, j) => (j === i ? kept : it)) }
  }
  const wrong = pickWrong(rng, answer, [
    ['mirror', mirror(d)],
    ['half', turn(d, 180)],
    ['same', d],
    ['part', onePart()],
    ['part', onePart()],
  ])
  return wrong.length === 3 ? { d, answer, wrong } : undefined
}

function wordQuestion(rng: Rng): Made | undefined {
  const n = int(rng, 4, 6)
  const pool = rng() < 0.5 ? POOL_LETTERS : POOL_DIGITS + 'ABEHKMR'
  const chars = Array.from({ length: n }, () => pick(rng, [...pool]))
  const changing = chars.map((c, i) => (SAME_UPSIDE_DOWN.has(c) ? -1 : i)).filter((i) => i >= 0)
  if (changing.length < 3) return undefined
  const gap = n === 6 ? 14 : 16
  const d: Drawing = {
    items: chars.map((label, i) => ({ shape: 'text', label, x: 50 + (i - (n - 1) / 2) * gap, y: 50, size: 18 })),
  }
  // A word sits on the middle line, so its water image keeps every letter in place, upside down.
  const answer: Drawing = { items: d.items.map((it) => withState(it, FLIP | TURN)) }
  const oneChar = (s: number): Drawing => {
    const i = pick(rng, changing)
    return { items: answer.items.map((it, j) => (j === i ? withState(it, s) : it)) }
  }
  const wrong = pickWrong(rng, answer, [
    ['mirror', { items: mirror(d).items.map((it) => withState(it, FLIP)) }],
    ['half', { items: turn(d, 180).items.map((it) => withState(it, TURN)) }],
    ['upright', oneChar(0)],
    ['upright', oneChar(0)],
    ['turned', oneChar(TURN)],
    ['turned', oneChar(TURN)],
  ])
  return wrong.length === 3 ? { d, answer, wrong } : undefined
}

let counter = 0

/** One question: a figure, word or number and four options, of which exactly one is its water image. */
export function generateWaterImage(rng: Rng = Math.random): Question {
  for (;;) {
    const kind = rng() < 0.6 ? 'figure' : 'word'
    const made = kind === 'figure' ? figureQuestion(rng) : wordQuestion(rng)
    if (!made) continue
    const { d, answer, wrong } = made
    const order = shuffle(rng, [answer, ...wrong.map(([, w]) => w)])
    const key = OPTION_KEYS[order.indexOf(answer)]
    const traps = wrong.map(([t, w]) => ({ k: OPTION_KEYS[order.indexOf(w)], t }))
    traps.sort((a, b) => a.k.localeCompare(b.k))
    const why = (l: 'en' | 'kn') => traps.map(({ k, t }) => (l === 'en' ? `${k} ${TRAP[t].en}` : `${k}: ${TRAP[t].kn}`)).join('; ')
    const rule: Text =
      kind === 'figure'
        ? { en: `Option ${key} is the figure turned upside down, top to bottom`, kn: `ಆಯ್ಕೆ ${key} ಯು ಚಿತ್ರವನ್ನು ಮೇಲು-ಕೆಳಗು ತಲೆಕೆಳಗಾಗಿಸಿದಂತಿದೆ` }
        : { en: `Option ${key}: the same order, each character upside down`, kn: `ಆಯ್ಕೆ ${key}: ಅದೇ ಕ್ರಮ, ಪ್ರತಿ ಅಕ್ಷರವೂ ತಲೆಕೆಳಗಾಗಿ` }
    const working: Text =
      kind === 'figure'
        ? {
            en: `In water below, every part moves to the other side of the middle line, the same distance from it, and is turned upside down; left and right stay. That is option ${key}. ${why('en')}.`,
            kn: `ಕೆಳಗಿನ ನೀರಿನಲ್ಲಿ ಪ್ರತಿ ಭಾಗವೂ ಮಧ್ಯದ ರೇಖೆಯಿಂದ ಅಷ್ಟೇ ದೂರದಲ್ಲಿ ಇನ್ನೊಂದು ಕಡೆಗೆ ಬರುತ್ತದೆ ಮತ್ತು ತಲೆಕೆಳಗಾಗುತ್ತದೆ; ಎಡ ಬಲ ಬದಲಾಗುವುದಿಲ್ಲ. ಅದು ಆಯ್ಕೆ ${key}. ${why('kn')}.`,
          }
        : {
            en: `In water below, the characters keep their order and each one is turned upside down (B, C, D, E, H, I, K, O, X, 0, 3 and 8 look the same). That is option ${key}. ${why('en')}.`,
            kn: `ಕೆಳಗಿನ ನೀರಿನಲ್ಲಿ ಅಕ್ಷರಗಳ ಕ್ರಮ ಹಾಗೆಯೇ ಇರುತ್ತದೆ, ಪ್ರತಿಯೊಂದೂ ತಲೆಕೆಳಗಾಗುತ್ತದೆ (B, C, D, E, H, I, K, O, X, 0, 3 ಮತ್ತು 8 ಹಾಗೆಯೇ ಕಾಣುತ್ತವೆ). ಅದು ಆಯ್ಕೆ ${key}. ${why('kn')}.`,
          }
    return {
      id: `gen-wat-${kind}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: ['1'],
      figures: { terms: [clean(d)], options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, clean(order[j])])) as Record<OptionKey, Drawing> },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer: key,
      rule: rule.en,
      working: working.en,
      pattern: 'water-image',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
