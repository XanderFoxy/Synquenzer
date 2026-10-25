import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844});
console.log(await p.evaluate(() => Object.keys(window.SYNQUENZER).join(' ')));
console.log(errs); await b.close();
