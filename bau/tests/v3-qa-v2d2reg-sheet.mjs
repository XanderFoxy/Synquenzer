// QA (V2d′): Start-Blatt geometry in all six viewports incl. W and the no-mode case (start at the song end), plus the idle ● label
import { open, APP } from './v3-v2d-pw.mjs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2d2reg/';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.selectTrack(0); Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); Q.selectTrack(1); Q.songView(true); return 1; };
const geo = (P) => { const s = document.querySelector('.pop.rstart'); if (!s) return null; const r = s.getBoundingClientRect(), bad = [], small = [];
  for (const x of s.querySelectorAll('button, .rs-ov, .rs-mode, .rs-h b, .lbl, small')) { const q = x.getBoundingClientRect(); if (!q.width || getComputedStyle(x).display === 'none') continue;
    if (q.left < r.left - .5 || q.right > r.right + .5 || q.top < r.top - .5 || q.bottom > r.bottom + .5 || q.bottom > innerHeight + .5 || q.top < -.5) bad.push((x.textContent || '').slice(0, 20) + ' out');
    if ((x.tagName === 'BUTTON' || x.tagName === 'SMALL' || x.classList.contains('rs-ov')) && x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).textOverflow !== 'ellipsis') bad.push((x.textContent || '').slice(0, 20) + ' clipped');
    if (x.tagName === 'BUTTON' && (q.height < (P ? 44 : 36) - .5 || q.width < (P ? 44 : 40) - .5)) small.push((x.textContent || '').slice(0, 14) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height)); }
  const bt = [...s.querySelectorAll('button')].filter(x => x.offsetParent); const ov = [];
  for (let i = 0; i < bt.length; i++) for (let j = i + 1; j < bt.length; j++) { const a = bt[i].getBoundingClientRect(), c = bt[j].getBoundingClientRect(); const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 1 && iy > 1) ov.push(bt[i].textContent.slice(0, 10) + ' X ' + bt[j].textContent.slice(0, 10)); }
  return {box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vh: innerHeight, head: (s.querySelector('.rs-h b') || {}).textContent, modes: [...s.querySelectorAll('.rs-m')].map(b => b.dataset.m).join(','), bad, small, ov, hs: document.documentElement.scrollWidth > innerWidth}; };
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of VPS) {
  const P = h > w; const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(setup); await p.waitForTimeout(200);
  const res = {};
  // idle ● label with all three targets on and Synth 2 selected
  await p.evaluate(() => window.SYNQUENZER.songRecTargets({clips: true, chords: true, notes: true, mel: true})); await p.waitForTimeout(250);
  res.idle = await p.evaluate(() => { const b = SV.btn.bRec, r = b.getBoundingClientRect(), t = b.lastChild.getBoundingClientRect(); return b.lastChild.textContent + ' t' + Math.round(t.width) + '/b' + Math.round(r.width) + (t.left < r.left - .5 || t.right > r.right + .5 ? ' SPILL' : ''); });
  for (const [k, prep] of [['end', () => { const Q = window.SYNQUENZER; Q.songSelect(null); Q.songPos(8); }], ['pos', () => { const Q = window.SYNQUENZER; Q.songSelect(null); Q.songPos(3); }], ['one', () => { const Q = window.SYNQUENZER; Q.songSelect(3, 3); }], ['rng', () => { const Q = window.SYNQUENZER; Q.songSelect(3, 5); }]]) {
    await p.evaluate(prep); await p.waitForTimeout(150);
    const c = await p.evaluate(() => { const r = SV.btn.bRec.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(350);
    res[k] = await p.evaluate(geo, P);
    if (name === 'new' && (k === 'end' || k === 'one')) await p.screenshot({path: D + `sheet-${id}-${k}.png`});
    const x = await p.evaluate(() => { const e = document.querySelector('.pop.rstart .rs-x'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    if (x) { await p.touchscreen.tap(x.x, x.y); await p.waitForTimeout(200); }
  }
  console.log('==', name, id, 'errs', JSON.stringify(errs)); for (const k of Object.keys(res)) console.log('  ', k, JSON.stringify(res[k]));
  await b.close();
}
