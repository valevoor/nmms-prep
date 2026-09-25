import { OPTION_KEYS } from '../../types'
import type { Compass4, OptionKey, PatternId, Question } from '../../types'
import { both } from '../i18n/gen'
import type { GenText, Text } from '../i18n/gen'
import type { Locale } from '../i18n/locale'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** The eight directions, clockwise from north, 45° apart. */
export const DIR8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
export type Dir8 = (typeof DIR8)[number]
const turn = (d: Dir8, steps: number): Dir8 => DIR8[(((DIR8.indexOf(d) + steps) % 8) + 8) % 8]
const STEP: Record<Compass4, [number, number]> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }

/** The exact direction of (dx, dy), or undefined if it is not one of the eight (e.g. 30 east, 10 north). */
export function dirOf(dx: number, dy: number): Dir8 | undefined {
  if (dx === 0 && dy === 0) return undefined
  if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return undefined
  const ns = dy > 0 ? 'N' : dy < 0 ? 'S' : ''
  const ew = dx > 0 ? 'E' : dx < 0 ? 'W' : ''
  return (ns + ew) as Dir8
}

const NAMES: Record<Locale, string>[] = [
  { en: 'Ravi', kn: 'ರವಿ' },
  { en: 'Asha', kn: 'ಆಶಾ' },
  { en: 'Kiran', kn: 'ಕಿರಣ್' },
  { en: 'Meena', kn: 'ಮೀನಾ' },
  { en: 'Anil', kn: 'ಅನಿಲ್' },
  { en: 'Latha', kn: 'ಲತಾ' },
  { en: 'Suresh', kn: 'ಸುರೇಶ್' },
  { en: 'Divya', kn: 'ದಿವ್ಯಾ' },
]

interface DirDraft {
  pattern: PatternId
  prompt: Text
  rule: Text
  working: Text
  /** Answer and three wrong options, in every language. */
  answer: Text
  wrong: Text[]
  path?: [Compass4, number][]
  points?: [string, number, number][]
  link?: [string, string]
}

const dirText = (d: Dir8): Text => both((m) => m.Dirs[d])
/** "10 m north and 5 m west" of the start (or km, for towns). */
const offset = (m: GenText, dx: number, dy: number, unit: 'm' | 'km') => {
  const parts: string[] = []
  if (dy) parts.push(unit === 'm' ? (dy > 0 ? m.mNorth(dy) : m.mSouth(-dy)) : dy > 0 ? m.kmNorth(dy) : m.kmSouth(-dy))
  if (dx) parts.push(unit === 'm' ? (dx > 0 ? m.mEast(dx) : m.mWest(-dx)) : dx > 0 ? m.kmEast(dx) : m.kmWest(-dx))
  return parts.join(m.and)
}
/** Three wrong directions: the opposite, the east–west mirror image, and one more. */
function wrongDirs(rng: Rng, d: Dir8): Dir8[] {
  const mirror = (x: Dir8) => x.replace(/[EW]/, (c) => (c === 'E' ? 'W' : 'E')) as Dir8
  const pool = [turn(d, 4), mirror(d), turn(d, 2), turn(d, -2), turn(d, 1), turn(d, -1)]
  return [...new Set(shuffle(rng, pool.slice(0, 2)).concat(shuffle(rng, pool.slice(2))))].filter((x) => x !== d).slice(0, 3)
}

/** A walk of 3–4 legs, each a turn left or right from the one before. */
function makeWalk(rng: Rng): { first: Compass4; turns: boolean[]; lens: number[]; path: [Compass4, number][] } {
  const first = pick(rng, ['N', 'E', 'S', 'W'] as Compass4[])
  const legs = int(rng, 3, 4)
  const turns = Array.from({ length: legs - 1 }, () => rng() < 0.5)
  const lens = Array.from({ length: legs }, () => 5 * int(rng, 1, 8))
  const order: Compass4[] = ['N', 'E', 'S', 'W']
  let facing = first
  const path: [Compass4, number][] = [[first, lens[0]]]
  turns.forEach((right, i) => {
    facing = order[(order.indexOf(facing) + (right ? 1 : 3)) % 4]
    path.push([facing, lens[i + 1]])
  })
  return { first, turns, lens, path }
}

const walkPrompt = (name: Record<Locale, string>, w: ReturnType<typeof makeWalk>, ask: (m: GenText, n: string) => string) =>
  both((m, l) => [m.walkFirst(name[l], w.lens[0], m.dirs[w.first]), ...w.turns.map((r, i) => m.walkTurn(r, w.lens[i + 1]))].join(', ') + m.walkEnd + ' ' + ask(m, name[l]))

const endOf = (path: [Compass4, number][]) => path.reduce(([x, y], [d, n]) => [x + STEP[d][0] * n, y + STEP[d][1] * n], [0, 0])

function walkDirection(rng: Rng): DirDraft | undefined {
  const w = makeWalk(rng)
  const [dx, dy] = endOf(w.path)
  const d = dirOf(dx, dy)
  if (!d) return undefined
  const name = pick(rng, NAMES)
  return {
    pattern: 'dir-walk',
    prompt: walkPrompt(name, w, (m, n) => m.askDirFromStart(n)),
    rule: both((m) => m.walkRule),
    working: both((m) => m.endsAt(offset(m, dx, dy, 'm')) + m.soDir(m.dirs[d])),
    answer: dirText(d),
    wrong: wrongDirs(rng, d).map(dirText),
    path: w.path,
    link: ['start', 'end'],
  }
}

function walkDistance(rng: Rng): DirDraft | undefined {
  const w = makeWalk(rng)
  const [dx, dy] = endOf(w.path)
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (!Number.isInteger(dist) || dist === 0) return undefined
  const name = pick(rng, NAMES)
  const calc = dx && dy ? `√(${Math.abs(dx)}² + ${Math.abs(dy)}²) = ${dist} m` : `${dist} m`
  const total = w.lens.reduce((a, b) => a + b, 0)
  const wrong = [...new Set([Math.abs(dx) + Math.abs(dy), total, dist + 10, Math.abs(dist - 10), dist + 5])].filter((x) => x !== dist && x > 0)
  if (wrong.length < 3) return undefined
  return {
    pattern: 'dir-distance',
    prompt: walkPrompt(name, w, (m, n) => m.askDistFromStart(n)),
    rule: both((m) => m.walkRule),
    working: both((m) => m.endsAt(offset(m, dx, dy, 'm')) + m.soDist(calc)),
    answer: both(() => `${dist} m`),
    wrong: shuffle(rng, wrong.slice(0, 2)).concat(wrong.slice(2, 3)).map((x) => both(() => `${x} m`)),
    path: w.path,
    link: ['start', 'end'],
  }
}

function turns(rng: Rng): DirDraft {
  const start = pick(rng, ['N', 'E', 'S', 'W'] as Dir8[])
  const moves = Array.from({ length: int(rng, 2, 4) }, () => pick(rng, ['R', 'L', 'R', 'L', 'U']))
  const seq = moves.reduce<Dir8[]>((s, t) => [...s, turn(s[s.length - 1], t === 'R' ? 2 : t === 'L' ? -2 : 4)], [start])
  const end = seq[seq.length - 1]
  const name = pick(rng, NAMES)
  return {
    pattern: 'dir-turns',
    prompt: both((m, l) => m.facing(name[l], m.dirs[start], moves.map((t) => m.turnWord[t]).join(m.thenJoin))),
    rule: both((m) => m.turnRule),
    working: both((m) => m.turnSteps(seq.map((d) => m.Dirs[d]).join(' → '))),
    answer: dirText(end),
    // All four main directions are the options, so there is nothing to guess from.
    wrong: (['N', 'E', 'S', 'W'] as Dir8[]).filter((d) => d !== end).map(dirText),
  }
}

function rotate(rng: Rng): DirDraft {
  const k = pick(rng, [1, 2, 3, 5, 6, 7])
  const [a, c, x] = shuffle(rng, [...DIR8]).slice(0, 3) as Dir8[]
  const y = turn(x, k)
  const cw = k < 4
  const deg = (cw ? k : 8 - k) * 45
  const wrong = [turn(x, -k), turn(x, k + 1), turn(x, k - 1), turn(x, k + 4)].filter((d) => d !== y)
  return {
    pattern: 'dir-rotate',
    prompt: both((m) => m.rotateAsk(m.Dirs[a], m.Dirs[turn(a, k)], m.Dirs[c], m.Dirs[turn(c, k)], m.Dirs[x])),
    rule: both((m) => m.rotateRule(deg, cw)),
    working: both((m) => m.rotateWork(m.Dirs[x], deg, cw, m.Dirs[y])),
    answer: dirText(y),
    wrong: [...new Set(wrong)].slice(0, 3).map(dirText),
  }
}

function places(rng: Rng): DirDraft | undefined {
  const [A, B, C] = shuffle(rng, ['P', 'Q', 'R', 'S', 'T'])
  const d1 = pick(rng, ['N', 'E', 'S', 'W'] as Compass4[])
  const perpendicular = (d1 === 'N' || d1 === 'S' ? ['E', 'W'] : ['N', 'S']) as Compass4[]
  const d2 = rng() < 0.75 ? pick(rng, perpendicular) : d1
  const n1 = 2 * int(rng, 1, 6)
  const n2 = d2 === d1 ? 2 * int(rng, 1, 6) : n1
  const pB: [number, number] = [0, 0]
  const pA: [number, number] = [STEP[d1][0] * n1, STEP[d1][1] * n1]
  const pC: [number, number] = [pA[0] + STEP[d2][0] * n2, pA[1] + STEP[d2][1] * n2]
  // Ask for C from B, or B from C.
  const flip = rng() < 0.4
  const [from, to] = flip ? [C, B] : [B, C]
  const [fx, fy] = flip ? pC : pB
  const [tx, ty] = flip ? pB : pC
  const d = dirOf(tx - fx, ty - fy)
  if (!d) return undefined
  return {
    pattern: 'dir-places',
    prompt: both((m) => `${m.placeIs(A, n1, m.dirs[d1], B)} ${m.placeIs(C, n2, m.dirs[d2], A)} ${m.placeAsk(to, from)}`),
    rule: both((m) => m.placeRule),
    working: both((m) => m.placeWork(to, offset(m, tx - fx, ty - fy, 'km'), from, m.dirs[d])),
    answer: dirText(d),
    wrong: wrongDirs(rng, d).map(dirText),
    points: [
      [B, ...pB],
      [A, ...pA],
      [C, ...pC],
    ],
    link: [from, to],
  }
}

const BUILDERS: ((rng: Rng) => DirDraft | undefined)[] = [walkDirection, walkDirection, walkDistance, turns, rotate, places]

let counter = 0

export function generateDirections(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    if (!d || new Set([d.answer.en, ...d.wrong.map((w) => w.en)]).size !== 4) continue
    const order = shuffle(rng, [d.answer, ...d.wrong])
    const opts = (l: Locale) => Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j][l]])) as Record<OptionKey, string>
    return {
      id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [],
      prompt: d.prompt.en,
      options: opts('en'),
      answer: OPTION_KEYS[order.indexOf(d.answer)],
      rule: d.rule.en,
      working: d.working.en,
      pattern: d.pattern,
      generated: true,
      path: d.path,
      points: d.points,
      link: d.link,
      kn: { prompt: d.prompt.kn, rule: d.rule.kn, working: d.working.kn, options: opts('kn') },
    }
  }
}
