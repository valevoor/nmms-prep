/**
 * Revision sheets for SAT textbook chapters (#/sat/<topic>/revise): key terms, formulas with an example, and
 * common mistakes. Written in our own words from the textbook pages, with the page numbers; not copied from
 * it, because the books are marked "not to be republished". tools/check_sat_revise.ts re-works every example.
 * Kannada (a draft) is in <chapter>.kn.json, keyed by id; what it leaves out, such as a formula that is only
 * maths, is the same in both languages.
 */
import squareCube from './sat/revise/math-8-01-square-and-cube.json'
import squareCubeKn from './sat/revise/math-8-01-square-and-cube.kn.json'
import powerPlay from './sat/revise/math-8-02-power-play.json'
import powerPlayKn from './sat/revise/math-8-02-power-play.kn.json'
import storyOfNumbers from './sat/revise/math-8-03-story-of-numbers.json'
import storyOfNumbersKn from './sat/revise/math-8-03-story-of-numbers.kn.json'
import quadrilaterals from './sat/revise/math-8-04-quadrilaterals.json'
import quadrilateralsKn from './sat/revise/math-8-04-quadrilaterals.kn.json'
import numberPlay8 from './sat/revise/math-8-05-number-play.json'
import numberPlay8Kn from './sat/revise/math-8-05-number-play.kn.json'
import distributeMultiply from './sat/revise/math-8-06-distribute-multiply.json'
import distributeMultiplyKn from './sat/revise/math-8-06-distribute-multiply.kn.json'
import proportional1 from './sat/revise/math-8-07-proportional-reasoning-1.json'
import proportional1Kn from './sat/revise/math-8-07-proportional-reasoning-1.kn.json'
import fractionsDisguise from './sat/revise/math-8-08-fractions-in-disguise.json'
import fractionsDisguiseKn from './sat/revise/math-8-08-fractions-in-disguise.kn.json'
import baudhayana from './sat/revise/math-8-09-baudhayana-pythagoras.json'
import baudhayanaKn from './sat/revise/math-8-09-baudhayana-pythagoras.kn.json'
import proportional2 from './sat/revise/math-8-10-proportional-reasoning-2.json'
import proportional2Kn from './sat/revise/math-8-10-proportional-reasoning-2.kn.json'
import geometricThemes from './sat/revise/math-8-11-geometric-themes.json'
import geometricThemesKn from './sat/revise/math-8-11-geometric-themes.kn.json'
import talesDots from './sat/revise/math-8-12-tales-dots-bars-lines.json'
import talesDotsKn from './sat/revise/math-8-12-tales-dots-bars-lines.kn.json'
import algebraPlay from './sat/revise/math-8-13-algebra-play.json'
import algebraPlayKn from './sat/revise/math-8-13-algebra-play.kn.json'
import area8 from './sat/revise/math-8-14-area.json'
import area8Kn from './sat/revise/math-8-14-area.kn.json'
import largeNumbers from './sat/revise/math-7-01-large-numbers.json'
import largeNumbersKn from './sat/revise/math-7-01-large-numbers.kn.json'
import arithmeticExpressions from './sat/revise/math-7-02-arithmetic-expressions.json'
import arithmeticExpressionsKn from './sat/revise/math-7-02-arithmetic-expressions.kn.json'
import peekBeyond from './sat/revise/math-7-03-peek-beyond-point.json'
import peekBeyondKn from './sat/revise/math-7-03-peek-beyond-point.kn.json'
import letterNumbers from './sat/revise/math-7-04-expressions-letter-numbers.json'
import letterNumbersKn from './sat/revise/math-7-04-expressions-letter-numbers.kn.json'
import parallelLines from './sat/revise/math-7-05-parallel-intersecting-lines.json'
import parallelLinesKn from './sat/revise/math-7-05-parallel-intersecting-lines.kn.json'
import numberPlay7 from './sat/revise/math-7-06-number-play.json'
import numberPlay7Kn from './sat/revise/math-7-06-number-play.kn.json'
import threeLines from './sat/revise/math-7-07-three-intersecting-lines.json'
import threeLinesKn from './sat/revise/math-7-07-three-intersecting-lines.kn.json'
import workingFractions from './sat/revise/math-7-08-working-with-fractions.json'
import workingFractionsKn from './sat/revise/math-7-08-working-with-fractions.kn.json'
import geometricTwins from './sat/revise/math-7-09-geometric-twins.json'
import geometricTwinsKn from './sat/revise/math-7-09-geometric-twins.kn.json'
import integers from './sat/revise/math-7-10-operations-integers.json'
import integersKn from './sat/revise/math-7-10-operations-integers.kn.json'
import commonGround from './sat/revise/math-7-11-finding-common-ground.json'
import commonGroundKn from './sat/revise/math-7-11-finding-common-ground.kn.json'
import anotherPeek from './sat/revise/math-7-12-another-peek-beyond-point.json'
import anotherPeekKn from './sat/revise/math-7-12-another-peek-beyond-point.kn.json'
import connectingDots from './sat/revise/math-7-13-connecting-the-dots.json'
import connectingDotsKn from './sat/revise/math-7-13-connecting-the-dots.kn.json'
import constructions from './sat/revise/math-7-14-constructions-and-tilings.json'
import constructionsKn from './sat/revise/math-7-14-constructions-and-tilings.kn.json'
import findingUnknown from './sat/revise/math-7-15-finding-the-unknown.json'
import findingUnknownKn from './sat/revise/math-7-15-finding-the-unknown.kn.json'
import everEvolvingScience7 from './sat/revise/sci-7-01-ever-evolving-science.json'
import everEvolvingScience7Kn from './sat/revise/sci-7-01-ever-evolving-science.kn.json'
import acidsBasesNeutral7 from './sat/revise/sci-7-02-acids-bases-neutral.json'
import acidsBasesNeutral7Kn from './sat/revise/sci-7-02-acids-bases-neutral.kn.json'
import electricityCircuits7 from './sat/revise/sci-7-03-electricity-circuits.json'
import electricityCircuits7Kn from './sat/revise/sci-7-03-electricity-circuits.kn.json'
import metalsNonMetals7 from './sat/revise/sci-7-04-metals-non-metals.json'
import metalsNonMetals7Kn from './sat/revise/sci-7-04-metals-non-metals.kn.json'
import changesPhysicalChemical7 from './sat/revise/sci-7-05-changes-physical-chemical.json'
import changesPhysicalChemical7Kn from './sat/revise/sci-7-05-changes-physical-chemical.kn.json'
import adolescenceGrowth7 from './sat/revise/sci-7-06-adolescence-growth.json'
import adolescenceGrowth7Kn from './sat/revise/sci-7-06-adolescence-growth.kn.json'
import heatTransferWaterCycle7 from './sat/revise/sci-7-07-heat-transfer-water-cycle.json'
import heatTransferWaterCycle7Kn from './sat/revise/sci-7-07-heat-transfer-water-cycle.kn.json'
import timeAndMotion7 from './sat/revise/sci-7-08-time-and-motion.json'
import timeAndMotion7Kn from './sat/revise/sci-7-08-time-and-motion.kn.json'
import lifeProcessesAnimals7 from './sat/revise/sci-7-09-life-processes-animals.json'
import lifeProcessesAnimals7Kn from './sat/revise/sci-7-09-life-processes-animals.kn.json'
import lifeProcessesPlants7 from './sat/revise/sci-7-10-life-processes-plants.json'
import lifeProcessesPlants7Kn from './sat/revise/sci-7-10-life-processes-plants.kn.json'
import lightShadowsReflections7 from './sat/revise/sci-7-11-light-shadows-reflections.json'
import lightShadowsReflections7Kn from './sat/revise/sci-7-11-light-shadows-reflections.kn.json'
import earthMoonSun7 from './sat/revise/sci-7-12-earth-moon-sun.json'
import earthMoonSun7Kn from './sat/revise/sci-7-12-earth-moon-sun.kn.json'
import investigativeWorld8 from './sat/revise/sci-8-01-investigative-world.json'
import investigativeWorld8Kn from './sat/revise/sci-8-01-investigative-world.kn.json'
import invisibleLivingWorld8 from './sat/revise/sci-8-02-invisible-living-world.json'
import invisibleLivingWorld8Kn from './sat/revise/sci-8-02-invisible-living-world.kn.json'
import healthDiseases8 from './sat/revise/sci-8-03-health-diseases.json'
import healthDiseases8Kn from './sat/revise/sci-8-03-health-diseases.kn.json'
import electricityEffects8 from './sat/revise/sci-8-04-electricity-effects.json'
import electricityEffects8Kn from './sat/revise/sci-8-04-electricity-effects.kn.json'
import exploringForces8 from './sat/revise/sci-8-05-exploring-forces.json'
import exploringForces8Kn from './sat/revise/sci-8-05-exploring-forces.kn.json'
import pressureWindsCyclones8 from './sat/revise/sci-8-06-pressure-winds-cyclones.json'
import pressureWindsCyclones8Kn from './sat/revise/sci-8-06-pressure-winds-cyclones.kn.json'
import particulateMatter8 from './sat/revise/sci-8-07-particulate-matter.json'
import particulateMatter8Kn from './sat/revise/sci-8-07-particulate-matter.kn.json'
import elementsCompoundsMixtures8 from './sat/revise/sci-8-08-elements-compounds-mixtures.json'
import elementsCompoundsMixtures8Kn from './sat/revise/sci-8-08-elements-compounds-mixtures.kn.json'
import solutesSolventsDensity8 from './sat/revise/sci-8-09-solutes-solvents-density.json'
import solutesSolventsDensity8Kn from './sat/revise/sci-8-09-solutes-solvents-density.kn.json'
import lightMirrorsLenses8 from './sat/revise/sci-8-10-light-mirrors-lenses.json'
import lightMirrorsLenses8Kn from './sat/revise/sci-8-10-light-mirrors-lenses.kn.json'
import keepingTimeSkies8 from './sat/revise/sci-8-11-keeping-time-skies.json'
import keepingTimeSkies8Kn from './sat/revise/sci-8-11-keeping-time-skies.kn.json'
import natureInHarmony8 from './sat/revise/sci-8-12-nature-in-harmony.json'
import natureInHarmony8Kn from './sat/revise/sci-8-12-nature-in-harmony.kn.json'
import earthLifeSustainingPlanet8 from './sat/revise/sci-8-13-earth-life-sustaining-planet.json'
import earthLifeSustainingPlanet8Kn from './sat/revise/sci-8-13-earth-life-sustaining-planet.kn.json'
import ss7_majorDevelopmentsWorld from './sat/revise/ss-7-01-major-developments-world.json'
import ss7_majorDevelopmentsWorldKn from './sat/revise/ss-7-01-major-developments-world.kn.json'
import ss7_medievalEurope from './sat/revise/ss-7-02-medieval-europe.json'
import ss7_medievalEuropeKn from './sat/revise/ss-7-02-medieval-europe.kn.json'
import ss7_adventOfEuropeans from './sat/revise/ss-7-03-advent-of-europeans.json'
import ss7_adventOfEuropeansKn from './sat/revise/ss-7-03-advent-of-europeans.kn.json'
import ss7_india18thCentury from './sat/revise/ss-7-04-india-18th-century.json'
import ss7_india18thCenturyKn from './sat/revise/ss-7-04-india-18th-century.kn.json'
import ss7_growthBritishSupremacy from './sat/revise/ss-7-05-growth-british-supremacy.json'
import ss7_growthBritishSupremacyKn from './sat/revise/ss-7-05-growth-british-supremacy.kn.json'
import ss7_impactBritishRule from './sat/revise/ss-7-06-impact-british-rule.json'
import ss7_impactBritishRuleKn from './sat/revise/ss-7-06-impact-british-rule.kn.json'
import ss7_mysorePrincelyStates from './sat/revise/ss-7-07-mysore-princely-states.json'
import ss7_mysorePrincelyStatesKn from './sat/revise/ss-7-07-mysore-princely-states.kn.json'
import ss7_bhakthiCultSufiHeritage from './sat/revise/ss-7-08-bhakthi-cult-sufi-heritage.json'
import ss7_bhakthiCultSufiHeritageKn from './sat/revise/ss-7-08-bhakthi-cult-sufi-heritage.kn.json'
import ss7_legislativeExecutiveJudicialTerms from './sat/revise/ss-7-09-legislative-executive-judicial-terms.json'
import ss7_legislativeExecutiveJudicialTermsKn from './sat/revise/ss-7-09-legislative-executive-judicial-terms.kn.json'
import ss7_unionGovernment from './sat/revise/ss-7-10-union-government.json'
import ss7_unionGovernmentKn from './sat/revise/ss-7-10-union-government.kn.json'
import ss7_stateGovernment from './sat/revise/ss-7-11-state-government.json'
import ss7_stateGovernmentKn from './sat/revise/ss-7-11-state-government.kn.json'
import ss7_physicalDivisionsIndia from './sat/revise/ss-7-12-physical-divisions-india.json'
import ss7_physicalDivisionsIndiaKn from './sat/revise/ss-7-12-physical-divisions-india.kn.json'
import ss7_northAmerica from './sat/revise/ss-7-13-north-america.json'
import ss7_northAmericaKn from './sat/revise/ss-7-13-north-america.kn.json'
import ss7_southAmerica from './sat/revise/ss-7-14-south-america.json'
import ss7_southAmericaKn from './sat/revise/ss-7-14-south-america.kn.json'
import ss7_socialReligiousReforms from './sat/revise/ss-7-15-social-religious-reforms.json'
import ss7_socialReligiousReformsKn from './sat/revise/ss-7-15-social-religious-reforms.kn.json'
import ss7_firstWarIndianIndependence from './sat/revise/ss-7-16-first-war-indian-independence.json'
import ss7_firstWarIndianIndependenceKn from './sat/revise/ss-7-16-first-war-indian-independence.kn.json'
import ss7_freedomMovement from './sat/revise/ss-7-17-freedom-movement.json'
import ss7_freedomMovementKn from './sat/revise/ss-7-17-freedom-movement.kn.json'
import ss7_unificationOfKarnataka from './sat/revise/ss-7-18-unification-of-karnataka.json'
import ss7_unificationOfKarnatakaKn from './sat/revise/ss-7-18-unification-of-karnataka.kn.json'
import ss7_proSocialMovementsKarnataka from './sat/revise/ss-7-19-pro-social-movements-karnataka.json'
import ss7_proSocialMovementsKarnatakaKn from './sat/revise/ss-7-19-pro-social-movements-karnataka.kn.json'
import ss7_karnatakaEconomicSocialTransformation from './sat/revise/ss-7-20-karnataka-economic-social-transformation.json'
import ss7_karnatakaEconomicSocialTransformationKn from './sat/revise/ss-7-20-karnataka-economic-social-transformation.kn.json'
import ss7_progressDifferentFields from './sat/revise/ss-7-21-progress-different-fields.json'
import ss7_progressDifferentFieldsKn from './sat/revise/ss-7-21-progress-different-fields.kn.json'
import ss7_judiciary from './sat/revise/ss-7-22-judiciary.json'
import ss7_judiciaryKn from './sat/revise/ss-7-22-judiciary.kn.json'
import ss7_defenceForces from './sat/revise/ss-7-23-defence-forces.json'
import ss7_defenceForcesKn from './sat/revise/ss-7-23-defence-forces.kn.json'
import ss7_indiaNeighbouringCountries from './sat/revise/ss-7-24-india-neighbouring-countries.json'
import ss7_indiaNeighbouringCountriesKn from './sat/revise/ss-7-24-india-neighbouring-countries.kn.json'
import ss7_unitedNationsOrganization from './sat/revise/ss-7-25-united-nations-organization.json'
import ss7_unitedNationsOrganizationKn from './sat/revise/ss-7-25-united-nations-organization.kn.json'
import ss7_australia from './sat/revise/ss-7-26-australia.json'
import ss7_australiaKn from './sat/revise/ss-7-26-australia.kn.json'
import ss7_antarctica from './sat/revise/ss-7-27-antarctica.json'
import ss7_antarcticaKn from './sat/revise/ss-7-27-antarctica.kn.json'
import ss8_sources from './sat/revise/ss-8-01-sources.json'
import ss8_sourcesKn from './sat/revise/ss-8-01-sources.kn.json'
import ss8_bharathavarshaPrehistoric from './sat/revise/ss-8-02-bharathavarsha-prehistoric.json'
import ss8_bharathavarshaPrehistoricKn from './sat/revise/ss-8-02-bharathavarsha-prehistoric.kn.json'
import ss8_sindhuSaraswatiVedic from './sat/revise/ss-8-03-sindhu-saraswati-vedic.json'
import ss8_sindhuSaraswatiVedicKn from './sat/revise/ss-8-03-sindhu-saraswati-vedic.kn.json'
import ss8_prominentWorldCivilizations from './sat/revise/ss-8-04-prominent-world-civilizations.json'
import ss8_prominentWorldCivilizationsKn from './sat/revise/ss-8-04-prominent-world-civilizations.kn.json'
import ss8_sanatanaDharma from './sat/revise/ss-8-05-sanatana-dharma.json'
import ss8_sanatanaDharmaKn from './sat/revise/ss-8-05-sanatana-dharma.kn.json'
import ss8_jainismBuddhism from './sat/revise/ss-8-06-jainism-buddhism.json'
import ss8_jainismBuddhismKn from './sat/revise/ss-8-06-jainism-buddhism.kn.json'
import ss8_meaningImportancePoliticalScience from './sat/revise/ss-8-07-meaning-importance-political-science.json'
import ss8_meaningImportancePoliticalScienceKn from './sat/revise/ss-8-07-meaning-importance-political-science.kn.json'
import ss8_citizenCitizenship from './sat/revise/ss-8-08-citizen-citizenship.json'
import ss8_citizenCitizenshipKn from './sat/revise/ss-8-08-citizen-citizenship.kn.json'
import ss8_manAndSociety from './sat/revise/ss-8-09-man-and-society.json'
import ss8_manAndSocietyKn from './sat/revise/ss-8-09-man-and-society.kn.json'
import ss8_manAndCulture from './sat/revise/ss-8-10-man-and-culture.json'
import ss8_manAndCultureKn from './sat/revise/ss-8-10-man-and-culture.kn.json'
import ss8_earthOurLivingPlanet from './sat/revise/ss-8-11-earth-our-living-planet.json'
import ss8_earthOurLivingPlanetKn from './sat/revise/ss-8-11-earth-our-living-planet.kn.json'
import ss8_lithosphere from './sat/revise/ss-8-12-lithosphere.json'
import ss8_lithosphereKn from './sat/revise/ss-8-12-lithosphere.kn.json'
import ss8_atmosphere from './sat/revise/ss-8-13-atmosphere.json'
import ss8_atmosphereKn from './sat/revise/ss-8-13-atmosphere.kn.json'
import ss8_meaningImportanceEconomics from './sat/revise/ss-8-14-meaning-importance-economics.json'
import ss8_meaningImportanceEconomicsKn from './sat/revise/ss-8-14-meaning-importance-economics.kn.json'
import ss8_meaningImportanceBusinessStudies from './sat/revise/ss-8-15-meaning-importance-business-studies.json'
import ss8_meaningImportanceBusinessStudiesKn from './sat/revise/ss-8-15-meaning-importance-business-studies.kn.json'
import ss8_mauryasKushans from './sat/revise/ss-8-16-mauryas-kushans.json'
import ss8_mauryasKushansKn from './sat/revise/ss-8-16-mauryas-kushans.kn.json'
import ss8_guptasVardhanas from './sat/revise/ss-8-17-guptas-vardhanas.json'
import ss8_guptasVardhanasKn from './sat/revise/ss-8-17-guptas-vardhanas.kn.json'
import ss8_shathavahanasKadambasGangas from './sat/revise/ss-8-18-shathavahanas-kadambas-gangas.json'
import ss8_shathavahanasKadambasGangasKn from './sat/revise/ss-8-18-shathavahanas-kadambas-gangas.kn.json'
import ss8_chalukyasBadamiPallavasKanchi from './sat/revise/ss-8-19-chalukyas-badami-pallavas-kanchi.json'
import ss8_chalukyasBadamiPallavasKanchiKn from './sat/revise/ss-8-19-chalukyas-badami-pallavas-kanchi.kn.json'
import ss8_rashtrakutasChalukyasKalyana from './sat/revise/ss-8-20-rashtrakutas-chalukyas-kalyana.json'
import ss8_rashtrakutasChalukyasKalyanaKn from './sat/revise/ss-8-20-rashtrakutas-chalukyas-kalyana.kn.json'
import ss8_cholasHoysalasDwarasamudra from './sat/revise/ss-8-21-cholas-hoysalas-dwarasamudra.json'
import ss8_cholasHoysalasDwarasamudraKn from './sat/revise/ss-8-21-cholas-hoysalas-dwarasamudra.kn.json'
import ss8_democracy from './sat/revise/ss-8-22-democracy.json'
import ss8_democracyKn from './sat/revise/ss-8-22-democracy.kn.json'
import ss8_localSelfGovernment from './sat/revise/ss-8-23-local-self-government.json'
import ss8_localSelfGovernmentKn from './sat/revise/ss-8-23-local-self-government.kn.json'
import ss8_sociologyDailyLife from './sat/revise/ss-8-24-sociology-daily-life.json'
import ss8_sociologyDailyLifeKn from './sat/revise/ss-8-24-sociology-daily-life.kn.json'
import ss8_kindsOfSocieties from './sat/revise/ss-8-25-kinds-of-societies.json'
import ss8_kindsOfSocietiesKn from './sat/revise/ss-8-25-kinds-of-societies.kn.json'
import ss8_hydrosphere from './sat/revise/ss-8-26-hydrosphere.json'
import ss8_hydrosphereKn from './sat/revise/ss-8-26-hydrosphere.kn.json'
import ss8_biosphere from './sat/revise/ss-8-27-biosphere.json'
import ss8_biosphereKn from './sat/revise/ss-8-27-biosphere.kn.json'
import ss8_basicConceptsEconomics from './sat/revise/ss-8-28-basic-concepts-economics.json'
import ss8_basicConceptsEconomicsKn from './sat/revise/ss-8-28-basic-concepts-economics.kn.json'
import ss8_emergenceBusinessOrganisations from './sat/revise/ss-8-29-emergence-business-organisations.json'
import ss8_emergenceBusinessOrganisationsKn from './sat/revise/ss-8-29-emergence-business-organisations.kn.json'
import ss8_largeScaleBusinessOrganisations from './sat/revise/ss-8-30-large-scale-business-organisations.json'
import ss8_largeScaleBusinessOrganisationsKn from './sat/revise/ss-8-30-large-scale-business-organisations.kn.json'
import type { SatChapter, SatTopic } from './sat'

export interface RevisionTerm {
  id: string
  term: string
  meaning: string
  /** Book pages: one page, or the first and last. */
  pages: number[]
}

export interface RevisionItem {
  id: string
  name: string
  formula: string
  example: string
  pages: number[]
}

export interface RevisionGroup {
  id: string
  title: string
  items: RevisionItem[]
}

export interface Revision {
  chapter: string
  terms: RevisionTerm[]
  groups: RevisionGroup[]
  mistakes: { id: string; text: string }[]
}

export interface RevisionKn {
  terms: Record<string, { term: string; meaning: string }>
  groups: Record<string, string>
  items: Record<string, { name: string; formula?: string; example: string }>
  mistakes: Record<string, string>
}

/** Every sheet with its Kannada; add a chapter here when its sheet is written. */
export const REVISIONS: { en: Revision; kn: RevisionKn }[] = [
  { en: squareCube, kn: squareCubeKn },
  { en: powerPlay, kn: powerPlayKn },
  { en: storyOfNumbers, kn: storyOfNumbersKn },
  { en: quadrilaterals, kn: quadrilateralsKn },
  { en: numberPlay8, kn: numberPlay8Kn },
  { en: distributeMultiply, kn: distributeMultiplyKn },
  { en: proportional1, kn: proportional1Kn },
  { en: fractionsDisguise, kn: fractionsDisguiseKn },
  { en: baudhayana, kn: baudhayanaKn },
  { en: proportional2, kn: proportional2Kn },
  { en: geometricThemes, kn: geometricThemesKn },
  { en: talesDots, kn: talesDotsKn },
  { en: algebraPlay, kn: algebraPlayKn },
  { en: area8, kn: area8Kn },
  { en: largeNumbers, kn: largeNumbersKn },
  { en: arithmeticExpressions, kn: arithmeticExpressionsKn },
  { en: peekBeyond, kn: peekBeyondKn },
  { en: letterNumbers, kn: letterNumbersKn },
  { en: parallelLines, kn: parallelLinesKn },
  { en: numberPlay7, kn: numberPlay7Kn },
  { en: threeLines, kn: threeLinesKn },
  { en: workingFractions, kn: workingFractionsKn },
  { en: geometricTwins, kn: geometricTwinsKn },
  { en: integers, kn: integersKn },
  { en: commonGround, kn: commonGroundKn },
  { en: anotherPeek, kn: anotherPeekKn },
  { en: connectingDots, kn: connectingDotsKn },
  { en: constructions, kn: constructionsKn },
  { en: findingUnknown, kn: findingUnknownKn },
  { en: everEvolvingScience7, kn: everEvolvingScience7Kn },
  { en: acidsBasesNeutral7, kn: acidsBasesNeutral7Kn },
  { en: electricityCircuits7, kn: electricityCircuits7Kn },
  { en: metalsNonMetals7, kn: metalsNonMetals7Kn },
  { en: changesPhysicalChemical7, kn: changesPhysicalChemical7Kn },
  { en: adolescenceGrowth7, kn: adolescenceGrowth7Kn },
  { en: heatTransferWaterCycle7, kn: heatTransferWaterCycle7Kn },
  { en: timeAndMotion7, kn: timeAndMotion7Kn },
  { en: lifeProcessesAnimals7, kn: lifeProcessesAnimals7Kn },
  { en: lifeProcessesPlants7, kn: lifeProcessesPlants7Kn },
  { en: lightShadowsReflections7, kn: lightShadowsReflections7Kn },
  { en: earthMoonSun7, kn: earthMoonSun7Kn },
  { en: investigativeWorld8, kn: investigativeWorld8Kn },
  { en: invisibleLivingWorld8, kn: invisibleLivingWorld8Kn },
  { en: healthDiseases8, kn: healthDiseases8Kn },
  { en: electricityEffects8, kn: electricityEffects8Kn },
  { en: exploringForces8, kn: exploringForces8Kn },
  { en: pressureWindsCyclones8, kn: pressureWindsCyclones8Kn },
  { en: particulateMatter8, kn: particulateMatter8Kn },
  { en: elementsCompoundsMixtures8, kn: elementsCompoundsMixtures8Kn },
  { en: solutesSolventsDensity8, kn: solutesSolventsDensity8Kn },
  { en: lightMirrorsLenses8, kn: lightMirrorsLenses8Kn },
  { en: keepingTimeSkies8, kn: keepingTimeSkies8Kn },
  { en: natureInHarmony8, kn: natureInHarmony8Kn },
  { en: earthLifeSustainingPlanet8, kn: earthLifeSustainingPlanet8Kn },
  { en: ss7_majorDevelopmentsWorld, kn: ss7_majorDevelopmentsWorldKn },
  { en: ss7_medievalEurope, kn: ss7_medievalEuropeKn },
  { en: ss7_adventOfEuropeans, kn: ss7_adventOfEuropeansKn },
  { en: ss7_india18thCentury, kn: ss7_india18thCenturyKn },
  { en: ss7_growthBritishSupremacy, kn: ss7_growthBritishSupremacyKn },
  { en: ss7_impactBritishRule, kn: ss7_impactBritishRuleKn },
  { en: ss7_mysorePrincelyStates, kn: ss7_mysorePrincelyStatesKn },
  { en: ss7_bhakthiCultSufiHeritage, kn: ss7_bhakthiCultSufiHeritageKn },
  { en: ss7_legislativeExecutiveJudicialTerms, kn: ss7_legislativeExecutiveJudicialTermsKn },
  { en: ss7_unionGovernment, kn: ss7_unionGovernmentKn },
  { en: ss7_stateGovernment, kn: ss7_stateGovernmentKn },
  { en: ss7_physicalDivisionsIndia, kn: ss7_physicalDivisionsIndiaKn },
  { en: ss7_northAmerica, kn: ss7_northAmericaKn },
  { en: ss7_southAmerica, kn: ss7_southAmericaKn },
  { en: ss7_socialReligiousReforms, kn: ss7_socialReligiousReformsKn },
  { en: ss7_firstWarIndianIndependence, kn: ss7_firstWarIndianIndependenceKn },
  { en: ss7_freedomMovement, kn: ss7_freedomMovementKn },
  { en: ss7_unificationOfKarnataka, kn: ss7_unificationOfKarnatakaKn },
  { en: ss7_proSocialMovementsKarnataka, kn: ss7_proSocialMovementsKarnatakaKn },
  { en: ss7_karnatakaEconomicSocialTransformation, kn: ss7_karnatakaEconomicSocialTransformationKn },
  { en: ss7_progressDifferentFields, kn: ss7_progressDifferentFieldsKn },
  { en: ss7_judiciary, kn: ss7_judiciaryKn },
  { en: ss7_defenceForces, kn: ss7_defenceForcesKn },
  { en: ss7_indiaNeighbouringCountries, kn: ss7_indiaNeighbouringCountriesKn },
  { en: ss7_unitedNationsOrganization, kn: ss7_unitedNationsOrganizationKn },
  { en: ss7_australia, kn: ss7_australiaKn },
  { en: ss7_antarctica, kn: ss7_antarcticaKn },
  { en: ss8_sources, kn: ss8_sourcesKn },
  { en: ss8_bharathavarshaPrehistoric, kn: ss8_bharathavarshaPrehistoricKn },
  { en: ss8_sindhuSaraswatiVedic, kn: ss8_sindhuSaraswatiVedicKn },
  { en: ss8_prominentWorldCivilizations, kn: ss8_prominentWorldCivilizationsKn },
  { en: ss8_sanatanaDharma, kn: ss8_sanatanaDharmaKn },
  { en: ss8_jainismBuddhism, kn: ss8_jainismBuddhismKn },
  { en: ss8_meaningImportancePoliticalScience, kn: ss8_meaningImportancePoliticalScienceKn },
  { en: ss8_citizenCitizenship, kn: ss8_citizenCitizenshipKn },
  { en: ss8_manAndSociety, kn: ss8_manAndSocietyKn },
  { en: ss8_manAndCulture, kn: ss8_manAndCultureKn },
  { en: ss8_earthOurLivingPlanet, kn: ss8_earthOurLivingPlanetKn },
  { en: ss8_lithosphere, kn: ss8_lithosphereKn },
  { en: ss8_atmosphere, kn: ss8_atmosphereKn },
  { en: ss8_meaningImportanceEconomics, kn: ss8_meaningImportanceEconomicsKn },
  { en: ss8_meaningImportanceBusinessStudies, kn: ss8_meaningImportanceBusinessStudiesKn },
  { en: ss8_mauryasKushans, kn: ss8_mauryasKushansKn },
  { en: ss8_guptasVardhanas, kn: ss8_guptasVardhanasKn },
  { en: ss8_shathavahanasKadambasGangas, kn: ss8_shathavahanasKadambasGangasKn },
  { en: ss8_chalukyasBadamiPallavasKanchi, kn: ss8_chalukyasBadamiPallavasKanchiKn },
  { en: ss8_rashtrakutasChalukyasKalyana, kn: ss8_rashtrakutasChalukyasKalyanaKn },
  { en: ss8_cholasHoysalasDwarasamudra, kn: ss8_cholasHoysalasDwarasamudraKn },
  { en: ss8_democracy, kn: ss8_democracyKn },
  { en: ss8_localSelfGovernment, kn: ss8_localSelfGovernmentKn },
  { en: ss8_sociologyDailyLife, kn: ss8_sociologyDailyLifeKn },
  { en: ss8_kindsOfSocieties, kn: ss8_kindsOfSocietiesKn },
  { en: ss8_hydrosphere, kn: ss8_hydrosphereKn },
  { en: ss8_biosphere, kn: ss8_biosphereKn },
  { en: ss8_basicConceptsEconomics, kn: ss8_basicConceptsEconomicsKn },
  { en: ss8_emergenceBusinessOrganisations, kn: ss8_emergenceBusinessOrganisationsKn },
  { en: ss8_largeScaleBusinessOrganisations, kn: ss8_largeScaleBusinessOrganisationsKn },
]

/** A sheet in the given language; Kannada that is missing falls back to English. */
export function revisionText(r: { en: Revision; kn: RevisionKn }, lang: string): Revision {
  if (lang !== 'kn') return r.en
  const { en, kn } = r
  return {
    chapter: en.chapter,
    terms: en.terms.map((t) => ({ ...t, ...kn.terms[t.id] })),
    groups: en.groups.map((g) => ({
      ...g,
      title: kn.groups[g.id] ?? g.title,
      items: g.items.map((x) => ({ ...x, ...kn.items[x.id] })),
    })),
    mistakes: en.mistakes.map((m) => ({ id: m.id, text: kn.mistakes[m.id] ?? m.text })),
  }
}

/** The sheets for a topic's chapters, in textbook order; empty if none is written yet. */
export function topicRevisions(t: SatTopic): { chapter: SatChapter; sheet: { en: Revision; kn: RevisionKn } }[] {
  return t.chapters.flatMap((chapter) => {
    const sheet = REVISIONS.find((r) => r.en.chapter === chapter.id)
    return sheet ? [{ chapter, sheet }] : []
  })
}
