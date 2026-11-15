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
const LOAD = {}; for (const k of ['C48', 'C44', 'B48']) LOAD[k] = wav(TAKES[k]);
// VOXR1D-Raumton-Nachbau: Abschnitt 6 von kern.mjs, je Lücke und Oktavband die Abweichung (nach Abzug des Mittels)
for (const tk of ['C48', 'C44', 'B48']) { const {x: v, sr} = LOAD[tk], n = v.length, H = Math.round(0.01 * sr), Lo = []; for (let p = 0; p + H <= n; p += H) Lo.push(rmsDb(v, p, p + H));
  const srt = Lo.filter(q => q > -110).sort((a, b) => a - b), flo = srt[Math.floor(0.1 * srt.length)], holes = []; let s = -1, j0 = Math.ceil(0.3 * sr / H), j1 = Lo.length - j0;
  for (let j = j0; j <= j1; j++) { const q = j < j1 && Lo[j] > -110 && Lo[j] < flo + 6; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 20 && holes.length < 5) { const c = Math.round((s + j) / 2 * H), d = Math.round(Math.min(0.35, 0.6 * (j - s) * H / sr, 0.12 + rnd() * 0.2) * sr); holes.push([c - (d >> 1), c + (d >> 1)]); } s = -1; } }
  const xh = Float32Array.from(v); for (const [a, b] of holes) xh.fill(0, a, b);
  const rr = K.done(K.run(xh, sr, {steps: {room: {}}})), RI = rr.info.room, bandsO = [250, 500, 1000, 2000, 4000, 8000];
  const lev = holes.map(([a, b]) => { const m = Math.round(0.012 * sr); return +(rmsDb(rr.y, a + m, b - m) - rmsDb(v, a + m, b - m)).toFixed(1); });
  const tim = holes.map(([a, b]) => { const N = Math.min(4096, b - a - Math.round(0.024 * sr)), a2 = a + Math.round(0.012 * sr); const d = bandsO.map(f => db(bandWin(rr.y, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2)) - db(bandWin(v, a2, N, sr, f / Math.SQRT2, f * Math.SQRT2))); const m = d.reduce((s, q) => s + q, 0) / d.length; return d.map(q => +(q - m).toFixed(1)); });
  let diffOut = 0; for (let i = 0; i < n; i++) if (!holes.some(([a, b]) => i >= a - 1 && i < b + 1) && rr.y[i] !== xh[i]) diffOut++;
  console.log(tk, 'Löcher', holes.map(([a, b]) => (a / sr).toFixed(2) + '+' + ((b - a) / sr).toFixed(2)).join(' '), 'Pegel', JSON.stringify(lev), 'Farbe', JSON.stringify(tim), 'max', tim.map(d => Math.max(...d.map(Math.abs)).toFixed(1)).join('/'), 'außen', diffOut, 'gelernt', RI.learned && RI.learned.db, JSON.stringify(RI.holes && RI.holes.map(h => h.src || '')));
}
