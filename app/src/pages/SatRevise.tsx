import { BiBlock } from '../components/Bi'
import { MathText } from '../components/MathText'
import { Page } from '../components/Page'
import type { SatChapter, SatTopic } from '../data/sat'
import { satChapterName, satTopicName } from '../data/sat'
import { revisionText, topicRevisions } from '../data/satRevise'
import type { Revision, RevisionKn } from '../data/satRevise'
import { useLocale, useShowBoth, useT } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'

const math = (s: string) => <MathText text={s} />

/** A line in the chosen language, with the other language under it when both are shown. */
function Line({ text, other, lang, otherLang, className }: { text: string; other?: string; lang: Locale; otherLang: Locale; className?: string }) {
  return <BiBlock className={className} text={text} other={other} lang={lang} otherLang={otherLang} render={math} />
}

function Sheet({ chapter, sheet, many }: { chapter: SatChapter; sheet: { en: Revision; kn: RevisionKn }; many: boolean }) {
  const t = useT()
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const a = revisionText(sheet, lang)
  const b = both ? revisionText(sheet, otherLang) : undefined
  const line = { lang, otherLang }
  const pages = (p: number[]) => <p className="muted revise-page">{t.sat.bookPages(p)}</p>
  const book = t.sat.book(chapter.cls, t.sat.subjects[chapter.subject], chapter.part, chapter.pages[0], chapter.pages[1])
  return (
    <>
      {many && (
        <h2 className="revise-chapter">
          {t.sat.chapterTitle(chapter.cls, chapter.no)} · {satChapterName(chapter, lang)}
        </h2>
      )}
      <p className="muted">{book}</p>

      <h2 className="section-title">{t.sat.keyTerms}</h2>
      <section className="card revise-terms">
        {a.terms.map((x, i) => (
          <div key={x.id} className="revise-term">
            <Line {...line} className="revise-name" text={x.term} other={b?.terms[i].term} />
            <Line {...line} text={x.meaning} other={b?.terms[i].meaning} />
            {pages(x.pages)}
          </div>
        ))}
      </section>

      {a.groups.map((g, gi) => (
        <div key={g.id}>
          <h2 className="section-title">{g.title}</h2>
          {g.items.map((x, i) => {
            const o = b?.groups[gi].items[i]
            return (
              <section key={x.id} className="card example">
                <Line {...line} className="revise-name" text={x.name} other={o?.name} />
                <Line {...line} className="revise-formula" text={x.formula} other={o?.formula} />
                <Line {...line} className="revise-eg" text={x.example} other={o?.example} />
                {pages(x.pages)}
              </section>
            )
          })}
        </div>
      ))}

      <h2 className="section-title">{t.sat.commonMistakes}</h2>
      {a.mistakes.map((m, i) => (
        <section key={m.id} className="revise-mistake">
          <Line {...line} text={m.text} other={b?.mistakes[i].text} />
        </section>
      ))}
    </>
  )
}

/**
 * Revision for a SAT topic (#/sat/<id>/revise), one sheet per textbook chapter: key terms, formulas with an
 * example and the book page, and common mistakes. It is for reading only: Practice and Flash cards are on
 * the topic page. MAT's counterpart is Learn.
 */
export function SatRevise({ topic }: { topic: SatTopic }) {
  const t = useT()
  const lang = useLocale()
  const sheets = topicRevisions(topic)
  return (
    <Page title={t.sat.reviseTitle(satTopicName(topic, lang))} back={`sat/${topic.id}`}>
      {sheets.map((r) => (
        <Sheet key={r.chapter.id} chapter={r.chapter} sheet={r.sheet} many={sheets.length > 1} />
      ))}
    </Page>
  )
}
