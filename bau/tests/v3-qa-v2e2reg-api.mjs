import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
for (const f of [BASE, NEW]) { const {b, p, errs} = await open({width: 390, height: 844}, f);
console.log(f.split('/').pop(), await p.evaluate(() => Object.keys(window.SYNQUENZER).length), await p.evaluate(() => Object.keys(window.SYNQUENZER).join(' ')));
console.log('errs', errs); await b.close(); }
