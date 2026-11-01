// HARM-T1: Läufe skalenrein nach jeder Transponierung – mit den STANDARD-Werten (nichts eingestellt), Song-Akkordzeile und
// Live-Tastatur; jede Note (Synth-Spuren) liegt in der Skala des Akkords, der an ihrer Stelle gilt; keine Oktavsprünge, Kontur bleibt
import { open, mkCheck, APP } from './lib.mjs';
import { SONG_JS, FAELLE } from './pruefsong.mjs';
import { LIVE_JS, KEYS } from './live.mjs';
const file = process.argv[2] || APP;
const {check, done} = mkCheck('HARM-T1 Läufe');
const {b, p, errs} = await open(file);
await p.evaluate(SONG_JS); await p.evaluate(LIVE_JS);
const PC = n => ((n % 12) + 12) % 12;
const zOf = (key, names) => p.evaluate(([k, ns]) => ns.map(x => { const t = window.SYNQUENZER.parseChord(x); return t ? Harmony.oneScale(t, k, S.settings.harmony.mode, hopts()) : null; }), [key, names]);
const shOf = (key, names) => p.evaluate(([k, ns]) => ns.map(x => Harmony.nearestShift(window.SYNQUENZER.parseChord(x).root, k.root, 0)), [key, names]);
for (const [fn, F] of Object.entries(FAELLE)) {
  // Song: Akkordzeile je Takt, Standard-Einstellungen (keine harmony-Vorgabe)
  const h = await p.evaluate(([k, c]) => { __harmSong(k, c, {}); return Object.assign({}, S.settings.harmony); }, [F.key, F.chords]);
  await p.evaluate(() => __harmSettle());
  check(`${fn}: Standard Eine Skala an, 100 %, Einrasten, Wechsel Takt`, h.oneScale === true && h.osAmt === 1 && h.osPass === false && h.change === 'bar', {oneScale: h.oneScale, osAmt: h.osAmt, osPass: h.osPass, change: h.change});
  const Z = await zOf(F.key, F.chords), SH = await shOf(F.key, F.chords);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
  await p.waitForTimeout(F.chords.length * 1000 + 600);
  const log = (await p.evaluate(() => { const Q = window.SYNQUENZER, l = Q.noteLog(4096); Q.stop(); return l; }))
    .filter(e => e.src === 'clip' && e.track !== 4 && e.beat != null && e.beat < F.chords.length * 4 - 1e-6).sort((x, y) => x.track - y.track || x.beat - y.beat);
  const bar = e => Math.floor(e.beat / 4 + 1e-6);
  const fremd = log.filter(e => !Z[bar(e)].includes(PC(e.out)));
  check(`${fn}: Song – jede Lauf-/Arpeggio-Note in der Skala ihres Takts (${log.length} Noten)`, log.length >= 300 && fremd.length === 0, fremd.slice(0, 5).map(e => ({b: e.beat, n: e.clipNote, o: e.out, Z: Z[bar(e)]})));
  const okt = log.filter(e => Math.abs(e.out - e.clipNote - SH[bar(e)]) > 3);
  check(`${fn}: Song – kein Oktavsprung (Abstand zur Verschiebung ≤ 3 Halbtöne)`, okt.length === 0, okt.slice(0, 4));
  let kontur = []; for (let k = 1; k < log.length; k++) { const a = log[k - 1], c = log[k]; if (a.track !== c.track || bar(a) !== bar(c)) continue; if (Math.sign(c.out - a.out) !== Math.sign(c.clipNote - a.clipNote)) kontur.push([a.beat, a.clipNote, a.out, c.clipNote, c.out]); }
  check(`${fn}: Song – Kontur der Läufe bleibt (hoch bleibt hoch, runter bleibt runter)`, kontur.length === 0, kontur.slice(0, 4));
}
// Live: Akkorde mitten im Takt über der laufenden Szene (Tastatur und MIDI-Eingang), Standard-Werte
{
  const F = FAELLE['A-Moll i–VI–III–VII / i–VI–iv–V'];
  await p.evaluate(([k, c]) => { __harmSong(k, c, {}); window.SYNQUENZER.setSong(null); }, [F.key, F.chords]);
  await p.evaluate(() => __harmSettle());
  const pr = [{beat: 1.4, chord: 'F'}, {beat: 6.2, chord: 'C'}, {beat: 9.8, chord: 'E', midi: true}, {beat: 13.5, chord: 'Dm'}, {beat: 17.1, chord: 'G', midi: true}, {beat: 22.6, chord: 'Am'}]
    .map(x => ({...x, keys: KEYS[x.chord]}));
  const r = await p.evaluate(([pr]) => __harmLive(pr, {until: 30}), [pr]);
  const Z = await zOf(F.key, r.presses.map(x => x.chord));
  const ent = r.presses.map((x, k) => ({beat: x.entry && x.entry.beat, Z: Z[k], name: x.chord}));
  const at = bt => { let e = null; for (const x of ent) if (x.beat != null && x.beat <= bt + 1e-6) e = x; return e; };
  const syn = r.log.filter(e => e.src === 'clip' && e.track !== 4 && e.beat != null);
  const bad = syn.filter(e => { const x = at(e.beat); return x && !x.Z.includes(PC(e.out)); });
  check('Live (Tastatur + MIDI): jede Note nach einem Wechsel in der Skala des geltenden Akkords', syn.length > 200 && bad.length === 0, bad.slice(0, 5));
  check('Live: jeder Druck hat einen Wechsel geplant', ent.every(x => x.beat != null), ent.map(x => x.beat));
}
check('keine Fehler auf der Seite', errs.length === 0, errs.slice(0, 3));
await b.close(); done();
