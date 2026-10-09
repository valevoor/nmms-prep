/**
 * Anonymous visit counts with GoatCounter (https://www.goatcounter.com): no cookies, nothing stored
 * on the device, no personal data. Each page sends one request with the page's path, title, screen
 * size and referrer. GoatCounter works out daily and monthly visitors from it.
 *
 * Counting is off until GOATCOUNTER_CODE is set, and only runs on the live site, so dev servers,
 * previews and copies on a school server aren't counted. Offline, the request fails silently and
 * the visit is not counted; the app itself never waits on it.
 */

/** The site code from goatcounter.com: "abc" for https://abc.goatcounter.com. Empty turns counting off. */
const GOATCOUNTER_CODE = 'nmms-prep'

const LIVE_HOST = 'valevoor.github.io'

/** Hash routes as paths: "#/t/number-series/practice?mode=book" -> "/t/number-series/practice". */
const pathOf = (hash: string) => '/' + hash.replace(/^#\/?/, '').split('?')[0].replace(/\/+$/, '')

let lastPath = ''

function count() {
  const path = pathOf(window.location.hash)
  if (path === lastPath || !navigator.onLine) return
  // Only the first page of a visit has a referrer (the link the student came from).
  const referrer = lastPath ? '' : document.referrer
  lastPath = path
  const params = new URLSearchParams({
    p: path,
    t: document.title,
    r: referrer,
    s: `${screen.width},${screen.height},${window.devicePixelRatio || 1}`,
    rnd: Math.random().toString(36).slice(2),
  })
  const url = `https://${GOATCOUNTER_CODE}.goatcounter.com/count?${params}`
  try {
    if (navigator.sendBeacon?.(url)) return
  } catch {
    // fall through to the image request
  }
  new Image().src = url
}

export function startAnalytics() {
  if (!GOATCOUNTER_CODE || location.hostname !== LIVE_HOST || navigator.webdriver) return
  count()
  window.addEventListener('hashchange', count)
}
