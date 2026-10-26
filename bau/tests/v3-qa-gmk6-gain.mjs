// QA G-MK6: the exact amp gain at SEQ changes while a note sounds (worklet test tap 'gain' = OSC output 1 → filter (DC) → amp)
import {open, sleep, OUT, check, done} from './v3-qa-gmk6-tl.mjs';
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await E(t => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(t, 'mk'); SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, TR); await sleep(700);
await E(async t => { SYNQUENZER.keyOn(60, .1, 'w'); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.keyOff(0, 'w'); }, TR); await p.waitForFunction(t => AU.synth[t] && AU.synth[t].node, TR); await sleep(500);
await E(t => AU.synth[t].node.port.postMessage({mkTap: 'gain'}), TR);
await E(() => {
  window.__cs = t => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const C = window.__C = {L: [], pt: null, sp, n, z, sr: c.sampleRate}; sp.onaudioprocess = e => { if (C.pt == null) C.pt = e.playbackTime; C.L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); }; n.connect(sp); sp.connect(z); z.connect(c.destination); };
  window.__ce = () => { const C = window.__C; try { C.n.disconnect(C.sp); } catch (e) {} C.sp.disconnect(); const N = C.L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of C.L) { x.set(b, o); o += b.length; } C.x = x; return {n: N}; };
  // largest one-sample jump of the gain within [tc-10ms, tc+80ms] vs. the largest in the 400 ms before (the seq's own motion), and the 10–90 % time of the biggest change in ±80 ms
  window.__an = tc => { const C = window.__C, x = C.x, sr = C.sr, i0 = Math.round((tc - C.pt) * sr);
    let mj = 0, at = i0; for (let i = Math.max(1, i0 - Math.round(sr * .01)); i < Math.min(x.length, i0 + Math.round(sr * .08)); i++) { const d = Math.abs(x[i] - x[i - 1]); if (d > mj) { mj = d; at = i; } }
    let mb = 0; for (let i = Math.max(1, i0 - Math.round(sr * .4)); i < i0 - Math.round(sr * .01); i++) mb = Math.max(mb, Math.abs(x[i] - x[i - 1]));
    const g = i => x[Math.max(0, Math.min(x.length - 1, i))];
    const pre = g(at - Math.round(sr * .003)), post = g(at + Math.round(sr * .008));
    let k10 = at, k90 = at; const lo = pre + (post - pre) * .1, hi = pre + (post - pre) * .9, up = post > pre;
    for (let i = at; i > at - sr * .01; i--) { if (up ? g(i) <= lo : g(i) >= lo) { k10 = i; break; } }
    for (let i = at; i < at + sr * .01; i++) { if (up ? g(i) >= hi : g(i) <= hi) { k90 = i; break; } }
    return {jumpPerSample: +mj.toExponential(2), seqOwnMaxBefore: +mb.toExponential(2), at_ms: +((at - i0) / sr * 1000).toFixed(1), from: +pre.toFixed(3), to: +post.toFixed(3), rise_ms: +((k90 - k10) / sr * 1000).toFixed(2)}; };
});
const base = {'t.0.o1.w': 0, 't.0.f.cut': 127, 't.0.f.res': 0, 't.0.f.eg': 0, 't.0.e2.a': 0, 't.0.e2.d': 64, 't.0.e2.s': 127, 't.0.e2.r': 30, 't.0.e1.s': 0, 't.0.a.lvl': 100, 't.0.seq.on': 1, 't.0.seq.ks': 1, 't.0.seq.res': 3, 't.0.seq.last': 16, 't.0.seq.type': 0, 't.0.seq.run': 1};
const setAll = (o) => E(([t, o]) => { for (const k in o) SYNQUENZER.mkSet(t, k, o[k]); }, [TR, o]);
const vals = (k, arr) => { const o = {}; arr.forEach((v, s) => o['t.0.seq.q.' + k + '.v.' + s] = v); return o; };
const resetSeq = () => E(t => { for (let k = 0; k < 3; k++) { SYNQUENZER.mkSet(t, 't.0.seq.q.' + k + '.k', 0); for (let s = 0; s < 16; s++) SYNQUENZER.mkSet(t, 't.0.seq.q.' + k + '.v.' + s, 0); } }, TR);
const R = [];
async function scen(name, setup, change, o = {}) {
  if (ONLY && !ONLY.test(name)) return;
  await sleep(300); await resetSeq(); await setAll(base); if (setup) await setup(); await sleep(150);
  await E(t => window.__cs(t), TR); await sleep(100);
  await E(n => SYNQUENZER.keyOn(n, .8, 'qa'), 60);
  await sleep(o.at || 1300);
  const tc = await E(() => AU.ctx.currentTime);
  await change(); await sleep(400);
  await E(() => SYNQUENZER.keyOff(0, 'qa')); await sleep(200); await E(() => window.__ce());
  const a = await E(tc => window.__an(tc), tc);
  R.push([name, a]); console.log(name.padEnd(70) + JSON.stringify(a));
}
const ks = (path, v) => E(([p, v]) => MKUI.knobSim(p, [v]), [path, v]);
const ramp = [...Array(16).keys()].map(s => s * 8 - 60);
await scen('CTRL no seq: AMP PEGEL 100 → 30 (one knob value)', () => setAll({'t.0.seq.on': 0}), () => ks('t.0.a.lvl', 30));
await scen('CTRL no seq: AMP PEGEL 100 → 30 committed, then ↶ (undo while sounding)', async () => { await setAll({'t.0.seq.on': 0, 't.0.a.lvl': 30}); }, () => E(() => SYNQUENZER.undo()));
await scen('REF Glatt AMP ramp (no change)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), async () => 0);
await scen('REF Stufe AMP ramp (no change)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, ramp)}), async () => 0);
await scen('Glatt AMP: TYP Vorwärts → Rückwärts', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.type', 1));
await scen('Stufe AMP: TYP Vorwärts → Rückwärts', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, ramp)}), () => ks('t.0.seq.type', 1));
await scen('Glatt AMP: LÄNGE 16 → 4', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.last', 4));
await scen('Glatt AMP: KEY SYNC Timbre → Stimme', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.ks', 2));
await scen('Glatt AMP: KEY SYNC Timbre → aus', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.ks', 0));
await scen('Glatt AMP: steps all −63 committed, then ↶ (undo while sounding)', async () => { await setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}); await E(t => { const b = soundSnapshot(t); for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, -63, false); commitSound(t, b, 'qa'); }, TR); }, () => E(() => SYNQUENZER.undo()));
await scen('Glatt AMP: paint all steps −40 → +40 (running step)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Stufe AMP: paint all steps −40 → +40 (running step)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, ...vals(0, new Array(16).fill(-40))}), () => E(t => { for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, 40, false); }, TR));
await scen('Glatt AMP: stored AMP PEGEL 100 → 30 (one knob value) under the seq', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(10))}), () => ks('t.0.a.lvl', 30));
await scen('Glatt AMP: Tools Tauschen 1⇄3 (S3 = none)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-50))}), () => E(t => MKUI.seqSwap(t, 0, 2), TR));
await scen('Glatt AMP: Tools Neu S1', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-50))}), () => E(t => MKUI.seqInit(t, 0), TR));
await scen('Glatt AMP: Tools Kopieren S2 (−50 everywhere, AMP) → S1 (+20 AMP)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(20)), 't.0.seq.q.1.k': 15, 't.0.seq.q.1.m': 0, ...vals(1, new Array(16).fill(-50))}), () => E(t => MKUI.seqCopy(t, SYNQUENZER.getSound(t), 0, 1, 0), TR));
await scen('Glatt AMP: SEQ AN an → aus (values −50)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-50))}), () => ks('t.0.seq.on', 0));
await scen('Glatt AMP: ZIEL AMP → keins (values −50)', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(-50))}), () => ks('t.0.seq.q.0.k', 0));
await scen('Glatt AMP: AUFLÖSUNG 1/16 → 1/1', () => setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, ramp)}), () => ks('t.0.seq.res', 15));
await scen('CTRL2 no seq: AMP PEGEL knob 100 → 30 (knobSim, 1 undo) before the note, ↶ while sounding', async () => { await setAll({'t.0.seq.on': 0}); await ks('t.0.a.lvl', 30); }, () => E(() => SYNQUENZER.undo()));
await scen('CTRL3 no seq: CUTOFF knob 127 → 30 before the note, ↶ while sounding', async () => { await setAll({'t.0.seq.on': 0}); await ks('t.0.f.cut', 30); }, () => E(() => SYNQUENZER.undo()));
await scen('SEQ: Glatt AMP, one step edit via knobSim-like stepSet (all −63), ↶ while sounding', async () => { await setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(20))}); await E(t => { const b = soundSnapshot(t); for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, -63, false); commitSound(t, b, 'qa'); }, TR); }, () => E(() => SYNQUENZER.undo()));
await scen('SEQ: Glatt AMP, ↷ (redo) while sounding', async () => { await setAll({'t.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(20))}); await E(t => { const b = soundSnapshot(t); for (let s = 0; s < 16; s++) mkSetP(t, 't.0.seq.q.0.v.' + s, -63, false); commitSound(t, b, 'qa'); SYNQUENZER.undo(); }, TR); }, () => E(() => SYNQUENZER.redo()));
console.log('errs', JSON.stringify(errs));
await T.br.close();
