// Armed [Split ← nächste Note], then the editor goes away via ≡ (menu): does a later note on ANOTHER track change the MS 2000 sound?
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const FILE = process.argv[2] || APP, VP = process.argv[3] === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const box = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel);
const tapSel = async (p, sel) => { const b = await box(p, sel); if (!b) throw new Error('no ' + sel); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(300); };
for (const exit of ['x', 'menu']) {
  const {b, p, errs} = await open(VP, FILE, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500)); Q.mkSet(0, 'mode', 2); Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(600);
  await p.evaluate(() => MKUI.setWahl(1, 0)); await p.waitForTimeout(200);
  const r = {exit};
  r.lcdBefore = await p.evaluate(() => ED.lcd && ED.lcd.innerText.replace(/\s+/g, ' '));
  await tapSel(p, '#synthSheet .lcd .lsplit, .lcd .lsplit, .lsplit');
  r.armed = (await p.evaluate(() => window.SYNQUENZER.mkPanel())).splitArm || false;
  if (exit === 'x') await tapSel(p, '#synthSheet .sh-x'); else { await tapSel(p, '#bMenu'); await tapSel(p, '#menu .sh-x'); }
  r.editor = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  const u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  // the user now plays the drum track and records a clip on synth track 2 (keyboard)
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(4); Q.tap(40, 120); });
  await p.waitForTimeout(400);
  r.split = await p.evaluate(() => window.SYNQUENZER.mkGet(0).split);
  const u1 = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  r.undo = {before: u0.n, after: u1.n, top: u1.top && u1.top.label};
  r.errs = errs; console.log(JSON.stringify(r)); await b.close();
}
