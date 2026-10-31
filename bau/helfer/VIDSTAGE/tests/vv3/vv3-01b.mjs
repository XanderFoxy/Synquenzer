// VV3-01 (Nachtest-Fälle): PATCH → LFO2 FREQ (Anschlag, EG 2), Key Sync Timbre mit Legato-Noten (Ende = nächster Anfang),
// eine lange gehaltene Note (32 s bei 60 BPM) – jeweils Rechnung des Bildes gegen den Test-Abgriff der Klangerzeugung
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
await setup(p, {});
const res = await p.evaluate(async () => {
  const out = {}, base = JSON.parse(JSON.stringify(S.tracks[2].sound)), sr = AU.ctx.sampleRate;
  const run = async (name, mod, N, tap, n, sec, bpm) => {
    const snd = JSON.parse(JSON.stringify(base)); mod(snd.p.mk.t[0]); const T = snd.p.mk.t[0];
    const ev = []; for (const [a, b_, k] of N) ev.push([a, 'on', k, .8], [b_, 'off', k]); ev.sort((x, y) => x[0] - y[0]);
    const o = await SYNQUENZER.mkRender(snd, ev, {tap, sec, sr, bpm: bpm || 120, songStart: 0});
    // the model sees the notes as the picture does (src.nt), the sound of track 2 replaced for the moment (restored below)
    const keep = S.tracks[2].sound; S.tracks[2].sound = SQStore.normalizeSound(snd); VV3.ic = {};
    const src = {t0: 0, bpm: bpm || 120, nt: []}; src.nt[2] = N.map(([a, b_, k]) => ({a, e: {out: k, vel: .8, dur: b_ - a}})); src.nt[2].mx = Math.max(...N.map(x => x[1] - x[0]));
    let worst = 0, cnt = 0; const bad = [];
    for (let f = 1; f < sec * 30; f++) { const t = f / 30; const act = N.filter(x => x[0] <= t && x[1] >= t); if (!act.length || act.some(x => t - x[0] < .03)) continue;
      const v = o.l[Math.round(t * sr)], ph = v >= 0 ? v / 2 : (v + 2) / 2, ms = vv3MkState(2, t, {sb: t / (60 / (bpm || 120))}, src), L = n === 1 ? ms.l1 : ms.l2;
      const d = Math.abs(((L.ph - ph + 1.5) % 1) - .5); cnt++; if (d > worst) worst = d; if (d > .02 && bad.length < 3) bad.push({t: +t.toFixed(3), model: +L.ph.toFixed(3), engine: +ph.toFixed(3)}); }
    S.tracks[2].sound = keep;
    out[name] = {frames: cnt, maxPhaseErrPct: +(worst * 100).toFixed(2), bad, ok: cnt > 20 && worst <= .02};
  };
  await run('PATCH Anschlag → LFO2 FREQ (Key Sync aus)', T => { T.l2.w = 0; T.l2.f = 40; T.l2.ks = 0; T.l2.sync = 0; T.p[0] = {s: 4, d: 7, i: 30}; }, [[.5, 2.5, 60], [3, 4.5, 64]], 'lfo2', 2, 5);
  await run('PATCH EG 2 → LFO2 FREQ (Key Sync Stimme)', T => { T.l2.w = 0; T.l2.f = 40; T.l2.ks = 2; T.l2.sync = 0; T.p[0] = {s: 1, d: 7, i: 20}; T.e2.a = 60; }, [[.5, 2.5, 60]], 'lfo2', 2, 3);
  await run('Key Sync Timbre, Legato-Noten', T => { T.l1.w = 0; T.l1.ks = 1; T.l1.sync = 1; T.l1.note = 3; }, [[.5, 1.3, 57], [1.3, 2.1, 60], [2.1, 3.0, 64]], 'lfo', 1, 3.2);
  await run('lange Note 32 s bei 60 BPM, Key Sync Timbre', T => { T.l1.w = 0; T.l1.ks = 1; T.l1.sync = 0; }, [[.2, 32, 60]], 'lfo', 1, 33, 60);
  return out;
});
res.ok = Object.values(res).every(x => x.ok);
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(new URL('../out-vv3-01b.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
