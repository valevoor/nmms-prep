import type { VisualProps } from './index'

// A 3 × 3 × 3 cube with a different colour on its top, front and right faces. Each tap lights up the
// small cubes with only one colour (the middle of each face), then only two colours (the middle of
// the edge where two faces meet), then all three colours (the corner where the three faces meet).
const N = 3
const S = 36 // side of a small square on the front face
const D: [number, number] = [16, -14] // one step back, for the top and right faces
const X0 = 78
const Y0 = 62

type Pt = [number, number]
/** x: column from the left, z: row from the top, y: steps back. */
const at = (x: number, z: number, y: number): Pt => [X0 + x * S + y * D[0], Y0 + z * S + y * D[1]]
const poly = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ')
const end = (i: number) => (i === 0 || i === N - 1 ? 1 : 0)

/** Every visible small square, its face, and the small cube it belongs to (column, row back, row down). */
const CELLS: { pts: string; face: 'top' | 'front' | 'right'; cube: [number, number, number] }[] = []
for (let i = 0; i < N; i++)
  for (let j = 0; j < N; j++) {
    CELLS.push({ pts: poly([at(i, j, 0), at(i + 1, j, 0), at(i + 1, j + 1, 0), at(i, j + 1, 0)]), face: 'front', cube: [i, 0, j] })
    CELLS.push({ pts: poly([at(i, 0, j), at(i + 1, 0, j), at(i + 1, 0, j + 1), at(i, 0, j + 1)]), face: 'top', cube: [i, j, 0] })
    CELLS.push({ pts: poly([at(N, i, j), at(N, i, j + 1), at(N, i + 1, j + 1), at(N, i + 1, j)]), face: 'right', cube: [N - 1, j, i] })
  }

/** Which small cubes each step lights up. */
const LIT: ((c: [number, number, number]) => boolean)[] = [
  () => false,
  ([x, y, z]) => end(x) + end(y) + end(z) === 1,
  ([x, y, z]) => y === 0 && z === 0 && !end(x),
  ([x, y, z]) => x === N - 1 && y === 0 && z === 0,
]
const SUMS = ['', '(3 − 2)² = 1', '3 − 2 = 1', '1']

/** Chapter 13 tip: which small cubes carry one, two or three of the colours. */
export function CubeColours({ step, label }: VisualProps) {
  const lit = LIT[Math.min(step, LIT.length - 1)]
  return (
    <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
      <g strokeLinejoin="round">
        {[...CELLS.filter((c) => !lit(c.cube)), ...CELLS.filter((c) => lit(c.cube))].map((c) => (
          <polygon key={c.pts} points={c.pts} className={lit(c.cube) ? 'tv-cube-lit' : `tv-paint-${c.face}`} />
        ))}
      </g>
      {step > 0 && (
        <text x={150} y={204} textAnchor="middle" className="tv-label">
          {SUMS[Math.min(step, SUMS.length - 1)]}
        </text>
      )}
    </svg>
  )
}
