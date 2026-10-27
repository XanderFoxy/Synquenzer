// QA VS4 D (FP-DSP): A/B and SÄUBERN changes while the take plays: no click (2nd difference vs tone curvature), no dropout
import {launch, open, sleep} from './v3-qa-vs4-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null), ctx = await br.newContext({viewport: {width: 390, height: 844}});
const H = await open(br, {ctx}), p = H.p;
const SR = await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); return window.__ctx.sampleRate; });
const F = 440, A = 0.3, n = Math.round(SR * 8), pcm = new Array(n);
// sine with slow amplitude steps (0.3 / 0.15) so raw and cleaned differ by the noise floor only; tiny noise for the Wiener profile
let s = 5; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; const t = i / SR, g = process.env.STEP ? (Math.floor(t / 1.3) % 2 ? 0.5 : 1) : 1; pcm[i] = Math.round((A * g * Math.sin(2 * Math.PI * F * t) + (s / 2147483647 - 0.5) * (process.env.NZ ? +process.env.NZ : 0)) * 32767); }
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 2, len: 4}), [pcm, SR]), id = r.id;
await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
await p.evaluate(st => { for (let t = 0; t < 8; t++) if (t !== st) { try { SYNQUENZER.setMute(t, true); } catch (e) {} } }, r.track);
await p.evaluate(() => window.__recOut());
await p.evaluate(() => SYNQUENZER.launchScene(2)); await sleep(1200);
const ev = [];
const acts = [['ab', 'roh'], ['ab', 'sauber'], ['cl', 60], ['ab', 'roh'], ['ab', 'sauber'], ['cl', 100], ['ab', 'roh'], ['ab', 'sauber']];
for (const [k, v] of acts) { await sleep(450 + Math.random() * 200); const t = await p.evaluate(([k, v, id]) => { const t = window.__ctx.currentTime; if (k === 'ab') SYNQUENZER.clAB(v); else SYNQUENZER.clSet(id, v); return t; }, [k, v, id]); ev.push([k, v, t]); if (k === 'cl') await p.evaluate(id => SYNQUENZER.clWait(id), id); }
await sleep(800);
const rec = await p.evaluate(() => { window.__sp.onaudioprocess = null; const a = window.__rec; const n = a.reduce((s, x) => s + x.length, 0), o = new Float32Array(n); let k = 0; for (const x of a) { o.set(x, k); k += x.length; } return {x: Array.from(o), t0: window.__ctx.currentTime - n / window.__ctx.sampleRate}; });
await p.evaluate(() => SYNQUENZER.stop());
const x = rec.x, curv = A * (2 * Math.PI * F / SR) ** 2;
// level of the tone per 5 ms; the take has two levels (A and A/2) → compare each window with the median of its neighbours (±60 ms)
const W = Math.round(0.005 * SR), lv = []; for (let k = 0; k + W <= x.length; k += W) { let e = 0; for (let i = k; i < k + W; i++) e += x[i] * x[i]; lv.push(Math.sqrt(e / W)); }
let worstDip = 0, worstD2 = 0, at = null, dipAt = null;
for (const [k, v, t] of ev) {
  const c = Math.round((t - rec.t0) * SR); if (c < SR * 0.2 || c > x.length - SR * 0.2) continue;
  const w0 = Math.floor(c / W);
  for (let j = w0 - 2; j <= w0 + 12; j++) { const nb = []; for (let q = j - 12; q <= j + 12; q++) if (Math.abs(q - j) > 3 && lv[q] != null) nb.push(lv[q]); nb.sort((a, b) => a - b); const med = nb[nb.length >> 1]; if (med > 0.05) { const d = 20 * Math.log10(med / (lv[j] + 1e-9)); if (d > worstDip) { worstDip = d; dipAt = [k, v, ((j * W) / SR).toFixed(3), +(lv[j]).toFixed(3), +med.toFixed(3)]; } } }
  for (let i = c - Math.round(0.01 * SR); i < c + Math.round(0.06 * SR); i++) { const d2 = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]); const lvl = lv[Math.floor(i / W)] / (A / Math.SQRT2); const rel = d2 / (curv * Math.max(0.5, lvl)); if (rel > worstD2) { worstD2 = rel; at = [k, v]; } }
}
// reference: same metric away from switches
let base = 0; for (let i = Math.round(SR * 0.3); i < Math.round(SR * 0.9); i++) base = Math.max(base, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]) / curv);
// all spikes in the whole recording (10 ms clusters) with distance to the nearest event
const sp = []; let last = -1e9; for (let i = 2; i < x.length; i++) { const lvl = lv[Math.floor(i / W)] / (A / Math.SQRT2); if (lvl < 0.3) continue; const rel = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]) / (curv * Math.max(0.5, lvl)); if (rel > 1.5 && i - last > SR * 0.01) { last = i; const tt = rec.t0 + i / SR; let ne = null, nd = 1e9; for (const e of ev) { const d = tt - e[2]; if (Math.abs(d) < Math.abs(nd)) { nd = d; ne = e[0] + ':' + e[1]; } } sp.push(`${(i / SR).toFixed(3)}s rel ${rel.toFixed(2)} lvl ${lvl.toFixed(2)} near ${ne} ${(nd * 1000).toFixed(0)}ms`); } }
console.log('  spikes:', sp.length, JSON.stringify(sp.slice(0, 12)));
const st0 = await p.evaluate(() => 0);
console.log('  events', ev.length, 'rec', (x.length / SR).toFixed(2), 's; base d2', base.toFixed(2));
ok(worstD2 <= 1.5, `no click at A/B and strength changes while playing: max 2nd difference ${worstD2.toFixed(2)} x tone curvature (<= 1.5) at ${JSON.stringify(at)}`);
ok(worstDip <= 3, `no dropout: worst level dip near a switch ${worstDip.toFixed(1)} dB (<= 3) ${JSON.stringify(dipAt)}`);
console.log('  events at (s in rec):', ev.map(e => e[0] + ':' + e[1] + '@' + (e[2] - rec.t0).toFixed(3)).join(' '));
console.log('  level per 50 ms:', (() => { const o = []; for (let j = 0; j < lv.length; j += 10) o.push(lv[j].toFixed(2)); return o.join(' '); })());
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
