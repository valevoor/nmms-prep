import aoLevels from '../data/levels/arithmetical-operations.json'
import ssLevels from '../data/levels/signs-symbols.json'
import lmLevels from '../data/levels/letter-matrix.json'
import lvLevels from '../data/levels/letter-values.json'
import pyLevels from '../data/levels/pyramid.json'
import fnLevels from '../data/levels/figure-numbers.json'
import ageLevels from '../data/levels/age-problems.json'
import matrixLevels from '../data/levels/number-matrix.json'
import numberSeriesLevels from '../data/levels/number-series.json'
import numberAnalogyLevels from '../data/levels/number-analogy.json'
import numberSequenceLevels from '../data/levels/number-sequence.json'
import wrongNumberLevels from '../data/levels/wrong-number.json'
import oddOneNumbersLevels from '../data/levels/odd-one-numbers.json'
import letterSeriesLevels from '../data/levels/letter-series.json'
import oddOneLettersLevels from '../data/levels/odd-one-letters.json'
import letterNumberAnalogyLevels from '../data/levels/letter-number-analogy.json'
import numberPatternsLevels from '../data/levels/number-patterns.json'
import codingDecodingLevels from '../data/levels/coding-decoding.json'
import directionsLevels from '../data/levels/directions.json'
import bloodRelationsLevels from '../data/levels/blood-relations.json'
import calendarLevels from '../data/levels/calendar.json'
import clockLevels from '../data/levels/clock.json'
import vennDiagramsLevels from '../data/levels/venn-diagrams.json'
import arrangementLevels from '../data/levels/arrangement.json'
import statementsDecisionsLevels from '../data/levels/statements-decisions.json'
import cubesColouringLevels from '../data/levels/cubes-colouring.json'
import cubesCuttingLevels from '../data/levels/cubes-cutting.json'
import diceLevels from '../data/levels/dice.json'
import countingFiguresLevels from '../data/levels/counting-figures.json'
import analogyOfFiguresLevels from '../data/levels/analogy-of-figures.json'
import figureSeriesLevels from '../data/levels/figure-series.json'
import hiddenFiguresLevels from '../data/levels/hidden-figures.json'
import similarFiguresLevels from '../data/levels/similar-figures.json'
import superimposeFiguresLevels from '../data/levels/superimpose-figures.json'
import missingFiguresLevels from '../data/levels/missing-figures.json'
import mirrorImageLevels from '../data/levels/mirror-image.json'
import waterImageLevels from '../data/levels/water-image.json'
import intersectingFiguresLevels from '../data/levels/intersecting-figures.json'
import foldSheetLevels from '../data/levels/fold-sheet.json'
import paperPunchLevels from '../data/levels/paper-punch.json'
import miscellaneousLevels from '../data/levels/miscellaneous.json'
import type { Question } from '../types'

/**
 * How hard each question is, 1 (easy) to 4 (hardest). Every chapter keeps them in
 * data/levels/<topic>.json, by question id, for its book questions and the past-paper questions filed
 * under it. Practice and Classroom ask them easiest first, and show the level as a chip.
 */
export const LEVEL_FILES: { topic: string; levels: Record<string, number> }[] = [
  { topic: matrixLevels.topic, levels: matrixLevels.levels },
  { topic: ageLevels.topic, levels: ageLevels.levels },
  { topic: aoLevels.topic, levels: aoLevels.levels },
  { topic: ssLevels.topic, levels: ssLevels.levels },
  { topic: lmLevels.topic, levels: lmLevels.levels },
  { topic: lvLevels.topic, levels: lvLevels.levels },
  { topic: pyLevels.topic, levels: pyLevels.levels },
  { topic: fnLevels.topic, levels: fnLevels.levels },
  { topic: numberSeriesLevels.topic, levels: numberSeriesLevels.levels },
  { topic: numberAnalogyLevels.topic, levels: numberAnalogyLevels.levels },
  { topic: numberSequenceLevels.topic, levels: numberSequenceLevels.levels },
  { topic: wrongNumberLevels.topic, levels: wrongNumberLevels.levels },
  { topic: oddOneNumbersLevels.topic, levels: oddOneNumbersLevels.levels },
  { topic: letterSeriesLevels.topic, levels: letterSeriesLevels.levels },
  { topic: oddOneLettersLevels.topic, levels: oddOneLettersLevels.levels },
  { topic: letterNumberAnalogyLevels.topic, levels: letterNumberAnalogyLevels.levels },
  { topic: numberPatternsLevels.topic, levels: numberPatternsLevels.levels },
  { topic: codingDecodingLevels.topic, levels: codingDecodingLevels.levels },
  { topic: directionsLevels.topic, levels: directionsLevels.levels },
  { topic: bloodRelationsLevels.topic, levels: bloodRelationsLevels.levels },
  { topic: calendarLevels.topic, levels: calendarLevels.levels },
  { topic: clockLevels.topic, levels: clockLevels.levels },
  { topic: vennDiagramsLevels.topic, levels: vennDiagramsLevels.levels },
  { topic: arrangementLevels.topic, levels: arrangementLevels.levels },
  { topic: statementsDecisionsLevels.topic, levels: statementsDecisionsLevels.levels },
  { topic: cubesColouringLevels.topic, levels: cubesColouringLevels.levels },
  { topic: cubesCuttingLevels.topic, levels: cubesCuttingLevels.levels },
  { topic: diceLevels.topic, levels: diceLevels.levels },
  { topic: countingFiguresLevels.topic, levels: countingFiguresLevels.levels },
  { topic: analogyOfFiguresLevels.topic, levels: analogyOfFiguresLevels.levels },
  { topic: figureSeriesLevels.topic, levels: figureSeriesLevels.levels },
  { topic: hiddenFiguresLevels.topic, levels: hiddenFiguresLevels.levels },
  { topic: similarFiguresLevels.topic, levels: similarFiguresLevels.levels },
  { topic: superimposeFiguresLevels.topic, levels: superimposeFiguresLevels.levels },
  { topic: missingFiguresLevels.topic, levels: missingFiguresLevels.levels },
  { topic: mirrorImageLevels.topic, levels: mirrorImageLevels.levels },
  { topic: waterImageLevels.topic, levels: waterImageLevels.levels },
  { topic: intersectingFiguresLevels.topic, levels: intersectingFiguresLevels.levels },
  { topic: foldSheetLevels.topic, levels: foldSheetLevels.levels },
  { topic: paperPunchLevels.topic, levels: paperPunchLevels.levels },
  { topic: miscellaneousLevels.topic, levels: miscellaneousLevels.levels },
]

export const MAX_LEVEL = 4

const LEVELS: Record<string, number> = Object.assign({}, ...LEVEL_FILES.map((f) => f.levels))

/** A question's level, or undefined if its chapter has none. */
export const levelOf = (q: Question): number | undefined => LEVELS[q.id]

/** Easiest first. Questions of the same level (or with none) keep their order. */
export function byLevel<T extends Question>(qs: T[]): T[] {
  if (!qs.some((q) => LEVELS[q.id])) return qs
  return qs
    .map((q, i) => ({ q, i, l: LEVELS[q.id] ?? MAX_LEVEL + 1 }))
    .sort((a, b) => a.l - b.l || a.i - b.i)
    .map((x) => x.q)
}
