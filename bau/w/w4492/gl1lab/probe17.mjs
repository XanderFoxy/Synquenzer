import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  stop(); SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
  for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) S.tracks[t].clips[s] = null;
  const mel = [7, 0, 12, 4, 9, 2, 11, 5];
  S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: mel.map((d, k) => ({t: k * .5, d: .4, n: 48 + d, v: .8}))};
  for (let t = 0; t < NT(); t++) clipChanged(t, 0);
  const o = {};
  for (const dir of ['up', 'down', 'rev']) {
    SYNQUENZER.lf1Dir(0, 0, {dir, g: '1/8'});
    const exp = SYNQUENZER.lf1Events(0, 0, 0).map(n => n.n);
    SYNQUENZER.clearLog(); R.selS = 0; play(); launchScene ? null : null;
    try { SYNQUENZER.launchScene ? SYNQUENZER.launchScene(0) : launchScene(0); } catch (e) { o.le = String(e); }
    await wait(2600); stop(); await wait(200);
    const log = SYNQUENZER.noteLog(200).filter(e => e.track === 0).sort((a, b) => a.beat - b.beat);
    o[dir] = {exp, heard: log.slice(0, 8).map(e => e.out != null ? e.out : e.clipNote), beats: log.slice(0, 8).map(e => +e.beat.toFixed(2)), keys: log[0] ? Object.keys(log[0]) : []};
  }
  return o;
});
console.log(JSON.stringify(r)); console.log('errs', JSON.stringify(errs));
await b.close();
