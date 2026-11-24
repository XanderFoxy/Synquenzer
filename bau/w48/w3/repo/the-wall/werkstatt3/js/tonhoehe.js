// Werkstatt 3 – tonhoehe.js
// Tonhöhe verfolgen (YIN mit Kandidaten-Viterbi, Feinmessung in voller Abtastrate), Noten bilden
// (Melodyne-artige Blobs, Vibrato bleibt in einer Note) und korrigieren (TD-PSOLA: Formanten bleiben,
// keine Zeitänderung). Alles lokal, reines JavaScript, läuft im Hauptfaden und im Worker.
//
// export function verfolgen(x, sr, hop=0.005, opt={}) → {t, f0, sicher, pegel, hop, sr}
//        t/f0/sicher/pegel: Float32Array je Rahmen (t = i·hop). f0 in Hz, 0 = stimmlos. sicher 0–1. pegel dB.
//        opt: fmin (70), fmax (1100), schwelle (0.15), stimmlos (0.35 = Kosten „stimmlos“, höher = mehr stimmhaft)
// export function noten(spur, opt={})  → [{id, t0, t1, midi, cent, f0Mittel, kurve, hop, i0, i1, pegel, sicher}]
//        kurve: Array der Tonhöhe je Rahmen als MIDI-Kommazahl (69 = A4), kurve[j] gilt bei t0 + j·hop.
//        midi = nächste Halbtonstufe der Notenmitte, cent = Abweichung der Mitte davon (−50…+50).
//        opt: minSicher (0.4), luecke (0.04 s), glatt (0.15 s), wechsel (5), minDauer (0.07 s), splitDb (7)
// export function korrigieren(x, sr, noten, ziel={}) → Float32Array (gleiche Länge)
//        ziel: {skala:'chromatisch'|'dur'|'moll'|'C-Dur'|'a-Moll'|…, grundton:0–11|'C'|'Fis'|…, stufen:[0,2,4…],
//               staerke:0–1 (1), uebergang_ms (50 = Nachstimm-Geschwindigkeit), vibratoErhalten (true),
//               drift:0–1 (0.5 = langsames Wegdriften innerhalb der Note mit ausgleichen)}
//        Je Note: note.zielMidi (feste Zielstufe, z. B. nach Ziehen) und note.zielCent (Feinversatz) haben Vorrang.
// export function verschieben(x, sr, note, cent) → Float32Array (nur diese Note um cent verschoben, Rest unverändert)
// export function korrigierteNoten(noten, ziel) → neue Noten so, wie sie nach korrigieren() klingen (für die Anzeige)
// export function noteVerschoben(note, cent)    → neue Note (Kurve/midi/cent) nach verschieben()
// export function skalaStufen(ziel) → Set der erlaubten Tonklassen (0 = C) oder null (chromatisch)
// export function zielStufe(midiKomma, ziel|Set) → nächste erlaubte MIDI-Stufe
// export function abweichung(noten, ziel) → {median, p90, max, n} |Abweichung der Notenmitte zur Stufe| in Cent
// export function hzZuMidi(f), midiZuHz(m), notenName(midi)

const LOG2 = Math.log2;
export const hzZuMidi = (f) => 69 + 12 * LOG2(f / 440);
export const midiZuHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NAMEN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'];
export const notenName = (m) => { const r = Math.round(m); return NAMEN[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };

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

export function verfolgen(x, sr, hop = 0.005, opt = {}) {
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

  for (let k = 0; k < N; k++) {
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
      cCost[base + n] = y1 + (yin > 0 && tau > yin * 1.15 ? 0.12 : 0);
      n++;
    }
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
        const st = Math.min(0.6, 0.025 * Math.abs(12 * LOG2(f / prevF[j])));
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
  return n;
}

// ---------------------------------------------------------------- Skala

const TON = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, h: 11, b: 10 };
function tonklasse(s, englisch) {
  if (typeof s === 'number' && isFinite(s)) return ((Math.round(s) % 12) + 12) % 12;
  const t = String(s ?? '').trim().toLowerCase().replace('♯', '#').replace('♭', 'b');
  const m = t.match(/^([a-h])(is|es|s|#|b)?$/);
  if (!m) return 0;
  let v = TON[m[1]];
  if (m[1] === 'b' && englisch) v = 11;
  if (m[2] === 'is' || m[2] === '#') v += 1;
  else if (m[2] === 'es' || m[2] === 's' || m[2] === 'b') v -= 1;
  return ((v % 12) + 12) % 12;
}

export function skalaStufen(ziel = {}) {
  if (ziel instanceof Set) return ziel;
  if (Array.isArray(ziel.stufen) && ziel.stufen.length) return new Set(ziel.stufen.map((v) => ((Math.round(v) % 12) + 12) % 12));
  let sk = String(ziel.skala ?? 'chromatisch').trim().toLowerCase();
  let gt = ziel.grundton ?? 0, englisch = false;
  const m = sk.match(/^([a-h](?:is|es|s|#|b|♯|♭)?)[\s\-_]*(dur|moll|major|minor)$/);
  if (m) { englisch = m[2] === 'major' || m[2] === 'minor'; gt = m[1]; sk = m[2]; }
  if (!/^(dur|moll|major|minor)/.test(sk)) return null;
  const g = tonklasse(gt, englisch);
  const iv = /^(dur|major)/.test(sk) ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return new Set(iv.map((v) => (v + g) % 12));
}

export function zielStufe(c, ziel) {
  const st = ziel instanceof Set || ziel === null ? ziel : skalaStufen(ziel || {});
  const r = Math.round(c);
  if (!st) return r;
  let best = r, bd = 1e9;
  for (let d = -6; d <= 6; d++) {
    const v = r + d;
    if (!st.has(((v % 12) + 12) % 12)) continue;
    const dd = Math.abs(v - c);
    if (dd < bd - 1e-9) { bd = dd; best = v; }
  }
  return best;
}

export function abweichung(nn, ziel = {}) {
  const st = skalaStufen(ziel);
  const w = nn.map((n) => { const c = n.midi + (n.cent || 0) / 100; return Math.abs(c - zielStufe(c, st)) * 100; });
  return { median: quantil(w, 0.5), p90: quantil(w, 0.9), max: w.length ? Math.max(...w) : NaN, n: w.length };
}

// ---------------------------------------------------------------- Verschiebe-Kurve

// baut je Rahmen f0 (Hz, 0 = keine Note) und Verschiebung (Halbtöne)
function kurven(noten, ziel, N, hop) {
  const f0g = new Float32Array(N), sh = new Float32Array(N), belegt = new Uint8Array(N);
  const st = Math.max(0, Math.min(1, ziel.staerke ?? 1));
  const vib = ziel.vibratoErhalten !== false;
  const drift = vib ? Math.max(0, Math.min(1, ziel.drift ?? 0.5)) : 1;
  const stufen = skalaStufen(ziel);
  const nSl = Math.max(1, Math.round(0.25 / hop) | 1), nT = Math.max(1, Math.round(0.04 / hop));
  for (const note of noten) {
    if (!note || !note.kurve || !note.kurve.length) continue;
    const K = note.kurve.length;
    const c = note.midi + (note.cent || 0) / 100;
    const zm = (note.zielMidi ?? zielStufe(c, stufen)) + (note.zielCent || 0) / 100;
    const stN = note.staerke ?? st;
    const base = (zm - c) * stN;
    const slow = gleitMittel(note.kurve, nSl);
    const i0 = Math.round(note.t0 / hop);
    for (let j = 0; j < K; j++) {
      const i = i0 + j;
      if (i < 0 || i >= N) continue;
      const v = note.kurve[j];
      f0g[i] = midiZuHz(v);
      const tw = Math.max(0, Math.min(1, (j + 0.5) / nT, (K - j - 0.5) / nT));
      sh[i] = base + stN * tw * (drift * (c - slow[j]) + (vib ? 0 : slow[j] - v));
      belegt[i] = 1;
    }
  }
  // Lücken: nächster belegter Wert
  let last = -1;
  const links = new Int32Array(N).fill(-1);
  for (let i = 0; i < N; i++) { if (belegt[i]) last = i; links[i] = last; }
  let next = -1;
  for (let i = N - 1; i >= 0; i--) {
    if (belegt[i]) { next = i; continue; }
    const l = links[i];
    if (l < 0 && next < 0) continue;
    sh[i] = l < 0 ? sh[next] : next < 0 ? sh[l] : (i - l <= next - i ? sh[l] : sh[next]);
  }
  const nU = Math.max(1, Math.round((ziel.uebergang_ms ?? 50) / 1000 / hop) | 1);
  const shg = nU > 1 ? gleitMittel(sh, nU) : sh;
  return { f0g, sh: Float32Array.from(shg) };
}

// ---------------------------------------------------------------- TD-PSOLA

const HANN_N = 2048;
const HANN = (() => { const h = new Float32Array(HANN_N + 2); for (let i = 0; i <= HANN_N + 1; i++) h[i] = 0.5 * (1 + Math.cos(Math.PI * Math.min(1, i / HANN_N))); return h; })();

function psola(x, sr, hop, f0g, sh) {
  const n = x.length, H = hop * sr, NF = f0g.length;
  const y = new Float32Array(n);
  // stimmhafte Bereiche mit Verschiebung
  const bereiche = [];
  for (let i = 0; i < NF;) {
    if (!(f0g[i] > 0)) { i++; continue; }
    let j = i, maxSh = 0;
    while (j < NF && f0g[j] > 0) { if (Math.abs(sh[j]) > maxSh) maxSh = Math.abs(sh[j]); j++; }
    const r0 = Math.max(0, Math.round((i - 0.5) * H)), r1 = Math.min(n, Math.round((j - 0.5) * H));
    if (maxSh > 0.0005 && r1 - r0 > 4 * sr / 1100) bereiche.push([r0, r1, i, j - 1]);
    i = j;
  }
  if (!bereiche.length) { y.set(x); return y; }
  const fAn = (s) => { // f0 bei Abtastwert s (Hz), innerhalb Bereich
    const fi = s / H; let i = Math.floor(fi); const fr = fi - i;
    if (i < 0) i = 0; if (i >= NF - 1) return f0g[NF - 1] || f0g[NF - 2] || 200;
    const a = f0g[i], b = f0g[i + 1];
    if (a > 0 && b > 0) return a + (b - a) * fr;
    return a > 0 ? a : b > 0 ? b : 200;
  };
  const shAn = (s) => {
    const fi = s / H; let i = Math.floor(fi); const fr = fi - i;
    if (i < 0) return sh[0]; if (i >= NF - 1) return sh[NF - 1];
    return sh[i] + (sh[i + 1] - sh[i]) * fr;
  };
  // Analyse-Marken: gleichmäßig (5 ms) außerhalb, periodensynchron innerhalb (an Wellenform eingerastet)
  const U = Math.max(16, Math.round(0.005 * sr));
  const A = [], R = []; // Position, Bereich (−1 = unverändert)
  let u = 0;
  for (let b = 0; b < bereiche.length; b++) {
    const [r0, r1] = bereiche[b];
    const M = marken(x, r0, r1, sr, fAn);
    if (M.length < 2) continue;
    while (u < M[0] - 0.5 * U) { A.push(u); R.push(-1); u += U; }
    for (const v of M) { if (A.length && v <= A[A.length - 1] + 8) continue; A.push(v); R.push(b); }
    u = M[M.length - 1] + U;
  }
  while (u < n) { A.push(u); R.push(-1); u += U; }
  A.push(n - 1 + U); R.push(-1);
  const K = A.length;
  const out = new Float32Array(n), ws = new Float32Array(n);
  const korn = (k, dst) => {
    const src = A[k];
    const Lh = k > 0 ? A[k] - A[k - 1] : (A[1] - A[0]);
    const Rh = k < K - 1 ? A[k + 1] - A[k] : Lh;
    const sL = HANN_N / Lh, sR = HANN_N / Rh;
    const i0 = Math.max(-Lh, -dst, -src), i1 = Math.min(Rh, n - 1 - dst, n - 1 - src);
    for (let i = i0; i <= i1; i++) {
      const w = i < 0 ? HANN[Math.round(-i * sL)] : HANN[Math.round(i * sR)];
      out[dst + i] += w * x[src + i];
      ws[dst + i] += w;
    }
  };
  for (let k = 0; k < K;) {
    if (R[k] < 0) { korn(k, A[k]); k++; continue; }
    const b = R[k]; let k1 = k; while (k1 + 1 < K && R[k1 + 1] === b) k1++;
    // Synthese: Abstand = örtliche Periode / Verhältnis, Korn = nächstliegende Analyse-Marke
    let s = A[k], q = k;
    const ende = A[k1];
    while (s <= ende + 0.25 * (A[k1] - A[Math.max(k, k1 - 1)])) {
      while (q < k1 && Math.abs(A[q + 1] - s) < Math.abs(A[q] - s)) q++;
      const per = q > k && q < k1 ? 0.5 * (A[q + 1] - A[q - 1]) : q < k1 ? A[q + 1] - A[q] : A[q] - A[q - 1];
      const beta = Math.pow(2, shAn(s) / 12);
      korn(q, Math.round(s));
      s += per / beta;
    }
    k = k1 + 1;
  }
  // Fenstersumme geglättet (≈ 10 ms) ausgleichen; unveränderte Stellen haben Summe 1 → unverändert
  const B = Math.max(3, Math.round(0.01 * sr) | 1), h = B >> 1;
  const P = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) P[i + 1] = P[i] + ws[i];
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - h), hi = Math.min(n - 1, i + h);
    const g = (P[hi + 1] - P[lo]) / (hi - lo + 1);
    y[i] = out[i] / Math.max(0.2, g);
  }
  return y;
}

function marken(x, r0, r1, sr, fAn) {
  const n = x.length, M = [];
  let P = sr / fAn(r0);
  let a = r0, best = -1e9;
  for (let s = r0; s < Math.min(r1, r0 + Math.ceil(P)); s++) if (x[s] > best) { best = x[s]; a = s; }
  M.push(a);
  for (let it = 0; it < 1e7; it++) {
    P = sr / fAn(a);
    const pred = Math.round(a + P);
    if (pred >= r1) break;
    const Rr = Math.max(1, Math.round(0.06 * P)), h = Math.max(4, Math.round(0.5 * P));
    let bd = 0;
    if (a - h >= 0 && pred + Rr + h < n && pred - Rr - h >= 0) {
      let bv = -1e30;
      for (let dd = -Rr; dd <= Rr; dd++) {
        const c = pred + dd;
        let dot = 0, e = 0;
        for (let j = -h; j <= h; j++) { const v = x[c + j]; dot += x[a + j] * v; e += v * v; }
        const val = dot / Math.sqrt(e + 1e-20);
        if (val > bv) { bv = val; bd = dd; }
      }
    }
    a = pred + bd;
    M.push(a);
  }
  return M;
}

// ---------------------------------------------------------------- korrigieren / verschieben

export function korrigieren(x, sr, nn, ziel = {}) {
  if (!nn || !nn.length) return new Float32Array(x);
  const hop = nn[0].hop ?? 0.005;
  const N = Math.ceil(x.length / sr / hop) + 2;
  const { f0g, sh } = kurven(nn, ziel, N, hop);
  return psola(x, sr, hop, f0g, sh);
}

export function verschieben(x, sr, note, cent) {
  const y = new Float32Array(x);
  if (!note || !note.kurve || !note.kurve.length || !cent) return y;
  const hop = note.hop ?? 0.005;
  const rand = Math.round(0.12 / hop);
  const n0 = Math.round(note.t0 / hop), K = note.kurve.length;
  const ia = Math.max(0, n0 - rand), ib = n0 + K + rand;
  const a = Math.round(ia * hop * sr), b = Math.min(x.length, Math.round(ib * hop * sr));
  if (b - a < 16) return y;
  const NF = ib - ia + 2;
  const f0g = new Float32Array(NF), sh = new Float32Array(NF);
  const nR = Math.max(1, Math.min(Math.round(0.02 / hop), Math.floor(K / 5)));
  for (let j = 0; j < K; j++) {
    const i = n0 + j - ia;
    if (i < 0 || i >= NF) continue;
    f0g[i] = midiZuHz(note.kurve[j]);
    sh[i] = cent / 100 * Math.min(1, (j + 1) / nR, (K - j) / nR);
  }
  const ys = psola(x.subarray(a, b), sr, hop, f0g, sh);
  y.set(ys, a);
  return y;
}

// ---------------------------------------------------------------- Anzeige-Hilfen

export function korrigierteNoten(nn, ziel = {}) {
  if (!nn || !nn.length) return [];
  const hop = nn[0].hop ?? 0.005;
  let maxI = 0; for (const n of nn) maxI = Math.max(maxI, Math.round(n.t0 / hop) + n.kurve.length);
  const { sh } = kurven(nn, ziel, maxI + 2, hop);
  return nn.map((n) => {
    const i0 = Math.round(n.t0 / hop);
    const kurve = n.kurve.map((v, j) => Math.round((v + (sh[i0 + j] || 0)) * 1000) / 1000);
    const neu = baueNote({ ...n, kurve });
    delete neu.zielMidi; delete neu.zielCent;
    return neu;
  });
}

export function noteVerschoben(note, cent) {
  const K = note.kurve.length, hop = note.hop ?? 0.005;
  const nR = Math.max(1, Math.min(Math.round(0.02 / hop), Math.floor(K / 5)));
  const kurve = note.kurve.map((v, j) => Math.round((v + cent / 100 * Math.min(1, (j + 1) / nR, (K - j) / nR)) * 1000) / 1000);
  return baueNote({ ...note, kurve });
}
export const _intern = { psola: (...a) => psola(...a), kurven: (...a) => kurven(...a), marken: (...a) => marken(...a) };
