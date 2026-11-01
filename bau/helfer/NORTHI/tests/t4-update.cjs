// T4: Hinweis „Neue Version x.y.z – Tippen zum Laden“. Zwei Fassungen: die laufende (4.30.0, über http://localhost ausgeliefert) und eine
// neuere im Cache 'synq-app-1' (so legt sw.js die Antwort des Netzes ab, wenn die App nach 3 s aus dem Cache gestartet ist).
const H = require('./h.cjs');
const URL0 = 'http://localhost:8765/Synquenzer/';
const put = (p, ver, etag) => p.evaluate(async ([ver, etag, url]) => {
  const txt = '<!doctype html><title>SYNQUENZER</title><script>\nconst VERSION = \'g9b-v-1\';\nconst VERSION = \'' + ver + '\';\n</script>';
  const ca = await caches.open('synq-app-1'); await ca.put(url, new Response(txt, {headers: {'content-type': 'text/html', etag}})); return true;
}, [ver, etag, URL0]);
const hint = p => p.evaluate(() => { const e = document.querySelector('.ndiupd'); return e ? e.textContent : null; });
(async () => {
  const b = await H.browser();
  // 1) ohne Cache-Eintrag / gleiche / ältere Fassung: kein Hinweis
  const p = await H.page(b, {url: URL0});
  H.ok(await p.evaluate(() => typeof caches !== 'undefined'), 'Cache Storage verfügbar (http://localhost)');
  H.ok(await p.evaluate(() => window.SYNQUENZER.ndiUpdCheck(true)) === null && !(await hint(p)), 'kein Cache-Eintrag: kein Hinweis');
  await put(p, '4.30.0', '"a"'); H.ok(await p.evaluate(() => window.SYNQUENZER.ndiUpdCheck(true)) === '4.30.0' && !(await hint(p)), 'gleiche Fassung im Cache: kein Hinweis');
  await put(p, '4.29.9', '"b"'); H.ok(await p.evaluate(() => window.SYNQUENZER.ndiUpdCheck(true)) === '4.29.9' && !(await hint(p)), 'ältere Fassung im Cache: kein Hinweis');
  // 2) neuere Fassung: Hinweis
  await put(p, '4.31.0', '"c"'); await p.evaluate(() => window.SYNQUENZER.ndiUpdCheck());
  const h1 = await hint(p);
  H.ok(h1 && h1.includes('Neue Version 4.31.0 – Tippen zum Laden'), 'neuere Fassung im Cache: Hinweis erscheint', h1);
  const box = await p.evaluate(() => { const r = document.querySelector('.ndiupd .ndiupd-go').getBoundingClientRect(), x = document.querySelector('.ndiupd .ndiupd-x').getBoundingClientRect(); return {h: r.height, xw: x.width, xh: x.height, top: r.top}; });
  H.ok(box.h >= 44 && box.xw >= 44 && box.xh >= 44, 'Hinweis: Tippen und ✕ >= 44 px', box);
  await H.shot(p, 'p428-update-hinweis');
  await p.evaluate(() => window.SYNQUENZER.openMenu('info')); await p.waitForTimeout(300);
  const vr = await p.evaluate(() => { const r = [...document.querySelectorAll('.irow')].find(r => r.querySelector('.lbl').textContent === 'Version'); return r ? r.lastElementChild.textContent : null; });
  H.ok(vr && vr.includes('neue Version 4.31.0'), 'Menü → Version nennt die neue Fassung', vr);
  await p.evaluate(() => window.SYNQUENZER.closeMenu());
  // 3) Tippen: erst sichern, dann neu laden – die Änderung ist danach da
  await p.evaluate(() => window.SYNQUENZER.setKit('accent', 0.93));
  const nav = p.waitForEvent('load', {timeout: 15000});
  await H.tap(p, '.ndiupd .ndiupd-go');
  await nav; await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await p.waitForTimeout(1500);
  const acc = await p.evaluate(() => window.SYNQUENZER.project().tracks[4].sound.p.kit.accent);
  H.ok(Math.abs(acc - 0.93) < 1e-9, 'nach dem Neuladen: Änderung gesichert (Akzent 0,93)', acc);
  // 4) automatisch: beim Start (nach 4 s) ohne Zutun
  await p.waitForTimeout(4000);
  const h2 = await hint(p);
  H.ok(h2 && h2.includes('4.31.0'), 'nach dem Start: Hinweis kommt von selbst (4 s)', h2);
  // 5) ✕: weg und bleibt weg
  await H.tap(p, '.ndiupd .ndiupd-x');
  await p.evaluate(() => window.SYNQUENZER.ndiUpdCheck(true));
  H.ok(!(await hint(p)), '✕: Hinweis weg, kommt in dieser Sitzung nicht wieder');
  H.ok(p.errs.length === 0, 'keine Seitenfehler', p.errs);
  await H.closePage(p);
  // 6) file:// (kein Cache Storage): still, kein Fehler
  const q = await H.page(b);
  H.ok(await q.evaluate(() => window.SYNQUENZER.ndiUpdCheck(true)) === null && q.errs.length === 0, 'file://: keine Prüfung, kein Fehler');
  await H.closePage(q);
  await b.close(); H.done('T4 Update');
})().catch(e => { console.error(e); process.exit(2); });
