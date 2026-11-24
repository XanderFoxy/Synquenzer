// ---------------------------------------------------------------- Hilfen

// Butterworth-Tiefpass 8. Ordnung (4 Biquads, DF2T) und gleich dezimieren (jedes D-te Ergebnis)
function dezimieren(x, sr, D, fc) {
  const qs = [0.5098, 0.6013, 0.9000, 2.5629];
  const w0 = 2 * Math.PI * fc / sr, c = Math.cos(w0), s = Math.sin(w0);
  const B0 = [], B1 = [], A1 = [], A2 = [];
  for (const q of qs) {
    const al = s / (2 * q), a0 = 1 + al;
    B0.push((1 - c) / 2 / a0); B1.push((1 - c) / a0); A1.push(-2 * c / a0); A2.push((1 - al) / a0);
  }
  const n = Math.floor(x.length / D), out = new Float32Array(n);
  let z10 = 0, z20 = 0, z11 = 0, z21 = 0, z12 = 0, z22 = 0, z13 = 0, z23 = 0;
  const b00 = B0[0], b10 = B1[0], a10 = A1[0], a20 = A2[0];
  const b01 = B0[1], b11 = B1[1], a11 = A1[1], a21 = A2[1];
  const b02 = B0[2], b12 = B1[2], a12 = A1[2], a22 = A2[2];
  const b03 = B0[3], b13 = B1[3], a13 = A1[3], a23 = A2[3];
  for (let i = 0, o = 0, k = 0; i < x.length; i++) {
    let v = x[i], y;
    y = b00 * v + z10; z10 = b10 * v - a10 * y + z20; z20 = b00 * v - a20 * y; v = y;
    y = b01 * v + z11; z11 = b11 * v - a11 * y + z21; z21 = b01 * v - a21 * y; v = y;
    y = b02 * v + z12; z12 = b12 * v - a12 * y + z22; z22 = b02 * v - a22 * y; v = y;
    y = b03 * v + z13; z13 = b13 * v - a13 * y + z23; z23 = b03 * v - a23 * y; v = y;
    if (k === 0 && o < n) out[o++] = v;
    if (++k === D) k = 0;
  }
  return out;
}

// gleitender Mittelwert (zentriert, Fenster n Rahmen, an den Rändern verkürzt)
function gleitMittel(a, n) {
  const N = a.length, out = new Float64Array(N);
  if (N === 0) return out;
  const h = Math.max(0, Math.floor(n / 2));
  const P = new Float64Array(N + 1);
  for (let i = 0; i < N; i++) P[i + 1] = P[i] + a[i];
  for (let i = 0; i < N; i++) {
    const lo = Math.max(0, i - h), hi = Math.min(N - 1, i + h);
    out[i] = (P[hi + 1] - P[lo]) / (hi - lo + 1);
  }
  return out;
}

function quantil(arr, q) {
  if (!arr.length) return NaN;
  const s = Float64Array.from(arr).sort();
  const p = Math.min(s.length - 1, Math.max(0, q * (s.length - 1)));
  const i = Math.floor(p), f = p - i;
  return i + 1 < s.length ? s[i] * (1 - f) + s[i + 1] * f : s[i];
}

// ---------------------------------------------------------------- verfolgen

function verfolgen(x, sr, hop = 0.005, opt = {}) {
  hop = hop > 0 ? hop : 0.005;
  const fmin = opt.fmin ?? 70, fmax = opt.fmax ?? 1100, thr = opt.schwelle ?? 0.15;
  const D = Math.max(1, Math.floor(sr / 8000));
  const srd = sr / D;
  const xd = D > 1 ? dezimieren(x, sr, D, Math.min(2500, 0.42 * srd)) : x;
  const W = Math.round(0.03 * srd);
  const tauMin = Math.max(2, Math.floor(srd / fmax));
  const tauMax = Math.min(Math.ceil(srd / fmin), W);
  const L = tauMax + 2;
  const pad = W + L + 4;
  const xp = new Float32Array(xd.length + 2 * pad); xp.set(xd, pad);
  const N = Math.max(1, Math.floor(x.length / sr / hop) + 1);
  const off = (W >> 1) + Math.round(0.0025 * srd);
  const MAXC = 5, S = MAXC + 1;
  const cTau = new Float32Array(N * MAXC), cCost = new Float32Array(N * MAXC), cN = new Uint8Array(N);
  const eDb = new Float32Array(N);
  const d = new Float64Array(L), dn = new Float64Array(L);
  const tmpV = new Float64Array(64), tmpT = new Int32Array(64);
  let pPrev = -1e9, eAcc = 0;

  const melde = typeof opt.fortschritt === 'function' ? opt.fortschritt : null;
  for (let k = 0; k < N; k++) {
    if (melde && (k & 4095) === 0) melde(Math.round(k / N * 90));
    let p = Math.round(k * hop * srd) - off + pad;
    if (p < 0) p = 0;
    if (p + W + L >= xp.length) p = xp.length - W - L - 1;
    if (p - pPrev >= W || p < pPrev || k % 500 === 0) {
      for (let tau = 1; tau < L; tau++) {
        let s = 0;
        for (let j = p; j < p + W; j++) { const a = xp[j] - xp[j + tau]; s += a * a; }
        d[tau] = s;
      }
      eAcc = 0; for (let j = p; j < p + W; j++) eAcc += xp[j] * xp[j];
    } else if (p > pPrev) {
      for (let tau = 1; tau < L; tau++) {
        let s = d[tau];
        for (let j = pPrev; j < p; j++) { const a = xp[j] - xp[j + tau]; s -= a * a; }
        for (let j = pPrev + W; j < p + W; j++) { const a = xp[j] - xp[j + tau]; s += a * a; }
        d[tau] = s > 0 ? s : 0;
      }
      for (let j = pPrev; j < p; j++) eAcc -= xp[j] * xp[j];
      for (let j = pPrev + W; j < p + W; j++) eAcc += xp[j] * xp[j];
      if (eAcc < 0) eAcc = 0;
    }
    pPrev = p;
    eDb[k] = 10 * Math.log10(eAcc / W + 1e-14);
    if (eAcc / W < 1e-11) { cN[k] = 0; continue; }
    // kumulativ-normierte Differenz (CMNDF)
    dn[0] = 1; let cum = 0;
    for (let tau = 1; tau < L; tau++) { cum += d[tau]; dn[tau] = cum > 0 ? d[tau] * tau / cum : 1; }
    // YIN-Wahl: erstes Tal unter der Schwelle
    let yin = -1;
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (dn[tau] < thr) { while (tau + 1 <= tauMax && dn[tau + 1] < dn[tau]) tau++; yin = tau; break; }
    }
    // alle Täler als Kandidaten
    let m = 0;
    for (let tau = Math.max(tauMin, 1); tau <= tauMax && m < 64; tau++) {
      const v = dn[tau];
      if (v < 0.8 && v <= dn[tau - 1] && v <= dn[tau + 1]) { tmpV[m] = v; tmpT[m] = tau; m++; }
    }
    // die besten MAXC behalten (einfaches Auswahlverfahren)
    let n = 0;
    const base = k * MAXC;
    const used = new Uint8Array(m);
    while (n < MAXC && n < m) {
      let bi = -1, bv = 1e9;
      for (let i = 0; i < m; i++) if (!used[i] && tmpV[i] < bv) { bv = tmpV[i]; bi = i; }
      if (bi < 0) break;
      used[bi] = 1;
      const tau = tmpT[bi];
      const y0 = dn[tau - 1], y1 = dn[tau], y2 = dn[tau + 1], den = y0 - 2 * y1 + y2;
      const dt = den > 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (y0 - y2) / den)) : 0;
      cTau[base + n] = tau + dt;
      cCost[base + n] = y1;
      n++;
    }
    // Unteroktaven leicht benachteiligen (je Oktave über dem kleinsten guten Tal +0.06); den Rest entscheidet die Stetigkeit
    let tFirst = 0;
    for (let i = 0; i < n; i++) if (dn[Math.round(cTau[base + i])] < 0.3 && (!tFirst || cTau[base + i] < tFirst)) tFirst = cTau[base + i];
    if (yin > 0 && (!tFirst || yin < tFirst)) tFirst = yin;
    if (tFirst) for (let i = 0; i < n; i++) if (cTau[base + i] > tFirst * 1.1) cCost[base + i] += 0.06 * LOG2(cTau[base + i] / tFirst);
    if (yin > 0) { // YIN-Wahl sicher dabei
      let drin = false;
      for (let i = 0; i < n; i++) if (Math.abs(cTau[base + i] - yin) < 1) drin = true;
      if (!drin) { const i = n < MAXC ? n++ : MAXC - 1; cTau[base + i] = yin; cCost[base + i] = dn[yin]; }
    }
    cN[k] = n;
  }

  // Pegel-Boden: 45 dB unter dem lauten Teil, mindestens −72 dBFS
  let laut = -200;
  { const st = []; for (let k = 0; k < N; k += 4) st.push(eDb[k]); laut = quantil(st, 0.95); }
  const boden = Math.max(laut - 45, -72);
  const ucost = opt.stimmlos ?? 0.35;

  // Viterbi über Kandidaten + „stimmlos“ (Zustand MAXC)
  const back = new Int8Array(N * S);
  let prev = new Float64Array(S).fill(1e9), cur = new Float64Array(S);
  prev[MAXC] = 0;
  let prevF = new Float64Array(MAXC), curF = new Float64Array(MAXC), prevN = 0;
  for (let k = 0; k < N; k++) {
    const n = cN[k], base = k * MAXC;
    let leise = 0;
    if (eDb[k] < boden) leise = 2; else if (eDb[k] < boden + 10) leise = 0.15 * (boden + 10 - eDb[k]) / 10;
    // stimmlos
    let bv = prev[MAXC], bi = MAXC;
    for (let j = 0; j < prevN; j++) if (prev[j] + 0.25 < bv) { bv = prev[j] + 0.25; bi = j; }
    cur[MAXC] = bv + ucost * (leise > 1 ? 0 : 1); back[k * S + MAXC] = bi;
    for (let i = 0; i < n; i++) {
      const f = srd / cTau[base + i]; curF[i] = f;
      const obs = cCost[base + i] + leise;
      let bv2 = prev[MAXC] + 0.25, bi2 = MAXC;
      for (let j = 0; j < prevN; j++) {
        const st = Math.min(0.8, 0.035 * Math.abs(12 * LOG2(f / prevF[j])));
        const v = prev[j] + st;
        if (v < bv2) { bv2 = v; bi2 = j; }
      }
      cur[i] = bv2 + obs; back[k * S + i] = bi2;
    }
    for (let i = n; i < MAXC; i++) cur[i] = 1e9;
    // Normieren gegen Überlauf
    let mn = 1e18; for (let i = 0; i < S; i++) if (cur[i] < mn) mn = cur[i];
    for (let i = 0; i < S; i++) cur[i] -= mn;
    let t = prev; prev = cur; cur = t;
    t = prevF; prevF = curF; curF = t;
    prevN = n;
  }
  const pfad = new Int8Array(N);
  { let bi = MAXC, bv = 1e18; for (let i = 0; i < S; i++) if (prev[i] < bv) { bv = prev[i]; bi = i; } pfad[N - 1] = bi; }
  for (let k = N - 1; k > 0; k--) pfad[k - 1] = back[k * S + pfad[k]];

  // Feinmessung in voller Abtastrate
  const tA = new Float32Array(N), f0 = new Float32Array(N), sicher = new Float32Array(N), pegel = new Float32Array(N);
  const dv = new Float64Array(2 * D + 8);
  for (let k = 0; k < N; k++) {
    tA[k] = k * hop; pegel[k] = eDb[k];
    const st = pfad[k];
    if (st >= MAXC || st >= cN[k]) continue;
    const td = cTau[k * MAXC + st];
    let fHz = srd / td;
    if (D > 1) {
      const tf = td * D, lo = Math.max(2, Math.floor(tf - D - 1)), hi = Math.ceil(tf + D + 1);
      const Wf = Math.max(Math.ceil(2 * tf), Math.round(0.016 * sr));
      const c = Math.round(k * hop * sr), s0 = c - ((Wf + hi) >> 1);
      if (s0 >= 0 && s0 + Wf + hi < x.length && hi - lo + 1 <= dv.length) {
        for (let tau = lo; tau <= hi; tau++) {
          let s = 0;
          for (let j = s0, e = s0 + Wf; j < e; j++) { const a = x[j] - x[j + tau]; s += a * a; }
          dv[tau - lo] = s;
        }
        let bi = -1, bv = 1e300;
        for (let i = 1; i < hi - lo; i++) if (dv[i] < bv && dv[i] <= dv[i - 1] && dv[i] <= dv[i + 1]) { bv = dv[i]; bi = i; }
        if (bi > 0) {
          const y0 = dv[bi - 1], y1 = dv[bi], y2 = dv[bi + 1], den = y0 - 2 * y1 + y2;
          const dt = den > 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (y0 - y2) / den)) : 0;
          const tauF = lo + bi + dt;
          if (Math.abs(tauF - tf) <= D + 1) fHz = sr / tauF;
        }
      }
    }
    f0[k] = fHz;
    const c0 = cCost[k * MAXC + st];
    sicher[k] = Math.max(0.05, Math.min(1, 1 - c0));
  }
  // Ausreißer (Oktavfehler, Knarren, Hauch): weit weg vom örtlichen Median (±40 ms) → stimmlos
  const wM = Math.max(2, Math.round(0.04 / hop)), mi = new Float64Array(N), buf = new Float64Array(2 * wM + 1);
  for (let k = 0; k < N; k++) mi[k] = f0[k] > 0 ? hzZuMidi(f0[k]) : NaN;
  const weg = [];
  for (let k = 0; k < N; k++) {
    if (!(f0[k] > 0)) continue;
    let c = 0;
    for (let q = Math.max(0, k - wM); q <= Math.min(N - 1, k + wM); q++) if (mi[q] === mi[q]) buf[c++] = mi[q];
    if (c < 3) continue;
    const s = buf.subarray(0, c).sort();
    const med = c & 1 ? s[c >> 1] : 0.5 * (s[(c >> 1) - 1] + s[c >> 1]);
    if (Math.abs(mi[k] - med) > 4) weg.push(k);
  }
  for (const k of weg) { f0[k] = 0; sicher[k] = 0; }
  if (melde) melde(100);
  return { t: tA, f0, sicher, pegel, hop, sr };
}

// ---------------------------------------------------------------- noten

export function noten(spur, opt = {}) {
  const f0 = spur.f0, sich = spur.sicher, N = f0.length;
  const hop = spur.hop ?? (spur.t && spur.t.length > 1 ? spur.t[1] - spur.t[0] : 0.005);
  const minS = opt.minSicher ?? 0.4, luecke = opt.luecke ?? 0.04, glatt = opt.glatt ?? 0.15;
  const wechsel = opt.wechsel ?? 5, minDauer = opt.minDauer ?? 0.07, splitDb = opt.splitDb ?? 7;
  const minF = Math.max(2, Math.round(minDauer / hop));
  const m = new Float64Array(N).fill(NaN);
  for (let i = 0; i < N; i++) if (f0[i] > 0 && (!sich || sich[i] >= minS)) m[i] = hzZuMidi(f0[i]);
  const gapF = Math.round(luecke / hop);
  const pg = spur.pegel ? gleitMittel(spur.pegel, 3) : null;

  // stimmhafte Läufe (kurze Lücken überbrückt)
  const laeufe = [];
  for (let i = 0; i < N;) {
    if (isNaN(m[i])) { i++; continue; }
    let last = i, j = i + 1;
    while (j < N) {
      if (!isNaN(m[j])) { last = j; j++; continue; }
      let g = j; while (g < N && isNaN(m[g])) g++;
      if (g < N && g - last - 1 <= gapF && Math.abs(m[g] - m[last]) < 4) j = g; else break;
    }
    laeufe.push([i, last]); i = last + 1;
  }

  const segs = []; // [a, b, hart]
  const nGl = Math.max(1, Math.round(glatt / hop) | 1);
  for (const [a, b] of laeufe) {
    const len = b - a + 1;
    if (len < minF) continue;
    const mm = new Float64Array(len);
    for (let i = 0; i < len; i++) mm[i] = m[a + i];
    // Lücken linear füllen
    for (let i = 0; i < len; i++) if (isNaN(mm[i])) {
      let r = i; while (r < len && isNaN(mm[r])) r++;
      const l = i - 1, vl = mm[l], vr = r < len ? mm[r] : vl;
      for (let q = i; q < r; q++) mm[q] = vl + (vr - vl) * (q - l) / (r - l);
      i = r;
    }
    const ms = gleitMittel(mm, nGl);
    let lo = 1e9, hi = -1e9;
    for (let i = 0; i < len; i++) { if (ms[i] < lo) lo = ms[i]; if (ms[i] > hi) hi = ms[i]; }
    lo = Math.floor(lo) - 1; hi = Math.ceil(hi) + 1;
    const S = hi - lo + 1;
    // Viterbi über Halbtonstufen: Beobachtung |geglättet − Stufe|, Wechsel kostet „wechsel“
    const back = new Int16Array(len * S);
    let prev = new Float64Array(S), cur = new Float64Array(S);
    for (let s = 0; s < S; s++) prev[s] = Math.abs(ms[0] - (lo + s));
    for (let i = 1; i < len; i++) {
      let bm = 1e18, bs = 0;
      for (let s = 0; s < S; s++) if (prev[s] < bm) { bm = prev[s]; bs = s; }
      for (let s = 0; s < S; s++) {
        const stay = prev[s], sw = bm + wechsel;
        if (stay <= sw) { cur[s] = stay; back[i * S + s] = s; } else { cur[s] = sw; back[i * S + s] = bs; }
        cur[s] += Math.abs(ms[i] - (lo + s));
      }
      const t = prev; prev = cur; cur = t;
    }
    const zust = new Int16Array(len);
    { let bm = 1e18, bs = 0; for (let s = 0; s < S; s++) if (prev[s] < bm) { bm = prev[s]; bs = s; } zust[len - 1] = bs; }
    for (let i = len - 1; i > 0; i--) zust[i - 1] = back[i * S + zust[i]];
    // Grenzen, an den Rohwerten nachgeschärft
    const grenzen = [0];
    for (let i = 1; i < len; i++) if (zust[i] !== zust[i - 1]) {
      const sA = lo + zust[i - 1], sB = lo + zust[i], mid = (sA + sB) / 2, up = sB > sA;
      const w = nGl >> 1;
      let best = i, bd = 1e9;
      for (let q = Math.max(grenzen[grenzen.length - 1] + 1, i - w); q <= Math.min(len - 1, i + w); q++) {
        const c1 = up ? (mm[q - 1] < mid && mm[q] >= mid) : (mm[q - 1] > mid && mm[q] <= mid);
        if (c1 && Math.abs(q - i) < bd) { bd = Math.abs(q - i); best = q; }
      }
      grenzen.push(best);
    }
    grenzen.push(len);
    let teile = [];
    for (let g = 0; g + 1 < grenzen.length; g++) if (grenzen[g + 1] > grenzen[g]) teile.push([grenzen[g], grenzen[g + 1] - 1]);
    const mitte = (s, e) => {
      const n = e - s + 1, cut = n >= 6 ? Math.floor(n * 0.15) : 0;
      let sum = 0, c = 0;
      for (let q = s + cut; q <= e - cut; q++) { sum += mm[q]; c++; }
      return c ? sum / c : mm[s];
    };
    // kurze Stücke an den Nachbarn mit der näheren Tonhöhe hängen, gleich hohe Nachbarn verbinden
    let geaendert = true;
    while (geaendert && teile.length > 1) {
      geaendert = false;
      let ki = -1, kl = 1e9;
      for (let q = 0; q < teile.length; q++) { const l = teile[q][1] - teile[q][0] + 1; if (l < minF && l < kl) { kl = l; ki = q; } }
      if (ki >= 0) {
        const c = mitte(teile[ki][0], teile[ki][1]);
        const L = ki > 0 ? Math.abs(mitte(teile[ki - 1][0], teile[ki - 1][1]) - c) : 1e9;
        const R = ki < teile.length - 1 ? Math.abs(mitte(teile[ki + 1][0], teile[ki + 1][1]) - c) : 1e9;
        if (Math.min(L, R) > 2.5) { teile.splice(ki, 1); geaendert = true; continue; } // Ausreißer: weglassen
        if (L <= R) { teile[ki - 1][1] = teile[ki][1]; } else { teile[ki + 1][0] = teile[ki][0]; }
        teile.splice(ki, 1); geaendert = true; continue;
      }
      for (let q = 0; q + 1 < teile.length; q++) {
        if (Math.abs(mitte(teile[q][0], teile[q][1]) - mitte(teile[q + 1][0], teile[q + 1][1])) < 0.45) {
          teile[q][1] = teile[q + 1][1]; teile.splice(q + 1, 1); geaendert = true; break;
        }
      }
    }
    // gleiche Tonhöhe, neue Silbe: an tiefen Pegel-Tälern teilen
    if (pg) {
      const neu = [];
      const minT = Math.round(0.1 / hop), um = Math.round(0.15 / hop);
      const teilen = (s, e) => {
        if (e - s + 1 < 2 * minT) { neu.push([s, e]); return; }
        let bq = -1, bt = 0;
        for (let q = s + minT; q <= e - minT; q++) {
          const v = pg[a + q];
          if (v > pg[a + q - 1] || v > pg[a + q + 1]) continue;
          let ml = -1e9, mr = -1e9;
          for (let r = Math.max(s, q - um); r < q; r++) if (pg[a + r] > ml) ml = pg[a + r];
          for (let r = q + 1; r <= Math.min(e, q + um); r++) if (pg[a + r] > mr) mr = pg[a + r];
          const tief = Math.min(ml, mr) - v;
          if (tief >= splitDb && tief > bt) { bt = tief; bq = q; }
        }
        if (bq < 0) { neu.push([s, e]); return; }
        teilen(s, bq - 1); teilen(bq, e);
      };
      for (const [s, e] of teile) teilen(s, e);
      teile = neu;
    }
    for (const [s, e] of teile) if (e - s + 1 >= minF) segs.push({ a: a + s, b: a + e, mm: mm.subarray(s, e + 1), c: mitte(s, e) });
  }

  return segs.map((g, k) => {
    const kurve = Array.from(g.mm, (v) => Math.round(v * 1000) / 1000);
    let pgm = 0, sm = 0;
    for (let i = g.a; i <= g.b; i++) { pgm += spur.pegel ? spur.pegel[i] : 0; sm += sich ? sich[i] : 1; }
    const n = g.b - g.a + 1;
    return baueNote({ id: k, t0: g.a * hop, t1: (g.b + 1) * hop, kurve, hop, i0: g.a, i1: g.b,
      pegel: Math.round(pgm / n * 10) / 10, sicher: Math.round(sm / n * 100) / 100 }, g.c);
  });
}

function notenMitte(kurve) {
  const n = kurve.length, cut = n >= 6 ? Math.floor(n * 0.15) : 0;
  let s = 0, c = 0;
  for (let q = cut; q < n - cut; q++) { s += kurve[q]; c++; }
  return c ? s / c : kurve[0];
}

function baueNote(n, mitte) {
  const c = mitte ?? notenMitte(n.kurve);
  const midi = Math.round(c);
  n.midi = midi;
  n.cent = Math.round((c - midi) * 1000) / 10;
  n.f0Mittel = Math.round(midiZuHz(c) * 100) / 100;
  // Streuung (Cent, Standardabweichung im Inneren): groß = Gleiten/Unsicher → Auto-Korrektur lässt die Note in Ruhe
  const K = n.kurve.length, cut = K >= 6 ? Math.floor(K * 0.15) : 0;
  let s2 = 0, cc = 0;
  for (let q = cut; q < K - cut; q++) { s2 += (n.kurve[q] - c) ** 2; cc++; }
  n.streuung = Math.round(Math.sqrt(s2 / Math.max(1, cc)) * 100);
  return n;
}
