// DRUM1 – schwereres Testlied: mittenreicher Kick mit Klick, Snare mit tiefem Körper (180 Hz), harter Bass auf 1/8 und 1/16 zwischen den Kicks,
// Lautstärke-Schwankung der Schläge (0,6–1,0), Fläche. 104 BPM, Vorlauf 0,4 s, S8 R8 S8. Wahrheit in s.
const SR = 44100, hz = m => 440 * Math.pow(2, (m - 69) / 12);
function wav(L, R, N) {
  const w = Buffer.alloc(44 + N * 4); w.write('RIFF', 0); w.writeUInt32LE(36 + N * 4, 4); w.write('WAVEfmt ', 8); w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(2, 22); w.writeUInt32LE(SR, 24); w.writeUInt32LE(SR * 4, 28); w.writeUInt16LE(4, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(N * 4, 40);
  let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const g = pk > 0.9 ? 0.9 / pk : 1;
  for (let i = 0; i < N; i++) { w.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * g * 32767))), 44 + i * 4); w.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * g * 32767))), 46 + i * 4); }
  return w;
}
export function hart() {
  const BPM = 104, BEAT = 60 / BPM, BAR = 4 * BEAT, ST = BEAT / 4, OFF = 0.4, PLAN = [['S', 8], ['R', 8], ['S', 8]], BARS = 24, DUR = OFF + BARS * BAR + 1.2;
  const N = Math.round(DUR * SR), L = new Float32Array(N), R = new Float32Array(N); let s = 99;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const add = (t, x, gl, gr) => { const i0 = Math.round(t * SR); for (let i = 0; i < x.length; i++) { const j = i0 + i; if (j < 0 || j >= N) continue; L[j] += x[i] * gl; R[j] += x[i] * (gr ?? gl); } };
  const T = {kick: [], snare: [], hat: [], bass: [], parts: []};
  const kick = (t, g) => { const n = Math.round(0.3 * SR), x = new Float32Array(n); let ph = 0, p0 = 0; for (let i = 0; i < n; i++) { const u = i / SR; ph += 2 * Math.PI * (62 + 140 * Math.exp(-u * 40)) / SR; const w = rnd(), hp = w - p0; p0 = w; x[i] = Math.sin(ph) * Math.exp(-u * 10) + 0.35 * hp * Math.exp(-u * 260) + 0.25 * Math.sin(2 * Math.PI * 1800 * u) * Math.exp(-u * 120); } add(t, x, g); T.kick.push(t); };
  const snare = (t, g) => { const n = Math.round(0.2 * SR), x = new Float32Array(n); let b1 = 0, b2 = 0; for (let i = 0; i < n; i++) { const u = i / SR, w = rnd(); b1 += 0.5 * (w - b1); b2 += 0.1 * (b1 - b2); x[i] = (b1 - b2) * 0.9 * Math.exp(-u * 20) + 0.75 * Math.sin(2 * Math.PI * (180 + 40 * Math.exp(-u * 50)) * u) * Math.exp(-u * 16); } add(t, x, g); T.snare.push(t); };
  const hat = (t, g) => { const n = Math.round(0.045 * SR), x = new Float32Array(n); let p0 = 0, p1 = 0; for (let i = 0; i < n; i++) { const w = rnd(), hp = w - 2 * p0 + p1; p1 = p0; p0 = w; x[i] = hp * 0.5 * Math.exp(-i / SR * 75); } add(t, x, g); T.hat.push(t); };
  const bass = (t, m, d, g) => { const f = hz(m), n = Math.round(d * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const u = i / SR, e = Math.min(1, u / 0.002) * Math.exp(-u * 6) * Math.min(1, (n - i) / (0.01 * SR)); let v = 0; for (let k = 1; k <= 8; k++) v += Math.sin(2 * Math.PI * f * k * u) / k * (k === 1 ? 1.2 : Math.exp(-u * 25 * k / 4)); x[i] = v * e; } add(t, x, g); T.bass.push({t, m}); };
  const pad = (t, ch, d, g) => { const n = Math.round(d * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const u = i / SR, e = Math.min(1, u / 0.15) * Math.min(1, (d - u) / 0.08); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * u + m) + 0.2 * Math.sin(4 * Math.PI * hz(m) * u); x[i] = v * e; } add(t, x, g, g * 1.1); };
  const CH = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52]]; let b0 = 0;
  const vel = k => 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(k * 1.7));
  for (const [P, nb] of PLAN) {
    T.parts.push({p: P, a: b0, b: b0 + nb}); const ld = P === 'R' ? 1.2 : 1;
    for (let k = 0; k < nb; k++) {
      const b = b0 + k, t0 = OFF + b * BAR, ch = CH[k % 4], root = ch[0] - 24 + 12 * (ch[0] < 48 ? 1 : 0);
      pad(t0, ch.map(m => m + 12), BAR, 0.03 * ld);
      // Bass: harte Achtel + 16tel-Vorschlag vor der 3 und der 1 des nächsten Takts (zwischen den Kicks)
      for (let q = 0; q < 8; q++) bass(t0 + q * BEAT / 2, root + (q === 5 ? 7 : 0), BEAT / 2 * 0.85, 0.24);
      for (const st of [7, 15]) bass(t0 + st * ST, root + 12, ST * 0.8, 0.2);
      const ks = P === 'R' ? [0, 6, 8, 10] : [0, 8, 11];
      for (const st of ks) kick(t0 + st * ST, 0.5 * ld * vel(b * 4 + st));
      for (const st of [4, 12]) snare(t0 + st * ST, 0.34 * ld * vel(b * 3 + st));
      for (let st = 0; st < 16; st += 2) hat(t0 + st * ST, st % 4 ? 0.05 : 0.08);
    }
    b0 += nb;
  }
  return {wav: wav(L, R, N), truth: T, SR, BPM, BAR, BEAT, OFF, BARS, name: 'hart'};
}
