// QA G-MK3: the armed state of [Split ← nächste Note] after leaving the STIMME section / changing the mode
import {open, sleep, OUT, check, done} from './v3-qa-gmk3-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); Q.mkSet(0, 'split', 60); });
await T.openEd(0);
const play = async n => { await E(n => SYNQUENZER.keyOn(n, .8, 'z'), n); await sleep(150); await E(() => SYNQUENZER.keyOff(0, 'z')); await sleep(250); };
const st = async () => { const pn = await T.panel(); return {split: (await T.pm(0)).split, arm: !!pn.splitArm, chip: !!(await T.rect('.lx.lsplit')), chipOn: !!(await T.rect('.lx.lsplit.on')), u: await T.undoN(), lcd: (await T.lcdAll()).join(' | ').slice(0, 120)}; };
// A: arm via LCD chip, then EDIT-WAHL 1 → FILTER, then play a note
await T.w('w1', /^1 STIMME/);
let lx = await T.rect('.lx.lsplit'); await T.tap(lx.cx, lx.cy, 300);
const a0 = await st();
await T.w('w1', /^6 FILTER/); const a1 = await st();
await play(48); const a2 = await st();
console.log('A', JSON.stringify([a0, a1, a2]));
check('A armed, then EDIT-WAHL 1 → FILTER (chip gone): a played note must not silently move the split', a2.split === 60, {a0, a1, a2});
// B: arm, then mode → Schicht (the chip disappears), play a note
await E(() => SYNQUENZER.mkSet(0, 'split', 60));
await T.w('w1', /^1 STIMME/); lx = await T.rect('.lx.lsplit'); await T.tap(lx.cx, lx.cy, 300);
await T.knobList('k1', /^Schicht$/); const b1 = await st();
await play(50); const b2 = await st();
console.log('B', JSON.stringify([b1, b2]));
check('B armed, then EINZELN → Schicht: next note does not change the (hidden) split', b2.split === 60, {b1, b2});
// C: arm via SPLIT knob tap (EB2), then SHIFT off: chip still shown? note sets split (expected)
await E(() => { SYNQUENZER.mkSet(0, 'mode', 2); SYNQUENZER.mkSet(0, 'split', 60); }); await sleep(200);
await T.tapMk('shift', 200); await T.tapMk('k2', 250); const c0 = await st(); await T.tapMk('shift', 200); const c1 = await st();
await play(55); const c2 = await st();
console.log('C', JSON.stringify([c0, c1, c2]));
// D: arm, then a second tap on the chip: does it disarm (toggle)?
await E(() => SYNQUENZER.mkSet(0, 'split', 60));
lx = await T.rect('.lx.lsplit'); await T.tap(lx.cx, lx.cy, 300); const d0 = await st(); await T.tap(lx.cx, lx.cy, 300); const d1 = await st();
console.log('D', JSON.stringify([d0, d1]));
check('D a second tap on the lit chip disarms it (toggle)', d0.arm && !d1.arm, {d0, d1});
await E(() => { MKUI.P.splitArm = false; });
// E: arm in Split, the 🎤/transpose: switch keyboard to ⇅ TRANSPONIEREN and play a key
await E(() => SYNQUENZER.mkSet(0, 'split', 60));
lx = await T.rect('.lx.lsplit'); await T.tap(lx.cx, lx.cy, 300);
await E(() => SYNQUENZER.setKbMode('transpose')); await play(62); const e1 = await st(); await E(() => SYNQUENZER.setKbMode('play'));
console.log('E', JSON.stringify(e1));
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
