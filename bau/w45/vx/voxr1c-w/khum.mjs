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

// ========== 1) Brummen: f0 + 6 Obertöne, zusammen −20 dB unter dem Gesang, Stärken fallend, Zufallsphasen ==========
for (const [tk, base] of [['B44', 50], ['C48', 60], ['C48', 50], ['B44', 60]]) {
  const {x: v, sr} = LOAD[tk], n = v.length, vr = actRms(v), amp = [1, 0.8, 0.6, 0.5, 0.35, 0.25, 0.2], s2 = Math.sqrt(amp.reduce((s, a) => s + a * a / 2, 0)), ph = amp.map(() => rnd() * TAU);
  const hum = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = 1; k <= 7; k++) s += amp[k - 1] * Math.sin(TAU * base * k * i / sr + ph[k - 1]); hum[i] = s * vr * 0.1 / s2; }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + hum[i];
  const B = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {hum: 'auto'}})), h = r.info.hum;
  const pr = {f0: h.f0, n: h.n, depth: h.depth, q: h.q}, yv = K.done(K.run(v, sr, {steps: {hum: pr}})).y, yh = K.done(K.run(hum, sr, {steps: {hum: pr}})).y;
  let lin = 0; for (let i = 0; i < n; i++) lin = Math.max(lin, Math.abs(r.y[i] - yv[i] - yh[i]));
  const a2 = Math.round(0.5 * sr), red = []; for (let k = 1; k <= 7; k++) red.push(+(db(gz(hum, a2, n, base * k, sr)) - db(gz(yh, a2, n, base * k, sr))).toFixed(1));
  const dBand = db(band(r.y, sr, 200, 4000, a2)) - db(band(v, sr, 200, 4000, a2)), dV = db(band(yv, sr, 200, 4000, a2)) - db(band(v, sr, 200, 4000, a2));
  R['hum_' + tk + '_' + base] = {pruefen: {on: B.hum.on, base: B.hum.base, f0: B.hum.f0}, zeile: B.line, kerbenDb: red, bandDb: +dBand.toFixed(3), bandNurStimme: +dV.toFixed(3), linear: lin};
  ok(B.hum.on && B.hum.base === base && Math.abs(h.f0 - base) < 0.1, `Brumm ${base} Hz in Take ${tk[0]} (${tk.slice(1)} kHz) erkannt`, {f0: h.f0, n: h.n, zeile: B.line});
  ok(Math.min(...red) >= 25, `Brumm ${base} Hz Take ${tk[0]}@${tk.slice(1)}: alle 7 Kerben ≥ 25 dB weniger`, red);
  ok(Math.abs(dBand) <= 0.5, `Brumm ${base} Hz Take ${tk[0]}@${tk.slice(1)}: Gesangsband 200 Hz–4 kHz ≤ 0,5 dB`, {gegenSauber: +dBand.toFixed(3), nurStimme: +dV.toFixed(3)});
}
// Brumm 50 Hz mit Netz-Abweichung (49,6 Hz) – nur Info
{ const {x: v, sr} = LOAD.C48, n = v.length, vr = actRms(v), hum = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = 1; k <= 7; k++) s += Math.sin(TAU * 49.6 * k * i / sr + k); hum[i] = s * vr * 0.1 * Math.sqrt(2 / 7); }
  const x = v.map((q, i) => q + hum[i]), r = K.done(K.run(x, sr, {steps: {hum: 'auto'}})), pr = {f0: r.info.hum.f0, n: r.info.hum.n, depth: r.info.hum.depth, q: r.info.hum.q}, yh = K.done(K.run(hum, sr, {steps: {hum: pr}})).y, a2 = Math.round(0.5 * sr);
  R.hum_49_6 = {f0: r.info.hum.f0, kerbenDb: [1, 2, 3, 4, 5, 6, 7].map(k => +(db(gz(hum, a2, n, 49.6 * k, sr)) - db(gz(yh, a2, n, 49.6 * k, sr))).toFixed(1))}; console.log('INFO Brumm 49,6 Hz', JSON.stringify(R.hum_49_6)); }

console.log('ERGEBNIS', res.filter(r=>r.ok).length+'/'+res.length);
