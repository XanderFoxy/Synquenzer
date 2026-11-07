import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [file, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.addScriptTag({path: path.join(here, 'setup.js')}); await p.addScriptTag({path: path.join(here, 'scan.js')});
await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true));
const show = (tag, s) => { const n = k => s[k].length; console.log(tag, JSON.stringify({textOverlap: n('textOverlap'), cutV: n('cutV'), cutH: n('cutH'), btnOverlap: n('btnOverlap'), covered: n('covered'), outside: n('outside')}));
  for (const k of ['textOverlap', 'cutV', 'cutH', 'btnOverlap', 'covered', 'outside']) for (const x of s[k].slice(0, 12)) console.log('   ', k, JSON.stringify(x)); };
for (const view of ['mx', 'song']) {
  await p.evaluate(v => setSongView(v === 'song'), view); await p.waitForTimeout(400);
  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(700);
    if (view === 'mx') { const pages = await p.evaluate(() => MX.pages ? MX.pages.length : 1); for (let k = 0; k < pages; k++) { await p.evaluate(k => setTrackBank(k), k); await p.waitForTimeout(400); show(`${view} ${w}x${h} bank${k}`, await p.evaluate(() => __gl1Scan('#app'))); await p.screenshot({path: path.join(out, `${view}-${w}x${h}-b${k}.png`)}); } await p.evaluate(() => setTrackBank(0)); }
    else { const pages = await p.evaluate(() => SV.pages ? SV.pages.length : 1); for (let k = 0; k < pages; k++) { await p.evaluate(k => { setTrackBank(k); svLayout(); }, k); await p.waitForTimeout(400); const ri = await p.evaluate(() => ({rowH: +SV.rowH.toFixed(1), rows: SV.rows.length})); show(`${view} ${w}x${h} bank${k} ${JSON.stringify(ri)}`, await p.evaluate(() => __gl1Scan('#app'))); await p.screenshot({path: path.join(out, `${view}-${w}x${h}-b${k}.png`)}); } await p.evaluate(() => setTrackBank(0)); }
  }
  await p.setViewportSize({width: 428, height: 926});
}
console.log('errs', JSON.stringify(errs));
await b.close();
