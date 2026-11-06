import { describe, expect, it } from 'vitest'
import about from '../public/about/index.html?raw'
import { SAT_TOPICS, SAT_PAPERS } from './data/sat'
import { READY_TOPICS, getTopic } from './data/topics'

/** The About page is plain HTML, so its numbers can't read the app's data. These keep them true. */
describe('About page numbers', () => {
  it('counts the MAT chapters', () => {
    expect(about).toContain(`${READY_TOPICS.length} MAT chapters`)
    expect(about).toContain(`${READY_TOPICS.length} chapters`)
  })
  it('counts the SAT topics that follow the textbooks (not the "Old syllabus" ones)', () => {
    const topics = SAT_TOPICS.filter((t) => t.chapters.length > 0).length
    expect(about).toContain(`${topics} SAT topics`)
    expect(about).toContain(`${topics} revision topics`)
  })
  it('counts the SAT past questions', () => {
    const questions = SAT_PAPERS.reduce((n, p) => n + p.questions.length, 0)
    expect(about).toContain(`${questions} past exam questions`)
  })
})

describe('About page links into the app', () => {
  // The route's name -> the topic field that turns that tool on (App.tsx).
  const TOOL = { try: 'reflect', punch: 'punch' } as const

  it('opens tools that exist', () => {
    const links = [...about.matchAll(/href="\.\.\/#\/t\/([^/"]+)\/([^/"]+)"/g)]
    expect(links.length).toBeGreaterThan(0)
    for (const [link, topicId, tool] of links) {
      expect(tool in TOOL, link).toBe(true)
      expect(getTopic(topicId)?.[TOOL[tool as keyof typeof TOOL]], link).toBeTruthy()
    }
  })
})
