import {open, ok} from './lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(() => { const D = SYNQUENZER; return {lkt: D.lkt(), info: D.lkInfo()}; });
console.log(JSON.stringify(r.info), 'exc', Object.keys(r.lkt.exc).length, 'A', r.lkt.A.length, 'M', r.lkt.M.length, 'nAV', r.lkt.nAV);
console.log('errs', errs);
await b.close();
