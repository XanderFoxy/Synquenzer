// VS2 Node-Korpus (Nachbau von r7/stimme-proto/synth.mjs nach der Beschreibung in r7/stimme.md §4.2, der Prototyp ging verloren):
// synthetische Singstimme mit Grundwahrheit je Frame und je Note; Instrument (Säge, optional Sub-Oszillator).
import fs from 'fs';
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gauss = r => { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const AMIN = [9, 11, 0, 2, 4, 5, 7];
export const inAm = n => AMIN.includes(((n % 12) + 12) % 12);
export function loadDsp(file) {
  const s = fs.readFileSync(file, 'utf8'); const a = s.indexOf('/* VSDSP-BEGIN */'), b = s.indexOf('/* VSDSP-END */');
  return new Function(s.slice(a, b) + ';return vsDspMake();')();
}
// 26 Noten a-Moll, 100 BPM, Werte 1/16 … 1/2, Pausen, Tonwiederholungen, Sprünge
export function melody(seed, lo, hi, o = {}) {
  const r = rng(seed), bpm = o.bpm || 100, sb = 60 / bpm, n = o.n || 26;
  const sc = []; for (let m = lo; m <= hi; m++) if (inAm(m)) sc.push(m);
  let idx = Math.floor(sc.length / 2), t = o.t0 != null ? o.t0 : 0.6, prev = null; const out = [];
  for (let k = 0; k < n; k++) {
    const q = r(), beats = q < 0.2 ? 0.25 : q < 0.55 ? 0.5 : q < 0.85 ? 1 : 2;
    let rest = 0; if (k && r() < 0.2) rest = [0.25, 0.5, 1][Math.floor(r() * 3)];
    t += rest * sb;
    const w = r(); let st;
    if (k && w < 0.15) st = 0; else if (w < 0.3) st = (r() < 0.5 ? -1 : 1) * (3 + Math.floor(r() * 3)); else st = [-2, -1, 1, 2][Math.floor(r() * 4)];
    idx = Math.max(0, Math.min(sc.length - 1, idx + st));
    const midi = sc[idx], legato = !!(prev && !rest && prev.midi !== midi && r() < 0.35);
    const note = {on: t, dur: beats * sb, midi, legato, rest};
    out.push(note); prev = note; t += beats * sb;
  }
  return out;
}
const FORM = {
  hum: [[250, 60, 1], [1000, 200, 0.18], [2200, 200, 0.06]],
  male: [[730, 90, 1], [1090, 110, 0.5], [2440, 170, 0.25]],
  female: [[850, 100, 1], [1220, 120, 0.5], [2810, 170, 0.25]],
};
const formG = (f, F) => { let g = 0.03; for (const [c, bw, a] of F) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
function pinkNoise(n, r) { const y = new Float32Array(n); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) { const w = r() * 2 - 1; b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980; y[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926; } return y; }
const rmsOf = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
/* o: {fs, voice, seed, detune (ct), sigma (ct), vib: [lo, hi] ct, snr (dB, pink), click (dB rel. voice) , bpm} */
export function renderVoice(notes, o = {}) {
  const fs = o.fs || 16000, r = rng((o.seed || 1) * 7919 + 13), voice = o.voice || 'male', F = FORM[voice];
  const end = notes[notes.length - 1].on + notes[notes.length - 1].dur + 0.6, n = Math.ceil(end * fs);
  const sigma = o.sigma != null ? o.sigma : 15, det = o.detune || 0, vib = o.vib || [30, 70];
  const P = notes.map((nt, k) => ({...nt, tgt: nt.midi + det / 100 + gauss(r) * sigma / 100, scoop: !nt.legato && r() < (o.scoopP != null ? o.scoopP : 0.5) ? (o.scoopMin != null ? o.scoopMin : 0.5) + r() * (o.scoopRange != null ? o.scoopRange : 1) : 0,
    g: (o.gMin != null ? o.gMin : 0.06) + r() * (o.gRange != null ? o.gRange : 0.06), vd: (vib[0] + r() * (vib[1] - vib[0])) / 100, vr: 5 + r() * 1.5, vp: r() * 6.28,
    gapE: nt.legato ? 0 : 0.035, k}));
  const dPh = r() * 6.28;
  const x = new Float32Array(n), env = new Float32Array(n), f0t = new Float32Array(n);
  let ph = 0, ci = 0;
  const amps = new Float64Array(128); let ampAt = -1, K = 0;
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    while (ci + 1 < P.length && t >= P[ci + 1].on - (P[ci + 1].legato ? P[ci + 1].g / 2 : 0)) ci++;
    const p = P[ci]; if (t < p.on - (p.legato ? p.g / 2 : 0)) continue;
    const off = p.on + p.dur, nx = P[ci + 1], legNext = nx && nx.legato && Math.abs(nx.on - off) < 1e-6;
    const vEnd = legNext ? off + nx.g / 2 : off - p.gapE;
    if (t >= vEnd) continue;
    // Tonhöhe
    let m = p.tgt;
    if (p.legato) { const prv = P[ci - 1], a = p.on - p.g / 2; if (t < p.on + p.g / 2) { const u = (t - a) / p.g; m = prv.tgt + (p.tgt - prv.tgt) * (0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, u)))); } }
    if (p.scoop) m -= p.scoop * Math.exp(-(t - p.on) / (o.scoopTau || 0.03));
    const tn = t - p.on; if (tn > (o.vibDelay != null ? o.vibDelay : 0.2)) m += p.vd * Math.min(1, (tn - 0.2) / 0.1) * Math.sin(2 * Math.PI * p.vr * tn + p.vp);
    m += 0.10 * Math.sin(2 * Math.PI * 0.3 * t + dPh);
    const f0 = 440 * Math.pow(2, (m - 69) / 12);
    // Hüllkurve
    let a = 1; const st = p.legato ? p.on - p.g / 2 : p.on;
    if (!p.legato) a = Math.min(1, (t - st) / 0.015);
    if (!legNext) a *= Math.min(1, (vEnd - t) / 0.03);
    a *= 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * t + p.k);
    if (i - ampAt >= 80 || ampAt < 0) { ampAt = i; K = Math.min(127, Math.floor(7500 / f0)); for (let k = 1; k <= K; k++) amps[k] = (1 / k) * formG(k * f0, F); }
    ph += 2 * Math.PI * f0 / fs; if (ph > 1e6) ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
    let s = 0; for (let k = 1; k <= K; k++) s += amps[k] * Math.sin(k * ph);
    x[i] = s * a; env[i] = a;
    if (t >= p.on + 0.01 || p.legato) f0t[i] = f0;
  }
  // normieren: Stimme −20 dBFS (über die klingenden Stellen)
  let ss = 0, q = 0; for (let i = 0; i < n; i++) if (env[i] > 0.3) { ss += x[i] * x[i]; q++; }
  const g = 0.1 / Math.sqrt(ss / Math.max(1, q)); for (let i = 0; i < n; i++) x[i] *= g;
  const vr = 0.1;
  // Hauch −28 dB (Hochpass-Rauschen, folgt der Hüllkurve), Konsonant „d“ am Einsatz (nicht bei Summen), Atem in Pausen
  let hp = 0, lx = 0;
  for (let i = 0; i < n; i++) { const w = r() * 2 - 1; hp = 0.7 * (hp + w - lx); lx = w; x[i] += hp * vr * 0.04 * env[i]; }
  for (const p of P) {
    if (voice !== 'hum' && !p.legato) { const a = Math.round((p.on - 0.004) * fs); for (let j = 0; j < Math.round(0.008 * fs); j++) if (a + j >= 0 && a + j < n) x[a + j] += (r() * 2 - 1) * vr * 0.3 * Math.exp(-j / (0.003 * fs)); }
    if (p.rest >= 0.3 * (o.bpm || 100) / 60 && p.k) { const a = Math.round((p.on - p.rest * 60 / (o.bpm || 100) + 0.08) * fs), b = Math.round((p.on - 0.1) * fs); for (let j = a; j < b; j++) if (j >= 0) x[j] += (r() * 2 - 1) * vr * 0.018 * Math.sin(Math.PI * (j - a) / (b - a)); }
  }
  if (o.snr != null) { const pn = pinkNoise(n, r), pr = rmsOf(pn), k = vr / Math.pow(10, o.snr / 20) / pr; for (let i = 0; i < n; i++) x[i] += pn[i] * k; }
  const clicks = [];
  if (o.click != null) {
    const sb = 60 / (o.bpm || 100), cl = Math.round(0.25 * fs), c = new Float32Array(cl);
    for (let j = 0; j < cl; j++) { const t = j / fs; c[j] = Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t / 0.003) + (r() * 2 - 1) * 0.15 * Math.exp(-t / 0.04) * (t > 0.012 ? 1 : 0); }
    const cr = rmsOf(c, 0, Math.round(0.02 * fs)), k = vr * Math.pow(10, o.click / 20) / cr;
    const co = o.clickOff != null ? o.clickOff : 0.012;
    for (let b = 0; b * sb < end; b++) { const a = Math.round((b * sb + co) * fs); clicks.push(b * sb); for (let j = 0; j < cl && a + j < n; j++) x[a + j] += c[j] * k; }
  }
  const truth = notes.map(nt => ({on: nt.on, off: nt.on + nt.dur, midi: nt.midi}));
  return {x, fs, f0t, truth, clicks, P};
}
// einstimmiges Instrument: bandbegrenzte Säge (ADSR), optional Sub-Oszillator −1 Okt. (sine | square)
export function renderSynth(notes, o = {}) {
  const fs = o.fs || 16000, end = notes[notes.length - 1].on + notes[notes.length - 1].dur + 0.5, n = Math.ceil(end * fs);
  const x = new Float32Array(n), f0t = new Float32Array(n);
  for (const p of notes) {
    const f = 440 * Math.pow(2, (p.midi - 69) / 12), a = Math.round(p.on * fs), len = Math.round((p.dur - 0.02) * fs), rel = Math.round(0.04 * fs);
    const K = Math.floor(7500 / f);
    for (let j = 0; j < len + rel && a + j < n; j++) {
      const t = j / fs; let e = Math.min(1, t / 0.005) * (0.75 + 0.25 * Math.exp(-t / 0.15)); if (j >= len) e *= 1 - (j - len) / rel;
      let s = 0; for (let k = 1; k <= K; k++) s += Math.sin(2 * Math.PI * k * f * t) / k;
      if (o.sub === 'sine') s += (o.subAmp || 0.6) * Math.sin(Math.PI * f * t);
      else if (o.sub === 'square') { for (let k = 1; k <= Math.floor(7500 / (f / 2)); k += 2) s += (o.subAmp || 0.6) * Math.sin(Math.PI * k * f * t) / k; }
      x[a + j] += 0.15 * e * s;
      if (j > 0.01 * fs && j < len) f0t[a + j] = f;
    }
  }
  const truth = notes.map(nt => ({on: nt.on, off: nt.on + nt.dur, midi: nt.midi}));
  return {x, fs, f0t, truth};
}
// Maße: RPA (±50 ct), Oktavfehler-Frames, Noten-F COnP (Einsatz ±50 ms, Ton exakt), Einsatz-Fehler
export function score(tr, notes, sig, o = {}) {
  const hop = tr.hop / tr.fs; let tv = 0, ok = 0, oct = 0;
  for (let i = 0; i < tr.n; i++) {
    const s = Math.round(i * hop * sig.fs); const ft = sig.f0t[Math.min(s, sig.f0t.length - 1)];
    if (!(ft > 0)) continue; tv++;
    const fd = tr.f0[i]; if (!(fd > 0)) continue;
    const ct = 1200 * Math.log2(fd / ft); if (Math.abs(ct) <= 50) ok++; else if (Math.abs(ct) > 600 && Math.abs(ct - 1200 * Math.round(ct / 1200)) <= 100) oct++;
  }
  const used = new Set(); let match = 0; const errs = [];
  for (const t of sig.truth) {
    let best = -1, bd = 1e9;
    notes.forEach((d, k) => { if (used.has(k) || d.n !== t.midi) return; const e = Math.abs(d.t0 - t.on); if (e <= (o.tol || 0.05) && e < bd) { bd = e; best = k; } });
    if (best >= 0) { used.add(best); match++; errs.push(bd * 1000); }
  }
  const P = notes.length ? match / notes.length : 0, R = match / sig.truth.length, F = P + R ? 2 * P * R / (P + R) : 0;
  errs.sort((a, b) => a - b);
  return {rpa: tv ? ok / tv : 0, oct, F, P, R, nDet: notes.length, nTrue: sig.truth.length, onMed: errs[errs.length >> 1] || 0, on95: errs[Math.floor(errs.length * 0.95)] || 0};
}
