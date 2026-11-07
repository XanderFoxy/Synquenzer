import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [file, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.addScriptTag({path: path.join(here, 'setup.js')});
await p.evaluate(() => __gl1Setup());
await p.evaluate(() => { SYNQUENZER.chsOpen(true); setSongView(true); UI.svGlass = true; UI.dirty.song = true; });
for (const [w, h] of [[428, 926], [926, 428]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
  await p.evaluate(() => { SV.cellW = 36; SV.x = 6 * 36; UI.dirty.song = true; }); await p.waitForTimeout(400);
  await p.screenshot({path: path.join(out, `glass-${w}x${h}.png`)});
}
console.log('errs', JSON.stringify(errs));
await b.close();
