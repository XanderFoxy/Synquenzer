// QA VS-L-08/-11: Melodieerkennung Aus – ● REC (Länge 4 fest, natürliches Ende), ● REC als Overdub auf MELODIE-Clip (Demo),
// Stimme-FANG 16-Takt-Phrase, ● SONG; je: nur STIMME, MELODIE unverändert, Zähler 0, Meldung, ein Undo, Undo/Redo deep-equal.
// node n4-vs-l-qa-aus.mjs <teil: fix|od|fang|song> [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, takeDb, snap, deq, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const part = process.argv[2] || 'fix', file = process.argv[3] || NEW;
const toasts = p => p.evaluate(() => window.__toasts.slice());
const info = p => p.evaluate(() => ({runs: SYNQUENZER.vsInfo().runs, undo: SYNQUENZER.undoInfo(), res: SYNQUENZER.vsResult(), sheet: !!document.querySelector('.vsres'), mel: SYNQUENZER.project().tracks[5]}));
let H, p;
if (part === 'fix') {          // ● REC, Länge 4, MELODIE-Platz leer, natürliches Ende
  H = await start(file, 120, {mel: process.env.MEL === 'an' ? true : false, len: 4}); p = H.p;
  const k = await prep(H, sing(melN(4), 120));
  const i0 = await info(p), s0 = await snap(p);
  await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 0.5);
  await p.evaluate(() => { SYNQUENZER.selectSlot(5, 1); SYNQUENZER.rec(); }); await fire(H, k, 4);
  await waitBeat(p, 4 + 16 + 3); await idle(p); await sleep(1500);
  const r = await stInfo(p, 1), i1 = await info(p), s1 = await snap(p), t = await toasts(p);
  console.log('STIMME', JSON.stringify({len: r.len, take: r.audio && (r.audio.out - r.audio.in).toFixed(3)}), 'MELODIE-Clip Szene 2:', JSON.stringify(i1.mel.clips[1] || null));
  console.log('MELODIE-Spur deep-equal:', deq(i0.mel, i1.mel), '| Zähler', i1.runs, '| Ergebnis', JSON.stringify(i1.res), 'Blatt', i1.sheet);
  console.log('Undo-Schritte', i0.undo.n, '→', i1.undo.n, JSON.stringify(i1.undo.top && i1.undo.top.label));
  console.log('Meldungen:', JSON.stringify(t));
  await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.undo()); const su = await snap(p); await p.evaluate(() => SYNQUENZER.redo()); const sr = await snap(p);
  console.log('Undo → vorher deep-equal:', deq(su, s0), '| Redo → nachher deep-equal:', deq(sr, s1));
}
if (part === 'od') {           // ● REC als Overdub auf den 4-Takt-MELODIE-Clip der Demo-Szene, 8 Takte, ● von Hand
  H = await start(file, 120, {mel: false, demo: true}); p = H.p;
  await p.evaluate(() => SYNQUENZER.setClip(5, 0, {len: 4, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 8, d: 1, n: 64, v: .8}]}));
  const k = await prep(H, sing(melN(8), 120));
  const i0 = await info(p), s0 = await snap(p);
  await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
  await waitBeat(p, 7.9); await fire(H, k, 8); await waitBeat(p, 8.0); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 8 + 32 + 0.1); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 8 + 32 + 3); await idle(p); await sleep(1500);
  const r = await stInfo(p, 0), i1 = await info(p), s1 = await snap(p), t = await toasts(p);
  const d8 = r.audio ? await takeDb(p, r.audio.take, r.audio.in + 14, r.audio.in + 16) : null;
  console.log('STIMME', JSON.stringify({len: r.len, take: r.audio && (r.audio.out - r.audio.in).toFixed(3), d8}));
  console.log('MELODIE-Spur deep-equal:', deq(i0.mel, i1.mel), '| Zähler', i1.runs, '| Ergebnis', JSON.stringify(i1.res), 'Blatt', i1.sheet);
  console.log('Undo-Schritte', i0.undo.n, '→', i1.undo.n);
  console.log('Meldungen:', JSON.stringify(t));
  await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.undo()); const su = await snap(p); await p.evaluate(() => SYNQUENZER.redo()); const sr = await snap(p);
  console.log('Undo → vorher deep-equal:', deq(su, s0), '| Redo → nachher deep-equal:', deq(sr, s1));
}
if (part === 'fang') {         // Stimme-FANG, 16-Takt-Phrase ohne Pause ≥ 1 Takt
  H = await start(file, 120, {mel: false}); p = H.p;
  const k = await prep(H, sing(melN(16), 120));
  const i0 = await info(p), s0 = await snap(p);
  await p.evaluate(() => SYNQUENZER.play()); await fire(H, k, 4);
  await waitBeat(p, 4 + 64 + 0.3); const okF = await p.evaluate(() => SYNQUENZER.vsFang({})); await idle(p); await sleep(1200);
  const lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang), vo = await p.evaluate(() => SYNQUENZER.vsVoiceOnly());
  const r = lf && lf.si != null ? await stInfo(p, lf.si) : null, i1 = await info(p), s1 = await snap(p), t = await toasts(p);
  const d1 = r && r.audio ? await takeDb(p, r.audio.take, r.audio.in + 0.1, r.audio.in + 2) : null, d16 = r && r.audio ? await takeDb(p, r.audio.take, r.audio.in + 30, r.audio.in + 32) : null;
  console.log('FANG', okF, JSON.stringify(lf), JSON.stringify(vo && vo.level));
  console.log('STIMME', JSON.stringify(r && {len: r.len, take: r.audio && (r.audio.out - r.audio.in).toFixed(3), d1, d16, late: r.last && r.last.late}));
  console.log('MELODIE-Spur deep-equal:', deq(i0.mel, i1.mel), '| Zähler', i1.runs, '| Ergebnis', JSON.stringify(i1.res), 'Blatt', i1.sheet);
  console.log('Undo-Schritte', i0.undo.n, '→', i1.undo.n);
  console.log('Meldungen:', JSON.stringify(t));
  await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.undo()); const su = await snap(p); await p.evaluate(() => SYNQUENZER.redo()); const sr = await snap(p);
  console.log('Undo → vorher deep-equal:', deq(su, s0), '| Redo → nachher deep-equal:', deq(sr, s1));
}
if (part === 'song') {         // ● SONG mit 🎤, 16 Takte, Überschreiben
  H = await start(file, 120, {mel: false}); p = H.p;
  await p.evaluate(() => SYNQUENZER.setSong({bars: 16, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}}));
  const k = await prep(H, sing(melN(16), 120));
  const i0 = await info(p), u0 = i0.undo.n;
  await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  const ban = await p.evaluate(() => ({ban: (document.querySelector('.recban') || {}).textContent || null, sv: (document.querySelector('.sv-ban') || {}).textContent || null}));
  await fire(H, k, off);
  await waitBeat(p, off + 64 + 0.2); await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), off + 64); await idle(p); await sleep(1000);
  const vox = await p.evaluate(() => SYNQUENZER.tkInfo().vox), i1 = await info(p), t = await toasts(p);
  const v = vox && vox[0], d16 = v ? await takeDb(p, v.take, v.in + 30, v.in + 32) : null;
  console.log('Banner während ● SONG:', JSON.stringify(ban));
  console.log('song.vox', JSON.stringify(v && {bar: v.bar, len: v.len, sec: (v.out - v.in).toFixed(3), d16}));
  console.log('MELODIE-Spur deep-equal:', deq(i0.mel, i1.mel), '| Zähler', i1.runs, '| Undo', u0, '→', i1.undo.n);
  console.log('Meldungen:', JSON.stringify(t));
}
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
