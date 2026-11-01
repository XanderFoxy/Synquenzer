// MIX-A Abnahme 2: Vorschläge übernehmen / Zurück / ↶ ↷ (je ein Schritt), Klang ändert sich nur nach Übernahme, Zurück = bitgleich,
// Songteil-Pegel hörbar im richtigen Teil, Speichern → Laden deep-equal. node mixa-vorschlag.mjs [index.html]
import { open, buildSong, ok, failed, APP } from './mixa-lib.mjs';
const {p, errs, close} = await open(APP);
await buildSong(p, {});
await p.evaluate(() => window.SYNQUENZER.mixaAnalyze());
// Video-Render: Fingerabdruck (FNV über die Float-Bits) und RMS in Takt-Bereichen
// solo = nur diese Spuren hörbar (4.30.0 rendert die volle Mischung nicht bitgleich von Lauf zu Lauf; Bass solo ist es)
const R = (solo = [0]) => p.evaluate(async solo => {
  window.__reseed(); const Q = window.SYNQUENZER, keep = S.tracks.map(t => t.mute); S.tracks.forEach((t, i) => { t.mute = !solo.includes(i); }); await Q.vvRender({}); S.tracks.forEach((t, i) => { t.mute = keep[i]; }); const r = VV.last, sp = 60 / r.bpm, sr = r.sr;
  let h = 0x811c9dc5; for (const d of r.ch) { const u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } }
  const rms = (a, b) => { let s = 0, n = 0; for (const d of r.ch) for (let i = Math.round(a * 4 * sp * sr); i < Math.min(d.length, Math.round(b * 4 * sp * sr)); i++) { s += d[i] * d[i]; n++; } return 10 * Math.log10(s / Math.max(1, n)); };
  return {h: h.toString(16), n: r.n, intro: +rms(0.25, 3.75).toFixed(3), ref: +rms(4.25, 11.75).toFixed(3)};
}, solo);
const st = () => p.evaluate(() => { const Q = window.SYNQUENZER, pr = Q.project(); return {mix: pr.tracks.map(t => t.mix || null), fx: pr.tracks.map(t => t.sound && t.sound.fx ? {vol: t.sound.fx.vol, pan: t.sound.fx.pan, pump: t.sound.fx.pump, pumpRel: t.sound.fx.pumpRel} : null), am: pr.fxBus.am || null, ps: pr.fxBus.pumpSrc, undo: Q.undoInfo ? Q.undoInfo() : null}; });
const J = x => JSON.stringify(x);
const R0 = await R(), S0 = await st();
ok('Analyse ändert nichts (Projekt und Klang)', S0.mix.every(m => m === null) && S0.am === null, S0.mix);
const R0b = await R(); ok('zweimal rendern ohne Übernahme: bitgleich', R0.h === R0b.h && R0.n === R0b.n, [R0.h, R0b.h]);
// 1. Bass-Kompressor
let r = await p.evaluate(() => window.SYNQUENZER.mixaApply(0, 'comp'));
await p.waitForTimeout(400); const S1 = await st(), N1 = await p.evaluate(() => window.SYNQUENZER.mixaInfo().nodes);
ok('Übernehmen: Bass-Kompressor in track.mix', r && S1.mix[0] && S1.mix[0].ra === 4 && S1.mix[0].at <= 5, S1.mix[0]);
ok('Übernehmen: live ein Spur-Knoten (nur Spur 1)', N1.tracks[0] && !N1.tracks[0].off && N1.tracks.slice(1).every(x => !x), N1.tracks);
const R1 = await R(); ok('Übernehmen: Klang geändert', R1.h !== R0.h, [R0.h, R1.h]);
r = await p.evaluate(() => window.SYNQUENZER.mixaRevert(0, 'comp'));
const S2 = await st(); ok('Zurück: Felder wie vorher', r && J(S2.mix) === J(S0.mix) && J(S2.fx) === J(S0.fx), S2.mix[0]);
const R2 = await R(); ok('Zurück: Render bitgleich zum Anfang', R2.h === R0.h, [R0.h, R2.h]);
await p.evaluate(() => window.SYNQUENZER.undo());
const S3 = await st(); ok('↶ nach Zurück: Kompressor wieder da (ein Schritt)', J(S3.mix) === J(S1.mix), S3.mix[0]);
const R3 = await R(); ok('↶: Render bitgleich zu „übernommen“', R3.h === R1.h, [R1.h, R3.h]);
await p.evaluate(() => window.SYNQUENZER.undo());
const S4 = await st(); ok('↶ ↶: wie am Anfang', J(S4.mix) === J(S0.mix));
await p.evaluate(() => window.SYNQUENZER.redo());
const S5 = await st(); ok('↷: wieder übernommen', J(S5.mix) === J(S1.mix));
await p.evaluate(() => { window.SYNQUENZER.undo(); });
// 2. Songteil-Pegel (Fläche: Intro +2 dB, Refrain −1,5 dB)
r = await p.evaluate(() => window.SYNQUENZER.mixaApply(2, 'sec'));
const S6 = await st(), R6 = await R([2]);
ok('Songteil-Pegel übernommen (track.mix.sec)', r && S6.mix[2] && S6.mix[2].sec && S6.mix[2].sec.M1 > 0, S6.mix[2]);
await p.evaluate(() => window.SYNQUENZER.undo()); const Rp = await R([2]); await p.evaluate(() => window.SYNQUENZER.redo());
ok('Songteil-Pegel hörbar (Fläche solo): Intro ≈ +2 dB, Refrain ≈ −1,5 dB', Math.abs(R6.intro - Rp.intro - 2) < 0.4 && Math.abs(R6.ref - Rp.ref + 1.5) < 0.4, {intro: +(R6.intro - Rp.intro).toFixed(2), refrain: +(R6.ref - Rp.ref).toFixed(2)});
await p.evaluate(() => window.SYNQUENZER.undo());
// 3. Pegel / Pan / Ducking (vorhandene Felder) + Alle übernehmen = ein Schritt
const before = await st();
r = await p.evaluate(() => window.SYNQUENZER.mixaAll());
const S7 = await st(), U7 = await p.evaluate(() => window.SYNQUENZER.undoInfo ? window.SYNQUENZER.undoInfo() : null);
ok('Alle übernehmen: mehrere Spuren geändert', r && S7.mix.filter(Boolean).length >= 3, S7.mix.map(m => (m ? Object.keys(m).join('+') : '-')));
ok('Alle übernehmen: Optionen (Ducking) nicht dabei', J(S7.fx.map(f => f && f.pump)) === J(before.fx.map(f => f && f.pump)));
await p.evaluate(() => window.SYNQUENZER.undo());
const S8 = await st(); ok('Alle übernehmen: ein ↶ stellt alles her', J(S8.mix) === J(before.mix) && J(S8.fx) === J(before.fx) && J(S8.am) === J(before.am), U7);
const R8 = await R(); ok('nach ↶: Render bitgleich zum Anfang (Knoten als Durchgang)', R8.h === R0.h, [R0.h, R8.h]);
// 4. Ducking-Option einzeln
r = await p.evaluate(() => window.SYNQUENZER.mixaApply(2, 'duck'));
const S9 = await st(); ok('Ducking Fläche ↔ Kick: Pumpen 30 %, Quelle KICK', r && S9.fx[2].pump === 0.3 && S9.ps === 'kick', S9.fx[2]);
await p.evaluate(() => window.SYNQUENZER.mixaRevert(2, 'duck'));
const S10 = await st(); ok('Ducking zurück', J(S10.fx) === J(S0.fx));
// 5. Speichern → Laden: mix + Auto-Master bleiben (deep-equal)
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.mixaApply(0, 'comp'); Q.mixaApply(0, 'kick'); Q.mixaApply(2, 'sec'); Q.mixaApply(2, 'hp'); });
await p.evaluate(() => window.SYNQUENZER.mixaMeasureAm(-14)); await p.evaluate(() => window.SYNQUENZER.amApply());
const A = await st();
const re = await p.evaluate(() => { const Q = window.SYNQUENZER, s = Q.serialize(); const ok1 = Q.importJSON(s); return {ok: ok1}; });
await p.waitForTimeout(400);
const B = await st();
ok('Speichern → Laden: track.mix und fxBus.am deep-equal', re.ok && J(A.mix) === J(B.mix) && J(A.am) === J(B.am) && J(A.fx) === J(B.fx), {a: A.am, b: B.am});
ok('keine Fehler', !errs.length, errs.slice(0, 3));
await close();
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN');
process.exit(failed() ? 1 : 0);
