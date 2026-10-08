import { describe, expect, it } from 'vitest'
import { BOOK_NETS } from '../data/diceNets'
import { foldTree, normals, oppositePairs } from './diceFold'
import { NET_COUNT, randomNet, SIDE_NETS } from './generators/dice'
import type { NetCell } from './generators/dice'

const sorted = (pairs: [string, string][]) => pairs.map((p) => [...p].sort().join('')).sort()

describe('dice fold', () => {
  it('folds every cube net so the faces a rolled dice puts there are opposite', () => {
    // SIDE_NETS labels each square by rolling a dice over the net; folding is a different method.
    expect(SIDE_NETS).toHaveLength(NET_COUNT)
    for (const net of SIDE_NETS) expect(sorted(oppositePairs(net))).toEqual(['BF', 'DU', 'LR'])
  })

  it('agrees with the book nets (checked in tools/check_dice.ts)', () => {
    const want: Record<number, string[]> = {
      7: ['23', '15', '46'],
      9: ['QR', 'MP', 'NO'],
      10: ['+−', '×÷', '*='],
    }
    for (const { q, net } of BOOK_NETS) expect(sorted(oppositePairs(net))).toEqual(sorted(want[q].map((s) => [...s] as [string, string])))
  })

  it('lies flat at 0 and makes six different faces at 1', () => {
    for (const net of SIDE_NETS) {
      const tree = foldTree(net)
      for (const v of normals(tree, 0).values()) expect(v.map((x) => Math.round(x) + 0)).toEqual([0, 0, 1])
      const faces = [...normals(tree, 1).values()].map((v) => v.map((x) => Math.round(x) + 0).join(','))
      expect(new Set(faces).size).toBe(6)
    }
  })

  it('makes new nets with six different labels that fold', () => {
    for (let i = 0; i < 200; i++) {
      const net: NetCell[] = randomNet()
      expect(new Set(net.map(([, , l]) => l)).size).toBe(6)
      expect(oppositePairs(net)).toHaveLength(3)
    }
  })
})
