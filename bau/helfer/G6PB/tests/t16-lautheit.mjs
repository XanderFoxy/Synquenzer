// G6P-16: Lautheit im Worker = Messung am Ausgang (± 0,2 LU) für alle 9 Stile, ohne Kalibrier-Konstante, bei 48 und 44,1 kHz.
// Ausgang = dieselbe Offline-Mischung (Versatz, Pegel, Pan, Gruppen-Klang) × gA, gemessen mit einer unabhängigen BS.1770-Messung.
import {open, sing, melody, inject, report} from './h.mjs';
import {chorOf, STYLES} from './styles.mjs';
import {lufsRef} from './lu-ref.mjs';
const rows = [], NORM = {b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [1, -1.69065929318241, 0.73248077421585], b2: [1, -2, 1], a2: [1, -1.99004745483398, 0.99007225036621]};
for (const sr of [48000, 44100]) {
  const {br, p, errs} = await open();
  if (sr === 48000) {
    const K = await p.evaluate(() => SYNQUENZER.g6pbK(48000));
    const d = Math.max(...[...K[0].b.map((v, i) => Math.abs(v - NORM.b[i])), ...K[0].a.map((v, i) => Math.abs(v - NORM.a[i])), ...K[1].a.map((v, i) => Math.abs(v - NORM.a2[i]))]);
    rows.push({id: 'G6P-16 K', ok: d < 1e-9, msg: `K-Beiwerte 48 kHz gegen die Tabelle der Norm: max |Δ| ${d.toExponential(1)}`});
  }
  const tk = await inject(p, sing(melody(16), {beats: 16, sr}), {bars: 4, sr}), r = {t: tk.track, s: 0};
  for (const name of Object.keys(STYLES)) {
    const c = chorOf(name);
    await p.evaluate(([r, c]) => SYNQUENZER.g6pbSet(r, c), [r, c]);
    const ok = await p.evaluate(r => SYNQUENZER.g6pbWait(r, 60000), r);
    const G = await p.evaluate(r => SYNQUENZER.g6pbGA(r), r), M = await p.evaluate(r => SYNQUENZER.g6pbChorMix(r), r);
    const Ll = lufsRef([M.lead], M.sr), g = G.g, Lc = lufsRef([M.L.map(v => v * g), M.R.map(v => v * g)], M.sr), dist = Ll - Lc, below = c.grp.below;
    rows.push({id: `G6P-16 ${sr / 1000} kHz ${name}`, ok: ok && Math.abs(dist - below) <= 0.2 && Math.abs(G.m.Ll - Ll) <= 0.1, msg: `Abstand gemessen ${dist.toFixed(2)} LU (Soll ${below} ± 0,2) · Worker Lead ${G.m.Ll.toFixed(2)} / Prüf ${Ll.toFixed(2)} LUFS · gA ${(20 * Math.log10(g)).toFixed(2)} dB`});
  }
  rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
  await br.close();
}
report('G6P-16', rows);
