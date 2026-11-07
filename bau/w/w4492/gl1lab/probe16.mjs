import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch(); 
for (const [w, h] of [[926, 428], [926, 370], [428, 926]]) {
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); vvOpen(); }); await p.waitForTimeout(700);
console.log(w, h, JSON.stringify(await p.evaluate(() => [...VV.el.querySelectorAll('.vvseg')].map(sg => [...sg.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return b.textContent.trim() + ':' + Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.right); }).join(' ')))));
if (out) await p.screenshot({path: out + '-' + w + 'x' + h + '.png'});
await ctx.close(); }
await b.close();
