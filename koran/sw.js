// Koran im Faktencheck – Service Worker.
// Schale (App-Dateien + daten/index.json) wird beim Einrichten geladen und JEDE Datei gegen ihre Prüfsumme geprüft:
// liefert der Server (CDN-Cache bis 600 s) noch eine alte Datei, scheitert die Einrichtung, der alte Worker bleibt –
// so gibt es nie halbe Fassungen. Suren, Themen, Filter, Thesen, Suche werden erst beim Ansehen gespeichert
// (nur wenn die Prüfsumme stimmt). Dieser Daten-Cache bleibt über neue Fassungen hinweg erhalten: der Schlüssel
// enthält die Prüfsumme, darum werden nach einem Update nur geänderte Dateien neu geladen – alles andere bleibt offline.
// VERSION, SCHALE, PRUEF und DATEN trägt werkzeug/bau.py ein – nicht von Hand ändern.
// Neue Fassung: FASSUNG in werkzeug/bau.py hochzählen; bau.py IMMER als letzten Schritt laufen lassen.
const VERSION = 'koran-1.0-e67d3856';
const SCHALE = ["./", "./index.html", "./stil.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "./daten/index.json"];
const PRUEF = {"./":"3a0d3bfc97da6512","./index.html":"3a0d3bfc97da6512","./stil.css":"61491b2e91d87236","./app.js":"5eee26255f1d7dfc","./manifest.webmanifest":"5a4619b5b5929a85","./icon.svg":"d69f539a775aa9b4","./daten/index.json":"fd1546bcbb94babb"};
const DATEN = {"./daten/kategorien.json":"2a7b8c30ecc2c583","./daten/s/001.json":"4a52264d18cbf116","./daten/s/002.json":"0ce4c70d31e3e741","./daten/s/003.json":"ddcb51f1d3e9b41f","./daten/s/004.json":"7ef79bf090207eab","./daten/s/005.json":"58ff1b7fb7acf820","./daten/s/006.json":"2462258566e1feac","./daten/s/007.json":"36142e83f9954427","./daten/s/008.json":"f9403e1edfba398a","./daten/s/009.json":"8be6c1bf0a893c19","./daten/s/010.json":"90c57d7b4c31b773","./daten/s/011.json":"bb1515ec474f110a","./daten/s/012.json":"a53d6997ec64864f","./daten/s/013.json":"6ff222adf745c146","./daten/s/014.json":"489d6f8fdb1c3323","./daten/s/015.json":"08812e71205eef5a","./daten/s/016.json":"0f55dba2faf4c001","./daten/s/017.json":"b0170c4f7997d7c3","./daten/s/018.json":"a65e6d9b925c471f","./daten/s/019.json":"f7c20d4b48314afc","./daten/s/020.json":"3057d55b69877c8c","./daten/s/021.json":"ad370d7fcb8217d2","./daten/s/022.json":"028fae9fcf5ae35e","./daten/s/023.json":"80a900d64f92d3f4","./daten/s/024.json":"c2009a13d449fdc4","./daten/s/025.json":"2dc4a86847898996","./daten/s/026.json":"8c6ed7a4a5314743","./daten/s/027.json":"6b5dd44725f70af9","./daten/s/028.json":"6451076cdc22d5af","./daten/s/029.json":"190880ca6ccedc9f","./daten/s/030.json":"f2fbcb0508be186a","./daten/s/031.json":"9cd4881d2672ab15","./daten/s/032.json":"d49b82c70d326310","./daten/s/033.json":"63e5f9dd95694a6c","./daten/s/034.json":"c6da8191d652b23f","./daten/s/035.json":"89cab11f8d8f7f67","./daten/s/036.json":"83b6ddf27c562a48","./daten/s/037.json":"448bcb02ef0e0c4d","./daten/s/038.json":"d72c83a2c95c2826","./daten/s/039.json":"8158e1f0ea0cd640","./daten/s/040.json":"959fc61b8c1f8e2f","./daten/s/041.json":"587b601ca9753c71","./daten/s/042.json":"8c685357b1beedd2","./daten/s/043.json":"3d194e8a0a116c69","./daten/s/044.json":"ee8c1aa511b2c114","./daten/s/045.json":"e20cfdb78ac3a2e9","./daten/s/046.json":"af23361550a060d1","./daten/s/047.json":"b293a4109a383f71","./daten/s/048.json":"7a4d76396cba2993","./daten/s/049.json":"c938563be8db0a44","./daten/s/050.json":"cd49e1e6adcad065","./daten/s/051.json":"3cce36ea23446c2f","./daten/s/052.json":"0dde30624fa1329d","./daten/s/053.json":"b1de6db25ee24221","./daten/s/054.json":"46e8298fe9bfe765","./daten/s/055.json":"ca1c4610cba4d3fc","./daten/s/056.json":"6bc08b191a1358b0","./daten/s/057.json":"6bc7788eb5466cba","./daten/s/058.json":"89e17037ff81ad58","./daten/s/059.json":"439f5ab16448c021","./daten/s/060.json":"28fd27b057ede21e","./daten/s/061.json":"270b9abca13a5482","./daten/s/062.json":"c8d2629d095bc4df","./daten/s/063.json":"a3aeb0dfd2b0416a","./daten/s/064.json":"b61d36d215da8408","./daten/s/065.json":"b7eea9b9f4b9a23d","./daten/s/066.json":"8ce3abbb635b934e","./daten/s/067.json":"0b5261274ccd3bed","./daten/s/068.json":"2ddb0b16122dd57f","./daten/s/069.json":"6e99905f97fde5c3","./daten/s/070.json":"3bc750bffa15dd99","./daten/s/071.json":"d91f3c4777c41aca","./daten/s/072.json":"fe1d1f176d123274","./daten/s/073.json":"f1a81cb67e004333","./daten/s/074.json":"b2359d6133615707","./daten/s/075.json":"9e4b53e3cc6631d5","./daten/s/076.json":"9d0bcb7c5f5377e3","./daten/s/077.json":"c60a36b63ff358d6","./daten/s/078.json":"cb28d4fa76b2fc37","./daten/s/079.json":"2ad5c1d6b622c9c6","./daten/s/080.json":"cf75e897a5284fcd","./daten/s/081.json":"2c479dafb2c6fcf0","./daten/s/082.json":"71b496a1b1c207f8","./daten/s/083.json":"adc9cfbbc7464238","./daten/s/084.json":"25c4123f9591f270","./daten/s/085.json":"49851438a5d2c4e4","./daten/s/086.json":"99391547f5137ab8","./daten/s/087.json":"8aa24b98049d3183","./daten/s/088.json":"d14b72328790e410","./daten/s/089.json":"481496b05db52e11","./daten/s/090.json":"428a2ce763843282","./daten/s/091.json":"5c44f67ad7a00eab","./daten/s/092.json":"2f60ef0d8671561a","./daten/s/093.json":"e05a9e3d6a3c486b","./daten/s/094.json":"3099c86c74ed15c4","./daten/s/095.json":"a0898db50e9275dd","./daten/s/096.json":"eeb4aed4ba6d12f8","./daten/s/097.json":"02d45ffae941cdb9","./daten/s/098.json":"a6ca251196105a56","./daten/s/099.json":"8ed80f7753a407ff","./daten/s/100.json":"d0933e0c973af9d9","./daten/s/101.json":"a2c48e90e97b490f","./daten/s/102.json":"4c11a922297daf18","./daten/s/103.json":"608d68ad21c9dba3","./daten/s/104.json":"7d909ca6f2406bcc","./daten/s/105.json":"65a8183aa5f706fb","./daten/s/106.json":"8ba4c47c37b37e9a","./daten/s/107.json":"7f8368dee623881c","./daten/s/108.json":"b361d1327a846879","./daten/s/109.json":"9181809a896d1db4","./daten/s/110.json":"6a66c0a8f9735fc7","./daten/s/111.json":"656c74f7dad7e961","./daten/s/112.json":"6705af8af2b3746b","./daten/s/113.json":"555158953de1bb0d","./daten/s/114.json":"e437607f344487d2","./daten/suche-de.json":"4e8b49583ad0182f","./daten/themen/astrologie.json":"13963d402e432649","./daten/themen/entstehung.json":"a87f0e1ae845f623","./daten/themen/frauen_trauma.json":"59ea33945ca1d0b2","./daten/themen/geschichte.json":"85172e33a7477e24","./daten/themen/gewalt.json":"5e545046135f8c9e","./daten/themen/halal_haram.json":"22e8e41f71d64b64","./daten/themen/kaaba.json":"c54058a7d52b649b","./daten/themen/legenden.json":"4ffd88577ffac437","./daten/themen/psychologie.json":"e395a3935969c7ba","./daten/themen/schwein.json":"a1bba222fd96762c","./daten/themen/stellen.json":"5fac481bfe51973b","./daten/themen/struktur.json":"fa9b32fe0df703d6","./daten/themen/ueberlieferung.json":"6dcb4041e12507a2","./daten/themen/vorlaeufer.json":"c038e6f9b540d8b2","./daten/themen/wissenschaft.json":"3e91281d5ffc6f0f","./daten/themen/wunder.json":"4392a4da42f254f9","./daten/themen.json":"da833a97bdb2a2e6","./daten/thesen.json":"2a3dab96d47565d9"};
const PREFIX = 'koran-';
const DCACHE = PREFIX + 'daten';
const dkey = (rel) => rel + '?h=' + DATEN[rel];

const neu = (d) => new Request(d, { cache: 'reload' });
const summe = async (r) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()))]
  .slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const alle = await Promise.all(SCHALE.map(async (d) => {
      const r = await fetch(neu(d));
      if (!r.ok || (PRUEF[d] && (await summe(r)) !== PRUEF[d])) throw new Error(d + ' passt nicht zu ' + VERSION);
      return [d, r];
    }));
    const c = await caches.open(VERSION);
    for (const [d, r] of alle) await c.put(d, r);
    await self.skipWaiting();
  })().catch(async (f) => { await caches.delete(VERSION); throw f; }));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n.startsWith(PREFIX) && n !== VERSION && n !== DCACHE) await caches.delete(n);
    await self.clients.claim();
    // veraltete Datendateien (andere Prüfsumme) aus dem Daten-Cache räumen
    const gueltig = new Set(Object.keys(DATEN).map((d) => new URL(dkey(d), self.location).href));
    const dc = await caches.open(DCACHE);
    for (const k of await dc.keys()) if (!gueltig.has(k.url)) await dc.delete(k);
  })());
});

const offline = () => new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('/sw.js')) return;
  const basis = new URL('./', self.registration.scope).pathname;
  const rel = './' + url.pathname.slice(basis.length);
  e.respondWith((async () => {
    const schale = await caches.open(VERSION);
    let r = await schale.match(rel === './' ? './' : rel, { ignoreSearch: true });
    if (!r && e.request.mode === 'navigate') r = await schale.match('./index.html');
    if (r) return r;
    if (rel.startsWith('./daten/') && DATEN[rel]) {
      const dc = await caches.open(DCACHE);
      r = await dc.match(dkey(rel));
      if (r) return r;
      try {
        const n = await fetch(neu(rel));
        if (n.ok && (await summe(n)) === DATEN[rel]) e.waitUntil(dc.put(dkey(rel), n.clone()));
        return n;
      } catch (f) { return offline(); }
    }
    try { return await fetch(e.request); } catch (f) { return offline(); }
  })());
});
