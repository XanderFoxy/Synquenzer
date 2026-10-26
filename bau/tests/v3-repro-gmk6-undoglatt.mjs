// Independent repro: Glatt SEQ → AMP, step values changed by touch in SCHRITTE, then header ↶ / ↷ (touch) while a note sounds.
// Measures M-KLICK on the track output and (second pass) the exact amp gain via the worklet test tap.
import {open, sleep} from './v3-qa-gmk6-tl.mjs';
const VW = +(process.env.VW || 844), VH = +(process.env.VH || 390);
const T = await open({viewport: {width: VW, height: VH}}); const {p, E, errs} = T;
const TR = 2;
await E(t => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setEngine(t, 'mk'); SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, TR); await sleep(800);
await E(async () => { SYNQUENZER.keyOn(60, .1, 'w'); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.keyOff(0, 'w'); }); await p.waitForFunction(t => AU.synth[t] && AU.synth[t].node, TR); await sleep(500);
await E(() => {
  window.__cs = (t, mono) => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const C = window.__C = {L: [], pt: null, sp, n, z, sr: c.sampleRate}; sp.onaudioprocess = e => { if (C.pt == null) C.pt = e.playbackTime; const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); const m = new Float32Array(a.length); for (let i = 0; i < a.length; i++) m[i] = mono ? a[i] : (a[i] + b[i]) / 2; C.L.push(m); }; n.connect(sp); sp.connect(z); z.connect(c.destination); };
  window.__ce = () => { const C = window.__C; try { C.n.disconnect(C.sp); } catch (e) {} C.sp.disconnect(); const N = C.L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of C.L) { x.set(b, o); o += b.length; } C.x = x; return N; };
  // M-KLICK (HP 5 kHz, 2-ms windows vs. median of ±20 ms) max inside [t0, t1] (ctx times)
  window.__kl = (t0, t1) => { const C = window.__C, x = C.x, sr = C.sr;
    const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const FH = window.__FH || 5000, h = hp(hp(x, FH, .5412), FH, 1.3066), W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-14); }
    const k0 = Math.floor((t0 - C.pt) * sr / W), k1 = Math.floor((t1 - C.pt) * sr / W); let mx = -99, at = 0;
    for (let k = Math.max(10, k0); k < Math.min(e.length - 10, k1); k++) { const nb = e.slice(k - 10, k + 11).filter((_, q) => q !== 10).sort((a, b) => a - b); const r = 10 * Math.log10(e[k] / nb[10]); if (r > mx) { mx = r; at = k; } }
    // burst: the biggest 2-ms HF window in [t0, t1] vs. the louder of the steady HF levels before (t0-60..t0-10 ms) and after (last 100 ms of the range)
    const med = (a, b) => { const z = e.slice(Math.max(0, a), Math.max(0, b)).sort((p, q) => p - q); return z[Math.floor(z.length / 2)] || 1e-14; };
    let bm = 0, bat = 0; for (let k = Math.max(0, k0); k < Math.min(e.length, k1); k++) if (e[k] > bm) { bm = e[k]; bat = k; }
    const lpre = med(k0 - 30, k0 - 5), lpost = med(k1 - 50, k1);
    const burst = +(10 * Math.log10(bm / Math.max(lpre, lpost))).toFixed(1);
    let tot = 0; for (let i = Math.round((t1 - C.pt) * sr) - Math.round(sr * .1); i < Math.round((t1 - C.pt) * sr); i++) tot += x[i] * x[i]; tot /= Math.round(sr * .1);
    return {burstAbsDbFS: +(10 * Math.log10(bm)).toFixed(1), toneRmsDbFS: +(10 * Math.log10(tot + 1e-20)).toFixed(1), burstDb: burst, burstAt_ms: +((bat - k0) * W / sr * 1000).toFixed(1), hfPreDb: +(10 * Math.log10(lpre)).toFixed(1), hfPostDb: +(10 * Math.log10(lpost)).toFixed(1), db: +mx.toFixed(1), at_ms: +((at * W) / sr * 1000 - (t0 - C.pt) * 1000).toFixed(1), hfMedDb: +(10 * Math.log10(e.slice(k0, k1).sort((a, b) => a - b)[Math.floor((k1 - k0) / 2)] || 1e-14)).toFixed(1)}; };
  // gain tap: biggest change in [t0,t1], with 10-90 % time
  window.__tr = (t0, t1) => { const C = window.__C, x = C.x, sr = C.sr, i0 = Math.round((t0 - C.pt) * sr), i1 = Math.round((t1 - C.pt) * sr); const J = []; for (let i = Math.max(1, i0); i < Math.min(x.length, i1); i++) { const d = x[i] - x[i - 1]; if (Math.abs(d) > 2e-3) J.push([+((i - i0) / sr * 1000).toFixed(2), +x[i - 1].toFixed(3), +x[i].toFixed(3)]); } const tr = []; for (let i = i0; i < Math.min(x.length, i1); i += Math.round(sr * .025)) tr.push(+x[i].toFixed(3)); return {jumps: J.slice(0, 20), nJumps: J.length, trace25ms: tr}; };
  window.__gj = (t0, t1) => { const C = window.__C, x = C.x, sr = C.sr, i0 = Math.round((t0 - C.pt) * sr), i1 = Math.round((t1 - C.pt) * sr);
    let mj = 0, at = i0; for (let i = Math.max(1, i0); i < Math.min(x.length, i1); i++) { const d = Math.abs(x[i] - x[i - 1]); if (d > mj) { mj = d; at = i; } }
    const g = i => x[Math.max(0, Math.min(x.length - 1, i))]; const pre = g(at - Math.round(sr * .003)), post = g(at + Math.round(sr * .012));
    let k10 = at, k90 = at; const lo = pre + (post - pre) * .1, hi = pre + (post - pre) * .9, up = post > pre;
    for (let i = at; i > at - sr * .015; i--) { if (up ? g(i) <= lo : g(i) >= lo) { k10 = i; break; } }
    for (let i = at; i < at + sr * .015; i++) { if (up ? g(i) >= hi : g(i) <= hi) { k90 = i; break; } }
    return {maxStepPerSample: +mj.toExponential(2), at_ms: +((at - i0) / sr * 1000).toFixed(1), from: +pre.toFixed(3), to: +post.toFixed(3), rise10_90_ms: +((k90 - k10) / sr * 1000).toFixed(2)}; };
});
const base = {'t.0.o1.w': 0, 't.0.f.cut': +(process.env.CUT || 64), 't.0.f.res': 10, 't.0.f.eg': 0, 't.0.e2.a': 0, 't.0.e2.d': 64, 't.0.e2.s': 127, 't.0.e2.r': 30, 't.0.e1.s': 0, 't.0.a.lvl': 100,
  't.0.seq.on': 1, 't.0.seq.ks': 1, 't.0.seq.res': 3, 't.0.seq.last': 16, 't.0.seq.type': 0, 't.0.seq.run': 1};
const setAll = o => E(([t, o]) => { for (const k in o) SYNQUENZER.mkSet(t, k, o[k]); }, [TR, o]);
const vals = (k, arr) => { const o = {}; arr.forEach((v, s) => o['t.0.seq.q.' + k + '.v.' + s] = v); return o; };
const undoBtn = sym => T.rectText('#synthSheet .hb.ur', sym === '↶' ? /^↶$/ : /^↷$/);
// open the SCHRITTE view once
await E(() => MKUI.viewOpen('schritte')); await sleep(500);
const I0 = await T.steps(); console.log('SCHRITTE cols', I0.cols.length, 'first', JSON.stringify(I0.cols[0]), 'last', JSON.stringify(I0.cols[15]));
const rowsOf = I => { const R = new Map(); I.cols.forEach((c, i) => { const k = Math.round(c.y); if (!R.has(k)) R.set(k, []); R.get(k).push(i); }); return [...R.values()]; };
// paint gesture(s) by touch: each row = one gesture (one undo entry)
async function paintRows(yFrac) { const I = await T.steps(); for (const row of rowsOf(I)) { const a = I.cols[row[0]], b = I.cols[row[row.length - 1]], ya = a.y + a.h * yFrac, yb = b.y + b.h * yFrac; await T.down(a.x + 4, ya); await sleep(20); await T.glide(a.x + 4, ya, b.x + b.w - 4, yb, 24, 16); await sleep(20); await T.up(); await sleep(250); } return rowsOf(I).length; }
async function run(name, tap, fn) {
  await E(() => SYNQUENZER.panic && SYNQUENZER.panic()); await sleep(300);
  for (let k = 0; k < 3; k++) await setAll({['t.0.seq.q.' + k + '.k']: 0});
  await setAll({...base, 't.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 0, ...vals(0, new Array(16).fill(20))}); await sleep(200);
  const pre = await fn.pre(); await sleep(300);
  if (tap) await E(t => AU.synth[t].node.port.postMessage({mkTap: 'gain'}), TR);
  await E(([t, m]) => window.__cs(t, m), [TR, !!tap]); await sleep(120);
  await E(() => SYNQUENZER.keyOn(60, .8, 'qa'));
  const out = []; await sleep(1300);
  for (const st of fn.acts) { const t0 = await E(() => AU.ctx.currentTime); const info = await st.go(); await sleep(st.after || 700); const t1 = await E(() => AU.ctx.currentTime); out.push({label: st.label, t0, t1, info}); }
  await E(() => SYNQUENZER.keyOff(0, 'qa')); await sleep(250); await E(() => window.__ce());
  if (tap) await E(t => AU.synth[t].node.port.postMessage({mkTap: null}), TR);
  await E(f => { window.__FH = f; }, +(process.env.FH || 5000)); const tn = out[0].t0; const bl = await E(([a, b, tp]) => tp ? window.__gj(a, b) : window.__kl(a, b), [tn - .9, tn - .1, tap]);
  console.log('\n## ' + name + (tap ? ' [gain tap]' : ' [track output]'), 'setup:', JSON.stringify(pre));
  console.log('  baseline (0.8 s before, no edit):', JSON.stringify(bl));
  for (const o of out) { const r = await E(([a, b, tp]) => tp ? window.__gj(a, b) : window.__kl(a, b), [o.t0 - .02, o.t1 - .05, tap]); console.log('  ' + o.label.padEnd(44), JSON.stringify(r), JSON.stringify(o.info)); if (tap && process.env.TRACE) console.log('   trace', JSON.stringify(await E(([a, b]) => window.__tr(a, b), [o.t0 - .02, o.t1 - .05]))); }
}
const U = () => E(() => SYNQUENZER.undoInfo());
const scenUR = {
  pre: async () => { const n = await paintRows(.995); const u = await U(); const v = await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(), TR); return {gestures: n, undoTop: u.top && u.top.label, v}; },
  acts: [
    {label: 'tap header ↶ (touch) while note sounds', go: async () => { const s = await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 0); return {tapped: !!s, v: await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(0, 4), TR)}; }},
    {label: 'tap header ↷ (touch) while note sounds', go: async () => { const s = await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 0); return {tapped: !!s, v: await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(0, 4), TR)}; }},
  ]};
// for the portrait (2 rows) case the second ↶ undoes the second row; one ↶ + one ↷ is enough for the comparison
const scenPaint = {
  pre: async () => { await setAll(vals(0, new Array(16).fill(-40))); return {v: -40}; },
  acts: [{label: 'paint all columns to +40 by touch while note sounds', go: async () => { const n = await paintRows(.183); return {gestures: n, v: await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(), TR)}; }, after: 400}]};
// deterministic: AUFLÖSUNG 1/1 (2 s per step at 120 BPM) so the running step is step 1 (index 0) during the whole gesture
const scenPaintSlow = {
  pre: async () => { await setAll({'t.0.seq.res': 15, ...vals(0, new Array(16).fill(-40))}); return {v: -40, res: '1/1'}; },
  acts: [{label: 'paint row 1 to ≈+40 by touch (running step = 1)', go: async () => { const I = await T.steps(); const a = I.cols[0], b = I.cols[7], y = a.y + a.h * .2; await T.down(a.x + 4, y); await sleep(20); await T.glide(a.x + 4, y, b.x + b.w - 4, y, 16, 16); await T.up(); return {v: await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(0, 8), TR)}; }, after: 400}]};
const scenDragSlow = {
  pre: async () => { await setAll({'t.0.seq.res': 15, ...vals(0, new Array(16).fill(-40))}); return {v: -40, res: '1/1'}; },
  acts: [{label: 'drag running column 1 up (−40 → ≈+40) by touch', go: async () => { const I = await T.steps(); const a = I.cols[0], x = a.x + a.w / 2, y = a.y + a.h * .5; await T.down(x, y); await sleep(20); await T.glide(x, y, x, y - a.h * .55, 12, 16); await T.up(); return {v: await E(t => SYNQUENZER.mkGet(t).t[0].seq.q[0].v.slice(0, 2), TR)}; }, after: 400}]};
const scenCtl = {
  pre: async () => { await setAll({'t.0.seq.on': 0}); await E(() => MKUI.knobSim('t.0.a.lvl', [30])); return {seqOn: 0, lvl: 30}; },
  acts: [{label: 'CONTROL (SEQ off): tap header ↶ of AMP PEGEL 100→30', go: async () => { const s = await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 0); return {tapped: !!s, lvl: await E(t => SYNQUENZER.mkGet(t).t[0].a.lvl, TR)}; }}]};
for (const tap of (process.env.TAPS ? process.env.TAPS.split(',').map(x => x === '1') : [false, true])) {
  const SC = process.env.SC || 'cup';
  if (SC.includes('c')) await run('CONTROL: knob undo, no seq', tap, scenCtl);
  if (SC.includes('u')) await run('Glatt SEQ1→AMP, steps +20, painted −63 by touch, then ↶ / ↷', tap, scenUR);
  if (SC.includes('s')) await run('Glatt SEQ1→AMP 1/1, steps −40, paint over running step 1 by touch', tap, scenPaintSlow);
  if (SC.includes('d')) await run('Glatt SEQ1→AMP 1/1, steps −40, drag running step 1 by touch', tap, scenDragSlow);
  if (SC.includes('p')) await run('Glatt SEQ1→AMP, steps −40, painted +40 by touch over the running step', tap, scenPaint);
}
console.log('\nerrs', JSON.stringify(errs));
await T.br.close();
