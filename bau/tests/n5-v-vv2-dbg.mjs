import { open } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const {b, p, errs} = await open();
await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvDirSet(8, 16, 'matrix'); SYNQUENZER.vvDirSet(8, 12, 'spur', 2); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'}); }, SONG16);
await p.evaluate(() => SYNQUENZER.vvMake({range: {a: 0, b: 12}}));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); fs.writeFileSync('n5-v-out/dbg.mp4', Buffer.from(bl.b64, 'base64'));
const t = 450 / 30;
execSync(`ffmpeg -v error -y -ss ${(t + 1 / 60).toFixed(4)} -i n5-v-out/dbg.mp4 -frames:v 1 n5-v-out/dbg-vid.png`);
const png = await p.evaluate(t => SYNQUENZER.vvShot(t, 'auto', '9:16'), t); fs.writeFileSync('n5-v-out/dbg-ref.png', Buffer.from(png, 'base64'));
const lg = await p.evaluate(t => { const L = VV.lastRt.log; return L.filter(e => Math.abs(e.ts - t) < .1); }, t);
console.log(JSON.stringify(lg.slice(0, 5)));
execSync('ffmpeg -v error -y -i n5-v-out/dbg-vid.png -i n5-v-out/dbg-ref.png -filter_complex hstack,scale=1080:960 n5-v-out/dbg-pair.png');
await b.close();
