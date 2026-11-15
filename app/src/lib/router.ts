import { useSyncExternalStore } from 'react'

/**
 * Path routes (/mat/number-series/practice/book), so each page has its own URL for Cloudflare Web Analytics
 * and search engines. / is the landing page (public/index.html). worker.ts and, offline, the service worker
 * answer every app path with app.html. Links are plain <a href> tags: a click on one inside the
 * app is caught here and becomes a history.pushState, so the page doesn't reload.
 */
export interface Route {
  parts: string[]
  query: URLSearchParams
}

/** Served as their own pages, not by the app: the landing page (/), About, the slides, and the old /welcome/. */
const NOT_APP = /^\/($|(welcome|about|slides)(\/|$))/

const ROUTE_EVENT = 'nmms-route'

/** Calls `l` after every change of page: a link, Back or Forward. Returns the unsubscribe function. */
export function onRouteChange(l: () => void) {
  window.addEventListener('popstate', l)
  window.addEventListener(ROUTE_EVENT, l)
  return () => {
    window.removeEventListener('popstate', l)
    window.removeEventListener(ROUTE_EVENT, l)
  }
}

export function useRoute(): Route {
  const url = useSyncExternalStore(onRouteChange, () => window.location.pathname + window.location.search)
  const [path, qs = ''] = url.split('?')
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs) }
}

export const href = (path: string) => `/${path.replace(/^\//, '')}`

export function navigate(path: string, replace = false) {
  const url = href(path)
  if (url !== window.location.pathname + window.location.search) history[replace ? 'replaceState' : 'pushState'](null, '', url)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

/**
 * The address of an old hash route (#/t/number-series/practice?mode=book, #/?test=sat), from before the
 * app had path routes, so links already shared and old home-screen installs still work. Undefined if the
 * hash isn't a route.
 */
export function pathFromHash(hash: string): string | undefined {
  if (!hash.startsWith('#/')) return undefined
  const [path, qs = ''] = hash.slice(2).split('?')
  const query = new URLSearchParams(qs)
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return query.get('test') === 'sat' ? 'sat' : 'mat'
  if (parts[0] === 't') parts[0] = 'mat'
  const mode = query.get('mode')
  if ((parts[0] === 'mat' || parts[0] === 'sat') && parts[2] === 'practice' && parts.length === 3 && mode) parts.push(mode)
  return parts.join('/')
}

/** Turns an old hash route into its path, and catches clicks on links inside the app. */
export function startRouter() {
  const old = pathFromHash(window.location.hash)
  if (old !== undefined) history.replaceState(null, '', href(old))
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a')
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
    const url = new URL(a.href, window.location.href)
    // Other sites, the landing, About and slides pages, and files (a PDF, an image) open normally.
    if (url.origin !== window.location.origin || NOT_APP.test(url.pathname) || /\.[a-z0-9]+$/i.test(url.pathname)) return
    e.preventDefault()
    navigate(url.pathname + url.search)
  })
}
