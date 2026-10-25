// QA regression V2e′: after part-key holds / drags / cancels / second fingers, ordinary input still works (no stuck capture)
import { open, NEW } from './v3-qa-v2e2reg-pw.mjs';
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 53)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, null, -1, {s: 0}, -1]}); return 1; };
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
const T = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
const state = p => p.evaluate(() => { const Q = window.SYNQUENZER, v = Q.viewState(), sv = document.getElementById('songView'), I = Q.svLayoutInfo ? Q.svLayoutInfo() : null; return {view: (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'), drag: I && I.drag, pops: [...document.querySelectorAll('.pop')].map(x => x.className.split(' ').slice(0, 3).join('.')), ghosts: document.querySelectorAll('.drg-ghost').length, sel: Q.runtime().selected, playing: Q.runtime().playing}; });
const probeTap = async (p, label, out) => { // a plain tap on a different slot must select it
  const c = await ctr(p, '.slot[data-t="1"][data-s="0"]'); if (!c) { out[label] = 'no slot (view?)'; return; }
  await p.evaluate(() => window.SYNQUENZER.selectSlot(0, 1)); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  const s = await p.evaluate(() => window.SYNQUENZER.runtime().selected); out[label] = s.track === 1 && s.scene === 0 ? 'ok' : 'FAIL ' + JSON.stringify(s);
};
const res = {};
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, NEW, true);
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(setup); await p.waitForTimeout(400);
  const r = {};
  let c = await ctr(p, '.pk[data-i="0"]');
  // A: hold 1300 ms still → Selbstöffner (song opens) → release in Schutz → back
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(1300);
  r.A_during = await state(p);
  await T(cdp, 'touchEnd', []); await p.waitForTimeout(500);
  r.A_after = await state(p); await probeTap(p, 'A_tap', r);
  // B: hold 520 ms, second finger taps a slot (ignored), first finger releases still (before open) → Teil-Blatt
  c = await ctr(p, '.pk[data-i="0"]'); const s2 = await ctr(p, '.slot[data-t="0"][data-s="0"]');
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(520);
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}, {x: s2.x, y: s2.y, id: 2}]); await p.waitForTimeout(60);
  await T(cdp, 'touchEnd', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(60);
  await T(cdp, 'touchEnd', []); await p.waitForTimeout(400);
  r.B_after = await state(p);
  await p.evaluate(() => document.querySelectorAll('.pop [data-a=x]').forEach(x => x.click())); await p.waitForTimeout(300);
  await probeTap(p, 'B_tap', r);
  // C: hold 520 ms, drag 60 px, touchCancel → abort
  c = await ctr(p, '.pk[data-i="0"]');
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(520);
  for (let k = 1; k <= 4; k++) { await T(cdp, 'touchMove', [{x: c.x + k * 5, y: c.y - k * 15, id: 1}]); await p.waitForTimeout(30); }
  await T(cdp, 'touchCancel', []); await p.waitForTimeout(400);
  r.C_after = await state(p); await probeTap(p, 'C_tap', r);
  // D: hold, drag over SONG ⇄ (spring) → song open, drag 40 px into the canvas, release over the transport (Abbruch)
  c = await ctr(p, '.pk[data-i="0"]'); const cor = await ctr(p, '.corner');
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(520);
  const steps = 10; for (let k = 1; k <= steps; k++) { await T(cdp, 'touchMove', [{x: c.x + (cor.x - c.x) * k / steps, y: c.y + (cor.y - c.y) * k / steps, id: 1}]); await p.waitForTimeout(25); }
  await p.waitForTimeout(100); r.D_open = await state(p);
  const play = await p.evaluate(() => { const e = document.querySelector('#songView .sv-play'); const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  for (let k = 1; k <= 6; k++) { await T(cdp, 'touchMove', [{x: cor.x + (play.x - cor.x) * k / 6, y: cor.y + 30 + (play.y - cor.y - 30) * k / 6, id: 1}]); await p.waitForTimeout(25); }
  await T(cdp, 'touchEnd', []); await p.waitForTimeout(500);
  r.D_after = await state(p); r.D_song = await p.evaluate(() => window.SYNQUENZER.song());
  await probeTap(p, 'D_tap', r);
  // E: mouse: press on the part key 600 ms, release → Teil-Blatt; then a mouse click on a slot works
  c = await ctr(p, '.pk[data-i="0"]');
  await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.waitForTimeout(600); await p.mouse.up(); await p.waitForTimeout(400);
  r.E_after = await state(p);
  await p.evaluate(() => document.querySelectorAll('.pop [data-a=x]').forEach(x => x.click())); await p.waitForTimeout(300);
  const sl = await ctr(p, '.slot[data-t="1"][data-s="0"]'); await p.evaluate(() => window.SYNQUENZER.selectSlot(0, 1)); await p.mouse.click(sl.x, sl.y); await p.waitForTimeout(250);
  r.E_click = await p.evaluate(() => window.SYNQUENZER.runtime().selected);
  // F: piano key touch after all of this plays a note
  await p.evaluate(() => window.SYNQUENZER.clearLog());
  const key = await p.evaluate(() => { const k = document.querySelector('#kb, .kb, #keyboard, canvas.kbc'); if (!k) return null; const q = k.getBoundingClientRect(); return {x: q.left + q.width * .3, y: q.top + q.height * .85}; });
  if (key) { await p.touchscreen.tap(key.x, key.y); await p.waitForTimeout(300); r.F_note = await p.evaluate(() => window.SYNQUENZER.noteLog(50).length); }
  r.errs = errs.slice(); res[vp] = r; await b.close();
}
console.log(JSON.stringify(res, null, 1).slice(0, 6000));
