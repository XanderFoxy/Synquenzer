// QA V2e′: desktop mouse — part key hold → sheet → ✕ → click a slot; part key click launches; mark hold in song; base vs new
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 53)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, null, -1, {s: 0}, -1]}); return 1; };
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
const st = p => p.evaluate(() => { const R = window.SYNQUENZER.runtime(), v = window.SYNQUENZER.viewState(); return {view: v && v.editor, pops: [...document.querySelectorAll('.pop')].map(x => x.className.split(' ').slice(0, 3).join('.')), sel: R.selected, playing: R.playing, part: R.part ? 1 : 0}; });
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, false);
  await p.evaluate(setup); await p.waitForTimeout(400);
  const r = {};
  let c = await ctr(p, '.pk[data-i="0"]');
  await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.waitForTimeout(600); await p.mouse.up(); await p.waitForTimeout(400);
  r.hold = await st(p);
  const x = await ctr(p, '.pop [data-a=x]'); if (x) { await p.mouse.click(x.x, x.y); await p.waitForTimeout(400); }
  r.closed = await st(p);
  let sl = await ctr(p, '.slot[data-t="1"][data-s="0"]'); await p.mouse.click(sl.x, sl.y); await p.waitForTimeout(300);
  r.slot = await st(p);
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
  c = await ctr(p, '.pk[data-i="0"]'); await p.mouse.click(c.x, c.y); await p.waitForTimeout(400);
  r.keyClick = await st(p);
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
  // mouse hold 1300 ms still → Selbstöffner (new) → release → back; base: sheet
  c = await ctr(p, '.pk[data-i="0"]'); await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.waitForTimeout(1300); r.longDuring = await st(p); await p.mouse.up(); await p.waitForTimeout(500);
  r.long = await st(p);
  const x2 = await ctr(p, '.pop [data-a=x]'); if (x2) { await p.mouse.click(x2.x, x2.y); await p.waitForTimeout(400); }
  sl = await ctr(p, '.slot[data-t="0"][data-s="1"]'); if (sl) { await p.mouse.click(sl.x, sl.y); await p.waitForTimeout(300); }
  r.after = await st(p);
  r.errs = errs.slice(); res[name + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) for (const k of Object.keys(res['new' + vp])) { const A = JSON.stringify(res['base' + vp][k]), B = JSON.stringify(res['new' + vp][k]); console.log(vp, k, A === B ? 'same ' + B : 'DIFF new ' + B + '\n      base ' + A); }
