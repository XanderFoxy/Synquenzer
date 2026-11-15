// Bildwerk – Service Worker. App-Schale offline. Modelle NICHT hier (modelle.js / Cache 'bildwerk-modelle-v1').
// Strategie: Netz zuerst (mit 2,5 s Zeitlimit), sonst Schale aus dem Cache – so kommt eine neue Fassung sofort an
// und die App startet trotzdem offline. Versionswechsel: SCHALE hochzählen.
const SCHALE = 'bildwerk-schale-v4';
// KI-Laufzeit (WASM vom CDN, Version in der Adresse = unveränderlich): Cache zuerst – so läuft sie auch offline (modelle.sichereLaufzeit legt sie ab).
const LAUFZEIT = 'bildwerk-laufzeit-v1';
const istLaufzeit = (u) => /\/(@mediapipe\/tasks-vision|onnxruntime-web)@\d/.test(u.pathname);
const DATEIEN = ['./', './index.html', './app.js', './typen.js', './rpc.js', './gl.js', './regler.js', './looks.js',
  './analyse.js', './auswahl.js', './entfernen.js', './hoch.js', './batch.js', './zuschnitt.js', './modelle.js',
  './wk-rechnen.js', './wk-ki.js'];
// Stufe 2 (optional, erst nach Messung): COOP/COEP für WASM-Threads setzen.
const ISOLIEREN = false;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SCHALE).then((c) => Promise.all(DATEIEN.map((d) => c.add(new Request(d, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n.startsWith('bildwerk-schale-') && n !== SCHALE).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
function mitZeit(p, ms) { return Promise.race([p, new Promise((_, f) => setTimeout(() => f(new Error('zeit')), ms))]); }
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (istLaufzeit(url)) {
    e.respondWith((async () => {
      const c = await caches.open(LAUFZEIT), schl = url.origin + url.pathname, alt = await c.match(schl);
      if (alt) return alt;
      const r = await fetch(e.request); if (r.ok) c.put(schl, r.clone()).catch(() => {}); return r;
    })());
    return;
  }
  if (url.origin !== location.origin) return;   // Modelle (eigener Cache in modelle.js) und andere Hosts: nicht anfassen
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(SCHALE);
    let r;
    try {
      r = await mitZeit(fetch(e.request), 2500);
      if (r.ok && r.type === 'basic') c.put(e.request, r.clone()).catch(() => {});
    } catch { r = await c.match(e.request, { ignoreSearch: true }); if (!r && e.request.mode === 'navigate') r = await c.match('./index.html'); }
    if (!r) return new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    if (!ISOLIEREN || e.request.mode !== 'navigate') return r;
    const h = new Headers(r.headers); h.set('Cross-Origin-Opener-Policy', 'same-origin'); h.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
  })());
});
