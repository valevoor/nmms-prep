import type { ComponentType } from 'react'
import { AnswerCheck } from './AnswerCheck'
import { GrowthShapes } from './GrowthShapes'
import { HopArrows } from './HopArrows'
import { NumberGrid } from './NumberGrid'
import { ShrinkFlip } from './ShrinkFlip'
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
}
