// KI1 Test (Auftrag 2/3): Start lädt nichts; ▾ am Knopf Zerlegen; Laden mit Prüfsumme (Modell-Ablage + CDN lokal gespiegelt, Abrufe gezählt);
// Profi-Trennung im Test-Chromium (WASM, ein Faden) mit den Demo-Stems; Neuladen mitten drin → fortsetzen; Ebenen, Summe = Original, SDR; ein ↶; Abbrechen = nichts geändert
// Aufruf: node ki1-test.mjs <index.html> <modell-dir> <ort-dir>
import { createRequire } from 'node:module';
const { chromium } = createRequire('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk/')('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), MOD = path.resolve(process.argv[3]), ORTD = path.resolve(process.argv[4]), fotos = path.join(dir, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': ty(p)}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}, errs = [], net = [];
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
// Modell-Ablage + CDN lokal gespiegelt (Inhalt = Original, Prüfsummen echt)
await ctx.route(/^https:\/\/(huggingface\.co|cdn\.jsdelivr\.net)\//, async (rt) => {
  const u = rt.request().url(), f = u.split('?')[0].split('/').pop(), src = u.includes('huggingface.co') ? path.join(MOD, f) : path.join(ORTD, f);
  net.push(f);
  if (!fs.existsSync(src)) return rt.fulfill({status: 404, body: ''});
  return rt.fulfill({status: 200, headers: {'content-type': ty(f), 'access-control-allow-origin': '*'}, body: fs.readFileSync(src)});
});
async function page() {
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__ki1, null, {timeout: 60000}); await p.waitForTimeout(800);
  return p;
}
const stat = p => p.evaluate(() => { const U = __spk.page.ui(); return U ? U.st.textContent : ''; });
const T0 = Date.now();
let p = await page();
// 1) Start: nichts geladen
const st0 = await p.evaluate(async () => ({ki: __ki1.state(), cache: await caches.has('synq-ki1-v1'), g9: typeof G9A}));
ok('start-laedt-nichts', {worker: st0.ki.worker, files: st0.ki.files.length, cache: st0.cache, g9: st0.g9, net: net.length}, !st0.ki.worker && !st0.ki.files.length && !st0.cache && st0.g9 === 'undefined' && !net.length);
// 2) Demo-Gemisch als Analyse, Seite öffnen
const doc = await p.evaluate(async () => {
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
  const R = [await ld('spur0'), await ld('spur1'), await ld('spur2'), await ld('spur4')], n = Math.max(...R.map(x => x.length / 2)), L = new Float32Array(n), Rr = new Float32Array(n);
  for (const x of R) for (let i = 0; i < x.length / 2; i++) { L[i] += x[2 * i]; Rr[i] += x[2 * i + 1]; }
  const r = await __spk.load({name: 'Demo', sr: 44100, ch: [L, Rr]}); await __spk.page.open({id: r.meta.id});
  return {id: r.meta.id, n};
});
await p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0; }, null, {timeout: 60000}); await p.waitForTimeout(500);
// 3) ▾ am Knopf Zerlegen + Klappfenster
const dd = await p.evaluate(async () => {
  const U = __spk.page.ui(), z = U.b_zerl.getBoundingClientRect(), k = U.b_ki1.getBoundingClientRect(), ac = U.ac.getBoundingClientRect();
  __ki1.dd(); await new Promise(r => setTimeout(r, 600));
  const items = [...U.dd.querySelectorAll('button')].filter(e => e.offsetParent).map(e => ({t: e.textContent, h: Math.round(e.getBoundingClientRect().height)}));
  return {zerl: [Math.round(z.width), Math.round(z.height)], ki: [Math.round(k.width), Math.round(k.height)], acH: Math.round(ac.height), inRow: Math.abs(z.top - k.top) < 1 && k.left > z.left, items};
});
await p.screenshot({path: path.join(fotos, 'ki1-01-klappfenster.png')});
ok('split-knopf-und-eintrag', dd, dd.ki[0] >= 44 && dd.ki[1] >= 44 && dd.zerl[0] >= 60 && dd.inRow && dd.acH <= 100 && dd.items.some(x => /^Profi-Trennung laden \(~86 MB, einmalig\)$/.test(x.t)) && dd.items.every(x => x.h >= 44));
// 4) Start: laden (gespiegelt) + rechnen; nach dem ersten Stück neu laden
await p.evaluate(() => { __ki1.start(); });
const seen = new Set(); let t = Date.now();
while (Date.now() - t < 120000) { const s = await stat(p); seen.add(s.replace(/[0-9]+(\/[0-9]+)? MB · [0-9]+ %/, 'x MB').replace(/ · [0-9]+ %$/, '')); if (/Stück [1-9]\//.test(s)) break; await p.waitForTimeout(150); }
const mid = await p.evaluate(async () => ({stand: await __ki1.stand(), ki: __ki1.state()}));
ok('laden-und-erstes-stueck', {seen: [...seen].slice(0, 8), net: net.slice(), job: mid.stand.job, how: mid.ki.st.how || mid.ki.how, kinet: mid.ki.net.length}, mid.stand.job && mid.stand.job.have >= 1 && net.filter(f => f.endsWith('.onnx')).length === 4 && mid.stand.full);
await p.close();
const net1 = net.length;
p = await page();
await p.evaluate(async id => { await __spk.page.open({id}); }, doc.id);
await p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0; }, null, {timeout: 60000});
const re = await p.evaluate(async () => { const s = await __ki1.stand(); __ki1.dd(); await new Promise(r => setTimeout(r, 600)); const U = __spk.page.ui(); return {job: s.job, full: s.full, items: [...U.dd.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.textContent)}; });
ok('nach-neuladen-fortsetzen-angeboten', re, re.job && re.job.have >= 1 && !re.job.fertig && re.items.some(x => /^Profi-Trennung fortsetzen \(\d+ %\)$/.test(x)));
const t1 = Date.now();
const r2 = await p.evaluate(() => __ki1.profi().then(r => ({ms: r.ms, weiter: r.weiter, n: r.n, msModell: r.msModell, lids: r.lids, layers: r.meta.layers.map(l => l.name + ':' + l.z), nu: r.nu, undo: r.undo}), e => ({err: String(e.message || e)})));
await p.evaluate(() => { const U = __spk.page.ui(); if (U && SPK1.last) { spk1Got(U, SPK1.last); spk1TintLoad(U); } });
ok('fortgesetzt-ohne-neuen-download', {r2, wall: Date.now() - t1, netNeu: net.slice(net1)}, !r2.err && r2.weiter >= 1 && r2.n >= 3 && net.length === net1 && r2.layers.length === 3 && /Profi/.test(r2.undo) && r2.nu === 1);
await p.waitForTimeout(800); await p.screenshot({path: path.join(fotos, 'ki1-02-profi-getrennt.png')});
// 5) Messung: Ebenen rendern, Summe = Original, SDR gegen die Stems
const M = await p.evaluate(async () => {
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
  const R = {bass: await ld('spur0'), lead: await ld('spur1'), pad: await ld('spur2'), drums: await ld('spur4')}, L = (await __spk.layers()).layers, n = Math.round(SPK1.last.meta.n);
  const S = k => [0, 1].map(c => { const o = new Float32Array(n); const x = R[k]; for (let i = 0; i < Math.min(n, x.length / 2); i++) o[i] = x[2 * i + c]; return o; });
  const ref = {bass: S('bass'), drums: S('drums'), lead: S('lead'), pad: S('pad')}, lid = a => L.find(l => l.z === a).id, rend = async m => (await __spk.render(m, 0, n)).ch;
  const Y = {drums: await rend(lid('drums')), bass: await rend(lid('bass')), gesang: await rend(lid('gesang')), rest: await rend('rest')}, O = await rend('orig');
  const sdr = (r, e) => { let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] ** 2; b += (e[c][i] - r[c][i]) ** 2; } return +(10 * Math.log10(a / Math.max(b, 1e-12))).toFixed(2); };
  const add = (...a) => [0, 1].map(c => { const o = new Float32Array(n); for (const x of a) for (let i = 0; i < n; i++) o[i] += x[c][i]; return o; });
  const sum = await __spk.sum();
  return {n, ebenen: L.map(l => l.name), summe: sdr(O, add(Y.drums, Y.bass, Y.gesang, Y.rest)), over: sum.over, max: sum.max,
    sdr: {drums: sdr(ref.drums, Y.drums), bass: sdr(ref.bass, Y.bass), tonal: sdr(add(ref.lead, ref.pad), add(Y.gesang, Y.rest))}};
});
ok('ebenen-summe-gleich-original', {summe: M.summe, ebenen: M.ebenen, over: M.over, max: M.max}, M.summe > 60 && M.ebenen.join() === 'Drums,Bass,Gesang' && M.over === 0);
ok('profi-sdr', M.sdr, M.sdr.drums >= 8.5 && M.sdr.bass >= 3.5 && M.sdr.tonal >= 10.5);
// 6) Abbrechen mitten in einem neuen Lauf = nichts geändert
const ab = await p.evaluate(async () => {
  const lid = SPK1.last.meta.layers.find(l => l.z === 'drums').id, pts = [[100, 50], [400, 300], [700, 1000]], a = []; for (const [m, k] of pts) a.push(await __spk.maskAt(lid, m, k));
  const nu0 = SPK1.last.nu; let first = false;
  const pr = __ki1.profi({neu: true, prog: (w, x) => { if (w === 'rechnen' && x > 0 && !first) { first = true; __ki1.stop(); } }}).then(() => 'fertig', e => String(e.message || e));
  const r = await pr; const o = await __spk.open(SPK1.doc), b = []; for (const [m, k] of pts) b.push(await __spk.maskAt(lid, m, k));
  return {r, same: a.join() === b.join(), nu: o.nu, nu0, stand: (await __ki1.stand()).job, worker: __ki1.state().worker};
});
ok('abbrechen-nichts-geaendert', ab, /abgebrochen|gestoppt/.test(ab.r) && ab.same && ab.nu === ab.nu0 && !ab.worker);
// 7) ein ↶ nimmt die ganze Profi-Trennung zurück, ↷ bringt sie wieder
const un = await p.evaluate(async () => { const u = await __spk.undo(); const a = u.meta.layers.length; const r = await __spk.redo(); return {label: u.label, nach: a, redo: r.meta.layers.length}; });
ok('ein-undo', un, /Profi/.test(un.label) && un.nach === 0 && un.redo === 3);
// 8) Status-Zeile + ✕ sichtbar
const lay = await p.evaluate(() => { const x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect(); return {x: x.width >= 44 && x.height >= 44 && x.left >= 0 && x.right <= innerWidth && x.top >= 0}; });
ok('x-sichtbar', lay, lay.x);
ok('keine-fehler', errs.slice(0, 5), !errs.length);
res.ms = Date.now() - T0; res.net = net;
fs.writeFileSync(path.join(dir, 'ki1-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
console.log(Object.values(res).filter(x => x && x.ok === false).length ? 'FEHLER' : 'ALLES OK', Math.round(res.ms / 1000) + ' s');
