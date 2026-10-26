// QA G-MK7 flow part 3 (P 390x844, CDP touch, fake microphone = Pages): QUELLE 2 = Mikrofon, sing + chord, HALTEN, mic stop,
// page hidden/visible, save the held sound, new project → load it → sounds without any source; browser preview
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const U = () => T.undoN();
const PAD = 2;
await setupProject(E);
const nodeLvl = (expr, ms = 1500) => E(([expr, ms]) => new Promise(r => { const n = eval(expr); if (!n) return r(null); const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; n.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 30); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-15)).toFixed(1)); }, ms); }), [expr, ms]);
await E(t => { SYNQUENZER.setEngine(t, 'mk'); SYNQUENZER.mkSet(t, 'mode', 3); }, PAD);
await T.openEd(PAD); await sleep(500);
await T.w1(/EING\. ?1/); await sleep(300); await T.tapMk('shift', 300);
const g0 = await E(() => window.__fake.gum);
await T.tapMk('k0', 400); await T.tapPop(/^Mikrofon/); await sleep(1200);
let I = await E(() => SYNQUENZER.mkInInfo()); let lc = await T.lcd2();
check('M1 QUELLE 2 → Mikrofon (tap): one getUserMedia, voc user, E2 routed, LCD', g0 === 0 && I.mic.gum === 1 && I.mic.users.includes('voc') && I.tracks[PAD].e2, {g0, mic: I.mic, lcd: lc});
// a "voice" into the fake mic: vowel-like buzz 150 Hz at about −18 dBFS
await E(() => { const c = window.__ctx, o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 150; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2; const g = c.createGain(); g.gain.value = .5; o.connect(f); f.connect(g); g.connect(window.__fake.bus); o.start(); window.__vo = o; window.__vg = g; });
// play a chord on the on-screen keyboard (3 fingers)
const ks = [await T.key(0), await T.key(4), await T.key(7)];
await T.send('touchStart', ks.map((k, j) => ({x: k.cx, y: k.cy, id: 10 + j}))); await sleep(400);
const lvChord = await T.trLvl(PAD, 1200);
const led = await E(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
check('M2 sing + chord: vocoder audible, LED E2 on', lvChord > -40 && /lon/.test(led[1]), {lvChord, led});
// HALTEN with the chord held (SHIFT off first)
if ((await T.panel()).shift) await T.tapMk('shift', 300);
let u0 = await U();
const tb = await T.mk('timbre'); const chordPts = ks.map((k, j) => ({x: k.cx, y: k.cy, id: 10 + j}));
await T.send('touchStart', chordPts.concat([{x: tb.cx, y: tb.cy, id: 30}])); await sleep(50); await T.send('touchEnd', [{x: tb.cx, y: tb.cy, id: 30}]); await sleep(700);
let m = await T.pm(PAD);
check('M3 TIMBRE → HALTEN while singing: hold stored, one undo', Array.isArray(m.voc.hold) && m.voc.hold.some(x => x > 0) && (await U()) === u0 + 1, {hold: m.voc.hold, du: (await U()) - u0});
await T.send('touchEnd', []); await sleep(500);
// stop the voice and the mic (list → Mikrofon stoppen)
await E(() => { window.__vg.gain.value = 0; });
await T.tapMk('shift', 300); await T.tapMk('k0', 400); const rows = await T.popTexts(); log('list with mic on', JSON.stringify(rows));
await T.tapPop(/^Mikrofon stoppen/); await sleep(800);
I = await E(() => SYNQUENZER.mkInInfo()); lc = await T.lcd2();
const st = await E(() => window.__fake.dest && window.__fake.dest.stream.getTracks().map(t => t.readyState));
check('M4 „Mikrofon stoppen“: mic released (no users, stream off)', !I.mic.on && !I.mic.users.length, {mic: I.mic, lcd: lc, fakeStream: st, mkIn: await E(t => SYNQUENZER.mkIn(t), PAD)});
// held sound plays a chord without any source
await T.tapMk('shift', 300);
await T.send('touchStart', ks.map((k, j) => ({x: k.cx, y: k.cy, id: 20 + j}))); await sleep(400);
const lvHeld = await T.trLvl(PAD, 1000); await T.send('touchEnd', []); await sleep(300);
check('M5 held formant: chord audible with the mic off', lvHeld > -40, {lvHeld});
// page hidden while the mic runs: start the mic again, hide, show
await T.tapMk('shift', 300); await T.tapMk('k0', 400); await T.tapPop(/^Mikrofon/); await sleep(1000);
I = await E(() => SYNQUENZER.mkInInfo()); log('mic again', JSON.stringify(I.mic));
await E(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(500);
const Ih = await E(() => SYNQUENZER.mkInInfo());
await E(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => false}); Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'visible'}); document.dispatchEvent(new Event('visibilitychange')); });
const toasts = []; for (let k = 0; k < 10; k++) { await sleep(250); const t_ = await T.toast(); if (t_ && !toasts.includes(t_)) toasts.push(t_); }
await sleep(4000);
const Iv = await E(() => SYNQUENZER.mkInInfo()); const toast = toasts.join(' | ') || null; lc = await T.lcd2();
await p.screenshot({path: OUT + 'P-m6-back.png'});
const ledsV0 = await E(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
const ledsV = await E(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
log('hidden', JSON.stringify(Ih.mic), 'visible again', JSON.stringify(Iv.mic), 'toast', toast, 'lcd', lc, 'leds', JSON.stringify(ledsV));
check('M6 page hidden → mic off (privacy)', !Ih.mic.on, Ih.mic);
check('M6b back to the page: the user is told that the vocoder mic is off (toast/LCD) or it restarts', Iv.mic.on || /Mikro.*aus|Hintergrund|beendet/.test(String(toast) + String(lc)), {mic: Iv.mic, toast, lcd: lc, leds: ledsV});
// stop mic (cleanup): QUELLE 2 → aus
await T.tapMk('shift', 300); await T.tapMk('k0', 400); await T.tapPop(/^aus$/); await sleep(500); await T.tapMk('shift', 300);
// save the held sound to the library (API saveSound: same as Sichern)
const sv = await E(t => SYNQUENZER.saveSound(t, 'Voc Halten QA'), PAD); await sleep(800);
const lib = await E(() => SYNQUENZER.library().filter(s => s.name === 'Voc Halten QA').map(s => ({id: s.id, eng: s.engine, mode: s.p.mk && s.p.mk.mode, hold: s.p.mk && s.p.mk.voc.hold})));
check('M7 saved sound keeps mode 3 + hold', lib.length === 1 && lib[0].mode === 3 && Array.isArray(lib[0].hold), {sv, lib});
// browser preview of the held sound (the preview engine has no inputs)
const pv = await E(id => { try { return !!SYNQUENZER.preview(0, id); } catch (e) { return 'ERR ' + e.message; } }, lib[0] && lib[0].id); await sleep(600);
const pvLvl = await E(() => new Promise(r => { const c = AU.ctx, a = c.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 30); setTimeout(() => { clearInterval(iv); AU.M.ceil.disconnect(a); r(+(20 * Math.log10(pk + 1e-15)).toFixed(1)); }, 1500); }));
await E(() => SYNQUENZER.preview(0, null, false)); await sleep(400);
check('M8 browser preview of the held vocoder sound is audible', pvLvl > -40, {pv, pvLvl});
// new project → the held sound on track 1 → chord: audible
await E(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor());
await E(() => SYNQUENZER.newProject()); await sleep(1200);
await E(id => SYNQUENZER.setSound(0, SYNQUENZER.library().find(s => s.id === id)), lib[0].id); await sleep(800);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.keyOn ? 0 : 0; });
const sNew = await E(() => SYNQUENZER.getSound(0));
await E(() => { SYNQUENZER.keyOn(60); SYNQUENZER.keyOn(64); SYNQUENZER.keyOn(67); }); await sleep(300);
const lvNew = await T.trLvl(0, 1000);
await E(() => { SYNQUENZER.keyOff(60); SYNQUENZER.keyOff(64); SYNQUENZER.keyOff(67); });
check('M9 new project: held vocoder sound on track 1 plays a chord without source', sNew.engine === 'mk' && sNew.p.mk.mode === 3 && lvNew > -40, {lvNew, mode: sNew.p.mk.mode, mkIn: await E(() => SYNQUENZER.mkIn(0)), mic: (await E(() => SYNQUENZER.mkInInfo())).mic});
log('errs', JSON.stringify(errs));
check('M99 no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
