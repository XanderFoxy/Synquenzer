// Weltküche – Service Worker.
// App-Schale (SCHALE) wird beim Installieren gespeichert. Die Kontinent-Daten (DATEN) erst, wenn sie
// gebraucht werden – in einem eigenen Speicher, der ein Update übersteht, damit einmal geöffnete Gerichte
// auch offline (z. B. in der Küche ohne Netz) gehen.
// Strategie: Netz zuerst (2,5 s Zeitlimit), sonst aus dem Speicher – so kommt eine neue Fassung sofort an.
// VERSION, SCHALE und DATEN trägt skripte/bau_app.py ein (Fassung + Prüfsumme). Nicht von Hand ändern:
// neue Fassung = FASSUNG in skripte/bau_app.py hochzählen und das Skript laufen lassen.
const VERSION = 'weltkueche-3-9f3c5ff4';
const SCHALE = ['./', './index.html', './stil.css', './app.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './daten/app/index.json'];
const DATEN = ['./daten/app/k-europa.json', './daten/app/k-asien.json', './daten/app/k-afrika.json', './daten/app/k-nordamerika.json', './daten/app/k-suedamerika.json', './daten/app/k-ozeanien.json'];
const PREFIX = 'weltkueche-';
const DATEN_SPEICHER = 'weltkueche-daten';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => Promise.all(SCHALE.map((d) => c.add(new Request(d, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((k) => Promise.all(k.filter((n) => n.startsWith(PREFIX) && n !== VERSION && n !== DATEN_SPEICHER).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});
function mitZeit(p, ms) { return Promise.race([p, new Promise((_, f) => setTimeout(() => f(new Error('zeit')), ms))]); }
const istDaten = (pfad) => DATEN.some((d) => pfad.endsWith(d.slice(1)));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // Quellen-Links usw.: nicht anfassen
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(istDaten(url.pathname) ? DATEN_SPEICHER : VERSION);
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
