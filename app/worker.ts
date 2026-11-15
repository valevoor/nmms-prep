/**
 * The Cloudflare Worker behind mystudyprep.in. Files in dist/ (the landing page at /, About, figures, the app's
 * scripts) are served directly and never reach this code; it only answers paths that aren't files:
 *  - /welcome/, the landing page's old address, moves to /;
 *  - a missing file (a path ending in .png, .js…) stays a 404;
 *  - any other path is an app page (/mat, /sat/algebra/revise), answered with app.html.
 */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (/^\/welcome(\/|\/index\.html)?$/.test(url.pathname)) return Response.redirect(new URL('/' + url.search, url).href, 301)
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return env.ASSETS.fetch(request)
    // "/app" is app.html: the asset server drops .html from addresses.
    return env.ASSETS.fetch(new Request(new URL('/app', url), request))
  },
}
