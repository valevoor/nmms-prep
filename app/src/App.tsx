import { useLayoutEffect, useRef } from 'react'
import { Page } from './components/Page'
import { TopicIdContext, useT } from './lib/i18n'
import { getTopic } from './data/topics'
import type { ReadyTopic } from './data/topics'
import { setLastTopic } from './lib/lastTopic'
import { href, useRoute } from './lib/router'
import { Chapter } from './pages/Chapter'
import { Classroom } from './pages/Classroom'
import { CubeExplorer } from './pages/CubeExplorer'
import { DiceFold } from './pages/DiceFold'
import { SheetFold } from './pages/SheetFold'
import { PunchFold } from './pages/PunchFold'
import { Reflect } from './pages/Reflect'
import { FACT_TABS } from './data/facts'
import { Facts } from './pages/Facts'
import { Home } from './pages/Home'
import { SHAPE_IDS, SHAPE_STEPS } from './data/shapes'
import { Shapes } from './pages/Shapes'
import { Learn } from './pages/Learn'
import { Practice } from './pages/Practice'
import type { PracticeMode } from './pages/Practice'
import { QuickTest } from './pages/QuickTest'
import { GuessRule } from './pages/GuessRule'

const MODES: PracticeMode[] = ['book', 'more', 'mistakes']

/** Home's scroll position, so going back to it lands on the same chapter row. */
let homeScroll = 0

/** Links don't reset the scroll, so each new page starts at the top, except Home, which goes back to where it was. */
function useScrollOnRouteChange(path: string) {
  const prev = useRef(path)
  useLayoutEffect(() => {
    if (prev.current === path) return
    window.scrollTo(0, path === '' ? homeScroll : 0)
    prev.current = path
  }, [path])
  useLayoutEffect(() => {
    if (path !== '') return
    const save = () => {
      homeScroll = window.scrollY
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [path])
}

function NotFound() {
  const t = useT()
  return (
    <Page title={t.common.notFound} back="">
      <p>{t.common.notFoundBody}</p>
      <a className="btn btn-primary" href={href('')}>
        {t.common.goHome}
      </a>
    </Page>
  )
}

export default function App() {
  const { parts, query } = useRoute()
  const [kind, topicId, view] = parts
  const topic = kind === 't' ? getTopic(topicId) : undefined
  useScrollOnRouteChange(parts.join('/'))
  useLayoutEffect(() => {
    if (topic) setLastTopic(topic.id)
  }, [topic])

  if (parts.length === 0) return <Home />
  if (kind === 'facts' && parts.length <= 2) {
    const tab = FACT_TABS.find((k) => k === (topicId ?? 'primes'))
    return tab ? <Facts tab={tab} /> : <NotFound />
  }
  if (kind === 'shapes' && parts.length <= 3) {
    const shape = SHAPE_IDS.find((k) => k === (topicId ?? 'square'))
    const step = SHAPE_STEPS.find((k) => k === (view ?? 'perimeter'))
    return shape && step ? (
      <TopicIdContext.Provider value="shapes">
        <Shapes shape={shape} step={step} />
      </TopicIdContext.Provider>
    ) : (
      <NotFound />
    )
  }
  if (!topic) return <NotFound />
  // The rule game shows series and rules, not sentences, so it doesn't offer both languages at once.
  return <TopicIdContext.Provider value={view === 'rule' ? undefined : topic.id}>{topicPage(topic, view, query)}</TopicIdContext.Provider>
}

function topicPage(topic: ReadyTopic, view: string | undefined, query: URLSearchParams) {
  switch (view) {
    case undefined:
      return <Chapter topic={topic} />
    case 'learn':
      return <Learn topic={topic} />
    case 'practice': {
      const m = query.get('mode') as PracticeMode
      const mode = MODES.includes(m) ? m : 'book'
      return <Practice key={mode} topic={topic} mode={mode} />
    }
    case 'test':
      return <QuickTest topic={topic} />
    case 'classroom':
      return <Classroom topic={topic} />
    case 'rule':
      return topic.guessRule ? <GuessRule topic={topic} /> : <NotFound />
    case 'explore':
      return topic.explore ? <CubeExplorer /> : <NotFound />
    case 'fold':
      return topic.fold ? <DiceFold /> : <NotFound />
    case 'draw':
      return topic.draw ? <SheetFold /> : <NotFound />
    case 'punch':
      return topic.punch ? <PunchFold /> : <NotFound />
    case 'try':
      return topic.reflect ? <Reflect key={topic.reflect} kind={topic.reflect} /> : <NotFound />
    default:
      return <NotFound />
  }
}
