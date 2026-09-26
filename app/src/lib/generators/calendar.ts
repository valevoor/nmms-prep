import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both } from '../i18n/gen'
import type { GenText, Text } from '../i18n/gen'
import type { Locale } from '../i18n/locale'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
export const monthLength = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
/** Days from 1 January of year y to (y, m, d), 0-based. */
const dayOfYear = (y: number, m: number, d: number) => Array.from({ length: m }, (_, i) => monthLength(y, i)).reduce((a, b) => a + b, 0) + d - 1

interface CalDraft {
  pattern: PatternId
  prompt: Text
  rule: Text
  working: Text
  answer: Text
  wrong: Text[]
}

const dayText = (d: number): Text => both((m) => m.days[((d % 7) + 7) % 7])
/** Three other weekdays: the ones next to the answer and one more. */
const wrongDays = (rng: Rng, d: number, avoid: number[] = []): Text[] =>
  shuffle(rng, [d + 1, d - 1, d + 2, d - 2, d + 3].map((x) => ((x % 7) + 7) % 7).filter((x) => x !== ((d % 7) + 7) % 7 && !avoid.includes(x)))
    .slice(0, 3)
    .map(dayText)
const num = (n: number): Text => both(() => String(n))
const wrongNums = (rng: Rng, n: number, near: number[]): Text[] => [...new Set(shuffle(rng, near).filter((x) => x !== n && x > 0))].slice(0, 3).map(num)
const oddWork = (m: GenText, n: number, from: number, back: boolean) =>
  m.oddDaysWork(n, Math.floor(n / 7), n % 7, m.days[from], m.days[(((from + (back ? -n : n)) % 7) + 7) % 7], back)

function daysAfter(rng: Rng): CalDraft {
  const today = int(rng, 0, 6)
  const n = int(rng, 8, 400)
  const back = rng() < 0.3
  const ans = today + (back ? -n : n)
  return {
    pattern: 'cal-after',
    prompt: both((m) => (back ? m.calBeforeAsk(m.days[today], n) : m.calAfterAsk(m.days[today], n))),
    rule: both((m) => m.oddDaysRule),
    working: both((m) => oddWork(m, n, today, back)),
    answer: dayText(ans),
    // Includes the classic slip of going the wrong way.
    wrong: [dayText(today + (back ? n : -n)), ...wrongDays(rng, ans, [((today + (back ? n : -n)) % 7 + 7) % 7])].slice(0, 3),
  }
}

function sameMonth(rng: Rng): CalDraft {
  const a = int(rng, 1, 15)
  const b = int(rng, a + 3, 31)
  const day = int(rng, 0, 6)
  const n = b - a
  const ans = day + n
  return {
    pattern: 'cal-same-month',
    prompt: both((m) => m.calMonthAsk(a, m.days[day], b)),
    rule: both((m) => m.oddDaysRule),
    working: both((m) => (n % 7 === 0 ? m.sameWeekday(m.days[day], String(b)) : `${b} − ${a} = ${oddWork(m, n, day, false)}`)),
    answer: dayText(ans),
    wrong: wrongDays(rng, ans),
  }
}

function dateInYear(rng: Rng): CalDraft {
  const y = int(rng, 1995, 2030)
  const m1 = int(rng, 0, 9)
  const d1 = int(rng, 1, monthLength(y, m1))
  const m2 = int(rng, m1 + 1, Math.min(11, m1 + 3))
  const d2 = int(rng, 1, monthLength(y, m2))
  const n = dayOfYear(y, m2, d2) - dayOfYear(y, m1, d1)
  const day = new Date(Date.UTC(y, m1, d1)).getUTCDay()
  const ans = day + n
  const parts = (m: GenText) => {
    const bits = [`${monthLength(y, m1) - d1} (${m.months[m1]})`]
    for (let k = m1 + 1; k < m2; k++) bits.push(`${monthLength(y, k)} (${m.months[k]})`)
    bits.push(`${d2} (${m.months[m2]})`)
    return bits.join(' + ')
  }
  const feb = m1 <= 1 && m2 >= 2
  return {
    pattern: 'cal-date',
    prompt: both((m) => m.calDateAsk(m.date(d1, m.months[m1], y), m.days[day], m.date(d2, m.months[m2], y))),
    rule: both((m) => m.oddDaysRule + (feb ? ' ' + (isLeap(y) ? m.leapNote(y) : m.notLeapNote(y)) : '')),
    working: both((m) => `${m.monthDays(parts(m), n)}. ${oddWork(m, n, day, false)}`),
    answer: dayText(ans),
    wrong: wrongDays(rng, ans),
  }
}

function countDays(rng: Rng): CalDraft {
  const y = int(rng, 1995, 2030)
  const m1 = int(rng, 0, 9)
  const d1 = int(rng, 1, monthLength(y, m1))
  const m2 = int(rng, m1 + 1, Math.min(11, m1 + 3))
  const d2 = int(rng, 1, monthLength(y, m2))
  const n = dayOfYear(y, m2, d2) - dayOfYear(y, m1, d1) + 1
  const parts = (m: GenText) => {
    const bits = [`${monthLength(y, m1) - d1 + 1} (${m.months[m1]})`]
    for (let k = m1 + 1; k < m2; k++) bits.push(`${monthLength(y, k)} (${m.months[k]})`)
    bits.push(`${d2} (${m.months[m2]})`)
    return bits.join(' + ')
  }
  const feb = m1 <= 1 && m2 >= 2
  return {
    pattern: 'cal-count',
    prompt: both((m) => m.calCountAsk(m.date(d1, m.months[m1], y), m.date(d2, m.months[m2], y))),
    rule: both((m) => m.countRule + (feb ? ' ' + (isLeap(y) ? m.leapNote(y) : m.notLeapNote(y)) : '')),
    working: both((m) => m.monthDays(parts(m), n)),
    answer: num(n),
    // Forgetting to count the first day, counting one too many, or the wrong February.
    wrong: wrongNums(rng, n, [n - 1, n + 1, feb ? (isLeap(y) ? n - 1 : n + 1) : n + 2, n - 2, n + 2]),
  }
}

function weeks(rng: Rng): CalDraft {
  const w = int(rng, 2, 12)
  const d = int(rng, 1, 13)
  const t = 7 * w + d
  return {
    pattern: 'cal-weeks',
    prompt: both((m) => m.calWeeksAsk(w, d)),
    rule: both((m) => m.weeksRule),
    working: both((m) => m.weeksWork(w, d, t)),
    answer: num(t),
    wrong: wrongNums(rng, t, [w + d, 7 * w, 7 * (w + 1) + d, t - 7 + 1, t + 1, t - 1]),
  }
}

const BUILDERS = [daysAfter, sameMonth, dateInYear, countDays, weeks]

let counter = 0

export function generateCalendar(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    if (new Set([d.answer.en, ...d.wrong.map((w) => w.en)]).size !== 4) continue
    const order = shuffle(rng, [d.answer, ...d.wrong])
    const opts = (l: Locale) => Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j][l]])) as Record<OptionKey, string>
    return {
      id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [],
      prompt: d.prompt.en,
      options: opts('en'),
      answer: OPTION_KEYS[order.indexOf(d.answer)],
      rule: d.rule.en,
      working: d.working.en,
      pattern: d.pattern,
      generated: true,
      kn: { prompt: d.prompt.kn, rule: d.rule.kn, working: d.working.kn, options: opts('kn') },
    }
  }
}
