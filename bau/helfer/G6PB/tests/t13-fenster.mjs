// G6P-13: Puffer-Länge = Fenster (±1 Block); v2-Fenster = v2-Ganzrechnung im Fenster (≤ 1e−6, auch mit G4-Quelle);
// v1-Fenster = v1-Ganzrechnung bitgleich (Kern-Nachweis: Fenster-Rechner ≡ G2-render auf v1-Plänen)
import {open, sing, melody, inject, chor, report} from './h.mjs';
const {br, p, errs} = await open(), rows = [];
const y = sing(melody(32), {beats: 32}), sr = 48000;
const tk = await inject(p, y, {bars: 8}), r = {t: tk.track, s: 0};
// v1 (4.25): Rezept Terz über die alte Funktion, dann Fenster-Rechnung mit dem v1-Plan
const ok1 = await p.evaluate(r => SYNQUENZER.g6Make(r, 'terz', 'up', '80'), r);
await p.evaluate(r => SYNQUENZER.g6Wait(r), r);
for (const [s0, s1] of [[3.13, 9.71], [0, 16]]) for (const c of [0, 1]) {
  const W = await p.evaluate(([r, c, s0, s1]) => SYNQUENZER.g6pbWinTest(r, 0, c, s0, s1, true), [r, c, s0, s1]);
  rows.push({id: 'G6P-13 v1', ok: ok1 && W.maxWinVsFull === 0 && W.maxWinVsV1 === 0 && W.maxFullVsV1 === 0 && W.len === W.want, msg: `Kopie ${c}, Fenster ${s0}–${s1} s: Fenster vs. ganz ${W.maxWinVsFull}, vs. v1-Puffer (g6Buf) ${W.maxWinVsV1}, ganz vs. v1 ${W.maxFullVsV1} (bitgleich = 0) · ${W.msWin} ms statt ${W.msFull} ms`});
}
// v2
await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, chor([{rule: 'st+2', dbl: [{ms: 12, ct: -6, p: -1}, {ms: 24, ct: 8, p: 1}]}, {rule: 'oct-1'}])]);
await p.evaluate(r => SYNQUENZER.g6pbBufs(r), r);
for (const [s0, s1] of [[2.02, 7.55], [5.5, 15.99]]) for (const [k, c] of [[0, 0], [0, 1], [1, 0]]) {
  const W = await p.evaluate(([r, k, c, s0, s1]) => SYNQUENZER.g6pbWinTest(r, k, c, s0, s1, false), [r, k, c, s0, s1]);
  rows.push({id: 'G6P-13 v2', ok: W.maxWinVsFull <= 1e-6 && W.len === W.want, msg: `Stimme ${k} Kopie ${c}, ${s0}–${s1} s: max |Δ| ${W.maxWinVsFull} (≤ 1e−6), Länge ${W.len}/${W.want} · ${W.msWin} ms statt ${W.msFull} ms`});
}
// Puffer-Länge = Fenster: Clip-Fenster des Lead-Stücks (in … out, ohne Anlauf/Ausklang hier)
const Wi = await p.evaluate(r => SYNQUENZER.g6pbWin(r, 0), r), B = await p.evaluate(r => SYNQUENZER.g6pbBuf(r, 0, 0, false), r);
rows.push({id: 'G6P-13 Länge', ok: Math.abs(B.n - (Wi.hw1 - Wi.hw0)) <= 128 && Math.abs(B.t0 - Wi.h0) < 1e-4, msg: `Puffer ${B.n} Samples ab ${B.t0.toFixed(4)} s, Fenster ${Wi.hw1 - Wi.hw0} (${Wi.h0.toFixed(3)}–${Wi.h1.toFixed(3)} s)`});
// v2 mit G4-Quelle (Teilton-Modell nur für die Strecken im Fenster)
await p.evaluate(() => SYNQUENZER.g4Preset()); await p.evaluate(() => SYNQUENZER.g4Wait(30000));
for (const [s0, s1] of [[2.02, 7.55]]) for (const [k, c] of [[0, 1], [1, 0]]) {
  const W = await p.evaluate(([r, k, c, s0, s1]) => SYNQUENZER.g6pbWinTest(r, k, c, s0, s1, false), [r, k, c, s0, s1]);
  rows.push({id: 'G6P-13 G4', ok: W.maxWinVsFull <= 1e-6 && W.len === W.want, msg: `mit G4: Stimme ${k} Kopie ${c}: max |Δ| ${W.maxWinVsFull} · ${W.msWin} ms statt ${W.msFull} ms`});
}
rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
report('G6P-13', rows); await br.close();
