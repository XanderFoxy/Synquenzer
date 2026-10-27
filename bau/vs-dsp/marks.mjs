// marks.mjs — VS5a „Marken & Scheiben“ (DSP-Kern, eigenständig, ohne Abhängigkeiten, ohne DOM)
//
// API (Zeiten in Sekunden als Zahlen, Audio als Float32Array):
//   detectMarks(x, sr, o?) → [{t, i, conf, src:'onset'|'start'|'pitch', word, voiced}]  (sortiert)
//       Silben-Marken aus Spektralfluss (SuperFlux, Vibrato-fest) + Pegelanstieg, Aktivität mit Hysterese
//       (Boden + 10 dB an, + 6 dB aus), Stimmhaftigkeit/Tonhöhe (YIN auf ~12 kHz), Tonwechsel-Marken bei Bindung.
//       o.minGap (0,07 s), o.onDb (10), o.offDb (6), o.pitch (true)
//   quantizeMarks(times, o) → {times: Float64Array, grid, swing, moved: Uint8Array}
//       Logik wie quantizeNoteSet()/KeyDetect.quantize der App: Raster '1/4' '1/8' '1/16' '1/8T' '1/16T' '1/32'
//       oder 'auto' (KeyDetect.detectGrid, hier als Nachbau; in der App o.detectGrid = KeyDetect.detectGrid geben);
//       o.bpm, o.t0 (s des Schlags 0), o.strength 0…1, o.swing .5….75, o.catch (Fangfenster, Standard 0,4 Raster),
//       o.minGap (0,01 s): Reihenfolge bleibt immer erhalten.
//   detectGrid(notes [{t (Schläge)}], {bpm}) → {grid, swing, fit, sure}   (Nachbau von KeyDetect.detectGrid)
//   makeWarp(src, dst, lenSrc, lenDst?) → {v:1, src:Float64Array, dst:Float64Array}  (inkl. 0 und Ende, streng steigend)
//   warpTime(w, t) · warpInverse(w, t) · warpIsIdentity(w) · warpToJSON(w) · warpFromJSON(j)
//   sliceCuts(x, sr, onsets, o?) → Int32Array   Schnitt 3 ms vor dem Einsatz am Nulldurchgang (±2 ms)
//   renderSlices(x, sr, onsets, targets, o?) → Float32Array   Modus „Scheiben“: nur verschieben, Lücke = Ausklang
//       der vorigen Scheibe, Übergang 5 ms gleichleistungsgemäß (endet am Einsatz), Anschläge bitgleich
//   assignLyrics(text, nMarks) → {labels: string[nMarks], extra: string[]}   „Lie-be ist ein Feu-er“: eine Silbe je Marke
//   srcText() → Quelltext „(function(){…})()“ für Worker/Skript

function factory() {
  'use strict';
  const TAU = 2 * Math.PI;
  const ok = v => (v === v && v < 1e30 && v > -1e30 ? v : 0);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function FFT(n) {
    const rev = new Uint32Array(n), cs = new Float64Array(n >> 1), sn = new Float64Array(n >> 1);
    let bits = 0; while ((1 << bits) < n) bits++;
    for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
    for (let i = 0; i < n >> 1; i++) { cs[i] = Math.cos(TAU * i / n); sn[i] = -Math.sin(TAU * i / n); }
    return function fwd(re, im) {
      for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
      for (let size = 2; size <= n; size <<= 1) {
        const half = size >> 1, step = n / size;
        for (let i = 0; i < n; i += size) for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half, c = cs[k], s = sn[k], tr = re[l] * c - im[l] * s, ti = re[l] * s + im[l] * c;
          re[l] = re[j] - tr; im[l] = im[j] - ti; re[j] += tr; im[j] += ti;
        }
      }
    };
  }
  const pct = (arr, q) => { const a = Array.from(arr).sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.floor(q * (a.length - 1))))] : 0; };

  // ---------- Stimmhaftigkeit + Tonhöhe (YIN auf dezimiertem Signal, 10-ms-Raster) ----------
  function voicing(x, sr, active, hop) {
    const dec = Math.max(1, Math.round(sr / 12000)), fs = sr / dec, n = Math.floor(x.length / dec);
    const xd = new Float32Array(n);
    // Tiefpass (2 × Biquad, Butterworth 4. Ordnung) bei 0,4·fs/2 … dann dezimieren
    const fc = 0.42 * fs / 2, w = TAU * fc / sr, cw = Math.cos(w), sw = Math.sin(w);
    const qs = [0.5412, 1.3066], st = [0, 0, 0, 0];
    const co = qs.map(q => { const al = sw / (2 * q), a0 = 1 + al; return [(1 - cw) / 2 / a0, (1 - cw) / a0, (1 - cw) / 2 / a0, -2 * cw / a0, (1 - al) / a0]; });
    let j = 0;
    for (let i = 0; i < x.length; i++) {
      let v = ok(x[i]);
      for (let s = 0; s < 2; s++) { const c = co[s], y = c[0] * v + st[2 * s]; st[2 * s] = c[1] * v - c[3] * y + st[2 * s + 1]; st[2 * s + 1] = c[2] * v - c[4] * y; v = y; }
      if (i % dec === 0 && j < n) xd[j++] = v;
    }
    const W = Math.round(0.03 * fs), tMin = Math.max(2, Math.floor(fs / 1000)), tMax = Math.ceil(fs / 70);
    const hv = Math.round(0.01 * sr), nV = Math.ceil(x.length / hv);
    const f0 = new Float32Array(nV), ap = new Float32Array(nV).fill(1), d = new Float64Array(tMax + 2);
    for (let v = 0; v < nV; v++) {
      const fa = Math.round(v * hv / hop); if (!active[Math.min(active.length - 1, fa)]) continue;
      const c = Math.round(v * hv / dec), a = c - (W >> 1);
      if (a < 0 || a + W + tMax + 1 >= n) continue;
      d[0] = 0;
      for (let tau = 1; tau <= tMax + 1; tau++) { let s = 0; for (let k = 0; k < W; k++) { const e = xd[a + k] - xd[a + k + tau]; s += e * e; } d[tau] = s; }
      let run = 0, best = -1, bv = 1e9;
      for (let tau = 1; tau <= tMax + 1; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
      for (let tau = tMin; tau <= tMax; tau++) {
        if (d[tau] < 0.15) { while (tau + 1 <= tMax && d[tau + 1] < d[tau]) tau++; best = tau; bv = d[tau]; break; }
        if (d[tau] < bv) { bv = d[tau]; best = tau; }
      }
      if (best < 0) continue;
      let tf = best;
      if (best > 1 && best < tMax + 1) { const y0 = d[best - 1], y1 = d[best], y2 = d[best + 1], den = y0 - 2 * y1 + y2; if (den > 0) tf = best + 0.5 * (y0 - y2) / den; }
      ap[v] = bv; f0[v] = fs / tf;
    }
    return {f0, ap, hv};
  }

  // ---------- Marken finden ----------
  function detectMarks(x, sr, o = {}) {
    const n = x.length, hop = Math.max(1, Math.round(sr * 0.005));
    let F = 256; while (F < sr * 0.023) F <<= 1;
    const nFr = Math.ceil(n / hop), half = F >> 1;
    // Energie je Rahmen (Präfixsummen)
    const cum = new Float64Array(n + 1); for (let i = 0; i < n; i++) { const v = ok(x[i]); cum[i + 1] = cum[i] + v * v; }
    const E = new Float32Array(nFr);
    for (let t = 0; t < nFr; t++) { const a = Math.max(0, t * hop - half), b = Math.min(n, t * hop + half); E[t] = 10 * Math.log10((cum[b] - cum[a]) / F + 1e-14); }
    const Es = new Float32Array(nFr); for (let t = 0; t < nFr; t++) { let s = 0, c = 0; for (let k = -1; k <= 1; k++) if (t + k >= 0 && t + k < nFr) { s += E[t + k]; c++; } Es[t] = s / c; }
    const valid = Array.from(Es).filter(v => v > -130);
    const floor = pct(valid, 0.03), top = pct(valid, 0.995);   // Boden = 3-%-Perzentil (kurze Stille genügt)
    const onT = floor + (o.onDb || 10), offT = floor + (o.offDb || 6), absT = top - 45;
    const active = new Uint8Array(nFr); let on = false;
    for (let t = 0; t < nFr; t++) { const e = Es[t]; if (!on && e > onT && e > absT) on = true; else if (on && (e < offT || e < absT - 6)) on = false; active[t] = on ? 1 : 0; }
    // Spektralfluss (SuperFlux: Abstand 2 Rahmen, Maximum über ±1 Bin); zwei Rahmen je komplexer FFT
    const fft = FFT(F), re = new Float64Array(F), im = new Float64Array(F), win = new Float64Array(F);
    for (let i = 0; i < F; i++) win[i] = 0.5 - 0.5 * Math.cos(TAU * i / F);
    const kMax = Math.min(half, Math.ceil(8000 / sr * F));
    const lam = Math.sqrt(Math.pow(10, floor / 10)) * Math.sqrt(3 * F / 8) + 1e-9;
    const L = [new Float32Array(kMax), new Float32Array(kMax), new Float32Array(kMax)], flux = new Float32Array(nFr);
    const logMag = (t, dst, part) => {     // part 0 = reell, 1 = imag aus dem gepackten Spektrum
      for (let k = 0; k < kMax; k++) {
        const j = (F - k) % F; let mr, mi;
        if (part === 0) { mr = 0.5 * (re[k] + re[j]); mi = 0.5 * (im[k] - im[j]); } else { mr = 0.5 * (im[k] + im[j]); mi = -0.5 * (re[k] - re[j]); }
        dst[k] = Math.log(1 + Math.sqrt(mr * mr + mi * mi) / lam);
      }
    };
    const fillFrame = (t, buf) => { const a = t * hop - half; for (let i = 0; i < F; i++) { const q = a + i; buf[i] = q >= 0 && q < n ? ok(x[q]) * win[i] : 0; } };
    for (let t = 0; t < nFr; t += 2) {
      fillFrame(t, re); if (t + 1 < nFr) fillFrame(t + 1, im); else im.fill(0);
      fft(re, im);
      for (let p = 0; p < 2 && t + p < nFr; p++) {
        const cur = L[(t + p) % 3], prev = L[(t + p + 1) % 3];   // prev = Rahmen t+p−2
        logMag(t + p, cur, p);
        let s = 0;
        if (t + p >= 2) for (let k = 0; k < kMax; k++) {
          const m = Math.max(prev[k], k > 0 ? prev[k - 1] : 0, k + 1 < kMax ? prev[k + 1] : 0), d = cur[k] - m;
          if (d > 0) s += d;
        }
        flux[t + p] = s;
      }
    }
    // Grundfluss des Rauschens (Median in Ruhe) abziehen, dann auf das 90-%-Perzentil der aktiven Rahmen normieren
    const quietFlux = []; for (let t = 2; t < nFr; t++) if (!active[t]) quietFlux.push(flux[t]);
    const base = quietFlux.length > 20 ? pct(quietFlux, 0.5) : 0;
    for (let t = 0; t < nFr; t++) flux[t] = Math.max(0, flux[t] - base);
    const actFlux = []; for (let t = 0; t < nFr; t++) if (active[t]) actFlux.push(flux[t]);
    const fScale = Math.max(1e-6, pct(actFlux, 0.9));
    const odf = new Float32Array(nFr);
    for (let t = 0; t < nFr; t++) {
      let mn = Es[t]; for (let k = 1; k <= 6 && t - k >= 0; k++) if (Es[t - k] < mn) mn = Es[t - k];
      odf[t] = flux[t] / fScale + Math.max(0, Es[t] - mn) / 20;
    }
    // feine Hüllkurven (1-ms-Raster, dB) zum Verfeinern: breitbandig (Fenster 6 ms) und Höhen (1. Differenz, 4 ms)
    const ms = Math.max(1, Math.round(sr / 1000)), nE = Math.ceil(n / ms), envS = new Float32Array(nE), envH = new Float32Array(nE), hw = 3 * ms, hh = 2 * ms;
    const cumD = new Float64Array(n + 1); for (let i = 1; i < n; i++) { const d = ok(x[i]) - ok(x[i - 1]); cumD[i + 1] = cumD[i] + d * d; }
    for (let j = 0; j < nE; j++) {
      let a = Math.max(0, j * ms - hw), b = Math.min(n, j * ms + hw); envS[j] = 10 * Math.log10((cum[b] - cum[a]) / Math.max(1, b - a) + 1e-14);
      a = Math.max(0, j * ms - hh); b = Math.min(n, j * ms + hh); envH[j] = 10 * Math.log10((cumD[b] - cumD[a]) / Math.max(1, b - a) + 1e-14);
    }
    const cross = (env, c) => {     // Anstieg ≥ 10 dB in [c − 45 ms, c + 15 ms] → erste Stelle über 50 % (in dB) → Sample
      const j0 = Math.max(0, Math.floor((c - 0.045 * sr) / ms)), j1 = Math.min(nE - 1, Math.ceil((c + 0.015 * sr) / ms));
      let jm = j0; for (let j = j0; j <= Math.min(j1, Math.round(c / ms)); j++) if (env[j] < env[jm]) jm = j;
      let jp = jm; for (let j = jm; j <= j1; j++) if (env[j] > env[jp]) jp = j;
      if (env[jp] - env[jm] < 10) return -1;
      const th = env[jm] + 0.5 * (env[jp] - env[jm]);
      for (let j = jm; j <= jp; j++) if (env[j] >= th) return j * ms;
      return -1;
    };
    // c in Samples (Rahmenmitte) → Einsatz; erst Pegel, dann Höhen (Klick auf Ton); ohne Anstieg (Bindung) bleibt c
    // VS5a-fix: die 6-ms-Hüllkurve ist mittig, ihr 50-%-Punkt liegt bei harten Anschlägen 2–3 ms vor dem hörbaren Einsatz.
    // Feinlage: erstes Sample ≥ 10 % der Spitze (und ≥ 2× davor) in [r − 4 ms, r + 8 ms bzw. Fluss-Spitze + 1 Rahmen]; ohne klaren, schnellen Anstieg bleibt r
    const fine = (r, c) => {
      const hi = Math.min(n - 1, Math.max(r + Math.round(0.008 * sr), c + F));   // bis eine Rahmenlänge nach der Fluss-Spitze
      const a = Math.max(0, r - Math.round(0.025 * sr)), b = Math.max(0, r - Math.round(0.004 * sr)), e = Math.min(n, Math.max(r + Math.round(0.03 * sr), hi + Math.round(0.005 * sr)));
      let pre = 0, pk = 0;
      for (let i = a; i < b; i++) { const v = Math.abs(ok(x[i])); if (v > pre) pre = v; }
      for (let i = r; i < e; i++) { const v = Math.abs(ok(x[i])); if (v > pk) pk = v; }
      if (!(pk > 0) || pk < 3 * pre) return r;
      const th = Math.max(0.1 * pk, 2 * pre);
      let i0 = -1; for (let i = b; i <= hi; i++) if (Math.abs(ok(x[i])) >= th) { i0 = i; break; }
      if (i0 < 0) return r;
      const lim = Math.min(n, i0 + Math.round(0.003 * sr));   // nur harte Anschläge (50 % der Spitze in ≤ 3 ms)
      let sharp = false; for (let i = i0; i < lim; i++) if (Math.abs(ok(x[i])) >= 0.5 * pk) { sharp = true; break; }
      if (!sharp) return r;
      // zurück bis zum Beginn des Anstiegs (0,2-ms-Fenster ≤ 2 % der Spitze bzw. 2× davor, höchstens 2 ms): der Übergang der
      // Scheiben endet an der Marke, der Anschlag bleibt ab seinem ersten Sample bitgleich
      const th2 = Math.max(0.02 * pk, 2 * pre), w = Math.max(1, Math.round(0.0002 * sr)), j0 = Math.max(b + w, i0 - Math.round(0.002 * sr));
      let j = i0;
      while (j > j0) { let m = 0; for (let k = j - w; k < j; k++) { const v = Math.abs(ok(x[k])); if (v > m) m = v; } if (m <= th2) break; j--; }
      return j;
    };
    const refine = (c) => { let r = cross(envS, c); if (r < 0) r = cross(envH, c); return r >= 0 ? fine(r, c) : c; };
    const minGap = Math.round((o.minGap || 0.07) * sr / hop);
    const cand = [];
    let lastT = -1e9;
    for (let t = 2; t < nFr - 1; t++) {
      let act = false; for (let k = 0; k <= 6 && t + k < nFr; k++) if (active[t + k]) { act = true; break; }
      if (!act) continue;
      const v = odf[t]; if (v < 0.6) continue;
      let isMax = true; for (let k = -4; k <= 4; k++) if (k && t + k >= 0 && t + k < nFr && odf[t + k] > v) { isMax = false; break; }
      if (!isMax) continue;
      let mn = v; for (let k = 1; k <= 12 && t - k >= 0; k++) if (odf[t - k] < mn) mn = odf[t - k];
      if (v - mn < 0.25) continue;
      if (t - lastT < minGap) { const c0 = cand[cand.length - 1]; if (c0 && v > c0.v) { c0.t = t; c0.v = v; lastT = t; } continue; }
      cand.push({t, v, src: 'onset'}); lastT = t;
    }
    // Aktivitäts-Beginn ohne Marke in der Nähe → Marke
    for (let t = 1; t < nFr; t++) if (active[t] && !active[t - 1]) {
      if (!cand.some(c => c.t >= t - 8 && c.t <= t + 14)) cand.push({t, v: 0.5, src: 'start'});
    }
    cand.sort((a, b) => a.t - b.t);
    // Marken auf Samples verfeinern, Wort-Beginn (≥ 120 ms Ruhe davor)
    const marks = [];
    const quiet = Math.round(0.12 * sr / hop);
    for (const c of cand) {
      const i = refine(c.t * hop);
      let word = true; const tf = Math.floor(i / hop);
      for (let k = 2; k <= quiet; k++) if (tf - k >= 0 && active[tf - k]) { word = false; break; }
      marks.push({t: i / sr, i, conf: +Math.min(1, c.v / 2).toFixed(3), src: c.src, word, voiced: false});
    }
    // Tonhöhe: Stimmhaftigkeit je Marke, Tonwechsel bei Bindung
    if (o.pitch !== false) {
      const V = voicing(x, sr, active, hop), nV = V.f0.length, cents = new Float32Array(nV);
      for (let v = 0; v < nV; v++) cents[v] = V.ap[v] < 0.25 && V.f0[v] > 0 ? 1200 * Math.log2(V.f0[v] / 55) : NaN;
      for (const m of marks) { const v = Math.min(nV - 1, Math.round((m.i + 0.04 * sr) / V.hv)); m.voiced = cents[v] === cents[v]; }
      const med = new Float32Array(nV).fill(NaN);
      for (let v = 2; v < nV - 2; v++) { const w = []; for (let k = -2; k <= 2; k++) if (cents[v + k] === cents[v + k]) w.push(cents[v + k]); if (w.length >= 4) { w.sort((a, b) => a - b); med[v] = w[w.length >> 1]; } }
      const stat = (a, b) => { let s = 0, s2 = 0, c = 0; for (let v = a; v <= b; v++) { if (!(med[v] === med[v])) return null; s += med[v]; s2 += med[v] * med[v]; c++; } const m = s / c; return {m, sd: Math.sqrt(Math.max(0, s2 / c - m * m))}; };
      const gapV = Math.round(0.08 * sr / V.hv);
      for (let v = 8; v < nV - 8; v++) {
        const A = stat(v - 8, v - 3), B = stat(v + 3, v + 8);
        if (!A || !B || A.sd > 30 || B.sd > 30 || Math.abs(B.m - A.m) < 80) continue;
        // Mitte des Übergangs: größter Sprung zwischen v−3 und v+3
        let bv = v, bd = 0; for (let k = v - 2; k <= v + 3; k++) { const dd = Math.abs(med[k] - med[k - 1]); if (dd > bd) { bd = dd; bv = k; } }
        const i = Math.round((bv - 0.5) * V.hv);
        if (marks.some(m => Math.abs(m.i - i) < gapV * V.hv)) { v += 3; continue; }
        marks.push({t: i / sr, i, conf: 0.6, src: 'pitch', word: false, voiced: true}); v += 8;
      }
      marks.sort((a, b) => a.i - b.i);
    }
    return marks;
  }

  // ---------- Raster (Nachbau von KeyDetect.detectGrid/quantize der App; Schläge, Viertel = 1) ----------
  const GRIDS = [{id: '1/4', step: 1}, {id: '1/8', step: 0.5}, {id: '1/8T', step: 1 / 3}, {id: '1/16', step: 0.25}, {id: '1/16T', step: 1 / 6}, {id: '1/32', step: 0.125}];
  const STEP = Object.fromEntries(GRIDS.map(g => [g.id, g.step]));
  const dist = (t, s) => t - Math.round(t / s) * s;
  function detectGrid(notes, opts = {}) {
    const on = notes.map(n => n.t).filter(Number.isFinite);
    if (on.length < 3) return {grid: opts.default || '1/16', swing: 0.5, fit: 0, sure: false};
    const secPerBeat = 60 / (opts.bpm || 120), tolAbs = (opts.tolMs || 32) / 1000 / secPerBeat;
    const tolOf = step => Math.min(tolAbs, step * 0.3);
    const fitOf = (step, swing = 0.5) => {
      let okc = 0; const tol = tolOf(step);
      for (const t of on) {
        let e = Math.abs(dist(t, step));
        if (swing !== 0.5) { const pair = step * 2, ph = ((t % pair) + pair) % pair; e = Math.min(ph, pair - ph, Math.abs(ph - swing * pair)); }
        if (e <= tol) okc++;
      }
      return okc / on.length;
    };
    const score = (step, fit) => { const ch = Math.min(0.95, 2 * tolOf(step) / step); return (fit - ch) / (1 - ch); };
    const res = GRIDS.map(g => { const fit = fitOf(g.step); return {...g, fit, score: score(g.step, fit)}; });
    const byStep = s => res.find(g => Math.abs(g.step - s) < 1e-9);
    let sw = null;
    for (const base of [0.25, 0.5]) {
      const pair = base * 2, offs = [], ons = [];
      for (const t of on) { const ph = ((t % pair) + pair) % pair / pair; if (ph > 0.4 && ph < 0.8) offs.push(ph); else ons.push(Math.min(ph, 1 - ph)); }
      if (offs.length < 3 || offs.length < on.length * 0.2) continue;
      offs.sort((a, b) => a - b); ons.sort((a, b) => a - b);
      const med = offs[offs.length >> 1], mad = offs.map(r => Math.abs(r - med)).sort((a, b) => a - b)[offs.length >> 1];
      const onErr = ons.length ? ons[ons.length >> 1] : 0;
      if (med < 0.54 || med > 0.78 || mad > 0.04 || onErr > 0.04) continue;
      const s = Math.min(0.75, med), f = fitOf(base, s), trip = byStep(base * 2 / 3);
      const mids = on.filter(t => Math.abs(((t % pair) + pair) % pair / pair - 1 / 3) < 0.06).length;
      const beatsTrip = f > trip.fit + 0.05 || (mids === 0 && f >= trip.fit - 0.02);
      if (f >= byStep(base).fit && beatsTrip && (!sw || offs.length > sw.n)) sw = {base, swing: +s.toFixed(2), fit: f, n: offs.length};
    }
    if (sw) return {grid: sw.base === 0.25 ? '1/16' : '1/8', swing: sw.swing, fit: +sw.fit.toFixed(3), sure: true};
    const TH = 0.75;
    for (const g of res) {
      if (g.score < TH) continue;
      const tripOnly = q => on.filter(t => Math.abs(dist(t, q.step)) <= tolOf(q.step) && Math.abs(dist(t, 0.25)) > tolOf(0.25)).length;
      const finerTrip = res.find(q => q.id.endsWith('T') && q.step < g.step && q.score > g.score + 0.15 && q.score >= TH && tripOnly(q) > 0);
      if (finerTrip) return {grid: finerTrip.id, swing: 0.5, fit: +finerTrip.fit.toFixed(3), sure: true};
      if (g.id.endsWith('T')) { const straight = byStep(g.step > 0.2 ? 0.25 : 0.125); if (straight.score >= g.score - 0.1) return {grid: straight.id, swing: 0.5, fit: +straight.fit.toFixed(3), sure: true}; }
      return {grid: g.id, swing: 0.5, fit: +g.fit.toFixed(3), sure: true};
    }
    const best = res.slice().sort((a, b) => b.score - a.score)[0];
    return best.score >= 0.5 ? {grid: best.id, swing: 0.5, fit: +best.fit.toFixed(3), sure: false} : {grid: 'off', swing: 0.5, fit: +best.fit.toFixed(3), sure: false};
  }

  // ---------- Quantisieren (C.5 Nr. 3 und 4) ----------
  function quantizeMarks(times, o = {}) {
    const n = times.length, spb = 60 / (o.bpm || 120), t0 = o.t0 || 0, out = new Float64Array(n), moved = new Uint8Array(n);
    for (let k = 0; k < n; k++) out[k] = times[k];
    let grid = o.grid || 'auto', swing = clamp(+o.swing || 0.5, 0.5, 0.75);
    const beats = Array.from(times, t => (t - t0) / spb);
    if (grid === 'auto') {
      const g = (o.detectGrid || detectGrid)(beats.map(b => ({t: b, d: 0.1, n: 60, v: 0.8})), {bpm: o.bpm || 120});
      grid = g.grid; if (o.swingAuto !== false && g.swing > 0.5) swing = g.swing;
    }
    const step = STEP[grid];
    if (grid === 'off' || !step) return {times: out, grid: 'off', swing: 0.5, moved};
    if (grid.endsWith('T')) swing = 0.5;
    const str = clamp(o.strength == null ? 1 : +o.strength, 0, 1), cat = clamp(o.catch == null ? 0.4 : +o.catch, 0, 0.5);
    const minGap = o.minGap == null ? 0.01 : o.minGap;
    const target = b => { const k = Math.round(b / step); let q = k * step; if (swing !== 0.5 && (k & 1)) q += (swing - 0.5) * 2 * step; return q; };
    const want = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const b = beats[k], q = target(b);
      if (Math.abs(b - q) <= cat * step + 1e-9 && str > 0) { want[k] = t0 + (b + (q - b) * str) * spb; moved[k] = want[k] !== times[k] ? 1 : 0; }
      else want[k] = times[k];
    }
    // Reihenfolge halten: Kollision → die Marke mit dem weiteren Weg bleibt, wo sie war
    for (let k = 1; k < n; k++) {
      if (want[k] > want[k - 1] + minGap) continue;
      const dA = Math.abs(want[k - 1] - times[k - 1]), dB = Math.abs(want[k] - times[k]);
      if (dB >= dA && moved[k]) { want[k] = times[k]; moved[k] = 0; }
      else if (moved[k - 1]) { want[k - 1] = times[k - 1]; moved[k - 1] = 0; k = Math.max(0, k - 2); continue; }
      if (want[k] <= want[k - 1] + minGap) want[k] = want[k - 1] + minGap;
    }
    for (let k = 0; k < n; k++) out[k] = want[k];
    return {times: out, grid, swing, moved};
  }

  // ---------- Zeitkarte warp.map (stückweise linear, streng steigend) ----------
  function makeWarp(src, dst, lenSrc, lenDst) {
    const n = src.length, S = [0], D = [0];
    for (let k = 0; k < n; k++) {
      const s = +src[k], d = +dst[k];
      if (!(s > S[S.length - 1] + 1e-6) || !(d > D[D.length - 1] + 1e-6) || s >= lenSrc) continue;   // nie rückwärts
      S.push(s); D.push(d);
    }
    const le = lenDst == null ? lenSrc : lenDst;
    if (le > D[D.length - 1] + 1e-6 && lenSrc > S[S.length - 1] + 1e-6) { S.push(lenSrc); D.push(le); }
    else { S.push(lenSrc); D.push(D[D.length - 1] + (lenSrc - S[S.length - 2])); }
    return {v: 1, src: Float64Array.from(S), dst: Float64Array.from(D)};
  }
  function seg(a, t) { let lo = 0, hi = a.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] <= t) lo = m; else hi = m; } return lo; }
  function warpTime(w, t) {
    const {src: s, dst: d} = w, n = s.length;
    if (t <= s[0]) return d[0] + (t - s[0]); if (t >= s[n - 1]) return d[n - 1] + (t - s[n - 1]);
    const k = seg(s, t); return d[k] + (t - s[k]) * (d[k + 1] - d[k]) / (s[k + 1] - s[k]);
  }
  function warpInverse(w, t) { return warpTime({src: w.dst, dst: w.src}, t); }
  function warpIsIdentity(w) { for (let k = 0; k < w.src.length; k++) if (w.src[k] !== w.dst[k]) return false; return true; }
  const warpToJSON = w => ({v: 1, src: Array.from(w.src), dst: Array.from(w.dst)});
  const warpFromJSON = j => ({v: 1, src: Float64Array.from(j.src), dst: Float64Array.from(j.dst)});

  // ---------- Modus „Scheiben“ ----------
  function sliceCuts(x, sr, onsets, o = {}) {
    const pre = Math.round((o.pre == null ? 0.003 : o.pre) * sr), zc = Math.round((o.zc == null ? 0.002 : o.zc) * sr), n = x.length;
    const cuts = new Int32Array(onsets.length);
    for (let k = 0; k < onsets.length; k++) {
      const on = Math.round(onsets[k] * sr), c = clamp(on - pre, 0, n - 1);
      let best = c, bd = 1e9, bz = false;
      for (let i = Math.max(1, c - zc); i <= Math.min(n - 1, c + zc, on); i++) {
        const z = (x[i - 1] <= 0 && x[i] > 0) || (x[i - 1] >= 0 && x[i] < 0) || x[i] === 0;
        const d = Math.abs(i - c);
        if (z && (!bz || d < bd)) { best = i; bd = d; bz = true; }
        else if (!bz && Math.abs(x[i]) < Math.abs(x[best])) best = i;
      }
      cuts[k] = Math.min(best, on);
      if (k && cuts[k] <= cuts[k - 1]) cuts[k] = cuts[k - 1] + 1;
    }
    return cuts;
  }
  function renderSlices(x, sr, onsets, targets, o = {}) {
    const n = x.length, y = new Float32Array(n), K = onsets.length;
    const sh = new Int32Array(K + 1);
    let same = true; for (let k = 0; k < K; k++) { sh[k + 1] = Math.round(targets[k] * sr) - Math.round(onsets[k] * sr); if (sh[k + 1]) same = false; }
    if (same) { y.set(x); return y; }                            // Stärke 0 → bitgleich
    const cuts = sliceCuts(x, sr, onsets, o), X = Math.max(1, Math.round((o.xfade == null ? 0.005 : o.xfade) * sr));
    // Scheibe 0 = Anfang bis zum ersten Schnitt (bleibt), Scheibe j: Quelle [S[j], S[j+1]), Ziel ab D[j] = S[j] + sh[j]
    const S = new Int32Array(K + 2), D = new Int32Array(K + 2);
    for (let k = 0; k < K; k++) S[k + 1] = cuts[k]; S[K + 1] = n;
    for (let j = 0; j <= K; j++) D[j] = S[j] + sh[j]; D[K + 1] = n;
    // Ausklang einer Scheibe (Lücke, wenn die nächste später kommt): eine Schleife aus ihrem Ende, Länge = die Periode mit der
    // besten Korrelation (5–40 ms), die Naht je Runde blendet von der Fortsetzung (Audio bis zum Einsatz) in den
    // Schleifenanfang (≤ 2 ms; gleichspannungsgemäß bei Korrelation > 0,5, sonst gleichleistungsgemäß). VS5a-Einbau: vorher
    // Spiegelung mit Kosinus-Ausblendung über die Lücke (gehaltener Gesang: bis −17 dB Loch und Knick an jeder Umkehr).
    const loops = new Array(K + 1), W = Math.max(1, Math.round(0.005 * sr)), pmin = Math.max(1, Math.round(0.005 * sr));
    const loopOf = j => {
      if (loops[j]) return loops[j];
      const s0 = Math.max(0, S[j]), s1 = S[j + 1], on = j < K ? Math.round(onsets[j] * sr) : s1;
      const pmax = Math.min(Math.round(0.04 * sr), s1 - s0 - W);
      let best = -2, Lp = Math.max(1, s1 - s0);
      for (let L = pmin; L <= pmax; L++) {
        let ab = 0, aa = 0, bb = 0;
        for (let k = 0; k < W; k++) { const u = x[s1 - W + k], v = x[s1 - L - W + k]; ab += u * v; aa += u * u; bb += v * v; }
        const r = ab / Math.sqrt(aa * bb + 1e-20); if (r > best) { best = r; Lp = L; }
      }
      return (loops[j] = {Lp, rho: best, av: Math.max(1, Math.min(on - s1, Math.round(0.002 * sr), Lp))});
    };
    const blend = (rho, u) => (rho > 0.5 ? [0.5 + 0.5 * Math.cos(Math.PI * u), 0.5 - 0.5 * Math.cos(Math.PI * u)] : [Math.cos(0.5 * Math.PI * u), Math.sin(0.5 * Math.PI * u)]);
    // Wert der Scheibe j an Ausgabestelle i: eigenes Audio, danach ihr Ausklang
    const val = (j, i) => {
      const p = S[j] + (i - D[j]);
      if (p < 0) return 0;
      if (p < S[j + 1]) return x[p];
      const L = loopOf(j), s1 = S[j + 1], k = (p - s1) % L.Lp, q = s1 - L.Lp + k;
      let v = q >= 0 ? x[q] : 0;
      if (k < L.av && s1 + k < n) { const [go, gi] = blend(L.rho, (k + 0.5) / L.av); v = x[s1 + k] * go + v * gi; }
      return v;
    };
    for (let j = 0; j <= K; j++) for (let i = Math.max(0, D[j]); i < Math.min(n, D[j + 1]); i++) y[i] = val(j, i);
    // Übergang 5 ms, endet am Einsatz → Anschlag ab dem Einsatz bitgleich; gleichleistungsgemäß, bei Korrelation > 0,5
    // gleichspannungsgemäß (gleiche Lage → kein Buckel, Gegenlage → kein Loch)
    for (let j = 1; j <= K; j++) {
      if (sh[j] === sh[j - 1]) continue;
      const b = D[j] + (Math.round(onsets[j - 1] * sr) - S[j]), a = b - X;
      let ab = 0, aa = 0, bb = 0;
      for (let i = Math.max(0, a); i < Math.min(n, b); i++) { const p = S[j] + (i - D[j]), u = val(j - 1, i), v = p >= 0 ? x[p] : 0; ab += u * v; aa += u * u; bb += v * v; }
      const rho = ab / Math.sqrt(aa * bb + 1e-20);
      for (let i = Math.max(0, a); i < Math.min(n, b); i++) {
        const p = S[j] + (i - D[j]), [go, gi] = blend(rho, (i - a + 0.5) / X);
        y[i] = val(j - 1, i) * go + (p >= 0 ? x[p] : 0) * gi;
      }
    }
    return y;
  }

  // ---------- Songtext auf Silben (VS5b, N7V-30) ----------
  function assignLyrics(text, nMarks) {
    const syl = String(text || '').trim().split(/\s+/).filter(Boolean).flatMap(w => w.split('-').filter(Boolean));
    const labels = new Array(nMarks).fill('·');
    for (let k = 0; k < Math.min(nMarks, syl.length); k++) labels[k] = syl[k];
    return {labels, extra: syl.slice(nMarks)};
  }

  return {detectMarks, quantizeMarks, detectGrid, makeWarp, warpTime, warpInverse, warpIsIdentity, warpToJSON, warpFromJSON,
    sliceCuts, renderSlices, assignLyrics, GRIDS, VERSION: 'vs5a-marks-2'};
}

const api = factory();
export const {detectMarks, quantizeMarks, detectGrid, makeWarp, warpTime, warpInverse, warpIsIdentity, warpToJSON, warpFromJSON,
  sliceCuts, renderSlices, assignLyrics, GRIDS, VERSION} = api;
export function srcText() { return '(' + factory.toString() + ')()'; }
export default api;
