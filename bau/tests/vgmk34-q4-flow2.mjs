// QA G-MK4 flow 2: library preview (▶) of an MS 2000 sound with DELAY — does the echo ring out or is it cut; A/B with effects; FX tab
import {open, sleep, OUT, check, done, eq, diff} from './vgmk34-tl4.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
// master recorder helper (AnalyserNode-free: ScriptProcessor on AU.M.ceil)
await E(() => { window.__mStart = () => { const c = AU.ctx; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const C = window.__mc = {L: [], sp, z, t0: null}; sp.onaudioprocess = e => { if (C.t0 == null) C.t0 = e.playbackTime; const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); const x = new Float32Array(a.length); for (let i = 0; i < a.length; i++) x[i] = (a[i] + b[i]) / 2; C.L.push(x); }; AU.M.ceil.connect(sp); sp.connect(z); z.connect(c.destination); };
  window.__mStop = () => { const C = window.__mc; try { AU.M.ceil.disconnect(C.sp); } catch (e) {} C.sp.disconnect(); const N = C.L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of C.L) { x.set(b, o); o += b.length; } const sr = AU.ctx.sampleRate, W = Math.round(.01 * sr), env = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(+(10 * Math.log10(s / W + 1e-20)).toFixed(1)); }
    // steepest 10-ms drop while the level is above -60 dB
    let drop = 0, at = -1; for (let k = 1; k < env.length; k++) { const d = env[k - 1] - env[k]; if (env[k - 1] > -60 && d > drop) { drop = d; at = k; } }
    return {t0: C.t0, env, drop: +drop.toFixed(1), at: at * .01}; }; });
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); if (mkb) await T.tap(mkb.cx, mkb.cy, 800); else { const c = await T.rectText("button", /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
// a sound with a long, audible delay, saved to the library; then the track goes back to INIT
await E(async () => { const Q = SYNQUENZER; Q.mkSet(0, 'dly.dep', 100); Q.mkSet(0, 'dly.sync', 1); Q.mkSet(0, 'dly.note', 8); Q.mkSet(0, 't.0.a.gate', 1); await Q.saveSound(0, 'Echo Lang', 'new'); });
const id = await E(() => SYNQUENZER.library().find(s => s.name === 'Echo Lang').id);
await E(() => SYNQUENZER.initSound ? SYNQUENZER.initSound(0) : 0); await sleep(300);
log: { const s = await E(() => SYNQUENZER.mkGet(0).dly); console.log('track dly after init', JSON.stringify(s)); }
// ---- B1 preview through the browser
await E(() => window.__mStart());
const pv = await E(id => SYNQUENZER.browserPreview(id, true), id);
let st; const t0 = Date.now(); do { await sleep(100); st = await E(() => SYNQUENZER.previewState()); } while (st.on && Date.now() - t0 < 15000);
const tEnd = await E(() => AU.ctx.currentTime);
await sleep(3500);
const m = await E(() => window.__mStop());
const relEnd = tEnd - m.t0;
const lvAfter = k => m.env[Math.round((relEnd + k) / .01)];
console.log('preview on', pv, 'phrase end at', relEnd.toFixed(2), 's; level after end +0.2/+0.6/+1.2/+2.0 s', [.2, .6, 1.2, 2].map(lvAfter), 'steepest drop', m.drop, 'dB at', m.at.toFixed(2));
console.log('env tail', m.env.slice(Math.round(relEnd / .01) - 100, Math.round(relEnd / .01) + 250).join(','));
check('B1 library ▶ of an MS 2000 sound with DELAY (TIEFE 100, 1/4): the echo rings out after the phrase, no abrupt cut', lvAfter(1.2) > -60 && m.drop < 25, {pv, after: [.2, .6, 1.2, 2].map(lvAfter), drop: m.drop, at: m.at, phraseEnd: relEnd});
// reference: the same sound on the track, played by key: echo rings out
await E(id => SYNQUENZER.browserTap(id), id); await sleep(500);
await E(() => SYNQUENZER.closeBrowser()); await sleep(300);
await E(() => window.__mStart()); await sleep(100);
await E(() => SYNQUENZER.keyOn(60, .8)); await sleep(300); await E(() => SYNQUENZER.keyOff(60)); const tk = await E(() => AU.ctx.currentTime);
await sleep(3000); const m2 = await E(() => window.__mStop());
const rk = tk - m2.t0; console.log('track key: after +0.2/+0.6/+1.2/+2.0', [.2, .6, 1.2, 2].map(k => m2.env[Math.round((rk + k) / .01)]), 'drop', m2.drop);
// ---- B2 A/B with effects: loaded "Echo Lang" (has delay) → change EQ → A/B = original (with its delay) → A/B = edit
await T.openEd(0);
await E(() => SYNQUENZER.mkSet(0, 'eq.hg', -12));
const abB = await T.rectText('button', /^A\/B$/); await T.tap(abB.cx, abB.cy, 400);
const sB = await E(() => { const m = SYNQUENZER.mkGet(0); return {eq: m.eq, dly: m.dly}; });
await T.tap(abB.cx, abB.cy, 400);
const sA = await E(() => { const m = SYNQUENZER.mkGet(0); return {eq: m.eq, dly: m.dly}; });
check('B2 A/B: B = original (EQ 0 dB, its delay), A = the edit (HOCH-GAIN −12)', sB.eq.hg === 0 && sB.dly.dep === 100 && sA.eq.hg === -12 && sA.dly.dep === 100, {sB, sA});
// ---- B3 FX tab on the MS 2000 track still there (track chain after the program effects)
const fxTab = await T.rectText('.tab', /^FX$/);
if (fxTab) await T.tap(fxTab.cx, fxTab.cy, 500);
const fxCtl = await E(() => [...document.querySelectorAll('#synthSheet .sh-body *')].filter(e => e.children.length === 0 && e.offsetWidth && /Hall|Echo|Chorus|Drive/i.test(e.textContent)).map(e => e.textContent.trim()).slice(0, 12));
await p.screenshot({path: OUT + 'flow2-' + (L ? 'L' : 'P') + '-fxtab.png'});
check('B3 FX tab (track effects) opens on the MS 2000 track with its controls', !!fxTab && fxCtl.length > 0, {fxTab: !!fxTab, fxCtl});
check('no console errors', errs.length === 0, errs.slice(0, 6));
await T.br.close(); done();
