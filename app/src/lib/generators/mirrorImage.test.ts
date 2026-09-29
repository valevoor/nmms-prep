import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing, FigItem } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateMirrorImage } from './mirrorImage'
import { mulberry32 } from './numberSeries'

// Independent of mirrorImage.ts and figures.ts: a drawing is compared by where its ink goes (the
// corner points of every shape after it is flipped, turned and moved), and the mirror acts on
// those points directly (x → 100 − x). A letter is compared by its place and whether it reads
// backwards; letters that look the same backwards are listed here separately.
type Pt = [number, number]
const LOOKS_SAME_BACKWARDS = new Set(['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y', '0', '8'])

function outline(it: FigItem): Pt[] {
  const r = it.size / 2
  switch (it.shape) {
    case 'poly':
      return Array.from({ length: it.n ?? 3 }, (_, i) => [r * Math.sin((2 * Math.PI * i) / (it.n ?? 3)), -r * Math.cos((2 * Math.PI * i) / (it.n ?? 3))] as Pt)
    case 'circle':
    case 'dot':
      return [[0, 0], [r, 0], [0, r], [-r, 0], [0, -r]]
    case 'dots':
      return Array.from({ length: it.n ?? 1 }, (_, i) => [(i - ((it.n ?? 1) - 1) / 2) * r * 0.9, 0] as Pt)
    case 'arrow':
      return [[0, r], [0, -r], [-r * 0.4, -r * 0.55], [r * 0.4, -r * 0.55]]
    case 'flag':
      return [[-r * 0.4, r], [-r * 0.4, -r], [r * 0.7, -r * 0.55], [-r * 0.4, -r * 0.1]]
    case 'ell':
      return [[-r * 0.5, -r], [-r * 0.5, r], [r * 0.6, r]]
    case 'plus':
      return [[-r, 0], [r, 0], [0, -r], [0, r]]
    default:
      throw new Error(`unexpected shape ${it.shape}`)
  }
}
const near = (v: number) => (Math.round(v * 10 + 1e-6) / 10 + 0).toFixed(1)

/** Every inked point of the drawing, seen in a mirror on its right when `inMirror` is set. */
function ink(d: Drawing, inMirror = false): string {
  const X = (x: number) => (inMirror ? 100 - x : x)
  const items = d.items.map((it) => {
    if (it.shape === 'text') {
      const backwards = !!it.flip !== inMirror && !LOOKS_SAME_BACKWARDS.has(it.label!)
      return `text ${it.label}${backwards ? '~' : ''}@${near(X(it.x))},${near(it.y)}`
    }
    const a = ((it.rot ?? 0) * Math.PI) / 180
    const pts = outline(it).map(([x, y]) => {
      const fx = it.flip ? -x : x
      return `${near(X(it.x + fx * Math.cos(a) - y * Math.sin(a)))},${near(it.y + fx * Math.sin(a) + y * Math.cos(a))}`
    })
    const filled = it.shape === 'dot' || it.shape === 'dots' || it.fill === 'solid'
    return `${it.shape === 'dot' ? 'circle' : it.shape}${filled ? '#' : ''}[${pts.sort().join(' ')}]`
  })
  return [d.frame ?? '-', ...items.sort()].join(' | ')
}

describe('generateMirrorImage', () => {
  it('exactly one option is the mirror image, and it looks different from the figure', () => {
    const rng = mulberry32(8)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateMirrorImage(rng)
      kinds.add(q.id.split('-')[2])
      expect(q.figures!.terms).toHaveLength(1)
      const [fig] = q.figures!.terms as Drawing[]
      const opts = OPTION_KEYS.map((k) => ink(q.figures!.options![k] as Drawing))
      expect(new Set(opts).size, 'four different-looking options').toBe(4)
      const inMirror = ink(fig, true)
      expect(inMirror, 'the mirror image looks different from the figure').not.toBe(ink(fig))
      expect(OPTION_KEYS.filter((_, j) => opts[j] === inMirror)).toEqual([q.answer])
      expect(q.kn!.rule).toMatch(/[ಀ-೿]/)
      expect(q.kn!.working).toMatch(/[ಀ-೿]/)
      if (n % 50 === 0) expect(renderToStaticMarkup(createElement(DrawingView, { d: fig, label: 'x' }))).toContain('<svg')
    }
    expect([...kinds].sort()).toEqual(['figure', 'word'])
  })
})
