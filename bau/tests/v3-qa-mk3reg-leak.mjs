// Regression/interaction: Solo and armed split must end when the MS 2000 editor goes away (closeEditor does it; other exits?)
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const FILE = process.argv[2] || APP, VP = process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const sl = ms => new Promise(r => setTimeout(r, ms));
const box = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; }, sel);
const tapSel = async (p, sel) => { const b = await box(p, sel); if (!b) throw new Error('no ' + sel); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(250); };
const tapK = (p, k) => tapSel(p, '#synthSheet .mkx[data-k="' + k + '"]');
const level = async (p, note) => { // play a held note on track 0 for 600 ms, return the max RMS dB
  return p.evaluate(async n => { const Q = window.SYNQUENZER; Q.selectTrack(0); let mx = -200; Q.tap(n, 700); const t0 = performance.now();
    while (performance.now() - t0 < 650) { const m = Q.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } await new Promise(r => setTimeout(r, 900)); return +mx.toFixed(1); }, note); };
const out = {};
for (const exit of ['closeEditor', 'menu', 'browser']) {
  const {b, p, errs} = await open(VP, FILE, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
    Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); });
  const r = {exit};
  r.before = await level(p, 60);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(600);
  await tapK(p, 'shift'); await tapK(p, 'timbre');
  r.panelSolo = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo;
  r.soloLevel = await level(p, 60);
  if (exit === 'closeEditor') await tapSel(p, '#synthSheet .sh-x');
  if (exit === 'menu') { await tapSel(p, '#bMenu'); await p.waitForTimeout(400); r.menuOpen = await p.evaluate(() => window.SYNQUENZER.runtime().editor); await p.evaluate(() => window.SYNQUENZER.closeMenu()); await p.waitForTimeout(300); }
  if (exit === 'browser') { await tapSel(p, '#synthSheet .pv'); await p.waitForTimeout(500); r.brOpen = await p.evaluate(() => window.SYNQUENZER.runtime().editor); await p.evaluate(() => window.SYNQUENZER.closeEditor()); await p.waitForTimeout(300); }
  r.editorAfter = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  r.afterLevel = await level(p, 60);
  // the same clip in a scene, later
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .9, n: 60, v: .9}))}); Q.launchClip(0, 0); });
  await p.waitForTimeout(1200);
  r.clipLevel = await p.evaluate(async () => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < 1500) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } return +mx.toFixed(1); });
  await p.evaluate(() => window.SYNQUENZER.stop());
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(600);
  r.reopenPanel = await p.evaluate(() => { const pi = window.SYNQUENZER.mkPanel(); return {solo: pi.solo || null, timbre: pi.timbre, leds: [...document.querySelectorAll('#synthSheet .mkx[data-k="timbre"] .mled')].map(e => e.className).join('|')}; });
  r.reopenLevel = await level(p, 60);
  r.errs = errs.slice(); out[exit] = r; await b.close();
}
for (const k in out) console.log(JSON.stringify(out[k]));
