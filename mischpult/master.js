// Mischpult 0.1 – master.js: Master-Plan und Master-Kette in Stücken (KONZEPT C.8/C.9), Instrumental mit denselben Gain-Kurven.
// Kette: 1 Subsonic → 2 Klang-Ausgleich zur Zielkurve → 4 Glue (RMS, Sidechain-Hochpass 80 Hz) → 5 Mono-Bass → Pegel → 6 Soft-Clipper (nur Laut)
//        → 7 True-Peak-Limiter (4×-Spitzen, gleitendes Minimum über die Vorausschau + gleitender Mittelwert, Release 80 ms).
// Limiter-Aufbau nach methodik master.limiter (wie tpLim/Master in mixaDspMake, Synquenzer 4.76.1, index.html 66490 ff.), eigene Umsetzung.
// Stufe 3 (Multiband/Sättigung MX1/MX2) ist in 0.1-Kern noch nicht drin – siehe SCHNITTSTELLE.md „Abweichungen“.
import { R } from './regeln.js';
import { Bq2, Bq1, bqKoeff, bqDb, TpKanal, TpSchranke, lin, db, pdb } from './messen.js';
import { STUFEN, ZIELE } from './analyse.js';

const OKT = R.messung.spektrum.oktavMittenHz, LN10_20 = Math.LN10 / 20;
export const GENRE = { synthpop: R.genreKurven.pop, elektronisch: R.genreKurven.elektronischHipHop, ballade: R.genreKurven.balladeAkustisch };
const norm = v => { const m = (v[3] + v[4] + v[5] + v[6] + v[7]) / 5; return v.map(x => x - m); }; // 250 Hz–4 kHz = 0

/** Abstand eines Oktav-Spektrums zur Zielkurve (RMS in dB über 63 Hz–8 kHz, Bänder mit Inhalt). */
export function klangAbstand(ltasOkt, kurve = GENRE.synthpop) {
  const a = norm(ltasOkt), t = norm(kurve); let s = 0, n = 0;
  for (let o = 1; o <= 8; o++) if (a[o] > -40) { s += (a[o] - t[o]) ** 2; n++; }
  return n ? Math.sqrt(s / n) : 0;
}

const KLANG_FILTER = [['lowshelf', 100, 0.7], ['peak', 250, 0.9], ['peak', 700, 0.9], ['peak', 2000, 0.9], ['peak', 5000, 0.9], ['highshelf', 10000, 0.7]];
function loese(A, b) { // kleines lineares System (Gauß mit Pivot)
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  return M.map((r, i) => r[n] / r[i]);
}
/** Klang-Ausgleich: Wunsch je Oktave (dB) → ≤ 6 Biquads per Ausgleichsrechnung, Gains begrenzt. */
export function klangFit(wunsch, sr, grenze) {
  const pts = OKT.slice(1, 10), A = pts.map(f => KLANG_FILTER.map(([t, hz, q]) => bqDb(bqKoeff(t, hz, sr, q, 1), f, sr)));
  const w = pts.map((_, i) => wunsch[i + 1]), n = KLANG_FILTER.length, lam = 0.05;
  const AtA = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => pts.reduce((s, _, k) => s + A[k][i] * A[k][j], 0) + (i === j ? lam : 0)));
  const Atb = Array.from({ length: n }, (_, i) => pts.reduce((s, _, k) => s + A[k][i] * w[k], 0));
  const x = loese(AtA, Atb).map(g => Math.max(-grenze, Math.min(grenze, Math.round(g * 10) / 10)));
  return KLANG_FILTER.map(([typ, hz, q], i) => ({ typ, hz, q, db: x[i] })).filter(f => Math.abs(f.db) >= 0.2);
}

/**
 * planeMaster(vm, {ziel, eingriff, kurve}) → P
 * vm (aus der Vormischung): {ltasOkt (nach Pre-Master-Skalierung), korrTief, glueP90Db, I}
 */
export function planeMaster(vm, { ziel = 'streaming', eingriff = 'mittel', kurve = 'synthpop', albumKurve = null } = {}) {
  const Z = ZIELE[ziel], st = STUFEN[eingriff], sr = vm.sr;
  const tgt = norm(albumKurve || GENRE[kurve]), ist = norm(vm.ltasOkt);
  const [staerke, grenze] = albumKurve ? [0.5, 2] : st.klang;
  const wunsch = tgt.map((t, o) => vm.ltasOkt[o] > -60 && ist[o] > -30 ? Math.max(-grenze, Math.min(grenze, staerke * (t - ist[o]))) : 0);
  const klang = klangFit(wunsch, sr, grenze);
  const gl = R.master.kette.find(k => k.stufe === 'glue');
  const zielGr = st.glue, ratio = gl.ratio, thr = vm.glueP90Db - zielGr / (1 - 1 / ratio);
  const lim = R.master.limiter;
  return {
    ziel: Z.name, eingriff, sr, zielLufs: Z.lufs, subsonicHz: Z.subsonicHz, klang, zielkurve: albumKurve ? 'album' : 'genre:' + kurve,
    glue: { ratio, attackMs: gl.attackMs, releaseMs: gl.releaseMs, knieDb: gl.kneeDb, rmsMs: 10, scHz: gl.sidechainHochpassHz, threshDb: +thr.toFixed(2), zielGrDb: zielGr },
    monoBassHz: vm.korrTief < R.mix.stereo.summeSideHochpass.nurWennKorrelationUnter150HzKleiner ? R.mix.stereo.bassMono.sideHochpassHz : null,
    softclip: Z.softclip, ceilingDbtp: Z.tp_dbtp, releaseMs: lim.releaseMs, vorausMs: lim.vorausschauMs,
    gainDb: +(Z.lufs - (vm.I - zielGr * 0.6)).toFixed(2), // Schätzung; nachmessen() setzt den genauen Wert
  };
}

/**
 * new MasterKette(sr, P) ; .process(vL, vR, iL, iR, n) an Ort und Stelle (iL/iR = Instrumental oder null).
 * Ausgang ist um .latenz Proben verzögert (Vorausschau). .stats() → mittlere/max Reduktion von Glue und Limiter.
 */
export class MasterKette {
  constructor(sr, P) {
    this.sr = sr; this.P = P;
    const mk = () => { const f = [new Bq2(bqKoeff('hp', P.subsonicHz, sr))]; for (const k of P.klang) f.push(new Bq2(bqKoeff(k.typ, k.hz, sr, k.q, k.db))); return f; };
    this.fV = mk(); this.fI = mk();
    const g = P.glue; this.glue = { T: g.threshDb, sl: 1 / g.ratio - 1, W: g.knieDb, aA: Math.exp(-1 / (g.attackMs * 1e-3 * sr)), aR: Math.exp(-1 / (g.releaseMs * 1e-3 * sr)), aRms: Math.exp(-1 / (g.rmsMs * 1e-3 * sr)), z: 0, gs: 0, sc: [new Bq1(bqKoeff('hp', g.scHz, sr)), new Bq1(bqKoeff('hp', g.scHz, sr))] };
    if (P.monoBassHz) { const k = bqKoeff('hp', P.monoBassHz, sr); this.mbV = [new Bq1(k), new Bq1(k)]; this.mbI = [new Bq1(k), new Bq1(k)]; }
    this.gain = lin(P.gainDb); this.ceil = lin(P.ceilingDbtp - 0.2);
    if (P.softclip) { this.scA = lin(P.ceilingDbtp + 1); this.scB = lin(P.ceilingDbtp + 2.5); }
    // 0.1.1: steiler Tiefpass (Butterworth 4. Ordnung, bilinear) knapp unter 20 kHz vor dem Limiter. Er nimmt Anteile nahe der
    // Nyquist-Grenze (z. B. Spiegelungen des Soft-Clippers) heraus – dort würde jede Spitzenmessung mit endlich langem Filter zu
    // niedrig liegen (Prüfer-Befund 0.1: 44,1 kHz, Modus Laut, ideale Spitze 1 dB über der 8×-Messung). Hörbar ist das nicht.
    const fLp = Math.min(19500, 0.44 * sr); this.lp = sr >= 44100 ? fLp : null;
    if (this.lp) { const mkLp = () => [new Bq2(bqKoeff('lp', fLp, sr, 0.5412)), new Bq2(bqKoeff('lp', fLp, sr, 1.3066))]; this.lpV = mkLp(); this.lpI = mkLp(); }
    // Limiter
    // 0.1.1: Detektor 4× mit 32 Abgriffen (vorher 12) und 0,2 dB Reserve unter der Grenze; das Instrumental hat einen eigenen
    // Detektor, beide nehmen die kleinere Verstärkung (gleiche Gain-Kurve, keine Spitze über der Grenze im Instrumental).
    const TT = 32; this.TT = TT;
    this.tpL = new TpKanal(4, TT, 8); this.tpR = new TpKanal(4, TT, 8); this.tpIL = new TpKanal(4, TT, 8); this.tpIR = new TpKanal(4, TT, 8);
    this.sch = new TpSchranke(this.tpL.p.S1, TT); this.schI = new TpSchranke(this.tpL.p.S1, TT); this.flag = null; this.flagI = null;
    const W = Math.max(8, Math.round(P.vorausMs * 1e-3 * sr)); this.W = W; this.latenz = TT / 2 + W - 1;
    this.dq = new Float64Array(W + 2); this.dqi = new Float64Array(W + 2); this.dh = 0; this.dt = 0; this.t = 0; // monotone Deque (Ring)
    this.box = new Float64Array(W); this.bi = 0; this.bsum = W; this.box.fill(1);
    this.r = 1; this.aRel = Math.exp(-1 / (P.releaseMs * 1e-3 * sr));
    const D = this.latenz; this.dVL = new Float64Array(D); this.dVR = new Float64Array(D); this.dIL = new Float64Array(D); this.dIR = new Float64Array(D); this.di = 0;
    this.st = { glueSum: 0, glueMax: 0, limSum: 0, limMax: 0, n: 0 };
    this.tmp = null;
  }
  _sc(x) { const a = this.scA, b = this.scB, s = x < 0 ? -1 : 1, v = x * s; return v <= a ? x : s * (a + (b - a) * Math.tanh((v - a) / (b - a))); }
  process(vL, vR, iL, iR, n = vL.length) {
    const mitI = !!iL;
    for (const f of this.fV) f.run(vL, vR, n);
    if (mitI) for (const f of this.fI) f.run(iL, iR, n);
    // Glue (gleiche Gain-Kurve für das Instrumental)
    const G = this.glue, T = G.T, W = G.W, sl = G.sl; let z = G.z, gs = G.gs; const st = this.st;
    for (let i = 0; i < n; i++) {
      const a = G.sc[0].x(vL[i]), b = G.sc[1].x(vR[i]);
      z = G.aRms * z + (1 - G.aRms) * 0.5 * (a * a + b * b);
      const x = 10 * Math.log10(z + 1e-20), o = x - T;
      const gc = 2 * o < -W ? 0 : 2 * Math.abs(o) <= W ? sl * (o + W / 2) * (o + W / 2) / (2 * W) : sl * o;
      gs = gc < gs ? G.aA * gs + (1 - G.aA) * gc : G.aR * gs + (1 - G.aR) * gc;
      const g = Math.exp(gs * LN10_20); vL[i] *= g; vR[i] *= g; if (mitI) { iL[i] *= g; iR[i] *= g; }
      st.glueSum -= gs; if (-gs > st.glueMax) st.glueMax = -gs;
    }
    G.z = z; G.gs = gs;
    // Mono-Bass: Seite unter 120 Hz entfernen (LR4-Hochpass auf S)
    const mb = (L, Rr, f) => { for (let i = 0; i < n; i++) { const m = 0.5 * (L[i] + Rr[i]); let s = 0.5 * (L[i] - Rr[i]); s = f[1].x(f[0].x(s)); L[i] = m + s; Rr[i] = m - s; } };
    if (this.mbV) { mb(vL, vR, this.mbV); if (mitI) mb(iL, iR, this.mbI); }
    // Pegel + Soft-Clipper
    const gn = this.gain;
    for (let i = 0; i < n; i++) { vL[i] *= gn; vR[i] *= gn; if (mitI) { iL[i] *= gn; iR[i] *= gn; } }
    if (this.P.softclip) for (let i = 0; i < n; i++) { vL[i] = this._sc(vL[i]); vR[i] = this._sc(vR[i]); if (mitI) { iL[i] = this._sc(iL[i]); iR[i] = this._sc(iR[i]); } }
    if (this.lp) { for (const f of this.lpV) f.run(vL, vR, n); if (mitI) for (const f of this.lpI) f.run(iL, iR, n); }
    // True-Peak-Limiter
    const Wn = this.W, cap = Wn + 2, dq = this.dq, dqi = this.dqi, box = this.box, D = this.latenz, ceil = this.ceil, aRel = this.aRel;
    let dh = this.dh, dt = this.dt, t = this.t, bi = this.bi, bsum = this.bsum, r = this.r, di = this.di;
    // Schranke je 32 Proben: liegt sie unter der Grenze, braucht der Block keine Überabtastung (Ergebnis identisch, nur schneller)
    const nb = Math.ceil(n / 32); if (!this.flag || this.flag.length < nb) this.flag = new Uint8Array(nb);
    for (let o = 0, b = 0; o < n; o += 32, b++) this.flag[b] = this.sch.block(vL, vR, o, Math.min(n, o + 32)) <= ceil ? 1 : 0;
    if (mitI) { if (!this.flagI || this.flagI.length < nb) this.flagI = new Uint8Array(nb); for (let o = 0, b = 0; o < n; o += 32, b++) this.flagI[b] = this.schI.block(iL, iR, o, Math.min(n, o + 32)) <= ceil ? 1 : 0; }
    for (let i = 0; i < n; i++, t++) {
      let p = 0; if (this.flag[i >> 5]) { this.tpL.schiebe(vL[i]); this.tpR.schiebe(vR[i]); } else p = Math.max(this.tpL.x(vL[i]), this.tpR.x(vR[i]));
      if (mitI) { if (this.flagI[i >> 5]) { this.tpIL.schiebe(iL[i]); this.tpIR.schiebe(iR[i]); } else p = Math.max(p, this.tpIL.x(iL[i]), this.tpIR.x(iR[i])); }
      const req = p > ceil ? ceil / p : 1;
      while (dt !== dh && dq[(dt - 1 + cap) % cap] >= req) dt = (dt - 1 + cap) % cap;
      dq[dt] = req; dqi[dt] = t; dt = (dt + 1) % cap;
      while (dqi[dh] <= t - (Wn + 1)) dh = (dh + 1) % cap;
      const m = dq[dh];
      r = m < r ? m : r + (m - r) * (1 - aRel);
      bsum += r - box[bi]; box[bi] = r; bi = bi + 1 === Wn ? 0 : bi + 1;
      const g = Math.min(1, bsum / Wn);
      const xl = this.dVL[di], xr = this.dVR[di]; this.dVL[di] = vL[i]; this.dVR[di] = vR[i]; vL[i] = xl * g; vR[i] = xr * g;
      if (mitI) { const yl = this.dIL[di], yr = this.dIR[di]; this.dIL[di] = iL[i]; this.dIR[di] = iR[i]; iL[i] = yl * g; iR[i] = yr * g; }
      di = di + 1 === D ? 0 : di + 1;
      const gr = -20 * Math.log10(g); st.limSum += gr; if (gr > st.limMax) st.limMax = gr;
    }
    st.n += n; this.dh = dh; this.dt = dt; this.t = t; this.bi = bi; this.bsum = bsum; this.r = r; this.di = di;
  }
  stats() { const s = this.st, n = Math.max(1, s.n); return { glueMittelDb: +(s.glueSum / n).toFixed(2), glueMaxDb: +s.glueMax.toFixed(2), limMittelDb: +(s.limSum / n).toFixed(2), limMaxDb: +s.limMax.toFixed(2) }; }
}
