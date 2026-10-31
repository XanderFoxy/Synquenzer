// QA regression (V2d): ● SONG take (WP6 Mitschnitt) with scenes, single clips, stop, chords; then ▶ SONG; ↩ SONG; undo
import { open, APP } from './v3-v2d-pw.mjs';
import {BASE} from './v3-v2d-pw.mjs';
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out).sort());
const setupClips = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 3, key: K, notes: [N(0, 53), N(4, 55), N(8, 52)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]}); return 1; };
const out = {};
for (const [name, file] of [['base', BASE], ['new', process.env.BB ? BASE : APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  await p.evaluate(setupClips);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(0); Q.songRec(true); });
  const rs = await p.evaluate(() => window.SYNQUENZER.runtime().song);
  await waitBeat(p, 6); await p.evaluate(() => window.SYNQUENZER.launchScene(1));
  await waitBeat(p, 14); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0));
  await waitBeat(p, 18.5); await p.evaluate(() => window.SYNQUENZER.tapSlot(1, 1));
  await waitBeat(p, 22); await p.evaluate(() => { window.SYNQUENZER.setKbMode('transpose'); return window.SYNQUENZER.chord([65, 69, 72], 200); });
  await waitBeat(p, 27); await p.evaluate(() => window.SYNQUENZER.songRec(false));
  await p.waitForTimeout(300);
  const song = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return s && {bars: s.bars, lanes: s.lanes, carrier: s.carrier.map(c => c.beat + ':' + (c.target ? c.target.name : '-'))}; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.setKbMode('play'); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
  await waitBeat(p, 23.5);
  const log = await grab(p);
  // ↩ SONG after a take-over
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(1); });
  await waitBeat(p, 5); await p.evaluate(() => window.SYNQUENZER.launchClip(1, 0)); await waitBeat(p, 9.2);
  const ov = await p.evaluate(() => window.SYNQUENZER.runtime().song.override);
  await p.evaluate(() => window.SYNQUENZER.backToSong()); await waitBeat(p, 19.5);
  const log2 = await grab(p);
  // undo the take
  const un = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.undo(); const s = Q.song(); return s ? s.lanes.map(l => l.length) : null; });
  out[name] = {rs: {rec: rs.rec}, song, log, ov, log2, un, errs: errs.slice(), te: await p.evaluate(() => window.SYNQUENZER.tickErrors())};
  await b.close();
}
for (const f of ['rs', 'song', 'ov', 'un', 'errs', 'te']) { const s = JSON.stringify(out.base[f]) === JSON.stringify(out.new[f]); console.log(f, s ? 'same' : 'DIFF', JSON.stringify(out.new[f]).slice(0, 700), s ? '' : '\n  base ' + JSON.stringify(out.base[f]).slice(0, 700)); }
for (const f of ['log', 'log2']) { const A = out.base[f], B = out.new[f]; const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); console.log(f, A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss.slice(0, 12)) + ' extra=' + JSON.stringify(extra.slice(0, 12)) : 'same'); }
