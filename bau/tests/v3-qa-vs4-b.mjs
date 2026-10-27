// QA VS4 B: Takes sheet UI in P1 P2 P3 L1 L2 XL with touch: fit, labels, hit areas, finger drag on SÄUBERN, one undo,
// A/B resets on every close path, layout jump, race set/undo while cleaning, reload deep-equal
import {launch, open, sleep, deq, DIR} from './v3-qa-vs4-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428]];
const only = process.argv[2];
const br = await launch(null);
// voice-like test take: 3 tones with pauses + small noise, 48 kHz, 4.2 s
const mk = () => { const sr = 48000, n = Math.round(sr * 4.2), a = new Array(n); let s = 3; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; const t = i / sr, k = Math.floor(t / 0.7), on = (t % 0.7) < 0.5; const f = [220, 262, 330][k % 3]; a[i] = Math.round(((on ? 0.3 * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) : 0) + (s / 2147483647 - 0.5) * 0.004) * 32767); } return a; };
const PCM = mk();
for (const [nm, w, h] of VP) {
  if (only && only !== nm) continue;
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const H = await open(br, {ctx}), p = H.p, cdp = await ctx.newCDPSession(p);
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), PCM); const id = r.id;
  await p.evaluate(id => SYNQUENZER.clSet(id, 60), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
  const H0 = await p.evaluate(() => ({sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, bh: document.body.getBoundingClientRect().height}));
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.evaluate(([t, s]) => SYNQUENZER.tkSheet({t, s}), [r.track, 0]); await sleep(400);
  const L = await p.evaluate(() => {
    const P = document.querySelector('.pop.tksheet'), b = P && P.querySelector('.clbox'); if (!b) return null;
    const R = e => { const q = e.getBoundingClientRect(); return {x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), b: Math.round(q.bottom), r: Math.round(q.right)}; };
    const cut = [...P.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() && getComputedStyle(e).display !== 'none' && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className + ':' + e.textContent.trim().slice(0, 30));
    const cutClip = [...b.querySelectorAll('span,b,button,div.small')].filter(e => { const q = e.getBoundingClientRect(), pq = P.getBoundingClientRect(); return q.right > pq.right + 1 || q.left < pq.left - 1; }).map(e => e.className);
    const btns = [...P.querySelectorAll('button, input')].filter(e => e.offsetParent).map(e => ({c: (e.className || e.type) + '/' + (e.dataset.cl || e.textContent.trim().slice(0, 8)), ...R(e)}));
    return {pop: R(P), sh: P.scrollHeight, ch: P.clientHeight, ta: getComputedStyle(P).touchAction, rng: R(b.querySelector('.clr')), rngTA: getComputedStyle(b.querySelector('.clr')).touchAction, small: btns.filter(x => x.w < 44 || x.h < 44), cut, cutClip, st: b.querySelector('.clst').textContent, lab: b.querySelector('.clv').textContent, vw: innerWidth, vh: innerHeight};
  });
  ok(L && L.pop.x >= 0 && L.pop.y >= 0 && L.pop.r <= w && L.pop.b <= h, `${nm}: Takes sheet inside the screen ${JSON.stringify(L && L.pop)} (${w}x${h})`);
  ok(L && (L.sh <= L.ch + 1 || /pan-y/.test(L.ta)), `${nm}: sheet content fits or scrolls by finger (sh ${L && L.sh} ch ${L && L.ch} ta ${L && L.ta})`);
  ok(L && !L.small.length, `${nm}: all buttons/sliders >= 44x44: ${JSON.stringify(L && L.small)}`);
  ok(L && !L.cut.length && !L.cutClip.length, `${nm}: no clipped labels ${JSON.stringify(L && [L.cut, L.cutClip])}`);
  const H1 = await p.evaluate(() => ({sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, bh: document.body.getBoundingClientRect().height}));
  ok(deq(H0, H1), `${nm}: no layout jump when the sheet opens ${JSON.stringify([H0, H1])}`);
  // finger drag on the slider from 60 % to the right end (CDP touch)
  const R0 = L.rng, y0 = R0.y + R0.h / 2, x0 = R0.x + 8 + (R0.w - 16) * 0.6, x1 = R0.x + R0.w - 2;
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]});
  for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * k / 8, y: y0}]}); await sleep(30); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(400);
  const d = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, u: SYNQUENZER.undoInfo(), v: document.querySelector('.pop.tksheet .clr') && document.querySelector('.pop.tksheet .clr').value, lab: (document.querySelector('.pop.tksheet .clv') || {}).textContent, open: !!document.querySelector('.pop.tksheet')}), id);
  ok(d.cl === 100 && d.u.n === u0 + 1 && /Säubern 100/.test(d.u.top.label) && d.open, `${nm}: finger drag → 100 %, exactly one undo "${d.u.top && d.u.top.label}" (n ${u0}→${d.u.n}), sheet stays open, label ${d.lab}`);
  await p.evaluate(id => SYNQUENZER.clWait(id), id);
  // tap Roh (touch), then close by tapping outside the sheet → A/B back to Sauber
  const rb = await p.locator('.pop.tksheet button[data-cl="roh"]').boundingBox();
  await p.touchscreen.tap(rb.x + rb.width / 2, rb.y + rb.height / 2); await sleep(300);
  const ab1 = await p.evaluate(id => SYNQUENZER.clInfo(id).ab, id);
  ok(ab1 === 'roh', `${nm}: tap "Roh" → A/B roh (${ab1})`);
  const pp = await p.locator('.pop.tksheet').boundingBox();
  const ox = pp.x > 30 ? 10 : Math.min(w - 10, pp.x + pp.width + 10), oy = pp.y > 60 ? pp.y - 20 : Math.min(h - 10, pp.y + pp.height + 15);
  await p.touchscreen.tap(ox, oy); await sleep(400);
  const ab2 = await p.evaluate(id => ({ab: SYNQUENZER.clInfo(id).ab, open: !!document.querySelector('.pop.tksheet')}), id);
  ok(!ab2.open && ab2.ab === 'sauber', `${nm}: tap outside closes the sheet and A/B is "Sauber" again ${JSON.stringify(ab2)} (tap ${ox},${oy})`);
  await p.screenshot({path: DIR + `/b-${nm}.png`});
  if (nm === 'P1') {
    // other close paths: Roh, then switch to song view / launch scene / undo while open
    for (const [lab, fn] of [['song view', () => SYNQUENZER.songView(true)], ['launch scene 2', () => SYNQUENZER.launchScene(1)], ['play+stop', () => { SYNQUENZER.play(); SYNQUENZER.stop(); }]]) {
      await p.evaluate(([t, s]) => SYNQUENZER.tkSheet({t, s}), [r.track, 0]); await sleep(300);
      await p.evaluate(() => SYNQUENZER.clAB('roh'));
      await p.evaluate(fn); await sleep(500);
      const s2 = await p.evaluate(id => ({ab: SYNQUENZER.clInfo(id).ab, open: !!document.querySelector('.pop.tksheet')}), id);
      ok(s2.open || s2.ab === 'sauber', `P1: ${lab} with sheet open + Roh → ${JSON.stringify(s2)} (closed ⇒ Sauber)`);
      await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.songView(false); }); await p.evaluate(() => SYNQUENZER.clAB('sauber')); await sleep(200);
    }
    // undo/redo while the sheet is open: sheet follows, A/B kept?
    await p.evaluate(([t, s]) => SYNQUENZER.tkSheet({t, s}), [r.track, 0]); await sleep(300);
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(400);
    const uu = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, v: document.querySelector('.pop.tksheet .clr') && document.querySelector('.pop.tksheet .clr').value, lab: (document.querySelector('.pop.tksheet .clv') || {}).textContent}), id);
    ok(uu.cl === 60 && uu.v === '60' && uu.lab === '60 %', 'P1: undo with sheet open → 60 %, slider and label follow ' + JSON.stringify(uu));
    await p.evaluate(() => SYNQUENZER.redo()); await sleep(400);
    const rr = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, v: document.querySelector('.pop.tksheet .clr') && document.querySelector('.pop.tksheet .clr').value}), id);
    ok(rr.cl === 100 && rr.v === '100', 'P1: redo → 100 %, slider follows ' + JSON.stringify(rr));
    await p.evaluate(() => SYNQUENZER.closePop && SYNQUENZER.closePop());
    // race: 100 → 30 → undo immediately (job still running) → must end on 100 with the right buffer
    await p.evaluate(id => SYNQUENZER.clWait(id), id);
    const h100 = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id);
    await p.evaluate(id => { SYNQUENZER.clSet(id, 30); SYNQUENZER.undo(); }, id);
    await sleep(3000); await p.evaluate(id => SYNQUENZER.clWait(id), id); await sleep(500);
    const rc = await p.evaluate(id => ({ci: SYNQUENZER.clInfo(id), h: SYNQUENZER.clPlayHash(id), cl: SYNQUENZER.takes()[id].cl}), id);
    ok(rc.cl === 100 && rc.h === h100 && rc.ci.busy === 0 && !rc.ci.job, `P1: set 30 % + immediate undo while cleaning → 100 % buffer bit-identical, not busy (${JSON.stringify({cl: rc.cl, same: rc.h === h100, busy: rc.ci.busy, job: rc.ci.job, q: 0})})`);
    const q = await p.evaluate(() => SYNQUENZER.tkInfo().quiet); ok(!q.length, 'P1: network quiet released after race ' + JSON.stringify(q));
    // reload: takes deep-equal, cleaned version from the store (no new run)
    const T0 = await p.evaluate(() => SYNQUENZER.takes()); await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
    await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(1200);
    const T1 = await p.evaluate(() => SYNQUENZER.takes());
    ok(deq(T0, T1), 'P1: reload → takes deep-equal ' + JSON.stringify(T1[id]));
    await p.evaluate(id => { SYNQUENZER.tkLoadAll(); return SYNQUENZER.clEnsure(id); }, id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
    const rl = await p.evaluate(id => ({h: SYNQUENZER.clPlayHash(id), runs: SYNQUENZER.clInfo(id).runs}), id);
    ok(rl.h === h100 && rl.runs === 0, `P1: after reload the cleaned version comes from the store bit-identical without re-running (runs ${rl.runs})`);
  }
  ok(!H.errs.length, `${nm}: no console errors ${JSON.stringify(H.errs.slice(0, 3))}`);
  await ctx.close();
}
await br.close();
console.log(fail ? `FAIL ${fail}` : 'ALL OK');
