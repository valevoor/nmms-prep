import { createElement } from 'react'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { READY_TOPICS } from './data/topics'
import { SAT_TOPICS } from './data/sat'
import { Chapter } from './pages/Chapter'
import { Home } from './pages/Home'
import { Practice } from './pages/Practice'
import { SatQuestions } from './pages/SatQuestions'
import { SatTopic } from './pages/SatTopic'

/*
 * MAT / SAT UI parity. Each SAT screen has a MAT counterpart, and the two should look and behave alike.
 * This renders both sides of each pair, cuts out the matching part of the page, and compares the CSS
 * classes they use. Every class used on only one side must be listed below with the reason, so a change
 * to one side fails here until it is made on the other side too, or explained.
 *
 * A reason starting with "Drift:" is a known difference that should go: fix it, then delete the line.
 */

// The pages read the language, theme, route and progress through useSyncExternalStore; rendering to a
// string needs a server snapshot, which is the same value here.
vi.mock('react', async (orig) => {
  const r = await orig<typeof import('react')>()
  return { ...r, useSyncExternalStore: <T,>(s: (l: () => void) => () => void, get: () => T, server?: () => T) => r.useSyncExternalStore(s, get, server ?? get) }
})
vi.mock('./lib/theme', () => ({ THEME_ORDER: ['light', 'dark', 'auto'], useTheme: () => 'light', setTheme: () => {} }))
const route = vi.hoisted(() => ({ query: '' }))
vi.mock('./lib/router', () => ({
  href: (p: string) => `#/${p.replace(/^\//, '')}`,
  navigate: () => {},
  useRoute: () => ({ parts: [], query: new URLSearchParams(route.query) }),
}))
vi.mock('./lib/progress', async (orig) => {
  const p = await orig<typeof import('./lib/progress')>()
  const empty: import('./lib/progress').TopicProgress = { attempts: {}, exam: {}, generated: { correct: 0, wrong: 0 }, mistakes: [], tests: [], best: {} }
  return { ...p, useProgress: () => empty }
})

const MAT = READY_TOPICS.find((t) => t.id === 'number-series')!
const SAT = SAT_TOPICS.find((t) => t.chapters.length === 1)!

function render(el: ReactElement, query = ''): string {
  route.query = query
  return renderToStaticMarkup(el)
}

/** The first element whose class list holds every class in `sel` ("card question"), with all it contains. */
function region(html: string, sel: string): string {
  const want = sel.split(' ')
  for (const m of html.matchAll(/<([a-z0-9]+)\b[^>]*\bclass="([^"]*)"/g)) {
    const classes = m[2].split(/\s+/)
    if (!want.every((c) => classes.includes(c))) continue
    const tag = m[1]
    const open = new RegExp(`<${tag}\\b|</${tag}>`, 'g')
    open.lastIndex = m.index + 1
    let depth = 1
    for (let x = open.exec(html); x; x = open.exec(html)) {
      depth += x[0].startsWith('</') ? -1 : 1
      if (depth === 0) return html.slice(m.index, x.index + x[0].length)
    }
  }
  throw new Error(`No element with class "${sel}"`)
}

/**
 * Classes inside the content rather than the screen: the chapter picture's parts (art-*) and a number series
 * (series*, term*, comma) change from chapter to chapter, not between MAT and SAT.
 */
const CONTENT = /^(art-|series|term|comma$)/

function classes(html: string): Set<string> {
  return new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && !CONTENT.test(c)))
}

interface Pair {
  name: string
  mat: () => string
  sat: () => string
  /** Classes only the MAT side uses, and why. */
  matOnly: Record<string, string>
  /** Classes only the SAT side uses, and why. */
  satOnly: Record<string, string>
}

const NO_PROGRESS = 'SAT questions have no answers yet, so there is no progress to show'

const PAIRS: Pair[] = [
  {
    name: 'Home: list row',
    mat: () => region(render(createElement(Home)), 'chapter-row'),
    sat: () => region(render(createElement(Home), 'test=sat'), 'chapter-row'),
    matOnly: {
      'chapter-art': 'SAT topics have no chapter picture',
      meter: NO_PROGRESS,
      'meter-fill': NO_PROGRESS,
      'meter-thin': NO_PROGRESS,
    },
    satOnly: {
      'sat-row': 'Row grid without the picture column',
      'sat-row-refs': "The textbook chapters in the topic (Class 7 · Ch 13, 14); MAT rows show the book's chapter number instead",
    },
  },
  {
    name: 'Home: hero',
    mat: () => region(render(createElement(Home)), 'hero'),
    sat: () => region(render(createElement(Home), 'test=sat'), 'hero'),
    matOnly: {},
    satOnly: { 'sat-jump': 'Jump-to-subject buttons; the SAT list is split by subject, MAT has one list' },
  },
  {
    name: 'Topic page: top bar',
    mat: () => region(render(createElement(Chapter, { topic: MAT })), 'topbar'),
    sat: () => region(render(createElement(SatTopic, { topic: SAT })), 'topbar'),
    matOnly: {},
    satOnly: {},
  },
  {
    name: 'Topic page: card',
    mat: () => region(render(createElement(Chapter, { topic: MAT })), 'topic-card'),
    sat: () => region(render(createElement(SatTopic, { topic: SAT })), 'topic-card'),
    matOnly: {
      'chapter-art': 'SAT topics have no chapter picture',
      'topic-head': 'Holds the picture and the intro, which SAT topics lack',
      'topic-intro': 'SAT topics have no intro text',
      meter: NO_PROGRESS,
      'meter-fill': NO_PROGRESS,
      'game-link': 'The games (Guess the rule, cube explorer…) are MAT-only',
    },
    satOnly: {
      'sat-actions': 'One button (Past questions) instead of Learn / Practice / Quick test / Classroom',
      'sat-note': 'Says the questions have no answers yet',
    },
  },
  {
    name: 'Question card',
    mat: () => region(render(createElement(Practice, { topic: MAT, mode: 'exam' })), 'card question'),
    sat: () => region(render(createElement(SatQuestions, { topic: SAT })), 'sat-q'),
    matOnly: {
      question: 'Drift: SatQuestions draws its own card; use the Practice card (QuestionStem + Options) when SAT gets answers',
      'q-head': 'Drift: SAT puts the paper and question number in sat-q-src instead',
      chip: 'Drift: MAT marks past-paper questions with a "Real exam" chip; SAT does not',
      'chip-exam': 'Drift: as chip',
      muted: 'Drift: part of q-head',
      options: 'Drift: SAT lists options in sat-opts, not the shared Options component',
      'options-md': 'Drift: as options',
      option: 'Drift: as options',
      'option-key': 'Drift: SAT uses sat-key',
      'option-value': 'Drift: as options',
    },
    satOnly: {
      'sat-q': 'Drift: see question',
      'sat-q-src': 'Drift: see q-head',
      'sat-prompt': 'Drift: MAT draws the prompt with QuestionStem',
      'sat-opts': 'Drift: see options',
      'sat-key': 'Drift: see option-key',
    },
  },
]

describe('MAT and SAT screens stay in step', () => {
  for (const p of PAIRS) {
    it(p.name, () => {
      const mat = classes(p.mat())
      const sat = classes(p.sat())
      const matOnly = [...mat].filter((c) => !sat.has(c)).sort()
      const satOnly = [...sat].filter((c) => !mat.has(c)).sort()
      // Both directions: a new difference needs a reason, and a listed one that's gone must be deleted.
      expect(matOnly, `${p.name}: classes only on the MAT side`).toEqual(Object.keys(p.matOnly).sort())
      expect(satOnly, `${p.name}: classes only on the SAT side`).toEqual(Object.keys(p.satOnly).sort())
    })
  }
})
