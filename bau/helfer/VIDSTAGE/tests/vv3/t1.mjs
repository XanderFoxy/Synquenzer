// first look: render, frames of every track in 16:9 and 9:16, probe values, draw time
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import fs from 'fs';
const OUT = new URL('../frames/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const {b, p, errs} = await open();
console.log(JSON.stringify(await setup(p, {seq: true})));
const r = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({}); return {dur: r.dur, t0: SYNQUENZER.vv3T0(), n: [0,1,2,3,4,5].map(i => SYNQUENZER.vv3Notes(i).length)}; });
console.log(JSON.stringify(r));
for (const fmt of ['16:9', '9:16']) for (const i of [0, 1, 2, 4]) {
  const t = 5.3, d = await p.evaluate(([i, t, fmt]) => SYNQUENZER.vv3Png(i, t, fmt), [i, t, fmt]);
  fs.writeFileSync(OUT + 'spur' + i + '-' + fmt.replace(':', 'x') + '.png', Buffer.from(d.split(',')[1], 'base64'));
  console.log(fmt, i, JSON.stringify(await p.evaluate(([i, t, fmt]) => SYNQUENZER.vv3Probe(i, t, fmt), [i, t, fmt])));
}
console.log('ms/frame 9:16', JSON.stringify(await p.evaluate(() => [0, 1, 2, 4].map(i => +SYNQUENZER.vv3Ms(i, 2, 30).toFixed(2)))));
console.log('errors', errs); await b.close();
