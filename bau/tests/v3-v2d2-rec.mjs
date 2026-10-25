// V2d′ acceptance: N7S-27 … N7S-32, N2-2d′-01, K2-27, N7-R1 end of every take, parts in a take, undo, round trip, MIDI
import { open } from './v3-v2d-pw.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
import { SETUP, clipsJSON, projJSON, waitSong, note, playLog } from './v3-v2d2-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
const setup = async ins => { await E(SETUP(ins)); };
const song = () => E(() => window.SYNQUENZER.song());
const near = (x, y, tol = .06) => Math.abs(x - y) <= tol;
const only = process.argv[2] || '';
const run = id => !only || only.split(',').includes(id);

// ---------- N7S-27: ab Takt 3, Überschreiben, CLIPS: Pad-Start in T3, Ende bei T5 + 20 % → Taktstrich 5
if (run('27')) {
  await setup(false);
  const clips0 = await E(clipsJSON), s0 = await song();
  await E(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
  await waitSong(p, 6.5);                                       // in T2: launch Sz4 on the Fläche (lands on T3)
  await E(() => window.SYNQUENZER.launchClip(1, 3));
  await waitSong(p, 16.8);                                      // T5 + 20 %
  await E(() => window.SYNQUENZER.songRecEnd());
  const s1 = await song(), le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
  check('N7S-27 Ende N7-R1 → Taktstrich 5 (endBar 4)', le && le.endBar === 4, le);
  check('N7S-27 nur die Pad-Lane T3–4 ersetzt, ab T5 alter Inhalt phasengleich', eq(s1.lanes[1], [{bar: 2, slot: 3}, {bar: 4, slot: 1, ph: 4}]), s1.lanes[1]);
  check('N7S-27 Drums und alle anderen Lanes deep-equal', [0, 2, 3, 4, 5].every(t => eq(s1.lanes[t], s0.lanes[t])) && eq(s1.carrier, s0.carrier) && eq(s1.mel, s0.mel));
  check('N7S-27 Szenen-Clips deep-equal', (await E(clipsJSON)) === clips0);
  await p.waitForTimeout(300); await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const log = await playLog(p, 21, 1);
  const fl = log.map(n => [+n.beat.toFixed(2), n.clipNote]);
  check('N7S-27 hörbar: T3–4 Sz4 (67), T5 der alte Pad in Phase (62 bei 16), T6 64', fl.some(x => near(x[0], 8) && x[1] === 67) && fl.some(x => near(x[0], 12) && x[1] === 67) && fl.some(x => near(x[0], 16) && x[1] === 62) && fl.some(x => near(x[0], 20) && x[1] === 64) && !fl.some(x => near(x[0], 12) && x[1] === 60), fl);
  const u = await E(() => window.SYNQUENZER.undoInfo()); await E(() => window.SYNQUENZER.undo());
  const s2 = await song(); check('N7S-27 ein Undo → deep-equal', u.top && u.top.kind === 'song' && eq(s2, s0), u.top);
}

// ---------- N7S-28: ab Takt 3, Einfügen, Ende bei T7 + 30 % → 4 Takte eingefügt; alter T3 ist T7; ab T8 phasengleich
if (run('28')) {
  await setup(false);
  const ref = await playLog(p, 27.85);                           // the old song as heard (all tracks)
  const s0 = await song();
  await E(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'insert', targets: {clips: false, chords: true, notes: false}, preroll: 1}));
  await waitSong(p, 11.9);                                      // T3 + 99 %: Dm on the bar line of T4 (AKKORDE, ¼-beat grab)
  await E(() => { const Q = window.SYNQUENZER; Q.setKbMode('transpose'); Q.keyOn(62, .8, 'c1'); Q.keyOn(65, .8, 'c2'); Q.keyOn(69, .8, 'c3'); });
  await p.waitForTimeout(250); await E(() => { const Q = window.SYNQUENZER; Q.keyOff(62, 'c1'); Q.keyOff(65, 'c2'); Q.keyOff(69, 'c3'); Q.setKbMode('play'); });
  const during = await E(() => window.SYNQUENZER.runtime().song.recMode);
  await waitSong(p, 25.2);                                      // T7 + 30 %
  await E(() => window.SYNQUENZER.songRecEnd());
  const s1 = await song(), le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
  check('N7S-28 Modus insert während der Aufnahme', during === 'insert', during);
  check('N7S-28 Ende → 4 Takte eingefügt (bars 7 → 11)', s1.bars === 11 && le.endBar === 6, [s1.bars, le]);
  const shiftOK = s0.lanes.every((l, t) => l.filter(e => e.bar >= 2).every(e => s1.lanes[t].some(x => eq(x, Object.assign({}, e, {bar: e.bar + 4})))));
  check('N7S-28 Lanes ab T3 um +4 Takte', shiftOK, s1.lanes);
  const carOld = s0.carrier.filter(c => c.beat >= 8).map(c => [c.beat + 16, c.target && c.target.name]), carNew = s1.carrier.filter(c => c.beat >= 24).map(c => [c.beat, c.target && c.target.name]);
  check('N7S-28 Träger ab T3 um +16 Schläge (alter T3 = T7)', eq(carOld, carNew), [carOld, carNew]);
  check('N7S-28 Melodie ab 7,75 um +16', eq(s0.mel[5].notes.filter(n => n.t >= 7.75).map(n => n.t + 16), s1.mel[5].notes.filter(n => n.t >= 23.75).map(n => n.t)), s1.mel[5].notes.map(n => n.t));
  check('N7S-28 Marken ab T3 um +4', eq(s0.marks.filter(m => m.a >= 2).map(m => [m.a + 4, m.len, m.part]), s1.marks.filter(m => m.a >= 6).map(m => [m.a, m.len, m.part])), s1.marks);
  check('N7S-28 Dm im neuen Abschnitt bei T4 (Schlag 12)', s1.carrier.some(c => near(c.beat, 12, .01) && c.target && c.target.name === 'Dm'), s1.carrier.map(c => [c.beat, c.target && c.target.name]));
  await p.waitForTimeout(400); await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const got = await playLog(p, 43.85);
  const sig = (L, a, b2, d) => L.filter(n => n.beat >= a - 1e-3 && n.beat < b2 - 1e-3 && n.src !== 'click').map(n => [n.track, +(n.beat + d).toFixed(2), n.clipNote, n.out]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const A = sig(ref, 8, 28, 0), B = sig(got, 24, 44, -16);
  check('N7S-28 hörbar: neue T7–11 = alte T3–7 (Spur, Schlag ±0,01, Note, Tonhöhe)', A.length > 8 && A.length === B.length && A.every((x, k) => x[0] === B[k][0] && near(x[1], B[k][1], .01) && x[2] === B[k][2] && x[3] === B[k][3]), {A: A.slice(0, 12), B: B.slice(0, 12), nA: A.length, nB: B.length});
  const u = await E(() => window.SYNQUENZER.undoInfo()); await E(() => window.SYNQUENZER.undo());
  check('N7S-28 ein Undo → deep-equal', u.top && u.top.kind === 'song' && eq(await song(), s0), u.top && u.top.label);
}

// ---------- N7S-29: Bereich T3–6, Ersetzen, NOTEN auf Synth 2 — nur die neuen Noten, die alten stumm; eigene Clips; Szenen-Clips gleich
async function rangeTake(mode) {
  await setup(false);
  const clips0 = await E(clipsJSON), s0 = await song();
  await E(() => window.SYNQUENZER.selectTrack(1));
  await E(m => window.SYNQUENZER.songRecRange(2, 5, m, {clips: false, chords: false, notes: true}, {preroll: 1}), mode);
  await E(() => window.SYNQUENZER.clearLog());
  const mu = await E(() => window.SYNQUENZER.runtime().song.mute);
  await waitSong(p, 12.5); await note(p, 72, 120);              // T4 + ⅛
  await waitSong(p, 20.5); await note(p, 74, 120);              // T6 + ⅛
  await waitSong(p, 25.5);                                      // the take punches out at the range end (T7)
  const takeLog = await E(() => window.SYNQUENZER.noteLog(800).filter(n => n.track === 1).map(n => [+n.beat.toFixed(2), n.src, n.clipNote, n.out]));
  const rec = await E(() => window.SYNQUENZER.runtime().song.rec);
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  return {clips0, s0, mu, takeLog, rec, s1: await song(), clips1: await E(clipsJSON)};
}
if (run('29')) {
  const r = await rangeTake('replace');
  // during the take the transport ran from song bar 1 (Vorlauf): song beat = transport beat + 4
  const old = r.takeLog.filter(x => x[1] === 'clip').map(x => [+(x[0] + 4).toFixed(2), x[2]]);
  check('N7S-29 Aufnahme stanzt am Bereichsende aus', r.rec === false, r.rec);
  check('N7S-29 Stummschaltung Synth 2 Schlag 7,75–23,75 (K2-21)', r.mu && r.mu.t === 1 && near(r.mu.a, 7.75, 1e-6) && near(r.mu.b, 23.75, 1e-6), r.mu);
  check('N7S-29 während der Aufnahme keine alte Synth-2-Note in T3–6, T7 wieder da (65 bei 24)', !old.some(x => x[0] >= 7.75 && x[0] < 23.75) && old.some(x => near(x[0], 24) && x[1] === 65), old);
  const own = Object.keys(r.s1.own || {});
  check('N7S-29 eigener Clip angelegt (Durchlauf T4–7) + Lane-Eintrag', own.length === 1 && r.s1.lanes[1].some(e => e.bar === 3 && e.own === own[0]), [own, r.s1.lanes[1]]);
  const oc = own.length ? r.s1.own[own[0]] : null;
  check('N7S-29 eigener Clip: nur die neuen Noten in T4–6, T7 alt (65)', oc && eq(oc.notes.map(n => [+n.t.toFixed(1), n.n]).filter(x => x[0] < 12).map(x => x[0]), [0.5, 8.5]) && oc.notes.some(n => n.t === 12 && n.n === 65) && oc.from.t === 1 && oc.from.s === 1, oc && oc.notes);
  check('N7S-29 S.tracks[1].clips deep-equal (S8)', r.clips1 === r.clips0);
  const log = await playLog(p, 25.5, 1);
  const L = log.map(n => [+n.beat.toFixed(2), n.src, n.out]);
  check('N7S-29 Wiedergabe: T4 72 und T6 74 (src own), keine alte Note in T4–6, T7 65 (own)', L.some(x => near(x[0], 12.5) && x[1] === 'own' && x[2] === 72) && L.some(x => near(x[0], 20.5, .12) && x[1] === "own" && x[2] === 74) && !L.some(x => x[0] >= 12 && x[0] < 24 && ![72, 74].includes(x[2])) && L.some(x => near(x[0], 24) && x[1] === 'own'), L);
  const u = await E(() => window.SYNQUENZER.undoInfo()); await E(() => window.SYNQUENZER.undo());
  check('N7S-29 ein Undo → deep-equal', u.top && u.top.kind === 'song' && eq(await song(), r.s0), u.top && u.top.label);
}
// ---------- N7S-30: Bereich T3–6, Overdub: alte und neue Noten
if (run('30')) {
  const r = await rangeTake('overdub');
  const old = r.takeLog.filter(x => x[1] === 'clip').map(x => [+(x[0] + 4).toFixed(2), x[2]]);
  check('N7S-30 Overdub: keine Stummschaltung, alte Noten klingen während der Aufnahme (60/62/64)', !r.mu && [12, 16, 20].every(bt => old.some(x => near(x[0], bt))), {mu: r.mu, old});
  check('N7S-30 Szenen-Clip deep-equal', r.clips1 === r.clips0);
  const log = await playLog(p, 25.5, 1), L = log.map(n => [+n.beat.toFixed(2), n.src, n.out]);
  const oldN = [12, 16, 20].every(bt => L.some(x => near(x[0], bt) && x[1] === 'own')), newN = L.some(x => near(x[0], 12.5, .12) && x[2] === 72) && L.some(x => near(x[0], 20.5, .12) && x[2] === 74);
  check('N7S-30 Wiedergabe: alte (12/16/20) und neue Noten (72, 74) erklingen', oldN && newN, L);
}
// ---------- N7S-31: NOTEN auf der MELODIE-Spur; Überschreiben ersetzt alle Takte n … E-1, auch leere (K2-21)
if (run('31')) {
  await setup(false);
  const s0 = await song();
  await E(() => window.SYNQUENZER.selectTrack(5));
  await E(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 1}));
  await waitSong(p, 13); await note(p, 84, 100);                // T4 only; T3 left empty
  await waitSong(p, 16.4); await E(() => window.SYNQUENZER.songRecEnd());   // T5 + 10 % → end at bar line 5 (E0)
  const mel = await E(() => window.SYNQUENZER.songMelNotes(5)), le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
  check('N7S-31 Ende Taktstrich 5', le.endBar === 4, le);
  check('N7S-31 songMelNotes(5): T3 leer ersetzt (7,8 und 10 weg), neue Note in T4, 2 und 24 bleiben', eq(mel.map(n => n.t <= 2 || n.t >= 24 ? n.t : Math.round(n.t * 10) / 10).map(x => Math.round(x)), [2, 13, 24]) && mel.some(n => n.n === 84), mel.map(n => [n.t, n.n]));
  await E(() => window.SYNQUENZER.undo());
  check('N7S-31 Undo → deep-equal', eq(await song(), s0));
}
// ---------- N7S-32: eigener Clip spielt an der Stelle song.own, sonst der Szenen-Clip; Szenen-Clip ändern ändert ihn nicht
if (run('32')) {
  await setup(true);                                            // Song aus 5.5 nach „Einfügen“: Synth 1 Sz1 (1 Takt) T3–6
  const s0 = await song();
  const id = await E(() => window.SYNQUENZER.makeOwn(0, 4));
  const oc = await E(() => window.SYNQUENZER.ownClip(0, 4)), oc3 = await E(() => window.SYNQUENZER.ownClip(0, 3));
  check('N7S-32 makeOwn(0, T5) → eigener Clip nur T5 (Durchlauf 1 Takt)', id && oc && oc.id === id && !oc3 && oc.len === 1, [id, oc, oc3]);
  const u = await E(() => window.SYNQUENZER.undoInfo()); check('N7S-32 ein Undo song', u.top && u.top.kind === 'song', u.top);
  await E(() => { const Q = window.SYNQUENZER, c = Q.getClip(0, 0); Q.setClip(0, 0, Object.assign({}, c, {notes: c.notes.map(n => Object.assign({}, n, {n: 47}))})); });
  const oc2 = await E(() => window.SYNQUENZER.ownClip(0, 4));
  check('N7S-32 Szenen-Clip geändert → eigener Clip unverändert (45)', oc2 && oc2.notes.every(n => n.n === 45), oc2 && oc2.notes);
  const log = await playLog(p, 24.5, 0), L = log.map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
  const t5 = L.filter(x => x[0] >= 16 && x[0] < 20), oth = L.filter(x => x[0] >= 8 && x[0] < 24 && !(x[0] >= 16 && x[0] < 20));
  check('N7S-32 T5: src own 45; T3, T4, T6: src clip 47', t5.length === 2 && t5.every(x => x[1] === 'own' && x[2] === 45) && oth.length === 6 && oth.every(x => x[1] === 'clip' && x[2] === 47), L);
  const mid = await E(() => { const m = window.SYNQUENZER.buildMidi({mode: 'song', withCarrier: false}); if (!m) return null; const by = Array.from(m.bytes); let n45 = 0, n47 = 0; for (let i = 0; i < by.length - 2; i++) if (by[i] === 0x90 && by[i + 2] > 0) { if (by[i + 1] === 45) n45++; if (by[i + 1] === 47) n47++; } return {len: by.length, n45, n47}; });
  check('N7S-32 Song-MIDI: eigener Clip (45) an seiner Stelle, sonst der geänderte Szenen-Clip (47)', mid && mid.n45 >= 2 && mid.n47 >= 6, mid);
  // round trip (Speichern/Laden) keeps own clips and lanes
  const rt = await E(() => { const before = JSON.stringify(window.SYNQUENZER.song()); applyProject(JSON.parse(serializeProject())); return [before, JSON.stringify(window.SYNQUENZER.song())]; });
  check('N7S-32 Rundweg Speichern/Laden: song.own + Lanes verlustfrei', rt[0] === rt[1] && rt[1].includes('"own":"'), rt[1].slice(0, 200));
  await E(() => window.SYNQUENZER.dropOwn(0, 4));
  const s3 = await song();
  check('N7S-32 dropOwn → Lanes und own wie vorher', eq(s3.lanes, s0.lanes) && eq(s3.own, s0.own), [s3.lanes[0], s3.own]);
  const w = await E(() => window.SYNQUENZER.makeOwn(0, 8, true)), sw = await song();   // [Ganzer Block] on the REFRAIN bass (2-bar clip T8–11)
  check('N7S-32 [Ganzer Block] T8–11 → ein eigener Clip, 4 Takte', w && sw.own[w] && sw.own[w].len === 4 && sw.lanes[0].some(e => e.bar === 7 && e.own === w), [w, sw.lanes[0], w && sw.own[w] && sw.own[w].notes.length]);
}
// ---------- N2-2d′-01: Song aus 5.5 nach „Einfügen“; ab Takt 4 überschreiben, NOTEN Synth 2: in T4 spielen, T5 leer, Ende am Taktstrich 6
if (run('n2')) {
  await setup(true);
  const clips0 = await E(clipsJSON), s0 = await song();
  await E(() => window.SYNQUENZER.selectTrack(1));
  await E(() => window.SYNQUENZER.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 1}));
  await waitSong(p, 12.5); await note(p, 76, 120);
  await waitSong(p, 20.35); await E(() => window.SYNQUENZER.songRecEnd());   // T6 + 9 %
  const le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
  check('N2-2d′-01 Ende am Taktstrich 6 (endBar 5)', le.endBar === 5, le);
  check('N2-2d′-01 S.tracks[].clips deep-equal', (await E(clipsJSON)) === clips0);
  const u = await E(() => window.SYNQUENZER.undoInfo()); check('N2-2d′-01 ein Undo', u.top && u.top.kind === 'song', u.top);
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const L = (await playLog(p, 24.5, 1)).map(n => [+n.beat.toFixed(2), n.src, n.out, n.clipNote]);
  check('N2-2d′-01 in T5 keine alte Note von Synth 2', !L.some(x => x[0] >= 15.75 && x[0] < 20 - .01), L);
  check('N2-2d′-01 T4 nur die neue Note (76)', L.filter(x => x[0] >= 12 && x[0] < 16).every(x => x[2] === 76) && L.some(x => near(x[0], 12.5) && x[2] === 76), L);
  check('N2-2d′-01 ab T6 der alte Inhalt (65 bei 20)', L.some(x => near(x[0], 20) && x[3] === 65), L);
  await E(() => window.SYNQUENZER.undo());
  check('N2-2d′-01 Undo → deep-equal', eq(await song(), s0));
}
// ---------- K2-27: Auswahl T4 (a = b = 3), [Nur Takt 4: Ersetzen], NOTEN Synth 2 → nur T4 neu, T5 alt; Modi im Blatt
if (run('k27')) {
  await setup(true);
  const m1 = await E(() => window.SYNQUENZER.recModes(3, 4, true)), m2 = await E(() => window.SYNQUENZER.recModes(3, 6, false)), m0 = await E(() => window.SYNQUENZER.recModes(3, null, false)), mE = await E(() => window.SYNQUENZER.recModes(11, null, false));
  check('K2-27 Modi: 1 Takt alle vier, Bereich Ersetzen/Overdub, ohne Auswahl ab Takt n, am Ende keine', eq(m1, ['over', 'insert', 'replace', 'overdub']) && eq(m2, ['replace', 'overdub']) && eq(m0, ['over', 'insert']) && eq(mE, []), [m1, m2, m0, mE]);
  await E(() => window.SYNQUENZER.selectTrack(1));
  await E(() => window.SYNQUENZER.songRecRange(3, 3, 'replace', {clips: false, chords: false, notes: true}, {preroll: 1}));
  await waitSong(p, 12.5); await note(p, 77, 120);
  await waitSong(p, 17.5);
  const rec = await E(() => window.SYNQUENZER.runtime().song.rec);
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const L = (await playLog(p, 21, 1)).map(n => [+n.beat.toFixed(2), n.out, n.clipNote]);
  check('K2-27 [Nur Takt 4: Ersetzen] stanzt nach T4 aus', rec === false);
  check('K2-27 nur T4 neu (77), T5 alt (Clip-Note 64 bei 16)', L.filter(x => x[0] >= 12 && x[0] < 16).every(x => x[1] === 77) && L.some(x => near(x[0], 16) && x[2] === 64), L);
}
// ---------- N7-R1 for the first take of an empty song (7.4: every take). Chords Am F C G … per bar = no period → the structure decides
if (run('r1')) {
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [57, 60, 64]];
  for (const [at, want, rule, chords] of [[3.2, 4, 'struktur', 3], [4.3, 4, 'struktur', 4], [2.3, 2, 'zeit', 0], [2.7, 3, 'zeit', 0]]) {
    await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); Q.launchScene(0); return 1; });
    await p.waitForTimeout(300);
    await E(() => window.SYNQUENZER.songRec(true));
    await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.rec && s.startBeat != null; }, null, {timeout: 8000});
    const sb = await E(() => window.SYNQUENZER.runtime().song.startBeat);
    if (chords) await E(() => window.SYNQUENZER.setKbMode('transpose'));
    for (let k = 0; k < chords; k++) {
      await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, sb + k * 4 - .1, {timeout: 20000, polling: 5});
      await E(c => { const Q = window.SYNQUENZER; c.forEach((n, j) => Q.keyOn(n, .8, 'r' + j)); }, CH[k]);
      await p.waitForTimeout(120); await E(c => { const Q = window.SYNQUENZER; c.forEach((n, j) => Q.keyOff(n, 'r' + j)); }, CH[k]);
    }
    await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, sb + at * 4, {timeout: 20000, polling: 5});
    await E(() => window.SYNQUENZER.songRec(false));
    const s = await song(), le = await E(() => window.SYNQUENZER.runtime().song.lastEnd);
    check(`N7-R1 erste Aufnahme${chords ? ' (' + chords + ' Akkorde)' : ' (gleiche Takte)'}, Ende bei Takt ${Math.floor(at) + 1} + ${Math.round((at % 1) * 100)} % → ${want} Takte (${rule})`, s && s.bars === want && le.rule === rule, [s && s.bars, le]);
    await E(() => { const Q = window.SYNQUENZER; Q.setKbMode('play'); Q.stop(); });
  }
}
// ---------- 7.2: Teil-Taste während der Aufnahme (CLIPS) setzt eine Marke; ein Undo
if (run('part')) {
  await setup(false);
  const s0 = await song();
  await E(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: true, chords: false, notes: false}, preroll: 1}));
  await waitSong(p, 6.4); await E(() => window.SYNQUENZER.partTap(0));       // STROPHE from T3
  await waitSong(p, 24.3); await E(() => window.SYNQUENZER.songRecEnd());    // T7 + 7 % → bar line 7
  const s1 = await song();
  check('7.2 Teil-Taste in der Aufnahme → Marke STROPHE T3–6 (P1)', s1.marks.some(m => m.a === 2 && m.len === 4 && m.part === 'P1'), s1.marks);
  check('7.2 Lanes der Strophe geschrieben (Bass Sz1 ab T3)', s1.lanes[0].some(e => e.bar === 2 && e.slot === 0), s1.lanes[0]);
  await E(() => window.SYNQUENZER.stop());
  const u = await E(() => window.SYNQUENZER.undoInfo()); await E(() => window.SYNQUENZER.undo());
  check('7.2 ein Undo → deep-equal', u.top && u.top.kind === 'song' && eq(await song(), s0), u.top && u.top.label);
}
// ---------- 7.3 SCHLEIFE Bereich + Ersetzen (NOTEN): jeder Durchgang gehört zur Aufnahme, je Takt gewinnt der jüngste; stumm nur im 1. Durchgang
if (run('loop')) {
  await setup(false);
  await E(() => { const Q = window.SYNQUENZER; Q.songLoopRange({on: true, a: 2, b: 4}); Q.selectTrack(1); });
  const s0 = await song();
  await E(() => window.SYNQUENZER.songRecRange(2, 3, 'replace', {clips: false, chords: false, notes: true}, {preroll: 1}));
  const T0 = await E(() => window.SYNQUENZER.runtime().beat);
  // pass 1: a note in T3 (song beat 8.5); pass 2: a note in T4 (song beat 12.5) — the transport runs on (T2 = Vorlauf)
  await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, 4 + 0.5, {timeout: 20000, polling: 5}); await note(p, 70, 100);
  await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, 12 + 4.5, {timeout: 20000, polling: 5}); await note(p, 71, 100);
  await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, 20 + 0.3, {timeout: 20000, polling: 5});
  const mid = await E(() => ({mu: window.SYNQUENZER.runtime().song.mute, log: window.SYNQUENZER.noteLog(600).filter(n => n.track === 1).map(n => [+n.beat.toFixed(2), n.src, n.out])}));
  await E(() => window.SYNQUENZER.songRecEnd());
  const s1 = await song();
  check('7.3 Schleife: Stummschaltung nur im 1. Durchgang', mid.mu === null, mid.mu);
  check('7.3 im 2. Durchgang klingt die Note des 1. (70, Melodie-Weg, T3 ohne Clip)', mid.log.some(x => x[1] === 'melody' && x[2] === 70 && x[0] > 12), mid.log);
  const m1 = (s1.mel[1] || {notes: []}).notes.map(n => n.n), oc = Object.values(s1.own || {})[0];
  check('7.3 Ergebnis: T3 = Note 70 (Durchgang 1), T4 = Note 71 im eigenen Clip (Durchgang 2), alte T4-Note weg', eq(m1, [70]) && oc && oc.notes.some(n => n.n !== 65 && near(n.t, .5, .12)) && !oc.notes.some(n => n.t === 0), [m1, oc && oc.notes]);
  await E(() => window.SYNQUENZER.stop());
  const u = await E(() => window.SYNQUENZER.undoInfo()); await E(() => window.SYNQUENZER.undo());
  check('7.3 ein Undo über alle Durchgänge → deep-equal', u.top && u.top.kind === 'song' && eq(await song(), s0), u.top && u.top.label);
}
// ---------- Einfügen mit NOTEN (Synth 2 spielt im Abschnitt den Zustand von T(n−1) weiter → eigener Clip) und CLIPS
if (run('insn')) {
  await setup(true);                                            // nach „Einfügen“: Synth 2 Sz2 T3–6 (4-Takt-Clip)
  const clips0 = await E(clipsJSON), s0 = await song();
  await E(() => window.SYNQUENZER.selectTrack(1));
  await E(() => window.SYNQUENZER.songRecFrom({from: 4, mode: 'insert', targets: {clips: true, chords: false, notes: true}, preroll: 1}));
  await E(() => window.SYNQUENZER.clearLog());
  await waitSong(p, 16.5); await note(p, 79, 100);              // new section T5 (Synth 2 runs on with bar 5 of its clip)
  await waitSong(p, 18.5); await E(() => window.SYNQUENZER.launchClip(3, 3));   // CLIPS: Synth 4 from T6
  await waitSong(p, 24.2); await E(() => window.SYNQUENZER.songRecEnd());       // T7 + 5 % → 2 bars inserted (T5–6)
  const tl = await E(() => window.SYNQUENZER.noteLog(800).map(n => [n.track, +(n.beat + 12).toFixed(2), n.src, n.clipNote]));
  const s1 = await song();
  check('Einfügen: 2 Takte (bars 11 → 13)', s1.bars === 13, s1.bars);
  check('Einfügen: während der Aufnahme kein alter T5-Inhalt (Bass Sz1 läuft weiter, kein Spurwechsel)', tl.filter(x => x[0] === 0 && x[1] >= 16 && x[1] < 24).every(x => x[3] === 45), tl.filter(x => x[0] === 0));
  check('Einfügen: Synth 4 ab T6 in der Lane, alter T5 jetzt T7 (Lanes +2)', s1.lanes[3].some(e => e.bar === 5 && e.slot === 3) && s0.lanes[2].filter(e => e.bar >= 4).every(e => s1.lanes[2].some(x => x.bar === e.bar + 2 && x.slot === e.slot)), [s1.lanes[3], s1.lanes[2]]);
  const id = Object.keys(s1.own || {})[0], oc = id && s1.own[id];
  check('Einfügen: Note 79 im eigenen Clip des Synth-2-Durchlaufs, Szenen-Clips deep-equal', oc && oc.from.t === 1 && oc.notes.length === 5 && (await E(clipsJSON)) === clips0, oc && oc.notes);
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const L = (await playLog(p, 30.5, 1)).map(n => [+n.beat.toFixed(2), n.src, n.out, n.clipNote]);
  check('Einfügen: Wiedergabe T5 Note 79 (own), alter T5 (Clip-Note 64) jetzt in T7', L.some(x => near(x[0], 16.5, .12) && x[1] === 'own' && x[2] === 79) && L.some(x => near(x[0], 24) && x[3] === 64), L);
  await E(() => window.SYNQUENZER.undo());
  check('Einfügen: Undo → deep-equal', eq(await song(), s0));
}
check('0 Konsolenfehler', errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
