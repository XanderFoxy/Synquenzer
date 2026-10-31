/* Die Seite /vorteile/ ist umgezogen nach /mein-vorteil/ (eine Seite für Angebote, Vorteile und Konzerte).
   Dieser Worker ersetzt den alten: er löscht dessen Zwischenspeicher ('vorteile-…'), meldet sich ab und lädt offene
   Fenster neu. Ohne Worker kommt die Seite dann frisch aus dem Netz – und leitet sofort auf ../mein-vorteil/ weiter.
   Kein fetch-Handler: alles geht direkt ans Netz. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try { await self.clients.claim(); } catch {}
    const namen = await caches.keys();
    await Promise.all(namen.filter(n => n.startsWith('vorteile-')).map(n => caches.delete(n)));
    await self.registration.unregister();
    // nur Fenster dieses Ordners neu laden (andere Seiten derselben Adresse bleiben unberührt)
    const fenster = await self.clients.matchAll({ type: 'window' });
    for (const f of fenster) if (f.url.startsWith(self.registration.scope)) { try { await f.navigate(f.url); } catch {} }
  })());
});
