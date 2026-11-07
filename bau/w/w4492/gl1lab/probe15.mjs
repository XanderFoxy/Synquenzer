import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [file] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true}); const p = await ctx.newPage();
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
await p.evaluate(() => { SYNQUENZER.loadDemo(); S.tracks[0].clips[7] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .5, d: .4, n: 48 + d, v: .8}))}; clipChanged(0, 7); ROLLP.view = 'lauf'; openRoll(0, 7); SYNQUENZER.lf1DirMenu(); }); await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => { const P = UI.pop.el, R = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }; const x = [...P.querySelectorAll('button')].find(b => b.textContent.trim() === '✕'); return {x: x && R(x), xcls: x && x.className, h4: R(P.querySelector('h4')), first: [...P.querySelectorAll('.lf1dirs button')].slice(0, 2).map(R), pad: getComputedStyle(P).padding}; })));
await b.close();
