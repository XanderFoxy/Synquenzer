import {open, sleep, OUT, check, done} from './v3-qa-gmk3-tl.mjs';
for (const [tag, vp] of [['P1', {width: 390, height: 844}], ['P2mini', {width: 375, height: 812}], ['P2se', {width: 375, height: 667}], ['P3', {width: 320, height: 568}], ['L1max', {width: 926, height: 428}], ['L2', {width: 667, height: 375}]]) {
  const T = await open({viewport: vp}); const {p, E, errs} = T;
  await E(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); });
  await T.openEd(0);
  const pn0 = await T.panel(); if (pn0 && pn0.half === 'A') { await T.tapTxt('button, .tab', /^RECHTS$/); await sleep(300); }
  const w = await T.w('w1', /^1 STIMME/);
  const m = await E(() => { const R = e => { if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    const l = document.querySelector('.lcd'); const x = l && l.querySelector('.lx.lsplit'); const btns = [...document.querySelectorAll('button')].filter(b => /^(⋯|◎)$/.test(b.textContent.trim()) && b.getClientRects().length).map(b => [b.textContent.trim(), R(b)]);
    let vis = null; if (x) { const r = x.getBoundingClientRect(); const pts = [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2]]; vis = pts.map(([px, py]) => { const e = document.elementFromPoint(px, py); return e ? (e === x || x.contains(e) ? 'chip' : (e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 10)) : null; }); }
    return {lcd: R(l), lsw: l ? [l.scrollWidth, l.clientWidth] : null, chip: R(x), chipSW: x ? [x.scrollWidth, x.clientWidth] : null, btns, edgeHit: vis}; });
  console.log(tag.padEnd(7), JSON.stringify(w), JSON.stringify(m));
  if (m.lcd) await p.screenshot({path: OUT + 'lcd2-' + tag + '.png', clip: {x: 0, y: Math.max(0, m.lcd[1] - 50), width: vp.width, height: 110}});
  await T.br.close();
}
