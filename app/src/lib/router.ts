import { useSyncExternalStore } from 'react'

/** Hash routes (#/t/number-series/practice?mode=book) work on any static host and offline. */
export interface Route {
  parts: string[]
  query: URLSearchParams
}

const subscribe = (l: () => void) => {
  window.addEventListener('hashchange', l)
  return () => window.removeEventListener('hashchange', l)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, qs = ''] = hash.replace(/^#\/?/, '').split('?')
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs) }
}

export const href = (path: string) => `#/${path.replace(/^\//, '')}`

export function navigate(path: string) {
  window.location.hash = href(path)
  window.scrollTo(0, 0)
}
