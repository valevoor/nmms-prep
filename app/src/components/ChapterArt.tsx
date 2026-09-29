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
  // Hidden Figures: a bent line found inside a tangle of lines
  3: (
    <>
      <rect x={5} y={5} width={38} height={38} rx={2} />
      <path d="M5 43L43 5M24 5v38M5 24h38" />
      <path d="M14 14h14l-9 9 9 9" className="art-accent" style={{ fill: 'none' }} strokeWidth={3.5} />
    </>
  ),
  // Similar Figures in Different Position: a flag and the same flag turned a quarter turn
  4: (
    <>
      <path d="M8 40V8l14 6-14 6" />
      <rect x={24} y={20} width={20} height={20} rx={3.5} className="art-tile-accent" />
      <path d="M26 24h16l-6 8-6-8" className="art-accent" style={{ fill: 'none' }} />
    </>
  ),
  // Figure Series: a shape gains a side each time
  2: (
    <>
      <path d="M3 17l5-9 5 9z" />
      <rect x={17} y={8} width={9} height={9} rx={1} />
      <path d="M35 7l5 3.6-1.9 5.9h-6.2L30 10.6z" />
      <rect x={14} y={27} width={20} height={16} rx={3.5} className="art-tile-accent" />
      <text x={24} y={39.5} textAnchor="middle" className="art-text art-fill-accent">
        ?
      </text>
    </>
  ),
  // Analogy of Figures: a triangle turns over, so the square turns over too
  1: (
    <>
      <path d="M4 18l7-12 7 12z" />
      <path d="M21 9v1m0 3v1" />
      <path d="M26 6l7 12 7-12z" />
      <rect x={4} y={28} width={13} height={13} rx={1.5} transform="rotate(20 10.5 34.5)" />
      <path d="M21 31v1m0 3v1M24 31v1m0 3v1" />
      <rect x={28} y={28} width={14} height={14} rx={3.5} className="art-tile-accent" />
    </>
  ),
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
  // Arithmetical Operations: 3 ? 4 = 12 (the missing sign is ×)
  25: (
    <>
      <Tile x={1} y={5} label="3" />
      <Tile x={17} y={5} label="?" accent />
      <Tile x={33} y={5} label="4" />
      <text x={24} y={40} textAnchor="middle" className="art-text">
        = 12
      </text>
    </>
  ),
  // Signs and Symbols: 2 ? 9, choosing between =, < and > (the answer is <)
  26: (
    <>
      <Tile x={1} y={4} label="2" />
      <Tile x={17} y={4} label="?" />
      <Tile x={33} y={4} label="9" />
      <Tile x={1} y={27} label="=" />
      <Tile x={17} y={27} label="<" accent />
      <Tile x={33} y={27} label=">" />
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
