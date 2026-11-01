import { open, sing, chor } from './lib.mjs';
const {b, p, errs} = await open();
console.log('inject', JSON.stringify(await sing(p)));
const sel = await p.evaluate(() => { const S = SYNQUENZER; return {keys: Object.keys(S).filter(k => /^g6|^g2Open|tkRef/.test(k))}; });
console.log(JSON.stringify(sel));
const i = await chor(p);
console.log('chor', JSON.stringify(i && i.chor && {rec: i.chor.rec, n: i.chor.voices.map(v => v.n.length + ':' + v.n.map(x => x.iv).join(','))}));
console.log('errs', JSON.stringify(errs.slice(0, 5)));
await b.close();
