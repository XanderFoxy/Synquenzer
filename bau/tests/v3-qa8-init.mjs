import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page, errs} = await open(b, 'P1');
const r = await page.evaluate(() => { mkLoad(); return JSON.stringify(SQMK.init()); });
console.log(r);
console.log(await page.evaluate(() => Object.keys(SYNQUENZER).join(' ')));
console.log(errs);
await b.close();
