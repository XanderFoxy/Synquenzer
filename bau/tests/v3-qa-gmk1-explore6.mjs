import {open, sleep, OUT} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
console.log(JSON.stringify(await E(() => [SYNQUENZER.getClip(0, 0), SYNQUENZER.getClip(2, 1), SYNQUENZER.getClip(4, 0) && Object.keys(SYNQUENZER.getClip(4, 0))])));
console.log(await E(() => String(SYNQUENZER.saveSound).slice(0, 200)));
await T.br.close();
