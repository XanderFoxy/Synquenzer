/* „Mein Vorteil“: eigener Service Worker nur für /mein-vorteil/ (hat hier Vorrang vor dem SYNQUENZER-Worker im Wurzelordner).
   Seite, filme.js (Reiter „Filme“), spartricks.js (Reiter „Spartricks“) und essen.js (Reiter „Essen“): erst Netz; antwortet es nicht binnen 3 s oder
   gar nicht, die letzte gute Kopie (Start ohne Netz). So passen Seite und Reiter-Skripte nach einer neuen Fassung immer
   zusammen. spartricks.json und essen.json gehen nicht durch den Worker (die Seite merkt sich den letzten Stand selbst).
   Symbole/Manifest: aus dem Zwischenspeicher. Daten (raw.githubusercontent.com) gehen nie durch diesen Worker –
   die Seite merkt sich den letzten Stand selbst. */
const CACHE = 'mein-vorteil-3'; // 15.11.2026: Reiter „Essen“ (essen.js) – alte Kopie wird beim Aktivieren gelöscht (Fassung 5, 08.11.: mein-vorteil-2)
const SEITE = new URL('./', self.registration.scope).href;
const FILME = new URL('filme.js', self.registration.scope).href;
const SPAR = new URL('spartricks.js', self.registration.scope).href;
const ESSEN = new URL('essen.js', self.registration.scope).href;
const SKRIPTE = { 'filme.js': FILME, 'spartricks.js': SPAR, 'essen.js': ESSEN };
const LANGSAM = 3000;
const STATISCH = /\/(icon-\d+\.png|icon\.svg|manifest\.webmanifest)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([SEITE, 'filme.js', 'spartricks.js', 'essen.js', 'icon-192.png', 'icon.svg', 'manifest.webmanifest'])).catch(() => {}));
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
  const seite = rq.mode === 'navigate' || rest === '' || rest === 'index.html';
  if (seite || rest === 'filme.js' || rest === 'spartricks.js' || rest === 'essen.js') {
    const schluessel = seite ? SEITE : SKRIPTE[rest];
    let ablegen = Promise.resolve();
    const netz = fetch(rq).then(r => {
      if (r && r.ok && r.type === 'basic') { const k = r.clone(); ablegen = caches.open(CACHE).then(c => c.put(schluessel, k)).catch(() => {}); }
      return r;
    });
    const kopie = () => caches.open(CACHE).then(c => c.match(schluessel)).catch(() => undefined);
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
