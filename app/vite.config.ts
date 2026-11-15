/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * The site's pages, as worker.ts serves them live: / is the landing page (public/index.html), /about/ is
 * public/about/index.html, and every other path that isn't a file is an app page, answered with app.html.
 * The dev server and the build's preview would otherwise answer every path with index.html.
 */
function pageFor(url = '') {
  const path = url.split('?')[0]
  if (path === '/' || path === '/about/') return `${path}index.html`
  // Vite's own requests (/@vite/client, /src/main.tsx, /node_modules/…) and files pass through.
  if (/^\/(@|src\/|node_modules\/)/.test(path) || /\.[a-z0-9]+$/i.test(path)) return url
  return '/app.html'
}
const sitePages: Plugin = {
  name: 'site-pages',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = pageFor(req.url)
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = pageFor(req.url)
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  // The app uses path routes (/mat/number-series), so it is served from the site's root.
  base: '/',
  // The app is app.html; index.html is the landing page in public/.
  build: { rollupOptions: { input: 'app.html' } },
  plugins: [
    sitePages,
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // src/lib/update.ts registers the service worker, checks for new versions and reloads the page.
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'NMMS Prep: Mental Ability',
        short_name: 'NMMS Prep',
        description: 'Free offline practice for the NMMS MAT and SAT papers (Class 8).',
        start_url: '/mat',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f6f7fb',
        theme_color: '#2f5bea',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // A new version takes over open pages too, so src/lib/update.ts sees it and reloads them.
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // The past papers are bundled into the app script, which passed the default 2 MiB with the fourth
        // paper, and 4 MiB with the social science revision sheets. Anything over the limit is left out of the
        // offline cache, so keep it above the script's size.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Offline, every app path (/mat/number-series/learn) is answered with app.html; the landing page (/)
        // and About come from the precache. The talk deck at /slides/ is added after the build, so it is left out.
        navigateFallback: 'app.html',
        navigateFallbackDenylist: [/^\/$/, /^\/slides\//, /^\/(welcome|about)\//],
      },
    }),
  ],
  test: {
    // The generator tests make 1,000+ questions each: about 1.5s on a laptop, but four times that on
    // GitHub's runners, which tripped the 5s default and failed a deploy.
    testTimeout: 20_000,
  },
})
