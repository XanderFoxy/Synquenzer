// Solo after leaving the MS 2000 editor: ✕ vs ≡ (menu) vs the save path; fresh INIT project, only track 0 has a clip
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const FILE = process.argv[2] || APP, VP = process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const box = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel);
const tapSel = async (p, sel) => { const b = await box(p, sel); if (!b) throw new Error('no ' + sel); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(300); };
const tapK = (p, k) => tapSel(p, '#synthSheet .mkx[data-k="' + k + '"]');
const meas = (p, ms) => p.evaluate(async ms => { let mx = -200; const t0 = performance.now(); while (performance.now() - t0 < ms) { const m = window.SYNQUENZER.meter(); if (isFinite(m.rmsDb)) mx = Math.max(mx, m.rmsDb); await new Promise(r => setTimeout(r, 30)); } return +mx.toFixed(1); }, ms);
const kb = async p => { await p.evaluate(() => window.SYNQUENZER.tap(60, 600)); const v = await meas(p, 650); await p.waitForTimeout(900); return v; };
const clip = async p => { await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0)); await p.waitForTimeout(600); const v = await meas(p, 1500); await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(1200); return v; };
for (const exit of ['x', 'menu']) {
  const {b, p, errs} = await open(VP, FILE, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
    Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.a.lvl', 0); Q.mkSet(0, 't.1.a.lvl', 127); Q.mkSet(0, 't.1.o1.w', 1); Q.selectTrack(0);
    Q.setBpm(120); Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(t => ({t, d: .9, n: 60, v: .9}))}); });
  const r = {exit};
  await kb(p); r.kb0 = await kb(p); r.clip0 = await clip(p);
  await p.evaluate(() => window.SYNQUENZER.openEditor()); await p.waitForTimeout(600);
  await tapK(p, 'shift'); await tapK(p, 'timbre'); r.solo = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).solo;
  r.kbSolo = await kb(p); r.clipSolo = await clip(p);
  if (exit === 'x') await tapSel(p, '#synthSheet .sh-x'); else { await tapSel(p, '#bMenu'); await tapSel(p, '#menu .sh-x'); }
  r.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  r.kbAfter = await kb(p); r.clipAfter = await clip(p);
  const s1 = await p.evaluate(() => window.SYNQUENZER.serialize()); r.soloInFile = /solo/i.test(s1);
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
