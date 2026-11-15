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

// ========== 2) Plopps: 10 eigene 40-ms-Tiefstöße je Take (gedämpfter Tiefton 25–60 Hz + Tiefrauschen), +2…+8 dB über dem Gesang, mitten in gesungenen Tönen ==========
const NEAR = (e, t, d) => e.t1 >= t - 0.01 && e.t0 <= t + d + 0.01;
for (const tk of ['B44', 'C48']) {
  const {x: v, sr} = LOAD[tk], n = v.length, T = TR[tk], P = new Float32Array(n), PT = [];
  const cand = T.filter(q => q.t > 0.4 && q.t < n / sr - 0.4 && voicedSpan(T, q.t - 0.06, q.t + 0.1)).map(q => q.t);
  { let last = -9; const gap = Math.max(0.45, (cand[cand.length - 1] - cand[0]) / 10.5); for (const t of cand) if (t - last >= gap && PT.length < 10) { PT.push(+t.toFixed(3)); last = t; } }
  const lpN = bq('lp', 90, 0.707, sr);
  for (const t of PT) { const i0 = Math.round(t * sr), M = Math.round(0.04 * sr), f = 25 + rnd() * 35, phs = rnd() * TAU, tau = 0.008 + rnd() * 0.012, G = 2 + rnd() * 6, nz = new Float64Array(M + 4000);
    for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1; filt(nz, lpN); filt(nz, lpN);
    const p = new Float64Array(M); let ep = 0, ev = 0; for (let i = 0; i < M; i++) { const tt = i / sr, w = Math.min(1, i / (0.002 * sr)) * Math.min(1, (M - i) / (0.004 * sr)); p[i] = w * (Math.sin(TAU * f * tt + phs) * Math.exp(-tt / tau) + 0.15 * nz[3000 + i] * 30); ep += p[i] * p[i]; ev += v[i0 + i] * v[i0 + i]; }
    const g = Math.sqrt(ev / ep) * Math.pow(10, G / 20); for (let i = 0; i < M; i++) P[i0 + i] += g * p[i]; }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  const own = K.done(K.check(v, sr)).plops, Bx = K.done(K.check(x, sr));
  const r = K.done(K.run(x, sr, {steps: {plop: {}}})), ev = r.info.plop;
  const hit = PT.map(t => ev.find(e => NEAR(e, t, 0.04))), fp = ev.filter(e => !PT.some(t => NEAR(e, t, 0.04)) && !own.some(q => q.t1 >= e.t0 - 0.01 && q.t0 <= e.t1 + 0.01));
  const N = 1 << Math.round(Math.log2(0.09 * sr)), red = [], hAll = [], hLow = [], hMax = [];
  const err = new Float32Array(n); for (let i = 0; i < n; i++) err[i] = r.y[i] - v[i];
  for (const t of PT) { const c = Math.round((t + 0.02) * sr), a = c - N / 2; red.push(+(db(bandWin(P, a, N, sr, 0, 250)) - db(bandWin(err, a, N, sr, 0, 250))).toFixed(1));
    const f0 = (() => { const L = T.filter(q => q.t >= t - 0.005 && q.t <= t + 0.045).map(q => q.f0).filter(f => f > 0).sort((p, q) => p - q); return L[L.length >> 1]; })(), W = Math.round(0.046 * sr), b2 = c - (W >> 1);
    let sy = 0, sv = 0, ly = 0, lv = 0, mx = 0; const pv1 = gz(v, b2, b2 + W, f0, sr);
    for (let k = 1; k * f0 < 4000; k++) { const py = gz(r.y, b2, b2 + W, k * f0, sr), pv = gz(v, b2, b2 + W, k * f0, sr); sy += py; sv += pv; if (k * f0 < 250) { ly += py; lv += pv; } }
    for (let k = 1; k * f0 < 4000; k++) { const py = gz(r.y, b2, b2 + W, k * f0, sr), pv = gz(v, b2, b2 + W, k * f0, sr); if (pv > 0.05 * sv / k / 2 && pv > 1e-3 * pv1) mx = Math.max(mx, Math.abs(db(py) - db(pv))); }
    hAll.push(+(db(sy) - db(sv)).toFixed(2)); hLow.push(+(db(ly) - db(lv)).toFixed(2)); hMax.push(+mx.toFixed(2)); }
  let same = true; for (let i = 0; i < n && same; i++) { const tt = i / sr; if (!ev.some(e => tt > e.t0 - 0.06 && tt < e.t1 + 0.06) && r.y[i] !== x[i]) same = false; }
  const f0s = PT.map(t => Math.round(f0At(T, t + 0.02)));
  R['plop_' + tk] = {gesetzt: PT.length, stellen: PT, f0: f0s, gefunden: hit.filter(Boolean).length, fehl: fp.map(e => [+e.t0.toFixed(3), e.exDb]), eigeneImSauberen: own.length, pruefen: Bx.plops.length, zeile: Bx.line, reduktionDb: red, obertoeneSummeDb: hAll, obertoeneUnter250Db: hLow, obertoeneEinzelMaxDb: hMax, bitgleichAussen: same};
  ok(PT.length === 10, `Plopps Take ${tk[0]}@${tk.slice(1)}: 10 Stellen in gesungenen Tönen gesetzt`, {stellen: PT, f0: f0s});
  ok(hit.filter(Boolean).length >= 9 && fp.length === 0, `Plopps Take ${tk[0]}@${tk.slice(1)}: ≥ 9 von 10 gefunden, 0 Fehlalarme`, {gefunden: hit.filter(Boolean).length, fehl: fp.length, eigeneImSauberenTake: own.length});
  ok(red.every(d => d >= 12), `Plopps Take ${tk[0]}@${tk.slice(1)}: je ≥ 12 dB weniger (Band < 250 Hz, Fehler gegen sauber)`, red);
  ok(hAll.every(d => Math.abs(d) <= 1), `Plopps Take ${tk[0]}@${tk.slice(1)}: Obertöne der Stimme ≤ 1 dB (Summe bis 4 kHz)`, {summe: hAll, nurUnter250: hLow, einzelMax: hMax});
  ok(same, `Plopps Take ${tk[0]}@${tk.slice(1)}: außerhalb der Funde bitgleich`);
  ok(Math.abs(Bx.plops.length - 10 - own.length) <= 1, `Plopps Take ${tk[0]}@${tk.slice(1)}: Prüfen zählt sie`, {pruefen: Bx.plops.length, zeile: Bx.line});
}

// ========== 3) Klicks: 20 eigene Mundklicks (Resonanz-Impuls 1,5–8 kHz, Q 2–8, 0,5–3 ms) je Take, auch auf lauten Vokalen ==========
for (const tk of ['B44', 'C48']) {
  const {x: v, sr} = LOAD[tk], n = v.length, hs = hpf(v, 2000, sr), x = Float32Array.from(v), CL = [], T = TR[tk];
  for (let k = 0; k < 20; k++) { const t = 0.35 + k * (n / sr - 0.8) / 20 + rnd() * 0.12, i0 = Math.round(t * sr), d = 0.0005 + rnd() * 0.0025, M = Math.max(8, Math.round(d * sr)), f = 1500 + rnd() * 6500, Q = 2 + rnd() * 6;
    let e = 0; const Wn = Math.round(0.02 * sr); for (let i = i0 - Wn; i < i0 + Wn; i++) e += hs[i] * hs[i]; const loc = Math.sqrt(e / (2 * Wn)), amp = Math.max(0.006, loc * Math.pow(10, (8 + rnd() * 12) / 20)), sg = rnd() < 0.5 ? -1 : 1, tau = M / 4.6;
    const dec = Math.exp(-1 / (Q * sr / (Math.PI * f))); let mxv = 0; const buf = new Float64Array(M); for (let i = 0; i < M; i++) { buf[i] = Math.exp(-i / tau) * Math.sin(TAU * f * i / sr) * (i < 3 ? (i + 1) / 3 : 1); mxv = Math.max(mxv, Math.abs(buf[i])); } void dec;
    for (let i = 0; i < M; i++) x[i0 + i] += sg * amp * buf[i] / mxv;
    CL.push({t: +t.toFixed(4), d: +(d * 1000).toFixed(2), s0: i0, s1: i0 + M, gesungen: f0At(T, t) > 0}); }
  const ownR = K.done(K.run(v, sr, {steps: {click: {}}})).info.click.list, r = K.done(K.run(x, sr, {steps: {click: {}}})), L = r.info.click.list;
  const hit = CL.map(c => L.some(e => e.t1 >= c.s0 / sr - 0.003 && e.t0 <= c.s1 / sr + 0.003)), fp = L.filter(e => !CL.some(c => e.t1 >= c.s0 / sr - 0.003 && e.t0 <= c.s1 / sr + 0.003) && !ownR.some(q => q.t1 >= e.t0 - 0.003 && q.t0 <= e.t1 + 0.003));
  const ex = hpf(x.map((q, i) => q - v[i]), 2000, sr), ey = hpf(r.y.map((q, i) => q - v[i]), 2000, sr), rep = CL.map(c => { const a = c.s0 - Math.round(0.001 * sr), b = c.s1 + Math.round(0.002 * sr); return +(rmsDb(ex, a, b) - rmsDb(ey, a, b)).toFixed(1); });
  let same = true; for (let i = 0; i < n && same; i++) { const tt = i / sr; if (!L.some(e => tt > e.t0 - 0.02 && tt < e.t1 + 0.02) && r.y[i] !== x[i]) same = false; }
  const sung = CL.filter((c, k) => c.gesungen), sungHit = CL.filter((c, k) => c.gesungen && hit[k]).length;
  R['click_' + tk] = {gesetzt: 20, gefunden: hit.filter(Boolean).length, verpasst: CL.filter((c, k) => !hit[k]).map(c => ({t: c.t, ms: c.d, gesungen: c.gesungen})), fehl: fp.map(e => +e.t0.toFixed(3)), eigeneImSauberen: ownR.length, aufGesang: sung.length + '/' + sungHit, abzugDb: rep, bitgleichAussen: same, d1: r.info.click.pass1, d2: r.info.click.pass2};
  ok(hit.filter(Boolean).length >= 18, `Klicks Take ${tk[0]}@${tk.slice(1)}: ≥ 18 von 20 gefunden`, {gefunden: hit.filter(Boolean).length, aufGesangGefunden: sungHit + '/' + sung.length});
  ok(fp.length <= 1, `Klicks Take ${tk[0]}@${tk.slice(1)}: ≤ 1 falscher Treffer`, {fehl: fp.length, eigeneImSauberen: ownR.length});
  ok(same, `Klicks Take ${tk[0]}@${tk.slice(1)}: außerhalb der Funde bitgleich`);
  console.log('INFO Klick-Abzug (dB, Band > 2 kHz, Fehler gegen sauber) Take ' + tk, JSON.stringify(rep));
}

// ========== 4) Atmer: 10 eigene Atmer (Rauschen mit zwei Formanten, 0,2–0,55 s, −20…−30 dBFS) in Pausen von B und C (48 kHz, hintereinander) ==========
{ const B = LOAD.B48, C = LOAD.C48, sr = 48000, v = new Float32Array(B.x.length + C.x.length); v.set(B.x, 0); v.set(C.x, B.x.length); const n = v.length, T = track(v, sr);
  // Pausen: stimmlose Rahmen mit Pegel ≤ aktiv − 25 dB, ≥ 0,32 s
  const ar = 20 * Math.log10(actRms(v)), pz = []; { let s = -1; for (let k = 0; k <= T.length; k++) { const q = k < T.length && T[k].f0 === 0 && T[k].lev < ar - 25; if (q && s < 0) s = k; if (!q && s >= 0) { const a = T[s].t, b = T[k - 1].t; if (b - a >= 0.32) pz.push([a, b]); s = -1; } } }
  // längere Pausen dürfen zwei Atmer tragen
  const slots = []; for (const [a, b] of pz) { if (b - a >= 1.3) { slots.push([a, a + (b - a) / 2 - 0.05], [a + (b - a) / 2 + 0.05, b]); } else slots.push([a, b]); }
  const BR = [], x = Float32Array.from(v); const c1 = bq('bp', 1300, 2.5, sr), c2 = bq('bp', 2900, 3, sr), c3 = bq('hp', 400, 0.707, sr);
  for (const [a, b] of slots.slice(0, 10)) { const d = Math.min(0.55, b - a - 0.1, 0.2 + rnd() * 0.35); if (d < 0.18) continue; const t0 = a + (b - a - d) / 2, i0 = Math.round(t0 * sr), M = Math.round(d * sr);
    const nz = new Float64Array(M); for (let i = 0; i < M; i++) nz[i] = rnd() * 2 - 1; const y1 = filt(Float64Array.from(nz), c1), y2 = filt(Float64Array.from(nz), c2), y3 = filt(Float64Array.from(nz), c3);
    const z = new Float64Array(M); let e = 0; for (let i = 0; i < M; i++) { const u = i / M, w = u < 0.3 ? 0.5 - 0.5 * Math.cos(Math.PI * u / 0.3) : 0.5 + 0.5 * Math.cos(Math.PI * (u - 0.3) / 0.7); z[i] = w * (y1[i] + 0.7 * y2[i] + 0.25 * y3[i]); e += z[i] * z[i]; }
    const L = -20 - rnd() * 10, g = Math.pow(10, L / 20) / Math.sqrt(e / M); for (let i = 0; i < M; i++) x[i0 + i] += g * z[i]; BR.push({t0: +t0.toFixed(3), t1: +(t0 + d).toFixed(3), s0: i0, s1: i0 + M, dbfs: +rmsDb(x, i0, i0 + M).toFixed(1)}); }
  const Bc = K.done(K.check(x, sr)), Bv = K.done(K.check(v, sr)), r = K.done(K.run(x, sr, {steps: {breath: {}}})), info = r.info.breath || [];
  const lv = BR.map(b => ({vor: b.dbfs, nach: +rmsDb(r.y, b.s0, b.s1).toFixed(1)})), inT = lv.filter(q => Math.abs(q.nach + 40) <= 3).length;
  // stimmhafte Rahmen ±10 ms bitgleich (eigener Tracker am sauberen Take)
  let sung = 0, fr = 0; for (const q of T) { if (!(q.f0 > 0)) continue; fr++; const c = Math.round(q.t * sr), w = Math.round(0.01 * sr); for (let i = Math.max(0, c - w); i < Math.min(n, c + w); i++) if (r.y[i] !== x[i]) { sung++; break; } }
  const rc = K.done(K.run(v, sr, {steps: {breath: {}}})); let sungC = 0; for (const q of T) { if (!(q.f0 > 0)) continue; const c = Math.round(q.t * sr), w = Math.round(0.01 * sr); for (let i = Math.max(0, c - w); i < Math.min(n, c + w); i++) if (rc.y[i] !== v[i]) { sungC++; break; } }
  const fpB = (Bc.breathList || []).filter(e => !BR.some(b => e.t1 >= b.t0 - 0.05 && e.t0 <= b.t1 + 0.05));
  R.breath = {pausen: pz.length, gesetzt: BR.length, pegel: lv, imZiel: inT, pruefen: Bc.breaths, fehl: fpB.map(e => [+e.t0.toFixed(2), +e.t1.toFixed(2)]), sauberTakeAtmer: Bv.breaths, gesungeneRahmenGeaendert: sung, sauberGeaendert: sungC, rahmen: fr, zeile: Bc.line};
  ok(BR.length === 10, 'Atmer B+C@48: 10 Atmer in Pausen gesetzt', {pausen: pz.length, gesetzt: BR.length});
  ok(inT >= 9, 'Atmer B+C@48: ≥ 9 von 10 auf −40 dBFS ± 3 dB', lv.map(q => q.nach));
  ok(sung === 0 && sungC === 0, 'Atmer B+C@48: keine gesungene Silbe abgesenkt (stimmhafte Rahmen ±10 ms bitgleich, eigener Tracker)', {mitAtmern: sung, sauberTake: sungC, rahmen: fr});
  ok(fpB.length <= 1 && Math.abs(Bc.breaths - 10) <= 1, 'Atmer B+C@48: Prüfen findet sie, ≤ 1 falscher', {pruefen: Bc.breaths, fehl: fpB.length, sauberTakeAtmer: Bv.breaths});
  globalThis.__BC = {v, x, sr, BR};
}

// ========== 5) Zischen: 10 eigene „s“ (Rauschen > 4,5 kHz, 80–180 ms, laut) direkt an gesungenen Silben ==========
for (const tk of ['B44', 'C48']) {
  const {x: v, sr} = LOAD[tk], n = v.length, T = TR[tk], x = Float32Array.from(v), S = [], ar = actRms(v);
  // Stellen: Ende eines stimmhaften Abschnitts (≥ 150 ms stimmhaft davor) – das „s“ beginnt 10 ms vor dem Ende
  const ends = []; for (let k = 30; k < T.length - 40; k++) if (T[k].f0 > 0 && !(T[k + 1].f0 > 0) && T.slice(k - 30, k).every(q => q.f0 > 0)) ends.push(T[k].t);
  const hpA = bq('hp', 4500, 0.5411961, sr), hpB = bq('hp', 4500, 1.3065630, sr), pk = bq('bp', 7000, 1.5, sr);
  let last = -9; for (const t of ends) { if (S.length >= 10 || t - last < 0.35) continue; last = t; const d = 0.08 + rnd() * 0.1, i0 = Math.round((t - 0.01) * sr), M = Math.round(d * sr); if (i0 + M >= n) continue;
    const nz = new Float64Array(M + 2000); for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1; filt(nz, hpA); filt(nz, hpB); const p2 = filt(Float64Array.from(nz), pk); for (let i = 0; i < nz.length; i++) nz[i] += 1.5 * p2[i];
    let e = 0; for (let i = 0; i < M; i++) { const w = Math.min(1, i / (0.012 * sr), (M - i) / (0.02 * sr)); nz[2000 + i] *= w; e += nz[2000 + i] * nz[2000 + i]; }
    const g = ar * Math.pow(10, (-2 + rnd() * 4) / 20) / Math.sqrt(e / M); for (let i = 0; i < M; i++) x[i0 + i] += g * nz[2000 + i]; S.push({t: +t.toFixed(3), s0: i0, s1: i0 + M}); }
  const r = K.done(K.run(x, sr, {steps: {ess: {}}})), red = S.map(s => +(db(band(r.y, sr, 5000, sr / 2, s.s0, s.s1 + 4096) - 0 + 0) - db(band(x, sr, 5000, sr / 2, s.s0, s.s1 + 4096))).toFixed(2));
  // genauer: Rahmenweise über das „s“
  const red2 = S.map(s => { let ey = 0, ex = 0; const N = 1024; for (let p = s.s0; p + N <= s.s1; p += 256) { ey += bandWin(r.y, p, N, sr, 5000, sr / 2); ex += bandWin(x, p, N, sr, 5000, sr / 2); } return +(db(ey) - db(ex)).toFixed(2); });
  // Vokale: stimmhafte Rahmen mind. 40 ms von jedem „s“ entfernt, Gesamtenergie und Rahmen-Maximum
  const N = 1024; let vy = 0, vx = 0, mx = 0, nv = 0, big = 0; for (const q of T) { if (!(q.f0 > 0)) continue; const c = Math.round(q.t * sr); if (S.some(s => c > s.s0 - 0.04 * sr && c < s.s1 + 0.04 * sr)) continue; const a = c - N / 2; if (a < 0 || a + N > n) continue;
    let ey = 0, ex = 0; for (let i = a; i < a + N; i++) { ey += r.y[i] * r.y[i]; ex += x[i] * x[i]; } vy += ey; vx += ex; nv++; const d = Math.abs(db(ey) - db(ex)); mx = Math.max(mx, d); if (d > 0.5) big++; }
  const srt = red2.slice().sort((a, b) => a - b), mdn = srt[srt.length >> 1];
  R['ess_' + tk] = {gesetzt: S.length, reduktionDb: red2, median: mdn, vokaleDb: +(db(vy) - db(vx)).toFixed(3), vokalRahmen: nv, vokalRahmenUeber05: big, vokalRahmenMaxDb: +mx.toFixed(2), info: r.info.ess && {maxDb: r.info.ess.maxDb, hot: r.info.ess.hot}};
  ok(S.length === 10, `Zischen Take ${tk[0]}@${tk.slice(1)}: 10 „s“ gesetzt`, S.map(s => s.t));
  ok(mdn <= -5.5 && mdn >= -7 && red2.filter(d => d <= -5).length >= 9, `Zischen Take ${tk[0]}@${tk.slice(1)}: S-Energie > 5 kHz −6 dB (Median, ≥ 9 von 10 ≤ −5 dB)`, {median: mdn, je: red2});
  ok(Math.abs(db(vy) - db(vx)) <= 0.5 && big <= Math.ceil(0.02 * nv), `Zischen Take ${tk[0]}@${tk.slice(1)}: Vokale ≤ 0,5 dB (gesamt, ≤ 2 % der Rahmen darüber)`, {gesamtDb: +(db(vy) - db(vx)).toFixed(3), rahmenUeber05: big + '/' + nv, maxRahmenDb: +mx.toFixed(2)});
}

// ========== 6) Raumton in Lücken: 5 Schnitte (Stille) in Pausen von B+C@48 ==========
{ const {v, sr} = globalThis.__BC, n = v.length, H = Math.round(0.01 * sr), Lo = []; for (let p = 0; p + H <= n; p += H) Lo.push(rmsDb(v, p, p + H));
  const srt = Lo.filter(q => q > -110).sort((a, b) => a - b), flo = srt[Math.floor(0.1 * srt.length)], holes = []; let s = -1;
  for (let j = 0; j <= Lo.length; j++) { const q = j < Lo.length && Lo[j] > -110 && Lo[j] < flo + 6; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 22 && holes.length < 5) { const c = Math.round((s + j) / 2 * H), d = Math.round(Math.min(0.35, 0.5 * (j - s) * H / sr, 0.15 + rnd() * 0.2) * sr); holes.push([c - (d >> 1), c + (d >> 1)]); } s = -1; } }
  const xh = Float32Array.from(v); for (const [a, b] of holes) xh.fill(0, a, b);
  const rr = K.done(K.run(xh, sr, {steps: {room: {}}})), RI = rr.info.room, bandsO = [250, 500, 1000, 2000, 4000, 8000];
  const lev = holes.map(([a, b]) => { const m = Math.round(0.012 * sr); return [+rmsDb(xh, a, b).toFixed(1), +rmsDb(rr.y, a + m, b - m).toFixed(1), +rmsDb(v, a + m, b - m).toFixed(1)]; });
  const tim = holes.map(([a, b]) => { const N = Math.min(4096, b - a - Math.round(0.024 * sr)), a2 = a + Math.round(0.012 * sr); const d = bandsO.map(f => db(bandWin(rr.y, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2)) - db(bandWin(v, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2))); const m = d.reduce((s, q) => s + q, 0) / d.length; return +Math.max(...d.map(q => Math.abs(q - m))).toFixed(1); });
  let same = true; for (let i = 0; i < n && same; i++) if (!holes.some(([a, b]) => i >= a - 1 && i < b + 1) && rr.y[i] !== xh[i]) same = false;
  R.room = {loecher: holes.map(([a, b]) => [+(a / sr).toFixed(2), +((b - a) / sr).toFixed(2)]), pegel: lev, klangfarbeAbw: tim, gelernt: RI.learned, why: RI.why || null, bitgleichAussen: same};
  ok(holes.length === 5 && lev.every(q => Math.abs(q[1] - q[2]) <= 3), 'Raumton B+C@48: 5 Lücken gefüllt, Pegel wie der Raumton vor dem Schnitt ± 3 dB', {pegel: lev.map(q => +(q[1] - q[2]).toFixed(1))});
  ok(tim.every(q => q <= 4), 'Raumton B+C@48: Klangfarbe (Oktaven 250 Hz–8 kHz) ± 4 dB', tim);
  ok(same, 'Raumton B+C@48: außerhalb der Lücken bitgleich');
}

// ========== 7) Saubere Takes: Prüfen meldet keine Plopps/Brumm; Assistent „mittel“ ändert die Stimme nicht ==========
for (const tk of ['B44', 'C48', 'B48', 'C44', 'A48']) {
  const {x: v, sr} = LOAD[tk], n = v.length, B = K.done(K.check(v, sr)), A = K.assist(B, 'mittel'), r = K.done(K.run(v, sr, {steps: A.steps, weg: true}));
  const T = TR[tk] || track(v, sr), N = 1024; let mx = 0, big = 0, nv = 0; for (const q of T) { if (!(q.f0 > 0)) continue; const c = Math.round(q.t * sr), a = c - N / 2; if (a < 0 || a + N > n) continue; const ey = bandWin(r.y, a, N, sr, 200, 4000), ex = bandWin(v, a, N, sr, 200, 4000); const d = Math.abs(db(ey) - db(ex)); nv++; mx = Math.max(mx, d); if (d > 0.5) big++; }
  const rel = db(band(r.wg, sr, 300, 4000)) - db(band(v, sr, 300, 4000));
  R['sauber_' + tk] = {zeile: B.line, plops: B.plops.length, brumm: B.hum.on, schritte: Object.keys(A.steps), entferntGesangsbandDb: +rel.toFixed(1), stimmRahmenUeber05dB: big + '/' + nv, stimmRahmenMaxDb: +mx.toFixed(2)};
  ok(B.plops.length === 0 && !B.hum.on, `Sauberer Take ${tk[0]}@${tk.slice(1)}: 0 Plopps, kein Brumm`, {zeile: B.line});
  ok(rel <= -25 && big <= Math.ceil(0.01 * nv), `Sauberer Take ${tk[0]}@${tk.slice(1)} „mittel“: Stimme bleibt (Entferntes 300 Hz–4 kHz ≤ −25 dB, ≤ 1 % stimmhafte Rahmen > 0,5 dB)`, {schritte: Object.keys(A.steps), entfernt: +rel.toFixed(1), rahmen: big + '/' + nv, maxDb: +mx.toFixed(2)});
}

// ========== 8) 3-min-Take (48 kHz, mit Brumm, Plopps, Klicks): Prüfen + ganze Kette × 3 ≤ 20 s (Median aus 3) ==========
{ const {x: v, sr} = LOAD.C48, L = 180 * sr, x = new Float32Array(L), vr = actRms(v); for (let i = 0; i < L; i++) x[i] = v[i % v.length] + vr * 0.1 * Math.sqrt(2 / 7) * [1, 2, 3, 4, 5, 6, 7].reduce((s, k) => s + Math.sin(TAU * 50 * k * i / sr + k), 0);
  for (let t = 1; t < 179; t += 2.3) { const i0 = Math.round(t * sr); for (let i = 0; i < 0.04 * sr; i++) x[i0 + i] += 0.2 * Math.sin(TAU * 40 * i / sr) * Math.exp(-i / (0.012 * sr)); const j0 = Math.round((t + 0.7) * sr); for (let i = 0; i < 0.001 * sr; i++) x[j0 + i] += 0.1 * Math.exp(-i / 10) * Math.sin(TAU * 4000 * i / sr); }
  const ms = []; for (let k = 0; k < 3; k++) { const t0 = Date.now(); const B = K.done(K.check(x, sr)); const t1 = Date.now(); K.done(K.run(x, sr, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}, ess: {}}})); const t2 = Date.now(); ms.push([t1 - t0, t2 - t1]); if (k === 0) R.lang = {zeile: B.line}; }
  const tot = ms.map(q => q[0] + q[1]).sort((a, b) => a - b), md = tot[1];
  R.lang.ms = ms; R.lang.medianMs = md;
  ok(3 * md <= 20000, '3-min-Take 48 kHz (Node): Prüfen + Kette (7 Schritte) × 3 ≤ 20 s', {medianMs: md, x3: 3 * md, laeufe: ms});
}
const nOk = res.filter(q => q.ok).length; console.log(`ERGEBNIS ${nOk}/${res.length}`);
fs.writeFileSync(OUT, JSON.stringify({R, res}, null, 1));
