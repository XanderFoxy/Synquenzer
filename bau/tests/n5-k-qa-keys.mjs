import {launch} from './n5-k-blib.mjs';
const {b, p} = await launch({});
console.log(await p.evaluate(() => Object.keys(SYNQUENZER).filter(k => /render|wav|bounce|offline|capture|scope|tap|meter|rms|level/i.test(k)).join(' ')));
await b.close();
