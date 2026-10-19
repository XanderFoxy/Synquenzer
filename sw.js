/* SYNQUENZER service worker (VO1, online.md §2.7): scope /Synquenzer/ only.
   index.html: network first, the last good copy from the cache when offline (reload without network starts the app).
   vendor/, fonts/, icons, manifest: cache first (file names carry the version). Nothing else is touched
   (Supabase, jsDelivr, Turnstile and every other host go straight to the network). */
const CACHE = 'synq-app-1', PAGE = new URL('./', self.registration.scope).href;
const STATIC = /\/(vendor\/supabase-js-[\d.]+\.umd\.js|fonts\/[a-z0-9-]+\.woff2|icon-\d+\.png|manifest\.webmanifest)$/;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(new Request(PAGE, {cache: 'reload'}))).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('synq-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const rq = e.request; if (rq.method !== 'GET') return;
  const u = new URL(rq.url), scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin || !u.pathname.startsWith(scope.pathname)) return;
  const rest = u.pathname.slice(scope.pathname.length);
  if (rq.mode === 'navigate' || rest === '' || rest === 'index.html') {
    e.respondWith(fetch(rq, {cache: 'no-store'}).then(r => {
      if (r && r.ok && r.type === 'basic') { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(PAGE, c)).catch(() => {}); }
      return r;
    }).catch(() => caches.open(CACHE).then(ca => ca.match(PAGE)).then(r => r || Response.error())));
    return;
  }
  if (STATIC.test(u.pathname)) {
    e.respondWith(caches.open(CACHE).then(ca => ca.match(rq).then(hit => hit || fetch(rq).then(r => { if (r && r.ok) ca.put(rq, r.clone()).catch(() => {}); return r; }))));
  }
});
