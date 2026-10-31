/* „Mein Vorteil“: eigener Service Worker nur für /mein-vorteil/ (hat hier Vorrang vor dem SYNQUENZER-Worker im Wurzelordner).
   Seite: erst Netz; antwortet es nicht binnen 3 s oder gar nicht, die letzte gute Kopie (Start ohne Netz).
   Symbole/Manifest: aus dem Zwischenspeicher. Daten (raw.githubusercontent.com) gehen nie durch diesen Worker –
   die Seite merkt sich den letzten Stand selbst. */
const CACHE = 'mein-vorteil-1';
const SEITE = new URL('./', self.registration.scope).href;
const LANGSAM = 3000;
const STATISCH = /\/(icon-\d+\.png|icon\.svg|manifest\.webmanifest)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([SEITE, 'icon-192.png', 'icon.svg', 'manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('mein-vorteil-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const rq = e.request;
  if (rq.method !== 'GET') return;
  const u = new URL(rq.url), scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin || !u.pathname.startsWith(scope.pathname)) return;
  const rest = u.pathname.slice(scope.pathname.length);
  if (rq.mode === 'navigate' || rest === '' || rest === 'index.html') {
    let ablegen = Promise.resolve();
    const netz = fetch(rq).then(r => {
      if (r && r.ok && r.type === 'basic') { const k = r.clone(); ablegen = caches.open(CACHE).then(c => c.put(SEITE, k)).catch(() => {}); }
      return r;
    });
    const kopie = () => caches.open(CACHE).then(c => c.match(SEITE)).catch(() => undefined);
    e.respondWith(new Promise(fertig => {
      let erledigt = false;
      const gib = r => { if (!erledigt && r) { erledigt = true; fertig(r); } };
      const t = setTimeout(() => kopie().then(gib), LANGSAM);
      netz.then(r => { clearTimeout(t); gib(r); }, () => { clearTimeout(t); kopie().then(r => gib(r || Response.error())); });
    }));
    e.waitUntil(netz.then(() => ablegen, () => {}));
    return;
  }
  if (STATISCH.test(u.pathname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(rq).then(hit => hit || fetch(rq).then(r => { if (r && r.ok) c.put(rq, r.clone()).catch(() => {}); return r; }))));
  }
});
