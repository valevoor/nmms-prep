/** The numbers on the "Facts to remember" page (#/facts). The words for it are in the i18n dictionaries. */

export const FACT_TABS = ['primes', 'squares', 'cubes'] as const
export type FactTab = (typeof FACT_TABS)[number]

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

/** The 25 primes under 100, written out (facts.test.ts checks them with a sieve). */
export const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

/** Odd numbers under 100 that look prime but aren't, with their factors. */
export const PRIME_TRAPS: [n: number, a: number, b: number][] = [
  [51, 3, 17],
  [57, 3, 19],
  [87, 3, 29],
  [91, 7, 13],
]

/** The grid 1..100, and the primes in each ten (1–10, 11–20 …). */
export const HUNDRED = range(1, 100)
export const PRIMES_BY_TEN = range(0, 9).map((k) => ({
  from: 10 * k + 1,
  to: 10 * k + 10,
  primes: PRIMES.filter((p) => p > 10 * k && p <= 10 * k + 10),
}))

export const SQUARE_ROOTS = range(1, 30)
export const CUBE_ROOTS = range(1, 20)

/** A number's last digit → its cube's last digit. Only 2 ↔ 8 and 3 ↔ 7 change. */
export const CUBE_LAST_DIGIT = range(1, 10).map((d) => [d % 10, d ** 3 % 10] as const)

/** Numbers up to 30² and 20³ that are both a square and a cube. */
export const SQUARE_AND_CUBE: [n: number, sq: number, cube: number][] = [
  [1, 1, 1],
  [64, 8, 4],
  [729, 27, 9],
]

/** Chapters whose page links to the Facts page, and which tab the link opens. */
export const FACT_CHAPTERS: Record<string, FactTab> = {
  'number-series': 'squares',
  'number-analogy': 'squares',
  'number-sequence': 'squares',
  'number-matrix': 'squares',
  'odd-one-numbers': 'primes',
  'wrong-number': 'squares',
}
