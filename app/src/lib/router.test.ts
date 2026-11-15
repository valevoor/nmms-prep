import { describe, expect, it } from 'vitest'
import { pathFromHash } from './router'

describe('old hash routes become paths', () => {
  it.each([
    ['#/', 'mat'],
    ['#/?test=sat', 'sat'],
    ['#/t/number-series', 'mat/number-series'],
    ['#/t/number-series/learn', 'mat/number-series/learn'],
    ['#/t/number-series/practice', 'mat/number-series/practice'],
    ['#/t/number-series/practice?mode=mistakes', 'mat/number-series/practice/mistakes'],
    ['#/sat/algebra', 'sat/algebra'],
    ['#/sat/algebra/practice?mode=exam', 'sat/algebra/practice/exam'],
    ['#/sat/algebra/revise', 'sat/algebra/revise'],
    ['#/facts/primes', 'facts/primes'],
    ['#/shapes/cube/net', 'shapes/cube/net'],
  ])('%s -> /%s', (hash, path) => expect(pathFromHash(hash)).toBe(path))

  it('leaves other hashes alone', () => {
    expect(pathFromHash('')).toBeUndefined()
    expect(pathFromHash('#top')).toBeUndefined()
  })
})
