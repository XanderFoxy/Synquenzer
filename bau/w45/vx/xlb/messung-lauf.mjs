// XLB: messung.html einmal in Chromium laufen lassen (Start tippen, ≈ 70 s), Tabelle lesen, Foto. Aufruf: node messung-lauf.mjs <messung.html> <foto.png>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const f = path.resolve(process.argv[2]), png = process.argv[3];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + f); await p.tap('#go');
await p.waitForFunction(() => /Fertig|lädt nicht/.test(document.getElementById('st').textContent), null, {timeout: 150000});
const r = await p.evaluate(() => ({st: document.getElementById('st').textContent, fazit: document.getElementById('fazit').textContent,
  rows: [...document.querySelectorAll('#tab tr')].slice(1).map(tr => [...tr.children].map(td => td.textContent)), res: window.RES}));
if (png) await p.screenshot({path: png});
console.log(JSON.stringify({...r, errs}));
await b.close();
