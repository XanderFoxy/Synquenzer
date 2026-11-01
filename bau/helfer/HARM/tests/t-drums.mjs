// HARM-T4: Drums/Perkussion werden nie mittransponiert (auch North-Pads), außer „Drums mittransponieren“ ist bewusst an
import { open, mkCheck, APP } from './lib.mjs';
import { SONG_JS, FAELLE } from './pruefsong.mjs';
import { LIVE_JS, KEYS } from './live.mjs';
const file = process.argv[2] || APP;
const {check, done} = mkCheck('HARM-T4 Drums');
const {b, p, errs} = await open(file);
await p.evaluate(SONG_JS); await p.evaluate(LIVE_JS);
const F = FAELLE['A-Moll i–VI–III–VII / i–VI–iv–V'];
// every drum hit with the TUNE it gets from the harmony (drumHit wrapped: ex.lk.tune)
await p.evaluate(() => { const orig = drumHit; window.__hits = []; drumHit = function (n, v, t, src, ex) { window.__hits.push({n, tune: ex && ex.lk && ex.lk.tune || 0, src}); return orig.apply(this, arguments); }; });
const run = async (harm, pad) => p.evaluate(async ([k, c, harm, pad]) => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  __harmSong(k, c, {harmony: harm}); if (pad) { try { Q.setPadSource(pad, 'md'); } catch (e) {} } await __harmSettle();
  window.__hits = []; Q.clearLog(); Q.songPlay(0); await sl(4300);
  const l = Q.noteLog(4096).filter(e => e.track === 4); const tunes = window.__hits.map(h => h.tune); Q.stop(); await sl(300);
  return {h: Object.assign({}, S.settings.harmony), n: l.length, moved: l.filter(e => e.out !== e.clipNote).length, tuned: tunes.filter(x => x).length, hits: tunes.length, src: pad ? Q.padSource(pad) : null,
    kind: S.tracks[4].kind, synthKinds: S.tracks.filter((t, i) => i !== 4).every(t => t.kind === 'synth')};
}, [F.key, F.chords, harm, pad]);
const a = await run({});
check('Standard: „Drums mittransponieren“ ist aus', a.h.drums === false, a.h.drums);
check('Song mit Akkordzeile (F, C, G … Verschiebungen bis ±5): kein Drum-Schlag gestimmt oder verschoben', a.n > 10 && a.moved === 0 && a.tuned === 0, a);
check('nur die Drum-Spur trägt Perkussion (alle anderen sind Synth-Spuren)', a.kind === 'drum' && a.synthKinds, a);
const md = await run({}, 'kick');
check('North-Pad (Quelle md): ebenfalls nie gestimmt', md.moved === 0 && md.tuned === 0 && md.hits > 5, md);
// Live-Akkorde über der Szene: Drums bleiben
await p.evaluate(([k, c]) => { __harmSong(k, c, {}); window.SYNQUENZER.setSong(null); window.__hits = []; }, [F.key, F.chords]);
const r = await p.evaluate(([pr]) => __harmLive(pr, {until: 14}), [[{beat: 1.3, chord: 'F', keys: KEYS.F}, {beat: 5.5, chord: 'E', keys: KEYS.E, midi: true}]]);
const tl = await p.evaluate(() => window.__hits.filter(h => h.tune).length);
check('Live-Akkorde (Tastatur + MIDI): Drums bleiben ungestimmt', r.log.filter(e => e.track === 4 && e.out !== e.clipNote).length === 0 && tl === 0, tl);
// positive control: bewusst eingeschaltet → gestimmt
const on = await run({drums: true});
check('Gegenprobe: „Drums mittransponieren“ bewusst an → Schläge werden gestimmt', on.tuned > 0, on);
check('keine Fehler auf der Seite', errs.length === 0, errs.slice(0, 3));
await b.close(); done();
