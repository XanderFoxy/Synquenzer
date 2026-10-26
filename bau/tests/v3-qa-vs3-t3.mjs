// T3: Takes sheet via touch: open via ✎, list touch-scroll, buttons, truncation, layout height; stale after undo
import {launch, open, sleep, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sine = (sr, sec, f) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * 9000); return x; };
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const which = process.argv[2] ? process.argv[2].split(',') : Object.keys(VPS);
const br = await launch(null);
for (const vn of which) {
  const [w, h] = VPS[vn];
  const H = await open(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); });
  const n = vn === 'P1' ? 8 : 5;
  let r; for (let k = 0; k < n; k++) r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 2, 300 + 50 * k));
  await sleep(400);
  const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight]);
  // select STIMME clip by tapping its cell, then ✎
  const cell = await p.evaluate(t => { const e = document.querySelector(`.cell[data-t="${t}"][data-s="0"]`) || document.querySelector(`[data-t="${t}"][data-s="0"]`); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const b = e.getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2, cls: e.className}; }, r.track);
  console.log(vn, 'cell', JSON.stringify(cell));
  await p.evaluate(t => SYNQUENZER.selectSlot ? SYNQUENZER.selectSlot(t, 0) : 0, r.track).catch(() => {});
  await sleep(200);
  const sub = await p.evaluate(() => { const e = document.getElementById('stSub'); return {t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, vis: e.offsetParent !== null}; });
  console.log('  stSub', JSON.stringify(sub));
  if (sub.vis) ok(sub.sw <= sub.cw + 1, vn + ' strip label not truncated: ' + JSON.stringify(sub));
  const be = await p.evaluate(() => { const b = document.getElementById('bEdit').getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height}; });
  await p.touchscreen.tap(be.x, be.y); await sleep(500);
  const sh = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); if (!e) return null; const l = e.querySelector('.tklist'), rb = e.getBoundingClientRect(); return {rows: e.querySelectorAll('.tkrow').length, lh: l.clientHeight, ls: l.scrollHeight, top: l.scrollTop, box: [rb.x, rb.y, rb.width, rb.height].map(Math.round), btn: [...e.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const q = b.getBoundingClientRect(); return [b.textContent.trim().slice(0, 12), Math.round(q.width), Math.round(q.height), q.bottom <= innerHeight + 0.5 && q.top >= 0, b.scrollWidth <= b.clientWidth + 1]; })}; });
  ok(!!sh, vn + ' Takes sheet opened via ✎ tap');
  if (!sh) { await p.close(); continue; }
  console.log('  sheet', JSON.stringify({rows: sh.rows, lh: sh.lh, ls: sh.ls, box: sh.box}));
  const H1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight]);
  ok(deq(H0, H1), vn + ' page height unchanged by sheet ' + JSON.stringify([H0, H1]));
  const small = sh.btn.filter(b => b[1] < 44 || b[2] < 44); ok(!small.length, vn + ' buttons ≥ 44: ' + JSON.stringify(small));
  const trunc = sh.btn.filter(b => !b[4]); ok(!trunc.length, vn + ' no truncated button text: ' + JSON.stringify(trunc));
  // touch-scroll the list if it overflows
  if (sh.ls > sh.lh + 4) {
    const lb = await p.evaluate(() => { const b = document.querySelector('.pop.tksheet .tklist').getBoundingClientRect(); return {x: b.x + b.width * 0.4, y0: b.y + b.height * 0.8, y1: b.y + b.height * 0.15}; });
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: lb.x, y: lb.y0}]});
    for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: lb.x, y: lb.y0 + (lb.y1 - lb.y0) * k / 10}]}); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(500);
    const st = await p.evaluate(() => document.querySelector('.pop.tksheet .tklist').scrollTop);
    const still = await p.evaluate(() => !!document.querySelector('.pop.tksheet'));
    ok(st > 20, `${vn} takes list (${sh.rows} rows, ${sh.lh}/${sh.ls}px) scrolls by finger: scrollTop ${st}; sheet still open ${still}`);
    // last row reachable?
  } else console.log('  list fits, no scroll needed');
  // stale sheet after undo (removes last take)
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
  const after = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); return e ? e.querySelectorAll('.tkrow').length : -1; });
  ok(after === -1 || after === sh.rows - 1, `${vn} sheet follows undo (rows ${sh.rows} → ${after})`);
  ok(!H.errs.length, vn + ' no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
  await p.screenshot({path: DIR + '/t3-' + vn + '.png'});
  await p.close();
}
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
