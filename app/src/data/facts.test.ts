import { describe, expect, it } from 'vitest'
import { CUBE_LAST_DIGIT, FACT_CHAPTERS, PRIMES, PRIMES_BY_TEN, PRIME_TRAPS, SQUARE_AND_CUBE } from './facts'
import { getTopic } from './topics'

/** Sieve of Eratosthenes, independent of the written-out list. */
function sieve(max: number): number[] {
  const composite = new Array<boolean>(max + 1).fill(false)
  const out: number[] = []
  for (let n = 2; n <= max; n++) {
    if (composite[n]) continue
    out.push(n)
    for (let m = n * n; m <= max; m += n) composite[m] = true
  }
  return out
}

describe('facts', () => {
  it('lists exactly the primes under 100', () => {
    expect(PRIMES).toEqual(sieve(100))
    expect(PRIMES).toHaveLength(25)
  })

  it('splits the primes into tens without losing any', () => {
    expect(PRIMES_BY_TEN.flatMap((t) => t.primes)).toEqual(PRIMES)
    expect(PRIMES_BY_TEN.map((t) => t.primes.length)).toEqual([4, 4, 2, 2, 3, 2, 2, 3, 2, 1])
  })

  it('gives each trap the right factors, and none is prime', () => {
    for (const [n, a, b] of PRIME_TRAPS) {
      expect(a * b).toBe(n)
      expect(PRIMES).not.toContain(n)
      expect(n % 2).toBe(1)
    }
  })

  it('maps last digits of cubes correctly', () => {
    for (let n = 1; n <= 99; n++) {
      const row = CUBE_LAST_DIGIT.find(([d]) => d === n % 10)!
      expect(n ** 3 % 10).toBe(row[1])
    }
    const changed = CUBE_LAST_DIGIT.filter(([d, c]) => d !== c).map(([d]) => d)
    expect(changed.sort()).toEqual([2, 3, 7, 8])
  })

  it('finds every number in the tables that is both a square and a cube', () => {
    const squares = new Set(Array.from({ length: 30 }, (_, i) => (i + 1) ** 2))
    const both = Array.from({ length: 20 }, (_, i) => (i + 1) ** 3).filter((c) => squares.has(c))
    expect(SQUARE_AND_CUBE.map(([n]) => n)).toEqual(both)
    for (const [n, s, c] of SQUARE_AND_CUBE) {
      expect(s * s).toBe(n)
      expect(c ** 3).toBe(n)
    }
  })

  it('links only to chapters that exist', () => {
    for (const id of Object.keys(FACT_CHAPTERS)) expect(getTopic(id), id).toBeDefined()
  })
})
