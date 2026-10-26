// QA regression MK6: no console errors / layout intact through rotation, engine switches, track switches, undo/redo,
// project loads while the new SEQ / SCHRITTE / ● AUFN. states are active (new 4.14.0 only)
import { open } from './v3-qa-mk6reg-pw.mjs';
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk6reg/';
const OLD = fs.readFileSync(OUT + 'old-4120-mk.json', 'utf8');
const {b, p, errs} = await open({width: 390, height: 844});
const sl = ms => p.waitForTimeout(ms);
const lay = async tag => { const m = await p.evaluate(() => { const vw = innerWidth, vh = innerHeight, bad = [];
    for (const e of document.querySelectorAll('button, .mkx, canvas')) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility !== 'visible') continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      let q = e, hid = false; while (q) { const c = getComputedStyle(q); if (c.display === 'none' || +c.opacity === 0) { hid = true; break; } q = q.parentElement; } if (hid) continue;
      if (e.closest('.pop, .menu, #menu, .sheet, .plist')) continue;
      if (r.right > vw + 1 || r.left < -1 || r.bottom > vh + 1 || r.top < -1) bad.push((e.className && e.className.baseVal == null ? e.className : e.tagName) + '|' + (e.textContent || '').trim().slice(0, 12) + ' ' + [r.left, r.top, r.width, r.height].map(Math.round).join(',')); }
    let pi = null; try { pi = window.MKUI && window.MKUI.panelInfo ? window.MKUI.panelInfo() : null; } catch (e) { pi = {fmt: 'panelInfo threw: ' + e.message}; }
    return {doc: document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight, vp: vw + 'x' + vh, bad: bad.slice(0, 8), fmt: pi && pi.fmt, view: pi && pi.view, steps: pi && pi.steps ? [pi.steps.cv && pi.steps.cv.w, pi.steps.cv && pi.steps.cv.h] : null}; });
  await p.screenshot({path: OUT + 'stress-' + tag + '.png'}); console.log(tag, JSON.stringify(m)); };
await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.launchScene(0); Q.selectTrack(0); Q.openEditor(); });
await sl(1500);
await p.evaluate(() => { const M = window.MKUI, Q = window.SYNQUENZER; Q.mkSet(0, 't.0.seq.on', 1); Q.mkSet(0, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) Q.mkSet(0, 't.0.seq.q.0.v.' + s, (s % 4) * 15 - 20); M.setWahl(2, 10); M.viewOpen('schritte'); });
await sl(600); await lay('P1-steps');
await p.setViewportSize({width: 844, height: 390}); await sl(900); await lay('L1-steps');
await p.setViewportSize({width: 667, height: 375}); await sl(900); await lay('L2-steps');
await p.setViewportSize({width: 320, height: 568}); await sl(900); await lay('P3-steps');
await p.setViewportSize({width: 390, height: 844}); await sl(900); await lay('P1-steps-back');
// engine switch away and back while SCHRITTE is open
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'analog'); }); await sl(600); await lay('P1-va');
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await sl(1200); await lay('P1-mk-again');
// arm recording, then switch track, then come back and arm + close editor
await p.evaluate(() => { const M = window.MKUI; M.setWahl(2, 10); M.viewOpen('schritte'); M.recArm(1); }); await sl(300);
const armed = await p.evaluate(() => JSON.stringify(window.MKUI.panelInfo().rec));
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.openEditor(); }); await sl(1000);
const afterSwitch = await p.evaluate(() => JSON.stringify(window.MKUI.panelInfo().rec || null));
await p.evaluate(() => { const Q = window.SYNQUENZER, M = window.MKUI; Q.selectTrack(0); Q.openEditor(); }); await sl(1000);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); }); await sl(400);
await p.evaluate(() => { window.MKUI.recArm(0); window.SYNQUENZER.tap(57, 4000); }); await sl(200);
// a real knob drag during ● AUFN. (SPIEL CUTOFF), wait for it to finish (LÄNGE 16 @ 1/16, 120 BPM = 2 s)
const kn = await p.evaluate(() => window.MKUI.knobs().findIndex(d => d && d.p === 't.0.f.cut'));
if (kn >= 0) { const bb = await p.locator('.mkk[data-k="k' + kn + '"]').boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  await p.mouse.move(x, y); await p.mouse.down(); for (let k = 0; k < 40; k++) { await p.mouse.move(x, y + Math.sin(k / 6) * 40); await sl(60); } await p.mouse.up(); }
await sl(2500);
const recRes = await p.evaluate(() => { const m = window.SYNQUENZER.mkGet(0); return {rec: window.MKUI.panelInfo().rec || null, k: m.t[0].seq.q[0].k, on: m.t[0].seq.on, cut: m.t[0].f.cut, v: m.t[0].seq.q[0].v.join(',')}; });
console.log('armed', armed, 'afterSwitch', afterSwitch, 'kn', kn, 'rec', JSON.stringify(recRes));
await p.evaluate(() => { const Q = window.SYNQUENZER; for (let k = 0; k < 12; k++) Q.undo(); for (let k = 0; k < 12; k++) Q.redo && Q.redo(); Q.closeEditor && Q.closeEditor(); }); await sl(500); await lay('P1-closed');
// project changes with the editor on SEQ
await p.evaluate(async t => { const Q = window.SYNQUENZER, M = window.MKUI; Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 800)); M.setWahl(2, 10); M.viewOpen('schritte'); Q.importJSON(t); await new Promise(r => setTimeout(r, 800)); await Q.loadDemo(); await new Promise(r => setTimeout(r, 800)); Q.newProject({init: true}); }, OLD); await sl(800); await lay('P1-after-loads');
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.launchScene(0); }); await sl(1500);
console.log('te', await p.evaluate(() => window.SYNQUENZER.tickErrors()));
console.log('errs', JSON.stringify(errs));
await b.close();
