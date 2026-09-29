import type { ComponentType } from 'react'
import { AnswerCheck } from './AnswerCheck'
import { FigureGrow } from './FigureGrow'
import { FigureHidden } from './FigureHidden'
import { FoldSheet } from './FoldSheet'
import { FigureShade } from './FigureShade'
import { FigureTurn } from './FigureTurn'
import { GrowthShapes } from './GrowthShapes'
import { HopArrows } from './HopArrows'
import { NumberGrid } from './NumberGrid'
import { OrderOfOps } from './OrderOfOps'
import { ShrinkFlip } from './ShrinkFlip'
import { VennParts } from './VennParts'
import { ZigZagSplit } from './ZigZagSplit'

/** `label` describes the picture for screen readers. */
export type VisualProps = { step: number; label: string }

/**
 * Visuals for the Learn page tips, keyed by the `visual` id in a topic's meta JSON. Their step
 * buttons and labels are in lib/i18n (tipVisuals); a visual with no buttons has its own controls.
 */
export const TIP_VISUALS: Record<string, ComponentType<VisualProps>> = {
  hop: HopArrows,
  growth: GrowthShapes,
  shrink: ShrinkFlip,
  zigzag: ZigZagSplit,
  grid: NumberGrid,
  check: AnswerCheck,
  figTurn: FigureTurn,
  figShade: FigureShade,
  figGrow: FigureGrow,
  order: OrderOfOps,
  figHidden: FigureHidden,
  venn: VennParts,
  figFold: FoldSheet,
}
