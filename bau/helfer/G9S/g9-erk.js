// G9b-V – Erkennung ohne Modell (DOM-frei, für den Modul-Worker). Spec: spec/n8/G9.md §6.6 Schritte 1–8.
// Alles hier läuft ohne Sprachmodell; das Modell (G9b-2, nach Freigabe F0) bekommt nur die Fenster aus plan() und liefert Wörter
// {text, start, end, p?} je Fenster zurück. Ohne Modell bleiben Einfügen/Tippen/Korrigieren voll nutzbar (g9-kern.js).
function g9ErkMake() {
'use strict';
const VERSION = 'g9b-v-1', FS = 16000;
const R6 = v => +(+v).toFixed(6);
const fin = v => typeof v === 'number' && v === v && v < 1e30 && v > -1e30;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const db = v => 10 * Math.log10(v + 1e-20);

// ── 1. Vorstufe: Hochpass 80 Hz (2. Ordnung), 16 kHz (Polyphase, Kaiser-Fenster), Spitze −3 dBFS ──
function hp80(x, sr) {
  const w = 2 * Math.PI * 80 / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al;
  const b0 = (1 + cw) / 2 / a0, b1 = -(1 + cw) / a0, b2 = b0, a1 = -2 * cw / a0, a2 = (1 - al) / a0;
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = fin(x[i]) ? x[i] : 0, o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; }
  return y;
}
function i0(x) { let s = 1, t = 1; for (let k = 1; k < 40; k++) { t *= (x / (2 * k)) * (x / (2 * k)); s += t; if (t < 1e-12 * s) break; } return s; }
const FIL = {};
function filt(sr) {   // Prototyp bei L·sr: Durchlass bis 7,2 kHz, Sperre ab 8 kHz, ≥ 60 dB (Kaiser A = 70 dB)
  if (FIL[sr]) return FIL[sr];
  const g = gcd(FS, sr), L = FS / g, M = sr / g, fp = L * sr, A = 70, beta = 0.1102 * (A - 8.7);
  const fc = Math.min(7600, sr / 2 * 0.95), dw = 2 * Math.PI * Math.min(800, sr / 2 - 7200 > 0 ? 800 : 400) / fp;
  let N = Math.ceil((A - 8) / (2.285 * dw)) | 1, per = Math.ceil(N / L); N = per * L;
  const h = new Float64Array(N), c = (N - 1) / 2, ib = i0(beta);
  for (let n = 0; n < N; n++) { const t = n - c, s = t === 0 ? 2 * fc / fp : Math.sin(2 * Math.PI * fc / fp * t) / (Math.PI * t); const r = 2 * n / (N - 1) - 1; h[n] = s * i0(beta * Math.sqrt(Math.max(0, 1 - r * r))) / ib * L; }
  const ph = []; for (let p = 0; p < L; p++) { const a = new Float64Array(per); for (let k = 0; k < per; k++) a[k] = h[p + k * L]; ph.push(a); }
  return (FIL[sr] = {L, M, per, ph, delay: c / L});
}
function resample(x, sr) {
  if (sr === FS) return Float32Array.from(x);
  const {L, M, per, ph, delay} = filt(sr), n = x.length, nOut = Math.floor(n * L / M), y = new Float32Array(nOut), d = delay;
  // Laufzeit des Filters ausgleichen: Ausgabe j entspricht Eingabe-Zeit j·M/L (gleiche Take-Sekunde)
  const sh = Math.round(d * L);
  for (let j = 0; j < nOut; j++) {
    const u = j * M + sh, base = Math.floor(u / L), p = u - base * L, h = ph[p];
    let s = 0; for (let k = 0; k < per; k++) { const q = base - k; if (q >= 0 && q < n) s += h[k] * x[q]; }
    y[j] = s;
  }
  return y;
}
function prep(x, sr) {
  const h = hp80(x, sr), y = resample(h, sr);
  let pk = 0; for (let i = 0; i < y.length; i++) { const a = Math.abs(y[i]); if (a > pk) pk = a; }
  const g = pk > 0 ? Math.pow(10, -3 / 20) / pk : 1;
  for (let i = 0; i < y.length; i++) y[i] *= g;
  return {y, gain: g, peakIn: pk};
}

// ── 2. Stimm-Strecken (Energie über Grund + 10 dB, Lücken < 400 ms überbrückt, ≥ 100 ms stimmhaft), je 200 ms Rand ──
function strecken(y, o) {
  o = o || {};
  const hop = 160, win = 320, nF = Math.floor(y.length / hop), E = new Float32Array(nF);
  for (let f = 0; f < nF; f++) { let s = 0; const a = f * hop; for (let i = a; i < Math.min(y.length, a + win); i++) s += y[i] * y[i]; E[f] = db(s / win); }
  const srt = Array.from(E).filter(v => v > -150).sort((a, b) => a - b);
  if (!srt.length) return [];
  const floor = srt[Math.floor(0.03 * (srt.length - 1))], top = srt[Math.floor(0.995 * (srt.length - 1))];
  const thr = Math.max(floor + 10, top - (o.rel || 30), o.abs != null ? o.abs : -150);
  const act = new Uint8Array(nF); for (let f = 0; f < nF; f++) act[f] = E[f] > thr ? 1 : 0;
  // stimmhaft je Rahmen (YIN auf 8 kHz, 70 … 800 Hz)
  const dec = 2, n8 = Math.floor(y.length / dec), x8 = new Float32Array(n8); for (let i = 0; i < n8; i++) x8[i] = 0.5 * (y[2 * i] + (y[2 * i + 1] || 0));
  const W = 240, tMin = 10, tMax = 115, d = new Float64Array(tMax + 2);
  const voiced = f => {
    const a = Math.floor(f * hop / dec); if (a + W + tMax + 1 >= n8) return false;
    for (let tau = 1; tau <= tMax + 1; tau++) { let s = 0; for (let k = 0; k < W; k += 2) { const e = x8[a + k] - x8[a + k + tau]; s += e * e; } d[tau] = s; }
    let run = 0; for (let tau = 1; tau <= tMax + 1; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
    for (let tau = tMin; tau <= tMax; tau++) if (d[tau] < 0.25) return true;
    return false;
  };
  const segs = []; let f = 0;
  while (f < nF) {
    if (!act[f]) { f++; continue; }
    let e = f; while (e < nF) { if (act[e]) { e++; continue; } let g = e; while (g < nF && !act[g]) g++; if (g < nF && (g - e) * hop / FS < 0.4) e = g; else break; }
    let vc = 0; for (let q = f; q < e; q++) if (act[q] && voiced(q)) vc++;
    if (vc * hop / FS >= (o.minVoiced || 0.1)) segs.push({a: f * hop / FS, b: Math.min(y.length, e * hop + win) / FS});
    f = e;
  }
  const M = 0.2, len = y.length / FS, out = [];
  for (const s of segs) { const a0 = Math.max(0, s.a - M), b0 = Math.min(len, s.b + M), l = out[out.length - 1]; if (l && a0 <= l.b0) { l.b0 = b0; l.b = s.b; } else out.push({a: R6(s.a), b: R6(s.b), a0: R6(a0), b0: R6(b0)}); }
  for (const s of out) { s.a = R6(s.a); s.b = R6(s.b); s.b0 = R6(s.b0); }
  return out;
}
// ── 3. Verbinden: Strecken hintereinander, dazwischen 0,3 s Nullen; stückweise Zeit-Karte ──
function verbinden(y, segs) {
  const Z = Math.round(0.3 * FS), parts = []; let tot = 0;
  segs.forEach((s, i) => { const a = Math.round(s.a0 * FS), b = Math.round(s.b0 * FS); if (i) tot += Z; parts.push({s0: tot, a, b}); tot += b - a; });
  const st = new Float32Array(tot), map = [];
  for (const p of parts) { st.set(y.subarray(p.a, p.b), p.s0); map.push({s0: R6(p.s0 / FS), t0: R6(p.a / FS), len: R6((p.b - p.a) / FS)}); }
  return {st, map, L: tot / FS};
}
// ── 4. Fenster ≤ 30 s: Schnitt an der letzten Strecken-Grenze in [24, 30] s, sonst im leisesten 200-ms-Stück ──
function fenster(st, map) {
  const L = st.length / FS, out = [], gaps = [];
  for (let i = 1; i < map.length; i++) gaps.push(map[i].s0 - 0.15);
  let w0 = 0;
  while (L - w0 > 30 + 1e-9) {
    let cut = -1; for (const g of gaps) if (g >= w0 + 24 && g <= w0 + 30) cut = g;
    if (cut < 0) {
      let best = 1e9; const n2 = Math.round(0.2 * FS);
      for (let c = w0 + 24; c + 0.2 <= w0 + 30 + 1e-9; c += 0.05) { const a = Math.round(c * FS); let s = 0; for (let i = a; i < a + n2 && i < st.length; i++) s += st[i] * st[i]; if (s < best) { best = s; cut = c + 0.1; } }
    }
    out.push({a: R6(w0), b: R6(cut)}); w0 = cut;
  }
  if (L > 0) out.push({a: R6(w0), b: R6(L)});
  return out;
}
function plan(x, sr, o) {
  const P = prep(x, sr), segs = strecken(P.y, o), V = verbinden(P.y, segs), win = fenster(V.st, V.map);
  return {y: P.y, segs, st: V.st, map: V.map, L: V.L, win, chunks: win.length, lo: Math.ceil(V.L / 30 - 1e-9), hi: Math.ceil(V.L / 24 - 1e-9)};
}
// Fenster als Float32Array (für die Pipeline; die Bibliothek füllt selbst auf 30 s auf)
function fensterDaten(pl, k) { const w = pl.win[k]; return pl.st.subarray(Math.round(w.a * FS), Math.round(w.b * FS)); }

// ── 6./7. Rückrechnung in Take-Sekunden + Schutz gegen Erfundenes ──
function streamToTake(map, s) { for (const m of map) if (s >= m.s0 - 1e-9 && s <= m.s0 + m.len + 1e-9) return m.t0 + (s - m.s0); return null; }
function takeToStream(map, t) { for (const m of map) if (t >= m.t0 - 1e-9 && t <= m.t0 + m.len + 1e-9) return m.s0 + (t - m.t0); return null; }
const norm = w => String(w || '').toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
function kuerzeSchleifen(W) {   // Folge aus ≥ 3 Wörtern, die sich > 2× direkt wiederholt → 2×
  let a = W.slice(), changed = true, n = 0;
  while (changed) {
    changed = false;
    for (let L = 3; L * 3 <= a.length && !changed; L++) for (let i = 0; i + 3 * L <= a.length && !changed; i++) {
      let r = 1; const eq = (p, q) => { for (let k = 0; k < L; k++) if (norm(a[p + k].text) !== norm(a[q + k].text)) return false; return true; };
      while (i + (r + 1) * L <= a.length && eq(i, i + r * L)) r++;
      if (r > 2) { n += (r - 2) * L; a.splice(i + 2 * L, (r - 2) * L); changed = true; }
    }
  }
  return {W: a, cut: n};
}
// words: [{text, start, end, p?}] je Fenster (Sekunden relativ zum Fenster) → Take-Sekunden, geprüft
function zurueck(wordsPerWin, pl) {
  const out = [], drop = {stille: 0, null: 0, schleife: 0};
  pl.win.forEach((w, k) => {
    const ws = wordsPerWin[k] || [];
    const ps = ws.map(x => x.p).filter(fin), avg = ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : null;
    for (const x of ws) {
      if (!x || !String(x.text || '').trim()) continue;
      let s = w.a + Math.max(0, +x.start || 0), e = w.a + Math.max(+x.start || 0, +x.end || 0);
      s = Math.min(s, w.b); e = Math.min(e, w.b);
      const mid = (s + e) / 2, seg = pl.map.find(m => mid >= m.s0 - 1e-9 && mid <= m.s0 + m.len + 1e-9);
      if (!seg) { drop.null++; continue; }   // Mitte in den 0,3-s-Nullen
      const cl = v => Math.min(seg.s0 + seg.len, Math.max(seg.s0, v));
      const ts = R6(seg.t0 + cl(s) - seg.s0), te = R6(seg.t0 + cl(e) - seg.s0), dur = Math.max(0.05, e - s);   // Dauer vor dem Abschneiden: Teil in den Nullen zählt als „nicht Stimme“
      let inV = 0; for (const g of pl.segs) inV += Math.max(0, Math.min(te + (te === ts ? 0.025 : 0), g.b) - Math.max(ts - (te === ts ? 0.025 : 0), g.a));
      if (inV < 0.3 * dur) { drop.stille++; continue; }
      const o = {text: String(x.text).trim(), start: ts, end: te};
      if (fin(x.p)) o.p = Math.round(Math.max(0, Math.min(1, x.p)) * 100) / 100;
      if (avg != null && avg < 0.2) o.p = Math.min(o.p != null ? o.p : 1, Math.round(avg * 100) / 100);   // unsicher statt verworfen
      out.push(o);
    }
  });
  const r = kuerzeSchleifen(out); drop.schleife = r.cut;
  return {words: r.W, drop};
}
// ── Sprache (§6.6.4): nur <|de|> und <|en|> zulassen, das erzeugte Token entscheidet ──
function sprachFilter(logits, ids) { const keep = new Set(ids); for (let i = 0; i < logits.length; i++) if (!keep.has(i)) logits[i] = -Infinity; return logits; }
function sprachWahl(logits, idDe, idEn) { return logits[idEn] > logits[idDe] ? 'en' : 'de'; }

// ── 8. Silben: g9Syl je Wort, g9Align mit Wort-Zeiten als Anker; feste Silben bleiben; vorhandener Text: nur Lücken ──
// K = g9Make()-Kern. mode: 'luecken' (Vorgabe) | 'alles'
function silben(K, words, lang, marks, feat, ly, mode, o) {
  const S = [];
  for (const w of words) {
    const r = K.sylX(w.text, lang); if (!r.s.length) continue;
    const wt = r.s.map(x => Math.max(1, (x.toLowerCase().match(/[aeiouäöüy]/g) || []).length)), tot = wt.reduce((a, b) => a + b, 0);
    let c = 0;
    r.s.forEach((x, i) => { const y = {x: x.slice(0, 24), tau: R6(w.start + (w.end - w.start) * c / tot)}; c += wt[i]; if (i === 0) y.w = 1; const p = fin(w.p) ? w.p : r.p; if (fin(p)) y.p = p; S.push(y); });
  }
  let keep = [];
  if (ly && ly.s && ly.s.length) {
    const vw = K.view(ly, marks, feat).V;
    keep = vw.map((y, i) => ({y: ly.s[i], v: y})).filter(z => mode === 'alles' ? z.y.u : true);
  }
  // Abschnitte vorhandener Silben belegen ihre Zeit: erkannte Wörter dort fallen weg
  const occ = keep.map(z => { const k = z.v.k; const t = k >= 0 ? marks[k].t : z.y.t; let e = t + 0.05; for (let q = k + 1; q < marks.length; q++) if (marks[q].t > t) { e = marks[q].t; break; } return [t, e]; });
  // ganze Wörter: fällt eine Silbe eines Worts in einen belegten Abschnitt, fällt das Wort weg
  const inOcc = t => occ.some(([a, b]) => t >= a - 1e-6 && t < b);
  const free = []; for (let i = 0; i < S.length;) { let e = i + 1; while (e < S.length && !S[e].w) e++; const W = S.slice(i, e); if (!W.some(y => inOcc(y.tau))) free.push(...W); i = e; }
  const all = keep.map(z => ({x: z.y.x, w: z.y.w, p: z.y.p, u: 1, t: z.v.k >= 0 ? marks[z.v.k].t : z.y.t, _u: z.y.u ? 1 : 0, _key: z.v.k >= 0 ? marks[z.v.k].t : z.y.t}))
    .concat(free.map(y => Object.assign({}, y, {_key: y.tau})))
    .sort((a, b) => a._key - b._key);
  const s = K.align(all.map(y => { const z = Object.assign({}, y); delete z._key; delete z._u; return z; }), marks, feat, o);
  s.forEach((y, i) => { if (all[i].u && !all[i]._u && !all[i].tau) delete y.u; if (all[i].tau != null) delete y.u; });
  return s;
}
return {VERSION, FS, hp80, resample, prep, strecken, verbinden, fenster, plan, fensterDaten, streamToTake, takeToStream, zurueck, kuerzeSchleifen,
  sprachFilter, sprachWahl, silben};
}
if (typeof module !== 'undefined' && module.exports) module.exports = {g9ErkMake};
