// QA regression (V2d): real touch taps on the matrix (P1 + L1): ▶ scene, tap running clip = stop at bar end,
// ■ twice = now, launch single clip; undo after FANG and after ● record; base vs new
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d-fix.html';
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const tapSel = async (p, sel) => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; }, sel); if (!r) throw new Error('no ' + sel); await p.touchscreen.tap(r.x, r.y); };
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(180); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 60)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(1, 69)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(3, 72)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]}); });
  await p.waitForTimeout(300);
  const r = {};
  // ▶1 (scene launch button)
  const sceneBtn = await p.evaluate(() => { const e = [...document.querySelectorAll('[data-scn], .scn, button')].find(x => x.offsetParent && /▶\s*1|^1$/.test(x.textContent.trim()) && x.dataset && (x.dataset.scn != null || x.dataset.s != null)); if (!e) return null; e.setAttribute('data-qa', 'sc1'); return e.outerHTML.slice(0, 80); });
  r.sceneBtn = !!sceneBtn;
  if (sceneBtn) await tapSel(p, '[data-qa=sc1]'); else await p.evaluate(() => window.SYNQUENZER.launchScene(0));
  await waitBeat(p, 2.2);
  r.s0 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
  // tap running clip (track 0, scene 0) = stop at bar end
  await tapSel(p, '.slot[data-t="0"][data-s="0"]'); await p.waitForTimeout(80);
  r.stopQ = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
  await waitBeat(p, 4.3); r.s1 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
  // launch single clip track 1 slot 1
  await tapSel(p, '.slot[data-t="1"][data-s="1"]'); await p.waitForTimeout(80);
  r.q2 = await p.evaluate(() => window.SYNQUENZER.runtime().queued);
  await waitBeat(p, 8.3); r.s2 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
  // ■ of track 4 twice = now
  await tapSel(p, '.stp[data-t="4"]'); await p.waitForTimeout(60); await tapSel(p, '.stp[data-t="4"]'); await p.waitForTimeout(80);
  r.s3 = await p.evaluate(() => window.SYNQUENZER.runtime().slots);
  // FANG on track 2 (empty), then undo
  await p.evaluate(() => window.SYNQUENZER.selectSlot(2, 0));
  const b0 = await p.evaluate(() => Math.ceil(window.SYNQUENZER.runtime().beat));
  for (let k = 0; k < 4; k++) { await waitBeat(p, b0 + k - .03); await p.evaluate(n => window.SYNQUENZER.tap(n, 100), 64 + k * 2); }
  await p.waitForTimeout(200);
  await tapSel(p, vp === 'P1' ? '#bFang' : '#bFangT'); await p.waitForTimeout(150);
  r.fangClip = await p.evaluate(() => !!window.SYNQUENZER.getClip(2, 0));
  await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(100);
  r.afterUndo = await p.evaluate(() => !!window.SYNQUENZER.getClip(2, 0));
  r.errs = errs.slice(); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  out[name + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) { const A = out['base' + vp], B = out['new' + vp]; for (const f of Object.keys(B)) { const s = JSON.stringify(A[f]) === JSON.stringify(B[f]); console.log(vp, f, s ? 'same' : 'DIFF', JSON.stringify(B[f]), s ? '' : ' base ' + JSON.stringify(A[f])); } }
