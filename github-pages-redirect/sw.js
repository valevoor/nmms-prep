// Replaces the app's service worker on the old GitHub Pages address. The old one answers every visit
// from its offline copy, so without this, returning students would keep the old app and never reach
// the redirect. When the app next checks for an update it installs this file, which deletes the
// offline copy, removes itself and reloads open pages, which then get the redirect to mystudyprep.in.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) await caches.delete(name)
      await self.registration.unregister()
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
    })(),
  )
})
