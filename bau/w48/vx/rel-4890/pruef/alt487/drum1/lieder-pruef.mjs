// PRUEFUNG SPK11B – eigene Testlieder (unabhaengig von songs.mjs): 80 / 128 / 174 BPM, Shuffle, Ghost-Notes, offene Hi-Hat,
// Bass gleichzeitig mit Kick, sehr leises Intro, Teile ohne Bass / ohne Drums. Wahrheit in s.
const SR = 44100, hz = m => 440 * Math.pow(2, (m - 69) / 12);
function wav(L, R, N) {
  const w = Buffer.alloc(44 + N * 4); w.write('RIFF', 0); w.writeUInt32LE(36 + N * 4, 4); w.write('WAVEfmt ', 8); w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(2, 22); w.writeUInt32LE(SR, 24); w.writeUInt32LE(SR * 4, 28); w.writeUInt16LE(4, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(N * 4, 40);
  let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const g = pk > 0.9 ? 0.9 / pk : 1;
  for (let i = 0; i < N; i++) { w.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * g * 32767))), 44 + i * 4); w.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * g * 32767))), 46 + i * 4); }
  return w;
}
function bau(dur, seed) {
  const N = Math.round(dur * SR), L = new Float32Array(N), R = new Float32Array(N); let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const add = (t, x, gl, gr) => { const i0 = Math.round(t * SR); for (let i = 0; i < x.length; i++) { const j = i0 + i; if (j < 0 || j >= N) continue; L[j] += x[i] * gl; R[j] += x[i] * (gr ?? gl); } };
  const T = {kick: [], snare: [], ghost: [], hatC: [], hatO: [], bass: [], parts: []};
  const I = {
    kick(t, g, dec = 11) { const n = Math.round(0.4 * SR), x = new Float32Array(n); let ph = 0, hp = 0, p0 = 0; for (let i = 0; i < n; i++) { const u = i / SR; ph += 2 * Math.PI * (48 + 120 * Math.exp(-u * 35)) / SR; const w = rnd(); hp = w - p0; p0 = w; x[i] = Math.sin(ph) * Math.exp(-u * dec) + 0.25 * hp * Math.exp(-u * 600); } add(t, x, g); T.kick.push(t); },
    snare(t, g, ghost) { const n = Math.round(0.22 * SR), x = new Float32Array(n); let b1 = 0, b2 = 0; for (let i = 0; i < n; i++) { const u = i / SR, w = rnd(); b1 += 0.45 * (w - b1); b2 += 0.08 * (b1 - b2); x[i] = ((b1 - b2) * 1.3 * Math.exp(-u * 17) + (0.35 * Math.sin(2 * Math.PI * 182 * u) + 0.18 * Math.sin(2 * Math.PI * 331 * u)) * Math.exp(-u * 30)); } add(t, x, g, g * 0.95); (ghost ? T.ghost : T.snare).push(t); },
    hat(t, g, open) { const d = open ? 0.32 : 0.05, n = Math.round(d * SR), x = new Float32Array(n); let p0 = 0, p1 = 0; for (let i = 0; i < n; i++) { const w = rnd(), hp = w - 2 * p0 + p1; p1 = p0; p0 = w; x[i] = hp * 0.5 * Math.exp(-i / SR * (open ? 11 : 70)) * Math.min(1, (n - i) / (0.01 * SR)); } add(t, x, g * 0.9, g); (open ? T.hatO : T.hatC).push(t); },
    bass(t, m, d, g, sub) { const f = hz(m), n = Math.round(d * SR), x = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const u = i / SR, e = Math.min(1, u / 0.006) * Math.exp(-u * (sub ? 0.8 : 3.5)) * Math.min(1, (n - i) / (0.012 * SR)); let v; if (sub) v = Math.sin(2 * Math.PI * f * u) + 0.25 * Math.sin(4 * Math.PI * f * u); else { const sw = 2 * ((f * u) % 1) - 1; lp += 0.12 * (sw - lp); v = lp * 1.6; } x[i] = v * e; } add(t, x, g); T.bass.push({t, m, d}); },
    pad(t, ch, d, g) { const n = Math.round(d * SR), x = new Float32Array(n); for (let i = 0; i < n; i++) { const u = i / SR, e = Math.min(1, u / 0.2) * Math.min(1, (d - u) / 0.1); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * u + m) + 0.22 * Math.sin(2 * Math.PI * hz(m) * 2.003 * u); x[i] = v * e; } add(t, x, g * 0.9, g * 1.1); }
  };
  return {N, I, T, fin: (o) => Object.assign({wav: wav(L, R, N), truth: T, SR}, o)};
}
// 80 BPM, Shuffle (16tel-Swing 60 %), Ghost-Notes, Bass gleichzeitig mit jedem Kick, sehr leises echtes Bass-Intro (-20 dB, nur Bass + Flaeche),
// Outro nur Flaeche (kein Bass, keine Drums). I4 S8 R8 O2
export function p80() {
  const BPM = 80, BEAT = 60 / BPM, BAR = 4 * BEAT, ST = BEAT / 4, OFF = 0.35, PLAN = [['I', 4], ['S', 8], ['R', 8], ['O', 2]], BARS = 22, M = bau(OFF + BARS * BAR + 1.5, 80);
  const sw = s => s * ST + (s % 2 ? 0.2 * ST : 0);   // Swing: ungerade 16tel spaeter (60 %)
  const CH = [[52, 55, 59], [48, 52, 55], [50, 53, 57], [47, 50, 55]]; let b0 = 0;
  for (const [P, nb] of PLAN) {
    M.T.parts.push({p: P, a: b0, b: b0 + nb}); const ld = P === 'R' ? 1.2 : 1;
    for (let k = 0; k < nb; k++) {
      const t0 = OFF + (b0 + k) * BAR, ch = CH[k % 4], root = ch[0] - 24;
      M.I.pad(t0, ch.map(m => m + 12), BAR, P === 'O' ? 0.03 : 0.025);
      if (P === 'I') { for (const [q, d] of [[0, 2.8], [3, 0.9]]) M.I.bass(t0 + q * BEAT, root, d * BEAT, 0.22 * 0.1); continue; }   // -20 dB
      if (P === 'O') continue;
      const kicks = [0, 6, 8, P === 'R' ? 11 : 10];   // 1, 2-und-, 3, Synkope
      for (const s of kicks) { M.I.kick(t0 + sw(s), 0.55 * ld); M.I.bass(t0 + sw(s), root + (s === 8 ? 7 : 0), ST * 2.6, 0.2); }   // Bass gleichzeitig mit Kick
      for (const s of [4, 12]) M.I.snare(t0 + sw(s), 0.42 * ld);
      for (const s of [7, 9, 15]) M.I.snare(t0 + sw(s), 0.06 * ld, true);   // Ghost-Notes ~ -17 dB
      for (let s = 0; s < 16; s++) { if (P === 'R' && s === 14) { M.I.hat(t0 + sw(s), 0.12, true); continue; } if (P === 'R' && s === 15) continue; M.I.hat(t0 + sw(s), s % 4 === 0 ? 0.11 : 0.07); }
    }
    b0 += nb;
  }
  return M.fin({name: 'p80', BPM, BAR, BEAT, OFF, BARS, swing: 0.2 * ST});
}
// 128 BPM, 4 auf den Boden, Bass auf jedem Kick + Offbeat, offene Hi-Hat auf jedem „und“, 16tel geschlossen, Clap/Snare 2+4,
// sehr leises Intro (alles -22 dB, Drums + Bass), Outro ohne Bass (Drums + Flaeche). Kick lang (Abklingen langsam). I4 S8 R8 O4
export function p128() {
  const BPM = 128, BEAT = 60 / BPM, BAR = 4 * BEAT, ST = BEAT / 4, OFF = 0.5, PLAN = [['I', 4], ['S', 8], ['R', 8], ['O', 4]], BARS = 24, M = bau(OFF + BARS * BAR + 1.5, 128);
  const CH = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 55, 59]]; let b0 = 0;
  for (const [P, nb] of PLAN) {
    M.T.parts.push({p: P, a: b0, b: b0 + nb}); const v = P === 'I' ? 0.08 : P === 'R' ? 1.15 : 1;
    for (let k = 0; k < nb; k++) {
      const t0 = OFF + (b0 + k) * BAR, ch = CH[k % 4], root = ch[0] - 24;
      M.I.pad(t0, ch, BAR, 0.03 * (P === 'I' ? 0.08 / 0.08 * 0.3 : 1));
      for (let q = 0; q < 4; q++) M.I.kick(t0 + q * BEAT, 0.5 * v, 7);
      if (P !== 'O') for (let q = 0; q < 8; q++) M.I.bass(t0 + q * BEAT / 2, root + (q % 2 ? 12 : 0), BEAT / 2 * 0.85, 0.2 * v);
      for (const q of [1, 3]) M.I.snare(t0 + q * BEAT, 0.38 * v);
      for (let s = 0; s < 16; s++) { if (s % 4 === 2) M.I.hat(t0 + s * ST, 0.1 * v, true); else M.I.hat(t0 + s * ST, (s % 2 ? 0.05 : 0.08) * v); }
    }
    b0 += nb;
  }
  return M.fin({name: 'p128', BPM, BAR, BEAT, OFF, BARS});
}
// 174 BPM, Zweischritt (Kick 1 + 3-und, Snare 2 + 4, Ghost-Notes), 8tel-Hats + offene Hat, Sub-Bass lang und gleichzeitig mit Kick,
// Intro nur Drums (kein Bass – Kick-Reste in der Bass-Ebene?), Outro nur Flaeche. I4 S16 R16 O4
export function p174() {
  const BPM = 174, BEAT = 60 / BPM, BAR = 4 * BEAT, ST = BEAT / 4, OFF = 0.4, PLAN = [['I', 4], ['S', 16], ['R', 16], ['O', 4]], BARS = 40, M = bau(OFF + BARS * BAR + 1.5, 174);
  const CH = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52]]; let b0 = 0;
  for (const [P, nb] of PLAN) {
    M.T.parts.push({p: P, a: b0, b: b0 + nb}); const ld = P === 'R' ? 1.15 : 1;
    for (let k = 0; k < nb; k++) {
      const t0 = OFF + (b0 + k) * BAR, ch = CH[Math.floor(k / 2) % 4], root = ch[0] - 24;
      M.I.pad(t0, ch.map(m => m + 12), BAR, 0.028);
      if (P === 'O') continue;
      for (const s of [0, 10]) M.I.kick(t0 + s * ST, 0.55 * ld, 14);
      if (P !== 'I') { M.I.bass(t0, root, ST * 9.6, 0.24, true); M.I.bass(t0 + 10 * ST, root + (k % 2 ? 3 : 5), ST * 5.6, 0.24, true); }
      for (const s of [4, 12]) M.I.snare(t0 + s * ST, 0.42 * ld);
      for (const s of [7, 14]) M.I.snare(t0 + s * ST, 0.07 * ld, true);
      for (let s = 0; s < 16; s += 2) { if (P === 'R' && s === 6) M.I.hat(t0 + s * ST, 0.11, true); else M.I.hat(t0 + s * ST, 0.08); }
    }
    b0 += nb;
  }
  return M.fin({name: 'p174', BPM, BAR, BEAT, OFF, BARS});
}
export const LIEDER = {p80, p128, p174};
