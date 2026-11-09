/**
 * Checks the answers to the study book's SAT social science questions (data/sat/book.json, subject "social").
 * The book has an answer key, and each answer here was checked against the syllabus notes (sat-syllabus/*.md):
 * every question has a rule saying which options are true, with a short reason, and exactly one option must be true
 * and match the answer. A key that is wrong is corrected (keyFrom "solved", with a note saying so); a question with
 * no single right answer has no answer and a note (English and Kannada) saying why. These answers have no worked
 * solution. The past papers' social science questions are not solved yet.  Run from app/:  npx tsx ../tools/check_sat_social.ts
 */
import { SAT_BOOK } from '../app/src/data/sat'

const KEYS = ['A', 'B', 'C', 'D'] as const
/** Which options are true, e.g. "FTFF", and why (a fact from the syllabus or the book). */
type Rule = { marks: string; why: string }
const t = (marks: string, why: string): Rule => ({ marks, why })

const RULES: Record<string, Rule> = {
  // ---- Book: NMMS.pdf (data/sat/book.json) ----
  'bks-001': t('TFFF', "Ashvaghosha, a poet at Kanishka’s court, wrote Buddhacharita"),
  'bks-002': t('FTFF', "the Narmada separates North India from the Deccan (South India)"),
  'bks-003': t('FFTF', "the dockyard at Lothal shows sea trade"),
  'bks-004': t('TFFF', "Egypt’s kings were called Pharaohs"),
  'bks-005': t('FTFF', "ziggurats were temple towers built on artificial hills"),
  'bks-006': t('FFTF', "Shi Huang Ti built the Great Wall"),
  'bks-007': t('FFFT', "the Olympic Games began in ancient Greece"),
  'bks-008': t('FFFT', "Roman fighters were gladiators"),
  'bks-009': t('FFFT', "syllabus: the Inca spread across Peru, Ecuador, Chile and Argentina"),
  'bks-010': t('FFTF', "the six darshanas are the pillars of Indian philosophy"),
  'bks-011': t('FFFT', "the five vows: ahimsa, satya, asteya, aparigraha, brahmacharya"),
  'bks-012': t('FFTF', "the first sermon at Sarnath is called Dharmachakra Pravartana"),
  'bks-013': t('TFFF', "Ashoka was the first to issue inscriptions on rocks and pillars"),
  'bks-014': t('FFTF', "Kanishka’s Saka era began in 78 CE"),
  'bks-015': t('FFFT', "Dhanvantari, Charaka, Sushruta and Aryabhata are all listed as Gupta-period scientists"),
  'bks-016': t('FTFF', "Pushyabhuti founded the Vardhanas; Simukha founded the Satavahanas"),
  'bks-017': t('FFTF', "by eye: the map shows the Gupta empire and Samudragupta’s southern campaign"),
  'bks-018': t('TFFF', "Kadambas and Gangas (4th century), then Badami Chalukyas (6th), then Rashtrakutas (8th)"),
  'bks-019': t('TFFF', "the Gangas ruled from Kuvalala, Talakadu and Manyapura; water was not the stated reason for moving"),
  'bks-021': t('FFTF', "Narasimhavarma I took Vatapi and was called Vatapikonda"),
  'bks-022': t('FFFT', "the Arab traveller Sulaiman visited Amoghavarsha’s court"),
  'bks-023': t('TFFF', "Ranna – Gadayuddha, Nayasena – Dharmamrita, Bilhana – Vikramankadeva Charita, Vijnaneshwara – Mitakshara"),
  'bks-024': t('FFTF', "members of the Chola village assembly were Perumakkal"),
  'bks-025': t('TFFF', "Vishnuvardhana built the Belur temple; Kailasanatha was built by Krishna I, Halebidu by the Hoysalas, Thanjavur by Rajaraja I"),
  'bks-027': t('FTFF', "Bhimbetka (MP) has prehistoric caves and rock shelters"),
  'bks-028': t('FFFT', "syllabus: cave drawings of wild animals in Madhya Pradesh, Uttar Pradesh and Karnataka"),
  'bks-029': t('FFFT', "fire gave light, roasted meat and scared away animals"),
  'bks-030': t('TFFF', "Lingasugur (Karnataka) was the first Neolithic site noticed in India, in 1842"),
  'bks-031': t('FTFF', "the Neolithic people of Piklihal (Karnataka) were cattle herders"),
  'bks-032': t('FTFF', "syllabus: the Mesolithic began about 12,000 years ago, when the world’s climate changed greatly"),
  'bks-033': t('TFFF', "the dog was the first animal tamed"),
  'bks-034': t('FFTF', "copper and stone tools together: the Chalcolithic (copper–stone) age"),
  'bks-035': t('FFFT', "Kannada is a Dravidian language"),
  'bks-036': t('FTFF', "both true; R (the oldest inscriptions are Ashoka’s) does not explain A (what inscriptions tell us)"),
  'bks-037': t('TFFF', "archaeologists study prehistoric life from remains"),
  'bks-038': t('TFFF', "Rigvedic river names: Vitasta – Jhelum, Asikni – Chenab, Parushni – Ravi, Vipasha – Beas, Shutudri – Sutlej"),
  'bks-039': t('FTFF', "both true (Egyptian hieroglyphics; Mesopotamian cuneiform), but R does not explain A"),
  'bks-040': t('FFFT', "the Hwang Ho’s floods made it “China’s Sorrow”"),
  'bks-041': t('FTFF', "the six darshanas: Nyaya, Vaisheshika, Sankhya, Yoga, Purva and Uttara Mimamsa (A lists the Vedangas)"),
  'bks-042': t('FFTF', "asteya means not stealing"),
  'bks-043': t('FFTF', "the triratnas: right knowledge, right faith, right conduct"),
  'bks-044': t('FTFF', "Kanishka patronised Mahayana Buddhism"),
  'bks-045': t('FFTF', "Dhanvantari – father of Indian medicine, Charaka – medical scientist, Sushruta – surgeon, Aryabhata – mathematician, Varahamihira – astronomer"),
  'bks-046': t('TFFF', "syllabus: Kamala of Midnapore shows that without society and socialisation a human behaves like an animal"),
  'bks-047': t('FFFT', "Marx was a German philosopher; Comte is the father of sociology; Spencer studied the evolution of society"),
  'bks-048': t('TFFF', "colere means to cultivate"),
  'bks-049': t('FFTF', "the plough made farming produce much more food"),
  'bks-050': t('FFTF', "industrial society: inventions, migration to cities, division of labour; farming is not its main occupation"),
  'bks-051': t('FTFF', "large groups in grasslands, power to those with most cattle: cattle-rearing society"),
  'bks-052': t('TFFF', "hunting and food-gathering people keep moving from place to place"),
  'bks-053': t('FFTF', "migration to industrial cities increased their population, so R is false"),
  'bks-054': t('TFFF', "i–iv describe hunting and food-gathering society; v is cattle-rearing and vi farming"),
  'bks-055': t('FFFT', "hunting and food gathering is the oldest, simplest society"),
  'bks-056': t('FTFF', "colere is Latin"),
  'bks-057': t('FFTF', "a convention is an accepted social practice, such as greeting"),
  'bks-058': t('TFFF', "Ghurye, Srinivas, Desai, Karve and Dube were all leading Indian sociologists"),
  'bks-059': t('FFFT', "Comte, not Weber, is the father of sociology"),
  'bks-060': t('FFFT', "Herbert Spencer, a 19th-century British sociologist, studied the evolution of society"),
  'bks-061': t('TFFF', "Comte named sociology, which is why he is called its father"),
  'bks-062': t('TFFF', "syllabus: Plato’s Republic discussed for the first time the nature and functions of the state and government"),
  'bks-063': t('FFFT', "political science covers the state, the constitution, international relations and citizenship; studying society and social problems is sociology"),
  'bks-064': t('FFFT', "citizenship is acquired by birth, descent, registration and naturalisation (and incorporation); renunciation is a way to lose it"),
  'bks-065': t('FFTF', "citizenship is lost by renunciation, termination and deprivation"),
  'bks-066': t('FFTF', "the 61st Amendment (1989) lowered the voting age from 21 to 18, not 20"),
  'bks-067': t('FFFT', "the Election Commission has one Chief Election Commissioner and two Election Commissioners; general elections are every five years, and the State Election Commission runs panchayat elections"),
  'bks-068': t('TFFF', "Grama Panchayat – Panchayat Development Officer, Taluk Panchayat – Executive Officer, Zilla Panchayat – Chief Executive Officer, Town Municipality – Chief Officer"),
  'bks-069': t('FTFF', "syllabus: one Zilla Panchayat member per 18,000 in Kodagu, 30,000 in Chikkamagaluru, about 40,000 elsewhere (Belagavi); so Bengaluru Urban gets the remaining 20,000"),
  'bks-070': t('FFTF', "Mangaluru, Davanagere, Tumakuru and Ballari have city corporations; Mandya and Vijayanagara do not"),
  'bks-071': t('FTFF', "Adam Smith called economics the science of wealth"),
  'bks-073': t('FTFF', "repairing your own child’s cycle earns no money, so it is not an economic activity; the others are"),
  'bks-074': t('TFFF', "stitching clothes makes something useful: production (of a service)"),
  'bks-075': t('TFFF', "Kautilya wrote the Arthashastra"),
  'bks-076': t('FFTF', "a consumer uses goods and services"),
  'bks-077': t('TFFF', "law of demand: as price rises, demand falls (15 tonnes at ₹10, 10 tonnes at ₹15)"),
  'bks-078': t('FFTF', "supply is the quantity offered for sale at a given price"),
  'bks-079': t('FTFF', "changing wood into a chair adds form utility"),
  'bks-080': t('FFFT', "price is value expressed in money"),
  'bks-081': t('TFFF', "when demand and supply differ, the price changes (up or down)"),
  'bks-082': t('FFFT', "national income grows with production, and its growth shows development"),
  'bks-083': t('FFTF', "per capita income = national income ÷ population; with the population fixed it rises and falls with national income and shows the economic condition"),
  'bks-084': t('TFFF', "mental labour needs intelligence; physical labour needs strength"),
  'bks-085': t('TFFF', "large quantities are bought from a wholesaler"),
  'bks-086': t('FTFF', "genetic industries breed plants and animals"),
  'bks-087': t('FFFT', "importing goods to re-export them is entrepot trade"),
  'bks-088': t('TFFF', "cottage industries are run at home: household industries"),
  'bks-089': t('FFTF', "the Karta heads a Hindu Undivided Family business"),
  'bks-090': t('FFFT', "a nominal partner lends only his name: no share of profit, but liable to outsiders"),
  'bks-091': t('FFFT', "Pradhan Mantri Jeevan Jyoti Bima Yojana gives life insurance to people aged 18 to 50 (the others are Jan Dhan and Mudra)"),
  'bks-092': t('TFFF', "per capita income = national income ÷ total population"),
  'bks-093': t('FTFF', "services contribute the largest share of India’s national income"),
  'bks-094': t('TFFF', "a sole trader starts with own capital, gives some jobs and keeps all profit; limited managerial ability is a drawback"),
  'bks-095': t('FTFF', "buying a car for one’s own use is consumption"),
  'bks-097': t('TFFF', "the equatorial low-pressure belt is the warmest, getting direct rays all year"),
  'bks-098': t('FTFF', "troposphere – lowest layer, stratosphere – ozone, thermosphere – ionosphere, exosphere – very low pressure"),
  'bks-099': t('FFTF', "upper crust – SIAL, lower crust – SIMA, upper mantle – asthenosphere, core – NIFE"),
  'bks-100': t('FTFF', "the Indian Ocean lies between Asia, Africa and Australia"),
  'bks-101': t('TFFF', "both true; the 2004 tsunami is an example, not an explanation"),
  'bks-102': t('FFFT', "23½° S – Tropic of Capricorn, 66½° N – Arctic Circle, 66½° S – Antarctic Circle, 23½° N – Tropic of Cancer"),
  'bks-103': t('TFFF', "by eye: Y marks the gulf on the coast of south Gujarat, the Gulf of Khambhat (Cambay)"),
  'bks-104': t('FFTF', "syllabus: Lake Van (Turkey) 330 ppt is saltier than the Dead Sea (300 ppt)"),
  'bks-105': t('FFTF', "the highest (spring) tides come when Earth, Moon and Sun are in a straight line"),
  'bks-106': t('TFFF', "the International Date Line follows 180° but zigzags to avoid land"),
  'bks-107': t('FFFT', "the prime meridian is the Greenwich meridian, and each degree of longitude is 4 minutes of time"),
  'bks-108': t('FTFF', "from the coast outwards: continental shelf, continental slope, deep sea plain, deeps and trenches"),
  'bks-110': t('FTFF', "syllabus: the lower course is the stage of deposition (flood plains, ox-bow lakes, deltas)"),
  'bks-111': t('TFFF', "acid rain is called the lake killer"),
  'bks-112': t('TFFF', "Richter scale – earthquakes, anemometer – wind speed, fathometer – ocean depth, barometer – air pressure"),
  'bks-113': t('FTFF', "syllabus: the North Sub-Tropical High (30°–35° N) is called the Horse Latitudes"),
  'bks-114': t('FFTF', "trade winds – sub-tropical high to equatorial low, anti-trades (westerlies) – sub-tropical high to sub-polar low, polar winds – polar high to sub-polar low, anticyclones – out from a high-pressure centre"),
  'bks-115': t('FFTF', "ozone is in the stratosphere; radio waves are reflected by the ionosphere, not ozone"),
  'bks-116': t('FTFF', "ocean currents depend on the Earth’s rotation, temperature and salinity (and winds), not on latitude and longitude lines"),
  'bks-117': t('FTFF', "Campos – Brazil, Llanos – Venezuela, Selvas – Amazon, Pampas – Argentina"),
  'bks-118': t('FFFT', "Dakshina Gangotri was India’s first Antarctic station"),
  'bks-119': t('TFFF', "Superior – largest freshwater lake, Winnipeg – Canada, Titicaca – highest, Poopó – Bolivia"),
  'bks-120': t('FFTF', "Brazil is called the coffee pot (coffee bowl) of the world"),
  'bks-121': t('TFFF', "stalactites and stalagmites form by the work of groundwater in limestone caves"),
  'bks-122': t('FFFT', "a geoid is flattened at the poles and bulges at the equator"),
  'bks-123': t('FTFF', "upwards: troposphere (changing), stratosphere (isothermal), mesosphere (intermediate), exosphere (outer)"),
  'bks-124': t('FFFT', "volcanism is magma coming out, and the Earth’s internal energy forces it out through vents"),
  'bks-125': t('TFFF', "the world has 24 time zones (one per 15° of longitude); Russia has 11, the USA more than 3, Australia 3"),
  'bks-126': t('FTFF', "the shallow continental shelf is best for fishing and navigation"),
  'bks-127': t('FFTF', "syllabus: guyots (flat-topped seamounts) are on the deep sea plain"),
  'bks-128': t('FFTF', "acid rain is the lake killer"),
  'bks-129': t('FFFT', "granite → gneiss, sandstone → quartzite, limestone → marble; graphite (carbon) → diamond is the only right pair"),
  'bks-130': t('FTFF', "syllabus: Stromboli is active; Fujiyama and Krakatoa are dormant; Arthur’s Seat is extinct"),
  'bks-131': t('FFFT', "the boundary between crust and mantle is the Mohorovičić discontinuity (Moho)"),
  'bks-132': t('TFFF', "breaking rocks by heat, rain and frost is physical (mechanical) weathering"),
  'bks-133': t('FFTF', "the Black Triangle of acid rain is Poland, the Czech Republic and south-east Germany"),
  'bks-134': t('TFFF', "the total water vapour in a volume of air is absolute humidity (the book’s option A, “integrated humidity”, means this)"),
  'bks-135': t('FTFF', "rock steps (shila sopana) are cut by glaciers; deposits, pedestal rocks and swallow holes are made by rivers, wind and groundwater"),
  'bks-136': t('FFFT', "the equatorial low (doldrums) is the calm zone"),
  'bks-137': t('FFTF', "syllabus: Lake Van 330 ppt, the most saline"),
  'bks-138': t('FFFT', "global warming melts ice and raises sea level"),
  'bks-139': t('FTFF', "meteorology studies the atmosphere’s short-term condition (weather); climatology the long term"),
  'bks-140': t('TFFF', "a river goes from its source, joined by tributaries at confluences, to its mouth"),
  'bks-141': t('TFFF', "rockfalls and collapsing cave roofs are landslides"),
  'bks-142': t('FTFF', "limestone dissolving with carbon dioxide in rain water is carbonation"),
  'bks-143': t('FFFT', "nimbus clouds bring steady rain"),
  'bks-144': t('TFFF', "Chinook – USA, Mistral – France, Brickfielder – Australia, Blizzard – Antarctica"),
  'bks-145': t('FFTF', "a strait is a narrow strip of water joining two large water bodies"),
  // ---- end of book ----
}

/** Questions left without an answer on purpose (each says why in its note). */
const UNSOLVED = new Set([
  // ---- Book unsolved ----
  'bks-020',
  'bks-026',
  'bks-072',
  'bks-096',
  'bks-109',
  // ---- end of book unsolved ----
])

const problems: string[] = []
let checked = 0
for (const q of SAT_BOOK.questions.filter((x) => x.subject === 'social')) {
  const at = `book social Q${q.paperNo} (${q.id})`
  if (UNSOLVED.has(q.id)) {
    if (q.answer) problems.push(`${at}: listed as unsolved but has an answer`)
    if (!q.note || !SAT_BOOK.kn[q.id]?.note) problems.push(`${at}: an unsolved question needs a note (English and Kannada) saying why`)
    continue
  }
  const rule = RULES[q.id]
  if (!rule) {
    problems.push(`${at}: no rule`)
    continue
  }
  if (!/^[TF]{4}$/.test(rule.marks) || !rule.why) problems.push(`${at}: a rule needs four T/F marks and a reason`)
  if (!q.answer) problems.push(`${at}: no answer`)
  if (q.keyFrom !== 'book' && q.keyFrom !== 'solved') problems.push(`${at}: no keyFrom`)
  if (q.keyFrom === 'solved' && (!q.note || !SAT_BOOK.kn[q.id]?.note)) problems.push(`${at}: a corrected key needs a note (English and Kannada) saying so`)
  const fits = KEYS.filter((_, i) => rule.marks[i] === 'T')
  if (fits.length !== 1) problems.push(`${at}: ${fits.length} options are true (${fits.join(', ') || 'none'})`)
  else if (fits[0] !== q.answer) problems.push(`${at}: answer ${q.answer}, but the rule gives ${fits[0]}`)
  checked++
}
for (const id of [...Object.keys(RULES), ...UNSOLVED])
  if (!SAT_BOOK.questions.some((q) => q.id === id && q.subject === 'social')) problems.push(`${id}: listed here but isn't a book social science question`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`SAT social science (book): ${checked} answers checked, ${UNSOLVED.size} left unsolved on purpose`)
