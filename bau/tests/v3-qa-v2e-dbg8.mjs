import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true));
console.log(await E(() => sceneChunk.toString()));
console.log(await E(() => partChunk.toString()));
console.log(await E(() => { const lanes = [[{bar: 0, slot: 0, re: 1}]]; const ch = {lanes: [[]]}; Object.assign(ch, {lanes}); return JSON.stringify(ch); }));
await b.close();
