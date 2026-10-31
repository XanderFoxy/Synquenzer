// QA regression (V2d): [＋] part (partFromNow) while a 4-bar clip plays under a held chord → the part gets a 1-bar chord row;
// launching the part later: does the 4-bar clip still play all 4 bars? V2c-fix vs V2d
import { open, APP } from './v3-v2d-pw.mjs';
import {BASE} from './v3-v2d-pw.mjs';
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 4, key: K, notes: [N(0, 45), N(4, 48), N(8, 50), N(12, 52)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
    Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 57)]});
    Q.setKbMode('transpose'); Q.launchScene(0); });
  await waitBeat(p, 1); await p.evaluate(() => window.SYNQUENZER.chord([57, 60, 64], 200));
  await waitBeat(p, 6);
  // the [＋] tap on the first part place (real touch on the part bar)
  const plus = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(x => x.offsetParent && x.textContent.trim() === '＋' || x.offsetParent && x.textContent.trim() === '+' && x.closest('#partBar, .partbar, .pbar, [class*=part]')); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  if (plus) { await p.touchscreen.tap(plus.x, plus.y); await p.waitForTimeout(300); }
  let part = await p.evaluate(() => window.SYNQUENZER.parts()[0]);
  if (!part) { await p.evaluate(() => window.SYNQUENZER.partFromNow(0, 'Strophe')); part = await p.evaluate(() => window.SYNQUENZER.parts()[0]); }
  // close a name sheet if any
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); Q.launchScene(1); });
  await waitBeat(p, 13);
  const b0 = await p.evaluate(() => { window.SYNQUENZER.clearLog(); window.SYNQUENZER.launchPart(0); return window.SYNQUENZER.runtime().beat; });
  await waitBeat(p, b0 + 22);
  out[name] = {via: plus ? 'tap ＋' : 'partFromNow', part: part && {len: part.len, chords: part.chords && part.chords.len, slots: part.slots}, bass: await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat != null).map(n => n.beat.toFixed(0) + ':' + n.clipNote)), errs};
  await b.close();
}
for (const k of ['base', 'new']) console.log(k, out[k].via, JSON.stringify(out[k].part), '\n   bass (beat:clipNote):', out[k].bass.join(' '), 'errs', JSON.stringify(out[k].errs));
