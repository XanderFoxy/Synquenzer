// independent repro: armed Split ← nächste Note, leave editor via ≡, then play a real key (touch) on another track
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const VP = process.argv[2] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const TRK = +(process.argv[3] || 4);
const box = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; }, sel);
const tap = async (p, sel) => { const b = await box(p, sel); if (!b) throw new Error('no ' + sel); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(350); return b; };
for (const exit of ['x', 'menu']) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: VP, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000}); await p.waitForTimeout(800);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500)); Q.mkSet(0, 'mode', 2); Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(700);
  await p.evaluate(() => MKUI.setWahl(1, 0)); await p.waitForTimeout(250);
  const r = {vp: VP.width + 'x' + VP.height, exit, trk: TRK};
  r.split0 = await p.evaluate(() => window.SYNQUENZER.mkGet(0).split);
  await tap(p, '.lsplit');
  r.armed = !!(await p.evaluate(() => window.SYNQUENZER.mkPanel())).splitArm;
  if (exit === 'x') await tap(p, '#synthSheet .sh-x'); else { await tap(p, '#bMenu'); r.menuOpen = await p.evaluate(() => document.getElementById('menu').classList.contains('open')); await tap(p, '#menu .sh-x'); }
  r.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  r.uiArm = await p.evaluate(() => typeof UI !== 'undefined' && !!UI.mkSplitArm);
  const u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  // select track TRK by a real tap on its header, then a real tap on a keyboard key
  await tap(p, `.th[data-t="${TRK}"]`);
  r.selT = await p.evaluate(() => window.SYNQUENZER.runtime().selT);
  r.editorAfterSel = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  const kb = await box(p, '#kb');
  r.kb = kb && {w: Math.round(kb.w), h: Math.round(kb.h)};
  if (kb) { await p.touchscreen.tap(kb.x - kb.w * 0.2, kb.y + kb.h * 0.35); await p.waitForTimeout(400); }
  r.split1 = await p.evaluate(() => window.SYNQUENZER.mkGet(0).split);
  const u1 = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  r.undo = {before: u0.n, after: u1.n, top: u1.top && u1.top.label};
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
