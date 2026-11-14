// KI1 Test (Auftrag 3/3, OK/FEHLER): Start lädt nichts; ▾ am Knopf Zerlegen mit Größe; Laden mit Prüfsumme + Fortschritt (Modell-Ablage + CDN
// lokal gespiegelt, Abrufe gezählt); Profi-Trennung im Test-Chromium (WASM, ein Faden) mit den Demo-Stems; Neuladen mitten drin → fortsetzen;
// Ebenen, Summe = Original, SDR je Ebene gegen klassisches Zerlegen; Abbrechen = nichts geändert; ein ↶; Speichern/Laden; Container (ZIP);
// hochkant + quer (926×428, 926×370); ✕ sichtbar; Gesang-Messung mit echtem Solo-Gesang (Demo + Stimme); keine Konsolen-Fehler.
// Aufruf: node ki1-test.mjs <index.html> <modell-dir> <ort-dir> [<gesang.wav 44,1 kHz mono 16 Bit>]
import { createRequire } from 'node:module';
const { chromium } = createRequire('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk/')('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), MOD = path.resolve(process.argv[3]), ORTD = path.resolve(process.argv[4]), fotos = path.join(dir, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
let VOX = null;
if (process.argv[5] && fs.existsSync(process.argv[5])) {   // Solo-Gesang (WAV 16 Bit) → Float32 mono
  const w = fs.readFileSync(process.argv[5]); let o = 12, fmt = null, dat = null;
  while (o + 8 <= w.length) { const id = w.toString('ascii', o, o + 4), n = w.readUInt32LE(o + 4); if (id === 'fmt ') fmt = {ch: w.readUInt16LE(o + 10), sr: w.readUInt32LE(o + 12), bits: w.readUInt16LE(o + 22)}; if (id === 'data') dat = w.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  if (fmt && dat && fmt.bits === 16 && fmt.sr === 44100) { const n = dat.length / 2 / fmt.ch | 0; VOX = new Float32Array(n); for (let i = 0; i < n; i++) VOX[i] = dat.readInt16LE(2 * i * fmt.ch) / 32768; }
}
const srv = http.createServer((q, r) => { if (q.url.startsWith('/__vox.f32')) { if (!VOX) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'application/octet-stream'}); r.end(Buffer.from(VOX.buffer)); return; } const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': ty(p)}); fs.createReadStream(p).pipe(r); });
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
// Mess-Helfer im Browser: Stems laden ([L, R] je Spur), Ebenen rendern, SDR je Ebene, Summe = Original
const MESS = () => {
  window.__stems = async () => { const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer()), st = x => { const n = x.length / 2, L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = x[2 * i]; R[i] = x[2 * i + 1]; } return [L, R]; };
    return {bass: st(await ld('spur0')), lead: st(await ld('spur1')), pad: st(await ld('spur2')), drums: st(await ld('spur4'))}; };
  window.__km = async ref => {
    const L = (await __spk.layers()).layers, n = Math.round(SPK1.last.meta.n), lid = a => L.find(l => l.z === a).id, rend = async m => (await __spk.render(m, 0, n)).ch;
    const cut = x => [0, 1].map(c => { const o = new Float32Array(n); o.set(x[c].subarray(0, Math.min(n, x[c].length))); return o; });
    const R = {}; for (const k in ref) R[k] = cut(ref[k]);
    const Y = {drums: await rend(lid('drums')), bass: await rend(lid('bass')), gesang: await rend(lid('gesang')), rest: await rend('rest')}, O = await rend('orig');
    const sdr = (r, e) => { let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] ** 2; b += (e[c][i] - r[c][i]) ** 2; } return +(10 * Math.log10(a / Math.max(b, 1e-12))).toFixed(2); };
    const add = (...a) => [0, 1].map(c => { const o = new Float32Array(n); for (const x of a) for (let i = 0; i < n; i++) o[i] += x[c][i]; return o; });
    const sum = await __spk.sum(), vox = R.vox;
    return {n, ebenen: L.map(l => l.name), summe: sdr(O, add(Y.drums, Y.bass, Y.gesang, Y.rest)), over: sum.over, max: sum.max,
      sdr: {drums: sdr(R.drums, Y.drums), bass: sdr(R.bass, Y.bass), gesang: sdr(vox || R.lead, Y.gesang), rest: sdr(vox ? add(R.lead, R.pad) : R.pad, Y.rest), tonal: sdr(vox ? add(vox, R.lead, R.pad) : add(R.lead, R.pad), add(Y.gesang, Y.rest))}};
  };
};
// 5) Messung: Ebenen rendern, Summe = Original, SDR gegen die Stems (Gesang-Ebene gegen die Lead-Spur, Rest gegen die Fläche: Demo ohne Stimme)
await p.evaluate(MESS);
const M = await p.evaluate(async () => __km(await __stems()));
ok('ebenen-summe-gleich-original', {summe: M.summe, ebenen: M.ebenen, over: M.over, max: M.max}, M.summe > 60 && M.ebenen.join() === 'Drums,Bass,Gesang' && M.over === 0);
ok('profi-sdr', M.sdr, M.sdr.drums >= 8.5 && M.sdr.bass >= 3.5 && M.sdr.tonal >= 10.5); res.sdrProfi = M.sdr;
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
// 9) Speichern / Neu öffnen (Kern-Worker zu, wieder auf): gleiche Masken, gleiche Ebenen, Auftrag als fertig vermerkt, keine q-Stücke übrig
const pts = [[30, 3], [200, 10], [400, 60], [600, 300], [800, 1000]];
const rdMasks = (p) => p.evaluate(async pts => { const L = (await __spk.layers()).layers, o = []; for (const l of L) for (const [m, k] of pts) o.push(await __spk.maskAt(l.id, m, k)); return {names: L.map(l => l.name + ':' + l.z), v: o}; }, pts);
const sv0 = await rdMasks(p);
const sv = await p.evaluate(async () => { const id = SPK1.doc; await __spk.save(); await __spk.close(); const o = await __spk.open(id); const st = await __ki1.stand(); return {job: o.meta.jobs && o.meta.jobs.profi, stand: st.job}; });
const sv1 = await rdMasks(p);
ok('speichern-laden', {gleich: sv0.v.join() === sv1.v.join(), names: sv1.names, job: sv.job, stand: sv.stand}, sv0.v.join() === sv1.v.join() && sv0.v.some(v => v > 0) && sv1.names.join() === sv0.names.join() && sv.job && sv.job.fertig && sv.stand && sv.stand.have === 0);
// 10) Container (ZIP wie „Container sichern“): Analyse im Projekt → ZIP → Analyse vom Gerät weg → ZIP lesen → gleiche Masken
const zp = await p.evaluate(async () => {
  const id = SPK1.doc; __spk.page.close(); __spk.link();
  const z = await tkZipBytes(), fs1 = await tkUnzip(z), names = fs1.map(f => f.name).filter(n => n.startsWith('spektral/'));
  await __spk.remove(id); let weg = false; try { await __spk.open(id); } catch (e) { weg = true; }
  const nImp = await spk1ZipRead(fs1); const o = await __spk.open(id); await __spk.page.open({id});
  return {id, bytes: z.length, names, weg, nImp, layers: o.meta.layers.map(l => l.name), q: names.filter(n => /\/q\d/.test(n)).length};
});
await p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0; }, null, {timeout: 60000}); await p.waitForTimeout(400);
const zp1 = await rdMasks(p);
ok('container-zip', {zp, gleich: zp1.v.join() === sv0.v.join()}, zp.weg && zp.nImp === 1 && zp.names.some(n => /doc\.json$/.test(n)) && zp.names.filter(n => /\/mL\d+\.bin$/.test(n)).length === 3 && !zp.q && zp1.v.join() === sv0.v.join() && zp.layers.join() === 'Drums,Bass,Gesang');
// 11) quer 926×428 und 926×370: „Zerlegen ▾“ öffnet das Klappfenster, keine Taste < 44 px, nichts außerhalb, ✕ sichtbar; dann wieder hochkant
const layQ = async (p) => p.evaluate(async () => {
  const U = __spk.page.ui(), z = U.b_zerl.getBoundingClientRect(), k = U.b_ki1.getBoundingClientRect(), x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
  const bs = [...document.querySelectorAll('#spk1Sheet .spk1-ac button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
  const d = U.dd ? U.dd.getBoundingClientRect() : null, items = U.dd ? [...U.dd.querySelectorAll('button')].filter(e => e.offsetParent).map(e => ({t: e.textContent, h: Math.round(e.getBoundingClientRect().height)})) : [];
  return {W: innerWidth, H: innerHeight, zerl: [Math.round(z.width), Math.round(z.height)], label: getComputedStyle(U.b_zerl, '::after').content, ki: [Math.round(k.width), Math.round(k.height)],
    small: bs.filter(r => r.height < 43.5 || r.width < 43.5).length, out: bs.filter(r => r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5 || r.left < -0.5).length,
    x: x.width >= 44 && x.height >= 44 && x.left >= 0 && x.right <= innerWidth && x.top >= 0 && x.bottom <= innerHeight, dd: d && [Math.round(d.left), Math.round(d.top), Math.round(d.right), Math.round(d.bottom)], items};
});
for (const [w, h] of [[926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(500);
  const zc = await p.evaluate(() => { const r = __spk.page.ui().b_zerl.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(zc[0], zc[1]); await p.waitForTimeout(700);
  const L = await layQ(p); await p.screenshot({path: path.join(fotos, 'ki1-04-quer-' + w + 'x' + h + '.png')});
  ok('quer-' + h, L, L.ki[0] === 0 && L.zerl[0] >= 60 && /▾/.test(L.label) && !L.small && !L.out && L.x && L.dd && L.dd[2] <= w && L.dd[3] <= h && L.items[0] && L.items[0].t === 'Zerlegen (schnell, ohne Download)' && L.items.some(x => /^Profi-Trennung \(genauer/.test(x.t)) && L.items.every(x => x.h >= 44));
  await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); });
}
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(500);
const Lh = await layQ(p);
ok('hochkant-layout', Lh, Lh.ki[0] === 44 && Lh.ki[1] === 44 && !Lh.small && !Lh.out && Lh.x && !/▾/.test(Lh.label));
// 12) Vergleich mit dem klassischen Zerlegen auf demselben Stück (↶ Profi → Zerlegen klassisch → messen)
const kl = await p.evaluate(async () => { const u = await __spk.undo(); const t = Date.now(); await __spk.zerlegen(); const ms = Date.now() - t; const M = await __km(await __stems()); await __spk.undo(); await __spk.redo(); return {undo: u.label, ms, M}; });
res.sdrKlassisch = kl.M.sdr;
ok('besser-als-klassisch-demo', {profi: M.sdr, klassisch: kl.M.sdr, msKlassisch: kl.ms}, M.sdr.bass > kl.M.sdr.bass + 2 && M.sdr.drums > kl.M.sdr.drums + 2 && M.sdr.tonal > kl.M.sdr.tonal + 1 && kl.M.summe > 60);
// 13) Gesang: Demo + echter Solo-Gesang (Stimme ≈ Pegel der Lead-Spur + 3 dB) → Profi gegen klassisch, Gesang-Ebene gegen die Stimme
const gs = await p.evaluate(async () => {
  const r = await fetch('__vox.f32'); if (!r.ok) return {fehlt: true};
  const v = new Float32Array(await r.arrayBuffer()), st = await __stems(), n = st.drums[0].length, rms = x => { let s = 0; for (const c of x) for (let i = 0; i < c.length; i++) s += c[i] * c[i]; return Math.sqrt(s / (x.length * x[0].length)); };
  const vv = new Float32Array(n); vv.set(v.subarray(0, n)); const g = rms(st.lead) * 1.41 / Math.max(1e-9, rms([vv])); for (let i = 0; i < n; i++) vv[i] *= g;
  st.vox = [vv, vv.slice()];
  const L = new Float32Array(n), R = new Float32Array(n); for (const k in st) for (let c = 0; c < 2; c++) { const y = c ? R : L, x = st[k][c]; for (let i = 0; i < n; i++) y[i] += x[i]; }
  const d = await __spk.load({name: 'Demo + Gesang', sr: 44100, ch: [L, R]}); await __spk.page.open({id: d.meta.id});
  const t = Date.now(); const pr = await __ki1.profi(); const msP = Date.now() - t; const P = await __km(st);
  await __spk.undo(); const t2 = Date.now(); await __spk.zerlegen(); const msK = Date.now() - t2; const K = await __km(st);
  return {n, msP, msK, profi: P.sdr, klassisch: K.sdr, summeP: P.summe, summeK: K.summe, weiter: pr.weiter};
});
res.gesangMix = gs;
ok('gesang-besser-als-klassisch', gs, !gs.fehlt && gs.profi.gesang > gs.klassisch.gesang + 2 && gs.profi.bass > gs.klassisch.bass + 2 && gs.summeP > 60);
ok('keine-fehler', errs.slice(0, 5), !errs.length);
res.ms = Date.now() - T0; res.net = net;
fs.writeFileSync(path.join(dir, 'ki1-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
console.log(Object.values(res).filter(x => x && x.ok === false).length ? 'FEHLER' : 'ALLES OK', Math.round(res.ms / 1000) + ' s');
