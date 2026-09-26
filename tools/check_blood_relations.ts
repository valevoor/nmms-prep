/**
 * Checks every Blood Relations book question: each family is built as a small graph (with every
 * person's sex), and a solver names X's relation to Y. Exactly one option must match, and it must
 * be the marked one. For questions hidden as needs-review, it confirms that no option fits.
 * Run from app/:  npx tsx ../tools/check_blood_relations.ts
 */
import data from '../app/src/data/mat/blood-relations.json' with { type: 'json' }

type Sex = 'm' | 'f'
class Family {
  sex = new Map<string, Sex>()
  parents = new Map<string, Set<string>>()
  spouse = new Map<string, string>()
  person(name: string, sex: Sex) {
    this.sex.set(name, sex)
    this.parents.set(name, this.parents.get(name) ?? new Set())
    return this
  }
  child(parent: string, child: string) {
    this.parents.get(child)!.add(parent)
    return this
  }
  marry(a: string, b: string) {
    this.spouse.set(a, b)
    this.spouse.set(b, a)
    return this
  }
  parentsOf = (n: string) => this.parents.get(n) ?? new Set<string>()
  childrenOf = (n: string) => [...this.parents].filter(([, ps]) => ps.has(n)).map(([c]) => c)
  siblingsOf = (n: string) => [...this.parents.keys()].filter((o) => o !== n && [...this.parentsOf(o)].some((p) => this.parentsOf(n).has(p)))

  /** What x is to y, in the words the options use. */
  relation(x: string, y: string): string {
    const m = this.sex.get(x) === 'm'
    const w = (a: string, b: string) => (m ? a : b)
    const sp = this.spouse.get(y)
    if (this.parentsOf(y).has(x)) return w('father', 'mother')
    if (this.parentsOf(x).has(y)) return w('son', 'daughter')
    if (this.spouse.get(x) === y) return w('husband', 'wife')
    if (this.siblingsOf(y).includes(x)) return w('brother', 'sister')
    if ([...this.parentsOf(y)].some((p) => this.parentsOf(p).has(x))) return w('grandfather', 'grandmother')
    if ([...this.parentsOf(x)].some((p) => this.parentsOf(p).has(y))) return w('grandson', 'granddaughter')
    if ([...this.parentsOf(y)].some((p) => this.siblingsOf(p).includes(x))) return w('uncle', 'aunt')
    if ([...this.parentsOf(x)].some((p) => this.siblingsOf(p).includes(y))) return w('nephew', 'niece')
    if (sp && this.parentsOf(sp).has(x)) return w('father-in-law', 'mother-in-law')
    if (this.spouse.get(x) && this.parentsOf(this.spouse.get(x)!).has(y)) return w('son-in-law', 'daughter-in-law')
    if ((sp && this.siblingsOf(sp).includes(x)) || this.siblingsOf(y).some((s) => this.spouse.get(s) === x)) return w('brother-in-law', 'sister-in-law')
    if ([...this.parentsOf(x)].some((p) => [...this.parentsOf(y)].some((q) => this.siblingsOf(p).includes(q)))) return 'cousin'
    if (sp && [...this.parentsOf(sp)].some((p) => this.siblingsOf(p).includes(x))) return w("father-in-law's brother", "father-in-law's sister")
    return 'unknown'
  }
}

/** For each question: the family, and whose relation to whom it asks. */
const CASES: Record<string, () => [Family, string, string]> = {
  // P, Q brothers; P's children R, S (P's son is S's brother).
  'br-b01': () => [new Family().person('P', 'm').person('Q', 'm').person('R', 'f').person('S', 'f').person('G', 'm').person('P0', 'm').child('P0', 'P').child('P0', 'Q').child('P', 'R').child('P', 'S').child('P', 'G'), 'Q', 'R'],
  'br-b02': () => [new Family().person('GP', 'm').person('Rahul', 'm').person('Sarika', 'f').person('Raju', 'm').person('Sonu', 'm').person('Rita', 'f').child('GP', 'Rahul').child('GP', 'Sarika').child('GP', 'Raju').child('Sarika', 'Sonu').child('Sarika', 'Rita'), 'Rita', 'Raju'],
  // The lady's only brother's son is the man's wife's brother.
  'br-b03': () => [new Family().person('GP', 'm').person('Lady', 'f').person('Bro', 'm').person('Son', 'm').person('Wife', 'f').person('Man', 'm').child('GP', 'Lady').child('GP', 'Bro').child('Bro', 'Son').child('Bro', 'Wife').marry('Man', 'Wife'), 'Lady', 'Man'],
  'br-b04': () => [new Family().person('GP', 'm').person('P', 'm').person('T', 'm').person('Q', 'f').person('R', 'f').person('S', 'm').child('GP', 'P').child('GP', 'T').marry('P', 'Q').child('P', 'R').child('Q', 'R').child('P', 'S').child('Q', 'S'), 'Q', 'T'],
  // Her uncle's father (grandfather) → his daughter (her mother) → her son (the boy).
  'br-b05': () => [new Family().person('GP', 'm').person('Uncle', 'm').person('Mother', 'f').person('Girl', 'f').person('Boy', 'm').child('GP', 'Uncle').child('GP', 'Mother').child('Mother', 'Girl').child('Mother', 'Boy'), 'Boy', 'Girl'],
  'br-b06': () => [new Family().person('GP', 'm').person('Prema', 'f').person('Raju', 'm').person('Neha', 'f').person('Anand', 'm').person('Rashmi', 'f').child('GP', 'Prema').child('GP', 'Raju').child('GP', 'Neha').child('Prema', 'Anand').child('Neha', 'Rashmi'), 'Anand', 'Rashmi'],
  'br-b07': () => [new Family().person('GP', 'm').person('Anand', 'm').person('Badri', 'm').person('Vasanth', 'f').person('Eashwari', 'f').person('Deva', 'm').child('GP', 'Anand').child('GP', 'Badri').child('GP', 'Vasanth').child('Badri', 'Eashwari').child('Badri', 'Deva'), 'Anand', 'Deva'],
  'br-b08': () => [new Family().person('GP', 'm').person('A', 'm').person('F', 'm').person('C', 'f').person('G', 'm').person('K', 'f').child('GP', 'A').child('GP', 'F').child('A', 'C').child('A', 'G').child('F', 'K'), 'F', 'G'],
  // X's father's father → his granddaughter (X's sister) → her husband Y.
  'br-b09': () => [new Family().person('GF', 'm').person('Father', 'm').person('X', 'm').person('Sis', 'f').person('Y', 'm').child('GF', 'Father').child('Father', 'X').child('Father', 'Sis').marry('Y', 'Sis'), 'Y', 'X'],
  // Raju's mother's husband (father) → his mother → her daughter.
  'br-b10': () => [new Family().person('GM', 'f').person('Father', 'm').person('Woman', 'f').person('Mother', 'f').person('Raju', 'm').child('GM', 'Father').child('GM', 'Woman').marry('Father', 'Mother').child('Father', 'Raju').child('Mother', 'Raju'), 'Woman', 'Raju'],
  // The lady's father's sister is Kumar's mother-in-law.
  'br-b11': () => [new Family().person('GP', 'm').person('LadyFather', 'm').person('Aunt', 'f').person('Lady', 'f').person('KWife', 'f').person('Kumar', 'm').child('GP', 'LadyFather').child('GP', 'Aunt').child('LadyFather', 'Lady').child('Aunt', 'KWife').marry('Kumar', 'KWife'), 'Kumar', 'Lady'],
  'br-b12': () => [new Family().person('A', 'f').person('B', 'm').person('C', 'm').person('D', 'm').person('E', 'f').child('A', 'B').child('A', 'C').child('B', 'D').child('B', 'E'), 'A', 'D'],
  'br-b13': () => [new Family().person('A', 'm').person('B', 'm').person('E', 'm').person('C', 'f').person('D', 'm').child('A', 'E').child('B', 'C').child('B', 'D').marry('E', 'C'), 'D', 'E'],
  'br-b14': () => [new Family().person('GP', 'm').person('A', 'm').person('B', 'm').person('C', 'm').person('D', 'm').child('GP', 'A').child('GP', 'B').child('A', 'C').child('A', 'D'), 'B', 'C'],
  'br-b15': () => [new Family().person('C', 'm').person('E', 'f').person('A', 'm').person('B', 'f').person('D', 'm').marry('C', 'E').child('C', 'A').child('C', 'B').child('C', 'D').child('E', 'A').child('E', 'B').child('E', 'D'), 'E', 'C'],
}

/** Options for "who is …?" questions name a person; the rest name a relation. */
const WHO: Record<string, string> = { 'br-b07': 'uncle', 'br-b08': 'uncle', 'br-b12': 'grandmother' }

let bad = 0
for (const q of data.questions) {
  const [fam, x, y] = CASES[q.id]()
  const rel = fam.relation(x, y)
  const opts = Object.entries(q.options)
  const fits = WHO[q.id]
    ? opts.filter(([, v]) => fam.sex.has(v) && fam.relation(v, y) === WHO[q.id]).map(([k]) => k)
    : opts.filter(([, v]) => v.toLowerCase() === rel || (v === 'Uncle' && rel === 'uncle')).map(([k]) => k)
  if ('status' in q) {
    if (fits.length === 0) console.log(`✓ Q${q.bookNo}: hidden; ${rel === 'unknown' ? 'no single relation word fits' : `the answer is "${rel}"`}, and no option says it`)
    else (bad++, console.log(`✗ Q${q.bookNo}: hidden, but option ${fits.join(', ')} fits "${rel}"`))
  } else if (fits.length === 1 && fits[0] === q.answer) console.log(`✓ Q${q.bookNo}: ${WHO[q.id] ? `${x} is the ${WHO[q.id]}` : rel}  →  ${q.answer}${q.keyFrom === 'solved' ? ' (solved; book key differs)' : ''}`)
  else (bad++, console.log(`✗ Q${q.bookNo}: solver says ${x} is the ${rel} of ${y}; options that fit: ${fits.join(', ') || 'none'}; marked ${q.answer}`))
}

if (bad) {
  console.log(`\n${bad} question(s) failed.`)
  process.exit(1)
}
console.log('\nAll book answers check out.')
