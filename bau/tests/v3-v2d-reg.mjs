// V2d regression: the same scenarios on V2c-fix (baseline) and the new build — noteLog / MIDI notes must match
import { open, APP } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c-fix.html';
const {check, done} = mkCheck();
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 45), N(2, 47)]}); Q.setClip(0, 1, {len: 3, key: K, notes: [N(0, 50), N(5, 52), N(10, 53)]});
  Q.setClip(1, 1, {len: 2, key: K, notes: [N(1, 60), N(6, 62)]}); Q.setClip(2, 0, {len: 1, key: K, notes: [N(.5, 72, .2), N(1.5, 74, .2)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]}); Q.setClip(4, 1, {len: 2, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 5, d: .1, n: 42, v: .9}]}); return 1; };
const scen = {
  // A: chain song (WP6 lanes, a 3-bar clip), whole-song loop, two passes
  A: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 4}, {scene: 0, bars: 1}]); Q.songLoop(true); Q.songCycle(2, 3); Q.clearLog(); Q.songPlay(0); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 57, null, {timeout: 40000, polling: 50}); },
  // B: parts (V2c slots), launch, „bleibt“, second tap restarts
  B: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setPart(0, {name: 'A', slots: [{s: 1}, null, {s: 0}, -1, {s: 1}, -1]}); Q.setPart(1, {name: 'B', slots: [{s: 0}, {s: 1}, -1, -1, {s: 0}, -1]}); Q.clearLog(); Q.launchScene(0); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 5, null, {timeout: 20000, polling: 20}); await p.evaluate(() => window.SYNQUENZER.launchPart(0));
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 13, null, {timeout: 20000, polling: 20}); await p.evaluate(() => window.SYNQUENZER.launchPart(1));
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 21, null, {timeout: 20000, polling: 20}); await p.evaluate(() => window.SYNQUENZER.launchPart(1));
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 33, null, {timeout: 20000, polling: 20}); },
  // C: song with Träger by hand-set chords, play from bar 3 (phase of a clip launched earlier), ↩ SONG after a take-over
  C: async p => { await p.evaluate(setup); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 1, bars: 6}, {scene: 0, bars: 2}]); Q.songSetChord(1, 'F'); Q.songSetChord(4, 'G'); Q.clearLog(); Q.songPlay(2); });
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 7, null, {timeout: 20000, polling: 20}); await p.evaluate(() => window.SYNQUENZER.launchClip(0, 0));
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 11, null, {timeout: 20000, polling: 20}); await p.evaluate(() => window.SYNQUENZER.backToSong());
    await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 23.5, null, {timeout: 20000, polling: 20}); },
};
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(2000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(3) + ':' + n.out).sort());
const midi = p => p.evaluate(() => { const m = window.SYNQUENZER.buildMidi({mode: 'song'}); if (!m) return null; const by = Array.from(m.bytes), ev = []; let i = 14; return {counts: m.counts}; });
const results = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  results[name] = {};
  for (const k of Object.keys(scen)) {
    const {b, p, errs} = await open({width: 390, height: 844}, file);
    await scen[k](p);
    results[name][k] = {log: await grab(p), midi: await midi(p), errs: errs.slice()};
    await b.close();
  }
}
for (const k of Object.keys(scen)) {
  const a = results.base[k].log, n = results.new[k].log;
  const miss = a.filter(x => !n.includes(x)), extra = n.filter(x => !a.includes(x));
  check('Regression ' + k + ' noteLog gleich wie V2c-fix (' + a.length + ' Noten)', a.length > 10 && !miss.length && !extra.length, {miss: miss.slice(0, 8), extra: extra.slice(0, 8)});
  check('Regression ' + k + ' MIDI-Notenzahlen gleich', JSON.stringify(results.base[k].midi) === JSON.stringify(results.new[k].midi), [results.base[k].midi, results.new[k].midi]);
  check('Regression ' + k + ' 0 Konsolenfehler', !results.new[k].errs.length, results.new[k].errs);
}
process.exit(done() ? 1 : 0);
