import aoLevels from '../data/levels/arithmetical-operations.json'
import ssLevels from '../data/levels/signs-symbols.json'
import lmLevels from '../data/levels/letter-matrix.json'
import lvLevels from '../data/levels/letter-values.json'
import pyLevels from '../data/levels/pyramid.json'
import fnLevels from '../data/levels/figure-numbers.json'
import ageLevels from '../data/levels/age-problems.json'
import matrixLevels from '../data/levels/number-matrix.json'
import type { Question } from '../types'

/**
 * How hard each question is, 1 (easy) to 4 (hardest). A chapter that has levels keeps them in
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
