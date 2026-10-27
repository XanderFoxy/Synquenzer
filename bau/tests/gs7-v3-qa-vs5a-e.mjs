// QA VS5a E: layout of the marks editor + quantize sheet in 7 sizes (cut-off, hit areas L4, page jump), real touch gestures (CDP), overlay closing paths
import {launch, open5, sleep, clicks, toI16, deq, QOUT} from './gs7-v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SIZES = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428], ['W', 844, 1180]];
const br = await launch(null);
const OFF = [12, -18, 30, -8, 45, -40, 20, 0, 22, -26, 15, -5];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = toI16(clicks(T, 3.6));
for (const [nm, w, h] of SIZES) {
  const H = await open5(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), x);
  await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  await p.evaluate(id => SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}], take: id}), r.id);
  const page0 = await p.evaluate(() => ({sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth}));
  await p.evaluate(st => { SYNQUENZER.selectSlot(st, 0); return SYNQUENZER.tkSheet({t: st, s: 0}); }, r.track); await sleep(300);
  const tb = await p.evaluate(() => { const b = document.querySelector('.tksheet button[data-a="wp"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {w: q.width, h: q.height, cut: b.scrollWidth > b.clientWidth}; });
  await (await p.$('.tksheet button[data-a="wp"]')).tap(); await sleep(500);
  await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16'}), r.id); await sleep(300);
  const L = await p.evaluate(([W, Hh]) => {
    const sh = document.getElementById('wpSheet'), R = sh.getBoundingClientRect(), out = [], small = [], cut = [];
    for (const e of sh.querySelectorAll('button, input')) {
      const q = e.getBoundingClientRect(); if (!q.width) continue;
      const lab = (e.textContent || e.getAttribute('aria-label') || e.type).trim().slice(0, 12);
      if (q.left < -0.5 || q.right > W + 0.5 || q.top < -0.5 || q.bottom > Hh + 0.5) out.push(lab);
      if (e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 0.5) cut.push(lab + ' ' + e.scrollWidth + '>' + e.clientWidth);
      small.push({lab, w: Math.round(q.width), h: Math.round(q.height), dis: e.disabled});
    }
    for (const e of sh.querySelectorAll('.lbl, .mval, .qh b, .wpinfo')) if (e.scrollWidth > e.clientWidth + 0.5) cut.push((e.textContent || '').slice(0, 20) + ' ' + e.scrollWidth + '>' + e.clientWidth);
    const cv = sh.querySelector('canvas').getBoundingClientRect();
    return {sheet: [Math.round(R.left), Math.round(R.top), Math.round(R.width), Math.round(R.height)], canvasH: Math.round(cv.height), out, cut, small, page: {sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth}};
  }, [w, h]);
  const port = h > w, minW = port ? 44 : 40, minH = port ? 44 : 36;
  const chips = L.small.filter(s => /^(Aus|Auto|1\/)/.test(s.lab)), others = L.small.filter(s => !/^(Aus|Auto|1\/)/.test(s.lab) && !/range/.test(s.lab) && s.lab !== 'Stärke' && s.lab !== 'Swing');
  const smallChips = chips.filter(s => s.w < 36 || s.h < 34), smallOther = others.filter(s => (s.w < minW || s.h < minH));
  await p.screenshot({path: QOUT + `/e-${nm}-editor.png`});
  console.log(nm, 'sheet', L.sheet, 'canvas h', L.canvasH, 'takes-btn', JSON.stringify(tb), 'chips', chips.map(s => s.w + '×' + s.h).join(' '), '| other', others.map(s => s.lab + ' ' + s.w + '×' + s.h).join(', '));
  ok(!L.out.length && !L.cut.length, nm + ' editor: nothing outside the screen, nothing cut off ' + JSON.stringify({out: L.out, cut: L.cut}));
  ok(L.page.sh === page0.sh && L.page.sw === page0.sw, nm + ' page size unchanged with the editor open ' + JSON.stringify([page0, L.page]));
  ok(!smallChips.length, nm + ' L4 grid chips ≥ 36×34: ' + (smallChips.length ? smallChips.map(s => s.lab + ' ' + s.w + '×' + s.h).join(', ') : 'ok'));
  ok(!smallOther.length, nm + ` L4 buttons ≥ ${minW}×${minH}: ` + (smallOther.length ? smallOther.map(s => s.lab + ' ' + s.w + '×' + s.h).join(', ') : 'ok'));
  // quantize sheet with [Audio folgt]
  await p.evaluate(() => SYNQUENZER.wpClose());
  await p.evaluate(() => SYNQUENZER.openQuant(5, 0)); await sleep(300);
  const Q = await p.evaluate(([W, Hh]) => { const b = document.querySelector('#qSheet .qfol'); if (!b) return null; const q = b.getBoundingClientRect(), hd = document.querySelector('#qSheet .qh b'); return {w: Math.round(q.width), h: Math.round(q.height), cut: b.scrollWidth > b.clientWidth, inside: q.left >= 0 && q.right <= W && q.top >= 0 && q.bottom <= Hh, title: hd ? hd.scrollWidth + '>' + hd.clientWidth : null}; }, [w, h]);
  await p.screenshot({path: QOUT + `/e-${nm}-qsheet.png`});
  ok(Q && !Q.cut && Q.inside, nm + ' [Audio folgt] visible, not cut ' + JSON.stringify(Q));
  ok(Q && Q.w >= minW && Q.h >= minH, nm + ` [Audio folgt] hit area ≥ ${minW}×${minH}: ` + (Q && Q.w + '×' + Q.h));
  await p.evaluate(() => SYNQUENZER.closeQuant(false));
  if (nm === 'P1') {
    // real touch gestures via CDP on the canvas
    await p.evaluate(() => SYNQUENZER.wpOpen()); await sleep(400);
    const cdp = await p.context().newCDPSession(p);
    const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map(([xx, yy]) => ({x: xx, y: yy, id: 1}))});
    let G = await p.evaluate(() => SYNQUENZER.wpGeom()); const yy = G.y + G.h * 0.55;
    const vis = G.marks.filter(mx => mx > G.x + 30 && mx < G.x + G.w - 80);
    const snap = () => p.evaluate(() => JSON.stringify(SYNQUENZER.project())), U = () => p.evaluate(() => SYNQUENZER.undoInfo().n);
    const P0 = await snap(), u0 = await U();
    await touch('touchStart', [[vis[1], yy]]); await sleep(1000); await touch('touchEnd', []); await sleep(300);
    const pop1 = await p.evaluate(() => !!document.querySelector('.pop'));
    ok(await snap() === P0 && await U() === u0 && !pop1, 'touch: hold 1 s on a mark → no data change, no sheet/pop');
    const m0 = (await p.evaluate(id => SYNQUENZER.wpInfo(id).marks, r.id));
    await touch('touchStart', [[vis[1], yy]]); await sleep(600);
    for (let d = 4; d <= 40; d += 4) { await touch('touchMove', [[vis[1] + d, yy]]); await sleep(16); }
    await touch('touchEnd', []); await sleep(300);
    const m1 = await p.evaluate(id => SYNQUENZER.wpInfo(id).marks, r.id), mv = m1.filter((k, i) => Math.abs(k.t - m0[i].t) > 1e-6);
    ok(await U() === u0 + 1 && m1.length === m0.length && mv.length === 1, 'touch: hold 600 ms + drag 40 px → one mark moved, one undo (' + mv.length + ' moved)');
    // tap on a mark → sheet; tap elsewhere on the canvas closes it (does it also add a mark?)
    G = await p.evaluate(() => SYNQUENZER.wpGeom());
    const mk = G.marks.find(mx => mx > G.x + 30 && mx < G.x + G.w - 80);
    await touch('touchStart', [[mk, yy]]); await sleep(60); await touch('touchEnd', []); await sleep(350);
    const pop2 = await p.evaluate(() => { const q = document.querySelector('.pop.wpsel'); return q ? [...q.querySelectorAll('button')].map(b => b.textContent.trim() + ' ' + Math.round(b.getBoundingClientRect().width) + '×' + Math.round(b.getBoundingClientRect().height)) : null; });
    ok(pop2 && pop2.length === 2, 'touch: tap on a mark → [✕ Löschen] [Abbrechen] ' + JSON.stringify(pop2));
    const n2 = (await p.evaluate(id => SYNQUENZER.wpInfo(id).marks, r.id)).length, u2 = await U();
    let ex = null; for (let xx = G.x + 30; xx < G.x + G.w - 30; xx += 4) if (G.marks.every(m => Math.abs(m - xx) > 24)) { ex = xx; break; }
    await touch('touchStart', [[ex, yy]]); await sleep(60); await touch('touchEnd', []); await sleep(350);
    const st3 = await p.evaluate(id => ({pop: !!document.querySelector('.pop.wpsel'), n: SYNQUENZER.wpInfo(id).marks.length, sel: SYNQUENZER.wpInfo(id).editor && SYNQUENZER.wpInfo(id).editor.sel}), r.id);
    console.log('tap on empty canvas while the mark sheet is open →', JSON.stringify(st3), 'undo', (await U()) - u2);
    ok(!st3.pop, 'the mark sheet closes with a tap elsewhere (armed state ends with any other tap)');
    // overlay closing paths: editor open → tap the mode bar (SPIELEN/TRANSP.) / ≡ menu / song view
    await p.evaluate(() => SYNQUENZER.wpOpen()); await sleep(300);
    const before = await p.evaluate(() => !!SYNQUENZER.wpInfo().editor);
    await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
    const afterUndo = await p.evaluate(() => !!SYNQUENZER.wpInfo().editor);
    console.log('editor open', before, '→ after 2× undo (marks edits) still open', afterUndo);
    const corner = await p.$('.corner');
    if (corner) { await corner.tap(); await sleep(400); }
    const sv = await p.evaluate(() => ({ed: !!SYNQUENZER.wpInfo().editor, open: document.getElementById('wpSheet').classList.contains('open'), song: SYNQUENZER.runtime().song.view}));
    ok(!sv.song || !sv.open, 'song view opened → the marks editor is closed ' + JSON.stringify(sv));
  }
  ok(!H.errs.length, nm + ' no console errors ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
