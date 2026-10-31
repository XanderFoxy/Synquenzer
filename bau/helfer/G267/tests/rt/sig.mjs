// eigene Testsignale (unabhängig von test-signals.mjs): Formant-Stimme mit durchgehender Phase (Legato), Konsonanten als Rauschen
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const FMT = {a: [730, 1090, 2440], e: [530, 1840, 2480], i: [270, 2290, 3010], o: [570, 840, 2410], u: [300, 870, 2240], ae: [660, 1720, 2410]};
// phrases: [{t0, segs: [{d, f0, vowel}], glide (s), vib (Cent), consBefore: 's'|'t'|null}]  → Signal + Wahrheit
export function singer(sr, dur, phrases, o = {}) {
  const n = Math.round(dur * sr), x = new Float32Array(n), r = rng(o.seed || 11), truth = [], cons = [];
  for (const P of phrases) {
    let i0 = Math.round(P.t0 * sr);
    if (P.cons) {   // Konsonant vor der Phrase: s = 70 ms Zisch (HP-Rauschen), t = 6 ms Knall + 25 ms Stille
      const L = Math.round((P.cons === 's' ? 0.07 : 0.006) * sr), s0 = i0; let p1 = 0, p2 = 0;
      for (let i = 0; i < L; i++) { const w = r() * 2 - 1, h = w - 2 * p1 + p2; p2 = p1; p1 = w; x[s0 + i] += (P.cons === 's' ? 0.05 : 0.25) * Math.sin(Math.PI * i / L) * h; }
      cons.push([s0 / sr, (s0 + L) / sr, P.cons]);
      i0 = s0 + L + (P.cons === 't' ? Math.round(0.025 * sr) : 0);
    }
    const total = P.segs.reduce((s, q) => s + q.d, 0), N = Math.round(total * sr), att = Math.round(0.02 * sr), rel = Math.round(0.05 * sr);
    let ph = 0, acc0 = 0; const bounds = []; { let t = 0; for (const q of P.segs) { bounds.push(t); t += q.d; } }
    const amps = new Float64Array(80);
    for (let i = 0; i < N && i0 + i < n; i++) {
      const tt = i / sr; let k = 0; while (k + 1 < P.segs.length && tt >= bounds[k + 1]) k++;
      let lf = Math.log(P.segs[k].f0);
      const g = P.glide || 0.03;
      if (k + 1 < P.segs.length && tt > bounds[k + 1] - g / 2) { const u = (tt - (bounds[k + 1] - g / 2)) / g; lf = lf + (Math.log(P.segs[k + 1].f0) - lf) * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, u))); }
      if (k > 0 && tt < bounds[k] + g / 2) { const u = (tt - (bounds[k] - g / 2)) / g; const lp = Math.log(P.segs[k - 1].f0); lf = lp + (lf - lp) * (0.5 - 0.5 * Math.cos(Math.PI * u)); }
      const ts = tt - bounds[k], vib = (P.vib || 0) * Math.sin(2 * Math.PI * 5.2 * ts) * Math.min(1, Math.max(0, (ts - 0.1) / 0.15));
      const f = Math.exp(lf) * Math.pow(2, vib / 1200);
      if ((i & 31) === 0) { const F = FMT[P.segs[k].vowel || 'a'], H = Math.min(79, Math.floor(Math.min(9000, sr * 0.45) / f)); amps.fill(0); for (let h = 1; h <= H; h++) { const fh = h * f; let a = 0; for (let q = 0; q < 3; q++) a += [1, 0.5, 0.25][q] / (1 + ((fh - F[q]) / [70, 100, 130][q]) ** 2); amps[h] = (a + 0.015) / h ** 0.7; } }
      ph += 2 * Math.PI * f / sr; if (ph > 2 * Math.PI) ph -= 2 * Math.PI;
      let s = 0; for (let h = 1; h < 80 && amps[h]; h++) s += amps[h] * Math.sin(h * ph);
      const env = Math.min(1, i / att, (N - i) / rel);
      x[i0 + i] += 0.06 * (o.amp || 1) * env * s + 0.0008 * (r() * 2 - 1) * env;   // etwas Hauch
    }
    let t = i0 / sr; for (const q of P.segs) { truth.push({t0: t, t1: t + q.d, f0: q.f0, m: q.m, off: q.off, legato: P.segs.length > 1}); t += q.d; }
  }
  return {x, truth, cons};
}
