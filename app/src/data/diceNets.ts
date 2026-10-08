import type { NetCell } from '../lib/generators/dice'

/**
 * The book's open dice (Ch 11) for the dice fold page, as [row, column, label]. Q8 is left out (its two
 * rows touch only at a corner, so it can't fold), and so are Q11 (a box, not a dice), Q12 (a choice of
 * dice drawings) and Q14 (shapes, not labels). tools/check_dice.ts holds the same nets.
 */
export const BOOK_NETS: { q: number; net: NetCell[] }[] = [
  {
    q: 7,
    net: [
      [0, 1, '3'],
      [0, 2, '5'],
      [1, 1, '6'],
      [2, 1, '2'],
      [3, 0, '1'],
      [3, 1, '4'],
    ],
  },
  {
    q: 9,
    net: [
      [0, 1, 'Q'],
      [1, 0, 'O'],
      [1, 1, 'M'],
      [1, 2, 'N'],
      [2, 1, 'R'],
      [3, 1, 'P'],
    ],
  },
  {
    q: 10,
    net: [
      [0, 1, '+'],
      [1, 0, '*'],
      [1, 1, '×'],
      [2, 1, '−'],
      [2, 2, '='],
      [3, 1, '÷'],
    ],
  },
]
