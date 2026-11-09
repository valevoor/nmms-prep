/**
 * Checks the answers to the SAT science questions (subjects physics, chemistry and biology) of the papers
 * (data/pyq/ka-<year>-sat.json) and the study book (data/sat/book.json, whose key is checked here too). Each question has its own rule here, written independently of the solution: a value
 * to compute, the pairs of a match-the-following, the true statements or the T/F marks, a balanced equation,
 * or, for facts and pictures, whether each option is true. Exactly one option must fit, and it must be the
 * key. Every answered question needs `keyFrom` and a solution in English and Kannada whose concept cites the
 * syllabus section it uses (a number from sat-syllabus/*.md), or, for a chapter the 2026-27 textbooks dropped,
 * says "Old syllabus – <chapter>:", or, for a Miscellaneous question (in no chapter, old or new), "Beyond the syllabus:".
 * A science question with no answer must say why in its note.
 * Run from app/:  npx tsx ../tools/check_sat_science.ts
 */
import { SAT_SOURCES, SECTION_SUBJECT } from '../app/src/data/sat'
import oldChapters from '../app/src/data/sat/old-chapters.json'

const KEYS = ['A', 'B', 'C', 'D'] as const
type Key = (typeof KEYS)[number]
/** Does this option fit? `v` is the option's text. */
type Rule = (v: string) => boolean

// ---- Reading options: "64.8 km h⁻¹", "Four", "1/2 pascal", "2.25 × 10⁵ kJ", "A - b, B - d", "i, ii and iv", "F T T" ----

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

/** The number an option starts with. */
function value(v: string): number {
  const word = WORDS.indexOf(v.trim().split(/\s/)[0].toLowerCase())
  if (word >= 0) return word
  const m = v.match(/^(\d+(?:\.\d+)?)(?:\/(\d+))?(?:\s*×\s*10([⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/)
  if (!m) return NaN
  const exp = m[3] ? Number([...m[3]].map((c) => SUP[c]).join('')) : 0
  return (Number(m[1]) / (m[2] ? Number(m[2]) : 1)) * 10 ** exp
}
/** The statement labels an option names, in order: "only ‘a’ and ‘d’", "i, ii, iv only", "X, Z". */
const labels = (v: string) => [...v.matchAll(/(?<![A-Za-z])(iii|ii|iv|i|v|[a-d]|[P-Z])(?![A-Za-z])/g)].map((m) => m[1])

// ---- Rules ----

/** The option is this number (within `tol`, for numbers printed rounded). */
const num = (n: number, tol = 1e-9): Rule => (v) => Math.abs(value(v) - n) <= tol * Math.max(1, Math.abs(n))
/** The option names exactly these statements. */
const set = (want: string): Rule => (v) => labels(v).sort().join(' ') === want.split(' ').sort().join(' ')
/** The option lists these labels in this order. */
const list = (want: string): Rule => (v) => labels(v).join(' ') === want
/** The option's T/F marks, spaces ignored. */
const tf = (want: string): Rule => (v) => v.replace(/\s/g, '') === want
/** A match-the-following option ("A - b, B - d", "i – a", "iii-c") gives exactly these pairs. */
const pairs = (want: Record<string, string>): Rule => (v) => {
  const got = Object.fromEntries([...v.matchAll(/(\w+)\s*[-–]\s*(\w+)/g)].map((m) => [m[1], m[2]]))
  return Object.keys(want).length === Object.keys(got).length && Object.entries(want).every(([k, x]) => got[k] === x)
}
/** For facts, statements and pictures: whether each option is true, e.g. "FTFF", and why. */
const BY_KEY = new Set<Rule>()
const t = (marks: string, _why: string): Rule => {
  const r: Rule = (v) => marks[KEYS.indexOf(v as Key)] === 'T'
  BY_KEY.add(r)
  return r
}

/** Atoms in a formula with subscripts, e.g. "2HgO" → {Hg: 2, O: 2}. */
function atoms(species: string): Record<string, number> {
  const sub = (s: string) => Number([...s].map((c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).join('') || 1)
  const m = species.trim().match(/^(\d*)(.*)$/)!
  const coeff = Number(m[1] || 1)
  const out: Record<string, number> = {}
  for (const [, el, n] of m[2].matchAll(/([A-Z][a-z]?)([₀-₉]*)/g)) out[el] = (out[el] ?? 0) + coeff * sub(n)
  return out
}
/** The option is a balanced equation using only these formulae. */
const balanced = (formulae: string[]): Rule => (v) => {
  const sides = v.replace(/↑/g, '').split('→').map((side) => side.split('+').map((s) => s.trim()))
  if (sides.length !== 2 || !sides.flat().every((s) => formulae.includes(s.replace(/^\d+/, '')))) return false
  const count = (side: string[]) => side.map(atoms).reduce<Record<string, number>>((acc, a) => {
    for (const [el, n] of Object.entries(a)) acc[el] = (acc[el] ?? 0) + n
    return acc
  }, {})
  const [l, r] = sides.map(count)
  return Object.keys({ ...l, ...r }).every((el) => l[el] === r[el])
}

const RULES: Record<string, Rule> = {
  // 2019-20
  'ka1920s-01': num(18 * 3.6),
  'ka1920s-02': t('FFFT', 'loudness (volume) goes with amplitude; frequency gives pitch'),
  'ka1920s-03': t('FTFF', 'inertia: resisting a change of state'),
  'ka1920s-04': num(2 * 9.8 * 15),
  'ka1920s-05': num(Math.hypot(6 - 3, 4)),
  'ka1920s-06': t('FFTF', '1 Hz = 1 vibration per second = 60 per minute'),
  'ka1920s-07': num((15 + 25) * 20),
  'ka1920s-08': t('TFFF', 'third law: on different bodies, opposite directions'),
  'ka1920s-09': t('TFFF', '(u + (u + at)) / 2 = u + at/2'),
  'ka1920s-10': num(0),
  'ka1920s-11': t('FFFT', 'clinical thermometer: 35–42 °C'),
  'ka1920s-12': num(360 / 72 - 1),
  'ka1920s-13': t('FTFF', 'stationary orbits are Bohr’s postulate'),
  'ka1920s-14': t('TFFF', 'heavier positive ions deflect least'),
  'ka1920s-15': num((14 / (1 + 14 + 3 * 16)) * 100, 1e-3),
  'ka1920s-16': t('FFTF', 'Cl-35 : Cl-37 occur about 75.8% : 24.2%, i.e. 3 : 1'),
  'ka1920s-17': t('TFFF', 'a mass spectroscope measures atomic masses'),
  'ka1920s-18': t('FTFF', 'CaCO₃ → CaO + CO₂ takes in heat'),
  'ka1920s-19': balanced(['HgO', 'Hg', 'O₂']),
  'ka1920s-20': t('TFFF', 'Epsom salt is MgSO₄·7H₂O'),
  'ka1920s-21': pairs({ A: 'b', B: 'd', C: 'a', D: 'c' }), // s 2, p 6, d 10, f 14; a 10, b 2, c 14, d 6
  'ka1920s-22': t('FTFF', 'SO₂ (sulphites) is a food preservative'),
  'ka1920s-23': t('FFFT', 'chips packets are flushed with nitrogen'),
  'ka1920s-24': num(2),
  'ka1920s-25': t('TFFF', 'A runs from a host (birds) to its parasite (lice)'),
  'ka1920s-26': pairs({ A: 'ii', B: 'iv', C: 'iii', D: 'i' }),
  'ka1920s-27': t('TFFF', 'fermentation by yeast is anaerobic respiration'),
  'ka1920s-28': t('FFFT', 'Cuscuta and tapeworm are both parasites'),
  'ka1920s-29': t('FFFT', 'semipermeable: controls what passes'),
  'ka1920s-30': t('FFTF', 'fungi reproduce by spores; they are eukaryotes with chitin walls'),
  'ka1920s-31': t('FTFF', 'by eye: A pseudopodium, B nucleus, C food vacuole (food inside)'),
  'ka1920s-32': t('FFFT', 'extra carbohydrate is stored as fat'),
  'ka1920s-33': t('FFTF', 'gases leave an insect through spiracles'),
  'ka1920s-34': t('TFFF', 'the eyespot (stigma) senses light'),
  'ka1920s-35': t('TFFF', 'viruses multiply only inside host cells'),
  // 2020-21
  'ka21s-01': t('FFFT', 'uniform motion: a straight sloping distance-time line'),
  'ka21s-02': t('TFFF', 'the bell uses an electromagnet; the others the heating effect'),
  'ka21s-03': t('FTFF', 'concave lens: erect, virtual'),
  'ka21s-04': set('a c'),
  'ka21s-05': num(5 / 20),
  'ka21s-06': num(2 ** 2),
  'ka21s-07': t('FTFF', 'audible range 20 Hz – 20 kHz'),
  'ka21s-08': t('FFTF', 'a charged body exerts electrostatic force'),
  'ka21s-09': t('TFFF', 'ball bearings turn sliding into rolling friction'),
  'ka21s-10': t('FTFF', 'p = hρg does not involve the surface area'),
  'ka21s-11': t('FFTF', 'sound travels through solids, liquids and gases'),
  'ka21s-12': t('FFFT', 'equal and opposite forces cancel'),
  'ka21s-13': t('FFFT', 'rayon is made from wood pulp'),
  'ka21s-14': t('TFFF', 'bakelite is thermosetting'),
  'ka21s-15': t('FFTF', 'melamine resists fire'),
  'ka21s-16': t('FTFF', 'only the salt solution is an electrolyte'),
  'ka21s-17': t('FFTF', 'no air, high temperature, high pressure'),
  'ka21s-18': t('TFFF', 'fractional distillation separates by boiling point'),
  'ka21s-19': t('FTFF', 'inflammable: low ignition temperature'),
  'ka21s-20': pairs({ a: 'iii', b: 'iv', c: 'i', d: 'ii' }),
  'ka21s-21': t('FFFT', 'calorific value in kJ/kg'),
  'ka21s-22': t('TFFF', 'sulphur in coal and diesel burns to SO₂'),
  'ka21s-24': t('FTFF', 'fertilisers are man-made inorganic salts'),
  'ka21s-25': t('FFTF', 'viruses multiply only in host cells'),
  'ka21s-26': pairs({ a: 'iv', b: 'i', c: 'ii', d: 'iii' }),
  'ka21s-27': t('TFFF', 'loosening and turning soil is tilling'),
  'ka21s-28': t('FFFT', 'legumes (Rhizobium) fix nitrogen'),
  'ka21s-29': t('FFTF', 'the Red Data Book lists endangered species'),
  'ka21s-30': (v) => v.split('→').map((s) => s.trim()).join(' ') === 'egg larva pupa adult',
  'ka21s-31': t('TFFF', 'pistil: stigma, style, ovary'),
  'ka21s-32': t('FFTF', 'combine = harvester + thresher'),
  'ka21s-33': t('FFFT', 'Bryophyllum: buds on leaf margins'),
  'ka21s-34': t('TFFF', 'tadpole to frog is metamorphosis'),
  'ka21s-35': t('FFFT', 'by eye: a ovary, b oviduct, c uterus'),
  // 2022-23
  'ka2223s-01': t('FTFF', 'heat along a solid wire is conduction'),
  'ka2223s-02': t('FFFT', 'one series loop: all glow together'),
  'ka2223s-03': t('FFTF', 'hotter land, low pressure over land'),
  'ka2223s-04': t('FTFF', 'atmospheric pressure holds the sucker'),
  'ka2223s-05': t('FTFF', 'a pinhole lets the air out slowly'),
  'ka2223s-06': t('TFFF', 'wet marble < dry marble < rough cement'),
  'ka2223s-07': t('FFFT', 'water friction stops the boat'),
  'ka2223s-08': t('TFFF', 'broad feet: lower pressure on sand'),
  'ka2223s-09': t('FFTF', 'ultrasound is above 20 kHz'),
  'ka2223s-10': t('TFFF', 'sound is fastest in solids'),
  'ka2223s-11': t('FFFT', 'like charges repel'),
  'ka2223s-12': t('FFTF', 'a plane mirror inverts left and right'),
  'ka2223s-13': t('FTFF', 'Lohi gives good-quality wool'),
  'ka2223s-14': t('FFTF', 'a colourless base + phenolphthalein turns pink'),
  'ka2223s-16': t('FFFT', 'polyester blends: polycot, polywool'),
  'ka2223s-17': t('FFTF', 'Al + NaOH gives hydrogen; Cu + HCl, S, C do not'),
  'ka2223s-18': t('FFTF', 'acrylic is artificial wool'),
  'ka2223s-19': t('FTFF', 'graphite conducts'),
  'ka2223s-20': tf('TTFT'),
  'ka2223s-21': pairs({ a: 'iii', b: 'ii', c: 'iv', d: 'v' }),
  'ka2223s-22': t('FFFT', 'CNG vehicles cut SO₂ and NOx'),
  'ka2223s-23': t('FTFF', 'sodium in water: hydrogen, heat, fire, sound'),
  'ka2223s-24': t('FFTF', 'zygote → embryo → seed'),
  'ka2223s-25': t('FTFF', 'by eye: a tail, b middle piece, c head'),
  'ka2223s-26': t('TFFF', 'right ventricle sends CO₂-rich blood to the lungs'),
  'ka2223s-27': t('FFFT', 'pickles: vinegar'),
  'ka2223s-28': t('FFTF', 'protecting tigers keeps the balance'),
  'ka2223s-29': t('TFFF', 'by eye: X floats, so damaged seeds'),
  'ka2223s-30': t('FFFT', 'snakes lose their food'),
  'ka2223s-31': set('i ii iv'),
  'ka2223s-32': pairs({ a: 'iii', b: 'i', c: 'ii' }),
  'ka2223s-33': set('i ii iv'),
  'ka2223s-34': t('FFTF', 'chromosomes carry genes'),
  'ka2223s-35': t('FTFF', 'frog, silkworm, moth undergo metamorphosis'),
  // 2023-24
  'ka2324s-01': t('FFTF', 'the electric bell uses an electromagnet'),
  'ka2324s-02': t('FFFT', 'by eye: only D, a convex lens converging the rays'),
  'ka2324s-03': num(60 * (15 / 60) + 36 * (10 / 60)),
  'ka2324s-04': t('FTFF', 'frequency in hertz'),
  'ka2324s-05': t('FFFT', 'both statements about the sucker are true'),
  'ka2324s-06': t('TFFF', 'A true; R false (bearings reduce friction)'),
  'ka2324s-07': t('FFTF', 'force changes speed and direction'),
  'ka2324s-08': t('FTFF', 'brakes use friction'),
  'ka2324s-09': t('FFFT', 'bullocks pull by contact'),
  'ka2324s-10': t('FTFF', 'lower pitch, lower frequency'),
  'ka2324s-11': num(3 / 6),
  'ka2324s-12': t('TFFF', 'carrom coins slide'),
  'ka2324s-13': t('FFTF', 'H₂SO₄ + Ca(OH)₂ → CaSO₄ + water'),
  'ka2324s-14': t('FTFF', 'rusting forms a new substance'),
  'ka2324s-15': t('TFFF', 'polyester does not wrinkle'),
  'ka2324s-16': set('a c'),
  'ka2324s-17': t('FTFF', 'bakelite, polythene, PVC are plastics'),
  'ka2324s-18': t('FFTF', 'zinc displaces copper'),
  'ka2324s-19': set('a c d'),
  'ka2324s-20': t('TFFF', 'sunlight is inexhaustible'),
  'ka2324s-21': t('FFTF', 'LPG has the highest calorific value of these'),
  'ka2324s-22': t('FTFF', 'copper does not react with dilute HCl'),
  'ka2324s-23': tf('FT'),
  'ka2324s-24': t('FFTF', 'feeding on dead matter is saprophytic'),
  'ka2324s-25': t('FTFF', 'both right; humans lack cellulose-digesting bacteria'),
  'ka2324s-27': t('FFFT', 'a seed drill sows'),
  'ka2324s-28': t('FFTF', 'hepatitis A spreads through water'),
  'ka2324s-29': t('FTFF', 'yeast multiplies fast and gives CO₂'),
  'ka2324s-30': t('TFFF', 'pasteurisation kills harmful microbes'),
  'ka2324s-31': t('TFFF', 'large vacuole and plastids: plant cell'),
  'ka2324s-32': t('FTFF', 'a species can interbreed'),
  'ka2324s-33': t('TFFF', 'introduced species threaten native animals'),
  'ka2324s-34': t('FFFT', 'threads in the nucleus are chromosomes'),
  'ka2324s-35': t('TFFF', 'sprinklers for uneven land, little water'),
  // 2024-25
  'ka2425s-01': t('FTFF', 'force per unit area is pressure'),
  'ka2425s-02': num(50 * 3.5), // the graph: 50 km per hour from 6:00 AM
  'ka2425s-03': (v) => {
    const wire: Record<string, number> = { P: 76, Q: 154, R: 100, S: 130 }
    return wire[v] === Math.max(...Object.values(wire))
  },
  'ka2425s-04': t('TFFF', 'shiny: more reflection, less absorption and scattering'),
  'ka2425s-05': t('FFTF', 'easy skating: friction is small, so statement 2 is false'),
  'ka2425s-06': t('TFFF', 'more irregularities, more friction'),
  'ka2425s-07': t('FTFF', 'a bigger force in the same direction carries it further up'),
  'ka2425s-08': t('FFFT', 'streamlining reduces fluid friction'),
  'ka2425s-09': t('FTFF', 'by eye: O, M, N, L from top to bottom'),
  'ka2425s-10': list('ii i iv iii'),
  'ka2425s-11': t('TFFF', 'head against the wall: large area, low pressure'),
  'ka2425s-12': set('i iii iv'),
  'ka2425s-13': set('ii iv'),
  'ka2425s-14': t('FFFT', 'CO₂ cuts off oxygen'),
  'ka2425s-15': t('FFTF', 'coal plants add CO₂'),
  'ka2425s-16': t('TFFF', 'the wax vapour burns with a flame'),
  'ka2425s-17': t('FFTF', 'water dilutes, baking soda neutralises'),
  'ka2425s-18': tf('FTT'),
  'ka2425s-19': t('FTFF', 'CO₂ turns lime water milky'),
  'ka2425s-20': set('i iii'),
  'ka2425s-21': t('FTFF', 'incomplete combustion gives CO'),
  'ka2425s-22': t('FFTF', 'polyester, urea, polythene, detergents'),
  'ka2425s-23': t('TFFF', 'both true'),
  'ka2425s-24': t('TFFF', 'Rhizobium in legume root nodules'),
  'ka2425s-25': set('i ii iii'),
  'ka2425s-26': t('FTFF', 'both true, R explains A'),
  'ka2425s-27': t('FFTF', 'legumes replenish nitrogen'),
  'ka2425s-28': set('i ii iii'),
  'ka2425s-29': t('FFTF', 'penicillin from Penicillium'),
  'ka2425s-30': t('FTFF', 'by eye: sporangia on stalks with rhizoids, bread mould'),
  'ka2425s-31': t('FFFT', 'Lactobacillus in curd'),
  'ka2425s-32': t('TFFF', 'sodium benzoate is a preservative'),
  'ka2425s-33': pairs({ i: 'b', ii: 'd', iii: 'a', iv: 'c' }),
  'ka2425s-34': t('TFFF', 'by eye: X is the aorta (thick elastic wall, blood from the heart)'),
  'ka2425s-35': t('FFFT', 'cucumber flowers are unisexual'),
  // 2025-26
  'ka2526s-01': t('FTFF', 'friction stops the ball'),
  'ka2526s-02': t('FFTF', 'streamlined against air friction'),
  'ka2526s-03': t('TFFF', 'sharp edge: small area, high pressure'),
  'ka2526s-04': t('TFFF', 'by eye: S, Q, R, P from bottom to top'),
  'ka2526s-05': t('FTFF', 'gravity, friction, the table’s upward push'),
  'ka2526s-06': t('FFFT', 'rolling friction'),
  'ka2526s-07': t('FFTF', 'fluid friction is drag'),
  'ka2526s-08': t('FFTF', 'both right'),
  'ka2526s-10': num(60 * (10 / 60) + 42 * (10 / 60)),
  'ka2526s-11': t('TFFF', 'side-view mirrors are convex'),
  'ka2526s-12': t('FFTF', 'by eye: A and D open; B has a cell reversed; C closed and in series'),
  'ka2526s-13': t('FFTF', 'coal, minerals, petroleum are exhaustible'),
  'ka2526s-14': t('FTFF', 'organic matter for basic soil'),
  'ka2526s-15': t('FTFF', 'petrol is less dense and floats; D gives weight, not density'),
  'ka2526s-16': t('TFFF', 'refining; diesel for generators; bitumen for roads'),
  'ka2526s-17': tf('FTF'),
  'ka2526s-18': t('FFTF', 'hibiscus green in base; phenolphthalein colourless in acid; turmeric red in base'),
  'ka2526s-19': t('TFFF', 'CO₂ is the greenhouse gas'),
  'ka2526s-20': (v) => /Chromium/.test(v) && /Nickel/.test(v),
  'ka2526s-21': t('FFFT', 'both wrong'),
  'ka2526s-22': t('FTFF', 'by eye: x is the outer, hottest zone'),
  'ka2526s-23': num(4.5e4 * 5),
  'ka2526s-24': t('FFTF', 'red blood cells carry haemoglobin'),
  'ka2526s-25': set('i iii'),
  'ka2526s-26': t('FTFF', 'A true, R false'),
  'ka2526s-27': t('FFFT', 'mixed cropping and crop rotation'),
  'ka2526s-28': pairs({ i: 'b', ii: 'c', iii: 'a' }), // by eye: i sickle, ii hoe, iii seed funnel
  'ka2526s-29': t('FFFT', 'neem keeps pests away'),
  'ka2526s-30': t('FTFF', 'only Y farms organically'),
  'ka2526s-31': t('FFTF', 'Penicillium is a fungus'),
  'ka2526s-32': set('P R'),
  'ka2526s-33': set('X Y'),
  'ka2526s-34': t('FFFT', 'yellow vein mosaic is viral'),
  'ka2526s-35': pairs({ iii: 'a', ii: 'b', i: 'd', iv: 'c' }), // by eye: iii kidneys, ii ureters, i bladder, iv urethra
  // ---- Book: NMMS.pdf (data/sat/book.json) ----
  'bkp-01': t('TFFF', 'W = Fs cos θ is least (−Fs) at 180°'),
  'bkp-02': t('TFFF', 'friction between the moving parts heats the bowl'),
  'bkp-03': num(14 * 10 * 12),
  'bkp-04': t('FFFT', 'the lowest boiling point, 145 K'),
  'bkp-05': t('FFTF', 'potential energy is greatest at the greatest height'),
  'bkp-06': num(96000 / (8 * 30)),
  'bkp-07': t('FTFF', 'the push moves the book along the force'),
  'bkp-09': t('FFFT', 'A 50 J < C 180 J < B 200 J'),
  'bkp-10': t('FTFF', 'focusing far away, the eye lens flattens'),
  'bkp-11': num(360 / 90 - 1),
  'bkp-12': num(50 / 2),
  'bkp-13': t('FFTF', 'persistence of vision, 1/16 s'),
  'bkp-14': t('FTFF', 'M is symmetric about a vertical line'),
  'bkp-16': t('FFFT', 'binoculars for a far but earthly scene'),
  'bkp-17': t('TFFF', 'violet bends most, red least'),
  'bkp-18': t('FFTF', 'a kaleidoscope uses plane mirror strips'),
  'bkp-20': t('FTFF', 'pink is not one of the seven colours'),
  'bkp-21': t('TFFF', 'by eye: A is an upright T; B, C, D are turned'),
  'bkp-22': t('FFFT', 'by eye: only D has equal angles on both sides of the normal'),
  'bkp-23': t('FTFF', 'the wheel pushes the road backwards'),
  'bkp-24': t('FTFF', 'streamlining reduces drag'),
  'bkp-25': t('FTFF', 'ice is smooth: little friction'),
  'bkp-26': t('TFFF', 'smoothest to roughest'),
  'bkp-27': t('TFFF', 'gravity and friction act everywhere'),
  'bkp-28': t('FFFT', 'speed, shape and the fluid'),
  'bkp-29': t('TFFF', 'starting friction exceeds moving friction'),
  'bkp-30': num(346 * 4 / 2),
  'bkp-32': t('FFFT', 'loud sound carries farther'),
  'bkp-33': t('FTFF', 'fast (high-frequency) vibration'),
  'bkp-35': num(10 * 20),
  'bkp-36': num(1000 / (4000 * 0.1)),
  'bkp-37': t('FFTF', 'silencers lower the amplitude'),
  'bkp-38': t('FFFT', 'quality (timbre) stays'),
  'bkp-39': t('FFTF', 'regular repetition: music'),
  'bkp-40': t('FTFF', 'high pitch is shrill'),
  'bkp-42': t('FTFF', 'same start and end, same displacement'),
  'bkp-43': t('FFTF', '44 m distance, 4 m displacement'),
  'bkp-44': t('TFFF', 'circular motion: same speed, changing velocity'),
  'bkp-47': t('FFTF', 'the Moon only reflects sunlight'),
  'bkp-48': t('FTFF', 'the Earth moves on in its orbit'),
  'bkp-50': t('FTFF', 'on the line of the Earth’s axis'),
  'bkp-51': t('FTFF', 'the Earth rotates west to east'),
  'bkp-52': t('TFFF', 'Saturn > Earth > Venus > Mars'),
  'bkp-53': t('FTFF', 'water reflects light'),
  'bkp-54': t('FTFF', 'convex: wide field of view'),
  'bkp-55': t('FTFF', 'convection currents'),
  'bkp-56': t('FTFF', 'same force, smaller area when standing'),
  'bkp-57': t('TFFF', 'fast air, low pressure'),
  'bkp-58': t('FFFT', 'only the toy car moves'),
  'bkp-59': t('TFFF', 'outside air pressure crushes it'),
  'bkp-60': t('FFTF', 'close-packed particles repel'),
  'bkp-63': t('TFFF', 'smaller pad, more pressure'),
  'bkp-64': t('FFTF', 'equal and opposite momentum'),
  'bkc-01': t('FFFT', 'acid colourless, base pink'),
  'bkc-02': t('FFTF', 'soapy feel: base'),
  'bkc-03': t('FTFF', 'turmeric red: base'),
  'bkc-04': t('TFFF', 'compost for basic soil'),
  'bkc-05': t('FTFF', 'lime water is basic'),
  'bkc-06': t('FFTF', 'acid + base'),
  'bkc-07': t('FTFF', 'neutralises stomach HCl'),
  'bkc-08': t('TFFF', 'organic manure for basic soil'),
  'bkc-09': t('FTFF', 'red, red, blue'),
  'bkc-10': t('FFFT', 'methyl orange red: acid'),
  'bkc-11': t('TFFF', 'acid dark pink, base green'),
  'bkc-12': t('FTFF', 'distilled water hardly conducts'),
  'bkc-13': t('FFTF', 'the coating keeps moisture off'),
  'bkc-14': t('TFFF', 'pure cathode, impure anode, CuSO₄'),
  'bkc-15': t('FFFT', 'fine ash particles in the air'),
  'bkc-16': t('FTFF', 'bleaching powder gives chlorine'),
  'bkc-17': t('FFTF', 'E. coli marks faecal pollution'),
  'bkc-18': t('FFFT', 'CFCs deplete ozone'),
  'bkc-19': t('FFTF', 'LPG burns cleanly for cooking'),
  'bkc-20': t('FFFT', 'cotton does not melt'),
  'bkc-21': t('FFFT', 'fossil fuels are running out'),
  'bkc-22': t('FTFF', 'many useful petrochemicals'),
  'bkc-23': t('FFFT', 'coke, coal gas, tar'),
  'bkc-24': t('FFTF', 'different boiling points'),
  'bkc-25': t('FFTF', 'kerosene is less volatile'),
  'bkc-26': t('FTFF', 'compressed: higher pressure'),
  'bkc-27': t('FFTF', 'natural gas lies on top'),
  'bkc-28': t('FTFF', 'Tyndall effect'),
  'bkc-29': t('FFTF', '18 electrons: argon'),
  'bkc-30': t('FTFF', '10 electrons each'),
  'bkc-32': t('FFFT', 'SO₂ forms an acid'),
  'bkc-33': t('FFTF', 'lustre'),
  'bkc-34': t('FTFF', 'zinc gives hydrogen'),
  'bkc-35': t('FFTF', 'chlorine purifies water'),
  'bkc-36': t('FTFF', 'gallium and caesium'),
  'bkc-37': t('FFFT', 'zinc is more electropositive'),
  'bkc-38': t('FFFT', 'nitrogen flushing'),
  'bkc-39': t('FFTF', 'zinc is more reactive'),
  'bkc-40': t('TFFF', 'pure gold is too soft'),
  'bkc-41': t('FFTF', 'silver is expensive'),
  'bkc-43': t('FFFT', 'N and P'),
  'bkc-44': t('TFFF', 'tincture of iodine'),
  'bkc-45': balanced(['Mg', 'O₂', 'MgO']),
  'bkc-46': t('FTFF', 'copper is deposited'),
  'bkc-47': t('TFFF', 'carbon dioxide'),
  'bkc-48': t('FFFT', 'CO₂ turns lime water milky'),
  'bkc-49': t('TFFF', 'S true, R shows it'),
  'bkc-50': t('FFTF', 'ozone absorbs UV'),
  'bkc-51': t('TFFF', 'zinc on iron'),
  'bkc-52': t('FFFT', 'oxygen and moisture'),
  'bkc-53': t('FTFF', 'salt water speeds rusting'),
  'bkc-54': t('TFFF', 'evaporated salt is impure'),
  'bkc-55': t('FTFF', 'nylon rope'),
  'bkc-56': t('FFTF', 'rayon: bedsheets with cotton, carpets with wool'),
  'bkc-57': t('FFTF', 'both true'),
  'bkc-58': t('FTFF', 'melamine resists fire'),
  'bkc-59': t('FFTF', 'nylon from coal, air, water'),
  'bkc-60': t('FFFT', 'esters'),
  'bkc-61': t('TFFF', 'thermosetting: cross-linked'),
  'bkc-64': t('FTFF', 'sand smothers a petrol fire'),
  'bkc-65': t('FTFF', 'carbon monoxide'),
  'bkc-66': t('FFTF', 'sulphur must be lit'),
  'bkc-67': num(280000 / 7),
  'bkc-68': t('FTFF', 'green copper carbonate'),
  'bkc-70': t('FFFT', 'CO₂ extinguisher'),
  'bkb-001': set('ii iv'),
  'bkb-002': t('FFTF', 'both true, ii explains i'),
  'bkb-003': t('FTFF', 'chromosomes'),
  'bkb-004': t('FFTF', 'an egg is one cell'),
  'bkb-005': pairs({ i: 'd', ii: 'c', iii: 'b', iv: 'a' }),
  'bkb-006': t('FTFF', 'both change shape'),
  'bkb-007': t('FFFT', 'size suits function'),
  'bkb-008': t('FFTF', 'nucleus, membrane, cytoplasm'),
  'bkb-009': set('i iii'),
  'bkb-010': t('TFFF', 'mitochondria make ATP'),
  'bkb-011': t('FTFF', 'rough ER: proteins'),
  'bkb-012': t('TFFF', 'shape and rigidity'),
  'bkb-013': t('TFFF', 'by eye: cytoplasm, nucleus, membrane, mitochondrion'),
  'bkb-014': t('FFTF', 'chromosomes'),
  'bkb-015': t('FFFT', 'coordinates activities'),
  'bkb-016': t('TFFF', 'onion cells have a cell wall'),
  'bkb-017': t('FTFF', 'no organised nucleus'),
  'bkb-018': t('FFFT', 'by eye: a chloroplast'),
  'bkb-019': t('FFTF', 'pesticides harm health'),
  'bkb-022': t('TFFF', 'A true, B false'),
  'bkb-023': t('FFFT', 'long maturity is unwanted'),
  'bkb-024': pairs({ i: 'b', ii: 'c', iii: 'a' }),
  'bkb-025': t('TFFF', 'moat, chain pump, dhekli, rahat'),
  'bkb-026': list('iii ii iv i'),
  'bkb-027': set('i ii'),
  'bkb-028': t('TFFF', 'uniform spacing and depth'),
  'bkb-029': set('i ii iii'),
  'bkb-030': t('FTFF', 'water gives no energy'),
  'bkb-031': t('FFFT', 'legumes fix nitrogen'),
  'bkb-032': t('FFFT', 'drip saves water'),
  'bkb-033': t('FFFT', 'plough'),
  'bkb-034': t('FTFF', 'grasshopper is a consumer'),
  'bkb-035': t('FFFT', 'salt and water'),
  'bkb-036': t('FFFT', 'radish root and leaves'),
  'bkb-037': set('ii iii iv'),
  'bkb-038': list('ii i iv iii'),
  'bkb-039': t('FFTF', 'deforestation'),
  'bkb-040': t('FFTF', 'IUCN'),
  'bkb-042': t('TFFF', 'biosphere'),
  'bkb-043': t('TFFF', 'ecosystem'),
  'bkb-044': t('FTFF', 'factories'),
  'bkb-045': t('TFFF', 'sewage'),
  'bkb-046': t('TFFF', 'reverse osmosis removes salt'),
  'bkb-047': t('FFFT', 'sedimentation'),
  'bkb-048': t('TFFF', 'habitat'),
  'bkb-049': t('FFTF', '1973'),
  'bkb-050': t('FFTF', 'coal is exhaustible'),
  'bkb-051': t('FFFT', 'all of the above'),
  'bkb-052': t('FFFT', 'all of these'),
  'bkb-053': t('TFFF', 'in situ'),
  'bkb-054': t('TFFF', 'species'),
  'bkb-055': t('FFFT', 'it raises the temperature'),
  'bkb-056': t('FFFT', 'cardboard comes from wood'),
  'bkb-057': t('FFTF', 'the cheetah (in India)'),
  'bkb-058': t('FTFF', 'fast, gives CO₂'),
  'bkb-059': t('FFTF', 'fermentation'),
  'bkb-060': t('TFFF', 'dead or weakened microbes'),
  'bkb-061': t('FFFT', 'Rhizobium fixes nitrogen'),
  'bkb-062': t('FFTF', 'sugar reduces moisture'),
  'bkb-063': t('FTFF', 'nitrogen'),
  'bkb-064': t('TFFF', 'complex organic to simple inorganic'),
  'bkb-065': t('TFFF', 'plant proteins'),
  'bkb-066': t('FTFF', 'Fleming – penicillin'),
  'bkb-067': t('FFTF', 'both true, R explains A'),
  'bkb-068': t('FFFT', 'ovum and sperm'),
  'bkb-069': t('TFFF', 'IVF'),
  'bkb-070': t('FFFT', 'continuation of the species'),
  'bkb-071': t('FTFF', 'to beat the odds of nature'),
  'bkb-072': set('ii iv'),
  'bkb-073': t('FFTF', 'better chance of fertilisation'),
  'bkb-074': t('FTFF', 'high blood sugar'),
  'bkb-075': t('TFFF', 'both correct'),
  'bkb-076': set('ii iii'),
  'bkb-077': t('FFTF', 'drugs harm health'),
  'bkb-078': pairs({ 1: 'e', 2: 'a', 3: 'd', 4: 'b' }),
  'bkb-079': t('TFFF', 'microscopic and unicellular'),
  'bkb-081': t('FFTF', 'by eye: ovum, fertilisation, zygote, embryo'),
  'bkb-082': t('TFFF', 'by eye: 1 plumule, 3 radicle'),
  'bkb-083': t('FTFF', 'statements 1, 2 and 3'),
  'bkb-084': t('TFFF', 'left side, then the aorta'),
  'bkb-085': t('FTFF', 'starch to sugar'),
  'bkb-087': t('TFFF', 'food vacuole'),
  'bkb-088': t('FFTF', 'peristalsis'),
  'bkb-089': t('TFFF', 'aorta'),
  'bkb-090': t('FFFT', 'kidney, ureter, bladder, urethra'),
  'bkb-091': t('FTFF', 'small intestine'),
  'bkb-092': t('FFFT', 'stomata'),
  'bkb-093': t('FTFF', 'duodenum'),
  'bkb-094': t('FFFT', 'peptidase'),
  'bkb-095': t('FTFF', 'kidney'),
  'bkb-096': t('FTFF', 'Monera, Plantae, Fungi, Protista, Animalia'),
  'bkb-097': t('FFTF', 'chitin and glycoproteins'),
  'bkb-098': t('FFFT', 'arthropods: haemocoel'),
  'bkb-099': t('TFFF', 'deodar is a gymnosperm'),
  'bkb-100': t('FTFF', 'gymnosperms and angiosperms'),
  'bkb-102': t('FTFF', 'reptiles have three chambers'),
  'bkb-103': t('FFTF', 'Wuchereria'),
  'bkb-104': t('FFFT', 'no flowers'),
  'bkb-106': t('FTFF', 'Spirogyra is an alga'),
  'bkb-107': t('FFTF', 'Euglena'),
  'bkb-108': t('FFTF', 'Thallophyta'),
  // ---- end of book ----
}

/** Questions left without an answer on purpose (each says why in its note). */
const UNSOLVED = new Set([
  'ka21s-23',
  'ka2223s-15',
  'ka2324s-26',
  'ka2526s-09',
  // ---- Book unsolved ----
  'bkp-08',
  'bkp-15',
  'bkp-19',
  'bkp-31',
  'bkp-34',
  'bkp-41',
  'bkp-45',
  'bkp-46',
  'bkp-49',
  'bkp-61',
  'bkp-62',
  'bkc-31',
  'bkc-42',
  'bkc-62',
  'bkc-63',
  'bkc-69',
  'bkb-020',
  'bkb-021',
  'bkb-041',
  'bkb-080',
  'bkb-086',
  'bkb-101',
  'bkb-105',
  // ---- end of book unsolved ----
])

const OLD = new Map(oldChapters.map((c) => [c.id, c]))
const problems: string[] = []
let checked = 0
for (const p of SAT_SOURCES) {
  const knQ = p.kn
  for (const q of p.questions.filter((x) => SECTION_SUBJECT[x.subject] === 'science')) {
    const at = `${p.id} Q${q.paperNo} (${q.id})`
    if (UNSOLVED.has(q.id)) {
      if (q.answer) problems.push(`${at}: listed as unsolved but has an answer`)
      if (!q.note || !knQ[q.id]?.note) problems.push(`${at}: an unsolved question needs a note (English and Kannada) saying why`)
      continue
    }
    const rule = RULES[q.id]
    if (!rule) {
      problems.push(`${at}: no rule`)
      continue
    }
    if (!q.answer) problems.push(`${at}: no answer`)
    if (q.keyFrom !== 'solved' && q.keyFrom !== 'book') problems.push(`${at}: no keyFrom`)
    const en = q.solution
    const k = knQ[q.id]?.solution
    if (!en?.concept || !en.steps?.length) problems.push(`${at}: no solution`)
    else if (!k?.concept || k.steps?.length !== en.steps.length) problems.push(`${at}: the Kannada solution is missing or has a different number of steps`)
    else {
      // The concept names where it comes from: a syllabus section, or the dropped chapter.
      const old = q.oldChapter ? OLD.get(q.oldChapter) : undefined
      if (old) {
        if (!en.concept.startsWith(`Old syllabus – ${old.name}: `)) problems.push(`${at}: the concept should start "Old syllabus – ${old.name}: "`)
        if (!k.concept.startsWith(`ಹಳೆಯ ಪಠ್ಯಕ್ರಮ – ${old.kn}: `)) problems.push(`${at}: the Kannada concept should start "ಹಳೆಯ ಪಠ್ಯಕ್ರಮ – ${old.kn}: "`)
      } else if (q.topic === null) {
        if (!en.concept.startsWith('Beyond the syllabus: ')) problems.push(`${at}: a Miscellaneous concept should start "Beyond the syllabus: "`)
        if (!k.concept.startsWith('ಪಠ್ಯಕ್ರಮದ ಹೊರಗೆ: ')) problems.push(`${at}: the Kannada concept should start "ಪಠ್ಯಕ್ರಮದ ಹೊರಗೆ: "`)
      } else if (!/^\d/.test(en.concept)) problems.push(`${at}: the concept should start with its syllabus section`)
      else if (en.concept.split(' ')[0] !== k.concept.split(' ')[0]) problems.push(`${at}: the Kannada concept cites a different section`)
    }
    let fits: Key[]
    try {
      fits = KEYS.filter((key) => rule(BY_KEY.has(rule) ? key : q.options[key]))
    } catch (e) {
      problems.push(`${at}: rule failed: ${(e as Error).message}`)
      continue
    }
    if (fits.length !== 1) problems.push(`${at}: ${fits.length} options fit (${fits.join(', ') || 'none'})`)
    else if (fits[0] !== q.answer) problems.push(`${at}: key ${q.answer}, but the rule gives ${fits[0]}`)
    checked++
  }
}
for (const id of [...Object.keys(RULES), ...UNSOLVED])
  if (!SAT_SOURCES.some((p) => p.questions.some((q) => q.id === id && SECTION_SUBJECT[q.subject] === 'science'))) problems.push(`${id}: listed here but isn't a science question`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`SAT science: ${checked} answers checked, ${UNSOLVED.size} left unsolved on purpose`)
