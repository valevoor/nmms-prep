import type { Dict } from '../lib/i18n'
import type { Question, TopicMeta } from '../types'
import numberSequence from './mat/number-sequence.json'
import numberSequenceMeta from './mat/number-sequence.meta.json'
import numberSeries from './mat/number-series.json'
import numberSeriesMeta from './mat/number-series.meta.json'
import numberAnalogy from './mat/number-analogy.json'
import numberAnalogyMeta from './mat/number-analogy.meta.json'
import letterSeries from './mat/letter-series.json'
import letterSeriesMeta from './mat/letter-series.meta.json'
import figAnalogy from './mat/analogy-of-figures.json'
import figAnalogyMeta from './mat/analogy-of-figures.meta.json'
import figSeries from './mat/figure-series.json'
import figSeriesMeta from './mat/figure-series.meta.json'
import hidden from './mat/hidden-figures.json'
import hiddenMeta from './mat/hidden-figures.meta.json'
import similar from './mat/similar-figures.json'
import similarMeta from './mat/similar-figures.meta.json'
import arithmetic from './mat/arithmetical-operations.json'
import arithmeticMeta from './mat/arithmetical-operations.meta.json'
import blood from './mat/blood-relations.json'
import signs from './mat/signs-symbols.json'
import matrix from './mat/number-matrix.json'
import matrixMeta from './mat/number-matrix.meta.json'
import letterMatrix from './mat/letter-matrix.json'
import letterMatrixMeta from './mat/letter-matrix.meta.json'
import letterValues from './mat/letter-values.json'
import letterValuesMeta from './mat/letter-values.meta.json'
import pyramid from './mat/pyramid.json'
import pyramidMeta from './mat/pyramid.meta.json'
import vennDiagrams from './mat/venn-diagrams.json'
import vennDiagramsMeta from './mat/venn-diagrams.meta.json'
import arrangement from './mat/arrangement.json'
import arrangementMeta from './mat/arrangement.meta.json'
import signsMeta from './mat/signs-symbols.meta.json'
import intersecting from './mat/intersecting-figures.json'
import intersectingMeta from './mat/intersecting-figures.meta.json'
import foldSheet from './mat/fold-sheet.json'
import foldSheetMeta from './mat/fold-sheet.meta.json'
import paperPunch from './mat/paper-punch.json'
import paperPunchMeta from './mat/paper-punch.meta.json'
import mirror from './mat/mirror-image.json'
import mirrorMeta from './mat/mirror-image.meta.json'
import water from './mat/water-image.json'
import waterMeta from './mat/water-image.meta.json'
import cubes from './mat/cubes-cutting.json'
import cubesMeta from './mat/cubes-cutting.meta.json'
import dice from './mat/dice.json'
import diceMeta from './mat/dice.meta.json'
import counting from './mat/counting-figures.json'
import countingMeta from './mat/counting-figures.meta.json'
import colouring from './mat/cubes-colouring.json'
import colouringMeta from './mat/cubes-colouring.meta.json'
import figNum from './mat/figure-numbers.json'
import figNumMeta from './mat/figure-numbers.meta.json'
import bloodMeta from './mat/blood-relations.meta.json'
import letterNumber from './mat/letter-number-analogy.json'
import letterNumberMeta from './mat/letter-number-analogy.meta.json'
import numberPatterns from './mat/number-patterns.json'
import numberPatternsMeta from './mat/number-patterns.meta.json'
import calendar from './mat/calendar.json'
import calendarMeta from './mat/calendar.meta.json'
import clock from './mat/clock.json'
import clockMeta from './mat/clock.meta.json'
import coding from './mat/coding-decoding.json'
import directions from './mat/directions.json'
import directionsMeta from './mat/directions.meta.json'
import codingMeta from './mat/coding-decoding.meta.json'
import oddLetters from './mat/odd-one-letters.json'
import oddLettersMeta from './mat/odd-one-letters.meta.json'
import oddOne from './mat/odd-one-numbers.json'
import oddOneMeta from './mat/odd-one-numbers.meta.json'
import wrongNumber from './mat/wrong-number.json'
import wrongNumberMeta from './mat/wrong-number.meta.json'
import { generateArithmetic } from '../lib/generators/arithmetic'
import { generateBloodRelation } from '../lib/generators/bloodRelations'
import { generateCalendar } from '../lib/generators/calendar'
import { generateClock } from '../lib/generators/clock'
import { generateFigureAnalogy, generateFigureRuleQuestion, generateFigureSeries } from '../lib/generators/figures'
import { generateHiddenFigure } from '../lib/generators/hiddenFigures'
import { generateSimilarFigure } from '../lib/generators/similarFigures'
import { generateCoding } from '../lib/generators/coding'
import { generateDirections } from '../lib/generators/directions'
import { generateNumberPatterns } from '../lib/generators/numberPatterns'
import { generateLetterNumber } from '../lib/generators/letterNumber'
import { generateLetterSeries } from '../lib/generators/letterSeries'
import { generateOddLetters } from '../lib/generators/oddLetters'
import { generateOddOne } from '../lib/generators/oddOne'
import { generateAnalogyRuleQuestion, generateNumberAnalogy } from '../lib/generators/numberAnalogy'
import { generateNumberSeries } from '../lib/generators/numberSeries'
import { generateSequence } from '../lib/generators/sequence'
import { generateSigns } from '../lib/generators/signs'
import { generateNumberMatrix } from '../lib/generators/numberMatrix'
import { generateLetterMatrix } from '../lib/generators/letterMatrix'
import { generateLetterValues } from '../lib/generators/letterValues'
import { generatePyramid } from '../lib/generators/pyramid'
import { generateVennDiagram } from '../lib/generators/vennDiagrams'
import { generateArrangement } from '../lib/generators/arrangement'
import { generateIntersecting } from '../lib/generators/venn'
import { generateFoldSheet } from '../lib/generators/foldSheet'
import { generatePaperPunch } from '../lib/generators/paperPunch'
import { generateMirrorImage } from '../lib/generators/mirrorImage'
import { generateWaterImage } from '../lib/generators/waterImage'
import { generateCubesCutting } from '../lib/generators/cubesCutting'
import { generateDice } from '../lib/generators/dice'
import { generateCountingFigures } from '../lib/generators/countingFigures'
import { generateCubesColouring } from '../lib/generators/cubesColouring'
import { generateFigureNumbers } from '../lib/generators/figureNumbers'
import { generateRuleQuestion, generateWrongNumber } from '../lib/generators/games'

export interface ReadyTopic {
  id: string
  chapter: number
  name: string
  questions: Question[]
  meta: TopicMeta
  /** What the student looks for in each question; changes the "Find the missing …" prompt. */
  missing?: 'number' | 'letters' | 'wrong' | 'odd' | 'code' | 'direction' | 'relation' | 'answer' | 'grid' | 'figure' | 'hidden' | 'turned' | 'folded' | 'punched' | 'mirror' | 'water' | 'group'
  /** Makes a fresh practice question; optional per topic. */
  generate?: (rng?: () => number) => Question
  /** "Guess the rule" game; shown only for topics that have one. Its text is in lib/i18n (game.topics). */
  guessRule?: {
    make: () => Question
  }
}

const visible = (qs: Question[]) => qs.filter((q) => q.status !== 'needs-review')

export const READY_TOPICS: ReadyTopic[] = [
  {
    id: 'number-series',
    chapter: 17,
    name: 'Number Series',
    questions: visible(numberSeries.questions as Question[]),
    meta: numberSeriesMeta,
    generate: generateNumberSeries,
    guessRule: {
      make: () => generateRuleQuestion(),
    },
  },
  {
    id: 'number-analogy',
    chapter: 14,
    name: 'Number Analogy',
    questions: visible(numberAnalogy.questions as Question[]),
    meta: numberAnalogyMeta,
    generate: generateNumberAnalogy,
    guessRule: {
      make: () => generateAnalogyRuleQuestion(),
    },
  },
  {
    id: 'letter-series',
    chapter: 21,
    name: 'Letter Series',
    questions: visible(letterSeries.questions as Question[]),
    meta: letterSeriesMeta as TopicMeta,
    missing: 'letters',
    generate: generateLetterSeries,
  },
  {
    id: 'wrong-number',
    chapter: 19,
    name: 'Find the Wrong Number',
    questions: visible(wrongNumber.questions as Question[]),
    meta: wrongNumberMeta,
    missing: 'wrong',
    generate: generateWrongNumber,
  },
  {
    id: 'odd-one-numbers',
    chapter: 18,
    name: 'Odd One Out: Numbers',
    questions: visible(oddOne.questions as Question[]),
    meta: oddOneMeta,
    missing: 'odd',
    generate: generateOddOne,
  },
  {
    id: 'coding-decoding',
    chapter: 23,
    name: 'Coding–Decoding',
    questions: visible(coding.questions as Question[]),
    meta: codingMeta as TopicMeta,
    missing: 'code',
    generate: generateCoding,
  },
  {
    id: 'directions',
    chapter: 31,
    name: 'Directions',
    questions: visible(directions.questions as Question[]),
    meta: directionsMeta,
    missing: 'direction',
    generate: generateDirections,
  },
  {
    id: 'blood-relations',
    chapter: 32,
    name: 'Blood Relations',
    questions: visible(blood.questions as Question[]),
    meta: bloodMeta as TopicMeta,
    missing: 'relation',
    generate: generateBloodRelation,
  },
  {
    id: 'calendar',
    chapter: 34,
    name: 'Calendar',
    questions: visible(calendar.questions as Question[]),
    meta: calendarMeta,
    missing: 'answer',
    generate: generateCalendar,
  },
  {
    id: 'clock',
    chapter: 35,
    name: 'Clock',
    questions: visible(clock.questions as Question[]),
    meta: clockMeta,
    missing: 'answer',
    generate: generateClock,
  },
  {
    id: 'odd-one-letters',
    chapter: 16,
    name: 'Odd One Out: Letters',
    questions: visible(oddLetters.questions as Question[]),
    meta: oddLettersMeta as TopicMeta,
    missing: 'odd',
    generate: generateOddLetters,
  },
  {
    id: 'number-sequence',
    chapter: 20,
    name: 'Number Sequence',
    questions: visible(numberSequence.questions as Question[]),
    meta: numberSequenceMeta,
    missing: 'answer',
    generate: generateSequence,
  },
  {
    id: 'letter-number-analogy',
    chapter: 22,
    name: 'Letter–Number Analogy',
    questions: visible(letterNumber.questions as Question[]),
    meta: letterNumberMeta as TopicMeta,
    missing: 'answer',
    generate: generateLetterNumber,
  },
  {
    id: 'analogy-of-figures',
    chapter: 1,
    name: 'Analogy of Figures',
    questions: visible(figAnalogy.questions as Question[]),
    meta: figAnalogyMeta as TopicMeta,
    missing: 'figure',
    generate: generateFigureAnalogy,
    guessRule: {
      make: () => generateFigureRuleQuestion(),
    },
  },
  {
    id: 'figure-series',
    chapter: 2,
    name: 'Figure Series',
    questions: visible(figSeries.questions as Question[]),
    meta: figSeriesMeta as TopicMeta,
    missing: 'figure',
    generate: generateFigureSeries,
  },
  {
    id: 'number-patterns',
    chapter: 15,
    name: 'Number Patterns',
    questions: visible(numberPatterns.questions as Question[]),
    meta: numberPatternsMeta as TopicMeta,
    missing: 'grid',
    generate: generateNumberPatterns,
  },
  {
    id: 'arithmetical-operations',
    chapter: 25,
    name: 'Arithmetical Operations',
    questions: visible(arithmetic.questions as Question[]),
    meta: arithmeticMeta as TopicMeta,
    missing: 'answer',
    generate: generateArithmetic,
  },
  {
    id: 'signs-symbols',
    chapter: 26,
    name: 'Signs and Symbols',
    questions: visible(signs.questions as Question[]),
    meta: signsMeta as TopicMeta,
    missing: 'answer',
    generate: generateSigns,
  },
  {
    id: 'hidden-figures',
    chapter: 3,
    name: 'Hidden Figures',
    questions: visible(hidden.questions as Question[]),
    meta: hiddenMeta as TopicMeta,
    missing: 'hidden',
    generate: generateHiddenFigure,
  },
  {
    id: 'similar-figures',
    chapter: 4,
    name: 'Similar Figures in Different Position',
    questions: visible(similar.questions as Question[]),
    meta: similarMeta as TopicMeta,
    missing: 'turned',
    generate: generateSimilarFigure,
  },
  {
    id: 'intersecting-figures',
    chapter: 5,
    name: 'Intersecting Figures',
    questions: visible(intersecting.questions as Question[]),
    meta: intersectingMeta as TopicMeta,
    missing: 'answer',
    generate: generateIntersecting,
  },
  {
    id: 'fold-sheet',
    chapter: 6,
    name: 'Figure Fold Transparent Sheet',
    questions: visible(foldSheet.questions as Question[]),
    meta: foldSheetMeta as TopicMeta,
    missing: 'folded',
    generate: generateFoldSheet,
  },
  {
    id: 'paper-punch',
    chapter: 7,
    name: 'Paper Fold and Punch',
    questions: visible(paperPunch.questions as Question[]),
    meta: paperPunchMeta as TopicMeta,
    missing: 'punched',
    generate: generatePaperPunch,
  },
  {
    id: 'mirror-image',
    chapter: 8,
    name: 'Mirror Image',
    questions: visible(mirror.questions as Question[]),
    meta: mirrorMeta as TopicMeta,
    missing: 'mirror',
    generate: generateMirrorImage,
  },
  {
    id: 'water-image',
    chapter: 9,
    name: 'Water Image',
    questions: visible(water.questions as Question[]),
    meta: waterMeta as TopicMeta,
    missing: 'water',
    generate: generateWaterImage,
  },
  {
    id: 'cubes-cutting',
    chapter: 10,
    name: 'Cubes Cutting',
    questions: visible(cubes.questions as Question[]),
    meta: cubesMeta as TopicMeta,
    missing: 'answer',
    generate: generateCubesCutting,
  },
  {
    id: 'dice',
    chapter: 11,
    name: 'Numbers in Opposite Faces',
    questions: visible(dice.questions as Question[]),
    meta: diceMeta as TopicMeta,
    missing: 'answer',
    generate: generateDice,
  },
  {
    id: 'counting-figures',
    chapter: 12,
    name: 'Counting of Figures',
    questions: visible(counting.questions as Question[]),
    meta: countingMeta as TopicMeta,
    missing: 'answer',
    generate: generateCountingFigures,
  },
  {
    id: 'cubes-colouring',
    chapter: 13,
    name: 'Cubes Colouring',
    questions: visible(colouring.questions as Question[]),
    meta: colouringMeta as TopicMeta,
    missing: 'answer',
    generate: generateCubesColouring,
  },
  {
    id: 'figure-numbers',
    chapter: 24,
    name: 'Figures and Number Relationship',
    questions: visible(figNum.questions as Question[]),
    meta: figNumMeta as TopicMeta,
    missing: 'number',
    generate: generateFigureNumbers,
  },
  {
    id: 'number-matrix',
    chapter: 27,
    name: 'Number Matrix',
    questions: visible(matrix.questions as Question[]),
    meta: matrixMeta as TopicMeta,
    missing: 'number',
    generate: generateNumberMatrix,
  },
  {
    id: 'letter-matrix',
    chapter: 28,
    name: 'Letter Matrix',
    questions: visible(letterMatrix.questions as Question[]),
    meta: letterMatrixMeta as TopicMeta,
    missing: 'answer',
    generate: generateLetterMatrix,
  },
  {
    id: 'letter-values',
    chapter: 29,
    name: 'Numbers and Letters by a Rule',
    questions: visible(letterValues.questions as Question[]),
    meta: letterValuesMeta as TopicMeta,
    missing: 'answer',
    generate: generateLetterValues,
  },
  {
    id: 'pyramid',
    chapter: 30,
    name: 'Number and Letter Pyramid',
    questions: visible(pyramid.questions as Question[]),
    meta: pyramidMeta as TopicMeta,
    missing: 'group',
    generate: generatePyramid,
  },
  {
    id: 'venn-diagrams',
    chapter: 33,
    name: 'Venn Diagrams',
    questions: visible(vennDiagrams.questions as Question[]),
    meta: vennDiagramsMeta as TopicMeta,
    missing: 'answer',
    generate: generateVennDiagram,
  },
  {
    id: 'arrangement',
    chapter: 36,
    name: 'Arrangement',
    questions: visible(arrangement.questions as Question[]),
    meta: arrangementMeta as TopicMeta,
    missing: 'answer',
    generate: generateArrangement,
  },
]

/** MAT chapters from the study material that are not built yet (shown as "coming soon"). */
export const UPCOMING_MAT: { chapter: number; name: string }[] = [
]

/** The short instruction above each question, e.g. "Find the missing number". */
export function askLabel(t: Dict, topic: ReadyTopic): string {
  const labels: Record<NonNullable<ReadyTopic['missing']>, string> = {
    number: t.common.findMissing,
    letters: t.common.findMissingLetters,
    wrong: t.common.findWrong,
    odd: t.common.findOdd,
    code: t.common.findCode,
    direction: t.common.findDirection,
    relation: t.common.findRelation,
    answer: t.common.findAnswer,
    grid: t.common.findGrid,
    figure: t.common.findFigure,
    hidden: t.common.findHidden,
    turned: t.common.findTurned,
    folded: t.common.findFolded,
    punched: t.common.findPunched,
    mirror: t.common.findMirror,
    water: t.common.findWater,
    group: t.common.findGroup,
  }
  return labels[topic.missing ?? 'number']
}

export function getTopic(id: string): ReadyTopic | undefined {
  return READY_TOPICS.find((t) => t.id === id)
}
