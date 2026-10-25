// QA G-MK1: held chord on an MS 2000 track, every kind of in-app change while it sounds; M-KLICK (HP 5 kHz, 2-ms windows,
// +6 dB over the median ±20 ms) and M-EINBRUCH (5-ms windows ±50 ms, ≤ 3 dB under the mean −50…−10 ms) at each change.
import {open, sleep, OUT, check, done, recStart} from './v3-qa-gmk1-tl.mjs';
import fs from 'fs';
const T = await open(); const {p, E, errs} = T;
await E(async () => { const Q = SYNQUENZER; Q.setMetronome(false); for (const t of [1, 2, 3, 5]) Q.setMute && Q.setMute(t, true); Q.selectTrack(0); Q.setEngine(0, 'mk');
  for (const [k, v] of Object.entries({'t.0.o2.w': 1, 't.0.o2.semi': 7, 't.0.mix.o2': 70, 't.0.f.cut': 100, 't.0.f.res': 30, 't.0.e2.s': 127, 't.0.e2.r': 30, 't.0.e1.s': 127})) Q.mkSet(0, k, v);
  await Q.saveSound(0, 'Bass A', 'new'); Q.mkSet(0, 't.0.o1.w', 1); Q.mkSet(0, 't.0.f.cut', 70); await Q.saveSound(0, 'Lead Sync', 'new'); Q.undo(); Q.undo(); return 1; });
await E(() => SYNQUENZER.openEditor()); await sleep(500);
await E(() => { if (!AU.ctx) ensureAudio(); }); await sleep(300);
await recStart(E, 200);
const acts = [];
const mark = async (name, fn, gap = 700) => { const t = await E(() => AU.ctx.currentTime); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } acts.push({name, t, r: typeof r === 'object' ? JSON.stringify(r) : String(r)}); await sleep(gap); };
const api = (t, path, v) => E(([t, path, v]) => SYNQUENZER.mkSet(t, path, v), [t, path, v]);
const hold = () => E(() => { SYNQUENZER.keyOn(48, .8, 'c1'); SYNQUENZER.keyOn(55, .8, 'c2'); SYNQUENZER.keyOn(64, .8, 'c3'); });
const rel = () => E(() => { SYNQUENZER.keyOff(48, 'c1'); SYNQUENZER.keyOff(55, 'c2'); SYNQUENZER.keyOff(64, 'c3'); });
await hold(); await sleep(800);
const sweep = async (k, dy, ms = 1000) => { const r = await T.mk(k); const n = Math.round(ms / 20); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy + dy, n, 20); await T.up(); };
// continuous: SPIEL knobs by touch (1 s full way)
await mark('CUTOFF sweep 1 s (touch)', async () => { await sweep('k0', 200, 1000); await sweep('k0', -200, 1000); }, 400);
await mark('RESO sweep (touch)', async () => { await sweep('k1', -200, 1000); await sweep('k1', 200, 1000); }, 400);
await mark('ATTACK/RELEASE sweep (touch)', async () => { await sweep('k3', -100, 600); await sweep('k3', 100, 600); }, 400);
await mark('VOLUME sweep (touch)', async () => { await sweep('vol', 100, 600); await sweep('vol', -100, 600); }, 400);
// structural (list values): API = same soundEdit → mkSetP path as the list tap
for (const [nm, path, vals] of [['OSZ1 WELLE', 't.0.o1.w', [1, 2, 0]], ['OSZ2 WELLE', 't.0.o2.w', [0, 2, 1]], ['OSC MOD', 't.0.o2.mod', [1, 2, 3, 0]], ['FILTER TYP', 't.0.f.type', [1, 2, 3, 0]], ['HK│GATE', 't.0.a.gate', [1, 0]], ['VERZERR.', 't.0.a.dist', [1, 0]], ['ZUWEISUNG', 't.0.asg', [0, 2, 1]], ['PRIORITÄT', 't.0.prio', [1, 2, 0]], ['AUSLÖSUNG', 't.0.trig', [0, 1]], ['LFO1 WELLE', 't.0.l1.w', [0, 3, 2]], ['NEUSTART EG2', 't.0.e2.rst', [0, 1]]])
  for (const v of vals) await mark(nm + ' → ' + v, () => api(0, path, v));
for (const [nm, path, vals] of [['TRANSP.', 't.0.trans', [12, 0]], ['HALBTON OSZ2', 't.0.o2.semi', [12, 0, 7]], ['PAN', 't.0.a.pan', [-63, 63, 0]], ['PEGEL', 't.0.a.lvl', [40, 127]], ['MIX OSZ2', 't.0.mix.o2', [127, 0, 70]], ['RAUSCHEN', 't.0.mix.n', [127, 0]], ['STEUER 1', 't.0.o1.c1', [127, 0]], ['UNI-VERST.', 't.0.udet', [60, 10]], ['FEIN', 't.0.tune', [50, 0]]])
  for (const v of vals) await mark(nm + ' → ' + v + ' (step)', () => api(0, path, v));
// whole-sound changes while the chord is held
await mark('number key 1 → program Bass A (touch)', async () => { await T.tapMk('n0', 50); return E(() => SYNQUENZER.getSound(0).name); });
await mark('number key 2 → program Lead Sync (touch)', async () => { await T.tapMk('n1', 50); return E(() => SYNQUENZER.getSound(0).name); });
await mark('undo (program back)', () => E(() => { SYNQUENZER.undo(); return SYNQUENZER.getSound(0).name; }));
await mark('redo', () => E(() => { SYNQUENZER.redo(); return SYNQUENZER.getSound(0).name; }));
await mark('⋯ Init', () => E(() => { SYNQUENZER.initSound(0); return SYNQUENZER.getSound(0).name; }));
await mark('undo Init', () => E(() => { SYNQUENZER.undo(); return SYNQUENZER.getSound(0).name; }));
await mark('🎲', () => E(() => { SYNQUENZER.randomize(0); return SYNQUENZER.mkGet(0).t[0].o1; }));
await mark('undo 🎲', () => E(() => { SYNQUENZER.undo(); return 1; }));
await mark('engine MS 2000 → VA', () => E(() => { SYNQUENZER.setEngine(0, 'va'); return SYNQUENZER.getSound(0).engine; }), 900);
await mark('engine VA → MS 2000', () => E(() => { SYNQUENZER.setEngine(0, 'mk'); return SYNQUENZER.getSound(0).engine; }), 900);
await mark('engine MS 2000 → FM', () => E(() => { SYNQUENZER.setEngine(0, 'fm'); return SYNQUENZER.getSound(0).engine; }), 900);
await mark('engine FM → MS 2000', () => E(() => { SYNQUENZER.setEngine(0, 'mk'); return SYNQUENZER.getSound(0).engine; }), 900);
await mark('ECO on', () => E(() => { SYNQUENZER.forceNative(true); return 1; }), 900);
await mark('ECO off', () => E(() => { SYNQUENZER.forceNative(false); return 1; }), 900);
await mark('MOD wheel 0 → 1 (API)', () => E(() => { SYNQUENZER.mkSet(0, 't.0.vib', 63); return SYNQUENZER.mkWheel(0, 'mod', 1); }), 900);
await mark('MOD wheel 1 → 0', () => E(() => SYNQUENZER.mkWheel(0, 'mod', 0)), 600);
await mark('BEND wheel up + release (touch)', async () => { const r = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; }); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy - r.h / 2, 10, 20); await sleep(300); await T.up(); return 1; }, 900);
await rel(); await sleep(1500);
await mark('end', async () => 1, 300);
const A = await E(acts => {
  const Q = window.__q; try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
  const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
  const gapT = Q.gaps.filter(([a, b]) => b - a > 128).map(([a, b]) => [(a + 128 - Q.f0) / sr + t0 - .012, (b - Q.f0) / sr + t0 + .012]); const inGap = t => gapT.some(([a, b]) => t >= a && t <= b);
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
  const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
  const W5 = Math.round(sr * .005), lv = t => { const i = Math.round((t - t0) * sr); let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; return 10 * Math.log10(s / W5 + 1e-20); };
  const out = [];
  for (let a = 0; a < acts.length; a++) {
    const ta = acts[a].t, tb = a + 1 < acts.length ? acts[a + 1].t : ta + .7;
    let worst = -99, wt = 0;
    for (let j = Math.max(10, Math.floor((ta - t0 - .02) / .002)); j < Math.min(e.length - 10, Math.floor((tb - t0) / .002)); j++) { const t = t0 + j * .002; if (inGap(t)) continue; const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((p, q) => p - q), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > worst && e[j] > 1e-10) { worst = db; wt = t; } }
    // M-EINBRUCH around the switch point (search the actual change: ta .. ta+150 ms, 1-ms steps)
    let ein = 0; for (let tc = ta + .005; tc < Math.min(tb, ta + .25); tc += .01) { const ref = []; for (let d = -.05; d < -.01; d += .001) ref.push(Math.pow(10, lv(tc + d) / 10)); const m = 10 * Math.log10(ref.reduce((s, v) => s + v, 0) / ref.length); for (let d = 0; d <= .05; d += .001) { const dd = lv(tc + d) - m; if (dd < ein) ein = dd; } }
    out.push({n: acts[a].name, r: acts[a].r.slice(0, 40), klick: +worst.toFixed(1), at: +(wt - ta).toFixed(3), ein: +ein.toFixed(1), lvl: +lv(ta + .3).toFixed(1)});
  }
  return {out, gaps: gapT.length};
}, acts);
for (const o of A.out) console.log((o.klick > 6 ? 'KLICK ' : '      ') + (o.ein < -3 ? 'EINBR ' : '      ') + JSON.stringify(o));
fs.writeFileSync(OUT + 'clk-result.json', JSON.stringify(A, null, 1));
const NS = await E(() => window.__q.n), CH = 1 << 20; const parts = [];
for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH]) => { const x = window.__q.buf.subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH]), 'base64'));
fs.writeFileSync(OUT + 'clk-audio.f32', Buffer.concat(parts)); fs.writeFileSync(OUT + 'clk-acts.json', JSON.stringify({acts, f0: await E(() => window.__q.f0), sr: await E(() => window.__q.sr)}));
console.log('gaps', A.gaps, 'errs', errs);
await T.br.close();
