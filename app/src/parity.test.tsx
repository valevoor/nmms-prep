import { createElement } from 'react'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { READY_TOPICS } from './data/topics'
import { SAT_TOPICS, satQuestions, satSolved } from './data/sat'
import { REVISIONS } from './data/satRevise'
import { Chapter } from './pages/Chapter'
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Practice } from './pages/Practice'
import { SatFlashcards } from './pages/SatFlashcards'
import { SatRevise } from './pages/SatRevise'
import { SatPractice } from './pages/SatPractice'
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
  const empty: import('./lib/progress').TopicProgress = { attempts: {}, exam: {}, generated: { correct: 0, wrong: 0 }, mistakes: [], tests: [], best: {}, flash: {} }
  return { ...p, useProgress: () => empty }
})

const MAT = READY_TOPICS.find((t) => t.id === 'number-series')!
const SAT = SAT_TOPICS.find((t) => t.chapters.length === 1 && satQuestions(t).length > 0)!
/** A topic with solved past questions, so its Past exams cards have answer buttons, and one not solved yet. */
const SAT_SOLVED = SAT_TOPICS.find((t) => t.subject === 'maths' && t.chapters.length === 1 && satQuestions(t).some((x) => x.q.answer))!
/** A topic with a revision sheet. */
const SAT_REVISE = SAT_TOPICS.find((t) => t.chapters.some((c) => c.id === REVISIONS[0].en.chapter))!
const SAT_UNSOLVED = SAT_TOPICS.find((t) => t.chapters.length === 1 && satQuestions(t).length > 0 && satSolved(t).length === 0)!

function render(el: ReactElement, query = ''): string {
  route.query = query
  return renderToStaticMarkup(el)
}

/** The first element whose class list holds every class in `sel` ("card question") and whose HTML includes `has`, with all it contains. */
function region(html: string, sel: string, has = ''): string {
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
      if (depth === 0) {
        const found = html.slice(m.index, x.index + x[0].length)
        if (found.includes(has)) return found
        break
      }
    }
  }
  throw new Error(`No element with class "${sel}"`)
}

/**
 * Classes inside the content rather than the screen: the chapter picture's parts (art-*), a number series
 * (series*, term*, comma) and drawn maths (math*: fractions and roots) change from question to question,
 * not between MAT and SAT.
 */
const CONTENT = /^(art-|series|term|comma$|math)/

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

const PAIRS: Pair[] = [
  {
    name: 'Home: list row',
    mat: () => region(render(createElement(Home)), 'chapter-row'),
    sat: () => region(render(createElement(Home), 'test=sat'), 'chapter-row', 'meter-thin'),
    matOnly: {
      'chapter-art': 'SAT topics have no chapter picture',
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
      'game-link': 'The games (Guess the rule, cube explorer…) are MAT-only',
    },
    satOnly: {
      'flash-wide': 'Practice takes its own row: SAT has three buttons where MAT has four',
      'sat-note': 'Says the answers are worked out by us (or not added yet)',
    },
  },
  {
    name: 'Revise: top bar',
    mat: () => region(render(createElement(Learn, { topic: MAT })), 'topbar'),
    sat: () => region(render(createElement(SatRevise, { topic: SAT_REVISE })), 'topbar'),
    matOnly: {},
    satOnly: {},
  },
  {
    name: 'Flash cards: top bar',
    mat: () => region(render(createElement(Learn, { topic: MAT })), 'topbar'),
    sat: () => region(render(createElement(SatFlashcards, { topic: SAT_REVISE })), 'topbar'),
    matOnly: {},
    satOnly: {},
  },
  {
    name: 'Practice: question card (not solved yet)',
    mat: () => region(render(createElement(Practice, { topic: MAT, mode: 'exam' })), 'card question'),
    sat: () => region(render(createElement(SatPractice, { topic: SAT_UNSOLVED, mode: 'exam' })), 'card question'),
    matOnly: {
      options: 'Drift: SAT lists unanswered options in sat-opts, as there is nothing to pick',
      'options-md': 'Drift: as options',
      option: 'Drift: as options',
      'option-key': 'Drift: SAT uses sat-key',
      'option-value': 'Drift: as options',
    },
    satOnly: {
      'sat-q': 'Scopes the rules for paper pictures and long option sentences',
      'sat-prompt': 'Drift: MAT draws the prompt with QuestionStem',
      'sat-opts': 'Drift: see options',
      'sat-key': 'Drift: see option-key',
      actions: 'A question without an answer has only a Next button, below it',
      btn: 'As actions',
      'btn-primary': 'As actions',
      'btn-lg': 'As actions',
    },
  },
  {
    name: 'Practice: tabs',
    mat: () => region(render(createElement(Practice, { topic: MAT, mode: 'exam' })), 'tabs'),
    sat: () => region(render(createElement(SatPractice, { topic: SAT_SOLVED, mode: 'exam' })), 'tabs'),
    matOnly: {},
    satOnly: {},
  },
  {
    name: 'Practice: question card',
    mat: () => region(render(createElement(Practice, { topic: MAT, mode: 'exam' })), 'card question'),
    sat: () => region(render(createElement(SatPractice, { topic: SAT_SOLVED, mode: 'exam' })), 'card question'),
    matOnly: {},
    satOnly: {
      'sat-q': 'Scopes the rules for paper pictures and long option sentences',
      'sat-prompt': 'Drift: MAT draws the prompt with QuestionStem',
    },
  },
  {
    name: 'Practice: no mistakes',
    mat: () => region(render(createElement(Practice, { topic: MAT, mode: 'mistakes' })), 'card empty'),
    sat: () => region(render(createElement(SatPractice, { topic: SAT_SOLVED, mode: 'mistakes' })), 'card empty'),
    matOnly: {},
    satOnly: {},
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
