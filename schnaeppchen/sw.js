/* Die Seite /schnaeppchen/ ist umgezogen nach /mein-vorteil/ (eine Seite für Angebote, Vorteile und Konzerte).
   Dieser kleine Worker bleibt bewusst angemeldet: Solange er den Ordner /schnaeppchen/ übernimmt, sieht der SYNQUENZER-Worker im
   Wurzelordner diese Adressen nie – sonst würde er die Weiterleitung als Offline-Kopie des Synthesizers speichern.
   Er löscht den alten Zwischenspeicher ('schnaeppchen-…'), lädt offene Fenster neu und gibt Seitenaufrufe ans Netz weiter
   (dort leitet index.html auf Mein Vorteil weiter). Ohne Netz antwortet er selbst mit derselben Weiterleitung.
   Alles andere (Symbole, Daten) geht direkt ans Netz. */
const ZIEL = new URL('../mein-vorteil/', self.registration.scope).pathname;
const WEITER = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mein Vorteil</title>
<script>var r = 'angebote'; location.replace(${JSON.stringify(ZIEL)} + '?von=schnaeppchen#' + r);</script></head><body><p><a href="${ZIEL}#angebote">Mein Vorteil öffnen</a></p></body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const alt = (await caches.keys()).filter(n => n.startsWith('schnaeppchen-'));
    await Promise.all(alt.map(n => caches.delete(n)));
    try { await self.clients.claim(); } catch {}
    // Nur nach dem Wechsel von der alten Seite: offene Fenster dieses Ordners (alte Seite aus dem alten Zwischenspeicher)
    // neu laden -> Weiterleitung. Frisch von der Weiterleitung angemeldet (kein alter Speicher): nichts neu laden.
    if (!alt.length) return;
    // nicht abwarten: die neue Seite holt dieser Worker selbst, und das geht erst nach dem Aktivieren
    const fenster = await self.clients.matchAll({ type: 'window' });
    for (const f of fenster) if (f.url.startsWith(self.registration.scope)) f.navigate(f.url).catch(() => {});
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(WEITER, { headers: { 'content-type': 'text/html; charset=utf-8' } })));
});
