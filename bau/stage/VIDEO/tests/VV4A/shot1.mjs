import { open, SONG } from './lib.mjs';
import fs from 'fs';
const O = '/tmp/claude-0/-home-user-Synquenzer/993410ec-5e46-5708-b50a-74fa5caa208d/scratchpad/out/';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG);
await p.evaluate(() => { SYNQUENZER.songSetChord(2, 'F'); SYNQUENZER.songSetChord(5, 'Am'); S.song.xp = [{beat: 12, semi: 2}, {beat: 20, semi: 0}]; });
const r = await p.evaluate(async () => { await SYNQUENZER.vvRender({}); await SYNQUENZER.vvAppPrep(); const o = {};
  for (const [t, v] of [[5.5, 'matrix'], [7.2, 'song'], [12, 'matrix']]) o[t + v] = SYNQUENZER.vvDrawAppPng(t, 1080, 1920, v); return o; });
for (const k in r) { fs.writeFileSync(O + 'app-' + k + '.png', Buffer.from(r[k].png, 'base64')); console.log(k, JSON.stringify(r[k].o)); }
console.log(errs); await b.close();
