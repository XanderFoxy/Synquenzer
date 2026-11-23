// Werkstatt 3 – timing.js
// Transienten finden, auf das Raster ziehen (Zeitkarte) und die Aufnahme danach zeitlich verbiegen (Warp).
// Reines JavaScript, läuft im Hauptfaden und im Worker. Alles lokal – die Datei verlässt nie das Gerät.
//
// export function transienten(x, sr, opt={})  → [{peak, onset, staerke, pegel, anstieg}]  (Sekunden)
//        peak  = höchster Punkt der Anschlags-Hüllkurve (erste Spitze nach dem steilsten Anstieg)
//        onset = Beginn des Aufbaus davor (dort, wo die Hüllkurve aus der Pause/dem Tal heraussteigt)
// export function zeitkarte(tr, raster={})     → Anker [{src, dst, typ, i}] (Sekunden, in beiden Spalten streng steigend)
//        raster: {bpm=120, offset=0, teilung:'1/16'|'1/8'|'1/4'|'1/32'|'frei', staerke=1, fenster=Raster/2,
//                 minStaerke=0.12, vor=0.02, nach=0.025, manuell:{index: Ziel-Spitze in s}}
//        Jede (genügend starke) Spitze landet auf der nächsten Rasterlinie; der Vorlauf onset→peak bleibt
//        links daneben in Originallänge (1:1 kopiert), gedehnt/gestaucht wird nur dazwischen. Kein Überholen:
//        geht es zwischen zwei Spitzen nicht auf (zu eng, Dehnung > 4×), bleibt die schwächere frei.
//        Ergebnis-Array trägt zusätzlich .pins (die gezogenen Transienten) und .raster (Schritt in s).
// export function warp(x, sr, anker, opt={})   → Float32Array (gleiche Länge wie x, außer opt.laenge)
//        WSOLA mit festen Ankern: Rahmen spielen immer mit Tempo 1 (gleiche Tonhöhe); an jedem Anker und in
//        jedem 1:1-Abschnitt liegt die Quelle exakt (Spitzen auf die Probe genau), dazwischen sucht WSOLA
//        die ähnlichste Stelle (±8 ms) für knackfreie Übergänge.
// export function bpmSchaetzen(tr, opt={})     → {bpm, offset, guete}
// export function abbilden(anker, t)           → Zeit nach dem Warp (Quelle → Ziel), außerhalb Steigung 1
// export function zurueck(anker, t)            → Zeit vor dem Warp (Ziel → Quelle)
// export function rasterSchritt(raster)        → Sekunden je Rasterlinie (0 bei 'frei')
// export function rasterAbweichung(tr, raster) → {median, p90, max, n, werte} in ms (|Spitze − nächste Linie|)

const klemm = (v, a, b) => (v < a ? a : v > b ? b : v);
const klemm01 = v => klemm(v, 0, 1);

// ------------------------------------------------------------------ Hüllkurve (1 ms Raster, Pegel in dB)

function huelle(x, sr, glatt = 5) {
  const hop = Math.max(1, Math.round(sr * 0.001));
  const n = Math.floor(x.length / hop);
  const E = new Float64Array(n);
  for (let b = 0, k = 0; b < n; b++) {
    let s = 0;
    const e = k + hop;
    for (; k < e; k++) { const v = x[k]; s += v * v; }
    E[b] = s / hop;
  }
  // symmetrische Hann-Glättung (keine Verzögerung → Spitzen bleiben an ihrem Ort)
  const K = glatt, w = new Float64Array(2 * K + 1);
  let ws = 0;
  for (let j = -K; j <= K; j++) { w[j + K] = 0.5 + 0.5 * Math.cos(Math.PI * j / (K + 1)); ws += w[j + K]; }
  for (let j = 0; j < w.length; j++) w[j] /= ws;
  const L = new Float32Array(n);
  for (let b = 0; b < n; b++) {
    let s = 0;
    for (let j = -K; j <= K; j++) { const i = b + j; s += w[j + K] * E[i < 0 ? 0 : i >= n ? n - 1 : i]; }
    L[b] = 10 * Math.log10(s + 1e-12);
  }
  return { L, hop, n };
}

function perzentil(arr, p) {
  const a = Float32Array.from(arr).sort();
  if (!a.length) return 0;
  return a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))];
}

// ------------------------------------------------------------------ Transienten

export function transienten(x, sr, opt = {}) {
  if (!x || !sr || x.length < sr * 0.05) return [];
  const { L, hop, n } = huelle(x, sr, opt.glatt ?? 5);
  const msZuT = b => (b + 0.5) * hop / sr;
  const Lref = perzentil(L, 0.95), boden = perzentil(L, 0.1);
  const tor = Math.max(boden + (opt.ueberBoden ?? 6), Lref - (opt.unterRef ?? 40));
  const minAnstieg = opt.minAnstieg ?? 6;          // dB vom Tal zur Spitze
  const minSteil = opt.minSteil ?? 1.0;            // dB je 4 ms am steilsten Punkt
  const maxVorlauf = opt.maxVorlauf ?? 0.12;       // s
  const minAbstand = Math.round((opt.minAbstand ?? 0.05) * 1000); // ms zwischen zwei Spitzen
  const verbinden = opt.verbinden !== false;

  // Steilheit (zentrale Differenz über 4 ms)
  const s = new Float32Array(n);
  for (let b = 2; b < n - 2; b++) s[b] = L[b + 2] - L[b - 2];

  const out = [];
  let letzteSpitze = -1;
  for (let b = 3; b < n - 3; b++) {
    if (!(s[b] >= minSteil && s[b] >= s[b - 1] && s[b] > s[b + 1])) continue;
    if (b <= letzteSpitze) continue;
    // Spitze: laufendes Maximum, bis es um 1.5 dB fällt, 25 ms lang nicht mehr steigt oder 200 ms vergangen sind
    let pk = b, mx = L[b];
    for (let j = b + 1; j < n && j - b <= 200; j++) {
      const v = L[j];
      if (v > mx + 0.05) { mx = v; pk = j; }
      if (v < mx - 1.5 || j - pk > 25) break;
    }
    const Lp = L[pk];
    if (Lp < tor) { continue; }
    // Tal davor: rückwärts, solange es (fast) weiter fällt – höchstens 150 ms
    let j = b;
    while (j > 0 && b - j < 150 && L[j - 1] <= L[j] + 0.2) j--;
    let jm = j;
    for (let i = j; i <= b; i++) if (L[i] < L[jm]) jm = i;
    const Lm = L[jm], anstieg = Lp - Lm;
    if (anstieg < minAnstieg) { continue; }
    // Beginn des Aufbaus: erste Stelle nach dem Tal über max(Tal + 3 dB, Spitze − 30 dB)
    const schwelle = Math.max(Lm + 3, Lp - 30);
    let o = jm;
    while (o < pk && L[o] < schwelle) o++;
    o = Math.max(jm, o - 1);
    // Spitze fein (Parabel)
    let d = 0;
    if (pk > 0 && pk < n - 1) {
      const a = L[pk - 1], c = L[pk + 1], den = a - 2 * Lp + c;
      if (den < 0) d = klemm(0.5 * (a - c) / den, -0.5, 0.5);
    }
    const tp = (pk + 0.5 + d) * hop / sr;
    let to = msZuT(o);
    if (tp - to > maxVorlauf) to = tp - maxVorlauf;
    if (tp - to < 0.001) to = tp - 0.001;
    const staerke = klemm01((Lp - (Lref - 30)) / 30) * Math.sqrt(klemm01(anstieg / 24));
    const neu = { peak: tp, onset: to, staerke, pegel: Lp, anstieg, _pk: pk };
    const vor = out[out.length - 1];
    if (vor) {
      const abstand = pk - vor._pk;
      // zu dicht: zusammenlegen (frühester Beginn, höhere Spitze)
      // Konsonant + Vokal: neuer Anstieg direkt nach der alten Spitze und deutlich lauter → eine Silbe
      const silbe = verbinden && (to - vor.peak) < 0.04 && Lp > vor.pegel + 3 && (tp - vor.onset) <= maxVorlauf * 1.25;
      if (abstand < minAbstand || silbe) {
        if (Lp >= vor.pegel) {
          vor.peak = tp; vor._pk = pk; vor.pegel = Lp;
          vor.anstieg = Math.max(vor.anstieg, Lp - Lm);
          vor.staerke = Math.max(vor.staerke, staerke);
          if (vor.peak - vor.onset > maxVorlauf * 1.25) vor.onset = vor.peak - maxVorlauf * 1.25;
        }
        letzteSpitze = Math.max(letzteSpitze, pk);
        continue;
      }
      if (to < vor.peak + 0.002) neu.onset = Math.min(tp - 0.001, vor.peak + 0.002);
    }
    out.push(neu);
    letzteSpitze = pk;
  }
  for (const t of out) delete t._pk;
  return out;
}

// ------------------------------------------------------------------ Raster

export function rasterSchritt(raster = {}) {
  if (raster.schritt > 0) return raster.schritt;
  const bpm = raster.bpm > 0 ? raster.bpm : 120;
  const t = raster.teilung || '1/16';
  if (t === 'frei') return 0;
  const m = /^1\/(\d+)(t?)$/.exec(t);
  const teil = m ? +m[1] : 16;
  let g = (60 / bpm) * 4 / teil;
  if (m && m[2] === 't') g *= 2 / 3;
  return g;
}

function naechsteLinie(t, g, off) { return off + Math.round((t - off) / g) * g; }

export function rasterAbweichung(tr, raster = {}) {
  const g = rasterSchritt(raster), off = raster.offset || 0;
  const minSt = raster.minStaerke ?? 0;
  const werte = [];
  if (g > 0) for (const t of tr || []) if ((t.staerke ?? 1) >= minSt) werte.push(Math.abs(t.peak - naechsteLinie(t.peak, g, off)) * 1000);
  const a = Float64Array.from(werte).sort();
  const q = p => (a.length ? a[Math.min(a.length - 1, Math.round(p * (a.length - 1)))] : 0);
  return { median: q(0.5), p90: q(0.9), max: a.length ? a[a.length - 1] : 0, n: a.length, werte };
}

// ------------------------------------------------------------------ Zeitkarte

export function zeitkarte(tr, raster = {}) {
  const g = rasterSchritt(raster), off = raster.offset || 0;
  const staerke = raster.staerke ?? 1;
  const fenster = raster.fenster ?? g / 2;
  const minSt = raster.minStaerke ?? 0.12;
  const VOR = raster.vor ?? 0.02, NACH = raster.nach ?? 0.025, MINRAND = 0.003;
  const RMIN = 0.25, RMAX = 4;   // erlaubtes Verhältnis Quelle/Ziel im gedehnten Stück
  const manuell = raster.manuell || {};
  const liste = (tr || []).map((t, i) => ({ ...t, i })).filter(t => Number.isFinite(t.peak)).sort((a, b) => a.peak - b.peak);

  // Kandidaten: Ziel je Spitze
  const kand = [];
  for (const t of liste) {
    const man = manuell[t.i];
    const v = Math.max(0.001, t.peak - Math.max(0, Math.min(t.onset, t.peak - 0.001)));
    if (man != null && Number.isFinite(+man)) {
      kand.push({ i: t.i, p: t.peak, o: t.peak - v, v, sh: +man - t.peak, prio: Infinity, ziel: +man, st: t.staerke ?? 1 });
      continue;
    }
    if ((t.staerke ?? 1) < minSt) continue;
    let sh = 0, ziel = t.peak, alt = null;
    if (g > 0 && staerke > 0) {
      const lin = naechsteLinie(t.peak, g, off);
      if (Math.abs(lin - t.peak) <= fenster + 1e-9) {
        ziel = lin; sh = (lin - t.peak) * staerke;
        const zweite = lin + (t.peak >= lin ? g : -g);   // Ausweich-Linie bei Platzkonflikt
        if (Math.abs(zweite - t.peak) <= Math.max(fenster, g * 0.75)) alt = (zweite - t.peak) * staerke;
      }
    }
    kand.push({ i: t.i, p: t.peak, o: t.peak - v, v, sh, alt, ziel, prio: (t.staerke ?? 1) - 0.25 * Math.abs(sh) / (g || 1), st: t.staerke ?? 1 });
  }

  // Passen zwei benachbarte Transienten zusammen? (A vor B) → Ränder oder null
  const passt = (A, B) => {
    const G = B.o - A.p;                         // Platz zwischen Spitze A und Beginn B (Quelle)
    if (!(G > 0.002)) return Math.abs(B.sh - A.sh) < 1e-6 && B.o >= A.o ? { nach: 0, vor: 0, gleich: true } : null;
    const dSh = B.sh - A.sh;
    for (const f of [1, 0.5, 0]) {
      let nach = Math.max(MINRAND, Math.min(NACH, G * 0.3) * f), vor = Math.max(MINRAND, Math.min(VOR, G * 0.25) * f);
      if (nach + vor > G * 0.9) { nach = vor = G * 0.3; }
      const Ls = G - nach - vor, Ld = Ls + dSh;
      if (Ld > 0.001 && Ls / Ld >= RMIN && Ls / Ld <= RMAX) return { nach, vor };
      if (Math.abs(dSh) < 1e-6) return { nach, vor };
    }
    return null;
  };

  const fest = [];
  for (const c of kand) {
    for (;;) {
      const L = fest[fest.length - 1];
      if (!L || passt(L, c)) { fest.push(c); break; }
      // zuerst die Ausweich-Linie versuchen
      if (c.alt != null && c.prio !== Infinity) {
        const probe = { ...c, sh: c.alt, alt: null };
        if (passt(L, probe)) { fest.push(probe); break; }
      }
      if (c.prio <= L.prio) break;            // c bleibt frei
      fest.pop();                              // die schwächere davor bleibt frei, neu prüfen
    }
  }

  // Anker bauen
  const A = [];
  const push = (src, dst, typ, i) => {
    const l = A[A.length - 1];
    if (l && (src <= l.src + 1e-6 || dst <= l.dst + 1e-6)) {
      if (Math.abs(src - l.src) < 1e-6 && Math.abs(dst - l.dst) < 1e-6) return;
      return;   // nie rückwärts
    }
    A.push({ src, dst, typ, i });
  };
  for (let k = 0; k < fest.length; k++) {
    const c = fest[k], P = fest[k - 1], N = fest[k + 1];
    const links = P ? passt(P, c) : null, rechts = N ? passt(c, N) : null;
    const vor = P ? (links ? links.vor : MINRAND) : VOR;
    const nach = N ? (rechts ? rechts.nach : MINRAND) : NACH;
    const a0 = Math.max(0, c.o - vor);
    if (k === 0) {
      // Anfang: 0 → 0, wenn das Stück davor die Verschiebung gut aufnehmen kann
      const d0 = a0 + c.sh;
      if (a0 > 0.03 && d0 > 0.01 && a0 / d0 >= 0.5 && a0 / d0 <= 2) push(0, 0, 'start', -1);
    }
    if (!(P && links && links.gleich)) push(a0, a0 + c.sh, 'vor', c.i);
    push(c.o, c.o + c.sh, 'onset', c.i);
    push(c.p, c.p + c.sh, 'spitze', c.i);
    if (!(N && rechts && rechts.gleich)) push(c.p + nach, c.p + nach + c.sh, 'nach', c.i);
  }
  A.pins = fest.map(c => ({ i: c.i, peak: c.p, onset: c.o, ziel: c.p + c.sh, verschiebung: c.sh, staerke: c.st }));
  A.raster = g;
  A.frei = kand.length - fest.length;
  return A;
}

// ------------------------------------------------------------------ Abbildung Quelle ↔ Ziel

function interp(anker, t, von, nach) {
  if (!anker || !anker.length) return t;
  const n = anker.length;
  if (t <= anker[0][von]) return t + (anker[0][nach] - anker[0][von]);
  if (t >= anker[n - 1][von]) return t + (anker[n - 1][nach] - anker[n - 1][von]);
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (anker[m][von] <= t) lo = m; else hi = m; }
  const a = anker[lo], b = anker[hi], f = (t - a[von]) / (b[von] - a[von]);
  return a[nach] + f * (b[nach] - a[nach]);
}
export function abbilden(anker, t) { return interp(anker, t, 'src', 'dst'); }
export function zurueck(anker, t) { return interp(anker, t, 'dst', 'src'); }

// ------------------------------------------------------------------ Warp (WSOLA mit festen Ankern)

const FADE = new Map();
function fadeTab(D) {
  let w = FADE.get(D);
  if (!w) {
    w = new Float32Array(D);
    for (let u = 0; u < D; u++) { const c = Math.cos(0.5 * Math.PI * u / D); w[u] = c * c; }
    FADE.set(D, w);
    if (FADE.size > 400) FADE.delete(FADE.keys().next().value);
  }
  return w;
}

export function warp(x, sr, anker, opt = {}) {
  const X = x.length;
  const nOut = opt.laenge ? Math.round(opt.laenge) : X;
  const y = new Float32Array(nOut);
  const H = Math.max(16, Math.round((opt.hop ?? 0.015) * sr));        // Rahmenabstand (Fenster = 2·H)
  const tol = Math.max(4, Math.round((opt.toleranz ?? 0.008) * sr));  // Suchbereich ±
  const minAbst = Math.max(2, Math.round(0.001 * sr));

  // Anker in Proben, bereinigt (in beiden Spalten streng steigend)
  let A = [];
  for (const a of anker || []) {
    // ganzzahlige Lage; Quelle über die (gerundete) Verschiebung → gleiche Verschiebung = exakte 1:1-Kopie
    const d = Math.round(a.dst * sr), s = d - Math.round((a.dst - a.src) * sr);
    if (!Number.isFinite(s) || !Number.isFinite(d)) continue;
    const l = A[A.length - 1];
    if (l && (s < l.s + minAbst || d < l.d + minAbst)) continue;
    A.push({ s, d });
  }
  if (!A.length) { y.set(x.subarray(0, Math.min(X, nOut))); return y; }
  // Anfang/Ende sanft einfangen, wenn das ohne starke Dehnung geht (dann geht vorne/hinten nichts verloren)
  const f = A[0];
  if (f.d > 0 && f.s > 0.05 * sr && f.s / f.d >= 0.5 && f.s / f.d <= 2) A.unshift({ s: 0, d: 0 });
  const z = A[A.length - 1], restS = X - z.s, restD = nOut - z.d;
  if (restS > 0.2 * sr && restD > 0.2 * sr && restS / restD >= 0.5 && restS / restD <= 2) A.push({ s: X, d: nOut });

  // Rahmen: Mitten im Ziel, Quelle nominal über die Karte; Anker und 1:1-Stücke fest
  const C = [], S = [], F = [];
  for (let j = 0; j < A.length - 1; j++) {
    const a = A[j], b = A[j + 1], ld = b.d - a.d, ls = b.s - a.s, r = ls / ld;
    const kopie = Math.abs(ls - ld) < 0.5;
    const m = kopie ? 1 : Math.max(2, Math.round(ld / H));
    for (let k = 0; k < m; k++) {
      const c = k === 0 ? a.d : Math.round(a.d + k * ld / m);
      C.push(c); S.push(k === 0 ? a.s : a.s + (c - a.d) * r); F.push(k === 0 || kopie ? 1 : 0);
    }
  }
  C.push(A[A.length - 1].d); S.push(A[A.length - 1].s); F.push(1);
  const nF = C.length;
  const P = new Int32Array(nF);
  for (let i = 0; i < nF; i++) P[i] = Math.round(S[i]);

  // grobe Suche auf 4-fach verkleinertem Signal, dann fein
  const q = sr >= 32000 ? 4 : 2;
  const nd = Math.floor(X / q);
  const xd = new Float32Array(nd);
  for (let k = 0, i = 0; k < nd; k++) { let s = 0; for (let e = i + q; i < e; i++) s += x[i]; xd[k] = s / q; }
  const E2 = new Float64Array(nd + 1);
  for (let k = 0; k < nd; k++) E2[k + 1] = E2[k] + xd[k] * xd[k];
  const rd = k => (k >= 0 && k < nd ? xd[k] : 0);
  const rx = k => (k >= 0 && k < X ? x[k] : 0);
  const eD = (a, len) => { const a0 = klemm(a, 0, nd), a1 = klemm(a + len, 0, nd); return E2[a1] - E2[a0]; };

  // Ähnlichkeit: Vorlage T (Start ta, Länge len) gegen Kandidat (Start ca) – grob/fein
  function nccD(ta, ca, len) {
    let s = 0, et = 0;
    for (let u = 0; u < len; u++) { const t = rd(ta + u); s += t * rd(ca + u); et += t * t; }
    return s / Math.sqrt(et * eD(ca, len) + 1e-20);
  }
  function nccX(ta, ca, len, step) {
    let s = 0, et = 0, ec = 0;
    for (let u = 0; u < len; u += step) { const t = rx(ta + u), c = rx(ca + u); s += t * c; et += t * t; ec += c * c; }
    return s / Math.sqrt(et * ec + 1e-20);
  }

  for (let i = 1; i < nF - 1; i++) {
    if (F[i]) continue;
    const D = C[i] - C[i - 1], D2 = C[i + 1] - C[i];
    const nom = P[i];
    const tl = Math.min(tol, Math.floor(D * 0.9));
    if (tl < 2 || D < 8) continue;
    const zweiseitig = F[i + 1] === 1;
    // Vorlage 1: natürliche Fortsetzung des vorigen Rahmens (Ziel C[i-1]..C[i]); Kandidat liest ab cand − D
    // Vorlage 2 (vor festem Rahmen): Vorgeschichte des nächsten Rahmens (C[i]..C[i+1]); Kandidat liest ab cand
    const len1 = Math.floor(D / q), len2 = Math.floor(D2 / q);
    let best = -Infinity, bc = nom;
    for (let dl = -tl; dl <= tl; dl += q) {
      const cand = nom + dl;
      let sc = nccD(Math.floor(P[i - 1] / q), Math.floor((cand - D) / q), len1);
      if (zweiseitig) sc += nccD(Math.floor((P[i + 1] - D2) / q), Math.floor(cand / q), len2);
      if (sc > best) { best = sc; bc = cand; }
    }
    best = -Infinity;
    let fein = bc;
    const st = sr > 24000 ? 2 : 1;
    for (let dl = -q; dl <= q; dl++) {
      const cand = bc + dl;
      if (Math.abs(cand - nom) > tl) continue;
      let sc = nccX(P[i - 1], cand - D, D, st);
      if (zweiseitig) sc += nccX(P[i + 1] - D2, cand, D2, st);
      if (sc > best) { best = sc; fein = cand; }
    }
    P[i] = fein;
  }

  // Zusammensetzen: zwischen zwei Rahmenmitten cos²/sin² (Summe exakt 1) – gleiche Lage ⇒ exakte Kopie
  const c0 = C[0];
  for (let t = 0; t < Math.min(c0, nOut); t++) y[t] = rx(P[0] + t - c0);
  for (let i = 0; i < nF - 1; i++) {
    const a = C[i], D = C[i + 1] - a;
    if (D <= 0) continue;
    const w = fadeTab(D), pa = P[i] - a, pb = P[i + 1] - C[i + 1];
    const t1 = Math.min(a + D, nOut);
    if (pa === pb) { for (let t = Math.max(0, a); t < t1; t++) y[t] = rx(pa + t); continue; }
    for (let t = Math.max(0, a); t < t1; t++) { const g = w[t - a]; y[t] = g * rx(pa + t) + (1 - g) * rx(pb + t); }
  }
  const cl = C[nF - 1];
  for (let t = Math.max(0, cl); t < nOut; t++) y[t] = rx(P[nF - 1] + t - cl);
  return y;
}

// ------------------------------------------------------------------ Tempo schätzen

export function bpmSchaetzen(tr, opt = {}) {
  const lo = opt.min ?? 70, hi = opt.max ?? 180;
  const t = (tr || []).filter(e => (e.staerke ?? 1) >= 0.1);
  if (t.length < 8) return { bpm: opt.standard ?? 120, offset: 0, guete: 0 };
  const ph = (T) => {
    let re = 0, im = 0, w = 0;
    for (const e of t) { const a = 2 * Math.PI * e.peak / T, s = e.staerke ?? 1; re += s * Math.cos(a); im += s * Math.sin(a); w += s; }
    return { r: Math.hypot(re, im) / w, phi: Math.atan2(im, re) };
  };
  let best = null;
  for (let bpm = lo; bpm <= hi; bpm += 0.05) {
    const T = 60 / bpm;
    const r1 = ph(T), r2 = ph(T / 2), r4 = ph(T / 4);
    const sc = r1.r + 0.6 * r2.r + 0.3 * r4.r;
    if (!best || sc > best.sc) best = { sc, bpm, phi: r2.phi, T };
  }
  // Versatz auf die Achtel-Phase, zurück auf den Schlag gelegt
  let off = ((best.phi / (2 * Math.PI)) * (best.T / 2));
  off = ((off % best.T) + best.T) % best.T;
  return { bpm: Math.round(best.bpm * 100) / 100, offset: off, guete: best.sc / 1.9 };
}
