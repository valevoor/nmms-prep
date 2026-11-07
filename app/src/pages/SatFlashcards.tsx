import { useMemo, useState } from 'react'
import { BiBlock } from '../components/Bi'
import { MathText } from '../components/MathText'
import { Page } from '../components/Page'
import type { SatTopic } from '../data/sat'
import { satTopicName } from '../data/sat'
import { topicRevisions } from '../data/satRevise'
import { flashCards, flashOrder } from '../lib/flashcards'
import { useLocale, useShowBoth, useT } from '../lib/i18n'
import { otherLocale } from '../lib/i18n/content'
import { recordFlash, satKey, useProgress } from '../lib/progress'
import { href } from '../lib/router'

const math = (s: string) => <MathText text={s} />

/**
 * Flash cards for a SAT topic (#/sat/<id>/flashcards), made from its revision sheets: the student recalls a
 * term or formula, shows the answer and says whether they knew it. A card they didn't know comes back later
 * in the round, and first on the next visit.
 */
export function SatFlashcards({ topic }: { topic: SatTopic }) {
  const t = useT()
  const lang = useLocale()
  const otherLang = otherLocale(lang)
  const both = useShowBoth()
  const p = useProgress(satKey(topic.id))
  const cards = useMemo(() => topicRevisions(topic).flatMap((r) => flashCards(r.sheet, lang, both ? otherLang : undefined)), [topic, lang, otherLang, both])
  // Until the first card is answered the order follows saved progress, which may still be loading.
  const [round, setRound] = useState<string[] | null>(null)
  const [open, setOpen] = useState(false)
  const [missed, setMissed] = useState<string[]>([])
  const queue = round ?? flashOrder(cards.map((c) => c.id), p.flash)
  const known = cards.length - queue.length
  const card = cards.find((c) => c.id === queue[0])
  const base = `sat/${topic.id}`

  function knew() {
    // A card missed earlier in this round stays "missed", so it still comes first next time.
    if (!missed.includes(queue[0])) recordFlash(topic.id, queue[0], true)
    setRound(queue.slice(1))
    setOpen(false)
  }

  function again() {
    recordFlash(topic.id, queue[0], false)
    if (!missed.includes(queue[0])) setMissed([...missed, queue[0]])
    setRound([...queue.slice(1), queue[0]])
    setOpen(false)
  }

  function restart() {
    setRound(null)
    setMissed([])
    setOpen(false)
  }

  const line = { lang, otherLang, render: math }
  return (
    <Page title={t.sat.flashcards} back={base}>
      <p className="muted flash-status">
        {satTopicName(topic, lang)} · {t.sat.flashKnown(known, cards.length)}
      </p>
      <div className="meter flash-meter" aria-hidden>
        <div className="meter-fill" style={{ width: `${(100 * known) / cards.length}%` }} />
      </div>
      {card ? (
        <section className="card flash-card">
          <BiBlock {...line} className="flash-front" text={card.text.front} other={card.other?.front} />
          {!open ? (
            <>
              <p className="muted">{t.sat.flashPrompt}</p>
              <div className="actions">
                <button className="btn btn-primary btn-lg flash-wide" onClick={() => setOpen(true)}>
                  {t.learn.showAnswer}
                </button>
              </div>
            </>
          ) : (
            <>
              <BiBlock {...line} className={card.text.example ? 'revise-formula' : 'flash-meaning'} text={card.text.back} other={card.other?.back} />
              {card.text.example && <BiBlock {...line} className="revise-eg" text={card.text.example} other={card.other?.example} />}
              <p className="muted revise-page">{t.sat.bookPages(card.pages)}</p>
              <div className="actions flash-grade">
                <button className="btn" onClick={again}>
                  {t.sat.flashAgain}
                </button>
                <button className="btn btn-primary" onClick={knew}>
                  {t.sat.flashKnew}
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="card done">
          <p className="big-score">
            {cards.length - missed.length}/{cards.length}
          </p>
          <h3>{missed.length === 0 ? t.practice.perfect : t.practice.wellDone}</h3>
          <p>{missed.length === 0 ? t.sat.flashAllKnown : t.sat.flashMissedNext}</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={restart}>
              {t.common.startAgain}
            </button>
            <a className="btn" href={href(`${base}/revise`)}>
              {t.sat.revise}
            </a>
          </div>
        </section>
      )}
    </Page>
  )
}
