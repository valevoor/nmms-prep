import { OPTION_KEYS } from '../../types'
import type { Drawing, OptionKey, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

// Superimpose Figures (not in the book; past papers ask it): two figures in the same square are put
// one on top of the other, and the answer holds every line of both and nothing else. Lines join
// points of a 5 × 5 lattice in any of 8 directions, and a few small circles sit on lattice points.
// The wrong options miss a part, add a line, have one line in the wrong place, or have the second
// figure flipped. In some questions the second figure is turned a quarter turn clockwise first (as in
// Karnataka 2025-26 Q3); then one wrong option is the two figures put together without turning.

type P = [number, number]
/** A straight line between two lattice points, or a small circle on one ([p, p]). */
type Part = [P, P]

const N = 4 // lattice points 0..4 in each direction
const DIRS: P[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
const at = (u: number) => 14 + 18 * u
const isCircle = ([a, b]: Part) => a[0] === b[0] && a[1] === b[1]
const inside = (p: P) => p[0] >= 0 && p[0] <= N && p[1] >= 0 && p[1] <= N

/** The half-steps a line covers (keys on the doubled lattice), or the circle's own key. */
function cover(part: Part): string[] {
  const [a, b] = part
  if (isCircle(part)) return [`c${a[0]},${a[1]}`]
  const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))
  const d: P = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
  const out: string[] = []
  for (let k = 0; k < 2 * len; k++) {
    const p: P = [2 * a[0] + k * d[0], 2 * a[1] + k * d[1]]
    const q: P = [p[0] + d[0], p[1] + d[1]]
    out.push(p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]) ? `${p}-${q}` : `${q}-${p}`)
  }
  return out
}
/** What a figure looks like: the set of everything it covers, as one string. */
const look = (parts: Part[]) => [...new Set(parts.flatMap(cover))].sort().join('|')
/** Does `part` run over (or repeat) anything already in `parts`? */
const clashes = (part: Part, parts: Part[]) => {
  const used = new Set(parts.flatMap(cover))
  return cover(part).some((k) => used.has(k))
}

function randomLine(rng: Rng): Part {
  for (;;) {
    const a: P = [int(rng, 0, N), int(rng, 0, N)]
    const d = pick(rng, DIRS)
    const len = int(rng, 1, 4)
    const b: P = [a[0] + d[0] * len, a[1] + d[1] * len]
    if (inside(b)) return [a, b]
  }
}
const randomCircle = (rng: Rng): Part => {
  const p: P = [int(rng, 1, N - 1), int(rng, 1, N - 1)]
  return [p, p]
}

/** A figure of 3 or 4 parts (at most one circle) that run over nothing in `avoid` or in each other. */
function makeFigure(rng: Rng, avoid: Part[]): Part[] {
  const n = int(rng, 3, 4)
  const out: Part[] = []
  while (out.length < n) {
    const part = out.length === 0 && rng() < 0.3 ? randomCircle(rng) : randomLine(rng)
    if (!clashes(part, [...avoid, ...out])) out.push(part)
  }
  return out
}

const mapPart = (f: (p: P) => P) => ([a, b]: Part): Part => [f(a), f(b)]
/** A quarter turn clockwise about the middle of the square (y runs down). */
const turnCW = mapPart(([x, y]) => [N - y, x])
const flipLR = mapPart(([x, y]) => [N - x, y])

type Kind = 'missing' | 'extra' | 'moved' | 'flipped' | 'unturned'

const WRONG: Record<Kind, Text> = {
  missing: { en: 'misses a line', kn: 'ಒಂದು ರೇಖೆ ಇಲ್ಲ' },
  extra: { en: 'has an extra line', kn: 'ಒಂದು ಹೆಚ್ಚುವರಿ ರೇಖೆ ಇದೆ' },
  moved: { en: 'has a line in the wrong place', kn: 'ಒಂದು ರೇಖೆ ತಪ್ಪು ಜಾಗದಲ್ಲಿದೆ' },
  flipped: { en: 'has the second figure flipped', kn: 'ಎರಡನೇ ಚಿತ್ರ ತಿರುವುಮುರುವಾಗಿದೆ' },
  unturned: { en: 'has the second figure not turned', kn: 'ಎರಡನೇ ಚಿತ್ರವನ್ನು ತಿರುಗಿಸಿಲ್ಲ' },
}
const MISSING_CIRCLE: Text = { en: 'misses the circle', kn: 'ವೃತ್ತ ಇಲ್ಲ' }

export const SUPERIMPOSE_RULE: Text = {
  en: 'Put one figure on top of the other: every line of both figures is there, in the same place, and nothing else',
  kn: 'ಒಂದು ಚಿತ್ರವನ್ನು ಇನ್ನೊಂದರ ಮೇಲೆ ಇಡಿ: ಎರಡೂ ಚಿತ್ರಗಳ ಪ್ರತಿ ರೇಖೆಯೂ ಅದೇ ಜಾಗದಲ್ಲಿರುತ್ತದೆ, ಬೇರೆ ಏನೂ ಇರುವುದಿಲ್ಲ',
}
export const TURN_PROMPT: Text = {
  en: 'Turn the second figure a quarter turn (90°) clockwise, then put it on the first. Which figure is formed?',
  kn: 'ಎರಡನೇ ಚಿತ್ರವನ್ನು ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ 90° ತಿರುಗಿಸಿ, ಮೊದಲ ಚಿತ್ರದ ಮೇಲೆ ಇಟ್ಟಾಗ ಉಂಟಾಗುವ ಚಿತ್ರ ಯಾವುದು?',
}

const draw = (parts: Part[]): Drawing => ({
  frame: 'square',
  items: parts.filter(isCircle).map(([a]) => ({ shape: 'circle', x: at(a[0]), y: at(a[1]), size: 16 })),
  lines: parts.filter((p) => !isCircle(p)).map(([a, b]) => [at(a[0]), at(a[1]), at(b[0]), at(b[1])]),
})

let counter = 0

/** A superimposing question: two figures, and four options of which exactly one holds both. */
export function generateSuperimpose(rng: Rng = Math.random): Question {
  for (;;) {
    const first = makeFigure(rng, [])
    const turned = rng() < 0.3
    const second = makeFigure(rng, turned ? first.map(turnCW) : first)
    const placed = turned ? second.map(turnCW) : second
    if (turned && look(placed) === look(second)) continue // turning must change it
    const target = [...first, ...placed]
    const seen = new Set([look(target)])
    const wrong: { parts: Part[]; kind: Kind; circle?: boolean }[] = []
    const add = (parts: Part[] | undefined, kind: Kind, circle?: boolean) => {
      if (!parts || seen.has(look(parts)) || wrong.some((w) => w.kind === kind)) return
      seen.add(look(parts))
      wrong.push({ parts, kind, circle })
    }
    if (turned) add([...first, ...second], 'unturned')
    const flipped = placed.map(flipLR)
    if (!flipped.some((p) => clashes(p, first))) add([...first, ...flipped], 'flipped')
    const tries: (() => void)[] = [
      () => {
        const i = int(rng, 0, target.length - 1)
        add(target.filter((_, j) => j !== i), 'missing', isCircle(target[i]))
      },
      () => {
        const extra = randomLine(rng)
        if (!clashes(extra, target)) add([...target, extra], 'extra')
      },
      () => {
        const i = int(rng, 0, target.length - 1)
        if (isCircle(target[i])) return
        const rest = target.filter((_, j) => j !== i)
        // The same line, flipped or turned so that it lands somewhere else.
        const moved = pick(rng, [flipLR, mapPart(([x, y]) => [x, N - y]), turnCW])(target[i])
        if (!clashes(moved, rest)) add([...rest, moved], 'moved')
      },
    ]
    for (let n = 0; wrong.length < 3 && n < 30; n++) pick(rng, tries)()
    if (wrong.length < 3) continue
    const chosen = shuffle(rng, wrong).slice(0, 3)
    const all = shuffle(rng, [target, ...chosen.map((w) => w.parts)])
    const answer = OPTION_KEYS[all.indexOf(target)]
    const why = (l: 'en' | 'kn') =>
      chosen
        .map((w) => ({ key: OPTION_KEYS[all.indexOf(w.parts)], text: (w.circle ? MISSING_CIRCLE : WRONG[w.kind])[l] }))
        .sort((a, b) => a.key.localeCompare(b.key))
    const working: Text = {
      en:
        (turned ? 'First turn the second figure a quarter turn clockwise. ' : '') +
        `Option ${answer} has every line of both figures and nothing else. ` +
        why('en').map((w) => `${w.key} ${w.text}`).join(', ') + '.',
      kn:
        (turned ? 'ಮೊದಲು ಎರಡನೇ ಚಿತ್ರವನ್ನು ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಕಾಲು ಸುತ್ತು ತಿರುಗಿಸಿ. ' : '') +
        `ಆಯ್ಕೆ ${answer} ರಲ್ಲಿ ಎರಡೂ ಚಿತ್ರಗಳ ಎಲ್ಲಾ ರೇಖೆಗಳಿವೆ, ಬೇರೆ ಏನೂ ಇಲ್ಲ. ` +
        why('kn').map((w) => `${w.key} ಯಲ್ಲಿ ${w.text}`).join(', ') + '.',
    }
    return {
      id: `gen-sup-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: turned ? 'text' : 'series',
      terms: turned ? [] : ['1', '2'],
      ...(turned ? { prompt: TURN_PROMPT.en } : {}),
      figures: {
        terms: [draw(first), draw(second)],
        options: Object.fromEntries(OPTION_KEYS.map((k, j) => [k, draw(all[j])])) as Record<OptionKey, Drawing>,
      },
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      answer,
      rule: SUPERIMPOSE_RULE.en,
      working: working.en,
      pattern: 'fig-superimpose',
      generated: true,
      kn: { rule: SUPERIMPOSE_RULE.kn, working: working.kn, ...(turned ? { prompt: TURN_PROMPT.kn } : {}) },
    }
  }
}
