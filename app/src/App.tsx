import { Page } from './components/Page'
import { getTopic } from './data/topics'
import { href, useRoute } from './lib/router'
import { Classroom } from './pages/Classroom'
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Practice } from './pages/Practice'
import type { PracticeMode } from './pages/Practice'
import { QuickTest } from './pages/QuickTest'
import { GuessRule } from './pages/GuessRule'

const MODES: PracticeMode[] = ['book', 'more', 'mistakes']

function NotFound() {
  return (
    <Page title="Not found" back="">
      <p>That page doesn't exist.</p>
      <a className="btn btn-primary" href={href('')}>
        Go home
      </a>
    </Page>
  )
}

export default function App() {
  const { parts, query } = useRoute()
  if (parts.length === 0) return <Home />

  const [kind, topicId, view] = parts
  const topic = kind === 't' ? getTopic(topicId) : undefined
  if (!topic) return <NotFound />

  switch (view) {
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
    default:
      return <NotFound />
  }
}
