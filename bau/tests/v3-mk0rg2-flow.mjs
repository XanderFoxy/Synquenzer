// QA regression MK0: core flows through the real UI (touch, CDP multi-touch for chords): scenes, stop single clips,
// transpose (single notes + chords on the on-screen keyboard), ● record, FANG, drums, undo; console errors.
// usage: node v3-mk0rg2-flow.mjs base|new P1|L1
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which, vp] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, vp, true);
const cdp = await p.context().newCDPSession(p);
const r = {};
const waitBeat = (b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 10});
const center = async sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; }, sel);
const tapSel = async sel => { const c = await center(sel); if (!c) throw new Error('no ' + sel); await p.touchscreen.tap(c.x, c.y); };
const touch = async (pts, hold) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: pts.map((q, i) => ({x: q.x, y: q.y, id: i + 1}))}); await p.waitForTimeout(hold); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
// key map (white keys) by scanning while stopped
const kb = await p.evaluate(() => { const q = document.getElementById('kb').getBoundingClientRect(); return {x: q.x, y: q.y, w: q.width, h: q.height}; });
const seen = {};
for (let x = kb.x + 3; x < kb.x + kb.w - 2; x += 6) {
  await p.evaluate(() => window.SYNQUENZER.clearLog()); await touch([{x, y: kb.y + kb.h - 12}], 25); await p.waitForTimeout(15);
  const L = await p.evaluate(() => window.SYNQUENZER.noteLog(3)); const n = L.length ? L[L.length - 1].out : null;
  if (n != null) (seen[n] = seen[n] || []).push(x);
}
const K = {}; for (const n in seen) K[n] = {x: (Math.min(...seen[n]) + Math.max(...seen[n])) / 2, y: kb.y + kb.h - 12};
r.keys = Object.keys(K).map(Number).sort((a, b) => a - b);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(180); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]}); Q.clearLog(); });
await p.waitForTimeout(400);
const slots = () => p.evaluate(() => window.SYNQUENZER.runtime().slots);
// 1) ▶1 scene button
await p.evaluate(() => { const b = [...document.querySelectorAll('.scn')].filter(x => x.offsetParent); b.forEach((x, i) => x.setAttribute('data-qa', 'scn' + i)); });
await tapSel('[data-qa=scn0]'); await waitBeat(2.2); r.s_scene1 = await slots();
// 2) tap running clip t0 s0 = stop at bar end
await tapSel('.slot[data-t="0"][data-s="0"]'); await p.waitForTimeout(80); r.stopQ = await p.evaluate(() => window.SYNQUENZER.runtime().stopQ);
await waitBeat(4.3); r.s_afterStop = await slots();
// 3) launch single clip t1 s1
await tapSel('.slot[data-t="1"][data-s="1"]'); await p.waitForTimeout(80); r.q = await p.evaluate(() => window.SYNQUENZER.runtime().queued);
await waitBeat(8.3); r.s_single = await slots();
// 4) ■ drum track twice = now
await tapSel('.stp[data-t="4"]'); await p.waitForTimeout(60); await tapSel('.stp[data-t="4"]'); await p.waitForTimeout(80); r.s_stopNow = await slots();
// 5) ▶2 scene
await tapSel('[data-qa=scn1]'); const b5 = await p.evaluate(() => Math.ceil(window.SYNQUENZER.runtime().beat / 4) * 4); await waitBeat(b5 + .3); r.s_scene2 = await slots();
// drums played in scene 1 / 2
r.drumNotes = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 4 && n.beat != null).length);
// 6) TRANSPONIEREN: scene 1 again, single note + chords on the keyboard (latch), ORIGINAL
await tapSel('[data-qa=scn0]'); let b6 = await p.evaluate(() => Math.ceil(window.SYNQUENZER.runtime().beat / 4) * 4 + 4); await waitBeat(b6 - 3.9);
await tapSel('#segTr'); await p.waitForTimeout(150); r.kbMode = await p.evaluate(() => window.SYNQUENZER.runtime().kbMode);
const car = async () => p.evaluate(() => { const c = window.SYNQUENZER.runtime().carrier; return c && c.name; });
const seq = [[62], [65, 69, 72], [67, 71, 74], [64]]; r.car = [];
for (const ch of seq) { await waitBeat(b6 - .9); await touch(ch.map(n => K[n]), 250); await waitBeat(b6 + 1.2); r.car.push(await car()); b6 += 4; }
r.trLog = await p.evaluate(x => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= x && n.track < 2 && n.src !== 'live').map(n => n.track + '@' + (Math.round((n.beat - x) * 4) / 4) + ':' + n.out), b6 - 16);
await tapSel('#bOrig'); await p.waitForTimeout(150); r.carAfterOrig = await car();
await tapSel('#segPlay'); await p.waitForTimeout(100);
// 7) ● record into track 2 scene 0 (count-in 1), notes on the keyboard
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); Q.selectSlot(2, 0); });
await tapSel('#bRec');
await p.waitForFunction(() => /rec/.test(window.SYNQUENZER.runtime().rec.state), null, {timeout: 15000, polling: 10}).catch(() => {});
r.recState = await p.evaluate(() => window.SYNQUENZER.runtime().rec.state);
const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
const ns = [60, 62, 64, 65, 67, 65, 64, 62], at = ns.map((_, k) => Math.ceil(sb) + 1 + k);
for (let k = 0; k < ns.length; k++) { await waitBeat(at[k] - .05); await touch([K[ns[k]]], 120); }
await waitBeat(at[7] + .5); await tapSel('#bRec'); await waitBeat(at[7] + 6);
r.rec = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(2, 0); const R = window.SYNQUENZER.runtime(); return {clip: c && {len: c.len, n: c.notes.map(x => x.n)}, state: R.rec.state, slot2: R.slots[2]}; });
// 8) FANG into track 3 scene 0 (button), then undo
await p.evaluate(() => window.SYNQUENZER.selectSlot(3, 0));
const fb = await p.evaluate(() => Math.ceil(window.SYNQUENZER.runtime().beat) + 1); const fn = [72, 74, 76, 71];
for (let k = 0; k < fn.length; k++) { await waitBeat(fb + k - .05); await touch([K[fn[k]]], 120); }
await waitBeat(fb + 4.3);
const fid = await p.evaluate(() => ['#bFang', '#bFangT'].find(s => { const e = document.querySelector(s); return e && e.offsetParent; }));
r.fangBtn = fid; await tapSel(fid); await p.waitForTimeout(250);
r.fang = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(3, 0); return c && {len: c.len, n: c.notes.map(x => x.n)}; });
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(150); r.fangUndo = await p.evaluate(() => !!window.SYNQUENZER.getClip(3, 0));
await p.evaluate(() => window.SYNQUENZER.redo()); await p.waitForTimeout(150); r.fangRedo = await p.evaluate(() => !!window.SYNQUENZER.getClip(3, 0));
// 9) ■ all, transport stop
await tapSel('#bPlay'); await p.waitForTimeout(300); r.playingAfter = await p.evaluate(() => window.SYNQUENZER.runtime().playing);
r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors()); r.errs = errs.slice();
fs.writeFileSync(OUT + `flow-${which}-${vp}.json`, JSON.stringify(r, null, 1));
console.log(which, vp, 'done', errs.length, 'errors');
await close();
