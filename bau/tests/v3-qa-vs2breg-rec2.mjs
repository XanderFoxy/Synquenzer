// QA regression VS2: overdub into an existing clip, auto-length record ended by ●, ● SONG recording; base vs new (no mic)
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/G-P1b-gruppe-fix.html';
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const wb = x => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, x, {timeout: 40000, polling: 10});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(200); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 57, v: .8}, {t: 2, d: .5, n: 60, v: .8}]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]}); Q.launchScene(0); });
  await wb(3.5);
  // overdub track 0 slot 0 (running)
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 0, length: 'auto', quantize: '1/16'}); Q.selectSlot(0, 0); Q.rec(); });
  const r0 = await p.evaluate(() => window.SYNQUENZER.runtime().rec);
  const s = Math.ceil(await p.evaluate(() => window.SYNQUENZER.runtime().beat));
  for (const k of [1, 3]) { await wb(s + k + 4 - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 100), 64 + k); }
  await wb(s + 9); await p.evaluate(() => window.SYNQUENZER.rec()); await wb(s + 14);
  const od = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(0, 0); return {len: c.len, n: c.notes.map(x => x.n + '@' + Math.round(x.t * 4) / 4).sort().join(' ')}; });
  const odState = r0.state + '/' + r0.mode;
  const u1 = await p.evaluate(() => { window.SYNQUENZER.undo(); const c = window.SYNQUENZER.getClip(0, 0); return c.notes.length; });
  // ● SONG
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.songFromChain([{scene: 0, bars: 2}, {scene: 0, bars: 2}]); Q.songView(true); });
  await p.waitForTimeout(300);
  let song = null;
  try {
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setRecOptions({countIn: 0}); Q.songRec(true); });
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => { const r = window.SYNQUENZER.runtime(); return {songRec: !!r.songRec, playing: r.playing, beat: r.beat}; });
    const s2 = Math.ceil(st.beat);
    for (const k of [0, 2, 4, 6]) { await wb(s2 + k - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 100), 69 + k); }
    await wb(s2 + 8); await p.evaluate(() => window.SYNQUENZER.songRec(false)); await p.waitForTimeout(500);
    song = await p.evaluate(() => { const Q = window.SYNQUENZER, P = Q.project(); return {st: Q.runtime().songRec, mel: JSON.stringify(Q.songMelNotes ? Q.songMelNotes() : null).slice(0, 300), tracks: P.tracks.map(t => (t.clips || []).map(c => (c ? c.notes.length : 0)).join(',')), undo: JSON.stringify(Q.undoInfo()).slice(0, 120)}; });
    song.start = st;
  } catch (e) { song = {err: String(e)}; }
  res[name] = {odState, od, u1, song, errs: errs.slice(0, 3), te: await p.evaluate(() => window.SYNQUENZER.tickErrors())};
  await b.close();
}
for (const k of Object.keys(res.new)) { const s = JSON.stringify(res.base[k]) === JSON.stringify(res.new[k]); console.log(k, s ? 'same' : 'DIFF', JSON.stringify(res.new[k]), s ? '' : '\n   base ' + JSON.stringify(res.base[k])); }
