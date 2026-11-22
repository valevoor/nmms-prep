import { describe, expect, it } from 'vitest'
import { modelQuestions, PAPER_FILES, paperQuestions } from '../data/papers'
import { SAT_TOPICS, SECTION_SUBJECT, satSolved } from '../data/sat'
import { READY_TOPICS, getTopic } from '../data/topics'
import { answerOf, available, buildMock, byChapter, byTest, chapterShares, mockSeconds, newMock, satRef, scoreMock, shares, slowestChapter } from './mock'
import type { MockConfig, MockItem } from './mock'

/** A seeded random number generator, so a failing paper can be rebuilt. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

const key = (x: MockItem) => (x.q ? `mat/${x.q.id}` : `sat/${x.sat!.paper}/${x.sat!.id}`)

/** Every question is asked once, exists, and has an answer among its options. */
function checkItems(items: MockItem[]) {
  expect(new Set(items.map(key)).size).toBe(items.length)
  for (const x of items) {
    if (x.q) {
      expect(getTopic(x.topic)).toBeDefined()
      expect(x.q.status).not.toBe('needs-review')
      expect(Object.keys(x.q.options)).toContain(x.q.answer)
    } else {
      const r = satRef(x)
      expect(r).toBeDefined()
      expect(r!.topic).toBe(x.topic)
      expect(Object.keys(r!.q.options)).toContain(answerOf(x))
    }
  }
}

describe('shares', () => {
  it('splits by weight and passes on what a capped row cannot take', () => {
    const out = shares(
      [
        { weight: 1, cap: 2 },
        { weight: 1, cap: Infinity },
      ],
      10,
    )
    expect(out.map((x) => x.n)).toEqual([2, 8])
  })

  it('gives no more than the caps add up to', () => {
    expect(shares([{ weight: 3, cap: 4 }], 10)[0].n).toBe(4)
  })
})

describe('chapterShares', () => {
  it.each([15, 45, 90])('adds up to %i, only from chapters asked in past papers', (total) => {
    const s = chapterShares(total)
    expect(s.reduce((a, x) => a + x.n, 0)).toBe(total)
    for (const x of s) expect(getTopic(x.topic)).toBeDefined()
  })
})

describe('MAT', () => {
  it.each([1, 2, 3, 4, 5, 6])('builds a full mixed paper with no repeated question (seed %i)', (seed) => {
    const items = buildMock({ tests: ['mat'], length: 90 }, seeded(seed))
    expect(items).toHaveLength(90)
    checkItems(items)
  })

  it.each(PAPER_FILES.map((p) => p.id))('asks %s as printed, leaving out questions under review, in 90 minutes', (id) => {
    const paper = PAPER_FILES.find((p) => p.id === id)!
    const c: MockConfig = { tests: ['mat'], length: 90, paper: id }
    const items = buildMock(c)
    expect(items.map((x) => x.q!.id)).toEqual(paper.questions.filter((q) => q.status !== 'needs-review').map((q) => q.id))
    expect(mockSeconds(c, items)).toBe(90 * 60)
  })

  it('asks only the chosen chapters', () => {
    const chosen = ['number-series', 'calendar']
    const items = buildMock({ tests: ['mat'], length: 45, mat: chosen }, seeded(3))
    expect(items).toHaveLength(45)
    expect(new Set(items.map((x) => x.topic))).toEqual(new Set(chosen))
    checkItems(items)
  })

  it('never asks a generated question', () => {
    const ids = new Set(READY_TOPICS.flatMap((t) => [...t.questions, ...paperQuestions(t.id), ...modelQuestions(t.id)].map((q) => q.id)))
    for (const seed of [1, 2, 3]) for (const x of buildMock({ tests: ['mat'], length: 90 }, seeded(seed))) expect(ids.has(x.q!.id)).toBe(true)
  })

  it('gives fewer questions when chosen chapters run out', () => {
    const t = READY_TOPICS.find((x) => x.id === 'calendar')!
    const n = available('mat', [t.id])
    const items = buildMock({ tests: ['mat'], length: 90, mat: [t.id] }, seeded(4))
    expect(n).toBeLessThan(90)
    expect(items).toHaveLength(n)
  })
})

describe('SAT', () => {
  it.each([1, 2, 3, 4, 5, 6])('builds a full paper: 35 science, 35 social science, 20 maths (seed %i)', (seed) => {
    const items = buildMock({ tests: ['sat'], length: 90 }, seeded(seed))
    expect(items).toHaveLength(90)
    checkItems(items)
    const count = (s: string) => items.filter((x) => SECTION_SUBJECT[satRef(x)!.q.subject] === s).length
    expect([count('science'), count('social'), count('maths')]).toEqual([35, 35, 20])
  })

  it('asks only the chosen topics', () => {
    const chosen = SAT_TOPICS.filter((t) => satSolved(t).length >= 10)
      .slice(0, 3)
      .map((t) => t.id)
    const items = buildMock({ tests: ['sat'], length: 15, sat: chosen }, seeded(5))
    expect(items).toHaveLength(15)
    expect(items.every((x) => chosen.includes(x.topic))).toBe(true)
    checkItems(items)
  })
})

describe('MAT and SAT together', () => {
  it('asks MAT first, then SAT, a minute a question', () => {
    const c: MockConfig = { tests: ['mat', 'sat'], length: 45 }
    const items = buildMock(c, seeded(6))
    expect(items).toHaveLength(90)
    const firstSat = items.findIndex((x) => x.sat)
    expect(firstSat).toBe(45)
    expect(items.slice(firstSat).every((x) => x.sat)).toBe(true)
    expect(mockSeconds(c, items)).toBe(90 * 60)
    checkItems(items)
  })
})

describe('a real MAT paper with SAT', () => {
  it('asks the MAT paper as printed in 90 minutes, then SAT at a minute a question', () => {
    const paper = PAPER_FILES[PAPER_FILES.length - 1]
    const c: MockConfig = { tests: ['mat', 'sat'], length: 45, paper: paper.id }
    const items = buildMock(c, seeded(7))
    const mat = items.filter((x) => x.q)
    expect(mat.map((x) => x.q!.id)).toEqual(paper.questions.filter((q) => q.status !== 'needs-review').map((q) => q.id))
    expect(items.filter((x) => x.sat)).toHaveLength(45)
    expect(mockSeconds(c, items)).toBe((90 + 45) * 60)
    checkItems(items)
  })
})

describe('scoring', () => {
  it('scores each test, groups by chapter weakest first and finds a slow chapter', () => {
    const m = newMock({ tests: ['mat', 'sat'], length: 15 })
    const first = m.items[0].topic
    m.items.forEach((x, i) => {
      // Everything right except the first chapter's questions, which are all wrong and slow.
      const right = answerOf(x)!
      const wrong = (['A', 'B', 'C', 'D'] as const).find((k) => k !== right)!
      const bad = !x.sat && x.topic === first
      m.answers[i] = bad ? wrong : right
      m.spent[i] = bad ? 200 : 30
    })
    const bad = m.items.filter((x) => !x.sat && x.topic === first).length
    expect(scoreMock(m)).toBe(m.items.length - bad)
    expect(byTest(m)).toEqual([
      { test: 'mat', score: 15 - bad, total: 15 },
      { test: 'sat', score: 15, total: 15 },
    ])
    expect(byChapter(m)[0]).toMatchObject({ test: 'mat', topic: first, right: 0, total: bad })
    expect(slowestChapter(m)).toEqual({ test: 'mat', topic: first, perQuestion: 200 })
  })

  it('reports no slow chapter when every question took about a minute', () => {
    const m = newMock({ tests: ['mat'], length: 15 })
    m.items.forEach((x, i) => {
      m.answers[i] = answerOf(x)!
      m.spent[i] = 60
    })
    expect(slowestChapter(m)).toBeUndefined()
  })
})
