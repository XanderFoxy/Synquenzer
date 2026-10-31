// VV3-01: LFO 1 (≈1 Hz) → CUTOFF. (a) the model of the picture against the engine itself (test tap 'lfo' of the worklet: the LFO
// value of the sounding voice per sample), four Key-Sync / Tempo-Sync cases; (b) the real video job: per frame the drawn LFO phase
// and cutoff pointer against the rechnung (frac(t · Hz), cut + i/63 · 127 · LFO)
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await setup(p, {});
const res = {};
// (a) engine truth
const cases = [['frei, Key Sync aus', {sync: 0, ks: 0}], ['Tempo-Sync 1/2 (1 Hz bei 120), Key Sync aus', {sync: 1, ks: 0}], ['Key Sync Timbre', {sync: 0, ks: 1}], ['Key Sync Stimme', {sync: 0, ks: 2}]];
for (const [name, c] of cases) {
  res['a: ' + name] = await p.evaluate(async c => {
    SYNQUENZER.mkSet(2, 't.0.l1.sync', c.sync); SYNQUENZER.mkSet(2, 't.0.l1.ks', c.ks); SYNQUENZER.mkSet(2, 't.0.l1.w', 0); SYNQUENZER.mkSet(2, 't.0.p.0.i', 20);
    const snd = JSON.parse(JSON.stringify(S.tracks[2].sound)), sr = AU.ctx.sampleRate, songStart = .3;
    const N = [[.5, 2.4, 57], [2.9, 5.6, 60], [3.4, 4.2, 64]];             // engine seconds; the third overlaps the second
    const ev = []; for (const [a, b, n] of N) { ev.push([a, 'on', n, .8], [b, 'off', n]); }
    ev.sort((x, y) => x[0] - y[0]);
    const out = await SYNQUENZER.mkRender(snd, ev, {tap: 'lfo', sec: 6, sr, bpm: 120, songStart});
    const T = snd.p.mk.t[0], src = {t0: songStart, bpm: 120};
    const notes = N.map(([a, b, n]) => ({a: a - songStart, b: b - songStart, n, v: .8}));
    let worst = 0, cnt = 0, sum = 0; const samples = [];
    for (let f = 0; f < 6 * 30; f++) {
      const tau = f / 30; if (tau < .52 || (tau > 2.4 && tau < 2.92) || tau > 5.6) continue;   // the tap shows the oldest sounding voice
      const k = Math.round(tau * sr), v = out.l[k]; if (!isFinite(v)) continue;
      const tv = tau - songStart, act = notes.filter(x => x.a <= tv);
      // the oldest sounding voice is the one the tap shows; Key Sync Stimme: its own phase from its note on
      const old = act.filter(x => x.b >= tv)[0];
      const L = vv3MkLfo(T, 1, tv, src, c.ks === 2 ? [old] : act, 120);
      const phE = v >= 0 ? v / 2 : (v + 2) / 2, d = Math.abs(((L.ph - phE + 1.5) % 1) - .5);
      worst = Math.max(worst, d); sum += d; cnt++; if (samples.length < 4) samples.push({tau, model: +L.ph.toFixed(4), engine: +phE.toFixed(4)});
    }
    return {rateHz: +vv3MkLfo(T, 1, 1, src, [], 120).rate.toFixed(4), frames: cnt, maxPhaseErrPct: +(worst * 100).toFixed(3), meanPct: +(sum / cnt * 100).toFixed(3), samples, ok: worst <= .02};
  }, c);
}
// (b) the video job (Tempo-Sync 1 Hz and frei), 16:9, WebCodecs (Opus test switch as in VV1)
for (const [name, c] of [['Tempo-Sync 1 Hz', {sync: 1}], ['frei 1,01 Hz', {sync: 0}]]) {
  const m = await p.evaluate(async c => {
    SYNQUENZER.mkSet(2, 't.0.l1.sync', c.sync); SYNQUENZER.mkSet(2, 't.0.l1.ks', 0);
    SYNQUENZER.vvTest({opus: true, spur: 2, probe: true}); SYNQUENZER.vv3Log(true);
    const x = await SYNQUENZER.vvMake({fmt: '16:9', view: 'song'}); const log = SYNQUENZER.vv3Log(true); SYNQUENZER.vvTest({});
    const T = S.tracks[2].sound.p.mk.t[0], W = MKW_(), t0 = SYNQUENZER.vv3T0(), hz = c.sync ? 1 / (W.LSYNC[T.l1.note] * 4 * 60 / S.bpm) : W.lfoHz(T.l1.f);
    let worst = 0, wc = 0, n = 0; const bad = [];
    log.forEach((q, f) => {
      if (q.kind !== 'mk') return; n++;
      const ph = c.sync ? (q.t * hz) % 1 : ((q.t + t0) * hz) % 1, d = Math.abs(((q.ph1 - ph + 1.5) % 1) - .5); worst = Math.max(worst, d);
      // cutoff while a note sounds (EG 1 INT 0, KBD 0, VEL 0): CUTOFF knob + PATCH 1 intensity / 63 · 127 · saw(phase)
      const v = ph < .5 ? 2 * ph : 2 * ph - 2, cutE = Math.max(0, Math.min(127, T.f.cut + T.p[0].i / 63 * 127 * v));
      if (q.e2 > .01) { const dc = Math.abs(q.cut - cutE); if (dc > wc) wc = dc; if (dc > 1 && bad.length < 3) bad.push({t: q.t, cut: q.cut, cutE}); }
    });
    return {frames: n, dur: +x.dur.toFixed(2), hz: +hz.toFixed(4), maxPhaseErrPct: +(worst * 100).toFixed(3), maxCutErr: +wc.toFixed(3), bad, ok: n > 100 && worst <= .02 && wc <= 1};
  }, c);
  res['b: ' + name] = m;
}
res.ok = Object.values(res).every(x => x.ok);
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(new URL('../out-vv3-01.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
