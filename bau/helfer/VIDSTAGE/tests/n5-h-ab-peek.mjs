import { launch } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
console.log(await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(0, 0)).slice(0, 600)));
console.log(await p.evaluate(() => Object.keys(SYNQUENZER).join(' ')));
await b.close();
