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
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
  await p.screenshot({path: path.join(out, `song-${w}x${h}.png`)});
  const info = await p.evaluate(() => { const L = svLayoutInfo(); const labs = [...SV.labs.querySelectorAll('.sv-l')].map(d => { const r = d.getBoundingClientRect(); return {t: d.dataset.t, cls: d.className, y: Math.round(r.top), h: Math.round(r.height), txt: d.textContent.slice(0, 20)}; }); return {rows: L.rows, rowH: L.rowH, rulerH: L.rulerH, canvas: L.canvas, labs}; });
  console.log(w, h, JSON.stringify(info));
}
await p.setViewportSize({width: 428, height: 926}); await p.evaluate(() => setSongView(false)); await p.waitForTimeout(600);
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
  await p.screenshot({path: path.join(out, `mx-${w}x${h}.png`)});
}
console.log('errs', JSON.stringify(errs));
await b.close();
