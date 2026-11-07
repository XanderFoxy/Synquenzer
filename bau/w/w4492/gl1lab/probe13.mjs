import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file, W, H] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: +W, height: +H}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); vvOpen(); }); await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => { const e = [...VV.el.querySelectorAll('button')].find(b => b.textContent.trim() === 'Ganze App'); const ch = []; for (let a = e; a && a !== VV.el; a = a.parentElement) { const cs = getComputedStyle(a), r = a.getBoundingClientRect(); ch.push([a.tagName + '.' + (a.className || '').toString().slice(0, 30), cs.overflowX, Math.round(r.left) + '..' + Math.round(r.right), a.scrollWidth + '/' + a.clientWidth, cs.display, cs.flexWrap, cs.font.slice(0, 40), cs.padding]); } return ch; })));
await b.close();
