// QA V2e: geometry of the song view vs the previous snapshot (V2d′-fix) in all six viewports (W = 844×1180 per §0.4)
import { chromium } from 'playwright';
import { SETUP } from './v3-v2d2-lib.mjs';
const SNAP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
async function measure(file, vp) {
  const [w, h] = VPS[vp];
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(600);
  await p.evaluate(SETUP(true));
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const R = e => { if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
    const cv = document.querySelector('.sv-cv') || document.querySelector('#songView canvas');
    const btns = [...document.querySelectorAll('#songView button, #songView .rb')].filter(x => x.offsetWidth).map(x => ({c: x.className, t: x.textContent.trim().slice(0, 14), r: R(x)}));
    const sw = document.documentElement.scrollWidth, iw = innerWidth;
    const pb = document.querySelector('#partBar') || document.querySelector('.partbar') || document.querySelector('[class*="partbar"]');
    const info = window.SYNQUENZER.svLayoutInfo ? window.SYNQUENZER.svLayoutInfo() : null;
    return {cv: R(cv), sw, iw, btns, carrier: R(document.getElementById('carrier')), kb: R(document.getElementById('kb') || document.querySelector('.kb')), pb: R(pb), info: info && {rows: info.rows, rowH: info.rowH, rulerH: info.rulerH}};
  });
  await ctx.close(); r.errs = errs; return r;
}
for (const vp of Object.keys(VPS)) {
  const a = await measure(SNAP + 'V2d′-fix.html', vp), c = await measure(APP, vp);
  console.log(vp, 'OLD cv', JSON.stringify(a.cv), 'NEW cv', JSON.stringify(c.cv), 'sw', c.sw, c.iw, 'carrier', JSON.stringify(a.carrier), JSON.stringify(c.carrier), 'pb', JSON.stringify(a.pb), JSON.stringify(c.pb));
  console.log(vp, 'NEW info', JSON.stringify(c.info), 'OLD info', JSON.stringify(a.info));
  console.log(vp, 'OLD btns', JSON.stringify(a.btns.map(x => x.t + '@' + x.r.join(','))));
  console.log(vp, 'NEW btns', JSON.stringify(c.btns.map(x => x.t + '@' + x.r.join(','))));
  console.log(vp, 'errs', JSON.stringify(c.errs));
}
await b.close();
