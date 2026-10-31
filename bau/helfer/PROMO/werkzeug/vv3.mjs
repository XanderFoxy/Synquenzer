import { open } from './lib.mjs'; import { loadDemo } from './load.mjs'; import fs from 'fs';
const {b, p, errs} = await open(); console.log(await loadDemo(p));
for (const spur of [1, 4, 0, 5]) {
  const m = await p.evaluate(async spur => { SYNQUENZER.vvTest({opus: true, spur}); return SYNQUENZER.vvMake({fmt: '9:16', view: 'auto', range: {a: 18, b: 30}}); }, spur);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); fs.writeFileSync('vv3-' + spur + '.mp4', Buffer.from(bl.b64, 'base64')); console.log(spur, m.dur);
}
console.log(errs.slice(0, 4)); await b.close();
