// QA (V2e): selection behind the end after undo (song 4 → 2 bars): ▶ SONG, Träger — base vs new
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/base-v2d2fix.html';
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); const s = window.SYNQUENZER.song(); return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), sel: window.SYNQUENZER.songSelect(), bars: s && s.bars, playing: window.SYNQUENZER.runtime().playing}; };
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 400) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapSel = async s => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); if (r) await tap(r[0], r[1]); return !!r; };
  // take 1: 2 bars; take 2 (one undo step): 4 bars
  const take = async n => { await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(0); Q.songRec(true); }); await p.waitForFunction(n => window.SYNQUENZER.runtime().beat > n * 4 + .5, n, {timeout: 30000, polling: 20}); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); }); await p.waitForTimeout(300); };
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); });
  await take(2); await p.evaluate(() => window.SYNQUENZER.songDelete()); await take(4);
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  const cv = await p.evaluate(() => { const q = document.querySelector('.sv-cv').getBoundingClientRect(); return [q.x, q.y]; });
  await tap(cv[0] + 36 * 3.5, cv[1] + 8);
  const o = {sel: await p.evaluate(st)};
  // undo until the song is 2 bars again (the delete+take) — undo the 4-bar take, the delete brings back the 2-bar song
  for (let k = 0; k < 2; k++) { await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(250); }
  o.undo = await p.evaluate(st);
  await tapSel('#songView .sv-play'); await p.waitForTimeout(600); o.play = await p.evaluate(st);
  await p.evaluate(() => window.SYNQUENZER.stop());
  o.errs = errs.slice();
  console.log(name, JSON.stringify(o));
  await b.close();
}
