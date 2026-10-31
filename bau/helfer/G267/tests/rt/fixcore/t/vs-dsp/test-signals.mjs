// test-signals.mjs — synthetische Testsignale für die VS4/VS5-Tests (nur Tests, nicht für die App)
export function rng(seed = 1) {           // mulberry32, deterministisch
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

const VOWELS = {a: [800, 1150, 2900], e: [400, 2100, 2800], i: [300, 2300, 3000], o: [450, 800, 2830], u: [325, 700, 2530]};
const BW = [80, 90, 120];

// Gesangs-artige Stimme: harmonischer Ton mit Formanten, Vibrato, Hüllkurve, optional Konsonant (Rauschstoß) vorn.
// notes: [{t, d, f0, vowel, cons, f1?}] (s, Hz); f1 = Zielton bei Bindung (Tonwechsel ohne Pause, Mitte der Note)
export function voice(sr, dur, notes, o = {}) {
  const n = Math.round(dur * sr), x = new Float32Array(n), r = rng(o.seed || 7);
  const truth = [];
  for (const nt of notes) {
    const i0 = Math.round(nt.t * sr), consLen = nt.cons ? Math.round((0.02 + 0.02 * r()) * sr) : 0;
    truth.push({t: nt.t, kind: nt.cons ? 'cons' : 'vowel'});
    // Konsonant: hochpassiges Rauschen, kurz
    let prev = 0;
    for (let i = 0; i < consLen && i0 + i < n; i++) {
      const g = Math.sin(Math.PI * i / consLen), w = gauss(r); const hpv = w - prev; prev = w;
      x[i0 + i] += 0.12 * (o.amp || 1) * g * hpv;
    }
    const v0 = i0 + consLen, vl = Math.round(nt.d * sr) - consLen;
    const F = VOWELS[nt.vowel || 'a'], att = Math.round(0.015 * sr), rel = Math.round(0.04 * sr);
    let ph = 0; const vibF = 5.5, vibD = o.vibrato == null ? 25 : o.vibrato;   // Cent
    const amps = new Float64Array(64); let H = 0;
    for (let i = 0; i < vl && v0 + i < n; i++) {
      const tt = i / sr;
      let f = nt.f0;
      if (nt.f1) { const mid = vl / 2 / sr, k = Math.min(1, Math.max(0, (tt - mid) / 0.03 + 0.5)); f = nt.f0 * Math.pow(nt.f1 / nt.f0, k); }
      const vib = tt > 0.15 ? vibD * Math.sin(2 * Math.PI * vibF * (tt - 0.15)) * Math.min(1, (tt - 0.15) / 0.2) : 0;
      f *= Math.pow(2, vib / 1200);
      if ((i & 63) === 0) {   // Formant-Amplituden je 64 Samples neu
        H = Math.min(60, Math.floor(Math.min(8000, sr * 0.45) / f));
        for (let h = 1; h <= H; h++) {
          const fh = h * f; let a = 0;
          for (let q = 0; q < 3; q++) a += [1, 0.6, 0.3][q] / (1 + ((fh - F[q]) / BW[q]) ** 2);
          amps[h] = (a + 0.02) / Math.sqrt(h);
        }
      }
      ph += 2 * Math.PI * f / sr; if (ph > 2 * Math.PI) ph -= 2 * Math.PI;
      // Summe sin(h·ph) per Rekursion
      const c2 = 2 * Math.cos(ph); let s1 = Math.sin(ph), s0 = 0, acc = 0;
      for (let h = 1; h <= H; h++) { acc += amps[h] * s1; const s2 = c2 * s1 - s0; s0 = s1; s1 = s2; }
      const env = Math.min(1, i / att) * Math.min(1, (vl - i) / rel);
      x[v0 + i] += 0.08 * (o.amp || 1) * env * acc;
    }
  }
  return {x, truth};
}

// Playback-Referenz: Akkord-Fläche aus bandbegrenzten Sägezähnen + Bass-Schlag + Klick; optional Einmess-Rauschen vorn
export function playback(sr, dur, o = {}) {
  const n = Math.round(dur * sr), x = new Float32Array(n), r = rng(o.seed || 3);
  const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const chordLen = Math.round(2 * sr), bpm = o.bpm || 100, beat = Math.round(60 / bpm * sr);
  const cal = Math.round((o.calib || 0) * sr);
  let pink = [0, 0, 0];
  for (let i = 0; i < cal && i < n; i++) {   // „Einmessen“: rosa-artiges Rauschen
    const w = gauss(r); pink[0] = 0.997 * pink[0] + 0.029 * w; pink[1] = 0.985 * pink[1] + 0.032 * w; pink[2] = 0.95 * pink[2] + 0.048 * w;
    x[i] = 0.5 * (pink[0] + pink[1] + pink[2] + 0.05 * w) * Math.min(1, i / (0.01 * sr), (cal - i) / (0.01 * sr));
  }
  const ph = new Float64Array(4);
  for (let i = cal; i < n; i++) {
    const ch = chords[Math.floor((i - cal) / chordLen) % chords.length];
    let v = 0;
    for (let q = 0; q < 3; q++) {
      const f = 440 * Math.pow(2, (ch[q] - 69) / 12);
      ph[q] += 2 * Math.PI * f / sr; if (ph[q] > 2 * Math.PI) ph[q] -= 2 * Math.PI;
      const H = Math.min(30, Math.floor(6000 / f)); let s = 0;
      const c2 = 2 * Math.cos(ph[q]); let s1 = Math.sin(ph[q]), s0 = 0;
      for (let h = 1; h <= H; h++) { s += s1 / h; const s2 = c2 * s1 - s0; s0 = s1; s1 = s2; }
      v += 0.07 * s;
    }
    const b = (i - cal) % beat, tb = b / sr;
    v += 0.35 * Math.sin(2 * Math.PI * 55 * tb) * Math.exp(-tb / 0.12);           // Bass-Schlag
    if (b < 0.004 * sr) v += 0.15 * gauss(r) * (1 - b / (0.004 * sr));          // Klick
    x[i] = v;
  }
  return x;
}

// Raum-Impulsantwort: Direktweg nach `delay` s, dann Reflexionen (Rauschen, exponentiell, RT60)
export function roomIR(sr, delay, rt60 = 0.3, o = {}) {
  const r = rng(o.seed || 11), len = Math.round((delay + rt60) * sr), h = new Float32Array(len);
  const d = Math.round(delay * sr); h[d] = 1;
  const k0 = d + Math.round(0.003 * sr), tau = rt60 / 6.91;
  for (let i = k0; i < len; i++) h[i] += (o.refl || 0.35) * gauss(r) * Math.exp(-(i - k0) / sr / tau) * Math.sqrt(48000 / sr) * 0.12;
  return h;
}

// schnelle Faltung (Overlap-Add mit FFT)
export function convolve(x, h) {
  const n = x.length, m = h.length; let N = 1; while (N < 2 * m) N <<= 1; const B = N - m + 1;
  const y = new Float32Array(n);
  const fft = mkfft(N), Hr = new Float64Array(N), Hi = new Float64Array(N);
  for (let i = 0; i < m; i++) Hr[i] = h[i]; fft(Hr, Hi, false);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let a = 0; a < n; a += B) {
    re.fill(0); im.fill(0);
    for (let i = 0; i < B && a + i < n; i++) re[i] = x[a + i];
    fft(re, im, false);
    for (let k = 0; k < N; k++) { const r0 = re[k] * Hr[k] - im[k] * Hi[k], i0 = re[k] * Hi[k] + im[k] * Hr[k]; re[k] = r0; im[k] = i0; }
    fft(re, im, true);
    for (let i = 0; i < N && a + i < n; i++) y[a + i] += re[i] / N;
  }
  return y;
}
function mkfft(n) {
  const lv = Math.log2(n) | 0;
  return (re, im, inv) => {
    for (let i = 0, j = 0; i < n; i++) {
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
      let b = n >> 1; while (j & b) { j ^= b; b >>= 1; } j |= b;
    }
    for (let s = 2; s <= n; s <<= 1) {
      const h = s >> 1, a = (inv ? 2 : -2) * Math.PI / s, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += s) { let cr = 1, ci = 0;
        for (let j = 0; j < h; j++) { const l = i + j + h, tr = re[l] * cr - im[l] * ci, ti = re[l] * ci + im[l] * cr;
          re[l] = re[i + j] - tr; im[l] = im[i + j] - ti; re[i + j] += tr; im[i + j] += ti; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
    }
  };
}

// 1. Ordnung Hochpass (Lautsprecher)
export function hp1(x, sr, fc) {
  const a = 1 / (1 + 2 * Math.PI * fc / sr), y = new Float32Array(x.length); let px = 0, py = 0;
  for (let i = 0; i < x.length; i++) { py = a * (py + x[i] - px); px = x[i]; y[i] = py; }
  return y;
}

export function noise(sr, dur, level, seed = 5) {   // leicht gefärbtes Rauschen (Brumm-frei), RMS = level
  const n = Math.round(dur * sr), x = new Float32Array(n), r = rng(seed); let lp = 0, s = 0;
  for (let i = 0; i < n; i++) { const w = gauss(r); lp = 0.7 * lp + 0.3 * w; x[i] = 0.6 * lp + 0.4 * w; s += x[i] * x[i]; }
  const g = level / Math.sqrt(s / n); for (let i = 0; i < n; i++) x[i] *= g;
  return x;
}

// Lied-artige Notenfolge: Phrasen mit Wörtern aus 1–3 Silben, Pausen zwischen Phrasen
export function song(sr, dur, o = {}) {
  const r = rng(o.seed || 21), notes = [], silences = [];
  const vow = 'aeiou', scale = [0, 2, 3, 5, 7, 8, 10, 12];
  let t = o.lead == null ? 0.6 : o.lead, base = o.base || 147;
  silences.push([0, t]);
  while (t < dur - 2) {
    const phraseEnd = Math.min(dur - 1, t + 3 + 3 * r());
    while (t < phraseEnd) {
      const syl = 1 + Math.floor(r() * 3);
      for (let s = 0; s < syl && t < phraseEnd; s++) {
        const d = 0.18 + 0.27 * r(), f0 = base * Math.pow(2, scale[Math.floor(r() * scale.length)] / 12);
        const legato = s > 0 && r() < (o.legato || 0.12);
        if (legato && notes.length) {   // Bindung: Tonwechsel ohne Pause in der vorigen Note
          const p = notes[notes.length - 1]; const f1 = p.f0 * Math.pow(2, (r() < 0.5 ? 3 : -3) / 12);
          p.f1 = f1; p.legatoAt = p.t + p.d / 2; notes.push({t: p.legatoAt, d: 0, f0: f1, legato: true, vowel: p.vowel});
          continue;
        }
        notes.push({t, d, f0, vowel: vow[Math.floor(r() * 5)], cons: r() < (o.cons == null ? 0.5 : o.cons)});
        t += d + 0.03 + 0.04 * r();
      }
      t += 0.15 + 0.25 * r();
    }
    const gap = 1.2 + r(); silences.push([t, t + gap]); t += gap;
  }
  silences.push([t, dur]);
  const real = notes.filter(n => !n.legato);
  const v = voice(sr, dur, real, {seed: (o.seed || 21) + 1, amp: o.amp, vibrato: o.vibrato});
  const onsets = notes.map(n => n.t).sort((a, b) => a - b);
  return {x: v.x, onsets, notes, silences};
}

export const rms = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
export const db = v => 10 * Math.log10(v + 1e-30);
