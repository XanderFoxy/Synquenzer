// Solo set in the MS 2000 editor, then other exits: 🎤 SINGEN, ● REC, FANG, a new project via menu (switchProject)
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const box = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel);
const tapSel = async (p, sel) => { const b = await box(p, sel); if (!b) throw new Error('no ' + sel); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(400); };
const tapK = (p, k) => tapSel(p, '#synthSheet .mkx[data-k="' + k + '"]');
const meas = (p, ms) => p.evaluate(async ms => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } return +mx.toFixed(1); }, ms);
const kb = async p => { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.tap(60, 600); }); const v = await meas(p, 650); await p.waitForTimeout(900); return v; };
for (const exit of ['mic', 'rec', 'fang', 'newproject']) {
  const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
  const setup = async () => p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
    Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); Q.selectTrack(0); });
  await setup(); const r = {exit}; await kb(p); r.kb0 = await kb(p);
  await p.evaluate(() => window.SYNQUENZER.openEditor()); await p.waitForTimeout(600);
  await tapK(p, 'shift'); await tapK(p, 'timbre'); r.solo = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo;
  try {
    if (exit === 'mic') await tapSel(p, '#segMic');
    if (exit === 'rec') { await tapSel(p, '#bRec'); await p.waitForTimeout(600); await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().rec.state !== 'off') Q.rec(); Q.stop(); }); }
    if (exit === 'fang') { await tapSel(p, '#bFang'); }
    if (exit === 'newproject') { await tapSel(p, '#bMenu'); await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500)); Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); Q.closeMenu && Q.closeMenu(); }); }
  } catch (e) { r.exitErr = String(e).slice(0, 120); }
  await p.waitForTimeout(400);
  r.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  if (r.editor && r.editor !== 'synth') { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeMenu && Q.closeMenu(); }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); r.editor2 = await p.evaluate(() => window.SYNQUENZER.runtime().editor); }
  r.kbAfter = await kb(p);
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
