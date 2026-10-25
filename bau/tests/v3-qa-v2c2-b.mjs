// QA V2c′ (acceptance lens) – part B: real playback paths (scene chord row, retune, part, song, MIDI, TONART, timing, lock)
import { open } from './v3-v2d-pw.mjs';
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
const PC = n => ((n % 12) + 12) % 12;
const Cmaj = [0, 2, 4, 5, 7, 9, 11];
await E(() => {
  const Q = window.SYNQUENZER;
  window.__sleep = ms => new Promise(r => setTimeout(r, ms));
  window.__setup = (notes, key, chordName, o = {}) => {
    Q.stop(); Q.newProject({init: true}); ensureAudio();
    if (o.harm) Q.setHarmony(o.harm);
    Q.setClip(0, 0, {len: o.len || 1, key, notes});
    Q.setChordRow('S1', chordName ? {len: o.rowLen || 1, ch: (Array.isArray(chordName) ? chordName : [[0, chordName]]).map(([b, n]) => ({b, tg: Q.parseChord(n)}))} : null);
    Q.setBpm(o.bpm || 240);
  };
  window.__run = async (ms) => { Q.play(); Q.launchScene(0); await __sleep(400); Q.clearLog(); await __sleep(ms || 2000);
    const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip'); Q.stop(); await __sleep(100); return log; };
});
const res = {};
const EM = [64, 67, 71, 74, 66].map((n, i) => ({t: i * .5, d: .4, n, v: .8}));
const KEM = {root: 4, scale: 'aeolian', src: 'user'};
// B1 scene chord row C, AKKORD
for (const [lbl, harm, os] of [['AKKORD an', {mode: 'chord'}, true], ['AKKORD aus', {mode: 'chord'}, false], ['TONART an', {mode: 'scale'}, true], ['TONART aus', {mode: 'scale'}, false]]) {
  const log = await E(async ([n, k, h, os]) => { __setup(n, k, 'C', {harm: h}); window.SYNQUENZER.oneScale(os); return __run(2000); }, [EM, KEM, harm, os]);
  res['B1 ' + lbl] = {n: log.length, pcs: [...new Set(log.map(e => PC(e.out)))].sort((a, b) => a - b), fs: log.filter(e => PC(e.out) === 6).length};
}
// B2 retune of a sustained note on a Träger change mid-note (Am -> C at beat 2), clip key C, F#4 whole bar
const b2 = await E(async () => {
  const Q = window.SYNQUENZER;
  __setup([{t: 0, d: 3.9, n: 66, v: .8}], {root: 0, scale: 'ionian', src: 'user'}, [[0, 'Am'], [2, 'C']], {bpm: 60});
  Q.play(); Q.launchScene(0);
  const smp = []; const t0 = performance.now();
  while (performance.now() - t0 < 9000) { const r = Q.runtime(); const v = Q.voices().filter(x => x.track === 0 && x.src === 'clip' && x.state !== 'pending');
    smp.push({beat: r.beat != null ? +(+r.beat).toFixed(2) : null, outs: v.map(x => x.out)}); await __sleep(250); }
  const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip').map(e => ({beat: e.beat, out: e.out}));
  Q.stop(); return {smp, log};
});
res.B2 = b2.smp.filter((x, i) => i % 2 === 0).map(x => (x.beat != null ? (x.beat % 4).toFixed(1) : '?') + ':' + x.outs.join('/')).join(' ');
res.B2log = b2.log;
// B3 timing identical on/off incl. durations
const t3 = {};
for (const os of [true, false]) {
  const notes = [{t: 0, d: .3, n: 64, v: .8}, {t: .33, d: .2, n: 66, v: .7}, {t: .75, d: .9, n: 69, v: .8}, {t: 1.9, d: .1, n: 61, v: .6}, {t: 2.5, d: 1.2, n: 70, v: .8}];
  const log = await E(async ([n, os]) => { __setup(n, {root: 0, scale: 'ionian', src: 'user'}, 'G'); window.SYNQUENZER.oneScale(os); return __run(2400); }, [notes, os]);
  t3[os] = log.map(e => (e.beat % 4).toFixed(3) + '/' + (+e.dur).toFixed(3)).sort().join(',');
}
res.B3same = t3.true === t3.false; res.B3 = t3;
// B4 part with chord row (C) – "wirkt auch auf Teile"
res.B4 = await E(async ([n, k]) => { const Q = window.SYNQUENZER; __setup(n, k, null); Q.oneScale(true);
  Q.setPart(0, {name: 'T', slots: [{s: 0}, -1, -1, -1, -1, -1], chords: {len: 1, ch: [{b: 0, tg: Q.parseChord('C')}]}});
  Q.play(); Q.launchPart(0); await __sleep(1200); Q.clearLog(); await __sleep(2000);
  const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip'); Q.stop();
  return {n: log.length, pcs: [...new Set(log.map(e => ((e.out % 12) + 12) % 12))].sort((a, b) => a - b)}; }, [EM, KEM]);
// B5 song with carrier C + MIDI export song/scene mit Träger
res.B5 = await E(async ([n, k]) => { const Q = window.SYNQUENZER; __setup(n, k, null); Q.oneScale(true);
  Q.setSong({bars: 2, lanes: [[{bar: 0, slot: 0}], [], [], [], [], []], carrier: [{beat: 0, target: Q.parseChord('C')}]});
  Q.songPlay(0); await __sleep(600); Q.clearLog(); await __sleep(1500);
  const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip'); Q.songPlay(false); Q.stop();
  const pcs = [...new Set(log.map(e => ((e.out % 12) + 12) % 12))].sort((a, b) => a - b);
  const m = Q.buildMidi({mode: 'song', withCarrier: true}); const by = m.bytes || m; const notes = [];
  for (let i = 0; i < by.length - 2; i++) if ((by[i] & 0xF0) === 0x90 && by[i + 2] > 0 && by[i + 1] < 128) notes.push(by[i + 1]);
  return {n: log.length, pcs, midiPcs: [...new Set(notes.map(x => x % 12))].sort((a, b) => a - b)}; }, [EM, KEM]);
// B6 chromatic passing melody C D E F F# G A ascending under C (scene row), playback noteLog
res.B6 = await E(async () => { const notes = [60, 62, 64, 65, 66, 67, 69].map((n, i) => ({t: i * .5, d: .45, n, v: .8}));
  __setup(notes, {root: 0, scale: 'ionian', src: 'user'}, 'C', {len: 1}); window.SYNQUENZER.oneScale(true);
  const log = await __run(2000); const m = new Map(); for (const e of log) m.set(e.clipNote, e.out);
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([a, b]) => a + '->' + b).join(' '); });
// B7 Tonart sperren under scene Träger C with e-minor clip playing: key F#4 (66) pressed on track 0 (play mode)
for (const os of [true, false]) {
  res['B7 lock ' + os] = await E(async ([n, k, os]) => { const Q = window.SYNQUENZER; __setup(n, k, 'C'); Q.oneScale(os); Q.setKbScale('lock');
    Q.selectTrack ? Q.selectTrack(0) : null; Q.play(); Q.launchScene(0); await __sleep(800); Q.clearLog();
    Q.keyOn(66); await __sleep(150); Q.keyOff(66); await __sleep(100);
    const log = Q.noteLog(4096).filter(e => e.src !== 'clip'); const shown = Q.carrierShown ? Q.carrierShown() : null; const ks = Q.kbScaleNow(); Q.stop();
    return {played: log.map(e => e.track + ':' + e.src + ':' + e.out), shown, ks}; }, [EM, KEM, os]);
}
for (const [k, v] of Object.entries(res)) console.log(k, JSON.stringify(v));
console.log('errs', errs);
await b.close();
