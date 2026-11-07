/**
 * Revision sheets for SAT textbook chapters (#/sat/<topic>/revise): key terms, formulas with an example, and
 * common mistakes. Written in our own words from the textbook pages, with the page numbers; not copied from
 * it, because the books are marked "not to be republished". tools/check_sat_revise.ts re-works every example.
 * Kannada (a draft) is in <chapter>.kn.json, keyed by id; what it leaves out, such as a formula that is only
 * maths, is the same in both languages.
 */
import squareCube from './sat/revise/math-8-01-square-and-cube.json'
import squareCubeKn from './sat/revise/math-8-01-square-and-cube.kn.json'
import powerPlay from './sat/revise/math-8-02-power-play.json'
import powerPlayKn from './sat/revise/math-8-02-power-play.kn.json'
import storyOfNumbers from './sat/revise/math-8-03-story-of-numbers.json'
import storyOfNumbersKn from './sat/revise/math-8-03-story-of-numbers.kn.json'
import quadrilaterals from './sat/revise/math-8-04-quadrilaterals.json'
import quadrilateralsKn from './sat/revise/math-8-04-quadrilaterals.kn.json'
import numberPlay8 from './sat/revise/math-8-05-number-play.json'
import numberPlay8Kn from './sat/revise/math-8-05-number-play.kn.json'
import distributeMultiply from './sat/revise/math-8-06-distribute-multiply.json'
import distributeMultiplyKn from './sat/revise/math-8-06-distribute-multiply.kn.json'
import proportional1 from './sat/revise/math-8-07-proportional-reasoning-1.json'
import proportional1Kn from './sat/revise/math-8-07-proportional-reasoning-1.kn.json'
import fractionsDisguise from './sat/revise/math-8-08-fractions-in-disguise.json'
import fractionsDisguiseKn from './sat/revise/math-8-08-fractions-in-disguise.kn.json'
import baudhayana from './sat/revise/math-8-09-baudhayana-pythagoras.json'
import baudhayanaKn from './sat/revise/math-8-09-baudhayana-pythagoras.kn.json'
import proportional2 from './sat/revise/math-8-10-proportional-reasoning-2.json'
import proportional2Kn from './sat/revise/math-8-10-proportional-reasoning-2.kn.json'
import geometricThemes from './sat/revise/math-8-11-geometric-themes.json'
import geometricThemesKn from './sat/revise/math-8-11-geometric-themes.kn.json'
import talesDots from './sat/revise/math-8-12-tales-dots-bars-lines.json'
import talesDotsKn from './sat/revise/math-8-12-tales-dots-bars-lines.kn.json'
import algebraPlay from './sat/revise/math-8-13-algebra-play.json'
import algebraPlayKn from './sat/revise/math-8-13-algebra-play.kn.json'
import area8 from './sat/revise/math-8-14-area.json'
import area8Kn from './sat/revise/math-8-14-area.kn.json'
import largeNumbers from './sat/revise/math-7-01-large-numbers.json'
import largeNumbersKn from './sat/revise/math-7-01-large-numbers.kn.json'
import arithmeticExpressions from './sat/revise/math-7-02-arithmetic-expressions.json'
import arithmeticExpressionsKn from './sat/revise/math-7-02-arithmetic-expressions.kn.json'
import peekBeyond from './sat/revise/math-7-03-peek-beyond-point.json'
import peekBeyondKn from './sat/revise/math-7-03-peek-beyond-point.kn.json'
import letterNumbers from './sat/revise/math-7-04-expressions-letter-numbers.json'
import letterNumbersKn from './sat/revise/math-7-04-expressions-letter-numbers.kn.json'
import parallelLines from './sat/revise/math-7-05-parallel-intersecting-lines.json'
import parallelLinesKn from './sat/revise/math-7-05-parallel-intersecting-lines.kn.json'
import numberPlay7 from './sat/revise/math-7-06-number-play.json'
import numberPlay7Kn from './sat/revise/math-7-06-number-play.kn.json'
import threeLines from './sat/revise/math-7-07-three-intersecting-lines.json'
import threeLinesKn from './sat/revise/math-7-07-three-intersecting-lines.kn.json'
import workingFractions from './sat/revise/math-7-08-working-with-fractions.json'
import workingFractionsKn from './sat/revise/math-7-08-working-with-fractions.kn.json'
import geometricTwins from './sat/revise/math-7-09-geometric-twins.json'
import geometricTwinsKn from './sat/revise/math-7-09-geometric-twins.kn.json'
import integers from './sat/revise/math-7-10-operations-integers.json'
import integersKn from './sat/revise/math-7-10-operations-integers.kn.json'
import commonGround from './sat/revise/math-7-11-finding-common-ground.json'
import commonGroundKn from './sat/revise/math-7-11-finding-common-ground.kn.json'
import anotherPeek from './sat/revise/math-7-12-another-peek-beyond-point.json'
import anotherPeekKn from './sat/revise/math-7-12-another-peek-beyond-point.kn.json'
import connectingDots from './sat/revise/math-7-13-connecting-the-dots.json'
import connectingDotsKn from './sat/revise/math-7-13-connecting-the-dots.kn.json'
import constructions from './sat/revise/math-7-14-constructions-and-tilings.json'
import constructionsKn from './sat/revise/math-7-14-constructions-and-tilings.kn.json'
import findingUnknown from './sat/revise/math-7-15-finding-the-unknown.json'
import findingUnknownKn from './sat/revise/math-7-15-finding-the-unknown.kn.json'
import type { SatChapter, SatTopic } from './sat'

export interface RevisionTerm {
  id: string
  term: string
  meaning: string
  /** Book pages: one page, or the first and last. */
  pages: number[]
}

export interface RevisionItem {
  id: string
  name: string
  formula: string
  example: string
  pages: number[]
}

export interface RevisionGroup {
  id: string
  title: string
  items: RevisionItem[]
}

export interface Revision {
  chapter: string
  terms: RevisionTerm[]
  groups: RevisionGroup[]
  mistakes: { id: string; text: string }[]
}

export interface RevisionKn {
  terms: Record<string, { term: string; meaning: string }>
  groups: Record<string, string>
  items: Record<string, { name: string; formula?: string; example: string }>
  mistakes: Record<string, string>
}

/** Every sheet with its Kannada; add a chapter here when its sheet is written. */
export const REVISIONS: { en: Revision; kn: RevisionKn }[] = [
  { en: squareCube, kn: squareCubeKn },
  { en: powerPlay, kn: powerPlayKn },
  { en: storyOfNumbers, kn: storyOfNumbersKn },
  { en: quadrilaterals, kn: quadrilateralsKn },
  { en: numberPlay8, kn: numberPlay8Kn },
  { en: distributeMultiply, kn: distributeMultiplyKn },
  { en: proportional1, kn: proportional1Kn },
  { en: fractionsDisguise, kn: fractionsDisguiseKn },
  { en: baudhayana, kn: baudhayanaKn },
  { en: proportional2, kn: proportional2Kn },
  { en: geometricThemes, kn: geometricThemesKn },
  { en: talesDots, kn: talesDotsKn },
  { en: algebraPlay, kn: algebraPlayKn },
  { en: area8, kn: area8Kn },
  { en: largeNumbers, kn: largeNumbersKn },
  { en: arithmeticExpressions, kn: arithmeticExpressionsKn },
  { en: peekBeyond, kn: peekBeyondKn },
  { en: letterNumbers, kn: letterNumbersKn },
  { en: parallelLines, kn: parallelLinesKn },
  { en: numberPlay7, kn: numberPlay7Kn },
  { en: threeLines, kn: threeLinesKn },
  { en: workingFractions, kn: workingFractionsKn },
  { en: geometricTwins, kn: geometricTwinsKn },
  { en: integers, kn: integersKn },
  { en: commonGround, kn: commonGroundKn },
  { en: anotherPeek, kn: anotherPeekKn },
  { en: connectingDots, kn: connectingDotsKn },
  { en: constructions, kn: constructionsKn },
  { en: findingUnknown, kn: findingUnknownKn },
]

/** A sheet in the given language; Kannada that is missing falls back to English. */
export function revisionText(r: { en: Revision; kn: RevisionKn }, lang: string): Revision {
  if (lang !== 'kn') return r.en
  const { en, kn } = r
  return {
    chapter: en.chapter,
    terms: en.terms.map((t) => ({ ...t, ...kn.terms[t.id] })),
    groups: en.groups.map((g) => ({
      ...g,
      title: kn.groups[g.id] ?? g.title,
      items: g.items.map((x) => ({ ...x, ...kn.items[x.id] })),
    })),
    mistakes: en.mistakes.map((m) => ({ id: m.id, text: kn.mistakes[m.id] ?? m.text })),
  }
}

/** The sheets for a topic's chapters, in textbook order; empty if none is written yet. */
export function topicRevisions(t: SatTopic): { chapter: SatChapter; sheet: { en: Revision; kn: RevisionKn } }[] {
  return t.chapters.flatMap((chapter) => {
    const sheet = REVISIONS.find((r) => r.en.chapter === chapter.id)
    return sheet ? [{ chapter, sheet }] : []
  })
}
