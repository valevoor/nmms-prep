import { describe, expect, it } from 'vitest'
import { PAPER_FILES } from '../data/papers'
import { READY_TOPICS } from '../data/topics'
import { newPaperCode, parsePrint, printItems, printPath } from './mockPrint'
import type { MockConfig } from './mock'

const parse = (path: string) => parsePrint(new URLSearchParams(path.split('?')[1]))
const ids = (c: MockConfig, code: string) => printItems(c, code).map((x) => x.q?.id ?? `${x.sat?.paper}/${x.sat?.id}`)

describe('printed mock exam', () => {
  it('reads back every kind of choice from its address', () => {
    const configs: MockConfig[] = [
      { tests: ['mat', 'sat'], length: 90 },
      { tests: ['mat'], length: 15, mat: [READY_TOPICS[0].id, READY_TOPICS[1].id] },
      { tests: ['sat'], length: 45, sat: ['some-topic'] },
      { tests: ['mat', 'sat'], length: 45, paper: PAPER_FILES[0].id },
    ]
    for (const c of configs) expect(parse(printPath(c, 'K3Q7ZP'))).toEqual({ config: c, code: 'K3Q7ZP' })
  })

  it('makes the same paper from the same code, and a different one from another code', () => {
    const c: MockConfig = { tests: ['mat', 'sat'], length: 45 }
    expect(ids(c, 'AB12CD')).toEqual(ids(c, 'AB12CD'))
    expect(ids(c, 'AB12CD')).not.toEqual(ids(c, 'ZZ0001'))
    expect(ids(c, 'AB12CD')).toHaveLength(90)
  })

  it('makes six-character codes', () => {
    expect(newPaperCode(() => 0)).toBe('000000')
    expect(newPaperCode(() => 0.999999999)).toMatch(/^[0-9A-Z]{6}$/)
  })

  it('turns down addresses that make no paper', () => {
    expect(parse('mock/print?t=mat&n=45')).toBeUndefined()
    expect(parse('mock/print?t=mat&n=50&code=AAAAAA')).toBeUndefined()
    expect(parse('mock/print?t=xyz&n=45&code=AAAAAA')).toBeUndefined()
    expect(parse('mock/print?t=mat&n=45&mat=&code=AAAAAA')).toBeUndefined()
    expect(parse('mock/print?t=sat&n=45&paper=ka-2020-21-mat&code=AAAAAA')).toBeUndefined()
    expect(parse('mock/print?t=mat&n=45&paper=nope&code=AAAAAA')).toBeUndefined()
  })
})
