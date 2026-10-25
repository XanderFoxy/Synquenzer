// QA (V2e): song view with a song (+/- a bar selection) → ≡ → „Demo laden“ (UI): base vs new — empty hint, stale canvas, Träger/Bereich-Leiste
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'), e = document.querySelector('#songView .sv-empty');
  // count bright cell pixels in the canvas (stale clip blocks) — the first track row
  const cv = document.querySelector('.sv-cv'); let lit = null; if (cv) { const g = cv.getContext('2d'), d = cv.width / cv.getBoundingClientRect().width; const v = g.getImageData(0, Math.round(25 * d), Math.round(150 * d), Math.round(30 * d)).data; lit = 0; for (let i = 0; i < v.length; i += 4) if (v[i] + v[i + 1] + v[i + 2] > 300) lit++; }
  return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), empty: !!(e && e.offsetWidth && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'), sel: window.SYNQUENZER.songSelect(), song: !!window.SYNQUENZER.song(), lit}; };
for (const [vp, w, h] of [['P1', 390, 844]]) for (const selOn of [true, false]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 300) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapText = async t => { const r = await p.evaluate(t => { const bb = [...document.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.trim().startsWith(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1], 400); return !!r; };
  const out = {};
  // a WP6 take (no marks) so a single ruler tap selects in both versions
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.launchScene(0); Q.songRec(true); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 12.5, null, {timeout: 20000, polling: 20});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); Q.songView(true); }); await p.waitForTimeout(400);
  const cv = await p.evaluate(() => { const q = document.querySelector('.sv-cv').getBoundingClientRect(); return [q.x, q.y]; });
  if (selOn) await tap(cv[0] + 36 * 1.5, cv[1] + 8);
  out.before = await p.evaluate(st);
  await tapText('≡'); out.demo = await tapText('Demo laden'); await tapText('Projekt ersetzen?');
  await p.waitForTimeout(1500);
  if (await p.evaluate(() => /open/.test((document.getElementById('menu') || {}).className || ''))) { await p.evaluate(() => window.SYNQUENZER.closeMenu()); await p.waitForTimeout(300); }
  out.after = await p.evaluate(st);
  await p.screenshot({path: D + `t7b-${name}-${selOn ? 'sel' : 'nosel'}.png`});
  out.errs = errs.slice();
  console.log('==', name, selOn ? 'with selection' : 'no selection', JSON.stringify(out));
  await b.close();
}
