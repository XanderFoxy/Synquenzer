// Atem – Service Worker (Muster foto/app/sw.js). Netz zuerst mit 2,5 s Zeitlimit, sonst Schale aus dem Cache.
// Versionswechsel: SCHALE und VERSION in app.js zusammen hochzählen (daten-test prüft das).
const SCHALE = 'atem-schale-v1';   // v1: 0.1.0
const DATEIEN = ['./', './index.html', './app.js', './symbole.js', './daten.js', './wissen.js', './plan.js', './uhr.js', './training.js',
  './sitzung.js', './fuehrung.js', './anatomie.js', './vorschau.js', './ton.js', './speicher.js', './manifest.webmanifest', './icon.svg', './icon-180.png',
  './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SCHALE).then((c) => Promise.all(DATEIEN.map((d) => c.add(new Request(d, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n.startsWith('atem-schale-') && n !== SCHALE).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
function mitZeit(p, ms) { return Promise.race([p, new Promise((_, f) => setTimeout(() => f(new Error('zeit')), ms))]); }
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(SCHALE);
    let r;
    try {
      r = await mitZeit(fetch(e.request), 2500);
      if (r.ok && r.type === 'basic') c.put(e.request, r.clone()).catch(() => {});
    } catch { r = await c.match(e.request, { ignoreSearch: true }); if (!r && e.request.mode === 'navigate') r = await c.match('./index.html'); }
    return r || new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
