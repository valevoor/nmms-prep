import { useEffect, useRef, useState } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { CutScene } from '../components/CutScene'
import type { CutHandle } from '../components/CutScene'
import { Page } from '../components/Page'
import { CUT_DIRS, CUT_SIZES, GAP_MAX } from '../lib/cubeCut'
import type { CutDir } from '../lib/cubeCut'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

const SPLIT_MS = 550
/** How far the pieces slide apart when Cut is pressed, in cells. */
const SPLIT_GAP = 1.1
const easeOut = (p: number) => 1 - (1 - p) ** 3

/** The knife's direction, drawn on a small square: the dashed line is the cut. */
const DIR_ICON: Record<CutDir, string> = {
  x: 'M17 1v32',
  y: 'M1 17h32',
  z: 'M8 25l14-14',
}

/** The page's sentences in one language, so EN+ಕ can show them in both. */
function words(t: Dict['cut'], n: number, dir: CutDir, k: number, cut: boolean, painted: boolean) {
  const [nameA, nameB] = t.pieces[dir]
  return {
    after: t.after[dir](k),
    lines: cut
      ? [t.piece(nameA, k, n), t.piece(nameB, n - k, n), t.total(k * n * n, (n - k) * n * n, n)]
      : [t.whole(n)],
    note: cut ? t.newFaces(n, painted) : t.before,
  }
}

/** Cubes cutting (Ch 10): cut a cube of small cubes along its lines and pull the two pieces apart in 3D. */
export function CubeCut() {
  const tr = useT()
  const t = tr.cut
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const scene = useRef<CutHandle>(null)
  const [n, setN] = useState(3)
  const [dir, setDir] = useState<CutDir>('x')
  const [k, setK] = useState(1)
  const [cut, setCut] = useState(false)
  const [gap, setGapState] = useState(0)
  const [painted, setPainted] = useState(true)
  const anim = useRef(0)
  const gapNow = useRef(0)
  const setGap = (v: number) => {
    gapNow.current = v
    setGapState(v)
  }

  useEffect(() => () => cancelAnimationFrame(anim.current), [])

  const slideTo = (target: number, done?: () => void) => {
    cancelAnimationFrame(anim.current)
    const from = gapNow.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGap(target)
      return done?.()
    }
    let t0 = -1
    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const p = Math.min(1, (now - t0) / SPLIT_MS)
      setGap(from + (target - from) * easeOut(p))
      if (p < 1) anim.current = requestAnimationFrame(tick)
      else done?.()
    }
    anim.current = requestAnimationFrame(tick)
  }

  const toggleCut = () => {
    if (!cut) {
      setGap(0)
      setCut(true)
      slideTo(SPLIT_GAP)
    } else slideTo(0, () => setCut(false))
  }

  const w = words(t, n, dir, k, cut, painted)
  const w2 = both ? words(DICTS[otherLang].cut, n, dir, k, cut, painted) : undefined

  return (
    <Page title={t.title} back="">
      <section className="card explore-card">
        <div className="fold-wrap">
          <CutScene ref={scene} n={n} dir={dir} k={k} cut={cut} gap={gap} painted={painted} label={t.scene} />
          <div className="explore-zoom">
            <button type="button" className="btn icon" onClick={() => scene.current?.turn(30)} aria-label={t.turnLeft} title={t.turnLeft}>
              ◀
            </button>
            <button type="button" className="btn icon" onClick={() => scene.current?.turn(-30)} aria-label={t.turnRight} title={t.turnRight}>
              ▶
            </button>
            <button type="button" className="btn icon" onClick={() => scene.current?.reset()} aria-label={t.reset} title={t.reset}>
              ⟲
            </button>
          </div>
        </div>
        <p className="explore-hint muted">{t.hint}</p>
        <div className="cut-controls">
          <button type="button" className={`btn ${cut ? '' : 'btn-primary '}cut-go`} onClick={toggleCut}>
            <span aria-hidden>✂️</span> {cut ? <BiLabel get={(d) => d.cut.join} /> : <BiLabel get={(d) => d.cut.cut} />}
          </button>
          {cut && (
            <label className="fold-slider">
              <span>
                <BiLabel get={(d) => d.cut.together} />
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((gap / GAP_MAX) * 100)}
                aria-label={t.slider}
                onChange={(e) => {
                  cancelAnimationFrame(anim.current)
                  setGap((Number(e.target.value) / 100) * GAP_MAX)
                }}
              />
              <span>
                <BiLabel get={(d) => d.cut.apart} />
              </span>
            </label>
          )}
        </div>
        <label className="explore-switch">
          <input type="checkbox" checked={painted} onChange={(e) => setPainted(e.target.checked)} />
          <span>
            <BiLabel get={(d) => d.cut.painted} />
          </span>
        </label>
        <div className="cut-counts" aria-live="polite">
          {w.lines.map((line, i) => (
            <div key={i} className={`cut-line${cut && i === 2 ? ' cut-total' : ''}`}>
              {cut && i < 2 && (
                <span className="cut-badge" aria-hidden>
                  {i === 0 ? 'A' : 'B'}
                </span>
              )}
              <BiBlock text={line} other={w2?.lines[i]} lang={lang} otherLang={otherLang} />
            </div>
          ))}
        </div>
        <div className="explore-info">
          <BiBlock text={w.note} other={w2?.note} lang={lang} otherLang={otherLang} />
        </div>
      </section>

      <section className="card explore-panel">
        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.cut.size} />
          </h2>
          <div className="explore-seg" role="group" aria-label={t.size}>
            {CUT_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={size === n}
                onClick={() => {
                  setN(size)
                  setK((v) => Math.min(v, size - 1))
                }}
              >
                {size}×{size}×{size}
              </button>
            ))}
          </div>
        </div>

        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.cut.way} />
          </h2>
          <div className="explore-seg cut-ways" role="group" aria-label={t.way}>
            {CUT_DIRS.map((d) => (
              <button key={d} type="button" aria-pressed={d === dir} onClick={() => setDir(d)}>
                <svg viewBox="0 0 34 34" width="32" height="32" aria-hidden>
                  {d === 'z' ? (
                    <path className="cut-icon-box" d="M4 12l8-8h18v18l-8 8H4zM4 12h18v18M22 12l8-8" />
                  ) : (
                    <rect className="cut-icon-box" x="5" y="5" width="24" height="24" rx="2" />
                  )}
                  <path className="cut-icon-knife" d={DIR_ICON[d]} />
                </svg>
                <BiLabel get={(x) => x.cut.ways[d]} />
              </button>
            ))}
          </div>
        </div>

        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.cut.where} />
          </h2>
          <div className="explore-seg" role="group" aria-label={t.where}>
            {Array.from({ length: n - 1 }, (_, i) => i + 1).map((at) => (
              <button key={at} type="button" aria-pressed={at === k} onClick={() => setK(at)}>
                {at}
              </button>
            ))}
          </div>
          <BiBlock text={w.after} other={w2?.after} lang={lang} otherLang={otherLang} className="explore-total" />
        </div>
      </section>

      <section className="card trick-card">
        <BiBlock text={t.rule} other={both ? DICTS[otherLang].cut.rule : undefined} lang={lang} otherLang={otherLang} />
      </section>
    </Page>
  )
}
