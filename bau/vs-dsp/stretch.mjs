// stretch.mjs — VS5b „Dehnen“ (DSP-Kern, eigenständig, ohne Abhängigkeiten, ohne DOM)
//
// Folgt einer Zeitkarte warp.map ({src, dst} in Sekunden, streng steigend, wie makeWarp() aus marks.mjs).
// Je Abschnitt zwischen zwei Marken: die ersten 20 ms nach der Marke werden unverändert kopiert (Transient fest),
// der Rest per WSOLA auf die Ziellänge gebracht (Tonhöhe bleibt; Suche ±12 ms, grob auf ~12 kHz, fein auf voller
// Rate, normierte Kreuzkorrelation). Faktor außerhalb 0,5–2,0 → Abschnitt nur verschoben, Warnung.
// Übergang zwischen Abschnitten 5 ms, endet an der Marke (gleichleistungsgemäß; bei hoher Korrelation gleichspannungs-
// gemäß, damit kein Pegelbuckel entsteht). Unveränderte Karte → Ausgabe bitgleich. Deterministisch (cachebar).
//
// API:
//   stretch(x, sr, warp, o?) → {y: Float32Array, warnings: [{seg, ratio, t}], segs: [{s0, s1, d0, d1, mode}]}
//       o.lock 0,02 s · o.xfade 0,005 s · o.win 0,04 s (WSOLA-Fenster) · o.search 0,012 s · o.minRatio 0,5 · o.maxRatio 2
//       o.endAlign (false; VS5b-Einbau: Standard aus): letzter WSOLA-Rahmen fest auf die nächste Marke ausgerichtet. Seit die letzten
//       Rahmen auch am Abschnittsende gesucht werden, ist ohne Ausrichtung der Einbruch an den Nähten kleiner (196 Hz: 0,9 statt 3,2 dB;
//       Klickfolge mit Ton, 250-ms-Abschnitte: 2,0 statt 5,4 dB)
//   cacheKey(warp, o?, extra?) → String (FNV-1a über Karte, Optionen und z. B. Take-ID/Länge) für den Render-Cache
//   srcText() → Quelltext „(function(){…})()“ für Worker/Skript

function factory() {
  'use strict';
  const ok = v => (v === v && v < 1e30 && v > -1e30 ? v : 0);

  function stretch(x0, sr, warp, o = {}) {
    let x = x0;
    for (let i = 0; i < x0.length; i++) if (!(x0[i] === x0[i]) || x0[i] > 1e30 || x0[i] < -1e30) { x = Float32Array.from(x0, ok); break; }
    const n = x.length;
    const lock = Math.round((o.lock == null ? 0.02 : o.lock) * sr), X = Math.max(1, Math.round((o.xfade == null ? 0.005 : o.xfade) * sr));
    const Hs = Math.max(8, Math.round((o.win == null ? 0.04 : o.win) * sr / 2)), W = 2 * Hs, Dl = Math.round((o.search == null ? 0.012 : o.search) * sr);
    const rMin = o.minRatio == null ? 0.5 : o.minRatio, rMax = o.maxRatio == null ? 2 : o.maxRatio, endAlign = o.endAlign === true;
    const S = Array.from(warp.src, t => Math.min(n, Math.max(0, Math.round(t * sr))));
    const D = Array.from(warp.dst, t => Math.max(0, Math.round(t * sr)));
    S[S.length - 1] = n;                                   // Ende der Quelle
    const outLen = D[D.length - 1];
    const y = new Float32Array(outLen), warnings = [], segs = [];
    let ident = outLen === n; for (let k = 0; k < S.length && ident; k++) if (S[k] !== D[k]) ident = false;
    if (ident) { y.set(x); return {y, warnings, segs: [{s0: 0, s1: n, d0: 0, d1: n, mode: 'copy'}]}; }

    // Hilfsdaten (einmal je Aufruf): Fenster, Präfixsummen der Energie, dezimiertes Signal für die Grobsuche
    const w = new Float64Array(W); for (let m = 0; m < W; m++) w[m] = 0.5 - 0.5 * Math.cos(2 * Math.PI * m / W);
    const cum = new Float64Array(n + 1); for (let i = 0; i < n; i++) cum[i + 1] = cum[i] + x[i] * x[i];
    const dec = Math.max(1, Math.round(sr / 12000)), nd = Math.floor(n / dec), xd = new Float32Array(nd), cumd = new Float64Array(nd + 1);
    for (let j = 0; j < nd; j++) { let s = 0; for (let q = 0; q < dec; q++) s += x[j * dec + q]; xd[j] = s / dec; cumd[j + 1] = cumd[j] + xd[j] * xd[j]; }
    const Hd = Math.max(4, Math.floor(Hs / dec)), Dd = Math.ceil(Dl / dec) + 1;

    const best = (tmpl, tau, lo, hi) => {     // bestes i in [tau−Δ, tau+Δ] ∩ [lo, hi] zur Vorlage x[tmpl … tmpl+Hs)
      let a = Math.max(lo, tau - Dl), b = Math.min(hi, tau + Dl);
      // VS5b-Einbau: liegt das Suchfenster ganz hinter dem Abschnittsende (letzte Rahmen), wird im letzten erlaubten Stück gesucht
      // statt ohne Suche festgelegt (vorher: Phasensprung → bis −5,4 dB Einbruch vor jeder Marke bei kurzen Abschnitten)
      if (b <= a) { if (tau > hi) { b = hi; a = Math.max(lo, hi - 2 * Dl); } else { a = lo; b = Math.min(hi, lo + 2 * Dl); } }
      // VS5b-fix: auch ein nur angeschnittenes Suchfenster (wenige Samples vor hi bzw. nach lo) auf volle Breite 2Δ bringen – vorher
      // fand der vorletzte Rahmen dort keine passende Periode (ρ −0,25 → −5 dB Loch ~25 ms vor der Marke)
      else if (b - a < 2 * Dl) { if (b === hi) a = Math.max(lo, hi - 2 * Dl); else if (a === lo) b = Math.min(hi, lo + 2 * Dl); }
      if (b <= a) return Math.min(hi, Math.max(lo, tau));
      // VS5b-Einbau: stille Vorlage (digitale Stille) → natürliche Stelle statt des ersten Treffers (sonst holt die Suche den
      // Ausklang der vorigen Note in die Stille, −70-dB-Reste)
      if (cum[Math.min(n, tmpl + Hs)] - cum[tmpl] < 1e-10 * Hs) return Math.min(b, Math.max(a, tau));
      // grob
      const td = Math.floor(tmpl / dec); let bc = -1, bs = -Infinity;
      if (td + Hd <= nd) {
        for (let c = Math.floor(a / dec); c <= Math.floor(b / dec); c++) {
          if (c < 0 || c + Hd > nd) continue;
          let s = 0; for (let m = 0; m < Hd; m++) s += xd[td + m] * xd[c + m];
          const sc = s / Math.sqrt(cumd[c + Hd] - cumd[c] + 1e-12);
          if (sc > bs) { bs = sc; bc = c; }
        }
      }
      // fein
      const fa = bc < 0 ? a : Math.max(a, bc * dec - dec), fb = bc < 0 ? b : Math.min(b, bc * dec + dec);
      let bi = Math.min(hi, Math.max(lo, tau)), bf = -Infinity;
      for (let i = fa; i <= fb; i++) {
        let s = 0; for (let m = 0; m < Hs; m++) s += x[tmpl + m] * x[i + m];
        const sc = s / Math.sqrt(cum[i + Hs] - cum[i] + 1e-12);
        if (sc > bf) { bf = sc; bi = i; }
      }
      return bi;
    };

    // wie best(), aber zusätzlich soll die zweite Hälfte des Rahmens in den Rahmen bei `next` übergehen
    const best2 = (tmpl, next, tau, lo, hi) => {
      let a = Math.max(lo, tau - Dl), b = Math.min(hi, tau + Dl, n - W);
      if (b <= a) { const h2 = Math.min(hi, n - W); if (tau > h2) { b = h2; a = Math.max(lo, h2 - 2 * Dl); } else { a = lo; b = Math.min(h2, lo + 2 * Dl); } }
      if (b <= a) return Math.min(hi, Math.max(lo, tau));
      let bi = Math.min(hi, Math.max(lo, tau)), bf = -Infinity;
      const ok2 = next + Hs <= n;
      if (cum[Math.min(n, tmpl + Hs)] - cum[tmpl] < 1e-10 * Hs && (!ok2 || cum[next + Hs] - cum[next] < 1e-10 * Hs)) return Math.min(b, Math.max(a, tau));
      for (let i = a; i <= b; i++) {
        let s1 = 0, s2 = 0;
        for (let m = 0; m < Hs; m += 2) { s1 += x[tmpl + m] * x[i + m]; if (ok2) s2 += x[next + m] * x[i + Hs + m]; }
        const sc = s1 / Math.sqrt(cum[i + Hs] - cum[i] + 1e-12) + s2 / Math.sqrt(cum[i + W] - cum[i + Hs] + 1e-12);
        if (sc > bf) { bf = sc; bi = i; }
      }
      return bi;
    };

    let jIn = 0; for (let i = 1; i < n; i++) { const d = Math.abs(x[i] - x[i - 1]); if (d > jIn) jIn = d; }
    const xf = new Float32Array(2 * X + Math.round(0.012 * sr) + 2 * Math.round(0.005 * sr) + 2);
    let prev = null;
    for (let k = 0; k + 1 < S.length; k++) {
      const s0 = S[k], s1 = S[k + 1], d0 = D[k], d1 = Math.min(outLen, D[k + 1]), sl = s1 - s0, dl = d1 - d0;
      if (dl <= 0) continue;
      let mode;
      if (sl === dl) mode = 'copy';
      else {
        const r = sl > 0 ? dl / sl : Infinity;
        if (!(r >= rMin && r <= rMax)) { mode = 'shift'; warnings.push({seg: k, ratio: +r.toFixed(3), t: +(s0 / sr).toFixed(4)}); }
        else if (sl - lock < W + 2 || dl - lock < W) mode = 'shift';
        else mode = 'wsola';
      }
      const seg = {s0, s1, d0, d1, mode}; segs.push(seg);
      if (mode === 'copy') for (let i = 0; i < dl; i++) y[d0 + i] = x[s0 + i];
      else if (mode === 'shift') {
        const m1 = Math.min(sl, dl);
        for (let i = 0; i < m1; i++) y[d0 + i] = x[s0 + i];
        if (dl > sl) {   // Lücke (VS5b-Einbau): Schleife aus dem Ende des Abschnitts wie renderSlices (VS5a) – Periode mit der
          // besten Korrelation 5–40 ms; je Runde blendet die Naht ≤ 2 ms von der echten Fortsetzung in den Schleifenanfang
          // (vorher: Spiegelung mit Ausblendung → Loch bis −17 dB und Knick an jeder Umkehr)
          const Wc = Math.max(1, Math.round(0.005 * sr)), pmin = Math.max(1, Math.round(0.005 * sr)), pmax = Math.min(Math.round(0.04 * sr), sl - Wc);
          let bR = -2, Lp = Math.max(1, sl);
          for (let L = pmin; L <= pmax; L++) {
            let ab = 0, aa = 0, bb = 0;
            for (let k = 0; k < Wc; k++) { const u = x[s1 - Wc + k], v = x[s1 - L - Wc + k]; ab += u * v; aa += u * u; bb += v * v; }
            const r = ab / Math.sqrt(aa * bb + 1e-20); if (r > bR) { bR = r; Lp = L; }
          }
          const av = Math.max(1, Math.min(Math.round(0.002 * sr), Lp)), len = dl - sl;
          for (let i = 0; i < len; i++) {
            const k = i % Lp, q = s1 - Lp + k; let v = q >= 0 ? x[q] : 0;
            if (k < av && s1 + k < n) {
              const u = (k + 0.5) / av; let gi, go;
              if (bR > 0.5) { gi = 0.5 - 0.5 * Math.cos(Math.PI * u); go = 1 - gi; } else { gi = Math.sin(0.5 * Math.PI * u); go = Math.cos(0.5 * Math.PI * u); }
              v = x[s1 + k] * go + v * gi;
            }
            y[d0 + sl + i] = v;
          }
        }
      } else {
        for (let i = 0; i < lock; i++) y[d0 + i] = x[s0 + i];          // Transient fest (bitgleich)
        const a = s0 + lock, b = s1, p = d0 + lock, q = d1, rr = (q - p) / (b - a);
        const lo = Math.max(0, s0), hi = b - W;
        // Rahmen 0: natürliche Fortsetzung des festen Transienten. Letzter Rahmen jf: fest auf die Marke ausgerichtet
        // (Ausgabe q ↔ Quelle s1), damit der Übergang zur nächsten Marke phasengleich ist; Rahmen jf−1 wird zu beiden
        // Seiten passend gesucht (Fortsetzung von jf−2 und Übergang in jf).
        const jf = Math.ceil((q - p) / Hs), ijf = s1 - (q - (p - Hs + jf * Hs));
        let iPrev = a - Hs;
        for (let j = 0; j <= jf; j++) {
          const oj = p - Hs + j * Hs;
          let ij;
          if (j === 0) ij = Math.max(0, a - Hs);
          else if (j === jf && endAlign) ij = Math.max(0, ijf);
          else if (j === jf - 1 && endAlign) ij = best2(Math.min(iPrev + Hs, n - Hs), Math.max(0, ijf), Math.round(a - Hs + j * Hs / rr), lo, Math.max(lo, hi));
          else ij = best(Math.min(iPrev + Hs, n - Hs), Math.round(a - Hs + j * Hs / rr), lo, Math.max(lo, hi));
          for (let m = 0; m < W; m++) {
            const pos = oj + m; if (pos < p) continue; if (pos >= q) break;
            const src = ij + m; y[pos] += w[m] * (src < n ? x[src] : 0);
          }
          iPrev = ij;
        }
      }
      // Übergang an der Marke (endet bei d0, also vor dem festen Transienten)
      if (prev && !(prev.mode === 'copy' && prev.d0 - prev.s0 === d0 - s0)) {   // nahtlos, wenn der vorige Abschnitt mit gleichem Versatz kopiert ist
        // VS5b-fix: Die Phasenlage an der Marke ist fest (bitgleicher Anschlag ab s0), davor ist die Quelle frei. An der Naht treffen sich
        // zwei verschieden verschobene Fassungen desselben Tons (Rest-Versatz bis ½ Periode). Vorher endete die Blende immer genau an der
        // Marke und war fest gleichspannungs- bzw. gleichleistungsgemäß → je nach Lage fiel ein Pulsschlag der Periode aus (Abstand
        // P + Versatz) und es löschte sich aus: bis −7,8 dB im 5-ms-Fenster (M-EINBRUCH). Jetzt:
        // (1) Die 5-ms-Blende darf bis 12 ms vor der Marke liegen (dahinter läuft die Quelle unverändert in die Marke). Gewählt wird die
        //     Lage, bei der das leiseste 5-ms-Fenster der Naht am lautesten ist (die Pulse rücken zusammen statt auseinander).
        // (2) Fehlt in der Blende danach noch Energie gegenüber einer gleichphasigen Blende, hebt eine Glocke (Gipfel G ≤ 4) sie genau so
        //     weit an. Keine Auslöschung → G = 1. Die Anhebung erzeugt keine steileren Flanken als der Eingang hat (sonst kleineres G).
        const len = Math.min(X, d0), W5 = Math.max(1, Math.round(0.005 * sr)), stp = Math.max(1, Math.round(0.0005 * sr));
        const lim = Math.max(prev.d0 + Math.min(lock, d0 - prev.d0 - len), W5);   // fester Teil der vorigen Scheibe bleibt unberührt (kurze Scheibe: wie bisher)
        // Blende ab xa mit Quelle ab sb − len: Kosinus-Blende in xf[0…len), Glocken-Gipfel G für die fehlende Energie
        const fade = (xa, sb) => {
          let saa = 0, sbb = 0, d2 = 0, dc = 0, c2 = 0, want = 0;
          for (let i = 0; i < len; i++) { const A = y[xa + i], B = x[sb - len + i]; saa += A * A; sbb += B * B; }
          const ga = Math.sqrt(saa / len), gb = Math.sqrt(sbb / len);
          for (let i = 0; i < len; i++) {
            const u = (i + 0.5) / len, gi = 0.5 - 0.5 * Math.cos(Math.PI * u), go = 1 - gi, m = y[xa + i] * go + x[sb - len + i] * gi, c = m * Math.sin(Math.PI * u) ** 2, d = m - c;
            xf[i] = m; want += (go * ga + gi * gb) ** 2; d2 += d * d; dc += d * c; c2 += c * c;
          }
          if (!(d2 + 2 * dc + c2 < want * 0.98 && c2 > 1e-20)) return 1;
          const disc = dc * dc - c2 * (d2 - want);
          return Math.min(4, Math.max(1, disc > 0 ? (-dc + Math.sqrt(disc)) / c2 : 4));
        };
        if (len > 0 && s0 - len >= 0 && d0 - len >= lim) {
          let bestD = 0, bestV = -Infinity;
          for (let dl2 = 0; dl2 <= Math.round(0.012 * sr); dl2 += stp) {
            const xa = d0 - len - dl2, sb = s0 - dl2; if (xa < lim || sb - len < 0) break;
            const G = fade(xa, sb);
            // Ausgabe über [xa − W5, d0 + W5): y, Blende, Quelle (ab d0 der feste Teil); leisestes 5-ms-Fenster
            const z0 = xa - W5, zn = Math.min(d0 + W5, d0 + n - s0) - z0, zz = xf.subarray(len);
            for (let i = 0; i < zn; i++) {
              const t = z0 + i; let v;
              if (t < xa) v = y[t]; else if (t < xa + len) { const u = (t - xa + 0.5) / len; v = xf[t - xa] * (1 + (G - 1) * Math.sin(Math.PI * u) ** 2); } else v = x[s0 - (d0 - t)];
              zz[i] = v * v;
            }
            let e = 0, mn = Infinity; for (let i = 0; i < W5; i++) e += zz[i];
            for (let i = W5; i <= zn; i++) { if ((i - W5) % stp === 0) mn = Math.min(mn, e); if (i < zn) e += zz[i] - zz[i - W5]; }
            if (mn > bestV * 1.02 + 1e-30) { bestV = mn; bestD = dl2; }
          }
          const xa = d0 - len - bestD, sb = s0 - bestD;
          for (let t = xa + len; t < d0; t++) y[t] = x[s0 - (d0 - t)];
          let G = fade(xa, sb);
          for (let al = 1; al >= 0; al -= 0.25) {
            const Gx = 1 + al * (G - 1); let prv = xa > 0 ? y[xa - 1] : 0, jm = 0;
            for (let i = 0; i < len; i++) { const u = (i + 0.5) / len, v = xf[i] * (1 + (Gx - 1) * Math.sin(Math.PI * u) ** 2); jm = Math.max(jm, Math.abs(v - prv)); prv = v; }
            if (Math.max(jm, Math.abs(x[sb] - prv)) <= jIn || al <= 0) { G = Gx; break; }
          }
          for (let i = 0; i < len; i++) { const u = (i + 0.5) / len; y[xa + i] = xf[i] * (1 + (G - 1) * Math.sin(Math.PI * u) ** 2); }
        }
      }
      prev = seg;
    }
    return {y, warnings, segs};
  }

  function cacheKey(warp, o = {}, extra = '') {
    let h = 0x811c9dc5;
    const add = v => { const s = String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } h ^= 44; h = Math.imul(h, 0x01000193) >>> 0; };
    add(extra); add(JSON.stringify(o)); for (const v of warp.src) add(v.toFixed(6)); add('|'); for (const v of warp.dst) add(v.toFixed(6));
    return 'vs5b-' + h.toString(16).padStart(8, '0') + '-' + warp.src.length;
  }

  return {stretch, cacheKey, VERSION: 'vs5b-stretch-5'};
}

const api = factory();
export const {stretch, cacheKey, VERSION} = api;
export function srcText() { return '(' + factory.toString() + ')()'; }
export default api;
