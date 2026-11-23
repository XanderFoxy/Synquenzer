// SPK11B – synthetische Lieder mit Wahrheit (Zeiten in s, Teile in Takten ab Vorlauf OFF).
// bauer: Lied aus spk11-test (120 BPM, S8 R8 S8 R8). pruef: Prüferlied (100 BPM, I4 S8 R8 S8 R8 O4, Intro/Outro ohne Bass = Trennrest).
// dicht: dichter Groove mit Bass (Kick 4/4 + Synkopen, Snare 2/4, Hi-Hat 1/16, Bass 1/8 + 1/16 synkopiert). intro: leises echtes Bass-Intro
// (−12 dB, nur Bass + leise Fläche) · Strophe · Refrain · Outro nur Fläche (Trennrest).

const SR = 44100, hz = m => 440 * Math.pow(2, (m - 69) / 12);
function wavOf(L, Rr, N) {
  const wav = Buffer.alloc(44 + N * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
  let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(Rr[i])); const g = pk > 0.95 ? 0.95 / pk : 1;
  for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * g * 32767))), 44 + i * 4); wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(Rr[i] * g * 32767))), 46 + i * 4); }
  return {wav, gain: g};
}
function mk(DUR, seed0) {
  const N = Math.round(DUR * SR), L = new Float32Array(N), Rr = new Float32Array(N); let seed = seed0;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const add = (t, x, gl, gr) => { const i0 = Math.round(t * SR); for (let i = 0; i < x.length && i0 + i < N; i++) { if (i0 + i < 0) continue; L[i0 + i] += x[i] * gl; Rr[i0 + i] += x[i] * (gr ?? gl); } };
  const T = {bass: [], kick: [], snare: [], hat: [], parts: []};
  const kick = (t, g) => { const n = Math.round(0.26 * SR), x = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const s = i / SR; ph += 2 * Math.PI * (50 + 95 * Math.exp(-s * 30)) / SR; x[i] = Math.sin(ph) * Math.exp(-s * 13); } add(t, x, g); T.kick.push(t); };
  const snare = (t, g) => { const n = Math.round(0.17 * SR), x = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const s = i / SR, w = rnd(); lp += 0.32 * (w - lp); x[i] = ((w - lp) * 0.85 + 0.38 * Math.sin(2 * Math.PI * 195 * s)) * Math.exp(-s * 21); } add(t, x, g); T.snare.push(t); };
  const hat = (t, g) => { const n = Math.round(0.04 * SR), x = new Float32Array(n); let p0 = 0; for (let i = 0; i < n; i++) { const w = rnd(); x[i] = (w - p0) * Math.exp(-i / SR * 90); p0 = w; } add(t, x, g); T.hat.push(t); };
  const bass = (t, m, d, g) => { const f = hz(m), n = Math.round(d * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const s = i / SR, e = Math.min(1, s / 0.004) * Math.exp(-s * 2.8) * Math.min(1, (n / SR - s) / 0.01); let v = 0; for (let h = 1; h <= 7; h++) v += Math.sin(2 * Math.PI * f * h * s) / h; x[i] = v * e; } add(t, x, g); T.bass.push({t, m}); };
  const pad = (t, ch, d, g) => { const n = Math.round(d * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const s = i / SR, e = Math.min(1, s / 0.1) * Math.min(1, (d - s) / 0.06); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * s) + 0.3 * Math.sin(4 * Math.PI * hz(m) * s + 0.4); x[i] = v * e; } add(t, x, g, g * 1.15); };
  return {N, L, Rr, T, kick, snare, hat, bass, pad, fin: () => Object.assign(wavOf(L, Rr, N), {truth: T, SR})};
}
// dichter Groove: 112 BPM, Vorlauf 0,5 s, Strophe 8 · Refrain 8 · Strophe 8 Takte
export function dicht() {
  const BPM = 112, BEAT = 60 / BPM, BAR = 4 * BEAT, OFF = 0.5, PLAN = [['S', 8], ['R', 8], ['S', 8]], BARS = 24, M = mk(OFF + BARS * BAR + 1.2, 4711);
  const CH = [[45, 52, 57], [41, 48, 53], [48, 55, 60], [43, 50, 55]]; let b0 = 0;
  for (const [P, nb] of PLAN) {
    M.T.parts.push({p: P, a: b0, b: b0 + nb}); const R = P === 'R', loud = R ? 1.25 : 1;
    for (let k = 0; k < nb; k++) {
      const b = b0 + k, t0 = OFF + b * BAR, ch = CH[k % 4], root = ch[0] - 12 + (ch[0] < 44 ? 12 : 0);
      M.pad(t0, ch.map(m => m + 12), BAR, 0.035 * loud);
      // Bass: Achtel, im Refrain zusätzlich 1/16-Synkopen (e von 2 und 4), Oktave auf den „und“
      for (let q = 0; q < 8; q++) M.bass(t0 + q * BEAT / 2, root + (q % 2 ? 12 : 0), BEAT / 2 * 0.8, 0.2);
      if (R) for (const s of [7, 15]) M.bass(t0 + s * BEAT / 4, root + 7, BEAT / 4 * 0.8, 0.17);
      // Kick: 4 auf den Boden + Synkope „und“ von 4 (Strophe) bzw. „e“ von 3 (Refrain)
      for (let q = 0; q < 4; q++) M.kick(t0 + q * BEAT, 0.5 * loud);
      M.kick(t0 + (R ? 9 : 14) * BEAT / 4, 0.42 * loud);
      for (const q of [1, 3]) M.snare(t0 + q * BEAT, 0.36 * loud);
      for (let s = 0; s < 16; s++) M.hat(t0 + s * BEAT / 4, s % 2 ? 0.06 : 0.1);
    }
    b0 += nb;
  }
  return Object.assign(M.fin(), {BPM, BAR, BEAT, OFF, BARS});
}
// leises echtes Bass-Intro: 96 BPM, Vorlauf 0,6 s, Intro 4 (Bass −12 dB + leise Fläche) · Strophe 8 · Refrain 8 · Outro 4 (nur Fläche + leise Hi-Hat)
export function intro() {
  const BPM = 96, BEAT = 60 / BPM, BAR = 4 * BEAT, OFF = 0.6, PLAN = [['I', 4], ['S', 8], ['R', 8], ['O', 4]], BARS = 24, M = mk(OFF + BARS * BAR + 1.2, 1234);
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; let b0 = 0;
  for (const [P, nb] of PLAN) {
    M.T.parts.push({p: P, a: b0, b: b0 + nb}); const loud = P === 'R' ? 1.25 : P === 'S' ? 1 : 0.7;
    for (let k = 0; k < nb; k++) {
      const b = b0 + k, t0 = OFF + b * BAR, ch = CH[k % 4], root = ch[0] - 24 + (ch[0] < 52 ? 12 : 0);
      M.pad(t0, ch, BAR, 0.04 * loud);
      if (P === 'I') { for (const [q, d] of [[0, 1.5], [1.5, 0.5], [2, 2]]) M.bass(t0 + q * BEAT, root, d * BEAT * 0.9, 0.2 * 0.25); }   // −12 dB, ruhige Figur
      else if (P !== 'O') {
        for (let q = 0; q < (P === 'S' ? 8 : 4); q++) { const st = P === 'S' ? BEAT / 2 : BEAT; M.bass(t0 + q * st, root + (P === 'S' && q % 2 ? 12 : 0), st * 0.85, 0.2); }
        for (const q of [0, 2]) M.kick(t0 + q * BEAT, 0.5 * loud);
        for (const q of [1, 3]) M.snare(t0 + q * BEAT, 0.36 * loud);
        for (let s = 0; s < 8; s++) M.hat(t0 + s * BEAT / 2, 0.09);
      } else for (let q = 0; q < 4; q++) M.hat(t0 + q * BEAT, 0.05);
    }
    b0 += nb;
  }
  return Object.assign(M.fin(), {BPM, BAR, BEAT, OFF, BARS});
}

// Lied des Bauers (spk11-test): 120 BPM, kein Vorlauf, S8 R8 S8 R8
export function bauer() {
  const BAR = 2, BARS = 32, N = (BARS * BAR + 1) * SR, L = new Float32Array(N), Rr = new Float32Array(N);
  let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const add = (i0, x, gl, gr) => { for (let i = 0; i < x.length && i0 + i < N; i++) { L[i0 + i] += x[i] * gl; Rr[i0 + i] += x[i] * (gr ?? gl); } };
  const CH = {S: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], R: [[53, 57, 60], [48, 52, 55], [55, 59, 62], [57, 60, 64]]};
  const partOf = b => (Math.floor(b / 8) % 2 ? 'R' : 'S'), T = {bass: [], kick: [], snare: [], hat: [], parts: [{p: 'S', a: 0, b: 8}, {p: 'R', a: 8, b: 16}, {p: 'S', a: 16, b: 24}, {p: 'R', a: 24, b: 32}]};
  for (let b = 0; b < BARS; b++) {
    const P = partOf(b), ch = CH[P][b % 4], t0 = b * BAR, loud = P === 'R' ? 1.35 : 1;
    for (let q = 0; q < 4; q++) { const m = ch[0] - 12, f = hz(m), n = Math.round(0.42 * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.004) * Math.exp(-t * 3); let v = 0; for (let k = 1; k <= 6; k++) v += Math.sin(2 * Math.PI * f * k * t) / k; x[i] = v * e; } add(Math.round((t0 + q * 0.5) * SR), x, 0.22); T.bass.push({t: t0 + q * 0.5, m}); }
    { const n = Math.round(BAR * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.08) * Math.min(1, (BAR - t) / 0.05); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * t) + 0.25 * Math.sin(4 * Math.PI * hz(m) * t); x[i] = v * e; } add(t0 * SR, x, 0.05 * loud, 0.06 * loud); }
    for (let q = 0; q < 4; q++) {
      const at = Math.round((t0 + q * 0.5) * SR);
      if (q % 2 === 0) { const n = Math.round(0.25 * SR), x = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (50 + 90 * Math.exp(-t * 30)) / SR; x[i] = Math.sin(ph) * Math.exp(-t * 14); } add(at, x, 0.55 * loud); T.kick.push(t0 + q * 0.5); }
      else { const n = Math.round(0.16 * SR), x = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const t = i / SR, w = rnd(); lp += 0.35 * (w - lp); x[i] = ((w - lp) * 0.8 + 0.4 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 22); } add(at, x, 0.4 * loud); T.snare.push(t0 + q * 0.5); }
      if (P === 'R') for (const o of [0, 0.25]) { const n = Math.round(0.04 * SR), x = new Float32Array(n); let p0 = 0; for (let i = 0; i < n; i++) { const w = rnd(); x[i] = (w - p0) * Math.exp(-i / SR * 90); p0 = w; } add(at + Math.round(o * SR), x, 0.12); T.hat.push(t0 + q * 0.5 + o); }
    }
  }
  const wav = Buffer.alloc(44 + N * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4); wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(Rr[i] * 32767))), 46 + i * 4); }
  return {wav, truth: T, SR, BPM: 120, BAR: 2, BEAT: 0.5, OFF: 0, BARS};
}
export const SONGS = {bauer, dicht, intro};
