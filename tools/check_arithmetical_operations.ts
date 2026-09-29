/**
 * Checks every Arithmetical Operations book question: each option is put into the equation (signs
 * filled in, letters decoded, signs or numbers swapped, or meanings changed), and both sides are
 * worked out. Letters such as a, b, p, q get several random values, so "2a" must hold for all of
 * them. Exactly one option must make the equation true, and it must be the marked one.
 * Run from app/:  npx tsx ../tools/check_arithmetical_operations.ts
 */
import data from '../app/src/data/mat/arithmetical-operations.json' with { type: 'json' }

/** The letters and shapes each chapter direction gives, written out again from the book. */
const CODES: Record<string, Record<string, string>> = {
  klnm: { K: '+', L: '×', N: '−', M: '÷' },
  shapes: { '□': '+', '△': '÷', '◇': '×', '○': '−' },
  pqrs: { P: '÷', Q: '×', R: '−', S: '+' },
}
const CODE_OF: Record<string, string> = { 'ao-b04': 'klnm', 'ao-b05': 'klnm', 'ao-b06': 'shapes', 'ao-b07': 'shapes', 'ao-b14': 'pqrs', 'ao-b15': 'pqrs' }
/** Questions 8–9: the sign written, and the sign it means. */
const MEANING: Record<string, string> = { '+': '÷', '×': '+', '−': '×', '÷': '−' }

/** Turns the book's notation into JavaScript: 2² → (2**2), 1/4 → (1/4), abc → (a*b*c), 2a → (2*a). */
function js(side: string): string {
  return side
    .replace(/(\d+)²/g, '($1**2)')
    .replace(/(\d+)\/(\d+)/g, '($1/$2)')
    .replace(/\b(\d*)([a-z]+)\b/g, (_, n: string, v: string) => `(${[...(n ? [n] : []), ...v].join('*')})`)
    .replace(/[{[]/g, '(')
    .replace(/[}\]]/g, ')')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
}

/** Is "left = right" true? Letters get several random values; every one must work. */
function holds(eq: string): boolean {
  const sides = eq.split('=')
  if (sides.length !== 2) return false
  const [l, r] = sides.map((s) => new Function('a', 'b', 'c', 'd', 'p', 'q', `return ${js(s)}`))
  for (let t = 0; t < 6; t++) {
    const vals = Array.from({ length: 6 }, () => 2 + Math.floor(Math.random() * 11))
    const x = l(...vals)
    const y = r(...vals)
    if (!Number.isFinite(x) || Math.abs(x - y) > 1e-9) return false
  }
  return true
}

/** Puts the signs into each * in turn; undefined if the counts differ. */
function fill(eq: string, signs: string[]): string | undefined {
  const [left, right] = eq.split('=')
  const gaps = left.split('*')
  if (gaps.length - 1 !== signs.length) return undefined
  return gaps.map((g, i) => (i ? `${signs[i - 1]} ${g}` : g)).join('') + '=' + right
}

/** Swaps two symbols (or two numbers) everywhere they stand alone. */
function swap(eq: string, a: string, b: string): string {
  return eq
    .split(' ')
    .map((tok) => (tok === a ? b : tok === b ? a : tok))
    .join(' ')
}

function tryOption(q: (typeof data.questions)[number], opt: string): string | undefined {
  const eq = q.terms[0]
  const parts = opt.split(' ')
  switch (q.pattern) {
    case 'ops-fill':
      return fill(eq, parts)
    case 'ops-code': {
      const code = CODES[CODE_OF[q.id]]
      if (!parts.every((p) => p in code)) throw new Error(`${q.id}: unknown symbol in ${opt}`)
      return fill(eq, parts.map((p) => code[p]))
    }
    case 'ops-swap':
    case 'ops-swap-num': {
      const [a, , b] = parts
      // A number that appears twice on the left can't be swapped without saying which one.
      const left = eq.split('=')[0].split(' ')
      if (q.pattern === 'ops-swap-num' && (left.filter((t) => t === a).length !== 1 || left.filter((t) => t === b).length !== 1))
        throw new Error(`${q.id}: ${opt} is not two different numbers on the left`)
      if (q.pattern === 'ops-swap-num') return swap(eq.split('=')[0], a, b) + '=' + eq.split('=')[1]
      return swap(eq, a, b)
    }
    case 'ops-meaning':
      return [...opt].map((ch) => MEANING[ch] ?? ch).join('')
  }
  throw new Error(`${q.id}: unknown pattern ${q.pattern}`)
}

let bad = 0
for (const q of data.questions) {
  const fits = Object.entries(q.options)
    .filter(([, v]) => {
      const eq = tryOption(q, v)
      return eq !== undefined && holds(eq)
    })
    .map(([k]) => k)
  if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${tryOption(q, q.options[q.answer as 'A'])}  →  ${q.answer}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
