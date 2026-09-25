/** Numbers shown in the Number Series tip visuals (checked in examples.test.ts). */

/** Tip 1: equal differences. */
export const HOP = { terms: [3, 7, 11, 15], op: '+4', answer: 19 }

/** Tip 2: squares, and doubling. */
export const SQUARES = [1, 4, 9, 16]
export const DOUBLING = { values: [2, 4, 8, 16], op: '×2' }

/** Tip 3: a shrinking series, then the same series read from the right. */
export const SHRINK = { values: [120, 24, 6, 2], ops: ['÷5', '÷4', '÷3'], flippedOps: ['×3', '×4', '×5'] }

/** Tip 4: two series mixed together. Odd places use oddOp, even places use evenOp. */
export const ZIGZAG = { values: [2, 10, 4, 20, 6, 30], oddOp: '+2', evenOp: '+10' }

/** Tip 6: "wrong" fits the first gaps (+1, +2, +3) but breaks on the next one; "right" (×2) fits every gap. */
export const CHECK = { values: [1, 2, 4, 8, 16, 32], blank: 3, wrong: 7, wrongOps: ['+1', '+2', '+3'], op: '×2' }
