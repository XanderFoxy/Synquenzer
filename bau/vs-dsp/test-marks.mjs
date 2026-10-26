// test-marks.mjs — VS5a Marken, Quantisieren, Zeitkarte, Scheiben, Songtext: node test-marks.mjs
import * as MK from './marks.mjs';
import * as T from './test-signals.mjs';
import {suite} from './test-util.mjs';

const {check, info, done} = suite('VS5a marks');
const sr = 48000;

// 1. Marken auf synthetischen Silben (Konsonant-Stöße, Vokale mit Formanten und Vibrato, Bindungen, Pausen)
for (const snr of [35, 20]) {
  let hits = 0, tot = 0, extra = 0, inSil = 0, legHit = 0, legTot = 0; const errs = [];
  for (const seed of [1, 2, 3, 4]) {
    const S = T.song(sr, 30, {seed});
    const nz = T.noise(sr, 30, T.rms(S.x) * Math.pow(10, -snr / 20), seed + 9);
    const x = new Float32Array(S.x.length); for (let i = 0; i < x.length; i++) x[i] = S.x[i] + nz[i];
    const M = MK.detectMarks(x, sr), used = new Uint8Array(M.length);
    for (const nt of S.notes) {
      tot++; if (nt.legato) legTot++;
      let b = -1, bd = 0.03; M.forEach((m, k) => { const d = Math.abs(m.t - nt.t); if (!used[k] && d <= bd) { bd = d; b = k; } });
      if (b >= 0) { hits++; used[b] = 1; errs.push((M[b].t - nt.t) * 1000); if (nt.legato) legHit++; }
    }
    extra += used.length - used.reduce((a, v) => a + v, 0);
    for (const m of M) for (const [a, b] of S.silences) if (m.t > a + 0.03 && m.t < b - 0.03) inSil++;
  }
  errs.sort((a, b) => a - b);
  const rate = hits / tot * 100;
  check(`Marken SNR ${snr} dB: Trefferquote ≥ 90 % in ±30 ms`, rate >= 90, `${rate.toFixed(1)} % (${hits}/${tot}), Bindungen ${legHit}/${legTot}, Fehler Median ${errs[errs.length >> 1].toFixed(1)} ms, 90 % in ${Math.max(-errs[Math.floor(errs.length * 0.05)], errs[Math.floor(errs.length * 0.95)]).toFixed(1)} ms`);
  check(`Marken SNR ${snr} dB: keine Marke in der Stille`, inSil === 0, inSil);
  info(`Marken SNR ${snr} dB: Zusatz-Marken`, extra + ' (von ' + tot + ')');
}
{ // reines Rauschen, Stille, Brummen → keine Marken
  const nz = T.noise(sr, 5, 0.01, 77), z = new Float32Array(5 * sr), hum = new Float32Array(5 * sr).map((_, i) => 0.05 * Math.sin(2 * Math.PI * 50 * i / sr));
  check('Nur Rauschen / Stille / Brummen: 0 Marken', [nz, z, hum].every(x => MK.detectMarks(x, sr).length === 0), [nz, z, hum].map(x => MK.detectMarks(x, sr).length));
}

// 2. Quantisieren (C.5 Nr. 3, 4; N7V-26)
{
  const bpm = 120, spb = 0.5, r = T.rng(9), step16 = spb / 4;
  const grid = [], marks = [];
  for (let k = 1; k < 120; k++) { if (r() < 0.4) continue; grid.push(k * step16); marks.push(k * step16 + (r() - 0.5) * 0.7 * step16); }   // ±35 % Raster
  const q1 = MK.quantizeMarks(marks, {bpm, grid: '1/16', strength: 1});
  let maxErr = 0; q1.times.forEach((t, k) => { maxErr = Math.max(maxErr, Math.abs(Math.round(t * sr) - Math.round(grid[k] * sr))); });
  check('N7V-26 Stärke 100 %: alle Marken ±1 Sample auf dem Raster', maxErr <= 1, maxErr + ' Samples');
  const q5 = MK.quantizeMarks(marks, {bpm, grid: '1/16', strength: 0.5});
  let maxHalf = 0; q5.times.forEach((t, k) => { maxHalf = Math.max(maxHalf, Math.abs(Math.round(t * sr) - Math.round((marks[k] + grid[k]) / 2 * sr))); });
  check('N7V-26 Stärke 50 % = halber Weg (±1 Sample)', maxHalf <= 1, maxHalf + ' Samples');
  const q0 = MK.quantizeMarks(marks, {bpm, grid: '1/16', strength: 0});
  check('Stärke 0 % = unverändert', q0.times.every((t, k) => t === marks[k]));
  const ord = ts => { for (let k = 1; k < ts.length; k++) if (!(ts[k] > ts[k - 1])) return false; return true; };
  check('Reihenfolge bleibt (100 %, 50 %)', ord(q1.times) && ord(q5.times));
  // Fangfenster ±40 %: eine Marke bei 45 % bleibt (gewollter Offbeat)
  const off = [0.5, 0.5 + 0.45 * step16, 1.0 + 0.1 * step16], qo = MK.quantizeMarks(off, {bpm, grid: '1/16', strength: 1});
  check('Fangfenster ±40 %: Marke bei 45 % bleibt, bei 10 % rückt', qo.times[1] === off[1] && Math.abs(qo.times[2] - 1.0) < 1e-12, Array.from(qo.times));
  // Kollision: zwei Marken am selben Rasterpunkt → Reihenfolge bleibt, die nähere rückt
  const col = [1.0 - 0.02, 1.0 + 0.01], qc = MK.quantizeMarks(col, {bpm, grid: '1/16', strength: 1});
  check('Kollision: Reihenfolge bleibt, nähere Marke rückt', qc.times[1] > qc.times[0] && Math.abs(qc.times[1] - 1.0) < 1e-12 && qc.times[0] === col[0], Array.from(qc.times));
  // Triolen und Swing
  const tri = [], triM = []; for (let k = 1; k < 40; k++) { tri.push(k * spb / 3); triM.push(k * spb / 3 + (r() - 0.5) * 0.02); }
  const qt = MK.quantizeMarks(triM, {bpm, grid: '1/8T'}); let mt = 0; qt.times.forEach((t, k) => { mt = Math.max(mt, Math.abs(t - tri[k])); });
  check('Raster 1/8T', mt * sr <= 1, (mt * sr).toFixed(2) + ' Samples');
  const sw = MK.quantizeMarks([0.25 * spb * 2 + 0.01], {bpm, grid: '1/8', swing: 0.66}); // ungerader Achtel-Schritt (k=1) wird verschoben
  check('Swing 66 %: ungerade Achtel später', Math.abs(sw.times[0] - (0.5 * spb + 0.16 * 2 * 0.5 * spb)) < 1e-9, sw.times[0]);
  // Auto-Raster
  const e8 = []; for (let k = 0; k < 32; k++) if (r() < 0.8) e8.push(k * spb / 2 + (r() - 0.5) * 0.02);
  const t8 = []; for (let k = 0; k < 36; k++) t8.push(k * spb / 3 + (r() - 0.5) * 0.012);
  const a8 = MK.quantizeMarks(e8, {bpm, grid: 'auto'}), aT = MK.quantizeMarks(t8, {bpm, grid: 'auto'});
  check('Auto-Raster: Achtel → 1/8, Triolen → 1/8T', a8.grid === '1/8' && aT.grid === '1/8T', [a8.grid, aT.grid]);
  // t0: Take beginnt nicht auf Schlag 0
  const qs = MK.quantizeMarks([1.13 + 0.02], {bpm, grid: '1/4', t0: 0.13});
  check('Bezug t0 (Take-Beginn ≠ Schlag 0)', Math.abs(qs.times[0] - 1.13) < 1e-12, qs.times[0]);
}

// 3. Zeitkarte warp.map
{
  const w = MK.makeWarp([1, 2, 1.5, 3, 3], [1.1, 1.9, 1.95, 3.2, 3.3], 4);
  let mono = true; for (let k = 1; k < w.src.length; k++) if (!(w.src[k] > w.src[k - 1] && w.dst[k] > w.dst[k - 1])) mono = false;
  check('makeWarp: streng steigend, rückläufige Paare verworfen, 0 und Ende dabei', mono && w.src[0] === 0 && w.src[w.src.length - 1] === 4 && w.src.length === 5, Array.from(w.src));
  let rt = 0; for (let t = 0; t <= 4; t += 0.0137) rt = Math.max(rt, Math.abs(MK.warpInverse(w, MK.warpTime(w, t)) - t));
  check('warpTime/warpInverse Rundweg', rt < 1e-12, rt);
  check('warpTime stückweise linear an den Marken', MK.warpTime(w, 2) === 1.9 && Math.abs(MK.warpTime(w, 1.5) - 1.5) < 1e-12);
  const j = JSON.parse(JSON.stringify(MK.warpToJSON(w))), w2 = MK.warpFromJSON(j);
  check('warp JSON-Rundweg deep-equal', Array.from(w2.src).join() === Array.from(w.src).join() && Array.from(w2.dst).join() === Array.from(w.dst).join());
  check('warpIsIdentity', MK.warpIsIdentity(MK.makeWarp([1, 2], [1, 2], 3)) && !MK.warpIsIdentity(w));
}

// 4. Modus Scheiben (N7V-27): Klickfolge quantisieren
{
  const n = 12 * sr, x = new Float32Array(n), r = T.rng(31), bpm = 120, spb = 0.5;
  const ons = [];
  for (let k = 2; k < 44; k++) { const t = k * spb / 2 + (r() - 0.5) * 0.06; ons.push(t); }
  for (const t of ons) { const i0 = Math.round(t * sr); for (let k = 0; k < 0.08 * sr; k++) x[i0 + k] += 0.7 * Math.exp(-k / (0.012 * sr)) * (Math.sin(2 * Math.PI * 180 * k / sr) + 0.5 * T.gauss(r) * Math.exp(-k / (0.002 * sr))); }
  for (let i = 0; i < n; i++) x[i] += 1e-4 * T.gauss(r);
  const M = MK.detectMarks(x, sr, {pitch: false}), mt = M.map(m => m.t);
  let found = 0; for (const t of ons) if (mt.some(m => Math.abs(m - t) <= 0.005)) found++;
  check('Klickfolge: Flux-Einsätze ±5 ms gefunden', found === ons.length, `${found}/${ons.length}`);
  const q = MK.quantizeMarks(mt, {bpm, grid: '1/8', strength: 1});
  const y = MK.renderSlices(x, sr, mt, q.times);
  let maxDb = 0, bitOk = 0, nk = 0;
  for (let k = 0; k < mt.length; k++) {
    const s = Math.round(mt[k] * sr), d = Math.round(q.times[k] * sr), len = Math.round(0.06 * sr);
    let px = 0, py = 0; for (let i = 0; i < len; i++) { px = Math.max(px, Math.abs(x[s + i])); py = Math.max(py, Math.abs(y[d + i])); }
    maxDb = Math.max(maxDb, Math.abs(20 * Math.log10(py / px))); nk++;
    let same = true; for (let i = 0; i < len; i++) if (y[d + i] !== x[s + i]) { same = false; break; }
    if (same) bitOk++;
  }
  check('N7V-27 Spitzenpegel je Klick ±0,1 dB', maxDb <= 0.1, maxDb.toFixed(4) + ' dB');
  check('N7V-27 Anschläge bitgleich (60 ms ab Einsatz)', bitOk === nk, `${bitOk}/${nk}`);
  const cuts = MK.sliceCuts(x, sr, mt); let zcOk = 0;
  for (let k = 0; k < cuts.length; k++) { const c = cuts[k], on = Math.round(mt[k] * sr); if (on - c >= 0.001 * sr && on - c <= 0.0051 * sr) zcOk++; }
  check('Schnitt 3 ms (±2 ms) vor dem Einsatz', zcOk === cuts.length, `${zcOk}/${cuts.length}`);
  const y0 = MK.renderSlices(x, sr, mt, mt);
  check('Scheiben Stärke 0 % = bitgleich', y0.every((v, i) => v === x[i]));
  check('Scheiben: Ausgabe endlich', y.every(Number.isFinite));
}

// 5. Songtext (N7V-30)
{
  const a = MK.assignLyrics('Lie-be ist ein Feu-er', 6), b = MK.assignLyrics('Lie-be ist ein Feu-er', 5), c = MK.assignLyrics('Lie-be', 4);
  check('N7V-30 6 Marken: eine Silbe je Marke', a.labels.join('|') === 'Lie|be|ist|ein|Feu|er' && a.extra.length === 0, a.labels);
  check('N7V-30 5 Marken: „er“ übrig (rot)', b.extra.join() === 'er', b.extra);
  check('Fehlende Silben als „·“', c.labels.join('') === 'Liebe··', c.labels);
  const marks = [0.51, 1.02, 1.49, 2.03, 2.47, 3.01], q = MK.quantizeMarks(marks, {bpm: 120, grid: '1/8'});
  check('Text bleibt nach Quantisieren an seiner Marke (Reihenfolge = Index)', q.times.every((t, k) => k === 0 || t > q.times[k - 1]));
}

// 6. srcText und Rechenzeit
{
  const api = (0, eval)(MK.srcText()), S = T.song(sr, 8, {seed: 5});
  const a = MK.detectMarks(S.x, sr), b = api.detectMarks(S.x, sr);
  check('srcText() eingebettet = Modul', JSON.stringify(a) === JSON.stringify(b), MK.srcText().length + ' Zeichen');
  const L = T.song(sr, 60, {seed: 6}), nz = T.noise(sr, 60, T.rms(L.x) * 0.02, 7); for (let i = 0; i < L.x.length; i++) L.x[i] += nz[i];
  const t0 = performance.now(); const M = MK.detectMarks(L.x, sr); const ms = performance.now() - t0;
  const t1 = performance.now(); const q = MK.quantizeMarks(M.map(m => m.t), {bpm: 100, grid: 'auto'}); MK.renderSlices(L.x, sr, M.map(m => m.t), q.times); const ms2 = performance.now() - t1;
  info('Rechenzeit 60 s @ 48 kHz', {detectMarksMs: Math.round(ms), quantizePlusSlicesMs: Math.round(ms2), marks: M.length, rtPct: +(ms / 600).toFixed(2)});
  check('Rechenzeit Marken 60 s < 5 s', ms < 5000, Math.round(ms) + ' ms');
}
done();
