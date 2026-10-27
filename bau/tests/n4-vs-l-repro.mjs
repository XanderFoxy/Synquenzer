// VS-L: Nachweis im unveränderten Stand (4.23.0): wie lang wird der Gesang? node n4-vs-l-repro.mjs <file> <case>
import {open, micOn, sleep, sing, playAt, waitBeat, idle, mel16, rmsDb} from './n4-vs-l-h.mjs';
const file = process.argv[2], cs = process.argv[3];
const H = await open({file}), p = H.p, sr = await micOn(p);
const BPM = +(process.argv[4] || 120);
await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 'auto'}); }, BPM);
const spb = 60 / BPM;
const info = async (scene) => p.evaluate(async s => { const I = SYNQUENZER.tkInfo(), st = I.stimme; const c = st >= 0 ? SYNQUENZER.getClip(st, s) : null, m = SYNQUENZER.getClip(5, s); const tk = c && c.audio ? SYNQUENZER.takes()[c.audio.take] : null;
  return {stLen: c && c.len, audio: c && c.audio && {take: c.audio.take, in: c.audio.in, out: c.audio.out, at: c.audio.at, alt: (c.audio.alt || []).length}, takeSec: tk && +(tk.len / tk.sr).toFixed(2), mel: m && {len: m.len, n: m.notes.length, last: m.notes.length ? Math.max(...m.notes.map(n => n.t)) : null}, last: I.last}; }, scene);
async function recSing(scene, track, startBar, bars) {
  // ● kurz vor dem Takt, Gesang ab dem Takt
  await waitBeat(p, startBar * 4 - 0.5); await p.evaluate(([t, s]) => { SYNQUENZER.selectSlot(t, s); SYNQUENZER.rec(); }, [track, scene]);
  await playAt(p, sing(mel16(bars), BPM), startBar * 4, sr, false);
}
const out = {case: cs, bpm: BPM, ver: await p.evaluate(() => SYNQUENZER.version)};
if (cs === 'leer') {            // leerer Platz, AUTO, 16 Takte
  await p.evaluate(() => SYNQUENZER.play());
  await recSing(2, 3, 1, 16);
  await waitBeat(p, 4 + 64 + 2); await idle(p);
  out.r = await info(2);
}
if (cs === 'overdub') {         // erst 4-Takt-Take (Länge 4), dann ● REC AUTO 16 Takte auf denselben Platz
  await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 4}); SYNQUENZER.play(); });
  await recSing(2, 3, 1, 4);
  await waitBeat(p, 4 + 16 + 1); await idle(p);
  out.r4 = await info(2);
  await p.evaluate(() => SYNQUENZER.setRecOptions({length: 'auto'}));
  await recSing(2, 3, 6, 16);
  await waitBeat(p, 24 + 64 + 2); await idle(p);
  out.r = await info(2);
}
if (cs === 'mel') {             // über einem 4-Takt-MELODIE-Clip (MELODIE gewählt → Overdub der MELODIE)
  await p.evaluate(() => { SYNQUENZER.setClip ? 0 : 0; });
  const ok = await p.evaluate(() => { try { SYNQUENZER.selectSlot(5, 2); return !!SYNQUENZER.setClipNotes; } catch (e) { return String(e); } });
  await p.evaluate(() => SYNQUENZER.play());
  await recSing(2, 5, 1, 4); await waitBeat(p, 4 + 16 + 0.2); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 22); await idle(p); await p.evaluate(() => SYNQUENZER.vsResultOk && SYNQUENZER.vsResultOk());
  out.r4 = await info(2);
  // zweite Aufnahme: MELODIE-Clip vorhanden, aber andere Szene-Zeile gewählt? hier: Spur 3 (leer) → neuer Weg
  await recSing(2, 5, 7, 16);
  await waitBeat(p, 28 + 64 + 0.2); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 28 + 66); await idle(p);
  out.r = await info(2); out.k = ok;
}
if (cs === 'len16') {
  out.r = await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 16}); return SYNQUENZER.serialize ? JSON.parse(SYNQUENZER.serialize()).settings.recLength : null; });
}
if (cs === 'fang') {            // 16-Takt-Phrase ohne Pause ≥ 1 Takt, FANG am Ende
  await p.evaluate(() => SYNQUENZER.play());
  await playAt(p, sing(mel16(16), BPM), 4, sr, false);
  await waitBeat(p, 4 + 64 + 0.3);
  out.ok = await p.evaluate(() => SYNQUENZER.vsFang({}));
  await idle(p);
  out.res = await p.evaluate(() => { const r = SYNQUENZER.vsResult(); return r && {len: r.len, start: r.start, scene: r.scene, n: r.notes.length}; });
  if (out.res) out.r = await info(out.res.scene);
}
out.errs = H.errs.slice(0, 3);
console.log(JSON.stringify(out));
await H.br.close();
