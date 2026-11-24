// Wie ich ticke – Service Worker (offline). Schale zuerst aus dem Cache; eine Fassung pro Cache.
// Neue Fassung: V hochzählen (gleich VERSION in kern.js), dann `node test/sw-liste.mjs` – das schreibt DATEIEN und PRUEF neu.
// Beim Einrichten wird JEDE Datei gegen ihre Prüfsumme geprüft: liefert der Server (CDN-Cache) noch eine alte Datei,
// scheitert die Einrichtung und die alte Fassung bleibt aktiv (nie halbe Fassungen). Aktiv wird die neue erst auf Knopfdruck
// („Neue Fassung bereit – Jetzt laden“, Nachricht 'jetzt') oder wenn alle Fenster zu sind.
const V = '0.2.1';
const SCHALE = 'ticke-schale-' + V;
// ERZEUGT von test/sw-liste.mjs – nicht von Hand ändern
const DATEIEN = /*DATEIEN*/["./","./icon-180.png","./icon-192.png","./icon-512.png","./icon.svg","./index.html","./kern.js","./manifest.webmanifest","./mass.js","./module/bigfive/daten.js","./module/bigfive/modul.js","./module/bigfive/quellen.js","./module/bigfive/rechnen.js","./module/bigfive/stil.css","./module/bigfive/texte.js","./module/interessen/daten.js","./module/interessen/modul.js","./module/interessen/quellen.js","./module/interessen/rechnen.js","./module/interessen/stil.css","./module/liste.js","./module/passt/karte.js","./module/passt/modul.js","./module/passt/quellen.js","./module/passt/regeln.js","./module/passt/stil.css","./module/passt/texte.js","./module/spiel/daten.js","./module/spiel/modul.js","./module/spiel/quellen.js","./module/spiel/rechnen.js","./module/spiel/stil.css","./module/textspiegel/analyse.js","./module/textspiegel/modul.js","./module/textspiegel/quellen.js","./module/textspiegel/stil.css","./module/textspiegel/texte.js","./module/textspiegel/woerter.js","./module/training/modul.js","./module/training/plan.js","./module/training/quellen.js","./module/training/stil.css","./module/training/uebungen.js","./quellen.js","./seiten.js","./stil.css","./ui.js","./weg.js"]/*ENDE*/;
const PRUEF = /*PRUEF*/{"./":"e04a1fe226fd1a17","./icon-180.png":"c4028a01651041b5","./icon-192.png":"7a768a10be54438e","./icon-512.png":"2b022ff191aa8bae","./icon.svg":"7942ef2dee385c8b","./index.html":"e04a1fe226fd1a17","./kern.js":"a636ec7827b0e4d7","./manifest.webmanifest":"83be37ba18568a18","./mass.js":"013518dc45179c8f","./module/bigfive/daten.js":"0461baa76d815906","./module/bigfive/modul.js":"fafda3990399ed3c","./module/bigfive/quellen.js":"63f497935ce92768","./module/bigfive/rechnen.js":"c1d7727412acd754","./module/bigfive/stil.css":"7d1ba4d5818ba8c1","./module/bigfive/texte.js":"54ea4c7c1d7cd8fd","./module/interessen/daten.js":"178bb28cfc3e9f62","./module/interessen/modul.js":"3262e676b63e4787","./module/interessen/quellen.js":"c77d6905a333726c","./module/interessen/rechnen.js":"6ed032e06cd86b61","./module/interessen/stil.css":"c0d73bcb4ed5cd91","./module/liste.js":"446b349822217798","./module/passt/karte.js":"1d06d0daed549cd8","./module/passt/modul.js":"2e862700c4ba6eb8","./module/passt/quellen.js":"91112030e6dd54f0","./module/passt/regeln.js":"af552240efc407c3","./module/passt/stil.css":"aa70734e4f6c2488","./module/passt/texte.js":"5b4da6ad937ec786","./module/spiel/daten.js":"adc1fcbcd5a190c9","./module/spiel/modul.js":"b8442054f0ec5deb","./module/spiel/quellen.js":"2533354085c6d617","./module/spiel/rechnen.js":"ee04a320717068de","./module/spiel/stil.css":"d7418585c68b4757","./module/textspiegel/analyse.js":"8cd67b033ec1cf56","./module/textspiegel/modul.js":"511eeefd8224b391","./module/textspiegel/quellen.js":"466212126468fbeb","./module/textspiegel/stil.css":"522ea7464f320675","./module/textspiegel/texte.js":"a57b6835844004e2","./module/textspiegel/woerter.js":"f57dc47d62ca7711","./module/training/modul.js":"bfa9bb02f3b9fa32","./module/training/plan.js":"edb8255aed71a825","./module/training/quellen.js":"67c6a3392b34cfd8","./module/training/stil.css":"f6a250f5ce3b91e7","./module/training/uebungen.js":"efcc179a4b4a7f05","./quellen.js":"3e9ad5d95867a88c","./seiten.js":"07339be4c6271d2b","./stil.css":"d586f2e016ad927d","./ui.js":"02f90c29d4a64e4f","./weg.js":"b85ef6cb23fccbe2"}/*ENDE*/;
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
    for (const n of await caches.keys()) if (n.startsWith('ticke-schale-') && n !== SCHALE) await caches.delete(n);
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
    let r = await c.match(e.request, { ignoreSearch: true });
    // Unbekannte Seite im Bereich (z. B. …/ticke/gibts-nicht/): zur Startseite umleiten statt index.html unter falschem Pfad
    // (sonst zeigen die relativen Pfade ins Leere). Der #-Teil bleibt beim Umleiten erhalten.
    if (!r && e.request.mode === 'navigate' && (await c.match('./index.html'))) return Response.redirect(scope.href, 302);
    if (r) return r;
    try { return await fetch(e.request); }
    catch { return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
