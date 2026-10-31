// sample frames of the track shot (all engines, 9:16 and 16:9) incl. a STIMME take; console errors collected
import { open } from './lib.mjs';
import { setup } from './setup.mjs';
import fs from 'fs';
const OUT = new URL('../frames/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const {b, p, errs} = await open();
await setup(p, {seq: true});
const st = await p.evaluate(async () => {
  const sr = 48000, n = sr * 2, pcm = new Array(n);
  for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + 2 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 20, (2 - t) * 20) * (.4 + .6 * Math.abs(Math.sin(t * 3)))); }
  SYNQUENZER.tkInject({pcm, sr, scene: 0, len: 1}); const i = stimmeT(); const so = JSON.parse(JSON.stringify(S.song)); so.lanes[i] = [{bar: 2, slot: 0}]; SYNQUENZER.setSong(so);
  await new Promise(r => setTimeout(r, 600)); await SYNQUENZER.vvRender({}); return i;
});
const shots = [[2, 5.3, 'ms'], [1, 4.1, 'fm'], [0, 3.2, 'va'], [4, 2.0, 'drums'], [st, 5.0, 'stimme']];
for (const fmt of ['9:16', '16:9']) for (const [i, t, nm] of shots) {
  const d = await p.evaluate(([i, t, fmt]) => SYNQUENZER.vv3Png(i, t, fmt), [i, t, fmt]);
  fs.writeFileSync(OUT + nm + '-' + fmt.replace(':', 'x') + '.png', Buffer.from(d.split(',')[1], 'base64'));
}
console.log('stimme track', st, 'errors', errs); await b.close();
