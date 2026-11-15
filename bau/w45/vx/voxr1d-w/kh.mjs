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

// ========== 3) Klicks: 20 eigene je Take (4 Formen, 10…22 dB Spitze über der örtlichen Höhen-Energie) ==========
for (const tk of ['B44', 'B48', 'C44', 'C48']) {
  const {x: v, sr} = L[tk], n = v.length, T = TR[tk], hs = hpf(v, 2000, sr), x = Float32Array.from(v), CL = [];
  seed = 1234 + tk.charCodeAt(0) * 31 + sr;
  const pos = []; for (let tries = 0; pos.length < 20 && tries < 20000; tries++) { const t = 0.3 + rnd() * (n / sr - 0.6); if (pos.some(q => Math.abs(q - t) < 0.2)) continue; pos.push(t); } pos.sort((p, q) => p - q);
  pos.forEach((t, k) => { const i0 = Math.round(t * sr), typ = k % 4, Wn = Math.round(0.02 * sr); let e = 0; for (let i = i0 - Wn; i < i0 + Wn; i++) e += hs[i] * hs[i]; const loc = Math.sqrt(e / (2 * Wn)), pk = Math.max(0.004, loc * Math.pow(10, (10 + rnd() * 12) / 20));
    let buf; if (typ === 0) { const m = 2 + Math.floor(rnd() * 5); buf = new Float64Array(m + 8); for (let i = 0; i < m; i++) buf[i] = (i % 2 ? -1 : 1) * (1 - i / (m + 1)); buf = hpf(buf, 1000, sr); }
    else if (typ === 1) { const f = 2000 + rnd() * 4000, d = Math.round((0.0004 + rnd() * 0.0006) * sr), gap = Math.round((0.001 + rnd() * 0.0015) * sr); buf = new Float64Array(gap + 2 * d); for (const o of [0, gap]) for (let i = 0; i < d; i++) buf[o + i] += (o ? 0.7 : 1) * Math.sin(TAU * f * i / sr) * Math.exp(-4 * i / d); }
    else if (typ === 2) { const f = 3000 + rnd() * 6000, d = Math.round((0.002 + rnd() * 0.002) * sr); buf = new Float64Array(d); for (let i = 0; i < d; i++) buf[i] = Math.sin(TAU * f * i / sr) * Math.exp(-5 * i / d) * Math.min(1, i / 2); }
    else { const d = Math.round((0.001 + rnd() * 0.002) * sr); buf = new Float64Array(d); for (let i = 0; i < d; i++) buf[i] = (rnd() * 2 - 1) * Math.exp(-4 * i / d); buf = hpf(buf, 1500, sr); }
    let mx = 0; for (const q of buf) mx = Math.max(mx, Math.abs(q)); const sg = rnd() < 0.5 ? -1 : 1; for (let i = 0; i < buf.length; i++) x[i0 + i] += sg * pk * buf[i] / mx;
    CL.push({t: +t.toFixed(4), typ, s0: i0, s1: i0 + buf.length, ueberDb: +(20 * Math.log10(pk / (loc + 1e-9))).toFixed(1), gesungen: T.some(q => Math.abs(q.t - t) < 0.005 && q.f0 > 0)}); });
  const ownL = K.done(K.run(v, sr, {steps: {click: {}}})).info.click.list, r = K.done(K.run(x, sr, {steps: {click: {}}})), CLs = r.info.click.list;
  const NEAR = (e, c) => e.t1 >= c.s0 / sr - 0.003 && e.t0 <= c.s1 / sr + 0.003;
  const hit = CL.map(c => CLs.some(e => NEAR(e, c))), fp = CLs.filter(e => !CL.some(c => NEAR(e, c)) && !ownL.some(q => q.t1 >= e.t0 - 0.003 && q.t0 <= e.t1 + 0.003));
  const ex = hpf(x.map((q, i) => q - v[i]), 2000, sr), ey = hpf(r.y.map((q, i) => q - v[i]), 2000, sr), abz = CL.map(c => { const a = c.s0 - Math.round(0.001 * sr), b = c.s1 + Math.round(0.002 * sr); return +(rmsDb(ex, a, b) - rmsDb(ey, a, b)).toFixed(1); });
  let same = true; for (let i = 0; i < n && same; i++) { const tt = i / sr; if (!CLs.some(e => tt > e.t0 - 0.02 && tt < e.t1 + 0.02) && r.y[i] !== x[i]) same = false; }
  const nm = `Take ${tk[0]}@${tk.slice(1)}`;
  R['click_' + tk] = {gefunden: hit.filter(Boolean).length, verpasst: CL.filter((c, k) => !hit[k]).map(c => ({t: c.t, form: c.typ, ueberDb: c.ueberDb, gesungen: c.gesungen})), fehl: fp.map(e => +e.t0.toFixed(4)), eigeneSauber: ownL.length, abzugDb: abz, bitgleichAussen: same, formen: [0, 1, 2, 3].map(f => CL.filter((c, k) => c.typ === f && hit[k]).length + '/' + CL.filter(c => c.typ === f).length)};
  ok(hit.filter(Boolean).length >= 18, `Klicks ${nm}: ≥ 18/20 gefunden`, {gefunden: hit.filter(Boolean).length, jeForm: R['click_' + tk].formen, verpasst: R['click_' + tk].verpasst});
  ok(fp.length <= 1, `Klicks ${nm}: ≤ 1 falscher Treffer`, {fehl: R['click_' + tk].fehl, eigeneImSauberen: ownL.length});
  ok(same, `Klicks ${nm}: außerhalb der Funde ±20 ms bitgleich`);
  console.log('INFO Klick-Abzug > 2 kHz ' + nm + ' ' + JSON.stringify(abz) + ' Mindestabstand über Höhen ' + JSON.stringify(CL.map(c => c.ueberDb)));
}

