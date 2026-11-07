import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const [fa, fb, W, H] = process.argv.slice(2);
const b = await chromium.launch(); const imgs = [];
for (const f of [fa, fb]) { const ctx = await b.newContext({viewport: {width: +W, height: +H}, hasTouch: true}); const p = await ctx.newPage(); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1500);
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); setSongView(true); UI.dirty.all = true; }); await p.waitForTimeout(900); await p.evaluate(() => { if (EL.toast) EL.toast.style.visibility = 'hidden'; });
  imgs.push((await p.screenshot()).toString('base64'));
  if (f === fb) console.log(JSON.stringify(await p.evaluate(() => { const v = SV.btn.bLoop.lastChild; return {txt: v.textContent, cls: v.className, w: v.offsetWidth, bw: SV.btn.bLoop.clientWidth}; })));
  await ctx.close(); }
const ctx = await b.newContext({viewport: {width: +W, height: +H}}); const p = await ctx.newPage(); await p.goto('about:blank');
console.log(JSON.stringify(await p.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; }); const A = await ld(a), C = await ld(c); const cv = document.createElement('canvas'); cv.width = A.width; cv.height = A.height; const g = cv.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, A.width, A.height).data; g.clearRect(0, 0, A.width, A.height); g.drawImage(C, 0, 0); const dc = g.getImageData(0, 0, A.width, A.height).data; let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) + Math.abs(da[i + 1] - dc[i + 1]) + Math.abs(da[i + 2] - dc[i + 2]) > 6) { n++; const k = i / 4, x = k % A.width, y = Math.floor(k / A.width); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return {n, box: [x0, y0, x1, y1]}; }, imgs)));
fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4492/gl1lab/d-a.png', Buffer.from(imgs[0], 'base64')); fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4492/gl1lab/d-b.png', Buffer.from(imgs[1], 'base64'));
await b.close();
