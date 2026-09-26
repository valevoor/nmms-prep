/**
 * Checks every Clock book question from the hand positions (degrees), not the book's formulas.
 * Exactly one option must be right and marked; hidden (needs-review) questions must have no right option.
 * Run from app/:  npx tsx ../tools/check_clock.ts
 */
import data from '../app/src/data/mat/clock.json' with { type: 'json' }

const hands = (h: number, m: number) => [((h % 12) * 60 + m) * 0.5, (m * 6) % 360] as const
const smaller = (h: number, m: number) => {
  const [a, b] = hands(h, m)
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}
const deg = (x: number) => `${x}°`
/** Minutes past h (in elevenths) when the hands overlap. */
const meet = (h: number) => {
  for (let e = 1; e < 660; e++) {
    const [a, b] = hands(h, e / 11)
    if (Math.abs(a - b) < 1e-9) return `${h}:${String(Math.floor(e / 11)).padStart(2, '0')} ${e % 11}/11`
  }
  return 'never'
}
/** The real time whose left–right mirror image shows (h, m). */
const mirror = (h: number, m: number) => {
  const [ia, ib] = hands(h, m)
  for (let t = 0; t < 720; t++) {
    const [a, b] = hands(Math.floor(t / 60), t % 60)
    if (Math.abs(((360 - a) % 360) - ia) < 1e-9 && Math.abs(((360 - b) % 360) - ib) < 1e-9) return `${Math.floor(t / 60) || 12}:${String(t % 60).padStart(2, '0')}`
  }
  return 'none'
}
/** The real time whose upside-down (water) image shows (h, m), if any time fits exactly. */
const water = (h: number, m: number) => {
  const [ia, ib] = hands(h, m)
  for (let t = 0; t < 720; t++) {
    const [a, b] = hands(Math.floor(t / 60), t % 60)
    if (Math.abs(((540 - a) % 360) - ia) < 1e-9 && Math.abs(((540 - b) % 360) - ib) < 1e-9) return `${Math.floor(t / 60) || 12}:${String(t % 60).padStart(2, '0')}`
  }
  return 'no exact time'
}

const RULES: Record<string, () => string> = {
  'cl-b01': () => deg((15 - 9) * 30),
  'cl-b02': () => deg(360 - smaller(6, 30)),
  'cl-b03': () => water(2, 25),
  'cl-b04': () => mirror(4, 45),
  'cl-b05': () => mirror(11, 25),
  'cl-b06': () => deg(smaller(5, 50)),
  'cl-b07': () => deg(smaller(9, 10)),
  'cl-b08': () => deg(360 - smaller(7, 28)),
  // 15 minutes a day for the 16 hours from noon to 4 am.
  'cl-b09': () => `4:${String((15 * 16) / 24).padStart(2, '0')} am`,
  'cl-b10': () => meet(6),
  'cl-b11': () => meet(9),
}

let bad = 0
for (const q of data.questions) {
  const want = RULES[q.id]()
  const fits = Object.entries(q.options).filter(([, v]) => v === want).map(([k]) => k)
  if ('status' in q) {
    if (fits.length === 0) console.log(`✓ Q${q.bookNo}: hidden; the hands say "${want}", and no option says it`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but option ${fits.join(', ')} fits "${want}"`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${want}  →  ${q.answer}${q.keyFrom === 'solved' ? ' (solved; book key differs)' : ''}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: hands say "${want}"; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}
if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
