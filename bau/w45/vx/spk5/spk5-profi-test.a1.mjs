// SPK5: Profi-Trennung nur in der Auswahl (Modell-Ablage + CDN lokal gespiegelt wie ki1-test). Aufruf: node spk5-profi-test.mjs <abs index.html> <abs modell/> <abs ort-web/>
import path from 'node:path';
import fs from 'node:fs';
import {start, page} from './lib.mjs';
const file = path.resolve(process.argv[2]), MOD = path.resolve(process.argv[3]), ORTD = path.resolve(process.argv[4]), fotos = path.join(path.dirname(file), 'fotos');
const E = await start(file), errs = [], res = {}, net = [];
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; console.log((c ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : 'application/octet-stream';
const P = await page(E, 428, 926, errs, null), {p} = P;
await P.ctx.route(/^https:\/\/(huggingface\.co|cdn\.jsdelivr\.net)\//, async rt => {
  const u = rt.request().url(), f = u.split('?')[0].split('/').pop(), src = u.includes('huggingface.co') ? path.join(MOD, f) : path.join(ORTD, f); net.push(f);
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
ok('keine-fehler', errs, !errs.length);
fs.writeFileSync(path.join(path.dirname(file), 'spk5-profi-test.json'), JSON.stringify(res, null, 1));
await E.b.close(); E.srv.close();
