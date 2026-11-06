/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * GitHub Pages and the build's preview answer /about/ with public/about/index.html, but the dev server
 * answers any folder path with the app. Without this the landing page can't open on the dev server.
 */
const aboutInDev: Plugin = {
  name: 'about-in-dev',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.split('?')[0] === '/about/') req.url = '/about/index.html'
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works from any folder (GitHub Pages, a school server, a USB stick).
  base: './',
  plugins: [
    aboutInDev,
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'NMMS Prep: Mental Ability',
        short_name: 'NMMS Prep',
        description: 'Free offline practice for the NMMS MAT and SAT papers (Class 8).',
        start_url: './',
        scope: './',
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
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // The past papers are bundled into the app script, which passed the default 2 MiB with the fourth
        // paper. Anything over the limit is left out of the offline cache, so keep it above the script's size.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // The talk deck at /slides/ is added after the build; don't answer it with the app's index.html.
        navigateFallbackDenylist: [/\/slides\//],
      },
    }),
  ],
  test: {
    // The generator tests make 1,000+ questions each: about 1.5s on a laptop, but four times that on
    // GitHub's runners, which tripped the 5s default and failed a deploy.
    testTimeout: 20_000,
  },
})
