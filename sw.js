/* Roll-Off Quoter service worker. BUMP CACHE on every deploy (keep in step
   with APP_VERSION in index.html) so the update banner fires. */
const CACHE = 'roq-v0.4';
const SHELL = './';

self.addEventListener('install', e => { /* wait, don't auto-skip — banner handles it */ });
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // network-first so a new deploy is picked up; fall back to cache offline
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const c = await caches.open(CACHE);
      c.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      return cached || caches.match(SHELL);
    }
  })());
});
