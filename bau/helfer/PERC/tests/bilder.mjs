// PERC: Bildschirmfotos 428×926, 926×428, 428×650 → tests/bilder/ (Raster mit Schild, Seite NORTH, Kit ▾, Rolle mit Kanal-Namen)
// und eine Messung der Tastengrößen (≥ 44 px) auf der Seite NORTH
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url'; import fs from 'fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] || path.resolve(HERE, '../index.html'), DIR = path.resolve(HERE, 'bilder'); fs.mkdirSync(DIR, {recursive: true});
const SIZES = [[428, 926], [926, 428], [428, 650]];
let bad = 0;
for (const [w, h] of SIZES) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300).catch(() => {});
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  const tag = w + 'x' + h;
  await p.evaluate(async () => { const bf = soundSnapshot(3); setEngine(3, 'north'); commitSound(3, bf, 'Klangerzeugung'); SYNQUENZER.setClip(3, 0, {len: 1, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map((t, k) => ({t, d: .25, n: [60, 64, 62, 64, 60, 69, 62, 71][k], v: .9}))}); SYNQUENZER.selectTrack(3); UI.dirty.all = true; await new Promise(r => setTimeout(r, 400)); });
  await p.screenshot({path: path.join(DIR, `perc-raster-${tag}.png`)});
  await p.evaluate(async () => { SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 600)); });
  await p.screenshot({path: path.join(DIR, `perc-seite-${tag}.png`)});
  const sz = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .percpg button, #synthSheet .engchip button')].filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(), be = getComputedStyle(b, '::before'), ext = be.content !== 'none' && be.position === 'absolute' ? Math.max(0, -parseFloat(be.top) || 0) + Math.max(0, -parseFloat(be.bottom) || 0) : 0; return [b.className.split(' ').pop() || b.textContent.trim(), Math.round(r.width), Math.round(r.height + ext)]; }));
  const small = sz.filter(x => x[1] < 44 || x[2] < 44);
  const over = await p.evaluate(() => { const pg = document.querySelector('#synthSheet .percpg'); if (!pg) return null; const r = pg.getBoundingClientRect(); return {w: Math.round(r.width), sw: pg.scrollWidth, cw: pg.clientWidth}; });
  await p.evaluate(async () => { document.querySelector('#synthSheet .perckit').click(); await new Promise(r => setTimeout(r, 500)); });
  await p.screenshot({path: path.join(DIR, `perc-kit-${tag}.png`)});
  await p.evaluate(async () => { closePop(); SYNQUENZER.closeEditor(); SYNQUENZER.openRoll(3, 0); await new Promise(r => setTimeout(r, 700)); });
  await p.screenshot({path: path.join(DIR, `perc-rolle-${tag}.png`)});
  console.log(JSON.stringify({tag, small, over, errs}));
  if (small.length || errs.length || (over && over.sw > over.cw + 1)) bad++;
  await b.close();
}
process.exit(bad ? 1 : 0);
