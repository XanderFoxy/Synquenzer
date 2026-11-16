// Feinschliff – Service Worker. Schale (App-Dateien) beim Einrichten in einen versionierten Cache; Inhalte (daten/*.json)
// „erst Cache, im Hintergrund auffrischen“; Audio erst Cache, sonst Netz (nur vollständige 200 ablegen). Navigation offline → index.html.
// 0.3.0: Nach dem Einrichten holt der Worker im Hintergrund alle Übungs- und Text-Dateien (JSON, ca. 0,3 MB gzip) in den Cache,
// damit Heute, Quiz und jedes Thema offline laufen. Die Startseite wird dadurch nicht langsamer (läuft nach dem Laden).
// Audio bleibt bei Bedarf (erstes Abspielen) oder über „Alles offline speichern“ in Mehr.
// 0.4.0: wuensche.js (Wünsche-Kanal zu Claude) und neu.json („Neu in dieser Version“) gehören zur Schale – neu.json kommt so mit jeder Version frisch.
// 0.5.0: keine Eintipp-Übungen mehr (Ergänzen → Auswählen/Sortieren/Zuordnen) – neuer Daten-Cache fs-daten-v3, damit keine alten Übungsdateien aus dem Zwischenspeicher kommen.
// Anfragen an die Datenbank (anderer Ursprung) gehen nie durch den Worker. Ab 0.4.0 lädt die App nach einem Wechsel des Workers
// beim nächsten Seitenwechsel neu (app.js), damit nie alte und neue Module gemischt laufen.
// Neue Fassung: VERSION hochzählen (und in app.js), dann lädt der nächste Start die Schale neu.
const VERSION = '0.5.0';
const SCHALE = 'fs-schale-' + VERSION, DATEN = 'fs-daten-v3', AUDIO = 'fs-audio-v1';
const DATEIEN = ['./', './index.html', './app.css', './app.js', './speicher.js', './daten.js', './symbole.js', './pruefen.js', './wiederholung.js', './konto.js',
  './ueben.js', './block.js', './hoeren.js', './lesen.js', './quiz.js', './pruefung.js', './schreiben.js', './fortschritt.js', './wortschatz.js', './links.js',
  './erinnerung.js', './wuensche.js', './wunsch-link.js', './wuensche.css', './neu.json', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './daten/index.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SCHALE).then((c) => c.addAll(DATEIEN.map((d) => new Request(d, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => (k.startsWith('fs-schale-') && k !== SCHALE) || (k.startsWith('fs-daten-') && k !== DATEN)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
  e.waitUntil(datenVorladen().catch(() => {}));
});
async function datenVorladen() {   // alle JSON-Dateien aus dem Index, je eine Anfrage nach der anderen (schont schwache Verbindungen)
  const c = await caches.open(DATEN); const basis = new URL('./daten/', self.registration.scope);
  const r = await fetch(new URL('index.json', basis), { cache: 'no-cache' }); if (!r.ok) return; const idx = await r.clone().json(); await c.put(new URL('index.json', basis).href, r);
  const pfade = new Set(['ressourcen.json', 'vorlagen.json']);
  for (const l of Object.values(idx.bereiche || {})) for (const e of l) { if (e.datei) pfade.add(e.datei); if (e.uebungen_datei) pfade.add(e.uebungen_datei); }
  for (const s of Object.values(idx.sammlungen || {})) if (s.datei) pfade.add(s.datei);
  for (const p of pfade) { const u = new URL(p, basis).href; if (await c.match(u)) continue; try { const a = await fetch(u); if (a.ok) await c.put(u, a); } catch { /* später beim Öffnen */ } }
}
async function datenHolen(e) {   // erst Cache (schnell, offline), im Hintergrund vom Netz auffrischen
  const c = await caches.open(DATEN); const alt = await c.match(e.request);
  const neu = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
  if (alt) { e.waitUntil(neu); return alt; }
  return (await neu) || (await caches.match(e.request)) || new Response('{"fehler":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
}
async function audioHolen(e) {
  const c = await caches.open(AUDIO); const alt = await c.match(e.request); if (alt) return alt;
  const r = await fetch(e.request); if (r.status === 200) e.waitUntil(c.put(e.request, r.clone())); return r;
}
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (e.request.headers.has('range')) return;
  if (/\/daten\/.*\.json$/.test(u.pathname)) return e.respondWith(datenHolen(e));
  if (/\.(mp3|m4a|ogg|wav)$/.test(u.pathname)) return e.respondWith(audioHolen(e));
  if (e.request.mode === 'navigate') return e.respondWith(caches.match('./index.html').then((r) => r || fetch(e.request)).catch(() => caches.match('./index.html')));
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((n) => { if (n.ok && u.pathname.match(/\.(js|css|svg|png|webmanifest)$/)) { const k = n.clone(); caches.open(SCHALE).then((c) => c.put(e.request, k)); } return n; })));
});
