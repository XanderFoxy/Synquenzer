import {open, sleep, OUT, summ} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]});
const {p, E} = T;
console.log((await E(() => Object.keys(SYNQUENZER))).join(' '));
await T.b.close();
