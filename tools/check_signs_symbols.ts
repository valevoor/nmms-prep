/**
 * Checks every Signs and Symbols book question. Each option is put into the statement (signs
 * filled in at each *, or two signs / two numbers swapped), and the two sides of =, < or > are
 * worked out and compared. When a number appears twice, every way of swapping it is tried, so an
 * option counts as fitting if any reading of it works. Exactly one option must fit, and it must
 * be the marked one; hidden questions must have more than one (or none).
 * Run from app/:  npx tsx ../tools/check_signs_symbols.ts
 */
import data from '../app/src/data/mat/signs-symbols.json' with { type: 'json' }

const RELATIONS = ['=', '<', '>']
const js = (s: string) => s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')

/** Is the statement (tokens separated by spaces) true? It needs exactly one =, < or >. */
function holds(tokens: string[]): boolean {
  const at = tokens.map((t, i) => (RELATIONS.includes(t) ? i : -1)).filter((i) => i >= 0)
  if (at.length !== 1 || at[0] === 0 || at[0] === tokens.length - 1) return false
  const l = Number(new Function(`return ${js(tokens.slice(0, at[0]).join(' '))}`)())
  const r = Number(new Function(`return ${js(tokens.slice(at[0] + 1).join(' '))}`)())
  const rel = tokens[at[0]]
  if (rel === '=') return Math.abs(l - r) < 1e-9
  return rel === '<' ? l < r - 1e-9 : l > r + 1e-9
}

/** Every statement an option could mean. */
function readings(q: (typeof data.questions)[number], opt: string): string[][] {
  const tokens = q.terms[0].split(' ')
  if (q.pattern === 'sign-fill') {
    const signs = opt.split(', ')
    const gaps = tokens.filter((t) => t === '*').length
    if (gaps !== signs.length) throw new Error(`${q.id}: ${opt} has ${signs.length} signs for ${gaps} gaps`)
    let k = 0
    return [tokens.map((t) => (t === '*' ? signs[k++] : t))]
  }
  const [a, b] = opt.split(' & ')
  const where = (x: string) => tokens.map((t, i) => (t === x ? i : -1)).filter((i) => i >= 0)
  const out: string[][] = []
  for (const i of where(a))
    for (const j of where(b)) {
      const t = [...tokens]
      ;[t[i], t[j]] = [t[j], t[i]]
      out.push(t)
    }
  // A sign that appears more than once is swapped everywhere it appears.
  if (!/\d/.test(a)) out.push(tokens.map((t) => (t === a ? b : t === b ? a : t)))
  if (!out.length) throw new Error(`${q.id}: ${opt} is not in the statement`)
  return out
}

let bad = 0
for (const q of data.questions) {
  const fits = Object.entries(q.options)
    .filter(([, v]) => readings(q, v).some(holds))
    .map(([k]) => k)
  if ('status' in q) {
    if (fits.length !== 1) console.log(`✓ Q${q.bookNo}: hidden; options that fit: ${fits.join(', ') || 'none'}`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but only option ${fits[0]} fits`))
  } else if (fits.length === 1 && fits[0] === q.answer) {
    const shown = readings(q, q.options[q.answer as 'A']).find(holds)!
    console.log(`✓ Q${q.bookNo}: ${shown.join(' ')}  →  ${q.answer}`)
  } else (bad++, console.log(`✗ Q${q.bookNo}: options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
