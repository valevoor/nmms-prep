import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BiLabel } from '../components/Bi'
import { Explanation } from '../components/Explanation'
import { Options } from '../components/Options'
import { Page } from '../components/Page'
import { QuestionStem } from '../components/QuestionStem'
import { SatExplanation, SatQuestionBody } from '../components/SatQuestion'
import { PAPER_FILES } from '../data/papers'
import { askLabel, getTopic } from '../data/topics'
import { DICTS, useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Dict } from '../lib/i18n'
import { answerOf, itemTest, mockSeconds, satRef, satSubjectOf } from '../lib/mock'
import type { MockConfig, MockItem } from '../lib/mock'
import { newPaperCode, parsePrint, printItems, printPath } from '../lib/mockPrint'
import { href, navigate, useRoute } from '../lib/router'
import { OPTION_KEYS } from '../types'

type Part = 'paper' | 'sheet' | 'key' | 'solutions'

/** A run of questions under one direction line: a MAT chapter's "Find the missing number", or a SAT subject. */
interface Group {
  test: 'mat' | 'sat'
  /** Starts a new test (MAT, then SAT): its heading goes above. */
  first: boolean
  label: (d: Dict) => string
  key: string
  from: number
  items: { item: MockItem; no: number }[]
}

function groups(items: MockItem[]): Group[] {
  const out: Group[] = []
  items.forEach((item, i) => {
    const test = itemTest(item)
    const topic = item.q ? getTopic(item.topic) : undefined
    const subject = satSubjectOf(item)
    const label = topic ? (d: Dict) => askLabel(d, topic) : (d: Dict) => d.sat.subjects[subject!]
    const key = `${test}/${label(DICTS.en)}`
    const last = out[out.length - 1]
    if (last && last.key === key) last.items.push({ item, no: i + 1 })
    else out.push({ test, first: !last || last.test !== test, label, key, from: i + 1, items: [{ item, no: i + 1 }] })
  })
  return out
}

/** Pictures are loaded only when scrolled to, so they are all asked for before printing. */
async function loadPictures() {
  const imgs = [...document.querySelectorAll<HTMLImageElement>('.paper img')]
  for (const img of imgs) img.loading = 'eager'
  await Promise.all(imgs.map((img) => img.decode().catch(() => {})))
}

/** /mock/print: a mock exam as a paper to print, with an answer sheet and the answer key. */
export function MockPrint() {
  const t = useT()
  const { query } = useRoute()
  const parsed = parsePrint(query)
  if (!parsed)
    return (
      <Page title={t.mock.print.title} back="mock" hideMock>
        <p>{t.mock.print.bad}</p>
        <a className="btn btn-primary" href={href('mock')}>
          {t.mock.print.backToMock}
        </a>
      </Page>
    )
  return <PrintPaper key={query.toString()} config={parsed.config} code={parsed.code} />
}

function PrintPaper({ config, code }: { config: MockConfig; code: string }) {
  const t = useT()
  const p = t.mock.print
  const lang = useLocale()
  const both = useShowBoth()
  const items = useMemo(() => printItems(config, code), [config, code])
  const minutes = mockSeconds(config, items) / 60
  const [parts, setParts] = useState<Part[]>(['paper', 'sheet'])
  const has = (x: Part) => parts.includes(x)
  const toggle = (x: Part) => setParts(has(x) ? parts.filter((y) => y !== x && (x !== 'key' || y !== 'solutions')) : [...parts, x])
  const realPaper = config.paper && !config.mat ? PAPER_FILES.find((x) => x.id === config.paper) : undefined
  const title = [config.tests.map((x) => x.toUpperCase()).join(' + '), realPaper ? t.mock.paperName(realPaper.year) : t.mock.title].join(' · ')

  // Ctrl+P too: the browser's own print command doesn't wait, but asks for the pictures as early as it can.
  useEffect(() => {
    const before = () => void loadPictures()
    window.addEventListener('beforeprint', before)
    return () => window.removeEventListener('beforeprint', before)
  }, [])
  const print = async () => {
    await loadPictures()
    window.print()
  }

  const choices: { id: Part; name: string; sub: string; off?: boolean }[] = [
    { id: 'paper', name: p.paper, sub: p.paperSub(items.length, minutes) },
    { id: 'sheet', name: p.sheet, sub: p.sheetSub },
    { id: 'key', name: p.key, sub: p.keySub },
    { id: 'solutions', name: p.solutions, sub: p.solutionsSub, off: !has('key') },
  ]

  return (
    <Page title={p.title} back="mock" hideMock>
      <div className="no-print">
        <section className="card intro">
          <h2>{title}</h2>
          <p className="muted">{p.lead}</p>
        </section>
        <fieldset className="card mock-choice">
          <legend className="section-title">{p.parts}</legend>
          {choices.map((x) => (
            <label key={x.id} className={`mock-option${has(x.id) ? ' on' : ''}${x.off ? ' print-off' : ''}`}>
              <input type="checkbox" checked={has(x.id)} disabled={x.off} onChange={() => toggle(x.id)} />
              <span>
                <strong>{x.name}</strong>
                <span className="muted">{x.sub}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {parts.length === 0 && <p className="mock-warn">{p.none}</p>}
        <div className="nav-row">
          <button className="btn" onClick={() => navigate(printPath(config, newPaperCode()), true)}>
            {p.newPaper}
          </button>
          <button className="btn btn-primary" disabled={parts.length === 0} onClick={() => void print()}>
            {p.printNow}
          </button>
        </div>
        <p className="muted mock-note">
          <strong>{p.code(code)}</strong>. {p.codeNote}
        </p>
      </div>

      <div className="paper">
        {has('paper') && (
          <PaperPart title={title} code={code}>
            <PaperHeader minutes={minutes} marks={items.length} />
            {(lang === 'kn' || both) && <p className="paper-draft">{p.draft}</p>}
            {groups(items).map((g) => (
              <section key={g.from} className="paper-group">
                {g.items.map(({ item, no }, i) => (
                  // The test's heading and the direction line stay on the same page as their first question.
                  <div key={no} className="paper-keep">
                    {i === 0 && g.first && config.tests.length > 1 && (
                      <h3 className="paper-test">
                        {g.test.toUpperCase()} · {g.test === 'mat' ? t.mock.matSub : t.mock.satSub}
                      </h3>
                    )}
                    {i === 0 && (
                      <p className="paper-direction">
                        <strong>{p.range(g.from, g.from + g.items.length - 1)}:</strong> <BiLabel get={g.label} />
                      </p>
                    )}
                    <div className="paper-q">
                      <span className="paper-no">{no}.</span>
                      <div className="paper-body">
                        <PrintQuestion item={item} />
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </PaperPart>
        )}

        {has('sheet') && (
          <PaperPart title={title} code={code}>
            <h2 className="paper-title">{p.sheetTitle}</h2>
            <PaperHeader minutes={minutes} marks={items.length} />
            <p className="paper-direction">{p.sheetNote}</p>
            <ol className="paper-omr">
              {items.map((_, i) => (
                <li key={i}>
                  <span className="paper-no">{i + 1}</span>
                  {OPTION_KEYS.map((k) => (
                    <span key={k} className="paper-bubble">
                      {k}
                    </span>
                  ))}
                </li>
              ))}
            </ol>
          </PaperPart>
        )}

        {has('key') && (
          <PaperPart title={title} code={code}>
            <h2 className="paper-title">{p.keyTitle}</h2>
            <ol className="paper-key">
              {items.map((x, i) => (
                <li key={i}>
                  <span className="paper-no">{i + 1}</span> <strong>{answerOf(x)}</strong>
                </li>
              ))}
            </ol>
            {has('solutions') && (
              <>
                <h2 className="paper-title paper-solutions-title">{p.solutionsTitle}</h2>
                {items.map((x, i) => (
                  <div key={i} className="paper-q">
                    <span className="paper-no">{i + 1}.</span>
                    <div className="paper-body">
                      <p className="paper-answer">{answerOf(x)}</p>
                      <PrintSolution item={x} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </PaperPart>
        )}
      </div>
    </Page>
  )
}

/** One printed part (paper, answer sheet or key): starts on a new page, with the paper's name and code at the top. */
function PaperPart({ title, code, children }: { title: string; code: string; children: ReactNode }) {
  const t = useT()
  return (
    <section className="paper-part">
      <p className="paper-run">
        <span>{title}</span>
        <span>{t.mock.print.code(code)}</span>
      </p>
      {children}
    </section>
  )
}

function PaperHeader({ minutes, marks }: { minutes: number; marks: number }) {
  const p = useT().mock.print
  return (
    <>
      <div className="paper-fields">
        {[p.school, p.name, p.roll, p.date].map((f) => (
          <span key={f} className="paper-field">
            {f}
            <span className="paper-line" />
          </span>
        ))}
      </div>
      <p className="paper-meta">
        <strong>{p.time(minutes)}</strong>
        <strong>{p.marks(marks)}</strong>
      </p>
      <ul className="paper-rules">
        {p.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  )
}

/** A question as printed: the exam's own stem and options, drawn without buttons by the print styles. */
function PrintQuestion({ item }: { item: MockItem }) {
  if (item.q)
    return (
      <>
        <QuestionStem q={item.q} />
        <Options q={item.q} />
      </>
    )
  const r = satRef(item)!
  return <SatQuestionBody paper={r.paper} q={r.q} onPick={() => {}} mode="exam" />
}

function PrintSolution({ item }: { item: MockItem }) {
  if (item.q) return <Explanation q={item.q} />
  const r = satRef(item)!
  return <SatExplanation paper={r.paper} q={r.q} />
}
