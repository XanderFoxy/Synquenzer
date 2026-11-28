// Erfinder-Check – Service Worker. Macht App und alle Akten offline verfügbar.
// Strategie: Netz zuerst (2,5 s Zeitlimit), sonst aus dem Speicher – so kommt eine neue Fassung sofort an
// und die App startet trotzdem offline.
// VERSION und DATEIEN trägt skripte/bau_app.py ein (Fassung + Prüfsumme aller App-Dateien). Nicht von Hand ändern:
// neue Fassung = FASSUNG in skripte/bau_app.py hochzählen und das Skript laufen lassen.
const VERSION = 'erfinder-1-09149458';
const DATEIEN = ['./', './index.html', './stil.css', './app.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './daten/app/akten-alltag.json', './daten/app/akten-computer.json', './daten/app/akten-kommunikation.json', './daten/app/akten-licht.json', './daten/app/akten-medizin.json', './daten/app/akten-verkehr.json', './daten/app/akten-wissenschaft.json', './daten/app/register.json'];
const PREFIX = 'erfinder-';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => Promise.all(DATEIEN.map((d) => c.add(new Request(d, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((k) => Promise.all(k.filter((n) => n.startsWith(PREFIX) && n !== VERSION).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});
function mitZeit(p, ms) { return Promise.race([p, new Promise((_, f) => setTimeout(() => f(new Error('zeit')), ms))]); }
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // Quellen-Links usw.: nicht anfassen
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    try {
      const r = await mitZeit(fetch(e.request), 2500);
      if (r.ok && r.type === 'basic') c.put(e.request, r.clone()).catch(() => {});
      return r;
    } catch (err) {
      let r = await c.match(e.request, { ignoreSearch: true });
      if (!r && e.request.mode === 'navigate') r = await c.match('./index.html') || await c.match('./');
      return r || new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
