// QA V2e′: part sheet after a hold, closing it, the next tap; second finger during a lifted part key — base vs new
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 53)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, null, -1, {s: 0}, -1]}); return 1; };
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
const T = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
const st = p => p.evaluate(() => { const R = window.SYNQUENZER.runtime(); return {pops: [...document.querySelectorAll('.pop')].map(x => x.className.split(' ').slice(0, 3).join('.')), sel: R.selected, playing: R.playing, slots: R.slots, queued: R.queued.map(q => q ? q.slot : null)}; });
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(setup); await p.waitForTimeout(400);
  const r = {};
  let c = await ctr(p, '.pk[data-i="0"]');
  // 1) hold 600, release → sheet; ✕ via touch tap; next tap on a slot
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(600); await T(cdp, 'touchEnd', []); await p.waitForTimeout(400);
  r.s1 = await st(p);
  const x = await ctr(p, '.pop [data-a=x]'); r.xBtn = !!x;
  if (x) { await p.touchscreen.tap(x.x, x.y); await p.waitForTimeout(400); }
  r.s2 = await st(p);
  let sl = await ctr(p, '.slot[data-t="1"][data-s="0"]'); await p.touchscreen.tap(sl.x, sl.y); await p.waitForTimeout(300);
  r.s3 = await st(p);
  await p.evaluate(() => { window.SYNQUENZER.stop(); window.SYNQUENZER.selectSlot(3, 0); }); await p.waitForTimeout(300);
  // 2) hold 520 (lifted), a second finger taps slot (0,0), release first finger still
  c = await ctr(p, '.pk[data-i="0"]'); sl = await ctr(p, '.slot[data-t="0"][data-s="0"]');
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(520);
  await T(cdp, 'touchStart', [{x: c.x, y: c.y, id: 1}, {x: sl.x, y: sl.y, id: 2}]); await p.waitForTimeout(60);
  await T(cdp, 'touchEnd', [{x: c.x, y: c.y, id: 1}]); await p.waitForTimeout(150);
  r.s4 = await st(p);
  await T(cdp, 'touchEnd', []); await p.waitForTimeout(400);
  r.s5 = await st(p);
  r.errs = errs.slice(); res[name] = r; await b.close();
}
for (const k of Object.keys(res.new)) console.log(k, 'base', JSON.stringify(res.base[k]), '\n   new ', JSON.stringify(res.new[k]));
