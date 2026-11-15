// Unabhängige Prüfung VOXR1B – Kern in Node, eigene eingesetzte Fehler in den Takes B und C (nicht Take A), zwei Abtastraten.
// Aufruf: node kern.mjs <index.html> <out.json>   – Ausgaben nennen nur Take B/C (A nur für saubere Gegenproben), keine Datensatz-Namen.
import fs from 'fs';
const file = process.argv[2], OUT = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const vr1Make = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')(), K = vr1Make();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32768; return {x, sr}; };
const TAKES = {B44: RV + 'dl/vocadito_10.wav', C48: RV + 'imp2rs/vocadito_14@48000.wav', B48: RV + 'imp2rs/vocadito_10@48000.wav', C44: RV + 'dl/vocadito_14.wav', A48: RV + 'imp2rs/vocadito_1@48000.wav'};
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20), R = {}, res = [];
const ok = (c, name, info) => { res.push({ok: !!c, name, info}); console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + JSON.stringify(info) : '')); };
let seed = 90210; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const gz = (x, a, b, f, sr) => { const M = b - a, c = 2 * Math.cos(TAU * f / sr); let p1 = 0, p2 = 0; for (let i = 0; i < M; i++) { const w = 0.5 - 0.5 * Math.cos(TAU * i / M), s = (x[a + i] || 0) * w + c * p1 - p2; p2 = p1; p1 = s; } return p1 * p1 + p2 * p2 - c * p1 * p2; };
function fftN(n) { const rev = new Uint32Array(n); let bits = 0; while ((1 << bits) < n) bits++; for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  return (re, im) => { for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= n; s <<= 1) { const h = s >> 1; for (let i = 0; i < n; i += s) for (let j = 0; j < h; j++) { const w = -TAU * j / s, c = Math.cos(w), sn = Math.sin(w), l = i + j + h, tr = re[l] * c - im[l] * sn, ti = re[l] * sn + im[l] * c; re[l] = re[i + j] - tr; im[l] = im[i + j] - ti; re[i + j] += tr; im[i + j] += ti; } } }; }
const FF = {}; const fft = n => FF[n] || (FF[n] = fftN(n));
// Bandenergie f1..f2 in x[a..a+N) (ein Hann-Fenster N, Zero-Padding auf 2er-Potenz)
function bandWin(x, a, N, sr, f1, f2) { let M = 1; while (M < N) M <<= 1; const re = new Float64Array(M), im = new Float64Array(M); for (let i = 0; i < N; i++) re[i] = (x[a + i] || 0) * (0.5 - 0.5 * Math.cos(TAU * i / N)); fft(M)(re, im); let e = 0; for (let k = Math.max(0, Math.ceil(f1 * M / sr)); k <= Math.min(M / 2, Math.floor(f2 * M / sr)); k++) e += re[k] * re[k] + im[k] * im[k]; return e; }
// Bandenergie über das ganze Signal (STFT 4096/2048)
function band(x, sr, f1, f2, a = 0, b = x.length) { const N = 4096; let e = 0; for (let p = a; p + N <= b; p += N / 2) e += bandWin(x, p, N, sr, f1, f2); return e; }
// RBJ-Biquads
const bq = (type, f, q, sr, gDb) => { const w = TAU * f / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; if (type === 'hp') return [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; if (type === 'lp') return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; if (type === 'bp') return [al / a0, 0, -al / a0, -2 * c / a0, (1 - al) / a0]; };
const filt = (y, c) => { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; y[i] = o; } return y; };
const hpf = (x, f, sr) => { const y = Float64Array.from(x); filt(y, bq('hp', f, 0.5411961, sr)); filt(y, bq('hp', f, 1.3065630, sr)); return y; };
const actRms = x => { const H = 480, e = []; for (let p = 0; p + H <= x.length; p += H) { let s = 0; for (let i = 0; i < H; i++) s += x[p + i] * x[p + i]; e.push(s / H); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return Math.sqrt(t.reduce((s, v) => s + v, 0) / t.length); };
const rmsDb = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return db(s / Math.max(1, b - a)); };
// eigener Stimmhaftigkeits-Tracker (YIN auf ≈ 12 kHz), Rahmen 5 ms, Fenster 40 ms → {t, f0 (0 = stimmlos), lev}
function track(x, sr) { const D = Math.max(1, Math.round(sr / 12000)), s2 = sr / D, z = new Float64Array(Math.floor(x.length / D)); { const y = Float64Array.from(x); const c = bq('lp', 5000, 0.707, sr); filt(y, c); for (let i = 0; i < z.length; i++) z[i] = y[i * D]; }
  const H = Math.round(0.005 * s2), W = Math.round(0.04 * s2), t0 = Math.floor(s2 / 800), t1 = Math.ceil(s2 / 75), out = [], ar = actRms(x);
  for (let p = 0; p + W + t1 < z.length; p += H) { let e = 0; for (let i = 0; i < W; i++) e += z[p + i] * z[p + i]; const lev = db(e / W); const d = new Float64Array(t1 + 1); let cum = 0, best = 1, bt = 0;
    if (lev > 20 * Math.log10(ar) - 35) for (let t = 1; t <= t1; t++) { let s = 0; for (let i = 0; i < W; i++) { const q = z[p + i] - z[p + i + t]; s += q * q; } cum += s; d[t] = s * t / (cum || 1); if (t >= t0 && d[t] < best) { best = d[t]; bt = t; } if (t >= t0 && d[t] < 0.15) { while (t + 1 <= t1) { let s2b = 0; for (let i = 0; i < W; i++) { const q = z[p + i] - z[p + i + t + 1]; s2b += q * q; } const dn = s2b * (t + 1) / (cum + s2b); if (dn < d[t]) { t++; d[t] = dn; cum += s2b; bt = t; best = dn; } else break; } break; } }
    out.push({t: (p + W / 2) / s2, f0: best < 0.2 && bt ? s2 / bt : 0, lev}); }
  return out; }
const f0At = (T, t) => { let k = Math.round((t - T[0].t) / (T[1].t - T[0].t)); k = Math.max(0, Math.min(T.length - 1, k)); return T[k].f0; };
const voicedSpan = (T, a, b) => T.filter(q => q.t >= a && q.t <= b).every(q => q.f0 > 0);
const LOAD = {}; for (const k in TAKES) LOAD[k] = wav(TAKES[k]);
const TR = {}; for (const k of ['B44', 'C48', 'B48', 'C44']) TR[k] = track(LOAD[k].x, LOAD[k].sr);
R.takes = Object.fromEntries(Object.entries(LOAD).map(([k, W]) => [k, {sec: +(W.x.length / W.sr).toFixed(2), sr: W.sr, stimmhaft: TR[k] ? +(TR[k].filter(q => q.f0 > 0).length / TR[k].length).toFixed(2) : null}]));
console.log('INFO', JSON.stringify(R.takes));

// ========== 6) Raumton in Lücken: je Take 5 Schnitte (Stille) in eigenen Pausen (nicht in den ersten/letzten 0,3 s) ==========
for (const tk of ['C48', 'C44', 'B48']) { const {x: v, sr} = LOAD[tk], n = v.length, H = Math.round(0.01 * sr), Lo = []; for (let p = 0; p + H <= n; p += H) Lo.push(rmsDb(v, p, p + H));
  const srt = Lo.filter(q => q > -110).sort((a, b) => a - b), flo = srt[Math.floor(0.1 * srt.length)], holes = []; let s = -1, j0 = Math.ceil(0.3 * sr / H), j1 = Lo.length - j0;
  for (let j = j0; j <= j1; j++) { const q = j < j1 && Lo[j] > -110 && Lo[j] < flo + 6; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 20 && holes.length < 5) { const c = Math.round((s + j) / 2 * H), d = Math.round(Math.min(0.35, 0.6 * (j - s) * H / sr, 0.12 + rnd() * 0.2) * sr); holes.push([c - (d >> 1), c + (d >> 1)]); } s = -1; } }
  const xh = Float32Array.from(v); for (const [a, b] of holes) xh.fill(0, a, b);
  const rr = K.done(K.run(xh, sr, {steps: {room: {}}})), RI = rr.info.room, bandsO = [250, 500, 1000, 2000, 4000, 8000];
  const lev = holes.map(([a, b]) => { const m = Math.round(0.012 * sr); return [+rmsDb(rr.y, a + m, b - m).toFixed(1), +rmsDb(v, a + m, b - m).toFixed(1)]; });
  const tim = holes.map(([a, b]) => { const N = Math.min(4096, b - a - Math.round(0.024 * sr)), a2 = a + Math.round(0.012 * sr); const d = bandsO.map(f => db(bandWin(rr.y, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2)) - db(bandWin(v, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2))); const m = d.reduce((s, q) => s + q, 0) / d.length; return +Math.max(...d.map(q => Math.abs(q - m))).toFixed(1); });
  let diffOut = 0; for (let i = 0; i < n; i++) if (!holes.some(([a, b]) => i >= a - 1 && i < b + 1) && rr.y[i] !== xh[i]) diffOut++;
  R['room_' + tk] = {floorDb: +flo.toFixed(1), loecher: holes.map(([a, b]) => [+(a / sr).toFixed(2), +((b - a) / sr).toFixed(2)]), pegelNachVor: lev, klangfarbeAbw: tim, gelernt: RI.learned, why: RI.why || null, gefuellt: (RI.holes || []).length, aussenGeaendert: diffOut};
  if (RI.why) { console.log('INFO Raumton Take ' + tk + ': ' + RI.why); continue; }
  ok(holes.length === 5 && lev.every(q => Math.abs(q[0] - q[1]) <= 3), `Raumton Take ${tk[0]}@${tk.slice(1)}: 5 Lücken gefüllt, Pegel wie vor dem Schnitt ± 3 dB`, {abw: lev.map(q => +(q[0] - q[1]).toFixed(1)), floor: +flo.toFixed(1), gelernt: RI.learned && RI.learned.db});
  ok(tim.every(q => q <= 4), `Raumton Take ${tk[0]}@${tk.slice(1)}: Klangfarbe (Oktaven 250 Hz–8 kHz) ± 4 dB`, tim);
  ok(diffOut === 0, `Raumton Take ${tk[0]}@${tk.slice(1)}: außerhalb der Lücken bitgleich`, {proben: diffOut, gefuellt: (RI.holes || []).length});
}
console.log('ERGEBNIS', res.filter(r=>r.ok).length+'/'+res.length);
