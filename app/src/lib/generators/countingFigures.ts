import { OPTION_KEYS } from '../../types'
import type { Drawing, OptionKey, PatternId, Question } from '../../types'
import type { Text } from '../i18n/gen'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/**
 * Counting of Figures (Chapter 12): a figure of straight lines, and how many triangles, squares,
 * rectangles or parallelograms it holds. The figures are the chapter's standard ones: a triangle
 * with lines from its top (and lines across), a triangle cut into small triangles, and grids of
 * squares, rectangles or parallelograms. The answers come from the chapter's counting rules; the
 * test counts the drawn lines by brute force instead.
 */

type Seg = [number, number, number, number]
type Kind = 'triangles' | 'squares' | 'rectangles' | 'parallelograms'

interface Made {
  kind: Kind
  lines: Seg[]
  w?: number
  answer: number
  near: number[]
  rule: Text
  working: Text
}

const PROMPT: Record<Kind, Text> = {
  triangles: { en: 'How many triangles are there in the given figure?', kn: 'ಈ ಆಕೃತಿಯಲ್ಲಿರುವ ಒಟ್ಟು ತ್ರಿಭುಜಗಳೆಷ್ಟು?' },
  squares: { en: 'How many squares are there in the given figure?', kn: 'ಈ ಆಕೃತಿಯಲ್ಲಿರುವ ಒಟ್ಟು ವರ್ಗಗಳೆಷ್ಟು?' },
  rectangles: { en: 'How many rectangles are there in the given figure?', kn: 'ಈ ಆಕೃತಿಯಲ್ಲಿರುವ ಒಟ್ಟು ಆಯತಗಳೆಷ್ಟು?' },
  parallelograms: { en: 'How many parallelograms are there in the given figure?', kn: 'ಈ ಆಕೃತಿಯಲ್ಲಿರುವ ಒಟ್ಟು ಸಮಾನಾಂತರ ಚತುರ್ಭುಜಗಳೆಷ್ಟು?' },
}
const PATTERN: Record<Kind, PatternId> = {
  triangles: 'count-triangles',
  squares: 'count-squares',
  rectangles: 'count-rectangles',
  parallelograms: 'count-parallelograms',
}

const tri = (n: number) => (n * (n + 1)) / 2
const upTo = (n: number) => Array.from({ length: n }, (_, i) => i + 1).join(' + ')
const r2 = (v: number) => Math.round(v * 100) / 100

/** A triangle with `c` lines from its top to the base and `h` lines across it. */
function makeFan(rng: Rng): Made {
  const c = int(rng, 1, 4)
  const h = pick(rng, [0, 0, 1, 1, 2])
  const n = c + 1
  const top: [number, number] = [50, 6]
  const baseY = 94
  const sideX = (y: number, s: -1 | 1) => 50 + s * 44 * ((y - top[1]) / (baseY - top[1]))
  const lines: Seg[] = [
    [top[0], top[1], sideX(baseY, -1), baseY],
    [top[0], top[1], sideX(baseY, 1), baseY],
    [sideX(baseY, -1), baseY, sideX(baseY, 1), baseY],
  ]
  for (let i = 1; i < n; i++) lines.push([top[0], top[1], r2(6 + (88 * i) / n), baseY])
  const across = h === 1 ? [0.55] : h === 2 ? [0.4, 0.7] : []
  for (const t of across) {
    const y = top[1] + t * (baseY - top[1])
    lines.push([sideX(y, -1), y, sideX(y, 1), y])
  }
  const each = tri(n)
  const answer = each * (h + 1)
  const rule: Text =
    h === 0
      ? {
          en: `Every triangle has the top corner and part of the base for its bottom side. The lines from the top cut the base into ${n} parts, and any run of parts next to each other makes a triangle: ${upTo(n)}.`,
          kn: `ಪ್ರತಿ ತ್ರಿಭುಜಕ್ಕೂ ಮೇಲಿನ ಶೃಂಗವಿದೆ, ಮತ್ತು ಪಾದದ ಒಂದು ಭಾಗವೇ ಅದರ ಕೆಳಗಿನ ಬಾಹು. ಮೇಲಿನಿಂದ ಬರುವ ರೇಖೆಗಳು ಪಾದವನ್ನು ${n} ಭಾಗಗಳಾಗಿ ಕತ್ತರಿಸುತ್ತವೆ; ಪಕ್ಕಪಕ್ಕದ ಭಾಗಗಳ ಪ್ರತಿ ಗುಂಪೂ ಒಂದು ತ್ರಿಭುಜ: ${upTo(n)}.`,
        }
      : {
          en: `Every triangle has the top corner, and its bottom side lies on the base or on a line across. Each of these ${h + 1} lines is cut into ${n} parts, and any run of parts next to each other makes a triangle: ${upTo(n)} on each line.`,
          kn: `ಪ್ರತಿ ತ್ರಿಭುಜಕ್ಕೂ ಮೇಲಿನ ಶೃಂಗವಿದೆ, ಮತ್ತು ಅದರ ಕೆಳಗಿನ ಬಾಹು ಪಾದದ ಮೇಲೆ ಅಥವಾ ಒಂದು ಅಡ್ಡ ರೇಖೆಯ ಮೇಲೆ ಇರುತ್ತದೆ. ಈ ${h + 1} ರೇಖೆಗಳಲ್ಲಿ ಪ್ರತಿಯೊಂದೂ ${n} ಭಾಗಗಳಾಗಿ ಕತ್ತರಿಸಲ್ಪಟ್ಟಿದೆ; ಪಕ್ಕಪಕ್ಕದ ಭಾಗಗಳ ಪ್ರತಿ ಗುಂಪೂ ಒಂದು ತ್ರಿಭುಜ: ಪ್ರತಿ ರೇಖೆಯಲ್ಲಿ ${upTo(n)}.`,
        }
  const sum = `${upTo(n)} = ${each}`
  const working: Text =
    h === 0 ? { en: sum, kn: sum } : { en: `(${sum}) × ${h + 1} lines = ${answer}`, kn: `(${sum}) × ${h + 1} ರೇಖೆಗಳು = ${answer}` }
  const near = [each, n * (h + 1), each * (h + 2), answer + n, answer - 1, tri(n + 1) * (h + 1), n * (h + 1) + h, answer + h + 1]
  return { kind: 'triangles', lines, answer, near, rule, working }
}

/** A triangle cut into small triangles, n along each side. */
function makeTriGrid(rng: Rng): Made {
  const n = int(rng, 2, 5)
  const X = (x: number) => r2(50 + (x * 48) / n)
  const Y = (y: number) => r2(8 + (y * 84) / n)
  const lines: Seg[] = []
  for (let k = 1; k <= n; k++) lines.push([X(-k), Y(k), X(k), Y(k)])
  for (let j = 0; j < n; j++) lines.push([X(-j), Y(j), X(n - 2 * j), Y(n)], [X(j), Y(j), X(2 * j - n), Y(n)])
  const sizes: { up: number; down: number }[] = []
  for (let k = 1; k <= n; k++) sizes.push({ up: tri(n - k + 1), down: n - 2 * k + 1 > 0 ? tri(n - 2 * k + 1) : 0 })
  const answer = sizes.reduce((t, s) => t + s.up + s.down, 0)
  const parts = sizes.map((s) => (s.down ? `${s.up} + ${s.down}` : `${s.up}`))
  const en = sizes.map((s, i) => `size ${i + 1}: ${s.down ? `${s.up} up + ${s.down} down` : `${s.up}`}`).join('; ')
  const kn = sizes.map((s, i) => `ಅಳತೆ ${i + 1}: ${s.down ? `${s.up} ಮೇಲ್ಮುಖ + ${s.down} ಕೆಳಮುಖ` : `${s.up}`}`).join('; ')
  const total = `${parts.join(' + ')} = ${answer}`
  const up = sizes.reduce((t, s) => t + s.up, 0)
  return {
    kind: 'triangles',
    lines,
    answer,
    near: [n * n, up, answer - 1, answer + 1, answer + n, n * n + tri(n - 1), answer - sizes[0].down, 3 * n * n],
    rule: {
      en: `The big triangle has ${n} small triangles along each side. Count by size, the ones pointing up and the ones pointing down.`,
      kn: `ದೊಡ್ಡ ತ್ರಿಭುಜದ ಪ್ರತಿ ಬಾಹುವಿನ ಉದ್ದಕ್ಕೂ ${n} ಚಿಕ್ಕ ತ್ರಿಭುಜಗಳಿವೆ. ಅಳತೆಯ ಪ್ರಕಾರ ಎಣಿಸಿ: ಮೇಲ್ಮುಖವಾಗಿರುವವು ಮತ್ತು ಕೆಳಮುಖವಾಗಿರುವವು.`,
    },
    working: { en: `${en}; ${total}`, kn: `${kn}; ${total}` },
  }
}

/** a × b boxes (square), leaning by `shear` per row for parallelograms. */
function gridLines(a: number, b: number, shear: boolean): { lines: Seg[]; w: number } {
  const s = Math.floor(76 / Math.max(a, b + (shear ? 1 : 0)))
  const sh = shear ? Math.round(s / 2) : 0
  const x0 = 10
  const y0 = Math.round((100 - b * s) / 2)
  const lines: Seg[] = []
  for (let j = 0; j <= b; j++) lines.push([x0 + sh * j, y0 + s * j, x0 + sh * j + a * s, y0 + s * j])
  for (let i = 0; i <= a; i++) lines.push([x0 + i * s, y0, x0 + i * s + sh * b, y0 + b * s])
  return { lines, w: a * s + sh * b + 2 * x0 }
}

/** Squares in a grid of a × b square boxes. */
function makeSquares(rng: Rng): Made {
  const a = int(rng, 2, 5)
  const b = rng() < 0.5 ? a : int(rng, 1, 4)
  const { lines, w } = gridLines(a, b, false)
  const m = Math.min(a, b)
  const terms = Array.from({ length: m }, (_, i) => (a - i) * (b - i))
  const answer = terms.reduce((t, v) => t + v, 0)
  const sq = a === b
  const rule: Text = sq
    ? {
        en: `In a ${a} × ${a} grid there are ${a * a} small squares, then ${(a - 1) ** 2} squares of 2 × 2, and so on up to 1 square of ${a} × ${a}.`,
        kn: `${a} × ${a} ಜಾಲದಲ್ಲಿ ${a * a} ಚಿಕ್ಕ ವರ್ಗಗಳು, ನಂತರ 2 × 2 ಅಳತೆಯ ${(a - 1) ** 2} ವರ್ಗಗಳು, ಹೀಗೆ ${a} × ${a} ಅಳತೆಯ 1 ವರ್ಗದವರೆಗೆ.`,
      }
    : {
        en: `Count by size. In a grid ${a} boxes wide and ${b} high, a square of k × k boxes fits in (${a} − k + 1) × (${b} − k + 1) places.`,
        kn: `ಅಳತೆಯ ಪ್ರಕಾರ ಎಣಿಸಿ. ${a} ಚೌಕಗಳ ಅಗಲ ಮತ್ತು ${b} ಚೌಕಗಳ ಎತ್ತರದ ಜಾಲದಲ್ಲಿ k × k ಅಳತೆಯ ವರ್ಗ (${a} − k + 1) × (${b} − k + 1) ಸ್ಥಳಗಳಲ್ಲಿ ಹಿಡಿಸುತ್ತದೆ.`,
      }
  const sum = sq
    ? `${Array.from({ length: a }, (_, i) => `${i + 1}²`).join(' + ')} = ${[...terms].reverse().join(' + ')} = ${answer}`
    : `${terms.map((_, i) => `${a - i} × ${b - i}`).join(' + ')} = ${terms.join(' + ')} = ${answer}`
  const near = [a * b, answer - 1, answer + 1, answer + a, tri(a) * tri(b), terms[0] + (terms[1] ?? 0) * 2, answer + b + 1, 2 * a * b]
  return { kind: 'squares', lines, w, answer, near, rule, working: { en: sum, kn: sum } }
}

/** Rectangles (or parallelograms) in a grid of a × b boxes. */
function makeBoxes(rng: Rng, lean: boolean): Made {
  let a = int(rng, 1, 5)
  let b = int(rng, 1, lean ? 3 : 4)
  if (a * b < 2) a = 2
  if (lean && a === 1) {
    a = b
    b = 1
  }
  const { lines, w } = gridLines(a, b, lean)
  const answer = tri(a) * tri(b)
  const name: Text = lean ? { en: 'parallelogram', kn: 'ಸಮಾನಾಂತರ ಚತುರ್ಭುಜ' } : { en: 'rectangle', kn: 'ಆಯತ' }
  const rule: Text = {
    en: `A ${name.en} is fixed by choosing 2 of the ${a + 1} lines one way and 2 of the ${b + 1} lines the other way. With ${a} boxes in a row there are ${upTo(a)} ways, and with ${b} rows ${upTo(b)} ways.`,
    kn: `ಒಂದು ದಿಕ್ಕಿನ ${a + 1} ರೇಖೆಗಳಲ್ಲಿ 2 ಮತ್ತು ಇನ್ನೊಂದು ದಿಕ್ಕಿನ ${b + 1} ರೇಖೆಗಳಲ್ಲಿ 2 ಆರಿಸಿದರೆ ಒಂದು ${name.kn} ಸಿಗುತ್ತದೆ. ಒಂದು ಸಾಲಿನಲ್ಲಿ ${a} ಚೌಕಗಳಿದ್ದರೆ ${upTo(a)} ರೀತಿಗಳು, ${b} ಸಾಲುಗಳಿದ್ದರೆ ${upTo(b)} ರೀತಿಗಳು.`,
  }
  const sum = `(${upTo(a)}) × (${upTo(b)}) = ${tri(a)} × ${tri(b)} = ${answer}`
  const near = [a * b, (a + 1) * (b + 1), tri(a) + tri(b), tri(a + 1) * tri(b), tri(a) * tri(b + 1), answer - 1, answer + a * b, tri(a * b)]
  return { kind: lean ? 'parallelograms' : 'rectangles', lines, w, answer, near, rule, working: { en: sum, kn: sum } }
}

let counter = 0

/** A generated question. */
export function buildCountingFigures(rng: Rng): Question {
  const r = rng()
  const m = r < 0.3 ? makeFan(rng) : r < 0.45 ? makeTriGrid(rng) : r < 0.65 ? makeSquares(rng) : r < 0.85 ? makeBoxes(rng, false) : makeBoxes(rng, true)
  const wrong = new Set<number>()
  for (const v of shuffle(rng, m.near)) if (v > 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  for (let d = 1; wrong.size < 3; d++) for (const v of [m.answer + d * 2, m.answer - d]) if (v > 0 && v !== m.answer && wrong.size < 3) wrong.add(v)
  const opts = shuffle(rng, [m.answer, ...wrong])
  const options = Object.fromEntries(OPTION_KEYS.map((k, i) => [k, String(opts[i])])) as Record<OptionKey, string>
  const figure: Drawing = { items: [], lines: m.lines, ...(m.w ? { w: m.w } : {}) }
  const prompt = PROMPT[m.kind]
  return {
    id: `gen-count-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
    terms: [],
    layout: 'text',
    prompt: prompt.en,
    figures: { terms: [figure] },
    options,
    answer: OPTION_KEYS[opts.indexOf(m.answer)],
    rule: m.rule.en,
    working: m.working.en,
    pattern: PATTERN[m.kind],
    generated: true,
    kn: { prompt: prompt.kn, rule: m.rule.kn, working: m.working.kn },
  }
}

export function generateCountingFigures(rng: Rng = Math.random): Question {
  return buildCountingFigures(rng)
}
