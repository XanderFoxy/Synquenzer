// Unabhängige Prüfung VOXR1B – Kern in Node, eigene eingesetzte Fehler in den Takes B und C (nicht Take A), zwei Abtastraten.
// Aufruf: node kern.mjs <index.html> <out.json>   – Ausgaben nennen nur Take B/C (A nur für saubere Gegenproben), keine Datensatz-Namen.
import fs from 'fs';
const file = process.argv[2] || "core.js";
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const K = new Function(fs.readFileSync(file, 'utf8') + '\nreturn vr1Make;')()();
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
const ONLY = (process.env.TK || 'B44,C48,B48,C44').split(','), LOAD = {}; for (const k of ONLY.concat(['A48', 'A44'])) LOAD[k] = k === 'A44' ? wav(RV + 'dl/vocadito_1.wav') : wav(TAKES[k]);
const TR = {}; for (const k of ONLY) TR[k] = track(LOAD[k].x, LOAD[k].sr);
for (let i = 0; i < 28; i++) rnd();
const NEAR = (e, t, d) => e.t1 >= t - 0.01 && e.t0 <= t + d + 0.01, SUM = {};
for (const tk of ['B44', 'C48', 'B48', 'C44']) {
  const {x: v, sr} = LOAD[tk] || LOAD.B44, n = v.length, T = TR[tk] || TR[ONLY[0]], P = new Float32Array(n), PT = [];
  const cand = T.filter(q => q.t > 0.4 && q.t < n / sr - 0.4 && voicedSpan(T, q.t - 0.06, q.t + 0.1)).map(q => q.t);
  for (let gap = (cand[cand.length - 1] - cand[0]) / 9.5; gap >= 0.25; gap *= 0.95) { PT.length = 0; let last = -9; for (const t of cand) if (t - last >= gap && PT.length < 10) { PT.push(+t.toFixed(3)); last = t; } if (PT.length >= 10) break; }
  const lpN = bq('lp', 90, 0.707, sr);
  for (const t of PT) { const i0 = Math.round(t * sr), M = Math.round(0.04 * sr), f = 25 + rnd() * 35, phs = rnd() * TAU, tau = 0.008 + rnd() * 0.012, G = 2 + rnd() * 6, nz = new Float64Array(M + 4000);
    for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1; filt(nz, lpN); filt(nz, lpN);
    const p = new Float64Array(M); let ep = 0, ev = 0; for (let i = 0; i < M; i++) { const tt = i / sr, w = Math.min(1, i / (0.002 * sr)) * Math.min(1, (M - i) / (0.004 * sr)); p[i] = w * (Math.sin(TAU * f * tt + phs) * Math.exp(-tt / tau) + 0.15 * nz[3000 + i] * 30); ep += p[i] * p[i]; ev += v[i0 + i] * v[i0 + i]; }
    let g = Math.sqrt(ev / ep) * Math.pow(10, G / 20), pk = 0; for (let i = 0; i < M; i++) pk = Math.max(pk, Math.abs(v[i0 + i] + g * p[i])); if (pk > 0.85) g *= 0.85 / pk; for (let i = 0; i < M; i++) P[i0 + i] += g * p[i]; }
  if (!ONLY.includes(tk)) continue;
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  const t0 = Date.now(), r = K.done(K.run(x, sr, {steps: {plop: {}}})), ms = Date.now() - t0, ev = r.info.plop;
  const hit = PT.map(t => ev.find(e => NEAR(e, t, 0.04))), fp = ev.filter(e => !PT.some(t => NEAR(e, t, 0.04)));
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
  const nr = red.filter(d => d >= 12).length, nh = hAll.filter(d => Math.abs(d) <= 1).length; SUM[tk] = {gef: hit.filter(Boolean).length, fp: fp.length, abz: nr, ob: nh, same};
  console.log(`${tk} gef ${hit.filter(Boolean).length}/10 fp ${fp.length} | Abzug>=12: ${nr}/10 [${red.join(' ')}] | Obert<=1: ${nh}/10 [${hAll.join(' ')}] low [${hLow.join(' ')}] max [${hMax.join(' ')}] f0 [${f0s.join(' ')}] bit ${same} ${ms}ms`);
}
// Vor-Echo im sauberen Take A (44,1/48 kHz): je Fund max. Änderung der Gesamtenergie (21/23-ms-Rahmen, Schritt 5 ms) und Tiefband < 250 Hz
for (const tk of ['A44', 'A48']) { const {x: v, sr} = LOAD[tk], r = K.done(K.run(v, sr, {steps: {plop: {}}})), N = 1024, out = [];
  for (const e of r.info.plop) { const a = Math.round((e.t0 - 0.03) * sr), b = Math.round((e.t1 + 0.03) * sr); let dmax = -99, dl = -99;
    for (let c = a; c < b; c += Math.round(0.005 * sr)) { let ey = 0, ex = 0; for (let i = c - N / 2; i < c + N / 2; i++) { ey += r.y[i] * r.y[i]; ex += v[i] * v[i]; } dmax = Math.max(dmax, db(ey) - db(ex)); dl = Math.max(dl, db(bandWin(r.y, c - N / 2, N, sr, 0, 250)) - db(bandWin(v, c - N / 2, N, sr, 0, 250))); }
    out.push([+e.t0.toFixed(2), e.redDb, +dmax.toFixed(1), +dl.toFixed(1)]); }
  const bad = out.filter(q => q[2] > 1 || q[3] > 1 || q[1] < 0); SUM[tk] = {n: out.length, echo: bad.length, max: Math.max(...out.map(q => q[2])), maxLow: Math.max(...out.map(q => q[3]))};
  console.log(`${tk} Funde ${out.length}, Vor-Echo (>+1 dB gesamt oder tief, oder redDb<0): ${bad.length} ` + JSON.stringify(bad) + ' max ' + SUM[tk].max + ' / tief ' + SUM[tk].maxLow); }
console.log('SUMME ' + JSON.stringify(SUM));
