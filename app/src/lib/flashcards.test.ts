import { describe, expect, it } from 'vitest'
import { REVISIONS } from '../data/satRevise'
import { flashCards, flashOrder } from './flashcards'

describe('flash cards', () => {
  for (const sheet of REVISIONS) {
    const items = sheet.en.groups.flatMap((g) => g.items)

    it(`${sheet.en.chapter}: one card for each term and formula, with unique ids and fronts`, () => {
      const cards = flashCards(sheet, 'en')
      expect(cards).toHaveLength(sheet.en.terms.length + items.length)
      expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length)
      expect(new Set(cards.map((c) => c.text.front)).size).toBe(cards.length)
      const kn = flashCards(sheet, 'kn')
      expect(new Set(kn.map((c) => c.text.front)).size).toBe(kn.length)
    })

    it(`${sheet.en.chapter}: the same card ids in each language, and both sides when both are shown`, () => {
      const en = flashCards(sheet, 'en', 'kn')
      const kn = flashCards(sheet, 'kn', 'en')
      expect(kn.map((c) => c.id)).toEqual(en.map((c) => c.id))
      expect(en[0].other).toEqual(kn[0].text)
      expect(flashCards(sheet, 'en')[0].other).toBeUndefined()
    })
  }

  it('puts missed cards first, then new ones, then known ones, each in sheet order', () => {
    const known = { b: true, d: false, e: true, f: false }
    expect(flashOrder(['a', 'b', 'c', 'd', 'e', 'f'], known)).toEqual(['d', 'f', 'a', 'c', 'b', 'e'])
  })

  it('keeps sheet order when nothing is saved', () => {
    expect(flashOrder(['a', 'b', 'c'], {})).toEqual(['a', 'b', 'c'])
  })
})
