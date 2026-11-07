import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [file, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.addScriptTag({path: path.join(path.dirname(new URL(import.meta.url).pathname), 'setup.js')});
console.log(JSON.stringify(await p.evaluate(() => __gl1Setup())));
await p.evaluate(() => { SYNQUENZER.chsOpen(true); setSongView(true); }); await p.waitForTimeout(600);
const scen = process.argv[4] || 'plain';
await p.evaluate(sc => { SV.x = 8 * SV.cellW; FOL.page.song = null; UI.dirty.song = true;
  if (sc.includes('loop')) { S.song.loop = {on: true, a: 8, b: 16}; songChanged(); }
  if (sc.includes('vid')) { try { SYNQUENZER.vd3 && SYNQUENZER.vd3.cut ? SYNQUENZER.vd3.cut(true) : null; } catch (e) { console.log('vid', e.message); } }
}, scen);
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
  await p.evaluate(() => { SV.x = 8 * SV.cellW; UI.dirty.song = true; }); await p.waitForTimeout(300);
  await p.screenshot({path: path.join(out, `song-${scen}-${w}x${h}.png`)});
}
console.log('errs', JSON.stringify(errs));
await b.close();
