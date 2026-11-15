/**
 * A printed mock exam (/mock/print): the mock exam's choices and a paper code in the address, so the same
 * address always rebuilds the same paper and answer key (the code seeds buildMock's shuffles). A teacher can
 * reload it, print the key later or on another device, and print a fresh paper by changing the code.
 */
import { PAPER_FILES } from '../data/papers'
import { mulberry32 } from './generators/numberSeries'
import { LENGTHS, MOCK_TESTS, buildMock } from './mock'
import type { MockConfig, MockItem, MockLength, MockTest } from './mock'

const CODE_LENGTH = 6
const CODE_SPACE = 36 ** CODE_LENGTH

/** A new paper code: six letters and digits ("K3Q7ZP"). */
export function newPaperCode(rng: () => number = Math.random): string {
  return Math.floor(rng() * CODE_SPACE)
    .toString(36)
    .toUpperCase()
    .padStart(CODE_LENGTH, '0')
}

const validCode = (code: string) => new RegExp(`^[0-9A-Z]{${CODE_LENGTH}}$`).test(code)

/** The print page's address for a choice of test and a paper code. */
export function printPath(c: MockConfig, code: string): string {
  const q = new URLSearchParams({ t: c.tests.join(','), n: String(c.length) })
  if (c.mat) q.set('mat', c.mat.join(','))
  if (c.sat) q.set('sat', c.sat.join(','))
  if (c.paper && !c.mat) q.set('paper', c.paper)
  q.set('code', code)
  return `mock/print?${q.toString()}`
}

/** The choice and code in a print page's address, or undefined if the address doesn't make a paper. */
export function parsePrint(query: URLSearchParams): { config: MockConfig; code: string } | undefined {
  const tests = MOCK_TESTS.filter((x) => (query.get('t') ?? '').split(',').includes(x))
  const length = Number(query.get('n')) as MockLength
  const code = (query.get('code') ?? '').toUpperCase()
  const paper = query.get('paper') ?? undefined
  const list = (key: MockTest) => {
    const v = query.get(key)
    return v === null ? undefined : v.split(',').filter(Boolean)
  }
  const mat = tests.includes('mat') ? list('mat') : undefined
  const sat = tests.includes('sat') ? list('sat') : undefined
  if (tests.length === 0 || !LENGTHS.includes(length) || !validCode(code)) return undefined
  if (paper && (mat || !tests.includes('mat') || !PAPER_FILES.some((p) => p.id === paper))) return undefined
  if (mat?.length === 0 || sat?.length === 0) return undefined
  return { config: { tests, length, ...(mat ? { mat } : {}), ...(sat ? { sat } : {}), ...(paper ? { paper } : {}) }, code }
}

/** The questions of a printed paper: always the same for the same choice and code. */
export function printItems(c: MockConfig, code: string): MockItem[] {
  return buildMock(c, mulberry32(parseInt(code, 36)))
}
