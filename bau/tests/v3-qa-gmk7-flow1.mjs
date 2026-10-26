// QA G-MK7 flow part 1 (iPhone P 390x844 / L 844x390, CDP touch): pad → MS 2000 → Vocoder, QUELLE 2 = lead track, HALTEN, 16 BÄNDER, SHIFT tools
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const U = () => T.undoN();
const PAD = 2, LEAD = 3;
log('setup', JSON.stringify(await setupProject(E)));
await T.openEd(PAD);
await T.toMk();
check('F1 pad engine MS 2000 (touch)', (await E(t => SYNQUENZER.getSound(t).engine, PAD)) === 'mk');
let pn = await T.panel(); log('fmt', pn.fmt, 'half', pn.half);
const half = async want => { pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
// STIMME → SYNTH/VOC. → Vocoder (list)
log('w1 STIMME', await T.w1(/^1 STIMME|^STIMME/)); await sleep(400);
pn = await T.panel(); log('knobs', JSON.stringify(pn.knobs.map(k => k && k.l)));
let u0 = await U();
log('mode', await T.knobList('k0', /^Vocoder$/));
let m = await T.pm(PAD); pn = await T.panel(); let lc = await T.lcd2();
check('F2 SYNTH/VOC. list → Vocoder: mode 3, one undo, green labels', m.mode === 3 && (await U()) === u0 + 1, {mode: m.mode, du: (await U()) - u0, lcd: lc, knobs: pn.knobs.map(k => k && k.l), matrix: pn.matrix});
await p.screenshot({path: OUT + TAG + '-f2-voc.png'});
// EING. 1 → SHIFT → QUELLE 2 ▾ → Spur 4
log('w1 EING', await T.w1(/EING\. ?1/)); await sleep(400);
pn = await T.panel(); log('EING knobs', JSON.stringify(pn.knobs.map(k => k && k.l)), 'lcd', await T.lcd2());
await T.tapMk('shift', 300); pn = await T.panel(); log('SHIFT knobs', JSON.stringify(pn.knobs.map(k => k && k.l)));
u0 = await U();
await T.tapMk('k0', 400); const rows = await T.popTexts(); log('QUELLE 2 list', JSON.stringify(rows));
await p.screenshot({path: OUT + TAG + '-f3-quelle2.png'});
const tr4 = await T.tapPop(/^Spur 4/); await sleep(600);
let inn = await E(t => SYNQUENZER.mkIn(t), PAD); lc = await T.lcd2();
let info = await E(() => SYNQUENZER.mkInInfo());
check('F3 QUELLE 2 list → Spur 4: tr.mkIn.e2 = t:<uid of lead>, routed, one undo', inn && inn.e2 === 't:' + (await E(t => SYNQUENZER.tracks()[t].uid, LEAD)) && info.tracks[PAD].e2 && (await U()) === u0 + 1, {inn, du: (await U()) - u0, lcd: lc, tapped: tr4 && tr4.t, info: info.tracks[PAD]});
await p.screenshot({path: OUT + TAG + '-f3b-after.png'});
// play scene 1, vocoder audible while the pad plays chords and the lead plays (E2)
await E(() => { SYNQUENZER.launchScene(0); if (!SYNQUENZER.runtime().playing) SYNQUENZER.play(); });
await sleep(2500); log('playing', await E(() => SYNQUENZER.runtime().playing));
let lv = await T.trLvl(PAD, 2000); let lvLead = await T.trLvl(LEAD, 1000);
check('F4 playing: vocoder track audible (pad × lead)', lv > -40, {pad: lv, lead: lvLead});
// LEDs E1/E2 while panel shown
const leds = await E(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
log('LEDs', JSON.stringify(leds));
check('F5 LED E2 on while the lead plays', leds.length === 2 && /lon/.test(leds[1]), leds);
// TIMBRE → HALTEN (SHIFT is still lit after the QUELLE list: tap SHIFT off first, like Xander would after the LCD hint)
pn = await T.panel(); log('shift before TIMBRE', pn.shift); if (pn.shift) { await T.tapMk('shift', 300); }
u0 = await U();
await T.tapMk('timbre', 600); m = await T.pm(PAD); lc = await T.lcd2();
check('F6 TIMBRE → HALTEN: voc.hold 16 values, one undo, LCD', Array.isArray(m.voc.hold) && m.voc.hold.length === 16 && m.voc.hold.some(x => x > 0) && (await U()) === u0 + 1, {hold: m.voc.hold, du: (await U()) - u0, lcd: lc});
const timLed = await E(() => [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => e.className));
log('timbre LEDs', JSON.stringify(timLed));
// stop the lead (QUELLE 2 → aus) – held formant keeps sounding
await sleep(300);
await T.tapMk('shift', 300); await T.tapMk('k0', 400); await T.tapPop(/^aus$/); await sleep(1500); await T.tapMk('shift', 300);
lv = await T.trLvl(PAD, 2000);
check('F7 QUELLE 2 aus with HALTEN: vocoder still audible', lv > -40, {pad: lv, inn: await E(t => SYNQUENZER.mkIn(t), PAD)});
// HALTEN off → silent (no source)
u0 = await U();
pn = await T.panel(); log('shift now', pn.shift);
await T.tapMk('timbre', 600); m = await T.pm(PAD); lc = await T.lcd2();
log('after timbre (hold off?)', JSON.stringify(m.voc.hold), lc);
await sleep(1500); lv = await T.trLvl(PAD, 1500);
check('F8 HALTEN off without source → silent', !m.voc.hold && lv < -70, {hold: m.voc.hold, lv, lcd: lc});
// back on (hold again) – ↶ to get the held formant back
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 400); m = await T.pm(PAD);
check('F9 ↶ brings the held formant back', Array.isArray(m.voc.hold), {hold: m.voc.hold, top: await T.undoTop()});
await sleep(1500); lv = await T.trLvl(PAD, 1500); log('after undo lv', lv);
// EDIT-WAHL 2 → K-PEGEL A, tap the matrix row → 16 BÄNDER
log('w2', await T.w2(/K-PEGEL A/)); await sleep(400);
pn = await T.panel(); log('K-PEGEL knobs', JSON.stringify(pn.knobs.map(k => k && k.l)), 'matrix', JSON.stringify(pn.matrix), 'lcd', await T.lcd2());
const mrow = await E(() => { const e = [...document.querySelectorAll('#synthSheet .mkx')].find(e => /16 BÄNDER/.test(e.textContent)); return e && e.dataset.k; });
log('mrow', mrow);
await T.tapMk(mrow, 600);
await p.screenshot({path: OUT + TAG + '-f10-baender.png'});
const cols = await E(() => [...document.querySelectorAll('#synthSheet .mkcol')].map(e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }));
check('F10 16 BÄNDER open: 16 columns', cols.length === 16, cols.slice(0, 3));
// drag band 3 down to ~0, one undo
u0 = await U(); const c3 = cols[2];
await T.down(c3.x + c3.w / 2, c3.y + 5); await sleep(30); await T.glide(c3.x + c3.w / 2, c3.y + 5, c3.x + c3.w / 2, c3.y + c3.h + 60, 20, 16); await T.up(); await sleep(300);
m = await T.pm(PAD);
check('F11 drag band 3 down: chl[2] low, others 127, one undo', m.voc.chl[2] < 40 && m.voc.chl.filter((_, k) => k !== 2).every(v => v === 127) && (await U()) === u0 + 1, {chl: m.voc.chl.join(','), du: (await U()) - u0});
await sleep(800);
const green = await E(() => { const cv = document.querySelector('#synthSheet canvas.mkbcv'); if (!cv) return -1; const x = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < x.length; i += 4) if (x[i + 1] > 150 && x[i] < 120 && x[i + 2] < 140) n++; return n; });
check('F12 live band levels drawn (green pixels)', green > 50, green);
// back to GERÄT, SHIFT + 1 → reset levels
await T.tapMk('back', 500);
u0 = await U();
await T.tapMk('shift', 300); await T.tapMk('n0', 500); m = await T.pm(PAD); lc = await T.lcd2();
check('F13 SHIFT + 1 → all K-PEGEL 127, one undo', m.voc.chl.every(v => v === 127) && (await U()) === u0 + 1, {chl: m.voc.chl.join(','), du: (await U()) - u0, lcd: lc});
log('errs', JSON.stringify(errs));
check('F99 no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
