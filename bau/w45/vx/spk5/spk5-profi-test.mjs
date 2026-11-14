// SPK5: Profi-Trennung nur in der Auswahl (Modell-Ablage + CDN lokal gespiegelt wie ki1-test). Aufruf: node spk5-profi-test.mjs <abs index.html> <abs modell/> <abs ort-web/>
import path from 'node:path';
import fs from 'node:fs';
import {start, page} from './lib.mjs';
const file = path.resolve(process.argv[2]), MOD = path.resolve(process.argv[3]), ORTD = path.resolve(process.argv[4]), fotos = path.join(path.dirname(file), 'fotos');
const E = await start(file), errs = [], res = {}, net = [];
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; console.log((c ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : 'application/octet-stream';
const P = await page(E, 428, 926, errs, null), {p} = P;
await P.ctx.route(/^https:\/\/[^/]+\/.*\.(onnx|wasm|mjs)(\?.*)?$/,   // Modell- und Laufzeit-Dateien: Dateiname entscheidet (Modell-Ordner zuerst)
  async rt => {
  const u = rt.request().url(), f = u.split('?')[0].split('/').pop(), src = fs.existsSync(path.join(MOD, f)) ? path.join(MOD, f) : path.join(ORTD, f); net.push(f);
  if (!fs.existsSync(src)) return rt.fulfill({status: 404, body: ''});
  return rt.fulfill({status: 200, headers: {'content-type': ty(f), 'access-control-allow-origin': '*'}, body: fs.readFileSync(src)});
});
await p.evaluate(async () => {
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
  const R = [await ld('spur0'), await ld('spur1'), await ld('spur2'), await ld('spur4')], n = Math.max(...R.map(x => x.length / 2)), L = new Float32Array(n), Rr = new Float32Array(n);
  for (const x of R) for (let i = 0; i < x.length / 2; i++) { L[i] += x[2 * i]; Rr[i] += x[2 * i + 1]; }
  const r = await __spk.load({name: 'Demo', sr: 44100, ch: [L, Rr]}); await __spk.page.open({id: r.meta.id});
});
await p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0; }, null, {timeout: 60000}); await p.waitForTimeout(400);
// Auswahl: Takt 3–4 (≈ 4,3–8,6 s), 40 Hz – 3 kHz
await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'rect', t0: 4.3, t1: 8.6, f0: 40, f1: 3000, kt: 0.05, kf: 50}]; U.selVer++; spk1SelDone(U); });
const ord0 = await p.evaluate(() => { const U = __spk.page.ui(); ki1Dd(U, U.b_ki1); const b = [...U.dd.querySelectorAll('button')].filter(x => x.offsetParent)[0].textContent.trim(); spk1Dd(U, null); return {erst: b, da: SYNQUENZER.spk5.kiDa()}; });   // Auftrag 3: vor dem Laden
const dd = await p.evaluate(async () => { __ki1.dd(); await new Promise(r => setTimeout(r, 500)); const U = __spk.page.ui(); const h = U.dd && U.dd.querySelector('h5'); const t = h ? h.textContent : null; spk1Dd(U, null); return t; });
const t0 = Date.now();
await p.evaluate(() => SYNQUENZER.spk5.run('profi'));
await p.waitForFunction(() => !__spk.page.info().busy, null, {timeout: 300000}); await p.waitForTimeout(400);
const r = await p.evaluate(async () => {
  const U = __spk.page.ui(), i = __spk.page.info(), st = await __ki1.stand(), sum = await __spk.sum(), sr = U.meta.sr, hop = U.meta.base.hop, N = U.meta.base.N;
  const lids = U.meta.layers.map(l => l.id), at = async (m, k) => { let s = 0; for (const l of lids) s += await __spk.maskAt(l, m, k); return s; };
  let aus = 0, inn = 0; for (const m of [20, 60, 120, 420]) for (const k of [3, 40, 200]) aus += await at(m, k); for (const k of [2, 330, 600]) aus += await at(260, k);   // außerhalb: Zeit vor/nach, gleiche Zeit unter 40 Hz / über 3 kHz
  for (let m = Math.ceil(4.6 * sr / hop); m < 8.3 * sr / hop; m += 9) for (const k of [8, 30, 120]) inn += await at(m, k);
  return {layers: i.layers, stat: i.stat, msg: SYNQUENZER.spk5.msg(), undo: SPK1.last.undo, last: SPK1.last && SPK1.last.n, job: st.job, aussen: aus, innen: inn, over: sum.over};
});
await p.screenshot({path: path.join(fotos, 'spk5-07-profi-auswahl.png')});
ok('profi-klappfenster-auswahl', dd, dd === 'Nur die Auswahl trennen');
ok('profi-nur-auswahl', Object.assign({ms: Date.now() - t0}, r), /^Profi-getrennt: .*\(Auswahl\)/.test(r.msg || '') && r.undo === 'Profi-Trennung (Auswahl)' && r.aussen === 0 && r.innen > 0 && r.over === 0 && !r.job);
// Auftrag 3/3 – Hybrid: Modell jetzt auf dem Gerät → Profi-Trennung zuerst; danach wirken die Werkzeuge auf die Profi-Ebenen (keine neuen Ebenen)
const hy = await p.evaluate(async () => {
  const U = __spk.page.ui(), wait = ms => new Promise(r => setTimeout(r, ms));
  ki1Dd(U, U.b_ki1); const d = U.dd, bs = [...d.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.textContent.trim()), erst = !!(d.querySelector('button') || {}).classList?.contains('spk5-erst'), tx = (d.querySelector('.ki1-tx') || {}).textContent; await wait(500);
  const bs2 = [...d.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.textContent.trim()); spk1Dd(U, null);
  const L = () => U.meta.layers.map(l => l.id), L0 = L(), bass = U.meta.layers.find(l => l.z === 'bass').id, gl = U.meta.layers.find(l => l.z === 'gesang') || U.meta.layers.find(l => l.z && l.z !== 'bass'), ges = gl.id, out = {klapp: {vorher: bs, nachCache: bs2, hervor: erst, tx}};
  // Verfeinern (Bass) in einem Teil der Auswahl → wirkt auf die Profi-Ebene Bass
  const v = await __spk.verfeinern('bass', [{art: 'rect', t0: 5, t1: 7, f0: 40, f1: 400, kt: 0, kf: 0}]); spk1Got(U, SPK1.last);
  out.verfeinern = {lid: v.lid, profiBass: bass, undo: SPK1.last.undo, ebenenGleich: L().join() === L0.join()};
  // In Ebene: Auswahl 1–3 kHz → Profi-Ebene Gesang (im Demo ohne Stimme: die andere Profi-Ebene)
  U.act = 'orig'; U.sel = [{art: 'rect', t0: 5, t1: 7, f0: 1000, f1: 3000, kt: 0, kf: 0}]; U.selVer++; spk1BtnState(U);
  await spk1Into(U, ges); out.inEbene = {nach: gl.name, undo: SPK1.last.undo, ebenenGleich: L().join() === L0.join()};
  // Noten finden im Original, eine Note „Gehört zu → Bass“ → landet in der Profi-Ebene Bass
  await __spk.spk2.noten('orig', [{art: 'rect', t0: 4.3, t1: 8.6, f0: 40, f1: 400, kt: 0, kf: 0}]); spk1Got(U, SPK1.last);
  const no = ((U.meta.teil2 || {}).notes || {}).orig || [], q = no[0];
  if (q) { await spk2Zu(U, 'bass', [{lid: 'orig', id: q.id}]); await wait(300); }
  const inBass = q ? (((U.meta.teil2 || {}).notes || {})[bass] || []).some(x => x.id === q.id && x.st === 'zu') : false;
  out.gehoertZu = {noten: no.length, undo: SPK1.last.undo, inProfiBass: inBass, ebenenGleich: L().join() === L0.join()};
  // ↶ je Aktion (Verfeinern, In Ebene, Noten finden, Gehört zu) = zurück auf die Profi-Trennung
  let n = 0; while (n < 6 && SPK1.last.undo !== 'Profi-Trennung (Auswahl)') { await spk1UndoRedo(U, 'undo'); n++; }
  out.zurueck = {schritte: n, undo: SPK1.last.undo, ebenen: U.meta.layers.map(l => l.name)};
  return out;
});
await p.evaluate(() => { const U = __spk.page.ui(); ki1Dd(U, U.b_ki1); }); await p.waitForTimeout(600);
await p.screenshot({path: path.join(fotos, 'spk5-08-hybrid-klappfenster.png')});
await p.evaluate(() => spk1Dd(__spk.page.ui(), null));
ok('hybrid-vor-dem-laden-zerlegen-zuerst', ord0, /^Zerlegen \(schnell/.test(ord0.erst) && !ord0.da);
ok('hybrid-profi-zuerst', hy.klapp, /^Profi-Trennung \(genauer/.test(hy.klapp.vorher[0]) && /^Zerlegen \(schnell/.test(hy.klapp.vorher[1]) && hy.klapp.hervor && hy.klapp.nachCache[0] === hy.klapp.vorher[0] && /Verfeinern/.test(hy.klapp.tx || ''));
ok('hybrid-werkzeuge-auf-profi-ebenen', {verfeinern: hy.verfeinern, inEbene: hy.inEbene, gehoertZu: hy.gehoertZu, zurueck: hy.zurueck}, hy.verfeinern.lid === hy.verfeinern.profiBass && hy.verfeinern.ebenenGleich && /Verfeinern/.test(hy.verfeinern.undo || '') && hy.inEbene.ebenenGleich && hy.inEbene.undo && hy.gehoertZu.inProfiBass && hy.gehoertZu.ebenenGleich && /zuordnen/.test(hy.gehoertZu.undo || '') && hy.zurueck.undo === 'Profi-Trennung (Auswahl)' && hy.zurueck.schritte <= 4);
ok('keine-fehler', errs, !errs.length);
fs.writeFileSync(path.join(path.dirname(file), 'spk5-profi-test.json'), JSON.stringify(res, null, 1));
await E.b.close(); E.srv.close();
