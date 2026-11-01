/* ===================== MIX-A: Mix-Assistent + Auto-Master (bau/helfer/MIXA/SPEC.md) =====================
   Ein DSP-Kern (mixaDspMake) für drei Orte: das Worklet-Modul 'synq-mixa' / 'synq-mixa-an' (live, Video, GarageBand), den
   Analyse-Worker (Merkmale, Klassen, Vorschläge, Auto-Master-Anpassung) und – nur als Notlösung – den Hauptthread. Der Kern
   kennt keine App-Daten: er bekommt Zahlen und gibt Zahlen zurück. Nichts davon läuft, solange nichts übernommen ist. */
function mixaDspMake() {
  'use strict';
  const PI = Math.PI, LN = Math.LN10 / 20, db2 = d => Math.exp(d * LN), lg = x => 10 * Math.log10(x > 1e-30 ? x : 1e-30);
  const clampN = (x, a, b) => (x < a ? a : x > b ? b : x);
  // RBJ-Biquad → [b0, b1, b2, a1, a2] (normiert); Shelf mit Steigung 1
  function bq(type, f, sr, q, g) {
    const w = 2 * PI * clampN(f, 1, sr * 0.45) / sr, cw = Math.cos(w), sw = Math.sin(w), A = Math.pow(10, (g || 0) / 40), al = sw / (2 * (q || Math.SQRT1_2));
    let b0, b1, b2, a0, a1, a2;
    if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
    else if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
    else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; }
    else if (type === 'pk') { b0 = 1 + al * A; b1 = -2 * cw; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cw; a2 = 1 - al / A; }
    else {
      const s = Math.sqrt(A) * sw * Math.SQRT2;
      if (type === 'ls') { b0 = A * ((A + 1) - (A - 1) * cw + s); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - s); a0 = (A + 1) + (A - 1) * cw + s; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - s; }
      else { b0 = A * ((A + 1) + (A - 1) * cw + s); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - s); a0 = (A + 1) - (A - 1) * cw + s; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s; }
    }
    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  }
  // Transponierte Direktform II; z = Zustand, k = Platz im Zustand (2 Werte)
  function run(c, z, k, x) { const y = c[0] * x + z[k]; z[k] = c[1] * x - c[3] * y + z[k + 1]; z[k + 1] = c[2] * x - c[4] * y; return y; }
  // K-Gewichtung nach ITU-R BS.1770-4 für jede Abtastrate
  function kw(sr) {
    let f0 = 1681.974450955533, Q = 0.7071752369554196, K = Math.tan(PI * f0 / sr), a0 = 1 + K / Q + K * K;
    const Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, 0.4996667741545416);
    const s1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0];
    f0 = 38.13547087602444; Q = 0.5003270373238773; K = Math.tan(PI * f0 / sr); a0 = 1 + K / Q + K * K;
    return [s1, [1, -2, 1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]];
  }
  // Energie je 100-ms-Block (K-gewichtet, Summe der Kanäle)
  function kblocks(chs, sr) {
    const [s1, s2] = kw(sr), H = Math.round(sr / 10), nb = Math.floor(chs[0].length / H), out = new Float64Array(nb);
    for (const x of chs) { const z = new Float64Array(4); let b = 0, acc = 0, c = 0; for (let i = 0, N = nb * H; i < N; i++) { const y = run(s2, z, 2, run(s1, z, 0, x[i])); acc += y * y; if (++c === H) { out[b++] += acc / H; acc = 0; c = 0; } } }
    return out;
  }
  const L_ = e => -0.691 + lg(e);
  // integrierte Lautheit (400 ms, 75 % Überlappung, absolutes −70- und relatives −10-LU-Gate)
  function integ(bl) {
    const E = []; for (let k = 0; k + 4 <= bl.length; k++) E.push((bl[k] + bl[k + 1] + bl[k + 2] + bl[k + 3]) / 4);
    const ga = Math.pow(10, (-70 + 0.691) / 10), a = E.filter(e => e > ga); if (!a.length) return -Infinity;
    const gr = a.reduce((s, e) => s + e, 0) / a.length * 0.1, g = a.filter(e => e > gr);
    return L_(g.reduce((s, e) => s + e, 0) / g.length);
  }
  // Kurzzeit-Lautheit (3 s) je 100 ms
  function shortTerm(bl) { const o = []; let s = 0; for (let k = 0; k < bl.length; k++) { s += bl[k]; if (k >= 30) s -= bl[k - 30]; if (k >= 29) o.push(L_(s / 30)); } return o; }
  const pct = (a, p) => { if (!a.length) return NaN; const s = Float64Array.from(a).sort(); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };
  function lra(bl) { const st = shortTerm(bl).filter(v => v > -70); if (st.length < 2) return 0; const m = L_(st.reduce((s, v) => s + Math.pow(10, (v + 0.691) / 10), 0) / st.length), g = st.filter(v => v > m - 20); return g.length < 2 ? 0 : pct(g, 0.95) - pct(g, 0.1); }
  // Überabtast-Filter (P-fach, T Stützstellen, Blackman-gefenstertes sinc; jede Phase auf Summe 1)
  function tpFir(P, T) {
    const h = [], half = T / 2 - 1, wd = T / 2 + 0.5;
    for (let k = 1; k < P; k++) { const c = new Float64Array(T); let s = 0; for (let j = 0; j < T; j++) { const d = half + k / P - j, x = PI * d, si = Math.abs(d) < 1e-12 ? 1 : Math.sin(x) / x, w = 0.42 + 0.5 * Math.cos(PI * d / wd) + 0.08 * Math.cos(2 * PI * d / wd); c[j] = si * w; s += c[j]; } for (let j = 0; j < T; j++) c[j] /= s; h.push(c); }
    return h;
  }
  const TPT = 48, TPH = TPT / 2, TP4 = tpFir(4, TPT);              // Erkennung im Limiter: 4×, 48 Stützstellen (auch weißes Rauschen ≤ 0,05 dB genau)
  // True-Peak (dBTP) eines Signals; P = Überabtastung (Prüfung: 8 mit 32 Stützstellen)
  function truePeak(chs, P, T) {
    const TT = T || TPT, H = P === 4 && TT === TPT ? TP4 : tpFir(P || 4, TT); let m = 0;
    for (const x of chs) { const n = x.length; for (let i = 0; i < n; i++) { const a = x[i] < 0 ? -x[i] : x[i]; if (a > m) m = a; } for (let i = TT - 1; i < n; i++) { const b = i - TT + 1; for (const c of H) { let v = 0; for (let j = 0; j < TT; j++) v += c[j] * x[b + j]; if (v < 0) v = -v; if (v > m) m = v; } } }
    return 20 * Math.log10(m > 1e-12 ? m : 1e-12);
  }

  // True-Peak wie der Limiter ihn sieht (4×, 48 Stützstellen, Parabel); Prüfungen messen unabhängig mit truePeak(…, 16, 64)
  function tpLim(chs) {
    let m = 0; const v = new Float64Array(12);
    for (const x of chs) { v.fill(0); for (let i = TPT - 1; i + 1 < x.length; i++) { const b = i - TPT + 1, a = tpSeg(x, b, b + TPH - 1, v, 0); if (a > m) m = a; } }
    return 20 * Math.log10(m > 1e-12 ? m : 1e-12);
  }

  /* ---------- Spur: Hochpass · Glocke · Höhen-Shelf · Kompressor · Make-up · Songteil-Pegel · Ein/Aus ----------
     Spitzen-Kompressor (Stereo gekoppelt, weiches Knie 6 dB, ohne Vorausschau = keine Latenz). Werte gleiten (EQ je Block,
     Pegel je Sample), Ein-/Ausblenden 30 ms. Bei wet 0 ist der Ausgang bitgleich der Eingang. */
  const TDEF = {hp: 0, pf: 100, pg: 0, pq: 1.4, hs: 0, thr: 0, ra: 1, at: 10, rl: 120, mk: 0};
  class Track {
    constructor(sr) { this.sr = sr; this.z = new Float64Array(12); this.cur = Object.assign({}, TDEF); this.gr = 0; this.mk = 0; this.w = 0; this.wT = 0; this.wk = 1 - Math.exp(-1 / (0.008 * sr)); this.gk = 1 - Math.exp(-1 / (0.02 * sr)); this.grMin = 0; this.set({}, true); }
    set(P, now) {
      const p = this.P = Object.assign({}, TDEF, P || {}); const sr = this.sr;
      this.aA = Math.exp(-1 / (Math.max(0.05, p.at) * 1e-3 * sr)); this.aR = Math.exp(-1 / (Math.max(1, p.rl) * 1e-3 * sr));
      this.sl = p.ra > 1.001 ? 1 - 1 / p.ra : 0;
      if (now) { Object.assign(this.cur, p); this.mk = p.mk; this.coefs(); }
    }
    coefs() { const c = this.cur, sr = this.sr; this.cH = c.hp > 0 ? bq('hp', c.hp, sr, Math.SQRT1_2) : null; this.cP = Math.abs(c.pg) > 0.005 ? bq('pk', c.pf, sr, c.pq, c.pg) : null; this.cS = Math.abs(c.hs) > 0.005 ? bq('hs', 6000, sr, 0, c.hs) : null; }
    glide() {
      const c = this.cur, p = this.P; let ch = false;
      const to = (k, v, lin) => { if (c[k] === v) return; ch = true; const d = lin ? v - c[k] : Math.log(v / c[k]); if (Math.abs(d) < (lin ? 0.02 : 0.003)) c[k] = v; else c[k] = lin ? c[k] + d * 0.25 : c[k] * Math.exp(d * 0.25); };
      if (p.hp > 0 && !(c.hp > 0)) { c.hp = 10; ch = true; }
      if (p.hp > 0) to('hp', p.hp); else if (c.hp > 0) { ch = true; c.hp *= 0.75; if (c.hp < 12) c.hp = 0; }
      to('pf', p.pf); to('pq', p.pq); to('pg', p.pg, true); to('hs', p.hs, true);
      if (ch) this.coefs();
    }
    // iL/iR → oL/oR (n Samples), sec = Songteil-Pegel in dB
    process(iL, iR, oL, oR, n, sec) {
      this.glide();
      const z = this.z, cH = this.cH, cP = this.cP, cS = this.cS, sl = this.sl, thr = this.P.thr, aA = this.aA, aR = this.aR, wk = this.wk, gk = this.gk, wT = this.wT, mkT = this.P.mk + (sec || 0);
      let gr = this.gr, mk = this.mk, w = this.w, gmin = this.grMin;
      for (let i = 0; i < n; i++) {
        const xl = iL[i], xr = iR[i]; let l = xl === xl ? xl : 0, r = xr === xr ? xr : 0;
        if (cH) { l = run(cH, z, 0, l); r = run(cH, z, 2, r); }
        if (cP) { l = run(cP, z, 4, l); r = run(cP, z, 6, r); }
        if (cS) { l = run(cS, z, 8, l); r = run(cS, z, 10, r); }
        if (sl) {
          const a = Math.max(l < 0 ? -l : l, r < 0 ? -r : r), o = 20 * Math.log10(a > 1e-9 ? a : 1e-9) - thr;
          const gc = o <= -3 ? 0 : o >= 3 ? -sl * o : -sl * (o + 3) * (o + 3) / 12;
          gr = gc < gr ? gc + (gr - gc) * aA : gc + (gr - gc) * aR;
          if (gr < gmin) gmin = gr;
        }
        mk += (mkT - mk) * gk; w += (wT - w) * wk;
        const k = Math.exp((gr + mk) * LN);
        oL[i] = xl * (1 - w) + l * k * w; oR[i] = xr * (1 - w) + r * k * w;
      }
      if (!(gr === gr)) { gr = 0; this.z.fill(0); }
      if (Math.abs(w - wT) < 1e-6) w = wT;
      this.gr = gr; this.mk = mk; this.w = w; this.grMin = gmin;
    }
  }

  /* ---------- Master: Tief-/Hoch-Shelf · Bus-Kompressor (RMS) · Pegel · True-Peak-Limiter ----------
     Limiter: 4× überabgetastete Spitzen → nötige Absenkung, gleitendes Minimum über die Vorausschau, Release 80 ms, Rechteck-
     Glättung (Anstieg ≈ Vorausschau). Gesamtlatenz D Samples (= gemessene Kompressor-Latenz). Ausgang ≤ Decke (Sicherheit). */
  /* Spitze eines Abschnitts x[b0] … x[b0+1] (4× überabgetastet) mit Parabel-Verfeinerung um jedes örtliche Maximum: so bleibt der
     Fehler auch nahe der Nyquist-Frequenz < 0,1 dB (reines 4× verfehlt dort bis 0,7 dB). v[o] = letzter Zwischenwert des Abschnitts davor */
  function tpSeg(r, b, b0, v, o) {
    const s0 = r[b0], s4 = r[b0 + 1], H = TP4; let s1 = 0, s2 = 0, s3 = 0;
    for (let j = 0; j < TPT; j++) { const x = r[b + j]; s1 += H[0][j] * x; s2 += H[1][j] * x; s3 += H[2][j] * x; }
    const q = v; q[o + 1] = s0; q[o + 2] = s1; q[o + 3] = s2; q[o + 4] = s3; q[o + 5] = s4;
    let m = 0;
    for (let k = 1; k <= 4; k++) {
      const y = q[o + k], sg = y < 0 ? -1 : 1, a = sg * q[o + k - 1], bb = sg * y, c = sg * q[o + k + 1];
      let pk = bb;
      if (bb >= a && bb >= c) { const d = a - 2 * bb + c; if (d < -1e-12) { const e = (a - c) * (a - c) / (-8 * d); pk = bb + (e < bb * 0.13 ? e : bb * 0.13); } }
      if (pk > m) m = pk;
    }
    if ((s4 < 0 ? -s4 : s4) > m) m = s4 < 0 ? -s4 : s4;
    q[o] = s3;
    return m;
  }
  const MDEF = {lo: 0, hi: 0, thr: 0, ra: 1, at: 30, rl: 200, gain: 0, ceil: -1};
  class Master {
    constructor(sr, lat) {
      this.sr = sr; const D = this.D = Math.max(TPH + 16, lat | 0); this.W = D + 2 - TPH; this.B = D + 1 - TPH;   // Vorausschau so, dass jede Absenkung vor ihrer Spitze voll da ist
      this.r0 = new Float64Array(128); this.r1 = new Float64Array(128); this.ri = 0; this.vv = new Float64Array(12);
      this.d0 = new Float32Array(D); this.d1 = new Float32Array(D); this.di = 0;
      this.qv = new Float64Array(this.W + 2); this.qt = new Float64Array(this.W + 2); this.qh = 0; this.qn = 0; this.t = 0;
      this.bx = new Float64Array(this.B).fill(1); this.bs = this.B; this.bi = 0; this.env = 1;
      this.z = new Float64Array(8); this.e = 0; this.gr = 0; this.g = 1; this.cur = {lo: 0, hi: 0};
      this.gk = 1 - Math.exp(-1 / (0.02 * sr)); this.cR = Math.exp(-1 / (0.010 * sr)); this.rc = 1 - Math.exp(-1 / (0.08 * sr));
      this.st = {grMin: 0, grSum: 0, lmMin: 1, lmSum: 0, n: 0};
      this.set({}, true);
    }
    set(P, now) {
      const p = this.P = Object.assign({}, MDEF, P || {}), sr = this.sr;
      this.aA = Math.exp(-1 / (Math.max(0.1, p.at) * 1e-3 * sr)); this.aR = Math.exp(-1 / (Math.max(1, p.rl) * 1e-3 * sr));
      this.sl = p.ra > 1.001 ? 1 - 1 / p.ra : 0; this.c = db2(p.ceil - 0.5); this.c2 = this.c * 0.5; this.cOut = db2(p.ceil); this.gT = db2(p.gain);
      if (now) { this.g = this.gT; this.cur.lo = p.lo; this.cur.hi = p.hi; this.coefs(); }
    }
    coefs() { this.cLo = bq('ls', 150, this.sr, 0, this.cur.lo); this.cHi = bq('hs', 5000, this.sr, 0, this.cur.hi); }
    glide() { const c = this.cur, p = this.P; if (c.lo === p.lo && c.hi === p.hi) return; for (const k of ['lo', 'hi']) { const d = p[k] - c[k]; c[k] = Math.abs(d) < 0.02 ? p[k] : c[k] + d * 0.25; } this.coefs(); }
    process(iL, iR, oL, oR, n) {
      this.glide();
      const z = this.z, cLo = this.cLo, cHi = this.cHi, sl = this.sl, thr = this.P.thr, aA = this.aA, aR = this.aR, cR = this.cR, gk = this.gk, gT = this.gT, c = this.c, cOut = this.cOut, rc = this.rc;
      const c2 = this.c2, vv = this.vv, r0 = this.r0, r1 = this.r1, d0 = this.d0, d1 = this.d1, D = this.D, W = this.W, B = this.B, bx = this.bx, qv = this.qv, qt = this.qt, QC = qv.length, H = TP4, st = this.st;
      let e = this.e, gr = this.gr, g = this.g, ri = this.ri, di = this.di, bi = this.bi, bs = this.bs, env = this.env, qh = this.qh, qn = this.qn, t = this.t;
      for (let i = 0; i < n; i++) {
        let l = iL[i], r = iR[i]; if (!(l === l)) l = 0; if (!(r === r)) r = 0;
        l = run(cLo, z, 0, l); r = run(cLo, z, 2, r); l = run(cHi, z, 4, l); r = run(cHi, z, 6, r);
        let k = g += (gT - g) * gk;
        if (sl) {
          const p2 = (l * l + r * r) * 0.5; e = p2 + (e - p2) * cR;
          const o = 10 * Math.log10(e > 1e-20 ? e : 1e-20) - thr, gc = o <= -3 ? 0 : o >= 3 ? -sl * o : -sl * (o + 3) * (o + 3) / 12;
          gr = gc < gr ? gc + (gr - gc) * aA : gc + (gr - gc) * aR;
          k *= Math.exp(gr * LN); if (gr < st.grMin) st.grMin = gr; st.grSum += gr;
        }
        l *= k; r *= k;
        ri = (ri + 1) & 63; r0[ri] = r0[ri + 64] = l; r1[ri] = r1[ri + 64] = r;
        const b = ri + 65 - TPT, b0 = b + TPH - 1; let p = Math.max(r0[b0] < 0 ? -r0[b0] : r0[b0], r1[b0] < 0 ? -r1[b0] : r1[b0]);
        const pn = Math.max(p, r0[b0 + 1] < 0 ? -r0[b0 + 1] : r0[b0 + 1], r1[b0 + 1] < 0 ? -r1[b0 + 1] : r1[b0 + 1]);
        if (pn > c2) { const a0 = tpSeg(r0, b, b0, vv, 0), a1 = tpSeg(r1, b, b0, vv, 6); p = a0 > a1 ? a0 : a1; }
        else { vv[0] = 0.25 * r0[b0] + 0.75 * r0[b0 + 1]; vv[6] = 0.25 * r1[b0] + 0.75 * r1[b0 + 1]; }
        const q = p > c ? c / p : 1;
        while (qn > 0 && qv[(qh + qn - 1) % QC] >= q) qn--;
        const s = (qh + qn) % QC; qv[s] = q; qt[s] = t; qn++;
        while (qt[qh] <= t - W) { qh = (qh + 1) % QC; qn--; }
        const m = qv[qh]; t++;
        env = m < env ? m : env + (m - env) * rc;
        bs += env - bx[bi]; bx[bi] = env; if (++bi === B) bi = 0;
        const a = bs / B; if (a < st.lmMin) st.lmMin = a; st.lmSum += a; st.n++;
        let yl = d0[di] * a, yr = d1[di] * a; d0[di] = l; d1[di] = r; if (++di === D) di = 0;
        oL[i] = yl > cOut ? cOut : yl < -cOut ? -cOut : yl; oR[i] = yr > cOut ? cOut : yr < -cOut ? -cOut : yr;
      }
      if (!(gr === gr) || !(e === e)) { gr = 0; e = 0; z.fill(0); }
      if (t > 1e15) t = 0;
      Object.assign(this, {e, gr, g, ri, di, bi, bs, env, qh, qn, t});
    }
  }

  /* ---------- Auto-Master anpassen: Signal vor dem Auto-Master (Stereo) → Einstellung, die das Ziel trifft ----------
     o = {ziel (LUFS), ceil (dBTP), bpm, lat (Samples)}; der Pegel wird mit genau dem Master-Code nachgeführt (Sekante). */
  const AM_REF = {lowDb: -6, hiDb: -13};          // Bezug der EQ-Neigung: Anteil < 150 Hz bzw. > 5 kHz an der Gesamtleistung
  function bandShare(L, R, sr) {
    const cl = bq('lp', 150, sr, Math.SQRT1_2), ch = bq('hp', 5000, sr, Math.SQRT1_2), z = new Float64Array(16); let t = 0, lo = 0, hi = 0;
    for (let i = 0, n = L.length; i < n; i++) {
      const m = (L[i] + R[i]) * 0.5; t += m * m;
      const a = run(cl, z, 2, run(cl, z, 0, m)); lo += a * a;
      const h = run(ch, z, 6, run(ch, z, 4, m)); hi += h * h;
    }
    return {lowDb: lg(lo / t), hiDb: lg(hi / t)};
  }
  function amSim(L, R, sr, P, lat, wantTp) {
    const M = new Master(sr, lat); M.set(P, true);
    const [s1, s2] = kw(sr), H = Math.round(sr / 10), z = new Float64Array(8), n = L.length, bl = new Float64Array(Math.floor((n + lat) / H));
    const oL = new Float32Array(128), oR = new Float32Array(128), bL = new Float32Array(128), bR = new Float32Array(128); let acc = 0, c = 0, b = 0, skip = lat;
    const tL = wantTp ? new Float32Array(n) : null, tR = wantTp ? new Float32Array(n) : null; let w = 0;
    for (let i = 0; i < n + lat; i += 128) {
      const m = Math.min(128, n + lat - i), e = Math.min(n, i + m);
      let xl, xr;
      if (e - i === m) { xl = L.subarray(i, e); xr = R.subarray(i, e); }
      else { bL.fill(0); bR.fill(0); if (e > i) { bL.set(L.subarray(i, e)); bR.set(R.subarray(i, e)); } xl = bL; xr = bR; }
      M.process(xl, xr, oL, oR, m);
      for (let j = 0; j < m; j++) {
        if (skip > 0) { skip--; continue; }
        const yl = run(s2, z, 2, run(s1, z, 0, oL[j])), yr = run(s2, z, 6, run(s1, z, 4, oR[j]));
        acc += (yl * yl + yr * yr); if (++c === H) { bl[b++] = acc / H; acc = 0; c = 0; }
        if (tL && w < n) { tL[w] = oL[j]; tR[w] = oR[j]; w++; }
      }
    }
    const out = {I: integ(bl.subarray(0, b)), lra: lra(bl.subarray(0, b)), grMin: M.st.grMin, grAvg: M.st.grSum / Math.max(1, M.st.n), lmMin: 20 * Math.log10(M.st.lmMin), lmAvg: 20 * Math.log10(Math.max(1e-9, M.st.lmSum / Math.max(1, M.st.n)))};
    if (tL) out.tp = tpLim([tL, tR]);
    return out;
  }
  function amFit(L, R, sr, o) {
    const T0 = Date.now(), ziel = o.ziel, ceil = o.ceil == null ? -1 : o.ceil, lat = o.lat | 0 || Math.round(0.006 * sr);
    const bl = kblocks([L, R], sr), Lin = integ(bl); if (!isFinite(Lin) || Lin < -60) return null;
    const sh = bandShare(L, R, sr), tilt = (ref, v) => { const d = (ref - v) * 0.5; return Math.abs(ref - v) < 1 ? 0 : clampN(Math.round(d * 2) / 2, -2.5, 2.5); };
    const lo = tilt(AM_REF.lowDb, sh.lowDb), hi = tilt(AM_REF.hiDb, sh.hiDb);
    const loud = ziel > -11.5, ra = loud ? 2 : 1.5, grT = loud ? 3 : 1.5, at = 30, rl = clampN(Math.round(60000 / (o.bpm || 120) / 2 / 10) * 10, 100, 300);
    // Schwelle: RMS (10 ms) nach der EQ-Neigung, oberes 5 % der lauten Stellen (Pausen ausgenommen)
    const cLo = bq('ls', 150, sr, 0, lo), cHi = bq('hs', 5000, sr, 0, hi), z = new Float64Array(8), cR = Math.exp(-1 / (0.010 * sr)), Ls = []; let e = 0;
    for (let i = 0, n = L.length; i < n; i++) { let l = run(cHi, z, 4, run(cLo, z, 0, L[i])), r = run(cHi, z, 6, run(cLo, z, 2, R[i])); const p2 = (l * l + r * r) * 0.5; e = p2 + (e - p2) * cR; if (i % 480 === 0) Ls.push(10 * Math.log10(e > 1e-20 ? e : 1e-20)); }
    const mx = pct(Ls, 0.99), act = Ls.filter(v => v > mx - 30), thr = Math.round((pct(act, 0.95) - grT / (1 - 1 / ra)) * 2) / 2;
    const P = {lo, hi, thr, ra, at, rl, gain: 0, ceil};
    let g0 = ziel - Lin + grT * 0.5, r0 = amSim(L, R, sr, Object.assign({}, P, {gain: g0}), lat), e0 = ziel - r0.I, it = 1;
    let g1 = g0 + e0, r1 = amSim(L, R, sr, Object.assign({}, P, {gain: g1}), lat), e1 = ziel - r1.I; it++;
    while (Math.abs(e1) > 0.08 && it < 9) {
      const sl = (r1.I - r0.I) / (g1 - g0 || 1e-9), st = clampN(e1 / (sl > 0.2 ? sl : 0.2), -12, 12);
      g0 = g1; r0 = r1; g1 = g1 + st; r1 = amSim(L, R, sr, Object.assign({}, P, {gain: g1}), lat); e1 = ziel - r1.I; it++;
    }
    P.gain = Math.round(g1 * 100) / 100;
    const fin = amSim(L, R, sr, P, lat, true);
    return Object.assign(P, {info: {lin: +Lin.toFixed(2), lraIn: +lra(bl).toFixed(1), lout: +fin.I.toFixed(2), lraOut: +fin.lra.toFixed(1), tp: +fin.tp.toFixed(2),
      compMax: +(-fin.grMin).toFixed(1), compAvg: +(-fin.grAvg).toFixed(1), limMax: +(-fin.lmMin).toFixed(1), limAvg: +(-fin.lmAvg).toFixed(2), lowDb: +sh.lowDb.toFixed(1), hiDb: +sh.hiDb.toFixed(1), iters: it + 1, ms: Date.now() - T0}});
  }

  /* ---------- Spur-Analyse: Merkmale aus den Fenstern des Analyse-Worklets (je ≈ 10,7 ms) ----------
     Fenster: [t, je Eingang 15 Werte: Energie, Spitze, K-Energie, 5 Bänder, 7 Tiefbänder]; Energien des Mono-Mittels */
  const NF = 15, BC = [80, 270, 1000, 3500, 9000], LOWF = [40, 50, 63, 80, 100, 125, 160];
  function feats(win, nIn, i, wsec, rng) {
    const S = 1 + nIn * NF, nw = Math.floor(win.length / S), o = 1 + i * NF;
    const w0 = rng ? Math.max(0, rng[0]) : 0, w1 = rng ? Math.min(nw, rng[1]) : nw;
    const Ld = new Float64Array(Math.max(0, w1 - w0)); let mx = -200;
    for (let w = w0; w < w1; w++) { const v = lg(win[w * S + o]); Ld[w - w0] = v; }
    const sorted = Float64Array.from(Ld).sort(), top = sorted.length ? sorted[Math.floor(0.995 * (sorted.length - 1))] : -300; mx = top;
    const thrA = Math.max(mx - 40, -90), N = Ld.length;
    let nAct = 0, ss = 0, kk = 0, pkT = [], B = new Float64Array(5), LB = new Float64Array(7);
    for (let w = 0; w < N; w++) { if (Ld[w] <= thrA) continue; nAct++; const q = (w + w0) * S + o; ss += win[q]; kk += win[q + 2]; pkT.push(win[q + 1]); for (let b = 0; b < 5; b++) B[b] += win[q + 3 + b]; for (let b = 0; b < 7; b++) LB[b] += win[q + 8 + b]; }
    if (nAct < Math.max(3, N * 0.01) || mx < -85) return {silent: true, act: nAct / Math.max(1, N)};
    const bt = B.reduce((s, v) => s + v, 0) || 1e-30, share = Array.from(B, v => +lg(v / bt).toFixed(1));
    let cen = 0; for (let b = 0; b < 5; b++) cen += B[b] / bt * Math.log2(BC[b]);
    let lk = 0; for (let b = 1; b < 7; b++) if (LB[b] > LB[lk]) lk = b;
    const pk99 = pct(pkT, 0.99), pk90 = pct(pkT, 0.9), rms = ss / nAct;
    // Kurzzeit-Lautheit (3 s ≈ 281 Fenster) über die aktiven Abschnitte
    const stw = Math.max(1, Math.round(3 / wsec)), hop = Math.max(1, Math.round(0.1 / wsec)), stL = [];
    { let s = 0; for (let w = 0; w < N; w++) { s += win[(w + w0) * S + o + 2]; if (w >= stw) s -= win[(w - stw + w0) * S + o + 2]; if (w >= stw - 1 && (w - stw + 1) % hop === 0) { const v = L_(s / stw) + 3.01; if (v > mx - 20 - 30) stL.push(v); } } }
    // integrierte Lautheit der Spur, nur wo sie spielt (400-ms-Blöcke, Gates wie BS.1770); + 3 dB: Mono-Mittel → Stereo-Bezug
    const bw = Math.max(1, Math.round(0.4 / wsec)), bh = Math.max(1, Math.round(0.1 / wsec)), Eb = [];
    for (let w = 0; w + bw <= N; w += bh) { let s = 0; for (let j = w; j < w + bw; j++) s += win[(j + w0) * S + o + 2]; Eb.push(s / bw); }
    const ga = Math.pow(10, (-70 + 0.691 - 3.01) / 10), ea = Eb.filter(v => v > ga); let I = -Infinity;
    if (ea.length) { const gr = ea.reduce((s, v) => s + v, 0) / ea.length * 0.1, g = ea.filter(v => v > gr); I = L_(g.reduce((s, v) => s + v, 0) / g.length) + 3.01; }
    // Hüllkurve: Einsätze (+6 dB gegen das Minimum der 3 Fenster davor), Attack, Abfall, Lücke bis zum nächsten Einsatz
    const on = []; let last = -99;
    for (let w = 3; w < N; w++) { if (Ld[w] < mx - 35) continue; const m3 = Math.min(Ld[w - 1], Ld[w - 2], Ld[w - 3]); if (Ld[w] - m3 >= 6 && w - last >= 4 && Ld[w] > Ld[w - 1]) { on.push(w); last = w; } }
    const ms = wsec * 1000, att = [], d200 = [], d500 = [], gap = [], sus = [], ioi = [], n2 = Math.round(0.2 / wsec), n5 = Math.round(0.5 / wsec), stp = Math.max(1, Math.floor(on.length / 400));
    for (let k = 0; k < on.length; k += stp) {
      const a = on[k], nx = k + 1 < on.length ? on[k + 1] : Math.min(N, a + 200), lim = Math.min(nx, a + Math.round(0.6 / wsec));
      let pw = a, pl = Ld[a]; for (let w = a; w < lim; w++) if (Ld[w] > pl) { pl = Ld[w]; pw = w; }
      let aw = a; while (aw < pw && Ld[aw] < pl - 1) aw++;
      att.push((aw - a + 0.5) * ms);
      if (aw + n2 < nx) d200.push(Ld[aw + n2] - pl); if (aw + n5 < nx) d500.push(Ld[aw + n5] - pl);   // ab dem Erreichen der Spitze (−1 dB)
      let mn = pl, se = 0, sc = 0; for (let w = pw; w < nx; w++) { if (Ld[w] < mn) mn = Ld[w]; se += Math.pow(10, (Ld[w] - pl) / 10); sc++; }
      gap.push(mn - pl); if (sc) sus.push(lg(se / sc));
      if (k + 1 < on.length) ioi.push((on[k + 1] - a) * ms);
    }
    const med = a => (a.length ? +pct(a, 0.5).toFixed(1) : null);
    return {silent: false, act: +(nAct / N).toFixed(3), max: +mx.toFixed(1), I: isFinite(I) ? +I.toFixed(1) : null, stMed: stL.length ? +pct(stL, 0.5).toFixed(1) : null, stSpan: stL.length > 3 ? +(pct(stL, 0.95) - pct(stL, 0.1)).toFixed(1) : 0,
      crest: +(20 * Math.log10(Math.max(1e-9, pk99)) - lg(rms)).toFixed(1), pk90: +(20 * Math.log10(Math.max(1e-9, pk90))).toFixed(1), pk99: +(20 * Math.log10(Math.max(1e-9, pk99))).toFixed(1),
      share, lowDb: share[0], hiDb: share[4], cen: Math.round(Math.pow(2, cen)), lowPeak: LOWF[lk], lowBands: Array.from(LB, v => +lg(v / bt).toFixed(1)),
      onsets: on.length, att: med(att), d200: med(d200), d500: med(d500), gap: med(gap), sus: med(sus), ioi: med(ioi)};
  }

  /* ---------- Klassen und Charakter ----------
     ns = Notenwerte {n, medP, p10, p90, dens (Einsätze je Schlag), durB (Median-Länge in Schlägen), leg, poly, vel}; f = feats */
  const CLS = ['bass', 'arp', 'pad', 'lead', 'drums', 'voc'];
  function classify(meta, ns, f) {
    if (meta.kind === 'drum') return {cls: 'drums', sc: null};
    if (meta.stimme) return {cls: 'voc', sc: null};
    const s = {bass: 0, arp: 0, pad: 0, lead: 0}, hasN = ns && ns.n >= 3;
    if (hasN) {
      const p = ns.medP, d = ns.dens, L = ns.durB, po = ns.poly;
      s.bass += p < 48 ? 3 : p < 53 ? 2 : p < 57 ? 0.5 : p >= 60 ? -3 : 0; if (po <= 1.2) s.bass += 1;
      s.pad += L >= 2 ? 3 : L >= 1 ? 2 : L >= 0.75 ? 0.5 : 0; s.pad += po >= 2.5 ? 1.5 : po >= 1.8 ? 0.5 : 0;
      s.arp += d >= 3 ? 3 : d >= 1.8 ? 2 : d >= 1.2 ? 0.5 : 0; s.arp += L <= 0.35 ? 1.5 : L <= 0.6 ? 0.5 : 0; if (p >= 55) s.arp += 0.5;
      s.lead += po <= 1.2 ? 1 : 0; s.lead += p >= 60 ? 1.5 : p >= 55 ? 0.5 : 0; s.lead += d >= 0.25 && d < 2.5 ? 1 : 0; s.lead += L > 0.3 && L < 2 ? 1 : 0; if (ns.leg > 0.3) s.lead += 0.5; if (d >= 3) s.lead -= 1.5;
    }
    if (f && !f.silent) {
      s.bass += f.lowDb >= -4 ? 1.5 : f.lowDb >= -8 ? 0.5 : 0; if (f.cen < 250) s.bass += 1;
      if (f.att != null && f.att >= 60) s.pad += 1.5; if (f.sus != null && f.sus >= -6 && f.gap != null && f.gap > -12) s.pad += 0.5;
      if (f.ioi != null && f.ioi <= 170 && f.onsets > 16) s.arp += 1;
      if (!hasN) { if (f.cen >= 700 && f.att != null && f.att < 40) s.lead += 1; }
    }
    let best = 'lead'; for (const k of ['bass', 'pad', 'arp', 'lead']) if (s[k] > s[best]) best = k;
    return {cls: best, sc: s};
  }
  function character(cls, ns, f) {
    const L = ns && ns.n >= 3 ? ns.durB : null, att = f && !f.silent ? f.att : null, gap = f && !f.silent ? f.gap : null, d200 = f && !f.silent ? f.d200 : null, sus = f && !f.silent ? f.sus : null;
    if (cls === 'drums') return 'kurz';
    if ((att != null && att >= 60) || (L != null && L >= 1.5 && (sus == null || sus >= -8))) return 'schwebend';
    if ((L != null && L <= 0.3) || (gap != null && gap <= -20 && (L != null ? L <= 0.6 : d200 != null && d200 <= -12)) || (d200 != null && d200 <= -18 && (L == null || L <= 0.6))) return 'kurz';   // ohne Noten (Gesang): erst mit schnellem Abfall
    return 'ausklingend';
  }

  /* ---------- Vorschläge (Profi-Standard je Rolle und Charakter) ----------
     T = [{i, name, kind, stimme, chor, cls, chr, f, ns, fx {vol, pan, pump, pumpRel, drive}, mix|null}], C = {bpm, pumpSrc, otherPump, secs [{id, name, f: [per Spur]}]}
     Rückgabe je Spur: [{id, art, titel, text, patch, info?}] – patch: {mix: {…}} | {fx: {…}} | {bus: {…}}; ohne patch = nur Hinweis */
  const r5 = x => Math.round(x / 5) * 5, r05 = x => Math.round(x * 2) / 2, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const fmt = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d == null ? 1 : d).replace('.', ',');
  const sgn = (v, d) => (v > 0 ? '+' : '') + fmt(v, d);
  const GR = {bass: [4, 5], drums: [4, 4], lead: [3, 4], arp: [2, 3], pad: [1.5, 2]}, RA = {bass: 4, drums: 3, lead: 3, arp: 2, pad: 2};
  const TGT = {drums: 0, voc: 0, bass: -2, lead: -3, arp: -6, pad: -8};          // Lautheit (LU) gegen den Bezug (Drums, sonst Gesang, sonst Bass)
  function suggest(T, C) {
    const out = T.map(() => []), live = T.filter(t => t.f && !t.f.silent), by = c => live.filter(t => t.cls === c);
    const drums = by('drums')[0] || null, sp = 60 / (C.bpm || 120);
    for (const t of live) {
      const L = out[T.indexOf(t)], f = t.f, ns = t.ns, c = t.cls, chr = t.chr;
      if (c === 'voc') { L.push({id: 'voc', art: 'hinweis', titel: 'Gesang', text: 'Kompressor, EQ und Entzischer der Stimme: STIMME › Effekte › Auto (misst den Mix mit).'}); }
      // Kompressor
      if (c !== 'voc') {
        const even = f.crest <= 8 && f.stSpan <= 3 && (!ns || ns.vel == null || ns.vel <= 0.15);
        if (even) L.push({id: 'comp', art: 'hinweis', titel: 'Kompressor', text: 'Dynamik schon gleichmäßig (Crest ' + fmt(f.crest) + ' dB) – kein Kompressor nötig.'});
        else {
          const ra = c === 'pad' && chr === 'schwebend' ? 1.5 : RA[c], grt = GR[c][chr === 'kurz' ? 0 : 1];
          const at = c === 'drums' ? 25 : chr === 'kurz' ? (c === 'bass' ? 3 : 5) : chr === 'schwebend' ? (c === 'pad' ? 40 : 30) : 10;
          const rl = chr === 'kurz' ? clampN(r5((f.ioi || sp * 500) * 0.8), 50, 250) : chr === 'schwebend' ? 300 : clampN(r5(sp * 500), 80, 300);
          const thr = clampN(r05(f.pk90 - grt / (1 - 1 / ra)), -50, -1), mk = clampN(r05(grt * 0.6), 0, 6);
          L.push({id: 'comp', art: 'comp', titel: 'Kompressor', text: fmt(ra) + ' : 1 · Schwelle ' + fmt(thr) + ' dB · Attack ' + at + ' ms · Release ' + rl + ' ms · Make-up ' + sgn(mk) + ' dB',
            why: {bass: 'hält den Basslauf gleich laut', drums: 'Anschlag kommt durch, Körper wird dichter', lead: 'Melodie bleibt vorne', arp: 'Sequenz gleichmäßig', pad: 'Fläche ruhig, ohne Pumpen'}[c] + ' (' + chr + ')',
            patch: {mix: {thr, ra, at, rl, mk}}});
        }
      }
      // EQ aufräumen
      if (c === 'bass' || c === 'drums') {
        if (f.lowBands && f.lowBands[0] > -30) L.push({id: 'hp', art: 'eq', titel: 'Hochpass', text: '30 Hz – Tiefstbass unter dem Grundton weg', patch: {mix: {hp: 30}}});
      } else if (c !== 'voc' && f.lowDb > -24) {
        const lowN = ns && ns.p10 != null ? mtof(ns.p10) : 200, hp = clampN(r5(lowN * 0.7), c === 'pad' ? 120 : 80, 300);
        L.push({id: 'hp', art: 'eq', titel: 'Hochpass', text: hp + ' Hz – Platz für Bass und Kick (Tiefenanteil ' + fmt(f.lowDb) + ' dB)', patch: {mix: {hp}}});
      }
      if ((c === 'pad' || c === 'arp') && f.hiDb > -10) L.push({id: 'hs', art: 'eq', titel: 'Höhen', text: 'Shelf 6 kHz −2 dB – weniger scharf (Höhenanteil ' + fmt(f.hiDb) + ' dB)', patch: {mix: {hs: -2}}});
      if (c === 'bass' && drums && drums.f.lowDb > -12 && f.lowBands) {
        const fk = drums.f.lowPeak, k = [40, 50, 63, 80, 100, 125, 160].indexOf(fk), mxb = Math.max(...f.lowBands);
        if (k >= 0 && f.lowBands[k] >= mxb - 6) {
          L.push({id: 'kick', art: 'eq', titel: 'Bass ↔ Kick', text: 'Glocke ' + fk + ' Hz −3 dB – der Grundton der Kick bekommt Platz', patch: {mix: {pf: fk, pg: -3, pq: 1.4}}});
          if (C.pumpSrc === 'kick' || !C.otherPump) L.push({id: 'duck', art: 'option', titel: 'Ducking Kick (Option)', text: 'Bass weicht der Kick aus: Pumpen 20 %, Release 1/16', patch: Object.assign({fx: {pump: 0.2, pumpRel: '1/16'}}, C.pumpSrc === 'kick' ? {} : {bus: {pumpSrc: 'kick'}})});
        }
      }
      if (c === 'pad' && drums && (C.pumpSrc === 'kick' || !C.otherPump)) L.push({id: 'duck', art: 'option', titel: 'Ducking Kick (Option)', text: 'Fläche atmet mit der Kick: Pumpen 30 %, Release 1/8', patch: Object.assign({fx: {pump: 0.3, pumpRel: '1/8'}}, C.pumpSrc === 'kick' ? {} : {bus: {pumpSrc: 'kick'}})});
    }
    // Pegel: Lautheit nach dem Fader gegen den Bezug
    const post = t => (t.f.I == null ? null : t.f.I + 20 * Math.log10(Math.max(1e-6, t.fx.vol * t.fx.vol / (1 + t.fx.drive * 1.5))) + (t.mix && t.mix.mk ? t.mix.mk : 0));
    const ref = drums || by('voc')[0] || by('bass')[0] || null;
    if (ref && post(ref) != null) {
      const Lr = post(ref) - TGT[ref.cls];
      for (const t of live) {
        if (t === ref || post(t) == null) continue;
        const d = clampN(Lr + TGT[t.cls] - post(t), -6, 6); if (Math.abs(d) < 2) continue;
        let v = t.fx.vol * Math.pow(10, d / 40); const cap = v > 1; if (cap) v = 1; v = Math.round(v * 1000) / 1000;
        const dd = 40 * Math.log10(v / Math.max(1e-6, t.fx.vol));
        if (Math.abs(dd) < 1) continue;
        out[T.indexOf(t)].push({id: 'vol', art: 'pegel', titel: 'Pegel', text: sgn(dd) + ' dB (' + {bass: 'Bass', lead: 'Lead', arp: 'Sequenz', pad: 'Fläche', voc: 'Gesang', drums: 'Drums'}[t.cls] + ' ' + sgn(TGT[t.cls] - TGT[ref.cls], 0) + ' LU gegen ' + ref.name + ')' + (cap ? ' – Regler am Anschlag' : ''), patch: {fx: {vol: v}}});
      }
    }
    // Pan: Bass/Drums/Lead/Gesang in die Mitte; mehrere Sequenzen bzw. Flächen in der Mitte → links/rechts verteilen
    for (const t of live) if ((t.cls === 'bass' || t.cls === 'lead' || t.cls === 'voc') && Math.abs(t.fx.pan) > 0.35) out[T.indexOf(t)].push({id: 'pan', art: 'pan', titel: 'Pan', text: 'in die Mitte (trägt den Song)', patch: {fx: {pan: 0}}});
    for (const c of ['arp', 'pad']) {
      const mid = by(c).filter(t => Math.abs(t.fx.pan) < 0.1), crowd = mid.length + (c === 'arp' ? by('lead').filter(t => Math.abs(t.fx.pan) < 0.1).length : 0);
      if (crowd < 2 || !mid.length) continue;
      mid.forEach((t, k) => { const p = k % 2 ? 0.3 : -0.3; out[T.indexOf(t)].push({id: 'pan', art: 'pan', titel: 'Pan', text: (p < 0 ? 'links' : 'rechts') + ' 30 % – mehr Platz in der Mitte', patch: {fx: {pan: p}}}); });
    }
    // je Songteil: ausgedünnt → darf vorne sein; dicht → Fläche macht Platz
    const secs = C.secs || [];
    if (secs.length >= 2) {
      const dens = secs.map(s => s.act.filter(Boolean).length), mxD = Math.max(...dens);
      for (const t of live) {
        const k = T.indexOf(t), sec = {}, txt = [];
        if (!['lead', 'arp', 'pad', 'bass'].includes(t.cls)) continue;
        secs.forEach((s, j) => {
          if (!s.act[k]) return;
          if (mxD >= 3 && dens[j] <= Math.max(1, Math.floor(mxD * 0.6))) { const v = t.cls === 'bass' ? 1 : t.cls === 'lead' ? 1.5 : 2; sec[s.id] = v; txt.push(s.name + ' ' + sgn(v) + ' dB'); }
          else if (t.cls === 'pad' && mxD >= 4 && dens[j] === mxD && secs[j].act.some((a, q) => a && q !== k && T[q] && (T[q].cls === 'lead' || T[q].cls === 'voc'))) { sec[s.id] = -1.5; txt.push(s.name + ' −1,5 dB'); }
        });
        if (txt.length) out[k].push({id: 'sec', art: 'teil', titel: 'Je Songteil', text: txt.join(' · ') + (Object.values(sec).some(v => v > 0) ? ' – ausgedünnt: darf vorne sein' : ' – dicht: macht Platz'), patch: {mix: {sec}}});
      }
    }
    return out;
  }

  return {bq, run, kw, kblocks, integ, shortTerm, lra, truePeak, tpLim, tpFir, Track, Master, amFit, amSim, bandShare, feats, classify, character, suggest, pct, lg, db2, NF, CLS, TDEF, MDEF};
}
