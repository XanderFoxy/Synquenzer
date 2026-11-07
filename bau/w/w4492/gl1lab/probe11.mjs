import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 926, height: 428}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); openMenu(); }); await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => { const e = [...EL.menu.querySelectorAll('button')].find(b => b.textContent.includes('Demo laden')); const ch = []; for (let a = e; a; a = a.parentElement) { const cs = getComputedStyle(a); ch.push([a.tagName + '.' + (a.className || '').toString().slice(0, 20), cs.overflowX, cs.overflowY, a.scrollHeight, a.clientHeight, cs.position]); } return ch; })));
await b.close();
