// Wie ich ticke – Service Worker (offline). Schale zuerst aus dem Cache; eine Fassung pro Cache.
// Neue Fassung: V hochzählen (gleich VERSION in kern.js), dann `node test/sw-liste.mjs` – das schreibt DATEIEN und PRUEF neu.
// Beim Einrichten wird JEDE Datei gegen ihre Prüfsumme geprüft: liefert der Server (CDN-Cache) noch eine alte Datei,
// scheitert die Einrichtung und die alte Fassung bleibt aktiv (nie halbe Fassungen). Aktiv wird die neue erst auf Knopfdruck
// („Neue Fassung bereit – Jetzt laden“, Nachricht 'jetzt') oder wenn alle Fenster zu sind.
const V = '0.3.0';
const SCHALE = 'ticke-schale-' + V;
// ERZEUGT von test/sw-liste.mjs – nicht von Hand ändern
const DATEIEN = /*DATEIEN*/["./","./antworten.js","./icon-180.png","./icon-192.png","./icon-512.png","./icon.svg","./index.html","./kern.js","./manifest.webmanifest","./mass.js","./module/bigfive/aeste.js","./module/bigfive/daten.js","./module/bigfive/modul.js","./module/bigfive/quellen.js","./module/bigfive/rechnen.js","./module/bigfive/stil.css","./module/bigfive/texte.js","./module/interessen/daten.js","./module/interessen/modul.js","./module/interessen/quellen.js","./module/interessen/rechnen.js","./module/interessen/stil.css","./module/interessen/texte.js","./module/liste.js","./module/muster/aeste.js","./module/muster/baum.js","./module/muster/fragen.js","./module/muster/kombis.js","./module/muster/modul.js","./module/muster/quellen.js","./module/muster/sammeln.js","./module/muster/stil.css","./module/muster/verbindungen.js","./module/passt/karte.js","./module/passt/modul.js","./module/passt/quellen.js","./module/passt/regeln.js","./module/passt/stil.css","./module/passt/texte.js","./module/spiel/aeste.js","./module/spiel/daten.js","./module/spiel/modul.js","./module/spiel/quellen.js","./module/spiel/rechnen.js","./module/spiel/stil.css","./module/textspiegel/aeste.js","./module/textspiegel/analyse.js","./module/textspiegel/modul.js","./module/textspiegel/quellen.js","./module/textspiegel/stil.css","./module/textspiegel/texte.js","./module/textspiegel/woerter.js","./module/training/aeste.js","./module/training/modul.js","./module/training/plan.js","./module/training/quellen.js","./module/training/stil.css","./module/training/uebungen.js","./quellen.js","./seiten.js","./stil.css","./ui.js","./weg.js"]/*ENDE*/;
const PRUEF = /*PRUEF*/{"./":"a2ba1b6bc4f16493","./antworten.js":"2d9692a65cf9aea3","./icon-180.png":"c4028a01651041b5","./icon-192.png":"7a768a10be54438e","./icon-512.png":"2b022ff191aa8bae","./icon.svg":"7942ef2dee385c8b","./index.html":"a2ba1b6bc4f16493","./kern.js":"d873429b37628f36","./manifest.webmanifest":"773008e4b887fd8c","./mass.js":"9805d7645b156a9e","./module/bigfive/aeste.js":"0ee2f22d17bb7787","./module/bigfive/daten.js":"b52cbeb621dd2dc7","./module/bigfive/modul.js":"701e098069336e28","./module/bigfive/quellen.js":"944ee44b9037f9a0","./module/bigfive/rechnen.js":"785b3d9dd7016ce6","./module/bigfive/stil.css":"bb289af5fec6735e","./module/bigfive/texte.js":"ac5b81938a94ee0b","./module/interessen/daten.js":"5722b40b49e33a4c","./module/interessen/modul.js":"c28387eab9bace88","./module/interessen/quellen.js":"2b67b4bbfd074724","./module/interessen/rechnen.js":"89200f1567bd47f5","./module/interessen/stil.css":"f017e0b2176c37de","./module/interessen/texte.js":"cb50fb746a692633","./module/liste.js":"39ae3b77b9c578d5","./module/muster/aeste.js":"bb875bf1c86622b6","./module/muster/baum.js":"03c9734aafcb3bf4","./module/muster/fragen.js":"7ecc4eb5c19affbd","./module/muster/kombis.js":"65063e5971197eaf","./module/muster/modul.js":"9e7637bdb0c55de2","./module/muster/quellen.js":"2f48c5fdc57de904","./module/muster/sammeln.js":"828d68a3a5914561","./module/muster/stil.css":"b220a265fb6f8b20","./module/muster/verbindungen.js":"3d24013e382bf265","./module/passt/karte.js":"da7db885eac8858e","./module/passt/modul.js":"9c594f0e6d564c39","./module/passt/quellen.js":"a848edae278d562f","./module/passt/regeln.js":"409b7fa8ab7988ee","./module/passt/stil.css":"a2de002a79afdff8","./module/passt/texte.js":"829971871accd830","./module/spiel/aeste.js":"ad41d3dc0f62d48b","./module/spiel/daten.js":"11131a45a77c76f2","./module/spiel/modul.js":"42dad59b6c28a9ff","./module/spiel/quellen.js":"66b2448fa3e09af5","./module/spiel/rechnen.js":"b7874a078e125e8a","./module/spiel/stil.css":"989d083cc737a5d7","./module/textspiegel/aeste.js":"4ba3c27f61957d0e","./module/textspiegel/analyse.js":"77c72bc20eafb778","./module/textspiegel/modul.js":"5e6f87fc088a2725","./module/textspiegel/quellen.js":"1f1b9628dedd6555","./module/textspiegel/stil.css":"aaa80cb5ec4d03ad","./module/textspiegel/texte.js":"64bdbdeb75d3e0c2","./module/textspiegel/woerter.js":"113433b38c078639","./module/training/aeste.js":"f9cdcda92bd21723","./module/training/modul.js":"e82fd8df274b8589","./module/training/plan.js":"73a0eb312381e4c1","./module/training/quellen.js":"4080b2672bca6515","./module/training/stil.css":"c6146d82657f792f","./module/training/uebungen.js":"332e8d764265ff90","./quellen.js":"7e920f855b966bbd","./seiten.js":"1166b42b719e53d8","./stil.css":"f9e6dc7b54b08913","./ui.js":"255dd4fbcfd1ce37","./weg.js":"068b5ab7842a9572"}/*ENDE*/;
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
