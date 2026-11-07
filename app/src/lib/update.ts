/**
 * Keeps the installed app up to date. The service worker answers every load from its offline copy,
 * so on its own a new version only shows after two refreshes, and a home-screen app (which has no
 * refresh button) can stay on an old version for days.
 *
 * Here the app checks for a new version when it opens, whenever it comes back to the screen, and
 * every hour while it stays open. A new version takes over the service worker at once, and the page
 * reloads to match it. During a Quick test or a Classroom session the reload waits until the student
 * leaves that screen, so no test is lost. Those screens already have everything they need loaded
 * (only the 3D cube scene is loaded later, and they don't show it).
 */
import { registerSW } from 'virtual:pwa-register'

const CHECK_EVERY_MS = 60 * 60 * 1000

/** #/t/<topic>/test and #/t/<topic>/classroom: a reload there would throw away the session. */
function busy() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')
  return parts[0] === 't' && (parts[2] === 'test' || parts[2] === 'classroom')
}

function reloadWhenFree() {
  const reload = () => {
    if (busy()) return
    window.removeEventListener('hashchange', reload)
    window.location.reload()
  }
  window.addEventListener('hashchange', reload)
  reload()
}

export function startUpdates() {
  if (!('serviceWorker' in navigator)) return
  // On a first visit the service worker takes over a page that is already up to date: no reload.
  let controlled = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled) reloadWhenFree()
    controlled = true
  })

  registerSW({
    immediate: true,
    // The plugin's own reload can't wait for a test to end; the listener above does it instead.
    onNeedReload() {},
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        // Offline the check would only fail; skip it.
        if (!navigator.onLine || registration.installing) return
        registration.update().catch(() => {})
      }
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      setInterval(check, CHECK_EVERY_MS)
    },
  })
}
