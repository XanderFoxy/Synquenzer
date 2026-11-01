// MIX-A Abnahme 3: Auto-Master trifft Ziel-LUFS ±0,5 und True-Peak ≤ −1 dBTP – im Video-Render und im GarageBand-Instrumental
// (Lautheit BS.1770-4 integriert; True-Peak unabhängig 16× überabgetastet mit 64 Stützstellen). Gleicher Zeitversatz wie ohne
// Auto-Master; Vorher/Nachher nur Hören (nicht gespeichert, kein Undo). node mixa-master.mjs [index.html]
import { open, buildSong, ok, failed, APP } from './mixa-lib.mjs';
const {p, errs, close} = await open(APP);
await buildSong(p, {});                        // ohne Gesang: das GarageBand-Instrumental ist derselbe Mix
const meas = which => p.evaluate(async which => {
  const Q = window.SYNQUENZER, D = Q.mixaCore(); let L, R, sr;
  if (which === 'video') { window.__reseed(); await Q.vvRender({}); const r = VV.last; L = r.ch[0]; R = r.ch[1]; sr = r.sr; }
  else {
    window.__reseed(); const g = await Q.ggbExport({pre: 0, remember: false}); const b = GGB.res.bytes, n = (b.length - 44) / 4, dv = new DataView(b.buffer, b.byteOffset + 44);
    L = new Float32Array(n); R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = dv.getInt16(i * 4, true) / 32767; R[i] = dv.getInt16(i * 4 + 2, true) / 32767; } sr = 48000;
  }
  // Zeitversatz: Kreuzkorrelation der ersten 3 s gegen den Render ohne Auto-Master (Versatz in Samples)
  let first = 0; const n3 = Math.min(L.length, sr * 3);
  if (which === 'video') { if (!window.__ref) window.__ref = L.slice(0, n3); else { const A = window.__ref; let best = -1e30; for (let lag = -40; lag <= 40; lag++) { let s = 0; for (let i = 100; i < n3 - 100; i++) s += A[i] * L[i + lag]; if (s > best) { best = s; first = lag; } } } }
  return {I: +D.integ(D.kblocks([L, R], sr)).toFixed(2), tp: +D.truePeak([L, R], 16, 64).toFixed(2), sp: +(20 * Math.log10(Math.max(...[L, R].map(x => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0))))).toFixed(2), first, sr, sec: +(L.length / sr).toFixed(2)};
}, which);
const ohne = await meas('video');
ok('ohne Auto-Master: Ausgangslage gemessen', isFinite(ohne.I), ohne);
for (const z of [-14, -9]) {
  const t0 = Date.now(); await p.evaluate(z => window.SYNQUENZER.mixaMeasureAm(z), z); const ms = Date.now() - t0;
  const am = await p.evaluate(() => window.SYNQUENZER.mixaInfo().am);
  ok(`${z} LUFS: Vorschlag (Worker, ${ms} ms)`, am && am.P && am.ziel === z && Math.abs(am.P.info.lout - z) <= 0.1, am && am.P);
  const un = await p.evaluate(() => window.SYNQUENZER.mixaInfo().amOn);
  ok(`${z} LUFS: Messen ändert nichts`, z === -9 || un === null, un);
  await p.evaluate(() => window.SYNQUENZER.amApply());
  const v = await meas('video');
  ok(`${z} LUFS: Video-Render trifft das Ziel ±0,5`, Math.abs(v.I - z) <= 0.5, v);
  ok(`${z} LUFS: Video-Render True-Peak ≤ −1 dBTP (16×)`, v.tp <= -1.0, v.tp);
  ok(`${z} LUFS: gleicher Zeitversatz wie ohne Auto-Master (Kreuzkorrelation ±1 Sample)`, Math.abs(v.first) <= 1, v.first + ' Samples');
  const g = await meas('gb');
  ok(`${z} LUFS: GarageBand-Instrumental trifft das Ziel ±0,5`, Math.abs(g.I - z) <= 0.5, g);
  ok(`${z} LUFS: GarageBand-Instrumental True-Peak ≤ −1 dBTP (16×)`, g.tp <= -1.0, g.tp);
}
// Vorher/Nachher: nur Hören
const u0 = await p.evaluate(() => JSON.stringify([window.SYNQUENZER.undoInfo(), window.SYNQUENZER.project().fxBus]));
await p.evaluate(() => window.SYNQUENZER.amAB(true)); await p.waitForTimeout(100);
const ab = await p.evaluate(() => ({ab: window.SYNQUENZER.mixaInfo().ab, ga: AU.M.am.ga.gain.value, gb: AU.M.am.gb.gain.value}));
const u1 = await p.evaluate(() => JSON.stringify([window.SYNQUENZER.undoInfo(), window.SYNQUENZER.project().fxBus]));
ok('Vorher/Nachher: Vorher = Limiter-Weg, nicht gespeichert, kein Undo', ab.ab && ab.ga > 0.9 && ab.gb < 0.1 && u0 === u1, ab);
const vr = await meas('video');
ok('Video ignoriert „Vorher“ (spielt den Auto-Master)', Math.abs(vr.I - -9) <= 0.5, vr.I);
await p.evaluate(() => window.SYNQUENZER.amAB(false));
await p.evaluate(() => window.SYNQUENZER.amOff());
const aus = await meas('video');
ok('Aus: zurück zur Ausgangslage (±0,2 LU)', Math.abs(aus.I - ohne.I) <= 0.2, [ohne.I, aus.I]);
await p.evaluate(() => window.SYNQUENZER.undo());
const wieder = await p.evaluate(() => window.SYNQUENZER.project().fxBus.am);
ok('↶ nach Aus: Auto-Master wieder an', wieder && wieder.on && wieder.ziel === -9, wieder);
ok('keine Fehler', !errs.length, errs.slice(0, 3));
await close();
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN');
process.exit(failed() ? 1 : 0);
