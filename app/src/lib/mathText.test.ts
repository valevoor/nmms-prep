import { describe, expect, it } from 'vitest'
import { parse } from './mathText'
import type { MathNode } from './mathText'

/** Writes the parts back as text with the structure marked: [a|b] a fraction, √{…} a root, ^{…} an exponent. */
function show(nodes: MathNode[]): string {
  return nodes
    .map((n) => (typeof n === 'string' ? n : 'frac' in n ? `[${show(n.frac[0])}|${show(n.frac[1])}]` : 'root' in n ? `√{${show(n.root)}}` : `^{${n.sup}}`))
    .join('')
}
const p = (s: string) => show(parse(s))

describe('parse', () => {
  it('stacks fractions and puts roots over what they cover', () => {
    expect(p('If √(1 + 27/169) = 1 + m/13, then')).toBe('If √{1 + [27|169]} = 1 + [m|13], then')
    expect(p('√(196/169) = 14/13')).toBe('√{[196|169]} = [14|13]')
    expect(p('√(41 − √(21 + √(19 − √9)))')).toBe('√{41 − √{21 + √{19 − √{9}}}}')
    expect(p('√a / √b')).toBe('[√{a}|√{b}]')
  })

  it('drops the brackets of a whole numerator or denominator but keeps the others', () => {
    expect(p('(x − 19)/(x − 25) = 7/5')).toBe('[x − 19|x − 25] = [7|5]')
    expect(p('(6.25 × 6.25 − 1.75 × 1.75) / 4.5 is')).toBe('[6.25 × 6.25 − 1.75 × 1.75|4.5] is')
    expect(p('(a + b)(a − b)/(a − b)')).toBe('[(a + b)(a − b)|a − b]')
    expect(p('n(n − 3)/2 diagonals')).toBe('[n(n − 3)|2] diagonals')
    expect(p('s² = (d₁/2)² + (d₂/2)²')).toBe('s² = ([d₁|2])² + ([d₂|2])²')
    expect(p('(aᵖ/aᵐ)ⁿ')).toBe('([aᵖ|aᵐ])ⁿ')
  })

  it('reads signs, coefficients and exponents', () => {
    expect(p('−1/2')).toBe('−[1|2]')
    expect(p('x/4 + x/6 = 3x/12')).toBe('[x|4] + [x|6] = [3x|12]')
    expect(p('x² + 1/x² = 102')).toBe('x² + [1|x²] = 102')
    expect(p('(b/a)^(1 − 3x)')).toBe('([b|a])^{1 − 3x}')
    expect(p('Profit = CP/9')).toBe('Profit = [CP|9]')
  })

  it('leaves words, units and text alone', () => {
    expect(p('SP = CP × (1 ± rate/100)')).toBe('SP = CP × (1 ± rate/100)')
    expect(p('ಲಾಭ%/100')).toBe('ಲಾಭ%/100')
    expect(p('The value of ‘m’ is :')).toBe('The value of ‘m’ is :')
    expect(p('√0.576 : √0.324 = 24 : 18')).toBe('√{0.576} : √{0.324} = 24 : 18')
  })
})
