// I2-18 / I2-26 CPU (M-PAAR, angepasst): dieselbe Szene offline durch das Worklet „mit“ und „ohne“ Merkmal abwechselnd,
// Rechenzeit je Render (Chromium, OfflineAudioContext, 4 s Audio); A/A-Paare für die Rauschgrenze; obere 95-%-Schranke der
// mittleren Paar-Differenz in % der Szene „ohne“. (Der Node-Shim aus K2 liegt hier nicht vor: gleiche Paar-Logik im Browser.)
import {open, ok, APP} from './lib.mjs';
import fs from 'fs';
const FILE = process.argv[2] || APP, NP = +(process.argv[3] || 20);
const {b, p, errs} = await open(FILE);
const src = fs.readFileSync(new URL('./i2b-abnahme.mjs', import.meta.url), 'utf8');
await eval('(async () => {' + src.slice(src.indexOf('await p.evaluate(() => {'), src.indexOf('/* ---------- Gleichheit')) + '})()');
const scenes = {
  'VA 8 Stimmen × 8 Locks': {eng: 'va', keys: ['cutoff', 'res', 'level', 'fenv', 'o1pw', 'noise', 'kt', 'drive'], lim: 3},
  'Stufige VA-Werte je Stimme (8 Wellen)': {eng: 'va', keys: ['o1w', 'o2w', 'ftype'], lim: 3},
  'FM DX 6 OP 8 Stimmen × 8 Locks': {eng: 'fm', keys: ['fm6.ops.0.ol', 'fm6.ops.1.ol', 'fm6.ops.2.ol', 'fm6.ops.3.ol', 'fm6.ops.1.fine', 'fm6.ops.2.det', 'fmBright', 'fm6.ops.0.l.2'], lim: 3},
  'FELD 6 OP 8 Stimmen × 8 Locks': {eng: 'fx', keys: ['fmx.ops.0.ol', 'fmx.ops.1.ol', 'fmx.ops.2.ol', 'fmx.ops.3.ol', 'fmx.ops.1.fine', 'fmx.ops.2.det', 'fmx.ops.1.fbAmt', 'fmBright'], lim: 3},
  'MK 8 Stimmen × 8 Locks': {eng: 'mk', keys: ['mk.t.0.f.cut', 'mk.t.0.f.res', 'mk.t.0.a.lvl', 'mk.t.0.o1.c1', 'mk.t.0.mix.o1', 'mk.t.0.f.eg', 'mk.t.0.e2.d', 'mk.t.0.p.0.i'], lim: 4},
  'Freie Reihen 8 × 1/32 Ratsche 4, 180 BPM': {eng: 'va', lanes: ['cutoff', 'res', 'level', 'fenv', 'o1pw', 'noise', 'kt', 'mods.lfo1-cutoff.amt'], lim: 5},
};
const out = {};
for (const [nm, sc] of Object.entries(scenes)) {
  const r = await p.evaluate(async ([sc, NP]) => {
    let s;
    if (sc.eng === 'va') { s = __va(); s.p.o2lvl = .5; s.p.o3lvl = .3; s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .1}]; s.p.poly = 8; }
    else if (sc.eng === 'fm') { s = SQStore.normalizeSound(__snd('f-init-fm')); s.p.fm6.alg = 1; s.p.fm6.ops.forEach((o, k) => { o.ol = 70 + k; }); s.p.poly = 8; }
    else if (sc.eng === 'fx') { s = SQStore.normalizeSound(__snd('f-init-fm')); s.p.fm6.ops.forEach((o, k) => { o.ol = 70 + k; }); s.p.fmx = FMX.norm(FMX.fromFm6(s.p.fm6), false); s.p.poly = 8; }
    else { s = SQStore.normalizeSound(__snd('f-init-am')); s.p.mk.mode = 1; }
    s = SQStore.normalizeSound(s);
    const N = [48, 52, 55, 59, 62, 64, 67, 71], sec = 6;
    const evs = (withF) => {
      const ev = [];
      N.forEach((n, j) => {
        const lk = withF && sc.keys ? sc.keys.flatMap((k, q) => { const e = SYNQUENZER.lkt(k); const x = sc.keys.length === 3 ? (j % 3 === q ? .5 : .2) : .3 + .05 * ((j + q) % 8); return [e.wi, __eu(k, x)]; }) : null;
        ev.push({k: 'on', id: j + 1, n, v: .7, t: .01 + j * .002, lk}); ev.push({k: 'off', id: j + 1, t: sec - .3});
      });
      if (withF && sc.lanes) {
        const sb = 60 / 180 / 8, sr = 48000;
        sc.lanes.forEach((k, q) => { const e = SYNQUENZER.lkt(k); for (let st = 0; st * sb < sec - .3; st++) for (let m = 0; m < 4; m++) ev.push({k: 'lane', t: st * sb + m * sb / 4, i: e.wi, x: m % 2 ? NaN : __eu(k, (st + q) % 7 / 7), r: e.c === 'vals' ? 0 : 144}); });
      }
      return ev;
    };
    const pre = sc.lanes ? {lkMd: {[SYNQUENZER.lkt('mods.lfo1-cutoff.amt').wi]: (() => { const m = SQF.toEngineMods([{src: 'lfo1', dst: 'cutoff', amt: 1}])[0]; return [m.src, m.dst]; })()}} : null;
    const time = async (withF) => (await __ren(s, evs(withF), {sec, pre, fast: true})).ms;
    await time(false); await time(true);                         // warm up
    const aa = [], ab = [];
    for (let k = 0; k < NP; k++) { const x = await time(false), y = await time(false); aa.push(y - x); const u = await time(false), w = await time(true); ab.push(w - u); }
    let base = 0; for (let k = 0; k < 3; k++) base += await time(false); base /= 3;
    const st = a => { const n = a.length, m = a.reduce((x, y) => x + y, 0) / n, sd = Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (n - 1)); return {m, hw: 2.09 * sd / Math.sqrt(n)}; };
    const A = st(aa), B = st(ab);
    return {base, aa: A, ab: B, up: (B.m + B.hw) / base * 100, mean: B.m / base * 100, noise: A.hw / base * 100, ev: evs(true).length};
  }, [sc, NP]);
  out[nm] = r;
  ok(r.up <= sc.lim, `${nm}: Mittel ${r.mean >= 0 ? '+' : ''}${r.mean.toFixed(2)} %, obere 95-%-Schranke ${r.up >= 0 ? '+' : ''}${r.up.toFixed(2)} % (Grenze +${sc.lim} %); A/A halbe Breite ${r.noise.toFixed(2)} %; Szene ohne: ${r.base.toFixed(0)} ms für 6 s Audio; ${NP} Paare`);
}
fs.writeFileSync(new URL('./i2-cpu-ergebnis.json', import.meta.url), JSON.stringify(out, null, 1));
ok(!errs.length, 'Konsole ohne Fehler');
await b.close();
