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
const TR = {}; for (const k of ['B44', 'B48', 'C44', 'C48']) TR[k] = track(L[k].x, L[k].sr);
R.stimmhaft = Object.fromEntries(Object.entries(TR).map(([k, T]) => [k, +(T.filter(q => q.f0 > 0).length / T.length).toFixed(2)]));
console.log('INFO stimmhaft (eigener Verfolger)', JSON.stringify(R.stimmhaft));

const SUM = {ob: 0, abz: 0, vor: 0, n: 0, miss: 0, fp: 0, worst: []}; for (const SER of (process.env.SER || '0,55555').split(',').map(Number)) {
// ========== 1) Plopps (Druckstoß) in B und C, je 44,1 und 48 kHz ==========
const GL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
for (const tk of ['B44', 'B48', 'C44', 'C48']) {
  const {x: v, sr} = L[tk], n = v.length, T = TR[tk], P = new Float64Array(n), PL = [];
  seed = tk.charCodeAt(0) * 977 + sr + SER;
  const G = GL.slice().sort(() => rnd() - 0.5);
  // Stellen: zufällig unter den stimmhaften Abschnitten (ganzer Stoß ±25 ms stimmhaft), Abstand ≥ 0,45 s
  for (let tries = 0; PL.length < 10 && tries < 20000; tries++) { const d1 = 0.012 + rnd() * 0.018, Lp = 3.2 * d1, t = 0.35 + rnd() * (n / sr - 0.8);
    if (!voicedAll(T, t - 0.025, t + Lp + 0.025) || PL.some(q => Math.abs(q.t - t) < 0.45)) continue; PL.push({t, d1, Lp}); }
  PL.sort((p, q) => p.t - q.t);
  const lp150 = bq('lp', 150, 0.707, sr), lp300 = bq('lp', 300, 0.707, sr);
  PL.forEach((q, k) => { const i0 = Math.round(q.t * sr), M = Math.round(q.Lp * sr), m1 = Math.round(q.d1 * sr), sg = rnd() < 0.5 ? -1 : 1, nz = new Float64Array(M + 3000);
    for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1; filt(nz, lp150); filt(nz, lp150);
    let nzr = 0; for (let i = 3000; i < 3000 + M; i++) nzr = Math.max(nzr, Math.abs(nz[i]));
    const p = new Float64Array(M); for (let i = 0; i < M; i++) { const bump = i < m1 ? Math.pow(Math.sin(Math.PI * i / m1), 2) : 0, j = i - m1, reb = j >= 0 ? -0.35 * Math.pow(Math.sin(Math.PI * j / (M - m1)), 2) : 0, w = Math.min(1, (M - i) / (0.006 * sr));
      p[i] = sg * (bump + reb) + 0.3 * w * Math.min(1, i / (0.003 * sr)) * nz[3000 + i] / (nzr || 1); }
    filt(p, lp300);
    let ep = 0, ev = 0; for (let i = 0; i < M; i++) { ep += p[i] * p[i]; ev += v[i0 + i] * v[i0 + i]; }
    let g = Math.sqrt(ev / ep) * Math.pow(10, G[k] / 20), pk = 0; for (let i = 0; i < M; i++) pk = Math.max(pk, Math.abs(v[i0 + i] + g * p[i])); if (pk > 0.95) g *= 0.95 / pk;
    let e2 = 0; for (let i = 0; i < M; i++) { P[i0 + i] += g * p[i]; e2 += g * g * p[i] * p[i]; } q.G = +(db(e2) - db(ev)).toFixed(1); q.i0 = i0; q.M = M; });
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  const own = K.done(K.check(v, sr)).plops, Bx = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {plop: {}}})), EV = r.info.plop;
  const NEAR = (e, q) => e.t1 >= q.t - 0.01 && e.t0 <= q.t + q.Lp + 0.01;
  const hit = PL.map(q => EV.some(e => NEAR(e, q))), fp = EV.filter(e => !PL.some(q => NEAR(e, q)) && !own.some(o => o.t1 >= e.t0 - 0.01 && o.t0 <= e.t1 + 0.01));
  const err = new Float64Array(n); for (let i = 0; i < n; i++) err[i] = r.y[i] - v[i];
  const rows = PL.map(q => { const pad = Math.round(0.02 * sr), a = q.i0 - pad, N = q.M + 2 * pad;
    const abz = db(bandE(P, a, N, sr, 0, 250)) - db(bandE(err, a, N, sr, 0, 250));
    const W = Math.max(q.M, Math.round(0.046 * sr)), c = q.i0 + (q.M >> 1), b0 = c - (W >> 1), b1 = b0 + W;
    const f0 = f0Fine(v, b0, b1, f0Med(T, q.t, q.t + q.Lp), sr); let sy = 0, sv = 0, mx = 0; const pv = [], py = [];
    for (let h = 1; h * f0 < 4000; h++) { const a1 = gz(r.y, b0, b1, h * f0, sr), a2 = gz(v, b0, b1, h * f0, sr); sy += a1; sv += a2; py.push(a1); pv.push(a2); }
    for (let h = 0; h < pv.length; h++) if (pv[h] > 0.02 * sv) mx = Math.max(mx, Math.abs(db(py[h]) - db(pv[h])));
    // Vor-Echo vor dem Stoß: 5-ms-Rahmen 60…5 ms davor, Energie y gegen sauber (Tiefband < 250 Hz über Hann 10 ms; gesamt)
    let pre = -99, preT = -99; for (let s = q.i0 - Math.round(0.06 * sr); s < q.i0 - Math.round(0.005 * sr); s += Math.round(0.005 * sr)) { const N2 = Math.round(0.01 * sr); pre = Math.max(pre, db(bandE(r.y, s, N2, sr, 0, 250)) - db(bandE(v, s, N2, sr, 0, 250))); preT = Math.max(preT, rmsDb(r.y, s, s + N2) - rmsDb(v, s, s + N2)); }
    return {t: +q.t.toFixed(3), ms: Math.round(q.Lp * 1000), G: q.G, f0: Math.round(f0), abzug: +abz.toFixed(1), obertoene: +(db(sy) - db(sv)).toFixed(2), einzelMax: +mx.toFixed(2), vorTief: +pre.toFixed(1), vorGes: +preT.toFixed(1)}; });
  let same = true; for (let i = 0; i < n && same; i++) { const tt = i / sr; if (!EV.some(e => tt > e.t0 - 0.06 && tt < e.t1 + 0.06) && r.y[i] !== x[i]) same = false; }
  R['plop_' + tk] = {rows, gefunden: hit.filter(Boolean).length, verpasst: PL.filter((q, k) => !hit[k]).map(q => [+q.t.toFixed(3), q.G, Math.round(q.Lp * 1000)]), fehl: fp.map(e => [e.t0, e.t1, e.exDb]), eigeneSauber: own.length, pruefen: Bx.plops.length, zeile: Bx.line, bitgleichAussen: same};
  const nm = `Take ${tk[0]}@${tk.slice(1)}`;
  console.log('INFO Plopps ' + nm + ' ' + JSON.stringify(rows));
  ok(hit.filter(Boolean).length >= 9 && fp.length === 0, `Plopps ${nm}: ≥ 9/10 gefunden, 0 Fehlalarme`, {gefunden: hit.filter(Boolean).length, verpasst: R['plop_' + tk].verpasst, fehl: R['plop_' + tk].fehl, eigeneImSauberen: own.length});
  const hr = rows.filter((q, k) => hit[k]);
  ok(hr.every(q => q.abzug >= 12), `Plopps ${nm}: Abzug je gefundenem Plopp ≥ 12 dB (< 250 Hz)`, hr.map(q => q.abzug));
  ok(hr.every(q => Math.abs(q.obertoene) <= 1), `Plopps ${nm}: Obertöne (Summe bis 4 kHz) ≤ 1 dB`, hr.map(q => q.obertoene));
  ok(hr.every(q => q.vorTief <= 1 && q.vorGes <= 1), `Plopps ${nm}: kein Vor-Echo vor dem Stoß (5-ms-Rahmen 60…5 ms davor ≤ +1 dB)`, {tief: hr.map(q => q.vorTief), gesamt: hr.map(q => q.vorGes)});
  ok(same, `Plopps ${nm}: außerhalb der Funde ±60 ms bitgleich`);

  for (const q of hr) { SUM.n++; if (Math.abs(q.obertoene) > 1) { SUM.ob++; SUM.worst.push([tk, SER, q.t, q.obertoene, q.f0, q.ms, q.G]); } if (q.abzug < 12) SUM.abz++; if (q.vorTief > 1 || q.vorGes > 1) SUM.vor++; } SUM.miss += 10 - hit.filter(Boolean).length; SUM.fp += fp.length;
} }
console.log('SUMME', JSON.stringify(SUM));
