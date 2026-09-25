import type { ComponentType } from 'react'
import { AnswerCheck } from './AnswerCheck'
import { GrowthShapes } from './GrowthShapes'
import { HopArrows } from './HopArrows'
import { NumberGrid } from './NumberGrid'
import { ShrinkFlip } from './ShrinkFlip'
import { ZigZagSplit } from './ZigZagSplit'

export interface TipVisual {
  Visual: ComponentType<{ step: number }>
  /** Label of the button that moves to each next step; empty for visuals with their own controls. */
  buttons: string[]
}

/** Visuals for the Learn page tips, keyed by the `visual` id in a topic's meta JSON. */
export const TIP_VISUALS: Record<string, TipVisual> = {
  hop: { Visual: HopArrows, buttons: ['Show me', 'Next hop', 'Next hop', 'Next hop'] },
  growth: { Visual: GrowthShapes, buttons: ['Show squares', 'Show doubling'] },
  shrink: { Visual: ShrinkFlip, buttons: ['Show me', 'Flip it'] },
  zigzag: { Visual: ZigZagSplit, buttons: ['Colour the places', 'Split it'] },
  grid: { Visual: NumberGrid, buttons: [] },
  check: { Visual: AnswerCheck, buttons: ['Try 7', 'Try 8'] },
}
