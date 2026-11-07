import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [file, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.addScriptTag({path: path.join(here, 'setup.js')}); await p.addScriptTag({path: path.join(here, 'scan.js')});
await p.evaluate(() => __gl1Setup());
console.log(JSON.stringify(await p.evaluate(() => { const o = {}; SYNQUENZER.chsOpen(true); setSongView(true);
  try { o.blk = SYNQUENZER.blockMake(0, 7); } catch (e) { o.blkErr = e.message; }
  try { o.fill = SYNQUENZER.fllPlace ? SYNQUENZER.fllPlace('gr2f-reggae', 36) : 'none'; } catch (e) { o.fillErr = e.message; }
  S.song.loop = {on: true, a: 8, b: 16}; songChanged();
  try { SYNQUENZER.vd3.cut(true); o.cut = true; } catch (e) { o.cutErr = e.message; }
  return o; })));
for (const zoom of ['def', 'far']) for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
  await p.evaluate(z => { if (z === 'far') { SV.cellW = 8; SV.x = 0; } else { SV.cellW = 36; SV.x = 8 * 36; } FOL.page.song = null; UI.dirty.song = true; }, zoom); await p.waitForTimeout(400);
  const li = await p.evaluate(() => { const L = svLayoutInfo(); return {rulerH: L.rulerH, rowH: L.rowH, rows: L.rows.length, blS: L.blS, cw: L.cellW}; });
  console.log(zoom, w, h, JSON.stringify(li));
  await p.screenshot({path: path.join(out, `song-${zoom}-${w}x${h}.png`)});
}
console.log('errs', JSON.stringify(errs));
await b.close();
