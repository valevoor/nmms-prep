import { useState } from 'react'
import type { ReactNode } from 'react'
import { BiBlock, BiLabel } from '../components/Bi'
import { Page } from '../components/Page'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'
import { boardView, emptyBoard, FLIP, keyboardOnly, looksSame, partner, SHAPE_KINDS, shapePath, startBoard, tapCell, textView } from '../lib/reflect'
import type { Board, BoardView, Glyph, Kind, ShapeKind } from '../lib/reflect'

type Tab = 'letters' | 'shapes'
type Tool = ShapeKind | 'erase'

const MAX = 10
const EXAMPLES: Record<Kind, string[]> = {
  mirror: ['NMMS', 'AMBULANCE', '(5+3)>7', 'bdpq', '[A/B]'],
  water: ['NMMS', 'bdpq MW', '5+3>7', 'CHOICE'],
}
const TOOLS: Tool[] = [...SHAPE_KINDS, 'erase']

/** Mirror Image (Ch 8) and Water Image (Ch 9): type characters or place shapes, and see their image. */
export function Reflect({ kind }: { kind: Kind }) {
  const t = useT().reflect
  const k = t[kind]
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const other = useShowBoth() ? DICTS[otherLang].reflect : undefined
  const f = FLIP[kind]

  const [tab, setTab] = useState<Tab>('letters')
  const [text, setText] = useState(EXAMPLES[kind][kind === 'mirror' ? 2 : 1])
  const [board, setBoard] = useState<Board>(startBoard)
  const [tool, setTool] = useState<Tool>('tri')
  const [filled, setFilled] = useState(false)

  const letters = tab === 'letters'

  return (
    <Page title={k.title} back="">
      <section className="card explore-card rf-card">
        <div className="explore-seg" role="group" aria-label={t.tabs}>
          {(['letters', 'shapes'] as const).map((id) => (
            <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
              <BiLabel get={(d) => d.reflect[id]} />
            </button>
          ))}
        </div>

        {letters ? (
          <>
            <label className="rf-label" htmlFor="rf-input">
              <BiLabel get={(d) => d.reflect[kind].typeLabel} />
            </label>
            <div className="rf-input-row">
              <input
                id="rf-input"
                className="rf-input"
                value={text}
                maxLength={MAX}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                lang="en"
                onChange={(e) => setText(keyboardOnly(e.target.value).slice(0, MAX))}
              />
              <button type="button" className="btn icon" aria-label={t.clear} title={t.clear} onClick={() => setText('')}>
                ✕
              </button>
            </div>
            <div className="rf-examples" role="group" aria-label={t.examples}>
              {EXAMPLES[kind].map((w) => (
                <button key={w} type="button" className="rf-chip" onClick={() => setText(w)}>
                  {w}
                </button>
              ))}
            </div>
            <Stage kind={kind} label={t.typed} image={k.image}>
              <Glyphs glyphs={textView(text, false, 'n').glyphs} />
              <Glyphs glyphs={textView(text, kind === 'mirror', f).glyphs} />
            </Stage>
          </>
        ) : (
          <>
            <div className="explore-seg rf-tools" role="group" aria-label={t.tools}>
              {TOOLS.map((tl) => (
                <button key={tl} type="button" aria-pressed={tool === tl} onClick={() => setTool(tl)}>
                  <svg className="rf-tool-icon" viewBox="0 0 40 40" aria-hidden>
                    <path d={tl === 'erase' ? 'M12 12L28 28M28 12L12 28' : shapePath(tl)} />
                  </svg>
                  <BiLabel get={(d) => d.reflect[tl]} />
                </button>
              ))}
            </div>
            <div className="rf-pen">
              <label className="explore-switch">
                <input type="checkbox" checked={filled} onChange={(e) => setFilled(e.target.checked)} />
                <span>
                  <BiLabel get={(d) => d.reflect.filled} />
                </span>
              </label>
              <button type="button" className="btn" onClick={() => setBoard(emptyBoard())}>
                <BiLabel get={(d) => d.reflect.clear} />
              </button>
            </div>
            <p className="explore-hint muted">
              {t.shapeHint}
              {other && <span lang={otherLang}> · {other.shapeHint}</span>}
            </p>
            <Stage kind={kind} label={t.yourFigure} image={k.image}>
              <div className="rf-grid" role="group" aria-label={t.grid}>
                {boardView(board, 'n', 'n').cells.map((c, i) => {
                  const cell = board[i]
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={t.cell(Math.floor(i / 4) + 1, (i % 4) + 1, cell ? t[cell.k] : t.empty)}
                      onClick={() => setBoard(tapCell(board, i, tool, filled))}
                    >
                      <CellArt d={c.d} filled={c.filled} />
                    </button>
                  )
                })}
              </div>
              <GridView view={boardView(board, f, f)} label={t.imageLabel(k.image)} />
            </Stage>
          </>
        )}
      </section>

      {letters && text.trim() && <Changes kind={kind} text={text} />}

      <section className="card trick-card">
        <BiBlock text={k.rule} other={other?.[kind].rule} lang={lang} otherLang={otherLang} />
      </section>
    </Page>
  )
}

/** The original beside a mirror (on its right), or above water (with the image below the line). */
function Stage({ kind, label, image, children }: { kind: Kind; label: string; image: string; children: [ReactNode, ReactNode] }) {
  const [original, img] = children
  return (
    <div className={`rf-stage rf-${kind}`}>
      <div className="rf-side">
        <span className="rf-caption">{label}</span>
        {original}
      </div>
      <svg className="rf-line" viewBox={kind === 'mirror' ? '0 0 14 100' : '0 0 100 14'} preserveAspectRatio="none" aria-hidden>
        {kind === 'mirror' ? (
          <>
            <line x1="3" y1="0" x2="3" y2="100" className="rf-line-main" />
            {[10, 24, 38, 52, 66, 80, 94].map((y) => (
              <line key={y} x1="3" y1={y} x2="11" y2={y - 8} />
            ))}
          </>
        ) : (
          <>
            <line x1="0" y1="3" x2="100" y2="3" className="rf-line-main" />
            {[6, 18, 30, 42, 54, 66, 78, 90].map((x) => (
              <line key={x} x1={x} y1="3" x2={x - 5} y2="11" />
            ))}
          </>
        )}
      </svg>
      <div className="rf-side rf-image">
        {img}
        <span className="rf-caption">{image}</span>
      </div>
    </div>
  )
}

function Glyphs({ glyphs }: { glyphs: Glyph[] }) {
  return (
    <span className="rf-text" lang="en" style={{ fontSize: `${Math.max(1, Math.min(2.6, 9 / Math.max(glyphs.length, 1)))}rem` }}>
      {glyphs.map((g, i) => (
        <span key={i} className={`rf-glyph rf-${g.flip}`}>
          {g.ch === ' ' ? ' ' : g.ch}
        </span>
      ))}
    </span>
  )
}

function CellArt({ d, filled }: { d: string; filled: boolean }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      {d && <path d={d} fill={filled ? 'currentColor' : 'none'} />}
    </svg>
  )
}

function GridView({ view, label }: { view: BoardView; label: string }) {
  return (
    <div className="rf-grid" role="img" aria-label={label}>
      {view.cells.map((c, i) => (
        <span key={i}>
          <CellArt d={c.d} filled={c.filled} />
        </span>
      ))}
    </div>
  )
}

/** One tile per character typed: does it look the same, like another character, or turned round? */
function Changes({ kind, text }: { kind: Kind; text: string }) {
  const tr = useT()
  const t = tr.reflect
  const lang = useLocale()
  const other = useShowBoth() ? DICTS[otherLocale(lang)].reflect : undefined
  const f = FLIP[kind]
  const chars = [...new Set(Array.from(text))].filter((ch) => ch !== ' ')
  const tag = (d: typeof t, ch: string) => {
    const p = partner(f, ch)
    return looksSame(f, ch) ? d.same : p ? d.looksLike(p) : d[kind].turns
  }
  return (
    <section className="card rf-changes">
      <h3>
        <BiLabel get={(d) => d.reflect.changes} />
      </h3>
      <ul>
        {chars.map((ch) => (
          <li key={ch} className={looksSame(f, ch) ? 'same' : ''}>
            <span className="rf-pair" lang="en">
              {ch}
              <span aria-hidden> → </span>
              <span className={`rf-glyph rf-${f}`}>{ch}</span>
            </span>
            <span className="rf-tag">
              {tag(t, ch)}
              {other && tag(other, ch) !== tag(t, ch) && <span lang={otherLocale(lang)}> · {tag(other, ch)}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
