import { open } from './lib.mjs'; import { loadDemo } from './load.mjs'; import fs from 'fs';
const views = process.argv.slice(2);
const {b, p, errs} = await open();
console.log(await loadDemo(p));
for (const view of views) {
  const m = await p.evaluate(async view => { SYNQUENZER.vvTest({opus: true}); return SYNQUENZER.vvMake({fmt: '9:16', view}); }, view);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob());
  fs.writeFileSync('vv-' + view + '.' + bl.ext, Buffer.from(bl.b64, 'base64'));
  console.log(view, JSON.stringify(m).slice(0, 200));
}
console.log(errs.slice(0, 5)); await b.close();
