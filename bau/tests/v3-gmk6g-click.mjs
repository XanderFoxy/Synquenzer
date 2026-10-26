// QA G-MK6: live M-KLICK / M-EINBRUCH at SEQ changes while a note sounds (track output, Chromium), through the panel paths
import {open, sleep, OUT, check, done} from './v3-qa-gmk6-tl.mjs';
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await E(t => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(t, 'mk'); SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, TR); await sleep(700);
await E(async t => { SYNQUENZER.keyOn(60, .1, 'w'); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.keyOff(0, 'w'); }, TR); await p.waitForFunction(t => AU.synth[t] && AU.synth[t].node, TR); await sleep(500);
await E(() => {
  window.__cs = t => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const C = window.__C = {L: [], pt: null, sp, n, z, sr: c.sampleRate}; sp.onaudioprocess = e => { if (C.pt == null) C.pt = e.playbackTime; const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); const m = new Float32Array(a.length); for (let i = 0; i < a.length; i++) m[i] = (a[i] + b[i]) / 2; C.L.push(m); }; n.connect(sp); sp.connect(z); z.connect(c.destination); };
  window.__ce = () => { const C = window.__C; try { C.n.disconnect(C.sp); } catch (e) {} C.sp.disconnect(); const N = C.L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of C.L) { x.set(b, o); o += b.length; } C.x = x; return {n: N, pt: C.pt, sr: C.sr}; };
  // M-KLICK (HP 5 kHz 4th order, 2-ms windows vs. median ±20 ms) and M-EINBRUCH (5-ms RMS vs. mean of the 10 windows before) around time tc (ctx time)
  window.__an = (tc, skip) => { const C = window.__C, x = C.x, sr = C.sr, i0 = Math.round((tc - C.pt) * sr);
    const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const h = hp(hp(x, 5000, .5412), 5000, 1.3066), W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-14); }
    const kl = (k0, k1) => { let mx = -99, at = 0; for (let k = Math.max(10, k0); k < Math.min(e.length - 10, k1); k++) { const nb = e.slice(k - 10, k + 11).filter((_, q) => q !== 10).sort((a, b) => a - b); const r = 10 * Math.log10(e[k] / nb[10]); if (r > mx) { mx = r; at = k; } } return [+mx.toFixed(1), +((at * W - i0) / sr * 1000).toFixed(1)]; };
    const kc = Math.floor(i0 / W);
    const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= x.length; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
    const k5 = Math.floor(i0 / W5); const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length); const pre = mean(r5.slice(k5 - 10, k5)); let dip = 0, dipAt = 0; for (let k = k5 - 2; k <= k5 + 10; k++) { const d = r5[k] - pre; if (d < dip) { dip = d; dipAt = (k - k5) * 5; } }
    const base = kl(Math.floor((skip || .5) * sr / W), kc - 25);
    const med = (a, b) => { const z = e.slice(Math.max(0, a), Math.max(0, b)).sort((p, q) => p - q); return z[Math.floor(z.length / 2)] || 1e-14; };
    let bm = 0, bat = 0; for (let k = kc - 5; k < kc + 60 && k < e.length; k++) if (e[k] > bm) { bm = e[k]; bat = k; }
    const burst = [+(10 * Math.log10(bm / Math.max(med(kc - 40, kc - 8), med(kc + 70, kc + 120)))).toFixed(1), +((bat * W - i0) / sr * 1000).toFixed(1)];
    let bb = 0; for (let k = kc - 140; k < kc - 75; k++) if (e[k] > bb) bb = e[k]; const burstBase = +(10 * Math.log10(bb / med(kc - 140, kc - 75))).toFixed(1);
    return {klick: kl(kc - 15, kc + 25), base, burst, burstBase, einbruch: [+dip.toFixed(1), dipAt], pre: +pre.toFixed(1)}; };
});
// a clean sustained voice: saw, cutoff 64, no EG on the filter, amp sustain full
const base = {'t.0.o1.w': 0, 't.0.f.cut': 64, 't.0.f.res': 10, 't.0.f.eg': 0, 't.0.e2.a': 0, 't.0.e2.d': 64, 't.0.e2.s': 127, 't.0.e2.r': 30, 't.0.e1.s': 0, 't.0.seq.on': 1, 't.0.seq.ks': 1, 't.0.seq.res': 3, 't.0.seq.last': 16, 't.0.seq.type': 0, 't.0.seq.run': 1};
const setAll = (o) => E(([t, o]) => { for (const k in o) SYNQUENZER.mkSet(t, k, o[k]); }, [TR, o]);
const vals = (k, arr) => { const o = {}; arr.forEach((v, s) => o['t.0.seq.q.' + k + '.v.' + s] = v); return o; };
const resetSeq = () => E(t => { for (let k = 0; k < 3; k++) { SYNQUENZER.mkSet(t, 't.0.seq.q.' + k + '.k', 0); for (let s = 0; s < 16; s++) SYNQUENZER.mkSet(t, 't.0.seq.q.' + k + '.v.' + s, 0); } }, TR);
const results = [];
async function scen(name, setup, change, o = {}) {
  if (ONLY && !ONLY.test(name)) return;
  await E(() => SYNQUENZER.panic && SYNQUENZER.panic()); await sleep(300);
  await resetSeq(); await setAll(base); if (setup) await setup(); await sleep(150);
  await E(t => window.__cs(t), TR); await sleep(100);
  await E(n => SYNQUENZER.keyOn(n, .8, 'qa'), o.note || 60);
  await sleep(o.at || 1300);
  const tc = await E(() => AU.ctx.currentTime + (AU.ctx.baseLatency || 0));
  const r0 = await change(); await sleep(o.after || 700);
  if (!o.keep) await E(() => SYNQUENZER.keyOff(0, 'qa'));
  await sleep(200); await E(() => window.__ce());
  const a = await E(([tc, sk]) => window.__an(tc, sk), [tc, o.skip || .5]);
  // the change time is when the main thread sent it; the worklet acts within the next render quantum(s)
  const ok = a.burst[0] <= 6 && a.einbruch[0] >= -3;   // G-MK6 fix check: HF burst vs. the louder steady level (M-KLICK printed too)
  results.push([name, ok, a, r0]); console.log((ok ? 'ok   ' : 'KLICK') + ' ' + name.padEnd(64) + ' klick ' + a.klick[0] + ' dB @' + a.klick[1] + ' ms (baseline max ' + a.base[0] + ') · burst ' + a.burst[0] + ' dB @' + a.burst[1] + ' (base ' + a.burstBase + ') · einbruch ' + a.einbruch[0] + ' dB @' + a.einbruch[1] + ' · ' + (r0 === undefined ? '' : JSON.stringify(r0)).slice(0, 80));
}
const ks = (path, v) => E(([p, v]) => MKUI.knobSim(p, [v]), [path, v]);
const gate = [0, -63, 0, -63, 0, -63, 0, -63, 0, -63, 0, -63, 0, -63, 0, -63];
const ramp = [...Array(16).keys()].map(s => s * 8 - 60);
// reference: the gate itself (Stufe amp ±63 must pass)
await scen('REF Stufe AMP gate 0/−63 (no change)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), async () => 0);
await scen('REF Glatt CUTOFF ramp (no change)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), async () => 0);
await scen('KEY SYNC Timbre → aus (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.ks', 0));
await scen('KEY SYNC Timbre → Stimme (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.ks', 2));
await scen('KEY SYNC Timbre → aus (CUTOFF Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.ks', 0));
await scen('AUFLÖSUNG 1/16 → 1/8 (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.res', 6));
await scen('AUFLÖSUNG 1/16 → 1/32 (CUTOFF Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.res', 1));
await scen('TYP Vorwärts → Rückwärts (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.type', 1));
await scen('TYP Vorwärts → Rückwärts (CUTOFF Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.type', 1));
await scen('LAUF Schleife → Einmal (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.run', 0), {at: 2900});
await scen('LÄNGE 16 → 4 (AMP Glatt ramp, current step > 4)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.last', 4));
await scen('BEWEGUNG Glatt → Stufe (AMP ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.q.0.m', 1));
await scen('BEWEGUNG Stufe → Glatt (AMP gate)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), () => ks('t.0.seq.q.0.m', 0));
await scen('SEQ AN an → aus (AMP gate)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), () => ks('t.0.seq.on', 0));
await scen('ZIEL AMP → PAN (gate)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), () => ks('t.0.seq.q.0.k', 16));
await scen('SEQUENZ tools: Tauschen 1⇄3 (S1 AMP gate, S3 none)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), () => E(() => MKUI.seqSwap(MKUI.P ? MKUI.P.i : 2, 0, 2)));
await scen('SEQUENZ tools: Neu ALLE (AMP Glatt ramp)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => E(t => MKUI.seqInit(t, 'all'), TR));
await scen('Undo of a step edit (AMP Glatt ramp → all steps −63 painted, ↶)', async () => { await setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}); await E(t => { const b = soundSnapshot(t); for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, -63, false); commitSound(t, b, 'qa'); }, TR); }, () => E(() => SYNQUENZER.undo()));
await scen('Running-step value change, Glatt CUTOFF (paint −63 → +63 all)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Running-step value change, Glatt AMP (−40 → +40 all)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Running-step value change, Stufe AMP (−40 → +40 all)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Running-step value change, Stufe CUTOFF (−40 → +40 all)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 1, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Running-step value change, Glatt PAN (−50 → +50 all)', () => setAll({'t.0.seq.q.0.k': 16, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-50))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 50, false); }, TR));
await scen('Stored knob change under a seq (CUTOFF knob 40 → 90, SEQ CUTOFF Glatt)', () => setAll({'t.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.f.cut', 90));
await scen('Stored AMP PEGEL 127 → 60 under SEQ AMP Glatt', () => setAll({'t.0.a.lvl': 127, 't.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.a.lvl', 60));
await scen('Program/sound reload (A/B-like applySound of the same sound with seq off)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, gate)}), () => E(t => { const s = JSON.parse(JSON.stringify(SYNQUENZER.getSound(t))); s.p.mk.t[0].seq.on = 0; applySound(t, s); return 1; }, TR));
// KEY SYNC Timbre restart while an earlier voice is still releasing (Glatt, documented deviation)
await scen('KEY SYNC Timbre restart, releasing voice (AMP Glatt ramp, long release)', () => setAll({'t.0.e2.r': 90, 't.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp.map(v => -v))}), async () => { await E(() => SYNQUENZER.keyOff(0, 'qa')); await sleep(60); await E(() => SYNQUENZER.keyOn(67, .8, 'qa2')); await sleep(600); await E(() => SYNQUENZER.keyOff(0, 'qa2')); return 1; }, {at: 1600, after: 300});
await scen('KEY SYNC Timbre restart, releasing voice (CUTOFF Glatt, long release)', () => setAll({'t.0.e2.r': 90, 't.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0, ...vals(0, ramp.map(v => -v))}), async () => { await E(() => SYNQUENZER.keyOff(0, 'qa')); await sleep(60); await E(() => SYNQUENZER.keyOn(67, .8, 'qa2')); await sleep(600); await E(() => SYNQUENZER.keyOff(0, 'qa2')); return 1; }, {at: 1600, after: 300});
console.log('errs', JSON.stringify(errs));
const bad = results.filter(r => !r[1]);
check('all SEQ changes while sounding pass HF-burst (≤ 6 dB) and M-EINBRUCH (≥ −3 dB)', !bad.length, bad.map(r => r[0] + ': ' + r[2].klick[0] + ' dB / ' + r[2].einbruch[0] + ' dB'));
await T.br.close(); done();
