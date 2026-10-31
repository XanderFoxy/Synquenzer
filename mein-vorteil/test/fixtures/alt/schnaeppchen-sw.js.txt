/* Schnäppchen-Seite: eigener Service Worker nur für /schnaeppchen/ (hat für diesen Pfad Vorrang vor dem SYNQUENZER-Worker).
   Seite: erst Netz, ohne Netz die letzte Kopie. Daten (raw.githubusercontent.com) gehen immer direkt ans Netz;
   die Seite merkt sich den letzten Stand selbst (localStorage). */
const CACHE = 'schnaeppchen-1';
const SEITE = new URL('./', self.registration.scope).href;
const STATISCH = /\/(icon-\d+\.png|manifest\.webmanifest)$/;
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll([SEITE, 'icon-192.png', 'manifest.webmanifest'])).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('schnaeppchen-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const rq = e.request; if (rq.method !== 'GET') return;
  const u = new URL(rq.url), scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin || !u.pathname.startsWith(scope.pathname)) return;
  if (rq.mode === 'navigate') {
    e.respondWith(fetch(rq).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(SEITE, c)).catch(() => {}); }
      return r;
    }).catch(() => caches.open(CACHE).then(ca => ca.match(SEITE)).then(r => r || Response.error())));
    return;
  }
  if (STATISCH.test(u.pathname)) e.respondWith(caches.open(CACHE).then(ca => ca.match(rq).then(hit => hit || fetch(rq))));
});
