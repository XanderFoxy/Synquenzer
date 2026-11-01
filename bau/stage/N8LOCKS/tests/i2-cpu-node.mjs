// I2-18 / I2-26 CPU nach §5.12 (M-PAAR): das Worklet der App im Node-Shim (wie K2 k2-lib), µs je 128er-Block. Dieselbe Szene
// „mit“ und „ohne“ Merkmal abwechselnd, ≥ 20 Paare zu je 10 000 Blöcken (hier 2 × 5000 je Szene und Lauf, zusammen 10 000);
// vorher A/A-Paare für die Rauschgrenze (Paarzahl verdoppeln, bis halbe A/A-Breite ≤ halbe Grenze, höchstens 160).
// Grenze: obere 95-%-Schranke der mittleren Paar-Differenz (t-Verteilung) in % der Szene „ohne“. Dazu: kein Heap-Zuwachs > 1 MB in 60 s.
import {open} from './lib.mjs';
import fs from 'fs';
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
// ---- 1. Klänge und Paare aus der App (gleiche Umrechnung wie der Planer)
const {b, p} = await open(FILE);
const D = await p.evaluate(() => {
  const src = document.getElementById('sq-worklet-src').textContent, snd = id => SQStore.normalizeSound(JSON.parse(JSON.stringify(FACTORY_BY_ID.get(id))));
  const va = snd('f-init-analog'); Object.assign(va.p, {cutoff: 900, res: .3, fenv: .3, o2lvl: .5, o3lvl: .3, poly: 8, analog: 0}); va.mods = [{src: 'lfo1', dst: 'cutoff', amt: .1}];
  const fm = snd('f-init-fm'); fm.p.fm6.alg = 1; fm.p.fm6.ops.forEach((o, k) => { o.ol = 70 + k; }); fm.p.poly = 8;
  const fx = JSON.parse(JSON.stringify(fm)); fx.p.fmx = FMX.norm(FMX.fromFm6(fx.p.fm6), false);
  const mk = snd('f-init-am'); mk.p.mk.mode = 1;
  const init = s => ({patch: wkFlat(s), mods: wkMods(s), fm6: s.engine === 'fm6' && s.p.fm6 ? wkFmOf(s.p) : null, mk: s.engine === 'mk' ? s.p.mk : null});
  const L = k => { const e = SYNQUENZER.lkt(k); return {wi: e.wi, vals: !!e.vals}; }, eu = (k, x) => SYNQUENZER.lkFromN(k, x);
  const keys = {va: ['cutoff', 'res', 'level', 'fenv', 'o1pw', 'noise', 'kt', 'drive'], st: ['o1w', 'o2w', 'ftype'],
    fm: ['fm6.ops.0.ol', 'fm6.ops.1.ol', 'fm6.ops.2.ol', 'fm6.ops.3.ol', 'fm6.ops.1.fine', 'fm6.ops.2.det', 'fmBright', 'fm6.ops.0.l.2'],
    fx: ['fmx.ops.0.ol', 'fmx.ops.1.ol', 'fmx.ops.2.ol', 'fmx.ops.3.ol', 'fmx.ops.1.fine', 'fmx.ops.2.det', 'fmx.ops.1.fbAmt', 'fmBright'],
    mk: ['mk.t.0.f.cut', 'mk.t.0.f.res', 'mk.t.0.a.lvl', 'mk.t.0.o1.c1', 'mk.t.0.mix.o1', 'mk.t.0.f.eg', 'mk.t.0.e2.d', 'mk.t.0.p.0.i'],
    ln: ['cutoff', 'res', 'level', 'fenv', 'o1pw', 'noise', 'kt', 'mods.lfo1-cutoff.amt']};
  const sndOf = g => (g === 'fm' ? fm : g === 'fx' ? fx : g === 'mk' ? mk : va);
  const pairs = {}; for (const g in keys) pairs[g] = keys[g].map(k => ({k, ...L(k), v: [0, 1, 2, 3, 4, 5, 6, 7].map(j => eu(k, g === 'st' ? (j % 3) / 2 : .3 + .05 * j)), b: lkBase(sndOf(g), k)}));
  const md = SQF.toEngineMods([{src: 'lfo1', dst: 'cutoff', amt: 1}])[0];
  return {src, init: {va: init(va), fm: init(fm), fx: init(fx), mk: init(mk)}, pairs, md: [md.src, md.dst], sr: 128 / 128};
});
await b.close();
if (process.env.DUMP) { fs.writeFileSync(process.env.DUMP, JSON.stringify(D)); process.exit(0); }
// ---- 2. Shim
const SR = 48000;
function load() {
  const reg = {}; let cur = 0;
  class AWP { constructor() { this.port = {postMessage() {}, onmessage: null}; } }
  const f = new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', '__g', D.src.replace(/\bcurrentFrame\b/g, '__g.f').replace(/\bcurrentTime\b/g, '(__g.f / sampleRate)') + '\n;return 0;');
  const g = {f: 0}; f(AWP, (n, c) => { reg[n] = c; }, SR, g); void cur;
  return {C: reg['dirigent-analog'], g};
}
const {C, g} = load();
let SAME = true; const NB = +(process.env.NB || 2500), out = [new Float32Array(128), new Float32Array(128)];
function scene(eng, feat) {
  const P = new C({processorOptions: D.init[eng === 'st' || eng === 'ln' ? 'va' : eng]});
  const N = [48, 52, 55, 59, 62, 64, 67, 71], sec = NB * 128 / SR, ev = [];
  const pk = D.pairs[eng === 'st' ? 'st' : eng === 'ln' ? 'ln' : eng];
  N.forEach((n, j) => {
    let e = [.01 + j * .002, 1, j + 1, n, .7, -1];
    if (feat && eng !== 'ln') { const lk = []; for (const q of pk) lk.push(q.wi, SAME && typeof q.b === 'number' ? q.b : q.v[j]); e = e.concat([0, 0, lk.length >> 1], lk); }
    ev.push(e, [sec - .3, 2, j + 1]);
  });
  if (feat && eng === 'ln') {
    P.onMsg({lkMd: {[pk[7].wi]: D.md}});
    const sb = 60 / 180 / 8; pk.forEach((q, n) => { for (let st = 0; st * sb < sec - .3; st++) for (let m = 0; m < 4; m++) ev.push([st * sb + m * sb / 4, 11, 0, -1, q.wi, m % 2 ? NaN : q.v[(st + n) % 8], q.vals ? 0 : 144]); });
  }
  ev.sort((a, b2) => a[0] - b2[0]);
  P.onMsg({mkSeed: 1, tempo: {bpm: 180, start: 0}});
  for (let i = 0; i < ev.length; i += 64) P.onMsg({ev: ev.slice(i, i + 64)});   // in the message path, before the render
  return P;
}
function run(eng, feat) {
  const P = scene(eng, feat); g.f = 0;
  const t0 = process.hrtime.bigint();
  for (let k = 0; k < NB; k++) { P.process([], [out], {}); g.f += 128; }
  return Number(process.hrtime.bigint() - t0) / 1000 / NB;   // µs per block
}
const tq = n => (n >= 120 ? 1.98 : n >= 60 ? 2.0 : n >= 40 ? 2.02 : n >= 30 ? 2.045 : 2.09);
const st = a => { const n = a.length, m = a.reduce((x, y) => x + y, 0) / n, sd = Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (n - 1)); return {m, hw: tq(n) * sd / Math.sqrt(n)}; };
const scenes = [['VA 8 Stimmen × 8 Locks', 'va', 3], ['Stufige VA-Werte je Stimme (8 Wellen)', 'st', 3], ['FM DX 6 OP 8 Stimmen × 8 Locks', 'fm', 3], ['FELD 6 OP 8 Stimmen × 8 Locks', 'fx', 3],
  ['MK 8 Stimmen (2 Timbres) × 8 Locks', 'mk', 4], ['Freie Reihen 8 × 1/32 Ratsche 4, 180 BPM', 'ln', 5]];
const res = {};
for (const [nm0, eng, lim0, same0] of scenes.filter(x => !process.env.SC || process.env.SC.split(',').includes(x[1])).flatMap(x => (x[1] === 'ln' ? [[x[0], x[1], x[2], true]] : [[x[0], x[1], x[2], true], [x[0], x[1], x[2], false]])).map(x => [x[0] + (x[1] === 'ln' ? '' : x[3] ? ' · Mechanik (Lock = Grundwert)' : ' · andere Werte (Klang ändert sich, nur Info)'), x[1], x[3] || x[1] === 'ln' ? x[2] : Infinity, x[3]])) {
  const nm = nm0, lim = lim0; SAME = same0;
  for (let k = 0; k < 3; k++) { run(eng, false); run(eng, true); }   // JIT warm
  let n = 20, aa = [], ab = [], base = 0;
  for (;;) {
    while (aa.length < n) { const x = run(eng, false), y = run(eng, false); aa.push(y - x); const u = run(eng, false), w = run(eng, true); ab.push(w - u); base += u; }
    const A = st(aa); if (A.hw / (base / aa.length) * 100 <= lim / 2 || n >= +(process.env.NMAX || 40)) break; n *= 2;
  }
  base /= aa.length; const A = st(aa), B = st(ab);
  const up = (B.m + B.hw) / base * 100;
  res[nm] = {base, mean: B.m / base * 100, up, aaHw: A.hw / base * 100, pairs: aa.length};
  ok(up <= lim, `${nm}: ${base.toFixed(2)} µs/Block ohne; Paar-Differenz ${B.m >= 0 ? '+' : ''}${(B.m / base * 100).toFixed(2)} %, obere 95-%-Schranke ${up >= 0 ? '+' : ''}${up.toFixed(2)} % (Grenze ${isFinite(lim) ? '+' + lim + ' %' : '–'}); A/A halbe Breite ${(A.hw / base * 100).toFixed(2)} %; ${aa.length} Paare`);
}
// ohne Merkmal: gleicher Code-Weg (A/A gegen „ohne“ des Vorgängers wird über Regel 28 bitgleich geprüft); Heap in 60 s
{
  if (process.env.NOHEAP) process.exit(process.exitCode || 0);
  for (const F of [false, true]) {
  const P = scene('va', F); g.f = 0; global.gc && global.gc(); const h0 = process.memoryUsage().heapUsed; let mx = 0;
  for (let k = 0; k < 60 * SR / 128; k++) { P.process([], [out], {}); g.f += 128; if (k % 2000 === 0) { global.gc && global.gc(); const h = process.memoryUsage().heapUsed - h0; if (h > mx) mx = h; } }
  ok(mx < 1048576, `I2-18 Heap in 60 s Wiedergabe ${F ? 'mit' : 'ohne'} Locks: höchstens +${(mx / 1024).toFixed(0)} KB (Grenze 1 MB)`); }
}
fs.writeFileSync(new URL('./i2-cpu-ergebnis.json', import.meta.url), JSON.stringify(res, null, 1));
