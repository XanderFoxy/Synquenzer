import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file, W, H] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: +W, height: +H}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); openClipSheet(0, 0); }); await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => { const e = EL.clipSheet.querySelector('[aria-label="Halbe Länge"]'); const ch = []; for (let a = e; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a), r = a.getBoundingClientRect(); ch.push([a.tagName + '.' + (a.className || '').toString().slice(0, 24) + (a.id ? '#' + a.id : ''), cs.overflowX + '/' + cs.overflowY, a.scrollHeight + '/' + a.clientHeight, Math.round(r.top) + '..' + Math.round(r.bottom), cs.display]); } return ch; })));
await b.close();
