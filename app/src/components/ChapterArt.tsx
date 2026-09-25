import type { ReactNode } from 'react'

/** Text inside a small rounded tile, used by the series-style drawings. */
function Tile({ x, y, w = 14, label, accent }: { x: number; y: number; w?: number; label: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={18} rx={3.5} className={accent ? 'art-tile-accent' : undefined} />
      <text x={x + w / 2} y={y + 13.5} textAnchor="middle" className={accent ? 'art-text art-fill-accent' : 'art-text'}>
        {label}
      </text>
    </g>
  )
}

/** Drawings keyed by the study material's chapter number. */
const ART: Record<number, ReactNode> = {
  // Number Series
  17: (
    <>
      <Tile x={2} y={15} label="2" />
      <Tile x={17} y={15} label="4" />
      <Tile x={32} y={15} label="?" accent />
    </>
  ),
  // Number Analogy
  14: (
    <>
      <Tile x={4} y={3} label="3" />
      <path d="M21 12h6m-3-3l3 3-3 3" />
      <Tile x={30} y={3} label="9" />
      <Tile x={4} y={27} label="4" />
      <path d="M21 36h6m-3-3l3 3-3 3" />
      <Tile x={30} y={27} label="?" accent />
    </>
  ),
  // Odd One Out: Numbers
  18: (
    <>
      <Tile x={4} y={4} w={18} label="7" />
      <Tile x={26} y={4} w={18} label="11" />
      <Tile x={4} y={26} w={18} label="13" />
      <Tile x={26} y={26} w={18} label="9" accent />
    </>
  ),
  // Find the Wrong Number
  19: (
    <>
      <Tile x={2} y={15} label="2" />
      <Tile x={17} y={15} label="4" />
      <Tile x={32} y={15} label="7" accent />
      <path d="M31 13l16 22" className="art-hand" />
    </>
  ),
  // Letter Series
  21: (
    <>
      <Tile x={2} y={15} label="A" />
      <Tile x={17} y={15} label="C" />
      <Tile x={32} y={15} label="?" accent />
    </>
  ),
  // Coding–Decoding
  23: (
    <>
      <rect x={12} y={21} width={24} height={20} rx={3.5} />
      <path d="M17 21v-5a7 7 0 0 1 14 0v5" />
      <circle cx={24} cy={30} r={2.5} className="art-accent" />
      <path d="M24 32.5v4" />
    </>
  ),
  // Directions
  31: (
    <>
      <circle cx={24} cy={26} r={16} />
      <path d="M24 13l4 13h-8z" className="art-accent" />
      <path d="M24 39l-4-13h8z" />
      <text x={24} y={8} textAnchor="middle" className="art-text art-small">
        N
      </text>
    </>
  ),
  // Blood Relations
  32: (
    <>
      <circle cx={24} cy={9} r={5} className="art-accent" />
      <path d="M24 14v7M12 21h24M12 21v6M36 21v6" />
      <circle cx={12} cy={32} r={5} />
      <circle cx={36} cy={32} r={5} />
    </>
  ),
  // Calendar
  34: (
    <>
      <rect x={6} y={9} width={36} height={33} rx={4} />
      <path d="M6 18h36M15 5v8M33 5v8" />
      <rect x={27} y={30} width={8} height={7} rx={1.5} className="art-accent" />
      <path d="M13 25h2M21 25h2M29 25h2M13 33h2M21 33h2" />
    </>
  ),
  // Clock
  35: (
    <>
      <circle cx={24} cy={24} r={18} />
      <path d="M24 24V12" />
      <path d="M24 24l8 5" className="art-hand" />
      <circle cx={24} cy={24} r={2} className="art-accent" />
    </>
  ),
  // Mirror Image
  8: (
    <>
      <path d="M24 5v38" strokeDasharray="3 3" />
      <text x={13} y={32} textAnchor="middle" className="art-text art-big">
        R
      </text>
      <text x={35} y={32} textAnchor="middle" className="art-text art-big art-fill-accent" transform="translate(70 0) scale(-1 1)">
        R
      </text>
    </>
  ),
}

/** Shown for chapters without a drawing yet: a puzzle piece. */
const FALLBACK: ReactNode = (
  <path d="M10 14h8a4 4 0 1 1 8 0h8v8a4 4 0 1 1 0 8v8h-8a4 4 0 1 0-8 0h-8v-8a4 4 0 1 0 0-8z" />
)

export function ChapterArt({ chapter, size = 48 }: { chapter: number; size?: number }) {
  return (
    <svg className="chapter-art" width={size} height={size} viewBox="0 0 48 48" aria-hidden focusable="false">
      {ART[chapter] ?? FALLBACK}
    </svg>
  )
}
