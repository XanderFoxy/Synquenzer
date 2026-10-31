import {launch} from './n5-k-blib.mjs';
const {b, p} = await launch();
console.log(await p.evaluate(() => { const s = SYNQUENZER.getSound(0); return {analog: s.p.analog, o2fine: s.p.o2fine, origin: s.origin, spread: s.p.spread, glide: s.p.glide, uniDet: s.p.uniDet, o1uni: s.p.o1uni, flat: wkFlat(s).analog}; }));
await b.close();
