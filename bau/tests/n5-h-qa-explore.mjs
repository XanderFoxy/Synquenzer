import { open, T, sleep } from './n5-h-qa-lib.mjs';
const {b, p, errs, cdp} = await open('P1');
console.log(await p.evaluate(() => Object.keys(window.SYNQUENZER).filter(k => /proj|import|new|open|load|save|serial|hist|version|park|list/i.test(k)).join(' ')));
await b.close();
