import { describe, expect, it } from 'vitest'
import type { Question } from '../../types'
import { generateBloodRelation } from '../generators/bloodRelations'
import { generateCalendar } from '../generators/calendar'
import { generateClock } from '../generators/clock'
import { generateCoding } from '../generators/coding'
import { generateDirections } from '../generators/directions'
import { generateRuleQuestion, generateWrongNumber } from '../generators/games'
import { generateLetterSeries, LETTER_PATTERNS } from '../generators/letterSeries'
import { generateAnalogyRuleQuestion, generateNumberAnalogy } from '../generators/numberAnalogy'
import { generateOddOne } from '../generators/oddOne'
import { GENERATOR_PATTERNS, generateNumberSeries, mulberry32 } from '../generators/numberSeries'
import { GEN } from './gen'

const KANNADA = /[ಀ-೿]/
/**
 * English words, which always have lowercase letters. Not maths ("n² + n", "×2") and not puzzle
 * terms in capitals ("JPZ", "NMMN"), which stay as they are in every language.
 */
// Unit abbreviations (km, cm) and am/pm stay the same in Kannada.
const WORDS = /\b(?!(?:km|cm|am|pm)\b)[a-z]{2,}/

/** Every sentence with English words must have a Kannada version written in Kannada script. */
function expectKannada(q: Question) {
  const ctx = JSON.stringify({ rule: q.rule, kn: q.kn })
  expect(q.kn, ctx).toBeDefined()
  for (const field of ['rule', 'working', 'prompt'] as const) {
    if (field === 'prompt' && !q.prompt) continue
    const kn = q.kn![field]
    expect(kn, `${field} ${ctx}`).toBeTruthy()
    if (WORDS.test(q[field] ?? '')) expect(kn, `${field} ${ctx}`).toMatch(KANNADA)
    expect(kn, `${field} ${ctx}`).not.toMatch(WORDS)
  }
}

describe('generated questions carry Kannada', () => {
  it.each(GENERATOR_PATTERNS)('number series: %s', (p) => {
    const rng = mulberry32(p.length * 7)
    for (let n = 0; n < 1000; n++) expectKannada(generateNumberSeries(rng, p))
  })

  it.each(LETTER_PATTERNS)('letter series: %s', (p) => {
    const rng = mulberry32(p.length * 11)
    for (let n = 0; n < 1000; n++) expectKannada(generateLetterSeries(rng, p))
  })

  it('number analogy', () => {
    const rng = mulberry32(14)
    for (let n = 0; n < 1000; n++) expectKannada(generateNumberAnalogy(rng))
  })

  it('coding–decoding', () => {
    const rng = mulberry32(23)
    for (let n = 0; n < 1000; n++) expectKannada(generateCoding(rng))
  })

  it('clock', () => {
    const rng = mulberry32(35)
    for (let n = 0; n < 1000; n++) expectKannada(generateClock(rng))
  })

  it('calendar', () => {
    const rng = mulberry32(34)
    for (let n = 0; n < 1000; n++) expectKannada(generateCalendar(rng))
  })

  it('blood relations', () => {
    const rng = mulberry32(32)
    for (let n = 0; n < 1000; n++) expectKannada(generateBloodRelation(rng))
  })

  it('directions', () => {
    const rng = mulberry32(31)
    for (let n = 0; n < 1000; n++) expectKannada(generateDirections(rng))
  })

  it('odd one out', () => {
    const rng = mulberry32(18)
    for (let n = 0; n < 1000; n++) expectKannada(generateOddOne(rng))
  })

  it('wrong number', () => {
    const rng = mulberry32(19)
    for (let n = 0; n < 1000; n++) expectKannada(generateWrongNumber(rng))
  })

  it.each([
    ['series', generateRuleQuestion],
    ['analogy', generateAnalogyRuleQuestion],
  ])('guess the rule (%s): 4 distinct Kannada options', (_, make) => {
    const rng = mulberry32(3)
    for (let n = 0; n < 1000; n++) {
      const q = make(rng)
      expectKannada(q)
      const opts = Object.values(q.kn!.options!)
      expect(new Set(opts).size).toBe(4)
      opts.forEach((o) => expect(o).toMatch(KANNADA))
    }
  })

  it('every pattern label is translated', () => {
    for (const [p, label] of Object.entries(GEN.kn.patterns)) {
      expect(label, p).toMatch(KANNADA)
      expect(label, p).not.toBe(GEN.en.patterns[p as keyof typeof GEN.en.patterns])
    }
  })
})
