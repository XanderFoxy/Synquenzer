// BM6-01 (Regel 28): neue Version gegen die alte (vs-base-B.html, 4.23.0) – ohne Bit-Mask-Klang bleibt alles bitgleich.
//  (a) Worklet-Quelle 'sq-worklet-src' (dirigent-analog, dirigent-hall) byte-gleich
//  (b) alle Werks-Klänge (VA, FM, WT, MS 2000, Kits) normiert deep-equal; Demo-Projekt: Projektdatei + Rundreise gleich
//  (c) Offline-Render aller Werks-Klänge der Worklet-Engines (VA, FM, MS 2000) über mkRender (gleicher Seed) alt gegen neu
//  (d) ohne Bit-Mask-Klang: kein addModule mit 'synq-bm', kein Worker, nach ensureAudio + 2 s Demo-Wiedergabe
//  (e) Startzeit (bis SYNQUENZER bereit) ± 5 % (Median aus 5), Seitengröße + ≤ 25 KB
// Aufruf: node bm6-golden.mjs [neu.html] [alt.html]
import {createRequire} from 'module'; import fs from 'fs';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => {
    window.__adds = []; window.__workers = 0;
    const o = AudioWorklet.prototype.addModule;
    AudioWorklet.prototype.addModule = function (u) {
      const e = {u: String(u).slice(0, 40), bm: null}; window.__adds.push(e);
      try { const us = String(u); if (us.startsWith('data:')) { const i = us.indexOf(','), body = us.slice(i + 1); e.bm = /synq-bm/.test(/;base64/.test(us.slice(0, i)) ? atob(body) : decodeURIComponent(body)); } else fetch(us).then(r => r.text()).then(t => { e.bm = /synq-bm/.test(t); }).catch(() => { e.bm = 'unlesbar'; }); } catch (err) { e.bm = 'fehler'; }
      return o.apply(this, arguments);
    };
    const W = window.Worker; window.Worker = function () { window.__workers++; return new W(...arguments); }; window.Worker.prototype = W.prototype;
  });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
  return {p, errs};
}
const A = await open(NEW), B = await open(OLD);
// (a)
const wsrc = P => P.p.evaluate(() => { const e = document.getElementById('sq-worklet-src'); return e ? e.textContent : ''; });
const wa = await wsrc(A), wb = await wsrc(B);
ok('a_worklet_src_byte_equal', wa.length > 1000 && wa === wb, {len: wa.length});
// (b)
const data = P => P.p.evaluate(() => {
  const out = {};
  for (const f of SYNTH_LIB) if (f.engine !== 'bm') out[f.id] = JSON.stringify(SQStore.normalizeSound(factorySound(f.id)));
  for (const k of KIT_NAMES) out['kit:' + k] = JSON.stringify(SQStore.normalizeSound(kitSound(k)));
  switchProject(demoProject(), {first: true});
  const noUid = (k, v) => (k === 'uid' ? undefined : v);
  const f = JSON.stringify(projectFileObj(S, true, false)), r = parseAny(f);
  out.__file = JSON.stringify(JSON.parse(f).project.tracks, noUid);
  out.__rt = r.ok ? JSON.stringify(r.project.tracks, noUid) === JSON.stringify(JSON.parse(serializeProject()).tracks, noUid) : false;
  return out;
});
const da = await data(A), db = await data(B);
const ka = Object.keys(db).filter(k => !k.startsWith('__')), diff = ka.filter(k => da[k] !== db[k]);
ok('b_factory_deepEqual', !diff.length && ka.length > 50, {n: ka.length, diff: diff.slice(0, 5)});
ok('b_demo_file_equal', da.__file === db.__file);
ok('b_roundtrip_new', da.__rt === true); ok('b_roundtrip_old', db.__rt === true);
const bmExtra = await A.p.evaluate(() => SYNTH_LIB.filter(f => f.engine === 'bm').map(f => f.id));
ok('b_new_factory_only_bm_init', bmExtra.length === 3 && Object.keys(da).length === Object.keys(db).length, {bm: bmExtra});
// (c)
const ids = await B.p.evaluate(() => SYNTH_LIB.filter(f => ['analog', 'fm6', 'mk'].includes(f.engine)).map(f => f.id));
const render = (P, id) => P.p.evaluate(async id => {
  const r = await mkRender(factorySound(id), [[0.02, 'on', 48, .8], [0.02, 'on', 60, .7], [0.02, 'on', 64, .9], [0.5, 'off', 48], [0.5, 'off', 60], [0.5, 'off', 64]], {sec: .8, sr: 48000, seed: 7});
  let s = 0; for (const x of r.l) s += x * x; const enc = a => { const u = new Uint8Array(a.buffer.slice(0)); let t = ''; for (let i = 0; i < u.length; i += 8192) t += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(t); };
  return {l: enc(r.l), r: enc(r.r), e: s};
}, id);
const dec = s => new Float32Array(Buffer.from(s, 'base64').buffer.slice(0));
let bit = 0, near = 0, silent = 0; const bad = [];
for (const id of ids) {
  const x = await render(A, id), y = await render(B, id);
  if (x.l === y.l && x.r === y.r) { bit++; if (!(y.e > 1e-6)) silent++; continue; }
  const p = [dec(x.l), dec(x.r)], q = [dec(y.l), dec(y.r)]; let s = 0, r = 0;
  for (let c = 0; c < 2; c++) for (let i = 0; i < p[c].length; i++) { const d = p[c][i] - q[c][i]; s += d * d; r += q[c][i] * q[c][i]; }
  const dB = 10 * Math.log10(s / Math.max(r, 1e-30));
  // Boden alt gegen alt (Zufalls-Phasen ohne Seed) – gleich behandeln wie md4-golden
  const z = await render(B, id); let s2 = 0; const z0 = dec(z.l); for (let i = 0; i < z0.length; i++) { const d = z0[i] - q[0][i]; s2 += d * d; }
  if (dB <= -90 || s2 > 0) near++; else bad.push(id + ' ' + dB.toFixed(1));
}
ok('c_offline_factory', !bad.length, {n: ids.length, bitgleich: bit, gleichWieAltAlt: near, stumm: silent, bad});
// (d)
const live = async P => {
  await P.p.evaluate(() => { window.__adds.length = 0; window.__workers = 0; switchProject(demoProject(), {first: true}); ensureAudio(); });
  await P.p.waitForTimeout(800);
  await P.p.evaluate(() => { SYNQUENZER.play(); });
  await P.p.waitForTimeout(2000);
  return P.p.evaluate(async () => { const playing = R.playing; SYNQUENZER.stop(); await new Promise(r => setTimeout(r, 300));
    return {adds: window.__adds.map(e => e.bm), workers: window.__workers, playing, bmx: typeof BMX === 'object' ? {adds: BMX.adds, st: BMX.st, block: BML.ok} : null}; });
};
const la = await live(A), lb = await live(B);
ok('d_no_bm_module_no_worker', la.playing && !la.adds.includes(true) && la.workers === 0 && la.bmx && la.bmx.adds === 0 && la.bmx.st === 'off' && !la.bmx.block, {adds: la.adds.length, bmModule: la.adds.filter(x => x === true).length, workers: la.workers, playing: la.playing, bmx: la.bmx});
ok('d_same_modules_as_old', la.adds.length === lb.adds.length && la.workers === lb.workers, {neu: la.adds.length, alt: lb.adds.length});
ok('no_page_errors', !A.errs.length && !B.errs.length, {neu: A.errs.slice(0, 3), alt: B.errs.slice(0, 3)});
// (e)
// Startzeit: abwechselnd neu/alt je 9 Läufe, Median (ein Lauf allein schwankt um ±10 %)
const once = async file => { const p = await b.newPage(); const t0 = Date.now(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); const d = Date.now() - t0; await p.close(); return d; };
const TN = [], TO = []; for (let k = 0; k < 9; k++) { TN.push(await once(NEW)); TO.push(await once(OLD)); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1], tn = med(TN), to = med(TO);
ok('e_start_time', tn <= to * 1.05, {neu_ms: tn, alt_ms: to, neu: TN, alt: TO});
// Seitengröße: was beim Start gelesen wird (ohne den Bei-Bedarf-Block sq-bm-src, wie sq-mk-src) ≤ 25 KB; Gesamt zur Info
const dsz = fs.statSync(NEW).size - fs.statSync(OLD).size, html = fs.readFileSync(NEW, 'utf8'), bi = html.indexOf('<script type="text/plain" id="sq-bm-src">');
const lazy = bi < 0 ? 0 : Buffer.byteLength(html.slice(bi, html.indexOf('</script>', bi) + 9));
ok('e_size_start_le_25KB', dsz - lazy <= 25 * 1024, {start: dsz - lazy, beiBedarf: lazy, gesamt: dsz});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'bm6-golden', id: 'BM6-01', pass, checks}, null, 1));
await b.close();
process.exit(pass ? 0 : 1);
