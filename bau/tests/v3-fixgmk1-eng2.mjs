import {open, sleep} from './v3-qa-gmk1-tl.mjs';
const T = await open({file: process.argv[2]}); const {E} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await E(() => SYNQUENZER.selectTrack(2)); await sleep(400);
const u0 = await T.undoN();
const a = await T.tapTxt('button', /^MS ?2000$/); await sleep(300); const e1 = await E(() => SYNQUENZER.getSound(2).engine), u1 = await T.undoN();
const b = await T.tapTxt('button', /^WT$/); await sleep(300); const e2 = await E(() => SYNQUENZER.getSound(2).engine), u2 = await T.undoN();
console.log(JSON.stringify({u0, e1, u1, e2, u2, a: !!a, b: !!b, top: await T.undoTop()}));
await T.br.close();
