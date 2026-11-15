/**
 * Mock exam (/mock): a paper under one clock, a minute per question, as in the real exam. The student picks
 * MAT, SAT or both (MAT comes first, as in the exam), all chapters or only some, and the length.
 *
 * MAT, all chapters: a mixed paper takes each chapter's share of the past papers' questions, from the book,
 * the past papers and the chapter's generator; or a real past paper as printed (questions under review left out).
 *
 * SAT, all topics: the real paper's subjects (35 science, 35 social science, 20 maths in a full paper),
 * each subject's topics in the same mix as the past papers. Only questions with an answer are asked: the
 * papers' solved maths and science and the study book's checked questions. The papers' social science has
 * no key yet, so its social science comes from the book, and no real SAT paper is offered.
 *
 * Chosen chapters: their share of the past papers' questions (at least one place each); a chapter that runs
 * out of questions passes its places on to the others, so a small choice can give fewer questions.
 *
 * The exam in progress is saved after every answer, so a student can stop and come back to it; the results
 * of finished exams are kept too. Both live in IndexedDB, like the chapters' progress.
 */
import { useSyncExternalStore } from 'react'
import { del, get, set } from 'idb-keyval'
import { PAPER_FILES, paperQuestions } from '../data/papers'
import { SAT_TOPICS, SECTION_SUBJECT, getSatTopic, satQuestions, satSolved } from '../data/sat'
import type { PaperQuestionRef, SatSubject } from '../data/sat'
import { READY_TOPICS, getTopic } from '../data/topics'
import type { OptionKey, Question } from '../types'

export type MockTest = 'mat' | 'sat'
export const MOCK_TESTS: MockTest[] = ['mat', 'sat']

/** Questions per test; a minute each. */
export const LENGTHS = [15, 45, 90] as const
export type MockLength = (typeof LENGTHS)[number]
export const PASS_PERCENT = 40
/** A real paper gets the real exam's time, whatever its count after questions under review are left out. */
const PAPER_MINUTES = 90
/** In a mixed MAT paper, about this share of each chapter's questions is newly generated (where it has a generator). */
const GENERATED_SHARE = 0.4
/** The SAT paper's subjects, in the paper's order (science, social science, maths), and their share of a full paper. */
export const SAT_SPLIT: [SatSubject, number][] = [
  ['science', 35],
  ['social', 35],
  ['maths', 20],
]

export interface MockConfig {
  tests: MockTest[]
  /** Chosen MAT chapter ids; missing means all. */
  mat?: string[]
  /** Chosen SAT topic ids; missing means all. */
  sat?: string[]
  /** A real MAT paper's id: MAT only, all chapters. */
  paper?: string
  length: MockLength
}

/** A question of the exam. A MAT question is stored whole (generated ones exist nowhere else); a SAT one by where it is. */
export interface MockItem {
  /** A MAT chapter id or a SAT topic id. */
  topic: string
  q?: Question
  sat?: { paper: string; id: string }
}

export interface MockExam {
  config: MockConfig
  startedAt: number
  seconds: number
  items: MockItem[]
  answers: (OptionKey | null)[]
  marked: boolean[]
  /** Seconds spent on each question while it was on screen. */
  spent: number[]
  /** Seconds used so far; the clock only runs while the exam is open. */
  used: number
  index: number
  /** On screen with the clock running. False when the student has left it: it waits on the start page to be resumed. */
  running?: boolean
  /** When it was submitted; the result page shows it until a new one is started. */
  finished?: number
}

export interface MockResult {
  config: MockConfig
  at: number
  score: number
  total: number
  seconds: number
  /** Each test's score, as each must reach the pass mark on its own. */
  parts: { test: MockTest; score: number; total: number }[]
}

export const itemTest = (x: MockItem): MockTest => (x.sat ? 'sat' : 'mat')

// ---------- SAT questions ----------

/** Every SAT question with an answer, by `<source>/<id>`, with its topic. */
const SAT_INDEX = new Map<string, PaperQuestionRef & { topic: string }>()
for (const t of SAT_TOPICS) for (const x of satSolved(t)) SAT_INDEX.set(`${x.paper.id}/${x.q.id}`, { ...x, topic: t.id })

/** A SAT item's question and source, or undefined if it no longer exists (or lost its answer) after an update. */
export function satRef(item: MockItem): (PaperQuestionRef & { topic: string }) | undefined {
  return item.sat ? SAT_INDEX.get(`${item.sat.paper}/${item.sat.id}`) : undefined
}

/** The right answer to an item. */
export function answerOf(item: MockItem): OptionKey | undefined {
  return item.q ? item.q.answer : satRef(item)?.q.answer
}

/** The subject of a SAT item. */
export function satSubjectOf(item: MockItem): SatSubject | undefined {
  const r = satRef(item)
  return r ? SECTION_SUBJECT[r.q.subject] : undefined
}

// ---------- building a paper ----------

function shuffle<T>(a: T[], rng: () => number): T[] {
  return a
    .map((x) => [rng(), x] as const)
    .sort((p, q) => p[0] - q[0])
    .map(([, x]) => x)
}

/**
 * Splits `total` by weight (largest remainder; ties to the larger weight), never giving a row more than its
 * `cap`: what a row can't take goes to the others. Keeps the order.
 */
export function shares<T extends { weight: number; cap: number }>(rows: T[], total: number): (T & { n: number })[] {
  const out = rows.map((x) => ({ ...x, n: 0 }))
  let left = Math.min(total, out.reduce((s, x) => s + x.cap, 0))
  while (left > 0) {
    const open = out.filter((x) => x.n < x.cap)
    const sum = open.reduce((s, x) => s + x.weight, 0)
    const exact = open.map((x) => ({ x, e: (left * x.weight) / sum }))
    let given = 0
    for (const { x, e } of exact) {
      const add = Math.min(Math.floor(e), x.cap - x.n)
      x.n += add
      given += add
    }
    // The remainders, largest first, one place each.
    for (const { x } of exact.filter(({ x }) => x.n < x.cap).sort((a, b) => b.e - Math.floor(b.e) - (a.e - Math.floor(a.e)) || b.x.weight - a.x.weight)) {
      if (given >= left) break
      x.n++
      given++
    }
    left -= given
  }
  return out
}

/** A MAT chapter's questions that aren't generated: the book's and the past papers'. */
const matPool = (id: string): Question[] => [...(getTopic(id)?.questions ?? []), ...paperQuestions(id)]

/** How many questions each MAT chapter gets: its share of all past-paper questions (a chosen chapter never asked gets one share). */
export function chapterShares(total: number, chosen?: string[]): { topic: string; n: number }[] {
  const rows = READY_TOPICS.filter((t) => !chosen || chosen.includes(t.id))
    .sort((a, b) => a.chapter - b.chapter)
    .map((t) => ({ topic: t.id, weight: paperQuestions(t.id).length || (chosen ? 1 : 0), cap: t.generate ? Infinity : matPool(t.id).length }))
    .filter((x) => x.weight > 0)
  return shares(rows, total)
    .filter((x) => x.n > 0)
    .map(({ topic, n }) => ({ topic, n }))
}

/** A chapter's questions for a mixed MAT paper: some generated, the rest from the book and past papers, never the same one twice. */
function chapterQuestions(topicId: string, n: number, rng: () => number): Question[] {
  const topic = getTopic(topicId)
  if (!topic) return []
  const pool = shuffle(matPool(topicId), rng)
  const seen = new Set<string>()
  const out: Question[] = []
  while (out.length < n) {
    const fresh = topic.generate && (rng() < GENERATED_SHARE || pool.length === 0)
    if (fresh) {
      out.push(topic.generate!(rng))
      continue
    }
    const q = pool.pop()
    if (!q) break
    if (seen.has(q.id)) continue
    seen.add(q.id)
    out.push(q)
  }
  return out
}

/** SAT topics' questions: each topic its share (by past-paper questions) of `n`, from its answered questions, grouped in syllabus order. */
function satTopicsQuestions(topicIds: string[], n: number, rng: () => number, chosen: boolean): MockItem[] {
  const topics = SAT_TOPICS.filter((t) => topicIds.includes(t.id))
  const rows = topics
    .map((t) => ({ topic: t.id, weight: satQuestions(t).length || (chosen ? 1 : 0), cap: satSolved(t).length }))
    .filter((x) => x.weight > 0 && x.cap > 0)
  let plan = shares(rows, n)
  // All topics: a topic never asked has no share, but its questions can fill places others can't.
  if (!chosen && plan.reduce((s, x) => s + x.n, 0) < n) {
    const spare = topics.filter((t) => satQuestions(t).length === 0 && satSolved(t).length > 0).map((t) => ({ topic: t.id, weight: 1, cap: satSolved(t).length, n: 0 }))
    const short = n - plan.reduce((s, x) => s + x.n, 0)
    plan = [...plan, ...shares(spare, short)]
  }
  const order = new Map(SAT_TOPICS.map((t, i) => [t.id, i]))
  return plan
    .sort((a, b) => order.get(a.topic)! - order.get(b.topic)!)
    .flatMap(({ topic, n: k }) =>
      shuffle(satSolved(getSatTopic(topic)!), rng)
        .slice(0, k)
        .map((x) => ({ topic, sat: { paper: x.paper.id, id: x.q.id } })),
    )
}

function matItems(c: MockConfig, rng: () => number): MockItem[] {
  if (c.paper && !c.mat) {
    const paper = PAPER_FILES.find((p) => p.id === c.paper)
    if (!paper) return []
    return paper.questions.filter((q) => q.topic && q.status !== 'needs-review' && getTopic(q.topic)).map((q) => ({ topic: q.topic!, q }))
  }
  return chapterShares(c.length, c.mat).flatMap(({ topic, n }) => chapterQuestions(topic, n, rng).map((q) => ({ topic, q })))
}

function satItems(c: MockConfig, rng: () => number): MockItem[] {
  if (c.sat) return satTopicsQuestions(c.sat, c.length, rng, true)
  // All topics: the real paper's subjects, scaled to the length.
  const split = shares(
    SAT_SPLIT.map(([subject, k]) => ({ subject, weight: k, cap: Infinity })),
    c.length,
  )
  return split.flatMap(({ subject, n }) =>
    satTopicsQuestions(
      SAT_TOPICS.filter((t) => t.subject === subject).map((t) => t.id),
      n,
      rng,
      false,
    ),
  )
}

/** The questions of a mock exam, in order: MAT first, then SAT. */
export function buildMock(c: MockConfig, rng: () => number = Math.random): MockItem[] {
  return [...(c.tests.includes('mat') ? matItems(c, rng) : []), ...(c.tests.includes('sat') ? satItems(c, rng) : [])]
}

/** How many questions a choice of chapters can give a test (generated MAT chapters never run out). */
export function available(test: MockTest, chosen: string[]): number {
  if (test === 'mat') return chosen.reduce((s, id) => s + (getTopic(id)?.generate ? Infinity : matPool(id).length), 0)
  return chosen.reduce((s, id) => s + (getSatTopic(id) ? satSolved(getSatTopic(id)!).length : 0), 0)
}

/** The exam's time: a minute a question, except a real paper, which gets the real exam's time. */
export function mockSeconds(c: MockConfig, items: MockItem[]): number {
  const sat = items.filter((x) => x.sat).length
  return 60 * ((c.paper && !c.mat ? PAPER_MINUTES : items.length - sat) + sat)
}

export function newMock(c: MockConfig): MockExam {
  const items = buildMock(c)
  return {
    config: c,
    startedAt: Date.now(),
    seconds: mockSeconds(c, items),
    items,
    answers: items.map(() => null),
    marked: items.map(() => false),
    spent: items.map(() => 0),
    used: 0,
    index: 0,
  }
}

// ---------- results ----------

const isRight = (m: MockExam, i: number) => m.answers[i] === answerOf(m.items[i])

export function scoreMock(m: MockExam): number {
  return m.items.filter((_, i) => isRight(m, i)).length
}

/** Each test's score in the exam, MAT first. */
export function byTest(m: MockExam): { test: MockTest; score: number; total: number }[] {
  return MOCK_TESTS.map((test) => {
    const idx = m.items.map((x, i) => [x, i] as const).filter(([x]) => itemTest(x) === test)
    return { test, score: idx.filter(([, i]) => isRight(m, i)).length, total: idx.length }
  }).filter((r) => r.total > 0)
}

const topicOrder = (test: MockTest, id: string) => (test === 'sat' ? 1000 + SAT_TOPICS.findIndex((t) => t.id === id) : (getTopic(id)?.chapter ?? 0))

/** Right answers per MAT chapter and SAT topic, weakest first (ties: more questions first, then book order). */
export function byChapter(m: MockExam): { test: MockTest; topic: string; right: number; total: number }[] {
  const rows = new Map<string, { test: MockTest; topic: string; right: number; total: number }>()
  m.items.forEach((x, i) => {
    const test = itemTest(x)
    const key = `${test}/${x.topic}`
    const r = rows.get(key) ?? { test, topic: x.topic, right: 0, total: 0 }
    r.total++
    if (isRight(m, i)) r.right++
    rows.set(key, r)
  })
  return [...rows.values()].sort((a, b) => a.right / a.total - b.right / b.total || b.total - a.total || topicOrder(a.test, a.topic) - topicOrder(b.test, b.topic))
}

/** SAT: right answers per subject, in the paper's order. */
export function bySubject(m: MockExam): { subject: SatSubject; right: number; total: number }[] {
  return SAT_SPLIT.map(([subject]) => {
    const idx = m.items.map((x, i) => [x, i] as const).filter(([x]) => satSubjectOf(x) === subject)
    return { subject, right: idx.filter(([, i]) => isRight(m, i)).length, total: idx.length }
  }).filter((r) => r.total > 0)
}

/**
 * The chapter that took longest per question, if it took well over the exam's time per question
 * (at least 1.5 times). Only answered questions count, so a chapter that was skipped isn't "slow".
 */
export function slowestChapter(m: MockExam): { test: MockTest; topic: string; perQuestion: number } | undefined {
  const per = m.seconds / m.items.length
  const rows = new Map<string, { test: MockTest; topic: string; s: number; n: number }>()
  m.items.forEach((x, i) => {
    if (!m.answers[i]) return
    const test = itemTest(x)
    const key = `${test}/${x.topic}`
    const r = rows.get(key) ?? { test, topic: x.topic, s: 0, n: 0 }
    rows.set(key, { ...r, s: r.s + m.spent[i], n: r.n + 1 })
  })
  let best: { test: MockTest; topic: string; perQuestion: number } | undefined
  for (const r of rows.values()) {
    const p = r.s / r.n
    if (p >= per * 1.5 && (!best || p > best.perQuestion)) best = { test: r.test, topic: r.topic, perQuestion: Math.round(p) }
  }
  return best
}

// ---------- saved state ----------

const CURRENT = 'mock:current'
const HISTORY = 'mock:history'
const MAX_HISTORY = 30

interface Saved {
  /** The exam in progress, or just finished. */
  current: MockExam | null
  /** Finished exams, oldest first. */
  history: MockResult[]
  loaded: boolean
}

let saved: Saved = { current: null, history: [], loaded: false }
const listeners = new Set<() => void>()
/** Holds 'load' once the saved state has been asked for (once per app run), as lib/progress.ts does. */
const started = new Set<string>()

function emit(next: Partial<Saved>) {
  saved = { ...saved, ...next }
  listeners.forEach((l) => l())
}

/** Whether a saved exam can still be shown: every question still exists after an update to the questions. */
function stillValid(m: MockExam): boolean {
  return !!m.config && m.items.every((x) => (x.sat ? satRef(x) && getSatTopic(x.topic) : x.q && getTopic(x.topic)))
}

async function load() {
  try {
    const [current, history] = await Promise.all([get<MockExam>(CURRENT), get<MockResult[]>(HISTORY)])
    // An exam left open when the app was closed waits to be resumed, with its clock stopped.
    emit({ current: current && stillValid(current) ? { ...current, running: false } : null, history: (history ?? []).filter((r) => r.config), loaded: true })
  } catch {
    // Storage blocked (private mode): mock exams still work, they just aren't saved.
    emit({ loaded: true })
  }
}

/** The exam in progress (if any) and the results of finished ones, newest last. */
export function useMockStore(): Saved {
  if (!started.has('load')) {
    started.add('load')
    void load()
  }
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => saved,
  )
}

/** Replaces the exam in progress. `persist: false` only updates memory (the clock's ticks); the next save writes it. */
export function saveCurrent(m: MockExam | null, persist = true) {
  emit({ current: m })
  if (persist) (m ? set(CURRENT, m) : del(CURRENT)).catch(() => {})
}

/** Stops the clock of the exam in progress, if there is one (the student left its page), and saves it. */
export function pauseCurrent() {
  const m = saved.current
  if (m && !m.finished) saveCurrent({ ...m, running: false })
}

export function saveResult(r: MockResult) {
  const history = [...saved.history, r].slice(-MAX_HISTORY)
  emit({ history })
  set(HISTORY, history).catch(() => {})
}

/** The best result on a real MAT paper. */
export function bestOnPaper(history: MockResult[], paper: string): MockResult | undefined {
  return history.filter((r) => r.config.paper === paper && !r.config.mat).reduce<MockResult | undefined>((b, r) => (!b || r.score / r.total > b.score / b.total ? r : b), undefined)
}
