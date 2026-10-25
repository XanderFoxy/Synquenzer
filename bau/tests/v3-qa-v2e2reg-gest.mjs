// QA regression V2e′: existing touch gestures base (V2e-fix 4.7.0) vs new (4.8.0), P1 + L1 (CDP touch)
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, null, -1, {s: 0}, -1]}); Q.setPart(1, {name: 'Refrain', slots: [{s: 1}, {s: 1}, null, -1, {s: 0}, -1]}); return 1; };
const snap = p => p.evaluate(() => { const P = window.SYNQUENZER.project(); return JSON.stringify({t: P.tracks.map(t => t.clips), s: P.song, parts: P.parts}); });
const popInfo = p => p.evaluate(() => { const ps = [...document.querySelectorAll('.pop')].filter(x => x.offsetParent || getComputedStyle(x).display !== 'none'); return ps.map(x => x.className.replace(/\s+/g, ' ') + ' :: ' + x.textContent.trim().replace(/\s+/g, ' ').slice(0, 90)); });
const closePops = async p => { await p.evaluate(() => { const Q = window.SYNQUENZER; try { Q.closeMenu(); } catch (e) {} document.querySelectorAll('.pop').forEach(x => { const b = x.querySelector('[data-a=x], .ms-x, .sh-x'); if (b) b.click(); }); }); await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300); };
const ctr = (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function touch(p, cdp, pts) { // pts: [{type, x, y, wait}]
  for (const q of pts) { await cdp.send('Input.dispatchTouchEvent', {type: q.type, touchPoints: q.type === 'touchEnd' ? [] : [{x: q.x, y: q.y, id: 1}]}); if (q.wait) await p.waitForTimeout(q.wait); }
}
const hold = (p, cdp, c, ms) => touch(p, cdp, [{type: 'touchStart', x: c.x, y: c.y, wait: ms}, {type: 'touchEnd', wait: 250}]);
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  const r = {};
  await p.evaluate(setup); await p.waitForTimeout(500);
  r.keys = await p.evaluate(() => [...document.querySelectorAll('.pk')].filter(k => k.offsetWidth).map(k => k.dataset.i + ':' + k.textContent.trim()));
  // a) tap part key 0 → the part starts (stopped transport: starts playing)
  let c = await ctr(p, '.pk[data-i="0"]'); r.keyVis = !!c;
  if (c) {
    await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400);
    r.tapKey = await p.evaluate(() => { const R = window.SYNQUENZER.runtime(); return {playing: R.playing, part: R.part ? (R.part.i != null ? R.part.i : JSON.stringify(R.part).slice(0, 60)) : null, pop: [...document.querySelectorAll('.pop')].length}; });
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(400);
    // b) hold 650 ms, release still → Teil-Blatt
    const s0 = await snap(p);
    c = await ctr(p, '.pk[data-i="0"]'); await hold(p, cdp, c, 650);
    r.holdKey = await popInfo(p); r.holdKeySv = await p.evaluate(() => { const v = window.SYNQUENZER.viewState(), sv = document.getElementById('songView'); return (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'); });
    await closePops(p);
    // c) hold 500 ms, move 40 px up, release at ≈ 750 ms (before the 1050-ms Selbstöffner) → nothing changes
    c = await ctr(p, '.pk[data-i="1"]');
    await touch(p, cdp, [{type: 'touchStart', x: c.x, y: c.y, wait: 500}, {type: 'touchMove', x: c.x, y: c.y - 20, wait: 60}, {type: 'touchMove', x: c.x + 10, y: c.y - 40, wait: 150}, {type: 'touchEnd', wait: 400}]);
    r.dragKey = {same: (await snap(p)) === s0, pop: await popInfo(p), ed: await p.evaluate(() => { const v = window.SYNQUENZER.viewState(), sv = document.getElementById('songView'); return (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'); }), ghosts: await p.evaluate(() => document.querySelectorAll('.drg-ghost, .pk-ghost').length)};
    await closePops(p);
    // c2) after any drag the next plain tap still works (no stuck capture)
    c = await ctr(p, '.slot[data-t="0"][data-s="1"]'); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300);
    r.tapAfterDrag = await p.evaluate(() => window.SYNQUENZER.runtime().selected);
  }
  // d) long-press a matrix slot → its sheet
  c = await ctr(p, '.slot[data-t="0"][data-s="0"]'); await hold(p, cdp, c, 700);
  r.holdSlot = await popInfo(p); r.holdSlotEd = await p.evaluate(() => { const v = window.SYNQUENZER.viewState(), sv = document.getElementById('songView'); return (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'); });
  await closePops(p);
  // e) tap SONG ⇄ → the song view; tap again → back
  const s1 = await snap(p);
  c = await ctr(p, '.corner'); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400);
  r.corner1 = await p.evaluate(() => { const v = window.SYNQUENZER.viewState(), sv = document.getElementById('songView'); return (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'); });
  r.cornerData = (await snap(p)) === s1;
  // f) song view: make a song (2 marks), tap a cell → cycles; hold a mark → Marken-Blatt; swipe = scroll only
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]); Q.songView(true); });
  await p.waitForTimeout(500);
  const L = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo());
  const cell = (row, bar) => ({x: L.canvas.x + bar * L.cellW + L.cellW / 2 - (L.x0 || 0), y: L.canvas.y + L.rulerH + (row - 1) * L.rowH + L.rowH / 2});
  const sA = await snap(p);
  c = cell(1, 1); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300);
  r.cellTap = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.song().lanes[0]));
  await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
  r.cellUndo = (await snap(p)) === sA;
  // hold a mark (ruler) 650 ms → Marken-Blatt
  const mk = L.marks[1]; c = {x: L.canvas.x + (mk.x0 + mk.x1) / 2, y: L.canvas.y + L.rulerH / 2};
  await hold(p, cdp, c, 650);
  r.holdMark = await popInfo(p); await closePops(p);
  r.markData = (await snap(p)) === sA;
  // swipe the canvas to the left: scroll, no edit
  c = cell(2, 5);
  await touch(p, cdp, [{type: 'touchStart', x: c.x, y: c.y, wait: 30}, ...[1, 2, 3, 4, 5, 6].map(k => ({type: 'touchMove', x: c.x - k * 25, y: c.y, wait: 16})), {type: 'touchEnd', wait: 600}]);
  r.swipe = {x: await p.evaluate(() => window.SYNQUENZER.svLayoutInfo().x0), same: (await snap(p)) === sA, pop: await popInfo(p)};
  // tap ruler bar 3 → selection; ▶ starts there
  await p.evaluate(() => window.SYNQUENZER.songPos(0));
  const L2 = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo());
  c = {x: L2.canvas.x + 2 * L2.cellW + L2.cellW / 2 - (L2.x0 || 0), y: L2.canvas.y + 4};
  await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400);
  r.rulerTap = await p.evaluate(() => { const I = window.SYNQUENZER.svLayoutInfo(); return {sel: I.sel, pos: I.pos, mark: I.mark}; });
  r.rulerPop = await popInfo(p); await closePops(p);
  // ▶ SONG via the transport button, ⏮
  r.svBtns = await p.evaluate(() => [...document.querySelectorAll('#songView .sv-top button')].filter(x => x.offsetWidth).map(x => x.className.split(' ').filter(c => c.startsWith('sv-')).join('.') + ':' + x.textContent.trim().slice(0, 12)));
  c = await p.evaluate(() => { const e = document.querySelector('#songView .sv-play'); if (!e) return null; const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  if (c) { await p.evaluate(() => window.SYNQUENZER.clearLog()); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(1500); r.svPlay = await p.evaluate(() => { const R = window.SYNQUENZER.runtime(); return {playing: R.playing, songPlay: R.songPlay, n: window.SYNQUENZER.noteLog(400).length > 0}; }); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(300); r.svStop = await p.evaluate(() => window.SYNQUENZER.runtime().playing); }
  // back to clips via the corner of the song view
  c = await p.evaluate(() => { const e = document.querySelector('#songView .sv-sw'); if (!e) return null; const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  if (c) { await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400); r.back = await p.evaluate(() => { const v = window.SYNQUENZER.viewState(), sv = document.getElementById('songView'); return (v && v.editor) + (sv && sv.offsetWidth ? '/SV' : '/-'); }); }
  r.errs = errs.slice(); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  res[name + '-' + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) { const A = res['base-' + vp], B = res['new-' + vp];
  for (const k of Object.keys(B)) { const s = JSON.stringify(B[k]), same = s === JSON.stringify(A[k]); console.log(vp, k, same ? 'same' : 'DIFF', (s || '').slice(0, 700), same ? '' : '\n   base ' + (JSON.stringify(A[k]) || '').slice(0, 700)); } }
