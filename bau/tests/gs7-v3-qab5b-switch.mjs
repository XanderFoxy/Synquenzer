// QA VS5b: mode switch Dehnen ↔ Scheiben while playing, measured on the captured output (not the app's own log):
// M-KLICK and level dips vs. a capture of the same take without switching
import {launch, open5, sleep, toI16, clickTone, mKlick} from './gs7-v3-vs5b-h.mjs';
import {recStart, recStop} from './gs7-v3-qa-vs5a-h2.mjs';
globalThis.window = {}; let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const CSR = await p.evaluate(() => window.__ctx.sampleRate), sr = CSR;
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9, 15, -12, 28, -20, 7, -33, 24, -4, 19, -25, 11, -14, 30];
const T = OFF.map((o, k) => (0.5 + k * 0.25 + o / 1000) * 48000 / sr), x = clickTone(T.map(t => t * sr / 48000), 8.2);
const r = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 4}), [toI16(x), CSR]);
await p.evaluate(r => { const P = SYNQUENZER.project(); P.tracks.forEach((t, i) => { if (i !== r.track) for (let s = 0; s < 8; s++) { try { if (SYNQUENZER.getClip(i, s)) SYNQUENZER.setClip(i, s, null); } catch (e) {} } }); }, r);
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const ref = {t: r.track, s: 7};
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'slice'}), ref);
await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id);
await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id), y = Float32Array.from(Y.data);
await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(300);           // editor open → both versions cached
const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).warp, clip = await p.evaluate(r => SYNQUENZER.getClip(r.track, 7).audio, r);
function lag(cap) { // align first 0.5 s after clip in with y (Dehnen version) by sample search
  const ms = Math.round(sr / 1000), env = x => { const n = Math.floor(x.length / ms), e = new Float32Array(n); for (let k = 0; k < n; k++) { let s = 0; for (let i = k * ms; i < (k + 1) * ms; i++) s += x[i] * x[i]; e[k] = Math.sqrt(s / ms); } return e; };
  const ec = env(cap), er = env(y), f0 = Math.round((clip.in + 0.05) * 1000); let bl = 0, bs = -1;
  for (let l = -1000; l <= 3000; l++) { let s = 0; for (let k = f0; k < f0 + 500; k++) { const j = k + l; if (j >= 0 && j < ec.length) s += er[k] * ec[j]; } if (s > bs) { bs = s; bl = l; } }
  return bl * ms;
}
function dips(cap, d, att) { const tt = []; const W5 = Math.round(0.005 * sr), lv = []; for (let i = Math.round((clip.in + 0.2) * sr) + d; i + W5 < Math.min(cap.length - Math.round(0.4 * sr), Math.round(4.2 * sr) + d); i += Math.round(sr / 1000)) { const t = i / sr; if (att.some(a => t > a - 0.003 && t < a + 0.045)) continue; tt.push(t); let s = 0; for (let j = i; j < i + W5; j++) s += cap[j] * cap[j]; lv.push(10 * Math.log10(s / W5 + 1e-20)); } const so = [...lv].sort((a, b) => a - b), med = so[so.length >> 1], mi = lv.indexOf(so[0]); const low = []; lv.forEach((v, i) => { if (v - med < -4) low.push(+(tt[i] - d / sr).toFixed(3)); }); return {low: low.slice(0, 12), at: +(tt[mi] - d / sr).toFixed(4), min: +(so[0] - so[so.length >> 1]).toFixed(2), p1: +(so[Math.floor(so.length * 0.01)] - so[so.length >> 1]).toFixed(2)}; }
async function cap(toggle) {
  await recStart(p); window.__t0 = await p.evaluate(() => { SYNQUENZER.launchScene(7); SYNQUENZER.play(); return window.__ctx.currentTime; }); const _t0 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return c.start; }); if (toggle) global.T0 = {call: window.__t0, start: _t0};
  if (toggle) { await sleep(900); for (const m of ['slice', 'stretch', 'slice', 'stretch', 'slice', 'stretch']) { await p.evaluate(m => document.querySelector('#wpSheet .wpmode button[data-m="' + m + '"]').click(), m); await sleep(420); } await sleep(4600 - 900 - 6 * 420); }
  else await sleep(4600);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(150);
  const c = await recStop(p); return Float32Array.from(c.y);
}
const c0 = await cap(false), c1 = await cap(true);
await p.evaluate(r => SYNQUENZER.wpMode(r, 'slice'), ref); await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id);
const c2 = await cap(false);
const d0 = lag(c0), d1 = lag(c1), at0 = W.map.dst.slice(1, -1).map(t => t + d0 / sr), at1 = W.map.dst.slice(1, -1).map(t => t + d1 / sr);
const ys = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id)).data);
{ const seg = (a, b) => { let best = null; for (let o = -300; o <= 300; o++) { let e = 0, ee = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const u = c1[i + d1 + o], v = c0[i + d0]; if (u === undefined || v === undefined) continue; e += (u - v) * (u - v); ee += v * v; } const r = 10 * Math.log10(e / (ee + 1e-20)); if (!best || r < best.r) best = {r: +r.toFixed(1), o}; } return best; };
  const rows = []; for (let t = 0.3; t < 4.1; t += 0.1) rows.push(t.toFixed(1) + ':' + JSON.stringify(seg(t, t + 0.1))); console.log('  toggled vs reference capture (residual dB, offset samples):\n  ' + rows.join(' '));
  const lv = (c, d, a) => { let s = 0; const i0 = Math.round(a * sr) + d; for (let i = i0; i < i0 + Math.round(0.005 * sr); i++) s += c[i] * c[i]; return (10 * Math.log10(s / (0.005 * sr) + 1e-20)).toFixed(1); };
  console.log('  5-ms levels around 3.477: toggled', [3.44, 3.46, 3.477, 3.49].map(t => lv(c1, d1, t)).join(' '), ' ref', [3.44, 3.46, 3.477, 3.49].map(t => lv(c0, d0, t)).join(' ')); }
const ex = a => a.flatMap(t => [t, t + .003, t + .006, t + .009, t + .012, t + .015, t + .018, t + .021, t + .024, t + .027]);
const cut = (c, d) => c.subarray(0, Math.min(c.length - Math.round(0.4 * sr), Math.round(4.2 * sr) + d));
const k0 = mKlick(cut(c0, d0), ex(at0), sr), k1 = mKlick(cut(c1, d1), ex(at1), sr), D0 = dips(c0, d0, at0), D1 = dips(c1, d1, at1);
const sw = (await p.evaluate(() => SYNQUENZER.wpSwitchInfo(true))).filter(s => s.pairs > 0);
console.log('  lags', d0, d1, 'cap len', c0.length / sr, c1.length / sr);
console.log('  play start', JSON.stringify(global.T0), 'switch at (s after start):', sw.map(x => (x.at - global.T0.start).toFixed(3)).join(' '));
const d2 = lag(c2), at2 = at0.map(t => t - d0 / sr + d2 / sr); console.log('  all-Scheiben dips', JSON.stringify(dips(c2, d2, at2)), 'clip.in', clip.in);
ok(k1.worst <= k0.worst + 3, 'M-KLICK while switching modes ' + JSON.stringify(k1) + ' vs without switching ' + JSON.stringify(k0));
ok(D1.min >= D0.min - 3, 'level dips while switching ' + JSON.stringify(D1) + ' vs without ' + JSON.stringify(D0));
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
