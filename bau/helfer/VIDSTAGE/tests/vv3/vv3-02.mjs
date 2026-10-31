// VV3-02: FM operator levels in the picture follow the envelopes of the played notes. Reference = the sound itself: one carrier
// operator alone (algorithm 32, the other five off) through the app worklet (mkRender), its level per 10 ms in dB against the drawn
// level of that operator (6.02 dB per 256 units), after one constant offset. Plus the real video job (FM track): the probe per frame
// = the drawn bars, sounding notes → levels rise / fall with the note on / off.
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await setup(p, {});
const res = {};
const ENVS = [['Anschlag schnell, Abfall', {r: [80, 45, 30, 55], l: [99, 85, 70, 0]}], ['Anschlag langsam', {r: [35, 60, 40, 40], l: [99, 92, 80, 0]}], ['Bite/Abfall moduliert (fmDec)', {r: [90, 30, 25, 60], l: [99, 70, 50, 0], dec: 10}]];
for (const [name, E] of ENVS) {
  res[name] = await p.evaluate(async E => {
    const snd = JSON.parse(JSON.stringify(S.tracks[1].sound)), fm = snd.p.fm6; fm.alg = 32; fm.fb = 0; snd.mods = []; snd.p.fmAmp = 0; snd.p.fmAtk = 0; snd.p.fmRel = 0; snd.p.fmDec = E.dec || 0; snd.p.fmBite = 0;
    delete snd.p.fmx;
    fm.ops.forEach((o, k) => { o.on = k === 0 ? 1 : 0; if (k === 0) { o.r = E.r.slice(); o.l = E.l.slice(); o.ol = 99; o.vs = 0; o.rs = 0; o.fixed = 0; o.coarse = 1; o.fine = 0; o.det = 0; delete o.ks; } });
    if (fm.peg) delete fm.peg; snd.p.glide = 0;
    const sr = 48000, A = .2, B = 1.6, n = 69, v = .8;
    const out = await SYNQUENZER.mkRender(snd, [[A, 'on', n, v], [B, 'off', n]], {sec: 3, sr});
    const X = vv3Fmx(), nsnd = SQStore.normalizeSound(snd), nt = {n, v, a: A, b: B};
    const rows = []; let off = null;
    for (let t = A + .02; t < 2.9; t += .01) {
      const k0 = Math.round((t - .005) * sr), k1 = Math.round((t + .005) * sr); let ss = 0; for (let k = k0; k < k1; k++) ss += out.l[k] * out.l[k];
      const dbA = 10 * Math.log10(ss / (k1 - k0) * 2 + 1e-20), l = vv3FmLevel(X, nsnd.p.fm6, nsnd.p, 0, nt, t), dbM = l * 6.0206 / 256;
      rows.push([t, dbA, dbM]);
    }
    const ref = rows.filter(r => r[0] > A + .3 && r[0] < B - .05); off = ref.reduce((s, r) => s + r[1] - r[2], 0) / ref.length;
    const top = Math.max(...rows.map(r => r[1]));
    const cmp = rows.filter(r => r[1] > top - 50);                  // where the sound is above −50 dB of its peak
    let worst = 0, wt = 0; for (const r of cmp) { const d = Math.abs(r[1] - r[2] - off); if (d > worst) { worst = d; wt = r[0]; } }
    const at = s => rows.find(r => r[0] >= s);
    return {points: cmp.length, maxErrDb: +worst.toFixed(2), at: +wt.toFixed(2), probe: [.25, .6, 1.4, 1.7, 2.2].map(s => { const r = at(s); return r ? {t: s, ton: +(r[1] - top).toFixed(1), bild: +(r[2] + off - top).toFixed(1)} : null; }), ok: worst <= 1.5};
  }, E);
}
// the video job: the FM track as the track shot, 9:16
res.video = await p.evaluate(async () => {
  SYNQUENZER.vvTest({opus: true, spur: 1, probe: true}); SYNQUENZER.vv3Log(true);
  const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); const log = SYNQUENZER.vv3Log(true); SYNQUENZER.vvTest({});
  const r = VV.last, X = vv3Fmx(), snd = S.tracks[1].sound, notes = SYNQUENZER.vv3Notes(1);
  let mism = 0, n = 0, rises = 0, falls = 0;
  for (const q of log) { if (q.kind !== 'fm') continue; n++;
    // recomputed from the captured notes (max over the notes, as drawn) – and they move: a note on raises a carrier, it falls after
    const lv = [0, 1, 2, 3, 4, 5].map(k => { let m = 0; for (const o of notes) { if (o.removed || o.a > q.t) continue; const l = vv3FmLevel(X, snd.p.fm6, snd.p, k, {n: o.n, v: o.v, a: o.a, b: o.d != null ? o.a + o.d : Infinity}, q.t); if (l != null && l > m) m = l; } return m; });
    if (lv.some((l, k) => Math.abs(l - q.lv[k]) > 1e-6)) mism++;
  }
  for (let k = 1; k < log.length; k++) { const a = log[k - 1].lv[0], c = log[k].lv[0]; if (c > a + 50) rises++; if (c < a - 5) falls++; }
  return {frames: n, notes: notes.length, mismatch: mism, carrierRises: rises, carrierFalls: falls, dur: +x.dur.toFixed(2), ok: n > 100 && mism === 0 && rises > 3 && falls > 3};
});
res.ok = Object.values(res).every(x => x.ok);
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(new URL('../out-vv3-02.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
