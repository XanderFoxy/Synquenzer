import { open, APP } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const keys = await p.evaluate(() => Object.keys(window.SYNQUENZER).sort().join(' '));
console.log(keys);
console.log('version', await p.evaluate(() => window.SYNQUENZER.version));
await p.waitForTimeout(1500);
console.log('errs', JSON.stringify(errs));
await b.close();
