/* G6PB-BEGIN */
/* =====================================================================================================================
   G6+b (Nachtrag 10 §2.3): Rechenweg v2 des Chors – nur für chor.v === 2 (v1 bleibt eingefroren, Regel 28).
   Eine Chorstimme v2 = dieselbe Kette wie der Lead mit einem anderen Tonhöhen-Plan, EIN G2-Durchgang:
     Quelle = G4-Fassung des Leads (g2Base), Tonhöhen-Spur/Analyse = die des Leads (g2Src, im G2-Worker geteilt),
     Plan je Lead-Note k: L = round(g2Target), Chor c = Stufe d (+ Oktave o, chromatisch x) in der Tonart der Stelle,
     mit G7: c' = outPitch(c) wie der Lead; Eintrag e = e_Lead + 100·(c' − L') + ct_Kopie (Intonation/Vibrato bleiben).
   Gerechnet wird nur das Clip-Fenster [in − Anlauf, out + Ausklang]; die Phase jeder stimmhaften Strecke läuft ab ihrem
   Anfang (bitgleich zur Ganzrechnung im Fenster). Alle Kopien einer Stimme in einem Rechengang (gemeinsames Modell,
   gemeinsamer Original-Teilton-Oszillator). Zischlaute im Chor (grp.sib, dB) im selben Gang. Zeitkarte danach.
   Cache nach Bytes (≤ 48 MB, zusammen mit dem v1-Cache, LRU), Warteschlange nach Vorrang (0 läuft · 1 nächstes · 2 Rest).
   Lautheit exakt: Offline-Mischung (dieselben Knoten wie im Klangweg: Versatz, Pegel, Pan, Gruppen-Klang) → BS.1770
   (K-Beiwerte je Abtastrate, Gating) im Worker; Lead im selben Fenster. gA = 10^((L_Lead − below − L_Chor)/20).
   Schnittstelle für den Klangweg (G6+c): g6pBuf(a, v, k) → {buf, t0} | null · g6pReady(a) · g6pGA(a) · g6pCopies(v) ·
   g6pGroupNodes(ctx, grp) · g6pMixChanged(a) · g6pPrefetch(a, prio) · G6P.on (Rückrufe „Puffer fertig“).
   ===================================================================================================================== */
function g6pDspMake() {
'use strict';
const HMAX = 64, FTOP = 7000;
function coef(R, q, h, out) {
  const p = Math.min(R.nf - 1, q / R.step), k = Math.floor(p), fr = p - k, k2 = Math.min(R.nf - 1, k + 1);
  const hh = h - 1, a = k * HMAX + hh, b = k2 * HMAX + hh, ha = h <= R.H[k], hb = h <= R.H[k2];
  if (!ha && !hb) { out[0] = -20.7; out[1] = 0; return out; }
  const la = ha ? R.re[a] : R.re[b] - 9, lb = hb ? R.re[b] : R.re[a] - 9, pa = ha ? R.im[a] : R.im[b], pb = hb ? R.im[b] : R.im[a];
  let d = pb - pa; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
  out[0] = la + (lb - la) * fr; out[1] = pa + d * fr; return out;
}
// Teilton-Modell (wie G2 model, Strecke für Strecke identisch) – nur für die Strecken, die das Fenster [w0, w1) berühren; have = Map i0 → Strecke
function modelRuns(x, sr, an, w0, w1, have) {
  const n = x.length, Hs = an.hop * sr, f0 = an.f0, G = Math.round(0.015 * sr);
  for (let i = 0; i < an.n;) {
    if (!(f0[i] > 0)) { i++; continue; }
    let j = i; while (j < an.n && f0[j] > 0) j++;
    let i2 = i, j2 = j; const ap = an.ap || [];
    while (i2 < Math.min(j - 1, i + 3) && ap[i2] > 0.3) i2++;
    while (j2 > Math.max(i2 + 1, j - 3) && ap[j2 - 1] > 0.3) j2--;
    const A = Math.round(i2 * Hs) + G, B = Math.min(n, Math.round((j2 - 1) * Hs) - G);
    if (B - A >= Math.round(0.03 * sr) && !(B <= w0 || A >= w1) && !have.has(i)) {
      const L = B - A, fs = new Float32Array(L), ph = new Float64Array(L);
      for (let q = 0; q < L; q++) { const p = Math.min(j - 1, Math.max(i, (A + q) / Hs)), k = Math.floor(p), fr = p - k; fs[q] = k + 1 < j ? f0[k] + (f0[k + 1] - f0[k]) * fr : f0[k]; }
      let P = 0; for (let q = 0; q < L; q++) { ph[q] = P; P += 2 * Math.PI * fs[q] / sr; }
      const step = Math.round(0.01 * sr), nf = Math.floor((L - 1) / step) + 1, re = new Float32Array(nf * HMAX), im = new Float32Array(nf * HMAX), H = new Uint8Array(nf);
      const phA = q => q < 0 ? ph[0] + 2 * Math.PI * fs[0] / sr * q : q >= L ? ph[L - 1] + 2 * Math.PI * fs[L - 1] / sr * (q - L + 1) : ph[q];
      for (let k = 0; k < nf; k++) {
        const c = k * step, f = fs[Math.min(L - 1, c)], N = Math.max(16, Math.round(3 * sr / f)), h2 = N >> 1, Hk = Math.min(HMAX, Math.floor(FTOP / f));
        H[k] = Hk; let sw = 0; const zr = new Float64Array(N), zi = new Float64Array(N), xr = new Float64Array(N), xm = new Float64Array(N);
        for (let j2 = 0; j2 < N; j2++) { const q = c - h2 + j2, w = 0.5 - 0.5 * Math.cos(2 * Math.PI * (j2 + 0.5) / N), v = A + q >= 0 && A + q < n ? x[A + q] : 0, p = phA(q); zr[j2] = Math.cos(p); zi[j2] = -Math.sin(p); xr[j2] = w * v; xm[j2] = w * v; sw += w; }
        for (let j2 = 0; j2 < N; j2++) xm[j2] = 0;
        for (let h = 1; h <= Hk; h++) {
          let sr2 = 0, si2 = 0;
          for (let j2 = 0; j2 < N; j2++) { const a = xr[j2], b = xm[j2], r2 = a * zr[j2] - b * zi[j2], i2 = a * zi[j2] + b * zr[j2]; xr[j2] = r2; xm[j2] = i2; sr2 += r2; si2 += i2; }
          const ar = 2 * sr2 / sw, ai = 2 * si2 / sw; re[k * HMAX + h - 1] = Math.log(Math.hypot(ar, ai) + 1e-9); im[k * HMAX + h - 1] = Math.atan2(ai, ar);
        }
      }
      have.set(i, {i0: i, i1: j, A, B, step, nf, fs, ph, re, im, H});
    }
    i = j;
  }
  return have;
}
/* Mehrere Kopien in einem Gang, nur Fenster [w0, w1) (Samples). Je Kopie dieselbe Rechnung wie G2 render (bitgleich im Fenster):
   gemeinsam sind Modell, Original-Koeffizienten (Cm) und der Original-Oszillator; je Kopie eigene Ziel-Phase und Koeffizienten (Cs). */
function renderMulti(x, sr, an, getRun, cvs, w0, w1) {
  const K = cvs.length, H = an.hop, ys = cvs.map(() => x.slice(w0, w1));
  const RMP = Math.round(0.010 * sr), BLK = 64, o2 = [0, 0];
  const runSet = new Map();
  cvs.forEach((cv, j) => { for (const [i0, i1] of cv.runs) { const k = i0 + ':' + i1; let e = runSet.get(k); if (!e) runSet.set(k, (e = {i0, i1, js: []})); e.js.push(j); } });
  let segs = 0;
  const LM = new Float64Array(HMAX + 2), PH = new Float64Array(HMAX + 2);
  for (const E of runSet.values()) {
    const R = getRun(E.i0, E.i1); if (!R) continue;
    const L = R.B - R.A; if (L < 2 * RMP + 8) continue;
    if (R.B <= w0 || R.A >= w1) continue;
    segs++;
    const qa = Math.max(0, w0 - R.A), qb = Math.min(L, w1 - R.A), J = E.js.length;
    const qEnd = Math.min(L, Math.ceil(qb / BLK) * BLK), need = Math.min(L, qEnd + 1);
    const RR = [], PS = [];
    for (const j of E.js) {
      const c = cvs[j].c, ps = new Float64Array(need), rr = new Float32Array(L);
      let P = R.ph[0];
      for (let q = 0; q < need; q++) { const p = (R.A + q) / (H * sr), k = Math.min(an.n - 1, Math.max(0, Math.floor(p))), fr = Math.min(1, Math.max(0, p - k)), k2 = Math.min(an.n - 1, k + 1);
        const cc = c[k] + (c[k2] - c[k]) * fr, r = Math.pow(2, cc / 1200); rr[q] = r; ps[q] = P; P += 2 * Math.PI * R.fs[q] * r / sr; }
      RR.push(rr); PS.push(ps);
    }
    let Cm = new Float64Array(2 * HMAX), Cm2 = new Float64Array(2 * HMAX);
    let Cs = RR.map(() => new Float64Array(2 * HMAX)), Cs2 = RR.map(() => new Float64Array(2 * HMAX));
    let HK = 0;
    const setM = (q, M) => {
      const k = Math.min(R.nf - 1, Math.round(q / R.step)), Hk = R.H[k];
      for (let h = 1; h <= Hk; h++) { coef(R, q, h, o2); LM[h] = o2[0]; PH[h] = o2[1]; const m = Math.exp(o2[0]); M[2 * h - 2] = m * Math.cos(o2[1]); M[2 * h - 1] = m * Math.sin(o2[1]); }
      for (let h = Hk + 1; h <= HMAX; h++) { M[2 * h - 2] = 0; M[2 * h - 1] = 0; }
      LM[0] = LM[1]; LM[Hk + 1] = LM[Hk] - 3; HK = Hk;
    };
    const setS = (q, S, rr) => {
      const Hk = HK, f = R.fs[Math.min(L - 1, q)], r = rr[Math.min(L - 1, q)];
      for (let h = 1; h <= HMAX; h++) {
        const kk = h * r, F = kk * f; if (F >= FTOP || kk > Hk + 0.5 || F >= 0.45 * sr) { S[2 * h - 2] = 0; S[2 * h - 1] = 0; continue; }
        const lo = Math.min(Hk, Math.max(1, Math.floor(kk))), t = Math.min(1, Math.max(0, kk - lo));
        const lm = LM[lo] + (LM[Math.min(Hk + 1, lo + 1)] - LM[lo]) * t;
        const m = Math.exp(lm), p = PH[t < 0.5 ? lo : Math.min(Hk, lo + 1)];
        S[2 * h - 2] = m * Math.cos(p); S[2 * h - 1] = m * Math.sin(p);
      }
    };
    const b0s = Math.floor(qa / BLK) * BLK;
    setM(b0s, Cm); for (let jj = 0; jj < J; jj++) setS(b0s, Cs[jj], RR[jj]);
    for (let b0 = b0s; b0 < qb; b0 += BLK) {
      const b1 = Math.min(L, b0 + BLK), qq = Math.min(L - 1, b1);
      setM(qq, Cm2); for (let jj = 0; jj < J; jj++) setS(qq, Cs2[jj], RR[jj]);
      for (let q = Math.max(b0, qa); q < Math.min(b1, qb); q++) {
        const u = (q - b0) / BLK, P = R.ph[q], zr = Math.cos(P), zi = Math.sin(P);
        let pr = 1, pi = 0, mo = 0;
        for (let h = 1; h <= HMAX; h++) {
          const t1 = pr * zr - pi * zi; pi = pr * zi + pi * zr; pr = t1;
          const k2 = 2 * h - 2, ar = Cm[k2] + (Cm2[k2] - Cm[k2]) * u, ai = Cm[k2 + 1] + (Cm2[k2 + 1] - Cm[k2 + 1]) * u;
          if (ar || ai) mo += ar * pr - ai * pi; else if (h > 2) break;
        }
        let w = 1; if (q < RMP) w = 0.5 - 0.5 * Math.cos(Math.PI * (q + 0.5) / RMP); else if (L - q <= RMP) w = 0.5 - 0.5 * Math.cos(Math.PI * (L - q - 0.5) / RMP);
        const xi = x[R.A + q], oi = R.A + q - w0;
        for (let jj = 0; jj < J; jj++) {
          const Q = PS[jj][q], wr = Math.cos(Q), wi = Math.sin(Q), A1 = Cs[jj], A2 = Cs2[jj];
          let sr_ = 1, si_ = 0, ms = 0;
          for (let h = 1; h <= HMAX; h++) {
            const t2 = sr_ * wr - si_ * wi; si_ = sr_ * wi + si_ * wr; sr_ = t2;
            const k2 = 2 * h - 2, br = A1[k2] + (A2[k2] - A1[k2]) * u, bi = A1[k2 + 1] + (A2[k2 + 1] - A1[k2 + 1]) * u;
            if (br || bi) ms += br * sr_ - bi * si_; else if (h > 2) break;
          }
          ys[E.js[jj]][oi] = xi + w * (ms - mo);
        }
      }
      const tm = Cm; Cm = Cm2; Cm2 = tm; const ts = Cs; Cs = Cs2; Cs2 = ts;
    }
  }
  return {ys, segs};
}
// Zischlaute im Chor: in stimmlosen Abschnitten (Analyse-Frames ohne f0) Pegel db; 10-ms-Kosinus-Blenden liegen IM stimmlosen Teil
// (stimmhafte Teile bleiben unverändert). db ≥ 0 → null (bitgleich)
function sibGain(an, sr, w0, w1, db) {
  if (!(db < 0)) return null;
  const gs = db <= -59.5 ? 0.001 : Math.pow(10, db / 20), n = w1 - w0, g = new Float32Array(n).fill(gs), H = an.hop * sr, R = Math.round(0.010 * sr), f0 = an.f0;
  const on = (a, b) => { for (let i = Math.max(0, a - w0); i < Math.min(n, b - w0); i++) g[i] = 1; };
  const ramp = (a, b, up) => { const L = b - a; for (let s = a; s < b; s++) { const i = s - w0; if (i < 0 || i >= n) continue; const u = (s - a + 0.5) / L, c = 0.5 - 0.5 * Math.cos(Math.PI * (up ? u : 1 - u)); g[i] = gs + (1 - gs) * c; } };
  let prevEnd = -Infinity;
  for (let i = 0; i < an.n;) {
    if (!(f0[i] > 0)) { i++; continue; }
    let j = i; while (j < an.n && f0[j] > 0) j++;
    const a = Math.max(0, Math.round((i - 0.5) * H)), b = Math.round((j - 0.5) * H);
    // Lücke [prevEnd, a): Blende ab prevEnd hinunter, vor a hinauf
    if (prevEnd > -Infinity) { const gap = a - prevEnd, r = Math.min(R, gap >> 1); if (r > 0) { ramp(prevEnd, prevEnd + r, false); ramp(a - r, a, true); } }
    else { const r = Math.min(R, a); if (r > 0) ramp(a - r, a, true); }
    on(a, b); prevEnd = b; i = j;
  }
  if (prevEnd > -Infinity) ramp(prevEnd, prevEnd + R, false);
  return g;
}
// BS.1770-4: K-Bewertung mit Beiwerten je Abtastrate (bilineare Abbildung mit Vorverzerrung; bei 48 kHz = Tabelle der Norm)
function kCoef(fs) {
  let K = Math.tan(Math.PI * 1681.974450955533 / fs); const Q = 0.7071752369554196, Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, 0.4996667741545416);
  let a0 = 1 + K / Q + K * K;
  const s1 = {b: [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0], a: [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]};
  K = Math.tan(Math.PI * 38.13547087602444 / fs); const Q2 = 0.5003270373238773; a0 = 1 + K / Q2 + K * K;
  const s2 = {b: [1, -2, 1], a: [1, 2 * (K * K - 1) / a0, (1 - K / Q2 + K * K) / a0]};
  return [s1, s2];
}
function lufs(chs, sr) {
  const [s1, s2] = kCoef(sr), n = chs.length ? chs[0].length : 0, Bk = Math.round(0.4 * sr), St = Math.round(0.1 * sr);
  const z = chs.map(x => {
    const y = new Float64Array(n); let x1 = 0, x2 = 0, y1 = 0, y2 = 0, u1 = 0, u2 = 0, v1 = 0, v2 = 0;
    for (let i = 0; i < n; i++) {
      const u = x[i], o = s1.b[0] * u + s1.b[1] * x1 + s1.b[2] * x2 - s1.a[1] * y1 - s1.a[2] * y2; x2 = x1; x1 = u; y2 = y1; y1 = o;
      const p = s2.b[0] * o + s2.b[1] * u1 + s2.b[2] * u2 - s2.a[1] * v1 - s2.a[2] * v2; u2 = u1; u1 = o; v2 = v1; v1 = p; y[i] = p * p;
    }
    const c = new Float64Array(n + 1); for (let i = 0; i < n; i++) c[i + 1] = c[i] + y[i]; return c;
  });
  const blk = [];
  if (n < Bk) { let s = 0; for (const c of z) s += n ? c[n] / n : 0; blk.push(s); }
  else for (let s = 0; s + Bk <= n; s += St) { let e = 0; for (const c of z) e += (c[s + Bk] - c[s]) / Bk; blk.push(e); }
  const Lk = e => -0.691 + 10 * Math.log10(e);
  const g1 = blk.filter(e => e > 0 && Lk(e) > -70); if (!g1.length) return {lufs: -Infinity, blocks: 0};
  const m1 = g1.reduce((s, e) => s + e, 0) / g1.length, thr = Lk(m1) - 10;
  const g2 = g1.filter(e => Lk(e) > thr), m2 = g2.reduce((s, e) => s + e, 0) / g2.length;
  return {lufs: Lk(m2), blocks: g2.length};
}
return {modelRuns, renderMulti, sibGain, kCoef, lufs, anN: 0};
}
// im G2-Worker (gleiche Analyse-Ablage C wie G2): Chor rechnen bzw. Lautheit messen. {need: 1} = Quelle fehlt dort (neu schicken)
function g6pRun(V, P, C, D, m) {
  if (m.op === 'lu') return {lu: D.lufs(m.chs, m.sr)};
  let a = C.get(m.key);
  if (!a) { if (!m.x) return {need: 1}; a = P.analyse(m.x, m.sr, V); a.x = m.x; C.set(m.key, a); while (C.size > 3) C.delete(C.keys().next().value); D.anN++; }
  let x = a.x, getRun;
  if (m.rkey) {
    const RX = a.rx6 || (a.rx6 = new Map()); let e = RX.get(m.rkey);
    if (!e) { if (!m.rx) return {need: 1}; e = {x: m.rx, runs: new Map()}; RX.set(m.rkey, e); while (RX.size > 2) RX.delete(RX.keys().next().value); }
    x = e.x;
    const full = a.rm && a.rm.get(m.rkey);                       // G2 hat das Modell dieser G4-Fassung schon ganz gerechnet: mitbenutzen
    if (full) getRun = (i0, i1) => full.find(z => z.i0 === i0 && z.i1 === i1);
    else { D.modelRuns(x, m.sr, a, m.w0, m.w1, e.runs); getRun = i0 => e.runs.get(i0); }
  } else { if (!a.mdl) a.mdl = P.model(x, m.sr, a); getRun = (i0, i1) => a.mdl.find(z => z.i0 === i0 && z.i1 === i1); }
  const w0 = Math.max(0, m.w0 | 0), w1 = Math.min(x.length, m.w1 | 0);
  const cvs = m.plans.map(pl => (pl ? P.curve(a, pl) : {c: null, runs: []}));
  const r = D.renderMulti(x, m.sr, a, getRun, cvs, w0, w1), g = D.sibGain(a, m.sr, w0, w1, m.sib);
  if (g) for (const y of r.ys) for (let i = 0; i < y.length; i++) y[i] *= g[i];
  return {ys: r.ys, segs: r.segs, an: D.anN, w0, w1};
}

const G6P = {cache: new Map(), bytes: 0, q: [], busy: null, sent: new Set(), renders: 0, last: null, an: 0, lu: new Map(), gA: new Map(), gAlast: new WeakMap(), meas: new Map(), on: [], spec: new WeakMap(), lastMs: []};
const G6P_MAX = 48 * 1048576;
const G6P_D = g6pDspMake();
/* ---------- Regeln, Plan ---------- */
// Rolle/Regel (feste Schreibweise §2.2): st±n, oct±n, ch±n, root-, uni, free, je mit /o±n
function g6pRule(s) {
  const p = String(s || 'uni').split('/o'), b = p[0], oo = p[1] != null && /^[+-][12]$/.test(p[1]) ? +p[1] : 0;
  let m;
  if ((m = /^st([+-][1-7])$/.exec(b))) return {k: 'd', d: +m[1], o: oo};
  if ((m = /^oct([+-][12])$/.exec(b))) return {k: 'd', d: 0, o: +m[1] + oo};
  if ((m = /^ch([+-][1-3])$/.exec(b))) return {k: 'ch', n: +m[1], o: oo};
  if (b === 'root-') return {k: 'root', o: oo};
  return {k: 'd', d: 0, o: oo};                                   // uni, free
}
// Chorton zu einem (gehörten, ganzen) Lead-Ton L: Stufen d in der Tonart (d = 0: der Ton selbst), + 12·o + x
function g6pTone(L, d, o, x, key) { return (d ? g6Step(L, d, key) : L) + 12 * (o || 0) + (x || 0); }
function g6pChordTone(L, R, key, pcs) {
  const tri = g6Chord(L, key, pcs); let q;
  if (R.k === 'root') { const b = g6Below(L, tri); q = b - 1; while ((((q % 12) + 12) % 12) !== tri[0] || q > b - 3) q--; }
  else { q = L; for (let i = 0; i < Math.abs(R.n); i++) q = R.n > 0 ? g6Above(q, tri) : g6Below(q, tri); }
  return q + 12 * (R.o || 0);
}
function g6pRefOf(a) {
  const st = stimmeT();
  if (st >= 0) { const cs = S.tracks[st].clips; for (let s = 0; s < cs.length; s++) if (cs[s] && cs[s].audio === a) return {t: st, s}; }
  if (S.song && S.song.vox && S.song.vox.includes(a)) return {vox: a.id};
  return null;
}
// Lead-Noten (Tonhöhen-Feld oder erkannte Noten der Quelle; fehlt die Analyse, wird sie jetzt gesucht)
function g6pLeadP(id) {
  const m = S.takes && S.takes[id]; if (!m) return null; if (m.pitch) return m.pitch;
  const A = G2.an.get(id), b = g2Src(id);
  if (!A || !b || A.key !== id + '@' + wpBid(b)) { if (b && !G6P.anWait) { G6P.anWait = 1; g2Analyse(id).then(() => { G6P.anWait = 0; g6pPump(); g6pNotify(null); }, e => { G6P.anWait = 0; logErr(e); }); } if (!A) return null; }
  return {mode: 'soft', str: 1, q: false, notes: A.notes};
}
// Chornote zur Lead-Note: gleiches t0, sonst die Chornote, die die Lead-Note zu ≥ 50 % überdeckt (die größte)
function g6pNoteFor(v, ln) {
  const N = v.n || []; let best = null, bo = 0; const t0 = tkR6(ln.t0), half = 0.5 * (ln.t1 - ln.t0);
  for (const n of N) { if (tkR6(n.t0) === t0) return n; const ov = Math.min(n.t1, ln.t1) - Math.max(n.t0, ln.t0); if (ov >= half - 1e-9 && ov > bo) { bo = ov; best = n; } }
  return best;
}
// je Lead-Note: {t0, t1, L (gehört ohne G7), Lp (mit G7), c (Chor ohne G7), cp (mit G7), eL (Lead-Eintrag Cent), to, s, m}
function g6pLead(a) {
  const id = a && a.take, P = id && g6pLeadP(id); if (!P) return null;
  const st = stimmeT(), r = g6pRefOf(a), key = g2KeyAt(r);
  let xs = null; try { xs = typeof g7Shift === 'function' ? g7Shift(id, a, P) : null; } catch (e) { xs = null; }
  const fol = typeof g7Follows === 'function' && g7Follows(id) && st >= 0 && S.tracks[st].follow !== false;
  const k7 = fol ? g7Key(a) : null, t7 = typeof G7 !== 'undefined' && G7.t != null ? G7.t : nowT() + .35;
  const notes = P.notes.map((n, k) => { const L = Math.round(g2Target(P, n)), x = xs ? xs[k] || 0 : 0;
    return {t0: n.t0, t1: n.t1, m: n.m, to: P.q ? g2Snap(n.m, P.key) : n.m, s: P.q ? P.str : 0, L, Lp: L + x, eL: 100 * ((n.sh || 0) + x)}; });
  return {id, P, r, key, st, fol, k7, t7, notes};
}
// Töne der Stimme je Lead-Note (auch für die Anzeige / Schatten)
function g6pTones(a, v, LD) {
  LD = LD || g6pLead(a); if (!LD) return null;
  const R = g6pRule(v.rule), sp = spb();
  return LD.notes.map(ln => {
    const cn = g6pNoteFor(v, ln); let c;
    if (cn && (isNum(cn.d) || isNum(cn.o) || isNum(cn.x))) c = g6pTone(ln.L, cn.d | 0, cn.o | 0, cn.x | 0, LD.key);
    else if (R.k === 'd') c = g6pTone(ln.L, R.d, R.o, 0, LD.key);
    else { const beat = (ln.t0 - (a.in || 0)) / sp + (a.at || 0), pcs = LD.r && LD.r.t != null ? g6HeardPcs(LD.r, beat) : null; c = g6pChordTone(ln.L, R, LD.key, pcs); }
    c = clamp(c, 0, 127);
    let cp = c; if (LD.fol && LD.k7) { try { cp = outPitch(LD.st, LD.k7, c, LD.t7); } catch (e) { logErr(e); } }
    return {t0: ln.t0, t1: ln.t1, L: ln.L, Lp: ln.Lp, c, cp};
  });
}
// G2-Plan einer Kopie (ct Cent); null = keine Verschiebung (Ausgabe = Quelle)
function g6pPlan(a, v, ct, LD) {
  if (v.take) {
    const tid = v.take.take, base = g2Plan(tid, a);
    if (base) { const pl = {mode: base.mode, notes: base.notes.map(n => Object.assign({}, n, {e: n.e + ct}))}; return G2P.active(pl) ? pl : null; }
    const m = S.takes && S.takes[tid]; if (!ct || !m) return null;
    return {mode: 'soft', notes: [{t0: 0, t1: tkR6(m.len / m.sr), m: 60, to: 60, s: 0, e: ct}]};
  }
  LD = LD || g6pLead(a); if (!LD) return undefined;              // undefined = noch nicht bereit (Analyse läuft)
  const T = g6pTones(a, v, LD);
  const pl = {mode: LD.P.mode, notes: LD.notes.map((n, k) => ({t0: n.t0, t1: n.t1, m: n.m, to: n.to, s: n.s, e: n.eL + 100 * (T[k].cp - n.Lp) + ct}))};
  return G2P.active(pl) ? pl : null;
}
const g6pCopies = v => (v.dblOff || !Array.isArray(v.dbl) || !v.dbl.length ? [{ms: 0, ct: 0, p: 0}] : v.dbl.slice(0, 4).map(d => ({ms: isNum(d.ms) ? d.ms : 0, ct: isNum(d.ct) ? d.ct : 0, p: isNum(d.p) ? d.p : 0})));
const g6pSib = c => { const s = c && c.grp ? c.grp.sib : 0; return s === 'weg' ? -60 : isNum(s) ? clamp(s, -60, 0) : 0; };
// Fenster (gehörte Take-Zeit, s) der Stimme: errechnete, entkoppelte und duplizierte Stimmen = Fenster des Lead-Stücks, selbst gesungene ihr eigenes
function g6pWin(a, v) {
  const tid = v.take ? v.take.take : a.take, m = S.takes && S.takes[tid]; if (!m) return null;
  const own = v.take && !(m.src === 'dup' || m.src === 'chor'), sg = own ? v.take : {take: tid, in: a.in, out: a.out, at: a.at};
  const len = m.len / m.sr, h0 = clamp(sg.in - g3PreOf(sg), 0, len), h1 = clamp(sg.out + g3PostOf(sg), 0, len);
  return {tid, own, seg: sg, h0, h1, len};
}
// gehörte Zeit → Zeit vor der Zeitkarte (stückweise linear, Umkehrung von src → dst)
function g6pInv(w, t) { const s = w.map.src, d = w.map.dst; if (t <= 0) return t; for (let k = 1; k < s.length; k++) if (t <= d[k] || k === s.length - 1) { const f = (t - d[k - 1]) / Math.max(1e-9, d[k] - d[k - 1]); return s[k - 1] + f * (s[k] - s[k - 1]); } return t; }
// Auftrag einer Stimme: alle Kopien (gleiche Kopien teilen sich einen Puffer)
function g6pSpec(a, v, LD) {
  const W = g6pWin(a, v); if (!W) return null;
  const snd = g2Base(W.tid, a), src = g2Src(W.tid) || snd; if (!snd || !src) { tkLoad(W.tid); return null; }
  const sr = snd.sampleRate, warp = wpWarp(W.tid), sib = g6pSib(a.chor);
  const hw0 = Math.floor(W.h0 * sr), hw1 = Math.max(hw0 + 1, Math.ceil(W.h1 * sr));
  let w0 = hw0, w1 = hw1;
  if (warp) { w0 = Math.max(0, Math.floor((g6pInv(warp, W.h0) - .25) * sr)); w1 = Math.min(snd.length, Math.ceil((g6pInv(warp, W.h1) + .25) * sr)); }
  const cps = g6pCopies(v), plans = [], keys = [], idx = [], base = '|' + wpBid(snd) + '|' + wpBid(src) + '|' + hw0 + ':' + hw1 + '|' + sib + '|' + (warp ? wpKey(warp, snd) : '');
  for (const C of cps) {
    const pl = g6pPlan(a, v, C.ct, LD); if (pl === undefined) return null;
    const k = (pl ? G2P.planKey(pl) + (pl.mode === 'hard' ? 'h' : '') : 'id') + base;
    let j = keys.indexOf(k); if (j < 0) { j = keys.length; keys.push(k); plans.push(pl); } idx.push(j);
  }
  return {W, snd, src, sr, warp, sib, hw0, hw1, w0, w1, plans, keys, idx, jk: keys.join('&')};
}
/* ---------- Cache (Bytes, LRU, zusammen mit v1) ---------- */
function g6pTrim() {
  const v1 = () => { let s = 0; for (const x of G6.cache.values()) s += (x.n || 0) * 4; return s; };
  let tot = G6P.bytes + v1();
  while (tot > G6P_MAX) {
    let ok = null, ot = Infinity, M = null;
    for (const [k, x] of G6P.cache) if (x.t < ot) { ot = x.t; ok = k; M = G6P.cache; }
    for (const [k, x] of G6.cache) if (x.t < ot) { ot = x.t; ok = k; M = G6.cache; }
    if (!M) break;
    const x = M.get(ok); M.delete(ok);
    if (M === G6P.cache) G6P.bytes -= x.bytes; tot -= M === G6P.cache ? x.bytes : (x.n || 0) * 4;
    G6P.evict = (G6P.evict | 0) + 1;
  }
}
// Puffer der Kopie k von Stimme v an der Stelle a: {buf, t0 (gehörte Take-Zeit von Sample 0, s)} oder null (wird gerechnet)
function g6pBuf(a, v, k, prio) {
  if (!a || !a.chor || a.chor.v !== 2) return null;
  const sp = g6pSpec(a, v); if (!sp) return null;
  const key = sp.keys[sp.idx[Math.min(k | 0, sp.idx.length - 1)]], hit = G6P.cache.get(key);
  if (hit) { hit.t = performance.now(); return hit; }
  g6pEnqueue(sp, prio == null ? 2 : prio);
  return null;
}
function g6pVoiceReady(a, v) { const sp = g6pSpec(a, v); return !!sp && sp.keys.every(k => G6P.cache.has(k)); }
function g6pBufsReady(a) { const c = a && a.chor; if (!c || c.v !== 2) return true; return c.voices.every(v => g6pVoiceReady(a, v)); }
function g6pReady(a) { const c = a && a.chor; if (!c || c.v !== 2) return true; return g6pBufsReady(a) && g6pGA(a) != null; }
/* ---------- Warteschlange nach Vorrang (ein Chor-Auftrag zur Zeit im G2-Worker) ---------- */
function g6pEnqueue(sp, prio) {
  if (sp.keys.every(k => G6P.cache.has(k))) return;
  if (G6P.busy && G6P.busy.jk === sp.jk) return;
  const q = G6P.q.find(j => j.jk === sp.jk);
  if (q) { if (prio < q.prio) q.prio = prio; q.sp = sp; } else G6P.q.push({jk: sp.jk, prio, sp, n: ++G6P.seq});
  g6pPump();
}
G6P.seq = 0;
function g6pPump() {
  if (G6P.busy || !G6P.q.length) return;
  G6P.q.sort((x, y) => x.prio - y.prio || x.n - y.n);
  const J = G6P.q.shift(); G6P.busy = J;
  g6pRunJob(J.sp).then(() => { G6P.busy = null; g6pPump(); }, e => { G6P.busy = null; logErr(e); g6pPump(); });
}
// Worker-Aufruf (G2-Worker, eigene Op; Rückfall Hauptfaden)
const G6P_LOCAL = new Map();
function g6pCall(m) {
  const w = g2Worker(), local = () => { G6P.how = 'hauptfaden'; G6P.sent.clear(); const r = g6pRun(VSD, G2P, G2_LOCAL, G6P_D, Object.assign({}, m)); return r; };
  if (!w) return Promise.resolve().then(local);
  return new Promise((ok, no) => {
    const id = ++G2.wid, tr = [], o = Object.assign({}, m, {id});
    if (m.x) { o.x = new Float32Array(m.x); tr.push(o.x.buffer); }
    if (m.rx) { o.rx = new Float32Array(m.rx); tr.push(o.rx.buffer); }
    if (m.chs) for (const c of m.chs) tr.push(c.buffer);
    const to = setTimeout(() => { G2.wq.delete(id); try { ok(local()); } catch (e) { no(e); } }, 60000);
    G2.wq.set(id, {ok: r => { G6P.how = 'worker'; ok(r); }, no: e => { try { ok(local()); } catch (er) { no(e); } }, to});
    try { w.postMessage(o, tr); } catch (e) { clearTimeout(to); G2.wq.delete(id); try { ok(local()); } catch (er) { no(er); } }
  });
}
// Zeitkarte auf das Fenster: Quelle ganz (außerhalb des Fensters die G4-Fassung), dieselbe Nachricht wie wpRender, danach auf das Fenster gekürzt
function g6pWarpMsg(w, x, sr) {
  const s = w.map.src, d = w.map.dst, L = Math.round(WP_LEAD * sr) / sr;
  if (w.mode === 'stretch') {
    const S2 = [], D2 = [];
    for (let k = 1; k < s.length - 1; k++) { const l = Math.min(L, Math.max(0, Math.floor(Math.min(s[k], d[k]) * sr) - 1) / sr), a = s[k] - l, c = d[k] - l; if (!S2.length || (a > S2[S2.length - 1] + 1e-6 && c > D2[D2.length - 1] + 1e-6)) { S2.push(a); D2.push(c); } }
    if (!S2.length) { S2.push(0); D2.push(0); }
    const h = D2[0] - S2[0], e = D2[D2.length - 1] - S2[S2.length - 1], end = s[s.length - 1];
    if (S2[0] > 1e-6 && D2[0] > 1e-6) { if (h >= 0) { S2.unshift(0); D2.unshift(h); } else { S2.unshift(-h); D2.unshift(0); } }
    if (end > S2[S2.length - 1] + 1e-6 && end + e > D2[D2.length - 1] + 1e-6) { S2.push(end); D2.push(end + e); }
    return {op: 'stretch', x, sr, src: S2, dst: D2, lock: .02 + L};
  }
  return {op: 'slice', x, sr, on: s.slice(1, -1).map(v => v - L), to: d.slice(1, -1).map(v => v - L)};
}
async function g6pRunJob(sp) {
  const t0 = performance.now(), W = sp.W, id = W.tid;
  const msg = {op: 'chor', key: id + '@' + wpBid(sp.src), sr: sp.sr, w0: sp.w0, w1: sp.w1, plans: sp.plans, sib: sp.sib};
  if (sp.snd !== sp.src) msg.rkey = id + '@' + wpBid(sp.snd);
  const sk = msg.key + '#' + (msg.rkey || '');
  if (!G6P.sent.has(sk)) { msg.x = sp.src.getChannelData(0); if (msg.rkey) msg.rx = sp.snd.getChannelData(0); }
  let r = await g6pCall(msg);
  if (r && r.need) { msg.x = sp.src.getChannelData(0); if (msg.rkey) msg.rx = sp.snd.getChannelData(0); r = await g6pCall(msg); }
  if (!r || !r.ys) return;
  G6P.sent.add(sk); if (G6P.sent.size > 6) G6P.sent.delete(G6P.sent.values().next().value);
  G6P.an = r.an;
  for (let j = 0; j < r.ys.length; j++) {
    let y = r.ys[j];
    if (sp.warp) {
      const full = Float32Array.from(sp.snd.getChannelData(0)); full.set(y, r.w0);
      const o = await wpCall(g6pWarpMsg(sp.warp, full, sp.sr)), z = o && o.y ? o.y : o;
      y = z.slice(sp.hw0, Math.min(z.length, sp.hw1));
    } else if (r.w0 !== sp.hw0 || r.w1 !== sp.hw1) y = y.slice(sp.hw0 - r.w0, sp.hw1 - r.w0);
    const buf = wpToBuf(y, sp.sr); if (!buf) continue;
    const old = G6P.cache.get(sp.keys[j]); if (old) G6P.bytes -= old.bytes;
    G6P.cache.set(sp.keys[j], {buf, t0: sp.hw0 / sp.sr, t: performance.now(), bytes: y.length * 4});
    G6P.bytes += y.length * 4;
  }
  G6P.renders++; const ms = Math.round(performance.now() - t0);
  G6P.last = {ms, how: G6P.how, copies: sp.idx.length, bufs: r.ys.length, segs: r.segs, n: sp.hw1 - sp.hw0, warp: !!sp.warp};
  G6P.lastMs.push(ms); if (G6P.lastMs.length > 32) G6P.lastMs.shift();
  g6pTrim();
  g6pNotify(id);
}
function g6pNotify(id) {
  UI.dirty.grid = UI.dirty.song = true;
  for (const f of G6P.on) { try { f(id); } catch (e) { logErr(e); } }
}
/* ---------- Gruppen-Klang (gemeinsam für Messung und Klangweg) ---------- */
// Tiefschnitt (Hochpass 12 dB/Okt., Butterworth), Mitte (Glocke Q 1), Luft (Kuhschwanz 10 kHz); Rückgabe {inp, out, nodes}
function g6pGroupNodes(ctx, grp) {
  const g = grp || {}, hp = ctx.createBiquadFilter(), mid = ctx.createBiquadFilter(), air = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = isNum(g.hp) && g.hp > 0 ? g.hp : 10; hp.Q.value = -3.0103;   // Web-Audio: Q in dB bei Hoch-/Tiefpass (−3,01 dB = Butterworth)
  mid.type = 'peaking'; mid.frequency.value = isNum(g.midF) && g.midF > 0 ? g.midF : 1000; mid.Q.value = 1; mid.gain.value = isNum(g.mid) ? g.mid : 0;
  air.type = 'highshelf'; air.frequency.value = 10000; air.gain.value = isNum(g.air) ? g.air : 0;
  hp.connect(mid); mid.connect(air);
  return {inp: hp, out: air, nodes: [hp, mid, air]};
}
const g6pPanOf = (v, C) => clamp((isNum(v.pan) ? v.pan : 0) + (C.p || 0) * (isNum(v.w) ? v.w : 0), -1, 1);
/* ---------- Lautheit und Auto-Pegel gA ---------- */
function g6pMixKey(a) {
  const c = a.chor, g = c.grp || {}, parts = [];
  for (const v of c.voices) { const sp = g6pSpec(a, v); if (!sp) return null; parts.push(sp.jk, v.db, v.pan, v.w, JSON.stringify(g6pCopies(v).map(C => [C.ms, C.p]))); }
  const lb = tkHeard(a.take, a); if (!lb) return null;
  return parts.join('/') + '|' + [g.below, g.hp, g.mid, g.midF, g.air].join(',') + '|L' + wpBid(lb) + ':' + a.in + ':' + a.out;
}
// gA der Stelle (linear) oder null (noch nicht gemessen); nach einer Mischungs-Geste gilt bis zur neuen Messung der vorige Wert
function g6pGA(a) {
  const c = a && a.chor; if (!c || c.v !== 2) return null;
  if (!g6pBufsReady(a)) { g6pPrefetch(a, 1); return G6P.gAlast.has(a) && G6P.gAlast.get(a).stale ? G6P.gAlast.get(a).g : null; }
  const k = g6pMixKey(a); if (!k) return null;
  const hit = G6P.gA.get(k); if (hit) { G6P.gAlast.set(a, {g: hit.g, stale: true}); return hit.g; }
  g6pMeasureSoon(a, k);
  const L = G6P.gAlast.get(a); return L ? L.g : null;
}
function g6pMixChanged(a) { const k = a && a.chor && a.chor.v === 2 ? g6pMixKey(a) : null; if (k && !G6P.gA.has(k)) g6pMeasureSoon(a, k, 150); }
function g6pMeasureSoon(a, k, ms) {
  const M = G6P.meas.get(a); if (M && M.k === k) return;
  if (M) clearTimeout(M.tm);
  const first = !G6P.gAlast.has(a), E = {k, tm: setTimeout(() => g6pMeasure(a, k).catch(logErr).then(() => { if (G6P.meas.get(a) === E) G6P.meas.delete(a); }), first ? 0 : (ms == null ? 150 : ms))};
  G6P.meas.set(a, E);
}
async function g6pMeasure(a, k) {
  const c = a.chor; if (!c || c.v !== 2 || g6pMixKey(a) !== k) return;
  const t0 = performance.now(), lb = tkHeard(a.take, a), sr = lb.sampleRate, W = g6pWin(a, {}); if (!W) return;
  const hw0 = Math.floor(W.h0 * sr), hw1 = Math.max(hw0 + 1, Math.ceil(W.h1 * sr)), lk = wpBid(lb) + ':' + hw0 + ':' + hw1;
  let Ll = G6P.lu.get(lk);
  if (Ll == null) { const r = await g6pCall({op: 'lu', chs: [lb.getChannelData(0).slice(hw0, Math.min(lb.length, hw1))], sr}); Ll = r.lu.lufs; G6P.lu.set(lk, Ll); if (G6P.lu.size > 64) G6P.lu.delete(G6P.lu.keys().next().value); }
  const Lc = await g6pChorLu(a, sr, hw0 / sr, (hw1 - hw0) / sr);
  const below = c.grp && isNum(c.grp.below) ? c.grp.below : 9;
  const g = isFinite(Ll) && isFinite(Lc) ? Math.pow(10, (Ll - below - Lc) / 20) : 1;
  G6P.gA.set(k, {g, Ll, Lc, ms: Math.round(performance.now() - t0)}); if (G6P.gA.size > 64) G6P.gA.delete(G6P.gA.keys().next().value);
  G6P.gAlast.set(a, {g, stale: true}); G6P.lastLu = {Ll, Lc, g, below, ms: Math.round(performance.now() - t0)};
  g6pNotify(a.take);
}
// Chor-Mischung nur zum Messen (Offline: dieselben Knoten wie live – Versatz, Pegel, Pan, Gruppen-Klang; ohne Stumm/Solo und ohne gA)
async function g6pChorLu(a, sr, T0, dur, raw) {
  const c = a.chor, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return -Infinity;
  let mx = 0; for (const v of c.voices) for (const C of g6pCopies(v)) mx = Math.max(mx, C.ms || 0);
  const N = Math.max(1, Math.ceil((dur + mx / 1000 + .01) * sr)), ctx = new OAC(2, N, sr), G = g6pGroupNodes(ctx, c.grp);
  G.out.connect(ctx.destination);
  for (const v of c.voices) {
    const sp = g6pSpec(a, v); if (!sp) return -Infinity; const cps = g6pCopies(v);
    cps.forEach((C, k) => {
      const e = G6P.cache.get(sp.keys[sp.idx[k]]); if (!e) return;
      const s = ctx.createBufferSource(), gn = ctx.createGain(), pn = ctx.createStereoPanner();
      s.buffer = e.buf; gn.gain.value = Math.pow(10, (isNum(v.db) ? v.db : 0) / 20); pn.pan.value = g6pPanOf(v, C);
      s.connect(gn); gn.connect(pn); pn.connect(G.inp);
      // selbst gesungen: eigenes Fenster – die Take-Zeit zur Lead-Zeit T0 wie g6Start (off = in + (T0 − a.in) + (a.at − at)·spb)
      let when = (C.ms || 0) / 1000, off = (sp.W.own ? v.take.in + (T0 - a.in) + (a.at - v.take.at) * spb() : T0) - e.t0;
      if (off < 0) { when -= off; off = 0; }
      s.start(when, off, dur);
    });
  }
  const out = await new Promise((ok, no) => { ctx.oncomplete = e => ok(e.renderedBuffer); const p = ctx.startRendering(); if (p && p.then) p.then(ok, no); });
  if (raw) return out;
  const r = await g6pCall({op: 'lu', chs: [out.getChannelData(0).slice(), out.getChannelData(1).slice()], sr});
  return r.lu.lufs;
}
/* ---------- Vorausrechnen ---------- */
function g6pPrefetch(a, prio) {
  const c = a && a.chor; if (!c || c.v !== 2) return;
  const LD = g6pLead(a); if (!LD && c.voices.some(v => !v.take)) return;
  for (const v of c.voices) { const sp = g6pSpec(a, v, LD); if (sp) g6pEnqueue(sp, prio == null ? 2 : prio); }
}
// Song: das nächste Song-Stimmen-Stück mit Chor (nach Takt) vorrechnen
function g6pPrefetchNext(a) {
  const L = S.song && S.song.vox; if (!L) return;
  const nx = L.filter(v => v.chor && v.chor.v === 2 && v.bar > (isNum(a.bar) ? a.bar : -1)).sort((x, y) => x.bar - y.bar)[0]; if (nx) g6pPrefetch(nx, 1);
}
// Planen eines Lead-Stücks: läuft gleich (Vorrang 0); im Song gleich den nächsten Teil mit (1)
tkExt().place.push(o => { const a = o && o.a; if (a && a.chor && a.chor.v === 2) { g6pPrefetch(a, 0); if (o.vox) g6pPrefetchNext(a); } });
/* ---------- Test-API ---------- */
const G6PB_API = {
  g6pbTone: (L, rule, key, x) => { const R = g6pRule(rule); return R.k === 'd' ? g6pTone(L, R.d, R.o, x || 0, key) : g6pChordTone(L, R, key, null); },
  g6pbSet: (r, chor) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); if (!x) return false; if (chor) x.a.chor = deep(chor); else delete x.a.chor; return true; },
  g6pbTones: (r, k) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k]; return v ? g6pTones(x.a, v) : null; },
  g6pbPlan: (r, k, c) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k]; if (!v) return null; const C = g6pCopies(v)[c || 0]; const p = g6pPlan(x.a, v, C.ct); return p === undefined ? 'wait' : p; },
  g6pbWin: (r, k) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k || 0]; if (!v) return null; const sp = g6pSpec(x.a, v); return sp ? {h0: sp.W.h0, h1: sp.W.h1, hw0: sp.hw0, hw1: sp.hw1, w0: sp.w0, w1: sp.w1, keys: sp.keys.length, copies: sp.idx.length, sr: sp.sr} : null; },
  g6pbWait: async (r, ms) => { r = r || {t: stimmeT(), s: R.selS}; const T = performance.now() + (ms || 60000); while (performance.now() < T) { const x = tkRef(r); if (x && x.a.chor) { g6pPrefetch(x.a, 0); if (g6pBufsReady(x.a) && g6pGA(x.a) != null && !G6P.busy && !G6P.meas.size) return true; } await sleep(25); } return false; },
  g6pbBufs: async (r, ms) => { r = r || {t: stimmeT(), s: R.selS}; const T = performance.now() + (ms || 60000); while (performance.now() < T) { const x = tkRef(r); if (x && x.a.chor) { g6pPrefetch(x.a, 0); if (g6pBufsReady(x.a)) return true; } await sleep(20); } return false; },
  g6pbBuf: (r, k, c, a0, b0) => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), v = x && x.a.chor && x.a.chor.voices[k]; const e = v && g6pBuf(x.a, v, c || 0); if (!e) return null; const d = e.buf.getChannelData(0); return {sr: e.buf.sampleRate, n: e.buf.length, t0: e.t0, data: a0 === false ? null : Array.from(d.subarray(a0 || 0, b0 == null ? d.length : b0))}; },
  g6pbGA: r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); if (!x) return null; const g = g6pGA(x.a), k = g6pMixKey(x.a), m = k && G6P.gA.get(k); return {g, m: m || null}; },
  g6pbMixChanged: r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); if (x) g6pMixChanged(x.a); return true; },
  g6pbChorMix: async r => { r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r); const lb = tkHeard(x.a.take, x.a), sr = lb.sampleRate, W = g6pWin(x.a, {}), hw0 = Math.floor(W.h0 * sr), hw1 = Math.ceil(W.h1 * sr);
    const o = await g6pChorLu(x.a, sr, hw0 / sr, (hw1 - hw0) / sr, true); return {sr, L: Array.from(o.getChannelData(0)), R: Array.from(o.getChannelData(1)), lead: Array.from(lb.getChannelData(0).subarray(hw0, hw1))}; },
  g6pbLu: async (chs, sr) => (await g6pCall({op: 'lu', chs: chs.map(c => Float32Array.from(c)), sr})).lu,
  g6pbK: sr => G6P_D.kCoef(sr),
  g6pbInfo: () => ({bytes: G6P.bytes, v1bytes: [...G6.cache.values()].reduce((s, x) => s + (x.n || 0) * 4, 0), n: G6P.cache.size, renders: G6P.renders, an: G6P.an, last: G6P.last, lastMs: G6P.lastMs.slice(), q: G6P.q.map(j => j.prio), busy: !!G6P.busy, evict: G6P.evict | 0, how: G6P.how, lu: G6P.lastLu || null}),
  g6pbClear: () => { G6P.cache.clear(); G6P.bytes = 0; G6P.gA.clear(); G6P.lu.clear(); return true; },
  // G6P-13 (Nachweis): Fenster-Rechnung = Ganz-Rechnung im Fenster. v1: Plan wie g6Plan auf der gehörten Fassung (Schlüssel wie g6Buf)
  g6pbWinTest: async (r, k, c, s0, s1, v1) => {
    r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), a = x.a, v = a.chor.voices[k];
    let b, src, plan, key;
    if (v1) { b = g6Lead(a); src = b; plan = g6Plan(v, c || 0); key = 'h:' + a.take + '@' + wpBid(b); }
    else { b = g2Base(a.take, a); src = g2Src(a.take) || b; plan = g6pPlan(a, v, g6pCopies(v)[c || 0].ct); key = a.take + '@' + wpBid(src); }
    const sr = b.sampleRate, n = b.length, w0 = Math.round(s0 * sr), w1 = Math.round(s1 * sr);
    const msg = {op: 'chor', key, sr, plans: [plan], sib: 0, x: src.getChannelData(0)}; if (!v1 && src !== b) { msg.rkey = a.take + '@' + wpBid(b); msg.rx = b.getChannelData(0); }
    const t1 = performance.now(), W = await g6pCall(Object.assign({}, msg, {w0, w1})), tw = performance.now() - t1;
    const t2 = performance.now(), F = await g6pCall(Object.assign({}, msg, {w0: 0, w1: n})), tf = performance.now() - t2;
    let ref = null; if (v1) { const B = g6Buf(a, v, c || 0); ref = B ? B.getChannelData(0) : null; }
    let mx = 0, mxr = 0; const y = W.ys[0], f = F.ys[0];
    for (let i = 0; i < y.length; i++) { const d = Math.abs(y[i] - f[w0 + i]); if (d > mx) mx = d; if (ref) { const e = Math.abs(y[i] - ref[w0 + i]); if (e > mxr) mxr = e; } }
    let mf = 0; if (ref) for (let i = 0; i < n; i++) { const e = Math.abs(f[i] - ref[i]); if (e > mf) mf = e; }
    return {len: y.length, want: w1 - w0, maxWinVsFull: mx, maxWinVsV1: ref ? mxr : null, maxFullVsV1: ref ? mf : null, msWin: Math.round(tw), msFull: Math.round(tf), segs: W.segs};
  },
  // Stimme mit n Kopien: Zeit eines Gangs (alle Kopien) gegen einen Gang mit einer Kopie (G6P-15)
  g6pbCopyTime: async (r, k, cts) => {
    r = r || {t: stimmeT(), s: R.selS}; const x = tkRef(r), a = x.a, v = a.chor.voices[k], b = g2Base(a.take, a), src = g2Src(a.take) || b, sr = b.sampleRate;
    const sp = g6pSpec(a, v), plans = cts.map(ct => g6pPlan(a, v, ct)), base = {op: 'chor', key: a.take + '@' + wpBid(src), sr, w0: sp.w0, w1: sp.w1, sib: 0, x: src.getChannelData(0)};
    if (src !== b) { base.rkey = a.take + '@' + wpBid(b); base.rx = b.getChannelData(0); }
    await g6pCall(Object.assign({}, base, {plans: [plans[0]]}));   // aufwärmen (Analyse/Modell)
    const t1 = performance.now(); await g6pCall(Object.assign({}, base, {plans: [plans[0]]})); const one = performance.now() - t1;
    const t2 = performance.now(); await g6pCall(Object.assign({}, base, {plans})); const all = performance.now() - t2;
    return {one: Math.round(one), all: Math.round(all), ratio: +(all / one).toFixed(2)};
  }
};
/* G6PB-END */
