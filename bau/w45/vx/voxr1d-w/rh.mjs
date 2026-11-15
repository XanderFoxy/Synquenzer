// Abnahme VOXR1D (unabhängig) – Kern in Node. Eigene Fehler-Einbauten (andere Stellen/Formen/Stärken als Entwickler und Prüfer VOXR1B):
// Plopps = Druckstoß (einseitige Welle + Rückschwinger + Tiefrauschen < 150 Hz, 38–96 ms, +2…+12 dB), Klicks = 4 Formen (Impuls,
// Doppelklick, Resonanz 2–4 ms, Schmatz-Rauschen), Raumton = eigene Schnitte in eigenen Pausen. Takes B und C bei 44,1 und 48 kHz,
// saubere Takes A/B/C (44,1/48) auf Fehlalarme und Vor-Echo.
// Aufruf: node kern2.mjs <index.html> <out.json>
import fs from 'fs';
const file = process.argv[2], OUT = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const PATCH = process.env.PATCH || ''; const src = html.slice(a0, a1).replace('function vr1Make() {', 'function vr1Make() {' + PATCH + ';');
const K = new Function(src + '\nreturn vr1Make;')()();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const TK = {B44: 'dl/vocadito_10.wav', B48: 'imp2rs/vocadito_10@48000.wav', C44: 'dl/vocadito_14.wav', C48: 'imp2rs/vocadito_14@48000.wav', A44: 'dl/vocadito_1.wav', A48: 'imp2rs/vocadito_1@48000.wav'};
const L = {}; for (const k in TK) L[k] = wav(RV + TK[k]);
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20), res = [], R = {};
const ok = (c, name, info) => { res.push({ok: !!c, name, info}); console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + JSON.stringify(info) : '')); };
let seed = 4711; const rnd = () => { seed = (Math.imul(seed, 22695477) + 1) >>> 0; return seed / 4294967296; };
// --- Messwerkzeuge (eigene) ---
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let s = 2; s <= n; s <<= 1) { const h = s >> 1, w = -TAU / s; for (let i = 0; i < n; i += s) for (let k = 0; k < h; k++) { const c = Math.cos(w * k), sn = Math.sin(w * k), l = i + k + h, tr = re[l] * c - im[l] * sn, ti = re[l] * sn + im[l] * c; re[l] = re[i + k] - tr; im[l] = im[i + k] - ti; re[i + k] += tr; im[i + k] += ti; } } }
// Bandenergie f1..f2 eines Hann-Fensters [a, a+N)
function bandE(x, a, N, sr, f1, f2) { let M = 1; while (M < N) M <<= 1; const re = new Float64Array(M), im = new Float64Array(M); for (let i = 0; i < N; i++) re[i] = (x[a + i] || 0) * (0.5 - 0.5 * Math.cos(TAU * (i + 0.5) / N)); fft(re, im);
  let e = 0; for (let k = Math.max(0, Math.ceil(f1 * M / sr)); k <= Math.min(M / 2, Math.floor(f2 * M / sr)); k++) e += re[k] * re[k] + im[k] * im[k]; return e; }
// Goertzel-Leistung bei f, Hann [a, b)
const gz = (x, a, b, f, sr) => { const M = b - a, c = 2 * Math.cos(TAU * f / sr); let p1 = 0, p2 = 0; for (let i = 0; i < M; i++) { const s = (x[a + i] || 0) * (0.5 - 0.5 * Math.cos(TAU * (i + 0.5) / M)) + c * p1 - p2; p2 = p1; p1 = s; } return p1 * p1 + p2 * p2 - c * p1 * p2; };
const rmsDb = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return db(s / Math.max(1, b - a)); };
const bq = (t, f, q, sr) => { const w = TAU * f / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return t === 'lp' ? [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0] : [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; };
const filt = (y, c) => { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; y[i] = o; } return y; };
const hpf = (x, f, sr) => { const y = Float64Array.from(x); filt(y, bq('hp', f, 0.707, sr)); filt(y, bq('hp', f, 0.707, sr)); return y; };
// eigener Tonhöhen-Verfolger: NCCF auf ≈ 8 kHz, Fenster 30 ms, Schritt 5 ms; stimmhaft bei NCCF ≥ 0,75, Oktav-Schutz (kleinste Periode ≥ 0,92·max)
function track(x, sr) { const D = Math.round(sr / 8000), s2 = sr / D, y = Float64Array.from(x); filt(y, bq('lp', 3000, 0.707, sr)); filt(y, bq('lp', 3000, 0.707, sr)); const z = new Float64Array(Math.floor(x.length / D)); for (let i = 0; i < z.length; i++) z[i] = y[i * D];
  const W = Math.round(0.03 * s2), H = Math.round(0.005 * s2), t0 = Math.floor(s2 / 700), t1 = Math.ceil(s2 / 70), out = []; let e0 = 0; for (let i = 0; i < z.length; i++) e0 += z[i] * z[i]; const gl = db(e0 / z.length);
  for (let p = 0; p + W + t1 < z.length; p += H) { let ea = 0; for (let i = 0; i < W; i++) ea += z[p + i] * z[p + i]; const lev = db(ea / W); const nc = new Float64Array(t1 + 1); let mx = 0;
    if (lev > gl - 25) for (let t = t0; t <= t1; t++) { let s = 0, eb = 0; for (let i = 0; i < W; i++) { s += z[p + i] * z[p + i + t]; eb += z[p + i + t] * z[p + i + t]; } nc[t] = s / Math.sqrt(ea * eb + 1e-20); if (nc[t] > mx) mx = nc[t]; }
    let bt = 0; if (mx >= 0.75) for (let t = t0 + 1; t < t1; t++) if (nc[t] >= 0.92 * mx && nc[t] >= nc[t - 1] && nc[t] >= nc[t + 1]) { bt = t; break; }
    out.push({t: (p + W / 2) / s2, f0: bt ? s2 / bt : 0, lev}); }
  return out; }
const voicedAll = (T, a, b) => { const q = T.filter(r => r.t >= a && r.t <= b); return q.length > 2 && q.every(r => r.f0 > 0); };
const f0Med = (T, a, b) => { const q = T.filter(r => r.t >= a && r.t <= b && r.f0 > 0).map(r => r.f0).sort((p, q) => p - q); return q.length ? q[q.length >> 1] : 0; };
// f0 auf dem sauberen Signal fein nachziehen (Summe der Teiltöne max, ±4 %)
const f0Fine = (v, a, b, f, sr) => { let best = f, bv = -1; for (let k = -40; k <= 40; k++) { const g = f * (1 + k / 1000); let s = 0; for (let h = 1; h * g < 1500; h++) s += gz(v, a, b, h * g, sr); if (s > bv) { bv = s; best = g; } } return best; };
const RS = {pegel: 0, farbe: 0, n: 0, schlecht: []};
// ========== 4) Raumton: eigene Schnitte (digitale Stille 50…260 ms) in eigenen Pausen ==========
for (const tk of ['A44', 'A48', 'B44', 'B48', 'C44', 'C48']) {
  const {x: v, sr} = L[tk], n = v.length, H = Math.round(0.01 * sr), lv = []; for (let p = 0; p + H <= n; p += H) lv.push(rmsDb(v, p, p + H));
  const srt = lv.filter(q => q > -110).sort((p, q) => p - q), p20 = srt[Math.floor(0.1 * srt.length)] + 3;
  seed = 999 + tk.charCodeAt(0) + sr; const holes = []; let s = -1; const j0 = Math.ceil(0.4 * sr / H), j1 = lv.length - j0;
  for (let j = j0; j <= j1; j++) { const q = j < j1 && lv[j] > -110 && lv[j] <= p20; if (q && s < 0) s = j; if (!q && s >= 0) { const len = (j - s) * H / sr; if (len >= 0.08 && holes.length < 8) { const d = Math.min(len - 0.03, len * (0.4 + 0.3 * rnd())), c = Math.round((s + j) / 2 * H); holes.push([c - Math.round(d * sr / 2), c + Math.round(d * sr / 2)]); } s = -1; } }
  const xh = Float32Array.from(v); for (const [a, b] of holes) xh.fill(0, a, b);
  const rr = K.done(K.run(xh, sr, {steps: {room: {}}})), RI = rr.info.room, OB = [250, 500, 1000, 2000, 4000, 8000];
  const rows = holes.map(([a, b]) => { const m = Math.round(0.008 * sr), lev = rmsDb(rr.y, a + m, b - m) - rmsDb(v, a + m, b - m), N = b - a - 2 * m;
    const d = OB.map(f => db(bandE(rr.y, a + m, N, sr, f / Math.SQRT2, f * Math.SQRT2)) - db(bandE(v, a + m, N, sr, f / Math.SQRT2, f * Math.SQRT2))), mean = d.reduce((p, q) => p + q, 0) / d.length;
    const filled = (RI.holes || []).some(h => (h.s0 != null ? h.s0 : Math.round(h.t0 * sr)) <= a + m && (h.s1 != null ? h.s1 : Math.round(h.t1 * sr)) >= b - m);
    const w3 = Math.round(0.03 * sr), nbE = (() => { let e = 0, c = 0; for (let i = Math.max(0, a - w3); i < a; i++) { e += v[i] * v[i]; c++; } for (let i = b; i < Math.min(n, b + w3); i++) { e += v[i] * v[i]; c++; } return db(e / c); })();
    return {t: +(a / sr).toFixed(2), ms: Math.round((b - a) / sr * 1000), vorDb: +rmsDb(v, a + m, b - m).toFixed(1), nachbarDb: +nbE.toFixed(1), fuellungGegenNachbar: +(rmsDb(rr.y, a + m, b - m) - nbE).toFixed(1), pegelAbw: +lev.toFixed(1), farbeAbw: +Math.max(...d.map(q => Math.abs(q - mean))).toFixed(1), baender: d.map(q => +(q - mean).toFixed(1)), gefuellt: filled}; });
  let out = 0, outAt = []; for (let i = 0; i < n; i++) if (!holes.some(([a, b]) => i >= a && i < b) && rr.y[i] !== xh[i]) { out++; if (outAt.length < 6) { const h = holes.reduce((m, [a, b]) => Math.min(m, i < a ? a - i : i - b + 1), 1e9); outAt.push([i, h, +(20 * Math.log10(Math.abs(rr.y[i] - xh[i]) + 1e-12)).toFixed(0)]); } }
  R['room_' + tk] = {floorP20: +p20.toFixed(1), rows, gelernt: RI.learned && RI.learned.db, why: RI.why || null, appLuecken: (RI.holes || []).length, aussenGeaendert: out};
  const nm = `Raumton Take ${tk[0]}@${tk.slice(1)}`;
  console.log('INFO ' + nm + ' ' + JSON.stringify({gelernt: RI.learned && RI.learned.db, why: RI.why, rows: rows.map(q => [q.t, q.ms, q.vorDb, q.pegelAbw, q.farbeAbw, q.nachbarDb, q.fuellungGegenNachbar])}));
  if (!holes.length) { console.log('INFO ' + nm + ': keine eigene Pause gefunden'); continue; }
  ok(rows.every(q => Math.abs(q.pegelAbw) <= 3), `${nm}: ${holes.length} eigene Lücken, Pegel ±3 dB je Lücke`, rows.map(q => q.pegelAbw));
  ok(rows.every(q => q.farbeAbw <= 4), `${nm}: Klangfarbe (Oktaven 250 Hz–8 kHz) ±4 dB je Lücke`, rows.map(q => q.farbeAbw));
  ok(out === 0, `${nm}: außerhalb der Lücken bitgleich`, {proben: out, beiProbeAbstandDbfs: outAt});
}
  for (const q of rows) { RS.n++; if (Math.abs(q.pegelAbw) <= 3) RS.pegel++; if (q.farbeAbw <= 4) RS.farbe++; if (Math.abs(q.pegelAbw) > 3 || q.farbeAbw > 4) RS.schlecht.push([tk, q.t, q.ms, q.pegelAbw, q.farbeAbw, q.fuellungGegenNachbar, q.baender]); }
}
console.log('RAUM', JSON.stringify(RS));
