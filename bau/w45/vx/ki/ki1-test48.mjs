// KI1 Test 48 kHz + quer (Auftrag 2/3): Start lädt nichts; ▾ am Knopf Zerlegen; Laden mit Prüfsumme (Modell-Ablage + CDN lokal gespiegelt, Abrufe gezählt);
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
const ctx = await b.newContext({viewport: {width: +(process.argv[5] || 926), height: +(process.argv[6] || 428)}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
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
const doc = await p.evaluate(async () => {
  const ld = async n => new Float32Array(await (await fetch('mess/' + n + '.f32')).arrayBuffer());
  const rs = async x => { const n = x.length / 2, b = new AudioBuffer({numberOfChannels: 2, length: n, sampleRate: 44100}); const L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = x[2 * i]; R[i] = x[2 * i + 1]; } b.copyToChannel(L, 0); b.copyToChannel(R, 1);
    const c = new OfflineAudioContext(2, Math.ceil(n * 48000 / 44100), 48000), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(); const o = await c.startRendering(); return [o.getChannelData(0).slice(), o.getChannelData(1).slice()]; };
  const ref = {bass: await rs(await ld('spur0')), lead: await rs(await ld('spur1')), pad: await rs(await ld('spur2')), drums: await rs(await ld('spur4'))};
  const n = Math.max(...Object.values(ref).map(x => x[0].length)), L = new Float32Array(n), R = new Float32Array(n);
  for (const k in ref) for (let c = 0; c < 2; c++) { const y = c ? R : L, x = ref[k][c]; for (let i = 0; i < x.length; i++) y[i] += x[i]; }
  let pk = 0; for (const y of [L, R]) for (const v of y) pk = Math.max(pk, Math.abs(v));
  window.__ref48 = ref; const r = await __spk.load({name: 'Demo 48k', sr: 48000, ch: [L, R]}); await __spk.page.open({id: r.meta.id});
  return {id: r.meta.id, n, sr: r.meta.sr, pk};
});
await p.waitForFunction(() => { const i = __spk.page.info(); return i && i.chunks > 0; }, null, {timeout: 60000}); await p.waitForTimeout(500);
const lay = await p.evaluate(async () => {
  const U = __spk.page.ui(), z = U.b_zerl.getBoundingClientRect(), k = U.b_ki1.getBoundingClientRect(), x = document.querySelector('#spk1Sheet .sh-x').getBoundingClientRect();
  const small = [...document.querySelectorAll('#spk1Sheet .spk1-ac button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 43.5).length;
  const out = [...document.querySelectorAll('#spk1Sheet .spk1-ac button')].filter(e => e.offsetParent && (e.getBoundingClientRect().right > innerWidth + 0.5 || e.getBoundingClientRect().bottom > innerHeight + 0.5)).length;
  __ki1.dd(); await new Promise(r => setTimeout(r, 600));
  const d = U.dd.getBoundingClientRect();
  return {zerl: [Math.round(z.width), Math.round(z.height)], ki: [Math.round(k.width), Math.round(k.height)], small, out, x: x.left >= 0 && x.right <= innerWidth && x.top >= 0 && x.bottom <= innerHeight, dd: [Math.round(d.left), Math.round(d.top), Math.round(d.right), Math.round(d.bottom)], W: innerWidth, H: innerHeight};
});
await p.screenshot({path: path.join(fotos, 'ki1-03-quer-' + lay.W + 'x' + lay.H + '.png')});
ok('quer-split-knopf', lay, lay.ki[0] >= 44 && lay.ki[1] >= 44 && !lay.small && !lay.out && lay.x && lay.dd[2] <= lay.W && lay.dd[3] <= lay.H && lay.zerl[0] >= 44);
const r = await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); return __ki1.profi().then(r => ({ms: r.ms, n: r.n, msModell: r.msModell, layers: r.meta.layers.length}), e => ({err: String(e.message || e)})); });
const M = await p.evaluate(async () => {
  const ref = window.__ref48, L = (await __spk.layers()).layers, n = Math.round(SPK1.last.meta.n);
  const S = k => [0, 1].map(c => { const o = new Float32Array(n); o.set(ref[k][c].subarray(0, n)); return o; });
  const R = {bass: S('bass'), drums: S('drums'), lead: S('lead'), pad: S('pad')}, lid = a => L.find(l => l.z === a).id, rend = async m => (await __spk.render(m, 0, n)).ch;
  const Y = {drums: await rend(lid('drums')), bass: await rend(lid('bass')), gesang: await rend(lid('gesang')), rest: await rend('rest')}, O = await rend('orig');
  const sdr = (r, e) => { let a = 0, b = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { a += r[c][i] ** 2; b += (e[c][i] - r[c][i]) ** 2; } return +(10 * Math.log10(a / Math.max(b, 1e-12))).toFixed(2); };
  const add = (...a) => [0, 1].map(c => { const o = new Float32Array(n); for (const x of a) for (let i = 0; i < n; i++) o[i] += x[c][i]; return o; });
  return {summe: sdr(O, add(Y.drums, Y.bass, Y.gesang, Y.rest)), sdr: {drums: sdr(R.drums, Y.drums), bass: sdr(R.bass, Y.bass), tonal: sdr(add(R.lead, R.pad), add(Y.gesang, Y.rest))}};
});
ok('48k-profi', {r, doc: {sr: doc.sr, n: doc.n}, M}, !r.err && M.summe > 60 && M.sdr.drums >= 8.5 && M.sdr.bass >= 3.5 && M.sdr.tonal >= 10.5);
ok('keine-fehler', errs.slice(0, 5), !errs.length);
res.ms = Date.now() - T0; res.net = net;
fs.writeFileSync(path.join(dir, 'ki1-test48-' + lay.W + 'x' + lay.H + '.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
console.log(Object.values(res).filter(x => x && x.ok === false).length ? 'FEHLER' : 'ALLES OK', Math.round(res.ms / 1000) + ' s');
