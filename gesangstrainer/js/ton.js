// Gesangstrainer – ton.js
// Tonhöhe messen (YIN mit Kandidaten-Viterbi), Stimmlage schätzen, Melodie aus Audio, Mikrofon in Echtzeit,
// singende Vokal-Stimme (Formant-Synthese), Klavier-Ton und deutsche Notennamen.
// Alles lokal im Gerät, nichts wird gesendet. Reines ES-Modul, läuft im Hauptfaden, im Worker und in Node
// (Web-Audio-Teile nur im Browser).
//
// export function tonhoehe(x, sr, opt={})       → {t:[], hz:[], sicher:[], pegel:[], hop, sr}
//        x Float32Array (mono), sr Abtastrate. hz 0 = stimmlos, sicher 0–1, pegel dBFS. Standard-Raster 10 ms.
//        opt: hop (0.01), fmin (65), fmax (1100), fortschritt(prozent)
// export function stimmlage(spur, opt={})       → {tief, hoch, kern:[lo,hi], typ, sicherheit, text, …}
//        spur: Ergebnis von tonhoehe() ODER eine Liste von mikrofon-Meldungen [{hz, sicher, pegel}, …] (≈30 Hz).
//        tief/hoch/kern als MIDI-Zahlen (60 = C4). typ: 'Bass'|'Bariton'|'Tenor'|'Alt'|'Mezzosopran'|'Sopran'
//        (immer nur eine Schätzung). opt: geschlecht 'm'|'w' (schränkt typ ein), tonart (für Notennamen).
//        Zusätzlich: tiefName, hochName, kernName:[..], sekunden (sicher gesungene Zeit), anzahl (Töne), typen (Nachbarn).
// export function melodieAusAudio(x, sr, silbenZeiten?) → [{t, dauer, midi, cent}]
//        ohne silbenZeiten: erkannte Töne; mit silbenZeiten ([{t, dauer}] oder [{start, ende}] oder [t…]):
//        je Silbe der Mittelwert der sicheren Tonhöhe (midi null, wenn dort nichts Sicheres klingt).
// export function mikrofon({onTon, onFehler, ctx, fmin, fmax, minPegel}) → Promise<stop()>
//        getUserMedia (ohne Echo-/Rauschunterdrückung), Echtzeit-YIN ≈ 30 Mal pro Sekunde.
//        onTon({hz, midi, midiGenau, cent, sicher, pegel, name, zeit}) – stimmlos: hz 0, midi null.
//        stop() beendet Mikrofon und Messung; stop.ctx / stop.stream für die App.
// export function vokalStimme(ctx, opt={})      → {singe(vokal, midi, start, dauer, gleit), stopp(), ausgang}
//        vokal 'a e i o u ä ö ü' (ö auch für Schwa) oder Diphthong 'ai'/'ei'/'au'/'ou'/'eu'; gleit = Nachlaut-Vokal.
//        opt: stimme 'm' (Standard) | 'w', vibrato (Cent, 25), lautstaerke (0.8), ziel (AudioNode)
// export function klavier(ctx, opt={})          → {spiele(midi, start, dauer, staerke), stopp(), ausgang}
// export function midiName(n, tonart?)          → 'Es4', 'Fis3', 'H2' … (b-Tonarten: Des/Es/Ges/As/B, Kreuz: Cis/Dis/Fis/Gis/Ais)
// export function hzZuMidi(f), midiZuHz(m), noten(spur, opt) (Tonfolge wie Werkstatt 3), einzelTon(puffer, sr, opt)
// export async function ladeAudio(file)         → {x, sr, name, kanaele, bits, format, dauer} (WAV/AIFF selbst, sonst decodeAudioData)
// export function wavLesen(buffer)              → {kanaele, sr, bits, format} | null
// export function imHintergrund(auftrag, x, sr, opt) → Promise (auftrag 'tonhoehe'|'stimmlage'|'melodie') – im Worker
//        (ton-worker.js), bei Problemen im Hauptfaden.

const G = globalThis;
const LOG2 = Math.log2;
export const hzZuMidi = (f) => 69 + 12 * LOG2(f / 440);
export const midiZuHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------- Notennamen (deutsch)

const N_MISCH = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
const N_B = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];
const N_KREUZ = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'];
const B_DUR = ['f', 'b', 'es', 'as', 'des', 'ges', 'ces'], B_MOLL = ['d', 'g', 'c', 'f', 'b', 'es', 'as'];
const K_DUR = ['g', 'd', 'a', 'e', 'h', 'fis', 'cis'], K_MOLL = ['e', 'h', 'fis', 'cis', 'gis', 'dis', 'ais'];

function vorzeichen(tonart) {
  if (!tonart) return 0;
  const t = String(tonart).trim().replace('♭', 'es').replace('♯', 'is');
  const m = t.match(/^([A-Ha-h](?:is|es|s)?)[\s\-_]*(dur|moll|major|minor|m)?$/i);
  if (!m) return 0;
  const g = m[1].toLowerCase();
  const moll = m[2] ? /^(moll|minor|m)$/i.test(m[2]) : m[1][0] === m[1][0].toLowerCase();
  if ((moll ? B_MOLL : B_DUR).includes(g)) return -1;
  if ((moll ? K_MOLL : K_DUR).includes(g)) return 1;
  return 0;
}

export function midiName(n, tonart) {
  if (n == null || !isFinite(n)) return '';
  const r = Math.round(n), v = vorzeichen(tonart);
  const namen = v < 0 ? N_B : v > 0 ? N_KREUZ : N_MISCH;
  return namen[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1);
}
export const notenName = midiName;

// ---------------------------------------------------------------- Tonhöhen-Verfolgung (aus Werkstatt 3, getestet)

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

// ---------------------------------------------------------------- tonhoehe / melodieAusAudio

export function tonhoehe(x, sr, opt = {}) {
  if (!x || !x.length || !(sr > 0)) return { t: [], hz: [], sicher: [], pegel: [], hop: opt.hop ?? 0.01, sr };
  const hop = opt.hop ?? 0.01;
  const s = verfolgen(x, sr, hop, { fmin: opt.fmin ?? 65, fmax: opt.fmax ?? 1100, schwelle: opt.schwelle, stimmlos: opt.stimmlos, fortschritt: opt.fortschritt });
  return { t: Array.from(s.t), hz: Array.from(s.f0), sicher: Array.from(s.sicher), pegel: Array.from(s.pegel), hop, sr };
}

// Spur vereinheitlichen: tonhoehe()-Ergebnis oder Liste von Mikrofon-Meldungen
function alsSpur(spur) {
  if (Array.isArray(spur)) {
    const hz = [], sicher = [], pegel = [], t = [];
    let hop = 1 / 30;
    if (spur.length > 2 && spur[0].zeit != null && spur[spur.length - 1].zeit != null) {
      const d = (spur[spur.length - 1].zeit - spur[0].zeit) / (spur.length - 1);
      if (d > 0.005 && d < 0.2) hop = d;
    }
    spur.forEach((e, i) => { hz.push(e && e.hz > 0 ? e.hz : 0); sicher.push(e ? e.sicher || 0 : 0); pegel.push(e && isFinite(e.pegel) ? e.pegel : -100); t.push(i * hop); });
    return { t, hz, f0: hz, sicher, pegel, hop };
  }
  const hz = spur.hz || spur.f0 || [];
  return { ...spur, hz, f0: hz, hop: spur.hop ?? (spur.t && spur.t.length > 1 ? spur.t[1] - spur.t[0] : 0.01) };
}

function gewQuantil(werte, gew, q) {
  const idx = werte.map((_, i) => i).sort((a, b) => werte[a] - werte[b]);
  let sum = 0; for (const g of gew) sum += g;
  if (!sum) return NaN;
  let acc = 0;
  for (const i of idx) { acc += gew[i]; if (acc >= q * sum) return werte[i]; }
  return werte[idx[idx.length - 1]];
}

export function melodieAusAudio(x, sr, silbenZeiten) {
  const spur = tonhoehe(x, sr, { hop: 0.01 });
  return melodieAusSpur(spur, silbenZeiten);
}

export function melodieAusSpur(spur0, silbenZeiten) {
  const spur = alsSpur(spur0), hop = spur.hop, N = spur.hz.length;
  if (!silbenZeiten || !silbenZeiten.length) {
    return noten(spur, { minSicher: 0.5, minDauer: 0.08 }).map((n) => ({
      t: Math.round(n.t0 * 1000) / 1000, dauer: Math.round((n.t1 - n.t0) * 1000) / 1000, midi: n.midi, cent: Math.round(n.cent),
    }));
  }
  const fenster = silbenZeiten.map((s, i) => {
    if (typeof s === 'number') {
      const n = silbenZeiten[i + 1];
      return { t: s, dauer: typeof n === 'number' ? Math.max(0.05, n - s) : 0.5 };
    }
    const t = s.t ?? s.start ?? 0;
    const dauer = s.dauer ?? (s.ende != null ? s.ende - t : 0.4);
    return { t, dauer: Math.max(0.02, dauer) };
  });
  return fenster.map(({ t, dauer }) => {
    // mittlere 70 % der Silbe (Konsonanten und Gleiten an den Rändern weglassen)
    const a = Math.max(0, Math.floor((t + 0.15 * dauer) / hop)), b = Math.min(N - 1, Math.ceil((t + 0.85 * dauer) / hop));
    const m = [], w = [];
    for (let i = a; i <= b; i++) if (spur.hz[i] > 0 && spur.sicher[i] >= 0.5) { m.push(hzZuMidi(spur.hz[i])); w.push(spur.sicher[i]); }
    if (m.length < 2) return { t, dauer, midi: null, cent: 0 };
    const med = gewQuantil(m, w, 0.5);
    return { t, dauer, midi: Math.round(med), cent: Math.round((med - Math.round(med)) * 100) };
  });
}

// ---------------------------------------------------------------- stimmlage

// Kernbereich (bequeme Lage, MIDI) je Stimmfach – grobe Richtwerte
const FAECHER = [
  { typ: 'Bass', g: 'm', kern: [45, 59], umfang: [40, 64] },
  { typ: 'Bariton', g: 'm', kern: [48, 63], umfang: [43, 67] },
  { typ: 'Tenor', g: 'm', kern: [52, 67], umfang: [48, 72] },
  { typ: 'Alt', g: 'w', kern: [55, 70], umfang: [53, 77] },
  { typ: 'Mezzosopran', g: 'w', kern: [58, 74], umfang: [57, 81] },
  { typ: 'Sopran', g: 'w', kern: [62, 79], umfang: [60, 84] },
];

export function stimmlage(spur0, opt = {}) {
  const spur = alsSpur(spur0), ton = opt.tonart;
  const minS = opt.minSicher ?? 0.55;
  const nn = noten(spur, { minSicher: minS, minDauer: 0.15 });
  // Lautstärke-Filter: nur Töne, die nicht viel leiser sind als der laute Teil (kein Hauch, kein Übersprechen)
  const pg = nn.map((n) => n.pegel).filter(isFinite).sort((a, b) => a - b);
  const laut = pg.length ? pg[Math.floor(0.9 * (pg.length - 1))] : -20;
  const gut = nn.filter((n) => n.pegel >= laut - 24 && n.sicher >= minS && n.streuung < 160);
  const leer = { tief: null, hoch: null, kern: [null, null], typ: '', sicherheit: 0, sekunden: 0, anzahl: 0, typen: [],
    tiefName: '', hochName: '', kernName: ['', ''],
    text: 'Noch keine sichere Stimmlage: In der Aufnahme waren zu wenige klare, gehaltene Töne. Sing am besten eine langsame Tonleiter auf „a“ – von bequem tief bis bequem hoch.' };
  if (!gut.length) return leer;
  // gehaltene Zeit je Halbton → tiefster/höchster SICHERER Ton (mind. 0,3 s insgesamt oder ein Ton ≥ 0,25 s)
  const zeit = new Map(), lang = new Map();
  const werte = [], gew = [];
  let sek = 0;
  for (const n of gut) {
    const d = n.t1 - n.t0; sek += d;
    zeit.set(n.midi, (zeit.get(n.midi) || 0) + d);
    lang.set(n.midi, Math.max(lang.get(n.midi) || 0, d));
    for (const v of n.kurve) { werte.push(v); gew.push(1); }
  }
  const sicherTon = [...zeit.keys()].filter((m) => zeit.get(m) >= 0.3 || lang.get(m) >= 0.25).sort((a, b) => a - b);
  const alle = [...zeit.keys()].sort((a, b) => a - b);
  const liste = sicherTon.length ? sicherTon : alle;
  const tief = liste[0], hoch = liste[liste.length - 1];
  const lo = Math.round(gewQuantil(werte, gew, 0.1)), hi = Math.round(gewQuantil(werte, gew, 0.9));
  // Stimmfach: Abstand des Kernbereichs (und des Umfangs) zu den Richtwerten
  let kand = FAECHER;
  if (opt.geschlecht === 'm' || opt.geschlecht === 'w') kand = FAECHER.filter((f) => f.g === opt.geschlecht);
  const mitte = (lo + hi) / 2;
  const bewertet = kand.map((f) => {
    const fm = (f.kern[0] + f.kern[1]) / 2;
    let d = Math.abs(mitte - fm);
    if (tief < f.umfang[0]) d += 0.5 * (f.umfang[0] - tief);
    if (hoch > f.umfang[1]) d += 0.5 * (hoch - f.umfang[1]);
    return { typ: f.typ, d };
  }).sort((a, b) => a.d - b.d);
  const typ = bewertet[0].typ;
  const nachbar = bewertet[1] && bewertet[1].d - bewertet[0].d < 2.5 ? bewertet[1].typ : '';
  // Sicherheit: genug gesungene Zeit, genug verschiedene Töne, klarer Abstand zum Nachbarfach
  const sicherheit = Math.round(Math.min(1, sek / 40) * Math.min(1, (hoch - tief + 1) / 12) * (nachbar ? 0.75 : 1) * 100) / 100;
  const N = (m) => midiName(m, ton);
  const grob = sicherheit < 0.4;
  let text = `Schätzung aus deiner Aufnahme (${Math.round(sek)} s klar gesungen): tiefster sicherer Ton ${N(tief)}, höchster ${N(hoch)}, `
    + `am wohlsten zwischen ${N(lo)} und ${N(hi)}. Das passt am ehesten zu ${typ}${nachbar ? ` (oder ${nachbar})` : ''}.`;
  if (!opt.geschlecht) text += ' Männer- und Frauenstimmen überschneiden sich – die Tonhöhe allein ist kein sicheres Urteil.';
  if (grob) text += ' Für eine genauere Schätzung: langsam von ganz unten bis ganz oben auf „a“ singen, ohne zu drücken.';
  return { tief, hoch, kern: [lo, hi], typ, sicherheit, text, sekunden: Math.round(sek * 10) / 10, anzahl: gut.length,
    typen: nachbar ? [typ, nachbar] : [typ], tiefName: N(tief), hochName: N(hoch), kernName: [N(lo), N(hi)] };
}

// ---------------------------------------------------------------- Echtzeit-Tonhöhe (ein Puffer, YIN)

const ARB = { d: new Float64Array(0) };
export function einzelTon(buf, sr, opt = {}) {
  const fmin = opt.fmin ?? 65, fmax = opt.fmax ?? 1100, thr = opt.schwelle ?? 0.15;
  const n = buf.length;
  let e = 0; for (let i = 0; i < n; i++) e += buf[i] * buf[i];
  const pegel = 10 * Math.log10(e / Math.max(1, n) + 1e-12);
  const tauMin = Math.max(2, Math.floor(sr / fmax)), tauMax = Math.min(Math.ceil(sr / fmin), Math.floor(n / 2));
  if (tauMax <= tauMin + 2) return { hz: 0, sicher: 0, pegel };
  const W = n - tauMax - 1;
  if (ARB.d.length < tauMax + 2) ARB.d = new Float64Array(tauMax + 2);
  const d = ARB.d;
  let cum = 0; d[0] = 1;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0;
    for (let j = 0; j < W; j++) { const a = buf[j] - buf[j + tau]; s += a * a; }
    cum += s; d[tau] = cum > 0 ? s * tau / cum : 1;
  }
  let best = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (d[tau] < thr) { while (tau + 1 <= tauMax && d[tau + 1] < d[tau]) tau++; best = tau; break; }
  }
  if (best < 0) { let bv = 1e9; for (let tau = tauMin; tau <= tauMax; tau++) if (d[tau] < bv) { bv = d[tau]; best = tau; } }
  // Stetigkeit: liegt nahe der letzten Tonhöhe ein fast ebenso gutes Tal, dieses nehmen (keine Oktavsprünge)
  if (opt.vorher > 0) {
    const tv = sr / opt.vorher, a = Math.max(tauMin, Math.floor(tv * 0.94)), b = Math.min(tauMax, Math.ceil(tv * 1.06));
    let bi = -1, bv = 1e9;
    for (let tau = a; tau <= b; tau++) if (d[tau] < bv && d[tau] <= d[tau - 1] && d[tau] <= d[tau + 1]) { bv = d[tau]; bi = tau; }
    if (bi > 0 && Math.abs(bi - best) > 2 && bv < d[best] + 0.1) best = bi;
  }
  const y0 = d[best - 1], y1 = d[best], y2 = d[best + 1], den = y0 - 2 * y1 + y2;
  const dt = den > 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (y0 - y2) / den)) : 0;
  const sicher = Math.max(0, Math.min(1, 1 - y1));
  if (y1 > 0.35) return { hz: 0, sicher, pegel };
  return { hz: sr / (best + dt), sicher, pegel };
}

export async function mikrofon({ onTon, onFehler, ctx, fmin = 65, fmax = 1100, minPegel = -62, rate = 30 } = {}) {
  const md = G.navigator && G.navigator.mediaDevices;
  if (!md || !md.getUserMedia) throw new Error('Mikrofon ist hier nicht verfügbar (die Seite braucht https und einen Browser mit Mikrofon-Zugriff).');
  // iOS Safari: AudioContext MUSS noch im Tipp (vor dem ersten await) entstehen bzw. fortgesetzt werden.
  const AC = G.AudioContext || G.webkitAudioContext;
  if (!AC) throw new Error('Dieser Browser kann kein Audio auswerten.');
  try { if (G.navigator.audioSession) G.navigator.audioSession.type = 'play-and-record'; } catch (e) { /* egal */ }
  const eigen = !ctx || ctx.state === 'closed';
  const ac = eigen ? new AC() : ctx;
  let weckt = null;
  try { weckt = ac.resume(); } catch (e) { /* egal */ }
  let stream;
  try {
    stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
  } catch (e) {
    if (eigen) { try { ac.close(); } catch (e2) { /* egal */ } }
    const n = e && e.name;
    const t = n === 'NotAllowedError' || n === 'SecurityError'
      ? 'Mikrofon-Zugriff wurde nicht erlaubt. iPhone: Einstellungen › Safari › Mikrofon › „Erlauben“ (oder aA › Website-Einstellungen), dann noch einmal tippen.'
      : n === 'NotFoundError' ? 'Kein Mikrofon gefunden.'
        : n === 'NotReadableError' ? 'Das Mikrofon wird gerade von einer anderen App benutzt (z. B. Anruf, Sprachmemo). Dort beenden und noch einmal tippen.'
          : 'Mikrofon konnte nicht gestartet werden: ' + (e && e.message || e);
    throw new Error(t);
  }
  try { await weckt; } catch (e) { /* egal */ }
  if (ac.state !== 'running') { try { await ac.resume(); } catch (e) { /* egal */ } }
  const quelle = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0;
  const still = ac.createGain(); still.gain.value = 0; // Safari rechnet Analyser nur, wenn sie am Ausgang hängen
  quelle.connect(an); an.connect(still); still.connect(ac.destination);
  const roh = new Float32Array(an.fftSize);
  const D = ac.sampleRate >= 32000 ? 2 : 1, srd = ac.sampleRate / D;
  const klein = new Float32Array(Math.floor(roh.length / D));
  const verlauf = [];
  let vorher = 0, vorherZeit = -1, aus = false, letzte = 0, stummSeit = performance.now(), gewarnt = false;
  const t0 = performance.now();
  const schritt = () => {
    if (aus) return;
    try {
      if (ac.state !== 'running' && ac.state !== 'closed') { try { ac.resume(); } catch (e) { /* egal */ } }
      an.getFloatTimeDomainData(roh);
      let spitze = 0; for (let i = 0; i < roh.length; i += 4) { const v = Math.abs(roh[i]); if (v > spitze) spitze = v; }
      if (spitze > 1e-6) stummSeit = performance.now();
      else if (!gewarnt && performance.now() - stummSeit > 2500 && onFehler) { gewarnt = true; onFehler(new Error('Vom Mikrofon kommt kein Signal. Einmal auf den Bildschirm tippen oder das Mikrofon neu starten.')); }
      if (D === 2) for (let i = 0, j = 0; j < klein.length; i += 2, j++) klein[j] = 0.25 * (roh[i > 0 ? i - 1 : 0]) + 0.5 * roh[i] + 0.25 * roh[i + 1];
      else klein.set(roh.subarray(0, klein.length));
      const zeit = (performance.now() - t0) / 1000;
      const r = einzelTon(klein, srd, { fmin, fmax, vorher: zeit - vorherZeit < 0.25 ? vorher : 0 });
      const st = r.hz > 0 && r.pegel >= minPegel;
      let ereignis;
      if (st) {
        vorher = r.hz; vorherZeit = zeit;
        verlauf.push(hzZuMidi(r.hz)); if (verlauf.length > 3) verlauf.shift();
        const s = verlauf.slice().sort((a, b) => a - b), m = s[s.length >> 1];
        const midi = Math.round(m);
        ereignis = { hz: midiZuHz(m), midi, midiGenau: m, cent: Math.round((m - midi) * 100), sicher: r.sicher, pegel: r.pegel, name: midiName(midi), zeit };
      } else {
        if (zeit - vorherZeit > 0.12) verlauf.length = 0;
        ereignis = { hz: 0, midi: null, midiGenau: null, cent: 0, sicher: 0, pegel: r.pegel, name: '', zeit };
      }
      if (onTon) onTon(ereignis);
    } catch (e) { if (onFehler) onFehler(e); }
  };
  // Auswertung im requestAnimationFrame (auf ~rate/s gedrosselt); Ersatz-Uhr, falls die Seite im Hintergrund ist
  const abstand = 1000 / rate;
  let raf = 0;
  const bild = (jetzt) => { if (aus) return; if (jetzt - letzte >= abstand - 2) { letzte = jetzt; schritt(); } raf = G.requestAnimationFrame(bild); };
  if (G.requestAnimationFrame) raf = G.requestAnimationFrame(bild);
  const uhr = setInterval(() => { if (performance.now() - letzte > 250) { letzte = performance.now(); schritt(); } }, 250);
  const stop = () => {
    if (aus) return; aus = true;
    clearInterval(uhr); if (raf && G.cancelAnimationFrame) G.cancelAnimationFrame(raf);
    try { quelle.disconnect(); an.disconnect(); still.disconnect(); } catch (e) { /* egal */ }
    for (const tr of stream.getTracks()) tr.stop();
    if (eigen) { try { ac.close(); } catch (e) { /* egal */ } }
    try { if (G.navigator.audioSession) G.navigator.audioSession.type = 'auto'; } catch (e) { /* egal */ }
  };
  stop.ctx = ac; stop.stream = stream;
  return stop;
}

// ---------------------------------------------------------------- vokalStimme (Formant-Synthese)

// Männerstimme, deutsche Vokale: [F1, F2, F3, F4] Hz und Bandbreiten; Frauen ≈ ×1,15
const FORMANTEN = {
  a: [730, 1250, 2500, 3400], e: [360, 2050, 2600, 3400], i: [280, 2250, 2950, 3500],
  o: [400, 760, 2450, 3300], u: [310, 690, 2300, 3200], 'ä': [560, 1750, 2500, 3400],
  'ö': [420, 1450, 2350, 3300], 'ü': [290, 1700, 2150, 3300],
};
const BANDBREITE = [90, 110, 160, 220];
const GEWICHT = [1, 0.85, 0.5, 0.3];

function normVokal(v) {
  let s = String(v ?? 'a').trim().toLowerCase();
  s = s.replace('ae', 'ä').replace('oe', 'ö').replace('ue', 'ü').replace('ə', 'ö').replace('schwa', 'ö');
  return s;
}
function vokalTeile(vokal, gleit) {
  const s = normVokal(vokal);
  let a = s[0] || 'a', b = gleit ? normVokal(gleit)[0] : '';
  if (!b && s.length > 1) {
    const zwei = s.slice(0, 2);
    const DI = { ai: ['a', 'i'], ei: ['a', 'i'], ay: ['a', 'i'], au: ['a', 'u'], ou: ['o', 'u'], eu: ['o', 'ü'], 'äu': ['o', 'ü'], oi: ['o', 'i'], ie: ['i', ''], 'ee': ['e', ''], oo: ['o', ''] };
    if (DI[zwei]) { a = DI[zwei][0]; b = DI[zwei][1]; }
  }
  if (!FORMANTEN[a]) a = 'ö';
  if (b && !FORMANTEN[b]) b = '';
  return { a, b };
}
function formantSatz(v, f0, stimme) {
  const k = stimme === 'w' ? 1.15 : 1;
  const F = FORMANTEN[v].map((f) => f * k);
  // hohe Töne: F1 folgt dem Grundton (so machen es Sänger auch – der Vokal öffnet sich etwas)
  if (F[0] < f0 * 1.08) F[0] = f0 * 1.08;
  if (F[1] < F[0] * 1.4) F[1] = F[0] * 1.4;
  return F;
}

// geschätzte Ausgangs-Lautstärke (RMS) eines Sägezahns durch die Formant-Filter → gleich laute Vokale und Lagen
function bp(f, fc, q) { const a = f * fc / q; return a / Math.sqrt((fc * fc - f * f) ** 2 + a * a); }
function tp(f, fc, q) { return fc * fc / Math.sqrt((fc * fc - f * f) ** 2 + (f * fc / q) ** 2); }
function formantPegel(F, f0) {
  let e = 0;
  for (let n = 1; n * f0 < 8000; n++) {
    const f = n * f0;
    let h = 0;
    for (let k = 0; k < 4; k++) h += GEWICHT[k] * 3.2 * bp(f, F[k], F[k] / Math.max(BANDBREITE[k], k === 0 ? f0 * 0.5 : 0));
    h += 0.35 * tp(f, f0 * 1.5, 0.7);
    const a = (0.64 / n) * h * tp(f, 5000, 0.5);
    e += a * a;
  }
  return Math.sqrt(e / 2);
}

export function vokalStimme(ctx, opt = {}) {
  const ziel = opt.ziel || ctx.destination;
  const aus = ctx.createGain(); aus.gain.value = opt.lautstaerke ?? 0.8; aus.connect(ziel);
  const vib = opt.vibrato ?? 25, stimme = opt.stimme || 'm';
  const aktiv = new Set();
  function singe(vokal, midi, start, dauer = 1, gleit = '') {
    const jetzt = ctx.currentTime;
    const t0 = Math.max(start ?? jetzt, jetzt), d = Math.max(0.1, dauer || 0), t1 = t0 + d;
    const f0 = midiZuHz(midi);
    const { a, b } = vokalTeile(vokal, gleit);
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f0, t0);
    const nodes = [osc];
    // leichtes Vibrato, setzt nach ~0,3 s weich ein
    let lfo = null;
    if (vib > 0 && d > 0.35) {
      lfo = ctx.createOscillator(); lfo.frequency.value = 5.3;
      const lg = ctx.createGain(), hub = f0 * (Math.pow(2, vib / 1200) - 1);
      lg.gain.setValueAtTime(0, t0); lg.gain.setValueAtTime(0, t0 + 0.25); lg.gain.linearRampToValueAtTime(hub, t0 + Math.min(0.7, d * 0.6));
      lfo.connect(lg); lg.connect(osc.frequency); nodes.push(lfo, lg);
    }
    const glatt = ctx.createBiquadFilter(); glatt.type = 'lowpass'; glatt.frequency.value = 5000; glatt.Q.value = 0.5;
    osc.connect(glatt); nodes.push(glatt);
    const F = formantSatz(a, f0, stimme), Z = b ? formantSatz(b, f0, stimme) : null;
    const norm = ctx.createGain(); norm.connect(aus); nodes.push(norm);
    norm.gain.value = 0.25 / Math.max(0.02, Z ? 0.5 * (formantPegel(F, f0) + formantPegel(Z, f0)) : formantPegel(F, f0));
    const huelle = ctx.createGain(); huelle.gain.value = 0; huelle.connect(norm); nodes.push(huelle);
    const gDauer = Math.min(0.28, Math.max(0.08, d * 0.35)), gEnde = t1 - Math.min(0.06, d * 0.1), gStart = gEnde - gDauer;
    for (let k = 0; k < 4; k++) {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      const bw = Math.max(BANDBREITE[k], k === 0 ? f0 * 0.5 : 0);
      bp.frequency.setValueAtTime(F[k], t0); bp.Q.setValueAtTime(F[k] / bw, t0);
      if (Z && gStart > t0 + 0.05) {
        bp.frequency.setValueAtTime(F[k], gStart); bp.frequency.linearRampToValueAtTime(Z[k], gEnde);
        bp.Q.setValueAtTime(F[k] / bw, gStart); bp.Q.linearRampToValueAtTime(Z[k] / Math.max(BANDBREITE[k], k === 0 ? f0 * 0.5 : 0), gEnde);
      }
      const g = ctx.createGain(); g.gain.value = GEWICHT[k] * 3.2;
      glatt.connect(bp); bp.connect(g); g.connect(huelle); nodes.push(bp, g);
    }
    // Grundton-Wärme (tiefe Vokale u/o/i haben einen kräftigen Grundton)
    const tp = ctx.createBiquadFilter(); tp.type = 'lowpass'; tp.frequency.value = f0 * 1.5; tp.Q.value = 0.7;
    const tg = ctx.createGain(); tg.gain.value = 0.35;
    glatt.connect(tp); tp.connect(tg); tg.connect(huelle); nodes.push(tp, tg);
    // sanfte Hüllkurve
    const att = Math.min(0.07, d * 0.25), rel = Math.min(0.12, d * 0.3);
    huelle.gain.setValueAtTime(0, t0);
    huelle.gain.linearRampToValueAtTime(1, t0 + att);
    huelle.gain.setValueAtTime(1, t1 - rel);
    huelle.gain.linearRampToValueAtTime(0, t1);
    const eintrag = { osc, lfo, huelle, nodes };
    aktiv.add(eintrag);
    osc.onended = () => { aktiv.delete(eintrag); for (const n of nodes) { try { n.disconnect(); } catch (e) { /* egal */ } } };
    osc.start(t0); osc.stop(t1 + 0.03);
    if (lfo) { lfo.start(t0); lfo.stop(t1 + 0.03); }
    return { start: t0, ende: t1 };
  }
  function stopp() {
    const t = ctx.currentTime;
    for (const e of aktiv) {
      try {
        e.huelle.gain.cancelScheduledValues(t); e.huelle.gain.setValueAtTime(e.huelle.gain.value, t); e.huelle.gain.linearRampToValueAtTime(0, t + 0.04);
        e.osc.stop(t + 0.05); if (e.lfo) e.lfo.stop(t + 0.05);
      } catch (err) { /* schon beendet */ }
    }
  }
  return { singe, stopp, ausgang: aus };
}

// ---------------------------------------------------------------- klavier

export function klavier(ctx, opt = {}) {
  const ziel = opt.ziel || ctx.destination;
  const aus = ctx.createGain(); aus.gain.value = opt.lautstaerke ?? 0.6; aus.connect(ziel);
  const wellen = new Map();
  const welle = (hell) => {
    if (wellen.has(hell)) return wellen.get(hell);
    const H = 16, re = new Float32Array(H + 1), im = new Float32Array(H + 1);
    for (let n = 1; n <= H; n++) im[n] = Math.pow(n, -(hell ? 1.15 : 1.6)) * (n % 7 === 0 ? 0.3 : 1);
    const w = ctx.createPeriodicWave(re, im); wellen.set(hell, w); return w;
  };
  const aktiv = new Set();
  function spiele(midi, start, dauer = 0.8, staerke = 0.8) {
    const jetzt = ctx.currentTime, t0 = Math.max(start ?? jetzt, jetzt), t1 = t0 + Math.max(0.05, dauer || 0);
    const f = midiZuHz(midi), w = welle(midi < 60);
    const g = ctx.createGain(); g.gain.value = 0; g.connect(aus);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.6;
    const hell = Math.min(16000, f * (5 + 9 * staerke));
    lp.frequency.setValueAtTime(hell, t0); lp.frequency.setTargetAtTime(Math.max(f * 2.2, 400), t0 + 0.01, 0.35);
    lp.connect(g);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.setPeriodicWave(w); o2.setPeriodicWave(w);
    o1.frequency.value = f * Math.pow(2, 1.2 / 1200); o2.frequency.value = f * Math.pow(2, -1.2 / 1200);
    const m = ctx.createGain(); m.gain.value = 0.5;
    o1.connect(m); o2.connect(m); m.connect(lp);
    const spitze = 0.35 * Math.max(0.1, Math.min(1, staerke));
    const tau = Math.max(0.25, Math.min(2.5, 1.1 * Math.pow(2, -(midi - 60) / 18)));
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(spitze, t0 + 0.005);
    g.gain.setTargetAtTime(spitze * 0.02, t0 + 0.005, tau);
    g.gain.setTargetAtTime(0, t1, 0.07);
    const nodes = [o1, o2, m, lp, g], e = { o1, o2, g, nodes };
    aktiv.add(e);
    o1.onended = () => { aktiv.delete(e); for (const n of nodes) { try { n.disconnect(); } catch (err) { /* egal */ } } };
    o1.start(t0); o2.start(t0); o1.stop(t1 + 0.5); o2.stop(t1 + 0.5);
    return { start: t0, ende: t1 };
  }
  function stopp() {
    const t = ctx.currentTime;
    for (const e of aktiv) {
      try { e.g.gain.cancelScheduledValues(t); e.g.gain.setValueAtTime(e.g.gain.value, t); e.g.gain.linearRampToValueAtTime(0, t + 0.04); e.o1.stop(t + 0.05); e.o2.stop(t + 0.05); } catch (err) { /* egal */ }
    }
  }
  return { spiele, stopp, ausgang: aus };
}

// ---------------------------------------------------------------- im Hintergrund (Worker)

let arbeiter = null, auftragNr = 0;
const offen = new Map();
function lokal(auftrag, x, sr, opt) {
  if (auftrag === 'melodie') return melodieAusAudio(x, sr, opt && opt.silbenZeiten);
  const spur = tonhoehe(x, sr, opt);
  if (auftrag === 'stimmlage') return { spur, stimme: stimmlage(spur, opt) };
  return spur;
}
export function imHintergrund(auftrag, x, sr, opt = {}) {
  const o = { ...opt }; delete o.fortschritt;
  if (!G.Worker || typeof document === 'undefined') return Promise.resolve().then(() => lokal(auftrag, x, sr, opt));
  try {
    if (!arbeiter) {
      arbeiter = new Worker(new URL('./ton-worker.js', import.meta.url), { type: 'module' });
      arbeiter.onmessage = (e) => {
        const p = offen.get(e.data.id); if (!p) return;
        if (e.data.stand != null) { if (p.fortschritt) p.fortschritt(e.data.stand); return; }
        offen.delete(e.data.id);
        e.data.ok ? p.res(e.data.r) : p.rej(new Error(e.data.fehler));
      };
      arbeiter.onerror = () => { for (const [, p] of offen) p.lokal(); offen.clear(); arbeiter = null; };
    }
    return new Promise((res, rej) => {
      const id = ++auftragNr;
      offen.set(id, { res, rej, fortschritt: opt.fortschritt, lokal: () => { try { res(lokal(auftrag, x, sr, opt)); } catch (e) { rej(e); } } });
      arbeiter.postMessage({ id, auftrag, x, sr, opt: o });
    });
  } catch (e) {
    return Promise.resolve().then(() => lokal(auftrag, x, sr, opt));
  }
}

// ---------------------------------------------------------------- Audio laden (aus Werkstatt 3: WAV/AIFF selbst, sonst decodeAudioData)

export async function ladeAudio(file) {
  let buf, name = 'Aufnahme';
  if (file instanceof ArrayBuffer) buf = file;
  else if (ArrayBuffer.isView(file)) buf = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  else if (file && typeof file.arrayBuffer === 'function') { buf = await file.arrayBuffer(); name = file.name || name; }
  else throw new Error('laden: keine Datei');
  if (buf.byteLength < 12) throw new Error('Datei ist leer oder zu kurz');

  let r = wavLesen(buf) || aiffLesen(buf);
  if (!r) r = await dekodieren(buf, flacRate(buf) || mp3Rate(buf));
  const x = mono(r.kanaele);
  return { x, sr: r.sr, name, kanaele: r.kanaele.length, bits: r.bits, format: r.format, dauer: x.length / r.sr };
}

function mono(k) {
  if (k.length === 1) return k[0];
  const n = k[0].length, x = new Float32Array(n), g = 1 / k.length;
  for (const c of k) for (let i = 0; i < n; i++) x[i] += c[i];
  for (let i = 0; i < n; i++) x[i] *= g;
  return x;
}

function kennung(dv, o) {
  return String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
}

export function wavLesen(buf) {
  if (ArrayBuffer.isView(buf)) buf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const dv = new DataView(buf), len = buf.byteLength;
  if (len < 12) return null;
  const riff = kennung(dv, 0);
  if ((riff !== 'RIFF' && riff !== 'RF64') || kennung(dv, 8) !== 'WAVE') return null;
  let o = 12, fmt = null, datO = -1, datL = 0;
  while (o + 8 <= len) {
    const id = kennung(dv, o); let sz = dv.getUint32(o + 4, true); const k = o + 8;
    if (id === 'fmt ') {
      let f = dv.getUint16(k, true);
      const ch = dv.getUint16(k + 2, true), sr = dv.getUint32(k + 4, true);
      const ba = dv.getUint16(k + 12, true), bits = dv.getUint16(k + 14, true);
      if (f === 0xFFFE && sz >= 26) f = dv.getUint16(k + 24, true); // Extensible: Unterformat
      fmt = { f, ch, sr, ba, bits };
    } else if (id === 'data') {
      datO = k;
      if (sz === 0 || sz === 0xFFFFFFFF || k + sz > len) sz = len - k; // Streaming/abgeschnittene Dateien
      datL = sz;
      if (fmt) break;
    }
    o = k + sz + (sz & 1);
  }
  if (!fmt || datO < 0) throw new Error('WAV ohne fmt/data');
  const { f, ch, sr, bits } = fmt;
  const bps = bits >> 3, ba = fmt.ba || ch * bps;
  if (!ch || !sr || !bps) throw new Error('WAV: ungültiger Kopf');
  const n = Math.floor(datL / ba);
  const kan = []; for (let c = 0; c < ch; c++) kan.push(new Float32Array(n));
  const u = new Uint8Array(buf, datO, n * ba);
  if (f === 1) {
    if (bits === 16) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 2) {
        const v = u[q] | (u[q + 1] << 8); kan[c][i] = (v > 32767 ? v - 65536 : v) / 32768;
      }
    } else if (bits === 24) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 3) {
        const v = (u[q] | (u[q + 1] << 8) | (u[q + 2] << 16)) << 8 >> 8; kan[c][i] = v / 8388608;
      }
    } else if (bits === 32) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 4) {
        kan[c][i] = dv.getInt32(datO + q, true) / 2147483648;
      }
    } else if (bits === 8) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0; c < ch; c++) kan[c][i] = (u[p + c] - 128) / 128;
    } else throw new Error('WAV: ' + bits + ' bit nicht unterstützt');
  } else if (f === 3) {
    for (let i = 0, p = datO; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += bps) {
      kan[c][i] = bits === 64 ? dv.getFloat64(q, true) : dv.getFloat32(q, true);
    }
  } else return null; // komprimiertes WAV (z. B. ADPCM) → decodeAudioData versuchen
  return { kanaele: kan, sr, bits, format: f === 3 ? 'wav-float' : 'wav' };
}

function ext80(dv, o) { // IEEE 754 80-bit (AIFF-Abtastrate)
  const e = dv.getUint16(o) , s = e & 0x8000 ? -1 : 1, ex = (e & 0x7FFF) - 16383 - 63;
  const hi = dv.getUint32(o + 2), lo = dv.getUint32(o + 6);
  return s * (hi * 4294967296 + lo) * Math.pow(2, ex);
}

function aiffLesen(buf) {
  const dv = new DataView(buf), len = buf.byteLength;
  if (kennung(dv, 0) !== 'FORM') return null;
  const typ = kennung(dv, 8);
  if (typ !== 'AIFF' && typ !== 'AIFC') return null;
  let o = 12, comm = null, ssO = -1;
  while (o + 8 <= len) {
    const id = kennung(dv, o), sz = dv.getUint32(o + 4), k = o + 8;
    if (id === 'COMM') {
      comm = { ch: dv.getInt16(k), n: dv.getUint32(k + 2), bits: dv.getInt16(k + 6), sr: Math.round(ext80(dv, k + 8)), comp: 'NONE' };
      if (typ === 'AIFC' && sz >= 22) comm.comp = kennung(dv, k + 18);
    } else if (id === 'SSND') ssO = k + 8 + dv.getUint32(k);
    o = k + sz + (sz & 1);
  }
  if (!comm || ssO < 0) return null;
  const { ch, bits, sr } = comm, comp = comm.comp.toLowerCase();
  const flt = comp === 'fl32' || comp === 'fl64', le = comp === 'sowt';
  if (!flt && comp !== 'none' && !le) return null;
  const bps = flt ? (comp === 'fl64' ? 8 : 4) : (bits + 7) >> 3, ba = bps * ch;
  const n = Math.min(comm.n, Math.floor((len - ssO) / ba));
  const kan = []; for (let c = 0; c < ch; c++) kan.push(new Float32Array(n));
  const u = new Uint8Array(buf);
  for (let i = 0, p = ssO; i < n; i++) for (let c = 0; c < ch; c++, p += bps) {
    let v;
    if (flt) v = bps === 8 ? dv.getFloat64(p) : dv.getFloat32(p);
    else if (bps === 2) v = (le ? dv.getInt16(p, true) : dv.getInt16(p)) / 32768;
    else if (bps === 3) v = (le ? (u[p] | (u[p + 1] << 8) | (u[p + 2] << 16)) : ((u[p] << 16) | (u[p + 1] << 8) | u[p + 2])) << 8 >> 8, v /= 8388608;
    else if (bps === 4) v = (le ? dv.getInt32(p, true) : dv.getInt32(p)) / 2147483648;
    else v = dv.getInt8(p) / 128;
    kan[c][i] = v;
  }
  return { kanaele: kan, sr, bits: flt ? bps * 8 : bits, format: 'aiff' };
}

function flacRate(buf) { // FLAC STREAMINFO: originale Abtastrate, damit nicht umgerechnet wird
  try {
    const u = new Uint8Array(buf, 0, Math.min(64, buf.byteLength));
    if (u[0] === 0x66 && u[1] === 0x4C && u[2] === 0x61 && u[3] === 0x43) return (u[18] << 12) | (u[19] << 4) | (u[20] >> 4);
  } catch (e) { /* egal */ }
  return 0;
}

function mp3Rate(buf) { // MP3-Rahmenkopf: originale Abtastrate (44,1 kHz bleibt 44,1 kHz statt auf 48 kHz umgerechnet)
  try {
    const u = new Uint8Array(buf);
    let i = 0;
    if (u[0] === 0x49 && u[1] === 0x44 && u[2] === 0x33) i = 10 + ((u[6] & 127) << 21 | (u[7] & 127) << 14 | (u[8] & 127) << 7 | (u[9] & 127)) + (u[5] & 16 ? 10 : 0);
    else if (u[0] !== 0xFF || (u[1] & 0xE0) !== 0xE0) return 0; // kein MP3 (z. B. M4A) → nicht anfassen
    const n = Math.min(u.length - 4, i + 8192);
    for (; i < n; i++) {
      if (u[i] !== 0xFF || (u[i + 1] & 0xE0) !== 0xE0) continue;
      const ver = (u[i + 1] >> 3) & 3, lay = (u[i + 1] >> 1) & 3, br = u[i + 2] >> 4, si = (u[i + 2] >> 2) & 3;
      if (ver === 1 || lay === 0 || br === 0 || br === 15 || si === 3) continue;
      return [44100, 48000, 32000][si] / (ver === 3 ? 1 : ver === 2 ? 2 : 4);
    }
  } catch (e) { /* egal */ }
  return 0;
}

let dekoCtx = null;
async function dekodieren(buf, srWunsch) {
  const kopie = buf.slice(0); // decodeAudioData macht den Puffer unbrauchbar
  const OAC = G.OfflineAudioContext || G.webkitOfflineAudioContext;
  const AC = G.AudioContext || G.webkitAudioContext;
  let c = null;
  if (OAC) { try { c = new OAC(1, 1, srWunsch || 48000); } catch (e) { c = null; } }
  if (!c && AC) { if (!dekoCtx) dekoCtx = new AC(); c = dekoCtx; }
  if (!c) throw new Error('Dieses Format kann hier nicht gelesen werden – bitte WAV oder AIFF verwenden');
  const ab = await new Promise((res, rej) => {
    try {
      const p = c.decodeAudioData(kopie, res, () => rej(new Error('Datei konnte nicht dekodiert werden')));
      if (p && p.then) p.then(res, () => rej(new Error('Datei konnte nicht dekodiert werden')));
    } catch (e) { rej(e); }
  });
  const kan = []; for (let i = 0; i < ab.numberOfChannels; i++) kan.push(new Float32Array(ab.getChannelData(i)));
  return { kanaele: kan, sr: ab.sampleRate, bits: 0, format: 'dekodiert' };
}

