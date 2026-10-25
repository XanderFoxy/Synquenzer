// QA G-MK1: detector baseline (idle), latency of a step change MK vs VA, ECO toggle with held chord MK vs VA
import {open, sleep, OUT, check, done, recStart} from './v3-qa-gmk1-tl.mjs';
import fs from 'fs';
const T = await open(); const {p, E, errs} = T;
await E(async () => { const Q = SYNQUENZER; Q.setMetronome(false); Q.selectTrack(0); Q.setEngine(0, 'mk');
  for (const [k, v] of Object.entries({'t.0.o2.w': 1, 't.0.o2.semi': 7, 't.0.mix.o2': 70, 't.0.f.cut': 100, 't.0.f.res': 30, 't.0.e2.s': 127, 't.0.e2.r': 30, 't.0.e1.s': 127})) Q.mkSet(0, k, v); return 1; });
await E(() => { if (!AU.ctx) ensureAudio(); }); await sleep(300);
await recStart(E, 120);
const acts = [];
const mark = async (name, fn, gap = 700) => { const t = await E(() => AU.ctx.currentTime); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } acts.push({name, t, r: typeof r === 'object' ? JSON.stringify(r) : String(r)}); await sleep(gap); };
const hold = () => E(() => { SYNQUENZER.keyOn(48, .8, 'c1'); SYNQUENZER.keyOn(55, .8, 'c2'); SYNQUENZER.keyOn(64, .8, 'c3'); });
const rel = () => E(() => { SYNQUENZER.keyOff(48, 'c1'); SYNQUENZER.keyOff(55, 'c2'); SYNQUENZER.keyOff(64, 'c3'); });
await hold(); await sleep(800);
for (let k = 0; k < 8; k++) await mark('MK idle ' + k, async () => 1);
await mark('MK cutoff step 100 → 20 (mkSet)', () => E(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 20)), 900);
await mark('MK cutoff step 20 → 100 (mkSet)', () => E(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 100)), 900);
await mark('MK ECO on', () => E(() => { SYNQUENZER.forceNative(true); return SYNQUENZER.voices().length; }), 900);
await mark('MK ECO off', () => E(() => { SYNQUENZER.forceNative(false); return SYNQUENZER.voices().length; }), 900);
await rel(); await sleep(600);
await E(() => SYNQUENZER.setEngine(0, 'va')); await sleep(300);
await E(() => { SYNQUENZER.setParam(0, 'cutoff', 3000); SYNQUENZER.setParam(0, 'aS', 1); SYNQUENZER.setParam(0, 'fS', 1); });
await hold(); await sleep(800);
for (let k = 0; k < 4; k++) await mark('VA idle ' + k, async () => 1);
await mark('VA cutoff step 3000 → 200 (setParam)', () => E(() => SYNQUENZER.setParam(0, 'cutoff', 200)), 900);
await mark('VA cutoff step 200 → 3000 (setParam)', () => E(() => SYNQUENZER.setParam(0, 'cutoff', 3000)), 900);
await mark('VA ECO on', () => E(() => { SYNQUENZER.forceNative(true); return SYNQUENZER.voices().length; }), 900);
await mark('VA ECO off', () => E(() => { SYNQUENZER.forceNative(false); return SYNQUENZER.voices().length; }), 900);
await rel(); await sleep(600);
await mark('end', async () => 1, 300);
const A = await E(acts => {
  const Q = window.__q; try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
  const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 2000, .5412), 2000, 1.3066);
  const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(10 * Math.log10(s / W + 1e-20)); }
  const lv = (t, w) => { const i = Math.round((t - t0) * sr), n = Math.round(w * sr); let s = 0; for (let k = i; k < i + n; k++) s += x[k] * x[k]; return 10 * Math.log10(s / n + 1e-20); };
  return acts.map(a => { const j0 = Math.floor((a.t - t0) / .002); const before = e.slice(j0 - 25, j0).reduce((s, v) => s + v, 0) / 25; let jch = -1; for (let j = j0; j < j0 + 300; j++) if (Math.abs(e[j] - before) > 6) { jch = j; break; } return {n: a.name, r: a.r, hpBefore: +before.toFixed(1), changeMs: jch < 0 ? null : (jch - j0) * 2, lvl300: +lv(a.t + .3, .1).toFixed(1), lvl800: +lv(a.t + .75, .1).toFixed(1)}; });
}, acts);
for (const o of A) console.log(JSON.stringify(o));
fs.writeFileSync(OUT + 'clk2-acts.json', JSON.stringify({acts, f0: await E(() => window.__q.f0), sr: await E(() => window.__q.sr)}));
const NS = await E(() => window.__q.n), CH = 1 << 20; const parts = [];
for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH]) => { const x = window.__q.buf.subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH]), 'base64'));
fs.writeFileSync(OUT + 'clk2-audio.f32', Buffer.concat(parts));
console.log('errs', errs);
await T.br.close();
