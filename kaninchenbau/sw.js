// Kaninchenbau – Service Worker (offline). Schale zuerst aus dem Cache; eine Fassung pro Cache.
// Neue Fassung: V hochzählen (gleich VERSION in kern.js), dann `node test/sw-liste.mjs` – das schreibt DATEIEN und PRUEF neu.
// Beim Einrichten wird jede Datei gegen ihre Prüfsumme geprüft: liefert der Server (CDN-Cache) noch eine alte Datei,
// scheitert die Einrichtung und die alte Fassung bleibt aktiv (nie halbe Fassungen). Die neue wird erst auf Knopfdruck
// („Neue Fassung bereit – Jetzt laden“, Nachricht 'jetzt') aktiv oder wenn alle Fenster zu sind.
const V = '0.2.1';
const SCHALE = 'kaninchenbau-schale-' + V;
// ERZEUGT von test/sw-liste.mjs – nicht von Hand ändern
const DATEIEN = /*DATEIEN*/["./","./app.js","./auswertung.js","./icon-180.png","./icon-192.png","./icon-512.png","./icon.svg","./index.html","./inhalt.js","./kern.js","./lernen.js","./manifest.webmanifest","./profil.js","./seiten.js","./speicher.js","./stil.css","./wesen.js"]/*ENDE*/;
const PRUEF = /*PRUEF*/{"./":"0c85029ce766883f","./app.js":"6bd83ee449d0d32f","./auswertung.js":"e767b7f5c93f126b","./icon-180.png":"74a86ff5987d6cc3","./icon-192.png":"f8233ec3a01b66c3","./icon-512.png":"f54d77221ac64bb6","./icon.svg":"6b29919df397aa74","./index.html":"0c85029ce766883f","./inhalt.js":"568499fb6747bbc1","./kern.js":"9eb1008f09275a71","./lernen.js":"69e15365d36af12c","./manifest.webmanifest":"8cf24919f790a0a9","./profil.js":"d53b94d83855fc0f","./seiten.js":"8c2f7fa76f33ee26","./speicher.js":"8f6ff3115e230282","./stil.css":"1e04e58c013f8e1d","./wesen.js":"94cc232168162662"}/*ENDE*/;
const neu = (d) => new Request(d, { cache: 'reload' });
const summe = async (r) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()))].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const alle = await Promise.all(DATEIEN.map(async (d) => {
      const r = await fetch(neu(d));
      if (!r.ok || (await summe(r)) !== PRUEF[d]) throw new Error(d + ' ist nicht Fassung ' + V);
      return [d, r];
    }));
    const c = await caches.open(SCHALE);
    for (const [d, r] of alle) await c.put(d, r);
  })().catch(async (f) => { await caches.delete(SCHALE); throw f; }));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n.startsWith('kaninchenbau-schale-') && n !== SCHALE) await caches.delete(n);
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => { if (e.data === 'jetzt') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname) || url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(SCHALE);
    const r = await c.match(e.request, { ignoreSearch: true });
    if (r) return r;
    // Unbekannte Seite im Bereich: zur Startseite umleiten (relative Pfade stimmen sonst nicht). Der #-Teil bleibt erhalten.
    if (e.request.mode === 'navigate' && (await c.match('./index.html'))) return Response.redirect(scope.href, 302);
    try { return await fetch(e.request); }
    catch { return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
