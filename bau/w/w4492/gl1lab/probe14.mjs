import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file, W, H] = process.argv.slice(2);
const b = await chromium.launch({args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']}); const ctx = await b.newContext({viewport: {width: +W, height: +H}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); stSheet(EL.top); }); await p.waitForTimeout(900);
console.log(JSON.stringify(await p.evaluate(() => { const e = UI.pop.el.querySelector('.st-hint'); const ch = []; for (let a = e; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a), r = a.getBoundingClientRect(); ch.push([a.tagName + '.' + (a.className || '').toString().slice(0, 30), cs.overflowX + '/' + cs.overflowY, Math.round(r.top) + '..' + Math.round(r.bottom), a.scrollHeight + '/' + a.clientHeight, cs.position, cs.maxHeight]); } return ch; })));
await b.close();
