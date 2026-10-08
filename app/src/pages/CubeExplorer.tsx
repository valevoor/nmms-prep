import { lazy, Suspense, useRef, useState } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { Page } from '../components/Page'
import type { SceneHandle } from '../components/CubeScene'
import { COLOUR_COUNTS, coloursOn, FACES, KINDS, kindCount, SCHEMES, SIZES } from '../lib/cubePaint'
import type { ColourCount, CubeFace, Kind, SmallCube } from '../lib/cubePaint'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

// three.js is big, so it loads only when this page opens (and is cached for offline like the rest).
const CubeScene = lazy(() => import('../components/CubeScene'))

type Show = Kind | 'all'
/** Hidden from the starting view, so their buttons are drawn dashed. */
const HIDDEN: CubeFace[] = ['back', 'left', 'bottom']
const LOOK_ORDER: CubeFace[] = ['front', 'right', 'top', 'back', 'left', 'bottom']

/** The page's sentences in one language, so EN+ಕ can show them in both. */
function words(t: Dict['explore'], n: number, colours: ColourCount, show: Show, picked: SmallCube | null) {
  const s = SCHEMES[colours]
  const paint = (f: CubeFace) => t.paints[s[f]]
  let info = t.tapHint
  if (picked)
    info =
      picked.kind === 'inside'
        ? t.inside
        : t.picked(
            t.one[picked.kind],
            picked.painted.map((f) => t.paintedFace(t.faces[f], paint(f))),
            coloursOn(picked, colours).length,
          )
  return { info, formula: t.formula[show](n, n - 2) }
}

/** Cubes colouring (Ch 13) in 3D: turn and zoom a painted cube, light up each kind of small cube and count it. */
export function CubeExplorer() {
  const tr = useT()
  const t = tr.explore
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const scene = useRef<SceneHandle>(null)
  const [n, setN] = useState(4)
  const [colours, setColours] = useState<ColourCount>(6)
  const [show, setShow] = useState<Show>('all')
  const [xray, setXray] = useState(false)
  const [picked, setPicked] = useState<SmallCube | null>(null)

  const w = words(t, n, colours, show, picked)
  const w2 = both ? words(DICTS[otherLang].explore, n, colours, show, picked) : undefined
  const s = SCHEMES[colours]
  const legend: [string, string][] =
    colours === 1
      ? [[t.allFaces, s.top]]
      : colours === 3
        ? [
            [t.pair(t.faces.top, t.faces.bottom), s.top],
            [t.pair(t.faces.front, t.faces.back), s.front],
            [t.pair(t.faces.left, t.faces.right), s.left],
          ]
        : FACES.map((f) => [t.faces[f], s[f]])

  return (
    <Page title={t.title} back="">
      <section className="card explore-card">
        <div className="explore-stage">
          <Suspense fallback={<p className="cube-scene-msg muted">{t.loading}</p>}>
            <CubeScene
              ref={scene}
              n={n}
              colours={colours}
              show={show}
              xray={xray}
              picked={picked}
              onPick={setPicked}
              label={t.scene}
              noWebgl={t.noWebgl}
            />
          </Suspense>
          <div className="explore-zoom">
            <button type="button" className="btn icon" onClick={() => scene.current?.zoom(1.3)} aria-label={t.zoomIn}>
              +
            </button>
            <button type="button" className="btn icon" onClick={() => scene.current?.zoom(1 / 1.3)} aria-label={t.zoomOut}>
              −
            </button>
            <button type="button" className="btn icon" onClick={() => scene.current?.reset()} aria-label={t.reset} title={t.reset}>
              ⟲
            </button>
          </div>
        </div>
        <p className="explore-hint muted">{t.hint}</p>
        <div className="explore-faces" role="group" aria-label={t.look}>
          {LOOK_ORDER.map((f) => (
            <button key={f} type="button" className={`btn${HIDDEN.includes(f) ? ' explore-hidden-side' : ''}`} onClick={() => scene.current?.look(f)}>
              <BiLabel get={(d) => d.explore.faces[f]} />
            </button>
          ))}
        </div>
        <div className="explore-info" aria-live="polite">
          <BiBlock text={w.info} other={w2?.info} lang={lang} otherLang={otherLang} />
        </div>
      </section>

      <section className="card explore-panel">
        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.explore.size} />
          </h2>
          <div className="explore-seg" role="group" aria-label={t.size}>
            {SIZES.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={k === n}
                onClick={() => {
                  setN(k)
                  setPicked(null)
                }}
              >
                {k}×{k}
              </button>
            ))}
          </div>
          <p className="explore-total">{t.total(n)}</p>
        </div>

        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.explore.colours} />
          </h2>
          <div className="explore-seg" role="group" aria-label={t.colours}>
            {COLOUR_COUNTS.map((k) => (
              <button key={k} type="button" aria-pressed={k === colours} onClick={() => setColours(k)}>
                <BiLabel get={(d) => d.explore.colourCount(k)} />
              </button>
            ))}
          </div>
          <ul className="explore-legend">
            {legend.map(([face, p]) => (
              <li key={face}>
                <i style={{ background: `var(--paint-${p})` }} aria-hidden />
                {face}: {t.paints[p]}
              </li>
            ))}
          </ul>
        </div>

        <div className="explore-group">
          <h2>
            <BiLabel get={(d) => d.explore.highlight} />
          </h2>
          <div className="explore-kinds">
            {(['all', ...KINDS] as Show[]).map((k) => (
              <button key={k} type="button" className={`explore-kind kind-${k}`} aria-pressed={k === show} onClick={() => setShow(k)}>
                <span className="explore-dot" aria-hidden />
                <span>
                  <BiLabel get={(d) => d.explore.kinds[k]} />
                  {t.kindSub[k] && (
                    <small className="muted">
                      <BiLabel get={(d) => d.explore.kindSub[k]} />
                    </small>
                  )}
                </span>
                <span className="explore-count">{kindCount(k, n)}</span>
              </button>
            ))}
          </div>
          <div className="shape-formula">
            <BiBlock text={w.formula} other={w2?.formula} lang={lang} otherLang={otherLang} />
          </div>
          <label className="explore-switch">
            <input type="checkbox" checked={xray} onChange={(e) => setXray(e.target.checked)} />
            <span>
              <BiLabel get={(d) => d.explore.xray} />
            </span>
          </label>
        </div>
      </section>
    </Page>
  )
}
