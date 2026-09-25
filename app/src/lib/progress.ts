import { useSyncExternalStore } from 'react'
import { get, set } from 'idb-keyval'
import type { Question } from '../types'

export interface Attempt {
  correct: number
  wrong: number
  lastCorrect: boolean
}

export interface TestResult {
  at: number
  score: number
  total: number
  seconds: number
}

export interface TopicProgress {
  /** Book questions, by id. */
  attempts: Record<string, Attempt>
  /** Generated questions answered (they aren't stored one by one). */
  generated: { correct: number; wrong: number }
  /** Questions answered wrong and not yet answered right again. Newest first. */
  mistakes: Question[]
  tests: TestResult[]
  /** Best scores in games such as "Guess the rule", by game id. */
  best: Record<string, number>
}

const MAX_MISTAKES = 50
const empty = (): TopicProgress => ({ attempts: {}, generated: { correct: 0, wrong: 0 }, mistakes: [], tests: [], best: {} })

const cache = new Map<string, TopicProgress>()
const listeners = new Set<() => void>()
const key = (topic: string) => `progress:${topic}`

function emit() {
  listeners.forEach((l) => l())
}

async function load(topic: string) {
  try {
    const saved = await get<TopicProgress>(key(topic))
    if (saved) {
      cache.set(topic, { ...empty(), ...saved })
      emit()
    }
  } catch {
    // Storage can be blocked (private mode); the app still works without saving.
  }
}

function update(topic: string, fn: (p: TopicProgress) => TopicProgress) {
  const next = fn(cache.get(topic) ?? empty())
  cache.set(topic, next)
  emit()
  set(key(topic), next).catch(() => {})
}

export function recordAnswer(topic: string, q: Question, correct: boolean) {
  update(topic, (p) => {
    const next: TopicProgress = { ...p }
    if (q.generated) {
      next.generated = { ...p.generated, [correct ? 'correct' : 'wrong']: p.generated[correct ? 'correct' : 'wrong'] + 1 }
    } else {
      const a = p.attempts[q.id] ?? { correct: 0, wrong: 0, lastCorrect: false }
      next.attempts = {
        ...p.attempts,
        [q.id]: { correct: a.correct + (correct ? 1 : 0), wrong: a.wrong + (correct ? 0 : 1), lastCorrect: correct },
      }
    }
    const others = p.mistakes.filter((m) => m.id !== q.id)
    next.mistakes = correct ? others : [q, ...others].slice(0, MAX_MISTAKES)
    return next
  })
}

export function recordTest(topic: string, result: TestResult) {
  update(topic, (p) => ({ ...p, tests: [...p.tests, result].slice(-20) }))
}

/** Saves a game score if it beats the previous best; returns true for a new record. */
export function recordBest(topic: string, game: string, score: number): boolean {
  const prev = (cache.get(topic) ?? empty()).best[game]
  if (prev !== undefined && prev >= score) return false
  update(topic, (p) => ({ ...p, best: { ...p.best, [game]: score } }))
  return true
}

export function resetProgress(topic: string) {
  update(topic, () => empty())
}

const loaded = new Set<string>()
const EMPTY = empty()

export function useProgress(topic: string): TopicProgress {
  if (!loaded.has(topic)) {
    loaded.add(topic)
    void load(topic)
  }
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => cache.get(topic) ?? EMPTY,
  )
}

export function summarize(p: TopicProgress, bookTotal: number) {
  const book = Object.values(p.attempts)
  const correct = book.reduce((s, a) => s + a.correct, 0) + p.generated.correct
  const answered = correct + book.reduce((s, a) => s + a.wrong, 0) + p.generated.wrong
  return {
    bookDone: book.length,
    bookMastered: book.filter((a) => a.lastCorrect).length,
    bookTotal,
    answered,
    accuracy: answered ? Math.round((100 * correct) / answered) : null,
    best: p.tests.reduce<TestResult | null>((b, t) => (!b || t.score / t.total > b.score / b.total ? t : b), null),
  }
}
