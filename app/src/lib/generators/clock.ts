import { OPTION_KEYS } from '../../types'
import type { OptionKey, PatternId, Question } from '../../types'
import { both } from '../i18n/gen'
import type { Text } from '../i18n/gen'
import type { Locale } from '../i18n/locale'
import { int, pick, shuffle } from './numberSeries'
import type { Rng } from './numberSeries'

/** "72.5" → "72½". */
const deg = (x: number) => `${Math.floor(x)}${x % 1 ? '½' : ''}°`
const hm = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`
/** Minutes past the hour as a mixed number in elevenths: 32 8/11. */
const elevenths = (num: number) => ({ whole: Math.floor(num / 11), part: num % 11 })
const clockTime = (h: number, num: number) => {
  const { whole, part } = elevenths(num)
  return `${h}:${String(whole).padStart(2, '0')}${part ? ` ${part}/11` : ''}`
}
/** 12-hour time with am/pm, from minutes since midnight. */
const ampm = (mins: number) => {
  const t = ((mins % 1440) + 1440) % 1440
  const h24 = Math.floor(t / 60)
  return `${h24 % 12 || 12}:${String(t % 60).padStart(2, '0')} ${h24 < 12 ? 'am' : 'pm'}`
}

interface ClockDraft {
  pattern: PatternId
  prompt: Text
  rule: Text
  working: Text
  answer: string
  wrong: string[]
  clock?: [number, number]
}

function angle(rng: Rng): ClockDraft | undefined {
  const h = int(rng, 1, 12)
  const m = int(rng, 0, 59)
  const hd = ((h % 12) * 30 + m / 2) % 360
  const md = m * 6
  const diff = Math.abs(hd - md)
  const small = Math.min(diff, 360 - diff)
  if (small === 0 || small === 180) return undefined
  const reflex = rng() < 0.3
  const ans = reflex ? 360 - small : small
  // Forgetting that the hour hand also moves, and picking the other angle.
  const noHalf = Math.abs((h % 12) * 30 - md)
  const noHalfSmall = Math.min(noHalf, 360 - noHalf)
  const wrong = [reflex ? small : 360 - small, reflex ? 360 - noHalfSmall : noHalfSmall, ans + 15, ans - 15, ans + 30].filter((x) => x > 0 && x < 360 && x !== ans)
  const t = hm(h, m)
  const diffText = small === diff ? `${deg(Math.max(hd, md))} − ${deg(Math.min(hd, md))} = ${deg(small)}` : `360° − ${deg(diff)} = ${deg(small)}`
  return {
    pattern: 'clock-angle',
    prompt: both((mm) => mm.angleAsk(t, reflex)),
    rule: both((mm) => mm.angleRule),
    working: both((mm) => mm.angleWork(h % 12, m, deg(hd).replace('°', ''), md, reflex ? `${diffText}; 360° − ${deg(small)} = ${deg(ans)}` : diffText, deg(ans))),
    answer: deg(ans),
    wrong: [...new Set(wrong.map(deg))],
    clock: [h, m],
  }
}

function mirror(rng: Rng): ClockDraft {
  const h = int(rng, 1, 11)
  const m = int(rng, 1, 59)
  const rh = 11 - h || 12
  const rm = 60 - m
  const img = hm(h, m)
  const real = hm(rh, rm)
  return {
    pattern: 'clock-mirror',
    prompt: both((mm) => mm.mirrorAsk(img)),
    rule: both((mm) => mm.mirrorRule),
    working: both((mm) => mm.mirrorWork(img, real)),
    answer: real,
    wrong: [hm(12 - h, rm), hm(rh, m), hm(h, rm), hm((rh % 12) + 1, rm)],
    clock: [rh, rm],
  }
}

function together(rng: Rng): ClockDraft | undefined {
  const h = int(rng, 1, 10)
  const opposite = rng() < 0.4
  if (opposite && h === 6) return undefined
  // Minute spaces the minute hand must gain, and the time (in elevenths of a minute) that takes.
  const gap = opposite ? (h < 6 ? 5 * h + 30 : 5 * h - 30) : 5 * h
  const num = gap * 12
  // Opposite between 5 and 6 only happens at 6:00 exactly, which isn't between them.
  if (num <= 0 || num >= 660) return undefined
  const ans = clockTime(h, num)
  const wrong = [clockTime(h, num + 11), clockTime(h, num - 11), clockTime(h, num + 1), clockTime(h, num - 1), clockTime(h, gap * 11)]
  const { whole, part } = elevenths(num)
  return {
    pattern: 'clock-together',
    prompt: both((mm) => mm.togetherAsk(h, opposite)),
    rule: both((mm) => mm.togetherRule),
    working: both((mm) => mm.togetherWork(h, gap, `${whole}${part ? ` ${part}/11` : ''}`)),
    answer: ans,
    wrong: [...new Set(wrong)].filter((w) => w !== ans),
    clock: [h, num / 11],
  }
}

function turn(rng: Rng): ClockDraft {
  const start = int(rng, 12, 44) * 30
  const hours = int(rng, 2, 20) / 2
  const end = start + hours * 60
  const d = hours * 30
  return {
    pattern: 'clock-turn',
    prompt: both((mm) => mm.handTurnAsk(ampm(start), ampm(end))),
    rule: both((mm) => mm.handTurnRule),
    working: both((mm) => mm.handTurnWork(String(hours), d)),
    answer: deg(d),
    // The minute hand's turn, and a slip of one hour either way.
    wrong: [...new Set([deg((hours * 360) % 720 || 360), deg(d + 30), deg(d - 30), deg(d + 15)])].filter((w) => w !== deg(d) && !w.startsWith('-') && w !== '0°'),
  }
}

function gain(rng: Rng): ClockDraft | undefined {
  const g = pick(rng, [12, 18, 24, 36, 48])
  const hrs = int(rng, 2, 22)
  const err = (g * hrs) / 24
  if (!Number.isInteger(err)) return undefined
  const fast = rng() < 0.6
  const set = pick(rng, [6, 8, 10, 12]) * 60
  const real = set + hrs * 60
  const shows = real + (fast ? err : -err)
  return {
    pattern: 'clock-gain',
    prompt: both((mm) => mm.gainAsk(g, fast, ampm(set), ampm(real))),
    rule: both((mm) => mm.gainRule),
    working: both((mm) => mm.gainWork(hrs, g, err, fast, ampm(shows))),
    answer: ampm(shows),
    wrong: [...new Set([ampm(real + (fast ? -err : err)), ampm(real + (fast ? g : -g)), ampm(real), ampm(shows + (fast ? 5 : -5))])].filter((w) => w !== ampm(shows)),
  }
}

const BUILDERS = [angle, angle, mirror, together, turn, gain]

let counter = 0

export function generateClock(rng: Rng = Math.random): Question {
  for (;;) {
    const d = pick(rng, BUILDERS)(rng)
    const wrong = d ? [...new Set(d.wrong)].filter((w) => w !== d.answer) : []
    if (!d || wrong.length < 3) continue
    const order = shuffle(rng, [d.answer, ...shuffle(rng, wrong).slice(0, 3)])
    const opts = Object.fromEntries(OPTION_KEYS.map((k, j) => [k, order[j]])) as Record<OptionKey, string>
    const loc = (l: Locale) => ({ prompt: d.prompt[l], rule: d.rule[l], working: d.working[l] })
    return {
      id: `gen-${d.pattern}-${(counter++).toString(36)}-${int(rng, 0, 1e9).toString(36)}`,
      layout: 'text',
      terms: [],
      ...loc('en'),
      options: opts,
      answer: OPTION_KEYS[order.indexOf(d.answer)],
      pattern: d.pattern,
      generated: true,
      clock: d.clock,
      kn: loc('kn'),
    }
  }
}
