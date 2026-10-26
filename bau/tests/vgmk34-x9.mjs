import {open, sleep} from './vgmk34-tl3.mjs';
const T = await open(Object.assign({viewport: {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900);
await E(async () => { const Q = SYNQUENZER; Q.mkSet(0, 'mode', 2); Q.mkSet(0, 'split', 0); Q.mkSet(0, 't.0.a.lvl', 0); await Q.saveSound(0, 'OnlyT2', 'new'); Q.mkSet(0, 'mfx.dep', 100); Q.mkSet(0, 'mfx.type', 1); Q.mkSet(0, 'eq.hg', -12); await Q.saveSound(0, 'OnlyT2fx', 'new'); Q.mkSet(0, 'split', 127); Q.mkSet(0, 't.0.a.lvl', 127); Q.mkSet(0, 't.1.a.lvl', 0); await Q.saveSound(0, 'OnlyT1', 'new'); });
await E(() => SYNQUENZER.initSound(0)); await sleep(300);
const pv = async name => { const id = await E(n => SYNQUENZER.library().find(s => s.name === n).id, name); await E(id => SYNQUENZER.browserPreview(id, true), id); await sleep(600); const sp = await T.spec(1200); await E(id => SYNQUENZER.browserPreview(id, false), id); await sleep(800); return sp; };
for (const n of ['OnlyT2', 'OnlyT2fx', 'OnlyT1']) { const s = await pv(n); console.log(n, JSON.stringify({pow: s.pow, cent: s.cent})); }
console.log('errs', JSON.stringify(errs)); await T.br.close();
