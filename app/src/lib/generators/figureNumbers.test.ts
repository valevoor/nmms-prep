import { describe, expect, it } from 'vitest'
import type { Drawing } from '../../types'
import { mulberry32 } from './numberSeries'
import { buildFigureNumbers } from './figureNumbers'

// Independent of figureNumbers.ts's rules: the numbers are read back from the drawing (grouped into
// its three figures, the blank's place giving the number to explain), and a broad family of
// formulas is tried by brute force: the other numbers in any order, each as it is, squared, doubled
// or tripled, joined by + − × ÷, then optionally a constant 1–9 added, taken away, multiplied or
// divided, or the whole squared. Every formula that fits both complete figures must give the
// marked answer in the third, and none may give a wrong option.

type F = (v: number[]) => number
const OPS: ((x: number, y: number) => number)[] = [(x, y) => x + y, (x, y) => x - y, (x, y) => x * y, (x, y) => x / y]
const UN: ((x: number) => number)[] = [(x) => x, (x) => x * x, (x) => 2 * x, (x) => 3 * x]
const perms = (n: number): number[][] => (n === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]])

function formulas(n: number): F[] {
  const out: F[] = []
  const finals: ((x: number) => number)[] = [(x) => x, (x) => x * x]
  if (n === 2) for (let k = 1; k <= 9; k++) finals.push((x) => x + k, (x) => x - k, (x) => x * k, (x) => x / k)
  for (const p of perms(n))
    for (const u0 of UN)
      for (const u1 of UN)
        for (const o1 of OPS) {
          if (n === 2) for (const fin of finals) out.push((v) => fin(o1(u0(v[p[0]]), u1(v[p[1]]))))
          else
            for (const u2 of UN)
              for (const o2 of OPS)
                for (const fin of finals) {
                  out.push((v) => fin(o2(o1(u0(v[p[0]]), u1(v[p[1]])), u2(v[p[2]]))))
                  out.push((v) => fin(o1(u0(v[p[0]]), o2(u1(v[p[1]]), u2(v[p[2]])))))
                }
        }
  return out
}
const FORMULAS: Record<number, F[]> = { 2: formulas(2), 3: formulas(3) }
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9
const KANNADA = /[ಀ-೿]/

/** The drawing's numbers, figure by figure, each in reading order (top to bottom, left to right). */
function read(d: Drawing): string[][] {
  const figs: { x: number; y: number; label: string }[][] = [[], [], []]
  for (const it of d.items) if (it.shape === 'text') figs[Math.floor(it.x / 100)].push({ x: it.x, y: it.y, label: it.label ?? '' })
  return figs.map((f) => f.sort((a, b) => a.y - b.y || a.x - b.x).map((t) => t.label))
}

describe('generateFigureNumbers', () => {
  it('every formula that fits the complete figures gives the answer, and only the answer', () => {
    const rng = mulberry32(24)
    for (let i = 0; i < 1000; i++) {
      const q = buildFigureNumbers(rng)
      const d = q.figures?.terms[0] as Drawing
      expect(d.w).toBe(300)
      const figs = read(d)
      expect(figs.map((f) => f.length)).toEqual([figs[0].length, figs[0].length, figs[0].length])
      expect(figs[0].concat(figs[1]).includes('?')).toBe(false)
      const at = figs[2].indexOf('?')
      expect(at).toBeGreaterThanOrEqual(0)
      const split = (f: string[]) => ({ ins: f.filter((_, j) => j !== at).map(Number), out: Number(f[at]) })
      const [f0, f1] = [split(figs[0]), split(figs[1])]
      const ins2 = figs[2].filter((_, j) => j !== at).map(Number)
      const results = new Set<number>()
      for (const f of FORMULAS[ins2.length]) if (same(f(f0.ins), f0.out) && same(f(f1.ins), f1.out)) results.add(Math.round(f(ins2) * 1e6) / 1e6)
      const answer = Number(q.options[q.answer])
      expect(results.has(answer), `${q.rule} ${q.working}`).toBe(true)
      for (const [k, v] of Object.entries(q.options)) if (k !== q.answer) expect(results.has(Number(v)), `${q.working}: option ${k} = ${v} also fits`).toBe(false)
      expect(new Set(Object.values(q.options)).size).toBe(4)
      expect(q.kn?.prompt).toMatch(KANNADA)
      expect(q.kn?.rule).toMatch(KANNADA)
      expect(q.kn?.working).toBeTruthy()
    }
  }, 60000)
})
