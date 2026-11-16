// Mischpult – Service Worker (Muster wie atem/sw.js): Schale zuerst aus dem Cache, eine Fassung je Cache.
// Neu nur über eine neue sw.js, die beim Einrichten JEDE Datei gegen ihre Prüfsumme prüft (nie halbe Fassungen).
// Nach jeder Änderung in app/: node test/sw-pruefsummen.mjs (schreibt DATEIEN und PRUEF neu). Fremde Hosts werden nie angefragt.
const SCHALE = 'mischpult-schale-v2';
const V = '0.2.0';
// ERZEUGT von test/sw-pruefsummen.mjs – nicht von Hand ändern
const DATEIEN = ["./","./ablauf.js","./album-ui.js","./analyse.js","./dsp/imp1.js","./fingerabdruck.js","./hilfe.js","./index.html","./kern.js","./master.js","./messen.js","./messwerte-worker.js","./mischpult.webmanifest","./mix.js","./regeln.js","./render-worker.js","./rezept.js","./senden.js","./ui.js","./wav.js","./zeichen-180.png","./zeichen-192.png","./zeichen-512.png","./zeichen.svg","./zip.js"];
const PRUEF = {"./":"ae02837f2888262e","./ablauf.js":"c74b4d00e80a141d","./album-ui.js":"17ac4172511593de","./analyse.js":"b62e52d2a4bb2212","./dsp/imp1.js":"a341a4b0a5558f10","./fingerabdruck.js":"dbe0c8b5a34ce302","./hilfe.js":"682a65fcd27ac28b","./index.html":"ae02837f2888262e","./kern.js":"569db1de17267d25","./master.js":"633a341a41e1594c","./messen.js":"91ab36dc5aa0c4cb","./messwerte-worker.js":"3c52472e46aa6f92","./mischpult.webmanifest":"6a1fb0328c0d375b","./mix.js":"28276442cefbf4e5","./regeln.js":"83824093077c7dcd","./render-worker.js":"9efda99af63219f0","./rezept.js":"add5ef1ac431ddd6","./senden.js":"eb0150d6e06122be","./ui.js":"82d732e9f91d1339","./wav.js":"213842c790af14b0","./zeichen-180.png":"6291d0a6ad78649b","./zeichen-192.png":"670cc5b541f7f10d","./zeichen-512.png":"486a4828bd682c4c","./zeichen.svg":"d491ad55a4bb07e8","./zip.js":"a9eed586479d6ae4"};
const neu = (d) => new Request(d, { cache: 'reload' });
const summe = async (r) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()))].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const alle = await Promise.all(DATEIEN.map(async (d) => { const r = await fetch(neu(d)); if (!r.ok || (await summe(r)) !== PRUEF[d]) throw new Error(d + ' ist nicht ' + V); return [d, r]; }));
    const c = await caches.open(SCHALE);
    for (const [d, r] of alle) await c.put(d, r);
    await self.skipWaiting();
  })().catch(async (f) => { await caches.delete(SCHALE); throw f; }));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n.startsWith('mischpult-schale-') && n !== SCHALE) await caches.delete(n);
    await self.clients.claim();
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
