import { revisionText } from '../data/satRevise'
import type { Revision, RevisionKn } from '../data/satRevise'

/** One side of a flash card's words, in one language. */
export interface FlashText {
  front: string
  back: string
  example?: string
}

export interface FlashCard {
  /** Stable across visits: progress is saved under it. */
  id: string
  pages: number[]
  /** The words in the shown language. */
  text: FlashText
  /** The same card in the other language, when both are shown. */
  other?: FlashText
}

type Sheet = { en: Revision; kn: RevisionKn }

/** A sheet's cards in one language: each key term, then each formula or rule (common mistakes aren't cards). */
function sides(r: Revision): { id: string; pages: number[]; text: FlashText }[] {
  return [
    ...r.terms.map((t) => ({ id: `${r.chapter}/term:${t.id}`, pages: t.pages, text: { front: t.term, back: t.meaning } })),
    ...r.groups.flatMap((g) => g.items.map((x) => ({ id: `${r.chapter}/item:${x.id}`, pages: x.pages, text: { front: x.name, back: x.formula, example: x.example } }))),
  ]
}

/** The cards for a revision sheet, so the sheet and its cards can never disagree. */
export function flashCards(sheet: Sheet, lang: string, otherLang?: string): FlashCard[] {
  const others = otherLang ? sides(revisionText(sheet, otherLang)) : undefined
  return sides(revisionText(sheet, lang)).map((c, i) => ({ ...c, other: others?.[i].text }))
}

/**
 * The order to go through the cards: those missed last time first, then new ones, then those known last
 * time; in sheet order within each. `known` holds the last result by card id.
 */
export function flashOrder(ids: string[], known: Record<string, boolean>): string[] {
  const rank = (id: string) => (known[id] === false ? 0 : known[id] === undefined ? 1 : 2)
  return [...ids].sort((a, b) => rank(a) - rank(b))
}
