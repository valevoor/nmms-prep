/**
 * Converts Kannada typed in the legacy Nudi font (as the Karnataka question papers' PDFs store it,
 * e.g. "ªÀÄvÀÄÛ") to Unicode ("ಮತ್ತು"). Nudi stores glyphs in visual order: a consonant's base shape,
 * then its vowel sign, then any conjunct (ottu) under it, with the ra-head (arkavattu, "ð") last;
 * Unicode wants consonant, virama + conjunct, vowel sign, and the ra first. Always check the output
 * against the rendered page: it is a starting point, not a source of truth.
 *
 * Use:  npx tsx ../tools/nudi.ts < marked.txt   (text from tools/extract_nudi.swift; only the runs
 * inside ⟦ ⟧ are in the Nudi font and get converted, everything else is copied as it is)
 */

const VIRAMA = '್'
const ZWNJ = '\u200c'

/** Base consonant shapes (the vowel sign that follows decides the syllable). */
const BASES: Record<string, string> = {
  P: 'ಕ', S: 'ಖ', U: 'ಗ', W: 'ಘ', Z: 'ಚ', b: 'ಛ', e: 'ಜ', m: 'ಟ', o: 'ಠ', q: 'ಡ', qs: 'ಢ', u: 'ಣ',
  v: 'ತ', x: 'ಥ', z: 'ದ', zs: 'ಧ', '£': 'ನ', '¥': 'ಪ', '¥s': 'ಫ', '¨': 'ಬ', '¨s': 'ಭ', g: 'ರ',
  '¯': 'ಲ', 'ª': 'ವ', '±': 'ಶ', 'µ': 'ಷ', 'μ': 'ಷ', '¸': 'ಸ', 'º': 'ಹ', '¼': 'ಳ',
}

/** Shapes that are a whole syllable by themselves. */
const SYLLABLES: Record<string, string> = {
  // Vowels and signs that stand alone.
  C: 'ಅ', D: 'ಆ', E: 'ಇ', F: 'ಈ', G: 'ಉ', H: 'ಊ', 'IÄ': 'ಋ', J: 'ಎ', K: 'ಏ', L: 'ಐ', M: 'ಒ', N: 'ಓ', O: 'ಔ',
  A: 'ಂ', B: 'ಃ',
  // Consonants with their own "a" shape.
  R: 'ಖ', d: 'ಜ', l: 'ಟ', t: 'ಣ', '§': 'ಬ', '®': 'ಲ', Y: 'ಙ', k: 'ಞ',
  // Consonants with their own "i" shape.
  Q: 'ಕಿ', T: 'ಖಿ', V: 'ಗಿ', X: 'ಘಿ', a: 'ಚಿ', c: 'ಛಿ', f: 'ಜಿ', n: 'ಟಿ', p: 'ಠಿ', r: 'ಡಿ', 'rü': 'ಢಿ',
  w: 'ತಿ', y: 'ಥಿ', '¢': 'ದಿ', '¢ü': 'ಧಿ', '¤': 'ನಿ', '¦': 'ಪಿ', '¦ü': 'ಫಿ', '©': 'ಬಿ', '©ü': 'ಭಿ',
  j: 'ರಿ', '°': 'ಲಿ', '«': 'ವಿ', '²': 'ಶಿ', '¶': 'ಷಿ', '¹': 'ಸಿ', '»': 'ಹಿ', '½': 'ಳಿ',
  // ma and ya are drawn as va / anusvara plus hooks.
  'ªÀÄ': 'ಮ', 'ªÀiÁ': 'ಮಾ', 'ªÀiï': 'ಮ್', 'ªÀiË': 'ಮೌ', '«Ä': 'ಮಿ', 'ªÉÄ': 'ಮೆ', 'ªÉÆ': 'ಮೊ',
  'AiÀÄ': 'ಯ', 'AiÀiÁ': 'ಯಾ', 'AiÀiï': 'ಯ್', 'AiÀiË': 'ಯೌ', '¬Ä': 'ಯಿ', 'AiÉÄ': 'ಯೆ', 'AiÉÆ': 'ಯೊ',
  'gÀhÄ': 'ಝ', 'gÀhiÁ': 'ಝಾ', 'gÀhiï': 'ಝ್', 'jhÄ': 'ಝಿ', 'gÉhÄ': 'ಝೆ',
}

/** Vowel signs, written after the consonant in both scripts. */
const SIGNS: Record<string, string> = {
  'À': '', 'Á': 'ಾ', 'Â': 'ಿ', 'Ä': 'ು', 'Å': 'ು', 'Æ': 'ೂ', 'Ç': 'ೂ', 'È': 'ೃ', 'ø': 'ೃ', 'É': 'ೆ', 'Ë': 'ೌ', 'ï': VIRAMA,
}

/** Conjuncts, drawn under the consonant after its vowel sign. */
const OTTUS: Record<string, string> = {
  'Ì': 'ಕ', 'Í': 'ಖ', 'Î': 'ಗ', 'Ï': 'ಘ', 'Ñ': 'ಚ', 'Ò': 'ಛ', 'Ó': 'ಜ', 'Ô': 'ಝ', 'Õ': 'ಞ', 'Ö': 'ಟ',
  '×': 'ಠ', 'Ø': 'ಡ', 'Ù': 'ಢ', 'Ú': 'ಣ', 'Û': 'ತ', 'Ü': 'ಥ', 'Ý': 'ದ', 'Þ': 'ಧ', 'ß': 'ನ', 'à': 'ಪ',
  'á': 'ಫ', 'â': 'ಬ', 'ã': 'ಭ', 'ä': 'ಮ', 'å': 'ಯ', 'æ': 'ರ', 'ç': 'ರ', 'è': 'ಲ', 'é': 'ವ', 'ê': 'ಶ',
  'ë': 'ಷ', 'ì': 'ಸ', 'í': 'ಹ', 'î': 'ಳ',
}

const KEYS = [...Object.keys(SYLLABLES), ...Object.keys(BASES), ...Object.keys(SIGNS), ...Object.keys(OTTUS)].sort((a, b) => b.length - a.length)

/** Dependent vowel signs (not the virama) and the anusvara/visarga, which Unicode puts after a conjunct. */
const isTrailing = (c: string) => (c >= 'ಾ' && c <= 'ೌ') || 'ಂಃÃÊ'.includes(c)

/** Converts one run of Nudi-font text. */
export function nudiToUnicode(s: string): string {
  // ö only spaces a conjunct out; ` is the rupee sign.
  s = s.replace(/ö/g, '').replace(/`/g, '₹')
  const out: string[] = []
  let i = 0
  while (i < s.length) {
    const key = KEYS.find((k) => s.startsWith(k, i))
    if (!key) {
      out.push(s[i++])
      continue
    }
    i += key.length
    // A conjunct always follows a Kannada letter; on its own it is a maths sign (× in "3 × 3").
    if (key in OTTUS && !/[ಀ-೿]/.test(out[out.length - 1] ?? '')) out.push(key)
    else if (key in OTTUS) {
      const tail: string[] = []
      while (out.length && isTrailing(out[out.length - 1])) tail.unshift(out.pop()!)
      // A conjunct under a dead consonant (ಟ್ + ಸ) is dead too: ಟ್ಸ್.
      const dead = out[out.length - 1] === VIRAMA
      if (dead) out.pop()
      out.push(VIRAMA, OTTUS[key], ...(dead ? [VIRAMA] : []), ...tail)
    } else if (key in SIGNS) {
      const last = out[out.length - 1]
      // Long marks: Æ/Ç after e makes o.
      if ((key === 'Æ' || key === 'Ç') && last === 'ೆ') out[out.length - 1] = 'ೊ'
      else if (SIGNS[key]) out.push(SIGNS[key])
    } else {
      const text = BASES[key] ?? SYLLABLES[key]
      // A virama typed before a full letter (not a conjunct) stays visible, as in ಬಾಲ್‌ಬೇರಿಂಗ್.
      if (out[out.length - 1] === VIRAMA && text[0] >= 'ಕ' && text[0] <= 'ೞ') out.push(ZWNJ)
      out.push(...text)
    }
  }
  let text = out.join('').replace(/ð([ÃÊ]+)/g, '$1ð')
  // Ã lengthens i, e and o; Ê after e makes ai.
  text = text.replace(/ಿÃ/g, 'ೀ').replace(/ೆÃ/g, 'ೇ').replace(/ೊÃ/g, 'ೋ').replace(/ೆÊ/g, 'ೈ').replace(/Ê/g, 'ೈ')
  // ð (arkavattu) is a ರ್ before the syllable it is drawn on.
  text = text.replace(/((?:[ಕ-ೞ]್)*[ಕ-ೞ][ಾ-್]*[ಂಃ]?)ð/g, 'ರ್$1')
  return text
}

/** Converts the ⟦ ⟧ runs of marked text and drops the markers. */
export function convertMarked(s: string): string {
  // Neighbouring runs (a change of size or style) are one stretch of Nudi text.
  return s.replace(/⟧⟦/g, '').replace(/⟦([\s\S]*?)⟧/g, (_, run: string) => nudiToUnicode(run))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const chunks: Buffer[] = []
  process.stdin.on('data', (c) => chunks.push(c))
  process.stdin.on('end', () => process.stdout.write(convertMarked(Buffer.concat(chunks).toString('utf8'))))
}
