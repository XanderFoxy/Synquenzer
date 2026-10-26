import {open, sleep} from './vgmk34-tl3.mjs';
const L = process.argv[2] === 'L';
const T = await open(Object.assign({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
// a stored sound with Layer, delay 40, T2 patch, then load it (orig = that sound)
await E(async () => { const Q = SYNQUENZER; Q.mkSet(0, 'mode', 1); Q.mkSet(0, 'dly.dep', 40); Q.mkSet(0, 'mfx.dep', 30); Q.mkSet(0, 't.1.p.0.i', 20); await Q.saveSound(0, 'OrigTest', 'new'); });
const id = await E(() => SYNQUENZER.library().find(s => s.name === 'OrigTest').id);
await E(id => SYNQUENZER.browserTap(id), id); await sleep(500); await E(() => SYNQUENZER.closeBrowser()); await sleep(300);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(700);
console.log('loaded', await E(() => SYNQUENZER.getSound(0).name), JSON.stringify((await T.pm(0)).dly));
const orig = async () => (await T.panel()).orig;
await T.w('w2', /^6 /);
await T.dragMk('k3', -40, 8); const o1 = [await orig(), (await T.pm(0)).dly.dep];
await T.dragMk('k3', 40, 8); const o2 = [await orig(), (await T.pm(0)).dly.dep];
console.log('DELAY TIEFE: after drag', JSON.stringify(o1), 'back at 40 + touch', JSON.stringify(o2));
// T2 PATCH 1 INTENS.
await T.tapMk('timbre', 300); console.log('timbre', (await T.panel()).timbre);
await T.w('w2', /^1 /);
await T.dragMk('k2', -40, 8); const q1 = [await orig(), (await T.pm(0)).t[1].p[0].i];
await T.dragMk('k2', 40, 8); const q2 = [await orig(), (await T.pm(0)).t[1].p[0].i];
console.log('T2 PATCH1 INT: after drag', JSON.stringify(q1), 'back at 20 + touch', JSON.stringify(q2));
// T1 CUTOFF as a reference (MK1 feature)
await T.tapMk('timbre', 300); await T.tapMk('timbre', 300); console.log('timbre', (await T.panel()).timbre);
await T.w('w1', /^6 FILTER/); const c0 = (await T.pm(0)).t[0].f.cut; await T.dragMk('k1', 40, 8); const r1 = [await orig(), (await T.pm(0)).t[0].f.cut]; await T.dragMk('k1', -40, 8); const r2 = [await orig(), (await T.pm(0)).t[0].f.cut];
console.log('T1 CUTOFF orig', c0, 'after drag', JSON.stringify(r1), 'back', JSON.stringify(r2));
console.log('errs', JSON.stringify(errs)); await T.br.close();
