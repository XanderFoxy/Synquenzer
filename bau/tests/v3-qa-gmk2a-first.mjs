// fresh device: open a project whose lead plays octave wave 61 (Stimme 1) and press ▶ at once: how long does the placeholder
// saw sound before the stored wave? (raw track output, HF ratio per 5 ms window of the first note vs. a later note)
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
import {recStart} from './v3-qa-gmk2a-rec.mjs';
import fs from 'fs';
const txt0 = JSON.parse(fs.readFileSync(OUT + 'rt-project.json', 'utf8'));
const T = await open(); const {p, E, errs} = T;
// lead (track 3) = wave 61, attack 0, filter open; scene 2 holds the lead clip
const ok = await E(t => { const P = JSON.parse(t); const tr = (P.project || P).tracks[3]; tr.sound.p.mk.t[0].o1 = {w: 5, c1: 0, c2: 120}; tr.sound.p.mk.t[0].f.cut = 127; tr.sound.p.mk.t[0].e2.a = 0; tr.sound.p.mk.t[0].p[3].i = 0; return SYNQUENZER.importJSON(JSON.stringify(P)); }, JSON.stringify(txt0));
await T.tap(214, 140, 50);   // first touch unlocks audio
await recStart(E, 8, [3]);
await T.tapTxt('button.scn', /^▶\s*2/); 
await sleep(4000);
const r = await E(() => { const Q = window.__q, sr = Q.sr, x = Q.bufs[1].subarray(0, Q.n); const ons = SYNQUENZER.noteLog(400).filter(n => n.track === 3).map(n => n.time).sort((a, b) => a - b); const t0 = Q.f0 / sr;
  const W = Math.round(sr * .005); const hfr = (i) => { let lo = 0, hi = 0, p1 = 0, p2 = 0; for (let k = i; k < i + W; k++) { const d = x[k] - x[k - 1]; hi += d * d; lo += x[k] * x[k]; } return 10 * Math.log10(hi / (lo + 1e-12) + 1e-12); };
  const out = ons.slice(0, 3).map(t => { const i0 = Math.round((t - t0) * sr); const a = []; for (let k = 0; k < 16; k++) a.push(+hfr(i0 + k * W + 1).toFixed(1)); return a; });
  return {ons: ons.slice(0, 3).map(t => +(t - t0).toFixed(3)), out, info: SYNQUENZER.mkInfo(), at: null}; });
console.log(JSON.stringify(r));
const first = r.out[0], later = r.out[2] || r.out[1];
const nBad = first.filter((v, k) => v > later[k] + 6).length;
check('first lead note after opening the project: placeholder saw ≤ 30 ms (≤ 6 windows of 5 ms brighter by > 6 dB)', nBad <= 6, {nBad, first, later});
check('no console errors', errs.length === 0, errs);
await T.br.close(); done();
