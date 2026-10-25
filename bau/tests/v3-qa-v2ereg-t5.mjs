// QA (V2e): Akkorde-quantisieren sheet (.cq seg buttons 40 → 44 px) and the AKKORDE menu, base vs new, all viewports:
// in the screen, [Quantisieren] reachable without scrolling, no clipped text, works (one undo)
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const MEAS = () => { const s = document.querySelector('#popLayer .pop'); if (!s) return null; const r = s.getBoundingClientRect(), bad = [];
  if (r.top < -.5 || r.bottom > innerHeight + .5 || r.left < -.5 || r.right > innerWidth + .5) bad.push('pop out');
  for (const x of s.querySelectorAll('button')) { if (!x.offsetWidth) continue; const q = x.getBoundingClientRect(); if (x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 2) bad.push('clip ' + x.textContent); if (q.bottom > r.bottom + .5 || q.top < r.top - .5) bad.push('outside pop (scroll) ' + x.textContent); if (q.bottom > innerHeight + .5) bad.push('off ' + x.textContent); }
  return {cls: s.className, box: [r.x, r.y, r.width, r.height].map(Math.round), sh: s.scrollHeight, ch: s.clientHeight, bad, seg: [...s.querySelectorAll('.seg button')].map(x => Math.round(x.getBoundingClientRect().height))}; };
for (const vp of Object.keys(VPS)) { const res = {};
  for (const [name, file] of [['base', BASE], ['new', APP]]) {
    const [w, h] = VPS[vp];
    const {b, p, errs} = await open({width: w, height: h}, file, true);
    const cdp = await p.context().newCDPSession(p);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
    const tap = async (x, y, wait = 300) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
    const tapPop = async t => { const r = await p.evaluate(t => { const pp = document.querySelector('#popLayer .pop'); const bb = pp && [...pp.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1]); return !!r; };
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
      Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.songFromChain([{scene: 0, bars: 4}]);
      Q.songSetChord(0, 'Am'); const s = Q.song(); s.carrier.push({beat: 5.3, target: Q.parseChord('F')}, {beat: 9.7, target: Q.parseChord('G')}); Q.songView(true); });
    await p.waitForTimeout(400);
    const lc = await p.evaluate(() => { const e = document.querySelector('#songView .sv-lc'); const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
    await tap(lc[0], lc[1]);
    const r = {menu: await p.evaluate(MEAS)};
    r.q = await tapPop('quantisieren');
    r.cq = await p.evaluate(MEAS);
    await p.screenshot({path: D + `t5-${name}-${vp}.png`});
    r.go = await tapPop('Quantisieren');
    r.car = await p.evaluate(() => window.SYNQUENZER.song().carrier.map(c => c.beat));
    r.errs = errs.slice();
    res[name] = r; await b.close();
  }
  console.log('==', vp, '\n base', JSON.stringify(res.base), '\n new ', JSON.stringify(res.new));
}
