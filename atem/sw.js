// Atem – Service Worker. 0.1.4: Schale zuerst aus dem Cache (kein Warten aufs Netz nach dem Aktualisieren),
// eine Fassung pro Cache: neu nur über eine neue sw.js, die beim Einrichten JEDE Datei gegen ihre Prüfsumme prüft (PRUEF).
// Versionswechsel: SCHALE und VERSION in app.js zusammen hochzählen; nach jeder Änderung an app/: node test/sw-pruefsummen.mjs (daten-test prüft beides).
const SCHALE = 'atem-schale-v7';   // v7: 0.1.6 (Stimme + Meditation), v6 = 0.1.5
const V = '0.1.6';   // 016
// 016: + stimme.js, meditation.js, meditation-seite.js; Audio stimme/… NICHT (eigener Cache atem-stimme-v1, lädt bei Bedarf)
const DATEIEN = ['./', './index.html', './app.js', './symbole.js', './daten.js', './wissen.js', './plan.js', './uhr.js', './training.js',
  './sitzung.js', './fuehrung.js', './anatomie.js', './vorschau.js', './ton.js', './musik.js', './speicher.js', './manifest.webmanifest', './icon.svg', './icon-180.png',
  './icon-192.png', './icon-512.png',
  './stimme.js', './meditation.js', './meditation-seite.js'];
// SHA-256, erste 16 Zeichen – ERZEUGT von test/sw-pruefsummen.mjs, nicht von Hand ändern
const PRUEF = {'./':'c6a7d0f1e666ef7d', './index.html':'c6a7d0f1e666ef7d', './app.js':'b56724eb98ff0ce8', './symbole.js':'9db8e66221ca81bd', './daten.js':'306bb5ab261a5f82', './wissen.js':'1161763c05ab2ad4', './plan.js':'43babcbde603722b', './uhr.js':'bd85cbf3b5666388', './training.js':'354c65e339c6f68e', './sitzung.js':'1ecedfef490100c6', './fuehrung.js':'c30046c3d0586d58', './anatomie.js':'ec855eea6366ed16', './vorschau.js':'c7e2d5cc96ab14c4', './ton.js':'d1b025873181ff1b', './musik.js':'bee2f65b966f967e', './speicher.js':'f5dfbd78f65fcb21', './manifest.webmanifest':'de4a2d00f5c421dd', './icon.svg':'300072b0d1558b2a', './icon-180.png':'7e9a7bb31569bcbe', './icon-192.png':'345935289c33d11f', './icon-512.png':'cde2cd0b942bef9d', './stimme.js':'0d0fd922e907ce08', './meditation.js':'3f3458cae6411ede', './meditation-seite.js':'9fe09a86ded8a43f'};
// 016 Anfang: Stimmen (stimme/<sp>/…) in einem eigenen Cache – nie in der Schale (die wird bei jedem Versionswechsel gelöscht).
// Dateien mit Hash im Namen: erst Cache, sonst Netz, nur vollständige 200 ablegen; *.json: erst Netz, offline aus dem Cache;
// Range-Anfragen nicht abfangen. speicher.allesLoeschen() löscht atem-stimme-* mit (alle atem-* außer der Schale).
const STIMME = 'atem-stimme-v1';
async function stimme(e, url) {
  const c = await caches.open(STIMME);
  if (/\.[0-9a-f]{8}\.mp3$/.test(url.pathname)) {
    const r = await c.match(e.request); if (r) return r;
    const n = await fetch(e.request); if (n.status === 200 && !n.redirected) e.waitUntil(c.put(e.request, n.clone())); return n;
  }
  try { const n = await fetch(e.request, { cache: 'no-cache' }); if (n.status === 200) e.waitUntil(c.put(e.request, n.clone())); return n; }
  catch { const r = await c.match(e.request); return r || new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
}
// 016 Ende
const neu = (d) => new Request(d, { cache: 'reload' });
const summe = async (r) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()))].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    // Fassungs-Prüfung je Datei: liefert der Server (CDN-Cache, bis 600 s) noch EINE alte Datei, scheitert die Einrichtung;
    // der alte Worker bleibt, nächster Versuch beim nächsten Öffnen. Erst wenn alle stimmen, kommt alles in den Cache (nie halbe Fassungen).
    const alle = await Promise.all(DATEIEN.map(async (d) => { const r = await fetch(neu(d)); if (!r.ok || (await summe(r)) !== PRUEF[d]) throw new Error(d + ' ist nicht ' + V); return [d, r]; }));
    const c = await caches.open(SCHALE);
    for (const [d, r] of alle) await c.put(d, r);
    await self.skipWaiting();
  })().catch(async (f) => { await caches.delete(SCHALE); throw f; }));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n.startsWith('atem-schale-') && n !== SCHALE) await caches.delete(n);
    await self.clients.claim();
    for (const k of await self.clients.matchAll({ type: 'window' })) k.postMessage({ atem: V });   // Seiten mit anderer Fassung laden neu (app.js)
  })());
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('/sw.js')) return;
  if (url.pathname.includes('/stimme/')) { if (!e.request.headers.has('range')) e.respondWith(stimme(e, url)); return; }   // 016
  e.respondWith((async () => {
    const c = await caches.open(SCHALE);
    let r = await c.match(e.request, { ignoreSearch: true });
    if (!r && e.request.mode === 'navigate') r = await c.match('./index.html');
    if (r) return r;
    try { return await fetch(e.request); } catch { return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
