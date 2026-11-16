// Mischpult 0.2 – fingerabdruck.js: Messwerte je Datei für „Messwerte an Claude senden“ (Format mischpult-messwerte/1).
// Kein DOM; läuft im Worker (messwerte-worker.js) und in Node (Tests). Eigene Umsetzung, ein Durchlauf, stückweise.
// Datenschutz: nur grobe Messwerte – Pegel, 1/6-Oktav-Bänder je 250 ms in ganzen dB, RMS je 50 ms (ganze dB), Stereo je 500 ms
// in 3 Bändern, Einschwing-Zeitpunkte, Ausklang-Schätzung. Keine Proben, keine Phasen, kein Spektrum feiner als 1/6 Oktave oder
// 250 ms, keine Reihe unter 50 ms → kein Ton rekonstruierbar (Bandreihe ≥ 250 ms: auch ein Rausch-Vocoder bleibt unverständlich).
import { Lautheit, TpKanal, TpSchranke, fft, hann, bandMatrix, bqKoeff, Bq2 } from './messen.js';
import { lesKopf, lesStuecke } from './wav.js';

export const FORMAT = 'mischpult-messwerte/1';
const K0 = -34, K1 = 26;   // Mitten 1000·2^(k/6): 19,7 Hz … 20,2 kHz → 61 Bänder (1/6 Oktave)
export const MITTEN = Array.from({ length: K1 - K0 + 1 }, (_, i) => 1000 * Math.pow(2, (K0 + i) / 6));
const NB = MITTEN.length, TIEF_BIS = 200;   // Bänder unter 200 Hz im Mittelwert aus dem langen Fenster (feiner aufgelöst)
const NT = MITTEN.filter((f) => f < TIEF_BIS).length;
const DB_SINUS = 10 * Math.log10(2);   // +3,01 dB: ein Sinus mit Spitze x dBFS zeigt in seinem Band x dB
const SCHWELLE = 0.001;                // −60 dBFS: erster/letzter Ton
const pdb = (x) => 10 * Math.log10(x);
const q8 = (d) => (!(d > -127.5) ? -128 : d > 127 ? 127 : Math.round(d));
const rd = (x, s = 100) => (x == null || !isFinite(x) ? null : Math.round(x * s) / s);

/** Int8/Uint8 → Base64 (ohne Abhängigkeiten; Worker, Seite, Node). */
export function b64(a) {
  const u8 = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
/** Base64 → Int8Array (für Tests und für die Auswertung). */
export function int8(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Int8Array(u.buffer); }

/** True-Peak nach BS.1770 (4× bis 48 kHz, 2× bis 96 kHz, darüber Probenspitze); 32 Abgriffe je Phase (Kaiser β 8).
 *  Schneller als die 8×-Messung im Kern: genau gerechnet werden nur Blöcke, deren Proben-Spitze höchstens 3 dB unter der
 *  bisherigen Spitze liegt (Überschwinger zwischen Proben von mehr als 3 dB kommen in Musik praktisch nicht vor). */
class TpMess {
  constructor(sr) { this.F = sr <= 48000 ? 4 : sr <= 96000 ? 2 : 1; this.max = 0; if (this.F > 1) { this.a = new TpKanal(this.F, 32, 8); this.b = new TpKanal(this.F, 32, 8); this.sch = new TpSchranke(Math.pow(10, 3 / 20), 32); } }
  feed(L, R, n, probenSpitze) {
    let m = Math.max(this.max, probenSpitze);
    if (this.F === 1) { this.max = m; return; }
    const a = this.a, b = this.b;
    for (let o = 0; o < n; o += 32) {
      const e = Math.min(n, o + 32);
      if (this.sch.block(L, R, o, e) <= m) { for (let i = o; i < e; i++) { a.schiebe(L[i]); b.schiebe(R[i]); } continue; }
      for (let i = o; i < e; i++) { const x = a.x(L[i]), y = b.x(R[i]); if (x > m) m = x; if (y > m) m = y; }
    }
    this.max = m;
  }
  ende(probenSpitze) { if (this.F > 1) { const z = new Float32Array(32); this.feed(z, z, 32, probenSpitze); } this.max = Math.max(this.max, probenSpitze); }
  get spitzeDb() { return this.max > 0 ? 20 * Math.log10(this.max) : -Infinity; }
}

const median = (a, p = 0.5) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };

export class Fingerabdruck {
  constructor(kopf) {
    const sr = kopf.sr; this.sr = sr; this.kopf = kopf; this.frames = kopf.frames; this.mono = kopf.ch === 1; this.pos = 0;
    // Pegel
    this.lh = new Lautheit(sr); this.tp = new TpMess(sr);
    this.spitze = 0; this.erste = -1; this.letzte = -1; this.qs = 0; this.clip = 0; this.runL = 0; this.runR = 0;
    // RMS je 50 ms
    this.b20 = Math.max(1, Math.round(sr * 0.05)); this.rms20 = new Int8Array(Math.max(1, Math.ceil(this.frames / this.b20)));
    this.a20 = 0; this.c20 = 0; this.i20 = 0; this.aktivN = 0; this.aktivQs = 0;
    // 1-ms-Hüllkurven: Einsätze aus tief (30–150 Hz), mitte (> 150 Hz), hoch (> 2,5 kHz); Ausklang aus der Stereo-Leistung; Spitze
    this.b1 = Math.max(1, Math.round(sr / 1000)); const n1 = Math.ceil(this.frames / this.b1) + 2;
    this.eT = new Float32Array(n1); this.eM = new Float32Array(n1); this.eH = new Float32Array(n1); this.eV = new Float32Array(n1); this.pk = new Float32Array(n1);
    this.i1 = 0; this.c1 = 0; this.s1 = [0, 0, 0, 0, 0];
    this.kT = bqKoeff('lp', 150, sr); this.kT0 = bqKoeff('hp', 30, sr); this.kM = bqKoeff('hp', 150, sr); this.kH = bqKoeff('hp', 2500, sr); this.z = new Float64Array(14);   // Biquad-Zustände
    // Kurzzeit-Spektrum: Hann ≈ 340 ms, alle 250 ms, L und R in einer komplexen FFT
    this.hop = Math.max(1, Math.round(sr / 4)); let N = 1024; while (N < sr * 0.3) N *= 2;
    this.N = N; this.win = hann(N); let w2 = 0; for (let i = 0; i < N; i++) w2 += this.win[i] * this.win[i]; this.skal = 2 / (N * w2);
    this.nFr = Math.max(1, Math.ceil(this.frames / this.hop)); this.spek = new Int8Array(this.nFr * NB); this.fr = 0;
    this.cap = N + (1 << 17) + this.hop; this.bL = new Float32Array(this.cap); this.bR = new Float32Array(this.cap);
    this.fuell = (N >> 1) - (this.hop >> 1);   // Rahmen j ist um j·250 ms + 125 ms zentriert (Anfang mit Stille aufgefüllt)
    this.re = new Float64Array(N); this.im = new Float64Array(N);
    this.pl = new Float64Array(N / 2 + 1); this.pr = new Float64Array(N / 2 + 1); this.cc = new Float64Array(N / 2 + 1);
    this.BM = bandMatrix(MITTEN, 1 / 6, N, sr); this.mSum = new Float64Array(NB);
    // Stereo je 500 ms in drei Bändern (tief < 150 Hz, mitte, hoch > 4 kHz)
    this.grp = new Uint8Array(N / 2 + 1);
    for (let k = 0; k <= N / 2; k++) { const f = k * sr / N; this.grp[k] = k === 0 || f > 20000 ? 3 : f < 150 ? 0 : f < 4000 ? 1 : 2; }
    this.st = new Float64Array(9); this.stG = new Float64Array(9); this.stN = 0;
    this.stJe = 2; this.stReihe = new Int8Array(Math.ceil(this.nFr / this.stJe) * 6); this.stI = 0;   // 2 Rahmen = 500 ms
    // Tiefe Bänder (< 200 Hz) für den Mittelwert: auf ≈ 6 kHz heruntergetastet, Fenster ≈ 0,7 s, 50 % Überlappung
    this.D = Math.max(1, Math.round(sr / 6000)); const srD = sr / this.D; let N2 = 1024; while (N2 < srD * 0.6) N2 *= 2;
    this.N2 = N2; this.win2 = hann(N2); let w22 = 0; for (let i = 0; i < N2; i++) w22 += this.win2[i] * this.win2[i]; this.skal2 = 2 / (N2 * w22);
    const kD = bqKoeff('lp', 1000, sr); this.dek = [new Bq2(kD), new Bq2(kD)];   // 4. Ordnung: bei 5,8 kHz −61 dB (Spiegelung unter 200 Hz)
    this.dL = new Float32Array(N2); this.dR = new Float32Array(N2); this.dFuell = 0; this.dPhase = 0;
    this.BM2 = bandMatrix(MITTEN.slice(0, NT), 1 / 6, N2, srD); this.tSum = new Float64Array(NT); this.tFr = 0;
    this.re2 = new Float64Array(N2); this.im2 = new Float64Array(N2); this.tmpL = null; this.tmpR = null;
  }

  feed(L, R, n = L.length) {
    const b20 = this.b20, b1 = this.b1, rms20 = this.rms20, eT = this.eT, eM = this.eM, eV = this.eV, eH = this.eH, pk = this.pk;
    const pos = this.pos, [tb0, tb1, tb2, ta1, ta2] = this.kT, [hb0, hb1, hb2, ha1, ha2] = this.kH, [ob0, ob1, ob2, oa1, oa2] = this.kT0, [mb0, mb1, mb2, ma1, ma2] = this.kM, zz = this.z;
    let x1 = zz[0], x2 = zz[1], y1 = zz[2], y2 = zz[3], u1 = zz[4], u2 = zz[5], v1 = zz[6], v2 = zz[7], o1 = zz[8], o2 = zz[9], w1 = zz[10], w2 = zz[11];
    let spitze = this.spitze, erste = this.erste, letzte = this.letzte, qs = this.qs, clip = this.clip, runL = this.runL, runR = this.runR;
    let a20 = this.a20, c20 = this.c20, i20 = this.i20, aktivN = this.aktivN, aktivQs = this.aktivQs;
    let i1 = this.i1, c1 = this.c1, sT = this.s1[0], sV = this.s1[1], sH = this.s1[2], sP = this.s1[3], sM = this.s1[4];
    for (let i = 0; i < n; i++) {
      const l = L[i], r = R[i], al = l < 0 ? -l : l, ar = r < 0 ? -r : r, a = al > ar ? al : ar;
      if (a > spitze) spitze = a;
      if (a > SCHWELLE) { if (erste < 0) erste = pos + i; letzte = pos + i; }
      if (al >= 0.999) { if (++runL === 2) clip++; } else runL = 0;
      if (ar >= 0.999) { if (++runR === 2) clip++; } else runR = 0;
      const p = (l * l + r * r) * 0.5; qs += p; a20 += p;
      if (++c20 === b20) { const ms = a20 / b20; rms20[i20++] = ms > 0 ? q8(pdb(ms)) : -128; if (ms > 1e-6) { aktivN += b20; aktivQs += a20; } a20 = 0; c20 = 0; }
      const m = (l + r) * 0.5;   // Biquads TDF-II: tief = Hochpass 30 Hz + 2 × Tiefpass 150 Hz, mitte = Hochpass 150 Hz, hoch = 2 × Hochpass 2,5 kHz
      const to = ob0 * m + o1; o1 = ob1 * m - oa1 * to + o2; o2 = ob2 * m - oa2 * to;
      const mm = mb0 * m + w1; w1 = mb1 * m - ma1 * mm + w2; w2 = mb2 * m - ma2 * mm;
      const ta = tb0 * to + x1; x1 = tb1 * to - ta1 * ta + x2; x2 = tb2 * to - ta2 * ta;
      const t = tb0 * ta + y1; y1 = tb1 * ta - ta1 * t + y2; y2 = tb2 * ta - ta2 * t;
      const ha = hb0 * m + u1; u1 = hb1 * m - ha1 * ha + u2; u2 = hb2 * m - ha2 * ha;
      const h = hb0 * ha + v1; v1 = hb1 * ha - ha1 * h + v2; v2 = hb2 * ha - ha2 * h;
      sT += t * t; sM += mm * mm; sV += p; sH += h * h; if (a > sP) sP = a;
      if (++c1 === b1) { eT[i1] = sT / b1; eM[i1] = sM / b1; eV[i1] = sV / b1; eH[i1] = sH / b1; pk[i1] = sP; i1++; c1 = 0; sT = sM = sV = sH = sP = 0; }
    }
    Object.assign(this, { spitze, erste, letzte, qs, clip, runL, runR, a20, c20, i20, aktivN, aktivQs, i1, c1 });
    this.s1[0] = sT; this.s1[1] = sV; this.s1[2] = sH; this.s1[3] = sP; this.s1[4] = sM;
    zz[0] = x1; zz[1] = x2; zz[2] = y1; zz[3] = y2; zz[4] = u1; zz[5] = u2; zz[6] = v1; zz[7] = v2; zz[8] = o1; zz[9] = o2; zz[10] = w1; zz[11] = w2;
    this.lh.feed(L, R, n); this.tp.feed(L, R, n, spitze);
    this._stft(L, R, n);
    this._tief(L, R, n);
    this.pos += n;
  }

  _stft(L, R, n) {
    const N = this.N, hop = this.hop, bL = this.bL, bR = this.bR, cap = this.cap;
    let o = 0;
    while (o < n && this.fr < this.nFr) {
      const k = Math.min(n - o, cap - this.fuell);
      bL.set(L.subarray(o, o + k), this.fuell); bR.set(R.subarray(o, o + k), this.fuell); this.fuell += k; o += k;
      let s = 0;
      while (this.fuell - s >= N && this.fr < this.nFr) { this._rahmen(s); s += hop; }
      if (s) { bL.copyWithin(0, s, this.fuell); bR.copyWithin(0, s, this.fuell); this.fuell -= s; }
    }
  }

  _rahmen(off) {
    const N = this.N, w = this.win, re = this.re, im = this.im, bL = this.bL, bR = this.bR, pl = this.pl, pr = this.pr, cc = this.cc, grp = this.grp, st = this.st;
    for (let i = 0; i < N; i++) { re[i] = bL[off + i] * w[i]; im[i] = bR[off + i] * w[i]; }
    fft(re, im);
    for (let k = 1; k <= N / 2; k++) {   // X = FFT(l + i·r) → L_k = (X_k + X*_{N−k})/2, R_k = (X_k − X*_{N−k})/(2i)
      const j = N - k, a = re[k], b = im[k], c = re[j], d = im[j];
      const lr = (a + c) * 0.5, li = (b - d) * 0.5, rr = (b + d) * 0.5, ri = (c - a) * 0.5;
      const PL = lr * lr + li * li, PR = rr * rr + ri * ri, C = lr * rr + li * ri;
      pl[k] = PL; pr[k] = PR; cc[k] = C;
      const g = grp[k]; if (g < 3) { st[g * 3] += PL; st[g * 3 + 1] += PR; st[g * 3 + 2] += C; }
    }
    const BM = this.BM, sk = 0.5 * this.skal, o = this.fr * NB, spek = this.spek, mSum = this.mSum;
    for (let b = 0; b < NB; b++) {
      const e = BM[b]; if (!e.length) { spek[o + b] = -128; continue; }
      let s = 0; for (let x = 0; x < e.length; x += 2) s += e[x + 1] * (pl[e[x]] + pr[e[x]]);
      const ms = s * sk; mSum[b] += ms; spek[o + b] = ms > 0 ? q8(pdb(ms) + DB_SINUS) : -128;
    }
    this.fr++;
    if (++this.stN === this.stJe || this.fr === this.nFr) this._stereoZeile();
  }

  _stereoZeile() {
    const st = this.st, z = this.stI * 6, sk = 0.5 * this.skal / this.stN;
    for (let g = 0; g < 3; g++) {
      const PL = st[g * 3], PR = st[g * 3 + 1], C = st[g * 3 + 2];
      this.stG[g * 3] += PL; this.stG[g * 3 + 1] += PR; this.stG[g * 3 + 2] += C;
      if ((PL + PR) * sk < 1e-8 || PL <= 0 || PR <= 0) { this.stReihe[z + g * 2] = -128; this.stReihe[z + g * 2 + 1] = -128; continue; }
      this.stReihe[z + g * 2] = Math.round(100 * Math.max(-1, Math.min(1, C / Math.sqrt(PL * PR))));
      this.stReihe[z + g * 2 + 1] = Math.round(100 * Math.max(0, Math.min(1, (PL + PR - 2 * C) / (2 * (PL + PR)))));
    }
    st.fill(0); this.stN = 0; this.stI++;
  }

  _tief(L, R, n) {
    if (!this.tmpL || this.tmpL.length < n) { this.tmpL = new Float32Array(n); this.tmpR = new Float32Array(n); }
    const tl = this.tmpL, tr = this.tmpR; tl.set(L.subarray(0, n)); tr.set(R.subarray(0, n));
    for (const f of this.dek) f.run(tl, tr, n);
    const D = this.D, N2 = this.N2, dL = this.dL, dR = this.dR; let i = this.dPhase;
    for (; i < n; i += D) {
      dL[this.dFuell] = tl[i]; dR[this.dFuell] = tr[i];
      if (++this.dFuell === N2) { this._rahmenTief(); dL.copyWithin(0, N2 >> 1, N2); dR.copyWithin(0, N2 >> 1, N2); this.dFuell = N2 >> 1; }
    }
    this.dPhase = i - n;
  }

  _rahmenTief() {
    const N = this.N2, w = this.win2, re = this.re2, im = this.im2;
    for (let i = 0; i < N; i++) { re[i] = this.dL[i] * w[i]; im[i] = this.dR[i] * w[i]; }
    fft(re, im);
    const sk = 0.5 * this.skal2;
    for (let b = 0; b < NT; b++) {
      const e = this.BM2[b]; let s = 0;
      for (let x = 0; x < e.length; x += 2) {
        const k = e[x], j = N - k, a = re[k], bb = im[k], c = re[j], d = im[j];
        const lr = (a + c) * 0.5, li = (bb - d) * 0.5, rr = (bb + d) * 0.5, ri = (c - a) * 0.5;
        s += e[x + 1] * (lr * lr + li * li + rr * rr + ri * ri);
      }
      this.tSum[b] += s * sk;
    }
    this.tFr++;
  }

  /** Abschluss: Rest-Rahmen, Einschwingen, Ausklang; liefert das Objekt für `daten` (klein, JSON). */
  ende() {
    const sr = this.sr, msVon = (i) => Math.round(i / sr * 1000);
    // Rest des Kurzzeit-Spektrums (Ende mit Stille aufgefüllt)
    const z = new Float32Array(this.hop); while (this.fr < this.nFr) this._stft(z, z, z.length);
    if (this.stN) this._stereoZeile();
    // RMS-Rest, 1-ms-Rest
    if (this.c20) { const ms = this.a20 / this.c20; this.rms20[this.i20++] = ms > 0 ? q8(pdb(ms)) : -128; if (ms > 1e-6) { this.aktivN += this.c20; this.aktivQs += this.a20; } }
    if (this.c1) { const c = this.c1, s = this.s1; this.eT[this.i1] = s[0] / c; this.eV[this.i1] = s[1] / c; this.eH[this.i1] = s[2] / c; this.pk[this.i1] = s[3]; this.eM[this.i1] = s[4] / c; this.i1++; }
    this.tp.ende(this.spitze);
    const n = Math.max(1, this.pos), lufs = this.lh.integriert(), rms = this.qs > 0 ? pdb(this.qs / n) : -Infinity, spitzeDb = this.spitze > 0 ? 20 * Math.log10(this.spitze) : -Infinity;
    const rmsAktiv = this.aktivN ? pdb(this.aktivQs / this.aktivN) : null;
    // Mittleres Spektrum: Leistungs-Mittel über alle Rahmen; unter 200 Hz aus dem langen Fenster, wenn es eines gab
    const mittel = MITTEN.map((f, b) => { const ms = b < NT && this.tFr ? this.tSum[b] / this.tFr : this.mSum[b] / this.nFr; return this.BM[b].length && ms > 0 ? rd(pdb(ms) + DB_SINUS, 10) : null; });
    const ein = this._einschwingen(), aus = this._ausklang(ein.t);
    const dauerS = this.erste >= 0 ? (this.letzte - this.erste + 1) / sr : 0;
    const stereoGesamt = (g) => { const PL = this.stG[g * 3], PR = this.stG[g * 3 + 1], C = this.stG[g * 3 + 2]; return PL > 0 && PR > 0 && (PL + PR) * this.skal * 0.5 / this.nFr > 1e-10 ? { korr: rd(C / Math.sqrt(PL * PR)), seite: rd((PL + PR - 2 * C) / (2 * (PL + PR))) } : null; };
    let gPL = 0, gPR = 0, gC = 0; for (let g = 0; g < 3; g++) { gPL += this.stG[g * 3]; gPR += this.stG[g * 3 + 1]; gC += this.stG[g * 3 + 2]; }
    const k = this.kopf;
    return {
      format: FORMAT,
      einheiten: 'Pegel dBFS (RMS ohne +3-dB-Korrektur); Bänder in dB bezogen auf Sinus (Sinus mit Spitze x dBFS → x dB); Reihen als Int8 in Base64, −128 = still/keine Daten; Zeiten in ms ab Dateianfang.',
      datei: { format: k.format, sr, kanaele: k.ch, bits: k.bits, float: !!k.float, frames: this.frames, laengeMs: msVon(this.frames), groesseBytes: k.size },
      pegel: { startMs: this.erste >= 0 ? msVon(this.erste) : null, endeMs: this.letzte >= 0 ? msVon(this.letzte + 1) : null, aktivAnteil: rd(this.aktivN / n, 1000),
        lufs: rd(lufs), lra: rd(this.lh.lra()), truePeakDb: rd(this.tp.spitzeDb), spitzeDb: rd(spitzeDb), rmsDb: rd(rms), rmsAktivDb: rd(rmsAktiv), crestDb: rd(spitzeDb - rms), clipFolgen: this.clip },
      spektrum: { mittenHz: MITTEN.map((f) => rd(f, 10)), mittelDb: mittel, mittelTiefBisHz: this.tFr ? TIEF_BIS : null,
        reihe: { schrittMs: 250, fensterMs: Math.round(this.N / sr * 1000), baender: NB, rahmen: this.nFr, int8: b64(this.spek) } },
      rms50: { schrittMs: 50, anzahl: this.i20, int8: b64(this.rms20.subarray(0, this.i20)) },
      stereo: this.mono ? { mono: true } : { mono: false, baender: ['tief < 150 Hz', 'mitte 150–4000 Hz', 'hoch > 4 kHz'], gesamt: [0, 1, 2].map(stereoGesamt),
        korrGesamt: gPL > 0 && gPR > 0 ? rd(gC / Math.sqrt(gPL * gPR)) : null,
        reihe: { schrittMs: 500, werte: 'je Schritt 6 Werte: Korrelation·100 und Seitenanteil·100 für tief, mitte, hoch', anzahl: this.stI, int8: b64(this.stReihe.subarray(0, this.stI * 6)) } },
      einschwingen: { anzahl: ein.t.length, jeSekunde: dauerS > 0 ? rd(ein.t.length / dauerS) : 0, zeitenMs: ein.t.map((i) => msVon(i * this.b1)),
        band: ein.b.join(''), bandSchluessel: 'T tief 30–150 Hz, M über 150 Hz, H über 2,5 kHz', spitzeInt8: b64(Int8Array.from(ein.p)), spitzeErklaerung: 'Spitze dBFS in den 30 ms nach dem Einsatz' },
      ausklang: aus,
    };
  }

  /** Einsätze aus den 1-ms-Hüllkurven: Anstieg im kurzen Fenster gegen die 150 ms davor, je Band eine Schwelle;
   *  bestätigt nur, wenn die Energie danach (Fensterlänge + 20 ms) noch mindestens Schwelle − 3 dB über dem Grund liegt. */
  _einschwingen() {
    const n = this.i1, B = 150, bands = [{ e: this.eT, W: 30, thr: 10, z: 'T' }, { e: this.eM, W: 10, thr: 6, z: 'M' }, { e: this.eH, W: 6, thr: 6, z: 'H' }];
    for (const bd of bands) {   // lautester Wert im kurzen Fenster → Untergrenze (45 dB darunter, mindestens −60 dBFS)
      let s = 0, mx = 0; for (let t = 0; t < n; t++) { s += bd.e[t]; if (t >= bd.W) s -= bd.e[t - bd.W]; if (s > mx) mx = s; }
      bd.min = Math.max(-60, pdb(mx / bd.W + 1e-20) - 45); bd.sW = 0; bd.sB = 0; bd.war = false;
    }
    const t = [], b = [], p = []; let letzt = -1e9;
    for (let i = 0; i < n; i++) {
      let best = -1, bestU = 0;
      for (let k = 0; k < 3; k++) {
        const bd = bands[k], e = bd.e, W = bd.W;
        if (i % 4096 === 0) { bd.sW = 0; bd.sB = 0; for (let j = Math.max(0, i - W + 1); j <= i; j++) bd.sW += e[j]; for (let j = Math.max(0, i - W - B + 1); j <= i - W; j++) bd.sB += e[j]; }
        else { bd.sW += e[i] - (i >= W ? e[i - W] : 0); if (i >= W) bd.sB += e[i - W] - (i >= W + B ? e[i - W - B] : 0); }
        const mW = Math.max(0, bd.sW) / W, nB = Math.min(B, Math.max(0, i - W + 1)), mB = nB ? Math.max(0, bd.sB) / nB : 0;
        const anstieg = pdb((mW + 1e-10) / (mB + 1e-10)), ueber = anstieg > bd.thr && pdb(mW + 1e-20) > bd.min;
        if (ueber && !bd.war && anstieg - bd.thr > bestU) {
          let s2 = 0; const e2 = Math.min(n, i + 1 + W + 20); for (let j = i + 1; j < e2; j++) s2 += e[j];
          const nach = e2 > i + 1 ? s2 / (e2 - i - 1) : mW;
          if (pdb((nach + 1e-10) / (mB + 1e-10)) > bd.thr - 3) { best = k; bestU = anstieg - bd.thr; }
        }
        if (ueber) bd.war = true; else if (anstieg < bd.thr / 2) bd.war = false;
      }
      if (best < 0 || i - letzt < 50) continue;
      const bd = bands[best], e = bd.e, a = Math.max(0, i - bd.W + 1); let mx = 0;
      for (let j = a; j <= Math.min(n - 1, i + 2); j++) if (e[j] > mx) mx = e[j];
      let m = a; while (m < i && e[m] < 0.25 * mx) m++;
      if (t.length && m - t[t.length - 1] < 30) continue;
      let sp = 0; for (let j = m; j < Math.min(n, m + 30); j++) if (this.pk[j] > sp) sp = this.pk[j];
      t.push(m); b.push(bd.z); p.push(sp > 0 ? q8(20 * Math.log10(sp)) : -128); letzt = i;
    }
    return { t, b, p };
  }

  /** Ausklang: nach Einsätzen mit ≥ 300 ms Ruhe davor Abfall von −5 auf −25 dB (T20) bzw. −15 dB (T10) → Nachhallzeit-Schätzung. */
  _ausklang(ein) {
    const n = this.i1, e = this.eV, gl = new Float32Array(n); let s = 0;
    for (let i = 0; i < n; i++) { s += e[i]; if (i >= 10) s -= e[i - 10]; gl[i] = pdb(Math.max(0, s) / Math.min(10, i + 1) + 1e-20); }
    const rt = [], t20 = [], msJe = this.b1 / this.sr * 1000;
    for (let k = 0; k < ein.length; k++) {
      const a = ein[k], ende = k + 1 < ein.length ? ein[k + 1] - 5 : n - 1;
      if (ende - a < 300) continue;
      let p = a; for (let j = a; j < Math.min(ende, a + 60); j++) if (gl[j] > gl[p]) p = j;
      const Lp = gl[p]; if (Lp < -70) continue;
      let i5 = -1, i15 = -1, i25 = -1;
      for (let j = p; j <= ende; j++) { const v = gl[j]; if (i5 < 0 && v <= Lp - 5) i5 = j; if (i15 < 0 && v <= Lp - 15) i15 = j; if (v <= Lp - 25) { i25 = j; break; } }
      if (i5 < 0) continue;
      if (i25 > 0 && Lp - 25 > -100) { rt.push(3 * (i25 - i5) * msJe); t20.push((i25 - i5) * msJe); }
      else if (i15 > 0) rt.push(6 * (i15 - i5) * msJe);
    }
    const letzter = ein.length ? ein[ein.length - 1] * msJe : null, endeMs = this.letzte >= 0 ? (this.letzte + 1) / this.sr * 1000 : null;
    return { rt60Ms: { p25: rd(median(rt, 0.25), 1), median: rd(median(rt), 1), p75: rd(median(rt, 0.75), 1) }, n: rt.length, t20MedianMs: rd(median(t20), 1),
      nachLetztemEinsatzMs: letzter != null && endeMs != null ? Math.round(endeMs - letzter) : null,
      erklaerung: 'Schätzung aus dem Abklingen nach freistehenden Einsätzen (≥ 300 ms bis zum nächsten): 3 × Zeit von −5 bis −25 dB, sonst 6 × −5 bis −15 dB' };
  }
}

/**
 * Ganze Datei messen (stückweise, wenig Speicher). fort(anteil 0..1), signal {abgebrochen} oder AbortSignal.
 * Wirft Error mit code 'kein-wav' oder 'lesefehler' (Datei nicht mehr lesbar → Spuren einmal neu laden).
 */
export async function fingerabdruckDatei(file, { fort, signal } = {}) {
  const t0 = Date.now();
  let kopf;
  try { kopf = await lesKopf(file); }
  catch (f) { throw Object.assign(new Error(f.message === 'kein-wav' ? 'kein-wav' : 'lesefehler'), { code: f.message === 'kein-wav' ? 'kein-wav' : 'lesefehler' }); }
  const fa = new Fingerabdruck(kopf); let letzt = 0;
  try {
    for await (const s of lesStuecke(file, kopf)) {
      if (signal?.abgebrochen || signal?.aborted) throw Object.assign(new Error('abgebrochen'), { code: 'abgebrochen' });
      fa.feed(s.L, s.R, s.L.length);
      const x = (s.pos + s.L.length) / Math.max(1, kopf.frames); if (fort && x - letzt >= 0.05) { letzt = x; fort(x); }
    }
  } catch (f) {
    if (f.code) throw f;
    throw Object.assign(new Error('lesefehler'), { code: 'lesefehler', ursache: String(f && f.name || f) });
  }
  const d = fa.ende(); d.rechenMs = Date.now() - t0;
  return d;
}
