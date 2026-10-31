// VS5a T3: layout of the marks editor, takes sheet, quantize sheet (P1 P2 P3 L1 L2 XL), page height, no clipping; Claude-app (iframe)
import {launch, open5, sleep, clicks, toI16, OUT} from './n4-vs-l-reg-vs5a-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const x = clicks([0.5, 0.74, 1.03, 1.25, 1.52, 1.76, 2.0, 2.27], 3.0);
for (const [vn, [w, h]] of Object.entries(VPS)) {
  const H = await open5(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
  await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  await p.evaluate(r => SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}], take: r.id}), r);
  const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth, innerHeight, innerWidth]);
  await p.evaluate(r => SYNQUENZER.tkSheet({t: r.track, s: 0}), r); await sleep(300);
  await p.screenshot({path: OUT + '/lay-' + vn + '-takes.png'});
  const tb = await p.evaluate(() => { const b = document.querySelector('.tksheet button[data-a="wp"]'), q = b && b.closest('.pop'), rb = b && b.getBoundingClientRect(), rq = q && q.getBoundingClientRect();
    return b ? {w: rb.width, h: rb.height, inV: rb.bottom <= innerHeight + 0.5 && rb.top >= 0, clip: b.scrollWidth > b.clientWidth, pop: [rq.top, rq.bottom, q.scrollHeight > q.clientHeight + 1]} : null; });
  ok(tb && tb.h >= 44 && !tb.clip && (tb.inV || tb.pop[2]), vn + ' takes sheet button ' + JSON.stringify(tb));
  await p.evaluate(() => document.querySelector('.tksheet button[data-a="wp"]').click()); await sleep(400);
  await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16'}), r.id); await sleep(300);
  await p.screenshot({path: OUT + '/lay-' + vn + '-editor.png'});
  const L = await p.evaluate(() => {
    const sh = document.getElementById('wpSheet'), rs = sh.getBoundingClientRect(), bad = [], small = [];
    for (const b of sh.querySelectorAll('button,input')) { const r = b.getBoundingClientRect(); if (r.width === 0) continue; if (b.scrollWidth > b.clientWidth + 1 && b.tagName === 'BUTTON') bad.push(b.textContent); if (r.height < 28 || r.width < 28) small.push(b.textContent + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); if (r.right > rs.right + 0.5 || r.bottom > rs.bottom + 0.5 || r.left < rs.left - 0.5) bad.push('outside:' + (b.textContent || b.tagName)); }
    const cv = sh.querySelector('canvas').getBoundingClientRect(), info = sh.querySelector('.wpinfo');
    const hdr = sh.querySelector('.qh').getBoundingClientRect();
    return {sheet: [Math.round(rs.left), Math.round(rs.top), Math.round(rs.width), Math.round(rs.height)], inV: rs.bottom <= innerHeight + 0.5 && rs.top >= 0 && rs.right <= innerWidth + 0.5, cv: [Math.round(cv.width), Math.round(cv.height)], bad, small, info: info.textContent, hdr: Math.round(hdr.height),
      over: sh.scrollHeight > sh.clientHeight + 1};
  });
  ok(L.inV && !L.bad.length && !L.over && L.cv[1] >= 48, vn + ' editor ' + JSON.stringify(L));
  const H1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth, innerHeight, innerWidth]);
  ok(JSON.stringify(H0) === JSON.stringify(H1), vn + ' page size unchanged ' + JSON.stringify([H0, H1]));
  // quantize sheet of the linked MELODIE clip: „Audio folgt“ in the head
  await p.evaluate(() => SYNQUENZER.wpClose());
  const qs = await p.evaluate(() => { if (typeof openQuantSheet === 'function') openQuantSheet(5, 0); const b = document.querySelector('#qSheet .qfol'), t = document.querySelector('#qSheet .qh b'); if (!b) return null; const r = b.getBoundingClientRect(), rt = t.getBoundingClientRect(); return {txt: b.textContent, w: Math.round(r.width), h: Math.round(r.height), clip: b.scrollWidth > b.clientWidth, title: Math.round(rt.width), on: b.classList.contains('on')}; });
  await p.screenshot({path: OUT + '/lay-' + vn + '-qsheet.png'});
  ok(qs && !qs.clip && qs.on && qs.title >= 60, vn + ' quantize sheet: ' + JSON.stringify(qs));
  ok(!H.errs.length, vn + ' no console errors ' + JSON.stringify(H.errs));
  await H.ctx.close();
}
// Claude app (iframe, no mic): no editor entry, no „Audio folgt“, take data kept
{
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n4-vs-l-frame5.html'); await sleep(2500);
  const f = p.frames().find(fr => fr.url().includes('vs-br-VSL'));
  await f.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  const res = await f.evaluate(() => { const ok = SYNQUENZER.tkInfo().audioOk; const opened = SYNQUENZER.wpOpen({t: 6, s: 0}); return {ok, opened, ver: SYNQUENZER.version}; });
  ok(res.ok === false && res.opened === false, 'Claude app: audio off, editor does not open ' + JSON.stringify(res));
  await ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
