// UPD-Test (OFFEN-1611 A6): lädt ein Update die Seite zweimal, wenn der Rand-Zwischenspeicher (CDN) die normale Adresse noch alt liefert?
// node upd-test2.mjs <html> <szenario>      (NOSW=1: ohne Service-Worker; ETQ=1: ?v= mit eigenen ETag/Last-Modified wie Prüfer-Fall;
//   N2WAIT=ms: Wartezeit beim nächsten Start). Prüfung: zusätzlich kopie8s = Seiten-Kopie des Service-Workers 8 s nach dem Anstoß.
// Server wie GitHub Pages: gzip (Content-Encoding), ETag W/"…", Last-Modified je Fassung, Cache-Control max-age=600, HEAD, 304.
// Rand-Zwischenspeicher: die normale Adresse /Synquenzer/ liefert in „alt“/„kurz“ noch die alte Fassung; Adressen mit ?v=/?t=
// (eigener Schlüssel) kommen frisch vom Ursprung. Gesendet wird in 64-KB-Stücken je 4 ms; gezählt wird, was wirklich rausging.
//  ok   : alles sofort neu
//  kurz : normale Adresse noch 20 s alt (typische Nachlaufzeit nach dem Hochladen), dann neu
//  alt  : normale Adresse bleibt während des ganzen Updates alt; erst danach (vor dem nächsten Start) neu
// Phase 2 „nächster Start“: neue Seite (neue Sitzung wie ein Start vom Home-Bildschirm) an der normalen Adresse, 10 s warten
// (VW prüft nach 4 s); was dabei noch geladen wird, zählt mit.
import http from 'http'; import fs from 'fs'; import crypto from 'crypto'; import zlib from 'zlib'; import { chromium } from 'playwright';
const [, , HTML, SZ = 'ok'] = process.argv;
const src = fs.readFileSync(HTML, 'utf8'), SW = fs.readFileSync(new URL('./sw-online.js', import.meta.url));
const OLD = (/const VERSION = '(\d+\.\d+\.\d+)';/.exec(src) || [])[1]; if (!OLD) throw new Error('VERSION fehlt');
const NEW = OLD.replace(/\d+$/, d => String(+d + 1));
const mk = (txt, lm) => { const raw = Buffer.from(txt), gz = zlib.gzipSync(raw, {level: 6}); return {gz, et: 'W/"' + crypto.createHash('md5').update(raw).digest('hex').slice(0, 16) + '"', lm}; };
const page = {[OLD]: mk(src, new Date(Date.now() - 3600e3).toUTCString()), [NEW]: mk(src.replace(`const VERSION = '${OLD}';`, `const VERSION = '${NEW}';`), new Date(Date.now() - 60e3).toUTCString())};
const GZ = page[NEW].gz.length;
let verQ = OLD, verJ = OLD, plainNew = false, staleUntil = 0; const log = []; const T0 = Date.now();
const plainVer = () => (plainNew && Date.now() >= staleUntil) ? NEW : OLD;
const body = (r, b, e) => {
  let off = 0, sent = 0, closed = false; const CH = 65536;
  r.on('close', () => { closed = true; e.sent = sent; e.ganz = off >= b.length && sent >= b.length; });
  const pump = () => { if (closed) return; if (off >= b.length) { r.end(); return; } const c = b.subarray(off, off + CH); off += c.length; r.write(c, err => { if (!err) sent += c.length; }); setTimeout(pump, 4); };
  pump();
};
const srv = http.createServer((q, r) => {
  const [u, qs] = q.url.split('?');
  if (u === '/Synquenzer/' || u === '/Synquenzer/index.html') {
    const v = qs ? verQ : plainVer(), pg0 = page[v];
    const pg = (process.env.ETQ && qs) ? {gz: pg0.gz, et: pg0.et.replace(/"$/, 'q"'), lm: new Date(Date.parse(pg0.lm) + 1000).toUTCString()} : pg0;   // ETQ
    const e = {t: Date.now() - T0, m: q.method, url: q.url, ver: v, mode: q.headers['sec-fetch-mode'], cc: q.headers['cache-control'] || '', inm: !!q.headers['if-none-match'], sent: 0};
    const h = {'content-type': 'text/html; charset=utf-8', 'content-encoding': 'gzip', vary: 'Accept-Encoding', 'cache-control': 'max-age=600', etag: pg.et, 'last-modified': pg.lm};
    if (q.headers['if-none-match'] === pg.et || (!q.headers['if-none-match'] && q.headers['if-modified-since'] === pg.lm)) { log.push(Object.assign(e, {st: 304})); r.writeHead(304, {etag: pg.et, 'last-modified': pg.lm, 'cache-control': 'max-age=600'}); return r.end(); }
    if (q.method === 'HEAD') { log.push(Object.assign(e, {st: 200})); r.writeHead(200, Object.assign({'content-length': pg.gz.length}, h)); return r.end(); }
    log.push(Object.assign(e, {st: 200})); r.writeHead(200, Object.assign({'content-length': pg.gz.length}, h)); return body(r, pg.gz, e);
  }
  if (u === '/Synquenzer/sw.js') { r.writeHead(200, {'content-type': 'text/javascript', 'cache-control': 'max-age=600'}); return r.end(SW); }
  if (u === '/Synquenzer/version.json') { log.push({t: Date.now() - T0, m: q.method, url: q.url, ver: verJ, st: 200, sent: 0}); r.writeHead(200, {'content-type': 'application/json', 'cache-control': 'max-age=600'}); return r.end(JSON.stringify({version: verJ})); }
  r.writeHead(404); r.end();
});
await new Promise(res => srv.listen(0, '127.0.0.1', res));
const URL0 = `http://127.0.0.1:${srv.address().port}/Synquenzer/`;
const dir = fs.mkdtempSync(new URL('./prof-', import.meta.url).pathname);
const ctx = await chromium.launchPersistentContext(dir, {viewport: {width: 428, height: 926}, isMobile: true, hasTouch: true});
const errs = [];
const bereit = p => p.waitForFunction(() => document.getElementById('app') && !document.getElementById('app').classList.contains('loading') && typeof VERSION !== 'undefined', null, {timeout: 120000});
const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto(URL0); await bereit(p);
if (!process.env.NOSW) await p.evaluate(() => navigator.serviceWorker.register('sw.js', {scope: '/Synquenzer/'}).then(() => navigator.serviceWorker.ready)).catch(e => errs.push('sw ' + e));
await p.waitForTimeout(1500); await p.reload(); await bereit(p); await p.waitForTimeout(6000);
const swCtl = await p.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
const n0 = log.length;
// Hochladen: version.json und ?v= sofort neu; normale Adresse je Szenario
verJ = NEW; verQ = NEW; plainNew = true; staleUntil = SZ === 'ok' ? 0 : SZ === 'kurz' ? Date.now() + 20000 : Infinity;
let tNav = 0; p.on('framenavigated', f => { if (f === p.mainFrame() && !tNav) tNav = Date.now(); });
const nav = p.waitForEvent('framenavigated', {timeout: 150000}).catch(() => null);
const tAus = Date.now();
await p.evaluate(() => { VW.t = 0; vwCheck(true); });
let kopie8s = 'nav';
setTimeout(async () => { if (tNav) return; try { kopie8s = await p.evaluate(async () => { const ks = (await caches.keys()).filter(k => /^synq-app-/.test(k)); let r = null; for (const k of ks) r = r || await (await caches.open(k)).match(location.origin + location.pathname.replace(/[^/]*$/, '')); return {caches: ks, seite: !!r, ref: typeof UPD !== 'undefined' ? !!UPD.ref : 'kein UPD', last: typeof UPD !== 'undefined' ? UPD.last : null}; }); } catch (e) { kopie8s = 'err ' + String(e).slice(0, 60); } }, 8000);
const navd = await nav; if (navd) { await p.waitForLoadState('load'); await bereit(p); } await p.waitForTimeout(800);
const r1 = {url: p.url().replace(URL0, '/'), version: await p.evaluate(() => VERSION), upd: await p.evaluate(() => typeof UPD !== 'undefined' ? UPD.last : 'kein UPD').catch(() => null)};
const nUpd = log.length;
// nächster Start (neue Sitzung); der Rand-Zwischenspeicher ist jetzt neu
staleUntil = 0;
const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(String(e).slice(0, 160)));
let nav2 = 0; p2.on('framenavigated', f => { if (f === p2.mainFrame()) nav2++; });
await p2.goto(URL0); await bereit(p2);
const v2a = await p2.evaluate(() => VERSION);
await p2.waitForTimeout(+(process.env.N2WAIT || 10000));
if (nav2 > 1) { await p2.waitForLoadState('load').catch(() => {}); await bereit(p2).catch(() => {}); await p2.waitForTimeout(800); }
const r2 = {startVersion: v2a, url: p2.url().replace(URL0, '/'), version: await p2.evaluate(() => VERSION).catch(() => null), neuladen: nav2 - 1};
const seite = x => x.url && x.url.startsWith('/Synquenzer/') && !x.url.includes('version.json');
const upd = log.slice(n0, nUpd).filter(seite), nxt = log.slice(nUpd).filter(seite);
const MB = a => +(a.reduce((s, x) => s + (x.sent || 0), 0) / 1048576).toFixed(2);
const DL = a => +(a.reduce((s, x) => s + (x.sent || 0), 0) / GZ).toFixed(2);
const kurz = a => a.map(x => `${x.m === 'HEAD' ? 'HEAD ' : ''}${x.url.replace('/Synquenzer/', '/')}:${x.ver}:${x.st}:${(x.sent / 1048576).toFixed(2)}${x.ganz === false ? '(abgebr.)' : ''}@${x.t}`);
console.log(JSON.stringify({datei: HTML.split('/').slice(-1)[0], sz: SZ, nosw: !!process.env.NOSW, etq: !!process.env.ETQ, kopie8s, swSteuert: swCtl, gzMB: +(GZ / 1048576).toFixed(2), navNachMs: tNav ? tNav - tAus : null,
  updateSeite: r1, naechsterStart: r2, MBupdate: MB(upd), DLupdate: DL(upd), MBnaechster: MB(nxt), DLnaechster: DL(nxt), DLgesamt: DL(upd.concat(nxt)),
  abrufeUpdate: kurz(upd), abrufeNaechster: kurz(nxt), errs}));
await ctx.close(); srv.close(); fs.rmSync(dir, {recursive: true, force: true});
