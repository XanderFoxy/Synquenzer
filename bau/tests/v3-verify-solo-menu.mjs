// independent repro: MS 2000 solo (SHIFT+TIMBRE) after leaving the editor via ≡ menu vs ✕, and into a new project
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const VP = process.argv[2] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open() {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: VP, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800); return {b, p, errs};
}
const center = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel);
const tap = async (p, sel) => { const c = await center(p, sel); if (!c) throw new Error('missing ' + sel); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(350); };
// peak RMS over a window while a note is held
const peak = (p, ms) => p.evaluate(async ms => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 25)); } return +mx.toFixed(1); }, ms);
const note = async p => { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.tap(60, 700); }); const v = await peak(p, 700); await p.waitForTimeout(1000); return v; };
const clip = async p => { await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0)); await p.waitForTimeout(500); const v = await peak(p, 1600); await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(1200); return v; };
const setup = p => p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 600));
  Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); Q.selectTrack(0); Q.setBpm(120);
  Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .9, n: 60, v: .9}))}); });
for (const exit of ['x', 'menu', 'menu-newproject']) {
  const {b, p, errs} = await open(); const r = {exit, vp: VP.width + 'x' + VP.height};
  await setup(p); await note(p); r.before = await note(p); r.clipBefore = await clip(p);
  await p.evaluate(() => window.SYNQUENZER.openEditor()); await p.waitForTimeout(700);
  await tap(p, '#synthSheet .mkx[data-k="shift"]'); await tap(p, '#synthSheet .mkx[data-k="timbre"]');
  r.soloSet = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo; r.inSolo = await note(p);
  if (exit === 'x') await tap(p, '#synthSheet .sh-x');
  else { await tap(p, '#bMenu'); r.menuOpen = await p.evaluate(() => document.getElementById('menu').classList.contains('open'));
    if (exit === 'menu-newproject') {
      // the [Neu] button in the menu, if one is there; else the API path
      const has = await p.evaluate(() => [...document.querySelectorAll('#menu button')].map(b => b.textContent.trim()).filter(t => /neu/i.test(t)).slice(0, 8));
      r.menuNeuButtons = has;
      await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 600)); Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); Q.selectTrack(0);
        Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .9, n: 60, v: .9}))}); });
      if (await p.evaluate(() => document.getElementById('menu').classList.contains('open'))) await tap(p, '#menu .sh-x');
    } else await tap(p, '#menu .sh-x');
  }
  r.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  r.panelSoloOnMain = await p.evaluate(() => { const m = window.SYNQUENZER.mkPanel(); return m ? m.solo : 'n/a'; });
  r.after = await note(p); r.clipAfter = await clip(p);
  // is there any visible hint on the main screen?
  r.mainText = await p.evaluate(() => /solo/i.test(document.body.innerText));
  await p.evaluate(() => window.SYNQUENZER.openEditor()); await p.waitForTimeout(700);
  r.soloOnReopen = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo;
  await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-verify-solo-${exit}-${VP.width}.png`});
  await tap(p, '#synthSheet .mkx[data-k="timbre"]'); r.soloAfterTimbreTap = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo;
  await tap(p, '#synthSheet .sh-x'); r.afterTimbreTap = await note(p);
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
