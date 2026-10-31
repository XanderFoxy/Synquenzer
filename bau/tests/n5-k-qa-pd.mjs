import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const r = await p.evaluate(() => ({pd: Object.keys(PD).join(' '), wt: [...FACTORY_BY_ID].filter(([id, f]) => f.engine === 'wt').map(([id]) => { const s = factorySound(id); return [id, s.name, s.p.wt]; })}));
console.log(r.pd); console.log(JSON.stringify(r.wt)); console.log('errs', errs);
await b.close();
