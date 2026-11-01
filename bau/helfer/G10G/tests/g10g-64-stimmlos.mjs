// G10-64: Stimmlose Strecken bei Hart 100 % bitgleich zum Original (Sample-Vergleich außerhalb der stimmhaften Fenster).
// Take: schiefe Vokale + Zischlaute (s) dazwischen. Hart 100 % (v = 2) → gehörte Fassung vs. Original (A/B, dieselbe Kette ohne Tonhöhe): jede Probe in den Zischlauten und
// Pausen gleich; die Vokale sind verschoben (sonst wäre der Test leer). Die Schraffur (stimmlose Teile) deckt die Zischlaute.
import {launch, open, takeIn, edOpen, sleep, ok, done, SR} from './lib.mjs';
const br = await launch(), p = await open(br, 428, 926);
const mel = [64.4, 65.6, 67.4, 62.6, 60.4, 64.6].map(m => ({m, d: 0.3}));
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref);
await p.evaluate(r => SYNQUENZER.g10gRt(r, 0), T.ref);   // Einrast-Zeit 0 ms: härteste Einstellung
// Original = dieselbe Kette ohne Tonhöhe (A/B), gehört = mit Tonhöhe
await p.evaluate(() => SYNQUENZER.g2AB(true)); const ab = await p.evaluate(r => SYNQUENZER.g2Played(r), T.ref);
await p.evaluate(() => SYNQUENZER.g2AB(false)); const pl = await p.evaluate(r => SYNQUENZER.g2Played(r), T.ref), raw = ab.data;
ok(pl && ab && pl.n === ab.n, `gehörte Fassung und Original (A/B) gleich lang: ${pl && pl.n} Proben`);
let diffS = 0, nS = 0, diffV = 0, nV = 0;
for (const m of T.V.marks) {
  const a = Math.round(m.t0 * SR), b = Math.round(m.t1 * SR);
  if (m.kind === 's') for (let i = a; i < b; i++) { nS++; if (pl.data[i] !== raw[i]) diffS++; }
  else for (let i = a + 0.05 * SR; i < b - 0.05 * SR; i++) { nV++; if (pl.data[i] !== raw[i]) diffV++; }
}
// Pausen vor dem ersten Laut und nach dem letzten
let diffP = 0, nP = 0; const first = Math.round(T.V.marks[0].t0 * SR), last = Math.round(T.V.marks[T.V.marks.length - 1].t1 * SR);
for (let i = 0; i < first; i++) { nP++; if (pl.data[i] !== raw[i]) diffP++; } for (let i = last + 0.02 * SR; i < raw.length; i++) { nP++; if (pl.data[i] !== raw[i]) diffP++; }
ok(nS > 10000 && diffS === 0, `Zischlaute: ${nS} Proben, ${diffS} anders (bitgleich)`);
ok(nP > 10000 && diffP === 0, `Pausen: ${nP} Proben, ${diffP} anders (bitgleich)`);
ok(nV > 0 && diffV / nV > 0.9, `Vokale verschoben: ${(100 * diffV / nV).toFixed(1)} % der Proben anders`);
const U = await p.evaluate(r => SYNQUENZER.g10gUnvoiced(r), T.ref);
const sm = T.V.marks.filter(m => m.kind === 's'), cov = sm.filter(m => U.some(([a, b]) => Math.min(b, m.t1) - Math.max(a, m.t0) >= 0.5 * (m.t1 - m.t0))).length;
const inV = T.V.marks.filter(m => m.kind === 'v').filter(m => U.some(([a, b]) => Math.min(b, m.t1 - .05) - Math.max(a, m.t0 + .05) > 0.02)).length;
ok(cov === sm.length && inV === 0, `Schraffur: ${cov}/${sm.length} Zischlaute markiert, ${inV} Vokale fälschlich schraffiert · ${U.length} Strecken`);
await p.screenshot({path: new URL('./bilder/schraffur-428x926.png', import.meta.url).pathname});
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
