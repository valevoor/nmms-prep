import { OPTION_KEYS } from '../../types'
import type { Drawing, FigItem, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { mirror, signature, turn } from './figures'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Chapter 8, Mirror Image: a mirror stands on the right of a figure, a word or a number; one option
// is its mirror image (left and right swap, every part is flipped, top and bottom stay). The wrong
// options are traps: the figure unchanged, turned upside down or half a turn, or mirrored with one
// part left unflipped; for words, the order reversed but the letters not flipped, or the letters
// flipped but kept in order.

// ---------- figures of small shapes ----------

const SLOTS: [number, number][] = [
  [28, 28], [72, 28], [72, 72], [28, 72],
  [50, 24], [76, 50], [50, 76], [24, 50],
  [50, 50],
]
const SHAPES = ['arrow', 'arrow', 'flag', 'flag', 'ell', 'ell', 'poly', 'circle', 'dots', 'plus'] as const
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

/** Capitals and digits that look the same in a mirror (in the app's font). */
const SYMMETRIC = new Set('AHMOTUVWXY08')
/** Capitals and digits that look different in a mirror (no I or 1, whose serifs vary by font). */
const ASYMMETRIC = 'BCDEFGJKLNPQRSZ234579'

// ---------- comparing ----------

/** A string that is the same for two drawings exactly when they look the same (letters included). */
function look(d: Drawing): string {
  const shapes = signature({ ...d, items: d.items.filter((it) => it.shape !== 'text') })
  const text = d.items
    .filter((it) => it.shape === 'text')
    .map((it) => `${it.label}@${Math.round(it.x)},${Math.round(it.y)}${it.flip && !SYMMETRIC.has(it.label ?? '') ? 'm' : ''}`)
    .sort()
  return [shapes, ...text].join('|')
}
const sameLook = (a: Drawing, b: Drawing) => look(a) === look(b)

const clean = (d: Drawing): Drawing => ({
  ...(d.frame ? { frame: d.frame } : {}),
  items: d.items.map((it) => Object.fromEntries(Object.entries(it).filter(([, v]) => v !== undefined && v !== false)) as unknown as FigItem),
})

type Trap = 'same' | 'upside' | 'half' | 'part' | 'order' | 'unflipped' | 'inplace'
const TRAP: Record<Trap, Text> = {
  same: { en: 'is the figure unchanged', kn: 'ಬದಲಾಗದ ಅದೇ ಚಿತ್ರ' },
  upside: { en: 'is turned upside down (as in a mirror below it)', kn: 'ತಲೆಕೆಳಗಾಗಿದೆ (ಕೆಳಗೆ ಕನ್ನಡಿ ಇಟ್ಟಂತೆ)' },
  half: { en: 'is the figure turned half a turn', kn: 'ಅರ್ಧ ಸುತ್ತು ತಿರುಗಿಸಿದ ಚಿತ್ರ' },
  part: { en: 'has one part not flipped', kn: 'ಒಂದು ಭಾಗ ಅದಲು ಬದಲಾಗಿಲ್ಲ' },
  order: { en: 'reverses the order but does not flip the characters', kn: 'ಕ್ರಮವನ್ನು ತಿರುಗಿಸಿದೆ, ಆದರೆ ಅಕ್ಷರಗಳನ್ನು ಅದಲು ಬದಲಾಗಿಸಿಲ್ಲ' },
  unflipped: { en: 'has one character not flipped', kn: 'ಒಂದು ಅಕ್ಷರ ಅದಲು ಬದಲಾಗಿಲ್ಲ' },
  inplace: { en: 'flips the characters but keeps them in the same order', kn: 'ಅಕ್ಷರಗಳನ್ನು ಅದಲು ಬದಲಾಗಿಸಿದೆ, ಆದರೆ ಅದೇ ಕ್ರಮದಲ್ಲಿ ಇಟ್ಟಿದೆ' },
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

function figureQuestion(rng: Rng): { d: Drawing; answer: Drawing; wrong: [Trap, Drawing][] } | undefined {
  const slots = shuffle(rng, SLOTS).slice(0, int(rng, 3, 4))
  const d: Drawing = { frame: pick(rng, ['square', 'square', undefined]), items: slots.map((s) => item(rng, s)) }
  const answer = mirror(d)
  if (sameLook(answer, d)) return undefined
  const m = answer.items
  // The mirror image with one part given back its old look (at its new place), or left where it was.
  const onePart = (): Drawing | undefined => {
    const i = int(rng, 0, m.length - 1)
    const kept = rng() < 0.5 ? { ...d.items[i], x: m[i].x } : { ...m[i], x: d.items[i].x }
    return { ...answer, items: m.map((it, j) => (j === i ? kept : it)) }
  }
  const wrong = pickWrong(rng, answer, [
    ['same', d],
    ['upside', turn(answer, 180)],
    ['half', turn(d, 180)],
    ['part', onePart()],
    ['part', onePart()],
  ])
  return wrong.length === 3 ? { d, answer, wrong } : undefined
}

function wordQuestion(rng: Rng): { d: Drawing; answer: Drawing; wrong: [Trap, Drawing][] } | undefined {
  const n = int(rng, 4, 6)
  const pool = rng() < 0.5 ? ASYMMETRIC + 'AHMOTUVWXY' : '23456789'
  const chars = Array.from({ length: n }, () => pick(rng, [...pool]))
  if (chars.filter((c) => !SYMMETRIC.has(c)).length < 3) return undefined
  const gap = n === 6 ? 14 : 16
  const d: Drawing = {
    items: chars.map((label, i) => ({ shape: 'text', label, x: 50 + (i - (n - 1) / 2) * gap, y: 50, size: 18 })),
  }
  const answer = mirror(d)
  const unflipped = (): Drawing | undefined => {
    const idx = chars.map((c, i) => (SYMMETRIC.has(c) ? -1 : i)).filter((i) => i >= 0)
    const i = pick(rng, idx)
    return { ...answer, items: answer.items.map((it, j) => (j === i ? { ...it, flip: false } : it)) }
  }
  const wrong = pickWrong(rng, answer, [
    ['order', { items: answer.items.map((it) => ({ ...it, flip: false })) }],
    ['inplace', { items: d.items.map((it) => ({ ...it, flip: true })) }],
    ['unflipped', unflipped()],
    ['unflipped', unflipped()],
    ['same', d],
  ])
  return wrong.length === 3 ? { d, answer, wrong } : undefined
}

let counter = 0

/** One question: a figure, word or number and four options, of which exactly one is its mirror image. */
export function generateMirrorImage(rng: Rng = Math.random): Question {
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
        ? { en: `Option ${key} is the figure flipped left to right`, kn: `ಆಯ್ಕೆ ${key} ಯು ಚಿತ್ರವನ್ನು ಎಡ-ಬಲ ಅದಲು ಬದಲು ಮಾಡಿದಂತಿದೆ` }
        : { en: `Option ${key}: the characters in reverse order, each one flipped`, kn: `ಆಯ್ಕೆ ${key}: ಅಕ್ಷರಗಳು ಹಿಮ್ಮುಖ ಕ್ರಮದಲ್ಲಿ, ಪ್ರತಿಯೊಂದೂ ಅದಲು ಬದಲಾಗಿ` }
    const working: Text =
      kind === 'figure'
        ? {
            en: `In a mirror on the right, every part moves to the other side, the same distance from the middle, and faces the other way; top and bottom stay. That is option ${key}. ${why('en')}.`,
            kn: `ಬಲಭಾಗದ ಕನ್ನಡಿಯಲ್ಲಿ ಪ್ರತಿ ಭಾಗವೂ ಮಧ್ಯದಿಂದ ಅಷ್ಟೇ ದೂರದಲ್ಲಿ ಇನ್ನೊಂದು ಕಡೆಗೆ ಬರುತ್ತದೆ ಮತ್ತು ಇನ್ನೊಂದು ಕಡೆ ಮುಖ ಮಾಡುತ್ತದೆ; ಮೇಲು ಕೆಳಗು ಬದಲಾಗುವುದಿಲ್ಲ. ಅದು ಆಯ್ಕೆ ${key}. ${why('kn')}.`,
          }
        : {
            en: `In a mirror on the right, the last character comes first and each one is turned round (A, H, M, O, T, U, V, W, X, Y, 0 and 8 look the same). That is option ${key}. ${why('en')}.`,
            kn: `ಬಲಭಾಗದ ಕನ್ನಡಿಯಲ್ಲಿ ಕೊನೆಯ ಅಕ್ಷರ ಮೊದಲು ಬರುತ್ತದೆ ಮತ್ತು ಪ್ರತಿಯೊಂದೂ ಅದಲು ಬದಲಾಗುತ್ತದೆ (A, H, M, O, T, U, V, W, X, Y, 0 ಮತ್ತು 8 ಹಾಗೆಯೇ ಕಾಣುತ್ತವೆ). ಅದು ಆಯ್ಕೆ ${key}. ${why('kn')}.`,
          }
    return {
      id: `gen-mir-${kind}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'series',
      terms: ['1'],
      figures: { terms: [clean(d)], options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, clean(order[j])])) as Record<OptionKey, Drawing> },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer: key,
      rule: rule.en,
      working: working.en,
      pattern: 'mirror-image',
      generated: true,
      kn: { rule: rule.kn, working: working.kn },
    }
  }
}
