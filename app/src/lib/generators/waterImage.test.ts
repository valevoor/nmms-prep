import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DrawingView } from '../../components/Drawing'
import type { Drawing, FigItem } from '../../types'
import { OPTION_KEYS } from '../../types'
import { generateWaterImage } from './waterImage'
import { mulberry32 } from './numberSeries'

// Independent of waterImage.ts and figures.ts: a drawing is compared by where its ink goes (the
// corner points of every shape after it is flipped, turned and moved), and the water acts on those
// points directly (y → 100 − y). A letter is compared by its place and by where its own "up" and
// "right" point after the drawing's turn and flip; a letter that looks the same upside down ignores
// which way its "up" points, and one that looks the same backwards ignores its "right".
type Pt = [number, number]
const SAME_UPSIDE_DOWN = new Set(['B', 'C', 'D', 'E', 'H', 'I', 'K', 'O', 'X', '0', '3', '8'])
const SAME_BACKWARDS = new Set(['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y', '0', '8'])

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

/** Every inked point of the drawing, seen in water below it when `inWater` is set. */
function ink(d: Drawing, inWater = false): string {
  const Y = (y: number) => (inWater ? 100 - y : y)
  const items = d.items.map((it) => {
    const a = ((it.rot ?? 0) * Math.PI) / 180
    // A local point of the item after its flip, turn and move (and the water).
    const place = ([x, y]: Pt): Pt => {
      const fx = it.flip ? -x : x
      return [it.x + fx * Math.cos(a) - y * Math.sin(a), Y(it.y + fx * Math.sin(a) + y * Math.cos(a))]
    }
    if (it.shape === 'text') {
      const c = place([0, 0])
      const dir = ([x, y]: Pt) => {
        const p = place([x, y])
        return `${near(p[0] - c[0])},${near(p[1] - c[1])}`
      }
      const up = SAME_UPSIDE_DOWN.has(it.label!) ? [dir([0, -1]), dir([0, 1])].sort().join('/') : dir([0, -1])
      const right = SAME_BACKWARDS.has(it.label!) ? [dir([1, 0]), dir([-1, 0])].sort().join('/') : dir([1, 0])
      return `text ${it.label}@${near(c[0])},${near(c[1])} up ${up} right ${right}`
    }
    const pts = outline(it).map((p) => place(p).map(near).join(','))
    const filled = it.shape === 'dot' || it.shape === 'dots' || it.fill === 'solid'
    return `${it.shape === 'dot' ? 'circle' : it.shape}${filled ? '#' : ''}[${pts.sort().join(' ')}]`
  })
  return [d.frame ?? '-', ...items.sort()].join(' | ')
}

describe('generateWaterImage', () => {
  it('exactly one option is the water image, and it looks different from the figure', () => {
    const rng = mulberry32(9)
    const kinds = new Set<string>()
    for (let n = 0; n < 3000; n++) {
      const q = generateWaterImage(rng)
      kinds.add(q.id.split('-')[2])
      expect(q.figures!.terms).toHaveLength(1)
      const [fig] = q.figures!.terms as Drawing[]
      const opts = OPTION_KEYS.map((k) => ink(q.figures!.options![k] as Drawing))
      expect(new Set(opts).size, 'four different-looking options').toBe(4)
      const inWater = ink(fig, true)
      expect(inWater, 'the water image looks different from the figure').not.toBe(ink(fig))
      expect(OPTION_KEYS.filter((_, j) => opts[j] === inWater)).toEqual([q.answer])
      expect(q.kn!.rule).toMatch(/[ಀ-೿]/)
      expect(q.kn!.working).toMatch(/[ಀ-೿]/)
      if (n % 50 === 0) expect(renderToStaticMarkup(createElement(DrawingView, { d: fig, label: 'x' }))).toContain('<svg')
    }
    expect([...kinds].sort()).toEqual(['figure', 'word'])
  })
})
