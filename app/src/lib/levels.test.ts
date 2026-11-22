import { describe, expect, it } from 'vitest'
import { paperQuestions } from '../data/papers'
import { READY_TOPICS } from '../data/topics'
import { byLevel, levelOf } from './levels'

describe('byLevel', () => {
  it('puts a chapter with levels easiest first, keeping the order within a level', () => {
    const topic = READY_TOPICS.find((t) => t.id === 'number-matrix')!
    for (const list of [topic.questions, paperQuestions(topic.id)]) {
      const sorted = byLevel(list)
      expect(sorted).toHaveLength(list.length)
      const levels = sorted.map((q) => levelOf(q)!)
      expect(levels).toEqual([...levels].sort((a, b) => a - b))
      for (let i = 1; i < sorted.length; i++)
        if (levels[i] === levels[i - 1]) expect(list.indexOf(sorted[i])).toBeGreaterThan(list.indexOf(sorted[i - 1]))
    }
  })

  it('leaves a list without levels as it is', () => {
    const make = READY_TOPICS.find((t) => t.id === 'number-series')!.generate!
    const generated = [make(), make(), make()]
    expect(byLevel(generated)).toBe(generated)
  })

  it('gives every book and past-paper question students see a level', () => {
    for (const topic of READY_TOPICS)
      for (const q of [...topic.questions, ...paperQuestions(topic.id)])
        if (q.status !== 'needs-review') expect(levelOf(q), q.id).toBeGreaterThan(0)
  })
})
