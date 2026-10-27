// QA VS5b: a Dehnen take placed in the song plays the stretched version (heard == rendered), like the scene
import {launch, open5, sleep, toI16, clickTone, rmsDbR} from './gs7-v3-vs5b-h.mjs';
import {recStart, recStop} from './gs7-v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 4.2);
const CSR = await p.evaluate(() => window.__ctx.sampleRate); console.log('  ctx sr', CSR);
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 2}), [toI16(x), CSR]);
await p.evaluate(r => { const P = SYNQUENZER.project(); P.tracks.forEach((t, i) => { if (i !== r.track) for (let s = 0; s < 8; s++) { try { if (SYNQUENZER.getClip(i, s)) SYNQUENZER.setClip(i, s, null); } catch (e) {} } }); }, r);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 7}, {grid: '1/16', strength: 1, mode: 'stretch'}), r);
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id), y = Float32Array.from(Y.data), sr = Y.sr || 48000;
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
const clip = await p.evaluate(r => SYNQUENZER.getClip(r.track, 7).audio, r);
function resid(cap, ref, from, len) {
  const ms = Math.round(sr / 1000), env = x => { const n = Math.floor(x.length / ms), e = new Float32Array(n); for (let k = 0; k < n; k++) { let s = 0; for (let i = k * ms; i < (k + 1) * ms; i++) s += x[i] * x[i]; e[k] = Math.sqrt(s / ms); } return e; };
  const ec = env(cap), er = env(ref), f0 = Math.round(from * 1000), L = Math.round(len * 1000);
  let bl = 0, bs = -1; for (let lag = -1000; lag <= 4000; lag++) { let s = 0; for (let k = f0; k < f0 + L; k++) { const j = k + lag; if (j >= 0 && j < ec.length) s += er[k] * ec[j]; } if (s > bs) { bs = s; bl = lag; } }
  let best = null; for (let d = bl * ms - 3 * ms; d <= bl * ms + 3 * ms; d++) { let xy = 0, xx = 0; const a = Math.round(from * sr), b = Math.round((from + len) * sr); for (let i = a; i < b; i++) { const j = i + d; if (j >= 0 && j < cap.length) { xy += ref[i] * cap[j]; xx += ref[i] * ref[i]; } } const g = xy / (xx + 1e-20); let e = 0, ee = 0; for (let i = a; i < b; i++) { const j = i + d; if (j >= 0 && j < cap.length) { const q = cap[j] - g * ref[i]; e += q * q; ee += cap[j] * cap[j]; } } const res = 10 * Math.log10(e / (ee + 1e-20)); if (!best || res < best.res) best = {d, g, res}; }
  return best;
}
// scene
await recStart(p); await p.evaluate(() => { SYNQUENZER.launchScene(7); SYNQUENZER.play(); }); await sleep(4600); await p.evaluate(() => SYNQUENZER.stop()); await sleep(150);
let c1 = await recStop(p); const A1 = resid(Float32Array.from(c1.y), y, clip.in + 0.1, 3.5), A1r = resid(Float32Array.from(c1.y), raw, clip.in + 0.1, 3.5);
ok(A1.res < -25 && A1r.res > A1.res + 10, 'scene: heard == stretched (residual ' + A1.res.toFixed(1) + ' dB; vs raw ' + A1r.res.toFixed(1) + ' dB)');
// song
await p.evaluate(() => SYNQUENZER.setSong(null));
const a = await p.evaluate(() => SYNQUENZER.placePart('S8', 0, 'insert'));
await recStart(p); await p.evaluate(() => SYNQUENZER.songPlay(0)); await sleep(4600); await p.evaluate(() => SYNQUENZER.stop()); await sleep(150);
let c2 = await recStop(p); const A2 = resid(Float32Array.from(c2.y), y, clip.in + 0.1, 3.5), A2r = resid(Float32Array.from(c2.y), raw, clip.in + 0.1, 3.5);
ok(a && A2.res < -25 && A2r.res > A2.res + 10, 'song: heard == stretched (residual ' + A2.res.toFixed(1) + ' dB; vs raw ' + A2r.res.toFixed(1) + ' dB) placed ' + a);
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
