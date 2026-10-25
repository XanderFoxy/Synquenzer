// #kbArea for VA tracks: base vs new, and new after visiting an AM track (wheels must go away and the keyboard come back identical)
import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const kb = p => p.evaluate(() => { const a = document.getElementById('kbArea'); const out = []; for (const e of a.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width < 1) continue; out.push((e.id || e.className || e.tagName) + ':' + [r.left, r.top, r.width, r.height].map(Math.round).join(',')); } const r = a.getBoundingClientRect(); return {area: [r.left, r.top, r.width, r.height].map(Math.round).join(','), n: out.length, h: out.join('|')}; });
for (const [w, h, tag] of [[390, 844, 'P1'], [844, 390, 'L1'], [320, 568, 'P3']]) {
  const res = {};
  { const {b, p} = await open({width: w, height: h}, BASE, true); await p.evaluate(() => window.SYNQUENZER.selectTrack(1)); await p.waitForTimeout(400); res.base = await kb(p); await b.close(); }
  { const {b, p, errs} = await open({width: w, height: h}, APP, true); await p.evaluate(() => window.SYNQUENZER.selectTrack(1)); await p.waitForTimeout(400); res.new = await kb(p);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); }); await p.waitForTimeout(800); res.am = await kb(p);
    await p.evaluate(() => window.SYNQUENZER.selectTrack(1)); await p.waitForTimeout(600); res.back = await kb(p);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(800); res.amEd = await kb(p);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setEngine(0, 'analog'); }); await p.waitForTimeout(800); res.vaEd = await kb(p);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor(); Q.selectTrack(1); }); await p.waitForTimeout(600); res.back2 = await kb(p);
    console.log(tag, 'errs', errs); await b.close(); }
  console.log(tag, 'base==new', res.base.h === res.new.h, 'area', res.base.area, res.new.area, '| AM', res.am.area, res.am.n, '| back==base', res.back.h === res.base.h, '| back2==base', res.back2.h === res.base.h);
  if (res.back.h !== res.base.h) { const A = res.base.h.split('|'), B = res.back.h.split('|'); console.log('  diff', A.filter(x => !B.includes(x)).slice(0, 5), B.filter(x => !A.includes(x)).slice(0, 5)); }
  if (res.back2.h !== res.base.h) { const A = res.base.h.split('|'), B = res.back2.h.split('|'); console.log('  diff2', A.filter(x => !B.includes(x)).slice(0, 5), B.filter(x => !A.includes(x)).slice(0, 5)); }
}
