// Atem – Service Worker. 0.1.4: Schale zuerst aus dem Cache (kein Warten aufs Netz nach dem Aktualisieren),
// eine Fassung pro Cache: neu nur über eine neue sw.js, die beim Einrichten JEDE Datei gegen ihre Prüfsumme prüft (PRUEF).
// Versionswechsel: SCHALE und VERSION in app.js zusammen hochzählen; nach jeder Änderung an app/: node test/sw-pruefsummen.mjs (daten-test prüft beides).
const SCHALE = 'atem-schale-v5';   // v5: 0.1.4
const V = '0.1.4';
const DATEIEN = ['./', './index.html', './app.js', './symbole.js', './daten.js', './wissen.js', './plan.js', './uhr.js', './training.js',
  './sitzung.js', './fuehrung.js', './anatomie.js', './vorschau.js', './ton.js', './speicher.js', './manifest.webmanifest', './icon.svg', './icon-180.png',
  './icon-192.png', './icon-512.png'];
// SHA-256, erste 16 Zeichen – ERZEUGT von test/sw-pruefsummen.mjs, nicht von Hand ändern
const PRUEF = {'./':'c0d0313c02671bfb', './index.html':'c0d0313c02671bfb', './app.js':'d7b4bfb2c6b37b88', './symbole.js':'efe2b54a94781395', './daten.js':'745481da2931ffaf', './wissen.js':'c936604a7f5e78d2', './plan.js':'e491b23a13b6abfc', './uhr.js':'bd85cbf3b5666388', './training.js':'354c65e339c6f68e', './sitzung.js':'be8d8ae0a91419f6', './fuehrung.js':'c30046c3d0586d58', './anatomie.js':'1c5da04ad2052d51', './vorschau.js':'c7e2d5cc96ab14c4', './ton.js':'e9321ba248518098', './speicher.js':'87c4e94cbe7a66e2', './manifest.webmanifest':'de4a2d00f5c421dd', './icon.svg':'300072b0d1558b2a', './icon-180.png':'7e9a7bb31569bcbe', './icon-192.png':'345935289c33d11f', './icon-512.png':'cde2cd0b942bef9d'};
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
  e.respondWith((async () => {
    const c = await caches.open(SCHALE);
    let r = await c.match(e.request, { ignoreSearch: true });
    if (!r && e.request.mode === 'navigate') r = await c.match('./index.html');
    if (r) return r;
    try { return await fetch(e.request); } catch { return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
