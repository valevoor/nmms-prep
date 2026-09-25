import { describe, expect, it } from 'vitest'
import { applyOp } from '../../lib/series'
import { CHECK, DOUBLING, HOP, SHRINK, SQUARES, ZIGZAG } from './examples'

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
})
