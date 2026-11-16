// Mischpult 0.1 – messen.js: Filter (RBJ-Biquads), BS.1770-5 Lautheit (K-Gewichtung, Gating), LRA (EBU Tech 3342),
// True-Peak (Polyphasen-Überabtastung 4×/8×), Korrelation, Übersteuerungs-Folgen, FFT/Terzbänder, Ampel (methodik 6.1).
// Eigene Umsetzung. Formeln der Biquads wie `bq` in mixaDspMake (Synquenzer 4.76.1, index.html Zeile 66353 ff.).
import { R } from './regeln.js';

export const db = x => 20 * Math.log10(Math.max(x, 1e-12));
export const pdb = x => 10 * Math.log10(Math.max(x, 1e-24));
export const lin = d => Math.pow(10, d / 20);

// ---------- Biquads ----------
/** Koeffizienten [b0,b1,b2,a1,a2] (normiert). typ: lp | hp | bp (0 dB Spitze) | peak | lowshelf | highshelf */
export function bqKoeff(typ, f, sr, q = Math.SQRT1_2, gdb = 0) {
  const w = 2 * Math.PI * Math.min(f, sr * 0.49) / sr, cw = Math.cos(w), sw = Math.sin(w), A = Math.pow(10, gdb / 40), al = sw / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (typ === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (typ === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (typ === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
  else if (typ === 'peak') { b0 = 1 + al * A; b1 = -2 * cw; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cw; a2 = 1 - al / A; }
  else if (typ === 'lowshelf') { const s = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) - (A - 1) * cw + s); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - s); a0 = (A + 1) + (A - 1) * cw + s; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - s; }
  else if (typ === 'highshelf') { const s = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * cw + s); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - s); a0 = (A + 1) - (A - 1) * cw + s; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s; }
  else throw new Error('bq typ ' + typ);
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}
/** Betrag des Frequenzgangs in dB bei f. */
export function bqDb(k, f, sr) {
  const w = 2 * Math.PI * f / sr, c1 = Math.cos(w), s1 = Math.sin(w), c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);
  const nr = k[0] + k[1] * c1 + k[2] * c2, ni = -(k[1] * s1 + k[2] * s2), dr = 1 + k[3] * c1 + k[4] * c2, di = -(k[3] * s1 + k[4] * s2);
  return 10 * Math.log10((nr * nr + ni * ni) / Math.max(dr * dr + di * di, 1e-30));
}
/** Stereo-Biquad mit Zustand (TDF-II, Float64-Zustand). run(L, R, n) rechnet an Ort und Stelle. */
export class Bq2 {
  constructor(k) { this.k = k; this.l1 = this.l2 = this.r1 = this.r2 = 0; }
  run(L, R, n = L.length) {
    const [b0, b1, b2, a1, a2] = this.k; let l1 = this.l1, l2 = this.l2, r1 = this.r1, r2 = this.r2;
    for (let i = 0; i < n; i++) {
      const x = L[i], y = b0 * x + l1; l1 = b1 * x - a1 * y + l2; l2 = b2 * x - a2 * y; L[i] = y;
      const u = R[i], v = b0 * u + r1; r1 = b1 * u - a1 * v + r2; r2 = b2 * u - a2 * v; R[i] = v;
    }
    this.l1 = l1; this.l2 = l2; this.r1 = r1; this.r2 = r2;
  }
}
/** Mono-Biquad, Probe für Probe. */
export class Bq1 {
  constructor(k) { this.k = k; this.z1 = this.z2 = 0; }
  x(x) { const k = this.k, y = k[0] * x + this.z1; this.z1 = k[1] * x - k[3] * y + this.z2; this.z2 = k[2] * x - k[4] * y; return y; }
  run(X, n = X.length) { for (let i = 0; i < n; i++) X[i] = this.x(X[i]); }
}

// ---------- K-Gewichtung (methodik messung.kFilter, jede Rate per bilinearer Transformation) ----------
export function kKoeff(sr) {
  const kf = R.messung.kFilter, s1 = kf.stufe1HighShelf, s2 = kf.stufe2Hochpass;
  let K = Math.tan(Math.PI * s1.f0Hz / sr); const Vh = Math.pow(10, s1.gainDb / 20), Vb = Math.pow(Vh, 0.4996667741545416), Q = s1.q;
  let a0 = 1 + K / Q + K * K;
  const k1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0];
  K = Math.tan(Math.PI * s2.f0Hz / sr); a0 = 1 + K / s2.q + K * K;
  const k2 = [1, -2, 1, 2 * (K * K - 1) / a0, (1 - K / s2.q + K * K) / a0];
  return [k1, k2];
}

/**
 * BS.1770-5 Lautheit, stückweise: new Lautheit(sr); .feed(L, R[, n]); .integriert(); .lra(); .kurzzeitReihe(); .momentanReihe()
 * Intern: mittlere K-Energie je 100 ms (Schritt), Blöcke 400 ms (4 Schritte, 75 % Überlappung), Kurzzeit 3 s (30 Schritte).
 */
export class Lautheit {
  constructor(sr) {
    this.sr = sr; const [k1, k2] = kKoeff(sr); this.f1 = new Bq1(k1); this.f2 = new Bq1(k2); this.g1 = new Bq1(k1); this.g2 = new Bq1(k2);
    this.schritt = Math.round(sr / 10); this.acc = 0; this.cnt = 0; this.e = new Float64Array(1024); this.ne = 0;
  }
  feed(L, R, n = L.length) {
    const f1 = this.f1, f2 = this.f2, g1 = this.g1, g2 = this.g2, S = this.schritt; let acc = this.acc, cnt = this.cnt;
    for (let i = 0; i < n; i++) {
      const a = f2.x(f1.x(L[i])), b = g2.x(g1.x(R[i]));
      acc += a * a + b * b;
      if (++cnt === S) { this._push(acc / S); acc = 0; cnt = 0; }
    }
    this.acc = acc; this.cnt = cnt;
  }
  _push(z) { if (this.ne === this.e.length) { const e = new Float64Array(this.e.length * 2); e.set(this.e); this.e = e; } this.e[this.ne++] = z; }
  /** Energien je 400-ms-Block (Schritt 100 ms). */
  bloecke(w = 4) { const n = this.ne - w + 1, out = new Float64Array(Math.max(0, n)); let s = 0; for (let j = 0; j < this.ne; j++) { s += this.e[j]; if (j >= w) s -= this.e[j - w]; if (j >= w - 1) out[j - w + 1] = s / w; } return out; }
  static lufs(z) { return -0.691 + pdb(z); }
  integriert() {
    const B = this.bloecke(4), absZ = Math.pow(10, (-70 + 0.691) / 10); let s = 0, n = 0;
    for (const z of B) if (z > absZ) { s += z; n++; }
    if (!n) return -Infinity;
    const rel = Math.pow(10, (Lautheit.lufs(s / n) - 10 + 0.691) / 10); s = 0; n = 0;
    for (const z of B) if (z > absZ && z > rel) { s += z; n++; }
    return n ? Lautheit.lufs(s / n) : -Infinity;
  }
  kurzzeitReihe() { return Array.from(this.bloecke(30), Lautheit.lufs); }
  momentanReihe() { return Array.from(this.bloecke(4), Lautheit.lufs); }
  lra() {
    const S = this.bloecke(30), absZ = Math.pow(10, (-70 + 0.691) / 10), ok = []; let s = 0;
    for (const z of S) if (z > absZ) { ok.push(z); s += z; }
    if (ok.length < 2) return 0;
    const rel = Math.pow(10, (Lautheit.lufs(s / ok.length) - 20 + 0.691) / 10);
    const L = ok.filter(z => z > rel).map(Lautheit.lufs).sort((a, b) => a - b);
    if (L.length < 2) return 0;
    const q = p => L[Math.min(L.length - 1, Math.max(0, Math.round(p * (L.length - 1))))];
    return q(R.messung.lra.perzentilOben) - q(R.messung.lra.perzentilUnten);
  }
}

// ---------- True-Peak: Polyphasen-Interpolation (gefenstertes sinc, Kaiser) ----------
function besselI0(x) { let s = 1, t = 1; for (let k = 1; k < 30; k++) { t *= (x / (2 * k)) * (x / (2 * k)); s += t; } return s; }
const TP_PLAN = new Map();
export function tpPlan(F, T, beta = 8) {
  const key = F * 1000 + T + beta / 100; let p = TP_PLAN.get(key); if (p) return p;
  const c = new Float64Array(F * T), I0b = besselI0(beta);
  for (let ph = 0; ph < F; ph++) {
    let s = 0;
    for (let j = 0; j < T; j++) {
      const tau = T / 2 - 1 - j + ph / F, u = tau / (T / 2), w = Math.abs(u) >= 1 ? 0 : besselI0(beta * Math.sqrt(1 - u * u)) / I0b;
      const si = tau === 0 ? 1 : Math.sin(Math.PI * tau) / (Math.PI * tau); c[ph * T + j] = si * w; s += si * w;
    }
    for (let j = 0; j < T; j++) c[ph * T + j] /= s;
  }
  let S1 = 0; for (let ph = 0; ph < F; ph++) { let a = 0; for (let j = 0; j < T; j++) a += Math.abs(c[ph * T + j]); if (a > S1) S1 = a; }
  p = { F, T, c, S1 }; TP_PLAN.set(key, p); return p;
}
/** Detektor für einen Kanal: x(v) liefert das Maximum |Zwischenwert| über alle Phasen für die Probe vor T/2 Proben. */
export class TpKanal {
  constructor(F = 8, T = 32, beta = 8) { this.p = tpPlan(F, T, beta); this.h = new Float64Array(2 * T); this.i = 0; }
  x(v) {
    const { F, T, c } = this.p, h = this.h; let i = this.i; h[i] = v; h[i + T] = v; i = (i + 1) % T; this.i = i;
    let m = 0;
    for (let ph = 0; ph < F; ph++) { let s = 0; const o = ph * T; for (let j = 0; j < T; j++) s += c[o + j] * h[i + j]; const a = s < 0 ? -s : s; if (a > m) m = a; }
    return m;
  }
  /** nur in den Verlauf schieben (wenn eine Schranke zeigt, dass der Wert nicht gebraucht wird) */
  schiebe(v) { const T = this.p.T, h = this.h; h[this.i] = v; h[this.i + T] = v; this.i = (this.i + 1) % T; }
}
/** Schnelle Schranke je Block (32 Proben): |Zwischenwert| ≤ S1 · max|x| im Fenster. Liefert je Block die Schranke. */
export class TpSchranke {
  constructor(S1, T) { this.S1 = S1; this.T = T; this.prev = 0; }
  block(L, R, o, e) { let bm = 0; for (let i = o; i < e; i++) { const u = L[i] < 0 ? -L[i] : L[i], v = R[i] < 0 ? -R[i] : R[i]; if (u > bm) bm = u; if (v > bm) bm = v; } const s = Math.max(bm, this.prev) * this.S1; this.prev = e - o >= this.T ? bm : Math.max(bm, this.prev); return s; }
}
/** True-Peak eines Stereo-Stroms: new TruePeak(sr, faktor); .feed(L, R); .spitzeDb */
export class TruePeak {
  constructor(sr, faktor = 8) {
    // 0.1.1: immer genau messen – 8× mit 32 Abgriffen je Phase (Kaiser β 8). Fehler gegen ideale Interpolation < 0,05 dB,
    // auch an Einzelimpulsen und 19-kHz-Bursts (vorher 4×/12 bzw. 8×/16: an Einzelimpulsen −0,35 bzw. −0,11 dB zu niedrig).
    faktor = Math.max(8, faktor);
    const F = sr > 192000 ? 2 : sr > 96000 ? 4 : faktor; // methodik truePeak.faktorNachRate
    this.F = F; this.T = 32; this.a = new TpKanal(F, this.T, 8); this.b = new TpKanal(F, this.T, 8); this.max = 0; this.sch = new TpSchranke(this.a.p.S1, this.T);
  }
  feed(L, R, n = L.length) {
    let m = this.max; const a = this.a, b = this.b;
    for (let o = 0; o < n; o += 32) {
      const e = Math.min(n, o + 32);
      if (this.sch.block(L, R, o, e) <= m) { for (let i = o; i < e; i++) { a.schiebe(L[i]); b.schiebe(R[i]); } continue; }
      for (let i = o; i < e; i++) { const x = a.x(L[i]), y = b.x(R[i]); if (x > m) m = x; if (y > m) m = y; }
    }
    this.max = m;
  }
  ende() { const z = new Float32Array(this.T); this.feed(z, z); return this; }
  get spitze() { return this.max; }
  get spitzeDb() { return db(this.max); }
}

// ---------- Kleinzeug ----------
/** Übersteuerungs-Folgen: ≥ 2 aufeinanderfolgende Proben |x| ≥ 0,999 je Kanal (methodik pruefung.clipping). */
export class ClipZaehler {
  constructor(schwelle = 0.999) { this.s = schwelle; this.runL = 0; this.runR = 0; this.folgen = 0; this.spitze = 0; this.dcL = 0; this.dcR = 0; this.n = 0; this.qL = 0; this.qR = 0; }
  feed(L, R, n = L.length) {
    const s = this.s; let rl = this.runL, rr = this.runR, f = this.folgen, sp = this.spitze, dl = 0, dr = 0, ql = 0, qr = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.abs(L[i]), b = Math.abs(R[i]); if (a > sp) sp = a; if (b > sp) sp = b;
      if (a >= s) { if (++rl === 2) f++; } else rl = 0;
      if (b >= s) { if (++rr === 2) f++; } else rr = 0;
      dl += L[i]; dr += R[i]; ql += L[i] * L[i]; qr += R[i] * R[i];
    }
    this.runL = rl; this.runR = rr; this.folgen = f; this.spitze = sp; this.dcL += dl; this.dcR += dr; this.qL += ql; this.qR += qr; this.n += n;
  }
  get dc() { return this.n ? Math.max(Math.abs(this.dcL), Math.abs(this.dcR)) / this.n : 0; }
  get lrBalanceDb() { return this.qL > 0 && this.qR > 0 ? Math.abs(pdb(this.qL) - pdb(this.qR)) : 0; }
}
/** Korrelation L/R gesamt und unter 150 Hz (LR4-Tiefpass). */
export class Korrelation {
  constructor(sr) { this.s = [0, 0, 0, 0, 0, 0]; const k = bqKoeff('lp', 150, sr); this.f = [new Bq2(k), new Bq2(k)]; this.tl = null; }
  feed(L, R, n = L.length) {
    if (!this.tl || this.tl.length < n) { this.tl = new Float32Array(n); this.tr = new Float32Array(n); }
    const tl = this.tl, tr = this.tr; tl.set(L.subarray(0, n)); tr.set(R.subarray(0, n)); this.f[0].run(tl, tr, n); this.f[1].run(tl, tr, n);
    const s = this.s;
    for (let i = 0; i < n; i++) { const a = L[i], b = R[i], c = tl[i], d = tr[i]; s[0] += a * a; s[1] += b * b; s[2] += a * b; s[3] += c * c; s[4] += d * d; s[5] += c * d; }
  }
  static r(aa, bb, ab) { return aa > 1e-12 && bb > 1e-12 ? ab / Math.sqrt(aa * bb) : 1; }
  get gesamt() { return Korrelation.r(this.s[0], this.s[1], this.s[2]); }
  get tief() { return Korrelation.r(this.s[3], this.s[4], this.s[5]); }
}

// ---------- FFT (Radix 2, komplex, an Ort und Stelle) ----------
const FFT_PLAN = new Map();
function fftPlan(n) {
  let p = FFT_PLAN.get(n); if (p) return p;
  const rev = new Uint32Array(n), cs = new Float64Array(n / 2), sn = new Float64Array(n / 2), win = new Float64Array(n); let bits = 0; while ((1 << bits) < n) bits++;
  for (let i = 0; i < n; i++) { let r = 0, v = i; for (let b = 0; b < bits; b++) { r = (r << 1) | (v & 1); v >>= 1; } rev[i] = r; }
  for (let i = 0; i < n / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
  for (let i = 0; i < n; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n);
  p = { n, rev, cs, sn, win }; FFT_PLAN.set(n, p); return p;
}
export function fft(re, im) {
  const n = re.length, { rev, cs, sn } = fftPlan(n);
  for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let size = 2; size <= n; size <<= 1) {
    const h = size >> 1, st = n / size;
    for (let i = 0; i < n; i += size) for (let j = 0, k = 0; j < h; j++, k += st) {
      const a = i + j, b = a + h, tr = re[b] * cs[k] - im[b] * sn[k], ti = re[b] * sn[k] + im[b] * cs[k];
      re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
    }
  }
}
export const hann = n => fftPlan(n).win;

/** Matrix Bin → Band (anteilig nach Überdeckung), für Terz- oder Oktavbänder. */
export function bandMatrix(mitten, teilOkt, n, sr) {
  const bw = sr / n, nb = n / 2 + 1, M = [];
  for (const fc of mitten) {
    const lo = fc * Math.pow(2, -teilOkt / 2), hi = Math.min(fc * Math.pow(2, teilOkt / 2), sr / 2), e = [];
    for (let k = 1; k < nb; k++) { const a = (k - 0.5) * bw, b = (k + 0.5) * bw, ov = Math.min(b, hi) - Math.max(a, lo); if (ov > 0) e.push(k, ov / bw); }
    M.push(e);
  }
  return M;
}

// ---------- Ampel (methodik 6.1 → nur Grün/Gelb, Konzept 0.4) ----------
const zahl = (x, d = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d).replace('.', ',');
export { zahl };
/** ampel({lufs, tp, clip, lra, plr, korr, korrTief, monoVerlust, lrBalance, dc}, {lufs, tp_dbtp}) → [{mass, wert, farbe, satz}] */
export function ampel(m, ziel) {
  const out = [], add = (mass, wert, gut, satzGut, satzHinweis) => out.push({ mass, wert, farbe: gut ? 'gruen' : 'gelb', satz: gut ? satzGut : satzHinweis });
  if (m.clip != null) add('uebersteuerung', m.clip, m.clip === 0, 'keine Übersteuerung', `Übersteuert an ${m.clip} Stellen`);
  if (m.tp != null) add('true_peak', +m.tp.toFixed(2), m.tp <= ziel.tp_dbtp + 1e-9, 'Spitzen in Ordnung', m.tp > 0 ? 'Spitzen über 0 dB – das ist das Rot im Videoschnitt' : 'Spitzen etwas zu hoch');
  if (m.lufs != null && isFinite(m.lufs)) { const d = m.lufs - ziel.lufs; add('lautheit', +m.lufs.toFixed(2), Math.abs(d) <= 0.5, 'Lautheit passt', `Lautheit ${zahl(Math.abs(d))} dB ${d > 0 ? 'zu laut' : 'zu leise'}`); }
  if (m.plr != null) add('plr', +m.plr.toFixed(2), m.plr >= 9, 'Dynamik in Ordnung', 'Sehr dicht – Wucht geht verloren');
  if (m.lra != null) add('lra', +m.lra.toFixed(2), m.lra >= 3 && m.lra <= 10, 'Lautstärke-Verlauf in Ordnung', m.lra < 3 ? 'Kaum Dynamik' : 'Sehr große Lautstärke-Sprünge');
  if (m.korr != null) add('korrelation', +m.korr.toFixed(2), m.korr >= 0.2, 'Stereo in Ordnung', 'Klang löscht sich in Mono teilweise aus');
  if (m.korrTief != null) add('korrelation_tief', +m.korrTief.toFixed(2), m.korrTief >= 0.9, 'Bass mittig', 'Bass nicht mittig');
  if (m.monoVerlust != null) add('mono_verlust', +m.monoVerlust.toFixed(2), m.monoVerlust >= -3, 'Mono in Ordnung', 'Am Handy-Lautsprecher fehlt etwas');
  if (m.lrBalance != null) add('lr_balance', +m.lrBalance.toFixed(2), m.lrBalance <= 0.8, 'Links/rechts ausgeglichen', 'Hängt etwas nach einer Seite');
  if (m.dc != null) add('dc', +m.dc.toFixed(5), m.dc <= 0.001, 'kein Gleichanteil', 'Gleichanteil im Signal');
  return out;
}
