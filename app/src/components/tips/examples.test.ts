import { describe, expect, it } from 'vitest'
import { applyOp } from '../../lib/series'
import { BODMAS, CHECK, DOUBLING, HOP, SHRINK, SQUARES, ZIGZAG } from './examples'

const follows = (v: number[], ops: string[]) => v.slice(1).every((x, i) => applyOp(v[i], ops[i]) === x)

describe('tip visual examples', () => {
  it('hop: every gap is the same', () => {
    const v = [...HOP.terms, HOP.answer]
    expect(follows(v, v.slice(1).map(() => HOP.op))).toBe(true)
  })

  it('squares and doubling', () => {
    expect(SQUARES).toEqual(SQUARES.map((_, i) => (i + 1) ** 2))
    expect(follows(DOUBLING.values, DOUBLING.values.slice(1).map(() => DOUBLING.op))).toBe(true)
  })

  it('shrink: ÷ one way, × the other', () => {
    expect(follows(SHRINK.values, SHRINK.ops)).toBe(true)
    expect(follows([...SHRINK.values].reverse(), SHRINK.flippedOps)).toBe(true)
  })

  it('zig-zag splits into two series', () => {
    const odd = ZIGZAG.values.filter((_, i) => i % 2 === 0)
    const even = ZIGZAG.values.filter((_, i) => i % 2 === 1)
    expect(follows(odd, odd.slice(1).map(() => ZIGZAG.oddOp))).toBe(true)
    expect(follows(even, even.slice(1).map(() => ZIGZAG.evenOp))).toBe(true)
  })

  it('check: the wrong answer fits the earlier gaps but not the next one', () => {
    const v = CHECK.values
    expect(follows(v, v.slice(1).map(() => CHECK.op))).toBe(true)
    const tried = v.with(CHECK.blank, CHECK.wrong)
    expect(follows(tried.slice(0, CHECK.blank + 1), CHECK.wrongOps)).toBe(true)
    // The next gap would have to be +4 to keep the pattern going.
    expect(applyOp(CHECK.wrong, '+4')).not.toBe(v[CHECK.blank + 1])
  })

  it('order of operations: ÷ first, then + and − from the left', () => {
    const { nums, ops, first, answer } = BODMAS
    expect(ops[first]).toBe('÷')
    expect(nums[first] % nums[first + 1]).toBe(0)
    // Every other sign is + or −, so after the ÷ the line is worked left to right.
    const rest = [...nums.slice(0, first), nums[first] / nums[first + 1], ...nums.slice(first + 2)]
    const restOps = ops.filter((_, i) => i !== first)
    expect(restOps.every((s) => s === '+' || s === '−')).toBe(true)
    expect(rest.slice(1).reduce((acc, n, i) => (restOps[i] === '+' ? acc + n : acc - n), rest[0])).toBe(answer)
  })
})
