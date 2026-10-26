import {open, sleep} from './vgmk34-tl3.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
const m = await T.pm(0); console.log(JSON.stringify(Object.keys(m)), JSON.stringify(Object.keys(m.t[0])), JSON.stringify({mode: m.mode, tv: m.tv, split: m.split, scale: m.scale, skey: m.skey, usc: m.usc, mfx: m.mfx, dly: m.dly, eq: m.eq}));
await T.tapMk('w2', 300); console.log('w2 list', JSON.stringify(await T.popTexts())); await T.closePop(); await sleep(500);
await T.tapMk('w1', 300); console.log('w1 list', JSON.stringify(await T.popTexts())); await T.closePop(); await sleep(500);
console.log('errs', JSON.stringify(errs));
process.exit(0);
