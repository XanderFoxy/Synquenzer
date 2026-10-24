// QA VS2b (acceptance lens): independent singing synthesizer (glottal source + cascade formant resonators, jitter/shimmer,
// aspiration, consonant onsets, small room reverb, background noise). Different from the builder's per-harmonic-gain corpus.
export function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const VOW = {a: [730, 1090, 2440, 3400], o: [570, 840, 2410, 3400], e: [530, 1840, 2480, 3500], i: [300, 2200, 3000, 3600], u: [320, 870, 2240, 3400]};
const BW = [80, 100, 140, 200];
const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * u);
/* notes: {on (s), dur (s), midi, glide (s, legato from previous, centred on .on), scoop [st (+ = from below), s], fall [st, s, dB],
   vib {ct, hz, delay, jit}, cons ('', 'l', 'd', 'n', 's'), vowel} ; o: {fs, voice: 'male'|'female', seed, snr, rev, sigma (ct)} */
export function sing(notes, o = {}) {
  const fs = o.fs || 16000, r = rng((o.seed || 1) * 104729 + 7), fsc = o.voice === 'female' ? 1.17 : 1;
  const last = notes[notes.length - 1], end = last.on + last.dur + 0.6, N = Math.ceil(end * fs);
  const P = notes.map((n, k) => ({...n, k, tgt: n.midi + (o.sigma ? (r() - 0.5) * 2 * o.sigma / 100 : 0), vp: r() * 6.283, vw: n.vowel || 'aoeiu'[Math.floor(r() * 5)]}));
  // per-note voiced span [s, e): legato notes start at the previous note's end
  for (let k = 0; k < P.length; k++) { const p = P[k], nx = P[k + 1]; p.s = p.glide ? p.on - p.glide / 2 : p.on; p.leg = !!(nx && nx.glide); p.e = p.leg ? nx.on - nx.glide / 2 : p.on + p.dur - 0.03; }
  const pitch = new Float64Array(N).fill(NaN), amp = new Float64Array(N), F = [new Float64Array(N), new Float64Array(N), new Float64Array(N), new Float64Array(N)], nas = new Float64Array(N), hiss = new Float64Array(N);
  // slow jitter components
  const jph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28], sph = [r() * 6.28, r() * 6.28];
  for (const p of P) {
    const i0 = Math.max(0, Math.round(p.s * fs)), i1 = Math.min(N, Math.round(p.e * fs)), prv = P[p.k - 1];
    const vv = VOW[p.vw], vprev = prv ? VOW[prv.vw] : vv;
    let cons = p.glide ? '' : (p.cons || ''), cOff = 0;
    if (cons === 's') { const h0 = Math.max(0, i0 - Math.round(0.08 * fs)); for (let i = h0; i < i0; i++) hiss[i] = 0.25 * sm((i - h0) / (0.02 * fs)); }
    if (cons === 'd') { for (let i = Math.max(0, i0 - Math.round(0.012 * fs)); i < i0; i++) hiss[i] = 0.6 * Math.exp(-(i0 - i) / (0.003 * fs)); }
    for (let i = i0; i < i1; i++) {
      const t = i / fs, tn = t - p.on; let m = p.tgt;
      if (p.glide && t < p.on + p.glide / 2) m = prv.tgt + (p.tgt - prv.tgt) * sm((t - p.s) / p.glide);
      if (p.scoop) m -= p.scoop[2] === 'exp' ? p.scoop[0] * Math.exp(-3 * (t - p.s) / p.scoop[1]) : p.scoop[0] * (1 - sm((t - p.s) / p.scoop[1]));
      if (p.fall && !p.leg) m -= p.fall[0] * sm((t - (p.e - p.fall[1])) / p.fall[1]);
      if (p.vib && tn > p.vib.delay) { const v = p.vib, ramp = Math.min(1, (tn - v.delay) / 0.12), j = v.jit || 0;
        const rate = v.hz * (1 + j * 0.15 * Math.sin(2 * Math.PI * 0.7 * t + p.vp)), ext = v.ct * (1 + j * 0.3 * Math.sin(2 * Math.PI * 0.45 * t + 2 * p.vp));
        p._vph = (p._vph == null ? p.vp : p._vph) + 2 * Math.PI * rate / fs; m += ext / 100 * ramp * Math.sin(p._vph); }
      m += (0.025 * Math.sin(2 * Math.PI * 7.3 * t + jph[0]) + 0.015 * Math.sin(2 * Math.PI * 13.1 * t + jph[1]) + 0.01 * Math.sin(2 * Math.PI * 19.7 * t + jph[2]) + 0.06 * Math.sin(2 * Math.PI * 0.5 * t + jph[3]));
      pitch[i] = m;
      let a = 1;
      if (!p.glide) a *= Math.min(1, (t - p.s) / 0.025);
      if (!p.leg) a *= Math.min(1, (p.e - t) / 0.035);
      if (p.fall && !p.leg) a *= Math.pow(10, -(p.fall[2] || 8) / 20 * sm((t - (p.e - p.fall[1])) / p.fall[1]));
      a *= 1 + 0.06 * Math.sin(2 * Math.PI * 4.1 * t + sph[0]) + 0.04 * Math.sin(2 * Math.PI * 11.3 * t + sph[1]);
      // formants: glide from previous vowel in legato, consonant colour at the start
      let f = vv; if (p.glide && t < p.on + p.glide / 2) { const u = sm((t - p.s) / p.glide); f = vv.map((x, q) => vprev[q] + (x - vprev[q]) * u); }
      if (cons === 'l' && t - p.s < 0.06) { const u = sm((t - p.s) / 0.06); f = [360 + (f[0] - 360) * u, 1300 + (f[1] - 1300) * u, f[2], f[3]]; a *= 0.35 + 0.65 * u; }
      if (cons === 'n' && t - p.s < 0.09) { const u = sm((t - p.s - 0.05) / 0.04); nas[i] = 1 - u; const fn = [250, 1500, 2500, 3400]; f = f.map((x, q) => fn[q] + (x - fn[q]) * u); a *= 0.3 + 0.7 * u; }
      for (let q = 0; q < 4; q++) F[q][i] = f[q] * fsc;
      amp[i] = a;
    }
  }
  // glottal source: harmonics 1/k with one-pole tilt, band-limited, random harmonic phases fixed
  const x = new Float64Array(N); let ph = 0; const hp = Array.from({length: 200}, () => r() * 6.283);
  for (let i = 0; i < N; i++) {
    if (isNaN(pitch[i]) || amp[i] <= 0) { ph = 0; continue; }
    const f0 = 440 * Math.pow(2, (pitch[i] - 69) / 12); ph += 2 * Math.PI * f0 / fs; if (ph > 1e5) ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
    const K = Math.min(199, Math.floor(0.45 * fs / f0)); let s = 0; for (let k = 1; k <= K; k++) s += Math.sin(k * ph + hp[k]) / k;
    x[i] = s * amp[i];
  }
  // tilt + aspiration
  let lp = 0; for (let i = 0; i < N; i++) { lp = 0.6 * lp + 0.4 * x[i]; x[i] = lp + (amp[i] > 0 ? (r() * 2 - 1) * 0.015 * amp[i] : 0); }
  // cascade formant resonators (time-varying, Klatt)
  for (let q = 0; q < 4; q++) { let y1 = 0, y2 = 0; for (let i = 0; i < N; i++) { const Fq = F[q][i] || (q === 0 ? 700 : 1500 + q * 700), bw = BW[q] * (nas[i] && q === 0 ? 2 : 1);
    const C = -Math.exp(-2 * Math.PI * bw / fs), B = 2 * Math.exp(-Math.PI * bw / fs) * Math.cos(2 * Math.PI * Math.min(Fq, 0.45 * fs) / fs), A = 1 - B - C; const y = A * x[i] + B * y1 + C * y2; y2 = y1; y1 = y; x[i] = y; } }
  // consonant noise (hiss band 3–7 kHz approx via difference)
  let hz1 = 0; for (let i = 0; i < N; i++) if (hiss[i] > 0) { const w = r() * 2 - 1, h = w - hz1; hz1 = w; x[i] += h * hiss[i] * 0.05; }
  // normalise voiced RMS to 0.1
  let ss = 0, c = 0; for (let i = 0; i < N; i++) if (amp[i] > 0.5) { ss += x[i] * x[i]; c++; } const g = 0.1 / Math.sqrt(ss / Math.max(1, c)); for (let i = 0; i < N; i++) x[i] *= g;
  // small room: convolution with exponentially decaying noise (RT60 o.rt, default 0.35 s), wet at o.wet dB (default -16)
  if (o.rev !== false) { const rt = o.rt || 0.35, L = Math.round(rt * fs), ir = new Float64Array(L), rr = rng(99 + (o.seed || 1));
    let e2 = 0; for (let j = 0; j < L; j++) { ir[j] = (rr() * 2 - 1) * Math.pow(10, -3 * j / fs / rt) * Math.min(1, j / (0.004 * fs)); e2 += ir[j] * ir[j]; }
    const nrm = Math.pow(10, (o.wet != null ? o.wet : -16) / 20) / Math.sqrt(e2); const nz = []; for (let j = 0; j < L; j++) if (Math.abs(ir[j]) > 1e-4) nz.push(j);
    const y = new Float64Array(N); for (let i = 0; i < N; i++) { const v = x[i]; if (v === 0) continue; const lim = Math.min(L, N - i); for (let j = 0; j < lim; j++) y[i + j] += v * ir[j]; }
    for (let i = 0; i < N; i++) x[i] += y[i] * nrm; }
  const snr = o.snr == null ? 35 : o.snr; let pn = 0; const nk = 0.1 / Math.pow(10, snr / 20) * 1.7;
  let hx = 0, hy = 0; const ha = Math.exp(-2 * Math.PI * 100 / fs); for (let i = 0; i < N; i++) { pn = 0.95 * pn + 0.05 * (r() * 2 - 1) * 4; const w = (r() * 2 - 1) * 0.6 + pn * 0.8; hy = ha * (hy + w - hx); hx = w; x[i] += nk * hy; }
  const out = new Float32Array(N); for (let i = 0; i < N; i++) out[i] = x[i];
  return {x: out, fs, pitch, truth: P.map(p => ({on: p.s, off: p.on + p.dur, midi: p.midi, glide: p.glide || 0}))};
}
// score detected notes {t0,t1,n} against truth {on, off, midi}: exact MIDI, onset within tol (s)
export function score(ns, truth, tol = 0.1) {
  const used = new Set(); let hit = 0; const miss = [];
  for (const t of truth) { let best = -1, bd = 1e9; const tl = Math.max(tol, t.glide / 2 + 0.04); ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= tl && d < bd) { bd = d; best = i; } }); if (best >= 0) { used.add(best); hit++; } else miss.push(t); }
  const extra = ns.filter((n, i) => !used.has(i));
  return {sung: truth.length, det: ns.length, hit, extra: extra.length, miss: miss.length, exEx: extra.slice(0, 3).map(n => [+n.t0.toFixed(3), +(n.t1 - n.t0).toFixed(3), n.n, n.m]), exMiss: miss.slice(0, 3).map(t => [+t.on.toFixed(3), t.midi])};
}
