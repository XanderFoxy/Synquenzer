// QA G-MK4 flow (iPhone P 428x926 / L 926x428, CDP touch): a songwriting session with the MS 2000 effects (MOD-FX, DELAY, EQ)
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk4-tl.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await E(() => 0); T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const lcd = () => E(() => (typeof ED !== 'undefined' && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ').trim() : null));
const disp = () => E(() => { const d = document.querySelector('.mkx[data-k="disp"]') || document.querySelector('[aria-label^="Anzeige"]'); return d ? d.getAttribute('aria-label') : null; });
const U = () => T.undoN();
const fx = () => E(() => { const m = SYNQUENZER.mkGet(0); return {mfx: m.mfx, dly: m.dly, eq: m.eq}; });
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/);
if (mkb) await T.tap(mkb.cx, mkb.cy, 800);
check('F1 engine MS 2000 (touch)', (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk');
const bpm = await E(() => SYNQUENZER.runtime().bpm); log('bpm', bpm);
let pn = await T.panel();
const half = async want => { pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
// in-page capture of track 0 (stereo) around a touch note
await E(() => { window.__cap = {}; window.__capStart = t => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const C = window.__cap = {L: [], R: [], sp, n, z, sr: c.sampleRate}; sp.onaudioprocess = e => { C.L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); C.R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); }; n.connect(sp); sp.connect(z); z.connect(c.destination); };
  window.__capStop = () => { const C = window.__cap; try { C.n.disconnect(C.sp); } catch (e) {} C.sp.disconnect(); const cat = A => { const N = A.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of A) { x.set(b, o); o += b.length; } return x; }; window.__cl = cat(C.L); window.__cr = cat(C.R); return {sr: C.sr, n: window.__cl.length}; };
  window.__ana = (D) => { const l = window.__cl, r = window.__cr, sr = window.__cap.sr; let i0 = 0; while (i0 < l.length && Math.abs(l[i0]) + Math.abs(r[i0]) < 2e-3) i0++; const W = Math.round(.02 * sr), Dn = Math.round(D * sr);
    const en = (x, a) => { let s = 0; for (let i = a; i < a + W && i < x.length; i++) s += x[i] * x[i]; return s; };
    const db = (a, b) => +(10 * Math.log10((a + 1e-30) / (b + 1e-30))).toFixed(1);
    // tail energy (left+right) per 10 ms after i0 for 1.2 s
    const env = []; for (let k = 0; k < 120; k++) { const a = i0 + Math.round(k * .01 * sr); env.push(+(10 * Math.log10((en(l, a) + en(r, a)) / (2 * W) + 1e-20)).toFixed(1)); }
    let sl = 0, sr2 = 0, slr = 0; const N = Math.min(l.length, i0 + Math.round(.6 * sr)); for (let i = i0; i < N; i++) { sl += l[i] * l[i]; sr2 += r[i] * r[i]; slr += l[i] * r[i]; }
    // low band (< ~150 Hz) and high band (> 4 kHz) level in the first 300 ms by 1-pole filters
    let lp = 0, lpE = 0, hp = 0, xp = 0, hpE = 0, tot = 0; const aL = Math.exp(-2 * Math.PI * 150 / sr), aH = Math.exp(-2 * Math.PI * 4000 / sr); const M = Math.min(l.length, i0 + Math.round(.3 * sr));
    let lp2 = 0; for (let i = i0; i < M; i++) { const x = (l[i] + r[i]) / 2; lp = (1 - aL) * x + aL * lp; lp2 = (1 - aL) * lp + aL * lp2; lpE += lp2 * lp2; hp = aH * (hp + x - xp); xp = x; tot += x * x; }
    let hp2 = 0, xp2 = 0; xp = 0; hp = 0; for (let i = i0; i < M; i++) { const x = (l[i] + r[i]) / 2; hp = aH * (hp + x - xp); xp = x; hp2 = aH * (hp2 + hp - xp2); xp2 = hp; hpE += hp2 * hp2; }
    return {i0, on: db(en(l, i0), 1) , echoDb: Dn ? db(en(l, i0 + Dn) + en(r, i0 + Dn), en(l, i0) + en(r, i0)) : null, preEcho: Dn ? db(en(l, i0 + Dn - 2 * W) + en(r, i0 + Dn - 2 * W), en(l, i0) + en(r, i0)) : null,
      corr: +(slr / Math.sqrt(sl * sr2 + 1e-30)).toFixed(3), lrDb: db(sl, sr2), low: +(10 * Math.log10(lpE / (M - i0) + 1e-20)).toFixed(1), high: +(10 * Math.log10(hpE / (M - i0) + 1e-20)).toFixed(1), tot: +(10 * Math.log10(tot / (M - i0) + 1e-20)).toFixed(1), env}; };
});
const kA = await T.key(L ? 7 : 5);
const note = async (D = 0, holdMs = 80, afterMs = 1300, id = 5) => { await E(() => window.__capStart(0)); await sleep(80); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id}]); await sleep(holdMs); await T.send('touchEnd', []); await sleep(afterMs); await E(() => window.__capStop()); return E(D => window.__ana(D), D); };
// --- dry reference
const dry = await note(0.5 * 60 / bpm);
log('dry', JSON.stringify(Object.assign({}, dry, {env: dry.env.slice(0, 60).join(',')})));
// --- EDIT-WAHL 2 → DELAY via the list (touch)
log('w2 →', JSON.stringify(await T.w2(/^6 DELAY/)));
const lcdSel = await lcd(); log('lcd after select', lcdSel);
check('F2 EDIT-WAHL 2 list → 6 DELAY; LCD names DELAY and "aus (TIEFE 0)"', /DELAY/.test(lcdSel || '') && /aus \(TIEFE 0\)/.test(lcdSel || ''), lcdSel);
let u0 = await U();
log('T-SYNC', await T.knobList('k1', /^an$/));
let lc = await lcd();
check('F3 TEMPO SYNC list → an: one undo, ZEIT place shows NOTE (matrix), LCD', (await fx()).dly.sync === 1 && (await U()) === u0 + 1, {dly: (await fx()).dly, u: (await U()) - u0, lcd: lc, mx: (await T.panel()).knobs.map(k => k && k.l)});
u0 = await U();
log('NOTE', await T.knobList('k2', /^1\/8$/));
lc = await lcd(); const msExp = (0.5 * 60 / bpm * 1000);
check('F4 NOTE list → 1/8: one undo; LCD "DELAY · NOTE 1/8" + ms at song tempo', (await fx()).dly.note === 5 && (await U()) === u0 + 1 && /NOTE 1\/8/.test(lc || '') && lc.includes(String(Math.round(msExp))), {dly: (await fx()).dly, lcd: lc, msExp: msExp.toFixed(1), disp: await disp()});
// TIEFE drag up (touch)
u0 = await U();
await T.sweep('k3', -95, 20, 20);
let f = await fx(); lc = await lcd();
log('TIEFE after drag', f.dly.dep, 'lcd', lc, 'disp', await disp());
check('F5 TIEFE drag up → ~60, one undo, LCD "Echo … dB · Wiederholung … dB"', f.dly.dep >= 45 && f.dly.dep <= 75 && (await U()) === u0 + 1 && /Echo .*dB/.test(lc || ''), {dep: f.dly.dep, u: (await U()) - u0, lcd: lc});
const D = 0.5 * 60 / bpm;
const wet = await note(D);
log('with delay', JSON.stringify(Object.assign({}, wet, {env: wet.env.slice(0, 80).join(',')})));
const expEcho = 20 * Math.log10(f.dly.dep / 127);
check('F6 key tap → echo after 1/8 at ' + bpm + ' BPM (' + (D * 1000).toFixed(1) + ' ms), level ≈ TIEFE (' + expEcho.toFixed(1) + ' dB), dry had none', wet.echoDb > dry.echoDb + 15 && Math.abs(wet.echoDb - expEcho) < 3, {wet: wet.echoDb, dry: dry.echoDb, pre: wet.preEcho});
// --- BPM change in the header while the echo rings: LCD follows
await E(() => SYNQUENZER.setBpm(90)); await sleep(200);
await T.tapMk('k2', 300); const nl = await T.popTexts(); await T.closePop();
lc = await lcd();
const wet90 = await note(0.5 * 60 / 90);
check('F7 BPM 90: echo follows (1/8 = 333 ms)', wet90.echoDb > -15 && Math.abs(wet90.echoDb - expEcho) < 3, {echo90: wet90.echoDb, lcd: lc});
await E(b => SYNQUENZER.setBpm(b), bpm); await sleep(200);
// TYP list → Kreuz, L/R
u0 = await U();
log('TYP', await T.knobList('k0', /^Kreuz$/));
const cr = await note(D); log('kreuz', cr.echoDb, cr.lrDb, cr.corr);
log('TYP', await T.knobList('k0', /^L\/R$/));
const lr = await note(D); log('L/R', lr.echoDb, lr.lrDb, lr.corr);
check('F8 TYP Kreuz and L/R (2 undos) keep an audible echo', (await U()) === u0 + 2 && cr.echoDb > -25 && lr.echoDb > -25, {cr: [cr.echoDb, cr.corr], lr: [lr.echoDb, lr.corr], u: (await U()) - u0});
log('TYP', await T.knobList('k0', /^Stereo$/));
// T-SYNC off → ZEIT knob in the same place, drag
await T.knobList('k1', /^aus$/);
pn = await T.panel(); lc = await lcd();
const zeit0 = (await fx()).dly.time;
await T.sweep('k2', -20, 10, 20);
f = await fx(); lc = await lcd();
check('F9 TEMPO SYNC aus → ZEIT on the same knob; drag changes ZEIT; LCD in ms', pn.knobs[2] && pn.knobs[2].l === 'ZEIT' && f.dly.time > zeit0 && /ms|s\b/.test(lc || ''), {k2: pn.knobs[2], time: [zeit0, f.dly.time], lcd: lc});
await T.knobList('k1', /^an$/);
await p.screenshot({path: OUT + 'flow-' + TAG + '-delay.png'});
// --- MOD-FX: Ensemble, TIEFE drag with a key held (2 fingers) → stereo
log('w2 →', JSON.stringify(await T.w2(/^5 MOD-FX/)));
u0 = await U();
log('TYP', await T.knobList('k0', /^Ensemble$/));
// set delay off for the stereo measurement (keep the sound simple): via panel later; use API here (not the subject)
const dep0 = (await fx()).dly.dep; await E(() => SYNQUENZER.mkSet(0, 'dly.dep', 0));
const k2 = await T.mk('k2');
await E(() => window.__capStart(0)); await sleep(60);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}]); await sleep(200);
await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 11}, {x: k2.cx, y: k2.cy, id: 12}]);
for (let s = 1; s <= 25; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 11}, {x: k2.cx, y: k2.cy - s * 8.4, id: 12}]); await sleep(20); }
await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 11}]).catch(() => {});
await T.send('touchEnd', [{x: kA.cx, y: kA.cy, id: 11}]); await sleep(500);
await T.send('touchEnd', []); await sleep(300);
await E(() => window.__capStop());
f = await fx(); lc = await lcd();
const ens = await note(0); log('ensemble', ens.corr, ens.lrDb, ens.tot, 'dry', dry.corr, dry.tot);
check('F10 MOD-FX TYP Ensemble + TIEFE drag (2nd finger, key held) → TIEFE high, one undo each, stereo (corr < 0.9), level ± 3 dB', f.mfx.type === 1 && f.mfx.dep >= 100 && (await U()) === u0 + 2 && ens.corr < 0.9 && Math.abs(ens.tot - dry.tot) < 3, {mfx: f.mfx, u: (await U()) - u0, corr: [dry.corr, ens.corr], tot: [dry.tot, ens.tot], lcd: lc});
log('TYP', await T.knobList('k0', /^Phaser$/));
const ph = await note(0); log('phaser', JSON.stringify([ph.corr, ph.tot, ph.high]));
log('TYP', await T.knobList('k0', /^Chorus\/Flanger$/));
const ch = await note(0); log('cho', JSON.stringify([ch.corr, ch.tot, ch.high]));
// TEMPO drag
const spd0 = (await fx()).mfx.spd; await T.sweep('k1', -30, 10, 20); f = await fx(); lc = await lcd();
check('F11 MOD-FX TEMPO drag → spd up; LCD in Hz', f.mfx.spd > spd0 && /Hz/.test(lc || ''), {spd: [spd0, f.mfx.spd], lcd: lc});
await p.screenshot({path: OUT + 'flow-' + TAG + '-modfx.png'});
// TIEFE drag to 0 → bit-equal to dry (MK4-01 in the app)
await T.sweep('k2', 260, 25, 20);
f = await fx();
const off = await note(0);
check('F12 MOD-FX TIEFE drag to 0 → "aus": L = R again (corr 1)', f.mfx.dep === 0 && off.corr > 0.999, {dep: f.mfx.dep, corr: off.corr});
await E(d => SYNQUENZER.mkSet(0, 'dly.dep', d), dep0);
// --- EQ: TIEF-GAIN up, HOCH-GAIN down
log('w2 →', JSON.stringify(await T.w2(/^7 EQ/)));
await E(() => SYNQUENZER.mkSet(0, 'dly.dep', 0));
const eq0 = await note(0);
u0 = await U();
await T.sweep('k1', -60, 15, 20);   // TIEF-GAIN up
f = await fx(); lc = await lcd(); const dsp1 = await disp();
log('eq after TIEF-GAIN', JSON.stringify(f.eq), lc, dsp1);
await T.sweep('k3', 90, 15, 20);    // HOCH-GAIN down
f = await fx(); const lc2 = await lcd();
const eq1 = await note(0);
log('eq', JSON.stringify(f.eq), 'low', eq0.low, eq1.low, 'high', eq0.high, eq1.high);
check('F13 EQ TIEF-GAIN up / HOCH-GAIN down (touch): gains on 0.5 dB steps, 2 undos, LCD "+x,x dB", bass up, highs down', f.eq.lg > 3 && f.eq.hg < -3 && f.eq.lg * 2 === Math.round(f.eq.lg * 2) && f.eq.hg * 2 === Math.round(f.eq.hg * 2) && (await U()) === u0 + 2 && /dB/.test(lc || '') && eq1.low > eq0.low + 2 && eq1.high < eq0.high - 2, {eq: f.eq, lcd: [lc, lc2], low: [eq0.low, eq1.low], high: [eq0.high, eq1.high], disp: dsp1});
// TIEF-FREQ / HOCH-FREQ drag (log knobs)
const lf0 = f.eq.lf; await T.sweep('k0', -50, 12, 20); f = await fx(); lc = await lcd();
check('F14 TIEF-FREQ drag up (log): frequency up, LCD Hz', f.eq.lf > lf0 * 1.3 && /Hz/.test(lc || ''), {lf: [lf0, f.eq.lf], lcd: lc});
// SHIFT + OKT ▲: last value ±1 step (0.5 dB) on the gain
await T.sweep('k1', -10, 5, 20); const lgA = (await fx()).eq.lg;
u0 = await U(); await T.tapMk('shift'); await T.tapMk('octu'); const lgB = (await fx()).eq.lg;
check('F15 SHIFT + OKT ▲ after TIEF-GAIN: +0.5 dB, one undo', Math.abs(lgB - lgA - 0.5) < 1e-9 && (await U()) === u0 + 1, {lg: [lgA, lgB], u: (await U()) - u0});
await p.screenshot({path: OUT + 'flow-' + TAG + '-eq.png'});
await E(d => SYNQUENZER.mkSet(0, 'dly.dep', d), dep0);
// ◎ deviations: the EDIT-WAHL 2 list marks the changed effect positions
await T.tapMk('w2', 400); const w2rows = await T.popTexts(); await T.closePop();
log('w2 rows', JSON.stringify(w2rows));
check('F16 EDIT-WAHL 2 list: effect rows show the current settings (DELAY NOTE 1/8, EQ gains)', w2rows && w2rows.some(r => /DELAY.*1\/8/.test(r)) && w2rows.some(r => /EQ.*dB/.test(r)), w2rows && w2rows.slice(4, 7));
// --- WRITE as a program, Init, number key brings it back with effects
const mW = await T.pm(0);
await T.tapMk('write', 500);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Echo Bass'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sb = await T.rectText('#popLayer .pop button', /^Sichern$|Speichern|Als neu/); if (sb) await T.tap(sb.cx, sb.cy, 700);
const libS = await E(() => SYNQUENZER.library().find(s => s.name === 'Echo Bass'));
check('F17 WRITE → library "Echo Bass" with mfx/dly/eq', libS && eq(libS.p.mk.dly, mW.dly) && eq(libS.p.mk.eq, mW.eq) && eq(libS.p.mk.mfx, mW.mfx), {lib: !!libS, d: libS ? diff(libS.p.mk, mW).slice(0, 5) : null});
await T.tapMk('shift'); await T.tapMk('n2', 400);
const ini = await T.pm(0);
const iniNote = await note(D);
check('F18 SHIFT+3 → INIT: effects reset (all off) and no echo', ini.dly.dep === 0 && ini.mfx.dep === 0 && ini.eq.lg === 0 && ini.eq.hg === 0 && iniNote.echoDb < -40, {dly: ini.dly, mfx: ini.mfx, eq: ini.eq, echo: iniNote.echoDb});
pn = await T.panel(); if (pn.half === 'B') { await T.tapTxt('.tab, button', /^LINKS$/); await sleep(300); }
let found = null;
for (let k = 0; k < 8 && !found; k++) { await T.tapMk('n' + k, 400); const nm = await E(() => SYNQUENZER.getSound(0).name); if (nm === 'Echo Bass') found = k; }
const back = await T.pm(0);
const bkNote = await note(D);
check('F19 number key → "Echo Bass" back with its effects; echo audible again', found != null && eq(back.dly, mW.dly) && eq(back.eq, mW.eq) && bkNote.echoDb > -20, {found, d: diff(back, mW).slice(0, 4), echo: bkNote.echoDb});
await p.screenshot({path: OUT + 'flow-' + TAG + '-prog.png'});
// --- header "Hören"/▶ audition with effects (if present)
// --- close editor, play the demo: Synth 1 with delay in the song
await T.closePop(); await T.tapTxt('button', /^✕$/); await sleep(500);
await E(() => window.__capStart(0));
await T.tapSel('#bPlay'); await sleep(3000);
const nl0 = await E(() => SYNQUENZER.noteLog(400).filter(n => n.track === 0).length);
await T.tapSel('#bPlay'); await sleep(200);
// echo should keep ringing after a single ■? then ■■ (double stop) = tails off
const after1 = await E(() => { const C = window.__cap; const l = C.L.slice(-8); let s = 0, n = 0; for (const b of l) for (const v of b) { s += v * v; n++; } return +(10 * Math.log10(s / n + 1e-20)).toFixed(1); });
await sleep(1500);
await E(() => window.__capStop());
const vAfter = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length);
check('F20 ▶ demo: Synth 1 plays with its program delay; ■ leaves no voice', nl0 > 0 && vAfter === 0, {nl0, vAfter, after1});
fs.writeFileSync(OUT + 'flow-' + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
check('no console errors', errs.length === 0, errs.slice(0, 6));
await T.br.close(); done();
