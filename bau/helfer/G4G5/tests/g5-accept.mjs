// G5 Abnahme: G5-01 Take ohne Noten → „In Melodie umwandeln“ → Noten-F ≥ 0,9 gegen die gesungene Referenz (Korpus-Stimme VS2),
// G5-02 Undo (auch [Verwerfen], vorhandener MELODIE-Clip), G5-03 Song-Stimme → Song-Melodie (+ Undo). node g5-accept.mjs [app]
import {open, sleep, APP, resample} from './h.mjs';
import {melody, renderVoice} from './corpus.mjs';
const FILE = process.argv[2] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const i16 = x => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
// Noten-F (COnP wie VS2: Einsatz ±50 ms, Ton exakt)
function noteF(det, truth, tol = 0.05) { const used = new Set(); let m = 0; for (const t of truth) { let best = -1, bd = 1e9; det.forEach((d, k) => { if (used.has(k) || d.n !== t.midi) return; const e = Math.abs(d.t0 - t.on); if (e <= tol && e < bd) { bd = e; best = k; } }); if (best >= 0) { used.add(best); m++; } }
  const P = det.length ? m / det.length : 0, R = m / truth.length; return {F: P + R ? 2 * P * R / (P + R) : 0, P, R, n: det.length, t: truth.length}; }
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(100); S.key = {root: 9, scale: Harmony.SCALES.aeolian ? 'aeolian' : 'minor'}; });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), spb = 0.6;
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'Tonart', await p.evaluate(() => JSON.stringify(S.key)));
let allF = [];
for (const [k, vo, lo, hi] of [[1, 'male', 45, 62], [2, 'female', 57, 74], [3, 'male', 47, 64]]) {
  const notes = melody(10 + k, lo, hi, {bpm: 100, n: 24}), sig = renderVoice(notes, {voice: vo, seed: 20 + k, sigma: 10, vib: [25, 45], bpm: 100});
  let y = resample(sig.x, 16000, sr); let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); for (let i = 0; i < y.length; i++) y[i] *= 0.3 / pk;
  const bars = Math.min(16, Math.ceil(y.length / sr / (4 * spb)));
  const si = k - 1;
  const r = await p.evaluate(([pc, sr, s, l]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: s, len: l}), [i16(y), sr, si, bars]);
  const st = await p.evaluate(() => stimmeT());
  const before = await p.evaluate(s => SYNQUENZER.getClip(MEL_T, s), si);
  ok(!before, `Take ${k} (${vo}, ${notes.length} Noten, ${(y.length / sr).toFixed(1)} s, ${bars} Takte): Szene ${si + 1} hat keinen MELODIE-Clip (Take ohne Noten)`);
  const res = await p.evaluate(([st, s]) => SYNQUENZER.g5Convert({t: st, s}), [st, si]);
  const c = await p.evaluate(s => { const c = S.tracks[MEL_T].clips[s]; return c ? {len: c.len, take: c.take, notes: c.notes.map(n => ({o: n.o, t: n.t, n: n.n, d: n.d}))} : null; }, si);
  const sheet = await p.evaluate(() => ({open: !!(UI.pop && UI.pop.name === 'vsres'), txt: UI.pop && UI.pop.el ? UI.pop.el.querySelector('.fs-t').textContent : ''}));
  const det = c.notes.map(n => ({t0: (n.o != null ? n.o : n.t) * spb, n: n.n})), f = noteF(det, sig.truth);
  allF.push(f.F);
  ok(f.F >= 0.9 && c.take === r.id, `G5-01 Take ${k}: ${f.n} Noten erkannt, Noten-F ${f.F.toFixed(3)} (P ${f.P.toFixed(2)}, R ${f.R.toFixed(2)}) (Soll ≥ 0,9); MELODIE-Clip nennt den Take; ${G5ms(await p.evaluate(() => SYNQUENZER.g5Info().last))}`);
  ok(sheet.open && /umgewandelt/.test(sheet.txt), `Ergebnis-Blatt wie FANG offen: „${sheet.txt}“`);
  await p.evaluate(() => SYNQUENZER.vsResultOk());
}
function G5ms(l) { return l ? l.ms + ' ms' : ''; }
console.log(`  Noten-F Mittel ${(allF.reduce((a, b) => a + b, 0) / allF.length).toFixed(3)}`);
// G5-02 Undo · Verwerfen · vorhandener Clip wird ersetzt und kommt mit ↶ zurück
{
  const st = await p.evaluate(() => stimmeT());
  const u = await p.evaluate(() => { SYNQUENZER.undo(); return SYNQUENZER.getClip(MEL_T, 2); });
  ok(!u, 'G5-02 ein Undo nimmt den umgewandelten MELODIE-Clip zurück (Szene 3 wieder leer)');
  const rd = await p.evaluate(() => { SYNQUENZER.redo(); const c = SYNQUENZER.getClip(MEL_T, 2); return c ? c.notes.length : 0; });
  ok(rd > 0, `Redo bringt ihn wieder (${rd} Noten)`);
  const own = await p.evaluate(() => { const c = {len: 2, key: {root: 9, scale: S.key.scale, src: 'user'}, notes: [{t: 0, d: 1, n: 60, v: 0.8}]}; pushUndo(MEL_T, 1, cleanClip(S.tracks[MEL_T].clips[1]), 'test'); S.tracks[MEL_T].clips[1] = c; return JSON.stringify(SYNQUENZER.getClip(MEL_T, 1)); });
  await p.evaluate(st => SYNQUENZER.g5Convert({t: st, s: 1}), st);
  const rep = await p.evaluate(() => SYNQUENZER.getClip(MEL_T, 1).notes.length);
  await p.evaluate(() => SYNQUENZER.vsResultDrop());
  const back = await p.evaluate(() => JSON.stringify(SYNQUENZER.getClip(MEL_T, 1)));
  ok(rep > 1 && back === own, `vorhandener MELODIE-Clip: Umwandeln ersetzt ihn (${rep} Noten), [Verwerfen] stellt ihn deep-equal wieder her`);
}
// G5-03 Song-Stimme → Song-Melodie
{
  const notes = melody(31, 45, 62, {bpm: 100, n: 20}), sig = renderVoice(notes, {voice: 'male', seed: 41, sigma: 10, vib: [25, 45], bpm: 100});
  let y = resample(sig.x, 16000, sr); let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); for (let i = 0; i < y.length; i++) y[i] *= 0.3 / pk;
  const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 5, len: 8}), [i16(y), sr]);
  const bar = 2, len = Math.min(16, Math.ceil(y.length / sr / (4 * spb)));
  const sv = await p.evaluate(([id, out, bar, len]) => { SYNQUENZER.songFromChain([{scene: 0, bars: 16}]); const song = S.song; songSetBars(song, Math.max(song.bars, bar + len + 1));
    song.vox = [{id: 'V1', bar, len, take: id, in: 0, out, at: 0, gain: 1, fadeIn: 0.005, fadeOut: 0.005}]; songChanged();
    const mt = song.melodyTrack; return {bars: song.bars, mt, before: JSON.stringify(songSnapshot())}; }, [r.id, y.length / sr, bar, len]);
  const res = await p.evaluate(() => SYNQUENZER.g5Convert({vox: 'V1'}));
  const m = await p.evaluate(mt => (S.song.mel[mt] ? S.song.mel[mt].notes.map(n => ({t: n.t, n: n.n})) : []), res.track);
  const det = m.filter(n => n.t >= bar * 4 - 0.25).map(n => ({t0: (n.t - bar * 4) * spb, n: n.n})), f = noteF(det, sig.truth);
  ok(res && res.notes > 0 && f.F >= 0.9, `G5-03 Song-Stimme (Takt ${bar + 1}–${bar + len}) → Song-Melodie (Spur ${res.track}): ${res.notes} Noten an derselben Stelle, Noten-F ${f.F.toFixed(3)} (Soll ≥ 0,9)`);
  const after = await p.evaluate(() => { SYNQUENZER.undo(); return JSON.stringify(songSnapshot()); });
  ok(after === sv.before, 'Song: ein Undo stellt den Song deep-equal wieder her');
}
// Claude-App / ohne Audio: kein Knopf
if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 3));
await H.br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
