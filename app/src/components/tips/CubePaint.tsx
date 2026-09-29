import type { VisualProps } from './index'

// A 4 × 4 × 4 cube painted on every face, drawn with its front, top and right faces. Each tap lights
// up the small cubes with 3, then 2, then 1 painted faces, and last shows the count hidden inside.
const N = 4
const S = 30 // side of a small square on the front face
const D: [number, number] = [14, -12] // one step back, for the top and right faces
const X0 = 70
const Y0 = 58

type Pt = [number, number]
const at = (x: number, z: number, y: number): Pt => [X0 + x * S + y * D[0], Y0 + z * S + y * D[1]]
const poly = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ')
const edge = (i: number) => (i === 0 || i === N - 1 ? 1 : 0)

/** Every visible small square: its corners and how many painted faces its small cube has. */
const CELLS: { pts: string; paint: number }[] = []
for (let i = 0; i < N; i++)
  for (let j = 0; j < N; j++) {
    // Front face: column i, row j from the top.
    CELLS.push({ pts: poly([at(i, j, 0), at(i + 1, j, 0), at(i + 1, j + 1, 0), at(i, j + 1, 0)]), paint: 1 + edge(i) + edge(j) })
    // Top face: column i, row j from the front.
    CELLS.push({ pts: poly([at(i, 0, j), at(i + 1, 0, j), at(i + 1, 0, j + 1), at(i, 0, j + 1)]), paint: 1 + edge(i) + edge(j) })
    // Right face: row j from the front, row i from the top.
    CELLS.push({ pts: poly([at(N, i, j), at(N, i, j + 1), at(N, i + 1, j + 1), at(N, i + 1, j)]), paint: 1 + edge(i) + edge(j) })
  }

const SUMS = ['', '8', '12 × (4 − 2) = 24', '6 × (4 − 2)² = 24', '(4 − 2)³ = 8']

/** Chapter 10 tip: where the paint lands on a painted cube cut into 4 × 4 × 4 small cubes. */
export function CubePaint({ step, label }: VisualProps) {
  const lit = step >= 1 && step <= 3 ? 4 - step : -1
  return (
    <svg className="tv" viewBox="0 0 300 212" role="img" aria-label={label}>
      <g strokeLinejoin="round">
        {/* The lit squares go last, so their outlines sit on top. */}
        {[...CELLS.filter((c) => c.paint !== lit), ...CELLS.filter((c) => c.paint === lit)].map((c) => (
          <polygon key={c.pts} points={c.pts} className={c.paint === lit ? 'tv-cube-lit' : 'tv-cube'} />
        ))}
      </g>
      {step === 4 && <rect x={at(1, 1, 0)[0]} y={at(1, 1, 0)[1]} width={2 * S} height={2 * S} className="tv-cube-inside" />}
      {step > 0 && (
        <text x={150} y={204} textAnchor="middle" className="tv-label">
          {SUMS[step]}
        </text>
      )}
    </svg>
  )
}
