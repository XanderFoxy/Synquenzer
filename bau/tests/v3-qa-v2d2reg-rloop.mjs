// QA regression (V2d): song loop range (V0c) through the middle of a 3-bar clip block, chords; base vs new noteLog
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out).sort());
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 3, key: K, notes: [N(0, 45), N(4, 48), N(8, 50)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 57), N(2, 59)]});
    Q.setClip(1, 0, {len: 2, key: K, notes: [N(1, 69), N(5, 72)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
    Q.songFromChain([{scene: 0, bars: 6}, {scene: 1, bars: 2}]); Q.songSetChord(2, 'F'); Q.songSetChord(4, 'G');
    Q.songLoopRange({on: true, a: 2, b: 4}); Q.clearLog(); Q.songPlay(0); });
  await waitBeat(p, 44);
  out[name] = {log: await grab(p), errs, lr: await p.evaluate(() => window.SYNQUENZER.songLoopRange())};
  await b.close();
}
const A = out.base.log, B = out.new.log; const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x));
console.log('loop range', JSON.stringify(out.new.lr), 'log', A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss) + ' extra=' + JSON.stringify(extra) : 'same', 'errs', JSON.stringify(out.new.errs));
