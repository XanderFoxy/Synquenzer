// VS-P Mess-Bibliothek: ITU-R BS.1770-4 Lautheit (K-Filter, 400-ms-Blöcke, 75 % Überlappung, Gate −70 / −10 LU), wahre Spitze (4× Überabtastung)
export function kco(fs) {
  let f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196, K = Math.tan(Math.PI * f0 / fs), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
  let a0 = 1 + K / Q + K * K; const s = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0];
  f0 = 38.13547087602444; Q = 0.5003270373238773; K = Math.tan(Math.PI * f0 / fs); a0 = 1 + K / Q + K * K;
  return [s, [2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]];
}
// 100-ms-Viertelblöcke: Summe der K-gefilterten Quadrate je Kanal
export function kq(d, fs) {
  const [[b0, b1, b2, a1, a2], [c1, c2]] = kco(fs), Q = Math.round(fs * 0.1), nq = Math.floor(d.length / Q), e = new Float64Array(nq);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, z1 = 0, z2 = 0;
  for (let q = 0, i = 0; q < nq; q++) {
    let acc = 0;
    for (const end = i + Q; i < end; i++) {
      const x = d[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x;
      const z = y - 2 * y1 + y2 - c1 * z1 - c2 * z2; y2 = y1; y1 = y; z2 = z1; z1 = z; acc += z * z;
    }
    e[q] = acc / Q;
  }
  return e;
}
// chans: [Float32Array…] → integrierte Lautheit (LUFS) + Blöcke
export function lufs(chans, fs) {
  const qs = chans.map(c => kq(c, fs)), nq = Math.min(...qs.map(q => q.length)), bl = [];
  for (let k = 0; k + 4 <= nq; k++) { let s = 0; for (const q of qs) s += (q[k] + q[k + 1] + q[k + 2] + q[k + 3]) / 4; bl.push(s); }
  const L = z => -0.691 + 10 * Math.log10(z + 1e-30);
  let g = bl.filter(z => L(z) > -70); if (!g.length) return {lufs: -Infinity, blocks: 0};
  const rel = L(g.reduce((a, b) => a + b, 0) / g.length) - 10; g = g.filter(z => L(z) > rel);
  return {lufs: +L(g.reduce((a, b) => a + b, 0) / g.length).toFixed(2), blocks: g.length, of: bl.length};
}
// wahre Spitze: 4× Überabtastung, Kaiser-gefensterter Sinc (48 Abgriffe je Phase)
const TP = (() => { const N = 48, out = []; const I0 = x => { let s = 1, t = 1; for (let k = 1; k < 30; k++) { t *= (x / 2 / k) ** 2; s += t; } return s; }; const beta = 8;
  for (let ph = 0; ph < 4; ph++) { const h = new Float64Array(N); for (let j = 0; j < N; j++) { const t = j - N / 2 + 1 - ph / 4, w = I0(beta * Math.sqrt(Math.max(0, 1 - (t / (N / 2)) ** 2))) / I0(beta); h[j] = (t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t)) * w; } out.push(h); } return out; })();
export function truePeakDb(chans) {
  let pk = 0;
  for (const d of chans) { for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; }
    for (let i = 24; i < d.length - 24; i++) { if (Math.abs(d[i]) < pk * 0.5) continue; for (let ph = 1; ph < 4; ph++) { const h = TP[ph]; let s = 0; for (let j = 0; j < 48; j++) s += h[j] * d[i - 23 + j]; const a = Math.abs(s); if (a > pk) pk = a; } } }
  return +(20 * Math.log10(pk + 1e-12)).toFixed(2);
}
export const rmsDbF = (d, a = 0, b = d.length) => { let s = 0; for (let i = a; i < b; i++) s += d[i] * d[i]; return +(10 * Math.log10(s / Math.max(1, b - a) + 1e-20)).toFixed(2); };
// natürlich gesungener Vokal: Phrasen mit Pausen, Vibrato, Formanten (Quelle-Filter), Atem-Hüllkurve, leises Rauschen; rms = Ziel in dBFS (über die stimmhaften Teile)
export function sung(sec, sr, rmsDb, o = {}) {
  const n = Math.round(sec * sr), y = new Float32Array(n); let seed = o.seed || 4711; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const notes = o.notes || [57, 60, 62, 64, 62, 60, 59, 57, 60, 64, 65, 64, 62, 60, 62, 57], dur = o.noteSec || 0.9, gap = o.gapSec || 0.35, phr = o.phrase || 4;
  // Formant-Resonatoren (a: 700/1220/2600 Hz)
  const F = [[700, 130, 1], [1220, 70, 0.5], [2600, 160, 0.25]].map(([f, bw, g]) => { const r = Math.exp(-Math.PI * bw / sr), th = 2 * Math.PI * f / sr; return {a1: -2 * r * Math.cos(th), a2: r * r, g: g * (1 - r), y1: 0, y2: 0}; });
  let t = 0.4, ph = 0, k = 0; const voiced = new Uint8Array(n);
  const segs = []; while (t < sec - 0.5) { const m = notes[k % notes.length]; segs.push([t, t + dur, 440 * Math.pow(2, (m - 69) / 12), 0.7 + 0.3 * ((k * 37) % 7) / 6]); t += dur + ((k + 1) % phr === 0 ? gap * 3 : 0.04); k++; }
  let si = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / sr; while (si < segs.length && tt > segs[si][1]) si++;
    let src = 0;
    const s = segs[si];
    if (s && tt >= s[0]) {
      const u = tt - s[0], L = s[1] - s[0], env = Math.min(1, u / 0.06) * Math.min(1, (L - u) / 0.08) * s[3] * (1 + 0.08 * Math.sin(2 * Math.PI * 0.7 * tt));
      const f = s[2] * (1 + 0.012 * Math.sin(2 * Math.PI * 5.3 * tt) * Math.min(1, u / 0.3));
      ph += f / sr; if (ph >= 1) ph -= 1;
      src = env * ((2 * ph - 1) - 0.5 * Math.sin(2 * Math.PI * ph)) + env * 0.02 * rnd(); voiced[i] = env > 0.3 ? 1 : 0;
    }
    let out = 0; for (const r of F) { const v = r.g * src - r.a1 * r.y1 - r.a2 * r.y2; r.y2 = r.y1; r.y1 = v; out += v; }
    y[i] = out;
  }
  let ss = 0, nv = 0; for (let i = 0; i < n; i++) if (voiced[i]) { ss += y[i] * y[i]; nv++; }
  const g = Math.pow(10, rmsDb / 20) / Math.sqrt(ss / nv);
  for (let i = 0; i < n; i++) y[i] = y[i] * g + (o.noise == null ? 0.0003 : o.noise) * rnd();
  return {y, voiced};
}
